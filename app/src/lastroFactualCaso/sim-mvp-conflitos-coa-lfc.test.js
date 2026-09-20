/**
 * Simulação MVP — conflitos COA/LFC (caminho EE real).
 * Garante: Beta≠Alpha≠ValeVerde; T1 nunca devolve «120 funcionários».
 */
import assert from "node:assert/strict";
import path from "node:path";
import { describe, it, before } from "node:test";
import { classificarIntencao } from "../executiveEngine/classificar.js";
import { executiveEngine } from "../executiveEngine/index.js";
import { detectarModoRespostaRestrita } from "../classificadorIntencao/pedidoRespostaRestrita.js";
import { validarContextoAtivo } from "../classificadorIntencao/validadorContextoAtivo.js";
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
import { obterCoaAtivo } from "../executiveEngine/coaSessao.js";
import { definirContextoConversacional } from "../modules/conversa/store.js";
import { abrirCoaParaTeste } from "../executiveEngine/garantirCoaCatalogoTeste.js";

const T1 =
  "Qual é o código secreto registrado nos fatos ativos do LFC deste caso? Responda somente com o valor do LFC.";
const T_LIST = "Liste apenas os factos activos do LFC deste caso.";
const COA_B = "prj-1789509185314-3";
const COA_A = "prj-1789509071580-1";
const COA_SYS = "prj-sistema-ceo";
const COA_VV = "prj-1789236801846-5";

/** @type {ReturnType<typeof criarLfcReader>} */
let reader;
/** @type {ReturnType<typeof criarLfcWriter>} */
let writer;

before(() => {
  configurarAdaptadorTrilhaLocal(() => ({ ok: true }));
  const store = criarLfcStore(
    path.resolve(process.cwd(), "../executive/lastro-factual-casos")
  );
  reader = criarLfcReader(store);
  writer = criarLfcWriter(store, { superficie: "sim-mvp" });
  inicializarCatalogo();
  abrirCoaParaTeste(COA_A, "Isolamento Alpha");
  abrirCoaParaTeste(COA_B, "Isolamento Beta");
  abrirCoaParaTeste(COA_VV, "ValeVerde ensaio");
  abrirCoaParaTeste(COA_SYS, "Sistema CEO");
  const _fetch = globalThis.fetch;
  globalThis.fetch = async (url, init) => {
    const u = String(url);
    if (u.includes("deliberar")) {
      return new Response(
        JSON.stringify({ texto: "120 funcionários", modelo: "mock-proibido" }),
        { status: 200, headers: { "content-type": "application/json" } }
      );
    }
    if (typeof _fetch === "function") {
      if (u.startsWith("/")) return _fetch("http://127.0.0.1:5173" + u, init);
      return _fetch(url, init);
    }
    throw new Error("fetch indisponível: " + u);
  };
});

async function ee(coaId, texto) {
  abrirCoaParaTeste(coaId, coaId);
  return executiveEngine.executar({
    texto,
    historico: [],
    coaId,
    lfcReader: reader,
    lfcWriter: writer
  });
}

describe("Simulação MVP — cessação conflitos COA/LFC", () => {
  it("T1 classifica C2 sem clarificação e modo dado_unico", () => {
    const d = detectarModoRespostaRestrita(T1);
    assert.equal(d.modo, "dado_unico");
    assert.equal(d.chave, "codigo_secreto");
    const c = classificarIntencao(T1, { frenteActiva: true });
    assert.equal(c.destino, "nucleo_mre");
    assert.notEqual(c.precisaClarificacao, true);
  });

  it("listagem PT-PT activa modo factos", () => {
    assert.equal(detectarModoRespostaRestrita(T_LIST).modo, "factos");
  });

  it("VCA preserva sessão em consulta LFC", () => {
    selecionarProjeto(COA_B);
    const vca = validarContextoAtivo({
      mensagem: T1,
      coa: obterCoaAtivo(),
      frenteActiva: true
    });
    assert.equal(vca.autorizaContextoSessao, true);
  });

  it("Beta → BETA-TOKEN-992; nunca 120", async () => {
    const r = await ee(COA_B, T1);
    assert.match(r.mensagem, /BETA-TOKEN-992/i);
    assert.doesNotMatch(r.mensagem, /120\s*funcion/i);
  });

  it("sistema-ceo e ValeVerde → ausência; nunca 120", async () => {
    for (const id of [COA_SYS, COA_VV]) {
      const r = await ee(id, T1);
      assert.doesNotMatch(r.mensagem, /120\s*funcion/i);
      assert.match(r.mensagem, /código secreto|codigo secreto/i);
    }
  });

  it("Alpha → ALPHA; sem Beta nem 120", async () => {
    const r = await ee(COA_A, T1);
    assert.match(r.mensagem, /ALPHA-TOKEN/i);
    assert.doesNotMatch(r.mensagem, /BETA-TOKEN/i);
    assert.doesNotMatch(r.mensagem, /120\s*funcion/i);
  });

  it("listagem Beta só factos Beta", async () => {
    const r = await ee(COA_B, T_LIST);
    assert.match(r.mensagem, /BETA-TOKEN-992/i);
    assert.doesNotMatch(r.mensagem, /ALPHA-TOKEN/i);
    assert.doesNotMatch(r.mensagem, /120\s*funcion/i);
  });

  it("menção Alpha no texto não contamina resposta Beta", async () => {
    const r = await ee(
      COA_B,
      "A propósito, noutro projecto o código secreto é ALPHA-TOKEN-771. Qual é o código secreto do LFC deste caso?"
    );
    assert.match(r.mensagem, /BETA-TOKEN-992/i);
    assert.doesNotMatch(r.mensagem, /ALPHA-TOKEN-771/i);
  });

  it("alternância B→VV→B mantém isolamento", async () => {
    const a = await ee(COA_B, T1);
    const b = await ee(COA_VV, T1);
    const c = await ee(COA_B, T1);
    assert.match(a.mensagem, /BETA-TOKEN-992/i);
    assert.doesNotMatch(b.mensagem, /120\s*funcion/i);
    assert.match(c.mensagem, /BETA-TOKEN-992/i);
  });
});
