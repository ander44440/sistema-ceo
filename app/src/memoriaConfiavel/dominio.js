/**
 * Memória Confiável — domínio do Ledger MO Art. 8º (v1).
 * Eixo organização/cliente. Não é transcript, KNW nem MEP.
 */

export const EIXO_ORGANIZACAO = "organizacao";
export const VERSAO_DOCUMENTO = 1;
export const COA_SEM_CONTEXTO = "__sem_coa__";

export const ORIGENS_MO = Object.freeze([
  "manual",
  "nucleo",
  "ad",
  "gate",
  "mre"
]);

export const TIPOS_MO = Object.freeze(["decisao"]);

/** Campos Art. 8º + decisão (hash canónico). */
export const CAMPOS_CONTEUDO_HASH = Object.freeze([
  "coaId",
  "decisao",
  "quem",
  "quando",
  "porque",
  "baseadoEm",
  "resultado"
]);

export const CHAVES_PAYLOAD_PROIBIDAS = Object.freeze([
  "mensagens",
  "mensagem",
  "transcript",
  "transcriptCliente",
  "conversasCliente",
  "itemKnw",
  "itemKnwConteudo",
  "knw",
  "eventosMep",
  "mepCeo"
]);

/**
 * @param {unknown} valor
 * @returns {string}
 */
export function texto(valor) {
  return typeof valor === "string" ? valor.trim() : "";
}

/**
 * @param {unknown} valor
 * @returns {unknown}
 */
export function copiarProfundo(valor) {
  return JSON.parse(JSON.stringify(valor));
}

/**
 * @param {string} coaId
 * @returns {string}
 */
export function sanitizarCoaParaId(coaId) {
  const s = texto(coaId) || COA_SEM_CONTEXTO;
  return s
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "coa";
}

/**
 * Hash canónico portátil (FNV-1a 32-bit + comprimento) — sync, browser+Node.
 * @param {string} entrada
 * @returns {string}
 */
export function hashFnv1aHex(entrada) {
  const str = String(entrada);
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  const u = h >>> 0;
  return `fnv1a32_${u.toString(16).padStart(8, "0")}_${str.length}`;
}

/**
 * @param {{ coaId: string, decisao: string, quem: string, quando: string, porque: string, baseadoEm: string, resultado: string }} campos
 * @returns {string}
 */
export function calcularConteudoHash(campos) {
  const partes = CAMPOS_CONTEUDO_HASH.map((k) => `${k}=${texto(campos[k])}`);
  return hashFnv1aHex(partes.join("\n"));
}

/**
 * @param {string} coaId
 * @param {string} quando
 * @param {number} seq
 * @returns {string}
 */
export function gerarIdRegistroMo(coaId, quando, seq) {
  const coa = sanitizarCoaParaId(coaId);
  const ts = texto(quando).replace(/[^0-9T]/g, "").slice(0, 20) || "ts";
  const n = Number.isFinite(seq) && seq > 0 ? seq : 1;
  return `mo-${coa}-${ts}-${n}`;
}

/**
 * @returns {{ versao: number, eixo: string, actualizadoEm: string|null, registos: object[] }}
 */
export function documentoVazioMo() {
  return {
    versao: VERSAO_DOCUMENTO,
    eixo: EIXO_ORGANIZACAO,
    actualizadoEm: null,
    registos: []
  };
}

/**
 * @param {object} entrada
 * @returns {{ ok: true } | { ok: false, motivos: string[] }}
 */
export function validarEntradaRegistroMo(entrada) {
  /** @type {string[]} */
  const motivos = [];
  if (!entrada || typeof entrada !== "object") {
    return { ok: false, motivos: ["entrada_invalida"] };
  }

  for (const chave of CHAVES_PAYLOAD_PROIBIDAS) {
    if (
      Object.prototype.hasOwnProperty.call(entrada, chave) &&
      entrada[chave] != null
    ) {
      motivos.push(`chave_proibida:${chave}`);
    }
  }

  const coaId = texto(entrada.coaId);
  if (!coaId) motivos.push("coaId_ausente");

  if (!texto(entrada.decisao)) motivos.push("decisao_ausente");
  if (!texto(entrada.quem)) motivos.push("quem_ausente");
  if (!texto(entrada.quando)) motivos.push("quando_ausente");
  if (!texto(entrada.porque)) motivos.push("porque_ausente");
  if (!texto(entrada.baseadoEm)) motivos.push("baseadoEm_ausente");
  if (!texto(entrada.resultado)) motivos.push("resultado_ausente");

  const origem = texto(entrada.origem) || "manual";
  if (!ORIGENS_MO.includes(origem)) motivos.push("origem_invalida");

  const tipo = texto(entrada.tipo) || "decisao";
  if (!TIPOS_MO.includes(tipo)) motivos.push("tipo_invalido");

  if (motivos.length) return { ok: false, motivos };
  return { ok: true };
}

/**
 * @param {object} entrada — já validada
 * @param {{ id: string, conteudoHash: string, criadoEm?: string }} meta
 * @returns {object}
 */
export function normalizarRegistroMo(entrada, meta) {
  const quando = texto(entrada.quando);
  const registo = {
    id: texto(meta.id),
    coaId: texto(entrada.coaId),
    decisao: texto(entrada.decisao),
    quem: texto(entrada.quem),
    quando,
    porque: texto(entrada.porque),
    baseadoEm: texto(entrada.baseadoEm),
    resultado: texto(entrada.resultado),
    origem: texto(entrada.origem) || "manual",
    tipo: texto(entrada.tipo) || "decisao",
    criadoEm: texto(meta.criadoEm) || quando,
    conteudoHash: texto(meta.conteudoHash)
  };
  return Object.freeze(registo);
}

/**
 * Valida documento persistido v1.
 * @param {unknown} doc
 * @returns {{ ok: true, doc: object } | { ok: false, motivo: string }}
 */
export function validarDocumentoMo(doc) {
  if (!doc || typeof doc !== "object") {
    return { ok: false, motivo: "documento_invalido" };
  }
  if (doc.versao !== VERSAO_DOCUMENTO) {
    return { ok: false, motivo: "versao_ilegivel" };
  }
  if (doc.eixo !== EIXO_ORGANIZACAO) {
    return { ok: false, motivo: "eixo_invalido" };
  }
  if (!Array.isArray(doc.registos)) {
    return { ok: false, motivo: "registos_ausentes" };
  }
  if (
    doc.actualizadoEm != null &&
    typeof doc.actualizadoEm !== "string"
  ) {
    return { ok: false, motivo: "actualizadoEm_invalido" };
  }
  return { ok: true, doc };
}
