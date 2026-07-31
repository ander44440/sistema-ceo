/**
 * Speech-to-Text — Web Speech API (Chrome/Edge).
 */

export function criarStt(opcoes = {}) {
  const SR =
    globalThis.SpeechRecognition || globalThis.webkitSpeechRecognition || null;

  let recognition = null;
  let ativo = false;
  let handlers = {
    onInterim: () => {},
    onFinal: () => {},
    onStart: () => {},
    onEnd: () => {},
    onError: () => {}
  };

  function suportado() {
    return Boolean(SR);
  }

  function configurar(cbs = {}) {
    handlers = { ...handlers, ...cbs };
  }

  function garantir() {
    if (!SR) return null;
    if (recognition) return recognition;
    recognition = new SR();
    recognition.lang = opcoes.lang || "pt-BR";
    recognition.continuous = opcoes.continuous !== false;
    recognition.interimResults = opcoes.interimResults !== false;

    recognition.onstart = () => {
      ativo = true;
      handlers.onStart();
    };
    recognition.onend = () => {
      ativo = false;
      handlers.onEnd();
      // Reinicia se ainda deveria estar a escutar
      if (recognition && recognition._manterAtivo) {
        try {
          recognition.start();
        } catch {
          /* already started */
        }
      }
    };
    recognition.onerror = (ev) => {
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
      if (interim) handlers.onInterim(interim);
      if (finals.trim()) handlers.onFinal(finals.trim());
    };
    return recognition;
  }

  function iniciar() {
    const r = garantir();
    if (!r) throw new Error("STT indisponível");
    r._manterAtivo = true;
    try {
      r.start();
    } catch {
      /* ignore */
    }
  }

  function parar() {
    if (!recognition) return;
    recognition._manterAtivo = false;
    try {
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
