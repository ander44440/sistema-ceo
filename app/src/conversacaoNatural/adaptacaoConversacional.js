/**
 * DESP-006 — Adaptação conversacional (calibração comportamental).
 * Ajusta profundidade, detalhe e condução ao momento — sem nova capacidade.
 * CTO-002: modo EXECUTAR força compressão (sem deliberação residual).
 */

import { detectarModoExecutivo } from "./disciplinaExecutiva.js";
import { extrairEstadoOperacional } from "./estadoOperacional.js";

/** @typedef {"rapido"|"exploratorio"|"detalhe"|"execucao"|"mudanca"|"bloqueio"|"padrao"|"compacto"} ModoAdaptacao */

/**
 * @param {object} opts
 * @param {string} [opts.instrucao]
 * @param {boolean} [opts.pediuDetalhe]
 * @param {object} [opts.ctxImediato]
 * @param {object} [opts.parecer]
 * @param {string} [opts.canal]
 * @param {string} [opts.eventoObjectivo]
 * @returns {ModoAdaptacao}
 */
export function detectarModoAdaptacao(opts = {}) {
  const canal = opts.canal || "chat";
  if (canal === "centro_situacao") return "compacto";

  const parecer = opts.parecer;
  const estado = parecer?.decisaoExecutiva?.estado;
  if (estado === "solicitar_dados") return "bloqueio";

  const instrucao = String(opts.instrucao || "").trim();
  const ctx = opts.ctxImediato || {};

  // Pedido explícito de detalhe prevalece sobre compressão EXECUTAR
  if (
    opts.pediuDetalhe === true ||
    /(porqu[eê]|detalh|explica|justif|elabora|desenvolv)/i.test(instrucao)
  ) {
    return "detalhe";
  }

  const estadoOp =
    ctx.estadoOperacional ||
    extrairEstadoOperacional({
      lastroConsciencia: opts.lastroConsciencia || ctx.lastroConsciencia,
      historico: opts.historico || ctx.historico,
      estadoOperacional: opts.estadoOperacional
    });

  // CTO-002/003: autoridade, Job activo ou recuperação → execução
  const modoEx = detectarModoExecutivo({
    instrucao,
    parecer,
    missaoActiva: Boolean(ctx.missaoActiva),
    lastroConsciencia: opts.lastroConsciencia || ctx.lastroConsciencia,
    estadoOperacional: estadoOp,
    historico: opts.historico || ctx.historico
  });
  if (modoEx === "executar" || modoEx === "recuperar") {
    return "execucao";
  }

  const mudancaIntencao =
    ctx.houveShiftTopico === true ||
    opts.eventoObjectivo === "mudar" ||
    opts.eventoObjectivo === "ambiguo_objetivo" ||
    /\b(mudando\s+(de\s+)?assunto|outro\s+assunto|agora\s+quero|em\s+vez\s+disso)\b/i.test(
      instrucao
    );
  if (mudancaIntencao) return "mudanca";

  if (ehConfirmacaoRapida(instrucao)) return "rapido";

  const tipo = String(parecer?.enquadramento?.tipoPedido || "");
  if (
    tipo === "execucao" ||
    /\b(implementa|executa|despacha|corre\s+o|faz\s+o\s+job|publica)\b/i.test(
      instrucao
    )
  ) {
    return "execucao";
  }

  if (ehExploratorio(instrucao)) return "exploratorio";

  return "padrao";
}

/**
 * Ajusta camadas já compostas ao modo (profundidade / detalhe / condução).
 * @param {Record<string, string|null>} camadas
 * @param {ModoAdaptacao} modo
 * @param {object} [opts]
 * @param {number} [opts.confianca]
 * @returns {Record<string, string|null>}
 */
