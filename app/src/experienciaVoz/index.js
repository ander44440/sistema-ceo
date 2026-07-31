/**
 * Fachada Experiência de Voz (PX-002).
 */

export {
  ESTADO_VOZ,
  CHAVE_PREFERENCIA_VOZ,
  criarOrquestradorVoz,
  criarPreferenciaVoz
} from "./orquestrador.js";
export { obterOrquestradorVozSessao } from "./sessao.js";
export {
  montarBotaoVoz,
  executarGestoBotaoVoz,
  pintarBotaoVoz
} from "./botaoVoz.js";
export { tentarAutorizacaoBrowser } from "./autorizacaoBrowser.js";
