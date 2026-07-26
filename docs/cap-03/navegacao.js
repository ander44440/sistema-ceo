/**
 * Componente T — Navegação auxiliar (IMP-009 E7 / ARQ-012 §7 / REQ-043).
 *
 * Menu inferior com cinco destinos. Nunca altera o COA ativo: consulta a
 * Sessão (O) apenas em leitura e jamais invoca `trocar`. Conversas, Memória
 * e Configurações permanecem esqueleto nesta fase (D16).
 *
 * Interface pública: listarDestinos, destinoAtual, irPara, montarEstado.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.CeoNavegacao = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const DESTINOS = Object.freeze([
    Object.freeze({
      id: "painel",
      rotulo: "Painel",
      pagina: "home.html",
      esqueleto: false,
      descricao: "Home Executiva com a conversa como interface principal"
    }),
    Object.freeze({
      id: "projetos",
      rotulo: "Projetos",
      pagina: "projetos.html",
      esqueleto: false,
      descricao: "Superfície administrativa da especialização Projeto"
    }),
    Object.freeze({
      id: "conversas",
      rotulo: "Conversas",
      pagina: "conversas.html",
      esqueleto: true,
      descricao: "Esqueleto (D16); o fluxo conversacional ocorre na Home"
    }),
    Object.freeze({
      id: "memoria",
      rotulo: "Memória",
      pagina: "memoria.html",
      esqueleto: true,
      descricao: "Esqueleto (D16) no escopo do COA ativo"
    }),
    Object.freeze({
      id: "configuracoes",
      rotulo: "Configurações",
      pagina: "configuracoes.html",
      esqueleto: true,
      descricao: "Esqueleto (D16); configurações avançadas fora de escopo"
    })
  ]);

  const DESTINO_PADRAO = "painel";

  function texto(valor) {
    return typeof valor === "string" ? valor.trim() : "";
  }

  function copiar(valor) {
    return JSON.parse(JSON.stringify(valor));
  }

  function encontrar(destinoId) {
    const id = texto(destinoId);
    return (
      DESTINOS.find(function (d) {
        return d.id === id;
      }) || null
    );
  }

  function validarSessao(sessao) {
    if (!sessao || typeof sessao.obterAtivo !== "function") {
      throw new TypeError("ISessaoCOA (O) é obrigatório para a navegação.");
    }
  }

  /**
   * @param {{ sessao: object, destinoInicial?: string }} deps
   */
  function criar(deps) {
    const sessao = deps && deps.sessao;
    validarSessao(sessao);

    let atualId = encontrar(deps && deps.destinoInicial)
      ? texto(deps.destinoInicial)
      : DESTINO_PADRAO;

    /** Leitura pura do COA ativo — T não decide nem altera contexto. */
    function coaAtivoId() {
      const ativo = sessao.obterAtivo();
      return ativo && ativo.coaAtivoId ? ativo.coaAtivoId : null;
    }

    function listarDestinos() {
      return DESTINOS.map(function (d) {
        return Object.freeze({
          id: d.id,
          rotulo: d.rotulo,
          pagina: d.pagina,
          esqueleto: d.esqueleto,
          descricao: d.descricao,
          atual: d.id === atualId
        });
      });
    }

    function destinoAtual() {
      return copiar(encontrar(atualId));
    }

    function irPara(destinoId) {
      const antes = coaAtivoId();
      const destino = encontrar(destinoId);
      if (!destino) {
        return Object.freeze({
          status: "invalido",
          destino: destinoAtual(),
          coaAtivoId: antes,
          coaPreservado: coaAtivoId() === antes,
          mensagem: "Destino inexistente na navegação auxiliar."
        });
      }
      atualId = destino.id;
      const depois = coaAtivoId();
      return Object.freeze({
        status: "ok",
        destino: copiar(destino),
        coaAtivoId: depois,
        coaPreservado: depois === antes
      });
    }

    function montarEstado() {
      const ativo = sessao.obterAtivo();
      const destino = encontrar(atualId);
      return Object.freeze({
        destinoAtual: copiar(destino),
        destinos: Object.freeze(listarDestinos()),
        coaAtivoId: ativo && ativo.coaAtivoId ? ativo.coaAtivoId : null,
        statusSessao: ativo ? ativo.status : "ausente",
        esqueleto: destino.esqueleto,
        observacao: destino.esqueleto
          ? "Superfície mínima nesta fase (D16). A conversa permanece na Home."
          : null
      });
    }

    return Object.freeze({
      listarDestinos: listarDestinos,
      destinoAtual: destinoAtual,
      irPara: irPara,
      montarEstado: montarEstado
    });
  }

  return Object.freeze({
    criar: criar,
    DESTINOS: DESTINOS,
    DESTINO_PADRAO: DESTINO_PADRAO
  });
});
