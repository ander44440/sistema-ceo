/**
 * Context Governor — API pública (IMP-093 M1).
 */

export {
  ESTADOS_CG,
  FONTES_CG,
  USOS_CG,
  CODIGOS_VIOLACAO,
  MODO_SOMBRA,
  MODO_ENFORCE,
  TIPO_CG_AUTORIZACAO,
  PRECEDENCIA_ESTADOS
} from "./contratos.js";

export { expandirFragmentos, recomporPacote } from "./fragmentos.js";
export { avaliarFonteEUso } from "./politicaRegime.js";
export { avaliarSuficienciaAposIsolamento } from "./suficiencia.js";
export {
  extrairMarcadoresFactuais,
  ehPedidoConfirmacaoOuAtribuicaoFacto,
  classificarUsoTurnoUtilizador,
  textoLastroFactuaisDoAmbito,
  avaliarAlegacaoFragmento
} from "./alegacoesFactuais.js";
export { governarContexto } from "./governarContexto.js";
export {
  construirEventoCgAutorizacao,
  emitirAuditoriaCg
} from "./auditoria.js";
export {
  CG_FASE,
  CG_ROLLBACK_SHADOW_ENV,
  cgEnabled,
  cgEmProducao,
  cgBypassPermitido,
  actosEnforceOptIn,
  lerEnvModoCg,
  resolverModoCg,
  isModoSombra,
  isModoEnforce
} from "./modo.js";
export {
  montarPedidoGovernancaDeLlm,
  serializarBodyLlm,
  atravessarGateLlm,
  messagesDePacoteAutorizado,
  enviadoSubconjuntoAutorizado,
  respostaBloqueioCg,
  ehBloqueioCg
} from "./gateLlm.js";

export {
  criarFragmento,
  unirFontesAutorizadas,
  etiquetarMensagemLlm,
  montarCgMetaPromptDirecto,
  montarCgMetaDeEntradaMre,
  contarEtiquetasFragmentos,
  lfcConsumoAutorizadoNoAmbito,
  acrescentarLfcAutorizadoAoCandidato,
  PREFIXO_LFC_ACTIVO
} from "./etiquetarPipeline.js";
