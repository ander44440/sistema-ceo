/**
 * Context Governor — CG-GATE (IMP-093 M4: ENFORCE padrão; SHADOW = rollback).
 */

import { ESTADOS_CG, FONTES_CG, MODO_ENFORCE, MODO_SOMBRA } from "./contratos.js";
import { governarContexto } from "./governarContexto.js";
import { emitirAuditoriaCg } from "./auditoria.js";
import {
  CG_FASE,
  cgBypassPermitido,
  cgEnabled,
  resolverModoCg
} from "./modo.js";
import { contarEtiquetasFragmentos } from "./etiquetarPipeline.js";

/**
 * Monta PedidoGovernancaContexto a partir do pedido LLM + meta CG.
 * @param {object} pedidoLlm
 * @param {object} [metaCg]
 * @returns {import("./contratos.js").PedidoGovernancaContexto}
 */
export function montarPedidoGovernancaDeLlm(pedidoLlm, metaCg = {}) {
  const meta = metaCg && typeof metaCg === "object" ? metaCg : {};
  const pedido = pedidoLlm && typeof pedidoLlm === "object" ? pedidoLlm : {};
  const cg = pedido.cgMeta && typeof pedido.cgMeta === "object" ? pedido.cgMeta : {};
  const m = { ...cg, ...meta };

  const messages = Array.isArray(pedido.messages) ? pedido.messages : [];
  const conteudoCandidato =
    m.conteudoCandidato && typeof m.conteudoCandidato === "object"
      ? m.conteudoCandidato
      : { messages };

  return {
    coaAtivo: m.coaAtivo || null,
    casoAtivo: m.casoAtivo || null,
    objetivoOuAssuntoTurno: m.objetivoOuAssuntoTurno ?? null,
    fontesLastroAutorizadas: Array.isArray(m.fontesLastroAutorizadas)
      ? m.fontesLastroAutorizadas
      : [],
    conteudoCandidato,
    actoChamada: String(m.actoChamada || pedido.actoChamada || "llm_direct"),
    regimeEspecial:
      m.regimeEspecial && typeof m.regimeEspecial === "object"
        ? m.regimeEspecial
        : {},
    metaAuditoria:
      m.metaAuditoria && typeof m.metaAuditoria === "object"
        ? m.metaAuditoria
        : {},
    ...(m.modo || pedido.modo ? { modo: m.modo || pedido.modo } : {})
  };
}

/**
 * Serializa o body HTTP exactamente como o transporte oficial.
 * @param {object} pedidoLlm
 * @returns {string}
 */
export function serializarBodyLlm(pedidoLlm) {
  return JSON.stringify({
    messages: pedidoLlm.messages,
    temperature: pedidoLlm.temperature ?? 0.4,
    max_tokens: pedidoLlm.max_tokens ?? 900
  });
}

/**
 * Extrai messages do pacote autorizado (enviado ⊆ autorizado).
 * Quando existem `fragmentos` (governança CG), eles são a autoridade —
 * nunca se preferem `messages[]` originais que possam ter bypassado o residual (VAL-093.3/T5).
 *
 * @param {object|null} pacoteAutorizado
 * @param {Array<{role:string,content:string}>} messagesOriginais
 * @returns {Array<{role:string,content:string}>}
 */
export function messagesDePacoteAutorizado(pacoteAutorizado, messagesOriginais) {
  void messagesOriginais;
  if (!pacoteAutorizado || typeof pacoteAutorizado !== "object") {
    return [];
  }

  if (Array.isArray(pacoteAutorizado.fragmentos)) {
    return pacoteAutorizado.fragmentos.map((f) => {
      const papel = String(f.papel || "system");
      const role =
        papel === "user" || papel === "usuario"
          ? "user"
          : papel === "assistant" || papel === "ceo" || papel === "assistente"
            ? "assistant"
            : "system";
      return {
        role,
        content: typeof f.texto === "string" ? f.texto : String(f.texto || "")
      };
    });
  }

  if (Array.isArray(pacoteAutorizado.messages)) {
    return pacoteAutorizado.messages.map((m) => ({
      role: m.role,
      content: m.content
    }));
  }

  return [];
}

/**
 * Invariante: cada message enviada existe no pacote autorizado (por content+role).
 * @param {Array<{role:string,content:string}>} enviadas
 * @param {object|null} pacoteAutorizado
 * @returns {boolean}
 */
export function enviadoSubconjuntoAutorizado(enviadas, pacoteAutorizado) {
  if (!Array.isArray(enviadas)) return false;
  if (!pacoteAutorizado) return enviadas.length === 0;
  const autorizadas = messagesDePacoteAutorizado(pacoteAutorizado, []);
  const chave = (m) => `${m.role}\0${m.content}`;
  const set = new Set(autorizadas.map(chave));
  return enviadas.every((m) => set.has(chave(m)));
}

/**
 * Resposta tipificada quando ENFORCE bloqueia (IMP-093 §4.3).
 * @param {import("./contratos.js").ResultadoGovernancaContexto} resultado
 * @param {string} modo
 * @param {object} [extra]
 */
