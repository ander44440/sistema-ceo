/**
 * Base URL da API do CEO (BP-001 E8).
 * VITE_CEO_API_BASE vazio → paths relativos (Vite plugins / mesmo origin).
 * Preenchida → prefixa serviços online BP-001 (LLM, CTO, health, orquestração…).
 * Ciclo oficial de Jobs MVP: sempre `ceoQueueApiUrl` (IMP-060 E2/E4) — nunca Railway.
 */

function lerEnvVite(chave) {
  try {
    const env = import.meta.env;
    if (!env || typeof env !== "object") return "";
    return env[chave];
  } catch {
    return "";
  }
}

export function ceoApiBase() {
  return String(lerEnvVite("VITE_CEO_API_BASE") || "")
    .trim()
    .replace(/\/$/, "");
}

/**
 * @param {string} path — ex. "/api/ceo/llm-status"
 * @returns {string}
 */
export function ceoApiUrl(path) {
  const p = path.startsWith("/") ? path : `/${path}`;
  const base = ceoApiBase();
  return base ? `${base}${p}` : p;
}

/**
 * Base da API local do MVP (fila + Painel de Orquestração) — IMP-060 E2/E4/E5.
 * Nunca usa VITE_CEO_API_BASE (Railway). Vazio → path relativo (plugin Vite no PC).
 * Companion: VITE_CEO_QUEUE_API_BASE=http://localhost:5173
 */
export function ceoQueueApiBase() {
  return String(lerEnvVite("VITE_CEO_QUEUE_API_BASE") || "")
    .trim()
    .replace(/\/$/, "");
}

/**
 * URL da API local MVP (fila oficial / orquestração com a mesma pasta).
 * @param {string} path — ex. "/api/ceo/queue/jobs" ou "/api/ceo/orquestracao/snapshot"
 * @returns {string}
 */
export function ceoQueueApiUrl(path) {
  const p = path.startsWith("/") ? path : `/${path}`;
  const base = ceoQueueApiBase();
  return base ? `${base}${p}` : p;
}

/** Alias E5 — Painel/SSE na mesma origem que a fila oficial. */
export const ceoPainelApiUrl = ceoQueueApiUrl;
