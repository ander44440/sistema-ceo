/**
 * IMP-094 Fase 1 — Porta Canónica (ARQ-094 / REQ-094).
 * Camada anterior a clarificação / MRE / LLM para LFC, protocolo e DIC/identidade.
 * Rollback: CEO_FUNIL_PORTA_CANONICA=off
 */

import { tentarRespostaProtocoloExecutivo } from "./protocoloAgenteExecutivo.js";
import { processarTurnoLfc } from "../lastroFactualCaso/wiringConversacional.js";
import { obterLfcRuntime } from "../lastroFactualCaso/runtimeLfc.js";
import { detectarModoRespostaRestrita } from "../classificadorIntencao/pedidoRespostaRestrita.js";
import { tentarRespostaRestrita } from "../classificadorIntencao/comporRespostaRestrita.js";
import { tentarRespostaDeclaracaoDecisao } from "../classificadorIntencao/declaracaoDecisaoUtilizador.js";
import { obterCoaAtivo } from "./coaSessao.js";
import { obterProjeto } from "../catalogoProjetos/index.js";

/** Modos de protocolo classificados como DIC/identidade (OBS-2). */
const MODOS_DIC = new Set([
  "papel_sistema",
  "diferenca_especialista",
  "autodiagnostico_papel",
  "coa_sessao_activo"
]);

const MODOS_LFC = new Set(["dado_unico", "factos", "registo", "confirmacao"]);

/**
 * Porta Canónica activa por omissão; desliga com CEO_FUNIL_PORTA_CANONICA=off.
 * @returns {boolean}
 */
export function funilPortaCanonicaActiva() {
  const env =
    (typeof process !== "undefined" && process.env?.CEO_FUNIL_PORTA_CANONICA) ||
    (typeof import.meta !== "undefined" &&
      import.meta.env &&
      import.meta.env.CEO_FUNIL_PORTA_CANONICA) ||
    "";
  return String(env).trim().toLowerCase() !== "off";
}

/**
 * @param {string|null|undefined} modoProtocolo
 * @returns {"protocolo"|"dic"}
 */
export function familiaProtocoloOuDic(modoProtocolo) {
  return MODOS_DIC.has(String(modoProtocolo || "")) ? "dic" : "protocolo";
}

/**
 * Sessão Abrir COA: `ctx.coaId` + espelho `obterCoaAtivo`.
 * @param {{ coaId?: string|null, coaNome?: string|null }} [ctx]
 * @returns {{ id: string, nome: string|null }|null}
 */
export function resolverCoaSessaoConfirmacao(ctx = {}) {
  const idCtx =
    ctx.coaId != null && String(ctx.coaId).trim()
      ? String(ctx.coaId).trim()
      : null;
  const sessao = obterCoaAtivo();
  const id = idCtx || (sessao?.id ? String(sessao.id) : null);
  if (!id) return null;
  if (sessao && String(sessao.id) === id) {
    return { id, nome: sessao.nome || null };
  }
  const projeto = obterProjeto(id);
  if (projeto) {
    return { id: projeto.id, nome: projeto.nome || null };
  }
  return { id, nome: ctx.coaNome || null };
}

/**
 * OBS-1 / OBS-2 / OBS-3 (ARQ-094 §7) — veredicto canónico sem LLM.
 * @param {object} resposta
 * @param {{ familiaCanonico: "lfc"|"protocolo"|"dic", modo?: string|null, coaId?: string|null, casoId?: string|null }} opts
 * @returns {object}
 */
export function anexarObservabilidadeCanonico(resposta, opts) {
  const familia = opts?.familiaCanonico || "protocolo";
  const modo = opts?.modo != null ? opts.modo : null;
  const dadosPrev = resposta?.dados && typeof resposta.dados === "object"
    ? resposta.dados
    : {};
  return {
    ...resposta,
    dados: {
      ...dadosPrev,
      veredictoCaminho: "canonico",
      familiaCanonico: familia,
      llmInvocado: false,
      ...(modo != null ? { modoCanonico: modo } : {}),
      ...(opts?.coaId !== undefined ? { coaId: opts.coaId } : {}),
      ...(opts?.casoId !== undefined ? { casoId: opts.casoId } : {})
    }
  };
}

