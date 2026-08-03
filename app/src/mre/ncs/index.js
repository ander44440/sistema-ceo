/**
 * API pública do módulo NCS — B1–B4 (C1–C8).
 */

export {
  NaturezaCognitiva,
  PoliticaLacunasNcs,
  ModoEsperadoEstagio6,
  VERSAO_CONTRATO_NCS,
  ehNaturezaCognitiva
} from "./catalogo.js";

export { montarPacoteNcs, derivarCamposNcs } from "./pacote.js";

export { validarPacoteNcs } from "./validarPacoteNcs.js";

export {
  classificarNaturezaCognitiva,
  decidirNaturezaCognitiva
} from "./classificador.js";

export {
  congelarPacoteNcs,
  resolverPacoteNcsCorrida,
  anexarPacoteNcs,
  tentarSobrescreverNatureza,
  obterPacoteNcs
} from "./portador.js";

export {
  politicaInventarioNaoObrigatorio,
  calcularShortCircuitNcs,
  aplicarPoliticaDossierNcs,
  aplicarPoliticaDecisaoNcs,
  comContextoNcs
} from "./politicas.js";

export {
  flagNcs,
  isNcsAtiva,
  desligarNcs,
  ligarNcs
} from "./flagNcs.js";

export { extrairMetadadosNcs, mesclarMetadadosNcs } from "./metadadosParecer.js";

export {
  fixturePacoteMetodo,
  fixturePacoteDecisaoOperacional,
  fixturePacotePlanejamento,
  fixturePacoteExplicacao,
  fixturePacoteNaturezaIlegal,
  fixturePacoteIncompleto
} from "./fixtures.js";
