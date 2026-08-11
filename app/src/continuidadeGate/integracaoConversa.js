/**
 * Integração Continuidade ↔ Conversa / Núcleo — IMP-058 E4 / REQ-058 / ARQ-019.
 * Intercepta decisão de Gate antes do Classificador; regista Gate em `aguardando_gate`.
 * Sem alterar Classificador (IMP-057) nem o Motor (exceto chamada a API existente).
 */

import { criarStoreContextoGate } from "./contexto.js";
import { reconhecerDecisao } from "./reconhecerDecisao.js";

/** @type {ReturnType<typeof criarStoreContextoGate>|null} */
let storePadrao = null;

/**
 * Store de sessão (browser / processo) — injectável nos testes via deps.
 * @returns {ReturnType<typeof criarStoreContextoGate>}
 */
export function obterStoreContinuidadePadrao() {
  if (!storePadrao) storePadrao = criarStoreContextoGate();
  return storePadrao;
}

/** Reinicia o store padrão (testes). */
export function resetStoreContinuidadePadrao() {
  storePadrao = criarStoreContextoGate();
  return storePadrao;
}

/**
 * Mensagem de Gate com postura executiva (DESP-003 / ciclo Decidir).
 * @param {object} [conducao]
 * @param {string} [gateId]
 * @param {object} [parecer]
 */
export function mensagemAguardandoGateContinuidade(conducao, gateId, parecer) {
  const gatilhos =
    conducao &&
    conducao.avaliacao &&
    Array.isArray(conducao.avaliacao.gatilhos) &&
    conducao.avaliacao.gatilhos.length
      ? conducao.avaliacao.gatilhos.join(", ")
      : null;
  const label = gatilhos
    ? `Gate ${gatilhos}`
    : gateId
      ? `Gate ${gateId}`
      : "Gate do Motor";

  const snap =
    parecer ||
    (conducao && conducao.parecerSnapshot) ||
    null;
  const emCausa = String(
    snap?.acao?.job?.titulo ||
      snap?.diagnostico?.objetivoReal ||
      snap?.decisaoExecutiva?.recomendacao ||
      ""
  )
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 100);

  let msg = `Aguardando aprovação (${label}).`;
  if (emCausa) {
    msg += ` Em causa: ${emCausa}.`;
  }
  msg += " Responda Aprovado, Cancela ou Adiar.";
  return msg;
}

/**
 * Clarificação RF12 / E4-CA3 — Gate pendente + mensagem fora do léxico.
 * @param {ReturnType<typeof criarStoreContextoGate>} store
 */
export function mensagemClarificacaoGatePendente(store) {
  const ctx = store.obterContextoActivo();
  const resumo =
    (ctx && ctx.solicitacaoResumo) ||
    (ctx && ctx.gate && ctx.gate.parecerId) ||
    "trabalho em Gate";
  return (
    `Há um Gate pendente («${String(resumo).slice(0, 80)}»). ` +
    `Responda com Aprovado / Pode executar / Autorizado / Pode prosseguir, ` +
    `Cancela / Rejeitado, ou Depois / Adiar — ou diga se prefere tratar o novo pedido agora.`
  );
}

/**
 * Regista Gate no store quando o Motor devolve `aguardando_gate`.
 * @param {ReturnType<typeof criarStoreContextoGate>} store
 * @param {object} parecer
 * @param {object} conducao
 * @param {string} [solicitacaoResumo]
 */
export function registarGateAposMotor(store, parecer, conducao, solicitacaoResumo) {
  if (!store || !parecer || !conducao || conducao.aguardandoGate !== true) {
    return null;
  }
  const parecerId = String(parecer.id || "").trim();
  if (!parecerId) return null;

  const gatilhos =
    (conducao.avaliacao &&
      Array.isArray(conducao.avaliacao.gatilhos) &&
      conducao.avaliacao.gatilhos.join("-")) ||
    "GATE";

  return store.abrirGate({
    parecerId,
    cicloId: conducao.ciclo && conducao.ciclo.id ? String(conducao.ciclo.id) : null,
    gateId: `GATE-${parecerId}`,
    abertoEm: new Date().toISOString(),
    parecerSnapshot: parecer,
    solicitacaoResumo:
      typeof solicitacaoResumo === "string" && solicitacaoResumo.trim()
        ? solicitacaoResumo.trim()
        : String(
            parecer.acao?.job?.titulo ||
              parecer.diagnostico?.objetivoReal ||
              parecerId
          ).slice(0, 200)
  });
}

/**
 * Mensagem pós-decisão (sem «Sugiro…»).
 * @param {import("./dominio.js").DecisaoGate} decisao
 * @param {object} [conducao]
 * @param {object} [registo]
 */
