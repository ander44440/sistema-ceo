/**
 * CTO-003 — Interceptação Operacional (pré-classificador).
 * Status: HOMOLOGADO — Baseline referência oficial v1.2 (06/08/2026).
 * INVARIANTE: imediatamente após Continuidade Gate; antes de VCA / CSC / Classificador / CN.
 * Critério: com operação aberta, comando operacional NÃO chega ao classificador.
 */

import {
  ehComandoSobreJobActivo,
  extrairEstadoOperacional,
  montarAckRecuperacao
} from "./estadoOperacional.js";
import { agregarEstadoExecutivo } from "../conscienciaOperacional/agregarEstado.js";
import { criarLeitoresConscienciaPadrao } from "../conscienciaOperacional/leitoresPadrao.js";
import { conduzirTrabalhoExecutivoC3 } from "../classificadorIntencao/integracaoNucleo.js";
import { ID_POR_CLASSE } from "../classificadorIntencao/dominio.js";
import {
  ehPedidoContinuidadeMissao,
  ehPedidoRelatoEncerramento,
  ehAutorizacaoExplicitaCriarJob,
  ehReferenciaExplicitaJobId,
  normalizarTexto
} from "../classificadorIntencao/regras.js";
import {
  filtrarJobsPorMissaoActiva,
  ehEstadoAcompanhamentoAberto
} from "../motorExecucao/acompanhamentoJob.js";
import { obterCoaAtivo } from "../executiveEngine/coaSessao.js";

/**
 * @param {object} [opts]
 * @param {string} [opts.texto]
 * @param {ReadonlyArray} [opts.historico]
 * @param {object} [opts.estadoOperacional]
 * @param {object} [opts.lastroConsciencia]
 * @returns {boolean}
 */
export function deveInterceptarOperacional(opts = {}) {
  const texto = String(opts.texto || "").trim();
  if (!texto || !ehComandoSobreJobActivo(texto)) return false;
  const t = normalizarTexto(texto);
  // Teste 3: continuidade de missão com resultado ≠ comando C3 sobre Job
  if (ehPedidoContinuidadeMissao(t)) return false;
  // Relato/encerramento (três campos) ≠ comando C3 — segue memória encerrar_dia
  if (ehPedidoRelatoEncerramento(t)) return false;

  let missaoActiva = opts.missaoActiva || null;
  if (!missaoActiva) {
    try {
      const coa =
        typeof opts.obterCoaAtivo === "function"
          ? opts.obterCoaAtivo()
          : obterCoaAtivo();
      missaoActiva = coa ? { id: coa.id, nome: coa.nome } : null;
    } catch {
      missaoActiva = null;
    }
  }

  // Criar/publicar Job novo: não tratar como comando sobre Job activo
  // quando a missão activa ainda não tem Job operacional próprio.
  // Excepção: referência explícita a JOB-ID → continuidade (nunca bypass de criação).
  if (ehAutorizacaoExplicitaCriarJob(t) && !ehReferenciaExplicitaJobId(t)) {
    const candidatos = Array.isArray(opts.jobs) ? opts.jobs : [];
    const daMissao = filtrarJobsPorMissaoActiva(candidatos, missaoActiva);
    const temJobMissao = daMissao.some((j) =>
      ehEstadoAcompanhamentoAberto(j?.estado || j?.status)
    );
    if (!temJobMissao) return false;
  }

  const estado = extrairEstadoOperacional({
    historico: opts.historico,
    lastroConsciencia: opts.lastroConsciencia,
    estadoOperacional: opts.estadoOperacional,
    jobs: opts.jobs,
    consultaEstado: opts.consultaEstado,
    missaoActiva
  });
  return Boolean(estado.operacaoAberta);
}

/**
 * Consulta leve ao Estado Executivo (fila) — sem passar pelo classificador.
 * @param {object} [deps]
 */
