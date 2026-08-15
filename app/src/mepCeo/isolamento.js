/**
 * IMP-072 / ARQ-033 C1 — Portão de isolamento.
 * Recusa os cinco tipos de conteúdo de organização/cliente.
 * Referência opaca por ID é permitida; absorção de conteúdo é recusada.
 */

import { EIXO_PRODUTO, TIPOS_CONTEUDO_ORGANIZACAO } from "./dominio.js";

export const CHAVES_PAYLOAD_PROIBIDAS = Object.freeze([
  "dadosCliente",
  "conversasCliente",
  "conversaCliente",
  "transcriptCliente",
  "conhecimentoOperacionalCliente",
  "decisaoPrivadaCliente",
  "factoOrganizacao",
  "factosOrganizacao",
  "memoriaOrganizacional",
  "itemKnwConteudo",
  "decisaoCap05"
]);

/**
 * @param {object} [entrada]
 * @returns {{ ok: boolean, motivos: string[] }}
 */
export function avaliarIsolamento(entrada = {}) {
  /** @type {string[]} */
  const motivos = [];
  const eixo = String(entrada.eixo || EIXO_PRODUTO).trim();
  if (eixo !== EIXO_PRODUTO) {
    motivos.push("eixo_nao_produto");
  }

  const tipoConteudo = String(entrada.tipoConteudo || "").trim();
  if (tipoConteudo && TIPOS_CONTEUDO_ORGANIZACAO.includes(tipoConteudo)) {
    motivos.push(`conteudo_organizacao:${tipoConteudo}`);
  }

  if (entrada.conteudoOrganizacao === true) {
    motivos.push("conteudo_organizacao_flag");
  }

  const payload =
    entrada.payload && typeof entrada.payload === "object" ? entrada.payload : {};
  for (const chave of CHAVES_PAYLOAD_PROIBIDAS) {
    if (Object.prototype.hasOwnProperty.call(payload, chave) && payload[chave] != null) {
      motivos.push(`chave_proibida:${chave}`);
    }
  }

  if (entrada.absorveArtefactoReferenciado === true) {
    motivos.push("absorcao_conteudo_externo");
  }

  return {
    ok: motivos.length === 0,
    motivos
  };
}

export function recusarIsolamento(entrada) {
  return !avaliarIsolamento(entrada).ok;
}