export function mensagemAposDecisaoGate(decisao, conducao, registo) {
  const ref =
    (registo && registo.solicitacaoResumo) ||
    (registo && registo.gate && registo.gate.parecerId) ||
    "trabalho";

  if (decisao === "aprovado") {
    if (conducao && conducao.publicado && conducao.job && conducao.job.id) {
      const estadoJob =
        conducao.job.estado || conducao.handoff?.estadoJob || "pending";
      const handoff =
        conducao.fluxoIniciado === true
          ? " Handoff ao Dispatcher iniciado (dispatched — não concluído)."
          : "";
      return (
        `Decisão: Gate aprovado. Job ${conducao.job.id} em ${estadoJob}.` +
        handoff +
        ` Prosseguimos «${String(ref).slice(0, 72)}» sem repetir o pedido.`
      );
    }
    if (conducao && conducao.motivo === "publicador_ausente") {
      return (
        `Decisão: Gate aprovado para «${String(ref).slice(0, 72)}»; ` +
        `Motor avançou, mas falta publicador da Fila.`
      );
    }
    return `Decisão: Gate aprovado. Motor continua «${String(ref).slice(0, 72)}».`;
  }

  if (decisao === "rejeitado") {
    return (
      `Decisão: Gate rejeitado. Não crio Job para «${String(ref).slice(0, 72)}». ` +
      `O objectivo permanece — diga o próximo gesto.`
    );
  }

  if (decisao === "adiado") {
    return (
      `Decisão: Gate adiado. «${String(ref).slice(0, 72)}» fica pendente — ` +
      `pode autorizar depois sem repetir a solicitação.`
    );
  }

  return "Decisão de Gate processada.";
}

/**
 * Interceptação pré-Classificador (E4).
 * GATE_PENDING ≠ CONVERSATION_LOCK (P0):
 * - decisão V1 reconhecida → Continuidade (aprova / rejeita / adia execução);
 * - qualquer outra mensagem → Classificador (conversa / análise / nova prioridade).
 * A execução do Job continua bloqueada no Motor até autorização válida.
 *
 * @param {string} texto
 * @param {ReturnType<typeof criarStoreContextoGate>} store
 * @returns {"continuidade"|"clarificacao"|"classificador"}
 */
export function decidirInterceptacaoContinuidade(texto, store) {
  if (!store || !store.temGatePendente()) return "classificador";
  const r = reconhecerDecisao(texto);
  if (r.reconhecida) return "continuidade";
  // P0: não transformar pedido novo em clarificação que trava o CEO.
  return "classificador";
}

/**
 * Continua o Motor após decisão reconhecida (sem reclassificar / sem repetir C3).
 *
 * @param {object} opts
 * @param {string} opts.texto
 * @param {ReturnType<typeof criarStoreContextoGate>} opts.store
 * @param {(parecer: object, deps: object) => Promise<object>} opts.conduzirMotor
 * @param {(pedido: object) => Promise<object>|object} [opts.publicarJob]
 * @param {Map<string, string>} [opts.registro]
 * @param {string} [opts.agora]
 */
export async function continuarAposDecisaoGate(opts) {
  const {
    texto,
    store,
    conduzirMotor,
    publicarJob,
    registro,
    agora
  } = opts;

  const loc = store.localizarParaDecisao(texto);
  if (!loc.localizado || !loc.reconhecimento.decisao || !loc.registo) {
    return {
      ok: false,
      interceptado: true,
      modo: "continuidade_gate_falha",
      mensagem: loc.mensagem || "Não foi possível localizar o Gate pendente.",
      dados: {
        continuidade: true,
        classificadorSaltado: true,
        localizado: false,
        reconhecimento: loc.reconhecimento
      }
    };
  }

  const decisao = loc.reconhecimento.decisao;
  const parecer = loc.registo.parecerSnapshot;
  if (!parecer || typeof parecer !== "object") {
    return {
      ok: false,
      interceptado: true,
      modo: "continuidade_gate_falha",
      mensagem:
        "Gate pendente sem parecerSnapshot — não é possível continuar o Motor.",
      dados: {
        continuidade: true,
        classificadorSaltado: true,
        gateId: loc.gate?.gateId
      }
    };
  }

  const parecerId = String(parecer.id || "").trim();
  const registroJobs =
    registro instanceof Map
      ? registro
      : store.registroJobs instanceof Map
        ? store.registroJobs
        : new Map();

  // Idempotência: parecer já tem Job — não republicar (RF11 / E5-CA5)
  if (decisao === "aprovado" && parecerId && registroJobs.has(parecerId)) {
    const jobIdExistente = registroJobs.get(parecerId);
    store.consumirDecisao(texto, { agora });
    return {
      ok: true,
      interceptado: true,
      modo: "continuidade_gate",
      mensagem: `Gate já aprovado anteriormente. Job ${jobIdExistente} mantido (idempotente) — sem novo Job.`,
      capacidade: "motor_execucao",
      intencao: {
        id: "continuidade_gate",
        capacidade: "motor_execucao",
        origem: "continuidade_gate_e5"
      },
      dados: {
        continuidade: true,
        classificadorSaltado: true,
        motorAcionado: false,
        mreInvocado: false,
        antiSugiro: true,
        decisao: "aprovado",
        idempotente: true,
        gateId: loc.gate?.gateId,
        solicitacaoResumo: loc.registo.solicitacaoResumo,
        job: { id: jobIdExistente, estado: "pending" },
        store: {
          ok: true,
          permanecePendente: false,
          temGatePendente: store.temGatePendente()
        }
      },
      origem: "executiveEngine"
    };
  }

  /** @type {Record<string, unknown>} */
  const motorDeps = {
    decisaoAprovacao: decisao,
    registro: registroJobs,
    iniciarFluxo: true
  };
  if (typeof publicarJob === "function") {
    motorDeps.publicarJob = publicarJob;
  }

  const conducao = await conduzirMotor(parecer, motorDeps);

  if (
    decisao === "aprovado" &&
    conducao &&
    conducao.publicado &&
    conducao.job &&
    conducao.job.id &&
    parecerId
  ) {
    store.registarJobPublicado?.(parecerId, conducao.job.id);
    if (!registroJobs.has(parecerId)) {
      registroJobs.set(parecerId, conducao.job.id);
    }
  }

  const consumo = store.consumirDecisao(texto, { agora });

  const mensagem = mensagemAposDecisaoGate(
    decisao,
    conducao,
    consumo.registo || loc.registo
  );

  const jobCriado = Boolean(conducao && conducao.publicado && conducao.job);
  const falhou =
    decisao === "aprovado" &&
    !jobCriado &&
    !conducao?.idempotente &&
    conducao &&
    conducao.motivo === "falha_publicacao";

  return {
    ok: !falhou,
    interceptado: true,
    modo: "continuidade_gate",
    mensagem,
    capacidade: "motor_execucao",
    intencao: {
      id: "continuidade_gate",
      capacidade: "motor_execucao",
      origem: "continuidade_gate_e5"
    },
    dados: {
      continuidade: true,
      classificadorSaltado: true,
      motorAcionado: true,
      mreInvocado: false,
      antiSugiro: true,
      decisao,
      gateId: loc.gate?.gateId,
      solicitacaoResumo: loc.registo.solicitacaoResumo,
      motor: conducao,
      job: conducao && conducao.job ? conducao.job : null,
      handoff: conducao && conducao.handoff ? conducao.handoff : null,
      idempotente: conducao && conducao.idempotente === true,
      store: {
        ok: consumo.ok,
        permanecePendente: consumo.permanecePendente === true,
        temGatePendente: store.temGatePendente()
      }
    },
    origem: "executiveEngine"
  };
}

