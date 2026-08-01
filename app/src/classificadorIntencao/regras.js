/**
 * Regras de classificação V1 — IMP-057 E2 / REQ-057 RF8–RF11.
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

/**
 * @typedef {object} ContextoClassificacao
 * @property {boolean} [frenteActiva] — COA/frente presente (RF9)
 */

/**
 * Detecta verbo / indício claro de execução (empate C2/C3 → C3 só com isto).
 * @param {string} t
 */
export function temVerboExecucao(t) {
  return (
    /\b(implementa(r)?|implemente|despacha(r)?|despache)\b/.test(t) ||
    /\b(cria(r)?|cria)\s+(um\s+)?jobs?\s+(para|de)\b/.test(t) ||
    /\b(publica(r)?|abre)\s+(um\s+)?(job|pr)\b/.test(t) ||
    /\b(corrige|fix)\b.*\b(c[oó]digo|bug)\b/.test(t) ||
    /\b(resolv[ae]|resolver|arranja(r)?)\b.*\b(bugs?|erros?|falhas?)\b/.test(t)
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
  if (/\b(cria(r)?|cria|despacha)\s+(um\s+)?jobs?\b/.test(t)) return "c3";
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
 * Resolve empates RF8–RF11.
 * @param {Record<string, number>} scores
 * @param {string} t
 * @param {ContextoClassificacao} ctx
 * @returns {{ classe: import("./dominio.js").ClasseIntencao, razao: string }}
 */
export function resolverEmpates(scores, t, ctx = {}) {
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

  // Frente activa sem sinais fortes: ligeiro boost C2 (não força C3)
  if (contexto.frenteActiva === true && s2.score < 0.5 && s3.score < 0.5 && s4.score < 0.5) {
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

  // RF11: abaixo do limiar → clarificação (montarSaida trata); nunca C3+Job
  const saida = montarSaida(resolvido.classe, confianca, razaoCurta);

  if (abaixoDoLimiar(saida.confianca) || saida.precisaClarificacao) {
    // reforço: permiteJob já false no domínio
    return saida;
  }

  return saida;
}

export { LIMIAR_CONFIANCA, normalizarTexto };
