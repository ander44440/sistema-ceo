import { listarRotas, navegar, obterRota } from "./router.js";
import { montarBotaoVoz } from "./experienciaVoz/botaoVoz.js";

const NAV_ICONS = Object.freeze({
  dashboard:
    '<svg class="shell-nav-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 4h7v7H4V4Zm9 0h7v5h-7V4ZM4 13h7v7H4v-7Zm9 3h7v4h-7v-4Z" stroke="currentColor" stroke-width="1.6"/></svg>',
  conversa:
    '<svg class="shell-nav-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 6.5A2.5 2.5 0 0 1 7.5 4h9A2.5 2.5 0 0 1 19 6.5v7A2.5 2.5 0 0 1 16.5 16H10l-4 3.5V16H7.5A2.5 2.5 0 0 1 5 13.5v-7Z" stroke="currentColor" stroke-width="1.6"/></svg>',
  capacidades:
    '<svg class="shell-nav-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3 4.5 7.5 12 12l7.5-4.5L12 3Zm-7.5 9L12 16.5 19.5 12M4.5 16.5 12 21l7.5-4.5" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>',
  projetos:
    '<svg class="shell-nav-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H10l2 2h5.5A2.5 2.5 0 0 1 20 9.5v7A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-9Z" stroke="currentColor" stroke-width="1.6"/></svg>',
  conhecimento:
    '<svg class="shell-nav-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 5.5A2.5 2.5 0 0 1 8.5 3H19v14.5H8.5A2.5 2.5 0 0 0 6 20V5.5Zm0 0v12" stroke="currentColor" stroke-width="1.6"/><path d="M9.5 8h6M9.5 11.5h6" stroke="currentColor" stroke-width="1.6"/></svg>',
  configuracoes:
    '<svg class="shell-nav-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="3.2" stroke="currentColor" stroke-width="1.6"/><path d="M12 3.5v2.2M12 18.3v2.2M4.9 6.5l1.6 1.6M17.5 15.9l1.6 1.6M3.5 12h2.2M18.3 12h2.2M4.9 17.5l1.6-1.6M17.5 8.1l1.6-1.6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>'
});

const NAV_LABELS = Object.freeze({
  dashboard: "Centro de Situação",
  conversa: "Conversa",
  capacidades: "Capacidades",
  projetos: "Projetos",
  conhecimento: "Conhecimento",
  configuracoes: "Configurações"
});

const SOON_ITEMS = [
  { titulo: "Decisões", key: "capacidades" },
  { titulo: "Iniciativas", key: "projetos" },
  { titulo: "Ferramentas", key: "configuracoes" },
  { titulo: "Agentes", key: "conversa" },
  { titulo: "Memória", key: "conhecimento" },
  { titulo: "Relatórios", key: "dashboard" }
];

function iconSvg(key) {
  return NAV_ICONS[key] || NAV_ICONS.dashboard;
}
/**
 * Shell permanente — apresentação do posto de comando.
 */
