/**
 * API pública do contrato ParecerExecutivo (IMP-011 / REQ-048).
 */

export {
  VERSAO_CONTRATO,
  NaturezaInteracao,
  TipoPedido,
  Urgencia,
  FonteFacto,
  NivelRisco,
  ValorOportunidade,
  EstadoDecisaoExecutiva,
  TipoAcaoOperacional,
  PrioridadeJob
} from "./enums.js";

export { validarParecerExecutivo } from "./validarParecerExecutivo.js";
export { validarParecerExecutivo as validar } from "./validarParecerExecutivo.js";

export {
  parecerValidoCompleto,
  parecerSolicitarDadosValido,
  parecerDelegarValido,
  clonarComMutacoes
} from "./fixtures.js";
