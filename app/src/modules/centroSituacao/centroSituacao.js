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
import {
  htmlFaixaDoDia,
  ligarFaixaDoDia
} from "./faixaDoDia.js";
import {
  cardsPrioridadeDoPainel,
  obterVistaDiaAtivo
} from "./painelDiaAtivo.js";
import { lerDestaquesDeliberacao } from "../../mre/canais/centroSituacaoDeliberacao.js";
import { textoBoasVindasNatural } from "../../conversacaoNatural/index.js";
import { sanitizarProsaUsuario } from "../../conversacaoNatural/sanitizarProsa.js";
import { tomEstadoExecutivo } from "../../catalogoProjetos/estadoExecutivo.js";
import { navegar } from "../../router.js";

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
  return formatarHora(iso);
}

function saudacaoPorHora() {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 19) return "Boa tarde";
  return "Boa noite";
}

function progressoMissao(painel) {
  if (!painel?.metricas) return 0;
  const m = painel.metricas;
  const total = m.decisoes + m.pendencias + m.proximasAcoes;
  if (!total) return 12;
  const feitos = m.decisoes;
  return Math.max(8, Math.min(92, Math.round((feitos / Math.max(total, 1)) * 100)));
}

function passosMissao(projeto) {
  const acoes = (projeto?.proximasAcoes || []).slice(0, 3);
  const passos = [];
  if ((projeto?.decisoes || []).length > 0) {
    passos.push({ label: "Decisões registadas", estado: "feito" });
  }
  if (acoes[0]) {
    passos.push({ label: acoes[0].texto || "Próxima acção", estado: "curso" });
  }
  if (acoes[1]) {
    passos.push({ label: acoes[1].texto || "Seguinte", estado: "pendente" });
  }
  if (acoes[2]) {
    passos.push({ label: acoes[2].texto || "Validação", estado: "pendente" });
  }
  const defaults = [
    "Organizar frente activa",
    "Executar próxima acção",
    "Testes",
    "Validação"
  ];
  while (passos.length < 4) {
    passos.push({
      label: defaults[passos.length],
      estado: passos.length === 0 ? "curso" : "pendente"
    });
  }
  return passos.slice(0, 4);
}

