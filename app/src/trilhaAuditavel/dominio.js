/**
 * Trilha Auditável V1 — domínio (fatias 1–2: job / gate / AD).
 * Não é Ledger MO, transcript nem MEP.
 */

export const SCHEMA_VERSAO = 1;
export const TIPO_JOB_TRANSICAO = "job.transicao";
export const TIPO_GATE_DECISAO_TERMINAL = "gate.decisao_terminal";
export const TIPO_AD_FECHO_SOB_DELEGACAO = "ad.fecho_sob_delegacao";
/** Extensão IMP-092.1 / ARQ-092 — mutações do Lastro Factual do Caso. */
export const TIPO_LFC_MUTACAO = "lfc.mutacao";
/** Extensão IMP-093 M1 / ARQ-093 — Context Governor. */
export const TIPO_CG_AUTORIZACAO = "cg.autorizacao";

export const TIPOS_V1 = Object.freeze([
  TIPO_JOB_TRANSICAO,
  TIPO_GATE_DECISAO_TERMINAL,
  TIPO_AD_FECHO_SOB_DELEGACAO
]);

/** Tipos admitidos no append (V1 + LFC + CG). */
export const TIPOS_ADMITIDOS = Object.freeze([
  ...TIPOS_V1,
  TIPO_LFC_MUTACAO,
  TIPO_CG_AUTORIZACAO
]);

export const RESULTADOS = Object.freeze(["ok", "falha", "info"]);

/** Campos que entram no hash canónico do evento job.transicao. */
export const CAMPOS_CONTEUDO_HASH = Object.freeze([
  "tipo",
  "jobId",
  "quando",
  "de",
  "para",
  "motivo",
  "actor",
  "indice"
]);

export const CHAVES_PAYLOAD_PROIBIDAS = Object.freeze([
  "mensagens",
  "mensagem",
  "transcript",
  "transcriptCliente",
  "conversasCliente",
  "itemKnw",
  "itemKnwConteudo",
  "knw",
  "eventosMep",
  "mepCeo"
]);

/**
 * @param {unknown} valor
 * @returns {string}
 */
export function texto(valor) {
  if (valor == null) return "";
  if (typeof valor === "string") return valor.trim();
  return String(valor).trim();
}

/**
 * Hash canónico portátil (FNV-1a 32-bit + comprimento).
 * @param {string} entrada
 * @returns {string}
 */
export function hashFnv1aHex(entrada) {
  const str = String(entrada);
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  const u = h >>> 0;
  return `fnv1a32_${u.toString(16).padStart(8, "0")}_${str.length}`;
}

/**
 * @param {Record<string, unknown>} campos
 * @returns {string}
 */
export function calcularConteudoHash(campos) {
  const partes = CAMPOS_CONTEUDO_HASH.map(
    (k) => `${k}=${texto(campos[k])}`
  );
  return hashFnv1aHex(partes.join("\n"));
}

/**
 * Hash canónico a partir de um mapa arbitrário (chaves ordenadas).
 * @param {Record<string, unknown>} mapa
 * @returns {string}
 */
export function calcularConteudoHashCampos(mapa) {
  const keys = Object.keys(mapa || {}).sort();
  const partes = keys.map((k) => `${k}=${texto(mapa[k])}`);
  return hashFnv1aHex(partes.join("\n"));
}

/**
 * @param {string} jobId
 * @param {number} indice
 * @param {string} conteudoHash
 * @returns {string}
 */
export function gerarIdEventoJobTransicao(jobId, indice, conteudoHash) {
  const j = texto(jobId)
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "job";
  const n = Number.isFinite(indice) && indice >= 0 ? indice : 0;
  const h = texto(conteudoHash).slice(-12) || "0";
  return `ta-${j}-${n}-${h}`;
}

/**
 * Detecta chaves proibidas em qualquer profundidade.
 * @param {unknown} valor
 * @param {string[]} [acc]
 * @returns {string[]}
 */
export function listarChavesProibidas(valor, acc = []) {
  if (valor == null || typeof valor !== "object") return acc;
  if (Array.isArray(valor)) {
    for (const item of valor) listarChavesProibidas(item, acc);
    return acc;
  }
  for (const k of Object.keys(valor)) {
    if (CHAVES_PAYLOAD_PROIBIDAS.includes(k)) acc.push(k);
    listarChavesProibidas(/** @type {Record<string, unknown>} */ (valor)[k], acc);
  }
  return acc;
}

