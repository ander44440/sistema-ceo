/**
 * Componente R — Conversa Executiva (IMP-009 E6 / ARQ-012 §5 / REQ-041).
 *
 * Processamento integralmente determinístico — sem LLM, agentes ou
 * roteamento semântico. Turnos persistidos somente via Política P;
 * coaAtivoId obtido exclusivamente via Componente O (D19).
 *
 * Interface: IConversa — enviar, listarHistorico, montarSuperficie.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.CeoConversaExecutiva = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const EXEMPLOS = Object.freeze([
    "O que exige minha atenção hoje?",
    "Analise este problema",
    "Planeje esta iniciativa",
    "Revisar o próximo passo do COA ativo",
    "Abrir outro projeto (use o seletor de COA)"
  ]);

  const LIMITACAO =
    "Limitação explícita: nesta etapa a conversa é determinística " +
    "(sem motor de linguagem, agentes ou inferência semântica). " +
    "Comandos são registrados no COA ativo; recomendações nascem como proposta.";

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
    const sessao = deps && deps.sessao;
    const politica = deps && deps.politica;
    if (!sessao || typeof sessao.obterAtivo !== "function") {
      throw new TypeError("ISessaoCOA (O) é obrigatório.");
    }
    if (
      !politica ||
      typeof politica.gravar !== "function" ||
      typeof politica.listar !== "function"
    ) {
      throw new TypeError("Política P é obrigatória.");
    }
    return {
      sessao: sessao,
      politica: politica,
      home: deps.home || null,
      agora: deps.agora || null
    };
  }

  function exigirCoaAtivo(sessao) {
    const ativo = sessao.obterAtivo();
    if (!ativo || ativo.status !== "ativo" || !texto(ativo.coaAtivoId)) {
      throw new Error(
        "Conversa bloqueada: não há COA ativo. Abra um Projeto antes de enviar."
      );
    }
    return ativo;
  }

  /**
   * Resposta determinística — sem interpretação de intenção.
   */
  function processarDeterministico(textoUsuario, nomeProjeto) {
    const projeto = texto(nomeProjeto) || "COA ativo";
    const resposta =
      'Recebido no contexto "' +
      projeto +
      '". ' +
      "Comando registrado: \"" +
      textoUsuario +
      "\". " +
      "Sugestão (proposta): consulte o Resumo Executivo do COA ativo e confirme " +
      "o próximo passo com autoridade. " +
      LIMITACAO;

    return Object.freeze({
      resposta: resposta,
      estado: "registrado",
      vigencia: "proposta",
      limitacao: LIMITACAO
    });
  }

  function turnoDeRegistro(reg) {
    const c = (reg && reg.conteudo) || {};
    return Object.freeze({
      turnoId: texto(c.turnoId) || reg.id,
      coaId: reg.coaId,
      textoUsuario: texto(c.textoUsuario),
      resposta: texto(c.resposta),
      estado: texto(c.estado) || "registrado",
      vigencia: texto(c.vigencia) || "proposta",
      quando: texto(c.quando) || reg.criadoEm || null,
      limitacao: c.limitacao || null
    });
  }

  /**
   * @param {{ sessao: object, politica: object, home?: object, agora?: function }} deps
   */
  function criar(deps) {
    const { sessao, politica, home, agora } = validarDeps(deps);

    function nomeProjetoAtivo(ativo) {
      if (ativo.coa && ativo.coa.nome) return ativo.coa.nome;
      if (home && typeof home.montarResumo === "function") {
        const r = home.montarResumo();
        if (r && r.projeto) return r.projeto;
      }
      return null;
    }

    function listarHistorico() {
      const ativo = exigirCoaAtivo(sessao);
      const regs = politica.listar({ tipo: "turnoConversa" });
      const turnos = regs
        .map(turnoDeRegistro)
        .filter(function (t) {
          return t.coaId === ativo.coaAtivoId;
        })
        .sort(function (a, b) {
          return String(a.quando).localeCompare(String(b.quando));
        });
      return turnos.map(function (t) {
        return copiar(t);
      });
    }

    function enviar(textoUsuario) {
      const msg = texto(textoUsuario);
      if (!msg) {
        throw new TypeError("textoUsuario é obrigatório para enviar.");
      }
      const ativo = exigirCoaAtivo(sessao);
      const quando = agoraIso(agora);
      const proc = processarDeterministico(msg, nomeProjetoAtivo(ativo));

      const registro = politica.gravar({
        tipo: "turnoConversa",
        titulo: msg.length > 80 ? msg.slice(0, 77) + "..." : msg,
        conteudo: {
          textoUsuario: msg,
          resposta: proc.resposta,
          estado: proc.estado,
          vigencia: proc.vigencia,
          quando: quando,
          limitacao: proc.limitacao
        }
      });

      return Object.freeze({
        turnoId: registro.id,
        coaId: registro.coaId,
        textoUsuario: msg,
        resposta: proc.resposta,
        estado: proc.estado,
        vigencia: proc.vigencia,
        quando: quando,
        limitacao: proc.limitacao
      });
    }

    function montarSuperficie() {
      const ativo = sessao.obterAtivo();
      if (!ativo || ativo.status !== "ativo" || !ativo.coaAtivoId) {
        return Object.freeze({
          status: "sem_coa",
          coaAtivoId: null,
          projeto: null,
          historico: Object.freeze([]),
          exemplos: EXEMPLOS,
          disponivel: false,
          mensagem:
            "Conversa indisponível: nenhum COA ativo. Cadastre/abra um Projeto.",
          limitacao: LIMITACAO
        });
      }
      const historico = listarHistorico();
      return Object.freeze({
        status: "ok",
        coaAtivoId: ativo.coaAtivoId,
        projeto: nomeProjetoAtivo(ativo),
        historico: Object.freeze(historico.map(copiar)),
        exemplos: EXEMPLOS,
        disponivel: true,
        mensagem: null,
        limitacao: LIMITACAO
      });
    }

    return Object.freeze({
      enviar: enviar,
      listarHistorico: listarHistorico,
      montarSuperficie: montarSuperficie,
      EXEMPLOS: EXEMPLOS
    });
  }

  return Object.freeze({
    criar: criar,
    EXEMPLOS: EXEMPLOS,
    LIMITACAO: LIMITACAO
  });
});
