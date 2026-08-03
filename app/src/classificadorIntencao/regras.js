/**
 * Regras de classificação V1 — IMP-057 E2 / Emendas E2.1–E2.2 / REQ-057 RF8–RF11.
 * Função pura `classificar` → SaidaClassificador (domínio E1).
 * Sem Núcleo, Motor, UI, Dispatcher ou I/O.
 */

import { montarSaida, LIMIAR_CONFIANCA, abaixoDoLimiar } from "./dominio.js";
import {
  normalizarTexto,
  LEXICO_C1,
  LEXICO_C2,
  LEXICO_C3,
  LEXICO_C4,
  LEXICO_VAGO,
  pontuarLexico
} from "./lexicon.js";
import {
  historicoTemReferenciaProjeto,
  mensagemEhDeixisOuFollowUp
} from "./historicoRecente.js";

/**
 * @typedef {object} ContextoClassificacao
 * @property {boolean} [frenteActiva] — COA/frente presente (RF9)
 * @property {ReadonlyArray<{ papel: "usuario"|"ceo", texto: string }>} [historicoRecente] — IMP-061 / REQ-061 (opcional)
 * @property {object} [objetivoConversacional] — IMP-064 (contexto; não decide classe / não influencia C3)
 */

/**
 * Pedido interrogativo / deliberativo — permanece fora de E2.1 C3.
 * @param {string} t
 */
export function ehPerguntaDeliberativa(t) {
  return (
    /^(como|o que|qual|quando|onde|por que|porque|quem)\b/.test(t) ||
    /\b(o que (voc[eê]|tu) acha|qual seria|como devemos|devemos priorizar)\b/.test(
      t
    ) ||
    /\b(voc[eê]\s+concorda|quais\s+capacidades|qual\s+prioridade|como\s+organizar|o\s+que\s+falta)\b/.test(
      t
    ) ||
    /\b(explique|explica|descreva|descreve)\b/.test(t)
  );
}

/**
 * Contexto de projecto para Emenda E2.2 (frente activa ou refs no texto).
 * @param {string} t
 * @param {ContextoClassificacao} [ctx]
 */
export function temContextoProjetoE22(t, ctx = {}) {
  if (ctx.frenteActiva === true) return true;
  return /\b(mg2|motoboy|projeto|coa|outdoor|worldlab|motor|ceo|mvp|sprint|frente|arquitectura|arquitetura|capacidades|m[oó]dulo)\b/.test(
    t
  );
}

/**
 * Emenda E2.3 — autoexplicação institucional do CEO → C2 (nunca C3/Clarificação).
 * Perguntas sobre papel, decisões, capacidades, limitações, agentes, Jobs (meta).
 * @param {string} t
 */
