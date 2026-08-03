/**
 * Resultado e Encerramento — IMP-056 E5 / REQ-056 / ARQ-017 §3.4.5–6.
 * Observa Job terminal, monta mensagem ao posto de comando e fecha o ciclo.
 * Proibido inferir conclusão só da prosa MRE.
 * Sem Dispatcher real, UI ou Agent/SDK.
 */

import {
  ehEstadoJobTerminal,
  ehEstadoJob,
  validarCiclo,
  avancarCiclo,
  validarTransicaoCiclo,
  montarCiclo
} from "./dominio.js";

/**
 * @param {unknown} job
 * @returns {boolean}
 */
export function jobEstaTerminal(job) {
  if (!job || typeof job !== "object") return false;
  return ehEstadoJobTerminal(/** @type {{ estado?: string }} */ (job).estado);
}

/**
 * Síntese textual do resultado do Job (sem inventar sucesso).
 * @param {object} job
 * @returns {string}
 */
export function sintetizarResultadoJob(job) {
  if (!job || typeof job !== "object") return "";
  const r = job.resultado;
  if (typeof r === "string" && r.trim()) return r.trim();
  if (r && typeof r === "object") {
    if (typeof r.resumo === "string" && r.resumo.trim()) return r.resumo.trim();
    if (typeof r.mensagem === "string" && r.mensagem.trim()) {
      return r.mensagem.trim();
    }
    try {
      return JSON.stringify(r);
    } catch {
      return String(r);
    }
  }
  if (typeof job.motivo === "string" && job.motivo.trim()) {
    return job.motivo.trim();
  }
  if (typeof job.erro === "string" && job.erro.trim()) return job.erro.trim();
  return "";
}

/**
 * Mensagem ao posto de comando (Conversa / Speaker / CN) — objecto puro, sem UI.
 * @param {object} job
 * @returns {{ ok: true, canal: "posto_comando", jobId: string, estado: string, texto: string, sintese: string, tipo: "sucesso"|"falha"|"cancelado" } | { ok: false, mensagem: string }}
 */
export function montarMensagemResultado(job) {
  if (!job || typeof job !== "object" || typeof job.id !== "string") {
    return { ok: false, mensagem: "Job inválido para mensagem de resultado." };
  }
  if (!jobEstaTerminal(job)) {
    return {
      ok: false,
      mensagem: "Job ainda não está em estado terminal."
    };
  }
  const sintese = sintetizarResultadoJob(job);
  const estado = /** @type {string} */ (job.estado);
  let tipo;
  let texto;
  if (estado === "completed") {
    tipo = "sucesso";
    texto = sintese
      ? `Job ${job.id} concluído. ${sintese}`
      : `Job ${job.id} concluído com sucesso.`;
  } else if (estado === "failed") {
    tipo = "falha";
    texto = sintese
      ? `Job ${job.id} falhou. ${sintese}`
      : `Job ${job.id} falhou.`;
  } else {
    tipo = "cancelado";
    texto = sintese
      ? `Job ${job.id} cancelado. ${sintese}`
      : `Job ${job.id} foi cancelado.`;
  }
  return {
    ok: true,
    canal: "posto_comando",
    jobId: job.id,
    estado,
    texto,
    sintese,
    tipo
  };
}

/**
 * E5-CA4: prosa sozinha nunca encerra execução.
 * @param {string} [prosa]
 * @returns {{ ok: false, motivo: "prosa_nao_e_terminal", mensagem: string }}
 */
export function tentarEncerrarPorProsa(prosa) {
  return {
    ok: false,
    motivo: "prosa_nao_e_terminal",
    mensagem:
      "Proibido inferir Encerramento/completed só da prosa MRE (ARQ-017 / IMP-056 E5). " +
      `Texto ignorado: «${String(prosa || "").slice(0, 80)}».`
  };
}

/**
 * Avança o ciclo até Resultado + Encerramento dado um Job terminal.
 * @param {import("./dominio.js").CicloMotor} ciclo
 * @param {object} job
 * @returns {{ ok: true, ciclo: import("./dominio.js").CicloMotor, etapas: string[] } | { ok: false, mensagem: string }}
 */
