/**
 * Speech-to-Text — Web Speech API (Chrome/Edge).
 * Logs [DIAG-STT] apenas com DEBUG (?debug=stt ou localStorage CEO_DEBUG_STT=1).
 */

import { diagStt } from "./debugStt.js";

export function criarStt(opcoes = {}) {
  const SR =
    globalThis.SpeechRecognition || globalThis.webkitSpeechRecognition || null;

  let recognition = null;
  let ativo = false;
  /** @type {string} */
  let lastInterim = "";
  let handlers = {
    onInterim: () => {},
    onFinal: () => {},
    onStart: () => {},
    onEnd: () => {},
    onError: () => {},
    onAudioStart: () => {},
    onSoundStart: () => {},
    onSpeechStart: () => {},
    onAudioEnd: () => {},
    onSoundEnd: () => {},
    onSpeechEnd: () => {}
  };

  function suportado() {
    return Boolean(SR);
  }

  function configurar(cbs = {}) {
    handlers = { ...handlers, ...cbs };
  }

  function flushInterimSePendente() {
    const t = String(lastInterim || "").trim();
    lastInterim = "";
    if (t) {
      diagStt("flushInterim→onFinal", t);
      handlers.onFinal(t);
    }
  }

  function garantir() {
    if (!SR) return null;
    if (recognition) {
      diagStt("SpeechRecognition reutilizado (instância existente)");
      return recognition;
    }
    recognition = new SR();
    diagStt("1. SpeechRecognition criado", {
      lang: opcoes.lang || "pt-BR",
      continuous: opcoes.continuous === true,
      interimResults: opcoes.interimResults !== false
    });
    recognition.lang = opcoes.lang || "pt-BR";
    recognition.continuous = opcoes.continuous === true;
    recognition.interimResults = opcoes.interimResults !== false;

    recognition.onstart = () => {
      ativo = true;
      diagStt("3. onstart");
      handlers.onStart();
    };
    recognition.onaudiostart = () => {
      diagStt("4. onaudiostart");
      handlers.onAudioStart();
    };
    recognition.onsoundstart = () => {
      diagStt("5. onsoundstart");
      handlers.onSoundStart();
    };
    recognition.onspeechstart = () => {
      diagStt("6. onspeechstart");
      handlers.onSpeechStart();
    };
    recognition.onaudioend = () => {
      diagStt("onaudioend");
      handlers.onAudioEnd();
    };
    recognition.onsoundend = () => {
      diagStt("onsoundend");
      handlers.onSoundEnd();
    };
    recognition.onspeechend = () => {
      diagStt("onspeechend");
      handlers.onSpeechEnd();
    };
    recognition.onend = () => {
      ativo = false;
      diagStt("9. onend", { manterAtivo: Boolean(recognition?._manterAtivo) });
      if (!recognition || !recognition._manterAtivo) {
        flushInterimSePendente();
      }
      handlers.onEnd();
      if (recognition && recognition._manterAtivo) {
        try {
          diagStt("2b. start() reinício após onend");
          recognition.start();
        } catch (err) {
          diagStt("2b. start() reinício falhou", err?.name, err?.message);
          if (err && err.name !== "InvalidStateError") {
            handlers.onError(err);
          }
        }
      }
    };
    recognition.onerror = (ev) => {
      diagStt("8. onerror", {
        error: ev?.error,
        message: ev?.message,
        code: ev?.code
      });
      handlers.onError(ev);
    };
    recognition.onresult = (ev) => {
      let interim = "";
      let finals = "";
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        const r = ev.results[i];
        const t = r[0].transcript;
        if (r.isFinal) finals += t;
        else interim += t;
      }
      diagStt("7. onresult", {
        resultIndex: ev.resultIndex,
        length: ev.results.length,
        interim,
        finals
      });
      if (interim) {
        lastInterim = interim;
        handlers.onInterim(interim);
      }
      if (finals.trim()) {
        lastInterim = "";
        handlers.onFinal(finals.trim());
      }
    };
    return recognition;
  }

  function iniciar() {
    const r = garantir();
    if (!r) throw new Error("STT indisponível");
    lastInterim = "";
    r._manterAtivo = true;
    try {
      diagStt("2. start() executado (sync, gesto do utilizador)");
      r.start();
    } catch (err) {
      diagStt("2. start() throw", err?.name, err?.message);
      if (err && err.name === "InvalidStateError") return;
      throw err;
    }
  }

  function parar() {
    if (!recognition) return;
    recognition._manterAtivo = false;
    flushInterimSePendente();
    try {
      diagStt("parar()→stop()");
      recognition.stop();
    } catch {
      /* ignore */
    }
    ativo = false;
  }

  function escutando() {
    return ativo;
  }

  return { suportado, configurar, iniciar, parar, escutando };
}