export function ehAutoexplicacaoInstitucionalE23(t) {
  if (!t) return false;
  // Pedido imperativo de execução continua E2.1 — não capturar
  if (ehIntencaoExecutivaE21(t)) return false;

  // Meta-política de Job / resposta (não «cria um job agora»)
  if (
    /\bquando\s+(voc[eê]|tu)\s+(decide|prefere)\b/.test(t) &&
    /\b(jobs?|responder|resposta)\b/.test(t)
  ) {
    return true;
  }
  if (
    /\b(decide|decides)\s+criar\s+(um\s+)?jobs?\b/.test(t) &&
    /\b(quando|como|porque|por\s+que|crit[eé]rio)\b/.test(t)
  ) {
    return true;
  }

  // Papel / responsabilidades
  if (/\b(seu|sua|teu|tua)\s+papel\b/.test(t)) return true;
  if (
    /\b(papel|responsabilidades?)\b/.test(t) &&
    /\b(voc[eê]|tu|ceo|empresa|institui)\b/.test(t)
  ) {
    return true;
  }

  // Critérios / modo de decisão
  if (/\bcomo\s+(voc[eê]|tu)\s+toma\s+decis/.test(t)) return true;
  if (
    /\bcrit[eé]rios?\s+de\s+decis/.test(t) &&
    /\b(voc[eê]|tu|ceo|seu|sua)\b/.test(t)
  ) {
    return true;
  }

  // Diferença entre agentes
  if (/\bdiferen[cç]a\s+entre\s+(voc[eê]|tu)\b/.test(t)) return true;
  if (
    /\bdiferen[cç]a\s+entre\b/.test(t) &&
    /\b(ceo|cto|engenheiro|cursor|agente)\b/.test(t)
  ) {
    return true;
  }

  // Capacidades / limitações / fraquezas do CEO
  if (
    /\bqual\s+capacidade\b/.test(t) &&
    /\b(voc[eê]|tu|desenvolver|importante)\b/.test(t)
  ) {
    return true;
  }
  if (/\b(fraqueza|limita[cç][aã]o|limita[cç][oõ]es)\b.*\bceo\b/.test(t)) {
    return true;
  }
  if (/\bceo\b.*\b(fraqueza|limita[cç][aã]o|limita[cç][oõ]es)\b/.test(t)) {
    return true;
  }

  // Meta sobre a qualidade / papel executivo da resposta do CEO
  if (
    /\b(respondendo|responde|resposta)\b/.test(t) &&
    /\b(executivo|ceo|verdadeiro|como\s+(um|uma)\s+ceo)\b/.test(t)
  ) {
    return true;
  }
  if (
    /\bacha\s+que\s+(est[aá]|voc[eê]|tu)\b/.test(t) &&
    /\b(executivo|ceo|papel)\b/.test(t)
  ) {
    return true;
  }
  // Meta sobre a própria conversa (produtividade / utilidade)
  if (
    /\besta\s+conversa\b/.test(t) &&
    /\b(produtiva|útil|util|adianta|faz\s+sentido|vale\s+a\s+pena)\b/.test(t)
  ) {
    return true;
  }
  if (
    /\bacha\s+que\b/.test(t) &&
    /\bconversa\b/.test(t) &&
    /\b(produtiva|útil|util|adianta)\b/.test(t)
  ) {
    return true;
  }

  // Funcionamento / arquitectura do próprio sistema CEO
  if (
    /\b(funcionamento|como\s+(voc[eê]|tu)\s+funciona|arquitectura|arquitetura)\b/.test(
      t
    ) &&
    /\b(voc[eê]|tu|ceo|pr[oó]prio\s+sistema|sistema\s+ceo)\b/.test(t) &&
    !/\b(mg2|motoboy|outdoor|worldlab)\b/.test(t)
  ) {
    return true;
  }

  return false;
}

/**
 * Emenda E2.2 — padrões deliberativos → C2 quando há contexto de projecto.
 * @param {string} t
 * @param {ContextoClassificacao} [ctx]
 */
export function ehDeliberacaoProjetoE22(t, ctx = {}) {
  if (!t || !temContextoProjetoE22(t, ctx)) return false;
  if (ehIntencaoExecutivaE21(t)) return false;
  return (
    /\bcomo\s+devemos\b/.test(t) ||
    /\bvoc[eê]\s+concorda\b/.test(t) ||
    /\bo\s+que\s+(voc[eê]|tu)\s+acha\b/.test(t) ||
    /\bquais\s+capacidades\b/.test(t) ||
    /\bqual\s+prioridade\b/.test(t) ||
    /\bcomo\s+organizar\b/.test(t) ||
    /\bo\s+que\s+falta\b/.test(t) ||
    /\bse\s+(voc[eê]|tu)\s+fosse\s+o\s+ceo\b/.test(t) ||
    /\bpr[oó]xima\s+decis[aã]o\b/.test(t) ||
    /\bprincipal\s+pend[eê]ncia\b/.test(t) ||
    /\bqual\s+seria\s+a\s+pr[oó]xima\b/.test(t)
  );
}

/**
 * Emenda E2.2 — conhecimento geral seguro → C1 (nunca Clarificação).
 * Não captura explicações com dêixis de projecto («explique esse módulo»).
 * @param {string} t
 */
