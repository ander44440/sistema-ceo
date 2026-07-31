/**
 * Roteamento deliberativo (IMP-014 / ADR-019).
 * Determinístico → sem MRE. Deliberativo → MRE.
 */

/** Intenções da capacidade `ia` que NÃO passam pelo MRE. */
const IA_DETERMINISTICAS = new Set([
  "pergunta_data",
  "pergunta_hora",
  "pergunta_identidade",
  "saudacao",
  "instrucao_vazia"
]);

/** Intenções deliberativas explícitas. */
const IA_DELIBERATIVAS = new Set([
  "deliberar",
  "deliberar_objetivo",
  "pergunta_aberta"
]);

/**
 * Capacidades que nunca usam MRE (fluxos estruturados do Núcleo).
 */
const CAPACIDADES_SEM_MRE = new Set([
  "memoria",
  "projetos",
  "dashboard",
  "conhecimento",
  "navegacao",
  "ferramentas",
  "fila"
]);

/**
 * Flag de rollback (IMP-010 §10).
 * @type {{ ativo: boolean }}
 */
export const flagMre = {
  ativo: true
};

/**
 * @param {{ id?: string, capacidade?: string }} intencao
 * @returns {boolean}
 */
export function ehRotaDeliberativa(intencao) {
  if (!flagMre.ativo) return false;
  if (!intencao) return false;
  const cap = intencao.capacidade;
  if (CAPACIDADES_SEM_MRE.has(cap)) return false;
  if (cap !== "ia") return false;
  if (IA_DETERMINISTICAS.has(intencao.id)) return false;
  if (IA_DELIBERATIVAS.has(intencao.id)) return true;
  // Fallback da classificação → deliberar
  return intencao.id === "deliberar" || !IA_DETERMINISTICAS.has(intencao.id);
}
