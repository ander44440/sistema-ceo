/**
 * Compositor do prompt enviado ao LLM.
 * Ordem canónica: Constituição → Governança LLM → [DIC se path meta] →
 * Contexto → [Briefing se NÃO path meta] → Histórico → Objetivo atual.
 * IMP-067 / ARQ-028: DIC só no path institucional/metaconversacional.
 */

import { obterConstituicaoCeo } from "./constituicaoCeo.js";
import { obterGovernancaLlm } from "./governancaLlm.js";
import { construirContextoSessao } from "./contextoSessao.js";
import { obterProjecaoBriefing } from "./briefingsProjeto.js";
import { factosViaPorta } from "../camadaConhecimento/portaRecuperacao.js";
import {
  DIC_ID,
  DIC_VERSAO,
  deveInjectarDic,
  obterDicVigente
} from "./dicInstitucional.js";

/**
 * @param {object} params
 * @param {string} params.instrucao — objetivo atual do usuário nesta interação
 * @param {Array<{papel:string,texto:string}>} params.historico
 * @param {object} params.memoria
 * @param {object|null} params.coa
 * @param {object} [params.intencao]
 * @param {{ veredicto?: string }} [params.validacaoContexto]
 * @param {boolean} [params.pathMetaInstitucional]
 * @returns {Array<{role:string,content:string}>}
 */
export function montarMensagensLlm({
  instrucao,
  historico,
  memoria,
  coa,
  intencao,
  validacaoContexto,
  pathMetaInstitucional
}) {
  const injectDic = deveInjectarDic({
    texto: instrucao,
    validacaoContexto,
    pathMetaInstitucional
  });

  const messages = [
    { role: "system", content: obterConstituicaoCeo() },
    { role: "system", content: obterGovernancaLlm() }
  ];

  if (injectDic) {
    messages.push({ role: "system", content: obterDicVigente() });
  }

  messages.push({
    role: "system",
    content: construirContextoSessao({ memoria, coa, intencao })
  });

  // IMP-070 B5 / REQ-072: lastro de Camada só via Porta (nunca directo ao Acervo)
  const ambitoCoa = coa?.id || memoria?.projetoAtivo?.id || null;
  const factosOficiais = factosViaPorta({
    contextoTrabalho: ambitoCoa ? { id: ambitoCoa } : coa,
    necessidade:
      String(instrucao || "").trim() ||
      "lastro organizacional para composição EIC / Executive Engine"
  });
  if (factosOficiais.length) {
    messages.push({
      role: "system",
      content:
        "PORTA DE RECUPERAÇÃO (lastro oficial apto — única superfície de leitura):\n" +
        factosOficiais.join("\n")
    });
  }

  // ARQ-028 C-COA: sem briefing COA por omissão no path meta
  // REQ-070: briefing = projecção subordinada, nunca Fonte Oficial
  if (!injectDic) {
    const projecao = obterProjecaoBriefing(coa);
    if (projecao?.textoRotulado) {
      messages.push({ role: "system", content: projecao.textoRotulado });
    }
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
      const last = messages[messages.length - 1];
      if (last && last.role === "user") {
        last.content = `OBJETIVO ATUAL DA INTERAÇÃO:\n${objetivo}`;
      }
    }
  }

  return messages;
}

/**
 * Metadado de auditoria da injecção DIC (IMP-067).
 * @param {object} params — mesmos campos relevantes de montarMensagensLlm
 * @returns {{ injectado: boolean, id?: string, versao?: string }}
 */
export function metadadoDicInjecao(params = {}) {
  const injectado = deveInjectarDic(params);
  if (!injectado) return { injectado: false };
  return { injectado: true, id: DIC_ID, versao: DIC_VERSAO };
}

/** @deprecated Use montarMensagensLlm — mantido só se algum import legado restar. */
export function construirSystemPrompt() {
  return [obterConstituicaoCeo(), obterGovernancaLlm()].join("\n\n");
}

/** @deprecated Use construirContextoSessao. */
export { construirContextoSessao as construirBlocoContexto } from "./contextoSessao.js";
