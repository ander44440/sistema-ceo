/**
 * Ciclo de vida do Job — P0-2 / ARQ-017 §6.
 * PENDING → DISPATCHED → RUNNING → RESULT → VERIFICATION → COMPLETED
 * (ou FAILED / NEEDS_CORRECTION). Dispatcher não decide COMPLETED.
 */

import {
  ehEstadoJob,
  ehEstadoJobTerminal,
  validarTransicaoJob
} from "./dominio.js";

/** Timeout default para ausência de resultado após dispatched/running (ms). */
export const TIMEOUT_RESULTADO_MS = 2 * 60 * 60 * 1000; // 2h

/**
 * @param {object} job
 * @param {string} de
 * @param {string} para
 * @param {object} [meta]
 */
export function anexarHistoricoCiclo(job, de, para, meta = {}) {
  const hist = Array.isArray(job.historicoCiclo) ? [...job.historicoCiclo] : [];
  hist.push({
    em: meta.em || new Date().toISOString(),
    de,
    para,
    motivo: meta.motivo || null,
    actor: meta.actor || null,
    ...("detalhe" in meta ? { detalhe: meta.detalhe } : {})
  });
  return hist;
}

/**
 * Aplica transição legal e regista histórico (puro — não I/O).
 * @param {object} job
 * @param {string} novoEstado
 * @param {object} [extra]
 * @returns {{ ok: true, job: object } | { ok: false, mensagem: string }}
 */
export function aplicarTransicaoJob(job, novoEstado, extra = {}) {
  if (!job || typeof job !== "object" || typeof job.id !== "string") {
    return { ok: false, mensagem: "Job inválido." };
  }
  const de = String(job.estado || "");
  if (!ehEstadoJob(novoEstado)) {
    return { ok: false, mensagem: `Estado destino inválido: ${novoEstado}.` };
  }
  const t = validarTransicaoJob(de, novoEstado);
  if (!t.ok) return t;

  const agora = extra.em || new Date().toISOString();
  const proximo = {
    ...job,
    ...extra.patch,
    estado: novoEstado,
    historicoCiclo: anexarHistoricoCiclo(job, de, novoEstado, {
      em: agora,
      motivo: extra.motivo || null,
      actor: extra.actor || null,
      detalhe: extra.detalhe
    })
  };

  if (novoEstado === "running" && !proximo.iniciadoEm) {
    proximo.iniciadoEm = agora;
  }
  if (novoEstado === "dispatched" && !proximo.despachadoEm) {
    proximo.despachadoEm = agora;
  }
  if (novoEstado === "result" && extra.resultado != null) {
    proximo.resultado = extra.resultado;
    proximo.resultadoEm = agora;
  }
  if (extra.resultado != null && novoEstado !== "result") {
    proximo.resultado = extra.resultado;
  }
  if (
    novoEstado === "completed" ||
    novoEstado === "failed" ||
    novoEstado === "cancelled"
  ) {
    proximo.concluidoEm = agora;
  }
  if (novoEstado === "failed" && extra.falha) {
    proximo.falha = Object.freeze({ ...extra.falha });
  }
  if (novoEstado === "needs_correction" && extra.correcao) {
    proximo.correcao = Object.freeze({ ...extra.correcao });
  }
  if (extra.verificacao) {
    proximo.verificacao = Object.freeze({ ...extra.verificacao });
  }

  return { ok: true, job: proximo };
}

/** Handoff ao Dispatcher — NÃO é sucesso. */
export function marcarDespachado(job, opts = {}) {
  return aplicarTransicaoJob(job, "dispatched", {
    actor: opts.actor || "dispatcher",
    motivo: opts.motivo || "handoff_dispatcher"
  });
}

/** Executor iniciou trabalho. */
export function marcarRunning(job, opts = {}) {
  return aplicarTransicaoJob(job, "running", {
    actor: opts.actor || "executor",
    motivo: opts.motivo || "execucao_iniciada"
  });
}

/**
 * Executor devolve evidência — estado RESULT (nunca COMPLETED aqui).
 * @param {object} job
 * @param {unknown} resultado
 * @param {object} [opts]
 */
