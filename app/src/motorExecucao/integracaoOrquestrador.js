/**
 * Integração Motor ↔ Orquestrador — IMP-056 E4 / REQ-056 / ARQ-017.
 * Conduz Intenção → Plano → (Gate) → Job → handoff ao Dispatcher (etapa de ciclo).
 * Não implementa Dispatcher, Agent/SDK, UI nem HTTP.
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
  montarPedidoGate,
  avancarAposGate
} from "./politicaAprovacao.js";
import {
  parecerRequerDespacho,
  contextoPoliticaDoParecer,
  criarJobDoParecer,
  extrairJobSpec
} from "./ponteParecerJob.js";

/**
 * Avança o ciclo após Job `pending` criado: CriacaoDoJob → Dispatcher.
 * Isto é o handoff lógico ao Dispatcher REQ-053 — não invoca Agent/SDK.
 *
 * @param {import("./dominio.js").CicloMotor} ciclo
 * @param {object} job — Job criado (E3), estado pending
 * @returns {{ ok: true, ciclo: import("./dominio.js").CicloMotor, fluxoIniciado: true } | { ok: false, mensagem: string, fluxoIniciado: false }}
 */
export function iniciarFluxoAposJob(ciclo, job) {
  const base = validarCiclo(ciclo);
  if (!base.ok) {
    return { ok: false, mensagem: base.mensagem, fluxoIniciado: false };
  }
  if (!job || typeof job !== "object" || typeof job.id !== "string") {
    return {
      ok: false,
      mensagem: "Job inválido para iniciar fluxo.",
      fluxoIniciado: false
    };
  }
  const estado = job.estado || "pending";
  if (estado !== "pending") {
    return {
      ok: false,
      mensagem: `Handoff exige Job pending (recebido: ${estado}).`,
      fluxoIniciado: false
    };
  }

  let actual = base.ciclo;
  if (actual.etapa === "CriacaoDoJob") {
    const t = validarTransicaoCiclo("CriacaoDoJob", "Dispatcher", {
      requerDespacho: true,
      estadoJob: "pending"
    });
    if (!t.ok) {
      return { ok: false, mensagem: t.mensagem, fluxoIniciado: false };
    }
    const av = avancarCiclo(actual, "Dispatcher", {
      jobId: job.id,
      estadoJob: "pending",
      parecerId: actual.parecerId
    });
    if (!av.ok) {
      return { ok: false, mensagem: av.mensagem, fluxoIniciado: false };
    }
    actual = av.ciclo;
  } else if (actual.etapa !== "Dispatcher") {
    return {
      ok: false,
      mensagem: `iniciarFluxoAposJob exige CriacaoDoJob ou Dispatcher (actual: ${actual.etapa}).`,
      fluxoIniciado: false
    };
  }

  return {
    ok: true,
    ciclo: {
      ...actual,
      jobId: job.id,
      estadoJob: "pending"
    },
    fluxoIniciado: true,
    /** Handoff — execução real fica com Dispatcher/Agent (fora desta E4). */
    handoff: {
      para: "dispatcher_req053",
      jobId: job.id,
      estadoJob: "pending"
    }
  };
}

/**
 * Consome o Job criado na E3 e inicia o fluxo de execução (handoff).
 * Alias semântico pedido na E4.
 */
export function consumirJobCriadoParaFluxo(job, ciclo) {
  return iniciarFluxoAposJob(ciclo, job);
}

/**
 * Resultado canónico da condução no Orquestrador.
 * `execucaoConcluida` só seria true com Job terminal (E5) — E4 mantém sempre false.
 *
 * @typedef {object} ResultadoConducaoMotor
 * @property {boolean} despachado — compat F7 / efeitosPosDeliberacao
 * @property {boolean} publicado
 * @property {boolean} execucaoConcluida
 * @property {boolean} [fluxoIniciado]
 * @property {boolean} [aguardandoGate]
 * @property {object} [job]
 * @property {import("./dominio.js").CicloMotor} [ciclo]
 * @property {object} [gate]
 * @property {object} [avaliacao]
 * @property {object} [handoff]
 * @property {string} [motivo]
 * @property {string} [mensagem]
 * @property {object} [rastreio]
 * @property {boolean} [idempotente]
 */

