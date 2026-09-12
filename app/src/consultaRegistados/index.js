/**
 * IMP-086 / IMP-089 — Consulta de discussões e decisões registadas.
 * Fatia 1: HFC read-only + Trilha refs. Sem quarta memória.
 */

export {
  detectarPedidoExplicitoConsulta
} from "./pedidoExplicito.js";

export {
  lerDecisoesMo,
  lerDiscussao,
  lerDiscussaoTranscript,
  lerRefsTrilhaOpcional,
  listarSoCoa
} from "./portasLeitura.js";

export { montarRespostaConsulta } from "./montarResposta.js";

export { orquestrarConsultaRegistados } from "./orquestrarConsulta.js";

export { criarDepsConsultaProducao } from "./depsProducao.js";
