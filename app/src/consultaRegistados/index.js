/**
 * IMP-086 — Consulta de discussões e decisões registadas (V1).
 * Read-only. Sem quarta memória. Sem API HTTP.
 */

export {
  detectarPedidoExplicitoConsulta
} from "./pedidoExplicito.js";

export {
  lerDecisoesMo,
  lerDiscussaoTranscript,
  lerRefsTrilhaOpcional,
  listarSoCoa
} from "./portasLeitura.js";

export { montarRespostaConsulta } from "./montarResposta.js";

export { orquestrarConsultaRegistados } from "./orquestrarConsulta.js";
