/**
 * CTO-001 — Preservação da missão sob incerteza de classificação.
 * Status: HOMOLOGADO / ENCERRADO (06/08/2026) — Baseline de experiência.
 * Diretriz permanente: diante da dúvida, preservar a missão > explicar o motor interno.
 * CTO-003: operação aberta (Job) também força preservação — sem reclassificar.
 * Estratégia: recuperar a missão, não expor Job / deliberar / C1–C4.
 */

import { extrairEstadoOperacional } from "../conversacaoNatural/estadoOperacional.js";

const JARGÃO_PROIBIDO =
  /\b(job|deliberar|deliberação|comando operacional|classificador|c[1-4]\b|motor de execução|mre|núcleo\/mre)\b/i;

/**
 * Há continuidade de trabalho no histórico recente?
 * @param {ReadonlyArray<{papel?: string, texto?: string}>} [historico]
 */
export function historicoSugereMissao(historico) {
  if (!Array.isArray(historico) || historico.length === 0) return false;
  const recentes = historico.slice(-6);
  let substanciais = 0;
  for (const t of recentes) {
    const txt = String(t?.texto || "").trim();
    if (txt.length >= 12) substanciais += 1;
  }
  return substanciais >= 1 && historico.length >= 1;
}

/**
 * Memória de trabalho / lastro já carregado no Engine.
 * @param {object} [ctx]
 */
export function lastroSugereMissao(ctx = {}) {
  const lastro = ctx.deps?.lastroConsciencia;
  if (!lastro || typeof lastro !== "object") return false;
  const mte = lastro.memoriaTrabalhoExecutiva;
  if (mte && typeof mte === "object") {
    if (
      String(mte.objetivoAtual || mte.objectivoAtual || "").trim() ||
      String(mte.proximaAcao || mte.proximoPasso || "").trim() ||
      String(mte.emExecucao || "").trim()
    ) {
      return true;
    }
    if (Array.isArray(mte.pendencias) && mte.pendencias.filter(Boolean).length) {
      return true;
    }
  }
  if (Array.isArray(lastro.factosOficiais) && lastro.factosOficiais.length > 0) {
    return true;
  }
  if (lastro.temContextoRelevante === true) return true;
  return false;
}

/**
 * Follow-up / deixis — tipicamente continua a missão, não reinicia classificação.
 * @param {string} [texto]
 */
export function mensagemEhContinuacao(texto) {
  const t = String(texto || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
  if (!t) return false;
  if (t.split(/\s+/).length <= 8) {
    return /\b(isso|isto|aquilo|aquele|aquela|continua|continuar|agora|entao|então|e quanto|e sobre|nesse|neste|dessa|desta|ok|sim|nao|não|pode|vamos)\b/.test(
      t
    );
  }
  return false;
}

/**
 * Hipótese de classe candidata aponta para trabalho em curso.
 * @param {object} [classificacao]
 */
export function classeCandidataEMissao(classificacao) {
  const c = classificacao?.classe;
  return c === "conversa_projeto" || c === "trabalho_executivo";
}

/**
 * Deve preservar missão (P1 CTO-001) / operação (CTO-003) em vez de menu.
 * @param {object} ctx — ContextoDestino
 */
export function devePreservarMissao(ctx = {}) {
  const estadoOp = extrairEstadoOperacional({
    lastroConsciencia: ctx.deps?.lastroConsciencia,
    historico: ctx.historico,
    estadoOperacional: ctx.deps?.lastroConsciencia?.estadoOperacional
  });
  if (estadoOp.operacaoAberta) return true;

  if (lastroSugereMissao(ctx)) return true;
  if (historicoSugereMissao(ctx.historico)) return true;
  if (mensagemEhContinuacao(ctx.texto) && historicoSugereMissao(ctx.historico)) {
    return true;
  }
  if (
    classeCandidataEMissao(ctx.classificacao) &&
    (historicoSugereMissao(ctx.historico) || lastroSugereMissao(ctx))
  ) {
    return true;
  }
  // COA activo no contexto de capacidade (quando injectado)
  if (ctx.deps?.lastroConsciencia?.coa || ctx.intencao?.frenteActiva) {
    return historicoSugereMissao(ctx.historico) || lastroSugereMissao(ctx);
  }
  return false;
}

/**
 * Rótulos naturais — sem jargão de arquitectura.
 * @param {string} [classe]
 */
export function hipoteseNaturalPorClasse(classe) {
  switch (classe) {
    case "conversa_projeto":
      return "continuar o assunto do projecto em que estamos";
    case "trabalho_executivo":
      return "avançar com uma acção concreta neste trabalho";
    case "conhecimento_geral":
      return "responder a uma dúvida geral";
    case "comando_operacional":
      return "verificar o estado actual do trabalho";
    default:
      return "continuar a partir do que já estávamos a tratar";
  }
}

/**
 * Confirmação em linguagem natural (P2/P3) — nunca expõe motor.
 * @param {object} ctx
 */
export function montarConfirmacaoNatural(ctx = {}) {
  const classe = ctx.classificacao?.classe;
  const conf = Number(ctx.classificacao?.confianca);
  const hip1 = hipoteseNaturalPorClasse(classe);
  const alt =
    classe === "conversa_projeto"
      ? hipoteseNaturalPorClasse("trabalho_executivo")
      : hipoteseNaturalPorClasse("conversa_projeto");

  let msg;
  if (!Number.isNaN(conf) && conf < 0.4) {
    msg =
      `Quero manter o fio do que estamos a fazer. ` +
      `Prefere ${hip1}, ou ${alt}? ` +
      `Responda em uma frase — sem precisar recomeçar o assunto.`;
  } else {
    msg =
      `Pelo contexto, a hipótese mais provável é ${hip1}. ` +
      `Confirma? Se não, diga em uma frase o que precisa agora.`;
  }

  if (JARGÃO_PROIBIDO.test(msg)) {
    return "Pelo contexto, continuo no que estávamos a tratar. Confirma, ou diga em uma frase o próximo passo?";
  }
  return msg;
}

/**
 * Garante que a mensagem ao utilizador não vaza jargão interno.
 * @param {string} mensagem
 */
export function sanitizarProsaUtilizador(mensagem) {
  const m = String(mensagem || "");
  if (!JARGÃO_PROIBIDO.test(m)) return m;
  return (
    "Pelo contexto, continuo no que estávamos a tratar. " +
    "Confirma, ou diga em uma frase o próximo passo?"
  );
}

export { JARGÃO_PROIBIDO };
