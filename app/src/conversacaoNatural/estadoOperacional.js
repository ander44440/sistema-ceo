/**
 * CTO-003 — Persistência do Estado Operacional.
 * Status: HOMOLOGADO / ENCERRADO — Baseline (06/08/2026).
 * Congelado: sem refinamentos adicionais sem novas evidências de uso real.
 * Enquanto existir operação aberta (Job / dispatcher / handoff / agent erro),
 * a interação permanece ligada ao mesmo fluxo — não regressa a deliberação.
 * Refinamento comportamental — sem CAP nova, sem redesign do EE.
 */

import {
  filtrarJobsPorMissaoActiva,
  jobPertenceAMissaoActiva
} from "../motorExecucao/acompanhamentoJob.js";

/** Estados de Job que mantêm operação / acompanhamento aberto (≠ terminal). */
export const ESTADOS_OPERACAO_ABERTA = Object.freeze([
  "pending",
  "dispatched",
  "running",
  "result",
  "needs_correction",
  "dispatcher",
  "handoff"
]);

/** Alias explícito para Teste 1 — acompanhamento contínuo. */
export const ESTADOS_ACOMPANHAMENTO_OPERACIONAL = Object.freeze([
  "pending",
  "dispatched",
  "running",
  "result",
  "needs_correction"
]);

/**
 * @param {string} [estado]
 * @returns {boolean}
 */
export function ehEstadoOperacaoAbertaJob(estado) {
  const e = String(estado || "").toLowerCase();
  return ESTADOS_ACOMPANHAMENTO_OPERACIONAL.includes(/** @type {*} */ (e));
}

/** Comandos sobre o Job activo (REGRA 3) */
const COMANDO_SOBRE_JOB =
  /\b(enviar|envie|reenviar|reenvir|repita|repetir|tente\s+de\s+novo|tentar\s+novamente|tenta\s+de\s+novo|force?|for[cç]a(?:r)?|cancelar|pausar|continuar|continua|estado|despacha(?:r)?|force?\s+o\s+envio|ha\s+jobs|h[aá]\s+jobs)\b/i;

/**
 * @typedef {object} EstadoOperacional
 * @property {boolean} operacaoAberta
 * @property {boolean} requerRecuperacao
 * @property {"executar"|"recuperar"|null} modoOperacional
 * @property {{ id: string, titulo: string, estado: string }|null} jobActivo
 * @property {{
 *   pending: number,
 *   running: number,
 *   failed: number,
 *   dispatcher: boolean,
 *   handoff: boolean,
 *   agentErro: boolean,
 *   gatePendente: number
 * }} sinais
 */

/**
 * @param {object} [opts]
 * @param {object} [opts.lastroConsciencia]
 * @param {object} [opts.estadoOperacional] — já derivado (inject)
 * @param {ReadonlyArray<{papel?: string, texto?: string}>} [opts.historico]
 * @param {object} [opts.consultaEstado] — EstadoExecutivoAtual parcial
 * @param {ReadonlyArray<object>} [opts.jobs] — jobs brutos opcionais
 * @param {{ id?: string|null, nome?: string|null }|null} [opts.missaoActiva]
 * @returns {EstadoOperacional}
 */
