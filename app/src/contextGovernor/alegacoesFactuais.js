/**
 * Context Governor — alegações factuais do utilizador vs lastro autorizado.
 *
 * Contrato de usos (REQ-093 / IN-1):
 * - FACTO: lastro autorizado (ex. LFC_ACTIVOS) — único uso que promove a facto.
 * - MANDATO_PROMPT: instrução/pergunta legítima do turno.
 * - ALEGACAO_FACTUAL: alegação do utilizador sem lastro no COA/caso activo —
 *   NÃO constitui facto autorizado só por constar na mensagem.
 */

import { FONTES_CG, USOS_CG } from "./contratos.js";

/**
 * @param {unknown} valor
 * @returns {string}
 */
function texto(valor) {
  if (valor == null) return "";
  if (typeof valor === "string") return valor.trim();
  return String(valor).trim();
}

/**
 * Extrai marcadores factuais tipificados (tokens, entidades comerciais, montantes).
 * @param {string} raw
 * @returns {string[]}
 */
export function extrairMarcadoresFactuais(raw) {
  const t = texto(raw);
  if (!t) return [];
  /** @type {string[]} */
  const marks = [];

  const tokens = t.match(/\b[A-Z]{2,}(?:-[A-Z0-9]+)+\b/g) || [];
  marks.push(...tokens);

  const firms =
    t.match(
      /\b[A-ZÁÉÍÓÚÂÊÔÃÕ][\p{L}\d]*(?:\s+[A-ZÁÉÍÓÚÂÊÔÃÕ][\p{L}\d]*){0,3}\s+(?:Ltda|Lda|S\.?A\.?)\b/gu
    ) || [];
  marks.push(...firms);

  const money = t.match(/R\$\s*[\d.]+(?:\s*,\s*\d+)?/g) || [];
  marks.push(...money);

  const uniq = [];
  const seen = new Set();
  for (const m of marks) {
    const n = texto(m);
    const key = n.toLowerCase();
    if (!n || seen.has(key)) continue;
    seen.add(key);
    uniq.push(n);
  }
  return uniq;
}

/**
 * Menção explícita de que o conteúdo é alheio / não deve registar-se no âmbito activo.
 * @param {string} raw
 * @returns {boolean}
 */
export function ehMençãoAlheiaOuNaoRegisto(raw) {
  const t = texto(raw);
  return /n[aã]o\s+regist|noutro\s+projecto|outro\s+(coa|caso|projecto)|informa[cç][aã]o\s+alheia|s[oó]\s+men[cç][aã]o|n[aã]o\s+(é|e)\s+facto\s+(deste|do\s+caso)/i.test(
    t
  );
}

/**
 * Pedido de confirmação / atribuição de factos ao COA/caso activo.
 * @param {string} raw
 * @returns {boolean}
 */
export function ehPedidoConfirmacaoOuAtribuicaoFacto(raw) {
  const t = texto(raw);
  if (!t || ehMençãoAlheiaOuNaoRegisto(t)) return false;

  if (
    /confirm[ae].{0,80}facto|como\s+facto\s+do\s+LFC|facto\s+do\s+LFC\s+deste|confirm[ae]\s+como\s+facto/i.test(
      t
    )
  ) {
    return true;
  }

  // Atribuição ao âmbito activo exige pedido de confirmação explícito (não basta pergunta).
  if (
    /deste\s+caso|deste\s+coa|LFC\s+deste\s+caso/i.test(t) &&
    /confirm[ae]|est[aá]\s+correcto|est[aá]\s+correto|como\s+facto/i.test(t) &&
    extrairMarcadoresFactuais(t).length > 0
  ) {
    return true;
  }

  // Atribuição directa com marcadores + pedido de confirmação
  const marks = extrairMarcadoresFactuais(t);
  if (
    marks.length > 0 &&
    /confirm[ae]|est[aá]\s+correcto|est[aá]\s+correto|como\s+facto/i.test(t)
  ) {
    return true;
  }

  return false;
}

