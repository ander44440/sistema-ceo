/**
 * Fatia 2 — política única de fio conversacional do mesmo COA.
 * Fonte: transcript/store (enviarAoNucleo), nunca o historicoRecente da VCA.
 * Classificador e MRE consomem a mesma janela.
 */

import { normalizarPapelHistorico } from "./historicoRecente.js";
import { normalizarTexto } from "./lexicon.js";

/** Janela única (substitui 4×200/800 vs 6×160 vs 12 turnos). */
export const JANELA_FIO_MAX_MSGS = 12;
/** Tecto por mensagem sem factos do utilizador. Factos do utilizador não cortam abaixo disto. */
export const CAP_CHARS_MSG_FIO = 800;

/** @type {null | ((coaId: string) => object[])} */
let carregadorFallbackHfc = null;

/**
 * Injecção do fallback HFC (testes / produção). Soft-fail no consumidor.
 * @param {null | ((coaId: string) => object[])} fn
 */
export function definirCarregadorFallbackHfcFio(fn) {
  carregadorFallbackHfc = typeof fn === "function" ? fn : null;
}

export function resetCarregadorFallbackHfcFio() {
  carregadorFallbackHfc = null;
}

/**
 * @param {string} [coaId]
 * @returns {object[]}
 */
export function carregarFallbackHfcDoCoa(coaId) {
  const id = String(coaId || "").trim();
  if (!id || typeof carregadorFallbackHfc !== "function") return [];
  try {
    const r = carregadorFallbackHfc(id);
    return Array.isArray(r) ? r : [];
  } catch {
    return [];
  }
}

/**
 * Factos do utilizador — só para não truncar a janela (não classifica E4).
 * @param {string} texto
 */
export function mensagemTemFactosUtilizador(texto) {
  const raw = String(texto || "").trim();
  if (!raw) return false;
  if (raw.length >= CAP_CHARS_MSG_FIO) return true;
  const t = normalizarTexto(raw);
  if (/\d+\s*%/.test(t)) return true;
  if (/r\$\s*\d/.test(t)) return true;
  return (
    /\b(fornecedor(es)?|preco|reajuste|volume|margem|cliente(s)?|faturamento|facturacao|materia-?primas?|contrato(s)?|dilema|trade-?off)\b/.test(
      t
    ) || /\b(proposta|manifesto)\b/.test(t)
  );
}

/**
 * Deixis / juízo de continuidade que PODE herdar lastro B do fio.
 * Não inclui pedido operacional nu («próxima decisão que recomenda»).
 * @param {string} [texto]
 */
export function ehDeixisContinuidadeNegocio(texto) {
  const t = normalizarTexto(texto);
  if (!t) return false;
  if (/^(e\s+)?agora\s*\??$/.test(t)) return true;
  if (/\be\s+agora\b/.test(t)) return true;
  if (/\bqual\s+caminho\b/.test(t)) return true;
  if (/\bo\s+que\s+fazemos\s+com\s+(isso|isto|aquilo)\b/.test(t)) return true;
  if (/\bo\s+que\s+fazemos\s+agora\b/.test(t)) return true;
  if (
    /\bqual\s+(deve|seria|deveria)\s+(ser\s+)?(a\s+|nossa\s+)?(pr[oó]xima\s+)?prioridade\b/.test(
      t
    )
  ) {
    return !/\brecomenda/.test(t);
  }
  return false;
}

/**
 * @param {unknown} valor
 * @returns {string}
 */
function coaIdDe(valor) {
  if (valor == null) return "";
  return String(valor).trim();
}

/**
 * Isolamento estrito: descarta mensagens de outro COA.
 * Mensagem sem coaId trata-se como já scoped (bucket do store).
 * @param {ReadonlyArray<object>} mensagens
 * @param {string} [coaId]
 */
export function filtrarFioPorCoaId(mensagens, coaId) {
  if (!Array.isArray(mensagens)) return [];
  const esperado = coaIdDe(coaId);
  return mensagens.filter((m) => {
    if (!m) return false;
    const id = coaIdDe(m.coaId);
    if (!esperado || !id) return true;
    return id === esperado;
  });
}