export function extrairEstadoOperacional(opts = {}) {
  if (opts.estadoOperacional && typeof opts.estadoOperacional === "object") {
    return normalizarEstado(opts.estadoOperacional);
  }

  const lastro = opts.lastroConsciencia || {};
  const contagens = lastro.contagens || {};
  const consulta = opts.consultaEstado || lastro.estadoExecutivo || null;
  let jobs = Array.isArray(opts.jobs) ? opts.jobs : [];
  if (opts.missaoActiva) {
    jobs = filtrarJobsPorMissaoActiva(jobs, opts.missaoActiva);
  }

  let pending = Number(contagens.jobsPendentes) || 0;
  let running = Number(contagens.jobsEmExecucao) || 0;
  let failed = Number(contagens.jobsFalhado || contagens.jobsFailed) || 0;
  let gatePendente = Number(contagens.gatesPendentes) || 0;
  let dispatcher = false;
  let handoff = false;
  let agentErro = false;
  /** @type {{ id: string, titulo: string, estado: string }|null} */
  let jobActivo = null;

  if (consulta && typeof consulta === "object") {
    if (Array.isArray(consulta.jobsPendentes)) {
      pending = Math.max(pending, consulta.jobsPendentes.length);
      if (!jobActivo && consulta.jobsPendentes[0]) {
        jobActivo = resumoJob(consulta.jobsPendentes[0], "pending");
      }
    }
    if (Array.isArray(consulta.jobsEmExecucao)) {
      running = Math.max(running, consulta.jobsEmExecucao.length);
      if (!jobActivo && consulta.jobsEmExecucao[0]) {
        jobActivo = resumoJob(consulta.jobsEmExecucao[0], "running");
      }
    }
    if (consulta.dispatcher) {
      const d = String(consulta.dispatcher.estado || "").toLowerCase();
      dispatcher = d === "activo" || d === "ativo" || d === "erro" || d === "pendente";
    }
    if (consulta.agent) {
      const a = String(consulta.agent.estado || "").toLowerCase();
      agentErro = a === "erro" || a === "error" || a === "failed";
    }
    if (Array.isArray(consulta.gatesPendentes)) {
      gatePendente = Math.max(gatePendente, consulta.gatesPendentes.length);
    }
  }

  for (const j of jobs) {
    const est = String(j?.estado || j?.status || "").toLowerCase();
    if (est === "pending" || est === "queued") {
      pending += 1;
      if (!jobActivo) jobActivo = resumoJob(j, "pending");
    } else if (
      est === "running" ||
      est === "dispatched" ||
      est === "result" ||
      est === "needs_correction"
    ) {
      running += 1;
      if (est === "dispatched") handoff = true;
      if (!jobActivo) jobActivo = resumoJob(j, est);
    } else if (est === "failed" || est === "retry") {
      failed += 1;
      if (!jobActivo) jobActivo = resumoJob(j, est);
    }
  }

  const factos = Array.isArray(lastro.factosOficiais)
    ? lastro.factosOficiais.join("\n")
    : "";
  if (/Job pendente/i.test(factos) && pending === 0) pending = 1;
  if (/Job em execução/i.test(factos) && running === 0) running = 1;
  if (/Job em handoff|dispatched/i.test(factos)) {
    handoff = true;
    if (running === 0) running = 1;
  }
  if (/Job com resultado|aguarda verificação/i.test(factos) && running === 0) {
    running = 1;
  }
  if (/Job em correção|needs_correction/i.test(factos) && running === 0) {
    running = 1;
  }
  if (/\b(handoff|Dispatcher)\b/i.test(factos)) handoff = true;
  if (/\bAgent\s+(ocupado|erro|falh)/i.test(factos)) {
    if (/erro|falh/i.test(factos)) agentErro = true;
  }
  if (/\bdispatcher\b.*\berro\b|\berro\b.*\bdispatcher\b/i.test(factos)) {
    dispatcher = true;
  }

  const doHistorico = sinaisDoHistorico(opts.historico);
  /** @type {typeof doHistorico} */
  let hist = { ...doHistorico };
  if (opts.missaoActiva && hist.jobActivo) {
    const listaBruta = Array.isArray(opts.jobs) ? opts.jobs : [];
    const naMissao = listaBruta.find(
      (j) => j && String(j.id || "").toUpperCase() === String(hist.jobActivo.id || "").toUpperCase()
    );
    // jobs já filtrados pela missão: se o ID do histórico não está na lista, é fantasma (ex.: 070)
    if (
      !naMissao ||
      !jobPertenceAMissaoActiva(naMissao, opts.missaoActiva, {
        idsPermitidos: []
      })
    ) {
      hist = {
        ...hist,
        jobActivo: null,
        pending: 0,
        running: 0,
        handoff: false,
        dispatcher: false
      };
    }
  }

  pending = Math.max(pending, hist.pending);
  running = Math.max(running, hist.running);
  failed = Math.max(failed, hist.failed);
  if (hist.dispatcher) dispatcher = true;
  if (hist.handoff) handoff = true;
  if (hist.agentErro) agentErro = true;
  if (!jobActivo && hist.jobActivo) jobActivo = hist.jobActivo;

  if (lastro.estadoOperacional && typeof lastro.estadoOperacional === "object") {
    const emb = lastro.estadoOperacional;
    if (emb.jobActivo && !jobActivo) {
      if (opts.missaoActiva) {
        const j = (Array.isArray(opts.jobs) ? opts.jobs : []).find(
          (x) =>
            x &&
            String(x.id || "").toUpperCase() ===
              String(emb.jobActivo.id || "").toUpperCase()
        );
        if (
          j &&
          jobPertenceAMissaoActiva(j, opts.missaoActiva, { idsPermitidos: [] })
        ) {
          jobActivo = emb.jobActivo;
        }
      } else {
        jobActivo = emb.jobActivo;
      }
    }
    if (emb.sinais) {
      pending = Math.max(pending, Number(emb.sinais.pending) || 0);
      running = Math.max(running, Number(emb.sinais.running) || 0);
      failed = Math.max(failed, Number(emb.sinais.failed) || 0);
      if (emb.sinais.dispatcher) dispatcher = true;
      if (emb.sinais.handoff) handoff = true;
      if (emb.sinais.agentErro) agentErro = true;
    }
  }

  // Falha residual: só conta se for mais recente que completed, ou recuperação no histórico
  const completedJobs = [
    ...jobs.filter((j) =>
      /^(completed|complete|done)$/i.test(String(j?.estado || j?.status || ""))
    ),
    ...(Array.isArray(opts.jobsCompleted) ? opts.jobsCompleted : [])
  ];
  const failedJobs = jobs.filter((j) =>
    /^(failed|retry)$/i.test(String(j?.estado || j?.status || ""))
  );
  const tsFailed = maxInstanteJobs(failedJobs);
  const tsCompleted = maxInstanteJobs(completedJobs);
  const falhaTerminalRecente =
    failed > 0 &&
    (doHistorico.recuperacao === true ||
      (tsFailed > 0 && (tsCompleted === 0 || tsFailed > tsCompleted)));

  const requerRecuperacao =
    falhaTerminalRecente || agentErro || doHistorico.recuperacao;

  const operacaoAberta =
    pending > 0 ||
    running > 0 ||
    falhaTerminalRecente ||
    dispatcher ||
    handoff ||
    agentErro;

  const modoOperacional = operacaoAberta
    ? requerRecuperacao
      ? "recuperar"
      : "executar"
    : null;

  return Object.freeze({
    operacaoAberta,
    requerRecuperacao,
    modoOperacional,
    jobActivo: operacaoAberta ? jobActivo : null,
    sinais: Object.freeze({
      pending,
      running,
      failed,
      dispatcher,
      handoff,
      agentErro,
      gatePendente
    })
  });
}