/**
 * Resposta de clarificação (E4-CA3) — não aprova, não classifica como C3 novo.
 * @param {ReturnType<typeof criarStoreContextoGate>} store
 * @param {string} texto
 */
export function responderClarificacaoGate(store, texto) {
  return {
    ok: true,
    interceptado: true,
    modo: "continuidade_gate_clarificacao",
    mensagem: mensagemClarificacaoGatePendente(store),
    capacidade: null,
    intencao: {
      id: "continuidade_gate_clarificacao",
      capacidade: null,
      origem: "continuidade_gate_e4"
    },
    dados: {
      continuidade: true,
      classificadorSaltado: true,
      clarificacaoGate: true,
      motorAcionado: false,
      mreInvocado: false,
      textoRecebido: String(texto || "").slice(0, 200),
      contextoActivo: store.obterContextoActivo()
        ? {
            gateId: store.obterContextoActivo().gate.gateId,
            parecerId: store.obterContextoActivo().gate.parecerId,
            solicitacaoResumo: store.obterContextoActivo().solicitacaoResumo
          }
        : null
    },
    origem: "executiveEngine"
  };
}

/**
 * Envolve `conduzirMotor` para registar Gate automaticamente (E4-CA5).
 * @param {ReturnType<typeof criarStoreContextoGate>} store
 * @param {(parecer: object, deps: object) => Promise<object>} conduzirMotor
 * @param {string} textoInstrucao
 */
export function envolverConduzirMotorComContinuidade(
  store,
  conduzirMotor,
  textoInstrucao
) {
  return async function conduzirComContinuidade(parecer, motorDeps) {
    const conducao = await conduzirMotor(parecer, motorDeps);
    if (conducao && conducao.aguardandoGate === true) {
      const reg = registarGateAposMotor(
        store,
        parecer,
        conducao,
        textoInstrucao
      );
      if (reg) {
        conducao.continuidadeGate = {
          registado: true,
          gateId: reg.gate.gateId,
          parecerId: reg.gate.parecerId
        };
      }
    }
    return conducao;
  };
}

/**
 * Ajusta mensagem C3 quando Gate ficou pendente (UX Continuidade).
 * @param {object} resposta
 * @param {object} [conducao]
 */
export function aplicarMensagemGateNaResposta(resposta, conducao) {
  if (!resposta || !conducao || conducao.aguardandoGate !== true) {
    return resposta;
  }
  const gateId =
    (conducao.continuidadeGate && conducao.continuidadeGate.gateId) || null;
  const parecer =
    (resposta.dados && resposta.dados.parecer) ||
    conducao.parecerSnapshot ||
    null;
  return {
    ...resposta,
    mensagem: mensagemAguardandoGateContinuidade(conducao, gateId, parecer),
    dados: {
      ...(resposta.dados && typeof resposta.dados === "object"
        ? resposta.dados
        : {}),
      continuidadeGateRegistado: Boolean(conducao.continuidadeGate?.registado)
    }
  };
}
