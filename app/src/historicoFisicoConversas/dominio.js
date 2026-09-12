/**
 * Histórico Físico das Conversas — domínio (1ª fatia).
 * ARQ-087 / REQ-087. Distinto de F5-C3, MO, Trilha e MEP.
 */

export const SCHEMA_VERSAO = 1;
export const TIPO_CONVERSA_MENSAGEM = "conversa.mensagem";
export const COA_SEM_CONTEXTO = "__sem_coa__";

export const PAPEIS = Object.freeze(["usuario", "ceo", "sistema"]);
export const ESTADOS_DURAVEIS = Object.freeze(["pronta", "erro"]);

export const CHAVES_PAYLOAD_PROIBIDAS = Object.freeze([
  "mensagens",
  "mensagem",
  "transcript",
  "transcriptCliente",
  "conversasCliente",
  "decisao",
  "quem",
  "porque",
  "baseadoEm",
  "resultado",
  "itemKnw",
  "itemKnwConteudo",
  "knw",
  "eventosMep",
  "mepCeo",
  "jobId",
  "gateId",
  "moRegistroId",
  "parecerId"
]);

/**
 * @param {unknown} valor
 * @returns {string}
 */
export function texto(valor) {
  if (valor == null) return "";
  if (typeof valor === "string") return valor.trim();
  return String(valor).trim();
}

/**
 * @param {string} msgId
 * @returns {string}
 */
export function idEventoHfc(msgId) {
  return `hfc-${texto(msgId)}`;
}

/**
 * @param {unknown} coaId
 * @returns {string}
 */
export function normalizarCoaId(coaId) {
  const c = texto(coaId);
  return c || COA_SEM_CONTEXTO;
}

/**
 * @param {object} obj
 * @returns {{ ok: true } | { ok: false, codigo: string, mensagem: string, chaves: string[] }}
 */
export function validarPayloadSemFamiliasProibidas(obj) {
  if (!obj || typeof obj !== "object") {
    return {
      ok: false,
      codigo: "evento_invalido",
      mensagem: "Objecto ausente.",
      chaves: []
    };
  }
  /** @type {string[]} */
  const chaves = [];
  for (const k of CHAVES_PAYLOAD_PROIBIDAS) {
    if (Object.prototype.hasOwnProperty.call(obj, k)) chaves.push(k);
  }
  if (chaves.length) {
    return {
      ok: false,
      codigo: "payload_proibido",
      mensagem: `Payload contém chaves proibidas: ${chaves.join(", ")}`,
      chaves
    };
  }
  return { ok: true };
}

/**
 * Prepara evento sem `ordem` / `registadoEm` (atribuídos no store físico).
 * @param {{ mensagem: object, coaId?: string|null }} entrada
 * @returns {{ ok: true, parcial: object } | { ok: false, codigo: string, mensagem: string }}
 */
export function prepararEventoMensagem(entrada) {
  const mensagem = entrada && entrada.mensagem;
  if (!mensagem || typeof mensagem !== "object") {
    return {
      ok: false,
      codigo: "mensagem_ausente",
      mensagem: "Mensagem ausente."
    };
  }

  const estado = texto(mensagem.estado) || "pronta";
  if (estado === "pendente") {
    return {
      ok: false,
      codigo: "estado_pendente",
      mensagem: "Mensagens pendentes não entram no HFC."
    };
  }
  if (!ESTADOS_DURAVEIS.includes(estado)) {
    return {
      ok: false,
      codigo: "estado_invalido",
      mensagem: `Estado não durável: ${estado}`
    };
  }

  const msgId = texto(mensagem.id);
  if (!msgId) {
    return {
      ok: false,
      codigo: "msg_id_ausente",
      mensagem: "msgId obrigatório."
    };
  }

  const papel = texto(mensagem.papel);
  if (!PAPEIS.includes(papel)) {
    return {
      ok: false,
      codigo: "papel_invalido",
      mensagem: `Papel inválido: ${papel}`
    };
  }

  const corpo = mensagem.texto == null ? "" : String(mensagem.texto);
  if (estado === "pronta" && corpo.trim() === "") {
    return {
      ok: false,
      codigo: "texto_vazio",
      mensagem: "Texto vazio não é registado no HFC."
    };
  }

  const parcial = {
    schemaVersao: SCHEMA_VERSAO,
    tipo: TIPO_CONVERSA_MENSAGEM,
    id: idEventoHfc(msgId),
    coaId: normalizarCoaId(entrada.coaId),
    msgId,
    papel,
    texto: corpo,
    criadoEm: texto(mensagem.criadoEm) || new Date().toISOString(),
    estado
  };

  const proibido = validarPayloadSemFamiliasProibidas(parcial);
  if (!proibido.ok) {
    return {
      ok: false,
      codigo: proibido.codigo,
      mensagem: proibido.mensagem
    };
  }

  return { ok: true, parcial };
}
