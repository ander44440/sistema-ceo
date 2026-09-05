/**
 * Isolamento do projecto activo — fechar ≠ encerrar dia; F5 não reativa.
 */
import assert from "node:assert/strict";
import { test, beforeEach } from "node:test";
import {
  criarProjeto,
  obterProjeto,
  obterProjetoAtivo,
  obterProjetoAtivoId,
  limparProjetoAtivo,
  listarProjetos,
  selecionarProjeto,
  abrirDiaExecutivo,
  encerrarDiaExecutivo,
  registrarDecisao,
  recarregarCatalogo,
  inicializarCatalogo
} from "./index.js";
import {
  limparCoaAtivo,
  obterCoaAtivo,
  inicializarCoaSessao
} from "../executiveEngine/coaSessao.js";
import { STORAGE_KEY } from "./persistencia.js";

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
  recarregarCatalogo();
  inicializarCatalogo();
});

test("A–D: abrir ALFA → activo → fechar → null", () => {
  const p = criarProjeto({ nome: "PROJETO TESTE ALFA" });
  assert.ok(p?.id);
  assert.equal(obterProjetoAtivo()?.nome, "PROJETO TESTE ALFA");
  assert.equal(obterProjetoAtivoId(), p.id);
  assert.equal(obterCoaAtivo()?.nome, "PROJETO TESTE ALFA");

  limparProjetoAtivo();
  assert.equal(obterProjetoAtivoId(), null);
  assert.equal(obterProjetoAtivo(), null);
  assert.equal(obterCoaAtivo(), null);
});

test("limparCoaAtivo limpa o catálogo (deixou de ser no-op)", () => {
  criarProjeto({ nome: "PROJETO TESTE ALFA" });
  assert.ok(obterCoaAtivo());
  assert.equal(limparCoaAtivo(), null);
  assert.equal(obterProjetoAtivo(), null);
  assert.equal(obterCoaAtivo(), null);
});

test("E–F: após fechar, F5/boot (recarregarCatalogo) não reativa", () => {
  const p = criarProjeto({ nome: "PROJETO TESTE ALFA" });
  limparProjetoAtivo();
  assert.equal(obterProjetoAtivoId(), null);

  const raw = globalThis.localStorage.getItem(STORAGE_KEY);
  assert.ok(raw);
  const parsed = JSON.parse(raw);
  assert.equal(parsed.projetoAtivoId, null);

  // Simula F5
  recarregarCatalogo();
  inicializarCatalogo();
  inicializarCoaSessao();

  assert.equal(obterProjetoAtivoId(), null);
  assert.equal(obterProjetoAtivo(), null);
  assert.equal(obterCoaAtivo(), null);
  assert.ok(obterProjeto(p.id), "ALFA permanece no catálogo");
  assert.ok(
    listarProjetos().some((x) => x.id === p.id && x.nome === "PROJETO TESTE ALFA")
  );
});

test("G: histórico/decisões recuperáveis após fechar", () => {
  const p = criarProjeto({ nome: "PROJETO TESTE ALFA" });
  registrarDecisao("Decisão histórica ALFA", "teste");
  limparProjetoAtivo();
  assert.equal(obterProjetoAtivo(), null);

  const salvo = obterProjeto(p.id);
  assert.ok(salvo);
  assert.ok(
    (salvo.decisoes || []).some((d) => /Decisão histórica ALFA/.test(d.texto))
  );

  // recuperação explícita
  selecionarProjeto(p.id);
  assert.equal(obterProjetoAtivo()?.id, p.id);
});

test("H: encerrarDiaExecutivo NÃO limpa projetoAtivoId", () => {
  const p = criarProjeto({ nome: "PROJETO TESTE ALFA" });
  abrirDiaExecutivo({ intencao: "Testar continuidade" });
  const r = encerrarDiaExecutivo({
    oQueAndou: "Investigação",
    oQueFica: "Histórico",
    proximoPassoAmanha: "Retomar se pedido"
  });
  assert.equal(r.ok, true);
  assert.equal(obterProjetoAtivoId(), p.id);
  assert.equal(obterProjetoAtivo()?.nome, "PROJETO TESTE ALFA");
  assert.equal(obterCoaAtivo()?.id, p.id);
});

test("EE: após fechar, obterCoaAtivo não injecta ALFA como missão", async () => {
  criarProjeto({ nome: "PROJETO TESTE ALFA" });
  limparCoaAtivo();
  assert.equal(obterCoaAtivo(), null);
  const { executiveEngine } = await import("../executiveEngine/index.js");
  executiveEngine.inicializar();
  const out = await executiveEngine.executar(
    { texto: "Qual é o estado atual desta sessão?", historico: [] },
    {
      // não passar missaoActiva — EE deve cair em obterCoaAtivo() === null
      listarJobsEmAcompanhamento: async () => [],
      listarPorEstado: async () => [],
      publicarJob: async () => {
        throw new Error("não deve publicar");
      }
    }
  );
  assert.equal(obterCoaAtivo(), null);
  assert.doesNotMatch(String(out.mensagem || ""), /PROJETO TESTE ALFA/i);
});
