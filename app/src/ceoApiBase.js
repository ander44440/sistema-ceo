/**
 * Base URL da API do CEO (BP-001 E8).
 * VITE_CEO_API_BASE vazio → paths relativos (Vite plugins / mesmo origin).
 * Preenchida → prefixa todas as chamadas /api/ceo/*.
 */

export function ceoApiBase() {
  const raw = import.meta.env.VITE_CEO_API_BASE;
  return String(raw || '')
    .trim()
    .replace(/\/$/, '');
}

/**
 * @param {string} path — ex. "/api/ceo/llm-status"
 * @returns {string}
 */
export function ceoApiUrl(path) {
  const p = path.startsWith('/') ? path : `/${path}`;
  const base = ceoApiBase();
  return base ? `${base}${p}` : p;
}
