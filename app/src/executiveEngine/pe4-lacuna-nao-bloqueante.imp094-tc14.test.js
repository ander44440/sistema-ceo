/**
 * IMP-094 — correcção TC-14: PE-4 lacuna não bloqueante via Porta Canónica.
 */
import assert from "node:assert/strict";
import path from "node:path";
import { describe, it, before, after, beforeEach } from "node:test";
import {
  detectarPedidoProtocoloExecutivo,
  tentarRespostaProtocoloExecutivo
} from "./protocoloAgenteExecutivo.js";
import {
  resolverRespostaCanonica,
  familiaProtocoloOuDic
} from "./portaCanonica.js";
import { executiveEngine } from "./index.js";
import {
  criarLfcStore,
  criarLfcReader,
  criarLfcWriter
} from "../lastroFactualCaso/index.js";
import { configurarAdaptadorTrilhaLocal } from "../trilhaAuditavel/emissor.js";
import { abrirCoaParaTeste } from "./garantirCoaCatalogoTeste.js";
import { classificarIntencao } from "./classificar.js";
import { permiteClarificacaoTurno } from "../classificadorIntencao/clarificacaoDisciplinada.js";

const TC14 =
  "A demanda está incompleta, mas a lacuna não impede o avanço. O que você deve fazer?";

const TC14_BLOQUEANTE =
  "A demanda está incompleta e a lacuna impede o avanço. O que você deve fazer?";

const TC14_BLOQUEANTE_ALT =
  "A demanda tem uma lacuna bloqueante. O que você deve fazer?";

const TC04 =
  "Qual é a primeira coisa que você deve fazer quando recebe uma nova demanda do usuário?";

const TC05 =
  "Quando uma demanda do usuário estiver clara, qual deve ser o seu procedimento antes de iniciar qualquer execução?";

const TC08 =
  "Você recebeu uma demanda clara do usuário e não existem informações faltantes. O que você faz agora?";

const T1_LFC =
  "Qual é o código secreto registrado nos fatos ativos do LFC deste caso? Responda somente com o valor do LFC.";

const DELIB_LACUNA =
  "Analise as lacunas do outdoor vs pagamento no MG2 com o lastro autorizado.";

const COA_B = "prj-1789509185314-3";
const NOME_B = "VAL-093.1-B Isolamento Beta";

/** @type {ReturnType<typeof criarLfcReader>} */
let reader;
/** @type {ReturnType<typeof criarLfcWriter>} */
let writer;
/** @type {typeof fetch | undefined} */
let fetchPrev;
let llmCalls = 0;

before(() => {
  configurarAdaptadorTrilhaLocal(() => ({ ok: true }));
  const store = criarLfcStore(
    path.resolve(process.cwd(), "../executive/lastro-factual-casos")
  );
  reader = criarLfcReader(store);
  writer = criarLfcWriter(store, { superficie: "imp094-tc14" });
  fetchPrev = globalThis.fetch;
  globalThis.fetch = async (url, init) => {
    const u = String(url);
    if (u.includes("deliberar") || u.includes("openai") || u.includes("chat")) {
      llmCalls += 1;
      throw new Error("LLM não deve ser chamado no TC-14 canónico");
    }
    if (typeof fetchPrev === "function") {
      if (u.startsWith("/")) return fetchPrev("http://127.0.0.1:5173" + u, init);
      return fetchPrev(url, init);
    }
    return new Response("{}", { status: 404 });
  };
});

after(() => {
  globalThis.fetch = fetchPrev;
});

beforeEach(() => {
  delete process.env.CEO_FUNIL_PORTA_CANONICA;
  llmCalls = 0;
  abrirCoaParaTeste(COA_B, NOME_B);
});

describe("TC-14 — detector lacuna_nao_bloqueante", () => {
  it("literal TC-14 activa PE-4", () => {
    const d = detectarPedidoProtocoloExecutivo(TC14);
    assert.equal(d.activo, true);
    assert.equal(d.modo, "lacuna_nao_bloqueante");
  });

  it("negativo: lacuna impede o avanço → não PE-4", () => {
    const d = detectarPedidoProtocoloExecutivo(TC14_BLOQUEANTE);
    assert.notEqual(d.modo, "lacuna_nao_bloqueante");
  });

  it("negativo: lacuna bloqueante → não PE-4", () => {
    const d = detectarPedidoProtocoloExecutivo(TC14_BLOQUEANTE_ALT);
    assert.notEqual(d.modo, "lacuna_nao_bloqueante");
  });

  it("composição PE-4: avançar, incerteza, sem inventar, pergunta só se bloqueante", () => {
    const r = tentarRespostaProtocoloExecutivo(TC14);
    assert.equal(r.activo, true);
    assert.match(r.mensagem, /Avanço|avanç/i);
    assert.match(r.mensagem, /incerteza|Registo/i);
    assert.match(r.mensagem, /sem inventar|Não.*invent/i);
    assert.match(r.mensagem, /passar a ser bloqueante|bloqueante/i);
    assert.match(r.mensagem, /Não.*checklist|nem «suposições/i);
    assert.doesNotMatch(r.mensagem, /ouvir atentamente/i);
  });
});

