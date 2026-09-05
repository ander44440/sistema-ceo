/**
 * Etapa 4 — recovery / comando «continuar».
 * Um comando de recuperação é instrução SOBRE um Job existente.
 * Nunca vira objetivo operacional de um Job novo.
 *
 * Nova tarefa explícita tem precedência sobre um verbo isolado de
 * recuperação (despacha/envie/prossiga/continue/repita). Recuperação
 * exige verbo isolado, deixis de continuidade, ou Job/alvo inequívoco.
 */

import { ehOperacaoAtivaCorrente } from "../motorExecucao/acompanhamentoJob.js";
import { extrairIdsJobMencionados } from "../classificadorIntencao/regras.js";

export const MOTIVO_OBJETIVO_AUSENTE_JOB_ALVO = "objetivo_ausente_no_job_alvo";
export const MOTIVO_JOB_ALVO_AUSENTE = "job_alvo_ausente";
export const MOTIVO_JOB_ALVO_AMBIGUO = "job_alvo_ambiguo";

const RE_VERBO_RECUPERACAO =
  /\b(continuar|continua|continue|prossiga|prosseguir|repita|repetir|envie|enviar|reenviar|reenvir|despache|despacha(?:r)?|retoma(?:r)?|tente\s+de\s+novo|tentar\s+novamente|tenta\s+de\s+novo|force?|for[cç]a(?:r)?)\b/i;

const RE_NAO_RECUPERACAO_SO =
  /\b(estado|status|cancelar|pausar|ha\s+jobs|h[aá]\s+jobs)\b/i;

const RE_PREENCHIMENTO = /\b(por\s+favor|pf|ent[aã]o|agora)\b/gi;

/** Resto após o verbo: só deixis de Job / continuidade, não tarefa nova. */
const RE_RESTO_CONTINUIDADE =
  /^(?:(?:esse|este|aquele|o)\s+jobs?|(?:o\s+)?jobs?\s+anterior|(?:com\s+)?o\s+que\s+estava(?:\s+em\s+andamento)?|em\s+andamento|(?:o\s+)?trabalho\s+anterior|isso|isto|o)$/i;

/** Com JOB-ID: o que resta tem de ser o verbo de retoma (não uma tarefa nova). */
const RE_RESTO_COM_JOB_ID =
  /^(continuar|continua|continue|prossiga|prosseguir|repita|repetir|envie|reenviar|reenvir|retoma(?:r)?|tente\s+de\s+novo|tentar\s+novamente)(\s+o)?$/i;

/**
 * @param {string} t
 * @returns {string}
 */
