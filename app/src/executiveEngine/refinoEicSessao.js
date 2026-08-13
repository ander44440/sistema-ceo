/**
 * Sessão da Memória de Trabalho Executiva — refino interno EIC.
 * Estado em memória do processo; injectável / resetável em testes.
 * Um único slot, amarrado ao coaId do projecto activo (não é histórico;
 * não particiona por missão; não toca contratos públicos, UI, Gate, Jobs).
 */

/**
 * @typedef {import("./refinoEic.js").MemoriaTrabalhoExecutiva} MemoriaTrabalhoExecutiva
 */

/** Flag de rollback L1. */
export let REFINO_EIC_ATIVO = true;

/**
 * @param {boolean} ativo
 */
export function definirRefinoEicAtivo(ativo) {
  REFINO_EIC_ATIVO = Boolean(ativo);
}

/** @type {MemoriaTrabalhoExecutiva|null} */
let estado = null;

/**
 * @param {unknown} id
 * @returns {string|null}
 */
export function normalizarCoaIdMte(id) {
  const t = id != null ? String(id).trim() : "";
  return t || null;
}

/**
 * @param {string|null} [coaIdActual]
 *   Se passado (incluindo `null`), só devolve o snapshot desse COA.
 *   Sem argumento, devolve o slot bruto (continuidade / testes).
 * @returns {MemoriaTrabalhoExecutiva|null}
 */
export function obterMemoriaTrabalhoExecutiva(coaIdActual) {
  if (!estado) return null;
  if (arguments.length >= 1) {
    const actual = normalizarCoaIdMte(coaIdActual);
    const slot = normalizarCoaIdMte(estado.coaId);
    if (actual !== slot) return null;
  }
  return clonarMemoria(estado);
}

/**
 * @param {MemoriaTrabalhoExecutiva|null} novo
 */
export function definirMemoriaTrabalhoExecutiva(novo) {
  estado = novo ? clonarMemoria(novo) : null;
}

export function resetMemoriaTrabalhoExecutiva() {
  estado = null;
}

/**
 * @param {MemoriaTrabalhoExecutiva} m
 * @returns {MemoriaTrabalhoExecutiva}
 */
export function clonarMemoria(m) {
  return JSON.parse(JSON.stringify(m));
}
