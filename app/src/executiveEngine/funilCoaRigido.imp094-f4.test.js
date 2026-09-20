/**
 * IMP-094 Fase 4 — COA/sessão à prova de utilizador (ISO + OBS-5/6).
 */
import assert from "node:assert/strict";
import path from "node:path";
import { describe, it, before, after, beforeEach } from "node:test";
import {
  funilCoaRigidoActiva,
  resolverCoaTurno,
  anexarObservabilidadeCoa,
  permitirHintTituloCasoLfc
} from "./funilCoaRigido.js";
import { executiveEngine } from "./index.js";
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
import { extrairTituloCasoParaConsumoMre } from "../mre/consumoLfcMre.js";
import { abrirCoaParaTeste } from "./garantirCoaCatalogoTeste.js";
import { limparCoaAtivo } from "./coaSessao.js";

const T1 =
  "Qual é o código secreto registrado nos fatos ativos do LFC deste caso? Responda somente com o valor do LFC.";
const COA_B = "prj-1789509185314-3";
const COA_A = "prj-1789509071580-1";

/** @type {ReturnType<typeof criarLfcReader>} */
let reader;
/** @type {ReturnType<typeof criarLfcWriter>} */
let writer;
/** @type {typeof fetch | undefined} */
let fetchPrev;

before(() => {
  configurarAdaptadorTrilhaLocal(() => ({ ok: true }));
  const store = criarLfcStore(
    path.resolve(process.cwd(), "../executive/lastro-factual-casos")
  );
  reader = criarLfcReader(store);
  writer = criarLfcWriter(store, { superficie: "imp094-f4" });
  inicializarCatalogo();
  abrirCoaParaTeste(COA_A, "Isolamento Alpha");
  abrirCoaParaTeste(COA_B, "Isolamento Beta");
  fetchPrev = globalThis.fetch;
  globalThis.fetch = async (url) => {
    if (String(url).includes("deliberar")) {
      throw new Error("LLM não esperado em F4 lastro");
    }
    return new Response("{}", { status: 404 });
  };
});

after(() => {
  globalThis.fetch = fetchPrev;
  delete process.env.CEO_FUNIL_COA_RIGIDO;
});

beforeEach(() => {
  delete process.env.CEO_FUNIL_COA_RIGIDO;
});

async function ee(coaId, texto, extra = {}) {
  if (coaId) {
    abrirCoaParaTeste(coaId, coaId);
  }
  return executiveEngine.executar({
    texto,
    historico: [],
    ...(coaId ? { coaId } : {}),
    lfcReader: reader,
    lfcWriter: writer,
    ...extra
  });
}

describe("IMP-094 F4 — flag rollback", () => {
  it("activa por omissão", () => {
    delete process.env.CEO_FUNIL_COA_RIGIDO;
    assert.equal(funilCoaRigidoActiva(), true);
    assert.equal(permitirHintTituloCasoLfc(), false);
  });

  it("CEO_FUNIL_COA_RIGIDO=off desactiva", () => {
    process.env.CEO_FUNIL_COA_RIGIDO = "off";
    assert.equal(funilCoaRigidoActiva(), false);
    assert.equal(permitirHintTituloCasoLfc(), true);
    const r = resolverCoaTurno({
      entrada: "coa-a",
      sessao: "coa-b",
      autorizaContextoSessao: true
    });
    assert.equal(r.ok, true);
    assert.equal(r.coaId, "coa-a");
    assert.equal(r.legado, true);
    delete process.env.CEO_FUNIL_COA_RIGIDO;
  });
});

describe("IMP-094 F4 — resolverCoaTurno", () => {
  it("entrada=sessão → ok", () => {
    const r = resolverCoaTurno({
      entrada: "coa-x",
      sessao: { id: "coa-x" },
      autorizaContextoSessao: true
    });
    assert.equal(r.ok, true);
    assert.equal(r.coaId, "coa-x");
    assert.equal(r.divergencia, false);
  });

  it("divergência entrada≠sessão → falha observável (não escolha silenciosa)", () => {
    const r = resolverCoaTurno({
      entrada: "coa-a",
      sessao: "coa-b",
      autorizaContextoSessao: true
    });
    assert.equal(r.ok, false);
    assert.equal(r.codigo, "coa_divergente");
    assert.ok(r.marcadoresLn.includes("LN-09"));
    assert.equal(r.coaId, null);
  });

  it("sem COA → coa_ausente", () => {
    const r = resolverCoaTurno({
      entrada: null,
      sessao: null,
      autorizaContextoSessao: true
    });
    assert.equal(r.ok, false);
    assert.equal(r.codigo, "coa_ausente");
    assert.ok(r.marcadoresLn.includes("LN-09"));
  });

  it("sessão não autorizada → coaId null sem divergência", () => {
    const r = resolverCoaTurno({
      entrada: null,
      sessao: "coa-x",
      autorizaContextoSessao: false
    });
    assert.equal(r.ok, true);
    assert.equal(r.coaId, null);
    assert.equal(r.codigo, "sessao_nao_autorizada");
  });
});

