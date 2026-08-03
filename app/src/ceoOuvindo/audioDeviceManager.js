/**
 * Audio Device Manager — permissão e libertação do microfone (ARQ-029 §2).
 * Não faz STT; só dispositivo.
 */

/**
 * @param {object} [opts]
 * @param {typeof navigator.mediaDevices} [opts.mediaDevices]
 * @param {(ev: object) => void} [opts.onEvento]
 */
export function criarAudioDeviceManager(opts = {}) {
  const media =
    opts.mediaDevices ||
    (typeof navigator !== "undefined" ? navigator.mediaDevices : null);
  /** @type {MediaStream|null} */
  let stream = null;

  function emitir(tipo, detalhe) {
    if (typeof opts.onEvento === "function") {
      try {
        opts.onEvento({ tipo, detalhe });
      } catch {
        /* ignore */
      }
    }
  }

  function suportado() {
    return Boolean(media && typeof media.getUserMedia === "function");
  }

  /**
   * @returns {Promise<{ ok: boolean, motivo?: string }>}
   */
  async function garantirPermissaoMic() {
    if (!suportado()) {
      emitir("erro_voz", { origem: "mic", motivo: "getUserMedia indisponível" });
      return { ok: false, motivo: "Microfone indisponível neste browser." };
    }
    try {
      const s = await media.getUserMedia({ audio: true });
      stream = s;
      emitir("mic_autorizado", null);
      return { ok: true };
    } catch (err) {
      const motivo =
        (err && err.name === "NotAllowedError")
          ? "Permissão de microfone negada."
          : (err && err.message) || "Falha ao aceder ao microfone.";
      emitir("erro_voz", { origem: "mic", motivo });
      return { ok: false, motivo };
    }
  }

  function fecharCaptura() {
    if (stream) {
      for (const t of stream.getTracks()) {
        try {
          t.stop();
        } catch {
          /* ignore */
        }
      }
      stream = null;
      emitir("mic_fechado", null);
    }
  }

  function estaCapturando() {
    return Boolean(stream && stream.active);
  }

  return {
    suportado,
    garantirPermissaoMic,
    fecharCaptura,
    estaCapturando
  };
}
