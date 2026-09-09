/**
 * Envelope CSC por COA — F5-C4.
 * Liga stores RAM de tópico/objectivo à persistência local, keyed pelo COA activo.
 */

import {
  aplicarResultadoGestaoTopicos as aplicarTopicosRam,
  definirEstadoTopicosSessao,
  obterEstadoTopicosSessao,
  resetEstadoTopicosSessao as resetTopicosRam
} from "./topicosSessao.js";
import {
  aplicarResultadoGestaoObjectivo as aplicarObjectivoRam,
  definirEstadoObjectivoSessao,
  obterEstadoObjectivoSessao,
  resetEstadoObjectivoSessao as resetObjectivoRam
} from "./objectivoSessao.js";
import {
  carregarBucketEnvelope,
  gravarBucketEnvelope,
  limparBucketEnvelope,
  limparDocumentoEnvelope,
  bucketEnvelopeVazio
} from "./persistenciaEnvelopeSessao.js";

const SEM_COA = "__sem_coa__";

/** @type {string | null} — null = ainda não activado (força hidratação) */
let chaveActual = null;

/** Evita regravar durante hidratação. */
let hidratando = false;

/**
 * @param {string | null | undefined} chave
 * @returns {string}
 */
export function normalizarChaveEnvelope(chave) {
  const t = chave == null ? "" : String(chave).trim();
  return t || SEM_COA;
}

/**
 * Persiste o estado RAM actual na chave activa.
 */
export function persistirEnvelopeActual() {
  if (hidratando) return;
  const k = chaveActual == null ? SEM_COA : chaveActual;
  gravarBucketEnvelope(k, {
    topicos: obterEstadoTopicosSessao(),
    objectivo: obterEstadoObjectivoSessao()
  });
}

/**
 * Descarta a chave em memória (simula refresh) — próxima activação reidrata.
 */
export function invalidarChaveEnvelopeEmMemoria() {
  chaveActual = null;
}

/**
 * Activa envelope do COA (boot / troca) — hidrata RAM a partir do disco.
 * Se a chave já está activa, não sobrescreve a RAM (evita apagar seed do turno).
 * @param {string | null | undefined} chaveCoa
 */
export function activarEnvelopeParaChave(chaveCoa) {
  const nova = normalizarChaveEnvelope(chaveCoa);
  if (chaveActual !== null && nova === chaveActual) {
    return;
  }
  chaveActual = nova;
  const bucket = carregarBucketEnvelope(chaveActual);
  hidratando = true;
  try {
    definirEstadoTopicosSessao(bucket.topicos || bucketEnvelopeVazio().topicos);
    definirEstadoObjectivoSessao(
      bucket.objectivo || bucketEnvelopeVazio().objectivo
    );
  } finally {
    hidratando = false;
  }
}

/**
 * Limpa RAM + persistência da chave activa (encerramento explícito).
 */
export function limparEnvelopeActual() {
  const k = chaveActual == null ? SEM_COA : chaveActual;
  hidratando = true;
  try {
    resetTopicosRam();
    resetObjectivoRam();
  } finally {
    hidratando = false;
  }
  limparBucketEnvelope(k);
  chaveActual = k;
}

/** @returns {string} */
export function obterChaveEnvelopeActual() {
  return chaveActual == null ? SEM_COA : chaveActual;
}

/**
 * Aplica gestor de tópicos e persiste.
 * @param {import("./gestorTopicos.js").ResultadoGestaoTopicos} resultado
 */
export function aplicarResultadoGestaoTopicosPersistente(resultado) {
  aplicarTopicosRam(resultado);
  if (resultado?.commitEstado === true) persistirEnvelopeActual();
}

/**
 * Aplica gestor de objectivo e persiste.
 * @param {import("./gestorObjectivo.js").ResultadoGestaoObjectivo} resultado
 */
export function aplicarResultadoGestaoObjectivoPersistente(resultado) {
  aplicarObjectivoRam(resultado);
  if (resultado?.commitEstado === true) persistirEnvelopeActual();
}

/**
 * Reset tópicos + sync disco (vazio na chave actual).
 */
export function resetEstadoTopicosSessaoPersistente() {
  resetTopicosRam();
  persistirEnvelopeActual();
}

/**
 * Reset objectivo + sync disco.
 */
export function resetEstadoObjectivoSessaoPersistente() {
  resetObjectivoRam();
  persistirEnvelopeActual();
}

/** Testes: limpa documento e força próxima activação a hidratar. */
export function reiniciarEnvelopeSessaoParaTestes() {
  limparDocumentoEnvelope();
  chaveActual = null;
  hidratando = true;
  try {
    resetTopicosRam();
    resetObjectivoRam();
  } finally {
    hidratando = false;
  }
}
