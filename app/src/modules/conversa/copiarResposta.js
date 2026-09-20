/**
 * Botão «Copiar» nas caixas de resposta do CEO (UI apenas).
 * Não altera texto, store, HFC, MRE nem execução.
 */

/**
 * Markup do botão (só para papel CEO).
 * @returns {string}
 */
export function htmlBotaoCopiarResposta() {
  return `<button type="button" class="ceo-copiar-resposta" data-copiar-resposta aria-label="Copiar resposta">Copiar</button>`;
}

/**
 * Texto a copiar a partir da caixa (corpo da resposta).
 * @param {Element|null|undefined} article
 * @returns {string}
 */
export function textoRespostaDaCaixa(article) {
  if (!article || typeof article.querySelector !== "function") return "";
  const corpo = article.querySelector(
    "[data-copiar-corpo], .cs-bubble-texto, .conv-msg-corpo"
  );
  return String(corpo?.textContent || "").trim();
}

/**
 * Copia texto para a área de transferência (injectável em testes).
 * @param {string} texto
 * @param {{ writeText?: (t: string) => Promise<void> }} [deps]
 */
export async function copiarTextoResposta(texto, deps = {}) {
  const t = String(texto || "");
  if (!t) return false;
  const write =
    typeof deps.writeText === "function"
      ? deps.writeText
      : typeof navigator !== "undefined" &&
          navigator.clipboard &&
          typeof navigator.clipboard.writeText === "function"
        ? (s) => navigator.clipboard.writeText(s)
        : null;
  if (!write) return false;
  await write(t);
  return true;
}

/**
 * Liga botões [data-copiar-resposta] dentro de root.
 * @param {ParentNode|null|undefined} root
 * @param {{ writeText?: (t: string) => Promise<void>, feedbackMs?: number }} [deps]
 */
export function ligarBotoesCopiarResposta(root, deps = {}) {
  if (!root || typeof root.querySelectorAll !== "function") return;
  const ms = Number.isFinite(deps.feedbackMs) ? deps.feedbackMs : 1400;
  root.querySelectorAll("[data-copiar-resposta]").forEach((btn) => {
    if (btn.dataset.copiarLigado === "1") return;
    btn.dataset.copiarLigado = "1";
    btn.addEventListener("click", async (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      const article = btn.closest("article");
      const texto = textoRespostaDaCaixa(article);
      const ok = await copiarTextoResposta(texto, deps);
      if (!ok) return;
      const label = btn.textContent;
      btn.textContent = "Copiado";
      btn.classList.add("is-copiado");
      btn.disabled = true;
      const agendar =
        typeof globalThis.setTimeout === "function"
          ? globalThis.setTimeout.bind(globalThis)
          : null;
      if (!agendar) return;
      agendar(() => {
        btn.textContent = label || "Copiar";
        btn.classList.remove("is-copiado");
        btn.disabled = false;
      }, ms);
    });
  });
}
