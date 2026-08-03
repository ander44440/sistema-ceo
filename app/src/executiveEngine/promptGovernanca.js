/**
 * Compositor do prompt enviado ao LLM.
 * Não define identidade — apenas monta na ordem canónica homologada:
 * Constituição → Governança LLM → Contexto → Briefing → Histórico → Objetivo atual.
 */

import { obterConstituicaoCeo } from "./constituicaoCeo.js";
import { obterGovernancaLlm } from "./governancaLlm.js";
import { construirContextoSessao } from "./contextoSessao.js";
import { obterBriefingProjeto } from "./briefingsProjeto.js";

/**
 * @param {object} params
 * @param {string} params.instrucao — objetivo atual do usuário nesta interação
 * @param {Array<{papel:string,texto:string}>} params.historico
 * @param {object} params.memoria
 * @param {object|null} params.coa
 * @param {object} [params.intencao]
 * @returns {Array<{role:string,content:string}>}
 */
export function montarMensagensLlm({
  instrucao,
  historico,
  memoria,
  coa,
  intencao
}) {
  const messages = [
    { role: "system", content: obterConstituicaoCeo() },
    { role: "system", content: obterGovernancaLlm() },
    {
      role: "system",
      content: construirContextoSessao({ memoria, coa, intencao })
    }
  ];

  const briefing = obterBriefingProjeto(coa);
  if (briefing) {
    messages.push({ role: "system", content: briefing });
  }

  // Histórico antes do objetivo atual: a interação corrente fica como último turno.
  const recentes = Array.isArray(historico) ? historico.slice(-12) : [];
  for (const turn of recentes) {
    if (!turn || !turn.texto) continue;
    if (turn.papel === "usuario") {
      messages.push({ role: "user", content: String(turn.texto) });
    } else if (turn.papel === "ceo" || turn.papel === "assistente") {
      messages.push({ role: "assistant", content: String(turn.texto) });
    }
  }

  const objetivo = String(instrucao || "").trim();
  if (objetivo) {
    const ultimo = recentes[recentes.length - 1];
    const jaNoHistorico =
      ultimo &&
      ultimo.papel === "usuario" &&
      String(ultimo.texto) === objetivo;
    if (!jaNoHistorico) {
      messages.push({
        role: "user",
        content: `OBJETIVO ATUAL DA INTERAÇÃO:\n${objetivo}`
      });
    } else {
      // Garante ênfase no objetivo corrente mesmo quando já é o último turno.
      const last = messages[messages.length - 1];
      if (last && last.role === "user") {
        last.content = `OBJETIVO ATUAL DA INTERAÇÃO:\n${objetivo}`;
      }
    }
  }

  return messages;
}

/** @deprecated Use montarMensagensLlm — mantido só se algum import legado restar. */
export function construirSystemPrompt() {
  return [obterConstituicaoCeo(), obterGovernancaLlm()].join("\n\n");
}

/** @deprecated Use construirContextoSessao. */
export { construirContextoSessao as construirBlocoContexto } from "./contextoSessao.js";
