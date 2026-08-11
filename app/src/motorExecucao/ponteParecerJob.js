/**
 * Ponte Parecer / acção → Criação do Job — IMP-056 E3 / REQ-056 / ARQ-017.
 * Adaptador puro + publicação via porta injectável (REQ-045).
 * Sem Orquestrador, Dispatcher, UI ou fetch HTTP neste módulo.
 */

import {
  montarCiclo,
  avancarCiclo,
  validarCiclo,
  validarTransicaoCiclo
} from "./dominio.js";
import {
  avaliarPolitica,
  contextoCicloDaPolitica,
  podeCriarJob,
  exigeAprovacao
} from "./politicaAprovacao.js";
import {
  marcarDespachado,
  marcarRunning,
  registrarResultadoBruto,
  verificarResultadoJob,
  processarResultadoComVerificacao,
  marcarFalhaExecucao
} from "./cicloVidaJob.js";

/** Campos que nunca entram no payload publicado (REQ-045 / RES4). */
export const CAMPOS_PROIBIDOS_JOB = Object.freeze([
  "cursor",
  "executor",
  "agent",
  "agentCursor",
  "CURSOR_API_KEY",
  "cursorApiKey",
  "sdk",
  "watcher"
]);

const RE_EXECUTOR_TEXTO =
  /\bcursor\b|@cursor\/sdk|CURSOR_API_KEY|cursor agent/i;

/**
 * @param {unknown} parecer
 * @returns {boolean}
 */
export function parecerRequerDespacho(parecer) {
  if (!parecer || typeof parecer !== "object") return false;
  const p = /** @type {Record<string, unknown>} */ (parecer);
  const acao = /** @type {Record<string, unknown>|null} */ (p.acao || null);
  const decisao = /** @type {Record<string, unknown>|null} */ (
    p.decisaoExecutiva || null
  );
  const tipo = acao && typeof acao.tipo === "string" ? acao.tipo : "";
  const estado =
    decisao && typeof decisao.estado === "string" ? decisao.estado : "";
  if (tipo === "despachar") return true;
  if (estado === "delegar") return true;
  return false;
}

/**
 * Extrai spec de job do parecer (`acao.job`).
 * @param {object} parecer
 * @returns {{ ok: true, job: { titulo: string, descricao: string, prioridade?: string, efeitoExterno?: boolean, alteraCodigo?: boolean, alteraDocsProduto?: boolean } } | { ok: false, motivo: string }}
 */
export function extrairJobSpec(parecer) {
  if (!parecer || typeof parecer !== "object") {
    return { ok: false, motivo: "parecer_ausente" };
  }
  const job = parecer.acao && parecer.acao.job;
  if (job == null) {
    return { ok: false, motivo: "job_null" };
  }
  if (typeof job !== "object") {
    return { ok: false, motivo: "job_invalido" };
  }
  const titulo = String(job.titulo || "").trim();
  const descricao = String(job.descricao || "").trim();
  if (!titulo || !descricao) {
    return { ok: false, motivo: "job_incompleto" };
  }
  /** @type {Record<string, unknown>} */
  const out = { titulo, descricao };
  if (job.prioridade !== undefined) out.prioridade = job.prioridade;
  if (job.efeitoExterno === true) out.efeitoExterno = true;
  if (job.alteraCodigo === true) out.alteraCodigo = true;
  if (job.alteraDocsProduto === true) out.alteraDocsProduto = true;
  return { ok: true, job: /** @type {*} */ (out) };
}

/**
 * Contexto de política a partir do parecer (+ overrides).
 * @param {object} parecer
 * @param {import("./politicaAprovacao.js").ContextoPolitica} [override]
 */
export function contextoPoliticaDoParecer(parecer, override = {}) {
  const requer = parecerRequerDespacho(parecer);
  const spec = extrairJobSpec(parecer);
  const base = {
    requerDespacho: requer,
    efeitoExterno: spec.ok && spec.job.efeitoExterno === true,
    alteraCodigo: spec.ok && spec.job.alteraCodigo === true,
    alteraDocsProduto: spec.ok && spec.job.alteraDocsProduto === true
  };
  return {
    ...base,
    ...override,
    requerDespacho:
      override.requerDespacho !== undefined
        ? override.requerDespacho
        : base.requerDespacho
  };
}

