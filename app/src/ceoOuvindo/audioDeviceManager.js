/**
 * Audio Device Manager — permissão e libertação do microfone (ARQ-029 §2).
 * Não faz STT; só dispositivo.
 *
 * Importante: não manter MediaStream aberto ao iniciar SpeechRecognition —
 * abrir+parar getUserMedia imediatamente antes do SR impede onaudiostart/onresult
 * em Chrome (falha «CEO não ouviu»).
 */

/**
 * @param {object} [opts]
 * @param {typeof navigator.mediaDevices} [opts.mediaDevices]
 * @param {Permissions} [opts.permissions]
 * @param {(ev: object) => void} [opts.onEvento]
 */
export function criarAudioDeviceManager(opts = {}) {
  const media =
    opts.mediaDevices ||
    (typeof navigator !== "undefined" ? navigator.mediaDevices : null);
  const permissions =
    opts.permissions ||
    (typeof navigator !== "undefined" ? navigator.permissions : null);
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

  /**
   * @returns {Promise<{ ok: boolean, motivo?: string, via?: string }>}
   */
  async function garantirPermissaoMic() {
    // 1) Já concedida — não abrir stream (deixa o SpeechRecognition ser o único dono do mic)
    try {
      if (permissions && typeof permissions.query === "function") {
        const st = await permissions.query({ name: "microphone" });
        if (st.state === "denied") {
          emitir("erro_voz", { origem: "mic", motivo: "Permissão de microfone negada." });
          return { ok: false, motivo: "Permissão de microfone negada.", via: "permissions" };
        }
        if (st.state === "granted") {
          emitir("mic_autorizado", { via: "permissions" });
          return { ok: true, via: "permissions" };
        }
      }
    } catch {
      /* Permissions API indisponível / nome não suportado */
    }

    // 2) Sem getUserMedia: delegar o pedido ao SpeechRecognition
    if (!suportado()) {
      emitir("mic_autorizado", { via: "delegado-stt" });
      return { ok: true, via: "delegado-stt" };
    }

    // 3) Prompt: abrir uma vez, libertar de imediato (não segurar o device)
    try {
      const s = await media.getUserMedia({ audio: true });
      stream = s;
      emitir("mic_autorizado", { via: "getUserMedia" });
      fecharCaptura();
      return { ok: true, via: "getUserMedia" };
    } catch (err) {
      const motivo =
        err && err.name === "NotAllowedError"
          ? "Permissão de microfone negada."
          : (err && err.message) || "Falha ao aceder ao microfone.";
      emitir("erro_voz", { origem: "mic", motivo });
      return { ok: false, motivo, via: "getUserMedia" };
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
