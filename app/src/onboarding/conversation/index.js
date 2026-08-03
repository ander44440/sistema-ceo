/**
 * Motor de conversa do onboarding — fluxo configurável.
 */

export function criarConversation({ config, memory, voice, storage, ui }) {
  /** @type {'idle'|'running'|'await_confirm'|'done'} */
  let fase = "idle";
  let idxPergunta = -1;
  let processando = false;
  let bufferFinais = [];

  const perguntas = config.perguntas || [];

  function emitirEstado() {
    ui.setIndicadores?.({
      escutando: voice.escutando(),
      falando: voice.falando(),
      fase
    });
  }

  function pintarTranscricao() {
    ui.renderTranscricao?.(memory.getTranscricao());
  }

  async function dizer(texto) {
    memory.adicionarTurno("ceo", texto);
    pintarTranscricao();
    ui.setIndicadores?.({ escutando: false, falando: true, fase });
    try {
      await voice.falar(texto);
    } catch {
      /* TTS opcional */
    }
    ui.setIndicadores?.({ escutando: true, falando: false, fase });
  }

  function perguntaAtual() {
    return perguntas[idxPergunta] || null;
  }

  async function avancarPergunta() {
    idxPergunta += 1;
    if (idxPergunta >= perguntas.length) {
      await iniciarConfirmacao();
      return;
    }
    const p = perguntaAtual();
    await dizer(p.texto);
    voice.iniciarEscuta();
    emitirEstado();
  }

  async function iniciarConfirmacao() {
    fase = "await_confirm";
    const resumo = memory.montarResumo(
      config.rotulosResumo || {},
      config.resumoCampos || memory.CAMPOS
    );
    ui.renderResumo?.(resumo);
    await dizer(`${resumo}\n\n${config.mensagens.confirmacaoResumo}`);
    voice.iniciarEscuta();
    emitirEstado();
  }

  function interpretaSimNao(texto) {
    const t = String(texto || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{M}/gu, "");
    if (/^(sim|yes|correto|confirmo|ok|positivo)\b/.test(t) || /\bsim\b/.test(t)) {
      return "sim";
    }
    if (/^(nao|não|no|incorreto|errado)\b/.test(t) || /\bnao\b/.test(t)) {
      return "nao";
    }
    return null;
  }

  async function guardarFinal() {
    memory.marcarCompleto(true);
    await storage.salvar({
      perfil: memory.getPerfil(),
      transcricao: memory.getTranscricao()
    });
    fase = "done";
    await dizer(config.mensagens.salvo);
    voice.pararEscuta();
    ui.onConcluido?.(memory.getPerfil());
    emitirEstado();
  }

  async function processarUtterance(texto) {
    if (!texto || processando || fase === "idle" || fase === "done") return;
    processando = true;
    voice.pararEscuta();
    try {
      memory.adicionarTurno("usuario", texto);
      pintarTranscricao();

      if (fase === "await_confirm") {
        const sn = interpretaSimNao(texto);
        if (sn === "sim") {
          await guardarFinal();
          return;
        }
        if (sn === "nao") {
          await dizer(config.mensagens.correcao);
          ui.mostrarCorrecao?.(true);
          voice.iniciarEscuta();
          return;
        }
        // Correção livre: tenta "campo: valor" ou regrava última se ambíguo
        const m = texto.match(/^(\w+)\s*:\s*(.+)$/i);
        if (m) {
          const chave = m[1].toLowerCase();
          const campo =
            memory.CAMPOS.find((c) => c === chave) ||
            memory.CAMPOS.find((c) => c.includes(chave));
          if (campo) memory.setCampo(campo, m[2]);
        }
        await iniciarConfirmacao();
        return;
      }

      if (fase === "running") {
        const p = perguntaAtual();
        if (p) {
          memory.setCampo(p.campo, texto);
          await storage.salvar({
            perfil: memory.getPerfil(),
            transcricao: memory.getTranscricao()
          });
          ui.atualizarCampos?.(memory.getPerfil());
        }
        await avancarPergunta();
      }
    } finally {
      processando = false;
      emitirEstado();
    }
  }

  async function iniciar() {
    if (fase === "running" || fase === "await_confirm") return;
    memory.reset();
    ui.renderTranscricao?.([]);
    ui.renderResumo?.("");
    ui.mostrarCorrecao?.(false);
    fase = "running";
    idxPergunta = -1;
    bufferFinais = [];
    if (!voice.suportado()) {
      ui.notify?.(config.mensagens.microfoneIndisponivel);
    }
    await dizer(config.mensagens.abertura);
    await avancarPergunta();
  }

  function encerrar() {
    voice.pararEscuta();
    voice.interromperFala();
    fase = "idle";
    ui.setIndicadores?.({ escutando: false, falando: false, fase });
    ui.notify?.(config.mensagens.encerrado);
  }

  async function confirmarSim() {
    if (fase !== "await_confirm") return;
    voice.pararEscuta();
    await guardarFinal();
  }

  async function confirmarNao() {
    if (fase !== "await_confirm") return;
    await dizer(config.mensagens.correcao);
    ui.mostrarCorrecao?.(true);
    voice.iniciarEscuta();
  }

  async function regravarCampo(campo) {
    if (!memory.CAMPOS.includes(campo)) return;
    const p = perguntas.find((q) => q.campo === campo);
    fase = "running";
    idxPergunta = perguntas.findIndex((q) => q.campo === campo);
    ui.mostrarCorrecao?.(false);
    await dizer(p ? p.texto : `Atualize o campo ${campo}.`);
    voice.iniciarEscuta();
  }

  function textoManual(texto) {
    return processarUtterance(texto);
  }

  function ligarVoice() {
    voice.configurar({
      onInterim: (t) => ui.setInterim?.(t),
      onFinalPartial: (t) => {
        bufferFinais.push(t);
        ui.setInterim?.("");
      },
      onFinalUtterance: async () => {
        const texto = bufferFinais.splice(0).join(" ").trim();
        if (texto) await processarUtterance(texto);
      },
      onListeningStart: emitirEstado,
      onListeningEnd: emitirEstado,
      onSpeechActivity: () => voice.interromperFala(),
      onError: (e) => {
        if (e?.error === "not-allowed") {
          ui.notify?.(config.mensagens.microfoneIndisponivel);
        }
      }
    });
  }

  return {
    iniciar,
    encerrar,
    confirmarSim,
    confirmarNao,
    regravarCampo,
    textoManual,
    ligarVoice,
    getFase: () => fase
  };
}
