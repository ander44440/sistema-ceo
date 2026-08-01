/**
 * Escreve heartbeat do watcher — IMP-055 E6 / REQ-053.
 * Ficheiro local + opcional POST ao backend (CEO_API_BASE).
 */

import fs from "node:fs";
import path from "node:path";

/**
 * @param {string} repoRoot
 * @param {{
 *   estado?: string,
 *   pending?: number,
 *   pid?: number,
 *   apiBase?: string | null
 * }} [opts]
 */
export async function pulsarHeartbeat(repoRoot, opts = {}) {
  const logsDir = path.join(repoRoot, "executive", "dispatcher", "logs");
  fs.mkdirSync(logsDir, { recursive: true });
  const payload = {
    em: new Date().toISOString(),
    pid: opts.pid != null ? opts.pid : process.pid,
    estado: opts.estado || "idle",
    origem: "watcher",
    pending: Number(opts.pending || 0)
  };
  const ficheiro = path.join(logsDir, "heartbeat.json");
  fs.writeFileSync(ficheiro, JSON.stringify(payload, null, 2) + "\n", "utf8");

  const base = (opts.apiBase || process.env.CEO_API_BASE || "")
    .trim()
    .replace(/\/$/, "");
  if (base) {
    try {
      await fetch(`${base}/api/ceo/orquestracao/heartbeat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    } catch {
      /* PC offline da API — ficheiro local basta para Vite local */
    }
  }
  return payload;
}
