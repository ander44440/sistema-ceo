/**
 * Modo DEBUG do pipeline STT (VAL-011R).
 * Activar: localStorage.setItem('CEO_DEBUG_STT','1') ou URL ?debug=stt
 */

const KEY = "CEO_DEBUG_STT";

export function ceoDebugSttActivo() {
  try {
    if (typeof globalThis === "undefined") return false;
    const loc = globalThis.location;
    if (loc && typeof loc.search === "string") {
      const q = new URLSearchParams(loc.search);
      if (q.get("debug") === "stt") return true;
    }
    const ls = globalThis.localStorage;
    if (ls && ls.getItem(KEY) === "1") return true;
  } catch {
    /* ignore */
  }
  return false;
}

/** @param {...unknown} args */
export function diagStt(...args) {
  if (!ceoDebugSttActivo()) return;
  console.info("[DIAG-STT]", ...args);
}
