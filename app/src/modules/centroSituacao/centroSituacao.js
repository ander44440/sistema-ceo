import { lerMemoria } from "../../executiveMemory/index.js";
import { executiveEngine } from "../../executiveEngine/index.js";
import {
  acrescentarMensagem,
  atualizarMensagem,
  criarMensagem,
  listarMensagens,
  temHistorico
} from "../conversa/store.js";

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

function riscoSessao(mem) {
  const pens = (mem.pendencias || []).filter((p) => p.status === "aberta").length;
  const dec = (mem.decisoes || []).length;
  if (pens >= 5) return { label: "Elevado", nivel: 78, tom: "danger" };
  if (pens >= 2 || dec >= 2) return { label: "Moderado", nivel: 54, tom: "warn" };
  if ((mem.ultimasAcoes || []).length) return { label: "Controlado", nivel: 28, tom: "ok" };
  return { label: "Estável", nivel: 18, tom: "ok" };
}

function metricasStub(mem) {
  const base = Math.min(96, 70 + (mem.ultimasAcoes || []).length * 3);
  return [
    { nome: "Eficiência", valor: Math.min(96, base + 4), tom: "ok" },
    { nome: "Execução", valor: Math.min(98, base + 8), tom: "ok" },
    { nome: "Conformidade", valor: Math.max(62, base - 12), tom: "warn" }
  ];
}

/**
 * Centro de Situação — UX inspirada na referência do posto de comando.
 */