export function ehConhecimentoGeralE22(t) {
  if (!t) return false;
  if (ehIntencaoExecutivaE21(t)) return false;

  // Novo fio explícito para tema geral (ex.: IA) — não herdar «projetos» do «esqueça os projetos»
  if (
    /\besque[cç]a\b/.test(t) &&
    /\bprojetos?\b/.test(t) &&
    /\bquero\s+conversar\s+sobre\b/.test(t)
  ) {
    return true;
  }
  if (
    /\bquero\s+conversar\s+sobre\b/.test(t) &&
    /\b(intelig[eê]ncia\s+artificial|\bia\b|ci[eê]ncia|hist[oó]ria|filosofia)\b/.test(
      t
    ) &&
    !/\b(mg2|motoboy|outdoor|worldlab)\b/.test(t)
  ) {
    return true;
  }

  // Explicação / definição com âncora de projecto → não é C1 E2.2
  if (
    /\b(explique|explica|descreva|descreve)\b/.test(t) &&
    /\b(esse|este|esta|isso|nosso|projeto|m[oó]dulo|sistema|mg2|motor|ceo|arquitectura|arquitetura)\b/.test(
      t
    )
  ) {
    return false;
  }

  if (/\b(receita|bolo|culin[aá]ria|cozinhar|ingredientes?)\b/.test(t)) {
    return true;
  }
  // Pessoas / factos históricos — «quem foi/inventou/descobriu…»
  if (
    /\bquem\s+(foi|inventou|descobriu|criou|escreveu|fundou|pintou|comp[oô]s)\b/.test(
      t
    ) &&
    !temContextoProjetoE22(t, {})
  ) {
    return true;
  }
  if (
    /^quem\s+[eé]\s+(?!voc[eê]\b)(?!tu\b)(?!o\s+ceo\b)/.test(t) &&
    !temContextoProjetoE22(t, {})
  ) {
    return true;
  }
  // Evitar `\b` após `é` (JS sem flag u: acento não é \w)
  if (/^o que [eé]\s+(?!voc[eê]\b)(?!tu\b)/.test(t)) return true;
  if (
    /\b(explique|explica|defina|definir)\b/.test(t) &&
    !/\b(esse|este|esta|isso|nosso)\b/.test(t)
  ) {
    return true;
  }
  // «Como funciona…» (conhecimento) — não «Como devemos…» (C2)
  if (
    /^como\s+funciona\b/.test(t) &&
    !temContextoProjetoE22(t, {}) &&
    !/\bcomo\s+devemos\b/.test(t)
  ) {
    return true;
  }
  if (
    /\b(ci[eê]ncia|f[ií]sica|qu[ií]mica|biologia|matem[aá]tica|equa[cç][aã]o|teorema|hist[oó]ria|programa[cç][aã]o|algoritmo|docker|kubernetes|rest|graphql|internet|http|https)\b/.test(
      t
    ) &&
    !temContextoProjetoE22(t, {}) &&
    !/\bcomo\s+devemos\b/.test(t)
  ) {
    return true;
  }
  if (
    /\b(onde fica|capital d[aeo]|localiza[cç][aã]o d[aeo])\b/.test(t)
  ) {
    return true;
  }
  // Aritmética / cálculo numérico simples (não projecto)
  if (
    /\bquanto\s+[eé]\s+\d/.test(t) &&
    (/[×x*]/.test(t) || /[+\-/÷]/.test(t))
  ) {
    return true;
  }
  if (/^\d+\s*[×x*+\-/÷]\s*\d+\s*\??$/.test(t)) return true;

  return false;
}

/**
 * Emenda E2.1 — verbo imperativo dirigido ao CEO + acção potencialmente executável.
 * Independente da frente activa.
 * @param {string} t
 */
export function ehIntencaoExecutivaE21(t) {
  if (!t || ehPerguntaDeliberativa(t)) return false;

  const padroes = [
    /\b(resolv[ae]|resolver)\b.*\b(bugs?|erros?|falhas?|problemas?)\b/,
    /\b(corrija|corrige|corrigir|fix)\b.*\b(problema|c[oó]digo|bug|erro)\b/,
    /\b(fa[cç]a|faz|fazer)\b.*\b(diagn[oó]stico|an[aá]lise|relat[oó]rio|feature|funcionalidade)\b/,
    /\b(analis[ae]|analisar)\b.*\b(projeto|sistema|c[oó]digo|erro|situa[cç][aã]o|isto|isso|este|esta)\b/,
    /\b(implement[ae]|implementar)\b/,
    /\b(acion[ae]|acionar)\b.*\b(cto|engenheiro|cursor)\b/,
    /\b(delegue|delegar)\b.*\b(tarefa|trabalho|isto|isso|esta|este)\b/,
    /\b(execut[ae]|executar)\b.*\b(an[aá]lise|tarefa|trabalho|isto|isso|diagn[oó]stico)\b/,
    /\b(ger[ae]|gerar)\b.*\b(relat[oó]rio|parecer|diagn[oó]stico)\b/,
    /\b(cria(r)?|crie|cria)\s+(um\s+)?jobs?\b/,
    /\b(investigue|investigar)\b.*\b(erro|bug|falha|problema|isto|isso|este|esta)\b/,
    /\b(despacha(r)?|despache)\b/
  ];

  return padroes.some((re) => re.test(t));
}

