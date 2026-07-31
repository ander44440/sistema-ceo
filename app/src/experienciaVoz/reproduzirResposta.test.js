/**
 * Testes PX-002 E4 — reprodução da resposta via Orquestrador.
 */

import assert from "node:assert/strict";
import { test } from "node:test";
import { ESTADO_VOZ, criarOrquestradorVoz } from "./index.js";
import {
  _definirMotorVozParaTestes,
  _resetMotorVozParaTestes,
  prepararGestoEnvio,
  reproduzirRespostaCeo
} from "./reproduzirResposta.js";

function memoriaStorage() {
  const map = new Map();
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k)
  };
}

function motorMock(opts = {}) {
  const calls = { speak: [], stop: 0 };
  return {
    calls,
    async speak(t) {
      calls.speak.push(t);
      if (opts.fail) throw new Error(opts.fail);
    },
    stop() {
      calls.stop += 1;
    }
  };
}

test("desativada → não fala (só texto)", async () => {
  _resetMotorVozParaTestes();
  const o = criarOrquestradorVoz({ storage: memoriaStorage() });
  const m = motorMock();
  const r = await reproduzirRespostaCeo("Olá CEO", {
    orquestrador: o,
    motor: m
  });
  assert.equal(r.falou, false);
  assert.equal(r.motivo, "desativada");
  assert.equal(m.calls.speak.length, 0);
});

test("ativa + unlocked → fala e volta a Ativa", async () => {
  _resetMotorVozParaTestes();
  const o = criarOrquestradorVoz({ storage: memoriaStorage() });
  o.ativarComGesto();
  const m = motorMock();
  const r = await reproduzirRespostaCeo("Resposta executiva.", {
    orquestrador: o,
    motor: m
  });
  assert.equal(r.falou, true);
  assert.deepEqual(m.calls.speak, ["Resposta executiva."]);
  assert.equal(o.estado(), ESTADO_VOZ.ATIVA);
});

test("ativa locked → enfileira sem falar", async () => {
  _resetMotorVozParaTestes();
  const store = memoriaStorage();
  const { criarPreferenciaVoz } = await import("./preferencia.js");
  criarPreferenciaVoz(store).gravar(true);
  const o = criarOrquestradorVoz({ storage: store });
  assert.equal(o.sessaoDesbloqueada(), false);
  const m = motorMock();
  const r = await reproduzirRespostaCeo("Pendente", {
    orquestrador: o,
    motor: m
  });
  assert.equal(r.falou, false);
  assert.equal(r.motivo, "pendente");
  assert.equal(o.textoPendente(), "Pendente");
  assert.equal(m.calls.speak.length, 0);
});

test("erro de síntese → Erro + conversa não quebra", async () => {
  _resetMotorVozParaTestes();
  const o = criarOrquestradorVoz({ storage: memoriaStorage() });
  o.ativarComGesto();
  const m = motorMock({ fail: "TTS offline" });
  const r = await reproduzirRespostaCeo("Texto", {
    orquestrador: o,
    motor: m
  });
  assert.equal(r.falou, false);
  assert.equal(r.motivo, "erro-sintese");
  assert.equal(o.estado(), ESTADO_VOZ.ERRO);
  assert.match(o.mensagemErro(), /TTS offline/);
});

test("prepararGestoEnvio desbloqueia se preferência Ativa", async () => {
  _resetMotorVozParaTestes();
  const store = memoriaStorage();
  const { criarPreferenciaVoz } = await import("./preferencia.js");
  criarPreferenciaVoz(store).gravar(true);
  const o = criarOrquestradorVoz({ storage: store });
  assert.equal(o.sessaoDesbloqueada(), false);
  _definirMotorVozParaTestes(motorMock());
  prepararGestoEnvio(o, { autorizarBrowser: () => ({ ok: true }) });
  assert.equal(o.sessaoDesbloqueada(), true);
  _resetMotorVozParaTestes();
});
