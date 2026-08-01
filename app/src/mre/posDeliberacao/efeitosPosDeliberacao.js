/**
 * Orquestra efeitos pós-deliberação: Motor de Execução (IMP-056 E4) + Retenção (F8).
 * Compat: campo `fila.despachado` preservado para Bloco 3 / F7.
 */

import { conduzirAposParecer } from "../../motorExecucao/integracaoOrquestrador.js";
import { persistirRetencao } from "./persistirRetencao.js";

/**
 * @param {object} parecer
 * @param {object} planoRetencao
 * @param {object} [deps]
 * @param {Function} [deps.publicarJob]
 * @param {import('./persistirRetencao.js').StoreRetencao} [deps.storeRetencao]
 * @param {Map|Set} [deps.registroDespacho]
 * @param {import('../../motorExecucao/dominio.js').DecisaoAprovacao|null} [deps.decisaoAprovacao]
 * @param {boolean} [deps.iniciarFluxo]
 */
export async function aplicarEfeitosPosDeliberacao(
  parecer,
  planoRetencao,
  deps = {}
) {
  /** @type {object} */
  const resultado = {
    fila: { despachado: false, motivo: "nao_avaliado" },
    motor: null,
    retencao: { persistido: false, motivo: "nao_avaliado" }
  };

  if (typeof deps.publicarJob === "function") {
    const registro =
      deps.registroDespacho instanceof Map
        ? deps.registroDespacho
        : new Map();

    const conducao = await conduzirAposParecer(parecer, {
      publicarJob: deps.publicarJob,
      registro,
      decisaoAprovacao: deps.decisaoAprovacao,
      contextoPolitica: deps.contextoPolitica,
      iniciarFluxo: deps.iniciarFluxo
    });

    resultado.motor = conducao;
    resultado.fila = {
      despachado: conducao.despachado === true,
      publicado: conducao.publicado === true,
      motivo: conducao.motivo,
      job: conducao.job,
      jobId: conducao.job && conducao.job.id,
      idempotente: conducao.idempotente,
      aguardandoGate: conducao.aguardandoGate === true,
      gate: conducao.gate,
      fluxoIniciado: conducao.fluxoIniciado === true,
      execucaoConcluida: conducao.execucaoConcluida === true,
      parecerExecucaoConcluida: conducao.parecerExecucaoConcluida === true,
      ciclo: conducao.ciclo,
      handoff: conducao.handoff,
      mensagem: conducao.mensagem
    };

    // Compat Set legado (despachoFila): marcar parecerId se Map não era o pedido
    if (
      conducao.despachado &&
      conducao.job &&
      deps.registroDespacho instanceof Set &&
      parecer &&
      parecer.id
    ) {
      deps.registroDespacho.add(parecer.id);
    }
  } else {
    resultado.fila = { despachado: false, motivo: "publicador_ausente" };
  }

  if (deps.storeRetencao) {
    resultado.retencao = persistirRetencao(parecer, planoRetencao, {
      store: deps.storeRetencao
    });
  } else {
    resultado.retencao = { persistido: false, motivo: "store_ausente" };
  }

  return resultado;
}
