/**
 * E4 — Recomendação operacional ≠ deliberação de proposta.
 * Regra semântica reutilizável (sem atalhos a Sprint concreta).
 * Fatia 1: o objecto do turno (A|B|misto|indefinido) governa E4 vs C2.
 */

import { normalizarTexto } from "./lexicon.js";
import { detectarPedidoDecisaoExplicita } from "./pedidoDecisaoExplicita.js";
import { ehDeixisContinuidadeNegocio } from "./fioConversacional.js";

/** Mundo A = artefacto/operação do CEO; B = mundo do utilizador. */
export const OBJECTO_TURNO = Object.freeze({
  A: "A",
  B: "B",
  MISTO: "misto",
  INDEFINIDO: "indefinido"
});

const PEDIDO_PRIORIDADE_NU =
  /^\s*qual\s+(?:[eé]\s+(?:a\s+)?|a\s+)?prioridade\s*\??\s*$/;

/**
 * Marcador lexical de pedido de recomendação / juízo / sequenciamento operacional.
 * @param {string} t — texto já normalizado
 */
export function temMarcadorRecomendacao(t) {
  if (!t) return false;
  return (
    /\b(recomenda|recomendaria|recomendacao|recomende|voce\s+recomenda)\b/.test(
      t
    ) ||
    /\bqual\s+[eé]\s+a\s+pr[oó]xima\s+decis[aã]o\b/.test(t) ||
    /\bqual\s+prioridade\b/.test(t) ||
    // «qual deve ser (a|nossa) prioridade» / «qual seria a próxima prioridade»
    /\bqual\s+(deve|seria|seria\s+a|deveria)\s+(ser\s+)?(a\s+|nossa\s+|o\s+)?(pr[oó]xima\s+)?prioridade\b/.test(
      t
    ) ||
    /\bqual\s+[eé]\s+a\s+(pr[oó]xima\s+)?prioridade\b/.test(t) ||
    /\bqual\s+(deve|seria)\s+(ser\s+)?(o\s+)?pr[oó]ximo\s+passo\b/.test(t) ||
    /\bo\s+que\s+vem\s+depois\b/.test(t) ||
    /\b(depois|ap[oó]s)\s+(d[aeo]\s+)?(a\s+)?(valida[cç][aã]o|sprint|gate|jobs?)\b/.test(
      t
    ) ||
    /\bprioridade\s+(depois|ap[oó]s)\b/.test(t) ||
    /\bpr[oó]ximo\s+passo\s+(ap[oó]s|depois)\b/.test(t) ||
    /\bqual\s+sequ[eê]ncia\b/.test(t) ||
    /\b(devemos|devo)\s+(manter|priorizar|seguir|avan[cç]ar)\b/.test(t)
  );
}

/**
 * Objeto operacional explícito (prioridade, sprint, job, manter X, sequência, etc.).
 * @param {string} t
 */
export function temObjetoOperacional(t) {
  if (!t) return false;
  return (
    /\bprioridade(s)?\b/.test(t) ||
    /\bpr[oó]xima\s+decis[aã]o\b/.test(t) ||
    /\bpr[oó]xim[oa]\s+(passo|ac[aã]o|acao)\b/.test(t) ||
    /\bsprint\b/.test(t) ||
    /\bvalida[cç][aã]o\b/.test(t) ||
    /\btarefa\b/.test(t) ||
    /\bsequ[eê]ncia\b/.test(t) ||
    /\bmant(er|ém|em)\b/.test(t) ||
    /\bavan[cç]ar\s+(para|com|na|no)\b/.test(t) ||
    /\b(depois|ap[oó]s)\b/.test(t) ||
    /\bo\s+que\s+vem\s+depois\b/.test(t) ||
    /\bjobs?-\d+\b/.test(t) ||
    /\bgates?\b/.test(t) ||
    /\bfila\b/.test(t) ||
    /\bestado\s+atual\b/.test(t) ||
    /\bestado\s+(do|da)\s+jobs?\b/.test(t) ||
    /\bonde\s+estamos\b/.test(t) ||
    /\bo\s+que\s+fazer\b/.test(t)
  );
}

/**
 * Âncora de proposta / produto a deliberar (não prioridade operacional).
 * @param {string} t
 */