export function respostaBloqueioCg(resultado, modo, extra = {}) {
  const estado = resultado?.estado || ESTADOS_CG.BLOQUEADO_VIOLACAO_INVARIANTE;
  return {
    ok: false,
    codigo: "cg_bloqueado",
    mensagem:
      (resultado?.motivo && resultado.motivo.mensagem) ||
      "Context Governor bloqueou o envio ao LLM.",
    origem: "context_governor",
    texto: "",
    cg: {
      modo,
      fase: CG_FASE,
      estado,
      autorizado: false,
      teriaBloqueado: true,
      auditoriaRef: resultado?.auditoriaRef || null,
      violacoes: resultado?.violacoes || [],
      exigeEsclarecimento: resultado?.exigeEsclarecimento === true,
      declaraInsuficienciaLastro: resultado?.declaraInsuficienciaLastro === true,
      ...extra
    },
    resultadoCg: resultado
  };
}

/**
 * @param {object} pedidoLlm
 * @param {(body: object) => Promise<object>} transportar
 * @param {object} [opts]
 * @param {object} [opts.metaCg]
 * @param {boolean} [opts.harnessSemCg] — só testes; nunca via CG_BYPASS env
 */
export async function atravessarGateLlm(pedidoLlm, transportar, opts = {}) {
  const pedido =
    pedidoLlm && typeof pedidoLlm === "object" ? { ...pedidoLlm } : { messages: [] };

  // CG_BYPASS env nunca é honrado (produção ou não).
  void cgBypassPermitido();

  if (opts.harnessSemCg === true || !cgEnabled()) {
    return transportar({
      messages: pedido.messages,
      temperature: pedido.temperature ?? 0.4,
      max_tokens: pedido.max_tokens ?? 900
    });
  }

  const pedidoGov = montarPedidoGovernancaDeLlm(pedido, opts.metaCg);
  const modo = resolverModoCg({
    ...pedido,
    ...pedidoGov,
    cgMeta: { ...(pedido.cgMeta || {}), ...(opts.metaCg || {}), modo: pedidoGov.modo }
  });
  const resultado = governarContexto(pedidoGov);

  const audit = emitirAuditoriaCg(pedidoGov, resultado, modo);
  if (audit.ok && audit.id) {
    resultado.auditoriaRef = audit.id;
  }

  const frags = pedidoGov.conteudoCandidato?.fragmentos || [];
  const contagem = contarEtiquetasFragmentos(frags);

  const metaCgSaida = {
    modo,
    fase: CG_FASE,
    estado: resultado.estado,
    autorizado: resultado.autorizado,
    teriaBloqueado: resultado.teriaBloqueado === true,
    auditoriaRef: resultado.auditoriaRef || null,
    violacoes: resultado.violacoes || [],
    etiquetas: contagem,
    fontesPadraoHint: FONTES_CG.NAO_ETIQUETADO
  };

  // ——— SHADOW (rollback/diagnóstico via CEO_CG_MODO=sombra) ———
  if (modo === MODO_SOMBRA) {
    const bodyOriginal = {
      messages: pedido.messages,
      temperature: pedido.temperature ?? 0.4,
      max_tokens: pedido.max_tokens ?? 900
    };
    const saida = await transportar(bodyOriginal);
    if (saida && typeof saida === "object") {
      return { ...saida, cg: { ...metaCgSaida, modo: MODO_SOMBRA } };
    }
    return saida;
  }

  // ——— ENFORCE (padrão M4) ———
  if (resultado.autorizado !== true || !resultado.pacoteAutorizado) {
    return respostaBloqueioCg(resultado, MODO_ENFORCE, { etiquetas: contagem });
  }

  const messagesAuth = messagesDePacoteAutorizado(
    resultado.pacoteAutorizado,
    pedido.messages
  );

  if (!enviadoSubconjuntoAutorizado(messagesAuth, resultado.pacoteAutorizado)) {
    return respostaBloqueioCg(
      {
        ...resultado,
        estado: ESTADOS_CG.BLOQUEADO_VIOLACAO_INVARIANTE,
        autorizado: false,
        pacoteAutorizado: null,
        motivo: {
          codigo: "INV_BYPASS",
          mensagem: "Invariante enviado ⊆ autorizado violada — bloqueio fechado."
        },
        violacoes: [...(resultado.violacoes || []), "INV_BYPASS"]
      },
      MODO_ENFORCE,
      { etiquetas: contagem }
    );
  }

  const bodyAuth = {
    messages: messagesAuth,
    temperature: pedido.temperature ?? 0.4,
    max_tokens: pedido.max_tokens ?? 900
  };

  const saida = await transportar(bodyAuth);
  if (saida && typeof saida === "object") {
    return {
      ...saida,
      cg: {
        ...metaCgSaida,
        modo: MODO_ENFORCE,
        enviadoSubconjunto: true,
        nMessagesEnviadas: messagesAuth.length
      }
    };
  }
  return saida;
}

/**
 * Detecta bloqueio CG na saída de deliberarComLlm (M3/M4).
 * @param {object} saida
 */
export function ehBloqueioCg(saida) {
  return Boolean(
    saida &&
      saida.ok === false &&
      saida.codigo === "cg_bloqueado"
  );
}
