/**
 * IMP-070 B5 / REQ-072 — Porta de recuperação contextual para a EIC.
 * Única superfície lógica de leitura em runtime de conhecimento de Camada.
 * Consome lastro apto via fachada opaca; não conhece estrutura interna do Acervo,
 * nem governação, curadoria ou actualização.
 */

import {
  lerAptoParaConsumo,
  hintEstagio6LacunaFonteOficial
} from "./fonteOficial.js";

export const PORTA_RECUPERACAO_ID = "porta_recuperacao_eic";

/** Hint estágio 6 (REQ-070 CA-070-5/6) — reexport via Porta (CA-072-1). */
export { hintEstagio6LacunaFonteOficial };

/**
 * @typedef {object} PedidoPorta
 * @property {object|string|null} [contextoTrabalho] — COA / contexto de trabalho
 * @property {object|string|null} [coa] — alias de contextoTrabalho
 * @property {string} necessidade — necessidade associada à solicitação
 */

/**
 * @typedef {object} LastroPorta
 * @property {typeof PORTA_RECUPERACAO_ID} porta
 * @property {true} unicaSuperficieLeitura
 * @property {string} necessidade
 * @property {string|null} ambitoCoa
 * @property {ReadonlyArray<{id:string,conteudo:string,versao:string|null}>} itens
 * @property {ReadonlyArray<{id:string,versao:string}>} referenciasVersao
 * @property {ReadonlyArray<string>} factosOficiais — lastro textual para consumidores
 * @property {string|null} lacuna
 * @property {boolean} haConhecimentoApto
 * @property {false} incluiNaoAptos
 */

/**
 * Extrai identificador de COA / contexto de trabalho.
 * @param {PedidoPorta} pedido
 * @returns {string|null}
 */
function ambitoDoPedido(pedido = {}) {
  const ctx = pedido.contextoTrabalho ?? pedido.coa ?? null;
  if (ctx == null) return null;
  if (typeof ctx === "string") {
    const s = ctx.trim();
    return s || null;
  }
  if (typeof ctx === "object") {
    const id =
      ctx.id ||
      ctx.coaId ||
      ctx.ambitoCoa ||
      ctx.projetoAtivo?.id ||
      null;
    return id ? String(id).trim() || null : null;
  }
  return null;
}

/**
 * Solicita lastro de conhecimento organizacional via Porta (CA-072-1…4).
 * Entrada: Contexto de Trabalho/COA + necessidade.
 * Saída: apenas aptos + referências de versão + lacunas explícitas.
 *
 * @param {PedidoPorta} pedido
 * @returns {LastroPorta & { ok: boolean, erro?: string }}
 */
export function solicitarLastroConhecimento(pedido = {}) {
  const necessidade = String(pedido.necessidade || "").trim();
  if (!necessidade) {
    return {
      ok: false,
      erro: "necessidade_obrigatoria",
      porta: PORTA_RECUPERACAO_ID,
      unicaSuperficieLeitura: true,
      necessidade: "",
      ambitoCoa: null,
      itens: Object.freeze([]),
      referenciasVersao: Object.freeze([]),
      factosOficiais: Object.freeze([]),
      lacuna: null,
      haConhecimentoApto: false,
      incluiNaoAptos: false
    };
  }

  const ambitoCoa = ambitoDoPedido(pedido);
  const leitura = lerAptoParaConsumo({ ambitoCoa });

  return {
    ok: true,
    porta: PORTA_RECUPERACAO_ID,
    unicaSuperficieLeitura: true,
    necessidade,
    ambitoCoa,
    itens: leitura.itens,
    referenciasVersao: leitura.referenciasVersao,
    factosOficiais: leitura.factos,
    lacuna: leitura.lacuna,
    haConhecimentoApto: leitura.haApto,
    incluiNaoAptos: false
  };
}

/**
 * Factos oficiais para consumidores deliberativos — só via Porta.
 * @param {PedidoPorta} pedido
 * @returns {string[]}
 */
export function factosViaPorta(pedido = {}) {
  const lastro = solicitarLastroConhecimento(pedido);
  if (!lastro.ok) return [];
  return [...lastro.factosOficiais];
}
