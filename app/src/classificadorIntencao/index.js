/**
 * Classificador de Intenção — API pública (IMP-057 / REQ-057 / ARQ-018).
 */

export {
  CLASSES_INTENCAO,
  CLASSE_POR_ID,
  ID_POR_CLASSE,
  LIMIAR_CONFIANCA,
  FLAGS_POR_CLASSE,
  DESTINO_POR_CLASSE,
  DESTINOS,
  ehClasseIntencao,
  ehDestino,
  flagsDaClasse,
  destinoDaClasse,
  abaixoDoLimiar,
  validarSaida,
  montarSaida
} from "./dominio.js";

export {
  classificar,
  temVerboExecucao,
  desambiguarJobs,
  calcularConfianca,
  resolverEmpates,
  aplicarDesambiguacaoHistorico,
  ehIntencaoExecutivaE21,
  ehPerguntaDeliberativa,
  ehProibicaoExecucaoExplicita,
  ehAutorizacaoExplicitaCriarJob,
  extrairIdsJobMencionados,
  ehReferenciaExplicitaJobId,
  ehConsultaEstadoOperacional,
  ehPedidoContinuidadeMissao,
  ehPedidoRelatoEncerramento,
  ehConsultaEstadoParaC4,
  ehPedidoAnaliseOuRecomendacao,
  ehComandoExecucaoExplicito,
  ehConhecimentoGeralE22,
  ehDeliberacaoProjetoE22,
  ehAutoexplicacaoInstitucionalE23,
  ehMetaModoConversacional,
  temContextoProjetoE22,
  normalizarTexto
} from "./regras.js";

export {
  ehRecomendacaoOperacional,
  ehDeliberacaoDeProposta,
  ehPedidoMistoEstadoERecomendacaoOperacional,
  identificarObjetoRecomendacaoOperacional,
  temObjetoOperacional,
  temObjetoPropostaDeliberativa,
  temMarcadorRecomendacao
} from "./recomendacaoOperacional.js";

export { detectarPedidoDecisaoExplicita } from "./pedidoDecisaoExplicita.js";
export {
  detectarAncoraEmpresa,
  temAncoraExplicitaProjeto
} from "./ancoraEmpresa.js";

export {
  seleccionarHistoricoRecente,
  historicoTemReferenciaProjeto,
  mensagemEhDeixisOuFollowUp,
  truncarTextoHistorico,
  JANELA_MAX_MSGS,
  CAP_CHARS_MSG,
  CAP_CHARS_TOTAL
} from "./historicoRecente.js";

export {
  resolverReferencias,
  mensagemPedeResolucaoReferencia,
  montarPerguntaCurtaReferente,
  deduplicarReferentes,
  LIMIAR_REFERENTE,
  MARGEM_REFERENTE,
  LEXICO_TOPICOS
} from "./resolverReferencias.js";

export {
  gestorTopicos,
  criarTopico,
  extrairAncorasMensagem,
  trimPausas,
  aplicarShiftEstado,
  montarPerguntaCurtaTopico,
  montarClarificacaoGateShift,
  familiaDeAncora,
  LIMIAR_SHIFT,
  MARGEM_TOPICO,
  MAX_PAUSAS
} from "./gestorTopicos.js";

export {
  GESTOR_TOPICOS_ATIVO,
  definirGestorTopicosAtivo,
  obterEstadoTopicosSessao,
  aplicarResultadoGestaoTopicos,
  definirEstadoTopicosSessao,
  resetEstadoTopicosSessao
} from "./topicosSessao.js";

export {
  gestorObjectivo,
  criarObjectivo,
  extrairEnunciadoAposMarcador,
  enunciadosCompativeis,
  montarPerguntaCurtaObjectivo,
  montarClarificacaoGateObjectivo,
  LIMIAR_OBJECTIVO,
  MARGEM_OBJECTIVO
} from "./gestorObjectivo.js";

export {
  devePreservarMissao,
  montarConfirmacaoNatural,
  sanitizarProsaUtilizador,
  historicoSugereMissao,
  lastroSugereMissao
} from "./preservarMissao.js";

export {
  GESTOR_OBJECTIVO_ATIVO,
  definirGestorObjectivoAtivo,
  obterEstadoObjectivoSessao,
  aplicarResultadoGestaoObjectivo,
  definirEstadoObjectivoSessao,
  resetEstadoObjectivoSessao
} from "./objectivoSessao.js";

export {
  validarContextoAtivo,
  definirVcaAtivo,
  VCA_ATIVO,
  VEREDICTOS_VCA
} from "./validadorContextoAtivo.js";

export {
  encaminharPorClasse,
  classificarEEncaminhar,
  ROTAS_POR_DESTINO,
  tabelaEncaminhamentoV1
} from "./encaminhador.js";

export {
  primeiroPassoClassificar,
  conduzirTrabalhoExecutivoC3,
  montarParecerTrabalhoExecutivo,
  mensagemInicioExecucao,
  contemSugiroComoRespostaFinal,
  tituloJobDeInstrucao,
  extrairObjectivoRealParaJob
} from "./integracaoNucleo.js";

export {
  executarPorDestino,
  executarDestinoC1,
  executarDestinoC2,
  executarDestinoC3,
  executarDestinoC4,
  executarDestinoClarificacao,
  CAPACIDADES_C4
} from "./destinos.js";

export {
  gerarRespostaConhecimentoGeral,
  ehStubRespostaLeveProibido,
  montarMensagensRespostaLeve,
  fallbackRespostaLeveSemLlm,
  SYSTEM_RESPOSTA_LEVE
} from "./respostaLeve.js";
