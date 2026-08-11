/**
 * Calibração CTO — continuidade por conversa (abrir / encerrar).
 * Não altera domínio nem Centro; só a superfície conversacional da Memória.
 */
import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";

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
});

test("encerrar por conversa rejeita parcial (sem gravar)", async () => {
  const { inicializarCatalogo, selecionarProjeto, obterDiaExecutivo, obterUltimaContinuidade } =
    await import("../../catalogoProjetos/index.js");
  const { executiveEngine } = await import("../index.js");

  inicializarCatalogo();
  selecionarProjeto("prj-mg2");
  executiveEngine.inicializar();

  await executiveEngine.executar({ texto: "abrir o dia: Foco teste" });
  assert.equal(obterDiaExecutivo()?.status, "em_curso");

  const parcial = await executiveEngine.executar({
    texto: "encerrar o dia: Andou só isto"
  });
  assert.equal(parcial.ok, false);
  assert.match(parcial.mensagem || "", /três elementos/i);
  assert.equal(obterDiaExecutivo()?.status, "em_curso");
  assert.equal(obterUltimaContinuidade(), null);
});

test("encerrar completo grava; abrir reapresenta os três e retoma", async () => {
  const {
    inicializarCatalogo,
    selecionarProjeto,
    obterDiaExecutivo,
    obterUltimaContinuidade
  } = await import("../../catalogoProjetos/index.js");
  const { executiveEngine } = await import("../index.js");

  inicializarCatalogo();
  selecionarProjeto("prj-mg2");
  executiveEngine.inicializar();

  await executiveEngine.executar({ texto: "abrir o dia" });

  const fim = await executiveEngine.executar({
    texto: "encerrar o dia: Fez A | Fica B | Amanhã C"
  });
  assert.equal(fim.ok, true);
  assert.match(fim.mensagem || "", /O QUE ANDOU:\s*Fez A/i);
  assert.match(fim.mensagem || "", /O QUE FICA:\s*Fica B/i);
  assert.match(fim.mensagem || "", /PRÓXIMO PASSO DE AMANHÃ:\s*Amanhã C/i);
  assert.equal(obterDiaExecutivo()?.status, "encerrado");
  assert.equal(obterUltimaContinuidade()?.proximoPassoAmanha, "Amanhã C");

  const abrir = await executiveEngine.executar({ texto: "abrir o dia" });
  assert.equal(abrir.ok, true);
  assert.match(abrir.mensagem || "", /O QUE ANDOU:\s*Fez A/i);
  assert.match(abrir.mensagem || "", /O QUE FICA:\s*Fica B/i);
  assert.match(abrir.mensagem || "", /PRÓXIMO PASSO DE AMANHÃ:\s*Amanhã C/i);
  assert.match(abrir.mensagem || "", /Dia retomado/i);
  assert.equal(obterDiaExecutivo()?.status, "em_curso");
});
