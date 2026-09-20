/**
 * IMP-092.4 — Consumo condicional LFC → MRE (ADR-022 / REQ-092 §11).
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, test } from "node:test";
import {
  ORIGEM_UTILIZADOR,
  criarLfcStore,
  criarLfcWriter,
  criarLfcReader
} from "../lastroFactualCaso/index.js";
import {
  PREFIXO_FACTO_LFC,
  obterConsumoLfcParaMre,
  aplicarConsumoLfcNaEntrada,
  enriquecerEntradaMreComLfc,
  extrairTituloCasoParaConsumoMre,
  pediuAmbitoCasoLfc
} from "./index.js";
import { montarEntradaMre } from "./integracaoNucleo.js";
import { PREFIXO_FACTO_UTILIZADOR } from "./factosTurnoUtilizador.js";

/** @type {string} */
let tmpRoot;
/** @type {ReturnType<typeof criarLfcStore>} */
let store;
/** @type {ReturnType<typeof criarLfcWriter>} */
let writer;
/** @type {ReturnType<typeof criarLfcReader>} */
let reader;

const COA = "coa-mre-lfc-test";
const T05 =
  "CEO, analisando apenas os fatos registrados sobre a ValeVerde Alimentos, qual é hoje a principal preocupação executiva da empresa e por quê?";

beforeEach(() => {
  tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "lfc-mre-0924-"));
  const dirLfc = path.join(tmpRoot, "executive", "lastro-factual-casos");
  store = criarLfcStore(dirLfc);
  writer = criarLfcWriter(store, { superficie: "teste-mre-lfc" });
  reader = criarLfcReader(store);
});

afterEach(() => {
  fs.rmSync(tmpRoot, { recursive: true, force: true });
});

test("extrairTitulo / âmbito: ValeVerde e T05", () => {
  assert.equal(extrairTituloCasoParaConsumoMre(T05), "ValeVerde");
  assert.equal(pediuAmbitoCasoLfc(T05), true);
  assert.equal(pediuAmbitoCasoLfc("O que fazer no sprint?"), false);
});

test("CM3: sem COA → não injecta", async () => {
  const r = await obterConsumoLfcParaMre({
    reader,
    coaId: null,
    instrucao: T05
  });
  assert.equal(r.autorizado, false);
  assert.equal(r.motivo, "sem_coa");
  assert.equal(r.factos.length, 0);
});

test("CM5: sem pedido de caso → não injecta (mesmo com ponteiro)", async () => {
  const cri = writer.criarCaso({
    coaId: COA,
    titulo: "ValeVerde",
    factosIniciais: ["120 funcionários"],
    origem: ORIGEM_UTILIZADOR
  });
  assert.equal(cri.ok, true);
  const r = await obterConsumoLfcParaMre({
    reader,
    coaId: COA,
    instrucao: "Qual o próximo passo do sprint?"
  });
  assert.equal(r.autorizado, false);
  assert.equal(r.motivo, "sem_pedido_caso");
});

test("CM2/CM7: COA + ValeVerde inequívoco → activos LFC", async () => {
  writer.criarCaso({
    coaId: COA,
    titulo: "ValeVerde",
    factosIniciais: [
      "120 funcionários",
      "margem líquida caiu de 8% para 4%",
      "custo das matérias-primas subiu 15%",
      "faturamento anual de R$ 52 milhões"
    ],
    origem: ORIGEM_UTILIZADOR
  });
  const r = await obterConsumoLfcParaMre({
    reader,
    coaId: COA,
    instrucao: T05
  });
  assert.equal(r.autorizado, true);
  assert.equal(r.motivo, "lfc_activos");
  assert.equal(r.factos.length, 4);
  assert.ok(r.factos.some((f) => /52\s*milh/i.test(f)));
});

