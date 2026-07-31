/**
 * Browser VoiceProvider — Web Speech API como fallback de desenvolvimento (REQ-047).
 * Único módulo autorizado a usar speechSynthesis.
 * PX-002 E6: onerror propaga falha (não engole); interrupted/canceled = stop limpo.
 */

/**
 * @param {string} [tipo]
 * @returns {string}
 */
function mensagemErroTts(tipo) {
  switch (String(tipo || "")) {
    case "not-allowed":
      return "O browser bloqueou a fala após a rede. Toque no botão de voz para ouvir.";
    case "network":
      return "Falha de rede na síntese de voz. O texto mantém-se no ecrã.";
    case "synthesis-failed":
    case "synthesis-unavailable":
      return "A síntese de voz falhou neste dispositivo. O texto mantém-se no ecrã.";
    case "language-unavailable":
    case "voice-unavailable":
      return "Voz do sistema indisponível. O texto mantém-se no ecrã.";
    case "audio-busy":
    case "audio-hardware":
      return "Áudio do dispositivo ocupado ou indisponível. Tente de novo pelo botão de voz.";
    default:
      return tipo
        ? `Falha na voz (${tipo}). Toque no botão para ouvir a resposta.`
        : "A síntese de voz falhou. Toque no botão de voz para ouvir.";
  }
}

/**
 * @param {string} lang
 * @param {string} voicePref
 * @returns {SpeechSynthesisVoice | null}
 */
function escolherMelhorVoz(lang, voicePref) {
  const synth = globalThis.speechSynthesis;
  if (!synth) return null;
  const voices = synth.getVoices?.() || [];
  if (!voices.length) return null;

  const langBase = String(lang || "pt-BR").toLowerCase();
  const pt = voices.filter(
    (v) =>
      String(v.lang || "")
        .toLowerCase()
        .startsWith("pt") ||
      /brazil|brasil|portuguese|portugu/i.test(v.name)
  );

  const pool = pt.length ? pt : voices;

  if (voicePref && voicePref !== "auto") {
    const named = pool.find((v) =>
      v.name.toLowerCase().includes(String(voicePref).toLowerCase())
    );
    if (named) return named;
  }

  const score = (v) => {
    let s = 0;
    const name = String(v.name || "").toLowerCase();
    const vl = String(v.lang || "").toLowerCase();
    if (vl === langBase || vl.replace("_", "-") === langBase) s += 50;
    if (vl.startsWith("pt-br") || vl === "pt_br") s += 40;
    if (/neural|natural|premium|enhanced|wavenet|studio/i.test(name)) s += 35;
    if (/google|microsoft|apple/i.test(name)) s += 15;
    if (/daniel|luciana|joana|fernanda|francisca|maria/i.test(name)) s += 10;
    // Penalizar vozes tipicamente robóticas/compactas
    if (/compact|robot|espeak|festival|dumb|tty/i.test(name)) s -= 40;
    if (v.localService) s += 5;
    return s;
  };

  return pool.slice().sort((a, b) => score(b) - score(a))[0] || null;
}

/**
 * @param {ReturnType<import('../VoiceConfig.js').loadVoiceConfig>} config
 * @returns {import('../VoiceProvider.js').VoiceProvider}
 */
export function createBrowserProvider(config) {
  const synth = globalThis.speechSynthesis;
  /** @type {SpeechSynthesisUtterance | null} */
  let atual = null;
  let vozEscolhida = null;

  function refreshVoice() {
    vozEscolhida = escolherMelhorVoz(config.language, config.voice);
  }

  if (synth) {
    refreshVoice();
    // Algumas engines só populam voices async
    if (typeof synth.addEventListener === "function") {
      synth.addEventListener("voiceschanged", refreshVoice);
    } else if ("onvoiceschanged" in synth) {
      synth.onvoiceschanged = refreshVoice;
    }
  }

  function stop() {
    if (synth) synth.cancel();
    atual = null;
  }

  function pause() {
    if (synth && synth.speaking) synth.pause();
  }

  function resume() {
    if (synth && synth.paused) synth.resume();
  }

  function isSpeaking() {
    return Boolean(synth && (synth.speaking || synth.pending));
  }

  /**
   * @param {string} text
   */
  async function speak(text) {
    if (!synth || !globalThis.SpeechSynthesisUtterance) {
      throw new Error("Browser TTS indisponível neste ambiente.");
    }

    stop();
    if (!vozEscolhida) refreshVoice();

    const chunks = String(text || "")
      .split(/\.\.\./)
      .map((c) => c.trim())
      .filter(Boolean);

    const pauseMs = config.personality?.pauseBetweenParagraphsMs ?? 280;

    for (let i = 0; i < chunks.length; i++) {
      const resultado = await new Promise((resolve, reject) => {
        const u = new SpeechSynthesisUtterance(chunks[i]);
        u.lang = config.language || "pt-BR";
        u.rate = config.speed ?? 0.95;
        u.pitch = config.pitch ?? 1;
        u.volume = config.volume ?? 1;
        if (vozEscolhida) u.voice = vozEscolhida;
        atual = u;
        u.onend = () => {
          atual = null;
          resolve({ ok: true });
        };
        u.onerror = (ev) => {
          atual = null;
          const tipo = String((ev && ev.error) || "");
          // stop()/cancel() → interrupted|canceled: fim limpo, não é falha de UX
          if (tipo === "interrupted" || tipo === "canceled") {
            resolve({ ok: true, interrompido: true });
            return;
          }
          reject(
            new Error(
              mensagemErroTts(tipo) ||
                "A síntese de voz falhou. O texto mantém-se no ecrã."
            )
          );
        };
        try {
          synth.speak(u);
        } catch (err) {
          reject(err);
        }
      });
      if (resultado && resultado.interrompido) {
        return;
      }
      if (i < chunks.length - 1 && pauseMs > 0) {
        await new Promise((r) => setTimeout(r, pauseMs));
      }
    }
  }

  return { speak, stop, pause, resume, isSpeaking };
}
