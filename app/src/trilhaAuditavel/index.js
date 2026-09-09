/**
 * Trilha Auditável V1 — API (fatias 1–2).
 */

import {
  TIPO_JOB_TRANSICAO,
  TIPO_GATE_DECISAO_TERMINAL,
  TIPO_AD_FECHO_SOB_DELEGACAO,
  construirEventoJobTransicao,
  construirEventoGateDecisaoTerminal,
  construirEventoAdFechoSobDelegacao,
  diffNovasEntradasHistorico,
  validarPayloadSemFamiliasProibidas,
  texto
} from "./dominio.js";
import {
  appendEventoFisico,
  caminhoStoreAudit,
  carregarEventos
} from "./persistencia.js";

export {
  SCHEMA_VERSAO,
  TIPO_JOB_TRANSICAO,
  TIPO_GATE_DECISAO_TERMINAL,
  TIPO_AD_FECHO_SOB_DELEGACAO,
  TIPOS_V1,
  CHAVES_PAYLOAD_PROIBIDAS,
  calcularConteudoHash,
  calcularConteudoHashCampos,
  construirEventoJobTransicao,
  construirEventoGateDecisaoTerminal,
  construirEventoAdFechoSobDelegacao,
  diffNovasEntradasHistorico,
  validarPayloadSemFamiliasProibidas
} from "./dominio.js";

export {
  FICHEIRO_EVENTOS,
  REL_DIR_AUDIT,
  caminhoStoreAudit,
  caminhoEventos,
  apagarEventoFisico,
  compactarStoreFisico,
  carregarEventos
} from "./persistencia.js";

export {
  configurarAdaptadorTrilhaLocal,
  resetAdaptadorTrilhaParaTestes,
  emitirEventoTrilha,
  obterAdaptadorTrilhaActual,
  espelharGateDecisaoTerminalNaTrilha,
  espelharAdFechoNaTrilha
} from "./emissor.js";

/**
 * @param {string} rootDir
 * @returns {string}
 */
export function storeDaRaiz(rootDir) {
  return caminhoStoreAudit(rootDir);
}

/**
 * Adaptador de testes Node — mesma fonte JSONL (sem segunda verdade).
 * @param {string} rootDir
 * @returns {(evento: object) => object}
 */
export function criarAdaptadorTrilhaFs(rootDir) {
  const dir = caminhoStoreAudit(rootDir);
  return (evento) => appendEvento(dir, evento);
}

/**
 * @param {object|null|undefined} refs
 * @returns {string}
 */
function chaveCorrelacaoRefs(refs) {
  if (!refs || typeof refs !== "object") return "";
  return [
    texto(refs.jobId),
    texto(refs.gateId),
    texto(refs.parecerId),
    texto(refs.moRegistroId),
    texto(refs.adActoId)
  ].join("|");
}

/**
 * @param {object} evento
 * @returns {{ ok: true } | { ok: false, codigo: string, mensagem: string }}
 */
function validarRefsObrigatorias(evento) {
  const refs = evento && evento.refs;
  const tipo = evento && evento.tipo;
  if (!refs || typeof refs !== "object") {
    return {
      ok: false,
      codigo: "refs_ausentes",
      mensagem: "refs é obrigatório."
    };
  }
  if (tipo === TIPO_JOB_TRANSICAO) {
    if (!texto(refs.jobId)) {
      return {
        ok: false,
        codigo: "jobId_ausente",
        mensagem: "refs.jobId é obrigatório para job.transicao."
      };
    }
    return { ok: true };
  }
  if (tipo === TIPO_GATE_DECISAO_TERMINAL) {
    if (!texto(refs.gateId) || !texto(refs.moRegistroId)) {
      return {
        ok: false,
        codigo: "refs_incompletas",
        mensagem: "refs.gateId e refs.moRegistroId são obrigatórios."
      };
    }
    return { ok: true };
  }
  if (tipo === TIPO_AD_FECHO_SOB_DELEGACAO) {
    if (!texto(refs.moRegistroId)) {
      return {
        ok: false,
        codigo: "moRegistroId_ausente",
        mensagem: "refs.moRegistroId é obrigatório."
      };
    }
    return { ok: true };
  }
  return {
    ok: false,
    codigo: "tipo_desconhecido",
    mensagem: `Tipo de evento não suportado: ${tipo}`
  };
}

/**
 * @param {string} dirStore
 * @param {string} jobId
 * @returns {object[]}
 */
export function listarPorJob(dirStore, jobId) {
  const id = typeof jobId === "string" ? jobId.trim() : "";
  if (!id) return [];
  return carregarEventos(dirStore)
    .filter(
      (e) =>
        e &&
        e.tipo === TIPO_JOB_TRANSICAO &&
        e.refs &&
        e.refs.jobId === id
    )
    .sort((a, b) => {
      const ia = Number(a.detalhe && a.detalhe.indice);
      const ib = Number(b.detalhe && b.detalhe.indice);
      if (Number.isFinite(ia) && Number.isFinite(ib) && ia !== ib) return ia - ib;
      return String(a.quando || "").localeCompare(String(b.quando || ""));
    });
}