function restoAposVerboRecuperacao(t) {
  return String(t || "")
    .replace(/[?.!,;:]+/g, " ")
    .replace(RE_VERBO_RECUPERACAO, " ")
    .replace(RE_PREENCHIMENTO, " ")
    .replace(/\be\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * @param {string} [texto]
 * @returns {boolean}
 */
export function ehComandoRecuperacaoOperacional(texto) {
  const t = String(texto || "").trim();
  if (!t) return false;
  if (RE_NAO_RECUPERACAO_SO.test(t) && !RE_VERBO_RECUPERACAO.test(t)) {
    return false;
  }
  if (!RE_VERBO_RECUPERACAO.test(t)) return false;
  const ids = extrairIdsJobMencionados(t);
  const semIds = t
    .replace(/\bJOB-\d+\b/gi, " ")
    .replace(/[?.!,;:]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (ids.length > 0) {
    return RE_RESTO_COM_JOB_ID.test(semIds);
  }
  const resto = restoAposVerboRecuperacao(t);
  if (!resto) return true;
  return RE_RESTO_CONTINUIDADE.test(resto);
}

/**
 * @param {object|null|undefined} job
 * @returns {string}
 */
export function objetivoCanonicoDoJobAlvo(job) {
  if (!job || typeof job !== "object") return "";
  return String(job.objetivo ?? "").trim();
}

/**
 * @param {object[]} jobs
 * @param {{
 *   missaoActiva?: { id?: string|null, nome?: string|null }|null,
 *   idsAdotadosSessao?: Iterable<string>|null
 * }} [opts]
 * @returns {object[]}
 */
export function listarCandidatosJobAberto(jobs, opts = {}) {
  if (!Array.isArray(jobs)) return [];
  return jobs.filter((j) => ehOperacaoAtivaCorrente(j, opts));
}

/**
 * @param {object|null|undefined} alvo
 * @returns {{ ok: true, objetivo: string, jobAlvo: object, criterioConclusao: string|null } | { ok: false, motivo: string, mensagem: string, jobAlvo?: object }}
 */
function decidirAlvo(alvo) {
  if (!alvo || !alvo.id) {
    return {
      ok: false,
      motivo: MOTIVO_JOB_ALVO_AUSENTE,
      mensagem:
        "job_alvo_ausente: não há um Job aberto inequívoco para retomar. Indique o JOB-ID."
    };
  }
  const objetivo = objetivoCanonicoDoJobAlvo(alvo);
  if (!objetivo) {
    return {
      ok: false,
      motivo: MOTIVO_OBJETIVO_AUSENTE_JOB_ALVO,
      jobAlvo: { id: alvo.id, estado: alvo.estado || alvo.status || null },
      mensagem:
        `objetivo_ausente_no_job_alvo: ${alvo.id} não tem objetivo canónico. ` +
        "Título/descrição não substituem. Não criei Job."
    };
  }
  const criterio = String(alvo.criterioConclusao || "").trim();
  return {
    ok: true,
    objetivo,
    jobAlvo: alvo,
    criterioConclusao: criterio || null
  };
}

/**
 * @param {{
 *   texto?: string,
 *   jobs?: object[],
 *   jobActivo?: { id?: string }|null,
 *   estadoOperacional?: { jobActivo?: { id?: string }|null },
 *   obterJob?: (id: string) => Promise<object|null>|object|null
 * }} opts
 */
export async function resolverRecuperacaoOperacional(opts = {}) {
  const texto = String(opts.texto || "").trim();
  const jobs = Array.isArray(opts.jobs) ? opts.jobs : [];
  const abertos = listarCandidatosJobAberto(jobs, {
    missaoActiva: opts.missaoActiva,
    idsAdotadosSessao: opts.idsAdotadosSessao
  });
  const ids = extrairIdsJobMencionados(texto);
  const obter = opts.obterJob;

  async function carregar(id) {
    const chave = String(id || "").toUpperCase();
    const naLista = jobs.find(
      (j) => j && String(j.id || "").toUpperCase() === chave
    );
    if (naLista) return naLista;
    if (typeof obter === "function") {
      try {
        return await obter(chave);
      } catch {
        return null;
      }
    }
    return null;
  }

  if (ids.length > 1) {
    return {
      ok: false,
      motivo: MOTIVO_JOB_ALVO_AMBIGUO,
      mensagem:
        "job_alvo_ambiguo: há mais do que um JOB-ID na instrução. Indique um só alvo."
    };
  }
  if (ids.length === 1) {
    return decidirAlvo(await carregar(ids[0]));
  }

  if (abertos.length > 1) {
    return {
      ok: false,
      motivo: MOTIVO_JOB_ALVO_AMBIGUO,
      mensagem:
        "job_alvo_ambiguo: há mais do que um Job aberto. Indique o JOB-ID a retomar. Não escolhi um alvo."
    };
  }
  if (abertos.length === 1) {
    return decidirAlvo(abertos[0]);
  }

  const ja =
    opts.jobActivo ||
    (opts.estadoOperacional && opts.estadoOperacional.jobActivo) ||
    null;
  if (ja && ja.id) {
    const carregado = await carregar(String(ja.id).toUpperCase());
    return decidirAlvo(carregado || ja);
  }

  return {
    ok: false,
    motivo: MOTIVO_JOB_ALVO_AUSENTE,
    mensagem:
      "job_alvo_ausente: «continuar» sem Job aberto inequívoco. Não criei Job. Indique o JOB-ID ou o objectivo a retomar."
  };
}

/**
 * @param {object} rec — resultado de resolverRecuperacaoOperacional
 * @param {object} [classificacao]
 */
export function respostaRecuperacaoNaoExecutavel(rec, classificacao = null) {
  return {
    ok: true,
    mensagem: rec && rec.mensagem ? rec.mensagem : "Recuperação não executável.",
    modo: "recuperacao_nao_executavel",
    capacidade: "motor_execucao",
    dados: {
      classificacao,
      destino: "motor_execucao",
      motorAcionado: false,
      motorFalhou: false,
      mreFallback: false,
      motor: {
        publicado: false,
        aguardandoGate: false,
        motivo: rec && rec.motivo ? rec.motivo : MOTIVO_JOB_ALVO_AUSENTE
      },
      parecerPonte: null,
      antiSugiro: true,
      recuperacaoBloqueada: true,
      motivo: rec && rec.motivo ? rec.motivo : MOTIVO_JOB_ALVO_AUSENTE,
      jobAlvo: rec && rec.jobAlvo ? rec.jobAlvo : null
    }
  };
}
