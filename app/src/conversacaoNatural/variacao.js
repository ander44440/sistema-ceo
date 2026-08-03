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

const FECHOS = Object.freeze([
  "Quando quiser, seguimos.",
  "Seguimos quando autorizar.",
  "Fico neste ponto até ao próximo passo."
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

export { ABERTURAS, FECHOS };
