/**
 * Cliente Conector CTO — apenas via /api/ceo/cto/* (REQ-054).
 * Não usa /api/ceo/deliberar.
 */

import { ceoApiUrl } from "../ceoApiBase.js";

/**
 * @param {object} pacote PacoteConsultaCto
 * @returns {Promise<object>} ResultadoCto
 */
export async function consultarCto(pacote) {
  const resp = await fetch(ceoApiUrl("/api/ceo/cto/consultar"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(pacote)
  });
  const data = await resp.json().catch(() => ({}));
  return data;
}

export function novoConsultaId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `cto-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