export function avancarCicloAteEncerramento(ciclo, job) {
  if (!jobEstaTerminal(job)) {
    return { ok: false, mensagem: "Job não terminal — Encerramento recusado." };
  }
  const base = validarCiclo(ciclo);
  if (!base.ok) return base;

  const estadoJob = /** @type {import("./dominio.js").EstadoJob} */ (job.estado);
  const jobId = job.id;
  const etapas = [];
  let actual = {
    ...base.ciclo,
    jobId: typeof jobId === "string" ? jobId : base.ciclo.jobId
    // não forçar estado terminal na etapa actual se for incompatível (ex.: Dispatcher)
  };

  const ctxBase = { requerDespacho: true };

  const tentar = (para) => {
    const estadoPatch =
      para === "Monitoramento" ||
      para === "Resultado" ||
      para === "Encerramento"
        ? estadoJob
        : actual.estadoJob === "running" || actual.estadoJob === "pending"
          ? actual.estadoJob
          : "pending";
    const ctx = { ...ctxBase, estadoJob: estadoPatch };
    const t = validarTransicaoCiclo(actual.etapa, para, ctx);
    if (!t.ok) return t;
    const av = avancarCiclo(actual, para, {
      jobId: actual.jobId || jobId,
      estadoJob: estadoPatch,
      parecerId: actual.parecerId
    });
    if (!av.ok) return av;
    actual = av.ciclo;
    etapas.push(para);
    return { ok: true };
  };

  // Caminho até Resultado
  while (actual.etapa !== "Resultado" && actual.etapa !== "Encerramento") {
    if (actual.etapa === "Dispatcher" || actual.etapa === "Execucao") {
      const r = tentar("Monitoramento");
      if (!r.ok) return r;
      continue;
    }
    if (actual.etapa === "Monitoramento") {
      const r = tentar("Resultado");
      if (!r.ok) return r;
      continue;
    }
    if (actual.etapa === "CriacaoDoJob") {
      const r = tentar("Dispatcher");
      if (!r.ok) return r;
      continue;
    }
    return {
      ok: false,
      mensagem: `Não é possível encerrar a partir da etapa ${actual.etapa}.`
    };
  }

  if (actual.etapa === "Resultado") {
    const r = tentar("Encerramento");
    if (!r.ok) return r;
  }

  const fin = validarCiclo(actual);
  if (!fin.ok) return fin;
  if (fin.ciclo.etapa !== "Encerramento") {
    return {
      ok: false,
      mensagem: `Esperava Encerramento, ficou em ${fin.ciclo.etapa}.`
    };
  }
  return { ok: true, ciclo: fin.ciclo, etapas };
}

/**
 * Processa Resultado + Encerramento a partir de um snapshot de Job.
 * @param {import("./dominio.js").CicloMotor} ciclo
 * @param {object} job
 * @returns {Promise<object>|object}
 */
