/**
 * LFC — domínio (IMP-092.1 / ARQ-092 v0.2).
 * Factos assertados do caso — não é HFC, MO, CSC nem MRE.
 */

import { randomUUID } from "node:crypto";

export const SCHEMA_VERSAO_LFC = 1;

export const ESTADO_LASTRO = Object.freeze({
  ACTIVO: "activo",
  ARQUIVADO: "arquivado",
  EXCLUIDO: "excluido"
});

export const ESTADO_FACTO = Object.freeze({
  ACTIVO: "activo",
  CORRIGIDO: "corrigido",
  ANULADO: "anulado"
});

/** Origem admitida na escrita — inferências do CEO são rejeitadas. */
export const ORIGEM_UTILIZADOR = "utilizador";

export const TIPO_TRILHA_LFC_MUTACAO = "lfc.mutacao";

/**
 * @returns {string}
 */
export function gerarCasoId() {
  return randomUUID();
}

/**
 * @returns {string}
 */
export function gerarFactoId() {
  return randomUUID();
}

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
 * @param {string} [titulo]
 * @returns {string}
 */
export function normalizarTitulo(titulo) {
  return texto(titulo)
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/\s+/g, " ");
}

/**
 * @param {string} raw
 * @returns {string}
 */
export function normalizarParaComparacao(raw) {
  return texto(raw)
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/\s+/g, " ");
}

/**
 * Detecta incompatibilidade directa de sector (serviços × logística) nos activos.
 * @param {string} textoNovo
 * @param {ReadonlyArray<{ texto?: string, estado?: string }>} factosActivos
 * @returns {boolean}
 */
export function haContradiçãoSectorActiva(textoNovo, factosActivos) {
  const n = normalizarParaComparacao(textoNovo);
  const falaSector =
    /\b(atua|mercado|setor|sector)\b/.test(n) ||
    /\blogistica\b/.test(n) ||
    /\bservicos?\b/.test(n);
  if (!falaSector) return false;

  const novoLog = /\blogistica\b/.test(n);
  const novoServ = /\bservicos?\b/.test(n);
  if (!novoLog && !novoServ) return false;

  for (const f of factosActivos || []) {
    if (String(f?.estado || "") !== ESTADO_FACTO.ACTIVO) continue;
    const a = normalizarParaComparacao(f.texto);
    const aLog = /\blogistica\b/.test(a);
    const aServ = /\bservicos?\b/.test(a);
    if (novoLog && aServ) return true;
    if (novoServ && aLog) return true;
  }
  return false;
}

/**
 * @param {object} parcial
 * @returns {object}
 */
export function criarDocumentoLfc(parcial) {
  const agora = new Date().toISOString();
  return {
    schemaVersao: SCHEMA_VERSAO_LFC,
    coaId: texto(parcial.coaId),
    casoId: texto(parcial.casoId) || gerarCasoId(),
    titulo: texto(parcial.titulo) || "",
    estadoLastro: parcial.estadoLastro || ESTADO_LASTRO.ACTIVO,
    factos: Array.isArray(parcial.factos) ? parcial.factos : [],
    versao: Number.isFinite(parcial.versao) ? parcial.versao : 1,
    criadoEm: parcial.criadoEm || agora,
    actualizadoEm: parcial.actualizadoEm || agora
  };
}

/**
 * @param {string} enunciado
 * @param {{ origemTurnoRef?: string|null }} [opts]
 */
export function criarFactoActivo(enunciado, opts = {}) {
  const agora = new Date().toISOString();
  return {
    id: gerarFactoId(),
    texto: texto(enunciado),
    estado: ESTADO_FACTO.ACTIVO,
    corrigidoPor: null,
    origemTurnoRef: opts.origemTurnoRef ? texto(opts.origemTurnoRef) : null,
    criadoEm: agora,
    actualizadoEm: agora
  };
}
