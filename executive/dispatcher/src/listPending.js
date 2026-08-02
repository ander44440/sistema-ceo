/**
 * Lista Jobs pending na fila local (REQ-045).
 * Independente do app server — só lê ficheiros.
 */

import fs from "node:fs";
import path from "node:path";

/**
 * @param {string} queueDir
 * @returns {object[]}
 */
export function listarPendentes(queueDir) {
  if (!fs.existsSync(queueDir)) return [];
  const files = fs
    .readdirSync(queueDir)
    .filter((f) => /^JOB-\d+\.json$/i.test(f))
    .sort();

  const pending = [];
  for (const f of files) {
    try {
      let raw = fs.readFileSync(path.join(queueDir, f), "utf8");
      // PowerShell UTF-8 BOM — mesma fila oficial que o plugin Vite (IMP-060 E3)
      if (raw.charCodeAt(0) === 0xfeff) raw = raw.slice(1);
      const job = JSON.parse(raw);
      if (job && job.estado === "pending") pending.push(job);
    } catch {
      // ficheiro ilegível — ignorar neste ciclo
    }
  }
  return pending;
}
