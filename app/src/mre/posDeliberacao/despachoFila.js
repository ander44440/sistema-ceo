/**
 * Despacho à Fila a partir do ParecerExecutivo (IMP-017 / F7).
 * Só com parecer válido + acao.tipo = despachar + job.
 */

import { validarParecerExecutivo } from "../parecer/validarParecerExecutivo.js";

/**
 * @typedef {object} DepsDespacho
 * @property {(pedido: object) => Promise<object>|object} publicarJob
 * @property {Set<string>|Map<string, string>} [registro] — parecerId → jobId (idempotência)
 */

/**
 * @param {object} parecer
 * @param {DepsDespacho} deps
 * @returns {Promise<{ despachado: boolean, job?: object, motivo?: string, idempotente?: boolean }>}
 */
export async function despacharJobDoParecer(parecer, deps) {
  if (!deps || typeof deps.publicarJob !== "function") {
    throw new Error("deps.publicarJob é obrigatório");
  }

  const validacao = validarParecerExecutivo(parecer);
  if (!validacao.ok) {
    return { despachado: false, motivo: "parecer_invalido", violacoes: validacao.violacoes };
  }

  if (parecer.acao?.tipo !== "despachar") {
    return { despachado: false, motivo: "acao_nao_despachar" };
  }

  const jobSpec = parecer.acao.job;
  if (
    !jobSpec ||
    typeof jobSpec !== "object" ||
    !String(jobSpec.titulo || "").trim() ||
    !String(jobSpec.descricao || "").trim()
  ) {
    return { despachado: false, motivo: "job_ausente_ou_incompleto" };
  }

  const parecerId = parecer.id;
  const registro = deps.registro || new Map();

  if (registro instanceof Map && registro.has(parecerId)) {
    return {
      despachado: false,
      idempotente: true,
      motivo: "ja_despachado",
      jobId: registro.get(parecerId)
    };
  }
  if (registro instanceof Set && registro.has(parecerId)) {
    return { despachado: false, idempotente: true, motivo: "ja_despachado" };
  }

  const pedido = {
    origem: "mre",
    projeto: parecer.coaId || null,
    tipo: "execucao_tecnica",
    titulo: String(jobSpec.titulo).trim(),
    descricao: String(jobSpec.descricao).trim(),
    prioridade: jobSpec.prioridade || "normal",
    parecerId
  };

  const job = await deps.publicarJob(pedido);

  if (registro instanceof Map) {
    registro.set(parecerId, job.id);
  } else if (registro instanceof Set) {
    registro.add(parecerId);
  }

  return { despachado: true, job, parecerId };
}

/**
 * Publicador in-memory para testes (não usa HTTP/FS).
 */
export function criarPublicadorFilaMemoria() {
  let n = 0;
  const jobs = [];
  return {
    jobs,
    async publicarJob(pedido) {
      n += 1;
      const job = {
        id: `JOB-TEST-${String(n).padStart(6, "0")}`,
        ...pedido,
        estado: "pending",
        criadoEm: new Date().toISOString()
      };
      jobs.push(job);
      return job;
    }
  };
}
