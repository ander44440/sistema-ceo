/**
 * Decisão sob conflito — quando o utilizador exige decisão explícita,
 * proibir escape para «delegar análise» / «analisar mais» sem fecho.
 * Simétrica a P1-2 (análise), sem novo enum de estado.
 */

import { normalizarTexto } from "../classificadorIntencao/lexicon.js";
import { temMenuAlternativasDecisorias } from "../classificadorIntencao/pedidoDecisaoExplicita.js";

export { detectarPedidoDecisaoExplicita } from "../classificadorIntencao/pedidoDecisaoExplicita.js";

/**
 * Handoff analítico usado como escape de decisão (delegar / «analisar mais»).
 * @param {string} [estado]
 * @param {string} [recomendacao]
 */
export function ehHandoffAnaliticoComoEscape(estado, recomendacao) {
  const e = String(estado || "");
  const r = String(recomendacao || "");
  if (e === "delegar") return true;
  return (
    /delegar\s+(a\s+)?(an[aá]lise|avalia|decis)/i.test(r) ||
    /equipe\s+especializ|especialistas/i.test(r) ||
    /precisamos\s+(de\s+)?(mais\s+)?an[aá]lise/i.test(r) ||
    /analisar\s+mais/i.test(r) ||
    /delegar\s+a\s+an[aá]lise/i.test(r) ||
    /handoff\s+(anal|para)/i.test(r)
  );
}

/**
 * Léxico consultivo P1-2 — não é opção de menu executivo.
 * @param {string} [recomendacao]
 */
export function ehLexicoP12Consultivo(recomendacao) {
  const r = String(recomendacao || "");
  return (
    /\bn[aã]o\s+prioriz/i.test(r) ||
    /\bmodificar\b/i.test(r) ||
    /\baprovar\s+(a\s+)?proposta\b/i.test(r)
  );
}

/**
 * Alternativas do parecer formam menu aceitar/não aceitar/negociar/adiar.
 * @param {string[]} [alternativas]
 */
export function alternativasSaoMenuDecisorio(alternativas) {
  const blob = (Array.isArray(alternativas) ? alternativas : [])
    .map((a) => String(a || "").trim())
    .filter(Boolean)
    .join("; ");
  return temMenuAlternativasDecisorias(normalizarTexto(blob));
}

/**
 * A recomendação já nomeia uma opção do menu (não léxico P1-2).
 * @param {string} [recomendacao]
 * @param {string[]} [alternativas]
 */
export function recomendacaoNomeiaOpcaoMenu(recomendacao, alternativas) {
  const r = normalizarTexto(recomendacao);
  if (!r || ehLexicoP12Consultivo(recomendacao)) return false;
  const alts = Array.isArray(alternativas) ? alternativas : [];
  return alts.some((a) => {
    const n = normalizarTexto(a);
    if (!n) return false;
    return r === n || r.includes(n) || n.includes(r);
  });
}

/**
 * Escolhe opção do menu alinhada ao estado (sem novo enum).
 * monitorar → Adiar (posição provisória), senão Negociar.
 * @param {string} estado
 * @param {string[]} alternativas
 */
export function escolherOpcaoMenuPorEstado(estado, alternativas) {
  const alts = (Array.isArray(alternativas) ? alternativas : [])
    .map((a) => String(a || "").trim())
    .filter(Boolean);
  const find = (pred) => alts.find(pred) || null;
  const e = String(estado || "");

  if (e === "aprovar") {
    return (
      find((a) => /\baceitar\b/i.test(a) && !/\bn[aã]o\s+aceitar\b/i.test(a)) ||
      find((a) => /\baprovar\b/i.test(a)) ||
      alts[0] ||
      null
    );
  }
  if (e === "rejeitar") {
    return (
      find((a) => /\bn[aã]o\s+aceitar\b/i.test(a)) ||
      find((a) => /\brecusar\b/i.test(a)) ||
      find((a) => /\brejeitar\b/i.test(a) && !/\baceitar\b/i.test(a)) ||
      alts[1] ||
      alts[0] ||
      null
    );
  }
  // monitorar / adiar / outros → preferir adiar, depois negociar
  return (
    find((a) => /\badiar\b/i.test(a)) ||
    find((a) => /\bnegociar\b/i.test(a)) ||
    alts[0] ||
    null
  );
}

/**
 * Lacuna / pedido de dados que nomeia um facto bloqueante real
 * (não «conflito entre áreas» genérico).
 * @param {string} texto
 */
