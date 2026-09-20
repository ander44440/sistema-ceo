/**
 * Consulta tipada a um campo nos factos activos do LFC (MVP / VAL-093).
 * Evita o LLM devolver outro facto activo quando o campo pedido não existe.
 */

import { normalizarTexto } from "../classificadorIntencao/lexicon.js";

/** @typedef {"codigo_secreto"|"orcamento"|"fornecedor"|"setor"|"nome_empresa"} ChaveCampoLfc */

/**
 * @param {string} [instrucao]
 * @returns {ChaveCampoLfc|null}
 */
export function extrairChaveConsultaCampoLfc(instrucao) {
  const t = normalizarTexto(instrucao);
  if (!t) return null;

  const ambitoLfc =
    /\blfc\b/.test(t) ||
    (/\b(fatos?|factos?)\b/.test(t) &&
      /\b(activ|ativ|regist|registr|lastro)\b/.test(t));

  if (/\bcodigo\s+secreto\b/.test(t)) return "codigo_secreto";
  if (ambitoLfc && /\borcamento\b/.test(t)) return "orcamento";
  if (ambitoLfc && /\bfornecedor\b/.test(t)) return "fornecedor";
  if (/\bqual\s+[eé]\s+o\s+setor\b/.test(t) || (ambitoLfc && /\bsetor\b/.test(t))) {
    return "setor";
  }
  if (/\bqual\s+([eé]\s+)?o\s+nome\s+da\s+empresa\b/.test(t)) {
    return "nome_empresa";
  }
  return null;
}

/**
 * Pedido de um único valor a partir do LFC (ex.: T1 VAL-093).
 * @param {string} [instrucao]
 */
export function ehConsultaCampoUnicoLfc(instrucao) {
  const t = normalizarTexto(instrucao);
  if (!t) return false;
  const chave = extrairChaveConsultaCampoLfc(instrucao);
  if (!chave) return false;

  const ambitoLfc =
    /\blfc\b/.test(t) ||
    (/\b(fatos?|factos?)\b/.test(t) &&
      /\b(activ|ativ|regist|registr|lastro)\b/.test(t));

  if (!ambitoLfc && chave !== "setor" && chave !== "nome_empresa") {
    return false;
  }

  return (
    /\bqual\s+[eé]\b/.test(t) ||
    /\bresponda\s+(somente|so|apenas)\b/.test(t) ||
    /\bresponder\s+(somente|so|apenas)\b/.test(t) ||
    /\bsomente\s+com\s+o\s+valor\b/.test(t) ||
    /\bapenas\s+com\s+(o\s+)?(fato|facto|valor)\b/.test(t)
  );
}

/**
 * @param {string} textoFacto
 * @param {ChaveCampoLfc} chave
 */
function factoCorrespondeChave(textoFacto, chave) {
  const raw = String(textoFacto || "");
  const n = normalizarTexto(raw);
  if (!n) return false;

  switch (chave) {
    case "codigo_secreto":
      return (
        /\bcodigo\s+secreto\b/.test(n) ||
        /\b[a-z]+-token-[a-z0-9]+\b/i.test(raw) ||
        /\bsecret\b/.test(n)
      );
    case "orcamento":
      return /\borcamento\b/.test(n) || /r\$\s*[\d.,]+/i.test(raw);
    case "fornecedor":
      return /\bfornecedor\b/.test(n);
    case "setor":
      return (
        /\bsetor\b/.test(n) ||
        /\blogistica\b/.test(n) ||
        /\bservicos?\b/.test(n)
      );
    case "nome_empresa":
      return /\bempresa\b/.test(n) || /\bvale\s*verde\b/.test(n);
    default:
      return false;
  }
}

/**
 * Extrai o valor legível a devolver (sem prefixo B1/B2 quando possível).
 * @param {string} textoFacto
 * @param {ChaveCampoLfc} chave
 */