export function adaptarCamadasAoModo(camadas, modo, opts = {}) {
  const c = { ...camadas };
  const confianca = Number(opts.confianca);

  switch (modo) {
    case "compacto":
      return {
        A: c.A,
        B: c.B,
        C: null,
        D: null,
        E: null,
        F: null,
        P: null,
        N: null,
        M: null
      };

    case "rapido": {
      // Resposta curta; em missão activa (DESP-008) mantém um sinal de condução
      c.P = null;
      c.M = null;
      c.C = null;
      if (!opts.missaoActiva) {
        c.N = null;
        c.F = null;
      } else {
        // Mantém N (próxima/pendência) ou F parcial; nunca plano/síntese
        if (c.N && !/Antecipo|pendência|Impacto|risco|depend/i.test(c.N)) {
          c.N = null;
        }
      }
      if (c.A) {
        c.A = c.A
          .replace(/\s*Em alternativa ficaria[^.]*\./gi, "")
          .replace(/\s*Critério de mudança:[^.]*\./gi, "")
          .trim();
      }
      break;
    }

    case "detalhe":
      // Mantém tudo; reforça que síntese C deve existir se houver fonte
      break;

    case "execucao":
      // CTO-002: executar — só o quê/resultado; sem ensaio, plano, pergunta, fecho
      c.C = null;
      c.P = null;
      c.F = null;
      c.D = null;
      c.N = null;
      c.M = null;
      // Âncora E só se não for objectivo inventado
      if (
        c.E &&
        /definir\s+o\s+efeito\s+esperado|É isso|mudámos de prioridade/i.test(c.E)
      ) {
        c.E = null;
      }
      if (c.A) {
        c.A = c.A
          .replace(/\s*Em alternativa ficaria[^.]*\./gi, "")
          .replace(/\s*Critério:[^.]*\./gi, "")
          .replace(/\s*Critério de mudança:[^.]*\./gi, "")
          .replace(/\s*Se autorizar[^.]*\./gi, "")
          .replace(/\s*Avançamos[^.]*\?/gi, "")
          .trim();
      }
      break;

    case "mudanca":
      // Coerência: âncora/transição E obrigatória se possível; antecipação leve
      if (c.N && /^Oportunidade:/i.test(c.N)) {
        c.N = null;
      }
      c.F = null;
      break;

    case "exploratorio":
      // Não fecha com muleta; mantém plano/antecipação se existirem
      c.F = null;
      break;

    case "bloqueio":
      // Só o necessário para desbloquear
      c.P = null;
      c.N = null;
      c.M = null;
      c.F = null;
      break;

    case "padrao":
    default:
      break;
  }

  return c;
}

/**
 * Ordem de camadas por modo (adapta condução).
 * @param {ModoAdaptacao} modo
 * @param {string} canal
 * @returns {string[]}
 */
export function ordemCamadasParaModo(modo, canal = "chat") {
  if (canal === "centro_situacao" || modo === "compacto") {
    return ["A", "B"];
  }
  if (canal === "voz") {
    if (modo === "rapido") return ["A", "N", "D"];
    if (modo === "mudanca") return ["E", "M", "A", "B", "D"];
    return ["E", "M", "P", "A", "B", "N", "D", "C"];
  }
  switch (modo) {
    case "rapido":
      return ["E", "A", "N", "D", "F"];
    case "execucao":
      return ["A", "B", "E"];
    case "mudanca":
      return ["E", "M", "P", "A", "B", "C", "D"];
    case "bloqueio":
      return ["E", "A", "D"];
    case "detalhe":
      return ["E", "M", "P", "A", "B", "C", "N", "D"];
    case "exploratorio":
      return ["E", "M", "P", "A", "B", "C", "N", "D"];
    default:
      return ["E", "M", "P", "A", "B", "C", "N", "D", "F"];
  }
}

/**
 * @param {string} instrucao
 */
export function ehConfirmacaoRapida(instrucao) {
  const t = String(instrucao || "").trim();
  if (!t) return false;
  if (t.length > 48) return false;
  return /^(ok|certo|sim|não|nao|pode|aprovado|autorizado|segue|isso|tá|ta|beleza|confirmo|de\s+acordo)\.?$/i.test(
    t
  );
}

/**
 * @param {string} instrucao
 */
export function ehExploratorio(instrucao) {
  const m = String(instrucao || "");
  if (
    /\b(aprova|autoriz[oa]|implementa|executa|despacha|decide)\b/i.test(m)
  ) {
    return false;
  }
  return /\b(como\s+(devemos|organizar|pensar)|o\s+que\s+(acha|sugeres)|explorar|op[cç][oõ]es|trade-?off|alternativas?|vale\s+a\s+pena)\b/i.test(
    m
  );
}
