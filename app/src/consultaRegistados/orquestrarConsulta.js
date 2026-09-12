/**
 * IMP-086 / ARQ-086 C-ORQ — orquestrador de consulta (read-only).
 * IMP-089 Fatia 1 — F-TX via HFC; F-TR via deps (soft-fail).
 */

import { detectarPedidoExplicitoConsulta } from "./pedidoExplicito.js";
import {
  lerDecisoesMo,
  lerDiscussao,
  lerRefsTrilhaOpcional
} from "./portasLeitura.js";
import { montarRespostaConsulta } from "./montarResposta.js";

/**
 * @param {{
 *   texto: string,
 *   coaIdActivo?: string|null,
 *   deps?: object
 * }} entrada
 * @returns {{ consumido: false } | { consumido: true, ok: boolean, mensagem: string, dados: object }}
 */
export function orquestrarConsultaRegistados(entrada) {
  const texto = String(entrada && entrada.texto != null ? entrada.texto : "");
  const pedido = detectarPedidoExplicitoConsulta(texto);
  if (!pedido.ehPedido) {
    return { consumido: false };
  }

  const coaId = String(
    pedido.coaNomeado || (entrada && entrada.coaIdActivo) || ""
  ).trim();

  if (!coaId) {
    const mensagem =
      "Pedido de consulta reconhecido, mas não há COA activo nem COA nomeado. " +
      "Indica o contexto (COA) para eu consultar decisões e/ou discussões registadas — " +
      "sem inventar lastro.";
    return {
      consumido: true,
      ok: true,
      mensagem,
      dados: {
        consultaRegistados: true,
        ramo: pedido.ramo,
        coaId: null,
        decisoes: [],
        discussoes: [],
        refs: [],
        ausencias: [mensagem]
      }
    };
  }

  const deps = (entrada && entrada.deps) || {};
  const ramo = pedido.ramo || "ambos";
  const termo = pedido.termo;

  /** @type {object|undefined} */
  let decisoes;
  /** @type {object|undefined} */
  let discussoes;

  if (ramo === "decisao" || ramo === "ambos") {
    decisoes = lerDecisoesMo({ coaId, termo }, deps);
  }
  if (ramo === "discussao" || ramo === "ambos") {
    discussoes = lerDiscussao({ coaId, termo }, deps);
  }

  const moIds =
    decisoes && Array.isArray(decisoes.registos)
      ? decisoes.registos.map((r) => r && r.id).filter(Boolean)
      : [];
  const trilha = lerRefsTrilhaOpcional({ moIds }, deps);

  const montada = montarRespostaConsulta({
    coaId,
    ramo,
    decisoes,
    discussoes,
    refs: trilha.refs
  });

  return {
    consumido: true,
    ok: true,
    mensagem: montada.mensagem,
    dados: {
      consultaRegistados: true,
      ramo,
      coaId,
      decisoes: montada.decisoes,
      discussoes: montada.discussoes,
      refs: montada.refs,
      ausencias: montada.ausencias,
      trilhaOk: trilha.ok
    }
  };
}
