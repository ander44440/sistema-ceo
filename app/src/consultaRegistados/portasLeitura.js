/**
 * IMP-086 / ARQ-086 — portas de leitura F-MO / F-TX / F-TR.
 * IMP-089 Fatia 1 — F-TX consome HFC (read-only); F-TR soft-fail.
 * Somente leitura. Sem stores novos.
 */

import {
  consultarRegistosMo,
  listarRegistosMo
} from "../memoriaConfiavel/index.js";
import { carregarBucketChat } from "../modules/conversa/persistenciaChat.js";

/**
 * @param {{ coaId: string, termo?: string|null }} opts
 * @param {{ consultarMo?: typeof consultarRegistosMo }} [deps]
 */
export function lerDecisoesMo(opts, deps = {}) {
  const coaId = String(opts.coaId || "").trim();
  const termo = opts.termo ? String(opts.termo).trim() : "";
  const consultar =
    typeof deps.consultarMo === "function" ? deps.consultarMo : consultarRegistosMo;
  if (!coaId) {
    return {
      status: "ausente",
      registos: [],
      mensagem:
        "Ausência explícita: nenhum COA indicado para consultar decisões na Memória Confiável."
    };
  }
  return consultar({
    coaId,
    ...(termo ? { termo } : {})
  });
}

/**
 * Normaliza evento HFC → forma de mensagem de discussão.
 * @param {object} e
 * @returns {object|null}
 */
function mensagemDesdeHfc(e) {
  if (!e || typeof e !== "object") return null;
  const id = String(e.msgId || e.id || "").trim();
  if (!id) return null;
  return {
    id: e.msgId ? String(e.msgId) : id,
    papel: e.papel || "?",
    texto: e.texto == null ? "" : String(e.texto),
    criadoEm: e.criadoEm || null,
    estado: e.estado || null,
    fonte: "hfc"
  };
}

/**
 * @param {object} m
 * @returns {object}
 */
function mensagemDesdeTranscript(m) {
  return {
    id: m && m.id != null ? String(m.id) : "",
    papel: (m && m.papel) || "?",
    texto: m && m.texto != null ? String(m.texto) : "",
    criadoEm: (m && m.criadoEm) || null,
    estado: (m && m.estado) || null,
    fonte: "f5c3"
  };
}

/**
 * F-TX Fatia 1: HFC primário + união deduplicada com F5-C3 (msgId).
 * Soft-fail HFC: lista vazia se deps/listagem falhar.
 * @param {{ coaId: string, termo?: string|null }} opts
 * @param {{
 *   listarHfcPorCoa?: (coaId: string) => object[],
 *   carregarBucket?: typeof carregarBucketChat
 * }} [deps]
 */
export function lerDiscussao(opts, deps = {}) {
  const coaId = String(opts.coaId || "").trim();
  if (!coaId) {
    return {
      status: "ausente",
      mensagens: [],
      mensagem:
        "Ausência explícita: nenhum COA indicado para consultar discussões registadas."
    };
  }

  /** @type {object[]} */
  let hfcRaw = [];
  try {
    if (typeof deps.listarHfcPorCoa === "function") {
      const r = deps.listarHfcPorCoa(coaId);
      hfcRaw = Array.isArray(r) ? r : [];
    }
  } catch {
    hfcRaw = [];
  }

  const carregar =
    typeof deps.carregarBucket === "function"
      ? deps.carregarBucket
      : carregarBucketChat;
  let txRaw = [];
  try {
    txRaw = carregar(coaId);
    if (!Array.isArray(txRaw)) txRaw = [];
  } catch {
    txRaw = [];
  }

  /** @type {Map<string, object>} */
  const porId = new Map();
  for (const e of hfcRaw) {
    const m = mensagemDesdeHfc(e);
    if (m && m.id) porId.set(m.id, m);
  }
  for (const t of txRaw) {
    const m = mensagemDesdeTranscript(t);
    if (!m.id) continue;
    if (!porId.has(m.id)) porId.set(m.id, m);
  }

  let mensagens = Array.from(porId.values());
  const termo = opts.termo ? String(opts.termo).trim().toLocaleLowerCase("pt-BR") : "";
  if (termo) {
    mensagens = mensagens.filter((m) =>
      String(m.texto || "")
        .toLocaleLowerCase("pt-BR")
        .includes(termo)
    );
  }

  if (!mensagens.length) {
    return {
      status: "ausente",
      mensagens: [],
      mensagem: termo
        ? `Ausência explícita: nada no histórico do COA sobre “${opts.termo}”.`
        : "Ausência explícita: nenhuma discussão registada no histórico deste COA (HFC/transcript)."
    };
  }
  return { status: "encontrado", mensagens };
}

/**
 * Alias IMP-086 — delega à Fatia 1 (HFC + F5-C3).
 * @param {{ coaId: string, termo?: string|null }} opts
 * @param {object} [deps]
 */
export function lerDiscussaoTranscript(opts, deps = {}) {
  return lerDiscussao(opts, deps);
}

/**
 * Correlação opcional — falha soft.
 * @param {{ moIds?: string[] }} opts
 * @param {{ listarPorMo?: (moId: string) => object[] }} [deps]
 * @returns {{ refs: object[], ok: boolean }}
 */
export function lerRefsTrilhaOpcional(opts = {}, deps = {}) {
  const ids = Array.isArray(opts.moIds)
    ? opts.moIds.map((x) => String(x || "").trim()).filter(Boolean)
    : [];
  if (!ids.length) return { refs: [], ok: true };
  if (typeof deps.listarPorMo !== "function") {
    return { refs: [], ok: true };
  }
  try {
    /** @type {object[]} */
    const refs = [];
    for (const moId of ids) {
      const evs = deps.listarPorMo(moId) || [];
      for (const e of evs) {
        if (e && e.refs) {
          refs.push({
            moRegistroId: moId,
            tipo: e.tipo || null,
            jobId: e.refs.jobId || null,
            gateId: e.refs.gateId || null,
            eventoId: e.id || null
          });
        }
      }
    }
    return { refs, ok: true };
  } catch {
    return { refs: [], ok: false };
  }
}

/** Exposto para testes de isolamento / contagem. */
export function listarSoCoa(coaId) {
  return listarRegistosMo({ coaId: String(coaId || "").trim() });
}