export function registrarResultadoBruto(job, resultado, opts = {}) {
  if (resultado == null || (typeof resultado === "string" && !resultado.trim())) {
    return {
      ok: false,
      mensagem: "Resultado vazio — execução sem evidência não fecha o Job."
    };
  }
  let actual = job;
  if (actual.estado === "pending" || actual.estado === "dispatched") {
    const r = marcarRunning(actual, { actor: opts.actor || "executor" });
    if (!r.ok) return r;
    actual = r.job;
  }
  return aplicarTransicaoJob(actual, "result", {
    resultado,
    actor: opts.actor || "executor",
    motivo: opts.motivo || "resultado_bruto",
    detalhe: opts.detalhe
  });
}

/**
 * Extrai texto comparável do resultado.
 * @param {unknown} resultado
 */
export function textoDoResultado(resultado) {
  if (resultado == null) return "";
  if (typeof resultado === "string") return resultado.trim();
  if (typeof resultado === "object") {
    const o = /** @type {Record<string, unknown>} */ (resultado);
    for (const k of ["resumo", "mensagem", "evidencia", "texto", "status"]) {
      if (typeof o[k] === "string" && String(o[k]).trim()) {
        return String(o[k]).trim();
      }
    }
    try {
      return JSON.stringify(resultado);
    } catch {
      return String(resultado);
    }
  }
  return String(resultado);
}

/**
 * Critério de conclusão: objectivo vs resultado observado.
 * @param {object} job
 * @param {object} [opts]
 * @returns {{ ok: boolean, motivo: string, detalhes: object }}
 */
export function avaliarCriterioConclusao(job, opts = {}) {
  const objetivo = String(
    opts.objetivo || job.criterioConclusao || job.titulo || job.descricao || ""
  ).trim();
  const texto = textoDoResultado(job.resultado);
  const statusExecutor =
    job.resultado &&
    typeof job.resultado === "object" &&
    /** @type {Record<string, unknown>} */ (job.resultado).status
      ? String(/** @type {Record<string, unknown>} */ (job.resultado).status)
      : null;

  if (!texto) {
    return {
      ok: false,
      motivo: "resultado_ausente",
      detalhes: { objetivo, texto }
    };
  }

  if (
    /\b(handoff|despacho iniciado|execu[cç][aã]o iniciada|monitorando|vig[ií]lia|em andamento)\b/i.test(
      texto
    ) &&
    texto.length < 120
  ) {
    return {
      ok: false,
      motivo: "resultado_nao_e_entrega",
      detalhes: { objetivo, texto }
    };
  }

  if (statusExecutor === "falhou" || statusExecutor === "failed") {
    return {
      ok: false,
      motivo: "executor_reportou_falha",
      detalhes: { objetivo, texto, statusExecutor }
    };
  }

  if (statusExecutor === "parcial" || statusExecutor === "partial") {
    return {
      ok: false,
      motivo: "execucao_parcial",
      detalhes: { objetivo, texto, statusExecutor }
    };
  }

  if (typeof opts.criterioFn === "function") {
    const r = opts.criterioFn(job, { objetivo, texto });
    if (r && typeof r === "object" && "ok" in r) {
      return {
        ok: r.ok === true,
        motivo: r.motivo || (r.ok ? "criterio_ok" : "criterio_falhou"),
        detalhes: { objetivo, texto, ...(r.detalhes || {}) }
      };
    }
    return {
      ok: r === true,
      motivo: r === true ? "criterio_ok" : "criterio_falhou",
      detalhes: { objetivo, texto }
    };
  }

  if (
    job.resultado &&
    typeof job.resultado === "object" &&
    (/** @type {Record<string, unknown>} */ (job.resultado).status === "sucesso" ||
      /** @type {Record<string, unknown>} */ (job.resultado).status === "ok") &&
    (typeof /** @type {Record<string, unknown>} */ (job.resultado).evidencia ===
      "string" ||
      typeof /** @type {Record<string, unknown>} */ (job.resultado).resumo ===
        "string")
  ) {
    // Evidência estruturada ainda tem de cobrir o objectivo quando há tokens
    const tokensObj = objetivo
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{M}/gu, "")
      .split(/[^a-z0-9]+/i)
      .filter((w) => w.length >= 4)
      .slice(0, 8);
    const ev = textoDoResultado(job.resultado);
    const baseEv = ev
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{M}/gu, "");
    if (tokensObj.length === 0 && ev.length >= 8) {
      return {
        ok: true,
        motivo: "evidencia_estruturada",
        detalhes: { objetivo, texto: ev }
      };
    }
    const hitsEv = tokensObj.filter((tok) => baseEv.includes(tok));
    if (tokensObj.length > 0 && hitsEv.length / tokensObj.length >= 0.34) {
      return {
        ok: true,
        motivo: "evidencia_estruturada",
        detalhes: { objetivo, texto: ev, hits: hitsEv }
      };
    }
    // status sucesso sem cobrir objectivo → correção, não completed
  }

  const tokens = objetivo
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .split(/[^a-z0-9]+/i)
    .filter((w) => w.length >= 4)
    .slice(0, 8);
  const base = texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");

  if (tokens.length === 0) {
    return {
      ok: texto.length >= 16,
      motivo: texto.length >= 16 ? "evidencia_minima" : "evidencia_insuficiente",
      detalhes: { objetivo, texto }
    };
  }

  const hits = tokens.filter((tok) => base.includes(tok));
  const cobertura = hits.length / tokens.length;
  if (cobertura >= 0.34) {
    return {
      ok: true,
      motivo: "cobertura_objetivo",
      detalhes: { objetivo, texto, hits, cobertura }
    };
  }

  return {
    ok: false,
    motivo: "objetivo_nao_atendido",
    detalhes: { objetivo, texto, hits, cobertura, tokens }
  };
}

