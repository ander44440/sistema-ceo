/**
 * Persistência do Ledger MO — localStorage + read-after-write.
 * Chave: ceo.memoriaConfiavel.mo.v1
 */

import {
  VERSAO_DOCUMENTO,
  documentoVazioMo,
  validarDocumentoMo
} from "./dominio.js";

export const STORAGE_KEY_MO = "ceo.memoriaConfiavel.mo.v1";

/**
 * Erro de persistência do ledger MO — o chamador NÃO deve tratar como sucesso.
 */
export class ErroPersistenciaMo extends Error {
  /**
   * @param {string} message
   * @param {unknown} [cause]
   * @param {string} [codigo]
   */
  constructor(message, cause, codigo) {
    super(message);
    this.name = "ErroPersistenciaMo";
    if (cause !== undefined) {
      /** @type {unknown} */
      this.cause = cause;
    }
    if (codigo) {
      /** @type {string} */
      this.codigo = codigo;
    }
  }
}

/**
 * @returns {Storage | null}
 */
function obterStorage() {
  try {
    const s = globalThis.localStorage;
    if (
      s &&
      typeof s.getItem === "function" &&
      typeof s.setItem === "function"
    ) {
      const probe = "__ceo_mo_probe__";
      s.setItem(probe, "1");
      s.removeItem(probe);
      return s;
    }
  } catch {
    /* private mode / sandbox */
  }
  return null;
}

/** Fallback quando localStorage está ausente (testes Node). */
const memoria = new Map();

/**
 * @returns {"localStorage"|"memoria"|"none"}
 */
export function mediumPersistenciaMo() {
  if (obterStorage()) return "localStorage";
  return memoria.has(STORAGE_KEY_MO) ? "memoria" : "none";
}

/**
 * Lê o documento. Fail-closed: corrupto NÃO apaga a chave.
 * @returns {{
 *   status: "ausente"|"ok"|"corrupto",
 *   doc: object|null,
 *   medium: "localStorage"|"memoria"|"none",
 *   motivo?: string
 * }}
 */
export function carregarDocumentoMo() {
  const s = obterStorage();
  const medium = s ? "localStorage" : memoria.has(STORAGE_KEY_MO) ? "memoria" : "none";
  let raw;
  try {
    raw = s ? s.getItem(STORAGE_KEY_MO) : memoria.get(STORAGE_KEY_MO) || null;
  } catch (err) {
    return {
      status: "corrupto",
      doc: null,
      medium,
      motivo: "leitura_falhou"
    };
  }

  if (raw == null || raw === "") {
    return { status: "ausente", doc: null, medium };
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return {
      status: "corrupto",
      doc: null,
      medium,
      motivo: "json_invalido"
    };
  }

  const v = validarDocumentoMo(parsed);
  if (!v.ok) {
    return {
      status: "corrupto",
      doc: null,
      medium,
      motivo: v.motivo
    };
  }

  return {
    status: "ok",
    doc: {
      versao: VERSAO_DOCUMENTO,
      eixo: v.doc.eixo,
      actualizadoEm: v.doc.actualizadoEm ?? null,
      registos: Array.isArray(v.doc.registos) ? v.doc.registos : []
    },
    medium
  };
}

/**
 * Grava com confirmação read-after-write.
 * @param {object} doc
 * @returns {{ ok: true, medium: "localStorage"|"memoria" }}
 * @throws {ErroPersistenciaMo}
 */
export function gravarDocumentoMo(doc) {
  const v = validarDocumentoMo(doc);
  if (!v.ok) {
    throw new ErroPersistenciaMo(
      `Documento MO inválido para gravação: ${v.motivo}`,
      undefined,
      v.motivo
    );
  }

  const payload = JSON.stringify({
    versao: VERSAO_DOCUMENTO,
    eixo: v.doc.eixo,
    actualizadoEm: v.doc.actualizadoEm ?? null,
    registos: v.doc.registos
  });

  const s = obterStorage();
  if (s) {
    try {
      s.setItem(STORAGE_KEY_MO, payload);
    } catch (err) {
      throw new ErroPersistenciaMo(
        "Falha ao gravar o ledger MO no localStorage.",
        err,
        "gravacao_falhou"
      );
    }
    let lido;
    try {
      lido = s.getItem(STORAGE_KEY_MO);
    } catch (err) {
      throw new ErroPersistenciaMo(
        "Falha ao confirmar o ledger MO (read-after-write).",
        err,
        "raw_falhou"
      );
    }
    if (lido !== payload) {
      throw new ErroPersistenciaMo(
        "Read-after-write: documento MO persistido não corresponde ao gravado.",
        undefined,
        "raw_mismatch"
      );
    }
    return { ok: true, medium: "localStorage" };
  }

  memoria.set(STORAGE_KEY_MO, payload);
  if (memoria.get(STORAGE_KEY_MO) !== payload) {
    throw new ErroPersistenciaMo(
      "Falha ao gravar o ledger MO no fallback em memória.",
      undefined,
      "memoria_falhou"
    );
  }
  return { ok: true, medium: "memoria" };
}

/**
 * Remove a chave (apenas testes / limpeza explícita).
 */
export function limparDocumentoMo() {
  const s = obterStorage();
  if (s) {
    try {
      s.removeItem(STORAGE_KEY_MO);
    } catch {
      /* no-op */
    }
  }
  memoria.delete(STORAGE_KEY_MO);
}

/**
 * @returns {object}
 */
export function criarDocumentoVazioPersistivel() {
  return documentoVazioMo();
}
