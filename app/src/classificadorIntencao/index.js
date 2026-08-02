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
  ehIntencaoExecutivaE21,
  ehPerguntaDeliberativa,
  ehConhecimentoGeralE22,
  ehDeliberacaoProjetoE22,
  ehAutoexplicacaoInstitucionalE23,
  temContextoProjetoE22,
  normalizarTexto
} from "./regras.js";

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
  tituloJobDeInstrucao
} from "./integracaoNucleo.js";

export {
  executarPorDestino,
  executarDestinoC1,
  executarDestinoC2,
  executarDestinoC3,
  executarDestinoC4,
  CAPACIDADES_C4
} from "./destinos.js";

export {
  gerarRespostaConhecimentoGeral,
  ehStubRespostaLeveProibido,
  montarMensagensRespostaLeve,
  fallbackRespostaLeveSemLlm,
  SYSTEM_RESPOSTA_LEVE
} from "./respostaLeve.js";
