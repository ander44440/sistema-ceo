/**
 * Context Governor — normalização de fragmentos (CG-FRAG).
 */

import { FONTES_CG, USOS_CG } from "./contratos.js";

/**
 * @param {unknown} valor
 * @returns {string}
 */
function texto(valor) {
  if (valor == null) return "";
  if (typeof valor === "string") return valor.trim();
  return String(valor).trim();
}

/**
 * Normaliza `conteudoCandidato` → FragmentoContexto[].
 * Blobs legacy `{ messages }` viram fragmentos `nao_etiquetado`.
 *
 * @param {unknown} conteudoCandidato
 * @returns {import("./contratos.js").FragmentoContexto[]}
 */
export function expandirFragmentos(conteudoCandidato) {
  if (!conteudoCandidato || typeof conteudoCandidato !== "object") {
    return [];
  }

  const c = /** @type {Record<string, unknown>} */ (conteudoCandidato);

  if (Array.isArray(c.fragmentos)) {
    return c.fragmentos
      .filter((f) => f && typeof f === "object")
      .map((f, i) => normalizarFragmento(f, i));
  }

  if (Array.isArray(c.messages)) {
    return c.messages.map((m, i) => {
      const msg = m && typeof m === "object" ? m : {};
      return {
        id: texto(msg.id) || `msg-${i}`,
        papel: texto(msg.role) || "user",
        texto:
          typeof msg.content === "string"
            ? msg.content
            : msg.content == null
              ? ""
              : JSON.stringify(msg.content),
        coaId: msg.coaId != null ? texto(msg.coaId) || null : null,
        casoId: msg.casoId != null ? texto(msg.casoId) || null : null,
        fonte: FONTES_CG.NAO_ETIQUETADO,
        uso: USOS_CG.MANDATO_PROMPT
      };
    });
  }

  return [
    {
      id: "blob-0",
      papel: "anexo",
      texto: "",
      payload: c,
      coaId: null,
      casoId: null,
      fonte: FONTES_CG.NAO_ETIQUETADO,
      uso: USOS_CG.MANDATO_PROMPT
    }
  ];
}

/**
 * @param {object} f
 * @param {number} i
 * @returns {import("./contratos.js").FragmentoContexto}
 */
function normalizarFragmento(f, i) {
  const fonte = texto(f.fonte) || FONTES_CG.NAO_DECLARADA;
  return {
    id: texto(f.id) || `frag-${i}`,
    papel: texto(f.papel) || "anexo",
    texto: typeof f.texto === "string" ? f.texto : f.texto == null ? "" : String(f.texto),
    payload: f.payload,
    coaId: f.coaId != null ? texto(f.coaId) || null : null,
    casoId: f.casoId != null ? texto(f.casoId) || null : null,
    fonte,
    uso: texto(f.uso) || USOS_CG.MANDATO_PROMPT
  };
}

/**
 * @param {string} [papel]
 * @returns {"user"|"assistant"|"system"}
 */
function papelParaRole(papel) {
  const p = String(papel || "system");
  if (p === "user" || p === "usuario") return "user";
  if (p === "assistant" || p === "ceo" || p === "assistente") return "assistant";
  return "system";
}

/**
 * Materializa messages LLM a partir do residual autorizado (única autoridade pós-isolamento).
 * @param {import("./contratos.js").FragmentoContexto[]} residual
 * @returns {Array<{role:string,content:string}>}
 */
function messagesFromResidual(residual) {
  return (Array.isArray(residual) ? residual : []).map((f) => ({
    role: papelParaRole(f?.papel),
    content:
      typeof f?.texto === "string" ? f.texto : f?.texto == null ? "" : String(f.texto)
  }));
}

/**
 * Reconstrói pacote candidato a partir de fragmentos residuais.
 * Quando há governança por `fragmentos`, `messages[]` é sempre reconstruída do residual —
 * nunca se preservam messages originais rejeitadas (VAL-093.3/T5).
 *
 * @param {object} conteudoOriginal
 * @param {import("./contratos.js").FragmentoContexto[]} residual
 * @returns {object}
 */
export function recomporPacote(conteudoOriginal, residual) {
  const residualArr = Array.isArray(residual) ? residual : [];
  const base =
    conteudoOriginal && typeof conteudoOriginal === "object"
      ? { ...conteudoOriginal }
      : {};

  // Governança por fragmentos: residual é a autoridade do pacote.
  if (Array.isArray(base.fragmentos)) {
    return {
      ...base,
      fragmentos: residualArr,
      messages: messagesFromResidual(residualArr)
    };
  }

  // Legacy: só messages no candidato → filtrar por id residual.
  if (Array.isArray(base.messages)) {
    const byId = new Map(residualArr.map((f) => [f.id, f]));
    const messages = base.messages
      .map((m, i) => {
        const id = (m && m.id) || `msg-${i}`;
        return byId.has(id) ? m : null;
      })
      .filter(Boolean);
    return { ...base, messages };
  }

  return {
    ...base,
    fragmentos: residualArr
  };
}
