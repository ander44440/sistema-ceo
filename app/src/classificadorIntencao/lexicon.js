/**
 * Léxico V1 — IMP-057 E2 / REQ-057 RES8 / ARQ-018 §5.
 * Padrões determinísticos por classe. Sem LLM, sem I/O.
 */

/** @typedef {{ id: string, re: RegExp, peso: number }} PadraoLexico */

/** Normaliza texto para matching (alinhado ao stub do Núcleo, sem dependência). */
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
    .replace(/[?？!.]+$/g, "")
    .trim();
}

/** C1 — conhecimento geral / saudação / factos sem projecto. */
export const LEXICO_C1 = Object.freeze([
  Object.freeze({
    id: "saudacao",
    re: /^(ol[aá]|oi|bom dia|boa tarde|boa noite|hey|hello)([!. ]|$)/,
    peso: 0.95
  }),
  Object.freeze({
    id: "saudacao_ini",
    re: /^(ol[aá]|oi|bom dia|boa tarde|boa noite)\b/,
    peso: 0.9
  }),
  Object.freeze({
    id: "hora",
    re: /\b(que horas|qual (e|é) a hora|hora atual|horas s[aã]o)\b|^hora$/,
    peso: 0.95
  }),
  Object.freeze({
    id: "data",
    re: /\b(que dia (e|é)|qual (e|é) (o )?dia|data de hoje|hoje [eé] que dia)\b|^data$/,
    peso: 0.95
  }),
  Object.freeze({
    id: "identidade",
    re: /\bquem\s+(e|é|és)\s+(voc[eê]|tu)\b|\bo\s+que\s+(e|é)\s+(voc[eê]|o\s+ceo)\b|\bo\s+que\s+voc[eê]\s+(e|é|faz)\b/,
    peso: 0.9
  }),
  Object.freeze({
    id: "definicao_generica",
    re: /^o que [eé] (um |uma )?(adr|req|imp|api|llm)\b/,
    peso: 0.75
  })
]);

/** C4 — comandos operacionais do CEO. */
export const LEXICO_C4 = Object.freeze([
  Object.freeze({
    id: "listar_jobs",
    re: /\b(lista(r)?|mostra(r)?|ver|consultar)\s+(os\s+)?jobs?\b/,
    peso: 0.95
  }),
  Object.freeze({
    id: "jobs_pendentes",
    re: /\bjobs?\s+pendentes?\b|\bfila\s+(de\s+)?(execu[cç][aã]o|jobs?)\b/,
    peso: 0.9
  }),
  Object.freeze({
    id: "status",
    re: /^(status|estado)(\s+(do\s+)?(sistema|ceo|sess[aã]o))?$|\bstatus\s+(do\s+)?(sistema|ceo)\b|\bestado\s+atual\b/,
    peso: 0.9
  }),
  Object.freeze({
    id: "painel",
    re: /\b(mostra(r)?|abrir|ver)\s+(o\s+)?painel\b|\bpainel\s+de\s+orquestra/,
    peso: 0.9
  }),
  Object.freeze({
    id: "memoria",
    re: /\b(mem[oó]ria\s+executiva|resumo\s+(executivo|da\s+sess[aã]o)|consultar\s+(a\s+)?mem[oó]ria)\b/,
    peso: 0.85
  }),
  Object.freeze({
    id: "contexto",
    re: /\b(mostra(r)?|qual)\s+(o\s+)?contexto\b|\bcontexto\s+activo\b|\bcoa\s+activo\b/,
    peso: 0.85
  }),
  Object.freeze({
    id: "health",
    re: /\b(sa[uú]de|health)\s+(do\s+)?(backend|api|sistema)\b/,
    peso: 0.85
  }),
  Object.freeze({
    id: "consultar_cto",
    re: /(?:consultar|consulta|pedir|pe[cç]a|parecer)\s+(?:o\s+|ao\s+|do\s+)?cto\b|\bcto\s*:\s*\S+|\bpergunte?\s+ao\s+cto\b/,
    peso: 0.94
  }),
  Object.freeze({
    id: "abrir_encerrar_dia",
    re: /\b(abrir|iniciar|come[cç]ar|encerrar|fechar)\s+(o\s+)?dia\b/,
    peso: 0.92
  }),
  Object.freeze({
    id: "publicar_job_fila",
    re: /\b(publicar|criar|despachar|enviar)\s+job\b|^job\s*:/,
    peso: 0.88
  }),
  Object.freeze({
    id: "registrar_memoria",
    re: /\b(registrar|criar|adicionar)\s+(decis|pend|pr[oó]xima)/,
    peso: 0.88
  }),
  Object.freeze({
    id: "dashboard",
    re: /\b(dashboard|painel|vis[aã]o\s+executiva|posto\s+de\s+comando|centro\s+de\s+situa)/,
    peso: 0.85
  }),
  Object.freeze({
    id: "navegar",
    re: /\b(abrir|ir\s+para|navegar|mostrar)\b.*\b(dashboard|situa[cç][aã]o|conversa|capacidades|projetos|conhecimento|configura)/,
    peso: 0.82
  }),
  Object.freeze({
    id: "projetos_coa",
    re: /\b(abrir\s+projeto|ativar\s+(o\s+)?coa|trocar\s+(para\s+o\s+)?projeto|definir\s+coa)\b/,
    peso: 0.85
  }),
  Object.freeze({
    id: "conhecimento",
    re: /\b(conhecimento|patrim[oó]nio|acervo|buscar\s+no\s+acervo)\b/,
    peso: 0.8
  })
]);

