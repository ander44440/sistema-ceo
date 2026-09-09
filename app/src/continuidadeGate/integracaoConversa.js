/**
 * Integração Continuidade ↔ Conversa / Núcleo — IMP-058 E4 / REQ-058 / ARQ-019.
 * Intercepta decisão de Gate antes do Classificador; regista Gate em `aguardando_gate`.
 * Sem alterar Classificador (IMP-057) nem o Motor (exceto chamada a API existente).
 * F5-C1: store padrão persiste Gates pendentes (localStorage) e hidrata no boot.
 */

import { criarStoreContextoGate } from "./contexto.js";
import { ehAckAmbiguoDecisaoGate, reconhecerDecisao } from "./reconhecerDecisao.js";
import {
  carregarRegistosGatePendentes,
  gravarDocumentoGate,
  limparDocumentoGate
} from "./persistenciaGate.js";
import {
  appendRegistroMo,
  ErroPersistenciaMo,
  listarRegistosMo
} from "../memoriaConfiavel/index.js";
import { espelharGateDecisaoTerminalNaTrilha } from "../trilhaAuditavel/emissor.js";

/** @type {ReturnType<typeof criarStoreContextoGate>|null} */
let storePadrao = null;

/**
 * @param {{ pendentes: object[] }} snapshot
 */
function persistirPendentesDoStore(snapshot) {
  const pendentes = Array.isArray(snapshot?.pendentes) ? snapshot.pendentes : [];
  if (pendentes.length === 0) {
    limparDocumentoGate();
    return;
  }
  gravarDocumentoGate(pendentes);
}

/**
 * Cria store com persistência de Gates pendentes e hidrata do documento local.
 * @returns {ReturnType<typeof criarStoreContextoGate>}
 */
function criarStoreContinuidadeComPersistencia() {
  const store = criarStoreContextoGate({
    onMudanca: persistirPendentesDoStore
  });
  const salvos = carregarRegistosGatePendentes();
  for (const reg of salvos) {
    store.restaurarRegisto(reg);
  }
  return store;
}

/**
 * Store de sessão (browser / processo) — injectável nos testes via deps.
 * F5-C1: na primeira obtenção, recupera Gates pendentes persistidos.
 * @returns {ReturnType<typeof criarStoreContextoGate>}
 */
export function obterStoreContinuidadePadrao() {
  if (!storePadrao) storePadrao = criarStoreContinuidadeComPersistencia();
  return storePadrao;
}

/**
 * Garante hidratação no boot (antes do primeiro turno).
 * @returns {ReturnType<typeof criarStoreContextoGate>}
 */
export function inicializarContinuidadeGateSessao() {
  return obterStoreContinuidadePadrao();
}

/**
 * Descarta só a RAM do store (simula refresh / novo processo).
 * O documento persistido permanece — a próxima obtenção reidrata.
 */
export function descartarStoreContinuidadeEmMemoria() {
  storePadrao = null;
}

/** Reinicia o store padrão (testes) — limpa também a persistência local. */
export function resetStoreContinuidadePadrao() {
  limparDocumentoGate();
  storePadrao = null;
  storePadrao = criarStoreContinuidadeComPersistencia();
  return storePadrao;
}

/**
 * coaId explícito do parecer (opção D) — sem inferência.
 * @param {object} parecer
 * @returns {string|null}
 */
function coaIdExplicitoDoParecer(parecer) {
  if (!parecer || typeof parecer !== "object") return null;
  const c = String(parecer.coaId || "").trim();
  return c || null;
}

/**
 * Grava decisão terminal de Gate no Ledger MO (origem gate).
 * Idempotente por chave gateId+parecerId+decisao (e por hash do Ledger).
 * @param {object} args
 * @returns {{ ok: true, idempotente?: boolean } | { ok: false, codigo: string, mensagem: string }}
 */