export async function lerEstadoOperacionalPreClassificador(deps = {}) {
  const store = deps.storeContinuidade || null;
  const leitores =
    deps.leitoresConsciencia ||
    criarLeitoresConscienciaPadrao({ storeContinuidade: store });
  const consulta = await agregarEstadoExecutivo({
    leitores,
    agora: deps.agoraConsciencia
  });

  let jobs = [];
  let jobsCompleted = [];
  let jobsFailed = [];
  const listar = deps.listarPorEstado;
  if (typeof listar === "function") {
    try {
      const estadosAbertos = [
        "pending",
        "dispatched",
        "running",
        "result",
        "needs_correction"
      ];
      /** @type {object[]} */
      const abertos = [];
      for (const est of estadosAbertos) {
        abertos.push(...((await listar(est)) || []));
      }
      jobs = abertos;
      jobsCompleted = (await listar("completed")) || [];
      jobsFailed = (await listar("failed")) || [];
    } catch {
      /* fila opcional */
    }
  } else {
    try {
      const {
        listarJobsPorEstado,
        listarJobsNaoTerminais
      } = await import("../executiveEngine/filaCliente.js");
      try {
        jobs = await listarJobsNaoTerminais();
      } catch {
        jobs = [
          ...(await listarJobsPorEstado("pending")),
          ...(await listarJobsPorEstado("dispatched")),
          ...(await listarJobsPorEstado("running")),
          ...(await listarJobsPorEstado("result")),
          ...(await listarJobsPorEstado("needs_correction"))
        ];
      }
      jobsCompleted = await listarJobsPorEstado("completed");
      jobsFailed = await listarJobsPorEstado("failed");
    } catch {
      /* browser/test sem fila */
    }
  }

  let missaoActiva = deps.missaoActiva || null;
  if (!missaoActiva) {
    try {
      const coa =
        typeof deps.obterCoaAtivo === "function"
          ? deps.obterCoaAtivo()
          : obterCoaAtivo();
      missaoActiva = coa ? { id: coa.id, nome: coa.nome } : null;
    } catch {
      missaoActiva = null;
    }
  }

  const jobsMissao = filtrarJobsPorMissaoActiva(jobs, missaoActiva);
  const completedMissao = filtrarJobsPorMissaoActiva(
    jobsCompleted,
    missaoActiva
  );
  const failedMissao = filtrarJobsPorMissaoActiva(jobsFailed, missaoActiva);

  const estadoOperacional = extrairEstadoOperacional({
    consultaEstado: consulta.estado,
    historico: deps.historico || [],
    jobs: [...jobsMissao, ...failedMissao, ...completedMissao],
    jobsCompleted: completedMissao,
    jobsFailed: failedMissao,
    missaoActiva,
    lastroConsciencia: {
      contagens: {
        jobsPendentes: consulta.estado.jobsPendentes.length,
        jobsEmExecucao: consulta.estado.jobsEmExecucao.length,
        gatesPendentes: consulta.estado.gatesPendentes.length,
        jobsFalhado: failedMissao.length
      },
      factosOficiais: []
    }
  });
  return { consulta, estadoOperacional, jobsMissao, missaoActiva };
}

/**
 * Resposta operacional sem classificador / sem CN deliberativa.
 * @param {object} opts
 * @param {string} opts.texto
 * @param {object} opts.estadoOperacional
 * @param {object} [opts.deps] — deps Motor (publicarJob, conduzirMotor, …)
 */
export async function executarInterceptacaoOperacional(opts = {}) {
  const texto = String(opts.texto || "").trim();
  const estadoOp = opts.estadoOperacional;
  const deps = { ...(opts.deps || {}) };

  const classificacaoForcada = {
    classe: "trabalho_executivo",
    idClasse: "C3",
    destino: "motor_execucao",
    confianca: 1,
    precisaClarificacao: false,
    razoes: ["CTO-003: interceptação operacional pré-classificador"]
  };

  let mensagem = montarAckRecuperacao(estadoOp, texto);
  let dadosMotor = null;
  let ok = true;

  try {
    if (typeof deps.conduzirMotor === "function" || deps.publicarJob) {
      const resultado = await conduzirTrabalhoExecutivoC3(
        texto,
        classificacaoForcada,
        deps
      );
      mensagem = resultado.mensagem || mensagem;
      dadosMotor = resultado.dados || null;
      ok = resultado.ok !== false;
    }
  } catch (err) {
    ok = false;
    mensagem =
      montarAckRecuperacao(estadoOp, texto) +
      ` Falha ao despachar: ${err && err.message ? err.message : "erro"}.`;
  }

  return {
    ok,
    mensagem,
    intencao: {
      id: "publicar_job_fila",
      capacidade: "motor_execucao",
      destino: "motor_execucao",
      confianca: 1,
      precisaClarificacao: false
    },
    capacidade: "motor_execucao",
    dados: {
      ...(dadosMotor && typeof dadosMotor === "object" ? dadosMotor : {}),
      classificacao: classificacaoForcada,
      encaminhamento: {
        destino: "motor_execucao",
        ok: true,
        idClasse: ID_POR_CLASSE.trabalho_executivo
      },
      interceptacaoOperacional: "CTO-003",
      estadoOperacional: estadoOp,
      motorAcionado: true,
      mreInvocado: false,
      classificacaoEvitada: true
    },
    origem: "executiveEngine",
    modo: "interceptacao_operacional"
  };
}
