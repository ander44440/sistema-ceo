/**
 * Módulo Projetos — dashboard executivo do projeto ativo (Onda 02).
 * Catálogo + painel numa única vista; sem redesign de shell.
 */

import {
  criarProjeto,
  listarProjetos,
  obterPainelExecutivo,
  obterProjetoAtivo,
  registrarDecisao,
  registrarPendencia,
  registrarProximaAcao,
  selecionarProjeto
} from "../../catalogoProjetos/index.js";
import { tomEstadoExecutivo } from "../../catalogoProjetos/estadoExecutivo.js";

function escaparHtml(texto) {
  return String(texto)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatarData(iso) {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date(iso));
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

function listaHtml(itens, vazio) {
  if (!itens.length) {
    return `<p class="meta">${escaparHtml(vazio)}</p>`;
  }
  return `<ul class="proj-lista-itens">${itens
    .map(
      (item) =>
        `<li><span>${escaparHtml(item.texto)}</span><time>${escaparHtml(
          formatarData(item.quando)
        )}</time></li>`
    )
    .join("")}</ul>`;
}

function painelHtml(ativo, painel) {
  if (!ativo || !painel) {
    return `<p class="meta">Selecione um projeto no catálogo para abrir o dashboard executivo.</p>`;
  }

  const m = painel.metricas;
  const tom = tomEstadoExecutivo(painel.estadoExecutivo);
  const resumoLinhas = String(painel.resumoExecutivo || "")
    .split("\n")
    .map((l) => `<p>${escaparHtml(l)}</p>`)
    .join("");

  const timeline =
    painel.linhaDoTempo.length === 0
      ? `<p class="meta">Nenhum evento ainda.</p>`
      : `<ol class="proj-timeline">${painel.linhaDoTempo
          .map(
            (ev) => `
        <li>
          <time datetime="${escaparHtml(ev.quando)}">${escaparHtml(
            formatarHora(ev.quando)
          )}</time>
          <div>
            <strong>${escaparHtml(ev.rotulo)}</strong>
            ${
              ev.detalhe
                ? `<span>${escaparHtml(ev.detalhe)}</span>`
                : ""
            }
          </div>
        </li>`
          )
          .join("")}</ol>`;

  return `
    <div class="proj-dashboard" data-estado="${escaparHtml(tom)}">
      <header class="proj-dash-head">
        <div>
          <p class="workspace-kicker">Dashboard executivo</p>
          <h2>${escaparHtml(ativo.nome)}</h2>
        </div>
        <span class="proj-estado proj-estado--${escaparHtml(tom)}">${escaparHtml(
          painel.estadoExecutivo
        )}</span>
      </header>

      <div class="proj-metricas" aria-label="Métricas do projeto">
        <div><strong>${m.decisoes}</strong><span>Decisões</span></div>
        <div><strong>${m.pendencias}</strong><span>Pendências</span></div>
        <div><strong>${m.proximasAcoes}</strong><span>Próximas ações</span></div>
        <div><strong>${escaparHtml(
          formatarData(m.ultimaAtividadeEm)
        )}</strong><span>Última atividade</span></div>
      </div>

      <section class="proj-resumo" aria-label="Resumo executivo">
        <h3>Resumo executivo</h3>
        ${resumoLinhas}
      </section>

      <div class="proj-grid">
        <section>
          <h3>Decisões</h3>
          ${listaHtml(ativo.decisoes || [], "Nenhuma decisão registrada.")}
          <form data-reg="decisao" class="proj-reg">
            <input name="texto" type="text" required placeholder="Registrar decisão…" autocomplete="off" />
            <button type="submit" class="proj-btn">Registrar</button>
          </form>
        </section>
        <section>
          <h3>Pendências</h3>
          ${listaHtml(
            (ativo.pendencias || []).filter((p) => p.status === "aberta"),
            "Nenhuma pendência aberta."
          )}
          <form data-reg="pendencia" class="proj-reg">
            <input name="texto" type="text" required placeholder="Criar pendência…" autocomplete="off" />
            <button type="submit" class="proj-btn">Criar</button>
          </form>
        </section>
        <section>
          <h3>Próximas ações</h3>
          ${listaHtml(
            ativo.proximasAcoes || [],
            "Nenhuma próxima ação registrada."
          )}
          <form data-reg="proxima" class="proj-reg">
            <input name="texto" type="text" required placeholder="Registrar próxima ação…" autocomplete="off" />
            <button type="submit" class="proj-btn">Registrar</button>
          </form>
        </section>
        <section>
          <h3>Linha do tempo</h3>
          ${timeline}
        </section>
      </div>
    </div>
  `;
}

/**
 * @returns {HTMLElement}
 */
export function montarProjetos() {
  const root = document.createElement("section");
  root.className = "workspace-module proj-modulo";
  root.dataset.module = "projetos";
  root.setAttribute("aria-label", "Projetos");

  function pintar() {
    const catalogo = listarProjetos();
    const ativo = obterProjetoAtivo();
    const painel = obterPainelExecutivo();

    root.innerHTML = `
      <p class="workspace-kicker">Módulo do posto de comando</p>
      <h1>Projetos</h1>
      <p>Ambiente de trabalho executivo do projeto ativo — estado, resumo e histórico numa única vista.</p>

      <div class="proj-catalogo">
        <h2>Catálogo</h2>
        <div class="proj-cards">
          ${catalogo
            .map(
              (p) => `
            <article class="proj-card${p.ativo ? " is-ativo" : ""}" data-proj-id="${escaparHtml(p.id)}">
              <header>
                <h3>${escaparHtml(p.nome)}</h3>
                ${p.ativo ? '<span class="proj-badge">Ativo</span>' : ""}
              </header>
              <p>${escaparHtml(p.descricao || "Sem descrição.")}</p>
              <p class="meta">Última atividade: ${escaparHtml(
                formatarData(p.ultimaAtividadeEm)
              )}</p>
              ${
                p.ativo
                  ? ""
                  : `<button type="button" class="proj-btn" data-ativar="${escaparHtml(p.id)}">Abrir</button>`
              }
            </article>`
            )
            .join("")}
        </div>
        <form class="proj-novo" id="proj-form-novo">
          <label class="meta" for="proj-nome">Novo projeto</label>
          <div class="proj-novo-row">
            <input id="proj-nome" name="nome" type="text" required placeholder="Nome do projeto" autocomplete="off" />
            <input id="proj-desc" name="descricao" type="text" placeholder="Descrição (opcional)" autocomplete="off" />
            <button type="submit" class="proj-btn">Criar</button>
          </div>
        </form>
      </div>

      ${painelHtml(ativo, painel)}
    `;

    root.querySelectorAll("[data-ativar]").forEach((btn) => {
      btn.addEventListener("click", () => {
        selecionarProjeto(btn.getAttribute("data-ativar"));
        pintar();
      });
    });

    const formNovo = root.querySelector("#proj-form-novo");
    formNovo?.addEventListener("submit", (ev) => {
      ev.preventDefault();
      const nome = root.querySelector("#proj-nome").value.trim();
      const descricao = root.querySelector("#proj-desc").value.trim();
      if (!nome) return;
      criarProjeto({ nome, descricao });
      pintar();
    });

    root.querySelectorAll("form[data-reg]").forEach((form) => {
      form.addEventListener("submit", (ev) => {
        ev.preventDefault();
        const tipo = form.getAttribute("data-reg");
        const texto = new FormData(form).get("texto");
        const limpo = String(texto || "").trim();
        if (!limpo) return;
        if (tipo === "decisao") registrarDecisao(limpo, "modulo-projetos");
        else if (tipo === "pendencia") registrarPendencia(limpo);
        else if (tipo === "proxima") registrarProximaAcao(limpo);
        pintar();
      });
    });
  }

  pintar();
  return root;
}
