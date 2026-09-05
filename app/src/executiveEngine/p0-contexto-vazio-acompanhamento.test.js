/**
 * P0 — contexto vazio: sem missão/projeto activo, não anexar fila global.
 * Preserva acompanhamento quando há missão (D / Correção 7).
 */
import assert from "node:assert/strict";
import { test, beforeEach } from "node:test";
import { executiveEngine } from "./index.js";
import {
  criarProjeto,
  inicializarCatalogo,
  limparProjetoAtivo,
  obterProjetoAtivoId,
  recarregarCatalogo,
  selecionarProjeto
} from "../catalogoProjetos/index.js";
import { limparCoaAtivo, obterCoaAtivo } from "./coaSessao.js";
import { reiniciarAutoridadeDelegadaParaTestes } from "../autoridadeDelegada/autoridadeDelegada.js";

const TEXTO = "Qual é o estado atual desta sessão?";

const JOB_093 = {
  id: "JOB-000093",
  estado: "needs_correction",
  titulo: "TESTE C9",
  projeto: "prj-orphaned-c9",
  resultado: { resumo: "Criado teste-c9", evidencia: "executive/queue/c9.txt" },
  verificacao: { motivo: "homologação C9 incompleta" }
};

const JOB_095 = {
  id: "JOB-000095",
  estado: "needs_correction",
  titulo: "Decide A/B/C",
  projeto: "Motoboy Game 2",
  resultado: { decisao: "C", resumo: "Decisão C" }
};

const JOB_TEC = {
  id: "JOB-TEC-001",
  estado: "running",
  titulo: "endpoint saúde",
  objetivo: "Implementar GET /health no servidor Node.",
  projeto: "prj-tecnico"
};

const JOB_TEC_NC = {
  id: "JOB-000074",
  estado: "needs_correction",
  titulo: "HOMOLOGACAO TESTE 2",
  projeto: "Motoboy Game 2",
  resultado: { resumo: "Ficheiro homologacao", evidencia: "x.txt" },
  verificacao: { motivo: "objetivo_nao_atendido" }
};

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

function resetVazio() {
  globalThis.localStorage = criarStorage();
  recarregarCatalogo();
  inicializarCatalogo();
  limparProjetoAtivo();
  limparCoaAtivo();
  reiniciarAutoridadeDelegadaParaTestes();
  executiveEngine.reiniciarAcompanhamentoParaTestes();
}

function idsEm(texto) {
  const m = String(texto || "").match(/\bJOB-[0-9A-Z-]+\b/gi) || [];
  return [...new Set(m.map((x) => x.toUpperCase()))].sort();
}

/**
 * @param {object[]} jobs
 * @param {{ missaoActiva?: object|null }} [opts]
 */
async function perguntarEstado(jobs, opts = {}) {
  const byId = new Map(jobs.map((j) => [j.id, j]));
  const resumos = jobs.map((j) => ({
    id: j.id,
    titulo: j.titulo || j.id,
    status: j.estado || j.status
  }));
  let publicacoes = 0;
  const out = await executiveEngine.executar(
    { texto: TEXTO, historico: [] },
    {
      missaoActiva:
        opts.missaoActiva !== undefined ? opts.missaoActiva : null,
      listarJobsEmAcompanhamento: async () => jobs.slice(),
      listarJobs: async () => jobs.slice(),
      listarPorEstado: async (est) => {
        if (!est) return jobs.slice();
        return jobs.filter((j) => String(j.estado || j.status) === String(est));
      },
      obterJob: async (id) => byId.get(String(id)) || null,
      leitoresConsciencia: {
        F1: async () => resumos.filter((r) => r.status === "pending"),
        F2: async () =>
          resumos.filter((r) =>
            ["dispatched", "running", "result", "needs_correction"].includes(
              String(r.status)
            )
          ),
        F3: async () => [],
        F4: async () => null,
        F5: async () => null,
        F6: async () => null,
        F7: async () => null,
        F8: async () => null
      },
      publicarJob: async () => {
        publicacoes += 1;
        throw new Error("P0: não deve publicar");
      },
      conduzirMotor: async () => ({
        ok: false,
        mensagem: "P0: motor bloqueado",
        dados: {}
      })
    }
  );
  return { out, publicacoes };
}

beforeEach(() => {
  resetVazio();
});

