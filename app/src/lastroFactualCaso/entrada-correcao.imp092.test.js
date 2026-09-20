/**
 * IMP-092.3 — correção factual natural (índice / conteúdo).
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, test } from "node:test";
import { detectarModoRespostaRestrita } from "../classificadorIntencao/pedidoRespostaRestrita.js";
import {
  criarLfcStore,
  criarLfcWriter,
  criarLfcReader,
  ESTADO_FACTO,
  processarTurnoLfc
} from "./index.js";
import {
  assertEscritaCanonicaLfc,
  assertLeituraCanonicaLfc
} from "./assertCanonicoLfc.js";
import {
  configurarAdaptadorTrilhaLocal,
  resetAdaptadorTrilhaParaTestes
} from "../trilhaAuditavel/emissor.js";
import { appendEvento, caminhoStoreAudit } from "../trilhaAuditavel/index.js";

const REGISTO_4 =
  "CEO, registre estes fatos da empresa fictícia ValeVerde Alimentos: 120 funcionários; faturamento anual de R$ 48 milhões; margem líquida caiu de 8% para 4%; custo das matérias-primas subiu 15%";

/** @type {string} */
let tmpRoot;
/** @type {ReturnType<typeof criarLfcStore>} */
let store;
/** @type {ReturnType<typeof criarLfcWriter>} */
let writer;
/** @type {ReturnType<typeof criarLfcReader>} */
let reader;

beforeEach(() => {
  tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "lfc-corr-"));
  store = criarLfcStore(path.join(tmpRoot, "executive", "lastro-factual-casos"));
  configurarAdaptadorTrilhaLocal((e) =>
    appendEvento(caminhoStoreAudit(tmpRoot), e)
  );
  writer = criarLfcWriter(store, { superficie: "teste-corr" });
  reader = criarLfcReader(store);
});

afterEach(() => {
  resetAdaptadorTrilhaParaTestes();
  fs.rmSync(tmpRoot, { recursive: true, force: true });
});

test('1: "corrija o segundo fato … R$ 52 milhões" → correção LFC', async () => {
  const reg = await processarTurnoLfc(REGISTO_4, {
    coaId: "coa-vv",
    writer,
    reader
  });
  assert.equal(reg.fonte, "lfc_writer");

  const t =
    "CEO, corrija o segundo fato da ValeVerde: o faturamento anual correto é R$ 52 milhões.";
  assert.equal(detectarModoRespostaRestrita(t).modo, "confirmacao");

  let writerChamado = false;
  const wSpy = {
    criarCaso: (c) => writer.criarCaso(c),
    corrigirFacto(cmd) {
      writerChamado = true;
      return writer.corrigirFacto(cmd);
    }
  };
  const out = await processarTurnoLfc(t, {
    coaId: "coa-vv",
    writer: wSpy,
    reader
  });
  assert.equal(writerChamado, true);
  assertEscritaCanonicaLfc(out, "T01 correção por índice");
  assert.match(out.mensagem, /52|confirmada/i);

  const list = await processarTurnoLfc(
    "Quais são os fatos registrados sobre a ValeVerde? Responda somente com os fatos.",
    { coaId: "coa-vv", writer, reader }
  );
  assertLeituraCanonicaLfc(list, "listagem pós-correção");
  assert.match(list.mensagem, /52/);
  assert.doesNotMatch(list.mensagem, /48 milhões/);
  const doc = store.get("coa-vv", reg.dados.casoId);
  const activos = doc.factos.filter((f) => f.estado === ESTADO_FACTO.ACTIVO);
  assert.equal(activos.length, 4);
  assert.ok(activos.some((f) => /52/.test(f.texto)));
  assert.ok(
    doc.factos.some(
      (f) => f.estado === ESTADO_FACTO.CORRIGIDO && /48/.test(f.texto)
    )
  );
});

