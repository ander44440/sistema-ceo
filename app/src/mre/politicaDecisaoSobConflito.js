/**
 * Decisão sob conflito — quando o utilizador exige decisão explícita,
 * proibir escape para «delegar análise» / «analisar mais» sem fecho.
 * Simétrica a P1-2 (análise), sem novo enum de estado.
 */

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
 * @param {{ recomendacao?: string, alternativas?: string[], analise?: string }} p
 * @returns {"aprovar"|"rejeitar"|"monitorar"}
 */
function inferirEstadoEscolha(p) {
  const blob = [
    String(p.recomendacao || ""),
    String(p.analise || ""),
    ...(Array.isArray(p.alternativas) ? p.alternativas.map(String) : [])
  ].join(" ");

  if (
    /\b(rejeit|n[aã]o\s+aprovar|n[aã]o\s+prioriz|recus|descart)/i.test(blob)
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

  // Se a recomendação já nomeia uma escolha sem handoff, reutiliza
  if (
    prev &&
    !/delegar|equipe\s+especializ|analisar\s+mais|precisamos\s+(de\s+)?(mais\s+)?an[aá]lise/i.test(
      prev
    )
  ) {
    return prev;
  }

  const escolha =
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

  if (!handoff && !solicitarSemBloqueante) {
    return decisao;
  }

  const estadoNovo = inferirEstadoEscolha({
    recomendacao,
    alternativas,
    analise: opts.analise
  });
  estado = estadoNovo;
  recomendacao = montarRecomendacaoFecho({
    estado,
    recomendacao,
    alternativas
  });
  justificativa = (
    justificativa +
    " Decisão sob conflito: pedido explícito de decisão; " +
    "handoff/«analisar mais» sem facto bloqueante nomeado convertidos em fecho " +
    "com critérios já disponíveis (conflito ≠ lacuna)."
  ).trim();

  return {
    ...decisao,
    estado,
    recomendacao,
    justificativa
  };
}
