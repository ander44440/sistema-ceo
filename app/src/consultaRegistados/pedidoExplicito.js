/**
 * IMP-086 / ARQ-086 D-PED — detector de pedido explícito de consulta.
 * Âncoras +/− conforme REQ-086 v1.0. Determinístico; sem LLM.
 */

/**
 * @typedef {"decisao"|"discussao"|"ambos"} RamoConsulta
 * @typedef {{
 *   ehPedido: boolean,
 *   ramo: RamoConsulta|null,
 *   coaNomeado: string|null,
 *   termo: string|null,
 *   motivo: string
 * }} ResultadoPedidoExplicito
 */

const RE_NEGATIVO =
  /\b(continuar|continua|continue|prossiga|prosseguir|despacha(?:r)?|despache|envie|enviar|reenviar|status\s+do\s+job|ha\s+jobs|h[aá]\s+jobs|retomar\s+o\s+fio|retoma\s+o\s+fio|o\s+que\s+sabes\s+(do|sobre)\s+(o\s+)?dom[ií]nio|estado\s+(atual|actual)\s+do\s+dia|abrir\s+o\s+dia|encerrar\s+o\s+dia)\b/i;

const RE_DECISAO =
  /\b(o\s+que\s+decidimos|que\s+decis[aã]o|decis[oõ]es?\s+registadas?|consulta\s+[aà]\s+mem[oó]ria\s+organizacional|mem[oó]ria\s+organizacional|o\s+que\s+ficou\s+registado|o\s+que\s+ficou\s+registrado)\b/i;

const RE_DISCUSSAO =
  /\b(o\s+que\s+discutimos|no\s+transcript|no\s+hist[oó]rico\s+da\s+conversa|discuss[oõ]es?\s+(antigas?|registadas?|registradas?))\b/i;

/** Referência explícita ao HFC (Histórico Físico das Conversas). */
const RE_HISTORICO_FISICO = /\bhist[oó]rico\s+f[ií]sico\b/i;

/**
 * Contexto de consulta exigido junto a «histórico físico»
 * para activar F-TX/HFC sem alargar âncoras de decisão.
 */
const RE_CONTEXTO_CONSULTA_HFC =
  /\b(consult\w*|me\s+diga|diga[- ]?me|o\s+que\s+(discutimos|decidimos|ficou)|discuss[oõ]es?\s+(antigas?|registadas?|registradas?)|no\s+transcript|no\s+hist[oó]rico\s+da\s+conversa)\b/i;

const RE_AMBOS =
  /\b(o\s+que\s+(j[aá]\s+)?(decidimos|discutimos)\s+e\s+(discutimos|decidimos)|consulta\s+(de\s+)?(discuss[oõ]es?\s+e\s+decis[oõ]es?|decis[oõ]es?\s+e\s+discuss[oõ]es?))\b/i;

const RE_COA_NOMEADO =
  /\b(?:no|do|da|para\s+o|sobre\s+o)\s+coa[\s:_-]*([a-z0-9][a-z0-9_-]{1,64})\b/i;

/**
 * @param {string} [texto]
 * @returns {ResultadoPedidoExplicito}
 */
export function detectarPedidoExplicitoConsulta(texto) {
  const raw = String(texto || "").trim();
  if (!raw) {
    return {
      ehPedido: false,
      ramo: null,
      coaNomeado: null,
      termo: null,
      motivo: "vazio"
    };
  }

  if (RE_NEGATIVO.test(raw)) {
    return {
      ehPedido: false,
      ramo: null,
      coaNomeado: null,
      termo: null,
      motivo: "ancora_negativa"
    };
  }

  const coaM = raw.match(RE_COA_NOMEADO);
  const coaNomeado = coaM ? String(coaM[1]).trim() : null;

  const temDec = RE_DECISAO.test(raw);
  const temHfc =
    RE_HISTORICO_FISICO.test(raw) && RE_CONTEXTO_CONSULTA_HFC.test(raw);
  const temDisc = RE_DISCUSSAO.test(raw) || temHfc;
  const temAmbos = RE_AMBOS.test(raw);

  if (!temDec && !temDisc && !temAmbos) {
    return {
      ehPedido: false,
      ramo: null,
      coaNomeado,
      termo: null,
      motivo: "sem_ancora_positiva"
    };
  }

  /** @type {RamoConsulta} */
  let ramo = "ambos";
  if (temAmbos || (temDec && temDisc)) ramo = "ambos";
  else if (temDec) ramo = "decisao";
  else ramo = "discussao";

  return {
    ehPedido: true,
    ramo,
    coaNomeado,
    termo: extrairTermoOpcional(raw),
    motivo: "ancora_positiva"
  };
}

/**
 * Termo residual simples: só após «sobre» / «acerca de» (evita lixo de âncoras).
 * @param {string} raw
 * @returns {string|null}
 */
function extrairTermoOpcional(raw) {
  const m = String(raw || "").match(
    /\b(?:sobre|acerca\s+de)\s+([^?!.]+)/i
  );
  if (!m) return null;
  const t = String(m[1] || "")
    .replace(/\bcoa[\s:_-]*[a-z0-9_-]+\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!t || t.length < 3) return null;
  return t.slice(0, 80);
}
