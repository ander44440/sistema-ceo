/**
 * IMP-094 — correcção TC-01: confirmação COA/sessão via Porta Canónica (DIC).
 * Escopo: detector + PC + EE; regressão LFC/TC-02-path; deliberação com «COA» → não PC.
 */
import assert from "node:assert/strict";
import path from "node:path";
import { describe, it, before, after, beforeEach } from "node:test";
import {
  detectarPedidoProtocoloExecutivo,
  tentarRespostaProtocoloExecutivo,
  comporRespostaCoaSessaoActivo
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
import { limparCoaAtivo } from "./coaSessao.js";
import { abrirCoaParaTeste } from "./garantirCoaCatalogoTeste.js";
import { classificarIntencao } from "./classificar.js";

const TC01 =
  "Confirme o COA / projeto activo neste momento. Responda somente com o nome e o identificador (id).";

/** Pedido LFC típico (caminho TC-02 / lastro) — não deve virar DIC sessão. */
const TC02_LFC =
  "Qual é o código secreto registrado nos fatos ativos do LFC deste caso? Responda somente com o valor do LFC.";

const DELIB_COA =
  "Analise a priorização outdoor vs pagamento no MG2 com o lastro autorizado do COA activo.";

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
  writer = criarLfcWriter(store, { superficie: "imp094-tc01" });
  fetchPrev = globalThis.fetch;
  globalThis.fetch = async (url, init) => {
    const u = String(url);
    if (u.includes("deliberar")) {
      llmCalls += 1;
      return new Response(
        JSON.stringify({
          ok: true,
          mensagem: "MRE_MOCK_DELIBERATIVO",
          dados: { mreInvocado: true, veredictoCaminho: "deliberar" }
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
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

describe("TC-01 — detector coa_sessao_activo", () => {
  it("detecta confirmação literal TC-01", () => {
    const d = detectarPedidoProtocoloExecutivo(TC01);
    assert.equal(d.activo, true);
    assert.equal(d.modo, "coa_sessao_activo");
  });

  it("compõe nome + id com COA", () => {
    const msg = comporRespostaCoaSessaoActivo({ id: COA_B, nome: NOME_B });
    assert.match(msg, new RegExp(NOME_B.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    assert.match(msg, new RegExp(COA_B));
  });

  it("sem COA: mensagem explícita", () => {
    const msg = comporRespostaCoaSessaoActivo(null);
    assert.match(msg, /Não há COA/i);
    assert.match(msg, /Abrir/i);
  });

  it("deliberação com «COA» não activa detector", () => {
    const d = detectarPedidoProtocoloExecutivo(DELIB_COA);
    assert.equal(d.activo, false);
  });

  it("LFC T1 não activa detector de sessão", () => {
    const d = detectarPedidoProtocoloExecutivo(TC02_LFC);
    assert.notEqual(d.modo, "coa_sessao_activo");
  });
});

describe("TC-01 — Porta Canónica DIC + OBS-5", () => {
  it("familia dic; coaId em dadosExtras", async () => {
    assert.equal(familiaProtocoloOuDic("coa_sessao_activo"), "dic");
    const r = await resolverRespostaCanonica(TC01, { coaId: COA_B });
    assert.equal(r.activo, true);
    assert.equal(r.familiaCanonico, "dic");
    assert.equal(r.modo, "coa_sessao_activo");
    assert.match(r.mensagem, new RegExp(COA_B));
    assert.match(r.mensagem, /Isolamento Beta/i);
    assert.equal(r.dadosExtras?.coaId, COA_B);
    assert.equal(r.dadosExtras?.casoId, null);
  });

  it("sem COA activo: canónico explícito sem MRE", async () => {
    limparCoaAtivo();
    const r = await resolverRespostaCanonica(TC01, { coaId: null });
    assert.equal(r.activo, true);
    assert.equal(r.familiaCanonico, "dic");
    assert.match(r.mensagem, /Não há COA/i);
    assert.equal(r.dadosExtras?.coaId, null);
  });
});

describe("TC-01 — caminho EE/UI", () => {
  it("Abrir Beta → confirmação: canonico, llmInvocado=false, OBS-5", async () => {
    llmCalls = 0;
    const out = await executiveEngine.executar({
      texto: TC01,
      historico: [],
      coaId: COA_B,
      lfcReader: reader,
      lfcWriter: writer
    });
    assert.equal(llmCalls, 0, "zero LLM");
    assert.equal(out.dados?.veredictoCaminho, "canonico");
    assert.equal(out.dados?.familiaCanonico, "dic");
    assert.equal(out.dados?.llmInvocado, false);
    assert.equal(out.dados?.mreInvocado, false);
    assert.equal(out.dados?.coaId, COA_B);
    assert.match(out.mensagem, new RegExp(COA_B));
    assert.match(out.mensagem, /Isolamento Beta/i);
    assert.doesNotMatch(out.mensagem, /Falha técnica/i);
    assert.doesNotMatch(out.mensagem, /lastro suficiente/i);
    assert.equal(out.modo, "porta_canonica");
  });
});

describe("TC-01 — regressão LFC (caminho TC-02) e deliberação", () => {
  it("consulta LFC continua família lfc canónica", async () => {
    llmCalls = 0;
    const out = await executiveEngine.executar({
      texto: TC02_LFC,
      historico: [],
      coaId: COA_B,
      lfcReader: reader,
      lfcWriter: writer
    });
    assert.equal(llmCalls, 0);
    assert.equal(out.dados?.veredictoCaminho, "canonico");
    assert.equal(out.dados?.familiaCanonico, "lfc");
    assert.match(out.mensagem, /BETA-TOKEN-992/i);
  });

  it("demanda deliberativa com «COA» não fecha na PC; destino MRE", async () => {
    const pc = await resolverRespostaCanonica(DELIB_COA, { coaId: COA_B });
    assert.equal(pc.activo, false);

    const cls = classificarIntencao(DELIB_COA, { frenteActiva: true });
    assert.equal(cls.destino, "nucleo_mre");

    const local = tentarRespostaProtocoloExecutivo(DELIB_COA, {
      coa: { id: COA_B, nome: NOME_B }
    });
    assert.equal(local.activo, false);
  });
});
