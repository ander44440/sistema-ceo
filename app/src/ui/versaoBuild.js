/**
 * Identificação visual do commit em execução (build/runtime).
 * Só UI — sem efeito em domínio, APIs ou estado.
 *
 * Fonte: import.meta.env.VITE_CEO_GIT_COMMIT (injectado no Vite build).
 * Em Vercel: VERCEL_GIT_COMMIT_SHA → define no vite.config.js.
 * Em local: git rev-parse --short HEAD (mesma regra do backend).
 */

/**
 * @returns {string} short SHA injectado no build, ou vazio
 */
export function obterCommitEmExecucao() {
  const raw =
    (typeof import.meta !== "undefined" &&
      import.meta.env &&
      import.meta.env.VITE_CEO_GIT_COMMIT) ||
    "";
  return String(raw).trim();
}

/**
 * @param {string} texto
 * @returns {string}
 */
function escaparHtml(texto) {
  return String(texto)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Markup do COMMIT (laranja). Vazio se o build não injectou SHA.
 * @returns {string}
 */
export function htmlCommitVersao() {
  const commit = obterCommitEmExecucao();
  if (!commit) return "";
  return `<span class="ceo-commit-versao" title="Commit em execução">${escaparHtml(
    commit
  )}</span>`;
}