export function ehFatoBloqueanteNomeado(texto) {
  const s = String(texto || "").trim();
  if (!s) return false;
  // Conflito inter-áreas sozinho NÃO é lacuna
  if (
    /\bconflito\b/i.test(s) &&
    /\b(engenharia|financeiro|comercial|[aá]reas?)\b/i.test(s) &&
    !/\b(or[cç]amento|n[uú]mero|prazo|data|custo|budget|metric|kpi|assinatura|contrato)\b/i.test(
      s
    )
  ) {
    return false;
  }
  if (/^conflito\b/i.test(s) && s.length < 80) return false;

  return (
    /\b(or[cç]amento|budget|custo\s+exacto|custo\s+exato)\b/i.test(s) ||
    (/\b(prazo|deadline|data\s+limite)\b/i.test(s) &&
      /\b(falt|ausente|desconhec)/i.test(s)) ||
    (/\b(falt[ao]u?|ausente|desconhecid[oa]|n[aã]o\s+informad)/i.test(s) &&
      /\b(or[cç]amento|n[uú]mero|valor|prazo|data|assinatura|contrato|capacidade|headcount|metric|kpi|evid[eê]ncia)\b/i.test(
        s
      )) ||
    /\bfacto\s+bloqueante\b/i.test(s) ||
    /\bdado\s+bloqueante\b/i.test(s)
  );
}

/**
 * @param {{ lacunas?: string[], recomendacao?: string }} opts
 */
export function temFatoBloqueanteNomeado(opts = {}) {
  const rec = String(opts.recomendacao || "");
  if (ehFatoBloqueanteNomeado(rec)) return true;
  const lacunas = Array.isArray(opts.lacunas) ? opts.lacunas : [];
  return lacunas.some((l) => ehFatoBloqueanteNomeado(l));
}

/**
 * Hint estágio 6 — pedido explícito de decisão sob conflito.
 */
export function hintEstagio6DecisaoSobConflito() {
  return (
    " DECISÃO SOB CONFLITO (pedido explícito de decisão): " +
    "O utilizador exige fecho — NÃO use estado=delegar nem «delegar a análise» / " +
    "«equipe especializada» / «precisamos analisar mais» como substituto. " +
    "Obrigatório: escolher uma opção entre as posições conflitantes (ou aprovar/rejeitar " +
    "com critério dominante) e declarar esse critério na recomendacao e justificativa. " +
    "Conflito entre áreas (Engenharia/Financeiro/Comercial), por si só, NÃO é lacuna. " +
    "solicitar_dados SÓ se existir UM facto realmente bloqueante, identificado nominalmente " +
    "(ex.: orçamento em falta, prazo desconhecido) — não por haver divergência de opiniões. " +
    "Não inventar dados ausentes. Preferir estado: aprovar | rejeitar | monitorar " +
    "(com escolha explícita) | solicitar_dados (só com facto bloqueante nomeado)."
  );
}

/**
 * Infere estado de fecho a partir do texto já produzido — sem inventar factos.
 * Nunca força `aprovar` sem sinal textual de aprovação/escolha positiva.
 * Com menu decisório, não usa o texto das alternativas no blob (contêm «não aceitar»).
 * @param {{ recomendacao?: string, alternativas?: string[], analise?: string }} p
 * @returns {"aprovar"|"rejeitar"|"monitorar"}
 */
function inferirEstadoEscolha(p) {
  const rec = String(p.recomendacao || "");
  const analise = String(p.analise || "");
  const alts = Array.isArray(p.alternativas) ? p.alternativas.map(String) : [];
  const menu = alternativasSaoMenuDecisorio(alts);
  const blob = menu
    ? `${rec} ${analise}`
    : [rec, analise, ...alts].join(" ");

  if (
    /\b(rejeit|n[aã]o\s+aprovar|n[aã]o\s+prioriz|recus|descart|nao\s+aceitar)/i.test(
      blob
    )
  ) {
    return "rejeitar";
  }
  if (
    /\b(aprovo|aprovar|aprovad|prioriz[oa]|escolho|opto\s+por|ficamos\s+com)\b/i.test(
      blob
    )
  ) {
    return "aprovar";
  }
  if (
    /\baceitar\b/i.test(rec) &&
    !/\bn[aã]o\s+aceitar\b/i.test(rec)
  ) {
    return "aprovar";
  }
  return "monitorar";
}

