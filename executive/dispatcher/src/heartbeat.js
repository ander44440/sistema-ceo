/**
 * Escreve heartbeat do watcher — IMP-055 E6 / REQ-053 / IMP-060 E3.
 * Ficheiro local + POST ao backend de sinal (CEO_API_BASE) — NÃO é fila de Jobs.
 */

import fs from "node:fs";
import path from "node:path";

/**
 * @param {string} repoRoot
 * @param {{
 *   estado?: string,
 *   pending?: number,
 *   pid?: number,
 *   apiBase?: string | null,
 *   log?: (msg: string) => void
 * }} [opts]
 */
export async function pulsarHeartbeat(repoRoot, opts = {}) {
  const log = opts.log || (() => {});
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
  if (!base) {
    log(
      "[dispatcher] aviso: CEO_API_BASE vazio — heartbeat só local; Painel remoto mostra Erro/TTL"
    );
    return { ...payload, remoto: false, motivoRemoto: "sem_ceo_api_base" };
  }

  try {
    const resp = await fetch(`${base}/api/ceo/orquestracao/heartbeat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!resp.ok) {
      log(
        `[dispatcher] aviso: heartbeat remoto HTTP ${resp.status} (${base})`
      );
      return { ...payload, remoto: false, motivoRemoto: `http_${resp.status}` };
    }
    return { ...payload, remoto: true };
  } catch (err) {
    log(
      `[dispatcher] aviso: heartbeat remoto falhou — ${err && err.message ? err.message : err}`
    );
    return { ...payload, remoto: false, motivoRemoto: "rede" };
  }
}