test("A: fila vazia + sem missão → sem acompanhamento / sem Job IDs", async () => {
  assert.equal(obterProjetoAtivoId(), null);
  assert.equal(obterCoaAtivo(), null);
  const { out, publicacoes } = await perguntarEstado([]);
  assert.equal(idsEm(out.mensagem).length, 0);
  assert.equal(out.dados?.acompanhamentoOperacional?.mensagens?.length || 0, 0);
  assert.equal(publicacoes, 0);
  assert.equal(obterProjetoAtivoId(), null);
});

test("B: Jobs técnicos + sem missão → nenhum Job no discurso", async () => {
  const { out, publicacoes } = await perguntarEstado([JOB_TEC, JOB_TEC_NC]);
  assert.equal(idsEm(out.mensagem).length, 0);
  assert.doesNotMatch(String(out.mensagem), /JOB-TEC-001|JOB-000074/);
  assert.equal(out.dados?.acompanhamentoOperacional?.mensagens?.length || 0, 0);
  assert.equal(publicacoes, 0);
  assert.equal(obterProjetoAtivoId(), null);
});

test("C: 093+095+técnicos + sem missão → nenhum Job no discurso", async () => {
  const { out, publicacoes } = await perguntarEstado([
    JOB_093,
    JOB_095,
    JOB_TEC,
    JOB_TEC_NC
  ]);
  assert.equal(idsEm(out.mensagem).length, 0);
  assert.doesNotMatch(String(out.mensagem), /JOB-000093|JOB-000095/);
  assert.equal(out.dados?.acompanhamentoOperacional?.mensagens?.length || 0, 0);
  assert.equal(publicacoes, 0);
  assert.equal(obterProjetoAtivoId(), null);
  // Residual P0.1 (não patch nesta etapa): F2/listar ainda pode armar CTO-003
  // via «estado» + operacaoAberta global — sem anexar linhas Job ao discurso.
  if (out.dados?.interceptacaoOperacional === "CTO-003") {
    assert.equal(
      idsEm(out.mensagem).length,
      0,
      "CTO-003 residual não deve reintroduzir Job IDs via anexo"
    );
  }
});

test("C-residual: sem missão + Jobs F2 → CTO-003 pode armar (evidência)", async () => {
  const { out, publicacoes } = await perguntarEstado([
    JOB_093,
    JOB_095,
    JOB_TEC
  ]);
  assert.equal(publicacoes, 0);
  assert.equal(idsEm(out.mensagem).length, 0);
  // Documenta residual: intercept possível sem anexo de Jobs
  assert.ok(
    out.dados?.interceptacaoOperacional === "CTO-003" ||
      out.modo === "consulta_estado" ||
      out.modo === "capacidade",
    `modo/intercept inesperado: ${out.modo}/${out.dados?.interceptacaoOperacional}`
  );
});

test("D: missão ALFA + Job ALFA + órfãos → só ALFA no acompanhamento", async () => {
  const alfa = criarProjeto({ nome: "PROJETO TESTE ALFA" });
  selecionarProjeto(alfa.id);
  const missao = { id: alfa.id, nome: alfa.nome };
  const jobAlfa = {
    id: "JOB-ALFA-001",
    estado: "running",
    titulo: "trabalho ALFA",
    objetivo: "Conduzir o trabalho ALFA até ao artefacto combinado.",
    projeto: alfa.id,
    projetoNome: "PROJETO TESTE ALFA"
  };
  const jobs = [JOB_093, JOB_095, JOB_TEC, JOB_TEC_NC, jobAlfa];

  const obs = await executiveEngine.observarAcompanhamentosTurno({
    missaoActiva: missao,
    listarJobsEmAcompanhamento: async () => jobs.slice(),
    obterJob: async (id) => jobs.find((j) => j.id === id) || null
  });
  const idsObs = idsEm((obs.mensagens || []).map((m) => m.texto || "").join("\n"));
  assert.deepEqual(idsObs, ["JOB-ALFA-001"]);
  assert.ok(!idsObs.includes("JOB-000093"));
  assert.ok(!idsObs.includes("JOB-000095"));
});

test("P0: observarAcompanhamentosTurno sem missão → obs vazio (motivo)", async () => {
  const obs = await executiveEngine.observarAcompanhamentosTurno({
    missaoActiva: null,
    listarJobsEmAcompanhamento: async () => [JOB_093, JOB_095, JOB_TEC]
  });
  assert.equal(obs.mensagens.length, 0);
  assert.equal(obs.resultados.length, 0);
  assert.equal(obs.motivo, "sem_missao_activa_sem_acompanhamento_global");
});
