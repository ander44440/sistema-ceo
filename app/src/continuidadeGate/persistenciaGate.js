/**
 * Persistência local do Gate pendente (F5-C1).
 * Só registos com estado `pendente` — resolvidos não sobrevivem ao refresh.
 * Compatível com o padrão do gabinete (localStorage + fallback memória em Node/testes).
 */

export const STORAGE_KEY_GATE = "ceo.continuidade.gate.v1";
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
      const probe = "__ceo_gate_probe__";
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
 * @typedef {object} DocumentoGatePersistido
 * @property {number} versao
 * @property {object[]} pendentes — RegistoContextoGate serializáveis
 */

/**
 * @returns {DocumentoGatePersistido | null}
 */
export function carregarDocumentoGate() {
  const s = obterStorage();
  try {
    const raw = s
      ? s.getItem(STORAGE_KEY_GATE)
      : memoria.get(STORAGE_KEY_GATE) || null;
    if (!raw) return null;
    const doc = JSON.parse(raw);
    if (!doc || doc.versao !== VERSAO || !Array.isArray(doc.pendentes)) {
      return null;
    }
    return doc;
  } catch {
    return null;
  }
}

/**
 * Grava apenas Gates ainda pendentes.
 * @param {object[]} pendentes
 * @returns {{ ok: boolean, medium: "localStorage"|"memoria" }}
 */
export function gravarDocumentoGate(pendentes) {
  const lista = Array.isArray(pendentes) ? pendentes : [];
  const doc = {
    versao: VERSAO,
    pendentes: lista.map((r) => JSON.parse(JSON.stringify(r)))
  };
  const raw = JSON.stringify(doc);
  const s = obterStorage();
  if (s) {
    s.setItem(STORAGE_KEY_GATE, raw);
    return { ok: true, medium: "localStorage" };
  }
  memoria.set(STORAGE_KEY_GATE, raw);
  return { ok: true, medium: "memoria" };
}

/**
 * Remove o documento persistido (Gate resolvido / limpeza de sessão).
 */
export function limparDocumentoGate() {
  const s = obterStorage();
  if (s) {
    try {
      s.removeItem(STORAGE_KEY_GATE);
    } catch {
      /* no-op */
    }
  }
  memoria.delete(STORAGE_KEY_GATE);
}

/**
 * Extrai registos pendentes válidos do documento.
 * @returns {object[]}
 */
export function carregarRegistosGatePendentes() {
  const doc = carregarDocumentoGate();
  if (!doc) return [];
  return doc.pendentes.filter(
    (r) =>
      r &&
      r.gate &&
      typeof r.gate === "object" &&
      r.gate.estado === "pendente" &&
      typeof r.gate.gateId === "string" &&
      typeof r.gate.parecerId === "string"
  );
}
