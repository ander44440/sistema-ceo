/**
 * Histórico Físico das Conversas — persistência JSONL append-only.
 * ARQ-087. Não partilha store com Trilha, MO, MEP ou transcript.
 */

import fs from "node:fs";
import path from "node:path";

export const FICHEIRO_MENSAGENS = "mensagens.jsonl";
export const REL_DIR_HFC = path.join("executive", "historico-conversas");

/**
 * @param {string} rootDir
 * @returns {string}
 */
export function caminhoStoreHfc(rootDir) {
  return path.join(rootDir, REL_DIR_HFC);
}

/**
 * @param {string} dirStore
 * @returns {string}
 */
export function caminhoMensagens(dirStore) {
  return path.join(dirStore, FICHEIRO_MENSAGENS);
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
export function carregarMensagens(dirStore) {
  const p = caminhoMensagens(dirStore);
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
      throw new Error(`HFC: linha JSONL inválida em ${p}`);
    }
  }
  return eventos;
}

/**
 * @param {string} dirStore
 * @param {object} evento
 * @returns {{ ok: true, id: string, medium: string, ordem: number }}
 */
export function appendMensagemFisica(dirStore, evento) {
  garantirStore(dirStore);
  const p = caminhoMensagens(dirStore);
  const linha = `${JSON.stringify(evento)}\n`;
  fs.appendFileSync(p, linha, "utf8");
  return {
    ok: true,
    id: String(evento.id),
    medium: "filesystem",
    ordem: Number(evento.ordem)
  };
}

export function apagarMensagemFisica() {
  return { ok: false, codigo: "historico_append_only" };
}

export function actualizarMensagemFisica() {
  return { ok: false, codigo: "historico_append_only" };
}

export function compactarStoreFisico() {
  return { ok: false, codigo: "historico_append_only" };
}
