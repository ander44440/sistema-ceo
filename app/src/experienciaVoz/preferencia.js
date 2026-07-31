/**
 * Persistência da preferência de voz (PX-002 E1 §8).
 * Só persiste enabled + updatedAt — não persiste unlock de sessão.
 */

import { CHAVE_PREFERENCIA_VOZ } from "./estados.js";

/**
 * @param {Storage | { getItem(k:string): string|null, setItem(k:string,v:string): void, removeItem?(k:string): void }} [storage]
 */
export function criarPreferenciaVoz(storage) {
  const store =
    storage ||
    (typeof globalThis !== "undefined" && globalThis.localStorage
      ? globalThis.localStorage
      : null);

  function ler() {
    if (!store) return { enabled: false, updatedAt: null };
    try {
      const raw = store.getItem(CHAVE_PREFERENCIA_VOZ);
      if (!raw) return { enabled: false, updatedAt: null };
      const data = JSON.parse(raw);
      return {
        enabled: Boolean(data && data.enabled),
        updatedAt: data && data.updatedAt ? String(data.updatedAt) : null
      };
    } catch {
      return { enabled: false, updatedAt: null };
    }
  }

  function gravar(enabled) {
    const payload = {
      enabled: Boolean(enabled),
      updatedAt: new Date().toISOString()
    };
    if (store) {
      store.setItem(CHAVE_PREFERENCIA_VOZ, JSON.stringify(payload));
    }
    return payload;
  }

  return { ler, gravar, chave: CHAVE_PREFERENCIA_VOZ };
}
