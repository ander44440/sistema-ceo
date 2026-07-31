/**
 * C8 — Flag de ativação NCS (IMP-020 B4 / §8).
 * Default off = baseline pré-IMP-020 (sem limiar automático).
 * Independente de `flagMre`.
 */

/**
 * @type {{ ativo: boolean }}
 */
export const flagNcs = {
  ativo: false
};

/**
 * Resolve se o limiar NCS está ativo nesta corrida.
 * Preferência: `deps.flagNcs` (boolean) → `flagNcs.ativo`.
 * @param {object} [deps]
 * @returns {boolean}
 */
export function isNcsAtiva(deps = {}) {
  if (deps && Object.prototype.hasOwnProperty.call(deps, "flagNcs")) {
    return !!deps.flagNcs;
  }
  return !!flagNcs.ativo;
}

/**
 * Rollback: desliga NCS sem remover código (IMP-020 §8.4).
 * @returns {{ ativo: boolean }}
 */
export function desligarNcs() {
  flagNcs.ativo = false;
  return { ativo: flagNcs.ativo };
}

/**
 * Ativação sob mandato / ensaio (não é default de produção).
 * @returns {{ ativo: boolean }}
 */
export function ligarNcs() {
  flagNcs.ativo = true;
  return { ativo: flagNcs.ativo };
}
