/**
 * P1 — Intenção actual vs contexto executivo.
 * CONTEXTO ≠ RESPOSTA: o resumo executivo não substitui o pedido actual.
 */

import { normalizarTexto } from "../classificadorIntencao/lexicon.js";

/** Intenções cujo núcleo já produziu a resposta factual a preservar. */
export const INTENCOES_RESPOSTA_DIRECTA = Object.freeze([
  "consultar_estado",
  "recomendar_operacional",
  "analisar_pendencias",
  "listar_jobs_fila",
  "pergunta_data",
  "pergunta_hora",
  "pergunta_identidade"
]);

/** Modos do Núcleo que já são a resposta (não deliberação). */
export const MODOS_RESPOSTA_DIRECTA = Object.freeze([
  "consulta_estado",
  "recomendacao_operacional",
  "capacidade_operacional",
  "local"
]);

/**
 * Pedido explícito de panorama / resumo executivo.
 * @param {string} [instrucao]
 */
export function ehPedidoResumoExecutivo(instrucao) {
  const t = normalizarTexto(instrucao);
  if (!t) return false;
  return (
    /\bonde\s+estamos\b/.test(t) ||
    /\bonde\s+paramos\b/.test(t) ||
    /\bcomo\s+estamos\b/.test(t) ||
    /\b(resumo|panorama|situacao)\s+(executivo|do\s+projeto|da\s+sessao|geral)\b/.test(
      t
    ) ||
    /\bestado\s+(do\s+)?(projeto|sessao|sistema|ceo)\b/.test(t) ||
    /\bqual\s+[eé]\s+o\s+estado\s+atual\b/.test(t) ||
    /\bme\s+(da|dê|diga)\s+(um\s+)?(resumo|panorama|status)\b/.test(t) ||
    /\bretomar\s+(o\s+)?(contexto|dia|trabalho)\b/.test(t) ||
    /\bo\s+que\s+decidimos\b/.test(t)
  );
}

/**
 * Consulta/pedido específico (Job, Gate, prioridade, decisão, pendências, fila).
 * @param {string} [instrucao]
 * @param {string} [intencaoId]
 */
export function ehPedidoEspecifico(instrucao, intencaoId = "") {
  const id = String(intencaoId || "");
  if (INTENCOES_RESPOSTA_DIRECTA.includes(id) && !ehPedidoResumoExecutivo(instrucao)) {
    return true;
  }
  const t = normalizarTexto(instrucao);
  if (!t) return false;
  if (ehPedidoResumoExecutivo(t)) return false;

  if (/\bjobs?-\d+\b/.test(t)) return true;
  if (/\bgates?\b/.test(t) && /\b(pendente|qual|quais|id|estado|status)\b/.test(t)) {
    return true;
  }
  if (/\b(prioridade|prioridades)\b/.test(t) && /\b(qual|quais|atual|actual)\b/.test(t)) {
    return true;
  }
  if (
    /\b(decis[aã]o|decisoes|decisões)\b/.test(t) &&
    /\b(qual|quais|mais\s+recente|ultima|última)\b/.test(t)
  ) {
    return true;
  }
  if (/\bpendenc/.test(t) && /\b(quais|qual|abertas?|lista)\b/.test(t)) {
    return true;
  }
  if (/\bfila\b/.test(t) && /\b(estado|status|jobs?|qual)\b/.test(t)) {
    return true;
  }
  if (
    /\b(resultado|verificad|verificacao)\b/.test(t) &&
    /\b(jobs?|agent|ceo)\b/.test(t)
  ) {
    return true;
  }
  return false;
}

/**
 * A instrução não deve virar «objectivo principal» (perguntas / consultas).
 * @param {string} [instrucao]
 */
export function ehInstrucaoUsavelComoObjectivo(instrucao) {
  const raw = String(instrucao || "").trim();
  if (!raw || raw.length < 8) return false;
  const t = normalizarTexto(raw);
  if (!t) return false;
  if (/\?$/.test(raw.trim())) return false;
  if (
    /^(qual|quais|onde|como|quando|quem|o\s+que|me\s+(diga|informe|mostre)|mostra|mostre|diga|informe|liste|listar|consulte?)\b/.test(
      t
    )
  ) {
    return false;
  }
  if (/\bnao\s+(execute|crie|implemente)\b/.test(t)) return false;
  if (ehPedidoEspecifico(raw) || ehPedidoResumoExecutivo(raw)) return false;
  return true;
}

/**
 * Deve preservar a prosa do Núcleo como resposta (sem envelope executivo).
 * @param {object} [opts]
 */
