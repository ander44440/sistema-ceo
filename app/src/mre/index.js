/**
 * API pública do MRE (Blocos 1–3).
 */

export * from "./parecer/index.js";

export { executarPipeline07, assertTransicao } from "./pipeline/orquestrador.js";
export { mapearTipoAcao } from "./pipeline/mapeamentoAcao.js";
export { CATALOGO_PRINCIPIOS, PRINCIPIOS_GLOBAIS, PRINCIPIOS_ESCOPO_MG2, catalogoPrincipiosParaCoa, ehCoaMg2, ehPrincipioEscopoMg2, PRINCIPIO_USO_DIARIO_ACTIVO, PRINCIPIO_USO_DIARIO_MG2 } from "./pipeline/catalogoPrincipios.js";
export { criarChamarLlmMock, mapaLlmFluxoFeliz } from "./pipeline/llmMock.js";

export {
  avaliarAprendizado,
  montarPlanoRetencao,
  aplicarPrincipiosProibido
} from "./aprendizado/avaliarAprendizado.js";

export {
  executarDeliberacaoMre,
  montarParecerExecutivo,
  stubAprendizadoNeutro
} from "./executarDeliberacao.js";

export {
  ehRotaDeliberativa,
  executarRotaDeliberativa,
  montarEntradaMre,
  obterStoreRetencaoSessao,
  reiniciarStoresPosDeliberacaoParaTestes
} from "./integracaoNucleo.js";

export { gerarComunicadoExecutivo } from "./speaker/speakerExecutivo.js";

export {
  gerarComunicadosPorCanal,
  textoParaVoz,
  destaquesCentro
} from "./canais/adaptarCanal.js";

export { flagMre } from "./roteamentoDeliberativo.js";

export {
  flagNcs,
  isNcsAtiva,
  desligarNcs,
  ligarNcs,
  extrairMetadadosNcs,
  mesclarMetadadosNcs
} from "./ncs/index.js";

export {
  registarDestaquesDeliberacao,
  lerDestaquesDeliberacao,
  htmlBlocoDeliberacao
} from "./canais/centroSituacaoDeliberacao.js";

export { criarChamarLlmCeo } from "./adaptadorLlmCeo.js";

export {
  despacharJobDoParecer,
  criarPublicadorFilaMemoria
} from "./posDeliberacao/despachoFila.js";

export {
  persistirRetencao,
  criarStoreRetencaoMemoria,
  registarDecisaoGatePrincipio
} from "./posDeliberacao/persistirRetencao.js";

export { aplicarEfeitosPosDeliberacao } from "./posDeliberacao/efeitosPosDeliberacao.js";

export {
  CRITERIOS_FECHO_IMP010,
  avaliarChecklistFecho,
  marcasBloco3Implementado,
  esbocoPlanoValMre,
  gerarRelatorioFechoImp010
} from "./posDeliberacao/fechoImp010.js";
