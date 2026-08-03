/**
 * Speech-to-Text Adapter — envolve criarStt (ARQ-029 §2 / IMP-068).
 */

import { criarStt } from "../onboarding/voice/stt.js";

/**
 * @param {object} [opts]
 * @param {number} [opts.silenceMs]
 * @param {string} [opts.lang]
 * @param {(ev: object) => void} [opts.onEvento]
 * @param {ReturnType<typeof criarStt>} [opts.stt] — injecção testes
 */
export function criarSttAdapter(opts = {}) {
  const silenceMs = opts.silenceMs ?? 900;
  const stt = opts.stt || criarStt({ lang: opts.lang || "pt-BR" });
  /** @type {ReturnType<typeof setTimeout>|null} */
  let silenceTimer = null;
  /** @type {string} */
  let acumulado = "";
  /** @type {{ onFala?: Function, onSilencio?: Function, onParcial?: Function, onFinal?: Function, onErro?: Function, onStart?: Function, onEnd?: Function }} */
  let cbs = {};

  function emitir(tipo, detalhe) {
    if (typeof opts.onEvento === "function") {
      try {
        opts.onEvento({ tipo, detalhe });
      } catch {
        /* ignore */
      }
    }
  }

  function limparTimer() {
    if (silenceTimer) {
      clearTimeout(silenceTimer);
      silenceTimer = null;
    }
  }

  stt.configurar({
    onStart: () => {
      emitir("stt_start", null);
      cbs.onStart?.();
    },
    onEnd: () => {
      emitir("stt_end", null);
      cbs.onEnd?.();
    },
    onInterim: (t) => {
      cbs.onParcial?.(t);
    },
    onFinal: (t) => {
      const piece = String(t || "").trim();
      if (!piece) return;
      acumulado = acumulado ? `${acumulado} ${piece}` : piece;
      emitir("fala_detectada", { texto: piece });
      cbs.onFala?.(piece);
      limparTimer();
      silenceTimer = setTimeout(() => {
        const final = acumulado.trim();
        acumulado = "";
        emitir("silencio", { texto: final });
        cbs.onSilencio?.(final);
        if (final) {
          emitir("transcricao_concluida", { texto: final });
          cbs.onFinal?.(final);
        }
      }, silenceMs);
    },
    onError: (ev) => {
      const erro = (ev && ev.error) || (ev && ev.message) || "erro-stt";
      // `no-speech` / `aborted` são recuperáveis — não forçar Erro fatal sempre
      emitir("erro_voz", { origem: "stt", motivo: erro });
      cbs.onErro?.(ev);
    }
  });

  return {
    suportado: () => stt.suportado(),
    /**
     * @param {typeof cbs} handlers
     */
    configurar(handlers = {}) {
      cbs = { ...cbs, ...handlers };
    },
    iniciar() {
      acumulado = "";
      limparTimer();
      if (!stt.suportado()) {
        throw new Error("STT indisponível neste browser.");
      }
      stt.iniciar();
      emitir("iniciar_escuta", null);
    },
    parar() {
      limparTimer();
      acumulado = "";
      stt.parar();
      emitir("parar_escuta", null);
    },
    escutando: () => stt.escutando()
  };
}
