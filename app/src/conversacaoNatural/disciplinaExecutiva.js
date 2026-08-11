/**
 * CTO-002 / CTO-003 — Disciplina executiva (Deliberar / Executar / Recuperar).
 * CTO-003: HOMOLOGADO / ENCERRADO — Baseline (06/08/2026); frente congelada.
 * Antes de responder: determinar o modo; em EXECUTAR/RECUPERAR não deliberar.
 * CTO-003: Job activo / operação aberta tem prioridade sobre o classificador.
 */

import {
  ehComandoSobreJobActivo,
  extrairEstadoOperacional
} from "./estadoOperacional.js";

/** @typedef {"deliberar"|"executar"|"recuperar"} ModoExecutivo */

const PLACEHOLDER_OBJECTIVO =
  /definir\s+o\s+efeito\s+esperado\s+da\s+[uú]ltima\s+instru[cç][aã]o/i;

const SINAL_EXECUTAR =
  /\b(autorizad[oa]|aprovad[oa]|despacha(?:r)?|envie?\s+ao\s+cursor|enviar?\s+ao\s+cursor|reenviar|force?\s+o\s+envio|for[cç]a(?:r)?\s+o\s+envio|n[aã]o\s+mudamos|n[aã]o\s+confirmado|implementa(?:r)?|executa(?:r)?|pausar|cancelar|publique?\s+o?\s*job|envie?\s+agora|faz\s+(isso|agora)|prossegue|segue\s+com)\b/i;

const SINAL_DELIBERAR =
  /\b(o\s+que\s+(acha|sugeres|recomenda)|como\s+(devemos|pensar|organizar)|explorar|op[cç][oõ]es|trade-?off|alternativas?|vale\s+a\s+pena|porqu[eê]|compara)\b/i;

/**
 * Objectivo / próximo passo inventado pelo sistema (não pelo utilizador).
 * @param {string} [texto]
 */
export function ehObjectivoInventado(texto) {
  const t = String(texto || "").trim();
  if (!t) return false;
  if (PLACEHOLDER_OBJECTIVO.test(t)) return true;
  if (/^enviar uma instru[cç][aã]o executiva concreta\.?$/i.test(t)) return true;
  if (/^pedir o estado atual\.?$/i.test(t)) return true;
  return false;
}

/**
 * Extrai efeito esperado explícito da instrução do utilizador.
 * @param {string} [instrucao]
 * @returns {string|null}
 */
export function extrairEfeitoEsperado(instrucao) {
  const t = String(instrucao || "").trim();
  if (!t) return null;
  const m = t.match(
    /(?:efeito\s+esperado|objectivo|objetivo)\s*:\s*(.+?)(?:\.\s*(?:envie|despacha|enviar)|$)/i
  );
  if (m) {
    const efeito = m[1].replace(/\s+/g, " ").trim();
    if (efeito.length >= 8 && !ehObjectivoInventado(efeito)) return efeito;
  }
  return null;
}

/**
 * Ordem operacional / confirmação de autoridade — não inventar objectivo.
 * Confirmações curtas (ok/sim) NÃO entram aqui — ficam no modo «rápido» (DESP-006/008).
 * @param {string} [instrucao]
 */
export function ehOrdemOperacional(instrucao) {
  const t = String(instrucao || "").trim();
  if (!t) return false;
  if (/^(autorizad[oa]|aprovad[oa])\.?$/i.test(t)) return true;
  return SINAL_EXECUTAR.test(t);
}

/**
 * Determina o modo executivo (CTO-002 + CTO-003).
 * Prioridade: operação aberta (Job) > autoridade explícita > tipo parecer.
 * @param {object} [opts]
 * @param {string} [opts.instrucao]
 * @param {object} [opts.parecer]
 * @param {boolean} [opts.missaoActiva]
 * @param {object} [opts.lastroConsciencia]
 * @param {object} [opts.estadoOperacional]
 * @param {ReadonlyArray} [opts.historico]
 * @returns {ModoExecutivo}
 */
export function detectarModoExecutivo(opts = {}) {
  const instrucao = String(opts.instrucao || "").trim();
  const estadoOp = extrairEstadoOperacional({
    lastroConsciencia: opts.lastroConsciencia,
    estadoOperacional: opts.estadoOperacional,
    historico: opts.historico,
    consultaEstado: opts.consultaEstado,
    jobs: opts.jobs
  });

  // CTO-003 REGRA 1: Job / operação aberta > classificador
  if (estadoOp.operacaoAberta) {
    // Exploração explícita ainda pode deliberar — resto fica operacional
    if (
      SINAL_DELIBERAR.test(instrucao) &&
      !ehComandoSobreJobActivo(instrucao) &&
      !ehOrdemOperacional(instrucao)
    ) {
      return "deliberar";
    }
    if (estadoOp.requerRecuperacao || estadoOp.modoOperacional === "recuperar") {
      return "recuperar";
    }
    return "executar";
  }

  if (!instrucao) return "deliberar";

  if (SINAL_DELIBERAR.test(instrucao) && !SINAL_EXECUTAR.test(instrucao)) {
    return "deliberar";
  }

  if (ehOrdemOperacional(instrucao) || ehComandoSobreJobActivo(instrucao)) {
    return "executar";
  }

  const tipo = String(opts.parecer?.enquadramento?.tipoPedido || "");
  if (tipo === "execucao") return "executar";

  const estado = opts.parecer?.decisaoExecutiva?.estado;
  if (estado === "delegar" && opts.missaoActiva) return "executar";

  return "deliberar";
}

/**
 * Em EXECUTAR: resposta curta — o quê / resultado / próximo estado.
 * @param {object} p
 * @param {string} [p.oQue]
 * @param {string} [p.resultado]
 * @param {string} [p.proximo]
 */
export function montarAckExecucao(p = {}) {
  const partes = [];
  const oQue = String(p.oQue || "").trim();
  const resultado = String(p.resultado || "").trim();
  const proximo = String(p.proximo || "").trim();
  if (oQue) partes.push(oQue);
  if (resultado) partes.push(resultado);
  if (proximo && !ehObjectivoInventado(proximo)) partes.push(proximo);
  if (!partes.length) return "A executar.";
  return partes.join(" ");
}

/**
 * Remove objectivos inventados de um valor (contexto / memória).
 * @param {string|null|undefined} texto
 * @returns {string|null}
 */
export function filtrarObjectivoInventado(texto) {
  const t = String(texto || "").trim();
  if (!t || ehObjectivoInventado(t)) return null;
  return t;
}

export { PLACEHOLDER_OBJECTIVO, SINAL_EXECUTAR, extrairEstadoOperacional };