export function temObjetoPropostaDeliberativa(t) {
  if (!t) return false;
  if (/\bproposta\b/.test(t)) return true;
  if (/\bmanifesto\b/.test(t)) return true;
  if (/\bpros?\s+e\s+contras?\b/.test(t)) return true;
  if (/\bpontos?\s+(positivos?|negativos?)\b/.test(t)) return true;
  // Produto/feature/expansão como alvo de juízo — sem confundir com sprint/job
  if (/\bsprint\b/.test(t) || /\bjobs?-\d+\b/.test(t)) return false;
  return /\b(feature|funcionalidade|expans[aã]o|bairro)\b/.test(t);
}

/**
 * Deliberação de proposta (C2 / MRE / Manifesto quando pertinente).
 * @param {string} [texto]
 */
export function ehDeliberacaoDeProposta(texto) {
  const n = normalizarTexto(texto);
  if (!n) return false;

  if (
    /\bsegundo\s+o\s+manifesto\b/.test(n) ||
    (/\bmanifesto\b/.test(n) &&
      /\b(avali|analis|alinhad|principios?|visao)\b/.test(n))
  ) {
    return true;
  }
  if (/\bpros?\s+e\s+contras?\b/.test(n)) return true;
  if (/\bpontos?\s+(positivos?|negativos?)\b/.test(n)) return true;

  if (!temObjetoPropostaDeliberativa(n)) return false;

  return (
    /\b(analisa|analise|analisar|avalia|avalie|avaliar|compara|compare|comparar)\b/.test(
      n
    ) ||
    /\b(recomenda|recomendaria|recomendacao|voce\s+recomenda)\b/.test(n) ||
    /\b(aprovar|aprovaria|modificar|modificaria|priorizar|priorizaria|nao\s+priorizaria)\b/.test(
      n
    )
  );
}

/**
 * Análise/deliberação sobre contexto ou negócio (não juízo de fila/sprint).
 * Texto já normalizado.
 * @param {string} t
 */
function temMarcadorAnaliseContextual(t) {
  if (!t) return false;
  return (
    /\b(analisa|analise|analisar)\b/.test(t) ||
    /\b(avalia|avalie|avaliar)\b/.test(t) ||
    /\b(deliberar|delibere|delibera|deliberacao)\b/.test(t) ||
    /\bproblema\s+central\b/.test(t) ||
    /\balternativas\b/.test(t)
  );
}

/**
 * Âncora forte de lastro operacional (fila/jobs/sprint/gates).
 * Texto já normalizado.
 * @param {string} t
 */
function temAncoraOperacionalForte(t) {
  if (!t) return false;
  if (/\bsprint\b/.test(t)) return true;
  if (/\bjobs?-\d+\b/.test(t)) return true;
  if (/\bgates?\b/.test(t)) return true;
  if (/\bfila\b/.test(t)) return true;
  if (/\bvalidacao\b/.test(t)) return true;
  // Sequenciamento associado a sprint/gate/validação/job
  return (
    /\b(depois|apos)\s+(d[aeo]\s+)?(a\s+)?(validacao|sprint|gate|jobs?)\b/.test(
      t
    ) ||
    (/\b(depois|apos)\b/.test(t) &&
      /\b(validacao|sprint|gates?|jobs?-\d+|jobs?\b)/.test(t))
  );
}

/**
 * Factos / alternativas de negócio no próprio turno (≠ lastro de fila/sprint).
 * @param {string} [texto]
 */
export function temLastroNegocio(texto) {
  const t = normalizarTexto(texto);
  if (!t) return false;
  if (/\bfornecedor(es)?\b/.test(t)) return true;
  if (/\b(preco|precos|reajuste|reajustes)\b/.test(t)) return true;
  if (/\bmais\s+barato\b/.test(t)) return true;
  if (/\bvolume\b/.test(t)) return true;
  if (/\b(fornecer|fornecimento)\b/.test(t)) return true;
  if (/\bmargem\b/.test(t)) return true;
  if (/\bcliente(s)?\b/.test(t)) return true;
  if (/\b(faturamento|facturacao)\b/.test(t)) return true;
  if (/\bmateria-?primas?\b/.test(t)) return true;
  if (/\b(dilema|trade-?off)\b/.test(t)) return true;
  if (
    /\b(dois|duas)\b/.test(t) &&
    (/\bo\s+outro\b/.test(t) ||
      /\bo\s+segundo\b/.test(t) ||
      /\bum\s+[eé]\s+o\s+atual\b/.test(t))
  ) {
    return true;
  }
  return false;
}

/**
 * Pedido de juízo executivo (não fecho PD, não verbo de análise obrigatório).
 * Texto já normalizado ou bruto.
 * @param {string} [texto]
 */
