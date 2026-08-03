/**
 * Componente P — Política de Isolamento + RepoOperacional (IMP-009 E3 / ARQ-012).
 *
 * Garante que todo registro operacional exige `coaId` (D4), proíbe consulta
 * cross-COA (D5) e filtra operações pelo `coaAtivoId` obtido exclusivamente
 * via Componente O (D13 / D19). O repositório operacional não é exposto
 * fora desta política.
 *
 * Interface pública: IRepositorioOperacional mediada por P —
 * gravar, listar, obter, listarDoCoaAtivo.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.CeoPoliticaIsolamento = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  /** Persistência operacional — distinta de catálogo (E1) e sessão (E2). */
  const STORE_KEY = "ceo.cap03.operacional.v1";

  const TIPOS = Object.freeze({
    DECISAO: "decisao",
    CONHECIMENTO: "conhecimento",
    ESTADO_DIA: "estadoDia",
    ATIVIDADE: "atividade",
    TURNO_CONVERSA: "turnoConversa",
    PENDENCIA: "pendencia",
    GENERICO: "generico"
  });

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

  function gerarId() {
    if (
      typeof globalThis !== "undefined" &&
      globalThis.crypto &&
      typeof globalThis.crypto.randomUUID === "function"
    ) {
      return "op-" + globalThis.crypto.randomUUID();
    }
    return (
      "op-" +
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

  function validarSessao(sessao) {
    if (!sessao || typeof sessao.obterAtivo !== "function") {
      throw new TypeError(
        "Sessão ISessaoCOA (obterAtivo) é obrigatória para a política P."
      );
    }
  }

  /**
   * RepoOperacional interno — acesso exclusivo via política P.
   * Não exportado como API pública.
   */
  function criarRepoInterno(storage) {
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

    function inserir(registro) {
      const lista = ler();
      lista.push(registro);
      salvar(lista);
      return registro;
    }

    function filtrarPorCoa(coaId) {
      const id = texto(coaId);
      return ler().filter(function (item) {
        return item && item.coaId === id;
      });
    }

    function obterNoCoa(coaId, registroId) {
      const idReg = texto(registroId);
      return (
        filtrarPorCoa(coaId).find(function (item) {
          return item && item.id === idReg;
        }) || null
      );
    }

    return Object.freeze({
      inserir: inserir,
      filtrarPorCoa: filtrarPorCoa,
      obterNoCoa: obterNoCoa
    });
  }

  /**
   * @param {{ sessao: object, storage: object, opcoes?: { agora?: function } }} deps
   */
  function criar(deps) {
    const sessao = deps && deps.sessao;
    const storage = deps && deps.storage;
    const opcoes = (deps && deps.opcoes) || {};
    validarSessao(sessao);
    validarStorage(storage);

    const repo = criarRepoInterno(storage);

    function exigirCoaAtivo() {
      const ativo = sessao.obterAtivo();
      if (!ativo || ativo.status !== "ativo" || !texto(ativo.coaAtivoId)) {
        throw new Error(
          "Operação operacional bloqueada: não há COA ativo válido (REQ-039 / D13)."
        );
      }
      return texto(ativo.coaAtivoId);
    }

    /**
     * D5/D13: qualquer coaId informado pelo chamador deve coincidir com o ativo.
     */
    function exigirMesmoCoaAtivo(coaIdInformado, operacao) {
      const ativoId = exigirCoaAtivo();
      const pedido = texto(coaIdInformado);
      if (pedido && pedido !== ativoId) {
        throw new Error(
          "Operação cross-COA bloqueada (" +
            operacao +
            "): coaId=" +
            pedido +
            " ≠ coaAtivoId=" +
            ativoId +
            " (D5 / D13)."
        );
      }
      return ativoId;
    }

    function normalizarRegistro(entrada, coaAtivoId) {
      if (!entrada || typeof entrada !== "object") {
        throw new TypeError("Registro operacional inválido.");
      }

      const coaInformado = texto(entrada.coaId);
      if (coaInformado && coaInformado !== coaAtivoId) {
        throw new Error(
          "Gravação cross-COA bloqueada: registro.coaId ≠ coaAtivoId (D4 / D5)."
        );
      }

      const tipo = texto(entrada.tipo) || TIPOS.GENERICO;
      const tiposValidos = Object.keys(TIPOS).map(function (k) {
        return TIPOS[k];
      });
      if (tiposValidos.indexOf(tipo) < 0) {
        throw new TypeError("tipo operacional inválido: " + tipo);
      }

      const ts = agoraIso(opcoes.agora);
      return Object.freeze({
        id: texto(entrada.id) || gerarId(),
        coaId: coaAtivoId,
        tipo: tipo,
        titulo: texto(entrada.titulo) || null,
        conteudo: entrada.conteudo !== undefined ? entrada.conteudo : null,
        criadoEm: ts,
        atualizadoEm: ts
      });
    }

    /** Grava registro no COA ativo; injeta/valida coaId (D4). */
    function gravar(entrada) {
      const coaAtivoId = exigirCoaAtivo();
      const registro = normalizarRegistro(entrada, coaAtivoId);
      repo.inserir(registro);
      return copiar(registro);
    }

    /**
     * Lista registros do COA ativo (D13).
     * Se filtro.coaId for informado e divergir do ativo → rejeita (D5).
     */
    function listar(filtro) {
      const f = filtro || {};
      const coaAtivoId = exigirMesmoCoaAtivo(f.coaId, "listar");
      let itens = repo.filtrarPorCoa(coaAtivoId);
      const tipo = texto(f.tipo);
      if (tipo) {
        itens = itens.filter(function (item) {
          return item.tipo === tipo;
        });
      }
      return itens.map(function (item) {
        return copiar(item);
      });
    }

    /** Alias explícito — sempre o COA ativo. */
    function listarDoCoaAtivo(filtro) {
      return listar(filtro || {});
    }

    /**
     * Recupera registro por id no escopo do COA ativo.
     * Se opções.coaId divergir do ativo → rejeita.
     */
    function obter(registroId, opcoesObter) {
      const opts = opcoesObter || {};
      const coaAtivoId = exigirMesmoCoaAtivo(opts.coaId, "obter");
      const encontrado = repo.obterNoCoa(coaAtivoId, registroId);
      return encontrado ? copiar(encontrado) : null;
    }

    /**
     * Recuperação explícita por coaId — somente se == coaAtivoId (D5).
     */
    function listarPorCoaId(coaId) {
      return listar({ coaId: coaId });
    }

    return Object.freeze({
      gravar: gravar,
      listar: listar,
      listarDoCoaAtivo: listarDoCoaAtivo,
      listarPorCoaId: listarPorCoaId,
      obter: obter,
      chavePersistencia: STORE_KEY,
      TIPOS: TIPOS
    });
  }

  return Object.freeze({
    criar: criar,
    STORE_KEY: STORE_KEY,
    TIPOS: TIPOS
  });
});