/**
 * Conduz o Motor a partir de um parecer (pós-deliberação MRE).
 *
 * @param {object} parecer
 * @param {object} [deps]
 * @param {(pedido: object) => Promise<object>|object} [deps.publicarJob]
 * @param {Map<string, string>} [deps.registro]
 * @param {import("./dominio.js").DecisaoAprovacao|null} [deps.decisaoAprovacao]
 * @param {import("./politicaAprovacao.js").ContextoPolitica} [deps.contextoPolitica]
 * @param {import("./dominio.js").CicloMotor} [deps.ciclo]
 * @param {boolean} [deps.iniciarFluxo=true] — após Job, avançar a Dispatcher
 * @returns {Promise<ResultadoConducaoMotor>}
 */
export async function conduzirAposParecer(parecer, deps = {}) {
  const baseNeg = {
    despachado: false,
    publicado: false,
    execucaoConcluida: false,
    fluxoIniciado: false
  };

  if (!parecer || typeof parecer !== "object") {
    return { ...baseNeg, motivo: "parecer_ausente" };
  }

  const contexto = contextoPoliticaDoParecer(
    parecer,
    deps.contextoPolitica || {}
  );
  const avaliacao = avaliarPolitica(contexto);
  const parecerId =
    typeof parecer.id === "string" && parecer.id.trim()
      ? parecer.id.trim()
      : `parecer-${Date.now()}`;

  let ciclo =
    deps.ciclo ||
    montarCiclo(`ciclo-${parecerId}`, "Intencao", {
      parecerId,
      intencaoClara: true
    });

  // Intenção → Plano
  if (ciclo.etapa === "Intencao") {
    const av = avancarCiclo(ciclo, "Plano", {
      requerDespacho: contexto.requerDespacho,
      exigeAprovacao: avaliacao.exigeAprovacao,
      parecerId
    });
    if (!av.ok) {
      return { ...baseNeg, motivo: "falha_plano", mensagem: av.mensagem, ciclo };
    }
    ciclo = av.ciclo;
  }

  // Sem despacho → encerrar ciclo sem Job (comunicação-only)
  if (!parecerRequerDespacho(parecer)) {
    if (ciclo.etapa === "Plano") {
      const av = avancarCiclo(ciclo, "Encerramento", {
        requerDespacho: false,
        exigeAprovacao: false
      });
      if (av.ok) ciclo = av.ciclo;
    }
    return {
      ...baseNeg,
      motivo: "sem_despacho",
      ciclo,
      avaliacao
    };
  }

  // Gate obrigatório sem decisão → não publicar (contrato Gate; UI fica fora desta E4)
  const decisao =
    deps.decisaoAprovacao === undefined ? null : deps.decisaoAprovacao;

  if (avaliacao.exigeAprovacao && decisao !== "aprovado") {
    if (decisao === "rejeitado" || decisao === "adiado") {
      if (ciclo.etapa === "Plano") {
        const paraGate = avancarCiclo(ciclo, "Aprovacao", {
          ...contextoCicloDaPolitica(contexto, { decisaoAprovacao: decisao })
        });
        if (paraGate.ok) ciclo = paraGate.ciclo;
      }
      if (ciclo.etapa === "Aprovacao") {
        const fim = avancarAposGate(ciclo, decisao, contexto);
        if (fim.ok) ciclo = fim.ciclo;
      }
      return {
        ...baseNeg,
        motivo:
          decisao === "rejeitado" ? "gate_rejeitado" : "gate_adiado",
        ciclo,
        avaliacao
      };
    }

    // ausente → aguardar Gate
    if (ciclo.etapa === "Plano") {
      const paraGate = avancarCiclo(ciclo, "Aprovacao", {
        ...contextoCicloDaPolitica(contexto, { decisaoAprovacao: null })
      });
      if (paraGate.ok) ciclo = paraGate.ciclo;
    }

    const spec = extrairJobSpec(parecer);
    const pedidoGate = montarPedidoGate(
      spec.ok
        ? `${spec.job.titulo}: ${spec.job.descricao}`
        : "Despacho proposto pelo parecer",
      contexto,
      {
        resumoDespacho: spec.ok ? spec.job.titulo : undefined,
        parecerId
      }
    );

    return {
      ...baseNeg,
      motivo: "aguardando_gate",
      aguardandoGate: true,
      gate: {
        pedido: pedidoGate,
        decisoes: ["aprovado", "rejeitado", "adiado"]
      },
      ciclo,
      avaliacao
    };
  }

  // Avançar Plano → Aprovacao se veio com aprovação já dada
  if (
    avaliacao.exigeAprovacao &&
    decisao === "aprovado" &&
    ciclo.etapa === "Plano"
  ) {
    const paraGate = avancarCiclo(ciclo, "Aprovacao", {
      ...contextoCicloDaPolitica(contexto, { decisaoAprovacao: "aprovado" })
    });
    if (paraGate.ok) ciclo = paraGate.ciclo;
  }

  if (typeof deps.publicarJob !== "function") {
    return {
      ...baseNeg,
      motivo: "publicador_ausente",
      ciclo,
      avaliacao
    };
  }

  let publicado;
  try {
    publicado = await criarJobDoParecer(parecer, {
      publicarJob: deps.publicarJob,
      registro: deps.registro,
      contextoPolitica: contexto,
      decisaoAprovacao: decisao,
      ciclo,
      origem: deps.origem,
      projeto: deps.projeto
    });
  } catch (err) {
    return {
      ...baseNeg,
      motivo: "falha_publicacao",
      mensagem: err && err.message ? err.message : String(err),
      ciclo,
      avaliacao,
      /** E4-CA4: falha ≠ execução concluída */
      execucaoConcluida: false,
      parecerExecucaoConcluida: false
    };
  }

  if (!publicado.publicado) {
    return {
      ...baseNeg,
      motivo: publicado.motivo || "nao_publicado",
      mensagem: publicado.mensagem,
      idempotente: publicado.idempotente,
      job: publicado.job,
      ciclo: publicado.ciclo || ciclo,
      avaliacao: publicado.avaliacao || avaliacao,
      execucaoConcluida: false,
      parecerExecucaoConcluida: false
    };
  }

  ciclo = publicado.ciclo || {
    ...ciclo,
    etapa: "CriacaoDoJob",
    jobId: publicado.job.id,
    estadoJob: "pending",
    parecerId
  };

  let fluxoIniciado = false;
  let handoff;
  if (deps.iniciarFluxo !== false) {
    const fluxo = consumirJobCriadoParaFluxo(publicado.job, ciclo);
    if (fluxo.ok) {
      ciclo = fluxo.ciclo;
      fluxoIniciado = true;
      handoff = fluxo.handoff;
    }
  }

  return {
    despachado: true,
    publicado: true,
    execucaoConcluida: false,
    parecerExecucaoConcluida: false,
    fluxoIniciado,
    job: publicado.job,
    payload: publicado.payload,
    ciclo,
    avaliacao: publicado.avaliacao || avaliacao,
    rastreio: publicado.rastreio,
    handoff,
    motivo: "ok"
  };
}

/**
 * Continua após decisão de Gate (sem UI — chamada programática do Orquestrador).
 * @param {object} parecer
 * @param {import("./dominio.js").DecisaoAprovacao} decisao
 * @param {object} deps — igual a conduzirAposParecer
 */
export async function conduzirAposDecisaoGate(parecer, decisao, deps = {}) {
  return conduzirAposParecer(parecer, {
    ...deps,
    decisaoAprovacao: decisao
  });
}