/**
 * @param {ReadonlyArray<object>} lista
 * @param {string} mensagemActual
 */
function excluirMensagemActual(lista, mensagemActual) {
  const actual = String(mensagemActual || "")
    .replace(/\s+/g, " ")
    .trim();
  if (!actual || !lista.length) return lista;
  const ultima = lista[lista.length - 1];
  const papelUlt = normalizarPapelHistorico(ultima.papel);
  const textoUlt = String(ultima.texto || "")
    .replace(/\s+/g, " ")
    .trim();
  if (papelUlt === "usuario" && textoUlt === actual) {
    return lista.slice(0, -1);
  }
  return lista;
}

/**
 * @param {string} texto
 * @param {"usuario"|"ceo"} papel
 */
function aplicarTectoMensagem(texto, papel) {
  const raw = String(texto || "").replace(/\s+/g, " ").trim();
  if (!raw) return "";
  if (papel === "usuario" && mensagemTemFactosUtilizador(raw)) {
    return raw;
  }
  if (raw.length <= CAP_CHARS_MSG_FIO) return raw;
  return raw.slice(0, CAP_CHARS_MSG_FIO);
}

/**
 * Janela única do fio do mesmo COA.
 * Turno actual excluído (vai integral à parte). Sem caps 200/160.
 *
 * @param {ReadonlyArray<object>|null|undefined} historico
 * @param {string} [mensagemActual]
 * @param {{ coaId?: string|null }} [opts]
 * @returns {{ papel: "usuario"|"ceo", texto: string, coaId?: string }[]}
 */
export function seleccionarFioCoa(historico, mensagemActual = "", opts = {}) {
  if (!Array.isArray(historico) || historico.length === 0) return [];
  const coaId = coaIdDe(opts.coaId);
  let lista = historico.filter((m) => m && String(m.texto || "").trim());
  lista = filtrarFioPorCoaId(lista, coaId);
  lista = excluirMensagemActual(lista, mensagemActual);

  const janela = lista.slice(-JANELA_FIO_MAX_MSGS);
  /** @type {{ papel: "usuario"|"ceo", texto: string, coaId?: string }[]} */
  const itens = [];
  for (const m of janela) {
    const papel = normalizarPapelHistorico(m.papel);
    if (!papel) continue;
    const texto = aplicarTectoMensagem(m.texto, papel);
    if (!texto) continue;
    const item = { papel, texto };
    const id = coaIdDe(m.coaId);
    if (id) item.coaId = id;
    itens.push(item);
  }
  return itens;
}

/**
 * Transcript do store; se vazio, fallback HFC do mesmo coaId.
 * Não mistura COAs.
 *
 * @param {{
 *   transcript?: object[],
 *   mensagemActual?: string,
 *   coaId?: string|null,
 *   fallbackHfc?: object[]
 * }} entrada
 */
export function obterFioTranscriptCoa(entrada = {}) {
  const coaId = coaIdDe(entrada.coaId);
  const transcript = Array.isArray(entrada.transcript) ? entrada.transcript : [];
  const doStore = filtrarFioPorCoaId(transcript, coaId);
  const prior = excluirMensagemActual(doStore, entrada.mensagemActual || "");
  if (prior.length > 0) {
    return doStore;
  }
  const hfcBruto = Array.isArray(entrada.fallbackHfc)
    ? entrada.fallbackHfc
    : carregarFallbackHfcDoCoa(coaId);
  return filtrarFioPorCoaId(hfcBruto, coaId);
}

/**
 * Destino / MRE: o fio deliberativo sobrevive a autorizaLastroCsc=false.
 * @param {{ autorizaLastroCsc?: boolean, historicoDeliberativo?: object[] }} entrada
 */
export function historicoDeliberativoParaDestino(entrada = {}) {
  void entrada.autorizaLastroCsc;
  return Array.isArray(entrada.historicoDeliberativo)
    ? entrada.historicoDeliberativo
    : [];
}
