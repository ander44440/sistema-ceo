/**
 * Unlock / warm-up do browser para TTS (PX-002 E1 §6).
 * Não produz fala audível significativa — só mantém a cadeia de gesto.
 */

/**
 * @returns {{ ok: boolean, motivo?: string }}
 */
export function tentarAutorizacaoBrowser() {
  const synth = globalThis.speechSynthesis;
  if (!synth || typeof globalThis.SpeechSynthesisUtterance !== "function") {
    return {
      ok: false,
      motivo: "Neste dispositivo não há síntese de voz. Seguimos só por texto."
    };
  }

  try {
    if (typeof synth.resume === "function") {
      synth.resume();
    }
    const u = new globalThis.SpeechSynthesisUtterance(" ");
    u.volume = 0;
    u.rate = 2;
    u.pitch = 1;
    synth.speak(u);
    // Cancela após enfileirar — o gesto já contou para a activation chain.
    queueMicrotask(() => {
      try {
        synth.cancel();
      } catch {
        /* ignore */
      }
    });
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      motivo:
        (err && err.message) ||
        "O browser bloqueou a fala. Toque novamente para autorizar."
    };
  }
}
