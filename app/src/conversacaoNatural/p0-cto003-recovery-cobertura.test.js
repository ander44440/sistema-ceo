/**
 * Correcção B — CTO-003 OR recovery: cobertura mínima de regressão.
 * Não altera COMANDO_SOBRE_JOB nem léxicos de recovery.
 */
import assert from "node:assert/strict";
import { test, beforeEach } from "node:test";
import {
  deveInterceptarOperacional,
  executarInterceptacaoOperacional
} from "./interceptacaoOperacional.js";
import {
  ehComandoRecuperacaoOperacional,
  MOTIVO_JOB_ALVO_AUSENTE,
  MOTIVO_OBJETIVO_AUSENTE_JOB_ALVO
} from "./recuperacaoJob.js";
import { ehComandoSobreJobActivo } from "./estadoOperacional.js";
import { executiveEngine } from "../executiveEngine/index.js";
import { criarPublicadorFilaMemoria } from "../motorExecucao/ponteParecerJob.js";
import { resetStoreContinuidadePadrao } from "../continuidadeGate/integracaoConversa.js";

const OBJETIVO_ALVO =
  "Corrigir o outdoor lateral do MG2 conforme spec.";

const JOB_ALVO = {
  id: "JOB-000201",
  estado: "needs_correction",
  titulo: "Corrigir outdoor",
  objetivo: OBJETIVO_ALVO,
  projeto: "prj-mg2",
  projetoNome: "Motoboy Game 2",
  criadoEm: "2026-08-07T01:00:00.000Z"
};

const VERBOS_A = [
  "continue",
  "retoma",
  "retomar",
  "prossiga",
  "prosseguir",
  "despache"
];

function estadoAberto(job = JOB_ALVO) {
  return {
    operacaoAberta: true,
    requerRecuperacao: true,
    modoOperacional: "recuperar",
    jobActivo: {
      id: job.id,
      titulo: job.titulo || job.id,
      estado: job.estado
    },
    sinais: {
      pending: 0,
      running: 0,
      failed: 0,
      dispatcher: false,
      handoff: false,
      agentErro: false,
      gatePendente: 0
    }
  };
}

function infraFila(seedJob) {
  const fila = criarPublicadorFilaMemoria();
  /** @type {Record<string, object[]>} */
  const buckets = {
    pending: [],
    dispatched: [],
    running: [],
    result: [],
    needs_correction: seedJob ? [seedJob] : [],
    completed: [],
    failed: []
  };
  /** @type {object[]} */
  const capturados = [];
  return {
    capturados,
    publicarJob: async (pedido) => {
      capturados.push({ ...pedido });
      const j = await fila.publicarJob(pedido);
      const est = j.estado || "pending";
      (buckets[est] ||= []).push(j);
      return j;
    },
    listarPorEstado: async (est) => buckets[est] || [],
    obterJob: async (id) => {
      const chave = String(id || "").toUpperCase();
      return (
        Object.values(buckets)
          .flat()
          .find((j) => String(j.id || "").toUpperCase() === chave) || null
      );
    }
  };
}

function depsEe(f) {
  return {
    publicarJob: f.publicarJob,
    listarPorEstado: f.listarPorEstado,
    obterJob: f.obterJob,
    leitoresConsciencia: {
      F1: async () =>
        f.listarPorEstado
          ? [
              ...(await f.listarPorEstado("needs_correction")),
              ...(await f.listarPorEstado("pending"))
            ]
          : [],
      F2: async () => [],
      F3: async () => [],
      F4: async () => ({ estado: "activo" }),
      F5: async () => ({ estado: "ocioso", emCurso: false }),
      F6: async () => ({ estado: "ocioso", ocupado: false }),
      F7: async () => ({ disponivel: false, alertas: 0 }),
      F8: async () => ({ id: "prj-mg2", nome: "Motoboy Game 2" })
    }
  };
}

beforeEach(() => {
  resetStoreContinuidadePadrao();
  executiveEngine.reiniciarAcompanhamentoParaTestes();
});

test("A unit: exclusivos recovery passam deveInterceptar com op. aberta", () => {
  for (const v of VERBOS_A) {
    assert.equal(ehComandoRecuperacaoOperacional(v), true, v);
    assert.equal(
      deveInterceptarOperacional({
        texto: v,
        estadoOperacional: estadoAberto(),
        jobs: [JOB_ALVO],
        missaoActiva: { id: "prj-mg2", nome: "Motoboy Game 2" }
      }),
      true,
      v
    );
  }
});

