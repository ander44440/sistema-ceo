/**
 * Trilha Auditável V1 — persistência JSONL append-only (store separado).
 * Não partilha store com MEP, fila de Jobs, MO ou transcript.
 */

import fs from "node:fs";
import path from "node:path";

export const FICHEIRO_EVENTOS = "eventos.jsonl";
export const REL_DIR_AUDIT = path.join("executive", "audit");

/**
 * @param {string} rootDir
 * @returns {string}
 */
export function caminhoStoreAudit(rootDir) {
  return path.join(rootDir, REL_DIR_AUDIT);
}

/**
 * @param {string} dirStore
 * @returns {string}
 */
export function caminhoEventos(dirStore) {
  return path.join(dirStore, FICHEIRO_EVENTOS);
}

/**
 * @param {string} dirStore
 */
export function garantirStore(dirStore) {
  fs.mkdirSync(dirStore, { recursive: true });
}

/**
 * @param {string} dirStore
 * @returns {object[]}
 */
export function carregarEventos(dirStore) {
  const p = caminhoEventos(dirStore);
  if (!fs.existsSync(p)) return [];
  let raw = fs.readFileSync(p, "utf8");
  if (raw.charCodeAt(0) === 0xfeff) raw = raw.slice(1);
  const eventos = [];
  for (const linha of raw.split(/\r?\n/)) {
    const t = linha.trim();
    if (!t) continue;
    try {
      const obj = JSON.parse(t);
      if (obj && typeof obj === "object") eventos.push(obj);
    } catch {
      throw new Error(`Trilha Auditável: linha JSONL inválida em ${p}`);
    }
  }
  return eventos;
}

/**
 * Append de uma linha. Não reescreve o histórico anterior.
 * @param {string} dirStore
 * @param {object} evento
 * @returns {{ ok: true, id: string, medium: string }}
 */
export function appendEventoFisico(dirStore, evento) {
  garantirStore(dirStore);
  const p = caminhoEventos(dirStore);
  const linha = `${JSON.stringify(evento)}\n`;
  fs.appendFileSync(p, linha, "utf8");
  return { ok: true, id: String(evento.id), medium: "filesystem" };
}

export function apagarEventoFisico() {
  return { ok: false, codigo: "historico_append_only" };
}

export function compactarStoreFisico() {
  return { ok: false, codigo: "historico_append_only" };
}
