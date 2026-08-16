/**
 * Cliente SPA — carrega a vista C3 via GET interno (ARQ-033 v1.2).
 * Fail-closed: qualquer falha → []. Sem domínio MEP nem adapter no browser.
 */

import { ceoApiUrl } from "../../ceoApiBase.js";

const CAMPOS = Object.freeze([
  "id",
  "tipoLacunaProduto",
  "enunciadoDesidentificado",
  "maturidade",
]);

/**
 * @param {unknown} item
 * @returns {null | { id: string, tipoLacunaProduto: string, enunciadoDesidentificado: string, maturidade: string }}
 */
function sanear(item) {
  if (!item || typeof item !== "object") return null;
  const o = /** @type {Record<string, unknown>} */ (item);
  const out = {
    id: String(o.id || ""),
    tipoLacunaProduto: String(o.tipoLacunaProduto || ""),
    enunciadoDesidentificado: String(o.enunciadoDesidentificado || ""),
    maturidade: "CONCEBIDO",
  };
  for (const k of Object.keys(o)) {
    if (!CAMPOS.includes(k)) {
      /* campos extra do fio são descartados */
    }
  }
  return out;
}

/**
 * @returns {Promise<Array<{ id: string, tipoLacunaProduto: string, enunciadoDesidentificado: string, maturidade: string }>>}
 */
export async function carregarVistaMepC3() {
  try {
    const r = await fetch(ceoApiUrl("/api/ceo/mep/c3/propostas"), {
      method: "GET",
      headers: { Accept: "application/json" },
    });
    if (!r.ok) return [];
    const data = await r.json();
    const lista = Array.isArray(data)
      ? data
      : Array.isArray(data?.propostas)
        ? data.propostas
        : [];
    return lista.map(sanear).filter(Boolean);
  } catch {
    return [];
  }
}