export function temPedidoJuizoExecutivoNegocio(texto) {
  const t = normalizarTexto(texto);
  if (!t) return false;
  return (
    /\bqual\s+[eé]\s+a\s+melhor\s+decis/.test(t) ||
    /\bmelhor\s+decis/.test(t) ||
    /\bqual\s+(deve|seria|deveria)\s+(ser\s+)?(a\s+|nossa\s+)?(pr[oó]xima\s+)?prioridade\b/.test(
      t
    ) ||
    /\bqual\s+prioridade\b/.test(t) ||
    /\bqual\s+[eé]\s+a\s+(pr[oó]xima\s+)?prioridade\b/.test(t) ||
    /\bo\s+que\s+(voce|tu)\s+acha\b/.test(t) ||
    /\bdevemos\s+fazer\s+(primeiro|agora)\b/.test(t) ||
    /\bo\s+que\s+(devemos|voce\s+acha\s+que\s+devemos)\s+fazer\b/.test(t)
  );
}

/**
 * Estrutura de alternativa / dilema no mundo do utilizador (≠ lista de substantivos).
 * @param {string} t — texto já normalizado
 */
function temEstruturaAlternativaOuDilema(t) {
  if (!t) return false;
  if (/\b(dilema|trade-?off)\b/.test(t)) return true;
  if (/\balternativas?\b/.test(t)) return true;
  if (/\bqual\s+caminho\b/.test(t) && /\bou\b/.test(t)) return true;
  if (/\brenovar\b/.test(t) && /\b(trocar|substituir)\b/.test(t)) return true;
  if (/\b(vs\.?|versus)\b/.test(t)) return true;
  return false;
}

/**
 * Evidência de mundo A: artefacto/operação do próprio CEO.
 * «prioridade» / «decisão» / «recomenda» isolados NÃO contam.
 * @param {string} t — texto já normalizado
 */
function temEvidenciaMundoA(t) {
  return temAncoraOperacionalForte(t);
}

/**
 * Evidência de mundo B: facto, alternativa ou juízo sobre o contexto do utilizador.
 * @param {string} t — texto já normalizado
 */
function temEvidenciaMundoB(t) {
  if (temLastroNegocio(t)) return true;
  if (temEstruturaAlternativaOuDilema(t)) return true;
  if (/\bcontrato(s)?\b/.test(t)) return true;
  if (temObjetoPropostaDeliberativa(t)) return true;
  return false;
}

/**
 * Pedido operacional nu (forma de juízo sobre o sistema), sem lastro B.
 * Não cobre análise contextual sem âncora A.
 * @param {string} t — texto já normalizado
 */
function ehPedidoOperacionalSistema(t, opts = {}) {
  if (!t) return false;
  if (PEDIDO_PRIORIDADE_NU.test(t)) return false;
  const pd =
    opts.pedidoDecisaoExplicita != null
      ? opts.pedidoDecisaoExplicita === true
      : detectarPedidoDecisaoExplicita(
          t,
          opts.infoGathering != null
            ? { infoGathering: opts.infoGathering === true }
            : {}
        );
  if (pd) return false;
  if (!temMarcadorRecomendacao(t) || !temObjetoOperacional(t)) return false;
  if (temMarcadorAnaliseContextual(t) && !temAncoraOperacionalForte(t)) {
    return false;
  }
  return true;
}

/**
 * @param {unknown} fioCoa
 * @returns {string[]}
 */
function textosDoFioCoa(fioCoa) {
  if (!fioCoa) return [];
  if (typeof fioCoa === "string") {
    const s = String(fioCoa).trim();
    return s ? [s] : [];
  }
  if (!Array.isArray(fioCoa)) return [];
  return fioCoa
    .map((m) => (typeof m === "string" ? m : String(m && m.texto ? m.texto : "")))
    .map((s) => s.trim())
    .filter(Boolean);
}

function fioTemEvidenciaMundoB(fioCoa) {
  return textosDoFioCoa(fioCoa).some((txt) => temEvidenciaMundoB(normalizarTexto(txt)));
}

/**
 * Predicado central: objecto semântico do turno + fio do mesmo COA (Fatia 2).
 * Deixis herda B do fio; pedido operacional nu não herda.
 *
 * @param {string} [texto]
 * @param {unknown} [fioCoa]
 * @param {{
 *   infoGathering?: boolean,
 *   pedidoDecisaoExplicita?: boolean
 * }} [opts] — Fatia 1: consumir IG/PD já produzidos (sem reavaliar no path canónico)
 * @returns {"A"|"B"|"misto"|"indefinido"}
 */
