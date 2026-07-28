/**
 * Classificação de intenção — stub determinístico (sem IA).
 */

/**
 * @typedef {object} Intencao
 * @property {string} id
 * @property {string} capacidade
 * @property {number} confianca
 * @property {"stub"} origem
 */

/** Normaliza abreviações e ruído comum de chat. */
export function normalizarTexto(texto) {
  return String(texto || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/\bhj\b/g, "hoje")
    .replace(/\btbm\b/g, "também")
    .replace(/\bpq\b/g, "porque")
    .replace(/\bvc\b/g, "você")
    .replace(/\bq\b/g, "que")
    .replace(/[?？]+$/g, "")
    .trim();
}

/**
 * @param {string} texto
 * @returns {Intencao}
 */
export function classificarIntencao(texto) {
  const t = normalizarTexto(texto);

  if (!t) {
    return {
      id: "instrucao_vazia",
      capacidade: "ia",
      confianca: 1,
      origem: "stub"
    };
  }

  if (
    /^(ol[aá]|oi|bom dia|boa tarde|boa noite|hey|hello)([!. ]|$)/.test(t) ||
    /^(ol[aá]|oi|bom dia|boa tarde|boa noite)\b/.test(t)
  ) {
    return {
      id: "saudacao",
      capacidade: "ia",
      confianca: 0.95,
      origem: "stub"
    };
  }

  // Perguntas factuais simples — responder direto, sem “menu executivo”.
  if (
    /\b(que dia (e|é)|qual (e|é) (o )?dia|data de hoje|hoje e que dia|hoje é que dia)\b/.test(
      t
    ) ||
    /\bdia (e|é) hoje\b/.test(t) ||
    /^data$/.test(t)
  ) {
    return {
      id: "pergunta_data",
      capacidade: "ia",
      confianca: 0.98,
      origem: "stub"
    };
  }

  if (
    /\b(que horas|qual (e|é) a hora|hora atual|horas sao|horas são)\b/.test(t) ||
    /^hora$/.test(t)
  ) {
    return {
      id: "pergunta_hora",
      capacidade: "ia",
      confianca: 0.98,
      origem: "stub"
    };
  }

  if (
    /\b(quem (e|é) (voc[eê]|tu)|o que (e|é) (voc[eê]|o ceo)|o que voc[eê] (e|é|faz))\b/.test(
      t
    )
  ) {
    return {
      id: "pergunta_identidade",
      capacidade: "ia",
      confianca: 0.95,
      origem: "stub"
    };
  }

  if (
    /qual\s+[eé]\s+o\s+estado\s+atual/.test(t) ||
    /\bestado\s+atual\b/.test(t) ||
    /\b(resumo\s+(executivo|da\s+sess[aã]o)|mem[oó]ria\s+executiva)\b/.test(t)
  ) {
    return {
      id: "consultar_estado",
      capacidade: "memoria",
      confianca: 0.95,
      origem: "stub"
    };
  }

  // Onda 03 E4 — classificar só o cabeçalho (antes de ":") para não
  // confundir continuidade ("… | Abrir dia amanhã") com abrir_dia.
  {
    const cabeca = t.split(":")[0].trim();
    if (/\b(encerrar|fechar)\s+(o\s+)?dia\b/.test(cabeca)) {
      return {
        id: "encerrar_dia",
        capacidade: "memoria",
        confianca: 0.96,
        origem: "stub"
      };
    }
    if (
      /\babrir\s+(o\s+)?dia\b/.test(cabeca) ||
      /\b(iniciar|come[cç]ar)\s+(o\s+)?dia\b/.test(cabeca)
    ) {
      return {
        id: "abrir_dia",
        capacidade: "memoria",
        confianca: 0.96,
        origem: "stub"
      };
    }
  }

  if (
    /\b(registrar|criar|adicionar)\s+decis/.test(t) ||
    /^decis[aã]o\s*:/.test(t)
  ) {
    return {
      id: "registrar_decisao",
      capacidade: "memoria",
      confianca: 0.92,
      origem: "stub"
    };
  }

  if (
    /\b(registrar|criar|adicionar)\s+pend/.test(t) ||
    /^pend[eê]ncia\s*:/.test(t)
  ) {
    return {
      id: "registrar_pendencia",
      capacidade: "memoria",
      confianca: 0.92,
      origem: "stub"
    };
  }

  if (
    /\b(registrar|criar|adicionar)\s+pr[oó]xima/.test(t) ||
    /^pr[oó]xima\s+a[cç][aã]o\s*:/.test(t)
  ) {
    return {
      id: "registrar_proxima_acao",
      capacidade: "memoria",
      confianca: 0.92,
      origem: "stub"
    };
  }

  if (/\b(pend[eê]ncia|pendencias|analisar pend)/.test(t)) {
    return {
      id: "analisar_pendencias",
      capacidade: "memoria",
      confianca: 0.85,
      origem: "stub"
    };
  }

  if (
    /\b(abrir|ir para|navegar|mostrar|ir ao|ir à)\b/.test(t) &&
    /\b(dashboard|situação|situacao|conversa|capacidades|projetos|conhecimento|configura)/.test(
      t
    )
  ) {
    return {
      id: "navegar",
      capacidade: "navegacao",
      confianca: 0.8,
      origem: "stub"
    };
  }

  if (
    /\b(abrir projeto|ativar (o )?coa|trocar (para o )?projeto|definir coa)\b/.test(t) ||
    (/^\s*(projeto|coa)\b/.test(t) && t.length < 80)
  ) {
    return {
      id: "atuar_em_projetos",
      capacidade: "projetos",
      confianca: 0.8,
      origem: "stub"
    };
  }

  if (/\b(dashboard|painel|visão executiva|visao executiva|posto de comando|centro de situa)/.test(t)) {
    return {
      id: "consultar_dashboard",
      capacidade: "dashboard",
      confianca: 0.7,
      origem: "stub"
    };
  }

  if (/\b(conhecimento|patrim[oó]nio|documento|acervo|buscar no acervo)\b/.test(t)) {
    return {
      id: "consultar_conhecimento",
      capacidade: "conhecimento",
      confianca: 0.75,
      origem: "stub"
    };
  }

  if (/\b(ferramenta|tool|integra[cç][aã]o|conectar)\b/.test(t)) {
    return {
      id: "usar_ferramenta",
      capacidade: "ferramentas",
      confianca: 0.65,
      origem: "stub"
    };
  }

  if (/\b(prioriz|planej|decid|analis|revis|organiz|próximo passo|proximo passo|objetivo|motoboy|mg2)\b/.test(t)) {
    return {
      id: "deliberar_objetivo",
      capacidade: "ia",
      confianca: 0.7,
      origem: "stub"
    };
  }

  // Pergunta genérica (começa por que/qual/quando/onde/como/por que)
  if (/^(que|qual|quando|onde|como|por que|porque|quem)\b/.test(t)) {
    return {
      id: "pergunta_aberta",
      capacidade: "ia",
      confianca: 0.5,
      origem: "stub"
    };
  }

  return {
    id: "deliberar",
    capacidade: "ia",
    confianca: 0.4,
    origem: "stub"
  };
}
