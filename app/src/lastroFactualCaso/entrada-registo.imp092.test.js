/**
 * IMP-092.3 — entrada conversacional: registo explícito em linguagem natural.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, test } from "node:test";
import { detectarModoRespostaRestrita } from "../classificadorIntencao/pedidoRespostaRestrita.js";
import { extrairBulletsFactuais } from "../classificadorIntencao/comporRespostaRestrita.js";
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

/** @type {string} */
let tmpRoot;
/** @type {ReturnType<typeof criarLfcStore>} */
let store;
/** @type {ReturnType<typeof criarLfcWriter>} */
let writer;
/** @type {ReturnType<typeof criarLfcReader>} */
let reader;

beforeEach(() => {
  tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "lfc-entrada-"));
  store = criarLfcStore(path.join(tmpRoot, "executive", "lastro-factual-casos"));
  configurarAdaptadorTrilhaLocal((e) =>
    appendEvento(caminhoStoreAudit(tmpRoot), e)
  );
  writer = criarLfcWriter(store, { superficie: "teste-entrada" });
  reader = criarLfcReader(store);
});

afterEach(() => {
  resetAdaptadorTrilhaParaTestes();
  fs.rmSync(tmpRoot, { recursive: true, force: true });
});

test('1: "registre estes fatos: fato1; fato2; fato3" → modo registo + 3 fatos', async () => {
  const t = "registre estes fatos: fato1; fato2; fato3";
  assert.equal(detectarModoRespostaRestrita(t).modo, "registo");
  const factos = extrairBulletsFactuais(t);
  assert.deepEqual(factos, ["fato1", "fato2", "fato3"]);

  const out = await processarTurnoLfc(t, { coaId: "coa-a", writer, reader });
  assertEscritaCanonicaLfc(out, "registo ;");
  assert.match(out.mensagem, /3 facto\(s\).*guardado/i);
  assert.equal(out.dados?.lfc?.nFactos, 3);
});

test('2: "registre estes fatos da ValeVerde: …" → Writer recebe fatos', async () => {
  const t =
    "CEO, registre estes fatos da empresa fictícia ValeVerde Alimentos: 120 funcionários; faturamento anual de R$ 48 milhões; margem líquida caiu de 8% para 4%; custo das matérias-primas subiu 15%";
  assert.equal(detectarModoRespostaRestrita(t).modo, "registo");
  const factos = extrairBulletsFactuais(t);
  assert.equal(factos.length, 4);
  assert.match(factos[0], /120 funcionários/i);
  assert.match(factos[3], /15%/);

  let recebido = null;
  const wSpy = {
    criarCaso(cmd) {
      recebido = cmd;
      return writer.criarCaso(cmd);
    },
    corrigirFacto(cmd) {
      return writer.corrigirFacto(cmd);
    }
  };
  const out = await processarTurnoLfc(t, {
    coaId: "coa-vv",
    writer: wSpy,
    reader
  });
  assert.equal(out.fonte, "lfc_writer");
  assert.ok(recebido);
  assert.equal(recebido.factosIniciais.length, 4);
  assert.match(String(recebido.titulo), /ValeVerde/i);
  const doc = store.get("coa-vv", out.dados.casoId);
  assert.equal(
    doc.factos.filter((f) => f.estado === ESTADO_FACTO.ACTIVO).length,
    4
  );
});

test('3: "registre …" sem escopo factual suficiente → não persistir', async () => {
  const t = "CEO, registre o andamento quando possível.";
  assert.equal(detectarModoRespostaRestrita(t).activo, false);

  const out = await processarTurnoLfc(t, { coaId: "coa-a", writer, reader });
  assert.equal(out.activo, false);
  assert.equal(store.listByCoa("coa-a").length, 0);
});

test('3b: modo registo sem lista extraível → sem Writer / sem «guardado»', async () => {
  // Detecção pode activar (estes fatos + empresa) mas sem «:» lista → 0 unidades
  const t = "registre estes fatos da empresa ValeVerde sem listar nada";
  assert.equal(detectarModoRespostaRestrita(t).modo, "registo");
  assert.equal(extrairBulletsFactuais(t).length, 0);

  const out = await processarTurnoLfc(t, { coaId: "coa-a", writer, reader });
  assert.equal(out.fonte, "lfc_sem_factos");
  assert.equal(out.dados?.lfc?.autorizaProsaGuardado, false);
  assert.doesNotMatch(out.mensagem, /guardado\(s\)/i);
  assert.equal(store.listByCoa("coa-a").length, 0);
});

test('4: frases genéricas com "registrar" → não ativar LFC', async () => {
  const genericas = [
    "Preciso registrar isso depois no caderno.",
    "Vamos registrar a decisão na MO amanhã.",
    "O sistema deve registrar logs técnicos.",
    "Quero registrar presença na reunião."
  ];
  for (const t of genericas) {
    assert.equal(
      detectarModoRespostaRestrita(t).activo,
      false,
      `não deveria activar: ${t}`
    );
    const out = await processarTurnoLfc(t, { coaId: "coa-a", writer, reader });
    assert.equal(out.activo, false, t);
  }
  assert.equal(store.listByCoa("coa-a").length, 0);
});

test('5: formato antigo "Fatos iniciais:" + bullets → continua', async () => {
  const t = `CEO, vamos iniciar um caso chamado ValeVerde.

Fatos iniciais:
- Atua no mercado de serviços.
- Possui clientes recorrentes.
- Perdeu dois clientes importantes.
- Ainda não sabemos por que saíram.

Por enquanto, apenas registre este contexto como ponto de partida do caso ValeVerde.
Não faça nenhuma análise.
Aguarde meu próximo comando.`;
  assert.equal(detectarModoRespostaRestrita(t).modo, "registo");
  const factos = extrairBulletsFactuais(t);
  assert.equal(factos.length, 4);
  const out = await processarTurnoLfc(t, { coaId: "coa-a", writer, reader });
  assert.equal(out.fonte, "lfc_writer");
  assert.match(out.mensagem, /4 facto\(s\).*guardado/i);
});

test("6: correção explícita existente → continua funcionando", async () => {
  const registo = `CEO, registre estes fatos da ValeVerde: Atua no mercado de serviços.; Possui clientes recorrentes.`;
  await processarTurnoLfc(registo, { coaId: "coa-a", writer, reader });

  const corr =
    "CEO, corrija uma informação do caso ValeVerde. O setor correto é logística. Apenas registre a correção e confirme. Não faça análise nem recomendação.";
  assert.equal(detectarModoRespostaRestrita(corr).modo, "confirmacao");
  const out = await processarTurnoLfc(corr, { coaId: "coa-a", writer, reader });
  assertEscritaCanonicaLfc(out, "correção legado registo");
  assert.match(out.mensagem, /logística/i);

  const list = await processarTurnoLfc(
    "Quais são os fatos registrados sobre a ValeVerde? Responda somente com os fatos.",
    { coaId: "coa-a", writer, reader }
  );
  assertLeituraCanonicaLfc(list, "listagem pós correção legado");
  assert.match(list.mensagem, /logística/i);
  assert.doesNotMatch(list.mensagem, /mercado de serviços/i);
});
