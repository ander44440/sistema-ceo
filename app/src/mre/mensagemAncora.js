/**
 * Âncora do turno MRE (FRENTE 7) — pedaço mínimo sem dependências de pipeline.
 */

/**
 * Preferir `mensagemAtual`; fallback à `mensagem` (compat).
 * @param {object|null|undefined} entrada
 * @returns {string}
 */
export function mensagemAncoraEntradaMre(entrada) {
  if (!entrada || typeof entrada !== "object") return "";
  const atual = String(entrada.mensagemAtual || "").trim();
  if (atual) return atual;
  return String(entrada.mensagem || "").trim();
}