/**
 * VERIFICATION: RESULT → COMPLETED | NEEDS_CORRECTION | FAILED.
 * Único caminho canónico para COMPLETED.
 * @param {object} job — estado `result`
 * @param {object} [opts]
 */
export function verificarResultadoJob(job, opts = {}) {
  if (!job || job.estado !== "result") {
    return {
      ok: false,
      mensagem: `Verificação exige estado result (actual: ${job?.estado}).`
    };
  }

  const avaliacao = avaliarCriterioConclusao(job, opts);
  const agora = new Date().toISOString();

  if (avaliacao.ok) {
    return aplicarTransicaoJob(job, "completed", {
      actor: opts.actor || "ceo_verificacao",
      motivo: "verificacao_positiva",
      verificacao: {
        ok: true,
        em: agora,
        motivo: avaliacao.motivo,
        detalhes: avaliacao.detalhes
      }
    });
  }

  const falhaDura =
    avaliacao.motivo === "resultado_ausente" ||
    avaliacao.motivo === "executor_reportou_falha" ||
    opts.forcarFailed === true;

  if (falhaDura) {
    return aplicarTransicaoJob(job, "failed", {
      actor: opts.actor || "ceo_verificacao",
      motivo: avaliacao.motivo,
      falha: {
        motivo: avaliacao.motivo,
        etapa: "VERIFICATION",
        evidencia: textoDoResultado(job.resultado) || null,
        impacto: opts.impacto || "objectivo_nao_cumprido",
        podeRetentar: true,
        proximaAcao: "corrigir_e_retomar_ou_cancelar",
        detalhes: avaliacao.detalhes
      },
      verificacao: {
        ok: false,
        em: agora,
        motivo: avaliacao.motivo,
        detalhes: avaliacao.detalhes
      }
    });
  }

  return aplicarTransicaoJob(job, "needs_correction", {
    actor: opts.actor || "ceo_verificacao",
    motivo: avaliacao.motivo,
    correcao: {
      motivo: avaliacao.motivo,
      etapa: "VERIFICATION",
      evidencia: textoDoResultado(job.resultado) || null,
      impacto: opts.impacto || "resultado_insuficiente",
      podeRetentar: true,
      proximaAcao: "ajustar_entrega_e_retomar",
      detalhes: avaliacao.detalhes
    },
    verificacao: {
      ok: false,
      em: agora,
      motivo: avaliacao.motivo,
      detalhes: avaliacao.detalhes
    }
  });
}

/**
 * Executor reporta erro → FAILED com motivo estruturado.
 */
