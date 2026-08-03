/**
 * Dia Executivo — persistência por projeto (Onda 03 / E1).
 * Status: nao_iniciado | em_curso | encerrado
 */

const MAX_CONTINUIDADE = 60;

/**
 * @typedef {"nao_iniciado" | "em_curso" | "encerrado"} StatusDiaExecutivo
 */

/**
 * @typedef {object} RegistroContinuidade
 * @property {string} id
 * @property {string} dataRef — YYYY-MM-DD (dia civil local)
 * @property {string} oQueAndou
 * @property {string} oQueFica
 * @property {string} proximoPassoAmanha
 * @property {string} projetoId
 * @property {string} registradoEm
 */

/**
 * @typedef {object} DiaExecutivo
 * @property {StatusDiaExecutivo} status
 * @property {string|null} abertoEm
 * @property {string|null} encerradoEm
 * @property {string|null} intencaoDoDia
 * @property {RegistroContinuidade[]} continuidade
 */

/**
 * @returns {DiaExecutivo}
 */
export function diaExecutivoVazio() {
  return {
    status: "nao_iniciado",
    abertoEm: null,
    encerradoEm: null,
    intencaoDoDia: null,
    continuidade: []
  };
}

/**
 * Garante estrutura em projetos legados (migração in-place).
 * @param {object} projeto
 */
export function garantirDiaNoProjeto(projeto) {
  if (!projeto.diaExecutivo || typeof projeto.diaExecutivo !== "object") {
    projeto.diaExecutivo = diaExecutivoVazio();
    return projeto.diaExecutivo;
  }
  const d = projeto.diaExecutivo;
  if (!d.status) d.status = "nao_iniciado";
  if (d.abertoEm === undefined) d.abertoEm = null;
  if (d.encerradoEm === undefined) d.encerradoEm = null;
  if (d.intencaoDoDia === undefined) d.intencaoDoDia = null;
  if (!Array.isArray(d.continuidade)) d.continuidade = [];
  return d;
}

/**
 * @param {Date} [agora]
 * @returns {string} YYYY-MM-DD
 */
export function dataRefLocal(agora = new Date()) {
  const y = agora.getFullYear();
  const m = String(agora.getMonth() + 1).padStart(2, "0");
  const d = String(agora.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Cópia segura do dia do projeto.
 * @param {object} projeto
 * @returns {DiaExecutivo}
 */
export function copiarDiaExecutivo(projeto) {
  const d = garantirDiaNoProjeto(projeto);
  return JSON.parse(JSON.stringify(d));
}

/**
 * @param {object} projeto
 * @returns {RegistroContinuidade|null}
 */
export function obterUltimaContinuidadeDoProjeto(projeto) {
  const d = garantirDiaNoProjeto(projeto);
  return d.continuidade[0] ? { ...d.continuidade[0] } : null;
}
