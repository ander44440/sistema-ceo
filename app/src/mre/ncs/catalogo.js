/**
 * C1 — Catálogo fechado da Natureza Cognitiva da Solicitação (REQ-052 / IMP-020 B1).
 */

/** @type {readonly string[]} */
export const NaturezaCognitiva = Object.freeze([
  "metodo_de_decisao",
  "decisao_operacional",
  "planejamento",
  "explicacao"
]);

/** @type {readonly string[]} */
export const PoliticaLacunasNcs = Object.freeze([
  "inventario_nao_obrigatorio",
  "inventario_material_obrigatorio",
  "nao_aplica_escolha"
]);

/** @type {readonly string[]} */
export const ModoEsperadoEstagio6 = Object.freeze([
  "entregar_criterios",
  "escolher_itens",
  "estruturar_plano",
  "justificar"
]);

export const VERSAO_CONTRATO_NCS = "1.0";

/**
 * @param {unknown} valor
 * @returns {boolean}
 */
export function ehNaturezaCognitiva(valor) {
  return typeof valor === "string" && NaturezaCognitiva.includes(valor);
}
