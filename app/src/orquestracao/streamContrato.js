/**
 * Contrato SSE do Painel de Orquestração — IMP-055 E5 / IMP-060 E5.
 * Eventos: snapshot | no.atualizado | pulse (ARQ-016).
 */

import { ceoPainelApiUrl } from "../ceoApiBase.js";

export const PATH_SNAPSHOT = "/api/ceo/orquestracao/snapshot";
export const PATH_STREAM = "/api/ceo/orquestracao/stream";

export const DEBOUNCE_UI_MS = 400;
export const INTERVALO_PULSE_MS = 10_000;
export const INTERVALO_POLLING_MS = 4000;

export const HINT_SSE = "Em tempo real";
export const HINT_POLLING = "Actualização periódica";
export const HINT_DEGRADADO =
  "Sinais indisponíveis — a Conversa continua activa";

export const TIPOS_EVENTO = Object.freeze([
  "snapshot",
  "no.atualizado",
  "pulse"
]);

/**
 * @param {string} event
 * @param {object} data
 */
export function formatarEventoSse(event, data) {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

/**
 * @param {string} raw
 * @returns {{ ok: true, evento: object } | { ok: false, mensagem: string }}
 */
export function parsearDataEventoSse(raw) {
  try {
    const evento = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (!evento || typeof evento !== "object") {
      return { ok: false, mensagem: "evento inválido" };
    }
    if (!TIPOS_EVENTO.includes(evento.tipo)) {
      return { ok: false, mensagem: `tipo desconhecido: ${evento.tipo}` };
    }
    return { ok: true, evento };
  } catch (err) {
    return {
      ok: false,
      mensagem: err && err.message ? String(err.message) : "JSON inválido"
    };
  }
}

/**
 * Aplica evento ao cache de nós (pulse não altera).
 * @param {object[]} nos
 * @param {object} evento
 * @returns {{ nos: object[], alterou: boolean }}
 */
export function aplicarEventoAosNos(nos, evento) {
  const base = Array.isArray(nos) ? nos : [];
  if (!evento || typeof evento !== "object") {
    return { nos: base, alterou: false };
  }
  if (evento.tipo === "snapshot" && Array.isArray(evento.nos)) {
    return { nos: evento.nos, alterou: true };
  }
  if (evento.tipo === "no.atualizado" && evento.no && evento.no.id) {
    const id = evento.no.id;
    let encontrado = false;
    const next = base.map((n) => {
      if (n && n.id === id) {
        encontrado = true;
        return evento.no;
      }
      return n;
    });
    if (!encontrado) next.push(evento.no);
    return { nos: next, alterou: true };
  }
  return { nos: base, alterou: false };
}

/**
 * Debounce simples (300–500 ms; default 400).
 * @param {(...args: any[]) => void} fn
 * @param {number} [ms]
 */
export function criarDebounce(fn, ms = DEBOUNCE_UI_MS) {
  let timer = null;
  /** @type {any[]} */
  let lastArgs = [];
  function debounced(...args) {
    lastArgs = args;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      fn(...lastArgs);
    }, ms);
  }
  debounced.cancel = () => {
    if (timer) clearTimeout(timer);
    timer = null;
  };
  debounced.flush = () => {
    if (!timer) return;
    clearTimeout(timer);
    timer = null;
    fn(...lastArgs);
  };
  return debounced;
}

/**
 * Resolve URL do stream SSE — API local MVP (IMP-060 E5), não Railway.
 * @param {string} [baseOverride]
 */
export function urlStreamOrquestracao(baseOverride) {
  if (typeof baseOverride === "string" && baseOverride.trim()) {
    const base = baseOverride.replace(/\/$/, "");
    return `${base}${PATH_STREAM}`;
  }
  return ceoPainelApiUrl(PATH_STREAM);
}
