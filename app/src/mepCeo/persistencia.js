/**
 * IMP-073 — Orquestração da persistência física. Sem I/O directo (delega ao adapter).
 * Sem writers externos. Sem Motor/MRE/EIC/CAP-04/CAP-05.
 */

import { appendRegistoFisico, carregarStore, PATH_CANONICO } from "./adapterFs.js";

export { PATH_CANONICO, carregarStore };

/** @type {string | null} */
let dirActivo = null;

export function persistenciaActiva() {
  return dirActivo != null;
}

export function directorioPersistenciaActivo() {
  return dirActivo;
}

export function activarDirectorioPersistencia(dir) {
  dirActivo = dir;
}

export function desactivarPersistenciaFisica() {
  dirActivo = null;
}

/**
 * Grava no disco só se a persistência estiver activa.
 * Recusa não altera o log. medium "memoria" = C1+C2 sem disco (suite homologada).
 */
export function persistirSeActivo(evento, objecto) {
  if (!dirActivo) {
    return { ok: true, medium: "memoria" };
  }
  return appendRegistoFisico(dirActivo, evento, objecto);
}