test("2: correção por conteúdo explícito → Writer", async () => {
  await processarTurnoLfc(REGISTO_4, { coaId: "coa-vv", writer, reader });
  const t =
    "CEO, substitua faturamento anual de R$ 48 milhões por faturamento anual de R$ 52 milhões no caso ValeVerde.";
  assert.equal(detectarModoRespostaRestrita(t).modo, "confirmacao");
  const out = await processarTurnoLfc(t, { coaId: "coa-vv", writer, reader });
  assert.equal(out.fonte, "lfc_writer");
  assert.match(out.mensagem, /52/);
});

test("3: corrija sem identificação suficiente → esclarecimento, sem escrita", async () => {
  const reg = await processarTurnoLfc(REGISTO_4, {
    coaId: "coa-vv",
    writer,
    reader
  });
  const versao = store.get("coa-vv", reg.dados.casoId).versao;

  const t = "CEO, corrija o fato da ValeVerde.";
  assert.equal(detectarModoRespostaRestrita(t).modo, "confirmacao");
  const out = await processarTurnoLfc(t, { coaId: "coa-vv", writer, reader });
  assert.equal(out.fonte, "lfc_esclarecimento");
  assert.match(out.mensagem, /identifiquei|Indique|inalterado/i);
  assert.equal(store.get("coa-vv", reg.dados.casoId).versao, versao);
});

test('4: "corrija minha frase" / uso não-factual → não alterar LFC', async () => {
  const reg = await processarTurnoLfc(REGISTO_4, {
    coaId: "coa-vv",
    writer,
    reader
  });
  const versao = store.get("coa-vv", reg.dados.casoId).versao;

  const genericas = [
    "CEO, corrija minha frase: ficou estranha.",
    "Por favor corrija o português deste parágrafo.",
    "Corrija o código do bug na UI."
  ];
  for (const t of genericas) {
    assert.notEqual(
      detectarModoRespostaRestrita(t).modo,
      "confirmacao",
      t
    );
    const out = await processarTurnoLfc(t, { coaId: "coa-vv", writer, reader });
    assert.equal(out.activo, false, t);
  }
  assert.equal(store.get("coa-vv", reg.dados.casoId).versao, versao);
});

test("5: fluxo antigo de correção (setor + confirme) → continua PASS", async () => {
  const registo =
    "CEO, registre estes fatos da ValeVerde: Atua no mercado de serviços.; Possui clientes recorrentes.";
  await processarTurnoLfc(registo, { coaId: "coa-a", writer, reader });

  const corr =
    "CEO, corrija uma informação do caso ValeVerde. O setor correto é logística. Apenas registre a correção e confirme. Não faça análise nem recomendação.";
  assert.equal(detectarModoRespostaRestrita(corr).modo, "confirmacao");
  const out = await processarTurnoLfc(corr, { coaId: "coa-a", writer, reader });
  assertEscritaCanonicaLfc(out, "fluxo antigo correção");
  assert.match(out.mensagem, /logística/i);

  const list = await processarTurnoLfc(
    "Quais são os fatos registrados sobre a ValeVerde? Responda somente com os fatos.",
    { coaId: "coa-a", writer, reader }
  );
  assertLeituraCanonicaLfc(list, "listagem pós setor");
  assert.match(list.mensagem, /logística/i);
  assert.doesNotMatch(list.mensagem, /serviços/i);
});

test("6: contraditório sem correção explícita → LFC intacto", async () => {
  const base =
    "CEO, registre estes fatos da ValeVerde: Atua no mercado de serviços.; Possui clientes recorrentes.";
  const reg = await processarTurnoLfc(base, {
    coaId: "coa-vv",
    writer,
    reader
  });
  const casoId = reg.dados.casoId;
  const versao = store.get("coa-vv", casoId).versao;
  const r = writer.acrescentarFactos({
    coaId: "coa-vv",
    casoId,
    origem: "utilizador",
    factos: ["Atua no mercado de logística."],
    correçãoExplícita: false
  });
  assert.equal(r.ok, false);
  assert.equal(r.codigo, "esclarecimento_contradicao");
  assert.equal(store.get("coa-vv", casoId).versao, versao);
});
