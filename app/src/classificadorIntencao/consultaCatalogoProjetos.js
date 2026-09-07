/**
 * Intenção: consulta/listagem do catálogo de projetos (≠ navegação de módulo).
 * Predicado único — classificador (C4) + mapper (capacidade `projetos`).
 */

import { normalizarTexto } from "./lexicon.js";

/**
 * @param {string} texto
 * @returns {boolean}
 */
export function ehConsultaCatalogoProjetos(texto) {
  const t = normalizarTexto(texto);
  if (!t || !/\bprojetos?\b/.test(t)) return false;

  // Navegação de módulo UI — fora do catálogo
  if (
    /\b(abrir|ir\s+para|navegar(?:\s+para)?|ir\s+ao|ir\s+[aà])\b/.test(t)
  ) {
    return false;
  }

  return /\b(listar|liste|mostrar|mostre|ver|veja|quais)\b/.test(t);
}
