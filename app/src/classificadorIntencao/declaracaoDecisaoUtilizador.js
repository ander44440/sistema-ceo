/**
 * Declaração de decisão do utilizador (acto já fechado).
 * Distinto de `detectarPedidoDecisaoExplicita` (pedido para o CEO decidir).
 * F15/C4 — preservar o enunciado sem deliberação genérica nem execução automática.
 * F20 — formulações naturais («Decisão minha», «Minha decisão é»).
 * F21 — decisão + ordem de execução no mesmo turno → registar decisão e deixar C3.
 */

import { normalizarTexto } from "./lexicon.js";

/**
 * @typedef {{
 *   activo: true,
 *   enunciado: string,
 *   comOrdemExecucao?: boolean
 * } | {
 *   activo: false,
 *   enunciado?: null,
 *   comOrdemExecucao?: boolean
 * }} ResultadoDeclaracaoDecisao
 */

/**
 * Remove cauda de instrução de registo («Registe apenas esta decisão»).
 * @param {string} s
 */
function limparCaudaRegisto(s) {
  return String(s || "")
    .replace(
      /\s*[.!]?\s*regist[ae]\s+(apenas\s+)?(esta\s+)?decis[aã]o\.?\s*$/i,
      ""
    )
    .replace(
      /\s*[.!]?\s*n[aã]o\s+execut[ae]\s*(ainda)?\.?\s*$/i,
      ""
    )
    .replace(/\s*[.!]?\s*$/u, "")
    .trim();
}

/**
 * Corta o enunciado antes da ordem de execução (mesmo turno).
 * @param {string} s
 */
function cortarAntesDeOrdemExecucao(s) {
  let out = String(s || "");
  out = out.split(/\b(?:execute|executa|executar)\s+agora\b/i)[0];
  out = out.split(/\bagora\s+(?:execute|executa|executar)\b/i)[0];
  out = out.split(/\b(?:crie|cria|criar)\s+(?:um\s+|o\s+|novo\s+)?jobs?\b/i)[0];
  out = out.split(/\b(?:abra|abre|abrir)\s+(?:um\s+|o\s+|novo\s+)?jobs?\b/i)[0];
  out = out.split(/\b(?:despache|despacha|despachar)\b/i)[0];
  out = out.split(/\b(?:implement[ae]|implementar)\b/i)[0];
  return limparCaudaRegisto(out);
}

/**
 * Ordem de execução no mesmo enunciado (não é só registo).
 * «Não execute» / «Não execute ainda» é proibição — não conta como ordem.
 * @param {string} t — normalizado
 */
export function temOrdemExecucaoNoTurno(t) {
  const semProib = String(t || "").replace(
    /\bn[aã]o\s+execut[ae]\w*\s*(ainda)?\b/g,
    " "
  );
  return (
    /\b(execute|executa|executar)\s+agora\b/.test(semProib) ||
    /\bagora\s+(execute|executa|executar)\b/.test(semProib) ||
    /\b(execute|executa|executar)\s*:\s*\S/.test(semProib) ||
    /\b(despache|despacha|despachar)\s+(um\s+|o\s+|novo\s+)?jobs?\b/.test(
      semProib
    ) ||
    /\b(crie|cria|criar)\s+(um\s+|o\s+|novo\s+)?jobs?\b/.test(semProib) ||
    /\b(abra|abre|abrir)\s+(um\s+|o\s+|novo\s+)?jobs?\b/.test(semProib) ||
    (/\bimplement[ae]\b/.test(semProib) &&
      /\b(jobs?|agora|isto|isso)\b/.test(semProib))
  );
}

/**
 * Pedido para o CEO decidir (≠ declaração do utilizador).
 * @param {string} t — normalizado
 */
function ehPedidoCeoDecidir(t) {
  return (
    /\b(voce|vc)\s+(deve|tem\s+de|precisa|pode)\s+decidir\b/.test(t) ||
    /\bdecid[ae]\s+(se|entre|qual|o\s+que|agora)\b/.test(t) ||
    /\b(quero\s+que\s+(voce|vc)\s+decid|pe[cç]o\s+que\s+decid)\b/.test(t) ||
    /\b(deve|tem\s+de)\s+decidir\b/.test(t)
  );
}

/**
 * Detecta que o utilizador **declara/regista** uma decisão neste turno.
 * Se houver também ordem de execução (`comOrdemExecucao`), a Porta Canónica
 * não deve fechar o turno — o C3 trata a parte executável.
 * @param {string} [texto]
 * @returns {ResultadoDeclaracaoDecisao}
 */