/**
 * Centro de Situação — posto de comando (layout referência).
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

  function pintar() {
    const mem = lerMemoria();
    const vista = obterVistaDiaAtivo();
    const acoes = (mem.ultimasAcoes || []).slice(0, 5);
    const msgs = listarMensagens().slice(-2);
    const cardsPrioridade = cardsPrioridadeDoPainel(vista.painel);
    const projeto = vista.projeto;
    const painel = vista.painel;
    const m = painel?.metricas || {
      decisoes: 0,
      pendencias: 0,
      proximasAcoes: 0
    };
    const estado = painel?.estadoExecutivo || "Estável";
    const tom = tomEstadoExecutivo(estado);
    const badgeTom =
      tom === "critico"
        ? "critico"
        : tom === "atencao"
          ? "atencao"
          : tom === "andamento"
            ? "andamento"
            : "estavel";
    const pct = progressoMissao(painel);
    const passos = passosMissao(projeto);
    const proximas = (projeto?.proximasAcoes || []).slice(0, 3);
    const foco =
      projeto?.diaExecutivo?.intencaoDoDia || "Sem foco definido";
    const proximaAcao =
      proximas[0]?.texto ||
      painel?.proximaAcao ||
      "Sem próxima acção registada.";

    root.innerHTML = `
      <div class="cs-cmd">
        ${htmlFaixaDoDia(painelDia)}
        ${htmlDeliberacaoNatural(lerDestaquesDeliberacao())}

        <div class="cs-cmd-top">
          <article class="cs-card cs-missao" aria-label="Missão activa">
            <div class="cs-missao-head">
              <div class="cs-missao-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="7" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.6"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
              </div>
              <div class="cs-missao-titles">
                <p class="cs-kicker">Missão activa</p>
                <h2>${escaparHtml(projeto?.nome || "Sem projeto activo")}</h2>
              </div>
              <span class="cs-pill cs-pill--exec">EXECUTANDO</span>
            </div>
            <p class="cs-missao-desc">${escaparHtml(
              String(vista.resumo || "")
                .split("\n")
                .filter(Boolean)[0] ||
                "Organize o contexto activo e avance a próxima frente."
            )}</p>
            <div class="cs-missao-grid">
              <div>
                <p class="cs-kicker">Próxima acção</p>
                <p>${escaparHtml(proximaAcao)}</p>
              </div>
              <div>
                <p class="cs-kicker">Foco actual</p>
                <p>${escaparHtml(foco)}</p>
              </div>
            </div>
            <button type="button" class="cs-link-btn" data-cmd="Qual é o estado atual?">Ver detalhes da missão →</button>
          </article>

          <article class="cs-card cs-progresso" aria-label="Progresso da missão">
            <p class="cs-kicker">Progresso da missão</p>
            <div class="cs-progresso-body">
              <div class="cs-ring" style="--pct:${pct}" aria-label="${pct}%">
                <strong>${pct}%</strong>
              </div>
              <ol class="cs-steps">
                ${passos
                  .map(
                    (p, i) => `
                  <li class="is-${p.estado}">
                    <span class="cs-step-n">${i + 1}</span>
                    <span>${escaparHtml(p.label)}</span>
                  </li>`
                  )
                  .join("")}
              </ol>
            </div>
          </article>

          <article class="cs-card cs-estado" aria-label="Estado executivo">
            <div class="cs-estado-head">
              <p class="cs-kicker">Estado Executivo</p>
              <strong class="cs-estado-badge cs-estado-badge--${badgeTom}">${escaparHtml(
                estado
              ).toUpperCase()}</strong>
            </div>
            <div class="cs-gauge cs-gauge--${
              badgeTom === "critico"
                ? "danger"
                : badgeTom === "atencao"
                  ? "warn"
                  : "ok"
            }" style="--gauge:${
              badgeTom === "critico" ? 82 : badgeTom === "atencao" ? 58 : 28
            }">
              <div class="cs-gauge-arc" aria-hidden="true"></div>
              <div class="cs-gauge-label">
                <strong>${escaparHtml(estado)}</strong>
                <span>${
                  badgeTom === "critico"
                    ? "Atenção alta"
                    : badgeTom === "atencao"
                      ? "Requer acompanhamento"
                      : "Sob controlo"
                }</span>
              </div>
            </div>
            <div class="cs-kpis">
              <div><span>Decisões</span><strong>${m.decisoes}</strong></div>
              <div><span>Pendências</span><strong>${m.pendencias}</strong></div>
              <div><span>Ações</span><strong>${m.proximasAcoes}</strong></div>
            </div>
          </article>
        </div>

        <div class="cs-cmd-mid">
          <section class="cs-card cs-decisoes" aria-label="Centro de Decisões">
            <div>
              <p class="cs-kicker">Centro de Decisões</p>
              <p>Registe uma decisão ou peça ao CEO uma recomendação operacional sobre a frente activa.</p>
            </div>
            <button type="button" class="cs-cta" id="cs-fazer-decisao">Fazer uma decisão</button>
          </section>
        </div>

        <section class="cs-card cs-chat" aria-label="Comando ao Executivo Digital">
          <div class="cs-chat-head">
            <div class="cs-wave" aria-hidden="true"></div>
            <div>
              <strong>Comando rápido</strong>
              <p>Pergunte ou ordene — o posto de comando responde.</p>
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
          </div>
        </section>

        <div class="cs-cmd-bot">
          <section class="cs-card cs-prioridades" aria-label="Prioridades do dia">
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
                </article>`
                )
                .join("")}
            </div>
          </section>

          <section class="cs-card cs-atividade" aria-label="Atividades recentes">
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
                  <time>${formatarHora(a.quando)}</time>
                  <div>
                    <strong>${escaparHtml(a.instrucao || a.resumo)}</strong>
                    <span>${relativo(a.quando)} · ${escaparHtml(a.capacidade)}</span>
                  </div>
                  <em class="cs-tag ${a.ok ? "is-ok" : "is-warn"}">${a.ok ? "REGISTADO" : "ERRO"}</em>
                </li>`
                      )
                      .join("")
                  : `<li class="cs-activity-empty">Sem atividade nesta sessão.</li>`
              }
            </ul>
          </section>

          <section class="cs-card cs-proximas" aria-label="Próximas ações">
            <div class="cs-section-head">
              <h2>Próximas Ações</h2>
            </div>
            <ol class="cs-proximas-list">
              ${
                proximas.length
                  ? proximas
                      .map(
                        (a, i) => `
                <li>
                  <span class="cs-proximas-n">${i + 1}</span>
                  <p>${escaparHtml(a.texto)}</p>
                  <em class="cs-tag ${i === 0 ? "is-now" : "is-next"}">${
                          i === 0 ? "AGORA" : "EM SEGUIDA"
                        }</em>
                </li>`
                      )
                      .join("")
                  : `<li class="cs-activity-empty">Nenhuma próxima acção na fila.</li>`
              }
            </ol>
          </section>
        </div>
      </div>
    `;

    ligarEventos();
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
        if (resposta.ok) {
          const textoVoz =
            (resposta.dados && resposta.dados.textoVoz) || resposta.mensagem;
          void reproduzirRespostaCeo(textoVoz);
          // Relato/encerramento: abrir painel com #cs-dia-* preenchidos via continuidade
          if (
            resposta.modo === "relato_encerramento" ||
            resposta.dados?.origemCampos === "estado_operacional" ||
            resposta.dados?.continuidade
          ) {
            painelDia = "encerrar";
            try {
              window.dispatchEvent(
                new CustomEvent("ceo:continuidade-dia", {
                  detail: resposta.dados?.continuidade || null
                })
              );
            } catch {
              /* no-op */
            }
          }
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

    root.querySelector("#cs-fazer-decisao")?.addEventListener("click", () => {
      navegar("conversa");
    });
  }

  pintar();
  queueMicrotask(() => {
    const input = root.querySelector("#cs-input");
    if (input) input.focus();
  });

  function onContinuidadeDia() {
    painelDia = "encerrar";
    pintar();
  }
  window.addEventListener("ceo:continuidade-dia", onContinuidadeDia);

  return root;
}
