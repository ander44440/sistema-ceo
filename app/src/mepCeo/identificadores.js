/**
 * IMP-072 / ARQ-033 §4 — Emissão de identificadores MARCADOR-nnn.
 * Sequência por espaço; nunca reutilização.
 */

import { TIPOS_OBJECTO } from "./dominio.js";

/** @type {Record<string, number>} */
let contadores = Object.fromEntries(TIPOS_OBJECTO.map((t) => [t, 0]));

export function reiniciarIdentificadores() {
  contadores = Object.fromEntries(TIPOS_OBJECTO.map((t) => [t, 0]));
}

export function emitirIdentificador(tipo) {
  if (!TIPOS_OBJECTO.includes(tipo)) {
    throw new Error(`tipo_objecto_desconhecido:${tipo}`);
  }
  contadores[tipo] += 1;
  const n = String(contadores[tipo]).padStart(3, "0");
  return `${tipo}-${n}`;
}

export function peekProximo(tipo) {
  const n = (contadores[tipo] || 0) + 1;
  return `${tipo}-${String(n).padStart(3, "0")}`;
}

/**
 * Reconstitui sequências a partir dos IDs já emitidos no log. Nunca reutiliza.
 */
export function restaurarContadoresDesdeIds(ids) {
  const next = Object.fromEntries(TIPOS_OBJECTO.map((t) => [t, 0]));
  for (const id of ids) {
    const m = String(id || "").match(/^([A-Z]+)-(\d+)$/);
    if (!m) continue;
    const tipo = m[1];
    const n = Number(m[2]);
    if (TIPOS_OBJECTO.includes(tipo) && Number.isFinite(n) && n > next[tipo]) {
      next[tipo] = n;
    }
  }
  contadores = next;
}
