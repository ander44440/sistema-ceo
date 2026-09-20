/**
 * IMP-094 Fase 1 — Porta Canónica: OBS-1/2/3, zero LLM, rollback.
 */
import assert from "node:assert/strict";
import path from "node:path";
import { describe, it, before, after } from "node:test";
import {
  funilPortaCanonicaActiva,
  resolverRespostaCanonica
} from "../executiveEngine/portaCanonica.js";
import { tentarRespostaProtocoloExecutivo } from "../executiveEngine/protocoloAgenteExecutivo.js";
import { executiveEngine } from "../executiveEngine/index.js";
import { classificarIntencao } from "../executiveEngine/classificar.js";
import {
  criarLfcStore,
  criarLfcReader,
  criarLfcWriter
} from "../lastroFactualCaso/index.js";
import { configurarAdaptadorTrilhaLocal } from "../trilhaAuditavel/emissor.js";
import {
  inicializarCatalogo,
  selecionarProjeto
} from "../catalogoProjetos/index.js";
import { definirContextoConversacional } from "../modules/conversa/store.js";
import { abrirCoaParaTeste } from "./garantirCoaCatalogoTeste.js";

const COA = "prj-sistema-ceo";
const COA_B = "prj-1789509185314-3";

const PROTOCOLO = [
  "Você está no contexto CEO. Qual é o seu papel neste sistema?",
  "Qual é a primeira coisa que você deve fazer quando recebe uma nova demanda do usuário?",
  "A demanda do usuário está clara e pronta para execução. Você precisa pedir uma nova autorização do usuário antes de encaminhá-la ao CTO ou à IA especialista?",
  "O usuário apresenta uma demanda clara, sem necessidade de esclarecimentos. Descreva, passo a passo, o que você deve fazer a partir desse momento até encaminhar a demanda para execução."
];

const T1 =
  "Qual é o código secreto registrado nos fatos ativos do LFC deste caso? Responda somente com o valor do LFC.";

/** @type {ReturnType<typeof criarLfcReader>} */
let reader;
/** @type {ReturnType<typeof criarLfcWriter>} */
let writer;
let fetchPrev;
let llmCalls = 0;

before(() => {
  configurarAdaptadorTrilhaLocal(() => ({ ok: true }));
  const store = criarLfcStore(
    path.resolve(process.cwd(), "../executive/lastro-factual-casos")
  );
  reader = criarLfcReader(store);
  writer = criarLfcWriter(store, { superficie: "imp094-f1" });
  inicializarCatalogo();
  try {
    selecionarProjeto(COA);
  } catch {
    /* catálogo de teste */
  }
  definirContextoConversacional(COA);
  fetchPrev = globalThis.fetch;
  globalThis.fetch = async (url, init) => {
    const u = String(url);
    if (u.includes("deliberar")) {
      llmCalls += 1;
      throw new Error("LLM não deve ser chamado na Porta Canónica (Fase 1)");
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
  delete process.env.CEO_FUNIL_PORTA_CANONICA;
});

describe("IMP-094 F1 — flag rollback", () => {
  it("activa por omissão", () => {
    delete process.env.CEO_FUNIL_PORTA_CANONICA;
    assert.equal(funilPortaCanonicaActiva(), true);
  });

  it("CEO_FUNIL_PORTA_CANONICA=off desactiva", () => {
    process.env.CEO_FUNIL_PORTA_CANONICA = "off";
    assert.equal(funilPortaCanonicaActiva(), false);
    delete process.env.CEO_FUNIL_PORTA_CANONICA;
  });
});

describe("IMP-094 F1 — protocolo sem LLM + OBS", () => {
  for (const q of PROTOCOLO) {
    it(`EE canónico: ${q.slice(0, 48)}…`, async () => {
      delete process.env.CEO_FUNIL_PORTA_CANONICA;
      llmCalls = 0;
      const local = tentarRespostaProtocoloExecutivo(q);
      assert.equal(local.activo, true);
      const cls = classificarIntencao(q, { frenteActiva: true });
      assert.notEqual(cls.destino, "clarificacao");

      const out = await executiveEngine.executar({
        texto: q,
        historico: [],
        coaId: COA
      });
      assert.equal(llmCalls, 0, "zero LLM");
      assert.doesNotMatch(out.mensagem, /Falha técnica no raciocínio/i);
      assert.doesNotMatch(
        out.mensagem,
        /Não tenho lastro suficiente neste turno/i
      );
      assert.equal(out.dados?.veredictoCaminho, "canonico");
      assert.ok(
        out.dados?.familiaCanonico === "protocolo" ||
          out.dados?.familiaCanonico === "dic"
      );
      assert.equal(out.dados?.llmInvocado, false);
      assert.equal(out.dados?.mreInvocado, false);
    });
  }
});

describe("IMP-094 F1 — LFC T1 + OBS", () => {
  it("consulta tipada via Porta Canónica sem LLM", async () => {
    delete process.env.CEO_FUNIL_PORTA_CANONICA;
    llmCalls = 0;
    abrirCoaParaTeste(COA_B, "Isolamento Beta");
    const out = await executiveEngine.executar({
      texto: T1,
      historico: [],
      coaId: COA_B,
      lfcReader: reader,
      lfcWriter: writer
    });
    assert.equal(llmCalls, 0);
    assert.match(out.mensagem, /BETA-TOKEN-992/i);
    assert.doesNotMatch(out.mensagem, /120\s*funcion/i);
    assert.equal(out.dados?.veredictoCaminho, "canonico");
    assert.equal(out.dados?.familiaCanonico, "lfc");
    assert.equal(out.dados?.llmInvocado, false);
  });
});

describe("IMP-094 F1 — resolverRespostaCanonica", () => {
  it("protocolo devolve familia dic/protocolo", async () => {
    delete process.env.CEO_FUNIL_PORTA_CANONICA;
    const r = await resolverRespostaCanonica(PROTOCOLO[0], { coaId: COA });
    assert.equal(r.activo, true);
    assert.equal(r.familiaCanonico, "dic");
    assert.ok(r.mensagem);
  });

  it("off → inactivo", async () => {
    process.env.CEO_FUNIL_PORTA_CANONICA = "off";
    const r = await resolverRespostaCanonica(PROTOCOLO[0], { coaId: COA });
    assert.equal(r.activo, false);
    delete process.env.CEO_FUNIL_PORTA_CANONICA;
  });
});