export function devePreservarRespostaNucleo(opts = {}) {
  const intencaoId = String(opts.intencaoId || opts.dados?.intencao?.id || "");
  const modo = String(opts.modo || "");
  const instrucao = String(opts.instrucao || "").trim();

  if (ehPedidoResumoExecutivo(instrucao)) return false;

  if (INTENCOES_RESPOSTA_DIRECTA.includes(intencaoId)) return true;

  if (
    modo === "consulta_estado" ||
    (modo === "capacidade_operacional" && ehPedidoEspecifico(instrucao, intencaoId))
  ) {
    return true;
  }

  if (ehPedidoEspecifico(instrucao, intencaoId)) return true;

  return false;
}

/**
 * Pedido de análise / avaliação (a resposta é a análise — não o resumo executivo).
 * @param {string} [instrucao]
 */
export function ehPedidoAnaliseConversa(instrucao) {
  const t = normalizarTexto(instrucao);
  if (!t) return false;
  if (ehPedidoResumoExecutivo(t) || ehPedidoEspecifico(instrucao)) return false;
  return (
    /\b(analisa|analise|analisar|avalia|avalie|avaliar|compara|compare|comparar)\b/.test(
      t
    ) || /\b(recomenda|recomendaria|voce\s+recomenda)\b/.test(t)
  );
}

/**
 * Pedido explícito de mudança de assunto (não justifica envelope executivo).
 * @param {string} [instrucao]
 */
export function ehMudancaDeAssunto(instrucao) {
  const t = normalizarTexto(instrucao);
  if (!t) return false;
  return (
    /\bquero\s+agora\b/.test(t) ||
    /\b(mudar|muda|mudança|trocar|troca)\s+(de\s+)?(assunto|foco|prioridade|tema)\b/.test(
      t
    ) ||
    /\bagora\s+(o\s+foco|vamos|quero)\b/.test(t) ||
    /\banalisar\s+outra\s+proposta\b/.test(t) ||
    /\boutra\s+proposta\b/.test(t)
  );
}

/**
 * Anexar âncora de objectivo / resumo genérico à prosa?
 * Etapa 4: default = NÃO. CONTEXTO ≠ RESPOSTA.
 * Só com panorama explícito, autorização explícita ou fecho forçado.
 * @param {object} [opts]
 */
export function deveAnexarContextoExecutivo(opts = {}) {
  const instrucao = String(opts.instrucao || "").trim();
  const intencaoId = String(opts.intencaoId || opts.dados?.intencao?.id || "");
  const t = normalizarTexto(instrucao);

  // Autorizações explícitas (continuidade inequívoca / panorama / fecho)
  if (opts.autorizarContextoExecutivo === true) return true;
  if (opts.forcarFecho === true) return true;
  if (ehPedidoResumoExecutivo(instrucao)) return true;

  // Bloqueios — lastro rico NÃO autoriza por si
  if (devePreservarRespostaNucleo(opts)) return false;
  if (ehPedidoEspecifico(instrucao, intencaoId)) return false;
  if (ehPedidoAnaliseConversa(instrucao)) return false;
  if (intencaoId === "saudacao") return false;
  if (ehMudancaDeAssunto(instrucao)) return false;
  if (t && /\bnao\s+(execute|crie|implemente)\b/.test(t)) return false;

  // Default: não despejar contexto executivo na resposta
  return false;
}

/**
 * Antecipar pendência na prosa?
 * Pendência existente, por si só, NÃO autoriza «Antecipo pendência aberta».
 * Só se pedida, panorama explícito, ou autorização explícita de contexto.
 * @param {object} [opts]
 */
export function deveAnteciparPendencia(opts = {}) {
  const instrucao = String(opts.instrucao || "").trim();
  const t = normalizarTexto(instrucao);

  if (opts.autorizarContextoExecutivo === true && Array.isArray(opts.pendencias)) {
    if (opts.pendencias.some(Boolean)) return true;
  }
  if (t && /\bpendenc/.test(t)) return true;
  if (t && ehPedidoResumoExecutivo(t)) return true;

  if (devePreservarRespostaNucleo(opts)) return false;
  if (t && ehPedidoEspecifico(instrucao, opts.intencaoId)) return false;
  if (t && ehPedidoAnaliseConversa(instrucao)) return false;
  if (ehMudancaDeAssunto(instrucao)) return false;

  return false;
}

/**
 * @param {string} instrucao
 * @param {string} pendencia
 */
export function pendenciaRelevanteAoPedido(instrucao, pendencia) {
  const a = normalizarTexto(instrucao)
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length >= 4);
  const b = normalizarTexto(pendencia);
  if (!a.length || !b) return false;
  const hits = a.filter((tok) => b.includes(tok));
  return hits.length >= 2 || (hits.length >= 1 && a.length <= 3);
}
