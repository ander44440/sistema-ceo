/**
 * Orquestra efeitos pós-deliberação: Fila (F7) + Retenção (F8).
 */

import { despacharJobDoParecer } from "./despachoFila.js";
import { persistirRetencao } from "./persistirRetencao.js";

/**
 * @param {object} parecer
 * @param {object} planoRetencao
 * @param {object} [deps]
 * @param {Function} [deps.publicarJob]
 * @param {import('./persistirRetencao.js').StoreRetencao} [deps.storeRetencao]
 * @param {Map|Set} [deps.registroDespacho]
 */
export async function aplicarEfeitosPosDeliberacao(
  parecer,
  planoRetencao,
  deps = {}
) {
  /** @type {object} */
  const resultado = {
    fila: { despachado: false, motivo: "nao_avaliado" },
    retencao: { persistido: false, motivo: "nao_avaliado" }
  };

  if (typeof deps.publicarJob === "function") {
    resultado.fila = await despacharJobDoParecer(parecer, {
      publicarJob: deps.publicarJob,
      registro: deps.registroDespacho || new Map()
    });
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