test("A EE: exclusivos recovery → CTO-003 + Job filho + parentJobId", async () => {
  for (const v of VERBOS_A) {
    resetStoreContinuidadePadrao();
    executiveEngine.reiniciarAcompanhamentoParaTestes();
    const f = infraFila(JOB_ALVO);
    executiveEngine.registarAcompanhamentoJob(JOB_ALVO, {});
    const out = await executiveEngine.executar(v, depsEe(f));

    assert.equal(out.dados?.interceptacaoOperacional, "CTO-003", v);
    assert.equal(out.dados?.classificacaoEvitada, true, v);
    assert.equal(out.modo, "interceptacao_operacional", v);
    assert.equal(out.dados?.encaminhamento?.destino, "motor_execucao", v);
    assert.equal(f.capturados.length, 1, `publicado ${v}`);
    assert.equal(f.capturados[0].parentJobId, "JOB-000201", v);
    assert.equal(f.capturados[0].objetivo, OBJETIVO_ALVO, v);
    assert.equal(out.dados?.motor?.publicado, true, v);
  }
});

test("B: Pode prosseguir. NÃO CTO-003 / NÃO recovery", () => {
  const texto = "Pode prosseguir.";
  assert.equal(ehComandoRecuperacaoOperacional(texto), false);
  assert.equal(ehComandoSobreJobActivo(texto), false);
  assert.equal(
    deveInterceptarOperacional({
      texto,
      estadoOperacional: estadoAberto(),
      jobs: [JOB_ALVO]
    }),
    false
  );
});

test("B EE: Pode prosseguir. sem Gate → sem interceptacao_operacional", async () => {
  const f = infraFila(JOB_ALVO);
  executiveEngine.registarAcompanhamentoJob(JOB_ALVO, {});
  const out = await executiveEngine.executar("Pode prosseguir.", depsEe(f));
  assert.notEqual(out.dados?.interceptacaoOperacional, "CTO-003");
  assert.notEqual(out.modo, "interceptacao_operacional");
  assert.equal(f.capturados.length, 0);
});

test("C: estado/cancelar/pausar — CTO-003, não recovery", () => {
  for (const v of ["estado", "cancelar", "pausar"]) {
    assert.equal(ehComandoSobreJobActivo(v), true, v);
    assert.equal(ehComandoRecuperacaoOperacional(v), false, v);
    assert.equal(
      deveInterceptarOperacional({
        texto: v,
        estadoOperacional: estadoAberto(),
        jobs: [JOB_ALVO]
      }),
      true,
      v
    );
  }
});

test("D: despacha o JOB existente → CTO-003, recovery false, continuidade, sem filho", async () => {
  const texto = "despacha o JOB-000201";
  assert.equal(ehComandoSobreJobActivo(texto), true);
  assert.equal(ehComandoRecuperacaoOperacional(texto), false);
  assert.equal(
    deveInterceptarOperacional({
      texto,
      estadoOperacional: estadoAberto(),
      jobs: [JOB_ALVO],
      missaoActiva: { id: "prj-mg2", nome: "Motoboy Game 2" }
    }),
    true
  );

  const f = infraFila(JOB_ALVO);
  executiveEngine.registarAcompanhamentoJob(JOB_ALVO, {});
  const out = await executiveEngine.executar(texto, depsEe(f));

  assert.equal(out.dados?.interceptacaoOperacional, "CTO-003");
  assert.equal(out.dados?.classificacaoEvitada, true);
  assert.equal(out.dados?.continuidadeJobId, true);
  assert.equal(out.dados?.destino, "continuidade_job_id");
  assert.notEqual(out.dados?.motor?.publicado, true);
  assert.equal(f.capturados.length, 0);
  assert.match(String(out.mensagem || ""), /JOB-000201/);
});

