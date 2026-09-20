import {
  listarMensagens,
  temHistorico,
  acrescentarMensagem,
  criarMensagem,
  obterContextoConversacional
} from "./store.js";
import {
  htmlBotaoCopiarResposta,
  ligarBotoesCopiarResposta
} from "./copiarResposta.js";
import { textoBoasVindasNatural } from "../../conversacaoNatural/index.js";
import { enviarAoNucleo } from "./enviarAoNucleo.js";
import { criarVoiceController, ESTADO_TURNO } from "../../ceoOuvindo/index.js";
import { obterOrquestradorVozSessao } from "../../experienciaVoz/sessao.js";
import { EVENTO_PAUSAR_CEO } from "../../botaoPausar.js";
import {
  htmlPainelOrquestracao,
  ligarPainelOrquestracao
} from "../../orquestracao/ui.js";
import { obterVistaDiaAtivo } from "../centroSituacao/painelDiaAtivo.js";
import { obterCoaAtivo } from "../../executiveEngine/coaSessao.js";
import {
  htmlMarcaCeo20,
  htmlComMarcaCeo20
} from "../../ui/identidadeCeo20.js";

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
  return htmlMarcaCeo20();
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
  const copiar =
    msg.papel === "ceo" && msg.estado !== "pendente"
      ? htmlBotaoCopiarResposta()
      : "";
  return `
    <article class="conv-msg conv-msg--${msg.papel}${pendente}" data-msg-id="${escaparHtml(msg.id)}">
      <header class="conv-msg-meta">
        <span class="conv-msg-autor">${rotuloPapel(msg.papel)}</span>
        <div class="conv-msg-meta-acoes">
          ${copiar}
          <time datetime="${escaparHtml(msg.criadoEm)}">${formatarHora(msg.criadoEm)}</time>
        </div>
      </header>
      <div class="conv-msg-corpo">${escaparHtml(msg.texto)}</div>
    </article>
  `;
}

function htmlResumoExecutivo() {
  const vista = obterVistaDiaAtivo();
  const linhas = String(vista.resumo || "")
    .split("\n")
    .filter(Boolean)
    .slice(0, 6);
  const itens = linhas.length
    ? linhas.map((l) => `<li>${escaparHtml(l)}</li>`).join("")
    : "<li>Sem resumo ainda — abra o dia ou consulte o estado.</li>";
  return `<article class="conversa-rail-card conversa-resumo" aria-label="Resumo executivo do dia">
    <p class="conversa-rail-kicker">Resumo Executivo do Dia</p>
    <ul class="conversa-resumo-list">${itens}</ul>
  </article>`;
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

function htmlContextoCoaActivo() {
  const coa = obterCoaAtivo();
  const bucket = obterContextoConversacional();
  if (!coa?.id) {
    return `<p class="conversa-coa-activo" id="conversa-coa-activo">Sem projeto activo — o LFC de caso não será lido.</p>`;
  }
  const aviso =
    bucket && bucket !== coa.id
      ? ` · bucket conversa realinhado`
      : "";
  return `<p class="conversa-coa-activo" id="conversa-coa-activo" title="${escaparHtml(coa.id)}">Projeto activo: <strong>${escaparHtml(coa.nome || coa.id)}</strong> <span class="conversa-coa-id">(${escaparHtml(coa.id)})</span>${aviso}</p>`;
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
  root.setAttribute("aria-label", "Conversa com o CEO 2.0");

  root.innerHTML = `
    <div class="conversa-layout">
      <div class="conversa-col-chat">
        <header class="conversa-cabecalho">
          <div>
            <div class="conversa-titulo-linha">
              <h1>Conversa</h1>
              <span class="conversa-id-ceo20" title="Identidade visual temporária">${htmlMarcaCeo20()}</span>
            </div>
            <p class="conversa-subtitulo">Canal principal com o Executivo Digital</p>
            ${htmlContextoCoaActivo()}
          </div>
          <p class="conversa-estado" id="conversa-estado" aria-live="polite">À escuta do próximo passo</p>
        </header>

        <div class="conversa-historico" id="conversa-historico" role="log" aria-relevant="additions" aria-label="Histórico da conversa"></div>

        <form class="conversa-composer" id="conversa-form" autocomplete="off">
          <label class="visually-hidden" for="conversa-input">Instrução para o CEO 2.0</label>
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
              <button type="button" class="conversa-mic" id="conversa-mic" aria-pressed="false" title="CEO 2.0 Ouvindo">
                Ouvindo
              </button>
              <button type="submit" class="conversa-enviar" id="conversa-enviar">Enviar</button>
            </div>
          </div>
        </form>
      </div>

      <aside class="conversa-col-rail" aria-label="Orquestração e resumo">
        <div class="conversa-rail-orq">
          ${htmlPainelOrquestracao()}
        </div>
        ${htmlResumoExecutivo()}
      </aside>
    </div>
  `;

  const historicoEl = root.querySelector("#conversa-historico");
  const form = root.querySelector("#conversa-form");
  const input = root.querySelector("#conversa-input");
  const enviarBtn = root.querySelector("#conversa-enviar");
  const micBtn = root.querySelector("#conversa-mic");
  const estadoEl = root.querySelector("#conversa-estado");

  let enviando = false;
  const pararPainelOrq = ligarPainelOrquestracao(root);

  function pintarHistorico() {
    historicoEl.innerHTML = listarMensagens().map(renderMensagem).join("");
    ligarBotoesCopiarResposta(historicoEl);
    historicoEl.scrollTop = historicoEl.scrollHeight;
  }

  function definirEstado(texto) {
    estadoEl.innerHTML = htmlComMarcaCeo20(texto);
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

  window.addEventListener(EVENTO_PAUSAR_CEO, () => {
    if (voice.estado() !== ESTADO_TURNO.IDLE) {
      voice.interromper();
      pintarMic(voice.snapshot());
      definirEstado("CEO pausado");
    }
  });

  pintarHistorico();
  sincronizarBotao();

  queueMicrotask(() => input.focus());

  // Cleanup quando o módulo for substituído no workspace
  const obs = new MutationObserver(() => {
    if (!document.body.contains(root) && typeof pararPainelOrq === "function") {
      pararPainelOrq();
      obs.disconnect();
    }
  });
  obs.observe(document.body, { childList: true, subtree: true });

  return root;
}
