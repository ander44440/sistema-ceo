/**
 * Componente Q — Home Executiva (IMP-009 E5 / ARQ-012 §4 / REQ-040).
 *
 * Monta o Resumo Executivo e blocos auxiliares como composição dinâmica
 * a partir do COA ativo (via O) e dados operacionais (via P). Não persiste
 * o resumo; não duplica regras; não implementa conversa (E6) nem navegação (E7).
 *
 * Interface pública: IHome — montarResumo, montarBlocos, montarHome, trocarCoa.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.CeoHomeExecutiva = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const AUSENCIA = "Ausência explícita: nenhum registro pertinente no COA ativo.";

  function texto(valor) {
    return typeof valor === "string" ? valor.trim() : "";
  }

  function copiar(valor) {
    return JSON.parse(JSON.stringify(valor));
  }

  function validarDeps(deps) {
    const catalogo = deps && deps.catalogo;
    const sessao = deps && deps.sessao;
    const politica = deps && deps.politica;
    if (
      !catalogo ||
      typeof catalogo.listarProjetos !== "function" ||
      typeof catalogo.obterPorId !== "function"
    ) {
      throw new TypeError("ICatalogoCOA (E1) é obrigatório.");
    }
    if (
      !sessao ||
      typeof sessao.obterAtivo !== "function" ||
      typeof sessao.trocar !== "function" ||
      typeof sessao.bootstrap !== "function"
    ) {
      throw new TypeError("ISessaoCOA (E2) é obrigatório.");
    }
    if (
      !politica ||
      typeof politica.listar !== "function" ||
      typeof politica.listarDoCoaAtivo !== "function"
    ) {
      throw new TypeError("Política P / IRepositorioOperacional (E3) é obrigatória.");
    }
    return { catalogo: catalogo, sessao: sessao, politica: politica };
  }

  function rotuloRegistro(reg) {
    if (!reg) return null;
    if (texto(reg.titulo)) return texto(reg.titulo);
    if (typeof reg.conteudo === "string" && texto(reg.conteudo)) {
      return texto(reg.conteudo);
    }
    if (reg.conteudo !== null && reg.conteudo !== undefined) {
      try {
        return JSON.stringify(reg.conteudo);
      } catch (_e) {
        return String(reg.conteudo);
      }
    }
    return reg.id || null;
  }

  function primeiroRotulo(lista) {
    if (!lista || !lista.length) return null;
    return rotuloRegistro(lista[0]);
  }

  /**
   * @param {{ catalogo: object, sessao: object, politica: object }} deps
   */
  function criar(deps) {
    const { catalogo, sessao, politica } = validarDeps(deps);
    let inicializado = false;

    function garantirSessao() {
      const ativo = sessao.obterAtivo();
      if (ativo.status === "ausente" || ativo.status === "invalido") {
        sessao.bootstrap();
      }
    }

    function obterCoaAtivo() {
      garantirSessao();
      const ativo = sessao.obterAtivo();
      if (ativo.status !== "ativo" || !ativo.coaAtivoId) {
        return Object.freeze({
          status: ativo.status || "catalogo_vazio",
          coaAtivoId: null,
          projeto: null,
          mensagem:
            "Nenhum COA ativo. Cadastre e abra um Projeto antes de operar a Home."
        });
      }
      const projeto =
        ativo.coa ||
        catalogo.obterPorId(ativo.coaAtivoId) ||
        null;
      return Object.freeze({
        status: "ativo",
        coaAtivoId: ativo.coaAtivoId,
        projeto: projeto ? copiar(projeto) : null
      });
    }

    /**
     * Resumo Executivo — composição lógica dinâmica (ARQ-012 §4.1).
     * Não grava em storage.
     */
    function montarResumo() {
      const ctx = obterCoaAtivo();
      if (ctx.status !== "ativo" || !ctx.projeto) {
        return Object.freeze({
          status: ctx.status,
          coaAtivoId: null,
          projeto: null,
          objetivo: null,
          situacaoAtual: AUSENCIA,
          proximoPasso: AUSENCIA,
          risco: AUSENCIA,
          pendencias: AUSENCIA,
          ultimaAtividade: null,
          statusCicloVida: null,
          mensagem: ctx.mensagem
        });
      }

      const p = ctx.projeto;
      const estados = politica.listar({ tipo: "estadoDia" });
      const atividades = politica.listar({ tipo: "atividade" });
      const pendencias = politica.listar({ tipo: "pendencia" });
      const decisoes = politica.listar({ tipo: "decisao" });

      const situacao =
        primeiroRotulo(estados) ||
        primeiroRotulo(atividades) ||
        AUSENCIA;
      const proximo =
        (estados[0] &&
          estados[0].conteudo &&
          texto(
            typeof estados[0].conteudo === "object"
              ? estados[0].conteudo.proximoPasso || ""
              : ""
          )) ||
        primeiroRotulo(
          decisoes.filter(function (d) {
            return d.conteudo && d.conteudo.proximoPasso;
          })
        ) ||
        AUSENCIA;
      const risco =
        primeiroRotulo(pendencias) ||
        AUSENCIA;
      const pendenciasTexto =
        pendencias.length === 0
          ? AUSENCIA
          : pendencias
              .map(function (item) {
                return rotuloRegistro(item);
              })
              .filter(Boolean)
              .join("; ");

      return Object.freeze({
        status: "ok",
        coaAtivoId: ctx.coaAtivoId,
        projeto: p.nome,
        objetivo: p.objetivoPrincipal || AUSENCIA,
        situacaoAtual: situacao,
        proximoPasso: proximo || AUSENCIA,
        risco: risco,
        pendencias: pendenciasTexto,
        ultimaAtividade: p.ultimaAtividade || null,
        statusCicloVida: p.statusCicloVida || null,
        descricao: p.descricao || null,
        mensagem: null
      });
    }

    function montarBlocos() {
      const ctx = obterCoaAtivo();
      if (ctx.status !== "ativo") {
        return Object.freeze({
          status: ctx.status,
          coaAtivoId: null,
          decisoesPendentes: Object.freeze([]),
          conhecimentosRecentes: Object.freeze([]),
          atividadesRecentes: Object.freeze([]),
          ausencia: AUSENCIA
        });
      }

      function mapear(lista) {
        return Object.freeze(
          lista.map(function (item) {
            return Object.freeze({
              id: item.id,
              coaId: item.coaId,
              titulo: rotuloRegistro(item),
              tipo: item.tipo,
              criadoEm: item.criadoEm || null
            });
          })
        );
      }

      const decisoes = mapear(politica.listar({ tipo: "decisao" }));
      const conhecimentos = mapear(politica.listar({ tipo: "conhecimento" }));
      const atividades = mapear(politica.listar({ tipo: "atividade" }));

      return Object.freeze({
        status: "ok",
        coaAtivoId: ctx.coaAtivoId,
        decisoesPendentes: decisoes,
        conhecimentosRecentes: conhecimentos,
        atividadesRecentes: atividades,
        ausencia: AUSENCIA
      });
    }

    function montarHome() {
      if (!inicializado) {
        garantirSessao();
        inicializado = true;
      }
      const resumo = montarResumo();
      const blocos = montarBlocos();
      const projetos = catalogo.listarProjetos().map(function (p) {
        return Object.freeze({
          coaId: p.coaId,
          nome: p.nome,
          ativo: p.coaId === resumo.coaAtivoId
        });
      });
      return Object.freeze({
        resumo: resumo,
        blocos: blocos,
        seletorProjetos: Object.freeze(projetos),
        coaAtivoId: resumo.coaAtivoId,
        precisaProjeto: !resumo.coaAtivoId
      });
    }

    /**
     * Troca o COA ativo via O e remonta a Home imediatamente (REQ-040 / §4.3).
     */
    function trocarCoa(coaId) {
      const id = texto(coaId);
      if (!id) {
        throw new TypeError("coaId é obrigatório para trocarCoa.");
      }
      garantirSessao();
      const troca = sessao.trocar(id);
      if (troca.status === "confirmacao_requerida") {
        return Object.freeze({
          status: "confirmacao_requerida",
          home: montarHome(),
          mensagem: troca.mensagem
        });
      }
      return Object.freeze({
        status: "ok",
        home: montarHome(),
        troca: troca
      });
    }

    function inicializar() {
      inicializado = false;
      garantirSessao();
      inicializado = true;
      return montarHome();
    }

    return Object.freeze({
      inicializar: inicializar,
      montarResumo: montarResumo,
      montarBlocos: montarBlocos,
      montarHome: montarHome,
      trocarCoa: trocarCoa
    });
  }

  return Object.freeze({
    criar: criar,
    AUSENCIA: AUSENCIA
  });
});
