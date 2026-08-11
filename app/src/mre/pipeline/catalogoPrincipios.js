/**
 * Catálogo mínimo de princípios para estágio 3 (HIB — seleção no catálogo).
 * Não altera Constituição; apenas lista selecionável.
 *
 * Globais: qualquer COA.
 * Escopo MG2: só quando o COA activo é Motoboy Game 2.
 */

/** Princípio global ADR-015 (sem nome de projecto). */
export const PRINCIPIO_USO_DIARIO_ACTIVO =
  "Priorizar uso diário no contexto operacional activo (ADR-015)";

/** Princípio específico do projecto MG2. */
export const PRINCIPIO_USO_DIARIO_MG2 =
  "Priorizar uso diário no MG2 (ADR-015)";

export const PRINCIPIOS_GLOBAIS = Object.freeze([
  "Respeito absoluto ao tempo do utilizador",
  "Nunca perder o contexto",
  "Nunca executar sem objetivo claro",
  "Explicar decisões importantes",
  "Registrar decisões relevantes",
  "Aprender continuamente",
  "Ser transparente sobre limitações",
  "Sugerir sem impor",
  "Objetivos do utilizador acima de preferências técnicas",
  PRINCIPIO_USO_DIARIO_ACTIVO,
  "Conhecimento pertence ao CEO, não às ferramentas"
]);

export const PRINCIPIOS_ESCOPO_MG2 = Object.freeze([
  PRINCIPIO_USO_DIARIO_MG2
]);

/** União (compat); preferir `catalogoPrincipiosParaCoa`. */
export const CATALOGO_PRINCIPIOS = Object.freeze([
  ...PRINCIPIOS_GLOBAIS,
  ...PRINCIPIOS_ESCOPO_MG2
]);

/**
 * @param {string} [texto]
 * @returns {boolean}
 */
export function ehPrincipioEscopoMg2(texto) {
  const t = String(texto || "").trim();
  if (!t) return false;
  if (PRINCIPIOS_ESCOPO_MG2.includes(t)) return true;
  return (
    /Priorizar uso diário no MG2/i.test(t) ||
    (/ADR-015/i.test(t) && /\bMG2\b/i.test(t))
  );
}

/**
 * @param {{ id?: string, nome?: string }|null|undefined} coa
 * @returns {boolean}
 */
export function ehCoaMg2(coa) {
  if (!coa || typeof coa !== "object") return false;
  const id = String(coa.id || "").toLowerCase();
  const nome = String(coa.nome || "").toLowerCase();
  return (
    id === "prj-mg2" ||
    id === "coa-mg2" ||
    id === "coa-mg2-fixture" ||
    /\bmg2\b/.test(id) ||
    /motoboy\s*game\s*2|\bmg2\b/.test(nome)
  );
}

/**
 * Catálogo seleccionável para o COA activo.
 * @param {{ id?: string, nome?: string }|null|undefined} coa
 * @returns {readonly string[]}
 */
export function catalogoPrincipiosParaCoa(coa) {
  if (ehCoaMg2(coa)) {
    return Object.freeze([...PRINCIPIOS_GLOBAIS, ...PRINCIPIOS_ESCOPO_MG2]);
  }
  return PRINCIPIOS_GLOBAIS;
}

/**
 * Remove princípios de escopo MG2 quando o COA não é MG2.
 * @param {string[]} principios
 * @param {{ id?: string, nome?: string }|null|undefined} coa
 * @returns {string[]}
 */
export function filtrarPrincipiosPorCoa(principios, coa) {
  const lista = Array.isArray(principios) ? principios : [];
  if (ehCoaMg2(coa)) return lista.slice();
  return lista.filter((p) => !ehPrincipioEscopoMg2(p));
}
