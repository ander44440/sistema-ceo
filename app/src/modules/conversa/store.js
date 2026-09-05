/**
 * Estado em memória da conversa — particionado por COA (REQ-037/038/039, ARQ-012).
 * Preparado para persistência futura.
 */

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

/** @returns {Mensagem[]} */
function bucketActivo() {
  const k = chaveActiva();
  if (!historicosPorCoa.has(k)) {
    historicosPorCoa.set(k, []);
  }
  return /** @type {Mensagem[]} */ (historicosPorCoa.get(k));
}

/**
 * Activa o bucket conversacional do COA. Novo COA → histórico vazio.
 * Não copia histórico de outro COA.
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
  if (!historicosPorCoa.has(k)) {
    historicosPorCoa.set(k, []);
  }
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
  return mensagem;
}

/** @param {string} id @param {Partial<Mensagem>} patch */
export function atualizarMensagem(id, patch) {
  const historico = bucketActivo();
  const idx = historico.findIndex((m) => m.id === id);
  if (idx < 0) return null;
  historico[idx] = { ...historico[idx], ...patch };
  return historico[idx];
}

/** Limpa somente o bucket do COA activo. */
export function limparHistorico() {
  historicosPorCoa.set(chaveActiva(), []);
}

export function temHistorico() {
  return bucketActivo().length > 0;
}
