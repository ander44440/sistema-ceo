import {
  acrescentarMensagem,
  atualizarMensagem,
  criarMensagem,
  listarMensagens,
  temHistorico
} from "./store.js";
import { executiveEngine } from "../../executiveEngine/index.js";

const MENSAGEM_BOAS_VINDAS =
  "Sou o CEO — o Executivo Digital desta organização. " +
  "Acompanho o contexto ativo, as decisões em curso e o progresso do trabalho. " +
  "Estou pronto para receber suas instruções e conduzi-las com você.";

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
      <p class="conversa-estado" id="conversa-estado" aria-live="polite">Pronto para instruções</p>
    </header>

    <div class="conversa-historico" id="conversa-historico" role="log" aria-relevant="additions" aria-label="Histórico da conversa"></div>

    <form class="conversa-composer" id="conversa-form" autocomplete="off">
      <label class="visually-hidden" for="conversa-input">Instrução para o CEO</label>
      <textarea
        id="conversa-input"
        name="instrucao"
        rows="2"
        maxlength="8000"
        placeholder="Envie uma instrução, objetivo ou pedido de trabalho…"
        aria-describedby="conversa-hint"
      ></textarea>
      <div class="conversa-composer-bar">
        <p class="conversa-hint" id="conversa-hint">Enter envia · Shift+Enter nova linha</p>
        <button type="submit" class="conversa-enviar" id="conversa-enviar">Enviar</button>
      </div>
    </form>
  `;

  const historicoEl = root.querySelector("#conversa-historico");
  const form = root.querySelector("#conversa-form");
  const input = root.querySelector("#conversa-input");
  const enviarBtn = root.querySelector("#conversa-enviar");
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

  /**
   * Envia instrução ao Executive Engine (único ponto de coordenação).
   * @param {string} textoBruto
   */
  async function enviarInstrucao(textoBruto) {
    const texto = textoBruto.trim();
    if (!texto || enviando) return;

    enviando = true;
    sincronizarBotao();
    definirEstado("Núcleo Executivo em ação…");

    acrescentarMensagem(
      criarMensagem({
        papel: "usuario",
        texto
      })
    );
    input.value = "";
    sincronizarBotao();
    pintarHistorico();

    const placeholder = acrescentarMensagem(
      criarMensagem({
        papel: "ceo",
        texto: "…",
        estado: "pendente"
      })
    );
    pintarHistorico();

    try {
      const resposta = await executiveEngine.executar({
        texto,
        historico: listarMensagens()
          .filter((m) => m.id !== placeholder.id)
          .map((m) => ({ papel: m.papel, texto: m.texto }))
      });

      atualizarMensagem(placeholder.id, {
        texto: resposta.mensagem,
        estado: resposta.ok ? "pronta" : "erro",
        papel: resposta.ok ? "ceo" : "sistema"
      });
      definirEstado(
        resposta.ok
          ? `Via ${resposta.capacidade || "núcleo"} · pronto`
          : "Falha no Núcleo Executivo"
      );
    } catch (err) {
      atualizarMensagem(placeholder.id, {
        papel: "sistema",
        texto:
          "Não foi possível processar a instrução nesta sessão. " +
          (err && err.message ? err.message : "Erro desconhecido."),
        estado: "erro"
      });
      definirEstado("Falha no processamento");
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

  pintarHistorico();
  sincronizarBotao();

  queueMicrotask(() => input.focus());

  return root;
}
