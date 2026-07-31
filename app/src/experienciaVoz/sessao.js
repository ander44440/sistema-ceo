/**
 * Sessão única do Orquestrador de Voz (PX-002).
 */

import { criarOrquestradorVoz } from "./orquestrador.js";

/** @type {ReturnType<typeof criarOrquestradorVoz> | null} */
let instancia = null;

export function obterOrquestradorVozSessao() {
  if (!instancia) {
    instancia = criarOrquestradorVoz();
  }
  return instancia;
}

/** Só para testes. */
export function _resetOrquestradorVozSessaoParaTestes() {
  instancia = null;
}
