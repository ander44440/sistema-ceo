/**
 * Heartbeat do Dispatcher — IMP-055 E6.
 * Ficheiro: executive/dispatcher/logs/heartbeat.json
 * POST /api/ceo/orquestracao/heartbeat (só escrita de sinal).
 */

import fs from "node:fs";
import path from "node:path";
import {
  HEARTBEAT_TTL_MS,
  heartbeatFresco
} from "./mapeadores.js";

export const PATH_HEARTBEAT = "/api/ceo/orquestracao/heartbeat";
export { HEARTBEAT_TTL_MS };

/**
 * @param {string} repoRoot
 */
export function caminhoHeartbeat(repoRoot) {
  return path.join(
    repoRoot,
    "executive",
    "dispatcher",
    "logs",
    "heartbeat.json"
  );
}

/**
 * @param {string} repoRoot
 * @returns {object | null}
 */
export function lerHeartbeat(repoRoot) {
  const p = caminhoHeartbeat(repoRoot);
  try {
    if (!fs.existsSync(p)) return null;
    const raw = JSON.parse(fs.readFileSync(p, "utf8"));
    if (!raw || typeof raw !== "object") return null;
    return raw;
  } catch {
    return null;
  }
}

/**
 * @param {string} repoRoot
 * @param {{
 *   em?: string,
 *   pid?: number | null,
 *   estado?: string,
 *   origem?: string,
 *   pending?: number
 * }} dados
 */
export function escreverHeartbeat(repoRoot, dados = {}) {
  const p = caminhoHeartbeat(repoRoot);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  const payload = {
    em: dados.em || new Date().toISOString(),
    pid: dados.pid != null ? dados.pid : process.pid,
    estado: dados.estado || "idle",
    origem: dados.origem || "watcher",
    pending: Number(dados.pending || 0)
  };
  fs.writeFileSync(p, JSON.stringify(payload, null, 2) + "\n", "utf8");
  return payload;
}

/**
 * Valida corpo POST (sem efeitos colaterais de controlo remoto).
 * @param {unknown} body
 */
export function validarCorpoHeartbeat(body) {
  if (body == null || typeof body !== "object") {
    return { ok: false, mensagem: "Corpo JSON obrigatório." };
  }
  const b = /** @type {Record<string, unknown>} */ (body);
  if (b.em != null && typeof b.em !== "string") {
    return { ok: false, mensagem: "em deve ser string ISO." };
  }
  if (b.estado != null && typeof b.estado !== "string") {
    return { ok: false, mensagem: "estado deve ser string." };
  }
  if (b.pid != null && typeof b.pid !== "number") {
    return { ok: false, mensagem: "pid deve ser number." };
  }
  if (b.pending != null && typeof b.pending !== "number") {
    return { ok: false, mensagem: "pending deve ser number." };
  }
  return { ok: true };
}

/**
 * @param {string} repoRoot
 * @param {number} [agoraMs]
 * @param {number} [ttlMs]
 */
export function avaliarHeartbeat(repoRoot, agoraMs = Date.now(), ttlMs = HEARTBEAT_TTL_MS) {
  const hb = lerHeartbeat(repoRoot);
  if (!hb) {
    return {
      fresco: false,
      idadeMs: null,
      estadoWatcher: null,
      pending: 0,
      em: null
    };
  }
  const { fresco, idadeMs } = heartbeatFresco(hb.em, agoraMs, ttlMs);
  return {
    fresco,
    idadeMs,
    estadoWatcher: typeof hb.estado === "string" ? hb.estado : "idle",
    pending: Number(hb.pending || 0),
    em: hb.em || null
  };
}
