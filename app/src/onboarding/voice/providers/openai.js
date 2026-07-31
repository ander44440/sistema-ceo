/**
 * OpenAI TTS — esqueleto (REQ-047). Sem chamadas reais nesta sprint.
 */

/**
 * @param {object} config
 * @returns {import('../VoiceProvider.js').VoiceProvider}
 */
export function createOpenAiProvider(config) {
  const state = { speaking: false };

  async function autenticar() {
    // TODO: ler chave no servidor; nunca no browser em produção.
    throw new Error(
      "OpenAI TTS: autenticação ainda não implementada (esqueleto REQ-047)."
    );
  }

  async function gerarAudio(_texto) {
    await autenticar();
    // TODO: POST /v1/audio/speech
    throw new Error("OpenAI TTS: geração de áudio ainda não implementada.");
  }

  async function reproduzir(_audio) {
    // TODO: AudioContext / HTMLAudioElement
    throw new Error("OpenAI TTS: reprodução ainda não implementada.");
  }

  async function speak(text) {
    try {
      state.speaking = true;
      const audio = await gerarAudio(text);
      await reproduzir(audio);
    } catch (err) {
      console.warn("[VoiceProvider:openai]", err?.message || err);
      throw err;
    } finally {
      state.speaking = false;
    }
  }

  return {
    speak,
    stop() {
      state.speaking = false;
    },
    pause() {},
    resume() {},
    isSpeaking() {
      return state.speaking;
    }
  };
}
