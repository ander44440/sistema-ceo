/**
 * Store de sessão de tópicos — IMP-063 / ARQ-024.
 * Estado em memória do processo; injectável / resetável em testes.
 * Sem DB; sem I/O de Job/Gate/Motor/NCS.
 */

/**
 * @typedef {import("./gestorTopicos.js").TopicoConversacional} TopicoConversacional
 * @typedef {import("./gestorTopicos.js").ResultadoGestaoTopicos} ResultadoGestaoTopicos
 */

/**
 * @typedef {object} EstadoTopicosSessao
 * @property {TopicoConversacional|null} topicoActivo
 * @property {TopicoConversacional[]} pausas
 */

/** Flag de rollback L1/L2 (ARQ-024 §11). */
export let GESTOR_TOPICOS_ATIVO = true;

/**
 * @param {boolean} ativo
 */
export function definirGestorTopicosAtivo(ativo) {
  GESTOR_TOPICOS_ATIVO = Boolean(ativo);
}

/** @type {EstadoTopicosSessao} */
let estado = { topicoActivo: null, pausas: [] };

/**
 * @returns {EstadoTopicosSessao}
 */
export function obterEstadoTopicosSessao() {
  return {
    topicoActivo: estado.topicoActivo
      ? { ...estado.topicoActivo }
      : null,
    pausas: estado.pausas.map((p) => ({ ...p }))
  };
}

/**
 * Aplica resultado do gestor se `commitEstado`.
 * @param {ResultadoGestaoTopicos} resultado
 */
export function aplicarResultadoGestaoTopicos(resultado) {
  if (!resultado || resultado.commitEstado !== true) return;
  estado = {
    topicoActivo: resultado.topicoActivo
      ? { ...resultado.topicoActivo }
      : null,
    pausas: Array.isArray(resultado.pausas)
      ? resultado.pausas.map((p) => ({ ...p })).slice(0, 2)
      : []
  };
}

/**
 * Força estado (testes / inject).
 * @param {Partial<EstadoTopicosSessao>} [novo]
 */
export function definirEstadoTopicosSessao(novo = {}) {
  estado = {
    topicoActivo: novo.topicoActivo
      ? { ...novo.topicoActivo }
      : null,
    pausas: Array.isArray(novo.pausas)
      ? novo.pausas.map((p) => ({ ...p })).slice(0, 2)
      : []
  };
}

export function resetEstadoTopicosSessao() {
  estado = { topicoActivo: null, pausas: [] };
}
