/**
 * DESP-008 — Inteligência executiva (condução de missão).
 * Comportamento ao longo da missão — não só numa resposta isolada.
 * Usa lastro já existente (objectivo, próxima, pendências, estado EIC).
 */

/**
 * Missão em curso: há objectivo e lastro de execução.
 * @param {object} [ctx]
 */
export function missaoActiva(ctx = {}) {
  const obj = String(ctx.objectivoPrincipal || "").trim();
  if (!obj) return false;
  const prox = String(ctx.proximaAcao || "").trim();
  const pend = Array.isArray(ctx.pendencias) ? ctx.pendencias.filter(Boolean) : [];
  const decisoes = Array.isArray(ctx.decisoesTomadas)
    ? ctx.decisoesTomadas.filter(Boolean)
    : [];
  const emExec =
    String(ctx.estadoConversa?.emExecucao || "").trim() ||
    String(ctx.entregaCorrente || "").trim();
  return Boolean(prox || pend.length || decisoes.length || emExec);
}

/**
 * Confirmação no meio da missão — não esperar o utilizador puxar o fio.
 * @param {object} [ctx]
 * @returns {string|null}
 */
export function perguntaIniciativaMissao(ctx = {}) {
  if (!missaoActiva(ctx)) return null;
  const prox = String(ctx.proximaAcao || "").trim();
  const pend = Array.isArray(ctx.pendencias) ? ctx.pendencias.filter(Boolean) : [];
  const obj = String(ctx.objectivoPrincipal || "").trim();
  const emExec = String(ctx.estadoConversa?.emExecucao || "").trim();

  if (prox) {
    return obj
      ? `Na missão «${encurtar(obj, 45)}», avanço com ${encurtar(prox, 55)}?`
      : `Na missão, avanço com ${encurtar(prox, 70)}?`;
  }
  if (pend[0]) {
    return `Pendência aberta na missão: «${encurtar(pend[0], 65)}». Tratamos agora?`;
  }
  if (emExec) {
    return `Seguimos a execução de «${encurtar(emExec, 65)}» — qual o próximo gesto?`;
  }
  return null;
}

/**
 * Âncora quando a entrega diverge do objectivo (postura contínua).
 * @param {object} [ctx]
 * @returns {string|null}
 */
export function ancoraMissaoEmExecucao(ctx = {}) {
  if (!missaoActiva(ctx)) return null;
  const obj = String(ctx.objectivoPrincipal || "").trim();
  const entrega =
    String(ctx.entregaCorrente || "").trim() ||
    String(ctx.estadoConversa?.emExecucao || "").trim();
  if (!obj || !entrega) return null;
  if (entrega.toLowerCase() === obj.toLowerCase()) return null;
  if (obj.toLowerCase().includes(entrega.toLowerCase().slice(0, 20))) return null;
  return `Missão «${encurtar(obj, 50)}» em curso — entrega actual: ${encurtar(entrega, 45)}.`;
}

/**
 * Fecho parcial / próximo despacho a partir do critério EIC (sem «tchau»).
 * @param {object} [ctx]
 * @returns {string|null}
 */
export function fechoParcialMissao(ctx = {}) {
  const enc = ctx.encerramento || {};
  const obj = String(ctx.objectivoPrincipal || "").trim();
  const prox = String(ctx.proximaAcao || "").trim();
  const pend = Array.isArray(ctx.pendencias) ? ctx.pendencias.filter(Boolean) : [];

  if (enc.necessitaNovoDespacho) {
    return obj
      ? `Este ponto fecha; o objectivo «${encurtar(obj, 50)}» pede o próximo despacho. Qual frente autorizamos?`
      : "Este ponto fecha — qual o próximo despacho que autorizamos?";
  }
  if (enc.actividadeConcluida) {
    if (prox) {
      return `Actividade concluída. Próxima na missão: ${encurtar(prox, 70)}. Seguimos?`;
    }
    if (pend[0]) {
      return `Actividade concluída. Pendência restante: «${encurtar(pend[0], 65)}». Tratamos?`;
    }
    if (obj) {
      return `Actividade concluída sob «${encurtar(obj, 55)}». Encerramos o ponto ou há novo gesto?`;
    }
  }
  return null;
}

/**
 * Mudança / ambiguidade de prioridade (CSC já sinalizou).
 * @param {object} [ctx]
 * @returns {string|null}
 */
export function perguntaPrioridadeMissao(ctx = {}) {
  const ev = String(ctx.eventoObjectivo || "").trim();
  const obj = String(ctx.objectivoPrincipal || "").trim();
  if (ev !== "ambiguo_objetivo" && ev !== "mudar") return null;
  if (obj) {
    return `Prioridade da missão: mantemos «${encurtar(obj, 55)}» ou mudamos o objectivo agora?`;
  }
  return "Qual objectivo manda nesta missão agora?";
}

/**
 * @param {string} t
 * @param {number} max
 */
function encurtar(t, max) {
  const s = String(t || "").trim();
  if (s.length <= max) return s;
  return `${s.slice(0, Math.max(0, max - 1)).trim()}…`;
}
