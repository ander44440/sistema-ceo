/**
 * Persistência local do Gabinete (Onda 01 / ADR-015).
 * Única chave de armazenamento para catálogo, workspace por projeto e estado do gabinete.
 */

const STORAGE_KEY = "ceo.onda01.gabinete.v1";
const VERSAO = 1;

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

/** Fallback em memória se localStorage indisponível (não sobrevive ao fechar). */
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
    if (!doc || doc.versao !== VERSAO || !Array.isArray(doc.projetos)) return null;
    return doc;
  } catch {
    return null;
  }
}

/**
 * @param {object} doc
 */
export function gravarDocumento(doc) {
  const payload = JSON.stringify({ ...doc, versao: VERSAO });
  const s = obterStorage();
  if (s) {
    try {
      s.setItem(STORAGE_KEY, payload);
      return;
    } catch {
      /* quota */
    }
  }
  memoria.set(STORAGE_KEY, payload);
}

export { STORAGE_KEY, VERSAO };