/**
 * Remove campos proibidos e rejeita texto que nomeia o executor.
 * @param {Record<string, unknown>} pedido
 * @returns {{ ok: true, pedido: Record<string, unknown> } | { ok: false, mensagem: string }}
 */
export function sanitizarPayloadJob(pedido) {
  if (!pedido || typeof pedido !== "object") {
    return { ok: false, mensagem: "payload em falta." };
  }
  /** @type {Record<string, unknown>} */
  const limpo = {};
  for (const [k, v] of Object.entries(pedido)) {
    if (CAMPOS_PROIBIDOS_JOB.includes(k)) continue;
    limpo[k] = v;
  }
  const blob = JSON.stringify(limpo);
  if (RE_EXECUTOR_TEXTO.test(blob)) {
    return {
      ok: false,
      mensagem:
        "Payload de Job não pode referenciar Cursor nem executor (REQ-045)."
    };
  }
  return { ok: true, pedido: limpo };
}

/**
 * Adaptador parecer|acao → payload Job (REQ-045), sem publicar.
 * Correção 8: inclui `projetoNome` estável além do id `projeto`.
 * @param {object} parecer
 * @param {{ origem?: string, projeto?: string|null, projetoNome?: string|null, tipo?: string }} [opts]
 * @returns {{ ok: true, payload: object } | { ok: false, motivo: string, mensagem?: string }}
 */
export function montarPayloadJobDoParecer(parecer, opts = {}) {
  if (!parecerRequerDespacho(parecer)) {
    return { ok: false, motivo: "sem_despacho" };
  }
  const spec = extrairJobSpec(parecer);
  if (!spec.ok) {
    return { ok: false, motivo: spec.motivo };
  }
  const parecerId =
    typeof parecer.id === "string" && parecer.id.trim()
      ? parecer.id.trim()
      : undefined;

  const projetoId =
    opts.projeto !== undefined
      ? opts.projeto
      : parecer.coaId || parecer.projeto || null;

  let projetoNome =
    opts.projetoNome !== undefined
      ? opts.projetoNome
      : parecer.projetoNome != null
        ? parecer.projetoNome
        : null;
  if (projetoNome != null) {
    projetoNome = String(projetoNome).trim() || null;
  }
  // Se só temos um rótulo humano em `projeto` (sem id), espelha em projetoNome.
  if (
    !projetoNome &&
    typeof projetoId === "string" &&
    projetoId.trim() &&
    !/^prj-/i.test(projetoId) &&
    !/^coa-/i.test(projetoId)
  ) {
    projetoNome = projetoId.trim();
  }

  /** @type {Record<string, unknown>} */
  const bruto = {
    origem: opts.origem || "ceo",
    projeto: projetoId,
    tipo: opts.tipo || "execucao_tecnica",
    titulo: spec.job.titulo,
    descricao: spec.job.descricao,
    prioridade: spec.job.prioridade || "normal"
  };
  if (projetoNome) bruto.projetoNome = projetoNome;
  if (parecerId) bruto.parecerId = parecerId;

  const s = sanitizarPayloadJob(bruto);
  if (!s.ok) {
    return { ok: false, motivo: "payload_proibido", mensagem: s.mensagem };
  }
  return { ok: true, payload: s.pedido };
}

/**
 * Publicador in-memory (caminho REQ-045 simulado — testes / smoke sem HTTP).
 */
