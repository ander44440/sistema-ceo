/**
 * COA ativo — espelho do projeto ativo do catálogo persistente (Onda 01).
 */

import {
  inicializarCatalogo,
  obterProjetoAtivo,
  selecionarProjetoPorRef
} from "../catalogoProjetos/index.js";

function comoCoa(projeto) {
  if (!projeto) return null;
  return {
    id: projeto.id,
    nome: projeto.nome,
    status: projeto.estado || "ativo",
    desde: projeto.criadoEm || projeto.ultimaAtividadeEm
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
  /* Onda 01: sempre há um projeto ativo no catálogo — no-op intencional. */
  return obterCoaAtivo();
}
