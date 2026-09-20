/**
 * IMP-092.3 — anti falso PASS por reparse_fallback (só testes).
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, test } from "node:test";
import {
  criarLfcStore,
  criarLfcWriter,
  criarLfcReader,
  ESTADO_FACTO,
  processarTurnoLfc
} from "./index.js";
import {
  assertEscritaCanonicaLfc,
  assertLeituraCanonicaLfc,
  ehReparseFallback
} from "./assertCanonicoLfc.js";
import {
  configurarAdaptadorTrilhaLocal,
  resetAdaptadorTrilhaParaTestes
} from "../trilhaAuditavel/emissor.js";
import { appendEvento, caminhoStoreAudit } from "../trilhaAuditavel/index.js";

const REGISTO =
  "CEO, registre estes fatos da empresa fictícia ValeVerde Alimentos: 120 funcionários; faturamento anual de R$ 48 milhões; margem líquida caiu de 8% para 4%; custo das matérias-primas subiu 15%";

const LISTAR =
  "CEO, liste os fatos que registrei sobre a ValeVerde Alimentos. Responda somente com os fatos.";

const CORRIGIR =
  "CEO, corrija o segundo fato da ValeVerde: o faturamento anual correto é R$ 52 milhões.";

/** @type {string} */
let tmpRoot;
/** @type {ReturnType<typeof criarLfcStore>} */
let store;
/** @type {ReturnType<typeof criarLfcWriter>} */
let writer;
/** @type {ReturnType<typeof criarLfcReader>} */
let reader;

beforeEach(() => {
  tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "lfc-anti-reparse-"));
  store = criarLfcStore(path.join(tmpRoot, "executive", "lastro-factual-casos"));
  configurarAdaptadorTrilhaLocal((e) =>
    appendEvento(caminhoStoreAudit(tmpRoot), e)
  );
  writer = criarLfcWriter(store, { superficie: "teste-anti-reparse" });
  reader = criarLfcReader(store);
});

afterEach(() => {
  resetAdaptadorTrilhaParaTestes();
  fs.rmSync(tmpRoot, { recursive: true, force: true });
});

test("T01/T02 mesmo COA com LFC → PASS só com fonte lfc_reader", async () => {
  const reg = await processarTurnoLfc(REGISTO, {
    coaId: "coa-canonico",
    writer,
    reader
  });
  assertEscritaCanonicaLfc(reg, "T01 registo");

  const list = await processarTurnoLfc(LISTAR, {
    coaId: "coa-canonico",
    writer,
    reader
  });
  assertLeituraCanonicaLfc(list, "T02 listagem");
  assert.match(list.mensagem, /120 funcionários/);
  assert.match(list.mensagem, /48 milhões/);
  assert.equal(list.dados?.lfc?.factos?.length, 4);
});

test("T02 em COA diferente sem LFC → reparse_fallback é FAIL/NA (não PASS canónico)", async () => {
  await processarTurnoLfc(REGISTO, {
    coaId: "coa-origem",
    writer,
    reader
  });

  // Histórico com o registo: o fallback de produção pode ecoar factos sem LFC neste COA
  const listOutroCoa = await processarTurnoLfc(LISTAR, {
    coaId: "coa-outro",
    writer,
    reader,
    historico: [{ papel: "usuario", texto: REGISTO }],
    permitirFallbackReparse: true
  });

  assert.equal(
    ehReparseFallback(listOutroCoa),
    true,
    "cenário de armadilha: sem LFC no COA, produção pode devolver reparse_fallback"
  );
  assert.notEqual(listOutroCoa.fonte, "lfc_reader");

  assert.throws(
    () => assertLeituraCanonicaLfc(listOutroCoa, "T02 COA sem LFC"),
    /reparse_fallback|FAIL\/NA|lfc_reader/
  );

  // Store do COA origem intacto; COA outro continua sem casos
  assert.equal(store.listByCoa("coa-outro").length, 0);
  assert.ok(store.listByCoa("coa-origem").length >= 1);
});

test("correção em COA diferente → falha sem alterar LFC original", async () => {
  const reg = await processarTurnoLfc(REGISTO, {
    coaId: "coa-origem",
    writer,
    reader
  });
  assertEscritaCanonicaLfc(reg, "registo origem");
  const casoId = reg.dados.casoId;
  const docAntes = store.get("coa-origem", casoId);
  const versaoAntes = docAntes.versao;
  const activosAntes = docAntes.factos
    .filter((f) => f.estado === ESTADO_FACTO.ACTIVO)
    .map((f) => f.texto);

  const corr = await processarTurnoLfc(CORRIGIR, {
    coaId: "coa-outro",
    writer,
    reader
  });
  assert.equal(corr.activo, true);
  assert.notEqual(corr.fonte, "lfc_writer");
  assert.match(corr.mensagem, /Não há caso LFC resolvido|inalterado/i);

  const docDepois = store.get("coa-origem", casoId);
  assert.equal(docDepois.versao, versaoAntes);
  const activosDepois = docDepois.factos
    .filter((f) => f.estado === ESTADO_FACTO.ACTIVO)
    .map((f) => f.texto);
  assert.deepEqual(activosDepois, activosAntes);
  assert.equal(store.listByCoa("coa-outro").length, 0);
});