export function criarPublicadorFilaMemoria() {
  let n = 0;
  const jobs = [];

  function aplicar(r) {
    if (!r.ok) throw new Error(r.mensagem || "Transição recusada.");
    const idx = jobs.findIndex((j) => j.id === r.job.id);
    if (idx >= 0) jobs[idx] = r.job;
    else jobs.push(r.job);
    return r.job;
  }

  return {
    jobs,
    async publicarJob(pedido) {
      n += 1;
      const id = `JOB-TEST-${String(n).padStart(6, "0")}`;
      const agora = new Date().toISOString();
      const job = {
        id,
        ...pedido,
        estado: "pending",
        criadoEm: agora,
        iniciadoEm: null,
        despachadoEm: null,
        concluidoEm: null,
        resultado: null,
        historicoCiclo: [
          {
            em: agora,
            de: null,
            para: "pending",
            motivo: "criacao",
            actor: "ceo"
          }
        ]
      };
      jobs.push(job);
      return job;
    },
    marcarDespachado(id, opts) {
      const j = jobs.find((x) => x.id === id);
      if (!j) throw new Error(`Job não encontrado: ${id}`);
      return aplicar(marcarDespachado(j, opts));
    },
    marcarRunning(id, opts) {
      const j = jobs.find((x) => x.id === id);
      if (!j) throw new Error(`Job não encontrado: ${id}`);
      return aplicar(marcarRunning(j, opts));
    },
    registarResultado(id, resultado, opts = {}) {
      const j = jobs.find((x) => x.id === id);
      if (!j) throw new Error(`Job não encontrado: ${id}`);
      const reg = aplicar(registrarResultadoBruto(j, resultado, opts));
      if (opts.adiarVerificacao === true) return reg;
      // P0-2: chegada a result dispara verificação formal
      return aplicar(
        verificarResultadoJob(reg, {
          objetivo: opts.objetivo,
          criterioFn: opts.criterioFn,
          actor: opts.actorVerificacao || "ceo_verificacao",
          forcarFailed: opts.forcarFailed
        })
      );
    },
    verificar(id, opts) {
      const j = jobs.find((x) => x.id === id);
      if (!j) throw new Error(`Job não encontrado: ${id}`);
      return aplicar(verificarResultadoJob(j, opts || {}));
    },
    processarResultado(id, resultado, opts) {
      const j = jobs.find((x) => x.id === id);
      if (!j) throw new Error(`Job não encontrado: ${id}`);
      return aplicar(
        processarResultadoComVerificacao(j, resultado, opts || {})
      );
    },
    marcarFalha(id, falha, opts) {
      const j = jobs.find((x) => x.id === id);
      if (!j) throw new Error(`Job não encontrado: ${id}`);
      return aplicar(marcarFalhaExecucao(j, falha, opts));
    },
    lerJob(id) {
      return jobs.find((x) => x.id === id) || null;
    }
  };
}

/**
 * @typedef {object} DepsPonteParecerJob
 * @property {(pedido: object) => Promise<object>|object} publicarJob — porta REQ-045
 * @property {Map<string, string>} [registro] — parecerId → jobId
 * @property {import("./politicaAprovacao.js").ContextoPolitica} [contextoPolitica]
 * @property {import("./dominio.js").DecisaoAprovacao|null} [decisaoAprovacao]
 * @property {import("./dominio.js").CicloMotor} [ciclo] — se fornecido, avança para CriacaoDoJob
 * @property {string} [origem]
 * @property {string|null} [projeto]
 */

/**
 * Converte parecer aprovado/isento em Job `pending` (uma publicação).
 * @param {object} parecer
 * @param {DepsPonteParecerJob} deps
 * @returns {Promise<{
 *   publicado: boolean,
 *   job?: object,
 *   payload?: object,
 *   ciclo?: import("./dominio.js").CicloMotor,
 *   avaliacao?: ReturnType<typeof avaliarPolitica>,
 *   motivo?: string,
 *   mensagem?: string,
 *   idempotente?: boolean
 * }>}
 */