function extrairValorDoFacto(textoFacto, chave) {
  const raw = String(textoFacto || "").trim();
  if (!raw) return raw;

  if (chave === "codigo_secreto") {
    const token = raw.match(/\b([A-Za-z]+-TOKEN-[A-Za-z0-9]+)\b/);
    if (token) return token[1];
    const apos = raw.match(/c[oó]digo\s+secreto\s*[:\-]?\s*(.+)$/i);
    if (apos) return apos[1].trim();
  }
  if (chave === "orcamento") {
    const rs = raw.match(/r\$\s*[\d.,]+/i);
    if (rs) return rs[0].replace(/\s+/g, " ").trim();
  }
  if (chave === "fornecedor") {
    const m = raw.match(/fornecedor(?:\s+exclusivo)?\s*[:\-]?\s*(.+)$/i);
    if (m) return m[1].trim();
  }
  if (chave === "setor") {
    const n = normalizarTexto(raw);
    if (/\blogistica\b/.test(n)) return "Logística";
    if (/\bservicos?\b/.test(n)) return "Serviços";
  }
  if (chave === "nome_empresa") {
    if (/\bvale\s*verde\b/i.test(raw)) return "ValeVerde";
  }

  // Remove prefixos de ensaio «B1 », «A2 » etc.
  return raw.replace(/^[A-Z]\d+\s+/i, "").trim() || raw;
}

/**
 * @param {Array<{ texto?: string }|string>} factos
 * @param {ChaveCampoLfc|null} chave
 * @param {string} [instrucao]
 * @returns {string}
 */
export function responderCampoNosFactosLfc(factos, chave, instrucao = "") {
  const chaveFinal = chave || extrairChaveConsultaCampoLfc(instrucao);
  const lista = (Array.isArray(factos) ? factos : [])
    .map((f) => (typeof f === "string" ? f : String(f?.texto || "")))
    .map((t) => t.trim())
    .filter(Boolean);

  if (!chaveFinal) {
    return "Não identifiquei o facto pedido nos factos activos do LFC.";
  }

  const hits = lista.filter((t) => factoCorrespondeChave(t, chaveFinal));
  if (!hits.length) {
    const rotulos = {
      codigo_secreto: "código secreto",
      orcamento: "orçamento",
      fornecedor: "fornecedor",
      setor: "setor",
      nome_empresa: "nome da empresa"
    };
    const rotulo = rotulos[chaveFinal] || "facto pedido";
    return `Não tenho o ${rotulo} registado nos factos activos do LFC.`;
  }

  const valor = extrairValorDoFacto(hits[0], chaveFinal);
  return valor.endsWith(".") ? valor : `${valor}`;
}

/**
 * Se a prosa LLM não respeitar o campo pedido nos factos LFC, substitui.
 * @param {{
 *   resposta?: string,
 *   instrucao?: string,
 *   factos?: Array<{ texto?: string }|string>
 * }} entrada
 * @returns {{ mensagem: string, aplicada: boolean, motivo: string }}
 */
export function corrigirRespostaConsultaCampoLfc(entrada = {}) {
  const instrucao = String(entrada.instrucao || "");
  if (!ehConsultaCampoUnicoLfc(instrucao)) {
    return {
      mensagem: String(entrada.resposta || ""),
      aplicada: false,
      motivo: "nao_consulta_campo_lfc"
    };
  }

  const chave = extrairChaveConsultaCampoLfc(instrucao);
  const canonica = responderCampoNosFactosLfc(
    entrada.factos || [],
    chave,
    instrucao
  );
  const actual = String(entrada.resposta || "").trim();
  if (!actual) {
    return { mensagem: canonica, aplicada: true, motivo: "resposta_vazia" };
  }

  const nActual = normalizarTexto(actual);
  const nCanon = normalizarTexto(canonica);

  // Já é a resposta canónica ou contém o valor exacto.
  if (nActual === nCanon) {
    return { mensagem: actual, aplicada: false, motivo: "ja_canonica" };
  }
  if (
    !/^nao tenho o /i.test(canonica) &&
    nCanon &&
    nActual.includes(nCanon.replace(/\.$/, ""))
  ) {
    return { mensagem: actual, aplicada: false, motivo: "contem_valor" };
  }

  // Declaração explícita de ausência já correcta.
  if (
    /^nao tenho o /i.test(canonica) &&
    (/nao tenho/i.test(actual) ||
      /nao (ha|há|existe)/i.test(actual) ||
      /ausente/i.test(actual) ||
      /nao (possuo|encontrei|localizei)/i.test(actual))
  ) {
    return { mensagem: actual, aplicada: false, motivo: "ausencia_ok" };
  }

  return {
    mensagem: canonica,
    aplicada: true,
    motivo: "fidelidade_campo_lfc"
  };
}