/**
 * Detecta verbo / indício claro de execução (empate C2/C3 → C3; inclui E2.1).
 * @param {string} t
 */
export function temVerboExecucao(t) {
  if (ehIntencaoExecutivaE21(t)) return true;
  return (
    /\b(implementa(r)?|implemente|despacha(r)?|despache)\b/.test(t) ||
    /\b(cria(r)?|cria|crie)\s+(um\s+)?jobs?\b/.test(t) ||
    /\b(publica(r)?|abre)\s+(um\s+)?(job|pr)\b/.test(t) ||
    /\b(corrija|corrige|fix)\b.*\b(c[oó]digo|bug|problema)\b/.test(t) ||
    /\b(resolv[ae]|resolver|arranja(r)?)\b.*\b(bugs?|erros?|falhas?|problemas?)\b/.test(t) ||
    /\b(acion[ae]|delegue|investigue|analis[ae]|execut[ae]|ger[ae])\b/.test(
      t
    )
  );
}

/**
 * “jobs” no sentido listar/consultar (C4) vs criar trabalho (C3).
 * @param {string} t
 * @returns {"c4"|"c3"|null}
 */
export function desambiguarJobs(t) {
  if (/\b(lista(r)?|mostra(r)?|ver|consultar)\s+(os\s+)?jobs?\b/.test(t)) {
    return "c4";
  }
  if (/\bjobs?\s+pendentes?\b/.test(t)) return "c4";
  if (/\b(cria(r)?|cria|crie|despacha)\s+(um\s+)?jobs?\b/.test(t)) return "c3";
  if (/\bjobs?\s+(para|de)\s+\w+/.test(t) && temVerboExecucao(t)) return "c3";
  return null;
}

/**
 * Calcula confiança a partir do score vencedor e da margem.
 * @param {number} scoreVencedor
 * @param {number} scoreSegundo
 * @param {boolean} vago
 */
export function calcularConfianca(scoreVencedor, scoreSegundo, vago) {
  if (vago && scoreVencedor < 0.6) {
    return Math.min(0.45, Math.max(0.2, scoreVencedor * 0.5));
  }
  let c = scoreVencedor;
  const margem = scoreVencedor - scoreSegundo;
  if (margem < 0.08 && scoreSegundo > 0.4) {
    c = Math.max(0.35, c - 0.25);
  } else if (margem < 0.15 && scoreSegundo > 0.5) {
    c = Math.max(0.4, c - 0.12);
  }
  return Math.min(0.98, Math.max(0, Number(c.toFixed(4))));
}

/**
 * Resolve empates RF8–RF11 (+ Emendas E2.1 / E2.2).
 * @param {Record<string, number>} scores
 * @param {string} t
 * @param {ContextoClassificacao} ctx
 * @returns {{ classe: import("./dominio.js").ClasseIntencao, razao: string }}
 */
