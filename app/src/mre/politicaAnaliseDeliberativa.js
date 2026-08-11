/**
 * P1-2 — Política de análise deliberativa (C2).
 * Análise ≠ consulta de estado ≠ execução ≠ delegação fictícia.
 * E4: recomendação operacional ≠ deliberação de proposta.
 */

import { normalizarTexto } from "../classificadorIntencao/lexicon.js";
import {
  ehPedidoAnaliseOuRecomendacao,
  ehProibicaoExecucaoExplicita
} from "../classificadorIntencao/regras.js";
import {
  ehDeliberacaoDeProposta,
  ehRecomendacaoOperacional,
  temObjetoPropostaDeliberativa
} from "../classificadorIntencao/recomendacaoOperacional.js";

/**
 * Pedido explícito de análise / avaliação / recomendação deliberativa (P1-2).
 * Mais estrito que `ehPedidoAnaliseOuRecomendacao` (classificador):
 * «O que devemos fazer agora?» NÃO conta — pode ser priorização com lastro Gate/Job.
 * «recomenda» isoladamente NÃO activa deliberação — exige lastro de proposta/produto.
 * @param {string} [texto]
 */
export function detectarPedidoAnaliseDeliberativa(texto) {
  const t = normalizarTexto(texto);
  if (!t) return false;
  // E4: juízo operacional sobre prioridade/sprint/job ≠ deliberação de proposta
  if (ehRecomendacaoOperacional(t)) return false;
  // Classificador: se nem lá é análise, não forçar prosa P1-2
  if (!ehPedidoAnaliseOuRecomendacao(t)) return false;

  const substantiva =
    /\b(analisa|analise|analisar)\b/.test(t) ||
    /\b(avalia|avalie|avaliar)\b/.test(t) ||
    /\b(compara|compare|comparar)\b/.test(t) ||
    /\b(pros?\s+e\s+contras?|pontos?\s+(positivos?|negativos?))\b/.test(t) ||
    /\b(aprovaria|modificaria|priorizaria|nao\s+priorizaria)\b/.test(t) ||
    /\bsegundo\s+o\s+manifesto\b/.test(t) ||
    /\best[aá]\s+alinhad[oa]\s+(ao|com)\s+(o\s+)?manifesto\b/.test(t) ||
    /\b(de|dê|da)\s+(uma\s+)?recomendacao\s+executiva\b/.test(t);

  if (substantiva) {
    // Análise de estado de Job + «recomende o que fazer» já foi excluída acima
    // via ehRecomendacaoOperacional; restante analisa/avalia segue deliberativo
    // excepto se for só análise de estado sem proposta (T8 path).
    if (
      /\b(analisa|analise|analisar)\b/.test(t) &&
      /\bjobs?-\d+\b/.test(t) &&
      !temObjetoPropostaDeliberativa(t) &&
      (/\brecomend/.test(t) || /\bo\s+que\s+fazer\b/.test(t) || /\bestado\b/.test(t))
    ) {
      return false;
    }
    return true;
  }

  // «recomenda» só com lastro de proposta / aprovar produto
  if (/\b(recomenda|recomendaria|recomendacao|voce\s+recomenda)\b/.test(t)) {
    return (
      ehDeliberacaoDeProposta(t) ||
      temObjetoPropostaDeliberativa(t) ||
      /\baprovar\b/.test(t)
    );
  }

  return false;
}

/**
 * Pedido explícito de handoff/delegação (não confundir com «não crie Job»).
 * @param {string} [texto]
 */
export function ehPedidoDelegacaoExplicita(texto) {
  const t = normalizarTexto(texto);
  if (!t) return false;
  if (ehProibicaoExecucaoExplicita(t)) return false;
  return (
    /\b(delegue|delegar)\b.*\b(tarefa|trabalho|isto|isso|esta|este|fila|jobs?)\b/.test(
      t
    ) ||
    /\bdespacha(r|e)?\b/.test(t) ||
    /\b(crie|cria|criar)\s+(um\s+)?jobs?\b/.test(t)
  );
}

/**
 * «Delegar a análise a uma equipe especializada» — não existe no sistema.
 * @param {string} [estado]
 * @param {string} [recomendacao]
 */
export function ehDelegacaoFicticiaAnalise(estado, recomendacao) {
  if (String(estado || "") !== "delegar") return false;
  const r = String(recomendacao || "");
  return (
    /equipe\s+especializ|especialistas/i.test(r) ||
    /delegar\s+(a\s+)?(an[aá]lise|tarefa|proposta|avalia)/i.test(r) ||
    /garantir\s+uma\s+an[aá]lise\s+fundamentada/i.test(r) ||
    /falta\s+de\s+informa[cç][oõ]es\s+no\s+Acervo/i.test(r)
  );
}

