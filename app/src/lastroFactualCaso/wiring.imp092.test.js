/**
 * IMP-092.3 — Wiring conversacional LFC (T01–T11).
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
  criarLfcReader,
  ESTADO_FACTO,
  processarTurnoLfc,
  tentarMutacaoContraditoriaSemCorrecao
} from "./index.js";
import {
  configurarAdaptadorTrilhaLocal,
  resetAdaptadorTrilhaParaTestes
} from "../trilhaAuditavel/emissor.js";
import { appendEvento, caminhoStoreAudit } from "../trilhaAuditavel/index.js";
import {
  caminhoStoreHfc,
  carregarMensagens,
  registarMensagemFisica
} from "../historicoFisicoConversas/index.js";
import { fileURLToPath } from "node:url";
import { assertLeituraCanonicaLfc } from "./assertCanonicoLfc.js";

const REGISTO_4 = `CEO, vamos iniciar um caso de trabalho chamado ValeVerde.

A ValeVerde é uma empresa fictícia.

Fatos iniciais:
- Atua no mercado de serviços.
- Possui clientes recorrentes.
- Perdeu dois clientes importantes.
- Ainda não sabemos por que saíram.

Por enquanto, apenas registre este contexto como ponto de partida do caso ValeVerde.
Não faça nenhuma análise.
Não proponha soluções.
Aguarde meu próximo comando.`;

const LISTAR = `CEO, sem analisar:

Quais são os fatos que foram registrados sobre a ValeVerde até agora?

Responda somente com os fatos informados. Não acrescente interpretações, hipóteses ou recomendações.`;

const CORRIGIR = `CEO, corrija uma informação do caso ValeVerde.

A informação anterior dizia que a ValeVerde atua no mercado de serviços.

A informação correta é:
A ValeVerde atua no mercado de logística.

Apenas registre a correção e confirme.
Não faça análise nem recomendação.`;

const DADO_SETOR =
  "Qual é o setor correto da ValeVerde? Responder apenas com o fato.";

const MUDANCA_ASSUNTO =
  "Ignore a ValeVerde por um momento. Qual a diferença entre decisão e recomendação?";

/** @type {string} */
let tmpRoot;
/** @type {ReturnType<typeof criarLfcStore>} */
let store;
/** @type {ReturnType<typeof criarLfcWriter>} */
let writer;
/** @type {ReturnType<typeof criarLfcReader>} */
let reader;

beforeEach(() => {
  tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "lfc-0923-"));
  const dirLfc = path.join(tmpRoot, "executive", "lastro-factual-casos");
  const dirAudit = caminhoStoreAudit(tmpRoot);
  store = criarLfcStore(dirLfc);
  configurarAdaptadorTrilhaLocal((evento) => appendEvento(dirAudit, evento));
  writer = criarLfcWriter(store, { superficie: "teste-wiring" });
  reader = criarLfcReader(store);
});

afterEach(() => {
  resetAdaptadorTrilhaParaTestes();
  fs.rmSync(tmpRoot, { recursive: true, force: true });
});

/**
 * @param {string} [coaId]
 * @param {string} [instrucao]
 * @param {object} [extra]
 */
function turno(coaId, instrucao, extra = {}) {
  return processarTurnoLfc(instrucao, {
    coaId: coaId ?? null,
    writer,
    reader,
    historico: extra.historico || [],
    permitirFallbackReparse: extra.permitirFallbackReparse !== false
  });
}

test("T01: registrar 4 fatos → Writer persiste + prosa guardado", async () => {
  const out = await turno("coa-vv", REGISTO_4);
  assert.equal(out.activo, true);
  assert.equal(out.modo, "registo");
  assert.equal(out.fonte, "lfc_writer");
  assert.match(out.mensagem, /4 facto\(s\).*guardado/i);
  assert.equal(out.dados?.lfc?.ok, true);
  assert.equal(out.dados?.lfc?.autorizaProsaGuardado, true);

  const casoId = out.dados.casoId;
  const doc = store.get("coa-vv", casoId);
  assert.ok(doc);
  assert.equal(
    doc.factos.filter((f) => f.estado === ESTADO_FACTO.ACTIVO).length,
    4
  );
});

