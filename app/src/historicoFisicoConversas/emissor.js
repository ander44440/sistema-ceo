/**
 * Emissor HFC — browser → HTTP; testes → adaptador FS injectado.
 * Fail-soft: nunca propaga excepção ao transcript F5-C3.
 */

import { ceoQueueApiUrl } from "../ceoApiBase.js";
import { prepararEventoMensagem } from "./dominio.js";

/** @type {null | ((parcial: object) => object)} */
let adaptadorLocal = null;

/** @type {Set<string>} */
const emitidosSessao = new Set();

/**
 * @param {null | ((parcial: object) => object)} fn
 */
export function configurarAdaptadorHfcLocal(fn) {
  adaptadorLocal = typeof fn === "function" ? fn : null;
}

export function resetEstadoHfcParaTestes() {
  adaptadorLocal = null;
  emitidosSessao.clear();
}

export function obterAdaptadorHfcActual() {
  return adaptadorLocal;
}

/**
 * Emite parcial já validado (sem ordem).
 * @param {object} parcial
 * @returns {{ ok: boolean, codigo?: string, mensagem?: string, medium?: string, id?: string, duplicado?: boolean }}
 */
export function emitirMensagemHfc(parcial) {
  try {
    if (!parcial || typeof parcial !== "object") {
      return { ok: false, codigo: "evento_invalido", mensagem: "Parcial ausente." };
    }
    const msgId = String(parcial.msgId || "");
    if (msgId && emitidosSessao.has(msgId)) {
      return { ok: true, duplicado: true, id: parcial.id, medium: "sessao" };
    }

    if (adaptadorLocal) {
      const r = adaptadorLocal(parcial);
      const out = r && typeof r === "object" ? r : { ok: true, medium: "local" };
      if (out.ok && msgId) emitidosSessao.add(msgId);
      return out;
    }

    if (typeof fetch === "function") {
      const url = ceoQueueApiUrl("/api/ceo/historico-conversas/mensagens");
      void fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ evento: parcial })
      }).catch(() => {
        /* fail-soft — não reverte F5-C3 */
      });
      if (msgId) emitidosSessao.add(msgId);
      return { ok: true, medium: "http_enqueued", id: parcial.id };
    }

    return {
      ok: false,
      codigo: "sem_canal",
      mensagem: "Sem adaptador local nem fetch para emitir HFC."
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
 * Porta usada pelo store conversacional (fail-soft).
 * @param {{ mensagem: object, coaId?: string|null }} entrada
 */
export function tentarRegistarMensagemHfc(entrada) {
  try {
    const prep = prepararEventoMensagem(entrada || {});
    if (!prep.ok) {
      // pendente / inválido — silêncio operacional
      return prep;
    }
    return emitirMensagemHfc(prep.parcial);
  } catch (err) {
    return {
      ok: false,
      codigo: "emissao_falhou",
      mensagem: err instanceof Error ? err.message : String(err)
    };
  }
}
