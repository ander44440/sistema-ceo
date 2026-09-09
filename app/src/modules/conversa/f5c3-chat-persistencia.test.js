/**
 * F5-C3 — transcript conversacional sobrevive a refresh e isola por COA.
 */
import assert from "node:assert/strict";
import { test, beforeEach } from "node:test";
import {
  criarProjeto,
  inicializarCatalogo,
  listarProjetos,
  obterProjetoAtivoId,
  recarregarCatalogo,
  selecionarProjeto
} from "../../catalogoProjetos/index.js";
import { VERSAO, gravarDocumento } from "../../catalogoProjetos/persistencia.js";
import {
  acrescentarMensagem,
  atualizarMensagem,
  criarMensagem,
  definirContextoConversacional,
  descartarHistoricosEmMemoria,
  listarMensagens,
  obterContextoConversacional,
  reiniciarStoreConversaParaTestes
} from "./store.js";
import { carregarBucketChat } from "./persistenciaChat.js";

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

function resetAmbiente() {
  globalThis.localStorage = criarStorage();
  gravarDocumento({
    versao: VERSAO,
    projetoAtivoId: null,
    empresaAtivaId: null,
    empresas: [],
    projetos: [],
    gabinete: {}
  });
  recarregarCatalogo();
  reiniciarStoreConversaParaTestes();
  inicializarCatalogo();
}

/** Refresh: perde RAM do chat; localStorage (gabinete+chat) permanece. */
function simularRefresh() {
  descartarHistoricosEmMemoria();
  recarregarCatalogo();
}

beforeEach(() => {
  resetAmbiente();
});

test("F5-C3: refresh recupera transcript do COA activo", () => {
  const a = criarProjeto({ nome: "COA F5-C3 Alfa" });
  acrescentarMensagem(criarMensagem({ papel: "usuario", texto: "olá A" }));
  const ph = acrescentarMensagem(
    criarMensagem({ papel: "ceo", texto: "…", estado: "pendente" })
  );
  atualizarMensagem(ph.id, { texto: "resposta A", estado: "pronta" });
  assert.equal(listarMensagens().length, 2);
  assert.equal(listarMensagens()[1].texto, "resposta A");

  // Placeholder pendente não deve ficar no disco
  const disco = carregarBucketChat(a.id);
  assert.equal(disco.every((m) => m.estado !== "pendente"), true);
  assert.equal(disco.length, 2);

  simularRefresh();
  assert.equal(obterProjetoAtivoId(), a.id);
  assert.equal(obterContextoConversacional(), a.id);
  const msgs = listarMensagens();
  assert.equal(msgs.length, 2);
  assert.equal(msgs[0].texto, "olá A");
  assert.equal(msgs[1].texto, "resposta A");

  acrescentarMensagem(criarMensagem({ papel: "usuario", texto: "continua" }));
  assert.equal(listarMensagens().length, 3);
  assert.equal(listarMensagens()[2].texto, "continua");
});

test("F5-C3: isolamento A/B após refresh e retorno a A", () => {
  const a = criarProjeto({ nome: "COA F5-C3 A" });
  acrescentarMensagem(criarMensagem({ papel: "usuario", texto: "só A" }));
  acrescentarMensagem(criarMensagem({ papel: "ceo", texto: "eco A" }));

  const b = criarProjeto({ nome: "COA F5-C3 B" });
  assert.equal(obterContextoConversacional(), b.id);
  assert.deepEqual(
    listarMensagens().map((m) => m.texto),
    []
  );
  acrescentarMensagem(criarMensagem({ papel: "usuario", texto: "só B" }));
  assert.equal(listarMensagens()[0].texto, "só B");

  simularRefresh();
  // Activo é B (último seleccionado)
  const activo = obterProjetoAtivoId();
  assert.equal(activo, b.id);
  assert.equal(listarMensagens().map((m) => m.texto).join("|"), "só B");

  selecionarProjeto(a.id);
  assert.equal(obterContextoConversacional(), a.id);
  assert.deepEqual(
    listarMensagens().map((m) => m.texto),
    ["só A", "eco A"]
  );

  selecionarProjeto(b.id);
  assert.deepEqual(
    listarMensagens().map((m) => m.texto),
    ["só B"]
  );
});

test("F5-C3: histórico recuperado é o mesmo objecto usado por listarMensagens", () => {
  criarProjeto({ nome: "COA F5-C3 Nucleo" });
  acrescentarMensagem(criarMensagem({ papel: "usuario", texto: "p1" }));
  acrescentarMensagem(criarMensagem({ papel: "ceo", texto: "r1" }));
  simularRefresh();
  const hist = listarMensagens().map((m) => ({
    papel: m.papel,
    texto: m.texto
  }));
  assert.deepEqual(hist, [
    { papel: "usuario", texto: "p1" },
    { papel: "ceo", texto: "r1" }
  ]);
  // Simula enviarAoNucleo: hist passado ao núcleo
  assert.equal(hist.length, 2);
  void listarProjetos;
  void definirContextoConversacional;
});
