/**
 * C7 — Registo NCS em metadados do ParecerExecutivo (IMP-020 §6.2 / B4).
 * Só observabilidade: não altera decisão/ação/riscos nem topologia.
 * Ausência de Pacote → null (pareceres sem NCS continuam válidos V1–V6).
 */

import { VERSAO_CONTRATO_NCS } from "./catalogo.js";

/**
 * Extrai subconjunto mínimo de metadados NCS a partir do Pacote.
 * @param {object|null|undefined} pacote
 * @returns {object|null}
 */
export function extrairMetadadosNcs(pacote) {
  if (!pacote || typeof pacote !== "object") return null;
  if (typeof pacote.naturezaCognitiva !== "string") return null;
  if (typeof pacote.fundamentoNatureza !== "string") return null;

  const raw = {
    naturezaCognitiva: pacote.naturezaCognitiva,
    fundamentoNatureza: pacote.fundamentoNatureza,
    confiancaNatureza:
      typeof pacote.confiancaNatureza === "number" ? pacote.confiancaNatureza : undefined,
    exigeItensConcretos:
      typeof pacote.exigeItensConcretos === "boolean"
        ? pacote.exigeItensConcretos
        : undefined,
    politicaLacunas:
      typeof pacote.politicaLacunas === "string" ? pacote.politicaLacunas : undefined,
    modoEsperadoEstagio6:
      typeof pacote.modoEsperadoEstagio6 === "string"
        ? pacote.modoEsperadoEstagio6
        : undefined,
    ncsVersaoContrato: pacote.ncsVersaoContrato || VERSAO_CONTRATO_NCS
  };
  return Object.fromEntries(Object.entries(raw).filter(([, v]) => v !== undefined));
}

/**
 * Mescla metadados NCS no objeto de metadados do parecer (imutável).
 * Sem Pacote ou sem flag ativa → devolve base intacta.
 * @param {object} [base]
 * @param {object|null} pacote
 * @param {boolean} ncsAtiva
 * @returns {object}
 */
export function mesclarMetadadosNcs(base = {}, pacote, ncsAtiva) {
  const out = { ...base };
  if (!ncsAtiva) return out;
  const ncs = extrairMetadadosNcs(pacote);
  if (!ncs) return out;
  return { ...out, ...ncs };
}
