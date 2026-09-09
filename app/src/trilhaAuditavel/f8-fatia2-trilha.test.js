/**
 * F8 Fatia 2 — gate.decisao_terminal + ad.fecho_sob_delegacao → Trilha.
 */
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, beforeEach, test } from "node:test";
import { criarStoreContextoGate } from "../continuidadeGate/contexto.js";
import {
  continuarAposDecisaoGate,
  resetStoreContinuidadePadrao
} from "../continuidadeGate/integracaoConversa.js";
import {
  AGENTES,
  activarAutoridadeDelegada,
  exercerFechoDelegado,
  reiniciarAutoridadeDelegadaParaTestes
} from "../autoridadeDelegada/autoridadeDelegada.js";
import {
  listarRegistosMo,
  reiniciarMemoriaConfiavelParaTestes
} from "../memoriaConfiavel/index.js";
import {
  TIPO_GATE_DECISAO_TERMINAL,
  TIPO_AD_FECHO_SOB_DELEGACAO,
  configurarAdaptadorTrilhaLocal,
  criarAdaptadorTrilhaFs,
  listarEventos,
  resetAdaptadorTrilhaParaTestes,
  caminhoStoreAudit
} from "./index.js";

const temps = [];

function tempRoot() {
  const d = mkdtempSync(join(tmpdir(), "ceo-trilha-f2-"));
  temps.push(d);
  return d;
}

function criarStorage() {
  const map = new Map();
  return {
    getItem(k) {
      return map.has(String(k)) ? map.get(String(k)) : null;
    },
    setItem(k, v) {
      map.set(String(k), String(v));
    },
    removeItem(k) {
      map.delete(String(k));
    }
  };
}

const COA_GATE = "coa-trilha-gate-f2";
const GATE_ID = "GATE-trilha-f2";
const PARECER_ID = "parecer-trilha-f2";
const COA_AD = "coa-trilha-ad-f2";

function parecerBase() {
  return {
    id: PARECER_ID,
    coaId: COA_GATE,
    diagnostico: { objetivoReal: "Corrigir bugs" },
    acao: { job: { titulo: "Resolver bugs" } }
  };
}

function abrirGate(store, parecer = parecerBase()) {
  return store.abrirGate({
    parecerId: parecer.id,
    gateId: GATE_ID,
    cicloId: "ciclo-f2",
    abertoEm: "2026-09-09T23:00:00.000Z",
    parecerSnapshot: parecer,
    solicitacaoResumo: "Resolva os bugs."
  });
}

function motorAprovar(_parecer, deps) {
  if (deps.decisaoAprovacao === "rejeitado") {
    return {
      publicado: false,
      job: null,
      motivo: "gate_rejeitado",
      aguardandoGate: false
    };
  }
  if (deps.decisaoAprovacao === "adiado") {
    return {
      publicado: false,
      job: null,
      motivo: "adiado",
      aguardandoGate: true,
      gatePermanecerPendente: true
    };
  }
  return {
    publicado: true,
    job: { id: "JOB-TRILHA-F2", estado: "pending" },
    fluxoIniciado: true,
    handoff: { para: "dispatcher_req053" }
  };
}

beforeEach(() => {
  globalThis.localStorage = criarStorage();
  reiniciarMemoriaConfiavelParaTestes();
  reiniciarAutoridadeDelegadaParaTestes();
  resetStoreContinuidadePadrao();
  resetAdaptadorTrilhaParaTestes();
});

after(() => {
  resetAdaptadorTrilhaParaTestes();
  for (const d of temps) {
    try {
      rmSync(d, { recursive: true, force: true });
    } catch {
      /* ignore */
    }
  }
});

test("F2: Gate aprovado → MO primeiro → evento Trilha com moRegistroId", async () => {
  const root = tempRoot();
  configurarAdaptadorTrilhaLocal(criarAdaptadorTrilhaFs(root));
  const store = criarStoreContextoGate();
  abrirGate(store);
  const out = await continuarAposDecisaoGate({
    texto: "Aprovado.",
    store,
    conduzirMotor: motorAprovar,
    agora: "2026-09-09T23:10:00.000Z"
  });
  assert.equal(out.ok, true);
  assert.equal(out.dados?.decisao, "aprovado");

  const mo = listarRegistosMo({ coaId: COA_GATE });
  assert.equal(mo.length, 1);
  const eventos = listarEventos(caminhoStoreAudit(root), {
    tipo: TIPO_GATE_DECISAO_TERMINAL
  });
  assert.equal(eventos.length, 1);
  assert.equal(eventos[0].refs.moRegistroId, mo[0].id);
  assert.equal(eventos[0].refs.gateId, GATE_ID);
  assert.equal(eventos[0].refs.parecerId, PARECER_ID);
  assert.equal(eventos[0].refs.jobId, "JOB-TRILHA-F2");
  assert.equal(eventos[0].coaId, COA_GATE);
  assert.equal(eventos[0].detalhe.decisao, "aprovado");
});