/**
 * Hint para o estágio 6 quando o utilizador pediu análise/recomendação.
 */
export function hintEstagio6AnaliseDeliberativa() {
  return (
    " P1-2 PEDIDO DE ANÁLISE/RECOMENDAÇÃO (não execução): " +
    "Proibido usar estado=delegar como substituto de análise. " +
    "Proibido inventar «equipe especializada» ou transferir a análise a agentes inexistentes. " +
    "Preferir estado: monitorar | aprovar | rejeitar | solicitar_dados | adiar. " +
    "A recomendacao DEVE responder explicitamente: aprovar, modificar ou não priorizar a proposta. " +
    "A análise substantiva está no campo analise (estágio 4) — não a substitua por handoff."
  );
}

/**
 * Remapeia decisão pós-estágio 6: análise pedida não vira despacho fictício.
 * @param {object} decisao
 * @param {{ pedidoAnalise?: boolean, pedidoDelegacaoExplicita?: boolean, analise?: string }} [opts]
 */
export function aplicarPoliticaAnaliseDeliberativa(decisao, opts = {}) {
  if (!decisao || typeof decisao !== "object") return decisao;
  if (!opts.pedidoAnalise || opts.pedidoDelegacaoExplicita) return decisao;

  let estado = decisao.estado;
  let recomendacao = String(decisao.recomendacao || "").trim();
  let justificativa = String(decisao.justificativa || "").trim();

  const ficticia = ehDelegacaoFicticiaAnalise(estado, recomendacao);
  if (estado !== "delegar" && !ficticia) return decisao;

  const faltaDados =
    /solicitar|falt|lacuna|dados|informa/i.test(recomendacao) ||
    /Acervo|informa[cç][oõ]es\s+adicionais/i.test(recomendacao);

  estado = faltaDados ? "solicitar_dados" : "monitorar";

  if (ficticia || /delegar|equipe\s+especializ|especialistas/i.test(recomendacao)) {
    recomendacao =
      "A posição executiva está na análise acima (aprovar, modificar ou não priorizar). " +
      "Não transfero esta deliberação a agentes externos inexistentes neste sistema.";
    justificativa = (
      justificativa +
      " P1-2: pedido era análise/recomendação; delegação fictícia convertida em posição sem despacho."
    ).trim();
  }

  return {
    ...decisao,
    estado,
    recomendacao,
    justificativa
  };
}

/**
 * Prosa ao utilizador: análise + recomendação (não «Delego a execução»).
 * @param {object} parecer
 * @param {{ maxAnalise?: number }} [opts]
 * @returns {string|null}
 */
export function montarProsaAnaliseDeliberativa(parecer, opts = {}) {
  if (!parecer || typeof parecer !== "object") return null;
  const analise = String(parecer.analise || "").trim();
  const recomendacao = String(
    parecer.decisaoExecutiva?.recomendacao || ""
  ).trim();
  const justificativa = String(
    parecer.decisaoExecutiva?.justificativa || ""
  ).trim();
  const principios = Array.isArray(parecer.principiosAplicados)
    ? parecer.principiosAplicados.map((p) => String(p || "").trim()).filter(Boolean)
    : [];
  const lacunas = Array.isArray(parecer.lacunas)
    ? parecer.lacunas.map((l) => String(l || "").trim()).filter(Boolean)
    : [];

  const max = opts.maxAnalise ?? 900;
  const corpoAnalise = analise
    ? analise.length <= max
      ? analise
      : `${analise.slice(0, max - 1)}…`
    : null;

  const partes = [];
  if (corpoAnalise) {
    partes.push(corpoAnalise.endsWith(".") ? corpoAnalise : `${corpoAnalise}.`);
  }
  if (recomendacao) {
    partes.push(`Recomendação: ${recomendacao.replace(/\.$/, "")}.`);
  }
  if (principios.length) {
    const rotulo = principios.some((p) => /^§\d+/.test(p))
      ? "Princípios do Manifesto MG2 que influenciam esta posição"
      : "Princípios que influenciam esta posição";
    partes.push(`${rotulo}: ${principios.slice(0, 4).join("; ")}.`);
  } else if (
    justificativa &&
    /princ[ií]pio|manifes|vis[aã]o|ADR-\d+/i.test(justificativa)
  ) {
    const j =
      justificativa.length <= 280
        ? justificativa
        : `${justificativa.slice(0, 279)}…`;
    partes.push(j.endsWith(".") ? j : `${j}.`);
  }
  if (lacunas.length) {
    partes.push(`Lacunas: ${lacunas.slice(0, 3).join("; ")}.`);
  }

  if (partes.length === 0) return null;
  return partes.join("\n\n");
}