export function detectarDeclaracaoDecisaoUtilizador(texto) {
  const raw = String(texto || "").trim();
  if (!raw) return { activo: false, enunciado: null };

  const t = normalizarTexto(raw);
  if (!t) return { activo: false, enunciado: null };

  const comOrdem = temOrdemExecucaoNoTurno(t);

  // Pedido deliberativo / pedido ao CEO ≠ declaração do utilizador
  if (ehPedidoCeoDecidir(t)) {
    return { activo: false, enunciado: null };
  }
  if (
    /\b(deliber[ae]|compare\s+os\s+riscos)\b/.test(t) &&
    !/\bdecisao\s+explicita\s*:/.test(t) &&
    !/\bdecisao\s+minha\b/.test(t) &&
    !/\bminha\s+decisao\b/.test(t) &&
    !/\bregist[ae]\s+(apenas\s+)?(esta\s+)?decisao\b/.test(t)
  ) {
    return { activo: false, enunciado: null };
  }

  /** @type {string|null} */
  let enunciado = null;

  const mExp = /\bdecis[aã]o\s+expl[ií]cita\s*:\s*(.+)$/is.exec(raw);
  if (mExp) {
    enunciado = limparCaudaRegisto(mExp[1]);
  }

  // F20 — «Decisão minha: …» / «Decisão minha, registada: …»
  if (!enunciado) {
    const mMinha = /\bdecis[aã]o\s+minha\s*[,:]?\s*(?:registad[ao]\s*[,:]?\s*)?(.+)$/is.exec(
      raw
    );
    if (mMinha) enunciado = limparCaudaRegisto(mMinha[1]);
  }

  // F20 — «Minha decisão é: …» / «Minha decisão: …»
  if (!enunciado) {
    const mMinhaE =
      /\bminha\s+decis[aã]o\s*(?:[eé]\s*)?[:,]?\s*(.+)$/is.exec(raw);
    if (mMinhaE) enunciado = limparCaudaRegisto(mMinhaE[1]);
  }

  if (!enunciado) {
    const mDec = /\bdecid(?:i|imos)?\s*:\s*(.+)$/is.exec(raw);
    if (mDec) enunciado = limparCaudaRegisto(mDec[1]);
  }
  if (!enunciado) {
    const mRotulo = /\bdecis[aã]o\s*:\s*(.+)$/is.exec(raw);
    if (
      mRotulo &&
      !/\bdecis[aã]o\s+expl[ií]cita\b/i.test(raw) &&
      !/\bdecis[aã]o\s+minha\b/i.test(raw)
    ) {
      enunciado = limparCaudaRegisto(mRotulo[1]);
    }
  }

  if (
    !enunciado &&
    /\bregist[ae]\s+(apenas\s+)?(esta\s+)?decis[aã]o\b/i.test(raw)
  ) {
    const antes = raw
      .split(/\bregist[ae]\s+(?:apenas\s+)?(?:esta\s+)?decis[aã]o\b/i)[0]
      .trim();
    const limpo = limparCaudaRegisto(
      antes
        .replace(/^\s*decis[aã]o\s+expl[ií]cita\s*:\s*/i, "")
        .replace(/^\s*decis[aã]o\s+minha\s*[,:]?\s*(?:registad[ao]\s*[,:]?\s*)?/i, "")
        .replace(/^\s*minha\s+decis[aã]o\s*(?:[eé]\s*)?[:,]?\s*/i, "")
    );
    if (limpo.length >= 8) enunciado = limpo;
  }

  if (enunciado && comOrdem) {
    enunciado = cortarAntesDeOrdemExecucao(enunciado);
  }

  if (!enunciado || enunciado.length < 4) {
    return { activo: false, enunciado: null, comOrdemExecucao: comOrdem };
  }

  const temMarcador =
    /\bdecisao\s+explicita\b/.test(t) ||
    /\bdecisao\s+minha\b/.test(t) ||
    /\bminha\s+decisao\b/.test(t) ||
    /\bregist[ae]\s+(apenas\s+)?(esta\s+)?decisao\b/.test(t) ||
    /\bdecid[io]\s*:/.test(t) ||
    (/^\s*decisao\s*:/.test(t) && enunciado.length >= 8);

  if (!temMarcador) {
    return { activo: false, enunciado: null, comOrdemExecucao: comOrdem };
  }

  return { activo: true, enunciado, comOrdemExecucao: comOrdem };
}

/**
 * Confirmação determinística — preserva o enunciado; sem inventar; sem Job.
 * @param {string} enunciado
 * @returns {string}
 */
export function comporConfirmacaoDecisaoUtilizador(enunciado) {
  const e = String(enunciado || "").trim();
  if (!e) return "Decisão registada. Sem execução automática neste turno.";
  return `Decisão registada: ${e}. Sem execução automática neste turno.`;
}

/**
 * Resposta canónica só quando a declaração fecha o turno (sem ordem de execução).
 * F21: com ordem explícita → activo:false para a PC não engolir o C3.
 * @param {string} [texto]
 * @returns {{ activo: boolean, mensagem?: string, enunciado?: string, comOrdemExecucao?: boolean }}
 */
export function tentarRespostaDeclaracaoDecisao(texto) {
  const det = detectarDeclaracaoDecisaoUtilizador(texto);
  if (!det.activo || !det.enunciado) {
    return { activo: false, comOrdemExecucao: det.comOrdemExecucao === true };
  }
  if (det.comOrdemExecucao) {
    return {
      activo: false,
      enunciado: det.enunciado,
      comOrdemExecucao: true
    };
  }
  return {
    activo: true,
    mensagem: comporConfirmacaoDecisaoUtilizador(det.enunciado),
    enunciado: det.enunciado,
    comOrdemExecucao: false
  };
}

/**
 * Prefixa a confirmação da decisão quando o turno também despacha C3.
 * @param {string} [texto]
 * @param {string} [mensagem]
 * @returns {string}
 */
export function prefixarDecisaoSeComposta(texto, mensagem) {
  const det = detectarDeclaracaoDecisaoUtilizador(texto);
  if (!det.activo || !det.comOrdemExecucao || !det.enunciado) {
    return String(mensagem || "");
  }
  const prefix = `Decisão registada: ${det.enunciado}.`;
  const body = String(mensagem || "").trim();
  if (!body) return prefix;
  if (/decis[aã]o\s+registada/i.test(body)) return body;
  return `${prefix}\n\n${body}`;
}