test("F2: Gate rejeitado → MO primeiro → evento Trilha", async () => {
  const root = tempRoot();
  configurarAdaptadorTrilhaLocal(criarAdaptadorTrilhaFs(root));
  const store = criarStoreContextoGate();
  abrirGate(store);
  const out = await continuarAposDecisaoGate({
    texto: "Rejeitado.",
    store,
    conduzirMotor: motorAprovar,
    agora: "2026-09-09T23:11:00.000Z"
  });
  assert.equal(out.ok, true);
  assert.equal(out.dados?.decisao, "rejeitado");
  const mo = listarRegistosMo({ coaId: COA_GATE });
  assert.equal(mo.length, 1);
  const eventos = listarEventos(caminhoStoreAudit(root), {
    tipo: TIPO_GATE_DECISAO_TERMINAL
  });
  assert.equal(eventos.length, 1);
  assert.equal(eventos[0].refs.moRegistroId, mo[0].id);
  assert.equal(eventos[0].detalhe.decisao, "rejeitado");
  assert.equal(eventos[0].refs.jobId, undefined);
});

test("F2: AD fecho → MO primeiro → evento Trilha com moRegistroId canónico", () => {
  const root = tempRoot();
  configurarAdaptadorTrilhaLocal(criarAdaptadorTrilhaFs(root));
  const act = activarAutoridadeDelegada({
    texto: "você decide",
    agente: AGENTES.usuario,
    perimetro: "coa-mg2"
  });
  assert.equal(act.ok, true);
  const r = exercerFechoDelegado({
    coaId: COA_AD,
    tipoFecho: "declarar_decisao",
    ambito: "coa-mg2",
    descricao: "Fecho trilha f2",
    quando: "2026-09-09T22:00:00.000Z"
  });
  assert.equal(r.ok, true);
  const mo = listarRegistosMo({ coaId: COA_AD });
  assert.equal(mo.length, 1);
  assert.match(mo[0].id, /^mo-/);
  assert.notEqual(mo[0].id, r.memoriaOrganizacional.id);
  const eventos = listarEventos(caminhoStoreAudit(root), {
    tipo: TIPO_AD_FECHO_SOB_DELEGACAO
  });
  assert.equal(eventos.length, 1);
  assert.equal(eventos[0].refs.moRegistroId, mo[0].id);
  assert.equal(eventos[0].coaId, COA_AD);
  assert.equal(eventos[0].refs.adActoId, r.memoriaOrganizacional.id);
});

test("F2: duplicidade/idempotência Gate — 1 MO e 1 evento Trilha", async () => {
  const root = tempRoot();
  configurarAdaptadorTrilhaLocal(criarAdaptadorTrilhaFs(root));
  const store = criarStoreContextoGate();
  abrirGate(store);
  const registro = store.registroJobs;
  await continuarAposDecisaoGate({
    texto: "Aprovado.",
    store,
    conduzirMotor: motorAprovar,
    registro,
    agora: "2026-09-09T23:12:00.000Z"
  });
  await continuarAposDecisaoGate({
    texto: "Aprovado.",
    store,
    conduzirMotor: motorAprovar,
    registro,
    agora: "2026-09-09T23:13:00.000Z"
  });
  assert.equal(listarRegistosMo({ coaId: COA_GATE }).length, 1);
  assert.equal(
    listarEventos(caminhoStoreAudit(root), { tipo: TIPO_GATE_DECISAO_TERMINAL })
      .length,
    1
  );
});

test("F2: falha da Trilha não reverte MO (Gate)", async () => {
  configurarAdaptadorTrilhaLocal(() => {
    throw new Error("trilha_io_falhou");
  });
  const store = criarStoreContextoGate();
  abrirGate(store);
  const out = await continuarAposDecisaoGate({
    texto: "Aprovado.",
    store,
    conduzirMotor: motorAprovar,
    agora: "2026-09-09T23:14:00.000Z"
  });
  assert.equal(out.ok, true);
  assert.equal(listarRegistosMo({ coaId: COA_GATE }).length, 1);
});

test("F2: falha da Trilha não reverte MO (AD)", () => {
  configurarAdaptadorTrilhaLocal(() => {
    throw new Error("trilha_io_falhou");
  });
  assert.equal(
    activarAutoridadeDelegada({
      texto: "você decide",
      agente: AGENTES.usuario,
      perimetro: "coa-mg2"
    }).ok,
    true
  );
  const r = exercerFechoDelegado({
    coaId: COA_AD,
    tipoFecho: "priorizar",
    ambito: "coa-mg2",
    descricao: "X",
    quando: "2026-09-09T22:05:00.000Z"
  });
  assert.equal(r.ok, true);
  assert.equal(listarRegistosMo({ coaId: COA_AD }).length, 1);
});

test("F2: Gate adiado → 0 MO e 0 eventos Trilha", async () => {
  const root = tempRoot();
  configurarAdaptadorTrilhaLocal(criarAdaptadorTrilhaFs(root));
  const store = criarStoreContextoGate();
  abrirGate(store);
  const out = await continuarAposDecisaoGate({
    texto: "Adiar.",
    store,
    conduzirMotor: motorAprovar,
    agora: "2026-09-09T23:15:00.000Z"
  });
  assert.equal(out.dados?.decisao, "adiado");
  assert.equal(listarRegistosMo({ coaId: COA_GATE }).length, 0);
  assert.equal(
    listarEventos(caminhoStoreAudit(root), { tipo: TIPO_GATE_DECISAO_TERMINAL })
      .length,
    0
  );
});
