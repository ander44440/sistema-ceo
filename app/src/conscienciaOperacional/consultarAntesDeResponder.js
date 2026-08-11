/**
 * Consulta obrigatória ao Estado Executivo antes de responder C2/C3 — IMP-059 E3.
 * Invoca agregador E2; disponibiliza lastro ao Núcleo só se houver contexto relevante.
 * Sem prosa final (E5); sem mutar Motor / Continuidade / Fila.
 */

import {
  ID_POR_CLASSE,
  CLASSE_POR_ID
} from "../classificadorIntencao/dominio.js";
import {
  agregarEstadoExecutivo,
  criarAgregadorConsciencia
} from "./agregarEstado.js";
import {
  fontePrioritaria,
  temContextoOperacionalRelevante
} from "./dominio.js";
import { montarEstadoOperacionalNoLastro } from "../conversacaoNatural/estadoOperacional.js";

/**
 * @typedef {import("./dominio.js").EstadoExecutivoAtual} EstadoExecutivoAtual
 * @typedef {import("./agregarEstado.js").ConsultaEstadoExecutivo} ConsultaEstadoExecutivo
 * @typedef {import("./agregarEstado.js").LeitoresFontes} LeitoresFontes
 */

/**
 * Lastro injectável no Núcleo / MRE (camada de contexto — não deliberação).
 * @typedef {object} LastroConscienciaNucleo
 * @property {string} consultadoEm
 * @property {true} temContextoRelevante
 * @property {{ id: string, nivel: string, nome: string }|null} fontePrioritaria
 * @property {ReadonlyArray<{ id: string, nivel: string, nome: string }>} prioridadeActiva
 * @property {ReadonlyArray<string>} factosOficiais
 * @property {Readonly<{
 *   jobsPendentes: number,
 *   jobsEmExecucao: number,
 *   gatesPendentes: number
 * }>} contagens
 */

/**
 * Resultado do gancho E3.
 * @typedef {object} ResultadoConsultaAntesDeResponder
 * @property {boolean} consultado — true se a agregação correu (C2/C3)
 * @property {boolean} obrigatorio
 * @property {string} motivo
 * @property {string|null} idClasse
 * @property {string|null} classe
 * @property {boolean} temContextoRelevante
 * @property {LastroConscienciaNucleo|null} lastroParaNucleo — null ⇒ comportamento actual preservado
 * @property {ConsultaEstadoExecutivo|null} consulta
 * @property {Readonly<object>} metadado — indício observável (RNF3)
 */

/** Classes que exigem consulta (C2 / C3). */
export const CLASSES_COM_CONSULTA_OBRIGATORIA = Object.freeze([
  CLASSE_POR_ID.C2,
  CLASSE_POR_ID.C3
]);

/**
 * @param {string|null|undefined} classe
 * @param {string|null|undefined} [idClasse]
 */
export function classeExigeConsultaConsciencia(classe, idClasse) {
  if (idClasse === "C2" || idClasse === "C3") return true;
  if (classe === CLASSE_POR_ID.C2 || classe === CLASSE_POR_ID.C3) return true;
  const id = classe ? ID_POR_CLASSE[/** @type {string} */ (classe)] : null;
  return id === "C2" || id === "C3";
}

/**
 * Factos curtos para `factosOficiais` do MRE (1–3 ideias por fonte activa de topo).
 * @param {ConsultaEstadoExecutivo} consulta
 * @returns {string[]}
 */
