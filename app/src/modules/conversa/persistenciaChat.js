/**
 * Persistência local do transcript conversacional por COA (F5-C3).
 * Não mistura workspace/gabinete — só buckets de mensagens.
 */

export const STORAGE_KEY_CHAT = "ceo.conversa.transcript.v2";
const VERSAO = 2;

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
      const probe = "__ceo_chat_probe__";
      s.setItem(probe, "1");
      s.removeItem(probe);
      return s;
    }
  } catch {
    /* private mode / sandbox */
  }
  return null;
}

/** Fallback Node/testes sem localStorage. */
const memoria = new Map();

/**
 * @typedef {object} DocumentoChat
 * @property {number} versao
 * @property {Record<string, object[]>} buckets
 */

/**
 * @returns {DocumentoChat}
 */
function documentoVazio() {
  return { versao: VERSAO, buckets: {} };
}

/**
 * @returns {DocumentoChat}
 */
export function carregarDocumentoChat() {
  const s = obterStorage();
  try {
    const raw = s
      ? s.getItem(STORAGE_KEY_CHAT)
      : memoria.get(STORAGE_KEY_CHAT) || null;
    if (!raw) return documentoVazio();
    const doc = JSON.parse(raw);
    if (!doc || doc.versao !== VERSAO || typeof doc.buckets !== "object") {
      return documentoVazio();
    }
    return {
      versao: VERSAO,
      buckets: doc.buckets && typeof doc.buckets === "object" ? doc.buckets : {}
    };
  } catch {
    return documentoVazio();
  }
}

/**
 * @param {DocumentoChat} doc
 */
export function gravarDocumentoChat(doc) {
  const payload = {
    versao: VERSAO,
    buckets:
      doc && doc.buckets && typeof doc.buckets === "object" ? doc.buckets : {}
  };
  const raw = JSON.stringify(payload);
  const s = obterStorage();
  if (s) {
    s.setItem(STORAGE_KEY_CHAT, raw);
    return { ok: true, medium: "localStorage" };
  }
  memoria.set(STORAGE_KEY_CHAT, raw);
  return { ok: true, medium: "memoria" };
}

/**
 * @param {string} chaveCoa
 * @returns {object[]}
 */
export function carregarBucketChat(chaveCoa) {
  const k = String(chaveCoa || "").trim();
  if (!k) return [];
  const doc = carregarDocumentoChat();
  const lista = doc.buckets[k];
  return Array.isArray(lista) ? lista.map((m) => ({ ...m })) : [];
}

/**
 * @param {string} chaveCoa
 * @param {object[]} mensagens
 */
export function gravarBucketChat(chaveCoa, mensagens) {
  const k = String(chaveCoa || "").trim();
  if (!k) return;
  const doc = carregarDocumentoChat();
  const limpas = (Array.isArray(mensagens) ? mensagens : [])
    .filter((m) => m && typeof m === "object" && m.estado !== "pendente")
    .map((m) => ({
      id: String(m.id || ""),
      papel: m.papel,
      texto: String(m.texto || ""),
      criadoEm: String(m.criadoEm || new Date().toISOString()),
      estado: m.estado === "erro" ? "erro" : "pronta"
    }))
    .filter((m) => m.id && m.papel && m.texto != null);
  if (limpas.length === 0) {
    delete doc.buckets[k];
  } else {
    doc.buckets[k] = limpas;
  }
  gravarDocumentoChat(doc);
}

export function limparDocumentoChat() {
  const s = obterStorage();
  if (s) {
    try {
      s.removeItem(STORAGE_KEY_CHAT);
    } catch {
      /* no-op */
    }
  }
  memoria.delete(STORAGE_KEY_CHAT);
}