/**
 * @param {unknown} valor
 * @returns {{ ok: true } | { ok: false, codigo: string, chaves: string[] }}
 */
export function validarPayloadSemFamiliasProibidas(valor) {
  const chaves = [...new Set(listarChavesProibidas(valor))];
  if (chaves.length) {
    return { ok: false, codigo: "payload_proibido", chaves };
  }
  return { ok: true };
}

/**
 * @param {object} entrada
 * @param {string} entrada.jobId
 * @param {number} entrada.indice
 * @param {{ em?: string, de?: string|null, para?: string, motivo?: string|null, actor?: string|null }} entrada.entradaHistorico
 * @param {string|null} [entrada.coaId]
 * @returns {{ ok: true, evento: object } | { ok: false, codigo: string, mensagem: string, chaves?: string[] }}
 */
export function construirEventoJobTransicao(entrada) {
  const jobId = texto(entrada && entrada.jobId);
  if (!jobId) {
    return {
      ok: false,
      codigo: "jobId_ausente",
      mensagem: "refs.jobId é obrigatório para job.transicao."
    };
  }

  const hist = (entrada && entrada.entradaHistorico) || {};
  const indice = Number(entrada.indice);
  if (!Number.isFinite(indice) || indice < 0) {
    return {
      ok: false,
      codigo: "indice_invalido",
      mensagem: "indice do historicoCiclo inválido."
    };
  }

  const quando = texto(hist.em) || new Date().toISOString();
  const de = hist.de == null || hist.de === "" ? null : texto(hist.de);
  const para = texto(hist.para);
  if (!para) {
    return {
      ok: false,
      codigo: "para_ausente",
      mensagem: "entrada historicoCiclo.para é obrigatória."
    };
  }

  const motivo = hist.motivo == null ? null : texto(hist.motivo) || null;
  const actor = hist.actor == null ? null : texto(hist.actor) || null;
  const coaId =
    entrada.coaId == null || entrada.coaId === ""
      ? null
      : texto(entrada.coaId);

  const hashCampos = {
    tipo: TIPO_JOB_TRANSICAO,
    jobId,
    quando,
    de: de == null ? "" : de,
    para,
    motivo: motivo == null ? "" : motivo,
    actor: actor == null ? "" : actor,
    indice
  };
  const conteudoHash = calcularConteudoHash(hashCampos);
  const id = gerarIdEventoJobTransicao(jobId, indice, conteudoHash);

  const evento = {
    id,
    schemaVersao: SCHEMA_VERSAO,
    quando,
    actor: actor || "sistema",
    tipo: TIPO_JOB_TRANSICAO,
    coaId,
    refs: { jobId },
    detalhe: {
      de,
      para,
      motivo,
      indice,
      resumo: `${de == null ? "∅" : de}→${para}`
    },
    resultado: "ok",
    conteudoHash
  };

  const proibido = validarPayloadSemFamiliasProibidas(evento);
  if (!proibido.ok) {
    return {
      ok: false,
      codigo: proibido.codigo,
      mensagem: `Payload contém chaves proibidas: ${proibido.chaves.join(", ")}`,
      chaves: proibido.chaves
    };
  }

  return { ok: true, evento };
}

/**
 * Novas entradas de historicoCiclo (por índice crescente).
 * @param {object|null|undefined} jobAnterior
 * @param {object} jobNovo
 * @returns {{ indice: number, entrada: object }[]}
 */
export function diffNovasEntradasHistorico(jobAnterior, jobNovo) {
  const novo = Array.isArray(jobNovo && jobNovo.historicoCiclo)
    ? jobNovo.historicoCiclo
    : [];
  const antLen = Array.isArray(jobAnterior && jobAnterior.historicoCiclo)
    ? jobAnterior.historicoCiclo.length
    : 0;
  /** @type {{ indice: number, entrada: object }[]} */
  const out = [];
  for (let i = antLen; i < novo.length; i++) {
    const entrada = novo[i];
    if (entrada && typeof entrada === "object") {
      out.push({ indice: i, entrada });
    }
  }
  return out;
}

/**
 * @param {object} entrada
 * @returns {{ ok: true, evento: object } | { ok: false, codigo: string, mensagem: string, chaves?: string[] }}
 */
