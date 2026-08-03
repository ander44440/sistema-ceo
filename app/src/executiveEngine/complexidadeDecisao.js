/**
 * Complexidade da decisão → custo do caminho (REQ-066 / ARQ-027).
 * Módulo auxiliar puro: não classifica intenção; não cria Jobs.
 * Complexidade ≠ Classe.
 */

import { normalizarTexto } from "../classificadorIntencao/lexicon.js";
import {
  ehDeliberacaoProjetoE22,
  ehConhecimentoGeralE22
} from "../classificadorIntencao/regras.js";
import { mensagemEhDeixisOuFollowUp } from "../classificadorIntencao/historicoRecente.js";

/** @typedef {"instantaneo"|"leve"|"moderado"|"completa"} NivelComplexidade */

/**
 * @typedef {object} ResultadoComplexidade
 * @property {NivelComplexidade} nivel
 * @property {number} maxTokens
 * @property {boolean} permiteMreCompleto
 * @property {string} razao
 */

/** Flag rollback L1 (ARQ-027). */
export let COMPLEXIDADE_ROTEAMENTO_ATIVO = true;

/**
 * @param {boolean} ativo
 */
export function definirComplexidadeRoteamentoAtivo(ativo) {
  COMPLEXIDADE_ROTEAMENTO_ATIVO = Boolean(ativo);
}

const MAX_TOKENS = Object.freeze({
  instantaneo: 0,
  leve: 450,
  moderado: 700,
  completa: 900
});

/** Marcadores de decisão pesada → MRE completo. */
const RE_COMPLETA =
  /\b(como\s+devemos|como\s+organizar|prioriz(ar|e|amos)|decidir\s+entre|trade-?off|alternativas?|roadmap|planejar\s+a\s+sprint|sprint\s+\d|arquitectura|arquitetura|riscos?\s+de|oportunidades?|compar(ar|e)|em\s+vez\s+de|vs\.?|versus|pr[oó]xima\s+decis[aã]o|decis[aã]o\s+mais\s+importante|principal\s+pend[eê]ncia|se\s+(voc[eê]|tu)\s+fosse\s+o\s+ceo)\b/i;

/** Retoma / follow-up leve de projecto. */
const RE_MODERADO =
  /\b(onde\s+paramos|onde\s+estamos|voltando\s+(a|ao|à|para)|retomando|continua|continue|prossiga|pr[oó]ximo\s+passo|o\s+que\s+falta|status\s+(do|da|atual)|em\s+que\s+ponto)\b/i;

/**
 * @param {object} [entrada]
 * @param {string} [entrada.texto]
 * @param {{ id?: string, classe?: string, destino?: string, capacidade?: string }} [entrada.intencao]
 * @param {string} [entrada.classe]
 * @param {string} [entrada.destino]
 * @param {boolean} [entrada.frenteActiva]
 * @returns {ResultadoComplexidade}
 */
export function avaliarComplexidadeDecisao(entrada = {}) {
  const texto = String(entrada.texto || "").trim();
  const t = normalizarTexto(texto);
  const intencao = entrada.intencao || {};
  const classe = String(entrada.classe || intencao.classe || "");
  const destino = String(entrada.destino || intencao.destino || "");
  const id = String(intencao.id || "");

  if (!COMPLEXIDADE_ROTEAMENTO_ATIVO) {
    return resultado(
      destino === "resposta_leve" || classe === "conhecimento_geral"
        ? "leve"
        : "completa",
      "COMPLEXIDADE_ROTEAMENTO_ATIVO=false → path legado"
    );
  }

  // L0 — determinístico local
  if (
    ["saudacao", "pergunta_data", "pergunta_hora", "pergunta_identidade", "instrucao_vazia"].includes(
      id
    )
  ) {
    return resultado("instantaneo", `intenção local «${id}»`);
  }

  // L1 — conhecimento geral / C4 / resposta leve
  if (
    classe === "conhecimento_geral" ||
    destino === "resposta_leve" ||
    classe === "comando_operacional" ||
    destino === "capacidade_operacional" ||
    ehConhecimentoGeralE22(t)
  ) {
    return resultado("leve", "conhecimento geral ou comando operacional");
  }

  // Deliberativo / C2
  const deliberativo =
    classe === "conversa_projeto" ||
    destino === "nucleo_mre" ||
    ["deliberar", "deliberar_objetivo", "pergunta_aberta"].includes(id);

  if (!deliberativo) {
    return resultado("leve", "caminho não deliberativo → esforço leve");
  }

  // L3 — decisão complexa
  if (
    RE_COMPLETA.test(texto) ||
    RE_COMPLETA.test(t) ||
    ehDeliberacaoProjetoE22(t, {
      frenteActiva: entrada.frenteActiva === true
    })
  ) {
    return resultado("completa", "marcadores de deliberação / trade-off");
  }

  if (texto.length > 180) {
    return resultado("completa", "enunciado longo → deliberação completa");
  }

  // L2 — retoma / follow-up curto
  if (
    RE_MODERADO.test(texto) ||
    RE_MODERADO.test(t) ||
    mensagemEhDeixisOuFollowUp(t) ||
    texto.split(/\s+/).filter(Boolean).length <= 14
  ) {
    return resultado("moderado", "retoma ou follow-up curto de projecto");
  }

  // Dúvida → não sub-dimensionar
  return resultado("completa", "deliberativo sem marcador leve → MRE completo");
}

/**
 * @param {NivelComplexidade} nivel
 * @param {string} razao
 * @returns {ResultadoComplexidade}
 */
function resultado(nivel, razao) {
  return {
    nivel,
    maxTokens: MAX_TOKENS[nivel] ?? 900,
    permiteMreCompleto: nivel === "completa",
    razao
  };
}

export const NIVEIS_COMPLEXIDADE = Object.freeze([
  "instantaneo",
  "leve",
  "moderado",
  "completa"
]);
