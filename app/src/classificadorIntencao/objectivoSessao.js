/**
 * Store de sessão de objectivos — IMP-064 / ARQ-025.
 * Estado em memória do processo; injectável / resetável em testes.
 * Sem DB; sem I/O de Job/Gate/Motor/NCS.
 */

/**
 * @typedef {import("./gestorObjectivo.js").ObjectivoConversacional} ObjectivoConversacional
 * @typedef {import("./gestorObjectivo.js").ResultadoGestaoObjectivo} ResultadoGestaoObjectivo
 */

/**
 * @typedef {object} EstadoObjectivoSessao
 * @property {ObjectivoConversacional|null} objetivoActivo
 * @property {ObjectivoConversacional|null} objetivoAnterior
 */

/** Flag de rollback L1/L2 (ARQ-025 §11). */
export let GESTOR_OBJECTIVO_ATIVO = true;

/**
 * @param {boolean} ativo
 */
export function definirGestorObjectivoAtivo(ativo) {
  GESTOR_OBJECTIVO_ATIVO = Boolean(ativo);
}

/** @type {EstadoObjectivoSessao} */
let estado = { objetivoActivo: null, objetivoAnterior: null };

/**
 * @returns {EstadoObjectivoSessao}
 */
export function obterEstadoObjectivoSessao() {
  return {
    objetivoActivo: estado.objetivoActivo
      ? { ...estado.objetivoActivo }
      : null,
    objetivoAnterior: estado.objetivoAnterior
      ? { ...estado.objetivoAnterior }
      : null
  };
}

/**
 * @param {ResultadoGestaoObjectivo} resultado
 */
export function aplicarResultadoGestaoObjectivo(resultado) {
  if (!resultado || resultado.commitEstado !== true) return;
  estado = {
    objetivoActivo: resultado.objetivoActivo
      ? { ...resultado.objetivoActivo }
      : null,
    objetivoAnterior: resultado.objetivoAnterior
      ? { ...resultado.objetivoAnterior }
      : null
  };
}

/**
 * @param {Partial<EstadoObjectivoSessao>} [novo]
 */
export function definirEstadoObjectivoSessao(novo = {}) {
  estado = {
    objetivoActivo: novo.objetivoActivo
      ? { ...novo.objetivoActivo }
      : null,
    objetivoAnterior: novo.objetivoAnterior
      ? { ...novo.objetivoAnterior }
      : null
  };
}

export function resetEstadoObjectivoSessao() {
  estado = { objetivoActivo: null, objetivoAnterior: null };
}