/**
 * @param {string} dirStore
 * @param {{ tipo?: string, moRegistroId?: string, gateId?: string }} [filtro]
 * @returns {object[]}
 */
export function listarEventos(dirStore, filtro = {}) {
  const tipo = texto(filtro.tipo) || null;
  const moId = texto(filtro.moRegistroId) || null;
  const gateId = texto(filtro.gateId) || null;
  return carregarEventos(dirStore)
    .filter((e) => {
      if (!e) return false;
      if (tipo && e.tipo !== tipo) return false;
      if (moId && (!e.refs || e.refs.moRegistroId !== moId)) return false;
      if (gateId && (!e.refs || e.refs.gateId !== gateId)) return false;
      return true;
    })
    .sort((a, b) => String(a.quando || "").localeCompare(String(b.quando || "")));
}

/**
 * @param {string} dirStore
 * @param {object} evento
 * @returns {{ ok: true, id: string, medium: string } | { ok: false, codigo: string, mensagem: string }}
 */
export function appendEvento(dirStore, evento) {
  if (!evento || typeof evento !== "object") {
    return {
      ok: false,
      codigo: "evento_invalido",
      mensagem: "Evento ausente."
    };
  }
  const refsOk = validarRefsObrigatorias(evento);
  if (!refsOk.ok) return refsOk;

  const proibido = validarPayloadSemFamiliasProibidas(evento);
  if (!proibido.ok) {
    return {
      ok: false,
      codigo: "payload_proibido",
      mensagem: `Payload contém chaves proibidas: ${proibido.chaves.join(", ")}`
    };
  }

  let existentes;
  try {
    existentes = carregarEventos(dirStore);
  } catch (err) {
    return {
      ok: false,
      codigo: "store_corrupto",
      mensagem: err instanceof Error ? err.message : String(err)
    };
  }

  if (existentes.some((e) => e && e.id === evento.id)) {
    return {
      ok: false,
      codigo: "duplicado_id",
      mensagem: `Evento duplicado por id: ${evento.id}`
    };
  }
  const chaveNova = chaveCorrelacaoRefs(evento.refs);
  if (
    existentes.some(
      (e) =>
        e &&
        e.tipo === evento.tipo &&
        e.conteudoHash === evento.conteudoHash &&
        chaveCorrelacaoRefs(e.refs) === chaveNova
    )
  ) {
    return {
      ok: false,
      codigo: "duplicado_hash",
      mensagem: `Evento duplicado por conteudoHash+refs (${evento.tipo})`
    };
  }

  try {
    return appendEventoFisico(dirStore, evento);
  } catch (err) {
    return {
      ok: false,
      codigo: "falha_persistencia",
      mensagem: err instanceof Error ? err.message : String(err)
    };
  }
}

/**
 * @param {string} dirStore
 * @param {{ jobId: string, indice: number, entradaHistorico: object, coaId?: string|null }} entrada
 */
export function appendJobTransicao(dirStore, entrada) {
  const construido = construirEventoJobTransicao(entrada);
  if (!construido.ok) {
    return {
      ok: false,
      codigo: construido.codigo,
      mensagem: construido.mensagem
    };
  }
  return appendEvento(dirStore, construido.evento);
}

/**
 * @param {string} dirStore
 * @param {object} entrada
 */
export function appendGateDecisaoTerminal(dirStore, entrada) {
  const construido = construirEventoGateDecisaoTerminal(entrada);
  if (!construido.ok) {
    return {
      ok: false,
      codigo: construido.codigo,
      mensagem: construido.mensagem
    };
  }
  return appendEvento(dirStore, construido.evento);
}

/**
 * @param {string} dirStore
 * @param {object} entrada
 */
export function appendAdFechoSobDelegacao(dirStore, entrada) {
  const construido = construirEventoAdFechoSobDelegacao(entrada);
  if (!construido.ok) {
    return {
      ok: false,
      codigo: construido.codigo,
      mensagem: construido.mensagem
    };
  }
  return appendEvento(dirStore, construido.evento);
}

/**
 * @param {{ rootDir: string, jobAnterior: object|null|undefined, jobNovo: object }} args
 */
export function espelharNovasEntradasHistorico(args) {
  const rootDir = args && args.rootDir;
  const jobNovo = args && args.jobNovo;
  if (!rootDir || !jobNovo || !jobNovo.id) {
    return { ok: true, emitidos: 0, ignorados: 0, falhas: 0 };
  }

  const dirStore = caminhoStoreAudit(rootDir);
  const novas = diffNovasEntradasHistorico(args.jobAnterior, jobNovo);
  let emitidos = 0;
  let ignorados = 0;
  let falhas = 0;

  for (const { indice, entrada } of novas) {
    try {
      const r = appendJobTransicao(dirStore, {
        jobId: String(jobNovo.id),
        indice,
        entradaHistorico: entrada,
        coaId: jobNovo.coaId ?? null
      });
      if (r.ok) {
        emitidos += 1;
      } else if (r.codigo === "duplicado_id" || r.codigo === "duplicado_hash") {
        ignorados += 1;
      } else {
        falhas += 1;
      }
    } catch {
      falhas += 1;
    }
  }

  return { ok: true, emitidos, ignorados, falhas };
}