test("E: sem operação aberta — retoma/continue/prossiga não CTO-003", async () => {
  const estadoFechado = {
    operacaoAberta: false,
    requerRecuperacao: false,
    modoOperacional: null,
    jobActivo: null,
    sinais: {
      pending: 0,
      running: 0,
      failed: 0,
      dispatcher: false,
      handoff: false,
      agentErro: false,
      gatePendente: 0
    }
  };
  for (const v of ["retoma", "continue", "prossiga"]) {
    assert.equal(
      deveInterceptarOperacional({
        texto: v,
        estadoOperacional: estadoFechado,
        jobs: []
      }),
      false,
      v
    );
  }

  // EE: sem Jobs + Dispatcher ocioso → operação fechada → sem CTO-003 / sem Job filho
  resetStoreContinuidadePadrao();
  executiveEngine.reiniciarAcompanhamentoParaTestes();
  for (const v of ["retoma", "continue", "prossiga"]) {
    const f = infraFila(null);
    const out = await executiveEngine.executar(v, {
      publicarJob: f.publicarJob,
      listarPorEstado: async () => [],
      listarJobsEmAcompanhamento: async () => [],
      obterJob: async () => null,
      missaoActiva: null,
      leitoresConsciencia: {
        F1: async () => [],
        F2: async () => [],
        F3: async () => [],
        F4: async () => ({ estado: "ocioso" }),
        F5: async () => ({ estado: "ocioso", emCurso: false }),
        F6: async () => ({ estado: "ocioso", ocupado: false }),
        F7: async () => ({ disponivel: false, alertas: 0 }),
        F8: async () => ({ id: null, nome: null })
      }
    });
    assert.notEqual(out.dados?.interceptacaoOperacional, "CTO-003", v);
    assert.equal(f.capturados.length, 0, v);
    assert.notEqual(out.dados?.motor?.publicado, true, v);
  }
});

test("F: op. aberta + alvo sem objetivo → recovery fail-closed, sem Job filho", async () => {
  const alvoSemObj = {
    id: "JOB-000077",
    estado: "needs_correction",
    titulo: "legado sem objetivo",
    descricao: "texto legado"
  };
  const capturados = [];
  const out = await executarInterceptacaoOperacional({
    texto: "retoma",
    estadoOperacional: estadoAberto(alvoSemObj),
    jobs: [alvoSemObj],
    deps: {
      jobs: [alvoSemObj],
      obterJob: async (id) =>
        String(id).toUpperCase() === "JOB-000077" ? alvoSemObj : null,
      publicarJob: async (pedido) => {
        capturados.push(pedido);
        return { id: "JOB-NOVO", estado: "pending", ...pedido };
      },
      conduzirMotor: async (parecer, motorDeps) => {
        const spec = parecer.acao.job;
        const job = await motorDeps.publicarJob({
          titulo: spec.titulo,
          descricao: spec.descricao,
          objetivo: spec.objetivo,
          parentJobId: spec.parentJobId
        });
        return { publicado: true, job };
      }
    }
  });

  // Envelope CTO-003 mantém modo interceptacao_*; falha fica em dados.
  assert.equal(out.dados?.interceptacaoOperacional, "CTO-003");
  assert.equal(out.dados?.classificacaoEvitada, true);
  assert.equal(out.dados?.recuperacaoBloqueada, true);
  assert.equal(out.dados?.motivo, MOTIVO_OBJETIVO_AUSENTE_JOB_ALVO);
  assert.equal(out.dados?.motor?.publicado, false);
  assert.equal(capturados.length, 0);
});

test("F: continue + op. aberta sem Job-alvo → fail-closed, sem Job filho", async () => {
  const f = infraFila(null);
  const out = await executarInterceptacaoOperacional({
    texto: "continue",
    estadoOperacional: {
      operacaoAberta: true,
      requerRecuperacao: true,
      modoOperacional: "recuperar",
      jobActivo: null,
      sinais: {
        pending: 0,
        running: 0,
        failed: 0,
        dispatcher: false,
        handoff: false,
        agentErro: false,
        gatePendente: 0
      }
    },
    jobs: [],
    deps: {
      jobs: [],
      obterJob: async () => null,
      publicarJob: f.publicarJob,
      conduzirMotor: async (parecer, motorDeps) => {
        const spec = parecer.acao.job;
        const job = await motorDeps.publicarJob({
          titulo: spec.titulo,
          objetivo: spec.objetivo,
          parentJobId: spec.parentJobId
        });
        return { publicado: true, job };
      }
    }
  });
  assert.equal(out.dados?.interceptacaoOperacional, "CTO-003");
  assert.equal(out.dados?.recuperacaoBloqueada, true);
  assert.equal(out.dados?.motivo, MOTIVO_JOB_ALVO_AUSENTE);
  assert.equal(out.dados?.motor?.publicado, false);
  assert.equal(f.capturados.length, 0);
});
