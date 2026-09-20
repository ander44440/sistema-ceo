/**
 * Persistência do envelope CSC (tópico/pausas/objectivo) por COA — F5-C4.
 */

export const STORAGE_KEY_ENVELOPE = "ceo.conversa.envelope.v2";
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
      const probe = "__ceo_envelope_probe__";
      s.setItem(probe, "1");
      s.removeItem(probe);
      return s;
    }
  } catch {
    /* private mode */
  }
  return null;
}

const memoria = new Map();

/**
 * @typedef {object} BucketEnvelope
 * @property {{ topicoActivo: object|null, pausas: object[] }} topicos
 * @property {{ objetivoActivo: object|null, objetivoAnterior: object|null }} objectivo
 */

/**
 * @returns {{ versao: number, buckets: Record<string, BucketEnvelope> }}
 */
function documentoVazio() {
  return { versao: VERSAO, buckets: {} };
}

/**
 * @returns {{ versao: number, buckets: Record<string, BucketEnvelope> }}
 */
export function carregarDocumentoEnvelope() {
  const s = obterStorage();
  try {
    const raw = s
      ? s.getItem(STORAGE_KEY_ENVELOPE)
      : memoria.get(STORAGE_KEY_ENVELOPE) || null;
    if (!raw) return documentoVazio();
    const doc = JSON.parse(raw);
    if (!doc || doc.versao !== VERSAO || typeof doc.buckets !== "object") {
      return documentoVazio();
    }
    return { versao: VERSAO, buckets: doc.buckets || {} };
  } catch {
    return documentoVazio();
  }
}

/**
 * @param {{ versao: number, buckets: Record<string, BucketEnvelope> }} doc
 */
export function gravarDocumentoEnvelope(doc) {
  const payload = {
    versao: VERSAO,
    buckets: doc?.buckets && typeof doc.buckets === "object" ? doc.buckets : {}
  };
  const raw = JSON.stringify(payload);
  const s = obterStorage();
  if (s) {
    s.setItem(STORAGE_KEY_ENVELOPE, raw);
    return { ok: true, medium: "localStorage" };
  }
  memoria.set(STORAGE_KEY_ENVELOPE, raw);
  return { ok: true, medium: "memoria" };
}

/**
 * @returns {BucketEnvelope}
 */
export function bucketEnvelopeVazio() {
  return {
    topicos: { topicoActivo: null, pausas: [] },
    objectivo: { objetivoActivo: null, objetivoAnterior: null }
  };
}

/**
 * @param {string} chaveCoa
 * @returns {BucketEnvelope}
 */
export function carregarBucketEnvelope(chaveCoa) {
  const k = String(chaveCoa || "").trim();
  if (!k) return bucketEnvelopeVazio();
  const doc = carregarDocumentoEnvelope();
  const b = doc.buckets[k];
  if (!b || typeof b !== "object") return bucketEnvelopeVazio();
  return {
    topicos: {
      topicoActivo: b.topicos?.topicoActivo
        ? { ...b.topicos.topicoActivo }
        : null,
      pausas: Array.isArray(b.topicos?.pausas)
        ? b.topicos.pausas.map((p) => ({ ...p }))
        : []
    },
    objectivo: {
      objetivoActivo: b.objectivo?.objetivoActivo
        ? { ...b.objectivo.objetivoActivo }
        : null,
      objetivoAnterior: b.objectivo?.objetivoAnterior
        ? { ...b.objectivo.objetivoAnterior }
        : null
    }
  };
}

/**
 * @param {string} chaveCoa
 * @param {BucketEnvelope} bucket
 */
export function gravarBucketEnvelope(chaveCoa, bucket) {
  const k = String(chaveCoa || "").trim();
  if (!k) return;
  const doc = carregarDocumentoEnvelope();
  const vazio =
    !bucket?.topicos?.topicoActivo &&
    !(bucket?.topicos?.pausas && bucket.topicos.pausas.length) &&
    !bucket?.objectivo?.objetivoActivo &&
    !bucket?.objectivo?.objetivoAnterior;
  if (vazio) {
    delete doc.buckets[k];
  } else {
    doc.buckets[k] = JSON.parse(JSON.stringify(bucket));
  }
  gravarDocumentoEnvelope(doc);
}

/**
 * @param {string} chaveCoa
 */
export function limparBucketEnvelope(chaveCoa) {
  gravarBucketEnvelope(chaveCoa, bucketEnvelopeVazio());
}

export function limparDocumentoEnvelope() {
  const s = obterStorage();
  if (s) {
    try {
      s.removeItem(STORAGE_KEY_ENVELOPE);
    } catch {
      /* no-op */
    }
  }
  memoria.delete(STORAGE_KEY_ENVELOPE);
}
