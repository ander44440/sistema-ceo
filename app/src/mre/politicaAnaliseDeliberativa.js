/**
 * P1-2 — Política de análise deliberativa (C2).
 * Análise ≠ consulta de estado ≠ execução ≠ delegação fictícia.
 * E4: recomendação operacional ≠ deliberação de proposta.
 */

import { normalizarTexto } from "../classificadorIntencao/lexicon.js";
import {
  ehPedidoAnaliseOuRecomendacao,
  ehPedidoSituacionalTrabalho,
  ehProibicaoExecucaoExplicita
} from "../classificadorIntencao/regras.js";
import {
  ehDeliberacaoDeProposta,
  ehRecomendacaoOperacional,
  temObjetoPropostaDeliberativa
} from "../classificadorIntencao/recomendacaoOperacional.js";

/** Flag de sessão curta: último `detectarPedidoAnaliseDeliberativa` viu análise-somente. */
let analiseSomenteActiva = false;
/** Flag de sessão curta: autoanálise da resposta anterior (P4). */
let autoanaliseActiva = false;

/**
 * Proibição explícita de decisão/recomendação — modo ANÁLISE SOMENTE.
 * @param {string} [texto]
 */
export function ehAnaliseSomente(texto) {
  const t = normalizarTexto(texto);
  if (!t) return false;
  return (
    /\b(apenas|somente)\s+(analis[ae]|analisar|avali[ae]|avaliar)\b/.test(t) ||
    /\bvamos\s+apenas\s+(avaliar|analisar|analise)\b/.test(t) ||
    /\bnao\s+quero\s+recomend/.test(t) ||
    /\bnao\s+fa[cz]a\s+recomend/.test(t) ||
    /\bnao\s+tome\s+(nenhuma\s+)?decis/.test(t)
  );
}

/**
 * Pedido explícito de autoanálise da própria resposta anterior (P4).
 * @param {string} [texto]
 */
export function ehAutoanaliseRespostaAnterior(texto) {
  const t = normalizarTexto(texto);
  if (!t) return false;
  return (
    /\b(analis[ae]|analisar|avali[ae]|avaliar).{0,60}(sua|a)\s+resposta\s+anterior\b/.test(
      t
    ) ||
    /\bresposta\s+anterior\b.{0,60}\b(acert|err|melhor|criticamente)\b/.test(t) ||
    /\b(acert|err|melhor).{0,40}resposta\s+anterior\b/.test(t) ||
    /\bonde\s+(voce|eu)\s+errou\b/.test(t) ||
    /\bo\s+que\s+(voce|eu)\s+(acertou|errou)\b/.test(t) ||
    /\bo\s+que\s+(voce|eu)\s+poderia\s+ter\s+feito\s+melhor\b/.test(t)
  );
}

/**
 * @returns {boolean}
 */
export function obterAnaliseSomenteActiva() {
  return analiseSomenteActiva === true;
}

/**
 * @returns {boolean}
 */
export function obterAutoanaliseActiva() {
  return autoanaliseActiva === true;
}

/**
 * Pedido explícito de análise / avaliação / recomendação deliberativa (P1-2).
 * Mais estrito que `ehPedidoAnaliseOuRecomendacao` (classificador):
 * «O que devemos fazer agora?» NÃO conta — pode ser priorização com lastro Gate/Job.
 * «recomenda» isoladamente NÃO activa deliberação — exige lastro de proposta/produto.
 * @param {string} [texto]
 */
