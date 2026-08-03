/**
 * Estados de turno do Modo CEO Ouvindo (ARQ-029 / IMP-068).
 * Distintos da preferência PX-002 (ESTADO_VOZ).
 */

export const ESTADO_TURNO = Object.freeze({
  IDLE: "idle",
  OUVINDO: "ouvindo",
  PROCESSANDO: "processando",
  RESPONDENDO: "respondendo",
  INTERROMPIDO: "interrompido",
  ERRO: "erro"
});

/** Transições válidas: de → Set(para) */
export const TRANSICOES_TURNO = Object.freeze({
  [ESTADO_TURNO.IDLE]: Object.freeze(
    new Set([ESTADO_TURNO.OUVINDO, ESTADO_TURNO.ERRO])
  ),
  [ESTADO_TURNO.OUVINDO]: Object.freeze(
    new Set([
      ESTADO_TURNO.PROCESSANDO,
      ESTADO_TURNO.INTERROMPIDO,
      ESTADO_TURNO.IDLE,
      ESTADO_TURNO.ERRO
    ])
  ),
  [ESTADO_TURNO.PROCESSANDO]: Object.freeze(
    new Set([
      ESTADO_TURNO.RESPONDENDO,
      ESTADO_TURNO.OUVINDO,
      ESTADO_TURNO.IDLE,
      ESTADO_TURNO.INTERROMPIDO,
      ESTADO_TURNO.ERRO
    ])
  ),
  [ESTADO_TURNO.RESPONDENDO]: Object.freeze(
    new Set([
      ESTADO_TURNO.OUVINDO,
      ESTADO_TURNO.IDLE,
      ESTADO_TURNO.INTERROMPIDO,
      ESTADO_TURNO.ERRO
    ])
  ),
  [ESTADO_TURNO.INTERROMPIDO]: Object.freeze(
    new Set([ESTADO_TURNO.IDLE, ESTADO_TURNO.OUVINDO, ESTADO_TURNO.ERRO])
  ),
  [ESTADO_TURNO.ERRO]: Object.freeze(
    new Set([ESTADO_TURNO.IDLE, ESTADO_TURNO.OUVINDO])
  )
});