export function montarFactosLastro(consulta) {
  const estado = consulta.estado;
  /** @type {string[]} */
  const factos = [];

  for (const gate of estado.gatesPendentes.slice(0, 2)) {
    const resumo = gate.resumo ? `: ${gate.resumo}` : "";
    factos.push(
      `Estado Executivo — Gate pendente ${gate.gateId} (parecer ${gate.parecerId})${resumo}`
    );
  }
  for (const job of estado.jobsEmExecucao.slice(0, 2)) {
    const st = job.status || "running";
    const sintese =
      typeof job.sinteseResultado === "string" && job.sinteseResultado.trim()
        ? job.sinteseResultado.trim()
        : "";
    const evidencia =
      typeof job.evidencia === "string" && job.evidencia.trim()
        ? job.evidencia.trim()
        : "";
    const anexoResultado = sintese
      ? ` — resultado: ${sintese}${evidencia ? ` | evidência: ${evidencia}` : ""}`
      : "";
    if (st === "dispatched") {
      factos.push(
        `Estado Executivo — Job em handoff (dispatched) ${job.id}: ${job.titulo} — não concluído`
      );
    } else if (st === "result") {
      factos.push(
        `Estado Executivo — Job com resultado ${job.id}: ${job.titulo} — aguarda verificação${anexoResultado}`
      );
    } else if (st === "needs_correction") {
      factos.push(
        `Estado Executivo — Job em correção ${job.id}: ${job.titulo} — acompanhamento aberto${anexoResultado}`
      );
    } else {
      factos.push(
        `Estado Executivo — Job em execução ${job.id}: ${job.titulo}`
      );
    }
  }
  for (const job of estado.jobsPendentes.slice(0, 2)) {
    factos.push(
      `Estado Executivo — Job pendente ${job.id}: ${job.titulo}`
    );
  }
  if (estado.agent.ocupado || estado.agent.estado === "ocupado") {
    factos.push("Estado Executivo — Agent ocupado");
  }
  if (
    estado.dispatcher.estado === "activo" ||
    estado.dispatcher.estado === "erro"
  ) {
    factos.push(
      `Estado Executivo — Dispatcher ${estado.dispatcher.estado}`
    );
  }
  if (estado.cto.emCurso) {
    factos.push("Estado Executivo — Consulta CTO em curso");
  }
  if (estado.painel.alertas > 0) {
    factos.push(
      `Estado Executivo — Painel com ${estado.painel.alertas} alerta(s)`
    );
  }
  if (estado.frenteActiva?.nome || estado.frenteActiva?.id) {
    factos.push(
      `Estado Executivo — Frente activa: ${estado.frenteActiva.nome || estado.frenteActiva.id}`
    );
  }

  return factos;
}

/**
 * @param {ConsultaEstadoExecutivo} consulta
 * @returns {LastroConscienciaNucleo}
 */
export function montarLastroParaNucleo(consulta) {
  const prioridade = fontePrioritaria(consulta.estado, {
    incluirFrente: false
  });
  const factos = montarFactosLastro(consulta);
  const estadoOperacional = montarEstadoOperacionalNoLastro(consulta, {
    factosOficiais: factos
  });
  return Object.freeze({
    consultadoEm: consulta.consultadoEm,
    temContextoRelevante: true,
    fontePrioritaria: prioridade
      ? Object.freeze({ ...prioridade })
      : null,
    prioridadeActiva: consulta.prioridadeActiva,
    factosOficiais: Object.freeze(factos),
    contagens: Object.freeze({
      jobsPendentes: consulta.estado.jobsPendentes.length,
      jobsEmExecucao: consulta.estado.jobsEmExecucao.length,
      gatesPendentes: consulta.estado.gatesPendentes.length
    }),
    /** CTO-003 — persistência do estado operacional no lastro */
    estadoOperacional
  });
}

/**
 * Metadado mínimo anexável a `dados` (sempre que a consulta corre).
 * @param {ResultadoConsultaAntesDeResponder} resultado
 */
export function metadadoConscienciaParaDados(resultado) {
  return Object.freeze({
    consultado: resultado.consultado,
    obrigatorio: resultado.obrigatorio,
    motivo: resultado.motivo,
    temContextoRelevante: resultado.temContextoRelevante,
    consultadoEm: resultado.consulta?.consultadoEm ?? null,
    fontePrioritaria: resultado.lastroParaNucleo?.fontePrioritaria ?? null,
    fontesDegradadas: resultado.consulta
      ? [...resultado.consulta.diagnostico.fontesDegradadas]
      : []
  });
}

