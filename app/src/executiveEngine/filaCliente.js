/**
 * Cliente da Fila de Execução oficial do MVP (REQ-045 / REQ-060 / IMP-060 E4/E5).
 *
 * Publicar / listar usam `ceoQueueApiUrl` → plugin Vite / companion → executive/queue/.
 * Nunca usam VITE_CEO_API_BASE (Railway) como fonte de verdade.
 */

import { ceoQueueApiUrl } from "../ceoApiBase.js";
import { sintetizarResultadoJob } from "../motorExecucao/resultadoEncerramento.js";

export async function publicarJobFila(pedido) {
  const resp = await fetch(ceoQueueApiUrl("/api/ceo/queue/jobs"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(pedido)
  });
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok || !data.ok) {
    throw new Error(
      (data && data.mensagem) || `Falha ao publicar Job (HTTP ${resp.status})`
    );
  }
  return data.job;
}

export async function listarJobsPendentes() {
  return listarJobsPorEstado("pending");
}

/**
 * Obtém um Job por ID (somente leitura). Não altera estado.
 * @param {string} id
 * @returns {Promise<object|null>}
 */
export async function obterJobFila(id) {
  const alvo = String(id || "").trim();
  if (!alvo) return null;
  const jobs = await listarJobsPorEstado(null);
  return jobs.find((j) => j && j.id === alvo) || null;
}

/**
 * Lista Jobs da fila oficial (GET local). Filtra por `estado` se indicado.
 * @param {string | null} [estado] — pending|running|completed|failed|cancelled|null(todos)
 * @returns {Promise<object[]>}
 */
export async function listarJobsPorEstado(estado = null) {
  const path =
    estado === "pending"
      ? "/api/ceo/queue/pending"
      : "/api/ceo/queue/jobs";
  const resp = await fetch(ceoQueueApiUrl(path));
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok || !data.ok) {
    throw new Error(
      (data && data.mensagem) || "Falha ao listar Jobs da fila oficial."
    );
  }
  const jobs = Array.isArray(data.jobs) ? data.jobs : [];
  if (!estado) return jobs;
  if (estado === "pending") {
    return jobs.filter((j) => j && (j.estado === "pending" || !j.estado));
  }
  return jobs.filter((j) => j && j.estado === estado);
}

/**
 * Adapta Job REQ-045 → JobResumo da Consciência (status = estado real do Job).
 * F1: pending; F2: dispatched|running|result|needs_correction.
 * Teste 3: em result|needs_correction, promove síntese/evidência ao resumo (lastro).
 * @param {object} job
 * @param {string} [status] — override; default = job.estado
 */
export function jobFilaParaResumoConsciencia(job, status) {
  if (!job || typeof job !== "object") return null;
  const id = typeof job.id === "string" ? job.id : "";
  if (!id) return null;
  const st = String(
    status != null ? status : job.estado || job.status || ""
  ).trim();
  if (
    st !== "pending" &&
    st !== "dispatched" &&
    st !== "running" &&
    st !== "result" &&
    st !== "needs_correction"
  ) {
    return null;
  }
  /** @type {{ id: string, titulo: string, status: string, sinteseResultado?: string, evidencia?: string }} */
  const resumo = {
    id,
    titulo: String(job.titulo || job.id || "").trim() || id,
    status: st
  };
  if (st === "result" || st === "needs_correction") {
    const sintese = sintetizarResultadoJob(job);
    if (sintese) {
      resumo.sinteseResultado =
        sintese.length > 240 ? `${sintese.slice(0, 237)}…` : sintese;
    }
    const ev =
      job.resultado &&
      typeof job.resultado === "object" &&
      typeof job.resultado.evidencia === "string"
        ? job.resultado.evidencia.trim()
        : "";
    if (ev) {
      resumo.evidencia = ev.length > 200 ? `${ev.slice(0, 197)}…` : ev;
    }
  }
  return resumo;
}

/** Estados não-terminais para acompanhamento / consciência F2 (+ pending em F1). */
export const ESTADOS_JOB_NAO_TERMINAIS = Object.freeze([
  "pending",
  "dispatched",
  "running",
  "result",
  "needs_correction"
]);

/**
 * Lista Jobs não-terminais da fila oficial (fonte de verdade persistida).
 * @returns {Promise<object[]>}
 */
export async function listarJobsNaoTerminais() {
  const jobs = await listarJobsPorEstado(null);
  return jobs.filter(
    (j) =>
      j &&
      ESTADOS_JOB_NAO_TERMINAIS.includes(
        /** @type {*} */ (String(j.estado || "pending"))
      )
  );
}

/**
 * Lista Jobs sob Monitoramento (F2) — dispatched|running|result|needs_correction.
 * @returns {Promise<object[]>}
 */
export async function listarJobsEmAcompanhamento() {
  const jobs = await listarJobsPorEstado(null);
  return jobs.filter((j) => {
    const e = String(j?.estado || "");
    return (
      e === "dispatched" ||
      e === "running" ||
      e === "result" ||
      e === "needs_correction"
    );
  });
}
