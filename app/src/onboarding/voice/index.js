/**
 * Fachada de voz do onboarding (REQ-047).
 * Saída de voz: apenas VoiceFactory → VoiceProvider.
 * Entrada (STT): módulo separado; não é TTS.
 */

import { criarStt } from "./stt.js";
import { VoiceFactory } from "./VoiceFactory.js";
import { loadVoiceConfig } from "./VoiceConfig.js";

/**
 * @param {object} [onboardingConfig] — config do onboarding (stt, etc.)
 */
export function criarVoice(onboardingConfig = {}) {
  const voiceCfg = loadVoiceConfig();
  /** @type {import('./VoiceProvider.js').VoiceProvider} */
  const tts = VoiceFactory.create(voiceCfg);
  const stt = criarStt(onboardingConfig.stt || {});
  let silenceTimer = null;
  const silenceMs = onboardingConfig.stt?.silenceMsAntesDeResponder ?? 900;

  function configurar(cbs) {
    stt.configurar({
      onInterim: (t) => {
        tts.stop();
        cbs.onInterim?.(t);
      },
      onFinal: (t) => {
        tts.stop();
        cbs.onSpeechActivity?.();
        clearTimeout(silenceTimer);
        silenceTimer = setTimeout(() => {
          cbs.onFinalUtterance?.(t);
        }, silenceMs);
        cbs.onFinalPartial?.(t);
      },
      onStart: () => cbs.onListeningStart?.(),
      onEnd: () => cbs.onListeningEnd?.(),
      onError: (e) => cbs.onError?.(e)
    });
  }

  async function falar(texto) {
    stt.parar();
    await tts.speak(texto);
  }

  function interromperFala() {
    tts.stop();
  }

  return {
    configurar,
    falar,
    interromperFala,
    iniciarEscuta: () => stt.iniciar(),
    pararEscuta: () => {
      clearTimeout(silenceTimer);
      stt.parar();
    },
    suportado: () => stt.suportado() || Boolean(tts && typeof tts.speak === "function"),
    falando: () => tts.isSpeaking(),
    escutando: () => stt.escutando(),
    /** Provider obtido exclusivamente via VoiceFactory. */
    provider: tts
  };
}

export { VoiceFactory } from "./VoiceFactory.js";
export { loadVoiceConfig, VoiceConfig } from "./VoiceConfig.js";
export { formatForSpeech, TextFormatter } from "./TextFormatter.js";
