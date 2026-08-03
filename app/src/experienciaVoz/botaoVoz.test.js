/**
 * Testes PX-002 E3 — gestos do botão de voz ↔ orquestrador.
 */

import assert from "node:assert/strict";
import { test } from "node:test";
import { ESTADO_VOZ, criarOrquestradorVoz, criarPreferenciaVoz } from "./index.js";
import { executarGestoBotaoVoz, pintarBotaoVoz } from "./botaoVoz.js";

function memoriaStorage() {
  const map = new Map();
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k)
  };
}

const authOk = () => ({ ok: true });
const authFail = () => ({
  ok: false,
  motivo: "Neste dispositivo não há síntese de voz. Seguimos só por texto."
});

test("primeiro toque: Desativada → Ativa + unlock", () => {
  const o = criarOrquestradorVoz({ storage: memoriaStorage() });
  const snap = executarGestoBotaoVoz(o, { autorizarBrowser: authOk });
  assert.equal(snap.estado, ESTADO_VOZ.ATIVA);
  assert.equal(snap.enabled, true);
  assert.equal(snap.sessaoDesbloqueada, true);
});

test("primeiro toque com browser a falhar → Erro", () => {
  const o = criarOrquestradorVoz({ storage: memoriaStorage() });
  const snap = executarGestoBotaoVoz(o, { autorizarBrowser: authFail });
  assert.equal(snap.estado, ESTADO_VOZ.ERRO);
  assert.ok(snap.mensagemErro);
});

test("próximo acesso: preferência Ativa locked → unlock no toque", () => {
  const store = memoriaStorage();
  criarPreferenciaVoz(store).gravar(true);
  const o = criarOrquestradorVoz({ storage: store });
  assert.equal(o.estado(), ESTADO_VOZ.ATIVA);
  assert.equal(o.sessaoDesbloqueada(), false);
  const snap = executarGestoBotaoVoz(o, { autorizarBrowser: authOk });
  assert.equal(snap.estado, ESTADO_VOZ.ATIVA);
  assert.equal(snap.sessaoDesbloqueada, true);
});

test("Ativa unlocked → toque desativa", () => {
  const o = criarOrquestradorVoz({ storage: memoriaStorage() });
  executarGestoBotaoVoz(o, { autorizarBrowser: authOk });
  const snap = executarGestoBotaoVoz(o, { autorizarBrowser: authOk });
  assert.equal(snap.estado, ESTADO_VOZ.DESATIVADA);
  assert.equal(snap.enabled, false);
});

test("Falando → toque interrompe", () => {
  const o = criarOrquestradorVoz({ storage: memoriaStorage() });
  o.ativarComGesto();
  o.iniciarFala();
  const snap = executarGestoBotaoVoz(o, { autorizarBrowser: authOk });
  assert.equal(snap.estado, ESTADO_VOZ.ATIVA);
});

test("Ouvindo → toque termina escuta", () => {
  const o = criarOrquestradorVoz({ storage: memoriaStorage() });
  o.ativarComGesto();
  o.iniciarEscuta();
  const snap = executarGestoBotaoVoz(o, { autorizarBrowser: authOk });
  assert.equal(snap.estado, ESTADO_VOZ.ATIVA);
});

test("Erro → retry restaura Ativa", () => {
  const o = criarOrquestradorVoz({ storage: memoriaStorage() });
  o.ativarComGesto();
  o.marcarErro("falha");
  const snap = executarGestoBotaoVoz(o, { autorizarBrowser: authOk });
  assert.equal(snap.estado, ESTADO_VOZ.ATIVA);
  assert.equal(snap.sessaoDesbloqueada, true);
});

test("pintarBotaoVoz espelha data-voice-state", () => {
  const o = criarOrquestradorVoz({ storage: memoriaStorage() });
  const btn = {
    dataset: {},
    _attrs: {},
    setAttribute(k, v) {
      this._attrs[k] = v;
    },
    querySelector() {
      return { textContent: "" };
    }
  };
  pintarBotaoVoz(/** @type {any} */ (btn), o);
  assert.equal(btn.dataset.voiceState, ESTADO_VOZ.DESATIVADA);
  o.ativarComGesto();
  pintarBotaoVoz(/** @type {any} */ (btn), o);
  assert.equal(btn.dataset.voiceState, ESTADO_VOZ.ATIVA);
  assert.equal(btn.dataset.voiceUnlocked, "1");
});
