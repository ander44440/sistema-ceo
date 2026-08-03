/**
 * Voice State Manager — fonte de verdade do turno (ARQ-029 §2 / IMP-068).
 */

import { ESTADO_TURNO, TRANSICOES_TURNO } from "./estados.js";

/**
 * @param {object} [opts]
 * @param {(ev: { tipo: string, de?: string, para?: string, detalhe?: unknown }) => void} [opts.onEvento]
 */
export function criarVoiceStateManager(opts = {}) {
  let estado = ESTADO_TURNO.IDLE;
  /** @type {string|null} */
  let mensagemErro = null;
  /** @type {Set<(snap: object) => void>} */
  const ouvintes = new Set();

  function emitir(tipo, detalhe) {
    if (typeof opts.onEvento === "function") {
      try {
        opts.onEvento({ tipo, de: undefined, para: estado, detalhe });
      } catch {
        /* ignore */
      }
    }
  }

  function snapshot() {
    return { estado, mensagemErro };
  }

  function notificar() {
    const snap = snapshot();
    for (const fn of ouvintes) {
      try {
        fn(snap);
      } catch {
        /* UI opcional */
      }
    }
  }

  /**
   * @param {string} para
   * @param {object} [ctx]
   * @param {string} [ctx.motivo]
   * @param {string|null} [ctx.mensagemErro]
   */
  function transitar(para, ctx = {}) {
    const de = estado;
    const permitidos = TRANSICOES_TURNO[de];
    if (!permitidos || !permitidos.has(para)) {
      const erro = `transição inválida ${de} → ${para}`;
      emitir("transicao_rejeitada", { de, para, motivo: ctx.motivo, erro });
      return { ok: false, erro, ...snapshot() };
    }
    estado = para;
    if (para === ESTADO_TURNO.ERRO) {
      mensagemErro =
        ctx.mensagemErro ||
        mensagemErro ||
        "Falha no modo CEO Ouvindo.";
    } else if (para !== ESTADO_TURNO.ERRO) {
      mensagemErro = ctx.mensagemErro === undefined ? null : ctx.mensagemErro;
    }
    if (typeof opts.onEvento === "function") {
      try {
        opts.onEvento({
          tipo: "estado",
          de,
          para,
          detalhe: ctx.motivo || null
        });
      } catch {
        /* ignore */
      }
    }
    notificar();
    return { ok: true, ...snapshot() };
  }

  function forcarIdle() {
    estado = ESTADO_TURNO.IDLE;
    mensagemErro = null;
    notificar();
    return snapshot();
  }

  return {
    ESTADO_TURNO,
    estado: () => estado,
    mensagemErro: () => mensagemErro,
    snapshot,
    transitar,
    forcarIdle,
    /**
     * @param {(snap: object) => void} fn
     * @returns {() => void}
     */
    onMudanca(fn) {
      ouvintes.add(fn);
      return () => ouvintes.delete(fn);
    }
  };
}
