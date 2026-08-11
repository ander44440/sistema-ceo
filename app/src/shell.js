import { listarRotas, navegar, obterRota } from "./router.js";
import { montarBotaoVoz } from "./experienciaVoz/botaoVoz.js";
import { montarBotaoPausar } from "./botaoPausar.js";
import { obterProjetoAtivo } from "./catalogoProjetos/index.js";

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
    '<svg class="shell-nav-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="3.2" stroke="currentColor" stroke-width="1.6"/><path d="M12 3.5v2.2M12 18.3v2.2M4.9 6.5l1.6 1.6M17.5 15.9l1.6 1.6M3.5 12h2.2M18.3 12h2.2M4.9 17.5l1.6-1.6M17.5 8.1l1.6-1.6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
  orquestracao:
    '<svg class="shell-nav-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 7h4v4H5V7Zm10 0h4v4h-4V7ZM5 13h4v4H5v-4Zm5-3h4M12 7v10M15 13h4v4h-4v-4Z" stroke="currentColor" stroke-width="1.6"/></svg>',
  decisoes:
    '<svg class="shell-nav-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3 4 7.5 12 12l8-4.5L12 3Zm-8 9 8 4.5 8-4.5M4 16.5 12 21l8-4.5" stroke="currentColor" stroke-width="1.6"/></svg>',
  indicadores:
    '<svg class="shell-nav-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 19V9M10 19V5M15 19v-7M20 19V8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
  agentes:
    '<svg class="shell-nav-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="9" cy="9" r="3" stroke="currentColor" stroke-width="1.6"/><circle cx="16" cy="10" r="2.5" stroke="currentColor" stroke-width="1.6"/><path d="M4 19c.8-2.8 2.8-4 5-4s4.2 1.2 5 4M13.5 19c.4-1.6 1.5-2.5 3-2.5s2.4.7 3 2.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
  relatorios:
    '<svg class="shell-nav-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 4h9l5 5v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" stroke="currentColor" stroke-width="1.6"/><path d="M14 4v5h5M8 13h8M8 17h5" stroke="currentColor" stroke-width="1.6"/></svg>',
  memoria:
    '<svg class="shell-nav-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 8a7 7 0 0 1 14 0v8a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V8Z" stroke="currentColor" stroke-width="1.6"/><path d="M9 12h6M9 15h4" stroke="currentColor" stroke-width="1.6"/></svg>'
});

const NAV_LABELS = Object.freeze({
  dashboard: "Centro de Situação",
  conversa: "Conversas",
  capacidades: "Capacidades",
  projetos: "Projetos",
  conhecimento: "Conhecimento",
  configuracoes: "Configurações"
});

function iconSvg(key) {
  return NAV_ICONS[key] || NAV_ICONS.dashboard;
}

function horaAgora() {
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date());
  } catch {
    return "--:--";
  }
}

