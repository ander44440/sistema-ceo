/**
 * Camada de aplicação — Tela de Projetos (IMP-009 E4 / ARQ-012 §6 / REQ-042).
 *
 * Orquestra exclusivamente ICatalogoCOA (E1) e ISessaoCOA (E2). Não duplica
 * regras de negócio; não acessa estado interno da sessão; não altera a
 * política P (E3). Home, conversa, navegação e migração ficam fora (E5+).
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.CeoTelaProjetos = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  function texto(valor) {
    return typeof valor === "string" ? valor.trim() : "";
  }

  function copiar(valor) {
    return JSON.parse(JSON.stringify(valor));
  }

  function validarDeps(deps) {
    const catalogo = deps && deps.catalogo;
    const sessao = deps && deps.sessao;
    if (
      !catalogo ||
      typeof catalogo.listarProjetos !== "function" ||
      typeof catalogo.criarProjeto !== "function" ||
      typeof catalogo.obterPorId !== "function"
    ) {
      throw new TypeError("ICatalogoCOA (E1) é obrigatório.");
    }
    if (
      !sessao ||
      typeof sessao.bootstrap !== "function" ||
      typeof sessao.obterAtivo !== "function" ||
      typeof sessao.trocar !== "function"
    ) {
      throw new TypeError("ISessaoCOA (E2) é obrigatório.");
    }
    return { catalogo: catalogo, sessao: sessao };
  }

  /**
   * @param {{ catalogo: object, sessao: object }} deps
   */
  function criar(deps) {
    const { catalogo, sessao } = validarDeps(deps);

    /** Seleção de UI (destaque) — distinta do COA ativo da sessão. */
    let selecionadoId = null;
    let inicializado = false;
    let ultimaMensagem = null;

    function sincronizarSessao() {
      const ativo = sessao.obterAtivo();
      if (ativo.status === "ausente") {
        return sessao.bootstrap();
      }
      if (ativo.status === "invalido") {
        return sessao.bootstrap();
      }
      return null;
    }

    function montarEstado() {
      if (!inicializado) {
        sincronizarSessao();
        inicializado = true;
      }

      const projetos = catalogo.listarProjetos().map(function (p) {
        return copiar(p);
      });
      const ativo = sessao.obterAtivo();
      const coaAtivoId = ativo.coaAtivoId || null;

      if (
        selecionadoId &&
        !projetos.some(function (p) {
          return p.coaId === selecionadoId;
        })
      ) {
        selecionadoId = null;
      }

      const lista = projetos.map(function (p) {
        return Object.freeze({
          coaId: p.coaId,
          nome: p.nome,
          objetivoPrincipal: p.objetivoPrincipal,
          descricao: p.descricao,
          statusCicloVida: p.statusCicloVida,
          ultimaAtividade: p.ultimaAtividade,
          ativo: p.coaId === coaAtivoId,
          selecionado: p.coaId === selecionadoId
        });
      });

      return Object.freeze({
        vazio: lista.length === 0,
        projetos: Object.freeze(lista),
        coaAtivoId: coaAtivoId,
        statusSessao: ativo.status,
        selecionadoId: selecionadoId,
        mensagem: ultimaMensagem,
        precisaCriarPrimeiroProjeto:
          lista.length === 0 || ativo.status === "catalogo_vazio"
      });
    }

    function inicializar() {
      inicializado = false;
      ultimaMensagem = null;
      selecionadoId = null;
      sincronizarSessao();
      inicializado = true;
      const estado = montarEstado();
      if (estado.vazio) {
        ultimaMensagem =
          "Catálogo vazio: cadastre o primeiro Projeto para operar (REQ-037).";
        return montarEstado();
      }
      return estado;
    }

    function criarProjeto(entrada) {
      ultimaMensagem = null;
      const criado = catalogo.criarProjeto(entrada);
      const ativo = sessao.obterAtivo();
      if (
        ativo.status === "catalogo_vazio" ||
        ativo.status === "ausente" ||
        !ativo.coaAtivoId
      ) {
        sessao.bootstrap();
      }
      selecionadoId = criado.coaId;
      ultimaMensagem = "Projeto criado e disponível imediatamente.";
      return Object.freeze({
        projeto: copiar(criado),
        estado: montarEstado()
      });
    }

    function selecionarProjeto(coaId) {
      ultimaMensagem = null;
      const id = texto(coaId);
      if (!id) {
        ultimaMensagem = "Seleção inválida: informe um coaId.";
        return Object.freeze({ status: "invalido", estado: montarEstado() });
      }
      const projeto = catalogo.obterPorId(id);
      if (!projeto) {
        selecionadoId = null;
        ultimaMensagem = "Seleção inválida: Projeto não encontrado no catálogo.";
        return Object.freeze({ status: "invalido", estado: montarEstado() });
      }
      selecionadoId = id;
      return Object.freeze({
        status: "ok",
        projeto: copiar(projeto),
        estado: montarEstado()
      });
    }

    /**
     * Abrir Projeto = troca explícita do COA ativo via Componente O (REQ-038).
     */
    function abrirProjeto(coaId) {
      ultimaMensagem = null;
      const id = texto(coaId) || selecionadoId;
      if (!id) {
        ultimaMensagem = "Abertura inválida: nenhum Projeto selecionado.";
        return Object.freeze({ status: "invalido", estado: montarEstado() });
      }
      if (!catalogo.obterPorId(id)) {
        ultimaMensagem = "Abertura inválida: Projeto inexistente.";
        return Object.freeze({ status: "invalido", estado: montarEstado() });
      }
      sincronizarSessao();
      try {
        const troca = sessao.trocar(id);
        if (troca.status === "confirmacao_requerida") {
          ultimaMensagem = troca.mensagem;
          return Object.freeze({
            status: "confirmacao_requerida",
            estado: montarEstado()
          });
        }
        selecionadoId = id;
        ultimaMensagem = "Projeto aberto — agora é o COA ativo.";
        return Object.freeze({
          status: "ok",
          troca: troca,
          estado: montarEstado()
        });
      } catch (erro) {
        ultimaMensagem = String(erro && erro.message ? erro.message : erro);
        return Object.freeze({ status: "erro", estado: montarEstado() });
      }
    }

    return Object.freeze({
      inicializar: inicializar,
      montarEstado: montarEstado,
      criarProjeto: criarProjeto,
      selecionarProjeto: selecionarProjeto,
      abrirProjeto: abrirProjeto
    });
  }

  return Object.freeze({
    criar: criar
  });
});
