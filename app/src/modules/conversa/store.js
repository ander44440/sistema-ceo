/**
 * Estado em memória da conversa — preparado para persistência futura.
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

/** @type {Mensagem[]} */
let historico = [];

let seq = 0;

function novoId() {
  seq += 1;
  return `msg-${Date.now()}-${seq}`;
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
  return historico.slice();
}

/** @param {Mensagem} mensagem */
export function acrescentarMensagem(mensagem) {
  historico.push(mensagem);
  return mensagem;
}

/** @param {string} id @param {Partial<Mensagem>} patch */
export function atualizarMensagem(id, patch) {
  const idx = historico.findIndex((m) => m.id === id);
  if (idx < 0) return null;
  historico[idx] = { ...historico[idx], ...patch };
  return historico[idx];
}

export function limparHistorico() {
  historico = [];
}

export function temHistorico() {
  return historico.length > 0;
}
