/**
 * Sessão da Memória de Trabalho Executiva — refino interno EIC.
 * Estado em memória do processo; injectável / resetável em testes.
 * Não é histórico completo; não toca contratos públicos, UI, Gate, Jobs.
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
 * @returns {MemoriaTrabalhoExecutiva|null}
 */
export function obterMemoriaTrabalhoExecutiva() {
  if (!estado) return null;
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
