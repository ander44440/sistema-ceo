/**
 * Identidade visual temporária CEO 2.0 — só markup de UI.
 * Não altera domínio, APIs nem estado.
 */

/** Texto plano (títulos de documento, etc.). */
export const TEXTO_MARCA_CEO20 = "CEO 2.0";

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

/** Marca com «2.0» destacado. */
export function htmlMarcaCeo20() {
  return `CEO<span class="ceo20-ver"> 2.0</span>`;
}

/**
 * Escapa o texto e promove cada «CEO» visível para a marca CEO 2.0.
 * @param {string} texto
 * @returns {string}
 */
export function htmlComMarcaCeo20(texto) {
  const esc = escaparHtml(texto ?? "");
  return esc
    .replace(/CEO 2\.0/g, "\0CEO20\0")
    .replace(/\bCEO\b/g, htmlMarcaCeo20())
    .replace(/\0CEO20\0/g, htmlMarcaCeo20());
}

/**
 * Versão texto plano (sem HTML) — ex. document.title.
 * @param {string} texto
 * @returns {string}
 */
export function textoComMarcaCeo20(texto) {
  return String(texto ?? "")
    .replace(/CEO 2\.0/g, "\0CEO20\0")
    .replace(/\bCEO\b/g, TEXTO_MARCA_CEO20)
    .replace(/\0CEO20\0/g, TEXTO_MARCA_CEO20);
}
