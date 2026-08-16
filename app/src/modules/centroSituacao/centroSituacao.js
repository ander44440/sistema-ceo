import { lerMemoria } from "../../executiveMemory/index.js";
import { executiveEngine } from "../../executiveEngine/index.js";
import {
  prepararGestoEnvio,
  reproduzirRespostaCeo
} from "../../experienciaVoz/reproduzirResposta.js";
import {
  acrescentarMensagem,
  atualizarMensagem,
  criarMensagem,
  listarMensagens,
  temHistorico
} from "../conversa/store.js";
import { htmlFaixaDoDia, ligarFaixaDoDia } from "./faixaDoDia.js";
import {
  cardsPrioridadeDoPainel,
  htmlRailDiaAtivo,
  obterVistaDiaAtivo
} from "./painelDiaAtivo.js";
import { lerDestaquesDeliberacao } from "../../mre/canais/centroSituacaoDeliberacao.js";
import { textoBoasVindasNatural } from "../../conversacaoNatural/index.js";
import { sanitizarProsaUsuario } from "../../conversacaoNatural/sanitizarProsa.js";
import {
  htmlPainelOrquestracao,
  ligarPainelOrquestracao
} from "../../orquestracao/ui.js";
import { htmlBlocoMepC3 } from "./blocoMepC3.js";

function htmlDeliberacaoNatural(dados) {
  if (!dados || !Array.isArray(dados.destaques) || !dados.destaques.length) {
    return "";
  }
  const destaques = dados.destaques
    .map((d) => sanitizarProsaUsuario(String(d)))
    .filter((d) => d && !/^Decisão\s*:/i.test(d));
  if (!destaques.length) return "";
  const itens = destaques
    .map(
      (d) =>
        `<li>${String(d)
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")}</li>`
    )
    .join("");
  return `<section class="centro-deliberacao" aria-label="Último avanço">
    <h3>Último avanço</h3>
    <ul>${itens}</ul>
  </section>`;
}

function escaparHtml(texto) {
  return String(texto)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatarData(iso) {
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    })
      .format(iso ? new Date(iso) : new Date())
      .toUpperCase();
  } catch {
    return "—";
  }
}

function formatarHora(iso) {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date(iso));
  } catch {
    return "—";
  }
}