export function resolverEmpates(scores, t, ctx = {}) {
  // Emenda E2.1 — prioridade máxima sobre RF8/RF9 e frente activa
  if (ehIntencaoExecutivaE21(t)) {
    return {
      classe: "trabalho_executivo",
      razao: "E2.1: imperativo + acção executável → C3 (frente activa irrelevante)"
    };
  }

  // Emenda E2.3 — autoexplicação institucional (antes de RF10/jobs e C1)
  if (ehAutoexplicacaoInstitucionalE23(t)) {
    return {
      classe: "conversa_projeto",
      razao: "E2.3: autoexplicação institucional do CEO → C2"
    };
  }

  // Emenda E2.2 — deliberação de projecto (antes de C1 genérico)
  if (ehDeliberacaoProjetoE22(t, ctx)) {
    return {
      classe: "conversa_projeto",
      razao: "E2.2: padrão deliberativo + contexto de projecto → C2"
    };
  }

  // Emenda E2.2 — conhecimento geral seguro
  if (ehConhecimentoGeralE22(t)) {
    return {
      classe: "conhecimento_geral",
      razao: "E2.2: conhecimento/definição/explicação → C1"
    };
  }

  const jobs = desambiguarJobs(t);
  if (jobs === "c4") {
    return {
      classe: "comando_operacional",
      razao: "RF10: jobs no sentido listar/consultar → C4"
    };
  }
  if (jobs === "c3") {
    return {
      classe: "trabalho_executivo",
      razao: "RF10: criar/despachar job de trabalho → C3"
    };
  }

  const ordenado = Object.entries(scores)
    .filter(([, s]) => s > 0)
    .sort((a, b) => b[1] - a[1]);

  if (!ordenado.length) {
    if (ctx.frenteActiva) {
      return {
        classe: "conversa_projeto",
        razao: "Sem lexicon; frente activa → C2 restritivo"
      };
    }
    return {
      classe: "conhecimento_geral",
      razao: "Sem lexicon; default restritivo C1"
    };
  }

  let [topClasse, topScore] = ordenado[0];
  const segundo = ordenado[1];
  const segundoScore = segundo ? segundo[1] : 0;
  const segundoClasse = segundo ? segundo[0] : null;

  // RF8: empate C2/C3 sem verbo de execução → C2
  const c2 = scores.conversa_projeto || 0;
  const c3 = scores.trabalho_executivo || 0;
  if (c2 > 0 && c3 > 0 && Math.abs(c2 - c3) < 0.2) {
    if (!temVerboExecucao(t)) {
      return {
        classe: "conversa_projeto",
        razao: "RF8: empate C2/C3 sem verbo de execução → C2"
      };
    }
    return {
      classe: "trabalho_executivo",
      razao: "RF8: C2/C3 com verbo de execução → C3"
    };
  }

  // RF9: empate C1/C2 + frente activa + refs de projecto → C2
  const c1 = scores.conhecimento_geral || 0;
  if (
    ctx.frenteActiva &&
    c1 > 0 &&
    c2 > 0 &&
    Math.abs(c1 - c2) < 0.25 &&
    /\b(mg2|projeto|outdoor|coa|jogo|frente)\b/.test(t)
  ) {
    return {
      classe: "conversa_projeto",
      razao: "RF9: empate C1/C2 com frente activa e ref. projecto → C2"
    };
  }

  // Se top é C3 mas sem verbo e C2 compete → C2 (reforço RF8)
  if (
    topClasse === "trabalho_executivo" &&
    !temVerboExecucao(t) &&
    c2 >= 0.5
  ) {
    return {
      classe: "conversa_projeto",
      razao: "RF8: C3 sem verbo claro; C2 compete → C2"
    };
  }

  void topScore;
  void segundoScore;
  void segundoClasse;

  const mapaRazao = {
    conhecimento_geral: "Lexicon C1",
    conversa_projeto: "Lexicon C2",
    trabalho_executivo: "Lexicon C3",
    comando_operacional: "Lexicon C4"
  };

  return {
    classe: /** @type {import("./dominio.js").ClasseIntencao} */ (topClasse),
    razao: mapaRazao[topClasse] || "Score máximo"
  };
}

/**
 * S3 — desambiguação C1↔C2 via histórico recente (IMP-061 / ARQ-022).
 * Nunca promove a C3; nunca altera C4 sólido; ausência de histórico = no-op.
 *
 * @param {import("./dominio.js").SaidaClassificador} saida
 * @param {string} t — texto normalizado
 * @param {ContextoClassificacao} ctx
 * @returns {import("./dominio.js").SaidaClassificador}
 */
export function aplicarDesambiguacaoHistorico(saida, t, ctx = {}) {
  const hist = ctx.historicoRecente;
  if (!Array.isArray(hist) || hist.length === 0) return saida;

  // C3 da mensagem actual — intocável (I-C3 / RF7 / RF9)
  if (
    saida.classe === "trabalho_executivo" &&
    saida.precisaClarificacao !== true
  ) {
    return saida;
  }

  // C4 sólido da mensagem actual — histórico não pontua C4 (RF13)
  if (
    saida.classe === "comando_operacional" &&
    saida.precisaClarificacao !== true &&
    !abaixoDoLimiar(saida.confianca)
  ) {
    return saida;
  }

  // C2 já acima do limiar — nada a desambiguar
  if (
    saida.classe === "conversa_projeto" &&
    saida.precisaClarificacao !== true &&
    !abaixoDoLimiar(saida.confianca)
  ) {
    return saida;
  }

  const temProjHist = historicoTemReferenciaProjeto(hist);
  const temLastro = temProjHist || ctx.frenteActiva === true;
  if (!temLastro) return saida;

  const deixis = mensagemEhDeixisOuFollowUp(t);
  const precisaAjuda =
    saida.precisaClarificacao === true ||
    abaixoDoLimiar(saida.confianca) ||
    (saida.classe === "conhecimento_geral" && deixis);

  if (!precisaAjuda) return saida;

  // Só C1↔C2: promover / reforçar C2 (nunca C3)
  const conf = Math.max(0.62, Number(saida.confianca) || 0);
  const razao = [
    "Histórico recente: desambiguação C1↔C2 → C2",
    saida.razaoCurta
  ]
    .filter(Boolean)
    .join(" — ")
    .slice(0, 200);

  return montarSaida("conversa_projeto", Math.min(0.93, conf), razao);
}

