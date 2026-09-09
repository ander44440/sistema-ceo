/**
 * F5-C9 — Gate → Ledger MO (decisão terminal aprovado/rejeitado).
 */
import assert from "node:assert/strict";
import { test, beforeEach } from "node:test";
import { criarStoreContextoGate } from "./contexto.js";
import {
  continuarAposDecisaoGate,
  resetStoreContinuidadePadrao
} from "./integracaoConversa.js";
import {
  STORAGE_KEY_MO,
  hidratarMemoriaConfiavel,
  listarRegistosMo,
  reiniciarMemoriaConfiavelParaTestes
} from "../memoriaConfiavel/index.js";

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

const COA = "coa-gate-ledger-1";
const GATE_ID = "GATE-ledger-1";
const PARECER_ID = "parecer-ledger-1";

function parecerBase(extra = {}) {
  return {
    id: PARECER_ID,
    coaId: COA,
    diagnostico: { objetivoReal: "Corrigir bugs críticos" },
    acao: { job: { titulo: "Resolver bugs" } },
    ...extra
  };
}

function abrirGate(store, parecer = parecerBase()) {
  return store.abrirGate({
    parecerId: parecer.id,
    gateId: GATE_ID,
    cicloId: "ciclo-1",
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
    job: { id: "JOB-GATE-LEDGER", estado: "pending" },
    fluxoIniciado: true,
    handoff: { para: "dispatcher_req053" }
  };
}

beforeEach(() => {
  globalThis.localStorage = criarStorage();
  reiniciarMemoriaConfiavelParaTestes();
  resetStoreContinuidadePadrao();
});

test("F5-C9: aprovado → exactamente 1 registo Ledger origem gate", async () => {
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
  const lista = listarRegistosMo({ coaId: COA });
  assert.equal(lista.length, 1);
  const r = lista[0];
  assert.equal(r.origem, "gate");
  assert.equal(r.coaId, COA);
  assert.equal(r.quem, "usuario");
  assert.equal(r.quando, "2026-09-09T23:10:00.000Z");
  assert.match(r.decisao, /GATE-ledger-1/);
  assert.match(r.decisao, /aprovado/);
  assert.match(r.resultado, /JOB-GATE-LEDGER/);
  assert.match(r.baseadoEm, /GATE-MO:GATE-ledger-1/);
});

test("F5-C9: segunda chamada equivalente → continua 1 registo", async () => {
  const store = criarStoreContextoGate();
  abrirGate(store);
  const registro = store.registroJobs;
  const a1 = await continuarAposDecisaoGate({
    texto: "Aprovado.",
    store,
    conduzirMotor: motorAprovar,
    registro,
    agora: "2026-09-09T23:10:00.000Z"
  });
  assert.equal(a1.ok, true);
  assert.equal(listarRegistosMo({ coaId: COA }).length, 1);

  // Reabre o mesmo Gate + mesmo parecer (path idempotente de Job)
  abrirGate(store);
  const a2 = await continuarAposDecisaoGate({
    texto: "Aprovado.",
    store,
    conduzirMotor: motorAprovar,
    registro,
    agora: "2026-09-09T23:20:00.000Z"
  });
  assert.equal(a2.ok, true);
  assert.equal(a2.dados?.idempotente, true);
  assert.equal(listarRegistosMo({ coaId: COA }).length, 1);
});

test("F5-C9: rejeitado → 1 registo Ledger", async () => {
  const store = criarStoreContextoGate();
  abrirGate(store);
  const out = await continuarAposDecisaoGate({
    texto: "Cancela.",
    store,
    conduzirMotor: motorAprovar,
    agora: "2026-09-09T23:11:00.000Z"
  });
  assert.equal(out.dados?.decisao, "rejeitado");
  const lista = listarRegistosMo({ coaId: COA });
  assert.equal(lista.length, 1);
  assert.equal(lista[0].origem, "gate");
  assert.match(lista[0].resultado, /gate_rejeitado/);
});

test("F5-C9: adiado → nenhum registo Ledger", async () => {
  const store = criarStoreContextoGate();
  abrirGate(store);
  const out = await continuarAposDecisaoGate({
    texto: "Adiar.",
    store,
    conduzirMotor: motorAprovar,
    agora: "2026-09-09T23:12:00.000Z"
  });
  assert.equal(out.dados?.decisao, "adiado");
  assert.equal(out.dados?.store?.permanecePendente, true);
  assert.equal(listarRegistosMo().length, 0);
});

test("F5-C9: sem coaId → erro + Ledger inalterado", async () => {
  const store = criarStoreContextoGate();
  abrirGate(store, parecerBase({ coaId: null }));
  const out = await continuarAposDecisaoGate({
    texto: "Aprovado.",
    store,
    conduzirMotor: motorAprovar,
    agora: "2026-09-09T23:13:00.000Z"
  });
  assert.equal(out.ok, false);
  assert.equal(out.dados?.ledgerMo?.codigo, "coaId_ausente");
  assert.equal(store.temGatePendente(), true);
  assert.equal(listarRegistosMo().length, 0);
});

test("F5-C9: reidratação preserva registo Gate→Ledger", async () => {
  const store = criarStoreContextoGate();
  abrirGate(store);
  await continuarAposDecisaoGate({
    texto: "Aprovado.",
    store,
    conduzirMotor: motorAprovar,
    agora: "2026-09-09T23:14:00.000Z"
  });
  const raw = globalThis.localStorage.getItem(STORAGE_KEY_MO);
  assert.ok(raw);

  reiniciarMemoriaConfiavelParaTestes();
  globalThis.localStorage.setItem(STORAGE_KEY_MO, raw);
  const h = hidratarMemoriaConfiavel();
  assert.equal(h.ok, true);
  assert.equal(h.total, 1);
  assert.equal(listarRegistosMo({ coaId: COA })[0].origem, "gate");
});
