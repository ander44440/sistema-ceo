/**
 * Testes PX-002 E2 — Orquestrador de Experiência de Voz.
 */

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  CHAVE_PREFERENCIA_VOZ,
  ESTADO_VOZ,
  criarOrquestradorVoz,
  criarPreferenciaVoz
} from "./index.js";

function memoriaStorage() {
  const map = new Map();
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => {
      map.set(k, String(v));
    },
    removeItem: (k) => {
      map.delete(k);
    },
    _map: map
  };
}

test("boot sem preferência → Desativada", () => {
  const o = criarOrquestradorVoz({ storage: memoriaStorage() });
  assert.equal(o.estado(), ESTADO_VOZ.DESATIVADA);
  assert.equal(o.preferenciaAtiva(), false);
  assert.equal(o.sessaoDesbloqueada(), false);
});

test("transição Desativada → Aguardando → Ativa (ativação)", () => {
  const o = criarOrquestradorVoz({ storage: memoriaStorage() });
  assert.equal(o.solicitarAtivacao().ok, true);
  assert.equal(o.estado(), ESTADO_VOZ.AGUARDANDO_AUTORIZACAO);
  assert.equal(o.confirmarAutorizacao().ok, true);
  assert.equal(o.estado(), ESTADO_VOZ.ATIVA);
  assert.equal(o.preferenciaAtiva(), true);
  assert.equal(o.sessaoDesbloqueada(), true);
});

test("cancelar autorização → Desativada", () => {
  const o = criarOrquestradorVoz({ storage: memoriaStorage() });
  o.solicitarAtivacao();
  assert.equal(o.cancelarAutorizacao().ok, true);
  assert.equal(o.estado(), ESTADO_VOZ.DESATIVADA);
  assert.equal(o.preferenciaAtiva(), false);
});

test("Ativa → Falando → Ativa", () => {
  const o = criarOrquestradorVoz({ storage: memoriaStorage() });
  o.ativarComGesto();
  assert.equal(o.iniciarFala().ok, true);
  assert.equal(o.estado(), ESTADO_VOZ.FALANDO);
  assert.equal(o.terminarFala().ok, true);
  assert.equal(o.estado(), ESTADO_VOZ.ATIVA);
});

test("interromper fala → Ativa", () => {
  const o = criarOrquestradorVoz({ storage: memoriaStorage() });
  o.ativarComGesto();
  o.iniciarFala();
  assert.equal(o.interromperFala().ok, true);
  assert.equal(o.estado(), ESTADO_VOZ.ATIVA);
});

test("Ativa → Ouvindo → Ativa", () => {
  const o = criarOrquestradorVoz({ storage: memoriaStorage() });
  o.ativarComGesto();
  assert.equal(o.iniciarEscuta().ok, true);
  assert.equal(o.estado(), ESTADO_VOZ.OUVINDO);
  assert.equal(o.terminarEscuta().ok, true);
  assert.equal(o.estado(), ESTADO_VOZ.ATIVA);
});

test("Falando → iniciarEscuta interrompe e ouve", () => {
  const o = criarOrquestradorVoz({ storage: memoriaStorage() });
  o.ativarComGesto();
  o.iniciarFala();
  assert.equal(o.iniciarEscuta().ok, true);
  assert.equal(o.estado(), ESTADO_VOZ.OUVINDO);
});

test("iniciarFala sem unlock falha", () => {
  const store = memoriaStorage();
  criarPreferenciaVoz(store).gravar(true);
  const o = criarOrquestradorVoz({ storage: store });
  assert.equal(o.estado(), ESTADO_VOZ.ATIVA);
  assert.equal(o.sessaoDesbloqueada(), false);
  assert.equal(o.iniciarFala().ok, false);
  assert.equal(o.desbloquearSessao().ok, true);
  assert.equal(o.iniciarFala().ok, true);
});

test("desativar a partir de Falando", () => {
  const o = criarOrquestradorVoz({ storage: memoriaStorage() });
  o.ativarComGesto();
  o.iniciarFala();
  assert.equal(o.desativar().ok, true);
  assert.equal(o.estado(), ESTADO_VOZ.DESATIVADA);
  assert.equal(o.preferenciaAtiva(), false);
  assert.equal(o.sessaoDesbloqueada(), false);
});

test("Erro → tentarNovamente → Ativa", () => {
  const o = criarOrquestradorVoz({ storage: memoriaStorage() });
  o.ativarComGesto();
  o.iniciarFala();
  assert.equal(o.marcarErro("falha TTS").ok, true);
  assert.equal(o.estado(), ESTADO_VOZ.ERRO);
  assert.ok(o.mensagemErro());
  assert.equal(o.tentarNovamente().ok, true);
  assert.equal(o.estado(), ESTADO_VOZ.ATIVA);
  assert.equal(o.sessaoDesbloqueada(), true);
});

test("Erro com preferência off → Desativada no retry", () => {
  const o = criarOrquestradorVoz({ storage: memoriaStorage() });
  o.solicitarAtivacao();
  o.marcarErro("perm negada");
  o.desativar();
  assert.equal(o.estado(), ESTADO_VOZ.DESATIVADA);
});

test("fila pendente + consumir", () => {
  const store = memoriaStorage();
  criarPreferenciaVoz(store).gravar(true);
  const o = criarOrquestradorVoz({ storage: store });
  assert.equal(o.enfileirarPendente("Próximo gesto: validar.").ok, true);
  assert.equal(o.textoPendente(), "Próximo gesto: validar.");
  const c = o.consumirPendente();
  assert.equal(c.ok, true);
  assert.equal(c.texto, "Próximo gesto: validar.");
  assert.equal(o.textoPendente(), null);
  assert.equal(o.sessaoDesbloqueada(), true);
});

test("persistência: enabled sobrevive a novo orquestrador", () => {
  const store = memoriaStorage();
  const a = criarOrquestradorVoz({ storage: store });
  a.ativarComGesto();
  const raw = store.getItem(CHAVE_PREFERENCIA_VOZ);
  assert.ok(raw);
  const parsed = JSON.parse(raw);
  assert.equal(parsed.enabled, true);
  assert.ok(parsed.updatedAt);

  const b = criarOrquestradorVoz({ storage: store });
  assert.equal(b.estado(), ESTADO_VOZ.ATIVA);
  assert.equal(b.preferenciaAtiva(), true);
  assert.equal(b.sessaoDesbloqueada(), false, "unlock não persiste");
});

test("persistência: desativar grava enabled=false", () => {
  const store = memoriaStorage();
  const a = criarOrquestradorVoz({ storage: store });
  a.ativarComGesto();
  a.desativar();
  const b = criarOrquestradorVoz({ storage: store });
  assert.equal(b.estado(), ESTADO_VOZ.DESATIVADA);
  assert.equal(b.preferenciaAtiva(), false);
});

test("transições inválidas rejeitadas", () => {
  const o = criarOrquestradorVoz({ storage: memoriaStorage() });
  assert.equal(o.confirmarAutorizacao().ok, false);
  assert.equal(o.terminarFala().ok, false);
  assert.equal(o.iniciarEscuta().ok, false);
  o.ativarComGesto();
  assert.equal(o.solicitarAtivacao().ok, false);
});

test("podeFalarAutomaticamente só com Ativa+unlock", () => {
  const store = memoriaStorage();
  criarPreferenciaVoz(store).gravar(true);
  const o = criarOrquestradorVoz({ storage: store });
  assert.equal(o.snapshot().podeFalarAutomaticamente, false);
  o.desbloquearSessao();
  assert.equal(o.snapshot().podeFalarAutomaticamente, true);
});