describe("TC-14 — Porta Canónica", () => {
  it("familia protocolo; canonico via EE", async () => {
    assert.equal(familiaProtocoloOuDic("lacuna_nao_bloqueante"), "protocolo");
    const r = await resolverRespostaCanonica(TC14, { coaId: COA_B });
    assert.equal(r.activo, true);
    assert.equal(r.familiaCanonico, "protocolo");
    assert.equal(r.modo, "lacuna_nao_bloqueante");
    assert.match(r.mensagem, /não bloqueante|Avanço|avanç/i);
  });
});

describe("TC-14 — caminho EE/UI", () => {
  it("canonico, llmInvocado=false, sem LN-05", async () => {
    llmCalls = 0;
    const out = await executiveEngine.executar({
      texto: TC14,
      historico: [],
      coaId: COA_B,
      lfcReader: reader,
      lfcWriter: writer
    });
    assert.equal(llmCalls, 0);
    assert.equal(out.dados?.veredictoCaminho, "canonico");
    assert.equal(out.dados?.familiaCanonico, "protocolo");
    assert.equal(out.dados?.modoCanonico, "lacuna_nao_bloqueante");
    assert.equal(out.dados?.llmInvocado, false);
    assert.equal(out.dados?.mreInvocado, false);
    assert.equal(out.modo, "porta_canonica");
    assert.doesNotMatch(out.mensagem, /ouvir atentamente/i);
    assert.doesNotMatch(out.mensagem, /7\.\s+\*\*Colaboração/i);
    assert.match(out.mensagem, /Não.*checklist|nem «suposições/i);
  });
});

describe("TC-14 — regressão", () => {
  it("TC-04 primeira_accao intacto", async () => {
    const d = detectarPedidoProtocoloExecutivo(TC04);
    assert.equal(d.modo, "primeira_accao");
    const out = await executiveEngine.executar({
      texto: TC04,
      historico: [],
      coaId: COA_B
    });
    assert.equal(out.dados?.veredictoCaminho, "canonico");
    assert.match(out.mensagem, /classificar a intenção/i);
  });

  it("TC-05 procedimento_pre_execucao intacto", async () => {
    const d = detectarPedidoProtocoloExecutivo(TC05);
    assert.equal(d.modo, "procedimento_pre_execucao");
    const out = await executiveEngine.executar({
      texto: TC05,
      historico: [],
      coaId: COA_B
    });
    assert.equal(out.dados?.modoCanonico, "procedimento_pre_execucao");
  });

  it("TC-08 fluxo_ate_execucao intacto", async () => {
    const d = detectarPedidoProtocoloExecutivo(TC08);
    assert.equal(d.modo, "fluxo_ate_execucao");
    const out = await executiveEngine.executar({
      texto: TC08,
      historico: [],
      coaId: COA_B
    });
    assert.equal(out.dados?.modoCanonico, "fluxo_ate_execucao");
  });

  it("CL-1: bloqueante explícito continua a permitir clarificação (fora PE-4)", () => {
    const d = detectarPedidoProtocoloExecutivo(TC14_BLOQUEANTE);
    assert.notEqual(d.modo, "lacuna_nao_bloqueante");
    const ver = permiteClarificacaoTurno(TC14_BLOQUEANTE, {
      ambiguoBloqueante: true,
      motivoCandidato: "teste_cl1"
    });
    assert.equal(ver.permitido, true);
  });

  it("deliberação com «lacuna» não activa PE-4; destino MRE", async () => {
    const d = detectarPedidoProtocoloExecutivo(DELIB_LACUNA);
    assert.notEqual(d.modo, "lacuna_nao_bloqueante");
    const pc = await resolverRespostaCanonica(DELIB_LACUNA, { coaId: COA_B });
    assert.equal(pc.activo, false);
    const cls = classificarIntencao(DELIB_LACUNA, null, {
      contextoClassificacao: { frenteActiva: true }
    });
    assert.equal(cls.destino, "nucleo_mre");
  });

  it("LFC tipado continua família lfc", async () => {
    llmCalls = 0;
    const out = await executiveEngine.executar({
      texto: T1_LFC,
      historico: [],
      coaId: COA_B,
      lfcReader: reader,
      lfcWriter: writer
    });
    assert.equal(llmCalls, 0);
    assert.equal(out.dados?.familiaCanonico, "lfc");
    assert.match(out.mensagem, /BETA-TOKEN-992/i);
  });
});
