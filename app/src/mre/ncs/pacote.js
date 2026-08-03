/**
 * C3 — Pacote NCS + derivações determinísticas (IMP-020 §6.1 / B1).
 */

import {
  ModoEsperadoEstagio6,
  NaturezaCognitiva,
  PoliticaLacunasNcs,
  VERSAO_CONTRATO_NCS,
  ehNaturezaCognitiva
} from "./catalogo.js";

/**
 * @typedef {object} PacoteNcs
 * @property {string} naturezaCognitiva
 * @property {number} confiancaNatureza
 * @property {string} fundamentoNatureza
 * @property {boolean} exigeItensConcretos
 * @property {string} politicaLacunas
 * @property {string} modoEsperadoEstagio6
 * @property {string} [ncsVersaoContrato]
 */

/**
 * Derivação determinística a partir da natureza (IMP-020 tabela §6.1).
 * @param {string} naturezaCognitiva
 * @returns {{ exigeItensConcretos: boolean, politicaLacunas: string, modoEsperadoEstagio6: string }}
 */
export function derivarCamposNcs(naturezaCognitiva) {
  switch (naturezaCognitiva) {
    case "metodo_de_decisao":
      return {
        exigeItensConcretos: false,
        politicaLacunas: "inventario_nao_obrigatorio",
        modoEsperadoEstagio6: "entregar_criterios"
      };
    case "decisao_operacional":
      return {
        exigeItensConcretos: true,
        politicaLacunas: "inventario_material_obrigatorio",
        modoEsperadoEstagio6: "escolher_itens"
      };
    case "planejamento":
      return {
        exigeItensConcretos: false,
        politicaLacunas: "nao_aplica_escolha",
        modoEsperadoEstagio6: "estruturar_plano"
      };
    case "explicacao":
      return {
        exigeItensConcretos: false,
        politicaLacunas: "nao_aplica_escolha",
        modoEsperadoEstagio6: "justificar"
      };
    default:
      throw new Error(`Natureza cognitiva inválida para derivação: ${String(naturezaCognitiva)}`);
  }
}

/**
 * Constrói um Pacote NCS a partir de uma natureza válida.
 * @param {object} entrada
 * @param {string} entrada.naturezaCognitiva
 * @param {number} [entrada.confiancaNatureza]
 * @param {string} [entrada.fundamentoNatureza]
 * @returns {PacoteNcs}
 */
export function montarPacoteNcs(entrada) {
  const natureza = entrada?.naturezaCognitiva;
  if (!ehNaturezaCognitiva(natureza)) {
    throw new Error(
      `montarPacoteNcs: naturezaCognitiva inválida (catálogo: ${NaturezaCognitiva.join(" | ")})`
    );
  }

  const derivados = derivarCamposNcs(natureza);
  const confianca =
    typeof entrada.confiancaNatureza === "number" ? entrada.confiancaNatureza : 1;
  const fundamento =
    typeof entrada.fundamentoNatureza === "string" && entrada.fundamentoNatureza.trim()
      ? entrada.fundamentoNatureza.trim()
      : `Classificação: ${natureza}`;

  return Object.freeze({
    naturezaCognitiva: natureza,
    confiancaNatureza: confianca,
    fundamentoNatureza: fundamento,
    exigeItensConcretos: derivados.exigeItensConcretos,
    politicaLacunas: derivados.politicaLacunas,
    modoEsperadoEstagio6: derivados.modoEsperadoEstagio6,
    ncsVersaoContrato: VERSAO_CONTRATO_NCS
  });
}

export { NaturezaCognitiva, PoliticaLacunasNcs, ModoEsperadoEstagio6 };
