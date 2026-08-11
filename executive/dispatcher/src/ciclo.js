/**
 * Ciclo de observação da fila + despacho (REQ-053 + P0-2).
 * Agent SDK "finished" ≠ Job completed.
 */

import { listarPendentes } from "./listPending.js";
import { adquirirLock, libertarLock, lerLock } from "./lock.js";
import {
  prepararDespacho,
  reconciliarAposAgent,
  verificarJobsEmResult
} from "./posAgent.js";

/**
 * @param {{
 *   queueDir: string,
 *   repoRoot: string,
 *   apiKey: string | null,
 *   model: string,
 *   dryRun: boolean,
 *   log?: (msg: string) => void
 * }} ctx
 * @returns {Promise<"idle"|"dry"|"busy"|"dispatched"|"skipped_no_key"|"error"|"failed_no_result"|"verified">}
 */
export async function ciclo(ctx) {
  const log = ctx.log || console.log;

  // P0-2: RESULT → verificação CEO (mesmo sem pending — Agent pode ter gravado o ficheiro)
  const passVerify = verificarJobsEmResult(ctx.queueDir);
  if (passVerify.resultados.length) {
    for (const r of passVerify.resultados) {
      log(
        `[dispatcher] verificação ${r.job?.id || "?"}: ${r.acao} — ${r.mensagem}`
      );
    }
  }

  const pending = listarPendentes(ctx.queueDir);

  if (!pending.length) {
    if (passVerify.verificados.length) {
      log(
        `[dispatcher] ${passVerify.verificados.length} Job(s) verificados; nenhum pending`
      );
      return "verified";
    }
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
    const prep = prepararDespacho(ctx.queueDir, job.id);
    if (prep) {
      log(`[dispatcher] Job ${job.id} → ${prep.estado} (handoff ≠ conclusão)`);
    }

    log(`[dispatcher] a acordar Agent local para ${job.id}…`);
    const { despacharAgent } = await import("./despachar.js");
    const out = await despacharAgent({
      repoRoot: ctx.repoRoot,
      apiKey: ctx.apiKey,
      model: ctx.model,
      jobId: job.id,
      titulo: job.titulo || ""
    });

    const rec = reconciliarAposAgent(ctx.queueDir, job.id);
    log(`[dispatcher] reconciliação: ${rec.acao} — ${rec.mensagem}`);

    // Segunda passagem: se o Agent gravou result noutro ID, ou este job ficou em result
    const pass2 = verificarJobsEmResult(ctx.queueDir);
    for (const r of pass2.resultados) {
      if (r.job?.id !== rec.job?.id) {
        log(
          `[dispatcher] verificação ${r.job?.id || "?"}: ${r.acao} — ${r.mensagem}`
        );
      }
    }

    if (!out.ok) {
      const detalhe = out.error || out.result || "(sem detalhe)";
      log(
        `[dispatcher] Agent não concluído: status=${out.status} — ${detalhe}`
      );
      return "error";
    }

    log(
      `[dispatcher] Agent terminou (${out.status}) run=${out.runId || "?"} ${out.durationMs || "?"}ms — estado Job=${rec.job?.estado || "?"}`
    );

    if (rec.acao === "failed" || rec.job?.estado === "failed") {
      return "failed_no_result";
    }
    return "dispatched";
  } finally {
    libertarLock(ctx.queueDir);
  }
}