export function marcarFalhaExecucao(job, falha, opts = {}) {
  let actual = job;
  if (actual.estado === "pending") {
    const d = marcarDespachado(actual, { actor: opts.actor || "sistema" });
    if (d.ok) actual = d.job;
  }
  if (actual.estado === "dispatched") {
    const r = marcarRunning(actual, { actor: opts.actor || "executor" });
    if (r.ok) actual = r.job;
  }
  return aplicarTransicaoJob(actual, "failed", {
    actor: opts.actor || "executor",
    motivo: falha?.motivo || "falha_execucao",
    falha: {
      motivo: falha?.motivo || "falha_execucao",
      etapa: falha?.etapa || "RUNNING",
      evidencia: falha?.evidencia || null,
      impacto: falha?.impacto || "execucao_interrompida",
      podeRetentar: falha?.podeRetentar !== false,
      proximaAcao: falha?.proximaAcao || "diagnosticar_e_retentar",
      detalhes: falha?.detalhes || null
    },
    resultado: falha?.evidencia || falha?.motivo || job.resultado || null
  });
}

/**
 * Ausência de resultado após timeout — FAILED explícito (nunca COMPLETED).
 */
export function avaliarAusenciaResultado(job, opts = {}) {
  const agora = opts.agora ? new Date(opts.agora) : new Date();
  const timeoutMs = opts.timeoutMs ?? TIMEOUT_RESULTADO_MS;
  const ref = job.iniciadoEm || job.despachadoEm || job.criadoEm || null;
  if (!ref) {
    return {
      ok: false,
      aplicavel: false,
      mensagem: "Sem timestamp de referência."
    };
  }
  const estado = job.estado;
  if (estado !== "dispatched" && estado !== "running" && estado !== "pending") {
    return { ok: true, aplicavel: false, job };
  }
  const elapsed = agora.getTime() - new Date(ref).getTime();
  if (elapsed < timeoutMs) {
    return {
      ok: true,
      aplicavel: false,
      aguarda: true,
      restanteMs: timeoutMs - elapsed,
      job
    };
  }

  const falha = marcarFalhaExecucao(
    job,
    {
      motivo: "resultado_ausente_timeout",
      etapa: estado === "running" ? "RUNNING" : "DISPATCHED",
      evidencia: null,
      impacto: "execucao_sem_retorno",
      podeRetentar: true,
      proximaAcao: "re-despachar_ou_cancelar",
      detalhes: { timeoutMs, elapsedMs: elapsed, estadoAntes: estado }
    },
    { actor: opts.actor || "observador_timeout" }
  );
  return { ...falha, aplicavel: true, timeout: true };
}

/** NEEDS_CORRECTION → RUNNING (retoma controlada). */
export function retomarCorrecao(job, opts = {}) {
  if (!job || job.estado !== "needs_correction") {
    return {
      ok: false,
      mensagem: `Retoma exige needs_correction (actual: ${job?.estado}).`
    };
  }
  return aplicarTransicaoJob(job, "running", {
    actor: opts.actor || "ceo",
    motivo: opts.motivo || "retoma_apos_correcao"
  });
}

/** Pipeline: resultado bruto → verificação → estado final. */
export function processarResultadoComVerificacao(job, resultado, opts = {}) {
  const reg = registrarResultadoBruto(job, resultado, opts);
  if (!reg.ok) return reg;
  return verificarResultadoJob(reg.job, opts);
}

/** Consulta segura do ciclo. */
export function resumirCicloVidaJob(job) {
  if (!job || typeof job !== "object") {
    return { ok: false, mensagem: "Job inválido." };
  }
  return {
    ok: true,
    id: job.id,
    estado: job.estado,
    terminal: ehEstadoJobTerminal(job.estado),
    titulo: job.titulo || null,
    resultado: job.resultado ?? null,
    verificacao: job.verificacao ?? null,
    falha: job.falha ?? null,
    correcao: job.correcao ?? null,
    historicoCiclo: Array.isArray(job.historicoCiclo) ? job.historicoCiclo : [],
    criadoEm: job.criadoEm || null,
    despachadoEm: job.despachadoEm || null,
    iniciadoEm: job.iniciadoEm || null,
    resultadoEm: job.resultadoEm || null,
    concluidoEm: job.concluidoEm || null
  };
}