describe("IMP-094 F4 — OBS-5 / OBS-6", () => {
  it("anexa coaId/casoId e marcadoresLn", () => {
    const out = anexarObservabilidadeCoa(
      { ok: true, mensagem: "x", dados: {} },
      {
        coaId: "coa-1",
        casoId: "caso-9",
        marcadoresLn: ["LN-09"],
        codigoCoa: "coa_ausente"
      }
    );
    assert.equal(out.dados.coaId, "coa-1");
    assert.equal(out.dados.casoId, "caso-9");
    assert.deepEqual(out.dados.marcadoresLn, ["LN-09"]);
    assert.equal(out.dados.codigoCoa, "coa_ausente");
  });

  it("T1 com COA B: OBS-5 coaId na resposta PC", async () => {
    const out = await ee(COA_B, T1);
    assert.equal(out.dados?.familiaCanonico, "lfc");
    assert.equal(out.dados?.coaId, COA_B);
    assert.ok(out.dados?.casoId);
    assert.equal(out.dados?.llmInvocado, false);
    assert.doesNotMatch(String(out.mensagem), /120\s*funcion/i);
  });
});

describe("IMP-094 F4 — ausência de COA", () => {
  it("consulta LFC sem COA → lfc_sem_coa + OBS-6, sem MRE", async () => {
    limparCoaAtivo();
    definirContextoConversacional(null);
    const out = await executiveEngine.executar({
      texto: T1,
      historico: [],
      lfcReader: reader,
      lfcWriter: writer
    });
    assert.match(String(out.modo || out.dados?.rota || ""), /lfc_sem_coa|porta_canonica/);
    assert.equal(out.dados?.mreInvocado, false);
    assert.equal(out.dados?.llmInvocado, false);
    const markers = out.dados?.marcadoresLn || out.dados?.marcadoresIsolamento || [];
    assert.ok(markers.includes("LN-09") || out.dados?.codigoCoa === "coa_ausente");
    assert.match(String(out.mensagem), /COA|Abrir|não/i);
  });
});

describe("IMP-094 F4 — concordância VCA↔PC / divergência", () => {
  it("entrada ≠ sessão Abrir → falha observável LN-09", async () => {
    abrirCoaParaTeste(COA_B, "Isolamento Beta");
    const out = await executiveEngine.executar({
      texto: T1,
      historico: [],
      coaId: COA_A,
      lfcReader: reader,
      lfcWriter: writer
    });
    assert.equal(out.modo, "coa_divergente");
    assert.equal(out.ok, false);
    assert.ok((out.dados?.marcadoresLn || []).includes("LN-09"));
    assert.equal(out.dados?.codigoCoa, "coa_divergente");
    assert.equal(out.dados?.mreInvocado, false);
  });
});

describe("IMP-094 F4 — A→B→A", () => {
  it("alternância preserva lastro de cada COA (OBS-5)", async () => {
    const a1 = await ee(COA_A, T1);
    const b1 = await ee(COA_B, T1);
    const a2 = await ee(COA_A, T1);
    assert.equal(a1.dados?.coaId, COA_A);
    assert.equal(b1.dados?.coaId, COA_B);
    assert.equal(a2.dados?.coaId, COA_A);
    assert.equal(String(a1.mensagem).trim(), String(a2.mensagem).trim());
    assert.notEqual(String(a1.mensagem).trim(), String(b1.mensagem).trim());
    assert.doesNotMatch(String(a1.mensagem) + String(b1.mensagem), /120\s*funcion/i);
  });
});

describe("IMP-094 F4 — anti-hint textual", () => {
  it("flag ON: permitirHintTituloCasoLfc=false (wiring não retargeta por hint)", () => {
    delete process.env.CEO_FUNIL_COA_RIGIDO;
    assert.equal(funilCoaRigidoActiva(), true);
    assert.equal(permitirHintTituloCasoLfc(), false);
    // Extracção de evidência explícita no pedido permanece (resolução intra-COA).
    // O gate impede só o retarget no wiring PC, não o parse do título.
    assert.equal(
      extrairTituloCasoParaConsumoMre("factos da ValeVerde neste turno"),
      "ValeVerde"
    );
  });

  it("flag OFF: hint ValeVerde permitido no wiring (rollback)", () => {
    process.env.CEO_FUNIL_COA_RIGIDO = "off";
    assert.equal(permitirHintTituloCasoLfc(), true);
    assert.equal(
      extrairTituloCasoParaConsumoMre("factos da ValeVerde neste turno"),
      "ValeVerde"
    );
    delete process.env.CEO_FUNIL_COA_RIGIDO;
  });
});
