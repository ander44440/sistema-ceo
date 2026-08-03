import {
  listarMensagens,
  temHistorico,
  acrescentarMensagem,
  criarMensagem
} from "./store.js";
import { textoBoasVindasNatural } from "../../conversacaoNatural/index.js";
import { enviarAoNucleo } from "./enviarAoNucleo.js";
import { criarVoiceController, ESTADO_TURNO } from "../../ceoOuvindo/index.js";
import { obterOrquestradorVozSessao } from "../../experienciaVoz/sessao.js";

const MENSAGEM_BOAS_VINDAS = textoBoasVindasNatural();

function escaparHtml(texto) {
  return String(texto)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function rotuloPapel(papel) {
  if (papel === "usuario") return "Você";
  if (papel === "sistema") return "Sistema";
  return "CEO";
}

function formatarHora(iso) {
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date(iso));
  } catch {
    return "";
  }
}

function garantirBoasVindas() {
  if (temHistorico()) return;
  acrescentarMensagem(
    criarMensagem({
      papel: "ceo",
      texto: MENSAGEM_BOAS_VINDAS
    })
  );
}

function renderMensagem(msg) {
  const pendente = msg.estado === "pendente" ? " is-pendente" : "";
  return `
    <article class="conv-msg conv-msg--${msg.papel}${pendente}" data-msg-id="${escaparHtml(msg.id)}">
      <header class="conv-msg-meta">
        <span class="conv-msg-autor">${rotuloPapel(msg.papel)}</span>
        <time datetime="${escaparHtml(msg.criadoEm)}">${formatarHora(msg.criadoEm)}</time>
      </header>
      <div class="conv-msg-corpo">${escaparHtml(msg.texto)}</div>
    </article>
  `;
}

function rotuloEstadoOuvindo(estado, mensagemErro) {
  switch (estado) {
    case ESTADO_TURNO.OUVINDO:
      return "CEO Ouvindo — fale agora";
    case ESTADO_TURNO.PROCESSANDO:
      return "CEO Ouvindo — a processar…";
    case ESTADO_TURNO.RESPONDENDO:
      return "CEO Ouvindo — a responder…";
    case ESTADO_TURNO.ERRO:
      return mensagemErro || "CEO Ouvindo — erro";
    case ESTADO_TURNO.INTERROMPIDO:
      return "CEO Ouvindo — interrompido";
    default:
      return "À escuta do próximo passo";
  }
}

/**
 * Monta a superfície de Conversa no workspace.
 * @returns {HTMLElement}
 */