export function processarResultadoEEncerrar(ciclo, job) {
  if (!job || typeof job !== "object") {
    return {
      processado: false,
      execucaoConcluida: false,
      motivo: "job_ausente"
    };
  }

  if (!jobEstaTerminal(job)) {
    // Sync não-terminal: pending permanece; running pode ir a Execucao/Monitoramento
    return sincronizarJobNaoTerminal(ciclo, job);
  }

  const msg = montarMensagemResultado(job);
  if (!msg.ok) {
    return {
      processado: false,
      execucaoConcluida: false,
      motivo: "mensagem_invalida",
      mensagem: msg.mensagem
    };
  }

  // Garantir jobId no ciclo
  let cicloTrabalho = ciclo;
  if (!cicloTrabalho || typeof cicloTrabalho !== "object") {
    cicloTrabalho = montarCiclo(`ciclo-${job.id}`, "Monitoramento", {
      jobId: job.id,
      estadoJob: /** @type {*} */ (job.estado),
      requerDespacho: true
    });
  } else if (!cicloTrabalho.jobId) {
    cicloTrabalho = { ...cicloTrabalho, jobId: job.id };
  }

  // Alinhar estadoJob antes do walk se a etapa actual permitir
  const v0 = validarCiclo({
    ...cicloTrabalho,
    estadoJob: job.estado
  });
  if (v0.ok) {
    cicloTrabalho = v0.ciclo;
  } else {
    // Forçar via Monitoramento se possível
    if (
      cicloTrabalho.etapa === "Dispatcher" ||
      cicloTrabalho.etapa === "Execucao" ||
      cicloTrabalho.etapa === "CriacaoDoJob"
    ) {
      // walk trata incompatibilidade avançando primeiro
      cicloTrabalho = { ...cicloTrabalho, estadoJob: cicloTrabalho.estadoJob };
    } else if (cicloTrabalho.etapa === "Encerramento") {
      return {
        processado: true,
        jaEncerrado: true,
        execucaoConcluida: true,
        ciclo: cicloTrabalho,
        mensagemPostoComando: msg,
        motivo: "ja_encerrado"
      };
    }
  }

  const avanco = avancarCicloAteEncerramento(cicloTrabalho, job);
  if (!avanco.ok) {
    return {
      processado: false,
      execucaoConcluida: false,
      motivo: "falha_avanco",
      mensagem: avanco.mensagem,
      mensagemPostoComando: msg
    };
  }

  return {
    processado: true,
    execucaoConcluida: true,
    ciclo: avanco.ciclo,
    etapasAvancadas: avanco.etapas,
    mensagemPostoComando: msg,
    jobId: job.id,
    estadoJob: job.estado,
    motivo: "ok"
  };
}

/**
 * @param {import("./dominio.js").CicloMotor} ciclo
 * @param {object} job
 */
function sincronizarJobNaoTerminal(ciclo, job) {
  const estado = job.estado;
  if (!ehEstadoJob(estado)) {
    return {
      processado: false,
      execucaoConcluida: false,
      motivo: "estado_invalido"
    };
  }
  if (estado === "pending") {
    return {
      processado: false,
      execucaoConcluida: false,
      motivo: "aguarda_execucao",
      ciclo,
      jobId: job.id,
      estadoJob: "pending"
    };
  }
  // running
  const base = validarCiclo(ciclo);
  if (!base.ok) {
    return {
      processado: false,
      execucaoConcluida: false,
      motivo: "ciclo_invalido",
      mensagem: base.mensagem
    };
  }
  let actual = base.ciclo;
  if (actual.etapa === "Dispatcher") {
    const av = avancarCiclo(actual, "Execucao", {
      jobId: job.id,
      estadoJob: "running"
    });
    if (av.ok) actual = av.ciclo;
  } else if (actual.etapa === "Execucao") {
    actual = { ...actual, jobId: job.id, estadoJob: "running" };
  }
  return {
    processado: false,
    execucaoConcluida: false,
    motivo: "em_execucao",
    ciclo: actual,
    jobId: job.id,
    estadoJob: "running"
  };
}

/**
 * Observador in-memory: consulta Job via porta e processa se terminal.
 * @param {object} opts
 * @param {() => Promise<object>|object} opts.obterJob — porta (mock / GET futuro)
 * @param {import("./dominio.js").CicloMotor} opts.ciclo
 * @returns {Promise<object>}
 */
export async function observarJobEProcessar(opts) {
  if (!opts || typeof opts.obterJob !== "function") {
    throw new Error("obterJob é obrigatório.");
  }
  const job = await opts.obterJob();
  return processarResultadoEEncerrar(opts.ciclo, job);
}

/**
 * Um “tick” de poller (sem timer embutido — o Orquestrador agenda se quiser).
 * @param {{ obterJob: Function, ciclo: object, onMensagem?: (msg: object) => void }} estado
 */
export async function tickObservadorJob(estado) {
  const r = await observarJobEProcessar(estado);
  if (
    r.processado &&
    r.mensagemPostoComando &&
    typeof estado.onMensagem === "function"
  ) {
    estado.onMensagem(r.mensagemPostoComando);
  }
  if (r.ciclo) estado.ciclo = r.ciclo;
  return r;
}
