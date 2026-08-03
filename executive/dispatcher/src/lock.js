/**
 * Lock simples para evitar dois Agents a consumir a mesma fila.
 */

import fs from "node:fs";
import path from "node:path";

const STALE_MS = 2 * 60 * 60 * 1000;

/**
 * @param {string} queueDir
 */
export function caminhoLock(queueDir) {
  return path.join(queueDir, ".dispatcher.lock");
}

/**
 * @param {string} queueDir
 * @returns {{ ativo: boolean, meta?: object }}
 */
export function lerLock(queueDir) {
  const p = caminhoLock(queueDir);
  if (!fs.existsSync(p)) return { ativo: false };
  try {
    const meta = JSON.parse(fs.readFileSync(p, "utf8"));
    const started = Date.parse(meta.startedAt || "") || 0;
    if (started && Date.now() - started > STALE_MS) {
      fs.unlinkSync(p);
      return { ativo: false };
    }
    return { ativo: true, meta };
  } catch {
    try {
      fs.unlinkSync(p);
    } catch {
      /* ignore */
    }
    return { ativo: false };
  }
}

/**
 * @param {string} queueDir
 * @param {object} meta
 */
export function adquirirLock(queueDir, meta) {
  const atual = lerLock(queueDir);
  if (atual.ativo) return false;
  fs.mkdirSync(queueDir, { recursive: true });
  fs.writeFileSync(
    caminhoLock(queueDir),
    JSON.stringify({ ...meta, startedAt: new Date().toISOString() }, null, 2) +
      "\n",
    "utf8"
  );
  return true;
}

/**
 * @param {string} queueDir
 */
export function libertarLock(queueDir) {
  const p = caminhoLock(queueDir);
  if (fs.existsSync(p)) fs.unlinkSync(p);
}
