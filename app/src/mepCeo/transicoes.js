/**
 * IMP-072 / REQ-085 RN-03 — Transições canónicas e alçadas.
 * Saltos omitidos = recusados. Autoridade Delegada não promove por omissão.
 */

import {
  MATURIDADES,
  TIPOS_CATALOGO_EXIGE_USUARIO,
  TRANSICOES_CANONICAS,
  classificacaoDeMaturidade,
  normalizarPapeis
} from "./dominio.js";

export function transicaoCanonica(de, para) {
  return TRANSICOES_CANONICAS.some((t) => t.de === de && t.para === para);
}

/**
 * Papéis que devem estar presentes para promover `de` → `para` no tipo dado.
 * @returns {string[] | null} null = transição ilícita
 */
export function papeisExigidos(de, para, tipoObjecto) {
  if (!transicaoCanonica(de, para)) return null;
  if (para === "CONCEBIDO") {
    return ["ceo_agente"];
  }
  if (para === "DEFINIDO") {
    return TIPOS_CATALOGO_EXIGE_USUARIO.includes(tipoObjecto)
      ? ["cto", "usuario"]
      : ["cto"];
  }
  if (para === "EM_CONSTRUÇÃO" || para === "EM_VALIDAÇÃO") {
    return ["cto"];
  }
  if (para === "HOMOLOGADO") {
    return TIPOS_CATALOGO_EXIGE_USUARIO.includes(tipoObjecto)
      ? ["cto", "usuario"]
      : ["cto"];
  }
  if (para === "BASELINE") {
    return ["usuario"];
  }
  return null;
}

export function alçadaSuficiente(de, para, tipoObjecto, papelOuPapeis) {
  const exigidos = papeisExigidos(de, para, tipoObjecto);
  if (!exigidos) return false;
  const presentes = normalizarPapeis(papelOuPapeis);
  if (presentes.includes("autoridade_delegada") && (para === "HOMOLOGADO" || para === "BASELINE")) {
    return false;
  }
  if (para === "CONCEBIDO") {
    return (
      presentes.includes("ceo_agente") ||
      presentes.includes("cto") ||
      presentes.includes("usuario") ||
      presentes.includes("engenheiro")
    );
  }
  return exigidos.every((p) => presentes.includes(p));
}

export function saltoIlicito(de, para) {
  if (!MATURIDADES.includes(para)) return true;
  if (de === para) return true;
  return !transicaoCanonica(de, para);
}

export { classificacaoDeMaturidade };
