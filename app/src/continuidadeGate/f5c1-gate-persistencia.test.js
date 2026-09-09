/**
 * F5-C1 — Gate pendente sobrevive a refresh / reabertura.
 * Ciclo: criar → persistir → refresh → recuperar → resolver → refresh → não reaparece.
 */
import assert from "node:assert/strict";
import { test, beforeEach } from "node:test";
import {
  obterStoreContinuidadePadrao,
  resetStoreContinuidadePadrao,
  descartarStoreContinuidadeEmMemoria,
  inicializarContinuidadeGateSessao,
  decidirInterceptacaoContinuidade
} from "./integracaoConversa.js";
import {
  carregarDocumentoGate,
  limparDocumentoGate
} from "./persistenciaGate.js";

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

beforeEach(() => {
  globalThis.localStorage = criarStorage();
  limparDocumentoGate();
  resetStoreContinuidadePadrao();
});

function abrirGateDemo(store) {
  return store.abrirGate({
    parecerId: "PAR-F5C1",
    gateId: "GATE-PAR-F5C1",
    cicloId: "ciclo-f5c1",
    parecerSnapshot: {
      id: "PAR-F5C1",
      acao: { job: { titulo: "Corrigir outdoor" } }
    },
    solicitacaoResumo: "Corrigir outdoor"
  });
}

/** Refresh = perde RAM, mantém localStorage, boot reidrata. */
function simularRefreshEBoot() {
  descartarStoreContinuidadeEmMemoria();
  return inicializarContinuidadeGateSessao();
}

test("F5-C1: criar Gate → activo e persistido", () => {
  const store = obterStoreContinuidadePadrao();
  abrirGateDemo(store);

  assert.equal(store.temGatePendente(), true);
  assert.equal(store.obterContextoActivo()?.gate.gateId, "GATE-PAR-F5C1");
  assert.equal(store.obterContextoActivo()?.gate.estado, "pendente");

  const doc = carregarDocumentoGate();
  assert.ok(doc);
  assert.equal(doc.pendentes.length, 1);
  assert.equal(doc.pendentes[0].gate.gateId, "GATE-PAR-F5C1");
  assert.equal(doc.pendentes[0].solicitacaoResumo, "Corrigir outdoor");
  assert.equal(doc.pendentes[0].parecerSnapshot?.id, "PAR-F5C1");
});

test("F5-C1: refresh recupera Gate pendente e mantém precedência", () => {
  abrirGateDemo(obterStoreContinuidadePadrao());

  const store2 = simularRefreshEBoot();
  assert.equal(store2.temGatePendente(), true);
  const ctx = store2.obterContextoActivo();
  assert.equal(ctx?.gate.gateId, "GATE-PAR-F5C1");
  assert.equal(ctx?.gate.parecerId, "PAR-F5C1");
  assert.equal(ctx?.solicitacaoResumo, "Corrigir outdoor");
  assert.equal(ctx?.parecerSnapshot?.acao?.job?.titulo, "Corrigir outdoor");

  assert.equal(decidirInterceptacaoContinuidade("Aprovado.", store2), "continuidade");
  // P0: mensagem não-decisão com Gate pendente → classificador (não lock)
  assert.equal(
    decidirInterceptacaoContinuidade("qual o estado?", store2),
    "classificador"
  );
});

test("F5-C1: resolver Gate remove persistência; novo refresh não reaparece", () => {
  abrirGateDemo(obterStoreContinuidadePadrao());
  const storeAposRefresh = simularRefreshEBoot();
  assert.equal(storeAposRefresh.temGatePendente(), true);

  const cons = storeAposRefresh.consumirDecisao("Aprovado.");
  assert.equal(cons.ok, true);
  assert.equal(cons.permanecePendente, false);
  assert.equal(storeAposRefresh.temGatePendente(), false);
  assert.equal(carregarDocumentoGate(), null);

  const storeFinal = simularRefreshEBoot();
  assert.equal(storeFinal.temGatePendente(), false);
  assert.equal(storeFinal.obterContextoActivo(), null);
  // Sem Gate: interceptação não captura — deixa classificador
  assert.equal(
    decidirInterceptacaoContinuidade("Aprovado.", storeFinal),
    "classificador"
  );
});

test("F5-C1: adiar mantém Gate pendente após refresh", () => {
  abrirGateDemo(obterStoreContinuidadePadrao());
  const s1 = simularRefreshEBoot();
  const adi = s1.consumirDecisao("Adiar.");
  assert.equal(adi.ok, true);
  assert.equal(adi.permanecePendente, true);
  assert.equal(s1.temGatePendente(), true);

  const s2 = simularRefreshEBoot();
  assert.equal(s2.temGatePendente(), true);
  assert.equal(s2.obterContextoActivo()?.gate.gateId, "GATE-PAR-F5C1");
  assert.ok((s2.obterContextoActivo()?.gate.adiamentos || 0) >= 1);
});

test("F5-C1: rejeitar limpa persistência como aprovar", () => {
  abrirGateDemo(obterStoreContinuidadePadrao());
  const s = simularRefreshEBoot();
  const rej = s.consumirDecisao("Cancela.");
  assert.equal(rej.ok, true);
  assert.equal(s.temGatePendente(), false);
  assert.equal(carregarDocumentoGate(), null);

  assert.equal(simularRefreshEBoot().temGatePendente(), false);
});