function escreverDecisaoTerminalGateNoLedger(args) {
  const {
    decisao,
    gate,
    registo,
    parecer,
    conducao,
    jobIdExistente
  } = args;

  if (decisao !== "aprovado" && decisao !== "rejeitado") {
    return { ok: true };
  }

  const coaId = coaIdExplicitoDoParecer(parecer);
  if (!coaId) {
    return {
      ok: false,
      codigo: "coaId_ausente",
      mensagem:
        "Contrato Gate→Ledger: parecerSnapshot.coaId explícito obrigatório (opção D)."
    };
  }

  const gateId = String(gate?.gateId || "").trim();
  const parecerId = String(
    parecer?.id || gate?.parecerId || ""
  ).trim();
  const resumo = String(registo?.solicitacaoResumo || "").trim();
  const objetivo = String(
    parecer?.diagnostico?.objetivoReal || ""
  ).trim();
  const quando = String(gate?.ultimaDecisaoEm || "").trim();
  if (!gateId || !parecerId || !quando) {
    return {
      ok: false,
      codigo: "schema_incompleto",
      mensagem:
        "Contrato Gate→Ledger: gateId, parecerId e ultimaDecisaoEm são obrigatórios."
    };
  }

  const chave = `GATE-MO:${gateId}|${parecerId}|${decisao}`;
  const existentes = listarRegistosMo({ coaId });
  if (
    existentes.some(
      (r) => r && String(r.baseadoEm || "").includes(chave)
    )
  ) {
    return { ok: true, idempotente: true };
  }

  const porque =
    [resumo, objetivo].filter(Boolean).join(" — ") ||
    `Decisão de Gate ${decisao}`;

  let resultado;
  if (decisao === "aprovado") {
    const jobId =
      (conducao && conducao.job && conducao.job.id) ||
      jobIdExistente ||
      null;
    resultado = jobId
      ? `job_publicado:${jobId}`
      : `gate_aprovado:${conducao?.motivo || "sem_job"}`;
  } else {
    resultado = `gate_rejeitado:${conducao?.motivo || "gate_rejeitado"}`;
  }

  try {
    const registoMo = appendRegistroMo({
      decisao: `Gate ${gateId}: ${decisao} — ${resumo || parecerId}`,
      quem: "usuario",
      quando,
      porque,
      baseadoEm: `${chave} · REQ-058 · ARQ-019`,
      resultado,
      origem: "gate",
      coaId
    });
    // Trilha Fatia 2: espelho pós-MO; falha NÃO reverte o Ledger.
    try {
      const jobIdMatch =
        typeof resultado === "string"
          ? resultado.match(/^job_publicado:(.+)$/)
          : null;
      espelharGateDecisaoTerminalNaTrilha({
        decisao,
        gateId,
        parecerId,
        moRegistroId: registoMo && registoMo.id,
        jobId: jobIdMatch ? jobIdMatch[1] : null,
        coaId,
        quando,
        resumo,
        resultadoMo: resultado,
        actor: "usuario"
      });
    } catch {
      /* fail-soft */
    }
    return { ok: true, moRegistroId: registoMo && registoMo.id };
  } catch (err) {
    if (
      err instanceof ErroPersistenciaMo &&
      (err.codigo === "duplicado_hash" || err.codigo === "duplicado_id")
    ) {
      return { ok: true, idempotente: true };
    }
    return {
      ok: false,
      codigo:
        err instanceof ErroPersistenciaMo && err.codigo
          ? err.codigo
          : "ledger_mo_falhou",
      mensagem:
        err && err.message
          ? String(err.message)
          : "Falha ao gravar Gate no Ledger MO."
    };
  }
}

/**
 * Resposta fail-closed quando falta coaId (ou Ledger recusa) em decisão terminal.
 * @param {object} loc
 * @param {string} decisao
 * @param {{ codigo: string, mensagem: string }} falha
 */
function respostaFalhaContratoGateLedger(loc, decisao, falha) {
  return {
    ok: false,
    interceptado: true,
    modo: "continuidade_gate_falha",
    mensagem: falha.mensagem,
    dados: {
      continuidade: true,
      classificadorSaltado: true,
      decisao,
      gateId: loc.gate?.gateId,
      ledgerMo: {
        ok: false,
        codigo: falha.codigo
      }
    },
    origem: "executiveEngine"
  };
}
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
 * - decisão V1 ou aprovação inequívoca do Gate actual → Continuidade;
 * - ack ambíguo (sim / ok / pode isolados) → clarificação, sem autorizar;
 * - qualquer outra mensagem → Classificador (conversa / análise / nova prioridade).
 * A execução do Job continua bloqueada no Motor até autorização válida.
 *
 * @param {string} texto
 * @param {ReturnType<typeof criarStoreContextoGate>} store
 * @returns {"continuidade"|"clarificacao"|"classificador"}
 */
export function decidirInterceptacaoContinuidade(texto, store) {
  if (!store || !store.temGatePendente()) return "classificador";
  const r = reconhecerDecisao(texto, { gatePendente: true });
  if (r.reconhecida) return "continuidade";
  if (ehAckAmbiguoDecisaoGate(texto)) return "clarificacao";
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

  const terminal = decisao === "aprovado" || decisao === "rejeitado";
  if (terminal && !coaIdExplicitoDoParecer(parecer)) {
    return respostaFalhaContratoGateLedger(loc, decisao, {
      codigo: "coaId_ausente",
      mensagem:
        "Contrato Gate→Ledger: parecerSnapshot.coaId explícito obrigatório (opção D)."
    });
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
    const consumoIdem = store.consumirDecisao(texto, { agora });
    const gateApos = consumoIdem.gate || loc.gate;
    const registoApos = consumoIdem.registo || loc.registo;
    if (
      consumoIdem.ok &&
      consumoIdem.permanecePendente !== true &&
      (decisao === "aprovado" || decisao === "rejeitado")
    ) {
      const ledger = escreverDecisaoTerminalGateNoLedger({
        decisao,
        gate: gateApos,
        registo: registoApos,
        parecer,
        conducao: null,
        jobIdExistente
      });
      if (!ledger.ok) {
        return respostaFalhaContratoGateLedger(loc, decisao, ledger);
      }
    }
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

  if (
    terminal &&
    consumo.ok &&
    consumo.permanecePendente !== true
  ) {
    const ledger = escreverDecisaoTerminalGateNoLedger({
      decisao,
      gate: consumo.gate || loc.gate,
      registo: consumo.registo || loc.registo,
      parecer,
      conducao,
      jobIdExistente: null
    });
    if (!ledger.ok) {
      return respostaFalhaContratoGateLedger(loc, decisao, ledger);
    }
  }

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