/**
 * @param {object[]} lista
 * @returns {number}
 */
function maxInstanteJobs(lista) {
  let max = 0;
  for (const j of Array.isArray(lista) ? lista : []) {
    const t = Date.parse(
      String(j?.concluidoEm || j?.iniciadoEm || j?.criadoEm || "")
    );
    if (Number.isFinite(t) && t > max) max = t;
  }
  return max;
}

/**
 * @param {object} bruto
 * @returns {EstadoOperacional}
 */
function normalizarEstado(bruto) {
  const sinais = bruto.sinais || {};
  const operacaoAberta = Boolean(bruto.operacaoAberta);
  const requerRecuperacao = Boolean(bruto.requerRecuperacao);
  return Object.freeze({
    operacaoAberta,
    requerRecuperacao,
    modoOperacional:
      bruto.modoOperacional ||
      (operacaoAberta
        ? requerRecuperacao
          ? "recuperar"
          : "executar"
        : null),
    jobActivo: bruto.jobActivo || null,
    sinais: Object.freeze({
      pending: Number(sinais.pending) || 0,
      running: Number(sinais.running) || 0,
      failed: Number(sinais.failed) || 0,
      dispatcher: Boolean(sinais.dispatcher),
      handoff: Boolean(sinais.handoff),
      agentErro: Boolean(sinais.agentErro),
      gatePendente: Number(sinais.gatePendente) || 0
    })
  });
}

/**
 * @param {object} job
 * @param {string} estado
 */
function resumoJob(job, estado) {
  const id = String(job?.id || "").trim();
  if (!id) return null;
  return {
    id,
    titulo: String(job?.titulo || job?.title || id).trim() || id,
    estado
  };
}

/**
 * @param {ReadonlyArray<{papel?: string, texto?: string}>} [historico]
 */
