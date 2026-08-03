/**
 * Text-to-Speech Adapter — envolve experienciaVoz (ARQ-029 §2 / IMP-068).
 * Não redige prosa (REQ-050).
 */

import {
  interromperFalaCeo,
  reproduzirRespostaCeo
} from "../experienciaVoz/reproduzirResposta.js";

/**
 * @param {object} [opts]
 * @param {(ev: object) => void} [opts.onEvento]
 * @param {typeof reproduzirRespostaCeo} [opts.reproduzir]
 * @param {typeof interromperFalaCeo} [opts.interromper]
 */
export function criarTtsAdapter(opts = {}) {
  const reproduzir = opts.reproduzir || reproduzirRespostaCeo;
  const interromper = opts.interromper || interromperFalaCeo;

  function emitir(tipo, detalhe) {
    if (typeof opts.onEvento === "function") {
      try {
        opts.onEvento({ tipo, detalhe });
      } catch {
        /* ignore */
      }
    }
  }

  return {
    /**
     * @param {string} texto
     * @returns {Promise<{ falou: boolean, motivo?: string, erro?: string }>}
     */
    async speak(texto) {
      emitir("inicio_fala_ceo", { texto: String(texto || "").slice(0, 80) });
      try {
        const r = await reproduzir(texto);
        emitir("termino_fala_ceo", { falou: Boolean(r && r.falou), motivo: r?.motivo });
        return r || { falou: false, motivo: "sem-resultado" };
      } catch (err) {
        const msg = (err && err.message) || "Falha TTS";
        emitir("erro_voz", { origem: "tts", motivo: msg });
        return { falou: false, motivo: "erro-sintese", erro: msg };
      }
    },
    stop() {
      emitir("interrupcao_tts", null);
      return interromper();
    }
  };
}
