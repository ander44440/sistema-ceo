/**
 * C2 — Classificador NCS (IMP-020 B2 / REQ-052 R3).
 * Determinístico; usa apenas contratos B1 (montarPacoteNcs + validarPacoteNcs).
 * Não integra Núcleo, pipeline, Speaker nem flag.
 */

import { montarPacoteNcs } from "./pacote.js";
import { validarPacoteNcs } from "./validarPacoteNcs.js";

/**
 * @typedef {object} IntencaoLeitura
 * @property {string} [id]
 * @property {string} [capacidade]
 */

/**
 * @typedef {object} ResultadoClassificacaoNcs
 * @property {boolean} ok
 * @property {import('./pacote.js').PacoteNcs | null} pacote
 * @property {{ naturezaCognitiva: string, confiancaNatureza: number, fundamentoNatureza: string, regraDesempate: string }} classificacao
 * @property {import('./validarPacoteNcs.js').ResultadoValidacaoNcs | null} validacao
 * @property {string} [erro]
 */

/**
 * @param {string} texto
 * @returns {string}
 */
function normalizar(texto) {
  return String(texto || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/**
 * Sinais de escolha entre itens/alternativas concretas (R3.1).
 * @param {string} t
 * @returns {boolean}
 */
function sinalDecisaoOperacional(t) {
  if (
    /\bqual\s+d(as|estes|estas|esses)\b/.test(t) ||
    /\bquais\s+d(as|estes|estas|esses)\b/.test(t) ||
    /\bqual\s+das\s+\w+\b/.test(t)
  ) {
    return true;
  }
  if (/\bentre\s+.+\s+e\s+.+/.test(t) && /\b(o\s+que|qual|devo|fazer|primeiro|escolher|prioriz)\b/.test(t)) {
    return true;
  }
  if (/\b(a\s+ou\s+b|isto\s+ou\s+aquilo)\b/.test(t)) return true;
  // Itens enumerados + pedido de escolha
  if (
    (/\b(1[).:]|2[).:]|3[).:])/.test(t) || /\b(i+|ii+|iii+)\b/.test(t)) &&
    /\b(qual|quais|escolher|devo\s+fazer|fazer\s+primeiro)\b/.test(t)
  ) {
    return true;
  }
  // "o que faço primeiro" com duas opções nomeadas ligadas por "ou" / "vs"
  if (/\b(ou|vs\.?|versus)\b/.test(t) && /\b(primeiro|prioriz|escolher|devo)\b/.test(t)) {
    return true;
  }
  return false;
}

/**
 * @param {string} t
 * @returns {boolean}
 */
function sinalPlanejamento(t) {
  return (
    /\b(monte|montar|elabore|elaborar|crie|criar|faca|fazer)\s+(um\s+)?plano\b/.test(t) ||
    /\bplano\s+(para|de)\b/.test(t) ||
    /\b(estruturar|organize|organizar)\s+(a\s+)?(semana|sprint|execucao|passos)\b/.test(t) ||
    /\b(passos|roteiro|cronograma)\s+(para|de)\b/.test(t)
  );
}

/**
 * @param {string} t
 * @returns {boolean}
 */
function sinalMetodo(t) {
  return (
    /\bcomo\s+(voce|tu|eu|nos|se)\s+\w*(decid|prioriz|escolh)/.test(t) ||
    /\bcomo\s+(decid|prioriz|escolh)/.test(t) ||
    /\bcomo\s+voce\s+decidiria\b/.test(t) ||
    /\bquais\s+criterios?\b/.test(t) ||
    /\b(metodo|metodologia|quadro)\s+(de\s+)?(decid|prioriz)/.test(t) ||
    /\bcriterios?\s+(para|de)\s+(decid|prioriz|cortar|escolh)/.test(t) ||
    /\bcomo\s+prioriz/.test(t)
  );
}

/**
 * @param {string} t
 * @returns {boolean}
 */
function sinalExplicacao(t) {
  return (
    /\bexplique\b/.test(t) ||
    /\bexplicar\b/.test(t) ||
    /\bpor\s+que\b/.test(t) ||
    /\bporque\b/.test(t) ||
    /\bjustifique\b/.test(t) ||
    /\bqual\s+(foi|e)\s+(o\s+)?(motivo|fundamento|razao)\b/.test(t)
  );
}

