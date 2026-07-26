/**
 * Componente O — Sessão de COA Ativo (IMP-009 E2 / ARQ-012).
 *
 * Mantém exatamente um `coaAtivoId` por sessão (D2, D19), bootstrap (D14),
 * troca explícita (D3, D15) e persistência mínima da sessão (RepoSessão).
 * Não implementa política P, Home, conversa, navegação nem migração (E3+).
 *
 * Interface pública: ISessaoCOA — bootstrap, obterAtivo, trocar.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.CeoSessaoCOA = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  /** Persistência exclusiva da sessão — distinta do catálogo (D12) e do operacional (E3). */
  const STORE_KEY = "ceo.cap03.sessao-coa.v1";

  /** Nome canônico do COA Motoboy Game 2 para resolução D14 passo 2 (rótulo lógico mg2). */
  const NOME_MG2 = "Motoboy Game 2";

  const RESOLUCAO = Object.freeze({
    ULTIMO_PERSISTIDO: "ultimo_persistido",
    MG2: "mg2",
    PRIMEIRO_CATALOGO: "primeiro_catalogo",
    CATALOGO_VAZIO: "catalogo_vazio"
  });

  function texto(valor) {
    return typeof valor === "string" ? valor.trim() : "";
  }

  function copiar(valor) {
    return JSON.parse(JSON.stringify(valor));
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

  function validarCatalogo(catalogo) {
    if (
      !catalogo ||
      typeof catalogo.listarProjetos !== "function" ||
      typeof catalogo.obterPorId !== "function"
    ) {
      throw new TypeError(
        "Catálogo ICatalogoCOA (listarProjetos, obterPorId) é obrigatório."
      );
    }
  }

  function ehMg2(projeto) {
    if (!projeto) return false;
    if (texto(projeto.rotuloLogico).toLowerCase() === "mg2") return true;
    return texto(projeto.nome) === NOME_MG2;
  }

  /**
   * @param {{ catalogo: object, storage: object, opcoes?: { nomeMg2?: string } }} deps
   */
  function criar(deps) {
    const catalogo = deps && deps.catalogo;
    const storage = deps && deps.storage;
    const opcoes = (deps && deps.opcoes) || {};
    validarCatalogo(catalogo);
    validarStorage(storage);

    const nomeMg2 = texto(opcoes.nomeMg2) || NOME_MG2;

    /** Única fonte de verdade em memória (D19). Nunca exposta para escrita externa. */
    let coaAtivoId = null;
    let coaAtivoAnteriorId = null;
    let bootstrapFeito = false;

    function lerPersistido() {
      const bruto = storage.getItem(STORE_KEY);
      if (!bruto) return null;
      try {
        const dados = JSON.parse(bruto);
        const id = texto(dados && dados.coaAtivoId);
        return id || null;
      } catch (_erro) {
        return null;
      }
    }

    function persistir(idAtivo, idAnterior) {
      storage.setItem(
        STORE_KEY,
        JSON.stringify({
          coaAtivoId: idAtivo,
          coaAtivoAnteriorId: idAnterior || null,
          atualizadoEm: new Date().toISOString()
        })
      );
    }

    function existeNoCatalogo(coaId) {
      return !!catalogo.obterPorId(coaId);
    }

    function encontrarMg2() {
      const lista = catalogo.listarProjetos();
      return (
        lista.find(function (p) {
          if (texto(p.rotuloLogico).toLowerCase() === "mg2") return true;
          return texto(p.nome) === nomeMg2;
        }) || null
      );
    }

    function definirAtivo(novoId, anteriorId) {
      const id = texto(novoId);
      if (!id || !existeNoCatalogo(id)) {
        throw new Error(
          "Troca inválida: coaId inexistente no catálogo."
        );
      }
      coaAtivoAnteriorId = anteriorId !== undefined ? anteriorId : coaAtivoId;
      coaAtivoId = id;
      persistir(coaAtivoId, coaAtivoAnteriorId);
      if (typeof catalogo.atualizarUltimaAtividade === "function") {
        catalogo.atualizarUltimaAtividade(coaAtivoId);
      }
    }

    function bootstrap() {
      const lista = catalogo.listarProjetos();
      if (!lista.length) {
        coaAtivoId = null;
        coaAtivoAnteriorId = null;
        bootstrapFeito = true;
        persistir(null, null);
        return Object.freeze({
          status: "catalogo_vazio",
          coaAtivoId: null,
          resolucao: RESOLUCAO.CATALOGO_VAZIO,
          mensagem:
            "Catálogo vazio: criar o primeiro Projeto antes de operar (REQ-037 / D14)."
        });
      }

      const ultimo = lerPersistido();
      if (ultimo && existeNoCatalogo(ultimo)) {
        coaAtivoId = ultimo;
        coaAtivoAnteriorId = null;
        bootstrapFeito = true;
        persistir(coaAtivoId, null);
        return Object.freeze({
          status: "ok",
          coaAtivoId: coaAtivoId,
          resolucao: RESOLUCAO.ULTIMO_PERSISTIDO
        });
      }

      const mg2 = encontrarMg2();
      if (mg2) {
        coaAtivoId = mg2.coaId;
        coaAtivoAnteriorId = null;
        bootstrapFeito = true;
        persistir(coaAtivoId, null);
        return Object.freeze({
          status: "ok",
          coaAtivoId: coaAtivoId,
          resolucao: RESOLUCAO.MG2
        });
      }

      const primeiro = lista[0];
      coaAtivoId = primeiro.coaId;
      coaAtivoAnteriorId = null;
      bootstrapFeito = true;
      persistir(coaAtivoId, null);
      return Object.freeze({
        status: "ok",
        coaAtivoId: coaAtivoId,
        resolucao: RESOLUCAO.PRIMEIRO_CATALOGO
      });
    }

    function obterAtivo() {
      if (!bootstrapFeito) {
        return Object.freeze({
          status: "ausente",
          coaAtivoId: null,
          coa: null,
          mensagem: "Sessão não inicializada: executar bootstrap()."
        });
      }
      if (!coaAtivoId) {
        return Object.freeze({
          status: "catalogo_vazio",
          coaAtivoId: null,
          coa: null,
          mensagem:
            "Nenhum COA ativo: catálogo vazio — criar o primeiro Projeto."
        });
      }
      const coa = catalogo.obterPorId(coaAtivoId);
      if (!coa) {
        return Object.freeze({
          status: "invalido",
          coaAtivoId: coaAtivoId,
          coa: null,
          mensagem:
            "coaAtivoId persistido não existe mais no catálogo — executar bootstrap()."
        });
      }
      return Object.freeze({
        status: "ativo",
        coaAtivoId: coaAtivoId,
        coa: copiar(coa),
        coaAtivoAnteriorId: coaAtivoAnteriorId
      });
    }

    /**
     * Troca explícita (D3). D15: se conversaEmAndamento e sem confirmado,
     * retorna confirmacao_requerida sem alterar estado.
     */
    function trocar(novoCoaId, opcoesTroca) {
      const opts = opcoesTroca || {};
      if (!bootstrapFeito) {
        throw new Error("Sessão não inicializada: executar bootstrap() antes de trocar.");
      }
      if (opts.conversaEmAndamento && !opts.confirmado) {
        return Object.freeze({
          status: "confirmacao_requerida",
          coaAtivoId: coaAtivoId,
          coaDestinoId: texto(novoCoaId) || null,
          mensagem:
            "Confirmação mínima necessária antes de trocar o COA (D15)."
        });
      }
      const destino = texto(novoCoaId);
      if (!destino) {
        throw new TypeError("coaId de destino é obrigatório para trocar.");
      }
      if (destino === coaAtivoId) {
        return Object.freeze({
          status: "ok",
          coaAtivoId: coaAtivoId,
          coaAtivoAnteriorId: coaAtivoAnteriorId,
          inalterado: true
        });
      }
      const anterior = coaAtivoId;
      definirAtivo(destino, anterior);
      return Object.freeze({
        status: "ok",
        coaAtivoId: coaAtivoId,
        coaAtivoAnteriorId: anterior,
        inalterado: false
      });
    }

    return Object.freeze({
      bootstrap: bootstrap,
      obterAtivo: obterAtivo,
      trocar: trocar,
      chavePersistencia: STORE_KEY
    });
  }

  return Object.freeze({
    criar: criar,
    STORE_KEY: STORE_KEY,
    NOME_MG2: NOME_MG2,
    RESOLUCAO: RESOLUCAO
  });
});
