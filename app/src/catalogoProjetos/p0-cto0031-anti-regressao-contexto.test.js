/**
 * CTO-003.1 — anti-regressão de contexto (selecção explícita; sem volta silenciosa a MG2).
 */
import assert from "node:assert/strict";
import { test, beforeEach } from "node:test";
import {
  criarProjeto,
  obterProjetoAtivo,
  obterProjetoAtivoId,
  selecionarProjeto,
  selecionarProjetoPorRef,
  recarregarCatalogo,
  inicializarCatalogo
} from "./index.js";
import { atualizarAposInstrucao } from "../executiveMemory/index.js";
import { capacidadeProjetos } from "../executiveEngine/capacidades/projetos.js";
import { garantirProjetoParaNovaMissao } from "../executiveEngine/garantirProjetoNovaMissao.js";
import { conduzirTrabalhoExecutivoC3 } from "../classificadorIntencao/integracaoNucleo.js";

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

beforeEach(() => {
  resetCatalogo();
});

test("CTO-003.1 A: menção incidental motoboy/mg2 NÃO altera activo ALFA", () => {
  const alfa = activarAlfa();

  atualizarAposInstrucao({
    instrucao: "Só uma nota rápida sobre o Motoboy Game 2 e o MG2.",
    capacidade: "memoria",
    intencao: { id: "registrar_observacao" },
    ok: true,
    mensagem: "ok"
  });

  assert.equal(obterProjetoAtivoId(), alfa.id);
  assert.equal(obterProjetoAtivo()?.nome, "PROJETO TESTE ALFA");
});

test("CTO-003.1 B: capacidade projetos sem nome NÃO chama regressão a MG2", async () => {
  const alfa = activarAlfa();

  const out = await capacidadeProjetos.executar({
    instrucao: "Qual é o estado geral do trabalho?",
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

  assert.equal(out.ok, true);
  assert.equal(obterProjetoAtivoId(), alfa.id);
  assert.match(String(out.mensagem), /PROJETO TESTE ALFA/);
  assert.doesNotMatch(String(out.dados?.projeto || ""), /^Motoboy Game 2$/);
});

test("CTO-003.1 C: activo ALFA sobrevive a recarregarCatalogo", () => {
  const alfa = activarAlfa();
  atualizarAposInstrucao({
    instrucao: "mencionei mg2 sem trocar de contexto",
    capacidade: "conhecimento",
    ok: true,
    mensagem: "ok"
  });
  recarregarCatalogo();
  assert.equal(obterProjetoAtivoId(), alfa.id);
  assert.equal(obterProjetoAtivo()?.nome, "PROJETO TESTE ALFA");
});

test('CTO-003.1 D: selecionarProjetoPorRef({ nome: "game" }) NÃO selecciona MG2', () => {
  const alfa = activarAlfa();
  const sel = selecionarProjetoPorRef({ nome: "game" });
  assert.equal(sel, null);
  assert.equal(obterProjetoAtivoId(), alfa.id);
});

test('CTO-003.1 E: alias exacto "mg2" ainda selecciona Motoboy Game 2', () => {
  activarAlfa();
  const sel = selecionarProjetoPorRef({ nome: "mg2" });
  assert.ok(sel);
  assert.equal(sel.id, "prj-mg2");
  assert.equal(sel.nome, "Motoboy Game 2");
  assert.equal(obterProjetoAtivoId(), "prj-mg2");
});

test('CTO-003.1 F: "abrir projeto Motoboy Game 2" ainda selecciona MG2', async () => {
  activarAlfa();
  const out = await capacidadeProjetos.executar({
    instrucao: "abrir projeto Motoboy Game 2",
    memoria: () => ({
      projetoAtivo: { nome: "PROJETO TESTE ALFA" },
      projetosAtivos: [],
      decisoes: [],
      pendencias: [],
      proximasAcoes: [],
      ultimasAcoes: [],
      proximoPasso: null
    })
  });
  assert.equal(out.ok, true);
  assert.equal(obterProjetoAtivoId(), "prj-mg2");
  assert.equal(out.dados?.projeto, "Motoboy Game 2");
});

test("CTO-003.1 G: nome exacto Motoboy Game 2 selecciona MG2", () => {
  activarAlfa();
  const sel = selecionarProjetoPorRef({ nome: "Motoboy Game 2" });
  assert.equal(sel?.id, "prj-mg2");
});

test("CTO-003.1 H: C3 nova missão em projecto nomeado continua a criar/seleccionar", async () => {
  selecionarProjeto("prj-mg2");
  assert.equal(obterProjetoAtivoId(), "prj-mg2");

  const msg = `Quero iniciar uma nova missão no PROJETO TESTE ALFA.

Objetivo:
criar o arquivo executive/queue/cto0031-alfa.txt

Conteúdo exato:
CTO-003.1 ALFA

Execute essa missão e acompanhe até a conclusão.`;

  const garantido = garantirProjetoParaNovaMissao(msg);
  assert.equal(garantido.aplicado, true);
  assert.equal(garantido.nome, "PROJETO TESTE ALFA");
  assert.equal(obterProjetoAtivo()?.nome, "PROJETO TESTE ALFA");
  const idAlfa = obterProjetoAtivoId();

  // Isola o activo e re-corre o caminho C3 completo (C4 intacto)
  selecionarProjeto("prj-mg2");
  assert.equal(obterProjetoAtivoId(), "prj-mg2");

  let job = null;
  const out = await conduzirTrabalhoExecutivoC3(
    msg,
    { classe: "trabalho_executivo", confianca: 0.95, razaoCurta: "c3" },
    {
      conduzirMotor: async (_parecer, deps) => {
        job = {
          id: "JOB-CTO0031",
          estado: "pending",
          projeto: deps.projeto,
          projetoNome: deps.projetoNome
        };
        return { publicado: true, job, fluxoIniciado: true };
      }
    }
  );

  assert.equal(out.ok, true);
  assert.ok(job);
  assert.equal(job.projetoNome, "PROJETO TESTE ALFA");
  assert.equal(job.projeto, idAlfa);
  assert.notEqual(job.projeto, "prj-mg2");
  assert.equal(obterProjetoAtivoId(), idAlfa);
});
