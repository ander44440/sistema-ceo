/**
 * Persistência de retenção + Gate de princípios (IMP-018 / F8).
 * H1: nunca aplica princípios.
 */

import { aplicarPrincipiosProibido } from "../aprendizado/avaliarAprendizado.js";
import { validarParecerExecutivo } from "../parecer/validarParecerExecutivo.js";

/**
 * @typedef {object} StoreRetencao
 * @property {(parecerId: string) => object|null} obterPorParecer
 * @property {(registo: object) => void} guardar
 * @property {() => object[]} listarPropostasPendentes
 * @property {() => object[]} listarMemorias
 * @property {() => object[]} listarPrecedentes
 */

/**
 * Store em memória (testes / Node).
 * @returns {StoreRetencao}
 */
export function criarStoreRetencaoMemoria() {
  /** @type {Map<string, object>} */
  const porParecer = new Map();
  return {
    obterPorParecer(parecerId) {
      return porParecer.get(parecerId) || null;
    },
    guardar(registo) {
      porParecer.set(registo.parecerId, registo);
    },
    listarPropostasPendentes() {
      return [...porParecer.values()].filter(
        (r) =>
          r.propostaPrincipio &&
          r.estadoHomologacaoPrincipio === "pendente_gate"
      );
    },
    listarMemorias() {
      return [...porParecer.values()].filter((r) => r.memoria);
    },
    listarPrecedentes() {
      return [...porParecer.values()].filter((r) => r.precedente);
    }
  };
}

/**
 * Executa efeitos do Plano de Retenção sem aplicar princípios.
 * @param {object} parecer
 * @param {object} planoRetencao
 * @param {{ store: StoreRetencao }} deps
 */
export function persistirRetencao(parecer, planoRetencao, deps) {
  if (!deps?.store) throw new Error("deps.store é obrigatório");

  const validacao = validarParecerExecutivo(parecer);
  if (!validacao.ok) {
    return { persistido: false, motivo: "parecer_invalido", violacoes: validacao.violacoes };
  }

  const parecerId = parecer.id;
  const existente = deps.store.obterPorParecer(parecerId);
  if (existente) {
    return { persistido: false, idempotente: true, motivo: "ja_persistido", registo: existente };
  }

  const efeitos = Array.isArray(planoRetencao?.efeitos)
    ? planoRetencao.efeitos
    : [];
  const aprendizado = parecer.aprendizado || {};

  /** @type {object} */
  const registo = {
    parecerId,
    criadoEm: new Date().toISOString(),
    efeitos: efeitos.slice(),
    memoria: null,
    precedente: null,
    propostaPrincipio: null,
    estadoHomologacaoPrincipio: null
  };

  if (efeitos.includes("persistir_memoria") || aprendizado.registrarMemoria) {
    registo.memoria = {
      parecerId,
      coaId: parecer.coaId,
      resumo: parecer.decisaoExecutiva?.recomendacao || parecer.analise,
      estado: parecer.decisaoExecutiva?.estado,
      acao: parecer.acao?.descricao
    };
  }

  if (efeitos.includes("persistir_precedente") || aprendizado.criarPrecedente) {
    registo.precedente = {
      parecerId,
      padrao: {
        natureza: parecer.diagnostico?.natureza,
        tipoPedido: parecer.enquadramento?.tipoPedido,
        estado: parecer.decisaoExecutiva?.estado,
        justificativa: parecer.decisaoExecutiva?.justificativa
      }
    };
  }

  if (
    efeitos.includes("abrir_proposta_principio") ||
    aprendizado.atualizarPrincipios
  ) {
    const proposta = String(aprendizado.propostaPrincipio || "").trim();
    if (!proposta) {
      return { persistido: false, motivo: "proposta_principio_vazia" };
    }
    registo.propostaPrincipio = proposta;
    registo.estadoHomologacaoPrincipio = "pendente_gate";
    // H1 — nunca "aplicado" aqui
    if (registo.estadoHomologacaoPrincipio === "aplicado") {
      aplicarPrincipiosProibido();
    }
  }

  deps.store.guardar(registo);
  return { persistido: true, registo };
}

/**
 * Homologar proposta exige Gate humano — esta função só muda estado
 * se o Gate passar `aprovado`/`rejeitado`. Nunca escreve catálogo de princípios.
 * @param {string} parecerId
 * @param {"aprovado"|"rejeitado"} decisaoGate
 * @param {StoreRetencao} store
 */
export function registarDecisaoGatePrincipio(parecerId, decisaoGate, store) {
  const reg = store.obterPorParecer(parecerId);
  if (!reg || !reg.propostaPrincipio) {
    return { ok: false, motivo: "proposta_inexistente" };
  }
  if (reg.estadoHomologacaoPrincipio !== "pendente_gate") {
    return { ok: false, motivo: "estado_invalido", atual: reg.estadoHomologacaoPrincipio };
  }
  if (decisaoGate !== "aprovado" && decisaoGate !== "rejeitado") {
    return { ok: false, motivo: "decisao_gate_invalida" };
  }
  // Mesmo se aprovado, NÃO aplica princípio — só regista o veredicto do Gate.
  reg.estadoHomologacaoPrincipio =
    decisaoGate === "aprovado" ? "aprovado_aguardando_aplicacao_manual" : "rejeitado";
  store.guardar(reg);
  return { ok: true, registo: reg };
}
