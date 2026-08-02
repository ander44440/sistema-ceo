/**
 * Smoke IMP-060 E2 — POST local → executive/queue → cancel.
 * Uso: node scripts/smoke-e2-fila.mjs [baseUrl]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const base = (process.argv[2] || "http://localhost:5188").replace(/\/$/, "");
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const queueDir = path.join(repoRoot, "executive", "queue");

const r = await fetch(`${base}/api/ceo/queue/jobs`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    titulo: "IMP-060 E2 smoke",
    descricao: "Homologacao E2 — fila oficial local",
    origem: "ceo",
    projeto: "CEO",
    tipo: "execucao_tecnica",
    prioridade: "normal"
  })
});
const data = await r.json();
console.log(JSON.stringify(data, null, 2));
if (!data.ok) process.exit(1);

const ficheiro = path.join(queueDir, `${data.job.id}.json`);
console.log(`FILE_EXISTS=${fs.existsSync(ficheiro)}`);
console.log(fs.readFileSync(ficheiro, "utf8"));

const c = await fetch(`${base}/api/ceo/queue/jobs/${data.job.id}`, {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    estado: "cancelled",
    resultado: "IMP-060 E2 smoke — cancelado apos evidencia"
  })
});
const cd = await c.json();
console.log(`CANCELLED=${cd.job?.estado}`);
if (cd.job?.estado !== "cancelled") process.exit(1);