/** C3 — trabalho executivo / despacho / implementação. */
export const LEXICO_C3 = Object.freeze([
  Object.freeze({
    id: "implementa",
    re: /\b(implementa(r)?|implemente)\b/,
    peso: 0.9
  }),
  Object.freeze({
    id: "despacha",
    re: /\b(despacha(r)?|despache|delegar\s+[aà]\s+fila)\b/,
    peso: 0.92
  }),
  Object.freeze({
    id: "cria_job_trabalho",
    re: /\b(cria(r)?|cria)\s+(um\s+)?jobs?\s+(para|de)\b/,
    peso: 0.93
  }),
  Object.freeze({
    id: "corrige_codigo",
    re: /\b(corrige|corrigir|fix)\b.*\b(c[oó]digo|bug|erro|lod|build)\b/,
    peso: 0.85
  }),
  Object.freeze({
    id: "resolve_bugs",
    re: /\b(resolv[ae]|resolver|arranja(r)?)\b.*\b(bugs?|erros?|falhas?)\b/,
    peso: 0.9
  }),
  Object.freeze({
    id: "bugs_projeto",
    re: /\b(bugs?|erros?)\b.*\b(projeto|c[oó]digo|sistema)\b|\b(projeto|c[oó]digo)\b.*\b(bugs?|erros?)\b/,
    peso: 0.78
  }),
  Object.freeze({
    id: "faz_feature",
    re: /\b(faz|fa[cç]a|execute)\b.*\b(feature|outdoor|patch|pr)\b/,
    peso: 0.8
  }),
  Object.freeze({
    id: "verbo_execucao",
    re: /\b(implementa|despacha|publica\s+job|abre\s+(um\s+)?pr)\b/,
    peso: 0.75
  })
]);

/** C2 — conversa de projecto / frente activa. */
export const LEXICO_C2 = Object.freeze([
  Object.freeze({
    id: "onde_estamos",
    re: /\bonde\s+estamos\b|\bcomo\s+est[aá]\s+(o\s+)?(outdoor|pagamento|mg2|projeto)\b/,
    peso: 0.88
  }),
  Object.freeze({
    id: "o_que_sabes",
    re: /\bo\s+que\s+(sabes|sabe)\b.*\b(mg2|projeto|coa|outdoor)\b|\bo\s+que\s+sabes\s+do\b/,
    peso: 0.85
  }),
  Object.freeze({
    id: "projeto_refs",
    re: /\b(mg2|motoboy\s+game|outdoor|coa|frente\s+activa|worldlab)\b/,
    peso: 0.7
  }),
  Object.freeze({
    id: "deliberar",
    re: /\b(devemos|conv[eé]m|faz\s+sentido)\b.*\b(adiar|priorizar|focar)\b/,
    peso: 0.8
  }),
  Object.freeze({
    id: "situacao_projeto",
    re: /\b(situa[cç][aã]o|pr[oó]ximo\s+passo|prioridade)\b.*\b(projeto|mg2|jogo)?/,
    peso: 0.65
  })
]);

/** Mensagens vagas — empurram confiança para baixo. */
export const LEXICO_VAGO = Object.freeze([
  Object.freeze({
    id: "resolve_isso",
    re: /^(resolve|arranja|trata)\s+(isso|aquilo|isto)$/,
    peso: 0.4
  }),
  Object.freeze({
    id: "faz_ai",
    re: /^(faz|fa[cç]a)\s+(a[ií]|isso|l[aá])$/,
    peso: 0.35
  }),
  Object.freeze({
    id: "muito_curto",
    re: /^.{1,3}$/,
    peso: 0.2
  })
]);

/**
 * @param {string} textoNorm
 * @param {ReadonlyArray<PadraoLexico>} lexicon
 * @returns {{ score: number, hits: string[] }}
 */
export function pontuarLexico(textoNorm, lexicon) {
  let score = 0;
  const hits = [];
  for (const p of lexicon) {
    if (p.re.test(textoNorm)) {
      score = Math.max(score, p.peso);
      hits.push(p.id);
    }
  }
  // bónus leve por múltiplos hits
  if (hits.length > 1) {
    score = Math.min(0.98, score + 0.03 * (hits.length - 1));
  }
  return { score, hits };
}
