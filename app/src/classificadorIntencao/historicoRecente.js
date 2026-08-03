/**
 * Preparador de janela de histórico conversacional — IMP-061 / REQ-061 / ARQ-022.
 * Função pura: sem I/O, sem Classificador, sem Gate/Motor/NCS.
 */

/** @typedef {{ papel: string, texto: string }} HistoricoMsg */

/**
 * @typedef {object} HistoricoRecenteItem
 * @property {"usuario"|"ceo"} papel
 * @property {string} texto
 */

/** REQ-061 RF3 / ARQ-022 */
export const JANELA_MAX_MSGS = 4;
/** REQ-061 RF4 */
export const CAP_CHARS_MSG = 200;
/** REQ-061 RF5 */
export const CAP_CHARS_TOTAL = 800;

const RE_PROJETO =
  /\b(mg2|motoboy|outdoor|projeto|projecto|coa|frente|pagamento|worldlab|mvp|sprint|jogo)\b/i;

const RE_DEIXIS =
  /^(e\s+)?(isso|isto|aquilo)(\?)?$|^(continua|continue|seguir|prossiga)(\s+.*)?$|^(e\s+agora|agora)(\?)?$|^(ok|okay|certo|sim|isso\s+mesmo)(\.)?$|^e\s+o\b/i;

/**
 * @param {unknown} papel
 * @returns {"usuario"|"ceo"|null}
 */
export function normalizarPapelHistorico(papel) {
  const p = String(papel || "")
    .trim()
    .toLowerCase();
  if (p === "usuario" || p === "user" || p === "utilizador") return "usuario";
  if (p === "ceo" || p === "assistente" || p === "assistant" || p === "sistema")
    return "ceo";
  return null;
}

/**
 * @param {string} texto
 * @param {number} max
 */
export function truncarTextoHistorico(texto, max = CAP_CHARS_MSG) {
  const t = String(texto || "").replace(/\s+/g, " ").trim();
  if (!t) return "";
  if (t.length <= max) return t;
  return `${t.slice(0, Math.max(0, max - 1))}…`;
}

/**
 * Selecciona até 4 mensagens **anteriores** à actual, com caps 200/800.
 *
 * @param {ReadonlyArray<HistoricoMsg>|null|undefined} historico
 * @param {string} [mensagemActual]
 * @returns {HistoricoRecenteItem[]}
 */
export function seleccionarHistoricoRecente(historico, mensagemActual = "") {
  if (!Array.isArray(historico) || historico.length === 0) return [];

  const actual = String(mensagemActual || "").replace(/\s+/g, " ").trim();
  /** @type {HistoricoMsg[]} */
  let lista = historico.filter((m) => m && String(m.texto || "").trim());

  // UI inclui a mensagem actual no fim — excluir para cumprir RF3
  if (actual && lista.length) {
    const ultima = lista[lista.length - 1];
    const papelUlt = normalizarPapelHistorico(ultima.papel);
    const textoUlt = String(ultima.texto || "").replace(/\s+/g, " ").trim();
    if (papelUlt === "usuario" && textoUlt === actual) {
      lista = lista.slice(0, -1);
    }
  }

  const janela = lista.slice(-JANELA_MAX_MSGS);
  /** @type {HistoricoRecenteItem[]} */
  const itens = [];
  let total = 0;

  for (const m of janela) {
    const papel = normalizarPapelHistorico(m.papel);
    if (!papel) continue;
    let texto = truncarTextoHistorico(m.texto, CAP_CHARS_MSG);
    if (!texto) continue;
    if (total + texto.length > CAP_CHARS_TOTAL) {
      const resto = CAP_CHARS_TOTAL - total;
      if (resto < 8) break;
      texto = truncarTextoHistorico(texto, resto);
    }
    itens.push({ papel, texto });
    total += texto.length;
    if (total >= CAP_CHARS_TOTAL) break;
  }

  return itens;
}

/**
 * @param {ReadonlyArray<HistoricoRecenteItem>|null|undefined} itens
 */
export function historicoTemReferenciaProjeto(itens) {
  if (!Array.isArray(itens) || !itens.length) return false;
  const blob = itens.map((i) => i.texto).join(" \n ");
  return RE_PROJETO.test(blob);
}

/**
 * Follow-up curto / deixis — candidato a desambiguação C1↔C2 (não C3).
 * @param {string} t — texto já normalizado (lowercase)
 */
export function mensagemEhDeixisOuFollowUp(t) {
  const s = String(t || "").trim();
  if (!s) return false;
  if (RE_DEIXIS.test(s)) return true;
  const tokens = s.split(/\s+/).filter(Boolean);
  if (tokens.length <= 3 && /\b(isso|isto|aquilo|continua|agora)\b/.test(s)) {
    return true;
  }
  return false;
}