export function montarCentroSituacao() {
  if (!temHistorico()) {
    acrescentarMensagem(
      criarMensagem({
        papel: "ceo",
        texto:
          "Olá. Sou o CEO — o Executivo Digital desta organização. Em que posso ajudar você hoje?"
      })
    );
  }

  const root = document.createElement("section");
  root.className = "centro-situacao";
  root.dataset.module = "dashboard";
  root.setAttribute("aria-label", "Centro de Situação");

  let enviando = false;

  function pintar() {
    const mem = lerMemoria();
    const ultima = (mem.ultimasAcoes || [])[0];
    const pens = (mem.pendencias || []).filter((p) => p.status === "aberta");
    const decisoes = mem.decisoes || [];
    const projetos = mem.projetosAtivos || [];
    const acoes = (mem.ultimasAcoes || []).slice(0, 5);
    const risco = riscoSessao(mem);
    const kpis = metricasStub(mem);
    const msgs = listarMensagens().slice(-3);

    const nCrit = pens.filter((p) =>
      /crític|critic|urgente|bloque/i.test(p.texto)
    ).length;
    const cardsPrioridade = [
      {
        tom: "danger",
        n: nCrit || (pens.length ? Math.min(pens.length, 3) : 0),
        titulo: "Criticidades",
        desc: pens.length ? "Exigem ação imediata" : "Nenhuma criticidade aberta"
      },
      {
        tom: "warn",
        n: pens.length,
        titulo: "Pendências",
        desc: pens.length ? "Aguardando deliberação" : "Quadro limpo nesta sessão"
      },
      {
        tom: "ok",
        n: decisoes.length,
        titulo: "Decisões",
        desc: decisoes.length ? "Registadas na sessão" : "Sem decisões ainda"
      },
      {
        tom: "brand",
        n: projetos.length,
        titulo: "Projetos",
        desc: projetos.length ? "Em acompanhamento" : "Sem projetos ativos"
      }
    ];

    root.innerHTML = `
      <div class="cs-layout">
        <div class="cs-main">
          <header class="cs-hero">
            <div class="cs-hero-copy">
              <h1>${saudacaoPorHora()}, CEO.</h1>
              <p>O posto de comando está ativo. Eu acompanho a organização e conduzo o próximo passo consigo.</p>
            </div>
            <div class="cs-hero-meta">
              <strong>${formatarData()}</strong>
              <span>Última análise · ${
                ultima ? formatarHora(ultima.quando) : "aguardando"
              }</span>
            </div>
          </header>

          <section class="cs-chat" aria-label="Conversa com o Executivo Digital">
            <div class="cs-chat-head">
              <div class="cs-wave" aria-hidden="true"></div>
              <div>
                <strong>CEO · Executivo Digital</strong>
                <p>Olá, CEO. Em que posso ajudar você hoje?</p>
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
              <button type="button" class="cs-chip" data-cmd="Abrir projeto Motoboy Game 2">Abrir Projeto</button>
              <button type="button" class="cs-chip" data-cmd="Analisar pendências da sessão">Analisar Pendências</button>
              <button type="button" class="cs-chip" data-cmd="Qual é o estado atual?">Resumo Executivo</button>
              <button type="button" class="cs-chip" data-cmd="Consultar conhecimento do contexto ativo">Buscar no Acervo</button>
            </div>
          </section>

          <section class="cs-prioridades" aria-label="Prioridades do dia">
            <div class="cs-section-head">
              <h2>Prioridades do Dia</h2>
            </div>
            <div class="cs-prio-grid">
              ${cardsPrioridade
                .map(
                  (c) => `
                <article class="cs-prio cs-prio--${c.tom}">
                  <p class="cs-prio-n">${c.n}</p>
                  <h3>${c.titulo}</h3>
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
          <article class="cs-panel">
            <p class="cs-kicker">Inteligência Executiva</p>
            <p class="cs-intel-text">${escaparHtml(
              mem.proximoPasso ||
                "Ainda sem leitura consolidada. Use a conversa para eu analisar a organização."
            )}</p>
            <div class="cs-gauge cs-gauge--${risco.tom}" style="--gauge:${risco.nivel}">
              <div class="cs-gauge-arc" aria-hidden="true"></div>
              <div class="cs-gauge-label">
                <strong>${risco.label}</strong>
                <span>Risco geral</span>
              </div>
            </div>
            <div class="cs-kpis">
              ${kpis
                .map(
                  (k) => `
                <div>
                  <span>${k.nome}</span>
                  <strong class="is-${k.tom}">${k.valor}%</strong>
                </div>`
                )
                .join("")}
            </div>
          </article>

          <article class="cs-panel">
            <p class="cs-kicker">Agenda do Dia</p>
            <ul class="cs-agenda">
              <li><i class="is-brand"></i><div><strong>10:30</strong><span>Revisão do posto de comando</span></div></li>
              <li><i class="is-warn"></i><div><strong>14:00</strong><span>${escaparHtml(
                mem.proximoPasso || "Deliberar próximo passo"
              )}</span></div></li>
              <li><i class="is-ok"></i><div><strong>16:30</strong><span>Fecho executivo da sessão</span></div></li>
            </ul>
          </article>

          <article class="cs-panel">
            <p class="cs-kicker">Projetos Acompanhados</p>
            <ul class="cs-projects">
              ${
                projetos.length
                  ? projetos
                      .map((p, idx) => {
                        const pct = [68, 42, 75][idx % 3];
                        const tom = ["ok", "brand", "warn"][idx % 3];
                        const inicial = p.nome.slice(0, 1).toUpperCase();
                        return `
                    <li>
                      <div class="cs-proj-avatar">${escaparHtml(inicial)}</div>
                      <div class="cs-proj-body">
                        <strong>${escaparHtml(p.nome)}</strong>
                        <span>Em acompanhamento</span>
                        <div class="cs-bar"><span class="is-${tom}" style="width:${pct}%"></span></div>
                      </div>
                      <div class="cs-proj-meta">
                        <strong>${pct}%</strong>
                        <i class="cs-online-dot" title="Online"></i>
                      </div>
                    </li>`;
                      })
                      .join("")
                  : `
                <li class="cs-projects-empty">
                  <div class="cs-proj-avatar">C</div>
                  <div class="cs-proj-body">
                    <strong>CEO</strong>
                    <span>Posto de comando</span>
                    <div class="cs-bar"><span class="is-brand" style="width:35%"></span></div>
                  </div>
                  <div class="cs-proj-meta"><strong>35%</strong><i class="cs-online-dot"></i></div>
                </li>
                <li class="cs-projects-empty">
                  <div class="cs-proj-avatar">M</div>
                  <div class="cs-proj-body">
                    <strong>Motoboy Game 2</strong>
                    <span>Contexto operacional</span>
                    <div class="cs-bar"><span class="is-ok" style="width:12%"></span></div>
                  </div>
                  <div class="cs-proj-meta"><strong>—</strong><i class="cs-online-dot"></i></div>
                </li>`
              }
            </ul>
          </article>
        </aside>
      </div>
    `;

    ligarEventos();
  }

  function ligarEventos() {
    const form = root.querySelector("#cs-form");
    const input = root.querySelector("#cs-input");
    const btn = root.querySelector("#cs-enviar");

    function syncBtn() {
      btn.disabled = enviando || !input.value.trim();
    }

    async function enviar(textoForcado) {
      const texto = (textoForcado || input.value).trim();
      if (!texto || enviando) return;
      enviando = true;
      syncBtn();

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

    form.addEventListener("submit", (ev) => {
      ev.preventDefault();
      enviar();
    });
    input.addEventListener("input", syncBtn);
    syncBtn();

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
