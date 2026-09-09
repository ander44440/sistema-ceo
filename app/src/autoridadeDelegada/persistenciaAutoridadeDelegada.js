/**
 * Persistência mínima da Autoridade Delegada (F5-C6).
 * Snapshot do mandato activo — sem ledger MO / trilha auditável.
 */

export const STORAGE_KEY_AD = "ceo.autoridadeDelegada.v1";
const VERSAO = 1;

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
      const probe = "__ceo_ad_probe__";
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
 * @typedef {object} SnapshotAd
 * @property {number} versao
 * @property {boolean} activo
 * @property {string|null} estado
 * @property {string|null} perimetro
 * @property {string|null} actoOrigem
 * @property {string|null} quandoActivado
 * @property {string|null} expiraEm
 * @property {string|null} competenciaFecho
 */

/**
 * @returns {SnapshotAd | null}
 */
export function carregarSnapshotAd() {
  const s = obterStorage();
  try {
    const raw = s
      ? s.getItem(STORAGE_KEY_AD)
      : memoria.get(STORAGE_KEY_AD) || null;
    if (!raw) return null;
    const doc = JSON.parse(raw);
    if (!doc || doc.versao !== VERSAO || doc.activo !== true) return null;
    if (!doc.perimetro || !doc.quandoActivado) return null;
    return {
      versao: VERSAO,
      activo: true,
      estado: doc.estado || null,
      perimetro: String(doc.perimetro),
      actoOrigem: doc.actoOrigem != null ? String(doc.actoOrigem) : null,
      quandoActivado: String(doc.quandoActivado),
      expiraEm: doc.expiraEm != null ? String(doc.expiraEm) : null,
      competenciaFecho:
        doc.competenciaFecho != null ? String(doc.competenciaFecho) : "ceo"
    };
  } catch {
    return null;
  }
}

/**
 * @param {object} estado — EstadoAutoridadeDelegada activo
 */
export function gravarSnapshotAd(estado) {
  if (!estado || estado.activo !== true) {
    limparSnapshotAd();
    return { ok: true, medium: "limpo" };
  }
  const doc = {
    versao: VERSAO,
    activo: true,
    estado: estado.estado || null,
    perimetro: estado.perimetro,
    actoOrigem: estado.actoOrigem,
    quandoActivado: estado.quandoActivado,
    expiraEm: estado.expiraEm,
    competenciaFecho: estado.competenciaFecho || "ceo"
  };
  const raw = JSON.stringify(doc);
  const s = obterStorage();
  if (s) {
    s.setItem(STORAGE_KEY_AD, raw);
    return { ok: true, medium: "localStorage" };
  }
  memoria.set(STORAGE_KEY_AD, raw);
  return { ok: true, medium: "memoria" };
}

export function limparSnapshotAd() {
  const s = obterStorage();
  if (s) {
    try {
      s.removeItem(STORAGE_KEY_AD);
    } catch {
      /* no-op */
    }
  }
  memoria.delete(STORAGE_KEY_AD);
}
