/**
 * Histórico Físico das Conversas — API (1ª fatia).
 * REQ-087 / ARQ-087 / IMP-087.
 */

import {
  SCHEMA_VERSAO,
  TIPO_CONVERSA_MENSAGEM,
  COA_SEM_CONTEXTO,
  CHAVES_PAYLOAD_PROIBIDAS,
  prepararEventoMensagem,
  validarPayloadSemFamiliasProibidas,
  idEventoHfc,
  normalizarCoaId,
  texto
} from "./dominio.js";
import {
  FICHEIRO_MENSAGENS,
  REL_DIR_HFC,
  caminhoStoreHfc,
  caminhoMensagens,
  carregarMensagens,
  appendMensagemFisica,
  apagarMensagemFisica,
  actualizarMensagemFisica,
  compactarStoreFisico
} from "./persistencia.js";

export {
  SCHEMA_VERSAO,
  TIPO_CONVERSA_MENSAGEM,
  COA_SEM_CONTEXTO,
  CHAVES_PAYLOAD_PROIBIDAS,
  prepararEventoMensagem,
  validarPayloadSemFamiliasProibidas,
  idEventoHfc,
  normalizarCoaId,
  FICHEIRO_MENSAGENS,
  REL_DIR_HFC,
  caminhoStoreHfc,
  caminhoMensagens,
  carregarMensagens,
  apagarMensagemFisica,
  actualizarMensagemFisica,
  compactarStoreFisico
};

export {
  configurarAdaptadorHfcLocal,
  resetEstadoHfcParaTestes,
  obterAdaptadorHfcActual,
  emitirMensagemHfc,
  tentarRegistarMensagemHfc
} from "./emissor.js";

/**
 * @param {string} rootDir
 * @returns {string}
 */
export function storeDaRaiz(rootDir) {
  return caminhoStoreHfc(rootDir);
}

/**
 * Adaptador de testes Node — mesma fonte JSONL.
 * @param {string} rootDir
 * @returns {(parcial: object) => object}
 */
export function criarAdaptadorHfcFs(rootDir) {
  const dir = caminhoStoreHfc(rootDir);
  return (parcial) => appendMensagem(dir, parcial);
}

/**
 * @param {object[]} existentes
 * @returns {number}
 */
function proximaOrdem(existentes) {
  let max = 0;
  for (const e of existentes) {
    const o = Number(e && e.ordem);
    if (Number.isFinite(o) && o > max) max = o;
  }
  return max + 1;
}

/**
 * Append com idempotência por msgId/id e ordem monotónica.
 * @param {string} dirStore
 * @param {object} parcial — evento sem ordem/registadoEm, ou já completo
 * @returns {{ ok: true, id: string, medium?: string, ordem?: number, duplicado?: boolean } | { ok: false, codigo: string, mensagem: string }}
 */
export function appendMensagem(dirStore, parcial) {
  if (!parcial || typeof parcial !== "object") {
    return {
      ok: false,
      codigo: "evento_invalido",
      mensagem: "Evento ausente."
    };
  }

  const proibido = validarPayloadSemFamiliasProibidas(parcial);
  if (!proibido.ok) {
    return {
      ok: false,
      codigo: "payload_proibido",
      mensagem: proibido.mensagem
    };
  }

  if (parcial.tipo && parcial.tipo !== TIPO_CONVERSA_MENSAGEM) {
    return {
      ok: false,
      codigo: "tipo_invalido",
      mensagem: `Tipo inválido: ${parcial.tipo}`
    };
  }

  const msgId = texto(parcial.msgId);
  const id = texto(parcial.id) || (msgId ? idEventoHfc(msgId) : "");
  if (!msgId || !id) {
    return {
      ok: false,
      codigo: "msg_id_ausente",
      mensagem: "msgId/id obrigatórios."
    };
  }

  let existentes;
  try {
    existentes = carregarMensagens(dirStore);
  } catch (err) {
    return {
      ok: false,
      codigo: "store_corrupto",
      mensagem: err instanceof Error ? err.message : String(err)
    };
  }

  if (
    existentes.some(
      (e) => e && (e.id === id || texto(e.msgId) === msgId)
    )
  ) {
    return { ok: true, duplicado: true, id, medium: "filesystem" };
  }

  const ordem = proximaOrdem(existentes);
  const evento = {
    schemaVersao: SCHEMA_VERSAO,
    tipo: TIPO_CONVERSA_MENSAGEM,
    id,
    coaId: normalizarCoaId(parcial.coaId),
    msgId,
    papel: parcial.papel,
    texto: String(parcial.texto ?? ""),
    criadoEm: texto(parcial.criadoEm) || new Date().toISOString(),
    registadoEm: new Date().toISOString(),
    estado: parcial.estado === "erro" ? "erro" : "pronta",
    ordem
  };

  try {
    return appendMensagemFisica(dirStore, evento);
  } catch (err) {
    return {
      ok: false,
      codigo: "falha_persistencia",
      mensagem: err instanceof Error ? err.message : String(err)
    };
  }
}

/**
 * Constrói a partir da mensagem do store + append.
 * @param {string} dirStore
 * @param {{ mensagem: object, coaId?: string|null }} entrada
 */
export function registarMensagemFisica(dirStore, entrada) {
  const prep = prepararEventoMensagem(entrada);
  if (!prep.ok) return prep;
  return appendMensagem(dirStore, prep.parcial);
}

/**
 * Leitura só para testes / diagnóstico — não é API de produto.
 * @param {string} dirStore
 * @param {{ coaId?: string|null }} [filtro]
 */
export function listarMensagensFisicas(dirStore, filtro = {}) {
  const todos = carregarMensagens(dirStore);
  const coa = filtro.coaId != null ? normalizarCoaId(filtro.coaId) : null;
  const lista = coa
    ? todos.filter((e) => e && normalizarCoaId(e.coaId) === coa)
    : todos;
  return lista.slice().sort((a, b) => Number(a.ordem) - Number(b.ordem));
}
