/**
 * LFC — persistência FS (IMP-092.1 / ARQ-092).
 * Desacoplada de HFC, MO e CSC.
 */

import fs from "node:fs";
import path from "node:path";
import { ESTADO_LASTRO, texto } from "./dominio.js";

export const REL_DIR_LFC = path.join("executive", "lastro-factual-casos");
export const FICHEIRO_INDICE = "_indice.json";

/**
 * @param {string} rootDir
 */
export function caminhoStoreLfc(rootDir) {
  return path.join(rootDir, REL_DIR_LFC);
}

/**
 * @param {string} dirStore
 * @param {string} coaId
 */
export function caminhoCoa(dirStore, coaId) {
  const id = texto(coaId);
  if (!id) throw new Error("LFC: coaId ausente no caminho.");
  // Sanitiza segmentos de path
  const safe = id.replace(/[^a-zA-Z0-9.__-]+/g, "_").slice(0, 120);
  return path.join(dirStore, safe);
}

/**
 * @param {string} dirStore
 * @param {string} coaId
 * @param {string} casoId
 */
export function caminhoDocumento(dirStore, coaId, casoId) {
  const c = texto(casoId).replace(/[^a-zA-Z0-9._-]+/g, "").slice(0, 80);
  if (!c) throw new Error("LFC: casoId inválido.");
  return path.join(caminhoCoa(dirStore, coaId), `${c}.json`);
}

/**
 * @param {string} dirStore
 * @param {string} coaId
 */
export function caminhoIndice(dirStore, coaId) {
  return path.join(caminhoCoa(dirStore, coaId), FICHEIRO_INDICE);
}

/**
 * @param {string} dirStore
 * @param {string} coaId
 */
export function garantirCoa(dirStore, coaId) {
  fs.mkdirSync(caminhoCoa(dirStore, coaId), { recursive: true });
}

/**
 * @param {string} dirStore
 * @param {string} coaId
 * @returns {{ casoActivoId: string|null, casos: object[] }}
 */
export function lerIndice(dirStore, coaId) {
  const p = caminhoIndice(dirStore, coaId);
  if (!fs.existsSync(p)) {
    return { casoActivoId: null, casos: [] };
  }
  const raw = fs.readFileSync(p, "utf8");
  const obj = JSON.parse(raw);
  return {
    casoActivoId: obj.casoActivoId == null ? null : String(obj.casoActivoId),
    casos: Array.isArray(obj.casos) ? obj.casos : []
  };
}

/**
 * @param {string} dirStore
 * @param {string} coaId
 * @param {{ casoActivoId: string|null, casos: object[] }} indice
 */
export function escreverIndice(dirStore, coaId, indice) {
  garantirCoa(dirStore, coaId);
  const p = caminhoIndice(dirStore, coaId);
  fs.writeFileSync(
    p,
    `${JSON.stringify(
      {
        casoActivoId: indice.casoActivoId ?? null,
        casos: Array.isArray(indice.casos) ? indice.casos : []
      },
      null,
      2
    )}\n`,
    "utf8"
  );
}

/**
 * @param {string} dirStore
 * @param {string} coaId
 * @param {string} casoId
 * @returns {object|null}
 */
export function lerDocumento(dirStore, coaId, casoId) {
  const p = caminhoDocumento(dirStore, coaId, casoId);
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

/**
 * @param {string} dirStore
 * @param {object} doc
 */
export function escreverDocumento(dirStore, doc) {
  const coaId = texto(doc.coaId);
  const casoId = texto(doc.casoId);
  garantirCoa(dirStore, coaId);
  const p = caminhoDocumento(dirStore, coaId, casoId);
  fs.writeFileSync(p, `${JSON.stringify(doc, null, 2)}\n`, "utf8");
}

/**
 * Hard delete físico (só operação governada).
 * @param {string} dirStore
 * @param {string} coaId
 * @param {string} casoId
 */
export function apagarDocumentoFisico(dirStore, coaId, casoId) {
  const p = caminhoDocumento(dirStore, coaId, casoId);
  if (fs.existsSync(p)) fs.unlinkSync(p);
}

/**
 * @param {object} doc
 */
export function metaDeDocumento(doc) {
  return {
    casoId: doc.casoId,
    titulo: doc.titulo || "",
    estadoLastro: doc.estadoLastro || ESTADO_LASTRO.ACTIVO,
    actualizadoEm: doc.actualizadoEm,
    versao: doc.versao
  };
}
