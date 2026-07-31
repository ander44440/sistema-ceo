/**
 * UI do onboarding (REQ-046).
 */

import "./onboarding.css";

function esc(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * @param {HTMLElement} root
 * @param {object} handlers
 */
export function montarOnboardingUi(root, handlers = {}) {
  root.innerHTML = `
    <section class="onb" aria-label="Onboarding do CEO Digital">
      <header class="onb-head">
        <p class="onb-kicker">CEO Digital</p>
        <h1>Onboarding</h1>
        <p class="onb-sub">Conversa por voz para conhecer o seu ambiente. Chrome ou Edge recomendados.</p>
      </header>

      <div class="onb-controls">
        <button type="button" class="onb-btn onb-btn--primary" id="onb-iniciar">Iniciar Conversa</button>
        <button type="button" class="onb-btn" id="onb-encerrar">Encerrar</button>
        <span class="onb-pill" id="onb-escuta" data-on="false">Escutando</span>
        <span class="onb-pill onb-pill--speak" id="onb-fala" data-on="false">Falando</span>
      </div>

      <p class="onb-status" id="onb-status" aria-live="polite"></p>

      <div class="onb-grid">
        <div class="onb-panel">
          <h2>Transcrição</h2>
          <div class="onb-log" id="onb-log" role="log"></div>
          <p class="onb-interim" id="onb-interim" aria-live="polite"></p>
          <form class="onb-text" id="onb-form">
            <label class="visually-hidden" for="onb-input">Texto alternativo</label>
            <input id="onb-input" type="text" placeholder="Se o microfone falhar, escreva aqui e Enter…" autocomplete="off" />
            <button type="submit" class="onb-btn">Enviar</button>
          </form>
        </div>

        <div class="onb-panel">
          <h2>Resumo final</h2>
          <pre class="onb-resumo" id="onb-resumo">(ainda sem resumo)</pre>
          <div class="onb-confirm" id="onb-confirm" hidden>
            <button type="button" class="onb-btn onb-btn--ok" id="onb-sim">Sim — salvar</button>
            <button type="button" class="onb-btn" id="onb-nao">Não — corrigir</button>
          </div>
          <div class="onb-corrige" id="onb-corrige" hidden>
            <p>Regrave um campo:</p>
            <div class="onb-campos" id="onb-campos"></div>
          </div>
        </div>
      </div>
    </section>
  `;

  const logEl = root.querySelector("#onb-log");
  const interimEl = root.querySelector("#onb-interim");
  const resumoEl = root.querySelector("#onb-resumo");
  const statusEl = root.querySelector("#onb-status");
  const escutaEl = root.querySelector("#onb-escuta");
  const falaEl = root.querySelector("#onb-fala");
  const confirmEl = root.querySelector("#onb-confirm");
  const corrigeEl = root.querySelector("#onb-corrige");
  const camposEl = root.querySelector("#onb-campos");

  root.querySelector("#onb-iniciar")?.addEventListener("click", () => handlers.onIniciar?.());
  root.querySelector("#onb-encerrar")?.addEventListener("click", () => handlers.onEncerrar?.());
  root.querySelector("#onb-sim")?.addEventListener("click", () => handlers.onSim?.());
  root.querySelector("#onb-nao")?.addEventListener("click", () => handlers.onNao?.());
  root.querySelector("#onb-form")?.addEventListener("submit", (ev) => {
    ev.preventDefault();
    const input = root.querySelector("#onb-input");
    const v = input?.value?.trim();
    if (!v) return;
    input.value = "";
    handlers.onTexto?.(v);
  });

  const api = {
    renderTranscricao(turnos) {
      logEl.innerHTML = (turnos || [])
        .map(
          (t) =>
            `<article class="onb-turn onb-turn--${t.papel}"><strong>${
              t.papel === "ceo" ? "CEO" : "Usuário"
            }:</strong> ${esc(t.texto)}</article>`
        )
        .join("");
      logEl.scrollTop = logEl.scrollHeight;
    },
    setInterim(t) {
      interimEl.textContent = t ? `… ${t}` : "";
    },
    renderResumo(texto) {
      resumoEl.textContent = texto || "(ainda sem resumo)";
      confirmEl.hidden = !texto;
    },
    setIndicadores({ escutando, falando, fase }) {
      escutaEl.dataset.on = escutando ? "true" : "false";
      falaEl.dataset.on = falando ? "true" : "false";
      if (fase === "await_confirm") confirmEl.hidden = false;
    },
    mostrarCorrecao(v) {
      corrigeEl.hidden = !v;
      if (v && !camposEl.childElementCount) {
        const campos = [
          "atividade",
          "empresa_ou_projeto",
          "objetivos",
          "projetos",
          "prioridade",
          "equipe",
          "preferencias",
          "regras"
        ];
        camposEl.innerHTML = campos
          .map(
            (c) =>
              `<button type="button" class="onb-btn onb-btn--chip" data-campo="${c}">${c}</button>`
          )
          .join("");
        camposEl.querySelectorAll("[data-campo]").forEach((btn) => {
          btn.addEventListener("click", () =>
            handlers.onRegravar?.(btn.getAttribute("data-campo"))
          );
        });
      }
    },
    notify(msg) {
      statusEl.textContent = msg || "";
    },
    atualizarCampos() {},
    onConcluido: null
  };

  return api;
}