/**
 * Classifica uso do turno do utilizador para o contrato de fragmentos.
 * @param {string} raw
 * @returns {string} USOS_CG.*
 */
export function classificarUsoTurnoUtilizador(raw) {
  if (ehPedidoConfirmacaoOuAtribuicaoFacto(raw)) {
    return USOS_CG.ALEGACAO_FACTUAL;
  }
  return USOS_CG.MANDATO_PROMPT;
}

/**
 * Textos lastreados autorizáveis no âmbito activo (não inventa; só agrega LFC residual/candidato).
 * @param {import("./contratos.js").FragmentoContexto[]} fragmentos
 * @param {{ coaIdActivo?: string, casoIdActivo?: string }} ambito
 * @returns {string}
 */
export function textoLastroFactuaisDoAmbito(fragmentos, ambito = {}) {
  const coa = texto(ambito.coaIdActivo);
  const caso = texto(ambito.casoIdActivo);
  const partes = [];
  for (const f of Array.isArray(fragmentos) ? fragmentos : []) {
    if (!f || f.fonte !== FONTES_CG.LFC_ACTIVOS) continue;
    if (f.uso && f.uso !== USOS_CG.FACTO && f.uso !== USOS_CG.OBJECTO) continue;
    if (f.coaId && coa && texto(f.coaId) !== coa) continue;
    if (f.casoId && caso && texto(f.casoId) !== caso) continue;
    const tx = texto(f.texto);
    if (tx) partes.push(tx);
  }
  return partes.join("\n");
}

/**
 * @param {string[]} marcadores
 * @param {string} lastro
 * @returns {string[]}
 */
export function marcadoresSemLastro(marcadores, lastro) {
  const base = texto(lastro).toLowerCase();
  return (Array.isArray(marcadores) ? marcadores : []).filter((m) => {
    const n = texto(m).toLowerCase();
    return n && !base.includes(n);
  });
}

/**
 * Avalia se um fragmento de turno promove alegação sem lastro a facto do âmbito activo.
 * @param {import("./contratos.js").FragmentoContexto} frag
 * @param {{ lastroTextual: string }} opts
 * @returns {{ ok: true } | { ok: false, motivo: string, marcadores: string[] }}
 */
export function avaliarAlegacaoFragmento(frag, opts = {}) {
  const fonte = String(frag?.fonte || "");
  const uso = String(frag?.uso || USOS_CG.MANDATO_PROMPT);
  const raw = texto(frag?.texto);

  const eTurnoUtilizador =
    fonte === FONTES_CG.TURNO_ATUAL || uso === USOS_CG.ALEGACAO_FACTUAL;

  if (!eTurnoUtilizador || !raw) return { ok: true };

  // Só facto lastreado (LFC) pode autorizar promoção — turno nunca é FACTO implícito.
  if (uso === USOS_CG.FACTO && fonte === FONTES_CG.TURNO_ATUAL) {
    return {
      ok: false,
      motivo:
        "Turno do utilizador não pode ser uso 'facto' — alegação sem lastro autorizado.",
      marcadores: extrairMarcadoresFactuais(raw)
    };
  }

  if (!ehPedidoConfirmacaoOuAtribuicaoFacto(raw) && uso !== USOS_CG.ALEGACAO_FACTUAL) {
    return { ok: true };
  }

  const marks = extrairMarcadoresFactuais(raw);
  if (marks.length === 0) {
    // Confirmação sem marcadores concretos: ainda exige lastro residual — tratado noutro sítio se residual vazio.
    return { ok: true };
  }

  const sem = marcadoresSemLastro(marks, opts.lastroTextual || "");
  if (sem.length === 0) return { ok: true };

  return {
    ok: false,
    motivo:
      "Alegação factual do utilizador sem lastro no COA/caso activo — promoção a facto não autorizada.",
    marcadores: sem
  };
}
