/**
 * CTO-003.1 P1 — capacidade projetos só troca activo com âncora explícita.
 */
import assert from "node:assert/strict";
import { test, beforeEach } from "node:test";
import {
  criarProjeto,
  obterProjetoAtivo,
  obterProjetoAtivoId,
  recarregarCatalogo,
  inicializarCatalogo
} from "../../catalogoProjetos/index.js";
import { capacidadeProjetos } from "./projetos.js";

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

function resetCatalogo() {
  globalThis.localStorage = criarStorage();
  recarregarCatalogo();
  inicializarCatalogo();
}

/** @returns {{ id: string, nome: string }} */
function activarAlfa() {
  const alfa = criarProjeto({ nome: "PROJETO TESTE ALFA" });
  assert.equal(obterProjetoAtivoId(), alfa.id);
  return alfa;
}

/**
 * @param {string} instrucao
 * @param {{ id: string, nome: string }} alfa
 */
async function executarProjetos(instrucao, alfa) {
  return capacidadeProjetos.executar({
    instrucao,
    memoria: () => ({
      projetoAtivo: { id: alfa.id, nome: alfa.nome },
      projetosAtivos: [{ id: alfa.id, nome: alfa.nome }],
      decisoes: [],
      pendencias: [],
      proximasAcoes: [],
      ultimasAcoes: [],
      proximoPasso: null
    })
  });
}

beforeEach(() => {
  resetCatalogo();
});

test("P1: menção incidental a MG2 NÃO troca — ALFA permanece", async () => {
  const alfa = activarAlfa();
  const out = await executarProjetos(
    "Continuo no ALFA; Motoboy Game 2 / MG2 / motoboy só como referência.",
    alfa
  );
  assert.equal(out.ok, true);
  assert.equal(obterProjetoAtivoId(), alfa.id);
  assert.equal(obterProjetoAtivo()?.nome, "PROJETO TESTE ALFA");
});

test("P1: consulta sobre MG2 NÃO troca — ALFA permanece", async () => {
  const alfa = activarAlfa();
  const out = await executarProjetos(
    "Qual o estado atual do Motoboy Game 2?",
    alfa
  );
  assert.equal(out.ok, true);
  assert.equal(obterProjetoAtivoId(), alfa.id);
  assert.equal(obterProjetoAtivo()?.nome, "PROJETO TESTE ALFA");
});

test('P1: "abrir projeto Motoboy Game 2" → troca para MG2', async () => {
  const alfa = activarAlfa();
  const out = await executarProjetos("abrir projeto Motoboy Game 2", alfa);
  assert.equal(out.ok, true);
  assert.equal(obterProjetoAtivoId(), "prj-mg2");
  assert.equal(out.dados?.projeto, "Motoboy Game 2");
});

test('P1: "ativar o COA MG2" → troca para MG2', async () => {
  const alfa = activarAlfa();
  const out = await executarProjetos("ativar o COA MG2", alfa);
  assert.equal(out.ok, true);
  assert.equal(obterProjetoAtivoId(), "prj-mg2");
  assert.equal(obterProjetoAtivo()?.nome, "Motoboy Game 2");
});

test('P1: "trocar para o projeto Motoboy Game 2" → troca para MG2', async () => {
  const alfa = activarAlfa();
  const out = await executarProjetos(
    "trocar para o projeto Motoboy Game 2",
    alfa
  );
  assert.equal(out.ok, true);
  assert.equal(obterProjetoAtivoId(), "prj-mg2");
  assert.equal(out.dados?.projeto, "Motoboy Game 2");
});

test("P1: ALFA permanece activo em casos não explícitos (lista + menção curta)", async () => {
  const alfa = activarAlfa();

  await executarProjetos("projeto Motoboy Game 2", alfa);
  assert.equal(obterProjetoAtivoId(), alfa.id);

  await executarProjetos("COA MG2", alfa);
  assert.equal(obterProjetoAtivoId(), alfa.id);

  await executarProjetos("listar projetos", alfa);
  assert.equal(obterProjetoAtivoId(), alfa.id);
  assert.equal(obterProjetoAtivo()?.nome, "PROJETO TESTE ALFA");
});
