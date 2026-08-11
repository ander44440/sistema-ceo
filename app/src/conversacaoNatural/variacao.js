/**
 * Variação controlada (PX-001 / PX-003) — catálogo finito, anti-muleta.
 * Contadores só em memória de sessão (não é memória organizacional).
 */

const ABERTURAS = Object.freeze([
  "Qual é o objetivo de agora?",
  "Qual frente atacamos agora?",
  "Vamos continuar de onde paramos ou surgiu uma nova prioridade?",
  "Qual é a próxima decisão?"
]);

/** Fechos com iniciativa (DEC-010) — evitam muleta passiva «quando quiser». */
const FECHOS = Object.freeze([
  "Qual é o próximo passo que autorizamos?",
  "Confirmamos isto e avançamos?",
  "O que falta para fechar esta decisão?"
]);

const ANCORAS = Object.freeze([
  (frente) => `Mantemos o foco em ${frente}.`,
  (frente) => `Continuidade: ${frente}.`,
  (frente) => `Frente ativa: ${frente}.`
]);

let idxAbertura = 0;
let idxFecho = 0;
let idxAncora = 0;

export function _resetVariacaoParaTestes() {
  idxAbertura = 0;
  idxFecho = 0;
  idxAncora = 0;
}

export function proximaAberturaPergunta() {
  const s = ABERTURAS[idxAbertura % ABERTURAS.length];
  idxAbertura += 1;
  return s;
}

export function proximoFecho() {
  const s = FECHOS[idxFecho % FECHOS.length];
  idxFecho += 1;
  return s;
}

/**
 * @param {string} frente
 */
export function ancoraFio(frente) {
  const f = String(frente || "").trim();
  if (!f) return null;
  const s = ANCORAS[idxAncora % ANCORAS.length](f);
  idxAncora += 1;
  return s;
}

/**
 * Âncora no objectivo principal (DESP-002 — manter foco executivo).
 * @param {string} objectivo
 */
export function ancoraObjectivo(objectivo) {
  const o = String(objectivo || "").trim();
  if (!o) return null;
  const curtos = [
    `Objectivo principal: ${o}.`,
    `Mantemos o objectivo: ${o}.`,
    `Foco executivo: ${o}.`
  ];
  const s = curtos[idxAncora % curtos.length];
  idxAncora += 1;
  return s;
}

/**
 * Transição natural entre assuntos sem perder o objectivo (DESP-002).
 * @param {string|null} topicoNovo
 * @param {string|null} objectivoPrincipal
 */
export function transicaoTopico(topicoNovo, objectivoPrincipal) {
  const t = String(topicoNovo || "").trim();
  const o = String(objectivoPrincipal || "").trim();
  if (t && o && t.toLowerCase() !== o.toLowerCase()) {
    return `Mudámos o fio para «${t}»; o objectivo principal permanece «${o}».`;
  }
  if (t) {
    return `Passámos a «${t}» — seguimos com condução neste fio.`;
  }
  if (o) {
    return `Novo fio, sem perder o objectivo «${o}».`;
  }
  return null;
}

/**
 * Encerramento executivo (estado + próxima acção + pendências).
 * @param {object} [p]
 * @param {string|null} [p.objectivoPrincipal]
 * @param {string|null} [p.proximaAcao]
 * @param {string[]} [p.pendencias]
 * @param {string|null} [p.frenteAtiva]
 */
export function fechoExecutivo(p = {}) {
  const obj = String(p.objectivoPrincipal || "").trim();
  const prox = String(p.proximaAcao || "").trim();
  const frente = String(p.frenteAtiva || "").trim();
  const pend = Array.isArray(p.pendencias)
    ? p.pendencias.filter(Boolean)
    : [];

  const partes = [];
  if (frente) {
    partes.push(`Encerro o ponto em ${frente}.`);
  } else {
    partes.push("Encerro o ponto aqui.");
  }
  if (obj) {
    partes.push(`Objectivo «${obj}» permanece em curso.`);
  }
  if (prox) {
    partes.push(`Próxima acção: ${prox}.`);
  } else if (pend.length) {
    partes.push(`Pendência aberta: ${pend[0]}.`);
  } else {
    partes.push(proximoFecho());
  }
  return partes.join(" ");
}

export { ABERTURAS, FECHOS };
