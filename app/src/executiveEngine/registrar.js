/**
 * Registro de capacidades do Executive Engine.
 * Preparado para integrações futuras — nesta etapa, stubs.
 */

/** @typedef {"dashboard" | "projetos" | "empresas" | "conhecimento" | "navegacao" | "ia" | "ferramentas" | "memoria" | "fila" | "consultar_cto"} CapacidadeId */

/**
 * @typedef {object} Capacidade
 * @property {CapacidadeId} id
 * @property {string} nome
 * @property {string} descricao
 * @property {(ctx: object) => Promise<object> | object} executar
 */

/** @type {Map<string, Capacidade>} */
const registro = new Map();

/**
 * @param {Capacidade} capacidade
 */
export function registrarCapacidade(capacidade) {
  if (!capacidade || !capacidade.id) {
    throw new TypeError("Capacidade inválida: id obrigatório.");
  }
  if (typeof capacidade.executar !== "function") {
    throw new TypeError(`Capacidade "${capacidade.id}": executar() obrigatório.`);
  }
  registro.set(capacidade.id, Object.freeze({ ...capacidade }));
  return capacidade.id;
}

/** @param {string} id */
export function obterCapacidade(id) {
  return registro.get(id) || null;
}

export function listarCapacidades() {
  return Array.from(registro.values());
}

export function limparRegistro() {
  registro.clear();
}

/**
 * IDs canônicos previstos para integração futura.
 * @type {readonly CapacidadeId[]}
 */
export const CAPACIDADES_CANONICAS = Object.freeze([
  "dashboard",
  "projetos",
  "empresas",
  "conhecimento",
  "navegacao",
  "ia",
  "ferramentas",
  "memoria",
  "fila",
  "consultar_cto"
]);