export async function criarJobDoParecer(parecer, deps) {
  if (!deps || typeof deps.publicarJob !== "function") {
    throw new Error("deps.publicarJob é obrigatório (porta REQ-045).");
  }

  if (!parecerRequerDespacho(parecer)) {
    return { publicado: false, motivo: "sem_despacho" };
  }

  const contexto = contextoPoliticaDoParecer(
    parecer,
    deps.contextoPolitica || {}
  );
  const avaliacao = avaliarPolitica(contexto);
  const decisao =
    deps.decisaoAprovacao === undefined ? null : deps.decisaoAprovacao;

  if (!podeCriarJob(contexto, decisao)) {
    if (avaliacao.exigeAprovacao && decisao !== "aprovado") {
      return {
        publicado: false,
        motivo: "aprovacao_ausente",
        avaliacao,
        mensagem:
          "Aprovação necessária e ausente — Job não criado (ARQ-017 §3.4.3)."
      };
    }
    return {
      publicado: false,
      motivo: "politica_bloqueia",
      avaliacao
    };
  }

  const montado = montarPayloadJobDoParecer(parecer, {
    origem: deps.origem,
    projeto: deps.projeto,
    projetoNome: deps.projetoNome
  });
  if (!montado.ok) {
    return {
      publicado: false,
      motivo: montado.motivo,
      mensagem: montado.mensagem,
      avaliacao
    };
  }

  const parecerId = montado.payload.parecerId;
  const registro = deps.registro;

  if (
    registro instanceof Map &&
    typeof parecerId === "string" &&
    registro.has(parecerId)
  ) {
    return {
      publicado: false,
      idempotente: true,
      motivo: "ja_publicado",
      job: { id: registro.get(parecerId) },
      avaliacao
    };
  }

  const job = await deps.publicarJob(montado.payload);

  if (!job || typeof job !== "object" || typeof job.id !== "string") {
    return {
      publicado: false,
      motivo: "resposta_publicacao_invalida",
      avaliacao
    };
  }

  if (job.estado && job.estado !== "pending") {
    return {
      publicado: false,
      motivo: "estado_inicial_invalido",
      mensagem: `Job deve nascer pending (recebido: ${job.estado}).`,
      avaliacao
    };
  }

  const sanJob = sanitizarPayloadJob(
    /** @type {Record<string, unknown>} */ ({ ...job })
  );
  if (!sanJob.ok) {
    return {
      publicado: false,
      motivo: "job_com_executor",
      mensagem: sanJob.mensagem,
      avaliacao
    };
  }

  if (registro instanceof Map && typeof parecerId === "string") {
    registro.set(parecerId, job.id);
  }

  /** @type {import("./dominio.js").CicloMotor|undefined} */
  let cicloOut;
  if (deps.ciclo) {
    const base = validarCiclo(deps.ciclo);
    if (!base.ok) {
      return {
        publicado: true,
        job,
        payload: montado.payload,
        avaliacao,
        motivo: "ciclo_invalido",
        mensagem: base.mensagem
      };
    }
    const ctxCiclo = contextoCicloDaPolitica(contexto, {
      decisaoAprovacao: decisao
    });
    const de = base.ciclo.etapa;
    const para = "CriacaoDoJob";
    if (de === "Plano" || de === "Aprovacao") {
      const t = validarTransicaoCiclo(de, para, ctxCiclo);
      if (t.ok) {
        const av = avancarCiclo(base.ciclo, para, {
          ...ctxCiclo,
          jobId: job.id,
          estadoJob: "pending",
          parecerId:
            typeof parecerId === "string" ? parecerId : base.ciclo.parecerId
        });
        if (av.ok) cicloOut = av.ciclo;
      }
    } else if (de === "CriacaoDoJob") {
      cicloOut = {
        ...base.ciclo,
        jobId: job.id,
        estadoJob: "pending",
        parecerId:
          typeof parecerId === "string" ? parecerId : base.ciclo.parecerId
      };
    }
  }

  return {
    publicado: true,
    job,
    payload: montado.payload,
    avaliacao,
    ciclo: cicloOut,
    rastreio:
      typeof parecerId === "string"
        ? { parecerId, jobId: job.id }
        : { jobId: job.id }
  };
}

/**
 * Atalho de teste: ciclo em Plano + criar Job se política permitir.
 * @param {object} parecer
 * @param {DepsPonteParecerJob} deps
 */
export async function criarJobDoParecerComCiclo(parecer, deps) {
  const ciclo =
    deps.ciclo ||
    montarCiclo(`ciclo-${parecer.id || "anon"}`, "Plano", {
      parecerId: typeof parecer.id === "string" ? parecer.id : undefined,
      requerDespacho: true
    });
  return criarJobDoParecer(parecer, { ...deps, ciclo });
}

export { exigeAprovacao, avaliarPolitica, podeCriarJob };