export function construirEventoGateDecisaoTerminal(entrada) {
  const decisao = texto(entrada && entrada.decisao);
  if (decisao !== "aprovado" && decisao !== "rejeitado") {
    return {
      ok: false,
      codigo: "decisao_invalida",
      mensagem: "gate.decisao_terminal exige aprovado ou rejeitado."
    };
  }
  const gateId = texto(entrada && entrada.gateId);
  const parecerId = texto(entrada && entrada.parecerId);
  const moRegistroId = texto(entrada && entrada.moRegistroId);
  if (!gateId || !parecerId || !moRegistroId) {
    return {
      ok: false,
      codigo: "refs_incompletas",
      mensagem: "gateId, parecerId e moRegistroId são obrigatórios."
    };
  }

  const quando = texto(entrada && entrada.quando) || new Date().toISOString();
  const jobId = texto(entrada && entrada.jobId) || null;
  const coaId = texto(entrada && entrada.coaId) || null;
  const resumo = texto(entrada && entrada.resumo) || null;
  const resultadoMo = texto(entrada && entrada.resultadoMo) || null;

  const hashCampos = {
    tipo: TIPO_GATE_DECISAO_TERMINAL,
    gateId,
    parecerId,
    decisao,
    moRegistroId,
    jobId: jobId || "",
    quando,
    coaId: coaId || ""
  };
  const conteudoHash = calcularConteudoHashCampos(hashCampos);
  const id = `ta-gate-${gateId}-${parecerId}-${decisao}-${conteudoHash.slice(-12)}`
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .slice(0, 120);

  /** @type {Record<string, string>} */
  const refs = { gateId, parecerId, moRegistroId };
  if (jobId) refs.jobId = jobId;

  const evento = {
    id,
    schemaVersao: SCHEMA_VERSAO,
    quando,
    actor: texto(entrada && entrada.actor) || "usuario",
    tipo: TIPO_GATE_DECISAO_TERMINAL,
    coaId,
    refs,
    detalhe: {
      decisao,
      resumo,
      resultadoMo,
      resumoCurto: `Gate ${gateId}: ${decisao}`
    },
    resultado: "ok",
    conteudoHash
  };

  const proibido = validarPayloadSemFamiliasProibidas(evento);
  if (!proibido.ok) {
    return {
      ok: false,
      codigo: proibido.codigo,
      mensagem: `Payload contém chaves proibidas: ${proibido.chaves.join(", ")}`,
      chaves: proibido.chaves
    };
  }
  return { ok: true, evento };
}

/**
 * @param {object} entrada
 * @returns {{ ok: true, evento: object } | { ok: false, codigo: string, mensagem: string, chaves?: string[] }}
 */
export function construirEventoAdFechoSobDelegacao(entrada) {
  const moRegistroId = texto(entrada && entrada.moRegistroId);
  const coaId = texto(entrada && entrada.coaId);
  if (!moRegistroId || !coaId) {
    return {
      ok: false,
      codigo: "refs_incompletas",
      mensagem: "moRegistroId e coaId são obrigatórios para ad.fecho_sob_delegacao."
    };
  }

  const quando = texto(entrada && entrada.quando) || new Date().toISOString();
  const adActoId = texto(entrada && entrada.adActoId) || null;
  const tipoFecho = texto(entrada && entrada.tipoFecho) || null;
  const resumo = texto(entrada && entrada.resumo) || null;

  const hashCampos = {
    tipo: TIPO_AD_FECHO_SOB_DELEGACAO,
    moRegistroId,
    coaId,
    quando,
    adActoId: adActoId || "",
    tipoFecho: tipoFecho || ""
  };
  const conteudoHash = calcularConteudoHashCampos(hashCampos);
  const id = `ta-ad-${coaId}-${conteudoHash.slice(-12)}`
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .slice(0, 120);

  /** @type {Record<string, string>} */
  const refs = { moRegistroId };
  if (adActoId) refs.adActoId = adActoId;

  const evento = {
    id,
    schemaVersao: SCHEMA_VERSAO,
    quando,
    actor: texto(entrada && entrada.actor) || "ceo",
    tipo: TIPO_AD_FECHO_SOB_DELEGACAO,
    coaId,
    refs,
    detalhe: {
      tipoFecho,
      resumo,
      resumoCurto: resumo || `Fecho AD ${coaId}`
    },
    resultado: "ok",
    conteudoHash
  };

  const proibido = validarPayloadSemFamiliasProibidas(evento);
  if (!proibido.ok) {
    return {
      ok: false,
      codigo: proibido.codigo,
      mensagem: `Payload contém chaves proibidas: ${proibido.chaves.join(", ")}`,
      chaves: proibido.chaves
    };
  }
  return { ok: true, evento };
}
