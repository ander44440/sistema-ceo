/**
 * Componente S — Migração MG2 → COA "Motoboy Game 2" (IMP-009 E8 / ARQ-012 §8 / REQ-044).
 *
 * Interface pública IMigracao: inventariar, garantirCoaMg2, mapear,
 * executar, evidenciar.
 *
 * Garantias (deliberações CTO da Proposta E8):
 * - determinística: inventário fixo, sem aleatoriedade no fluxo;
 * - idempotente por `origemId` (RepoMigração é a chave de deduplicação);
 * - mapeamento exclusivamente 1:1 (D17), sem transformação semântica;
 * - escrita somente pelos contratos públicos do Componente P;
 * - COA mg2 garantido antes de qualquer gravação;
 * - inventário somente leitura; `docs/mvp/` intocado (D7/D8);
 * - após a migração, o COA ativo permanece em "Motoboy Game 2";
 * - sem `reverter()` e sem UI nesta etapa.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory(require("./inventario-mvp-mg2.js"));
  } else {
    root.CeoMigracaoMg2 = factory(root.CeoInventarioMvpMg2);
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function (Inventario) {
  "use strict";

  /** Persistência exclusiva do RepoMigração — separada de catálogo, sessão e operacional. */
  const STORE_KEY = "ceo.cap03.migracao.v1";

  const STATUS_ITEM = Object.freeze({
    PENDENTE: "pendente",
    MIGRADO: "migrado",
    JA_EXISTENTE: "ja_existente"
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

  function validarDeps(deps) {
    const erros = [];
    if (!deps || !deps.catalogo || typeof deps.catalogo.criarProjeto !== "function") {
      erros.push("catalogo (ICatalogoCOA)");
    }
    if (!deps || !deps.sessao || typeof deps.sessao.trocar !== "function") {
      erros.push("sessao (ISessaoCOA)");
    }
    if (!deps || !deps.politica || typeof deps.politica.gravar !== "function") {
      erros.push("politica (IRepositorioOperacional via P)");
    }
    if (
      !deps ||
      !deps.storage ||
      typeof deps.storage.getItem !== "function" ||
      typeof deps.storage.setItem !== "function"
    ) {
      erros.push("storage");
    }
    if (erros.length) {
      throw new TypeError(
        "Dependências obrigatórias ausentes para a migração: " + erros.join(", ") + "."
      );
    }
  }

  /** RepoMigração — evidência rastreável origem→destino e chave de idempotência. */
  function criarRepoMigracao(storage) {
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

    function obterPorOrigem(origemId) {
      const id = texto(origemId);
      return (
        ler().find(function (item) {
          return item && item.origemId === id;
        }) || null
      );
    }

    function registrar(entrada) {
      const lista = ler();
      lista.push(entrada);
      salvar(lista);
      return entrada;
    }

    return Object.freeze({
      ler: ler,
      obterPorOrigem: obterPorOrigem,
      registrar: registrar
    });
  }

  /**
   * @param {{ catalogo: object, sessao: object, politica: object,
   *           storage: object, opcoes?: { agora?: function } }} deps
   */
  function criar(deps) {
    validarDeps(deps);
    const catalogo = deps.catalogo;
    const sessao = deps.sessao;
    const politica = deps.politica;
    const opcoes = deps.opcoes || {};
    const repoMigracao = criarRepoMigracao(deps.storage);

    /** Inventário somente leitura — cópia defensiva da fixture congelada. */
    function inventariar() {
      return Object.freeze({
        coaDestino: copiar(Inventario.COA_DESTINO),
        registros: copiar(Inventario.REGISTROS),
        total: Inventario.TOTAL_REGISTROS
      });
    }

    /** Localiza ou cria o COA "Motoboy Game 2" no catálogo (via N, público). */
    function garantirCoaMg2() {
      const existente = catalogo.listarProjetos().find(function (p) {
        return texto(p.nome) === Inventario.COA_DESTINO.nome;
      });
      if (existente) {
        return Object.freeze({ coaId: existente.coaId, criado: false });
      }
      const novo = catalogo.criarProjeto({
        nome: Inventario.COA_DESTINO.nome,
        objetivoPrincipal: Inventario.COA_DESTINO.objetivoPrincipal,
        descricao: Inventario.COA_DESTINO.descricao
      });
      return Object.freeze({ coaId: novo.coaId, criado: true });
    }

    /** Mapa origem→destino previsto/realizado, sem executar nada. */
    function mapear() {
      return Inventario.REGISTROS.map(function (registro) {
        const evidencia = repoMigracao.obterPorOrigem(registro.origemId);
        return Object.freeze({
          origemId: registro.origemId,
          destinoId: registro.origemId,
          tipo: registro.tipo,
          fonte: registro.fonte,
          status: evidencia ? evidencia.status : STATUS_ITEM.PENDENTE
        });
      });
    }

    /** Garante sessão inicializada e ativa o COA mg2 antes de gravar. */
    function ativarCoaMg2(coaId) {
      if (sessao.obterAtivo().status === "ausente") {
        sessao.bootstrap();
      }
      const troca = sessao.trocar(coaId);
      if (troca.status !== "ok" || troca.coaAtivoId !== coaId) {
        throw new Error(
          "Migração abortada: não foi possível ativar o COA Motoboy Game 2."
        );
      }
    }

    /**
     * Execução idempotente: itens já evidenciados no RepoMigração são
     * pulados; reinício parcial não duplica nem corrompe (ARQ-012 §8.2).
     * Ao final, o COA ativo permanece em "Motoboy Game 2" (deliberação 3).
     */
    function executar() {
      const mg2 = garantirCoaMg2();
      ativarCoaMg2(mg2.coaId);

      const itens = Inventario.REGISTROS.map(function (registro) {
        const jaMigrado = repoMigracao.obterPorOrigem(registro.origemId);
        if (jaMigrado) {
          return Object.freeze({
            origemId: registro.origemId,
            destinoId: jaMigrado.destinoId,
            status: STATUS_ITEM.JA_EXISTENTE
          });
        }

        const gravado = politica.gravar({
          id: registro.origemId,
          tipo: registro.tipo,
          titulo: registro.titulo,
          conteudo: copiar(registro.conteudo)
        });

        repoMigracao.registrar({
          origemId: registro.origemId,
          destinoId: gravado.id,
          coaId: gravado.coaId,
          tipo: registro.tipo,
          fonte: registro.fonte,
          status: STATUS_ITEM.MIGRADO,
          executadoEm: agoraIso(opcoes.agora)
        });

        return Object.freeze({
          origemId: registro.origemId,
          destinoId: gravado.id,
          status: STATUS_ITEM.MIGRADO
        });
      });

      return Object.freeze({
        status: "ok",
        coaId: mg2.coaId,
        coaCriado: mg2.criado,
        itens: Object.freeze(itens),
        migrados: itens.filter(function (i) {
          return i.status === STATUS_ITEM.MIGRADO;
        }).length,
        jaExistentes: itens.filter(function (i) {
          return i.status === STATUS_ITEM.JA_EXISTENTE;
        }).length
      });
    }

    /**
     * Relatório de evidência (REQ-044): completude quantitativa, mapa
     * rastreável e verificação dos destinos no COA ativo (mg2).
     */
    function evidenciar() {
      const mapa = mapear();
      const evidencias = repoMigracao.ler();
      const ativo = sessao.obterAtivo();

      let destinosNoCoaMg2 = null;
      if (ativo.status === "ativo") {
        const idsMigrados = evidencias.map(function (e) {
          return e.destinoId;
        });
        destinosNoCoaMg2 = politica
          .listarDoCoaAtivo()
          .filter(function (registro) {
            return idsMigrados.indexOf(registro.id) >= 0;
          }).length;
      }

      return Object.freeze({
        totalOrigem: Inventario.TOTAL_REGISTROS,
        totalMigrado: evidencias.length,
        completo: evidencias.length === Inventario.TOTAL_REGISTROS,
        destinosVerificadosNoCoaAtivo: destinosNoCoaMg2,
        coaAtivoId: ativo.coaAtivoId || null,
        mapa: Object.freeze(mapa),
        evidencias: Object.freeze(copiar(evidencias))
      });
    }

    return Object.freeze({
      inventariar: inventariar,
      garantirCoaMg2: garantirCoaMg2,
      mapear: mapear,
      executar: executar,
      evidenciar: evidenciar,
      chavePersistencia: STORE_KEY
    });
  }

  return Object.freeze({
    criar: criar,
    STORE_KEY: STORE_KEY,
    STATUS_ITEM: STATUS_ITEM
  });
});
