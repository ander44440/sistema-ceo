/**
 * E4 — Recomendação operacional ≠ deliberação de proposta.
 * Regra semântica reutilizável (sem atalhos a Sprint concreta).
 */

import { normalizarTexto } from "./lexicon.js";
import { detectarPedidoDecisaoExplicita } from "./pedidoDecisaoExplicita.js";

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
 * Recomendação operacional sobre prioridade/decisão/estado existente.
 * «recomenda» isolado NÃO basta; exige objeto operacional e exclui proposta.
 * Pedido explícito de decisão (fecho) prevalece — não desvia para E4/C4.
 * @param {string} [texto]
 */
export function ehRecomendacaoOperacional(texto) {
  const n = normalizarTexto(texto);
  if (!n) return false;
  // Decisão sob conflito: «decida / escolha entre / tome a decisão» → C2/MRE
  if (detectarPedidoDecisaoExplicita(texto)) return false;
  if (ehDeliberacaoDeProposta(n)) return false;
  if (!temMarcadorRecomendacao(n)) return false;
  return temObjetoOperacional(n);
}

/**
 * Pedido misto: panorama/estado + recomendação operacional.
 * @param {string} [texto]
 */
export function ehPedidoMistoEstadoERecomendacaoOperacional(texto) {
  const n = normalizarTexto(texto);
  if (!ehRecomendacaoOperacional(n)) return false;
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
