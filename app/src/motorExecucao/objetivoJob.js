/**
 * Etapa 1 — objectivo canónico do Job (persistência na publicação).
 * `objetivo` = tarefa completa. Não truncar. Título não é fonte.
 * Compatibilidade de leitura de pedidos legado: `descricao` só se o campo
 * `objetivo` estiver ausente (não se estiver presente e vazio).
 */

export const MOTIVO_OBJETIVO_AUSENTE = "objetivo_ausente";

const MSG_OBJETIVO_AUSENTE =
  "objetivo_ausente: Job novo exige objetivo (string não vazia). Título não substitui o objetivo.";

/**
 * @param {object|null|undefined} entrada
 * @returns {string}
 */
export function textoObjetivoCanonico(entrada) {
  if (!entrada || typeof entrada !== "object") return "";
  if (Object.prototype.hasOwnProperty.call(entrada, "objetivo")) {
    return String(entrada.objetivo ?? "").trim();
  }
  return String(entrada.descricao || "").trim();
}

/**
 * @param {object|null|undefined} entrada
 * @returns {{ ok: true, objetivo: string } | { ok: false, motivo: string, mensagem: string }}
 */
export function exigirObjetivoCanonico(entrada) {
  const objetivo = textoObjetivoCanonico(entrada);
  if (!objetivo) {
    return {
      ok: false,
      motivo: MOTIVO_OBJETIVO_AUSENTE,
      mensagem: MSG_OBJETIVO_AUSENTE
    };
  }
  return { ok: true, objetivo };
}
