/**
 * Ciclo de observação da fila + despacho (REQ-053).
 */

import { listarPendentes } from "./listPending.js";
import { adquirirLock, libertarLock, lerLock } from "./lock.js";

/**
 * @param {{
 *   queueDir: string,
 *   repoRoot: string,
 *   apiKey: string | null,
 *   model: string,
 *   dryRun: boolean,
 *   log?: (msg: string) => void
 * }} ctx
 * @returns {Promise<"idle"|"dry"|"busy"|"dispatched"|"skipped_no_key"|"error">}
 */
export async function ciclo(ctx) {
  const log = ctx.log || console.log;
  const pending = listarPendentes(ctx.queueDir);

  if (!pending.length) {
    log("[dispatcher] nenhum Job pending");
    return "idle";
  }

  const job = pending[0];
  log(
    `[dispatcher] pending: ${job.id} — ${job.titulo || "(sem título)"}` +
      (pending.length > 1 ? ` (+${pending.length - 1} na fila)` : "")
  );

  if (ctx.dryRun) {
    log(`[dispatcher] dry-run: não chama o Agent (primeiro seria ${job.id})`);
    return "dry";
  }

  const lock = lerLock(ctx.queueDir);
  if (lock.ativo) {
    log(
      `[dispatcher] lock ativo (job=${lock.meta?.jobId || "?"}) — aguarda`
    );
    return "busy";
  }

  if (!ctx.apiKey) {
    log(
      "[dispatcher] CURSOR_API_KEY em falta — Jobs ficam pending. Configure .env (ver README)."
    );
    return "skipped_no_key";
  }

  if (!adquirirLock(ctx.queueDir, { jobId: job.id, pid: process.pid })) {
    log("[dispatcher] não adquiriu lock — outro processo?");
    return "busy";
  }

  try {
    log(`[dispatcher] a acordar Agent local para ${job.id}…`);
    const { despacharAgent } = await import("./despachar.js");
    const out = await despacharAgent({
      repoRoot: ctx.repoRoot,
      apiKey: ctx.apiKey,
      model: ctx.model,
      jobId: job.id,
      titulo: job.titulo || ""
    });
    if (out.ok) {
      log(
        `[dispatcher] Agent terminou (${out.status}) run=${out.runId || "?"} ${out.durationMs || "?"}ms`
      );
      return "dispatched";
    }
    const detalhe = out.error || out.result || "(sem detalhe)";
    log(
      `[dispatcher] Agent não concluído: status=${out.status} — ${detalhe}`
    );
    return "error";
  } finally {
    libertarLock(ctx.queueDir);
  }
}
