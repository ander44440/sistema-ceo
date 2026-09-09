/**
 * Ponte de emissão da Trilha Auditável.
 * Browser → HTTP → store JSONL server-side.
 * Testes Node → adaptador local injectado (mesmo appendEvento / mesma fonte).
 */

import { ceoQueueApiUrl } from "../ceoApiBase.js";
import {
  construirEventoGateDecisaoTerminal,
  construirEventoAdFechoSobDelegacao
} from "./dominio.js";

/** @type {null | ((evento: object) => object)} */
let adaptadorLocal = null;

/**
 * @param {null | ((evento: object) => object)} fn
 */
export function configurarAdaptadorTrilhaLocal(fn) {
  adaptadorLocal = typeof fn === "function" ? fn : null;
}

export function resetAdaptadorTrilhaParaTestes() {
  adaptadorLocal = null;
}

export function obterAdaptadorTrilhaActual() {
  return adaptadorLocal;
}

/**
 * Emite evento já construído para a Trilha (fail-soft no chamador).
 * @param {object} evento
 * @returns {{ ok: boolean, codigo?: string, mensagem?: string, medium?: string, id?: string }}
 */
export function emitirEventoTrilha(evento) {
  try {
    if (adaptadorLocal) {
      const r = adaptadorLocal(evento);
      return r && typeof r === "object" ? r : { ok: true, medium: "local" };
    }

    if (typeof fetch === "function") {
      const url = ceoQueueApiUrl("/api/ceo/trilha/eventos");
      void fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ evento })
      }).catch(() => {
        /* fail-soft — não reverte MO/decisão */
      });
      return { ok: true, medium: "http_enqueued", id: evento && evento.id };
    }

    return {
      ok: false,
      codigo: "sem_canal",
      mensagem: "Sem adaptador local nem fetch para emitir Trilha."
    };
  } catch (err) {
    return {
      ok: false,
      codigo: "emissao_falhou",
      mensagem: err instanceof Error ? err.message : String(err)
    };
  }
}

/**
 * Constrói + emite gate.decisao_terminal (pós-MO).
 * @param {object} entrada
 */
export function espelharGateDecisaoTerminalNaTrilha(entrada) {
  try {
    const c = construirEventoGateDecisaoTerminal(entrada);
    if (!c.ok) {
      return { ok: false, codigo: c.codigo, mensagem: c.mensagem };
    }
    return emitirEventoTrilha(c.evento);
  } catch (err) {
    return {
      ok: false,
      codigo: "emissao_falhou",
      mensagem: err instanceof Error ? err.message : String(err)
    };
  }
}

/**
 * Constrói + emite ad.fecho_sob_delegacao (pós-MO).
 * @param {object} entrada
 */
export function espelharAdFechoNaTrilha(entrada) {
  try {
    const c = construirEventoAdFechoSobDelegacao(entrada);
    if (!c.ok) {
      return { ok: false, codigo: c.codigo, mensagem: c.mensagem };
    }
    return emitirEventoTrilha(c.evento);
  } catch (err) {
    return {
      ok: false,
      codigo: "emissao_falhou",
      mensagem: err instanceof Error ? err.message : String(err)
    };
  }
}
