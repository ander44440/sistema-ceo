/**
 * IMP-072 / CAP-13 — Domínio da MEP-CEO.
 * Constantes homologadas (VIS-009 · REQ-085 · ARQ-033). Sem C3, UI, Motor, MRE, EIC.
 */

export const EIXO_PRODUTO = "produto";

export const TIPOS_OBJECTO = Object.freeze([
  "MCP",
  "EPC",
  "MDL",
  "DCP",
  "EVD",
  "PND",
  "BSL",
  "RMP",
  "MEV"
]);

/** Objectos de catálogo que exigem aval do Usuário em DEFINIDO e HOMOLOGADO (RN-03.5). */
export const TIPOS_CATALOGO_EXIGE_USUARIO = Object.freeze(["MCP", "EPC"]);

export const MATURIDADES = Object.freeze([
  "CONCEBIDO",
  "DEFINIDO",
  "EM_CONSTRUÇÃO",
  "EM_VALIDAÇÃO",
  "HOMOLOGADO",
  "BASELINE"
]);

export const TRABALHOS = Object.freeze([
  "SEM_PENDÊNCIA",
  "PENDÊNCIA_ATIVA",
  "EM_INVESTIGAÇÃO",
  "BLOQUEADO"
]);

export const PAPEIS = Object.freeze([
  "ceo_agente",
  "cto",
  "usuario",
  "engenheiro"
]);

/** Transições canónicas de maturidade (de → para). Criação usa de = null. */
export const TRANSICOES_CANONICAS = Object.freeze([
  Object.freeze({ de: null, para: "CONCEBIDO" }),
  Object.freeze({ de: "CONCEBIDO", para: "DEFINIDO" }),
  Object.freeze({ de: "DEFINIDO", para: "EM_CONSTRUÇÃO" }),
  Object.freeze({ de: "EM_CONSTRUÇÃO", para: "EM_VALIDAÇÃO" }),
  Object.freeze({ de: "EM_VALIDAÇÃO", para: "HOMOLOGADO" }),
  Object.freeze({ de: "HOMOLOGADO", para: "BASELINE" })
]);

export const TIPOS_EVIDENCIA = Object.freeze([
  "VIS",
  "REQ",
  "ARQ",
  "IMP",
  "VAL",
  "ADR",
  "ANL",
  "commit",
  "teste",
  "despacho",
  "lacuna"
]);

export const TIPOS_CONTEUDO_ORGANIZACAO = Object.freeze([
  "dados_cliente",
  "conversa_cliente",
  "conhecimento_operacional_cliente",
  "decisao_privada_cliente",
  "facto_organizacao"
]);

export const CAMPOS_DCP = Object.freeze([
  "quem",
  "quando",
  "porQue",
  "baseadoEm",
  "resultado"
]);

export function classificacaoDeMaturidade(maturidade) {
  if (maturidade === "CONCEBIDO") return "hipotese";
  if (maturidade === "HOMOLOGADO" || maturidade === "BASELINE") return "facto_homologado";
  return "facto_proposto";
}

export function normalizarPapeis(papelOuPapeis) {
  if (Array.isArray(papelOuPapeis)) {
    return papelOuPapeis.map((p) => String(p || "").trim()).filter(Boolean);
  }
  const p = String(papelOuPapeis || "").trim();
  return p ? [p] : [];
}

export function evidenciaValida(evidencia) {
  if (!evidencia || typeof evidencia !== "object") return false;
  const tipo = String(evidencia.tipo || "").trim();
  const referencia = String(evidencia.referencia || "").trim();
  return Boolean(tipo && referencia);
}
