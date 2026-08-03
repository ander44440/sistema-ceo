/**
 * Componente N (parcial) + RepoCOA — Catálogo de Contextos Operacionais (IMP-009 E1 / ARQ-012).
 *
 * Materializa o modelo COA (especialização Projeto), identificador persistente,
 * metadados obrigatórios e persistência do catálogo. Não define COA ativo,
 * sessão, isolamento operacional, Home, conversa, navegação nem migração (E2+).
 *
 * Interface pública: ICatalogoCOA — criarProjeto, listarProjetos, obterPorId.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.CeoCatalogoCOA = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  /** Chave exclusiva do catálogo (D12 — separado do repositório operacional). */
  const STORE_KEY = "ceo.cap03.catalogo-coa.v1";

  const ESPECIALIZACAO = Object.freeze({
    PROJETO: "projeto"
  });

  /** Ciclo de vida do Projeto — distinto do COA ativo da sessão (ARQ-012 §1.5). */
  const STATUS_CICLO_VIDA = Object.freeze({
    ATIVO: "ativo",
    PAUSADO: "pausado",
    CONCLUIDO: "concluido"
  });

  const STATUS_VALIDOS = Object.freeze([
    STATUS_CICLO_VIDA.ATIVO,
    STATUS_CICLO_VIDA.PAUSADO,
    STATUS_CICLO_VIDA.CONCLUIDO
  ]);

  function texto(valor) {
    return typeof valor === "string" ? valor.trim() : "";
  }

  function copiar(valor) {
    return JSON.parse(JSON.stringify(valor));
  }

  function agoraIso(agora) {
    if (typeof agora === "function") return agora();
    return new Date().toISOString();
  }

  function gerarCoaId() {
    if (
      typeof globalThis !== "undefined" &&
      globalThis.crypto &&
      typeof globalThis.crypto.randomUUID === "function"
    ) {
      return globalThis.crypto.randomUUID();
    }
    return (
      "coa-" +
      Date.now().toString(36) +
      "-" +
      Math.random().toString(36).slice(2, 10)
    );
  }

  function validarStorage(storage) {
    if (
      !storage ||
      typeof storage.getItem !== "function" ||
      typeof storage.setItem !== "function"
    ) {
      throw new TypeError("Storage compatível com getItem/setItem é obrigatório.");
    }
  }

  /**
   * Modelo lógico ProjetoCOA (ARQ-012 §1.4 / §9.3).
   * coaId é imutável após criação.
   */
  function montarProjetoCOA(entrada, coaId, timestamps) {
    const nome = texto(entrada && entrada.nome);
    const objetivoPrincipal = texto(entrada && entrada.objetivoPrincipal);
    const descricaoBruta =
      entrada && entrada.descricao !== undefined && entrada.descricao !== null
        ? texto(entrada.descricao)
        : "";
    const statusCicloVida = texto(
      (entrada && entrada.statusCicloVida) || STATUS_CICLO_VIDA.ATIVO
    );

    const ausentes = [];
    if (!nome) ausentes.push("nome");
    if (!objetivoPrincipal) ausentes.push("objetivoPrincipal");
    if (!STATUS_VALIDOS.includes(statusCicloVida)) {
      throw new TypeError(
        "statusCicloVida inválido. Valores: ativo | pausado | concluido."
      );
    }
    if (ausentes.length) {
      throw new TypeError(
        "Projeto incompleto. Campos obrigatórios ausentes: " +
          ausentes.join(", ") +
          "."
      );
    }

    return Object.freeze({
      coaId: coaId,
      especializacao: ESPECIALIZACAO.PROJETO,
      nome: nome,
      objetivoPrincipal: objetivoPrincipal,
      descricao: descricaoBruta || null,
      statusCicloVida: statusCicloVida,
      ultimaAtividade: timestamps.ultimaAtividade,
      criadoEm: timestamps.criadoEm,
      atualizadoEm: timestamps.atualizadoEm
    });
  }

  /**
   * RepoCOA + serviço de catálogo (ICatalogoCOA).
   * Opções: { agora?: () => string ISO } — injetável para testes.
   */
  function criar(storage, opcoes) {
    validarStorage(storage);
    const opts = opcoes || {};

    function ler() {
      const bruto = storage.getItem(STORE_KEY);
      if (!bruto) return [];
      try {
        const dados = JSON.parse(bruto);
        return Array.isArray(dados) ? dados : [];
      } catch (_erro) {
        return [];
      }
    }

    function salvar(lista) {
      storage.setItem(STORE_KEY, JSON.stringify(lista));
    }

    function criarProjeto(entrada) {
      const ts = agoraIso(opts.agora);
      const coaId = gerarCoaId();
      const projeto = montarProjetoCOA(entrada, coaId, {
        ultimaAtividade: ts,
        criadoEm: ts,
        atualizadoEm: ts
      });

      const lista = ler();
      if (lista.some(function (item) { return item.coaId === coaId; })) {
        throw new Error("coaId duplicado no catálogo — geração falhou.");
      }
      lista.push(projeto);
      salvar(lista);
      return copiar(projeto);
    }

    function listarProjetos() {
      return ler()
        .filter(function (item) {
          return item && item.especializacao === ESPECIALIZACAO.PROJETO;
        })
        .map(function (item) {
          return copiar(item);
        });
    }

    function obterPorId(coaId) {
      const id = texto(coaId);
      if (!id) return null;
      const encontrado = ler().find(function (item) {
        return item && item.coaId === id;
      });
      return encontrado ? copiar(encontrado) : null;
    }

    /**
     * Mantém ultimaAtividade (D11 — mecanismo no catálogo; dispara em atos
     * operacionais nas etapas posteriores). Não altera coaId.
     */
    function atualizarUltimaAtividade(coaId) {
      const id = texto(coaId);
      if (!id) {
        throw new TypeError("coaId é obrigatório para atualizarUltimaAtividade.");
      }
      const lista = ler();
      const indice = lista.findIndex(function (item) {
        return item && item.coaId === id;
      });
      if (indice < 0) {
        throw new Error("COA não encontrado no catálogo: " + id);
      }
      const ts = agoraIso(opts.agora);
      const atual = lista[indice];
      const atualizado = Object.freeze({
        coaId: atual.coaId,
        especializacao: atual.especializacao,
        nome: atual.nome,
        objetivoPrincipal: atual.objetivoPrincipal,
        descricao: atual.descricao,
        statusCicloVida: atual.statusCicloVida,
        ultimaAtividade: ts,
        criadoEm: atual.criadoEm,
        atualizadoEm: ts
      });
      lista[indice] = atualizado;
      salvar(lista);
      return copiar(atualizado);
    }

    return Object.freeze({
      criarProjeto: criarProjeto,
      listarProjetos: listarProjetos,
      obterPorId: obterPorId,
      atualizarUltimaAtividade: atualizarUltimaAtividade,
      /** Metadados de sede do repositório (somente leitura). */
      chavePersistencia: STORE_KEY
    });
  }

  return Object.freeze({
    criar: criar,
    ESPECIALIZACAO: ESPECIALIZACAO,
    STATUS_CICLO_VIDA: STATUS_CICLO_VIDA,
    STORE_KEY: STORE_KEY,
    montarProjetoCOA: montarProjetoCOA,
    gerarCoaId: gerarCoaId
  });
});
