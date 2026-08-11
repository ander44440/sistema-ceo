/**
 * Persistência local do Gabinete (Onda 01 / ADR-015).
 * Única chave de armazenamento para catálogo, workspace por projeto e estado do gabinete.
 *
 * FASE 1: versao 2 (empresas); lê v1 e v2; grava sempre v2.
 * Correção 5: gravação durable com read-after-write; falha explícita (sem sucesso silencioso).
 */

const STORAGE_KEY = "ceo.onda01.gabinete.v1";
/** Versão actual de escrita. */
const VERSAO = 2;
/** Versões legíveis (migração no catálogo). */
const VERSOES_LEGIVEIS = Object.freeze([1, 2]);

/**
 * Erro de persistência do catálogo oficial — o chamador NÃO deve tratar como sucesso.
 */
export class ErroPersistenciaCatalogo extends Error {
  /**
   * @param {string} message
   * @param {unknown} [cause]
   */
  constructor(message, cause) {
    super(message);
    this.name = "ErroPersistenciaCatalogo";
    if (cause !== undefined) {
      /** @type {unknown} */
      this.cause = cause;
    }
  }
}

function obterStorage() {
  try {
    const s = globalThis.localStorage;
    if (
      s &&
      typeof s.getItem === "function" &&
      typeof s.setItem === "function"
    ) {
      const probe = "__ceo_onda01_probe__";
      s.setItem(probe, "1");
      s.removeItem(probe);
      return s;
    }
  } catch {
    /* private mode / sandbox */
  }
  return null;
}

/**
 * Fallback em memória quando localStorage está ausente (testes Node / sandbox).
 * NÃO é usado como sucesso silencioso quando localStorage existe e falha.
 */
const memoria = new Map();

/**
 * @returns {object | null}
 */
export function carregarDocumento() {
  const s = obterStorage();
  try {
    const raw = s ? s.getItem(STORAGE_KEY) : memoria.get(STORAGE_KEY) || null;
    if (!raw) return null;
    const doc = JSON.parse(raw);
    if (!doc || !Array.isArray(doc.projetos)) return null;
    if (!VERSOES_LEGIVEIS.includes(doc.versao)) return null;
    return doc;
  } catch {
    return null;
  }
}

/**
 * Persiste o documento do gabinete com confirmação read-after-write.
 * @param {object} doc
 * @returns {{ ok: true, medium: "localStorage"|"memoria" }}
 * @throws {ErroPersistenciaCatalogo}
 */
export function gravarDocumento(doc) {
  const payload = JSON.stringify({ ...doc, versao: VERSAO });
  const s = obterStorage();

  if (s) {
    try {
      s.setItem(STORAGE_KEY, payload);
    } catch (err) {
      throw new ErroPersistenciaCatalogo(
        "Falha ao gravar o catálogo no storage oficial (localStorage).",
        err
      );
    }
    let lido;
    try {
      lido = s.getItem(STORAGE_KEY);
    } catch (err) {
      throw new ErroPersistenciaCatalogo(
        "Falha ao confirmar o catálogo após gravação (read-after-write).",
        err
      );
    }
    if (lido !== payload) {
      throw new ErroPersistenciaCatalogo(
        "Read-after-write: documento persistido não corresponde ao gravado."
      );
    }
    return { ok: true, medium: "localStorage" };
  }

  // Sem localStorage: memória é o único medium do ambiente (ex.: testes Node).
  memoria.set(STORAGE_KEY, payload);
  if (memoria.get(STORAGE_KEY) !== payload) {
    throw new ErroPersistenciaCatalogo(
      "Falha ao gravar o catálogo no fallback em memória."
    );
  }
  return { ok: true, medium: "memoria" };
}

/**
 * @returns {"localStorage"|"memoria"|"none"}
 */
export function mediumPersistenciaCatalogo() {
  return obterStorage() ? "localStorage" : memoria.has(STORAGE_KEY) ? "memoria" : "none";
}

export { STORAGE_KEY, VERSAO, VERSOES_LEGIVEIS };
