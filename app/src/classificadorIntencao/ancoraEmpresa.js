/**
 * FASE 3 — Detector canónico de âncora explícita de EMPRESA.
 * Puro: sem I/O, sem catálogo, sem WRITE.
 * Menção «empresa + nome» sozinha NÃO é âncora de troca.
 */

/**
 * @typedef {{ tipo: "trocar_empresa", ref: string }} AncoraEmpresaTroca
 */

/**
 * Âncoras explícitas de troca (verbo + empresa + ref).
 * Captura a referência após o rótulo; sem fuzzy.
 * @type {readonly RegExp[]}
 */
const RE_ANCORAS_TROCA = Object.freeze([
  /\babrir\s+(?:a\s+)?empresa\s+(.+)$/i,
  /\bativar\s+(?:a\s+)?empresa\s+(.+)$/i,
  /\btrocar\s+para\s+(?:a\s+)?empresa\s+(.+)$/i,
  /\btrocar\s+de\s+empresa\s+(.+)$/i,
  /\bselecionar\s+(?:a\s+)?empresa\s+(.+)$/i
]);

/**
 * Limpa a ref capturada (pontuação final; corta âncora de projeto na mesma frase).
 * @param {string} bruto
 * @returns {string}
 */
function limparRef(bruto) {
  let ref = String(bruto || "")
    .replace(/\s+e\s+abrir\s+(?:o\s+)?projeto\b[\s\S]*$/i, "")
    .replace(/\s+e\s+ativar\s+(?:o\s+)?coa\b[\s\S]*$/i, "")
    .replace(/\s+e\s+trocar\s+(?:para\s+(?:o\s+)?)?projeto\b[\s\S]*$/i, "")
    .replace(/\s+e\s+definir\s+coa\b[\s\S]*$/i, "")
    .replace(/[?.!].*$/, "")
    .replace(/^[«"']+|[»"']+$/g, "")
    .trim();
  return ref;
}

/**
 * @param {string} [texto]
 * @returns {AncoraEmpresaTroca | null}
 */
export function detectarAncoraEmpresa(texto) {
  const raw = String(texto || "").trim();
  if (!raw) return null;

  for (const re of RE_ANCORAS_TROCA) {
    const m = raw.match(re);
    if (!m) continue;
    const ref = limparRef(m[1]);
    if (!ref) return null;
    return { tipo: "trocar_empresa", ref };
  }
  return null;
}

/**
 * Âncora explícita de troca de projecto/COA (espelho CTO-003.1 — só detecção).
 * @param {string} [texto]
 * @returns {boolean}
 */
export function temAncoraExplicitaProjeto(texto) {
  const raw = String(texto || "").trim();
  if (!raw) return false;
  return (
    /\babrir\s+projeto\b/i.test(raw) ||
    /\bativar\s+(?:o\s+)?coa\b/i.test(raw) ||
    /\btrocar\s+(?:para\s+(?:o\s+)?)?projeto\b/i.test(raw) ||
    /\bdefinir\s+coa\b/i.test(raw)
  );
}
