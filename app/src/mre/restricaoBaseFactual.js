/**
 * IMP-092.5 / ADR-023 — Deliberação com Base Factual Restrita (RFR).
 * Detector alinhado a RFR-G2/G3 (sem heurística fora do contrato).
 * Isolamento do fio HFC no envelope MRE — não apaga o arquivo HFC.
 */

import { PREFIXO_FACTO_UTILIZADOR } from "./factosTurnoUtilizador.js";

/** Prefixo do bloco injectado por `enriquecerMensagemComFioRecente`. */
export const MARCA_FIO_RECENTE =
  "[Fio recente da conversa — CONTEXTO factual do mesmo COA.";

const MARCA_LASTRO_TURNO =
  "[LASTRO DO TURNO — factos fornecidos pelo utilizador nesta conversa.";

const BLOCO_RFR =
  "[RFR — deliberação com base factual restrita (ADR-023). " +
  "Universo factual = LFC activo do caso (+ turno actual de registo/correção, se houver). " +
  "HFC/fio anterior é prova append-only e NÃO integra o universo factual nem o objecto deliberativo " +
  "(`objetivoReal`, problema, análise, recomendação). Continuidade/deixis/identidade resolvem-se " +
  "pelo pedido actual e pelo caso já resolvido.]";

/**
 * Normaliza para matching PT (fatos/factos, acentos).
 * @param {unknown} pedido
 * @returns {string}
 */
function normalizarPedido(pedido) {
  return String(pedido || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

/**
 * ADR-023 RFR-G1…G3 / REQ-092 CM-RFR-1 — restrição explícita no pedido **actual**.
 * Exemplos ilustrativos da ADR (sem léxico ad hoc de produto/caso).
 *
 * @param {string} [pedido]
 * @returns {boolean}
 */
export function detectarRestricaoBaseFactual(pedido) {
  const t = normalizarPedido(pedido);
  if (!t.trim()) return false;

  // G3 ex.1 — «analisando apenas os fatos registrados sobre…»
  const analisandoApenasFactosRegistados =
    /\banalisando\b/.test(t) &&
    /\b(apenas|somente|so)\b/.test(t) &&
    /\b(fatos?|factos?)\b/.test(t) &&
    /\b(registrados?|registados?)\b/.test(t);

  // G3 ex.2 — «só com os factos do lastro do caso»
  const soComFactosDoLastro =
    /\b(so|apenas|somente)\s+com\s+os\s+(fatos?|factos?)\b/.test(t) &&
    /\blastro\b/.test(t);

  // G3 ex.3 — «com base unicamente nos factos assertados…»
  const baseUnicamenteAssertados =
    /\bcom\s+base\s+unicamente\b/.test(t) &&
    /\b(fatos?|factos?)\b/.test(t) &&
    /\bassertados?\b/.test(t);

  // G2 — equivalente semântico inequívoco: restrição + factos + registados|assertados|lastro
  const equivalenteInequivoco =
    (/\banalis/.test(t) || /\bcom\s+base\b/.test(t)) &&
    /\b(apenas|somente|so|unicamente)\b/.test(t) &&
    /\b(fatos?|factos?)\b/.test(t) &&
    /\b(registrados?|registados?|assertados?|lastro)\b/.test(t);

  return (
    analisandoApenasFactosRegistados ||
    soComFactosDoLastro ||
    baseUnicamenteAssertados ||
    equivalenteInequivoco
  );
}

/**
 * Remove um bloco `[MARCA…]` até ao próximo `\n\n[` ou fim.
 * @param {string} mensagem
 * @param {string} marca
 * @returns {string}
 */
function removerBlocoMarcado(mensagem, marca) {
  const s = String(mensagem || "");
  const i = s.indexOf(marca);
  if (i < 0) return s;
  let start = i;
  if (start >= 2 && s.slice(start - 2, start) === "\n\n") start -= 2;
  const after = s.slice(i);
  const nextBlock = after.search(/\n\n\[/);
  if (nextBlock < 0) return s.slice(0, start).trimEnd();
  return `${s.slice(0, start)}${s.slice(i + nextBlock)}`;
}

/**
 * Remove o bloco «Fio recente» da mensagem MRE (envelope). Não toca HFC em disco.
 * @param {string} mensagem
 * @returns {string}
 */
export function removerFioRecenteDaMensagem(mensagem) {
  return removerBlocoMarcado(mensagem, MARCA_FIO_RECENTE);
}

/**
 * Remove reparse HFC (`[Facto do utilizador…]` + bloco LASTRO DO TURNO) da mensagem.
 * Sob RFR+LFC a autoridade é o LFC (CM8); reparse não integra o objecto deliberativo.
 * @param {string} mensagem
 * @returns {string}
 */
export function removerReparseHfcDaMensagem(mensagem) {
  let s = removerBlocoMarcado(mensagem, MARCA_LASTRO_TURNO);
  s = s
    .split("\n")
    .filter((linha) => !linha.includes(PREFIXO_FACTO_UTILIZADOR))
    .join("\n");
  return s.replace(/\n{3,}/g, "\n\n").trimEnd();
}

/**
 * RFR activo = restrição explícita + consumo LFC autorizado (CM2) sem ambiguidade (G5).
 * @param {{
 *   instrucao?: string,
 *   consumo?: {
 *     autorizado?: boolean,
 *     ambiguidade?: boolean
 *   }|null
 * }} opts
 * @returns {boolean}
 */
export function regimeRfrActivo(opts = {}) {
  if (!detectarRestricaoBaseFactual(opts.instrucao || "")) return false;
  const c = opts.consumo || null;
  if (!c || c.autorizado !== true) return false;
  if (c.ambiguidade === true) return false;
  return true;
}

/**
 * Isola HFC/fio do envelope deliberativo sob RFR (ADR-023 D1–D2).
 * @param {object} entrada
 * @param {{
 *   instrucao?: string,
 *   consumo?: object|null
 * }} [opts]
 * @returns {object}
 */
export function aplicarIsolamentoRfrNaEntrada(entrada, opts = {}) {
  if (!entrada || typeof entrada !== "object") return entrada;
  const consumo = opts.consumo || entrada.lfcConsumo || null;
  const activo = regimeRfrActivo({
    instrucao: opts.instrucao || "",
    consumo
  });

  entrada.rfr = {
    activo,
    motivo: !detectarRestricaoBaseFactual(opts.instrucao || "")
      ? "sem_restricao"
      : !consumo || consumo.autorizado !== true
        ? "lfc_nao_autorizado"
        : consumo.ambiguidade === true
          ? "caso_ambiguo"
          : "rfr_lfc"
  };

  if (!activo) return entrada;

  let msg = String(entrada.mensagem || "");
  msg = removerFioRecenteDaMensagem(msg);
  msg = removerReparseHfcDaMensagem(msg);
  entrada.mensagem = msg;
  // Envelope apenas — store HFC append-only intacto (REQ-087 / D2).
  entrada.historico = [];
  const base = String(entrada.mensagem || "").trimEnd();
  if (!base.includes("[RFR — deliberação com base factual restrita")) {
    entrada.mensagem = `${base}\n\n${BLOCO_RFR}`;
  }
  return entrada;
}
