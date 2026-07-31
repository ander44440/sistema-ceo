/**
 * Estados da Experiência de Voz (PX-002 E1).
 */

export const ESTADO_VOZ = Object.freeze({
  DESATIVADA: "desativada",
  AGUARDANDO_AUTORIZACAO: "aguardando_autorizacao",
  ATIVA: "ativa",
  FALANDO: "falando",
  OUVINDO: "ouvindo",
  ERRO: "erro"
});

export const CHAVE_PREFERENCIA_VOZ = "ceo.voice.preference.v1";
