/**
 * Cliente da Fila de Execução oficial do MVP (REQ-045 / REQ-060 / IMP-060 E4/E5).
 *
 * Publicar / listar usam `ceoQueueApiUrl` → plugin Vite / companion → executive/queue/.
 * Nunca usam VITE_CEO_API_BASE (Railway) como fonte de verdade.
 */

import { ceoQueueApiUrl } from "../ceoApiBase.js";

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
 * Adapta Job REQ-045 → JobResumo da Consciência (status, não estado).
 * @param {object} job
 * @param {"pending"|"running"} status
 */
export function jobFilaParaResumoConsciencia(job, status) {
  if (!job || typeof job !== "object") return null;
  const id = typeof job.id === "string" ? job.id : "";
  if (!id) return null;
  return {
    id,
    titulo: String(job.titulo || job.id || "").trim() || id,
    status
  };
}
