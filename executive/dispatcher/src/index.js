/**
 * CLI — Dispatcher local da Fila de Execução (REQ-053).
 *
 * Uso:
 *   node src/index.js [--once] [--dry-run]
 *   npm start | npm run once | npm run dry-run
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ciclo } from "./ciclo.js";
import { listarPendentes } from "./listPending.js";
import { pulsarHeartbeat } from "./heartbeat.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DISPATCHER_ROOT = path.resolve(__dirname, "..");
const DEFAULT_REPO_ROOT = path.resolve(DISPATCHER_ROOT, "..", "..");

function carregarDotEnv(dir) {
  const p = path.join(dir, ".env");
  if (!fs.existsSync(p)) return;
  const texto = fs.readFileSync(p, "utf8");
  for (const linha of texto.split(/\r?\n/)) {
    const t = linha.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i <= 0) continue;
    const k = t.slice(0, i).trim();
    let v = t.slice(i + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    if (process.env[k] === undefined) process.env[k] = v;
  }
}

function parseArgs(argv) {
  return {
    once: argv.includes("--once"),
    dryRun: argv.includes("--dry-run")
  };
}

async function main() {
  carregarDotEnv(DISPATCHER_ROOT);

  const args = parseArgs(process.argv.slice(2));
  const repoRoot = path.resolve(
    process.env.CEO_REPO_ROOT || DEFAULT_REPO_ROOT
  );
  const queueDir = path.join(repoRoot, "executive", "queue");
  const pollMs = Math.max(
    3000,
    Number(process.env.DISPATCHER_POLL_MS || 15000) || 15000
  );
  const model = process.env.CURSOR_MODEL || "composer-2.5";
  const apiKey = (process.env.CURSOR_API_KEY || "").trim() || null;

  const ctx = {
    queueDir,
    repoRoot,
    apiKey,
    model,
    dryRun: args.dryRun,
    log: (m) => console.log(m)
  };

  console.log(`[dispatcher] repo=${repoRoot}`);
  console.log(`[dispatcher] queue=${queueDir}`);
  console.log(
    `[dispatcher] mode=${args.dryRun ? "dry-run" : args.once ? "once" : "watch"} model=${model}`
  );

  if (args.once || args.dryRun) {
    const pending = listarPendentes(queueDir);
    await pulsarHeartbeat(repoRoot, {
      estado: args.dryRun ? "idle" : "busy",
      pending: pending.length
    });
    const r = await ciclo(ctx);
    await pulsarHeartbeat(repoRoot, {
      estado: r === "error" ? "error" : "idle",
      pending: listarPendentes(queueDir).length
    });
    process.exitCode = r === "error" || r === "skipped_no_key" ? 1 : 0;
    return;
  }

  console.log(`[dispatcher] a observar a cada ${pollMs}ms — Ctrl+C para parar`);
  let emCurso = false;

  const tick = async () => {
    if (emCurso) return;
    emCurso = true;
    try {
      const pending = listarPendentes(queueDir);
      await pulsarHeartbeat(repoRoot, {
        estado: pending.length ? "busy" : "idle",
        pending: pending.length
      });
      await ciclo(ctx);
      await pulsarHeartbeat(repoRoot, {
        estado: "idle",
        pending: listarPendentes(queueDir).length
      });
    } catch (err) {
      console.error("[dispatcher] erro no ciclo:", err);
      await pulsarHeartbeat(repoRoot, { estado: "error", pending: 0 });
    } finally {
      emCurso = false;
    }
  };

  await tick();
  const timer = setInterval(tick, pollMs);

  const shutdown = () => {
    clearInterval(timer);
    console.log("[dispatcher] encerrado");
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
