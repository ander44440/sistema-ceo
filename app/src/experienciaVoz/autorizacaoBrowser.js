/**
 * Unlock / warm-up do browser para TTS (PX-002 E1 §6 / E6).
 * Mantém a cadeia de gesto — sem cancel imediato (invalidava iOS/Android).
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
    // Utterance mínima inaudível. NÃO cancelar no microtask —
    // cancel prematuro quebrava a authorization chain (diagnóstico PX-002 E4).
    const u = new globalThis.SpeechSynthesisUtterance("\u200B");
    u.volume = 0;
    u.rate = 2;
    u.pitch = 1;
    synth.speak(u);
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
