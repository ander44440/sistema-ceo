/**
 * Leitores padrão somente leitura F1–F8 — IMP-059 E4.
 * Não escrevem em Fila, Motor, Dispatcher nem Continuidade.
 */

import { obterStoreContinuidadePadrao } from "../continuidadeGate/integracaoConversa.js";
import { obterCoaAtivo } from "../executiveEngine/coaSessao.js";

/**
 * @typedef {import("./agregarEstado.js").LeitoresFontes} LeitoresFontes
 */

/**
 * @param {{
 *   storeContinuidade?: { obterGatePendenteMaisRecente?: Function, listarGates?: Function },
 *   jobsPendentes?: () => unknown[] | Promise<unknown[]>,
 *   jobsEmExecucao?: () => unknown[] | Promise<unknown[]>,
 *   dispatcher?: () => unknown | Promise<unknown>,
 *   cto?: () => unknown | Promise<unknown>,
 *   agent?: () => unknown | Promise<unknown>,
 *   painel?: () => unknown | Promise<unknown>,
 *   frenteActiva?: () => unknown | Promise<unknown>
 * }} [deps]
 * @returns {LeitoresFontes}
 */
export function criarLeitoresConscienciaPadrao(deps = {}) {
  const store =
    deps.storeContinuidade ||
    (typeof obterStoreContinuidadePadrao === "function"
      ? obterStoreContinuidadePadrao()
      : null);

  return {
    F1: async () => {
      if (typeof deps.jobsPendentes === "function") {
        return (await deps.jobsPendentes()) || [];
      }
      return [];
    },
    F2: async () => {
      if (typeof deps.jobsEmExecucao === "function") {
        return (await deps.jobsEmExecucao()) || [];
      }
      return [];
    },
    F3: async () => {
      if (!store || typeof store.obterGatePendenteMaisRecente !== "function") {
        return [];
      }
      const gate = store.obterGatePendenteMaisRecente();
      if (!gate || gate.estado !== "pendente") return [];
      return [
        {
          gateId: gate.gateId,
          parecerId: gate.parecerId,
          cicloId: gate.cicloId ?? null,
          resumo: gate.resumo || "Aguardando decisão do utilizador"
        }
      ];
    },
    F4: async () => {
      if (typeof deps.dispatcher === "function") {
        return (await deps.dispatcher()) || { estado: "ocioso" };
      }
      return { estado: "ocioso", detalhe: null };
    },
    F5: async () => {
      if (typeof deps.cto === "function") {
        return (await deps.cto()) || { estado: "ocioso", emCurso: false };
      }
      return { estado: "ocioso", emCurso: false, detalhe: null };
    },
    F6: async () => {
      if (typeof deps.agent === "function") {
        return (await deps.agent()) || { estado: "ocioso", ocupado: false };
      }
      return { estado: "ocioso", ocupado: false, detalhe: null };
    },
    F7: async () => {
      if (typeof deps.painel === "function") {
        return (await deps.painel()) || { disponivel: false, alertas: 0 };
      }
      return { disponivel: false, alertas: 0, detalhe: null };
    },
    F8: async () => {
      if (typeof deps.frenteActiva === "function") {
        return (await deps.frenteActiva()) || { id: null, nome: null };
      }
      try {
        const coa = obterCoaAtivo();
        if (coa && (coa.id || coa.nome)) {
          return { id: coa.id || null, nome: coa.nome || null };
        }
      } catch {
        /* COA opcional */
      }
      return { id: null, nome: null };
    }
  };
}