function relativo(iso) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.round(diff / 60000);
  if (min < 1) return "agora";
  if (min < 60) return `há ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `há ${h} h`;
  return formatarData(iso);
}

function saudacaoPorHora() {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 19) return "Boa tarde";
  return "Boa noite";
}

/**
 * Centro de Situação — UX inspirada na referência do posto de comando.
 */
export function montarCentroSituacao() {
  if (!temHistorico()) {
    acrescentarMensagem(
      criarMensagem({
        papel: "ceo",
        texto: textoBoasVindasNatural({
          cumprimento: saudacaoPorHora(),
          frenteAtiva: lerMemoria()?.projetoAtivo?.nome || null
        })
      })
    );
  }

  const root = document.createElement("section");
  root.className = "centro-situacao";
  root.dataset.module = "dashboard";
  root.setAttribute("aria-label", "Centro de Situação");

  let enviando = false;
  /** @type {"abrir"|"encerrar"|null} */
  let painelDia = null;
  /** @type {null | (() => void)} */
  let pararPainelOrq = null;

  function pintar() {
    if (pararPainelOrq) {
      pararPainelOrq();
      pararPainelOrq = null;
    }
    const mem = lerMemoria();
    const vista = obterVistaDiaAtivo();
    const ultima = (mem.ultimasAcoes || [])[0];
    const projetos = mem.projetosAtivos || [];
    const acoes = (mem.ultimasAcoes || []).slice(0, 5);
    const msgs = listarMensagens().slice(-3);
    const cardsPrioridade = cardsPrioridadeDoPainel(vista.painel);
    const ativoId = vista.projeto?.id;

    root.innerHTML = `
      <div class="cs-layout">
        <div class="cs-main">
          <header class="cs-hero">
            <div class="cs-hero-copy">
              <h1>${saudacaoPorHora()}, CEO.</h1>
              <p>Posto de comando ativo. Continuo a acompanhar a organização — vamos seguir.</p>
            </div>
            <div class="cs-hero-meta">
              <strong>${formatarData()}</strong>
              <span>Última análise · ${
                ultima ? formatarHora(ultima.quando) : "aguardando"
              }</span>
            </div>
          </header>

          ${htmlFaixaDoDia(painelDia)}

          ${htmlDeliberacaoNatural(lerDestaquesDeliberacao())}

          ${htmlBlocoMepC3()}

          <section class="cs-chat" aria-label="Conversa com o Executivo Digital">
            <div class="cs-chat-head">
              <div class="cs-wave" aria-hidden="true"></div>
              <div>
                <strong>CEO · Executivo Digital</strong>
                <p>Pronto. Qual frente atacamos agora?</p>
              </div>
            </div>
            <div class="cs-chat-log" id="cs-log">
              ${msgs
                .map(
                  (m) => `
                <article class="cs-bubble cs-bubble--${m.papel}">
                  <span>${m.papel === "usuario" ? "Você" : "CEO"}</span>
                  <p>${escaparHtml(m.texto)}</p>
                </article>`
                )
                .join("")}
            </div>
            <form class="cs-composer" id="cs-form" autocomplete="off">
              <label class="visually-hidden" for="cs-input">Comando para o CEO</label>
              <input id="cs-input" type="text" maxlength="8000" placeholder="Faça sua pergunta ou comando…" />
              <button type="submit" class="cs-send" id="cs-enviar">Enviar</button>
            </form>
            <div class="cs-chips">
              <button type="button" class="cs-chip" data-dia-acao="abrir">Abrir o dia</button>
              <button type="button" class="cs-chip" data-dia-acao="encerrar">Encerrar o dia</button>
              <button type="button" class="cs-chip" data-cmd="Qual é o estado atual?">Resumo Executivo</button>
              <button type="button" class="cs-chip" data-cmd="Abrir projeto Motoboy Game 2">Abrir Projeto</button>
            </div>
          </section>

          ${htmlPainelOrquestracao()}

          <section class="cs-prioridades" aria-label="Prioridades do dia">
            <div class="cs-section-head">
              <h2>Prioridades do Dia</h2>
            </div>
            <div class="cs-prio-grid">
              ${cardsPrioridade
                .map(
                  (c) => `
                <article class="cs-prio cs-prio--${c.tom}">
                  <p class="cs-prio-n">${typeof c.n === "number" ? c.n : escaparHtml(String(c.n))}</p>
                  <h3>${escaparHtml(c.titulo)}</h3>
                  <p>${escaparHtml(c.desc)}</p>
                  <button type="button" class="cs-prio-link" data-cmd="Qual é o estado atual?">Ver agora →</button>
                </article>`
                )
                .join("")}
            </div>
          </section>

          <section class="cs-atividade" aria-label="Atividades recentes">
            <div class="cs-section-head">
              <h2>Atividades Recentes</h2>
            </div>
            <ul class="cs-activity-list">
              ${
                acoes.length
                  ? acoes
                      .map(
                        (a) => `
                <li>
                  <div class="cs-activity-icon" aria-hidden="true"></div>
                  <div>
                    <strong>${escaparHtml(a.instrucao || a.resumo)}</strong>
                    <span>${relativo(a.quando)} · ${escaparHtml(a.capacidade)}</span>
                  </div>
                  <em class="cs-tag ${a.ok ? "is-ok" : "is-warn"}">${a.ok ? "REGISTADO" : "FALHA"}</em>
                </li>`
                      )
                      .join("")
                  : `<li class="cs-activity-empty">Sem atividade nesta sessão — envie o primeiro comando.</li>`
              }
            </ul>
          </section>
        </div>

        <aside class="cs-rail" aria-label="Inteligência e acompanhamento">
          ${htmlRailDiaAtivo(vista)}

          <article class="cs-panel">
            <p class="cs-kicker">Projetos Acompanhados</p>
            <ul class="cs-projects">
              ${
                projetos.length
                  ? projetos
                      .map((p) => {
                        const inicial = p.nome.slice(0, 1).toUpperCase();
                        const ativo = p.id === ativoId;
                        return `
                    <li class="${ativo ? "is-ativo" : ""}">
                      <div class="cs-proj-avatar">${escaparHtml(inicial)}</div>
                      <div class="cs-proj-body">
                        <strong>${escaparHtml(p.nome)}</strong>
                        <span>${ativo ? "Projeto ativo" : "Em catálogo"}</span>
                      </div>
                      <div class="cs-proj-meta">
                        ${ativo ? "<strong>ATIVO</strong>" : "<strong>—</strong>"}
                        <i class="cs-online-dot" title="Online"></i>
                      </div>
                    </li>`;
                      })
                      .join("")
                  : `<li class="cs-activity-empty">Nenhum projeto no catálogo.</li>`
              }
            </ul>
          </article>
        </aside>
      </div>
    `;

    ligarEventos();
    pararPainelOrq = ligarPainelOrquestracao(root);
  }

  function ligarEventos() {
    ligarFaixaDoDia(root, {
      getPainel: () => painelDia,
      setPainel: (v) => {
        painelDia = v;
      },
      repintar: pintar
    });

    const form = root.querySelector("#cs-form");
    const input = root.querySelector("#cs-input");
    const btn = root.querySelector("#cs-enviar");

    function syncBtn() {
      if (!btn || !input) return;
      btn.disabled = enviando || !input.value.trim();
    }

    async function enviar(textoForcado) {
      const texto = (textoForcado || input.value).trim();
      if (!texto || enviando) return;
      enviando = true;
      syncBtn();
      // Gesto de envio: unlock de sessão (se voz Ativa) antes do await
      prepararGestoEnvio();

      acrescentarMensagem(criarMensagem({ papel: "usuario", texto }));
      input.value = "";
      const placeholder = acrescentarMensagem(
        criarMensagem({ papel: "ceo", texto: "…", estado: "pendente" })
      );

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
        // PX-002 E4: mesmo comportamento de voz que a Conversa
        if (resposta.ok) {
          const textoVoz =
            (resposta.dados && resposta.dados.textoVoz) || resposta.mensagem;
          void reproduzirRespostaCeo(textoVoz);
        }
      } catch (err) {
        atualizarMensagem(placeholder.id, {
          papel: "sistema",
          texto:
            "Não foi possível processar o comando. " +
            (err && err.message ? err.message : ""),
          estado: "erro"
        });
      } finally {
        enviando = false;
        pintar();
        const novo = root.querySelector("#cs-input");
        if (novo) novo.focus();
      }
    }

    if (form && input && btn) {
      form.addEventListener("submit", (ev) => {
        ev.preventDefault();
        enviar();
      });
      input.addEventListener("input", syncBtn);
      syncBtn();
    }

    root.querySelectorAll("[data-cmd]").forEach((el) => {
      el.addEventListener("click", () => enviar(el.getAttribute("data-cmd")));
    });
  }

  pintar();
  queueMicrotask(() => {
    const input = root.querySelector("#cs-input");
    if (input) input.focus();
  });

  return root;
}