export function objectoDoTurno(texto, fioCoa, opts = {}) {
  const t = normalizarTexto(texto);
  if (!t) return OBJECTO_TURNO.INDEFINIDO;

  const a = temEvidenciaMundoA(t);
  let b = temEvidenciaMundoB(t);
  if (!b && fioTemEvidenciaMundoB(fioCoa) && ehDeixisContinuidadeNegocio(t)) {
    b = true;
  }
  if (a && b) return OBJECTO_TURNO.MISTO;
  if (a) return OBJECTO_TURNO.A;
  if (b) return OBJECTO_TURNO.B;
  if (ehPedidoOperacionalSistema(t, opts)) return OBJECTO_TURNO.A;
  return OBJECTO_TURNO.INDEFINIDO;
}

/**
 * Recomendação operacional sobre lastro do sistema (fila/sprint/job/gate).
 * E4 só é verdadeiro para objecto A inequívoco.
 * Objecto B ou misto → não E4 (B governa a deliberação).
 * «prioridade» / «decisão» / «recomenda» isolados não determinam E4.
 * Pedido explícito de decisão (fecho) prevalece — não desvia para E4/C4.
 * @param {string} [texto]
 * @param {unknown} [fioCoa]
 * @param {{
 *   objectoTurno?: string,
 *   pedidoDecisaoExplicita?: boolean,
 *   infoGathering?: boolean
 * }} [opts] — Fatia 1: consumir objecto/pd já produzidos (sem recalcular)
 */
export function ehRecomendacaoOperacional(texto, fioCoa, opts = {}) {
  const n = normalizarTexto(texto);
  if (!n) return false;
  if (PEDIDO_PRIORIDADE_NU.test(n)) return false;
  const detectarPd =
    typeof opts.detectarPedidoDecisaoExplicita === "function"
      ? opts.detectarPedidoDecisaoExplicita
      : detectarPedidoDecisaoExplicita;
  const pd =
    opts.pedidoDecisaoExplicita != null
      ? opts.pedidoDecisaoExplicita === true
      : detectarPd(texto);
  if (pd) return false;
  if (ehDeliberacaoDeProposta(n)) return false;
  const calcObjecto =
    typeof opts.calcObjectoDoTurno === "function"
      ? opts.calcObjectoDoTurno
      : objectoDoTurno;
  const objecto =
    opts.objectoTurno != null
      ? opts.objectoTurno
      : calcObjecto(texto, fioCoa, {
          ...(opts.pedidoDecisaoExplicita != null
            ? { pedidoDecisaoExplicita: opts.pedidoDecisaoExplicita === true }
            : {}),
          ...(opts.infoGathering != null
            ? { infoGathering: opts.infoGathering === true }
            : {})
        });
  if (objecto !== OBJECTO_TURNO.A) return false;
  if (!temMarcadorRecomendacao(n)) return false;
  return temObjetoOperacional(n) || temAncoraOperacionalForte(n);
}

/**
 * Pedido misto: panorama/estado + recomendação operacional.
 * @param {string} [texto]
 * @param {unknown} [fioCoa]
 * @param {{ objectoTurno?: string, pedidoDecisaoExplicita?: boolean, infoGathering?: boolean }} [opts]
 */
export function ehPedidoMistoEstadoERecomendacaoOperacional(
  texto,
  fioCoa,
  opts = {}
) {
  const n = normalizarTexto(texto);
  if (!ehRecomendacaoOperacional(n, fioCoa, opts)) return false;
  return (
    /\bonde\s+estamos\b/.test(n) ||
    /\bestado\s+atual\b/.test(n) ||
    /\bestado\s+(do|da)\b/.test(n) ||
    /\b(status|panorama|resumo)\b/.test(n) ||
    /\banalis[ae].*\bestado\b/.test(n) ||
    /\bestado\b.*\brecomend/.test(n)
  );
}

/**
 * Extrai o objeto da recomendação operacional a partir da mensagem actual
 * (não do histórico — evita contaminação por tópicos anteriores).
 * @param {string} [texto]
 * @returns {{ tipo: string, id: string|null, rotulo: string, detalhe: string|null, referencia?: string|null }}
 */