/**
 * @param {{ estado: string, recomendacao: string, alternativas?: string[] }} p
 */
function montarRecomendacaoFecho(p) {
  const alts = (Array.isArray(p.alternativas) ? p.alternativas : [])
    .map((a) => String(a || "").trim())
    .filter(Boolean);
  const prev = String(p.recomendacao || "").trim();
  const menu = alternativasSaoMenuDecisorio(alts);
  const lexicoP12 = ehLexicoP12Consultivo(prev);

  const podeReutilizar =
    prev &&
    !/delegar|equipe\s+especializ|analisar\s+mais|precisamos\s+(de\s+)?(mais\s+)?an[aá]lise/i.test(
      prev
    ) &&
    !lexicoP12 &&
    (!menu || recomendacaoNomeiaOpcaoMenu(prev, alts));

  if (podeReutilizar) {
    return prev;
  }

  const escolha =
    (menu ? escolherOpcaoMenuPorEstado(p.estado, alts) : null) ||
    alts[0] ||
    "a opção com melhor equilíbrio entre risco e progresso com os critérios já disponíveis";

  if (p.estado === "aprovar") {
    return `Decisão: aprovo seguir com «${escolha}», com o critério dominante declarado na justificativa.`;
  }
  if (p.estado === "rejeitar") {
    return `Decisão: rejeito «${escolha}» com os critérios já disponíveis; não delego a análise.`;
  }
  return (
    `Decisão sob conflito: escolha executiva — «${escolha}». ` +
    `Critério dominante nos elementos já fornecidos; conflito entre áreas não impede o fecho.`
  );
}

/**
 * Pós-estágio 6: impede escape para handoff analítico quando pediram decisão.
 * Com menu aceitar/não aceitar/negociar/adiar, alinha a recomendação à opção do menu
 * (não preserva léxico P1-2 «não priorizar» / «modificar»).
 * @param {object} decisao
 * @param {{
 *   pedidoDecisao?: boolean,
 *   pedidoDelegacaoExplicita?: boolean,
 *   lacunas?: string[],
 *   analise?: string
 * }} [opts]
 */
export function aplicarPoliticaDecisaoSobConflito(decisao, opts = {}) {
  if (!decisao || typeof decisao !== "object") return decisao;
  if (!opts.pedidoDecisao || opts.pedidoDelegacaoExplicita) return decisao;

  let estado = String(decisao.estado || "");
  let recomendacao = String(decisao.recomendacao || "").trim();
  let justificativa = String(decisao.justificativa || "").trim();
  const alternativas = Array.isArray(decisao.alternativas)
    ? decisao.alternativas
    : [];

  const bloqueante = temFatoBloqueanteNomeado({
    lacunas: opts.lacunas,
    recomendacao
  });

  // Lacuna real nomeada → manter solicitar_dados
  if (estado === "solicitar_dados" && bloqueante) {
    return decisao;
  }

  const handoff = ehHandoffAnaliticoComoEscape(estado, recomendacao);
  const solicitarSemBloqueante = estado === "solicitar_dados" && !bloqueante;
  const menu = alternativasSaoMenuDecisorio(alternativas);
  const lexicoP12 = ehLexicoP12Consultivo(recomendacao);
  const desalinhadoMenu =
    menu &&
    (lexicoP12 || !recomendacaoNomeiaOpcaoMenu(recomendacao, alternativas));

  if (!handoff && !solicitarSemBloqueante && !desalinhadoMenu) {
    return decisao;
  }

  // Reinferir estado em handoff / solicitar sem bloqueante / léxico P1-2
  if (handoff || solicitarSemBloqueante || lexicoP12 || estado === "delegar") {
    estado = inferirEstadoEscolha({
      recomendacao,
      alternativas,
      analise: opts.analise
    });
  } else if (estado === "adiar") {
    estado = "monitorar";
  }

  recomendacao = montarRecomendacaoFecho({
    estado,
    recomendacao,
    alternativas
  });
  justificativa = (
    justificativa +
    (desalinhadoMenu && !handoff && !solicitarSemBloqueante
      ? " Decisão sob conflito: recomendação alinhada ao menu decisório do utilizador."
      : " Decisão sob conflito: pedido explícito de decisão; " +
        "handoff/«analisar mais» sem facto bloqueante nomeado convertidos em fecho " +
        "com critérios já disponíveis (conflito ≠ lacuna).")
  ).trim();

  return {
    ...decisao,
    estado,
    recomendacao,
    justificativa
  };
}
