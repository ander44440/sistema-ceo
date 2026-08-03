/**
 * Consciência Operacional — API pública E1–E4 (IMP-059 / REQ-059 / ARQ-020).
 */

export {
  FONTES_ESTADO_EXECUTIVO,
  PRIORIDADE_FONTES,
  IDS_FONTES,
  NIVEIS_PRIORIDADE,
  ESTADOS_DISPATCHER,
  ESTADOS_AGENT,
  ESTADOS_CTO,
  ehIdFonte,
  ehNivelPrioridade,
  prioridadeDaFonte,
  compararPrioridadeFontes,
  validarJobResumo,
  validarGateResumo,
  validarConflitoFoco,
  estadoExecutivoVazio,
  criarEstadoExecutivo,
  validarEstadoExecutivo,
  fonteEstaActiva,
  temContextoOperacionalRelevante,
  priorizarFontes,
  fontePrioritaria
} from "./dominio.js";

export {
  agregarEstadoExecutivo,
  criarAgregadorConsciencia,
  normalizarLeituraFonte
} from "./agregarEstado.js";

export {
  CLASSES_COM_CONSULTA_OBRIGATORIA,
  classeExigeConsultaConsciencia,
  montarFactosLastro,
  montarLastroParaNucleo,
  metadadoConscienciaParaDados,
  consultarEstadoExecutivoAntesDeResponder,
  criarConsultaConsciencia
} from "./consultarAntesDeResponder.js";

export {
  prosaMencionaJobEmExecucao,
  prosaMencionaGatePendente,
  comporProsaLastro,
  schemaHintConsciencia,
  garantirReflexoEstadoExecutivo,
  blocoContextoEntradaMre
} from "./influenciaDeliberacao.js";

export { criarLeitoresConscienciaPadrao } from "./leitoresPadrao.js";
