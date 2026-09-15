/**
 * Context Governor — resolução de modo (IMP-093 M4).
 * Default: ENFORCE. SHADOW só via rollback/diagnóstico controlado.
 */

import { MODO_ENFORCE, MODO_SOMBRA } from "./contratos.js";

/** Fase activa desta IMP. */
export const CG_FASE = "M4";

/**
 * Rollback/diagnóstico controlado para SHADOW (MIG-5).
 * Único mecanismo oficial em M4: `CEO_CG_MODO=sombra` (ou `shadow`).
 */
export const CG_ROLLBACK_SHADOW_ENV = "CEO_CG_MODO";

/**
 * Feature flag: desactiva o gate por completo (rollback extremo).
 * Default: activo. Em produção, preferir `CEO_CG_MODO=sombra` a desligar o CG.
 * @returns {boolean}
 */
export function cgEnabled() {
  try {
    if (typeof process !== "undefined" && process.env) {
      const v = String(process.env.CEO_CG_ENABLED || "").trim().toLowerCase();
      if (v === "0" || v === "false" || v === "off") return false;
    }
  } catch {
    /* ignore */
  }
  return true;
}

/**
 * Ambiente de produção (browser Vite ou Node).
 * @returns {boolean}
 */
export function cgEmProducao() {
  try {
    if (typeof process !== "undefined" && process.env) {
      const n = String(process.env.NODE_ENV || "").trim().toLowerCase();
      if (n === "production") return true;
    }
  } catch {
    /* ignore */
  }
  try {
    // eslint-disable-next-line no-undef
    if (typeof import.meta !== "undefined" && import.meta.env?.PROD) return true;
  } catch {
    /* ignore */
  }
  return false;
}

/**
 * CG_BYPASS / CEO_CG_BYPASS — nunca honrado (CA-093-12 / M4).
 * @returns {boolean} sempre false
 */
export function cgBypassPermitido() {
  try {
    if (typeof process !== "undefined" && process.env) {
      const v = String(process.env.CEO_CG_BYPASS || process.env.CG_BYPASS || "")
        .trim()
        .toLowerCase();
      if (v === "1" || v === "true" || v === "on") {
        return false;
      }
    }
  } catch {
    /* ignore */
  }
  return false;
}

/**
 * @deprecated M3 opt-in por acto — em M4 o default já é ENFORCE.
 * Mantido para leitura diagnóstica.
 * @returns {Set<string>}
 */
export function actosEnforceOptIn() {
  const set = new Set();
  try {
    if (typeof process !== "undefined" && process.env) {
      const raw = String(process.env.CEO_CG_ENFORCE_ACTOS || "").trim();
      if (raw) {
        for (const p of raw.split(",")) {
          const a = p.trim();
          if (a) set.add(a);
        }
      }
    }
  } catch {
    /* ignore */
  }
  return set;
}

/**
 * Lê CEO_CG_MODO normalizado.
 * @returns {string}
 */
export function lerEnvModoCg() {
  try {
    if (typeof process !== "undefined" && process.env) {
      return String(process.env.CEO_CG_MODO || "").trim().toLowerCase();
    }
  } catch {
    /* ignore */
  }
  return "";
}

/**
 * M4 — modo do Context Governor.
 *
 * **Default: ENFORCE** (produção e demais ambientes).
 *
 * **SHADOW** apenas rollback/diagnóstico controlado:
 * - `CEO_CG_MODO=sombra` ou `CEO_CG_MODO=shadow`
 *
 * Pedido/`cgMeta.modo=sombra` **não** baixa o nível em produção
 * (anti-bypass por meta). Fora de produção, `cgMeta.modo=sombra` é
 * aceite só para testes/diagnóstico local.
 *
 * @param {object} [pedido]
 * @returns {'sombra'|'enforce'}
 */
export function resolverModoCg(pedido = {}) {
  const envModo = lerEnvModoCg();

  // Rollback / diagnóstico oficial (MIG-5)
  if (envModo === MODO_SOMBRA || envModo === "shadow") {
    return MODO_SOMBRA;
  }

  if (envModo === MODO_ENFORCE || envModo === "enforce") {
    return MODO_ENFORCE;
  }

  const p = pedido && typeof pedido === "object" ? pedido : {};
  const cgMeta = p.cgMeta && typeof p.cgMeta === "object" ? p.cgMeta : {};
  const modoPedido = String(p.modo || cgMeta.modo || "")
    .trim()
    .toLowerCase();

  // Em produção: meta não pode forçar sombra (só env de rollback).
  if (modoPedido === MODO_SOMBRA || modoPedido === "shadow") {
    if (!cgEmProducao()) {
      return MODO_SOMBRA;
    }
    return MODO_ENFORCE;
  }

  // Default M4
  return MODO_ENFORCE;
}

/**
 * @returns {boolean}
 */
export function isModoSombra(pedido) {
  return resolverModoCg(pedido) === MODO_SOMBRA;
}

/**
 * @returns {boolean}
 */
export function isModoEnforce(pedido) {
  return resolverModoCg(pedido) === MODO_ENFORCE;
}