test("T02: novo turno → listar os 4 fatos pelo Reader", async () => {
  await turno("coa-vv", REGISTO_4);
  const writer2 = criarLfcWriter(store, { superficie: "turno-2" });
  const reader2 = criarLfcReader(store);
  const out = await processarTurnoLfc(LISTAR, {
    coaId: "coa-vv",
    writer: writer2,
    reader: reader2
  });
  assertLeituraCanonicaLfc(out, "T02 listar");
  assert.match(out.mensagem, /serviços/i);
  assert.match(out.mensagem, /clientes recorrentes/i);
  assert.match(out.mensagem, /dois clientes/i);
  assert.match(out.mensagem, /por que saíram/i);
  assert.equal(out.dados?.lfc?.factos?.length, 4);
});

test("T03: corrigir 1 fato → Reader retorna somente a versão activa", async () => {
  await turno("coa-vv", REGISTO_4);
  const corr = await turno("coa-vv", CORRIGIR);
  assert.equal(corr.fonte, "lfc_writer");
  assert.match(corr.mensagem, /logística/i);

  const list = await turno("coa-vv", LISTAR);
  assertLeituraCanonicaLfc(list, "T03 listar após correção");
  assert.match(list.mensagem, /logística/i);
  assert.doesNotMatch(list.mensagem, /mercado de serviços/i);
  assert.equal(list.dados?.lfc?.factos?.length, 4);
  const activos = list.dados.lfc.factos.map((f) => f.texto).join("\n");
  assert.match(activos, /logística/i);
  assert.doesNotMatch(activos, /serviços/i);
});

test("T04: consultar fato único → Reader retorna o fato correto", async () => {
  await turno("coa-vv", REGISTO_4);
  await turno("coa-vv", CORRIGIR);
  const out = await turno("coa-vv", DADO_SETOR);
  assert.equal(out.modo, "dado_unico");
  assertLeituraCanonicaLfc(out, "T04 dado único");
  assert.match(out.mensagem, /Logística/i);
  assert.doesNotMatch(out.mensagem, /Serviços/i);
});

test("T05: contraditório sem correção explícita → não altera LFC", async () => {
  const reg = await turno("coa-vv", REGISTO_4);
  const casoId = reg.dados.casoId;
  const antes = store.get("coa-vv", casoId);
  const versaoAntes = antes.versao;
  const nActivosAntes = antes.factos.filter(
    (f) => f.estado === ESTADO_FACTO.ACTIVO
  ).length;

  const mut = await tentarMutacaoContraditoriaSemCorrecao(
    "Atua no mercado de logística.",
    { coaId: "coa-vv", writer, reader }
  );
  assert.equal(mut.alterou, false);
  assert.equal(mut.resultado?.codigo, "esclarecimento_contradicao");

  const depois = store.get("coa-vv", casoId);
  assert.equal(depois.versao, versaoAntes);
  assert.equal(
    depois.factos.filter((f) => f.estado === ESTADO_FACTO.ACTIVO).length,
    nActivosAntes
  );
});

test("T06: múltiplos casos → isolamento correto", async () => {
  const a = await turno("coa-a", REGISTO_4);
  const regB = REGISTO_4.replace(/ValeVerde/g, "RioAzul").replace(
    /serviços/,
    "indústria"
  );
  const b = await turno("coa-b", regB);
  assert.notEqual(a.dados.casoId, b.dados.casoId);

  const listA = await turno("coa-a", LISTAR);
  const listB = await processarTurnoLfc(
    LISTAR.replace(/ValeVerde/g, "RioAzul"),
    { coaId: "coa-b", writer, reader }
  );
  assert.match(listA.mensagem, /serviços/i);
  assert.doesNotMatch(listA.mensagem, /indústria/i);
  assert.match(listB.mensagem, /indústria/i);
  assert.doesNotMatch(listB.mensagem, /serviços/i);
});

test("T07: mudança de assunto → não apaga fatos", async () => {
  const reg = await turno("coa-vv", REGISTO_4);
  const casoId = reg.dados.casoId;
  const out = await turno("coa-vv", MUDANCA_ASSUNTO);
  assert.equal(out.activo, false);

  const doc = store.get("coa-vv", casoId);
  assert.equal(
    doc.factos.filter((f) => f.estado === ESTADO_FACTO.ACTIVO).length,
    4
  );
  assert.equal(store.obterPonteiroActivo("coa-vv"), casoId);

  const list = await turno("coa-vv", LISTAR);
  assert.equal(list.dados?.lfc?.factos?.length, 4);
});