/**
 * Shell permanente — posto de comando (layout referência).
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
        <div id="shell-nav"></div>
        <div class="shell-sidebar-foot">
          <div class="shell-sdo-row">
            <span class="shell-sdo-dot" aria-hidden="true"></span>
            <div>
              <strong>Sistema Operacional</strong>
              <span>Online</span>
            </div>
          </div>
          <p class="shell-sdo-meta">Versão 2.0.0</p>
          <p class="shell-sdo-meta">Baseline EIC-001 · DESP-010</p>
        </div>
      </aside>

      <header class="shell-header" role="banner">
        <div class="shell-header-left">
          <button type="button" class="shell-menu-toggle" id="menu-toggle" aria-label="Abrir menu" aria-controls="shell-sidebar" aria-expanded="false">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
          </button>
          <div class="shell-header-clock" title="Hora local">
            <strong id="shell-clock">${horaAgora()}</strong>
            <span class="shell-header-online"><i aria-hidden="true"></i>Online</span>
          </div>
        </div>

        <div class="shell-header-center">
          <p class="shell-header-kicker" id="shell-page-title">CENTRO DE COMANDO EXECUTIVO</p>
          <strong class="shell-header-project" id="shell-project-name">—</strong>
        </div>

        <div class="shell-header-right">
          <div id="shell-voice-host" class="shell-voice-host"></div>
          <div id="shell-pause-host" class="shell-pause-host"></div>
          <button type="button" class="shell-icon-btn" id="command-focus" title="Buscar ou comando (Ctrl K)" aria-label="Buscar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="11" cy="11" r="6.5" stroke="currentColor" stroke-width="1.6"/><path d="M16 16l4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
          </button>
          <button type="button" class="shell-icon-btn" id="action-notif" aria-label="Notificações">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 9a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 13 6 9Z" stroke="currentColor" stroke-width="1.6"/><path d="M10 18a2 2 0 0 0 4 0" stroke="currentColor" stroke-width="1.6"/></svg>
            <span class="shell-badge shell-badge--alert">3</span>
          </button>
          <button type="button" class="shell-icon-btn" id="action-theme" aria-label="Configurações">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="3.2" stroke="currentColor" stroke-width="1.6"/><path d="M12 3.5v2.2M12 18.3v2.2M4.9 6.5l1.6 1.6M17.5 15.9l1.6 1.6M3.5 12h2.2M18.3 12h2.2M4.9 17.5l1.6-1.6M17.5 8.1l1.6-1.6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
          </button>
          <button type="button" class="shell-icon-btn" id="action-help" aria-label="Ajuda">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="8.5" stroke="currentColor" stroke-width="1.6"/><path d="M9.8 9.2a2.4 2.4 0 1 1 3.4 2.2c-.7.4-1.2.9-1.2 1.8M12 16.2h.01" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
          </button>
          <div class="shell-profile" title="Perfil">
            <div class="shell-avatar" aria-hidden="true">A</div>
            <div>
              <strong>Anderson</strong>
              <span>Executivo</span>
            </div>
          </div>
        </div>
        <span id="system-status" class="visually-hidden">CEO Online</span>
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
  const clockEl = root.querySelector("#shell-clock");
  const projectEl = root.querySelector("#shell-project-name");
  const pageTitleEl = root.querySelector("#shell-page-title");
  const voiceHost = root.querySelector("#shell-voice-host");
  const vozUi = voiceHost ? montarBotaoVoz(voiceHost) : null;
  const pauseHost = root.querySelector("#shell-pause-host");
  const pausaUi = pauseHost
    ? montarBotaoPausar(pauseHost, {
        onPausa: (p) => {
          if (p) statusEl.textContent = "CEO pausado";
        }
      })
    : null;

  function actualizarCabecalho() {
    if (clockEl) clockEl.textContent = horaAgora();
    const projeto = obterProjetoAtivo();
    if (projectEl) {
      projectEl.textContent = projeto?.nome || "Sem projeto ativo";
    }
    const rota = obterRota();
    if (pageTitleEl) {
      pageTitleEl.textContent =
        rota.id === "dashboard"
          ? "CENTRO DE COMANDO EXECUTIVO"
          : String(rota.titulo || "").toUpperCase();
    }
  }

  const clockTimer = setInterval(() => {
    if (clockEl) clockEl.textContent = horaAgora();
  }, 30000);

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
  root.querySelector("#action-help")?.addEventListener("click", () => {
    statusEl.textContent = "Ajuda do posto de comando";
  });

  function atualizarNav() {
    const atual = obterRota();
    const porId = Object.fromEntries(listarRotas().map((r) => [r.id, r]));
    /** Ordem visual da referência (rotas reais + placeholders). */
    const espec = [
      { tipo: "rota", id: "dashboard" },
      { tipo: "rota", id: "conversa" },
      { tipo: "soon", key: "orquestracao", titulo: "Orquestração" },
      { tipo: "rota", id: "projetos" },
      { tipo: "soon", key: "decisoes", titulo: "Decisões" },
      { tipo: "soon", key: "indicadores", titulo: "Indicadores" },
      { tipo: "soon", key: "agentes", titulo: "Agentes" },
      { tipo: "soon", key: "relatorios", titulo: "Relatórios" },
      { tipo: "soon", key: "memoria", titulo: "Memória" },
      { tipo: "rota", id: "configuracoes" }
    ];

    const html = espec
      .map((item) => {
        if (item.tipo === "soon") {
          return `<div class="shell-nav-link shell-nav-soon" title="Em breve">${iconSvg(item.key)}<span>${item.titulo}</span></div>`;
        }
        const r = porId[item.id];
        if (!r) return "";
        const label = NAV_LABELS[r.id] || r.titulo;
        const active = r.id === atual.id ? " is-active" : "";
        return `<a class="shell-nav-link${active}" href="${r.path}" data-route="${r.id}" title="${label}">${iconSvg(r.id)}<span>${label}</span></a>`;
      })
      .join("");

    navEl.innerHTML = html;
    actualizarCabecalho();
  }

  navEl.addEventListener("click", (ev) => {
    const a = ev.target.closest("a[data-route]");
    if (!a) return;
    ev.preventDefault();
    navegar(a.getAttribute("data-route"));
    fecharNav();
  });

  actualizarCabecalho();

  return {
    workspace,
    atualizarNav,
    voz: vozUi,
    pausa: pausaUi,
    definirStatus(texto) {
      statusEl.textContent = texto;
      actualizarCabecalho();
    },
    renderModule(nodeOrHtml) {
      if (typeof nodeOrHtml === "string") {
        workspace.innerHTML = nodeOrHtml;
      } else {
        workspace.replaceChildren(nodeOrHtml);
      }
      actualizarCabecalho();
    },
    _dispose() {
      clearInterval(clockTimer);
    }
  };
}
