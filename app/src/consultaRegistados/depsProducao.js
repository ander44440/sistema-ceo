/**
 * IMP-089 Fatia 1 — deps de produção (read-only, soft-fail).
 * Consome HTTP já existente (Trilha) e GET read-only do HFC (sem writers).
 */

import { ceoQueueApiUrl } from "../ceoApiBase.js";

/**
 * GET síncrono — o orquestrador de consulta é síncrono (IMP-086).
 * Soft-fail: qualquer erro ⇒ null.
 * @param {string} url
 * @returns {object|null}
 */
export function getJsonSincrono(url) {
  try {
    if (typeof XMLHttpRequest === "undefined") return null;
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url, false);
    xhr.send(null);
    if (xhr.status < 200 || xhr.status >= 300) return null;
    const raw = xhr.responseText || "";
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * @returns {{ listarHfcPorCoa: (coaId: string) => object[], listarPorMo: (moId: string) => object[] }}
 */
export function criarDepsConsultaProducao() {
  /** @type {object[]|null} */
  let cacheTrilha = null;

  function eventosTrilha() {
    if (cacheTrilha) return cacheTrilha;
    try {
      const body = getJsonSincrono(ceoQueueApiUrl("/api/ceo/trilha/eventos"));
      cacheTrilha = Array.isArray(body && body.eventos) ? body.eventos : [];
    } catch {
      cacheTrilha = [];
    }
    return cacheTrilha;
  }

  return {
    /**
     * @param {string} coaId
     * @returns {object[]}
     */
    listarHfcPorCoa(coaId) {
      try {
        const id = String(coaId || "").trim();
        if (!id) return [];
        const url = ceoQueueApiUrl(
          `/api/ceo/historico-conversas/mensagens?coaId=${encodeURIComponent(id)}`
        );
        const body = getJsonSincrono(url);
        return Array.isArray(body && body.mensagens) ? body.mensagens : [];
      } catch {
        return [];
      }
    },

    /**
     * @param {string} moId
     * @returns {object[]}
     */
    listarPorMo(moId) {
      try {
        const id = String(moId || "").trim();
        if (!id) return [];
        return eventosTrilha().filter(
          (e) => e && e.refs && String(e.refs.moRegistroId || "") === id
        );
      } catch {
        return [];
      }
    }
  };
}
