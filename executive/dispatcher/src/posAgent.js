/**
 * Pós-Agent: ler Job e aplicar ciclo P0-2 (nunca completar só porque o Agent terminou).
 */

import fs from "node:fs";
import path from "node:path";
import {
  marcarDespachado,
  marcarRunning,
  verificarResultadoJob,
  marcarFalhaExecucao,
  avaliarAusenciaResultado
} from "../../../app/src/motorExecucao/cicloVidaJob.js";

function lerJobJson(queueDir, jobId) {
  const p = path.join(queueDir, `${jobId}.json`);
  if (!fs.existsSync(p)) return null;
  let raw = fs.readFileSync(p, "utf8");
  if (raw.charCodeAt(0) === 0xfeff) raw = raw.slice(1);
  return JSON.parse(raw);
}

function escreverJobJson(queueDir, job) {
  const p = path.join(queueDir, `${job.id}.json`);
  fs.writeFileSync(p, JSON.stringify(job, null, 2) + "\n", "utf8");
  return job;
}

/**
 * Lista Jobs em estado `result` (aguardam verificação do CEO).
 * @param {string} queueDir
 * @returns {object[]}
 */
export function listarAguardandoVerificacao(queueDir) {
  if (!fs.existsSync(queueDir)) return [];
  const files = fs
    .readdirSync(queueDir)
    .filter((f) => /^JOB-\d+\.json$/i.test(f))
    .sort();
  const out = [];
  for (const f of files) {
    try {
      let raw = fs.readFileSync(path.join(queueDir, f), "utf8");
      if (raw.charCodeAt(0) === 0xfeff) raw = raw.slice(1);
      const job = JSON.parse(raw);
      if (job && job.estado === "result") out.push(job);
    } catch {
      /* ignorar */
    }
  }
  return out;
}

/**
 * Antes de acordar o Agent: pending → dispatched.
 * @returns {object|null} job actualizado
 */
export function prepararDespacho(queueDir, jobId) {
  const job = lerJobJson(queueDir, jobId);
  if (!job) return null;
  if (job.estado === "pending") {
    const r = marcarDespachado(job, { actor: "dispatcher" });
    if (r.ok) return escreverJobJson(queueDir, r.job);
  }
  return job;
}

/**
 * Depois do Agent.prompt: reconciliar estado.
 * Agent SDK "finished" ≠ Job completed.
 *
 * @returns {{ job: object|null, acao: string, mensagem: string }}
 */
export function reconciliarAposAgent(queueDir, jobId, opts = {}) {
  let job = lerJobJson(queueDir, jobId);
  if (!job) {
    return {
      job: null,
      acao: "job_ausente",
      mensagem: `Job ${jobId} não encontrado após Agent.`
    };
  }

  if (job.estado === "completed" && job.verificacao?.ok === true) {
    return {
      job,
      acao: "ja_completed_verificado",
      mensagem: "Job já completed com verificação."
    };
  }

  // Legado: Agent marcou completed sem verificação → verificar a partir de result
  if (job.estado === "completed" && !job.verificacao?.ok) {
    const snap = {
      ...job,
      estado: "result",
      concluidoEm: null
    };
    const v = verificarResultadoJob(snap, {
      ...opts,
      actor: opts.actor || "ceo_verificacao"
    });
    if (v.ok) {
      escreverJobJson(queueDir, v.job);
      return {
        job: v.job,
        acao: v.job.estado,
        mensagem: `Verificação pós-legado → ${v.job.estado}`
      };
    }
  }

  if (job.estado === "result") {
    const v = verificarResultadoJob(job, {
      ...opts,
      actor: opts.actor || "ceo_verificacao"
    });
    if (v.ok) {
      escreverJobJson(queueDir, v.job);
      return {
        job: v.job,
        acao: v.job.estado,
        mensagem: `Verificação → ${v.job.estado}`
      };
    }
    return { job, acao: "verificacao_falhou", mensagem: v.mensagem };
  }

  if (
    job.estado === "failed" ||
    job.estado === "cancelled" ||
    job.estado === "needs_correction"
  ) {
    return {
      job,
      acao: job.estado,
      mensagem: `Job em ${job.estado}`
    };
  }

  if (
    job.estado === "pending" ||
    job.estado === "dispatched" ||
    job.estado === "running"
  ) {
    if (opts.permitirRunning === true && job.estado === "running") {
      return {
        job,
        acao: "running",
        mensagem: "Job ainda running — aguarda resultado."
      };
    }

    let alvo = job;
    if (alvo.estado === "pending") {
      const d = marcarDespachado(alvo, { actor: "dispatcher" });
      if (d.ok) alvo = d.job;
    }
    if (alvo.estado === "dispatched") {
      const r = marcarRunning(alvo, { actor: "dispatcher" });
      if (r.ok) alvo = r.job;
    }
    const f = marcarFalhaExecucao(
      alvo,
      {
        motivo: "resultado_ausente_apos_agent",
        etapa: "RUNNING",
        evidencia: null,
        impacto: "agent_terminou_sem_resultado",
        podeRetentar: true,
        proximaAcao: "re-despachar_ou_inspeccionar"
      },
      { actor: "dispatcher" }
    );
    if (f.ok) {
      escreverJobJson(queueDir, f.job);
      return {
        job: f.job,
        acao: "failed",
        mensagem: "Resultado ausente após Agent — FAILED (não completed)."
      };
    }
    return {
      job,
      acao: "erro_reconciliacao",
      mensagem: f.mensagem || "Falha ao marcar ausência de resultado."
    };
  }

  return {
    job,
    acao: "noop",
    mensagem: `Estado ${job.estado} sem acção.`
  };
}

/**
 * P0-2 integração: qualquer Job em RESULT (Agent gravou ficheiro ou API)
 * dispara verificação formal do CEO — independente de pending.
 *
 * @param {string} queueDir
 * @param {object} [opts]
 * @returns {{ verificados: object[], resultados: object[] }}
 */
export function verificarJobsEmResult(queueDir, opts = {}) {
  const aguardando = listarAguardandoVerificacao(queueDir);
  /** @type {object[]} */
  const resultados = [];
  for (const j of aguardando) {
    const rec = reconciliarAposAgent(queueDir, j.id, opts);
    resultados.push(rec);
  }
  return {
    verificados: resultados
      .map((r) => r.job)
      .filter((j) => j && j.estado !== "result"),
    resultados
  };
}

export function aplicarTimeoutSeNecessario(queueDir, jobId, opts = {}) {
  const job = lerJobJson(queueDir, jobId);
  if (!job) return { ok: false, mensagem: "Job ausente." };
  const r = avaliarAusenciaResultado(job, opts);
  if (r.aplicavel && r.ok && r.job) {
    escreverJobJson(queueDir, r.job);
  }
  return r;
}

export { lerJobJson, escreverJobJson };