test("CM6: ambiguidade → esclarecimento; nunca escolha silenciosa", async () => {
  writer.criarCaso({
    coaId: COA,
    titulo: "ValeVerde",
    factosIniciais: ["A"],
    origem: ORIGEM_UTILIZADOR
  });
  writer.criarCaso({
    coaId: COA,
    titulo: "ValeVerde",
    factosIniciais: ["B"],
    origem: ORIGEM_UTILIZADOR
  });
  const r = await obterConsumoLfcParaMre({
    reader,
    coaId: COA,
    instrucao: T05
  });
  assert.equal(r.autorizado, false);
  assert.equal(r.ambiguidade, true);
  assert.equal(r.motivo, "caso_ambiguo");
  assert.equal(r.factos.length, 0);
  assert.ok((r.candidatos || []).length >= 2);

  const entrada = {
    mensagem: "base",
    factosOficiais: [`${PREFIXO_FACTO_UTILIZADOR} eco antigo 48 milhões`],
    coaId: COA
  };
  aplicarConsumoLfcNaEntrada(entrada, r);
  assert.match(entrada.mensagem, /não escolho em silêncio|casoId/i);
  assert.equal(
    entrada.factosOficiais.some((f) => String(f).includes(PREFIXO_FACTO_LFC)),
    false
  );
});

test("CM7–CM8: LFC prevalece sobre reparse HFC em factosOficiais", async () => {
  writer.criarCaso({
    coaId: COA,
    titulo: "ValeVerde",
    factosIniciais: [
      "120 funcionários",
      "faturamento anual de R$ 52 milhões"
    ],
    origem: ORIGEM_UTILIZADOR
  });

  const entrada = montarEntradaMre({
    instrucao: T05,
    historico: [
      {
        papel: "usuario",
        texto:
          "CEO, registre estes fatos da ValeVerde: faturamento anual de R$ 48 milhões;"
      }
    ],
    coaAtivo: { id: COA, nome: "teste" },
    lastroConsciencia: null
  });
  assert.ok(
    entrada.factosOficiais.some((f) =>
      String(f).includes(PREFIXO_FACTO_UTILIZADOR)
    )
  );

  const out = await enriquecerEntradaMreComLfc(entrada, {
    reader,
    coaId: COA,
    instrucao: T05
  });
  assert.equal(out.lfcConsumo.autorizado, true);
  assert.ok(out.factosOficiais.some((f) => /52\s*milh/i.test(String(f))));
  assert.ok(
    out.factosOficiais.some((f) => String(f).startsWith(PREFIXO_FACTO_LFC))
  );
  // Reparse de utilizador removido da autoridade (não substitui LFC)
  assert.equal(
    out.factosOficiais.some((f) => String(f).includes(PREFIXO_FACTO_UTILIZADOR)),
    false
  );
  assert.equal(
    out.factosOficiais.some((f) => /48\s*milh/i.test(String(f))),
    false
  );
  assert.match(out.mensagem, /autoridade factual do caso/i);
});

test("CM13: obterConsumo não escreve no store", async () => {
  const cri = writer.criarCaso({
    coaId: COA,
    titulo: "ValeVerde",
    factosIniciais: ["x"],
    origem: ORIGEM_UTILIZADOR
  });
  const antes = store.get(COA, cri.casoId);
  const versaoAntes = antes.versao;
  await obterConsumoLfcParaMre({
    reader,
    coaId: COA,
    instrucao: T05
  });
  const depois = store.get(COA, cri.casoId);
  assert.equal(depois.versao, versaoAntes);
  assert.equal(depois.factos.length, antes.factos.length);
});

test("casoId explícito resolve sem título na instrução", async () => {
  const cri = writer.criarCaso({
    coaId: COA,
    titulo: "OutroNome",
    factosIniciais: ["facto Z"],
    origem: ORIGEM_UTILIZADOR
  });
  const r = await obterConsumoLfcParaMre({
    reader,
    coaId: COA,
    instrucao: "Analise o caso com base nos factos.",
    casoId: cri.casoId
  });
  assert.equal(r.autorizado, true);
  assert.deepEqual(r.factos, ["facto Z"]);
});