export function montarShell(root) {
  root.innerHTML = `
    <div class="shell" id="shell">
      <aside class="shell-sidebar" id="shell-sidebar" role="navigation" aria-label="Navegação principal">
        <div class="shell-brand-block">
          <div class="shell-mark" aria-hidden="true">CEO</div>
          <div>
            <strong>CEO</strong>
            <span>Sistema Executivo de Governança</span>
          </div>
        </div>
        <p class="shell-nav-label">Navegação</p>
        <div id="shell-nav"></div>
        <div class="shell-shortcuts">
          <p class="shell-nav-label">Atalhos rápidos</p>
          <button type="button" class="shell-shortcut" data-shortcut="projeto"><span class="shell-shortcut-plus">+</span>Novo Projeto</button>
          <button type="button" class="shell-shortcut" data-shortcut="decisao"><span class="shell-shortcut-plus">+</span>Nova Decisão</button>
          <button type="button" class="shell-shortcut" data-shortcut="estado"><span class="shell-shortcut-plus">+</span>Estado atual</button>
        </div>
        <div class="shell-sidebar-foot">
          <span class="shell-sdo-dot" aria-hidden="true"></span>
          <span>SDO — Online</span>
        </div>
      </aside>

      <header class="shell-header" role="banner">
        <div class="shell-header-brand-mobile">
          <button type="button" class="shell-menu-toggle" id="menu-toggle" aria-label="Abrir menu" aria-controls="shell-sidebar" aria-expanded="false">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
          </button>
          <div class="shell-mark" aria-hidden="true">CEO</div>
        </div>
        <button type="button" class="shell-command" id="command-focus" title="Focar conversa">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="11" cy="11" r="6.5" stroke="currentColor" stroke-width="1.6"/><path d="M16 16l4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
          <span>Buscar ou executar comando…</span>
          <kbd>Ctrl K</kbd>
        </button>
        <div class="shell-header-right">
          <div class="shell-header-status" title="Estado do sistema">
            <span class="shell-status-dot" aria-hidden="true"></span>
            <span id="system-status">CEO Online · Executivo Digital ativo</span>
          </div>
          <div id="shell-voice-host" class="shell-voice-host"></div>
          <button type="button" class="shell-icon-btn" id="action-notif" aria-label="Notificações">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 9a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 13 6 9Z" stroke="currentColor" stroke-width="1.6"/><path d="M10 18a2 2 0 0 0 4 0" stroke="currentColor" stroke-width="1.6"/></svg>
            <span class="shell-badge">3</span>
          </button>
          <button type="button" class="shell-icon-btn" id="action-theme" aria-label="Tema">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3v2M12 19v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M3 12h2M19 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="12" cy="12" r="3.5" stroke="currentColor" stroke-width="1.5"/></svg>
          </button>
          <div class="shell-profile" title="Perfil">
            <div class="shell-avatar" aria-hidden="true">A</div>
            <div>
              <strong>Anderson</strong>
              <span>Governança</span>
            </div>
          </div>
        </div>
      </header>

      <div class="shell-backdrop" id="shell-backdrop" hidden></div>
      <main class="shell-workspace" id="workspace" role="main" aria-live="polite"></main>
    </div>
  `;

  const shellEl = root.querySelector("#shell");
  const navEl = root.querySelector("#shell-nav");
  const workspace = root.querySelector("#workspace");
  const toggle = root.querySelector("#menu-toggle");
  const backdrop = root.querySelector("#shell-backdrop");
  const statusEl = root.querySelector("#system-status");
  const voiceHost = root.querySelector("#shell-voice-host");
  const vozUi = voiceHost ? montarBotaoVoz(voiceHost) : null;

  function fecharNav() {
    shellEl.classList.remove("is-nav-open");
    if (toggle) toggle.setAttribute("aria-expanded", "false");
    backdrop.hidden = true;
  }

  function abrirNav() {
    shellEl.classList.add("is-nav-open");
    if (toggle) toggle.setAttribute("aria-expanded", "true");
    backdrop.hidden = false;
  }

  if (toggle) {
    toggle.addEventListener("click", () => {
      if (shellEl.classList.contains("is-nav-open")) fecharNav();
      else abrirNav();
    });
  }
  backdrop.addEventListener("click", fecharNav);

  root.querySelector("#command-focus").addEventListener("click", () => {
    const input =
      document.getElementById("cs-input") ||
      document.getElementById("conversa-input");
    if (input) {
      input.focus();
      return;
    }
    navegar("dashboard");
    queueMicrotask(() => {
      const el = document.getElementById("cs-input");
      if (el) el.focus();
    });
  });

  window.addEventListener("keydown", (ev) => {
    if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === "k") {
      ev.preventDefault();
      root.querySelector("#command-focus").click();
    }
  });

  root.querySelector("#action-notif").addEventListener("click", () => {
    statusEl.textContent = "3 alertas · acompanhamento ativo";
  });
  root.querySelector("#action-theme").addEventListener("click", () => {
    statusEl.textContent = "Tema do posto de comando · escuro executivo";
  });

  root.querySelectorAll("[data-shortcut]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const tipo = btn.getAttribute("data-shortcut");
      const mapa = {
        projeto: "projetos",
        decisao: "conversa",
        estado: "dashboard"
      };
      navegar(mapa[tipo] || "dashboard");
      fecharNav();
      if (tipo === "estado") {
        queueMicrotask(() => {
          const input = document.getElementById("cs-input");
          if (input) {
            input.value = "Qual é o estado atual?";
            input.dispatchEvent(new Event("input", { bubbles: true }));
            input.focus();
          }
        });
      }
    });
  });

  function atualizarNav() {
    const atual = obterRota();
    const ativos = listarRotas()
      .map((r) => {
        const active = r.id === atual.id ? " is-active" : "";
        const label = NAV_LABELS[r.id] || r.titulo;
        const icon = iconSvg(r.id);
        return `<a class="shell-nav-link${active}" href="${r.path}" data-route="${r.id}" title="${label}">${icon}<span>${label}</span></a>`;
      })
      .join("");

    const soon = SOON_ITEMS.map(
      (item) =>
        `<div class="shell-nav-link shell-nav-soon" title="Em breve">${iconSvg(item.key)}<span>${item.titulo}</span><em>em breve</em></div>`
    ).join("");

    navEl.innerHTML = ativos + soon;
  }

  navEl.addEventListener("click", (ev) => {
    const a = ev.target.closest("a[data-route]");
    if (!a) return;
    ev.preventDefault();
    navegar(a.getAttribute("data-route"));
    fecharNav();
  });

  return {
    workspace,
    atualizarNav,
    voz: vozUi,
    definirStatus(texto) {
      statusEl.textContent = texto;
    },
    renderModule(nodeOrHtml) {
      if (typeof nodeOrHtml === "string") {
        workspace.innerHTML = nodeOrHtml;
      } else {
        workspace.replaceChildren(nodeOrHtml);
      }
    }
  };
}
