/**
 * IMP-086 / ARQ-086 — portas de leitura F-MO / F-TX / F-TR.
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
 * @param {{ coaId: string, termo?: string|null }} opts
 * @param {{ carregarBucket?: typeof carregarBucketChat }} [deps]
 */
export function lerDiscussaoTranscript(opts, deps = {}) {
  const coaId = String(opts.coaId || "").trim();
  const carregar =
    typeof deps.carregarBucket === "function"
      ? deps.carregarBucket
      : carregarBucketChat;
  if (!coaId) {
    return {
      status: "ausente",
      mensagens: [],
      mensagem:
        "Ausência explícita: nenhum COA indicado para consultar o transcript."
    };
  }
  let mensagens = carregar(coaId);
  if (!Array.isArray(mensagens)) mensagens = [];
  const termo = opts.termo ? String(opts.termo).trim().toLocaleLowerCase("pt-BR") : "";
  if (termo) {
    mensagens = mensagens.filter((m) =>
      String(m && m.texto ? m.texto : "")
        .toLocaleLowerCase("pt-BR")
        .includes(termo)
    );
  }
  if (!mensagens.length) {
    return {
      status: "ausente",
      mensagens: [],
      mensagem: termo
        ? `Ausência explícita: nada no transcript do COA sobre “${opts.termo}”.`
        : "Ausência explícita: nenhuma mensagem registada no transcript deste COA."
    };
  }
  return { status: "encontrado", mensagens };
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