export function montarConversa() {
  garantirBoasVindas();

  const root = document.createElement("section");
  root.className = "conversa";
  root.dataset.module = "conversa";
  root.setAttribute("aria-label", "Conversa com o CEO");

  root.innerHTML = `
    <header class="conversa-cabecalho">
      <div>
        <h1>Conversa</h1>
        <p class="conversa-subtitulo">Canal principal com o Executivo Digital</p>
      </div>
      <p class="conversa-estado" id="conversa-estado" aria-live="polite">À escuta do próximo passo</p>
    </header>

    <div class="conversa-historico" id="conversa-historico" role="log" aria-relevant="additions" aria-label="Histórico da conversa"></div>

    <form class="conversa-composer" id="conversa-form" autocomplete="off">
      <label class="visually-hidden" for="conversa-input">Instrução para o CEO</label>
      <textarea
        id="conversa-input"
        name="instrucao"
        rows="2"
        maxlength="8000"
        placeholder="Objetivo, decisão ou próximo passo…"
        aria-describedby="conversa-hint"
      ></textarea>
      <div class="conversa-composer-bar">
        <p class="conversa-hint" id="conversa-hint">Enter envia · Shift+Enter nova linha</p>
        <div class="conversa-composer-acoes">
          <button type="button" class="conversa-mic" id="conversa-mic" aria-pressed="false" title="CEO Ouvindo">
            Ouvindo
          </button>
          <button type="submit" class="conversa-enviar" id="conversa-enviar">Enviar</button>
        </div>
      </div>
    </form>
  `;

  const historicoEl = root.querySelector("#conversa-historico");
  const form = root.querySelector("#conversa-form");
  const input = root.querySelector("#conversa-input");
  const enviarBtn = root.querySelector("#conversa-enviar");
  const micBtn = root.querySelector("#conversa-mic");
  const estadoEl = root.querySelector("#conversa-estado");

  let enviando = false;

  function pintarHistorico() {
    historicoEl.innerHTML = listarMensagens().map(renderMensagem).join("");
    historicoEl.scrollTop = historicoEl.scrollHeight;
  }

  function definirEstado(texto) {
    estadoEl.textContent = texto;
  }

  function sincronizarBotao() {
    const vazio = !input.value.trim();
    enviarBtn.disabled = enviando || vazio;
  }

  function pintarMic(snap) {
    const activo =
      snap.estado === ESTADO_TURNO.OUVINDO ||
      snap.estado === ESTADO_TURNO.PROCESSANDO ||
      snap.estado === ESTADO_TURNO.RESPONDENDO;
    micBtn.setAttribute("aria-pressed", activo ? "true" : "false");
    micBtn.classList.toggle("is-activo", activo);
    micBtn.classList.toggle("is-erro", snap.estado === ESTADO_TURNO.ERRO);
    if (snap.estado === ESTADO_TURNO.OUVINDO) {
      micBtn.textContent = "Parar";
    } else if (snap.estado === ESTADO_TURNO.ERRO) {
      micBtn.textContent = "Retry";
    } else if (activo) {
      micBtn.textContent = "…";
    } else {
      micBtn.textContent = "Ouvindo";
    }
  }

  const voice = criarVoiceController({
    retornoAutomaticoOuvindo: true,
    enviarTexto: async (texto) => {
      enviando = true;
      sincronizarBotao();
      try {
        const out = await enviarAoNucleo(texto, {
          reproduzirTts: false,
          onEstadoUi: definirEstado
        });
        pintarHistorico();
        return out;
      } finally {
        enviando = false;
        sincronizarBotao();
        pintarHistorico();
      }
    },
    onEstado: (snap) => {
      definirEstado(rotuloEstadoOuvindo(snap.estado, snap.mensagemErro));
      pintarMic(snap);
    }
  });

  pintarMic(voice.snapshot());

  /**
   * @param {string} textoBruto
   */
  async function enviarInstrucao(textoBruto) {
    const texto = textoBruto.trim();
    if (!texto || enviando) return;

    // Teclado tem prioridade: interrompe ciclo de voz
    if (voice.estado() !== ESTADO_TURNO.IDLE) {
      voice.interromper();
    }

    enviando = true;
    sincronizarBotao();
    input.value = "";
    sincronizarBotao();
    pintarHistorico();

    try {
      await enviarAoNucleo(texto, {
        reproduzirTts: true,
        onEstadoUi: definirEstado
      });
    } finally {
      enviando = false;
      sincronizarBotao();
      pintarHistorico();
      input.focus();
    }
  }

  form.addEventListener("submit", (ev) => {
    ev.preventDefault();
    enviarInstrucao(input.value);
  });

  input.addEventListener("keydown", (ev) => {
    if (ev.key === "Enter" && !ev.shiftKey) {
      ev.preventDefault();
      enviarInstrucao(input.value);
    }
  });

  input.addEventListener("input", sincronizarBotao);

  micBtn.addEventListener("click", async () => {
    const e = voice.estado();
    if (e === ESTADO_TURNO.ERRO) {
      voice.recuperar();
      pintarMic(voice.snapshot());
      return;
    }
    if (
      e === ESTADO_TURNO.OUVINDO ||
      e === ESTADO_TURNO.PROCESSANDO ||
      e === ESTADO_TURNO.RESPONDENDO
    ) {
      voice.interromper();
      pintarMic(voice.snapshot());
      definirEstado("À escuta do próximo passo");
      return;
    }
    // Opt-in PX-002: se voz desactivada, o TTS pode ficar em fila — ainda assim STT funciona
    const orch = obterOrquestradorVozSessao();
    if (orch.preferenciaAtiva()) {
      orch.desbloquearSessao();
    }
    const r = await voice.iniciarEscuta();
    pintarMic(voice.snapshot());
    if (!r.ok) {
      definirEstado(
        voice.mensagemErro() || r.erro || "Não foi possível iniciar CEO Ouvindo"
      );
    }
  });

  pintarHistorico();
  sincronizarBotao();

  queueMicrotask(() => input.focus());

  return root;
}