function sinaisDoHistorico(historico) {
  const out = {
    pending: 0,
    running: 0,
    failed: 0,
    dispatcher: false,
    handoff: false,
    agentErro: false,
    recuperacao: false,
    jobActivo: null
  };
  if (!Array.isArray(historico) || !historico.length) return out;

  const recentes = historico.slice(-10);
  for (const t of recentes) {
    const txt = String(t?.texto || "");
    const m = txt.match(/\b(JOB-\d+)\b/i);
    if (m && !out.jobActivo) {
      let est = "pending";
      if (/running|em execução/i.test(txt)) est = "running";
      if (/dispatched|handoff/i.test(txt)) est = "dispatched";
      if (/needs_correction|correção/i.test(txt)) est = "needs_correction";
      if (/\bresult\b|aguarda verificação/i.test(txt)) est = "result";
      if (/failed|falh|erro/i.test(txt)) est = "failed";
      out.jobActivo = { id: m[1].toUpperCase(), titulo: m[1].toUpperCase(), estado: est };
    }
    if (/Job\s+JOB-\d+\s+criado\s+em\s+pending|em\s+pending/i.test(txt)) {
      out.pending = Math.max(out.pending, 1);
    }
    if (/Handoff\s+ao\s+Dispatcher|dispatched\s*[—\-]/i.test(txt)) {
      out.handoff = true;
      out.dispatcher = true;
      out.running = Math.max(out.running, 1);
    }
    if (/erro\s+(no\s+)?dispatch|dispatcher.*erro|agent\s+continua\s+com\s+e?r+o|AGENT\s+CONTINUA/i.test(txt)) {
      out.agentErro = true;
      out.recuperacao = true;
      out.failed = Math.max(out.failed, 1);
    }
    if (/falhou|failed|payload_proibido/i.test(txt) && /\bJOB-/i.test(txt)) {
      out.failed = Math.max(out.failed, 1);
      out.recuperacao = true;
    }
  }
  return out;
}

/**
 * REGRA 3 — ordem sobre o Job activo.
 * @param {string} [instrucao]
 */
export function ehComandoSobreJobActivo(instrucao) {
  const t = String(instrucao || "").trim();
  if (!t) return false;
  if (COMANDO_SOBRE_JOB.test(t)) return true;
  if (/^(estado|status)\??\.?$/i.test(t)) return true;
  return false;
}

/**
 * REGRA 4 — perguntas proibidas com operação aberta.
 * @param {string} [texto]
 */
export function ehPerguntaProibidaComOperacao(texto) {
  const t = String(texto || "");
  return (
    /mudámos\s+de\s+prioridade/i.test(t) ||
    /qual\s+[eé]\s+o\s+objetiv/i.test(t) ||
    /quer\s+deliberar/i.test(t) ||
    /É\s+isso\s*[—\-]\s*ou\s+mudámos/i.test(t)
  );
}

/**
 * Snapshot embutível no lastro (montarLastroParaNucleo).
 * @param {object} consulta — ConsultaEstadoExecutivo ou { estado }
 * @param {object} [extra]
 */
export function montarEstadoOperacionalNoLastro(consulta, extra = {}) {
  const estado = consulta?.estado || consulta || {};
  return extrairEstadoOperacional({
    consultaEstado: estado,
    jobs: extra.jobs,
    historico: extra.historico,
    lastroConsciencia: {
      contagens: {
        jobsPendentes: Array.isArray(estado.jobsPendentes)
          ? estado.jobsPendentes.length
          : 0,
        jobsEmExecucao: Array.isArray(estado.jobsEmExecucao)
          ? estado.jobsEmExecucao.length
          : 0,
        gatesPendentes: Array.isArray(estado.gatesPendentes)
          ? estado.gatesPendentes.length
          : 0,
        jobsFalhado: Number(extra.jobsFalhado) || 0
      },
      factosOficiais: extra.factosOficiais || []
    }
  });
}

/**
 * Ack curto de recuperação (CTO-003) — o quê / resultado / próximo.
 * @param {EstadoOperacional} estado
 * @param {string} [instrucao]
 */
export function montarAckRecuperacao(estado, instrucao = "") {
  const job = estado?.jobActivo;
  const id = job?.id ? ` ${job.id}` : "";
  if (/cancelar/i.test(instrucao)) {
    return `Cancelamento da operação${id} em curso.`;
  }
  if (/estado|status|ha\s+jobs|h[aá]\s+jobs/i.test(instrucao)) {
    const s = estado?.sinais || {};
    const partes = [];
    if (s.pending) partes.push(`${s.pending} pending`);
    if (s.running) partes.push(`${s.running} em execução`);
    if (s.failed) partes.push(`${s.failed} falhado`);
    if (job) partes.push(`activo: ${job.id} (${job.estado})`);
    return partes.length
      ? `Estado operacional: ${partes.join("; ")}.`
      : "Nenhuma operação aberta na fila.";
  }
  if (/reenviar|force?|tentar|despacha|enviar/i.test(instrucao)) {
    return `Recuperação: a reenviar a operação${id}.`;
  }
  return `Operação${id} em recuperação.`;
}

export { COMANDO_SOBRE_JOB };