export function identificarObjetoRecomendacaoOperacional(texto) {
  const raw = String(texto || "").trim();
  const n = normalizarTexto(texto);
  const jobM = raw.match(/\bJOB-(\d+)\b/i);
  if (jobM) {
    const id = `JOB-${jobM[1]}`;
    return {
      tipo: "job",
      id,
      rotulo: id,
      detalhe: null,
      referencia: null
    };
  }

  // Sequenciamento: prioridade/passo depois de X (antes do tipo sprint genérico)
  const sequencia =
    /\b(depois|ap[oó]s)\b/.test(n) ||
    /\bo\s+que\s+vem\s+depois\b/.test(n) ||
    /\bprioridade\s+(depois|ap[oó]s)\b/.test(n) ||
    /\bpr[oó]ximo\s+passo\s+(ap[oó]s|depois)\b/.test(n) ||
    /\bqual\s+sequ[eê]ncia\b/.test(n);

  if (sequencia && (/\bsprint\b/i.test(raw) || /\bvalida[cç][aã]o\b/i.test(raw))) {
    const num = (raw.match(/\bSprint\s*(\d+)/i) || [])[1] || null;
    const validacao = /\bvalida[cç][aã]o\b/i.test(raw);
    const ref = (
      validacao
        ? `validação da Sprint ${num || ""}`.trim()
        : `Sprint ${num || ""}`.trim()
    );
    return {
      tipo: "proxima_prioridade_apos",
      id: num ? `apos-sprint-${num}` : "apos-referencia",
      rotulo: `próxima prioridade após ${ref}`,
      detalhe: num ? `sprint-${num}` : null,
      referencia: ref
    };
  }

  if (/\bsprint\b/i.test(raw)) {
    const num = (raw.match(/\bSprint\s*(\d+)/i) || [])[1] || null;
    const tema = (raw.match(/\bSprint\s*\d+\s+de\s+([\wÀ-ÿ]+)/i) || [])[1] || null;
    const validacao = /\bvalida[cç][aã]o\b/i.test(raw);
    const rotulo = (
      validacao ? `validação da Sprint ${num || ""}` : `Sprint ${num || ""}`
    ).trim();
    return {
      tipo: validacao ? "validacao_sprint" : "sprint",
      id: num ? `sprint-${num}` : "sprint",
      rotulo: tema ? `${rotulo} de ${tema}` : rotulo,
      detalhe: tema || null,
      referencia: null
    };
  }

  if (
    sequencia &&
    (/\bprioridade\b/.test(n) || /\bpr[oó]ximo\s+passo\b/.test(n) || /\bsequ[eê]ncia\b/.test(n))
  ) {
    return {
      tipo: "proxima_prioridade_apos",
      id: null,
      rotulo: "próxima prioridade operacional",
      detalhe: null,
      referencia: null
    };
  }

  if (/\bpr[oó]xima\s+decis[aã]o\b/.test(n)) {
    return {
      tipo: "proxima_decisao",
      id: null,
      rotulo: "próxima decisão",
      detalhe: null,
      referencia: null
    };
  }
  if (/\bprioridade(s)?\b/.test(n)) {
    return {
      tipo: "prioridade",
      id: null,
      rotulo: "prioridade",
      detalhe: null,
      referencia: null
    };
  }
  if (/\btarefa\b/.test(n)) {
    return {
      tipo: "tarefa",
      id: null,
      rotulo: "tarefa",
      detalhe: null,
      referencia: null
    };
  }
  if (/\bsequ[eê]ncia\b/.test(n)) {
    return {
      tipo: "sequencia",
      id: null,
      rotulo: "sequência",
      detalhe: null,
      referencia: null
    };
  }
  if (/\bgates?\b/.test(n)) {
    return {
      tipo: "gate",
      id: null,
      rotulo: "Gate",
      detalhe: null,
      referencia: null
    };
  }
  if (/\bfila\b/.test(n)) {
    return {
      tipo: "fila",
      id: null,
      rotulo: "fila",
      detalhe: null,
      referencia: null
    };
  }

  const manterM = raw.match(
    /\bmant(?:er|ém|em)\s+(?:a\s+|o\s+|nossa\s+)?(.{8,80}?)(?=\s+como\b|\s+na\b|\?|$)/i
  );
  if (manterM) {
    return {
      tipo: "manter",
      id: null,
      rotulo: String(manterM[1]).trim().replace(/\s+/g, " ").slice(0, 120),
      detalhe: null,
      referencia: null
    };
  }

  return {
    tipo: "operacional",
    id: null,
    rotulo: "prioridade operacional actual",
    detalhe: null,
    referencia: null
  };
}
