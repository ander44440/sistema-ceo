/**
 * VoiceFactory — único ponto de criação de VoiceProvider (REQ-047).
 */

import { loadVoiceConfig } from "./VoiceConfig.js";
import { formatForSpeech } from "./TextFormatter.js";
import { createBrowserProvider } from "./providers/browser.js";
import { createOpenAiProvider } from "./providers/openai.js";
import { createElevenLabsProvider } from "./providers/elevenlabs.js";
import { createAzureProvider } from "./providers/azure.js";
import { createGoogleProvider } from "./providers/google.js";

/**
 * @param {string} id
 * @param {object} config
 */
function instanciarProvider(id, config) {
  switch (id) {
    case "browser":
      return createBrowserProvider(config);
    case "openai":
      return createOpenAiProvider(config);
    case "elevenlabs":
      return createElevenLabsProvider(config);
    case "azure":
      return createAzureProvider(config);
    case "google":
      return createGoogleProvider(config);
    default:
      console.warn(
        `[VoiceFactory] Provedor desconhecido "${id}"; a usar browser.`
      );
      return createBrowserProvider(config);
  }
}

/**
 * Provider com TextFormatter aplicado em todo speak().
 * @param {import('./VoiceProvider.js').VoiceProvider} inner
 * @param {object} config
 */
function comFormatacao(inner, config) {
  return {
    async speak(text) {
      const preparado = formatForSpeech(text, {
        executiveTone: config.personality?.executiveTone !== false
      });
      return inner.speak(preparado);
    },
    stop: () => inner.stop(),
    pause: () => inner.pause(),
    resume: () => inner.resume(),
    isSpeaking: () => inner.isSpeaking()
  };
}

export const VoiceFactory = {
  /**
   * @param {Partial<ReturnType<typeof loadVoiceConfig>>} [override]
   * @returns {import('./VoiceProvider.js').VoiceProvider}
   */
  create(override = {}) {
    const config = { ...loadVoiceConfig(), ...override };
    let providerId = config.provider || "browser";

    // Fallback de desenvolvimento: se neural pedido sem implementação, browser
    const neural = ["openai", "elevenlabs", "azure", "google"];
    let inner = instanciarProvider(providerId, config);

    if (neural.includes(providerId) && providerId !== "browser") {
      // Guarda esqueleto, mas em runtime devolve browser até haver integração
      const browser = createBrowserProvider(config);
      const skeleton = inner;
      inner = {
        async speak(text) {
          try {
            await skeleton.speak(text);
          } catch {
            return browser.speak(text);
          }
        },
        stop() {
          skeleton.stop();
          browser.stop();
        },
        pause() {
          skeleton.pause();
          browser.pause();
        },
        resume() {
          skeleton.resume();
          browser.resume();
        },
        isSpeaking() {
          return skeleton.isSpeaking() || browser.isSpeaking();
        }
      };
    }

    return comFormatacao(inner, config);
  }
};

export default VoiceFactory;
