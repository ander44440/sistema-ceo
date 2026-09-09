/**
 * Estado em memória da conversa — particionado por COA (REQ-037/038/039, ARQ-012).
 * F5-C3: buckets persistidos em localStorage; hidratação no boot / troca de COA.
 */

import {
  carregarBucketChat,
  gravarBucketChat,
  limparDocumentoChat
} from "./persistenciaChat.js";
import {
  activarEnvelopeParaChave,
  reiniciarEnvelopeSessaoParaTestes,
  invalidarChaveEnvelopeEmMemoria
} from "../../classificadorIntencao/envelopeSessaoCoa.js";

/** @typedef {"ceo" | "usuario" | "sistema"} PapelMensagem */

/**
 * @typedef {object} Mensagem
 * @property {string} id
 * @property {PapelMensagem} papel
 * @property {string} texto
 * @property {string} criadoEm ISO-8601
 * @property {"pronta" | "pendente" | "erro"} [estado]
 */

/** Chave interna quando não há COA activo. */
const SEM_COA = "__sem_coa__";

/** @type {Map<string, Mensagem[]>} */
const historicosPorCoa = new Map();

/** @type {string | null} */
let coaConversacionalId = null;

let seq = 0;

function novoId() {
  seq += 1;
  return `msg-${Date.now()}-${seq}`;
}

function chaveActiva() {
  return coaConversacionalId || SEM_COA;
}

/**
 * Garante bucket em RAM; se ausente, hidrata do disco (pós-refresh).
 * @param {string} k
 * @returns {Mensagem[]}
 */
function garantirBucket(k) {
  if (historicosPorCoa.has(k)) {
    return /** @type {Mensagem[]} */ (historicosPorCoa.get(k));
  }
  const salvas = carregarBucketChat(k);
  /** @type {Mensagem[]} */
  const bucket = Array.isArray(salvas)
    ? salvas.map((m) => ({
        id: String(m.id || novoId()),
        papel: /** @type {PapelMensagem} */ (m.papel || "sistema"),
        texto: String(m.texto || ""),
        criadoEm: String(m.criadoEm || new Date().toISOString()),
        estado:
          m.estado === "erro"
            ? "erro"
            : m.estado === "pendente"
              ? "pronta"
              : "pronta"
      }))
    : [];
  historicosPorCoa.set(k, bucket);
  return bucket;
}

/** @returns {Mensagem[]} */
function bucketActivo() {
  return garantirBucket(chaveActiva());
}

function persistirBucketActivo() {
  gravarBucketChat(chaveActiva(), bucketActivo());
}

/**
 * Activa o bucket conversacional do COA.
 * Não copia histórico de outro COA. Hidrata do disco se o bucket ainda não
 * estiver em RAM (ex.: após refresh).
 * @param {string | null | undefined} coaId
 * @returns {string | null}
 */
export function definirContextoConversacional(coaId) {
  const id =
    coaId == null || String(coaId).trim() === ""
      ? null
      : String(coaId).trim();
  coaConversacionalId = id;
  const k = chaveActiva();
  garantirBucket(k);
  // F5-C4: hidrata tópico/pausas/objectivo do mesmo COA (boot / troca).
  activarEnvelopeParaChave(k);
  return coaConversacionalId;
}

/** @returns {string | null} */
export function obterContextoConversacional() {
  return coaConversacionalId;
}

/**
 * @param {Omit<Mensagem, "id" | "criadoEm"> & { id?: string, criadoEm?: string }} parcial
 * @returns {Mensagem}
 */
export function criarMensagem(parcial) {
  return {
    id: parcial.id || novoId(),
    papel: parcial.papel,
    texto: parcial.texto,
    criadoEm: parcial.criadoEm || new Date().toISOString(),
    estado: parcial.estado || "pronta"
  };
}

export function listarMensagens() {
  return bucketActivo().slice();
}

/** @param {Mensagem} mensagem */
export function acrescentarMensagem(mensagem) {
  bucketActivo().push(mensagem);
  persistirBucketActivo();
  return mensagem;
}

/** @param {string} id @param {Partial<Mensagem>} patch */
export function atualizarMensagem(id, patch) {
  const historico = bucketActivo();
  const idx = historico.findIndex((m) => m.id === id);
  if (idx < 0) return null;
  historico[idx] = { ...historico[idx], ...patch };
  persistirBucketActivo();
  return historico[idx];
}

/** Limpa somente o bucket do COA activo. */
export function limparHistorico() {
  historicosPorCoa.set(chaveActiva(), []);
  persistirBucketActivo();
}

export function temHistorico() {
  return bucketActivo().length > 0;
}

/**
 * Descarta RAM do store (simula refresh). Persistência local permanece.
 */
export function descartarHistoricosEmMemoria() {
  historicosPorCoa.clear();
  coaConversacionalId = null;
  invalidarChaveEnvelopeEmMemoria();
}

/**
 * Reinicia store + documento (testes).
 */
export function reiniciarStoreConversaParaTestes() {
  historicosPorCoa.clear();
  coaConversacionalId = null;
  limparDocumentoChat();
  reiniciarEnvelopeSessaoParaTestes();
}