test("T08: retomada do caso → Reader recupera fatos corretos", async () => {
  await turno("coa-vv", REGISTO_4);
  const readerNovo = criarLfcReader(store);
  const writerNovo = criarLfcWriter(store, { superficie: "retoma" });
  const out = await processarTurnoLfc(LISTAR, {
    coaId: "coa-vv",
    writer: writerNovo,
    reader: readerNovo
  });
  assertLeituraCanonicaLfc(out, "T08 retoma");
  assert.equal(out.dados?.lfc?.factos?.length, 4);
});

test("T09: sem COA → não há leitura/escrita persistente", async () => {
  const reg = await turno(null, REGISTO_4);
  assert.equal(reg.fonte, "lfc_sem_coa");
  assert.doesNotMatch(reg.mensagem, /guardado/i);
  assert.equal(reg.dados?.lfc?.autorizaProsaGuardado, false);
  assert.equal(store.listByCoa("").length, 0);

  const list = await turno(null, LISTAR);
  assert.equal(list.fonte, "lfc_sem_coa");
  assert.match(list.mensagem, /Sem COA/i);
});

test("T10: HFC continua registrando a conversa (ortogonal ao LFC)", async () => {
  await turno("coa-vv", REGISTO_4);
  const dirHfc = caminhoStoreHfc(tmpRoot);
  const r = registarMensagemFisica(dirHfc, {
    coaId: "coa-vv",
    mensagem: {
      id: "msg-hfc-prova",
      papel: "usuario",
      texto: "mensagem de prova HFC após LFC",
      estado: "pronta",
      criadoEm: new Date().toISOString()
    }
  });
  assert.equal(r.ok, true);
  const msgs = carregarMensagens(dirHfc);
  assert.ok(
    msgs.some((m) =>
      /prova HFC/.test(String(m.texto || m.payload?.texto || m.mensagem?.texto || ""))
    )
  );

  const lfcDir = path.join(tmpRoot, "executive", "lastro-factual-casos");
  assert.ok(fs.existsSync(lfcDir));
  assert.notEqual(lfcDir, dirHfc);
});

test("T11: MO/CSC não recebem fatos de caso", async () => {
  await turno("coa-vv", REGISTO_4);
  const moDir = path.join(tmpRoot, "executive", "memoria-organizacional");
  const cscDir = path.join(tmpRoot, "executive", "centro-situacao");
  const confiavel = path.join(tmpRoot, "executive", "memoria-confiavel");
  assert.equal(fs.existsSync(moDir), false);
  assert.equal(fs.existsSync(cscDir), false);
  assert.equal(fs.existsSync(confiavel), false);

  const wiringPath = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    "wiringConversacional.js"
  );
  const src = fs.readFileSync(wiringPath, "utf8");
  assert.doesNotMatch(
    src,
    /memoriaOrganizacional|centroSituacao|memoriaConfiavel|historicoFisicoConversas/
  );
});

test("ambiguo: vários casos mesmo título → pede esclarecimento", async () => {
  writer.criarCaso({
    coaId: "coa-vv",
    titulo: "ValeVerde",
    origem: ORIGEM_UTILIZADOR,
    factosIniciais: ["A."]
  });
  writer.criarCaso({
    coaId: "coa-vv",
    titulo: "ValeVerde",
    origem: ORIGEM_UTILIZADOR,
    factosIniciais: ["B."]
  });
  // deixis aponta ao último; consulta por título deve ambiguidade
  const out = await processarTurnoLfc(LISTAR, {
    coaId: "coa-vv",
    writer,
    reader,
    // forçar resolução por título (wiring tenta título ValeVerde primeiro)
  });
  // Com 2 títulos iguais, resolverCaso({titulo}) → caso_ambiguo
  assert.equal(out.fonte, "lfc_reader");
  assert.match(out.mensagem, /vários casos|Indique qual caso/i);
});

test("LFC prevalece sobre reparse quando há factos activos", async () => {
  await turno("coa-vv", REGISTO_4);
  const historicoMentiroso = [
    {
      papel: "usuario",
      texto: `Fatos iniciais:\n- Facto inventado só no fio.\n- Outro inventado.`
    }
  ];
  const out = await processarTurnoLfc(LISTAR, {
    coaId: "coa-vv",
    writer,
    reader,
    historico: historicoMentiroso,
    permitirFallbackReparse: true
  });
  assertLeituraCanonicaLfc(out, "prevalência LFC sobre reparse");
  assert.doesNotMatch(out.mensagem, /inventado só no fio/i);
  assert.match(out.mensagem, /serviços/i);
});