/**
 * Consulta Estado Executivo antes de resposta substantive C2/C3.
 *
 * Contrato de ordem (RF8 / E3-CA3): se `continuidadeConsumiu === true`,
 * **não** consulta — Continuidade do Gate já consumiu a mensagem.
 *
 * @param {{
 *   classe?: string|null,
 *   idClasse?: string|null,
 *   continuidadeConsumiu?: boolean,
 *   leitores?: LeitoresFontes,
 *   agora?: () => string,
 *   agregador?: { consultar: Function },
 *   conflitosFoco?: unknown[]
 * }} opts
 * @returns {Promise<ResultadoConsultaAntesDeResponder>}
 */
export async function consultarEstadoExecutivoAntesDeResponder(opts = {}) {
  const continuidadeConsumiu = opts.continuidadeConsumiu === true;
  const classe = opts.classe ?? null;
  const idClasse =
    opts.idClasse ??
    (classe && ID_POR_CLASSE[classe] ? ID_POR_CLASSE[classe] : null);

  if (continuidadeConsumiu) {
    return Object.freeze({
      consultado: false,
      obrigatorio: false,
      motivo: "continuidade_gate_precedente",
      idClasse,
      classe,
      temContextoRelevante: false,
      lastroParaNucleo: null,
      consulta: null,
      metadado: Object.freeze({
        consultado: false,
        motivo: "continuidade_gate_precedente"
      })
    });
  }

  if (!classeExigeConsultaConsciencia(classe, idClasse)) {
    return Object.freeze({
      consultado: false,
      obrigatorio: false,
      motivo: "classe_sem_obrigacao",
      idClasse,
      classe,
      temContextoRelevante: false,
      lastroParaNucleo: null,
      consulta: null,
      metadado: Object.freeze({
        consultado: false,
        motivo: "classe_sem_obrigacao"
      })
    });
  }

  /** @type {ConsultaEstadoExecutivo} */
  let consulta;
  if (opts.agregador && typeof opts.agregador.consultar === "function") {
    consulta = await opts.agregador.consultar({
      leitores: opts.leitores,
      conflitosFoco: opts.conflitosFoco
    });
  } else {
    consulta = await agregarEstadoExecutivo({
      leitores: opts.leitores,
      agora: opts.agora,
      conflitosFoco: opts.conflitosFoco
    });
  }

  const relevante = temContextoOperacionalRelevante(consulta.estado);
  const lastro =
    relevante === true ? montarLastroParaNucleo(consulta) : null;

  const resultado = Object.freeze({
    consultado: true,
    obrigatorio: true,
    motivo: relevante ? "contexto_relevante" : "sem_contexto_relevante",
    idClasse,
    classe,
    temContextoRelevante: relevante,
    lastroParaNucleo: lastro,
    consulta,
    metadado: Object.freeze({
      consultado: true,
      motivo: relevante ? "contexto_relevante" : "sem_contexto_relevante",
      consultadoEm: consulta.consultadoEm
    })
  });

  return resultado;
}

/**
 * Factory com leitores fixos (E3+).
 * @param {{
 *   leitores?: LeitoresFontes,
 *   agora?: () => string
 * }} [config]
 */
export function criarConsultaConsciencia(config = {}) {
  const agregador = criarAgregadorConsciencia({
    leitores: config.leitores,
    agora: config.agora
  });
  return Object.freeze({
    /**
     * @param {{
     *   classe?: string|null,
     *   idClasse?: string|null,
     *   continuidadeConsumiu?: boolean,
     *   leitores?: LeitoresFontes,
     *   conflitosFoco?: unknown[]
     * }} opts
     */
    async antesDeResponder(opts = {}) {
      return consultarEstadoExecutivoAntesDeResponder({
        ...opts,
        agregador,
        agora: config.agora
      });
    }
  });
}
