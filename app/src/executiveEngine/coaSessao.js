/**
 * COA ativo — espelho do projeto ativo do catálogo persistente (Onda 01).
 * FASE 2: espelho de empresa ativa (institucional) ao lado do COA (operacional).
 * Sem store de sessão separado — só fachada sobre catalogoProjetos.
 */

import {
  inicializarCatalogo,
  obterEmpresaAtiva as catObterEmpresaAtiva,
  obterProjetoAtivo,
  selecionarEmpresaPorRef,
  selecionarProjetoPorRef
} from "../catalogoProjetos/index.js";

/**
 * Espelho operacional do projeto. `empresaId` é FK informativa (FASE 2).
 * @param {object|null|undefined} projeto
 */
function comoCoa(projeto) {
  if (!projeto) return null;
  return {
    id: projeto.id,
    nome: projeto.nome,
    status: projeto.estado || "ativo",
    desde: projeto.criadoEm || projeto.ultimaAtividadeEm,
    empresaId: projeto.empresaId || null
  };
}

/**
 * Espelho institucional da empresa.
 * @param {object|null|undefined} e
 */
function comoEmpresa(e) {
  if (!e) return null;
  return {
    id: e.id,
    nome: e.nome,
    status: e.estado || "ativa",
    desde: e.criadoEm
  };
}

export function inicializarCoaSessao() {
  inicializarCatalogo();
  return obterCoaAtivo();
}

export function obterCoaAtivo() {
  return comoCoa(obterProjetoAtivo());
}

/**
 * @param {{ id?: string, nome: string }} projeto
 */
export function definirCoaAtivo(projeto) {
  const selecionado = selecionarProjetoPorRef(projeto);
  return comoCoa(selecionado) || obterCoaAtivo();
}

export function limparCoaAtivo() {
  /* No-op: a sessão não limpa o catálogo; relê o estado actual (pode ser null). */
  return obterCoaAtivo();
}

export function obterEmpresaAtiva() {
  return comoEmpresa(catObterEmpresaAtiva());
}

/** Alias explícito do espelho de sessão. */
export function obterEmpresaAtivaSessao() {
  return obterEmpresaAtiva();
}

/**
 * @param {{ id?: string, nome?: string }} ref
 */
export function definirEmpresaAtiva(ref) {
  const selecionada = selecionarEmpresaPorRef(ref);
  return comoEmpresa(selecionada) || obterEmpresaAtiva();
}

export { comoCoa, comoEmpresa };