/**
 * Classifica intenção (puro) — integra domínio E1 via montarSaida.
 * @param {string} texto
 * @param {ContextoClassificacao} [contexto]
 * @returns {import("./dominio.js").SaidaClassificador}
 */
export function classificar(texto, contexto = {}) {
  const t = normalizarTexto(texto);

  if (!t) {
    return montarSaida("conhecimento_geral", 0.3, "Mensagem vazia — clarificação", {
      precisaClarificacao: true
    });
  }

  // Emenda E2.1 — atalho obrigatório (antes de boost de frente activa)
  // Histórico NÃO entra aqui (ARQ-022 S1)
  if (ehIntencaoExecutivaE21(t)) {
    return montarSaida(
      "trabalho_executivo",
      0.94,
      "E2.1: imperativo + acção executável → C3"
    );
  }

  // Emenda E2.3 — autoexplicação institucional → C2 (nunca Clarificação / C3 Job)
  if (ehAutoexplicacaoInstitucionalE23(t)) {
    return montarSaida(
      "conversa_projeto",
      0.93,
      "E2.3: autoexplicação institucional do CEO → C2"
    );
  }

  // Emenda E2.2 — C2 deliberativo com contexto de projecto (nunca Clarificação)
  if (ehDeliberacaoProjetoE22(t, contexto)) {
    return montarSaida(
      "conversa_projeto",
      0.93,
      "E2.2: deliberação de projecto → C2"
    );
  }

  // Emenda E2.2 — C1 conhecimento seguro (nunca Clarificação)
  // Histórico NÃO anula C1 seguro (ex.: «O que é um ADR?»)
  if (ehConhecimentoGeralE22(t)) {
    return montarSaida(
      "conhecimento_geral",
      0.93,
      "E2.2: conhecimento geral → C1"
    );
  }

  const s1 = pontuarLexico(t, LEXICO_C1);
  const s2 = pontuarLexico(t, LEXICO_C2);
  const s3 = pontuarLexico(t, LEXICO_C3);
  const s4 = pontuarLexico(t, LEXICO_C4);
  const sv = pontuarLexico(t, LEXICO_VAGO);

  const scores = {
    conhecimento_geral: s1.score,
    conversa_projeto: s2.score,
    trabalho_executivo: s3.score,
    comando_operacional: s4.score
  };

  // Frente activa sem sinais fortes: ligeiro boost C2 (nunca se E2.1 — já retornou)
  if (
    contexto.frenteActiva === true &&
    s2.score < 0.5 &&
    s3.score < 0.5 &&
    s4.score < 0.5
  ) {
    if (s2.hits.length === 0 && /\b(isto|isso|agora|hoje)\b/.test(t) === false) {
      /* no boost for pure C1 */
    }
    if (s2.score > 0 || /\b(mg2|outdoor|projeto|coa)\b/.test(t)) {
      scores.conversa_projeto = Math.max(scores.conversa_projeto, 0.72);
    }
  }

  const resolvido = resolverEmpates(scores, t, contexto);
  const ordenado = Object.values(scores).sort((a, b) => b - a);
  const confianca = calcularConfianca(
    scores[resolvido.classe] || ordenado[0] || 0.4,
    ordenado[1] || 0,
    sv.score > 0 || t.split(/\s+/).length <= 2
  );

  const hits = [
    ...s1.hits.map((h) => `C1:${h}`),
    ...s2.hits.map((h) => `C2:${h}`),
    ...s3.hits.map((h) => `C3:${h}`),
    ...s4.hits.map((h) => `C4:${h}`)
  ].slice(0, 4);

  const razaoCurta = [resolvido.razao, hits.length ? hits.join(",") : null]
    .filter(Boolean)
    .join(" — ")
    .slice(0, 200);

  const saida = montarSaida(resolvido.classe, confianca, razaoCurta);

  // S3 — histórico opcional (só C1↔C2)
  return aplicarDesambiguacaoHistorico(saida, t, contexto);
}

export { LIMIAR_CONFIANCA, normalizarTexto };