/**
 * Resolve resposta canónica se o pedido for LFC / protocolo / DIC.
 * @param {string} texto
 * @param {{
 *   historico?: object[],
 *   coaId?: string|null,
 *   coaNome?: string|null,
 *   lfcWriter?: object,
 *   lfcReader?: object,
 *   lfcBaseUrl?: string,
 *   permitirFallbackReparse?: boolean
 * }} [ctx]
 * @returns {Promise<{
 *   activo: boolean,
 *   mensagem?: string,
 *   familiaCanonico?: "lfc"|"protocolo"|"dic",
 *   modo?: string|null,
 *   fonte?: string|null,
 *   dadosExtras?: object
 * }>}
 */
export async function resolverRespostaCanonica(texto, ctx = {}) {
  if (!funilPortaCanonicaActiva()) {
    return { activo: false };
  }

  const coaSessao = resolverCoaSessaoConfirmacao(ctx);
  const protocolo = tentarRespostaProtocoloExecutivo(texto, { coa: coaSessao });
  if (protocolo.activo && protocolo.mensagem) {
    const familia = familiaProtocoloOuDic(protocolo.modo);
    /** @type {Record<string, unknown>} */
    const dadosExtras = {
      modoProtocolo: protocolo.modo,
      rota: "porta_canonica"
    };
    if (protocolo.modo === "coa_sessao_activo") {
      dadosExtras.coaId = coaSessao?.id ?? null;
      dadosExtras.casoId = null;
    }
    return {
      activo: true,
      mensagem: protocolo.mensagem,
      familiaCanonico: familia,
      modo: protocolo.modo || null,
      fonte: "protocolo_executivo",
      dadosExtras
    };
  }

  // F13/C6 + F24/T16 — literal / sim-não fechado prevalecem sobre histórico/MRE (não LFC)
  const detRestrita = detectarModoRespostaRestrita(texto);
  if (
    detRestrita.activo &&
    (detRestrita.modo === "literal" || detRestrita.modo === "sim_nao")
  ) {
    const out = tentarRespostaRestrita(texto, {
      historico: ctx.historico || []
    });
    if (out.activo && out.mensagem != null && String(out.mensagem).length > 0) {
      const modo = detRestrita.modo;
      return {
        activo: true,
        mensagem: out.mensagem,
        familiaCanonico: "protocolo",
        modo,
        fonte: modo === "literal" ? "resposta_literal" : "resposta_sim_nao",
        dadosExtras: {
          rota: "resposta_restrita",
          modoRespostaRestrita: modo
        }
      };
    }
  }

  // F15/C4 — declaração de decisão do utilizador (não deliberação, não Job)
  const outDec = tentarRespostaDeclaracaoDecisao(texto);
  if (outDec.activo && outDec.mensagem) {
    return {
      activo: true,
      mensagem: outDec.mensagem,
      familiaCanonico: "protocolo",
      modo: "decisao_utilizador",
      fonte: "declaracao_decisao",
      dadosExtras: {
        rota: "declaracao_decisao",
        enunciadoDecisao: outDec.enunciado || null
      }
    };
  }

  const detLfc = detectarModoRespostaRestrita(texto);
  if (detLfc.activo && detLfc.modo && MODOS_LFC.has(detLfc.modo)) {
    const runtime = obterLfcRuntime({
      writer: ctx.lfcWriter,
      reader: ctx.lfcReader,
      baseUrl: ctx.lfcBaseUrl
    });
    const out = await processarTurnoLfc(texto, {
      historico: ctx.historico || [],
      coaId: ctx.coaId || null,
      writer: runtime.writer,
      reader: runtime.reader,
      permitirFallbackReparse: ctx.permitirFallbackReparse !== false
    });
    if (out.activo && out.mensagem) {
      return {
        activo: true,
        mensagem: out.mensagem,
        familiaCanonico: "lfc",
        modo: out.modo || detLfc.modo,
        fonte: out.fonte || "lfc",
        dadosExtras: {
          modoRespostaRestrita: out.modo,
          fonteLfc: out.fonte || null,
          lfc: out.dados?.lfc || null,
          casoId: out.dados?.casoId ?? out.dados?.lfc?.casoId ?? null,
          coaId: ctx.coaId || null,
          rota: "porta_canonica",
          ...(out.dados?.marcadoresLn
            ? { marcadoresLn: out.dados.marcadoresLn }
            : out.fonte === "lfc_sem_coa"
              ? { marcadoresLn: ["LN-09"], codigoCoa: "coa_ausente" }
              : {})
        }
      };
    }
  }

  return { activo: false };
}
