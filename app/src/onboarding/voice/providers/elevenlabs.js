/**
 * ElevenLabs TTS — esqueleto (REQ-047). Sem implementação definitiva.
 */

/**
 * @param {object} config
 * @returns {import('../VoiceProvider.js').VoiceProvider}
 */
export function createElevenLabsProvider(config) {
  const state = { speaking: false };

  async function autenticar() {
    throw new Error(
      "ElevenLabs: autenticação ainda não implementada (esqueleto REQ-047)."
    );
  }

  async function gerarAudio(_texto) {
    await autenticar();
    throw new Error("ElevenLabs: geração de áudio ainda não implementada.");
  }

  async function reproduzir(_audio) {
    throw new Error("ElevenLabs: reprodução ainda não implementada.");
  }

  async function speak(text) {
    try {
      state.speaking = true;
      const audio = await gerarAudio(text);
      await reproduzir(audio);
    } catch (err) {
      console.warn("[VoiceProvider:elevenlabs]", err?.message || err);
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
