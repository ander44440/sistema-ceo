/**
 * CLI — Dispatcher local da Fila de Execução (REQ-053 / IMP-060 E3).
 *
 * Consome exclusivamente executive/queue/ no PC.
 * Heartbeat → sinal do Painel (CEO_API_BASE); nunca lista Jobs na Railway.
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

/** Intervalo de pulse remoto — Painel TTL = 60s (ARQ orquestração). */
const HEARTBEAT_PULSE_MS = 20_000;

function carregarDotEnv(dir) {
  const p = path.join(dir, ".env");
  if (!fs.existsSync(p)) return;
  let texto = fs.readFileSync(p, "utf8");
  if (texto.charCodeAt(0) === 0xfeff) texto = texto.slice(1);
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
  const apiBase = (process.env.CEO_API_BASE || "").trim().replace(/\/$/, "");

  const log = (m) => console.log(m);

  const ctx = {
    queueDir,
    repoRoot,
    apiKey,
    model,
    dryRun: args.dryRun,
    log
  };

  console.log(`[dispatcher] repo=${repoRoot}`);
  console.log(`[dispatcher] queue=${queueDir} (fila oficial MVP — só FS local)`);
  console.log(
    `[dispatcher] mode=${args.dryRun ? "dry-run" : args.once ? "once" : "watch"} model=${model}`
  );
  console.log(
    `[dispatcher] heartbeat API=${apiBase || "(só ficheiro local — definir CEO_API_BASE para Painel remoto)"}`
  );

  const pulse = async (estado) => {
    const pending = listarPendentes(queueDir);
    return pulsarHeartbeat(repoRoot, {
      estado: estado || (pending.length ? "busy" : "idle"),
      pending: pending.length,
      log
    });
  };

  if (args.once || args.dryRun) {
    await pulse(args.dryRun ? "idle" : "busy");
    const r = await ciclo(ctx);
    await pulse(r === "error" ? "error" : "idle");
    process.exitCode = r === "error" || r === "skipped_no_key" ? 1 : 0;
    return;
  }

  console.log(`[dispatcher] a observar a cada ${pollMs}ms — Ctrl+C para parar`);
  let emCurso = false;

  const tick = async () => {
    if (emCurso) return;
    emCurso = true;
    try {
      await pulse(undefined);
      await ciclo(ctx);
      await pulse("idle");
    } catch (err) {
      console.error("[dispatcher] erro no ciclo:", err);
      await pulsarHeartbeat(repoRoot, {
        estado: "error",
        pending: 0,
        log
      });
    } finally {
      emCurso = false;
    }
  };

  // Pulse independente do Agent (TTL Painel 60s) — IMP-060 E3
  const hbTimer = setInterval(() => {
    void pulse(emCurso ? "busy" : undefined);
  }, HEARTBEAT_PULSE_MS);

  await tick();
  const timer = setInterval(tick, pollMs);

  const shutdown = () => {
    clearInterval(timer);
    clearInterval(hbTimer);
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
