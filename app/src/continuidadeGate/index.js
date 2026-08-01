/**
 * Continuidade do Gate — API pública E1–E3 (IMP-058 / REQ-058 / ARQ-019).
 */

export {
  DECISOES_GATE,
  ESTADOS_GATE,
  EFEITO_POR_DECISAO,
  ehDecisaoGate,
  ehEstadoGate,
  continuidadeAplica,
  efeitoDaDecisao,
  validarTransicaoGate,
  validarGatePendente,
  criarGatePendente,
  aplicarDecisaoGate,
  compararGateMaisRecente,
  seleccionarGatePendenteMaisRecente
} from "./dominio.js";

export {
  LEXICO_DECISAO_GATE,
  ENUNCIADOS_MINIMOS_V1,
  normalizarEnunciadoDecisao,
  reconhecerDecisao,
  reconhecerParaGate
} from "./reconhecerDecisao.js";

export { criarStoreContextoGate } from "./contexto.js";

export {
  obterStoreContinuidadePadrao,
  resetStoreContinuidadePadrao,
  decidirInterceptacaoContinuidade,
  continuarAposDecisaoGate,
  responderClarificacaoGate,
  envolverConduzirMotorComContinuidade,
  aplicarMensagemGateNaResposta,
  mensagemAguardandoGateContinuidade,
  registarGateAposMotor
} from "./integracaoConversa.js";
