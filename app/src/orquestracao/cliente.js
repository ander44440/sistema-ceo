/**
 * Cliente HTTP do Painel de Orquestração — IMP-055 E3/E5 / IMP-060 E5.
 * Snapshot GET (só leitura). Stream SSE em tempoReal.js.
 * Origem: API local MVP (`ceoPainelApiUrl`) — mesma pasta executive/queue — nunca Railway.
 */

import { ceoPainelApiUrl } from "../ceoApiBase.js";
import { NOS_V1, montarNo, extrairVistaPrincipal } from "./dominio.js";
import { PATH_SNAPSHOT, INTERVALO_POLLING_MS } from "./streamContrato.js";

export { PATH_SNAPSHOT, INTERVALO_POLLING_MS };

/**
 * Resolve URL do snapshot (API local MVP / companion; não VITE_CEO_API_BASE).
 * @param {string} [baseOverride]
 */
export function urlSnapshotOrquestracao(baseOverride) {
  if (typeof baseOverride === "string" && baseOverride.trim()) {
    const base = baseOverride.replace(/\/$/, "");
    return `${base}${PATH_SNAPSHOT}`;
  }
  return ceoPainelApiUrl(PATH_SNAPSHOT);
}

/**
 * @param {{ fetchImpl?: typeof fetch, apiBase?: string }} [opts]
 * @returns {Promise<{ ok: true, em: string, nos: object[] } | { ok: false, mensagem: string }>}
 */
export async function obterSnapshotOrquestracao(opts = {}) {
  const fetchImpl = opts.fetchImpl || globalThis.fetch;
  if (typeof fetchImpl !== "function") {
    return { ok: false, mensagem: "fetch indisponível." };
  }
  try {
    const resp = await fetchImpl(urlSnapshotOrquestracao(opts.apiBase), {
      method: "GET",
      headers: { Accept: "application/json" }
    });
    if (!resp.ok) {
      return {
        ok: false,
        mensagem: `Snapshot HTTP ${resp.status}.`
      };
    }
    const body = await resp.json();
    if (!body || !Array.isArray(body.nos) || body.nos.length !== NOS_V1.length) {
      return { ok: false, mensagem: "Snapshot inválido." };
    }
    return { ok: true, em: body.em || "", nos: body.nos };
  } catch (err) {
    return {
      ok: false,
      mensagem: err && err.message ? String(err.message) : "Falha de rede."
    };
  }
}

/**
 * Vistas principais em Erro quando o snapshot falha (E3-CA5).
 * Não toca na Conversa — só alimenta o painel.
 */
export function vistasDegradacaoSnapshot() {
  return NOS_V1.map((id) => extrairVistaPrincipal(montarNo(id, "Erro")));
}
