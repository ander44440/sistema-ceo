/**
 * Azure Speech TTS — esqueleto (REQ-047).
 */

/**
 * @param {object} config
 * @returns {import('../VoiceProvider.js').VoiceProvider}
 */
export function createAzureProvider(config) {
  const state = { speaking: false };

  async function autenticar() {
    throw new Error(
      "Azure TTS: autenticação ainda não implementada (esqueleto REQ-047)."
    );
  }

  async function gerarAudio(_texto) {
    await autenticar();
    throw new Error("Azure TTS: geração de áudio ainda não implementada.");
  }

  async function reproduzir(_audio) {
    throw new Error("Azure TTS: reprodução ainda não implementada.");
  }

  async function speak(text) {
    try {
      state.speaking = true;
      const audio = await gerarAudio(text);
      await reproduzir(audio);
    } catch (err) {
      console.warn("[VoiceProvider:azure]", err?.message || err);
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