export function detectarPedidoAnaliseDeliberativa(texto) {
  const t = normalizarTexto(texto);
  if (!t) {
    analiseSomenteActiva = false;
    autoanaliseActiva = false;
    return false;
  }
  autoanaliseActiva = ehAutoanaliseRespostaAnterior(texto);
  analiseSomenteActiva = ehAnaliseSomente(texto);
  // E4: juízo operacional sobre prioridade/sprint/job ≠ deliberação de proposta
  if (ehRecomendacaoOperacional(t)) {
    analiseSomenteActiva = false;
    autoanaliseActiva = false;
    return false;
  }
  // P4: autoanálise da resposta anterior → path P1-2 sem recomendação/decisão
  if (autoanaliseActiva) return true;
  // Análise somente explícita → path P1-2 (prosa/hint sem recomendação)
  if (analiseSomenteActiva) return true;
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
 * CONSULTA situacional / precedência tipoTurno=consulta → RESPONDER (não executar).
 * @param {string} [texto]
 * @param {{
 *   consultaNaoEAcao?: boolean,
 *   tipoTurno?: string,
 *   precedenciaTurno?: { tipoTurno?: string },
 *   situacional?: boolean
 * }} [ctx]
 */
export function detectarPedidoConsultaResposta(texto, ctx = {}) {
  if (ctx.consultaNaoEAcao === true) return true;
  const tipo =
    ctx.tipoTurno ||
    ctx.precedenciaTurno?.tipoTurno ||
    null;
  if (tipo === "consulta") return true;
  // Fatia 1: situacional já produzido em derivacoes — sem re-chamar o detector
  if (ctx.situacional != null) return ctx.situacional === true;
  return ehPedidoSituacionalTrabalho(normalizarTexto(texto));
}

/**
 * Hint estágio 6: consulta de estado do trabalho ≠ plano/delegação/execução.
 */
export function hintEstagio6ConsultaResposta() {
  return (
    " CONSULTA DE ESTADO DO TRABALHO (responder, não executar): " +
    "Usar APENAS o SNAPSHOT SITUACIONAL / factosOficiais do turno. " +
    "O utilizador pede informação sobre o estado actual do trabalho — " +
    "NÃO é pedido de plano, relatório, delegação nem execução. " +
    "Proibido estado=delegar. Preferir monitorar ou solicitar_dados. " +
    "Proibido inventar problema, relatório, etapa ou progresso. " +
    "Se houver LACUNA / LASTRO INSUFICIENTE no snapshot, declare as lacunas. " +
    "Campo recomendacao = resposta factual alinhada ao snapshot. " +
    "A resposta substantiva está no campo analise (estágio 4)."
  );
}

/**
 * Remapeia decisão pós-estágio 6: consulta não vira delegação/plano/execução.
 * @param {object} decisao
 * @param {{ pedidoConsulta?: boolean, pedidoDelegacaoExplicita?: boolean }} [opts]
 */
export function aplicarPoliticaConsultaResposta(decisao, opts = {}) {
  if (!decisao || typeof decisao !== "object") return decisao;
  if (!opts.pedidoConsulta || opts.pedidoDelegacaoExplicita) return decisao;

  let estado = decisao.estado;
  let recomendacao = String(decisao.recomendacao || "").trim();
  let justificativa = String(decisao.justificativa || "").trim();

  const prosaAccao =
    /delegar|elabora(r|ção)\s+(de\s+)?(um\s+)?relat|\bplano\s*:|equipe\s+especializ/i.test(
      recomendacao
    );
  const estadoAccao =
    estado === "delegar" || estado === "aprovar" || estado === "rejeitar";

  if (!estadoAccao && !prosaAccao) return decisao;

  const faltaDados =
    /solicitar|falt|lacuna|dados|informa/i.test(recomendacao) ||
    estado === "solicitar_dados";

  estado = faltaDados ? "solicitar_dados" : "monitorar";

  if (prosaAccao || estadoAccao) {
    if (prosaAccao || !recomendacao) {
      recomendacao =
        "Resposta informativa ao estado do trabalho (ver análise) — sem delegação nem plano de execução.";
    }
    justificativa = (
      justificativa +
      " CONSULTA: turno informativo; delegação/plano/execução removidos da resposta."
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
 * Prosa ao utilizador: resposta factual (não «Delego» / «Plano:»).
 * @param {object} parecer
 * @param {{ maxAnalise?: number }} [opts]
 * @returns {string|null}
 */
export function montarProsaConsultaResposta(parecer, opts = {}) {
  if (!parecer || typeof parecer !== "object") return null;
  const analise = String(parecer.analise || "").trim();
  const recomendacao = String(
    parecer.decisaoExecutiva?.recomendacao || ""
  ).trim();
  const lacunas = Array.isArray(parecer.lacunas)
    ? parecer.lacunas.map((l) => String(l || "").trim()).filter(Boolean)
    : [];
  const max = opts.maxAnalise ?? 900;
  const corpo = analise || recomendacao;
  if (!corpo && lacunas.length === 0) return null;
  const texto = corpo
    ? corpo.length <= max
      ? corpo.endsWith(".")
        ? corpo
        : `${corpo}.`
      : `${corpo.slice(0, max - 1)}…`
    : null;
  const partes = [];
  if (texto) partes.push(texto);
  if (lacunas.length) {
    partes.push(`Lacunas: ${lacunas.slice(0, 3).join("; ")}.`);
  }
  return partes.length ? partes.join(" ") : null;
}

/**
 * Hint para o estágio 6 quando o utilizador pediu análise/recomendação.
 */
export function hintEstagio6AnaliseDeliberativa() {
  if (autoanaliseActiva) {
    return (
      " AUTOANÁLISE DA RESPOSTA ANTERIOR (não execução, não decisão): " +
      "Use o fio recente da conversa para examinar criticamente a ÚLTIMA resposta do CEO. " +
      "No campo analise, aponte: acertos, erros, lacunas, inconsistências e o que poderia ser melhorado. " +
      "Proibido Decisão, Recomendação, escolha de opção, aprovar/modificar/não priorizar, " +
      "próximo passo prescritivo ou instrução de execução. " +
      "Preferir estado=monitorar. Campo recomendacao: vazio."
    );
  }
  if (analiseSomenteActiva) {
    return (
      " ANÁLISE SOMENTE (não execução, não decisão): " +
      "Proibido Decisão, Recomendação, escolha de opção, aprovar/modificar/não priorizar, " +
      "próximo passo prescritivo ou instrução de execução. " +
      "Permitido: análise, avaliação, comparação, riscos, cenários, lacunas e incertezas. " +
      "Preferir estado=monitorar ou solicitar_dados. Campo recomendacao: vazio ou só lacunas — sem escolha. " +
      "A análise substantiva está no campo analise (estágio 4)."
    );
  }
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
    if (analiseSomenteActiva || autoanaliseActiva) {
      recomendacao = "";
      justificativa = (
        justificativa +
        (autoanaliseActiva
          ? " P4: autoanálise — sem decisão/recomendação; delegação fictícia removida."
          : " P3: análise somente — sem decisão/recomendação; delegação fictícia removida.")
      ).trim();
    } else {
      recomendacao =
        "A posição executiva está na análise acima (aprovar, modificar ou não priorizar). " +
        "Não transfero esta deliberação a agentes externos inexistentes neste sistema.";
      justificativa = (
        justificativa +
        " P1-2: pedido era análise/recomendação; delegação fictícia convertida em posição sem despacho."
      ).trim();
    }
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
 * Em modo ANÁLISE SOMENTE / AUTOANÁLISE: só análise (+ princípios/lacunas), sem Recomendação/Decisão.
 * @param {object} parecer
 * @param {{ maxAnalise?: number, analiseSomente?: boolean, instrucao?: string }} [opts]
 * @returns {string|null}
 */
export function montarProsaAnaliseDeliberativa(parecer, opts = {}) {
  if (!parecer || typeof parecer !== "object") return null;
  const soAnalise =
    opts.analiseSomente === true ||
    (opts.instrucao != null &&
      (ehAnaliseSomente(opts.instrucao) ||
        ehAutoanaliseRespostaAnterior(opts.instrucao))) ||
    analiseSomenteActiva === true ||
    autoanaliseActiva === true;
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
  if (recomendacao && !soAnalise) {
    partes.push(`Recomendação: ${recomendacao.replace(/\.$/, "")}.`);
  }
  if (principios.length && !autoanaliseActiva) {
    const rotulo = principios.some((p) => /^§\d+/.test(p))
      ? "Princípios do Manifesto MG2 que influenciam esta posição"
      : "Princípios que influenciam esta posição";
    partes.push(`${rotulo}: ${principios.slice(0, 4).join("; ")}.`);
  } else if (
    !soAnalise &&
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