/**
 * Aplica R3 — uma natureza primária.
 * @param {string} mensagem
 * @param {IntencaoLeitura | null | undefined} _intencao
 * @returns {{ naturezaCognitiva: string, confiancaNatureza: number, fundamentoNatureza: string, regraDesempate: string }}
 */
export function decidirNaturezaCognitiva(mensagem, _intencao) {
  const t = normalizar(mensagem);
  const op = sinalDecisaoOperacional(t);
  const pl = sinalPlanejamento(t);
  const me = sinalMetodo(t);
  const ex = sinalExplicacao(t);

  // R3.1
  if (op) {
    return {
      naturezaCognitiva: "decisao_operacional",
      confiancaNatureza: me || pl || ex ? 0.82 : 0.92,
      fundamentoNatureza:
        "R3.1: escolha explícita entre itens/alternativas concretas" +
        (me || pl || ex ? " (prevalece sobre sinais mistos)" : ""),
      regraDesempate: "R3.1"
    };
  }
  // R3.2
  if (pl) {
    return {
      naturezaCognitiva: "planejamento",
      confiancaNatureza: me || ex ? 0.8 : 0.9,
      fundamentoNatureza:
        "R3.2: pedido de plano/passos/estruturação" +
        (me || ex ? " (prevalece sobre método/explicação)" : ""),
      regraDesempate: "R3.2"
    };
  }
  // R3.3
  if (me) {
    return {
      naturezaCognitiva: "metodo_de_decisao",
      confiancaNatureza: ex ? 0.78 : 0.9,
      fundamentoNatureza:
        "R3.3: pedido de como/critérios/método de decidir" +
        (ex ? " (prevalece sobre explicação)" : ""),
      regraDesempate: "R3.3"
    };
  }
  // R3.4
  if (ex) {
    return {
      naturezaCognitiva: "explicacao",
      confiancaNatureza: 0.88,
      fundamentoNatureza: "R3.4: pedido de explicação/justificação",
      regraDesempate: "R3.4"
    };
  }

  // R3.5 — dúvida residual: não omitir; default metodológico com confiança baixa
  return {
    naturezaCognitiva: "metodo_de_decisao",
    confiancaNatureza: 0.45,
    fundamentoNatureza:
      "R3.5: dúvida residual — classificado como metodo_de_decisao com fundamentação explícita (proibido omitir)",
    regraDesempate: "R3.5"
  };
}

/**
 * Classifica a mensagem e devolve Pacote NCS validado (B1).
 * @param {object} entrada
 * @param {string} entrada.mensagem
 * @param {IntencaoLeitura | null} [entrada.intencao] — só leitura; não redefine natureza
 * @returns {ResultadoClassificacaoNcs}
 */
export function classificarNaturezaCognitiva(entrada) {
  const mensagem = entrada?.mensagem;
  if (typeof mensagem !== "string" || !mensagem.trim()) {
    const classificacao = {
      naturezaCognitiva: "metodo_de_decisao",
      confiancaNatureza: 0.4,
      fundamentoNatureza:
        "R3.5: mensagem vazia — metodo_de_decisao com fundamentação explícita (proibido omitir)",
      regraDesempate: "R3.5"
    };
    const pacote = montarPacoteNcs({
      naturezaCognitiva: classificacao.naturezaCognitiva,
      confiancaNatureza: classificacao.confiancaNatureza,
      fundamentoNatureza: classificacao.fundamentoNatureza
    });
    const validacao = validarPacoteNcs(pacote);
    return {
      ok: validacao.ok,
      pacote: validacao.ok ? pacote : null,
      classificacao,
      validacao,
      erro: validacao.ok ? undefined : "Pacote NCS inválido após classificação"
    };
  }

  const classificacao = decidirNaturezaCognitiva(mensagem, entrada.intencao);
  const pacote = montarPacoteNcs({
    naturezaCognitiva: classificacao.naturezaCognitiva,
    confiancaNatureza: classificacao.confiancaNatureza,
    fundamentoNatureza: classificacao.fundamentoNatureza
  });
  const validacao = validarPacoteNcs(pacote);

  return {
    ok: validacao.ok,
    pacote: validacao.ok ? pacote : null,
    classificacao,
    validacao,
    erro: validacao.ok ? undefined : "Pacote NCS inválido após classificação"
  };
}
