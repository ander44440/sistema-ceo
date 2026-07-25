/**
 * Componente I — Condução Executiva (IMP-006 E2/E3).
 *
 * Ordem obrigatória: montar contexto (H+F+B) → propor com justificativa →
 * pedir autoridade → confirmar/rejeitar/ajustar → persistir efeito.
 * Sugerir sem impor. Não executa o MG2.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.CeoConducaoExecutiva = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const CONTEXTO_ATIVO = "Motoboy Game 2 (MG2)";

  function copiar(valor) {
    return JSON.parse(JSON.stringify(valor));
  }

  function texto(valor) {
    return typeof valor === "string" ? valor.trim() : "";
  }

  function criar(deps) {
    if (!deps || !deps.memoria || !deps.estadoDia) {
      throw new TypeError("memoria (H) e estadoDia (F) são obrigatórios.");
    }

    const memoria = deps.memoria;
    const estadoDia = deps.estadoDia;
    let pacoteAtual = null;
    let propostaAtual = null;
    let seqProposta = 0;

    function montarContexto(opcoes) {
      const opts = opcoes || {};
      const tema = texto(opts.tema);
      const motivoPedido = texto(opts.motivoPedido) || "Pedido de autoridade de condução";

      const estadoRes = estadoDia.obter();
      const memoriaRes = tema ? memoria.consultar(tema) : memoria.listar();

      const fontes = [];
      const trechos = [];
      let temBase = false;

      fontes.push({ tipo: "B", rotulo: "Contexto ativo", valor: CONTEXTO_ATIVO });

      if (estadoRes.status === "encontrado" && estadoRes.estado) {
        temBase = true;
        const e = estadoRes.estado;
        fontes.push({ tipo: "F", rotulo: "Status do dia", valor: e.status });
        fontes.push({ tipo: "F", rotulo: "Foco", valor: e.foco || "— (ausente)" });
        fontes.push({ tipo: "F", rotulo: "Onde parou", valor: e.onde || "— (ausente)" });
        fontes.push({
          tipo: "F",
          rotulo: "Próximo passo vigente",
          valor: e.proximo || "— (ausente)"
        });
        trechos.push(
          "Estado do Dia: foco “" +
            (e.foco || "ausente") +
            "”; próximo “" +
            (e.proximo || "ausente") +
            "”."
        );
      } else {
        fontes.push({
          tipo: "F",
          rotulo: "Estado do Dia",
          valor: estadoRes.mensagem || "Ausência explícita de estado."
        });
      }

      if (memoriaRes.status === "encontrado" && memoriaRes.registros.length) {
        temBase = true;
        memoriaRes.registros.slice(0, 3).forEach(function (reg) {
          fontes.push({
            tipo: "H",
            rotulo: reg.id,
            valor: reg.decisao
          });
          trechos.push(
            "Memória " +
              reg.id +
              ": " +
              reg.decisao +
              " (porque: " +
              reg.porque +
              "; baseado em: " +
              reg.baseadoEm +
              ")."
          );
        });
      } else {
        fontes.push({
          tipo: "H",
          rotulo: "Memória Organizacional",
          valor: memoriaRes.mensagem || "Ausência explícita de memória pertinente."
        });
      }

      const resumo = temBase
        ? trechos.join(" ")
        : "Ausência explícita: não há memória nem estado registrados para fundamentar este pedido.";

      pacoteAtual = {
        id: "CTX-" + Date.now(),
        contexto: CONTEXTO_ATIVO,
        tema: tema || null,
        motivoPedido: motivoPedido,
        status: temBase ? "encontrado" : "ausente",
        resumo: resumo,
        fontes: fontes,
        criadoEm: new Date().toISOString()
      };
      propostaAtual = null;
      return copiar(pacoteAtual);
    }

    function exigirPacote() {
      if (!pacoteAtual) {
        throw new Error(
          "Ordem RF-02 violada: monte o contexto (montarContexto) antes de propor ou pedir autoridade."
        );
      }
      return pacoteAtual;
    }

    function justificar(tipo, enunciado) {
      const pacote = exigirPacote();
      if (pacote.status === "ausente") {
        return {
          texto:
            "Base registrada ausente/fraca para “" +
            enunciado +
            "”. Limitação declarada — não inventada. Motivo do pedido: " +
            pacote.motivoPedido +
            ".",
          baseStatus: "ausente",
          fontes: pacote.fontes
        };
      }

      const refsH = pacote.fontes
        .filter(function (f) {
          return f.tipo === "H";
        })
        .map(function (f) {
          return f.rotulo;
        });
      const refsF = pacote.fontes
        .filter(function (f) {
          return f.tipo === "F" && f.rotulo === "Próximo passo vigente";
        })
        .map(function (f) {
          return f.valor;
        });

      return {
        texto:
          "Proposta de " +
          tipo +
          " baseada no contexto MG2 montado (" +
          pacote.id +
          "): " +
          (refsH.length ? "memória " + refsH.join(", ") + "; " : "") +
          (refsF.length ? "estado/próximo “" + refsF[0] + "”; " : "") +
          "motivo: " +
          pacote.motivoPedido +
          ".",
        baseStatus: "encontrado",
        fontes: pacote.fontes
      };
    }

    function propor(tipo, enunciado) {
      const pacote = exigirPacote();
      const textoProposta = texto(enunciado);
      if (!textoProposta) {
        throw new TypeError("Enunciado da proposta é obrigatório.");
      }
      if (tipo !== "proximo_passo" && tipo !== "prioridade") {
        throw new TypeError("Tipo deve ser proximo_passo ou prioridade.");
      }

      seqProposta += 1;
      const justificativa = justificar(tipo, textoProposta);
      propostaAtual = {
        id: "PROP-" + String(seqProposta).padStart(3, "0"),
        tipo: tipo,
        enunciado: textoProposta,
        justificativa: justificativa.texto,
        baseStatus: justificativa.baseStatus,
        fontes: justificativa.fontes,
        pacoteId: pacote.id,
        status: "proposta",
        vigencia: false,
        fronteiraExecucao:
          "Condução ≠ execução: esta proposta orienta o quê/porquê; a execução técnica permanece fora do CEO (MG2)."
      };
      return copiar(propostaAtual);
    }

    function proporProximoPasso(enunciado) {
      const estado = estadoDia.obter();
      const sugestao =
        texto(enunciado) ||
        (estado.status === "encontrado" && estado.estado && estado.estado.proximo) ||
        "";
      if (!sugestao) {
        return propor(
          "proximo_passo",
          "Definir o próximo passo do Dia no contexto MG2 após revisar a memória disponível"
        );
      }
      return propor("proximo_passo", sugestao);
    }

    function proporPrioridade(enunciado) {
      const estado = estadoDia.obter();
      const sugestao =
        texto(enunciado) ||
        (estado.status === "encontrado" &&
          estado.estado &&
          estado.estado.atencoes &&
          estado.estado.atencoes[0]) ||
        "";
      if (!sugestao) {
        return propor(
          "prioridade",
          "Priorizar a decisão de autoridade pendente no contexto MG2"
        );
      }
      return propor("prioridade", sugestao);
    }

    function pedirAutoridade() {
      const pacote = exigirPacote();
      if (!propostaAtual || propostaAtual.status !== "proposta") {
        throw new Error(
          "Não há proposta pendente. Monte o contexto e proponha antes de pedir autoridade."
        );
      }
      return {
        ordem: ["contexto", "proposta", "autoridade"],
        contexto: copiar(pacote),
        proposta: copiar(propostaAtual),
        mensagem:
          "Autoridade solicitada somente após contexto e justificativa. Confirme, rejeite ou ajuste.",
        opcoes: ["confirmar", "rejeitar", "ajustar"]
      };
    }

    function confirmar(ajuste) {
      if (!propostaAtual || propostaAtual.status !== "proposta") {
        throw new Error("Não há proposta pendente para confirmar.");
      }
      exigirPacote();

      const enunciadoFinal = texto(ajuste) || propostaAtual.enunciado;
      propostaAtual.enunciado = enunciadoFinal;
      propostaAtual.status = "confirmada";
      propostaAtual.vigencia = true;

      const parcial = {};
      if (propostaAtual.tipo === "proximo_passo") {
        parcial.proximo = enunciadoFinal;
      }
      if (propostaAtual.tipo === "prioridade") {
        parcial.atencoes = [enunciadoFinal];
      }
      const estado = estadoDia.atualizar(parcial);

      const resultado = {
        proposta: copiar(propostaAtual),
        estado: estado,
        mensagem: "Proposta confirmada pelo patrocinador. Vigência aplicada ao Estado do Dia."
      };
      propostaAtual = null;
      return resultado;
    }

    function rejeitar() {
      if (!propostaAtual || propostaAtual.status !== "proposta") {
        throw new Error("Não há proposta pendente para rejeitar.");
      }
      const base = {
        enunciado: propostaAtual.enunciado,
        justificativa: propostaAtual.justificativa,
        pacoteId: propostaAtual.pacoteId
      };
      propostaAtual.status = "rejeitada";
      propostaAtual.vigencia = false;
      const resultado = {
        proposta: copiar(propostaAtual),
        basePreservada: base,
        mensagem:
          "Proposta rejeitada. A base/contexto apresentados foram preservados; nenhuma vigência aplicada."
      };
      propostaAtual = null;
      return resultado;
    }

    function obterPacoteAtual() {
      return pacoteAtual ? copiar(pacoteAtual) : null;
    }

    function obterPropostaAtual() {
      return propostaAtual ? copiar(propostaAtual) : null;
    }

    return Object.freeze({
      montarContexto: montarContexto,
      proporProximoPasso: proporProximoPasso,
      proporPrioridade: proporPrioridade,
      pedirAutoridade: pedirAutoridade,
      confirmar: confirmar,
      rejeitar: rejeitar,
      obterPacoteAtual: obterPacoteAtual,
      obterPropostaAtual: obterPropostaAtual
    });
  }

  return Object.freeze({
    CONTEXTO_ATIVO: CONTEXTO_ATIVO,
    criar: criar
  });
});
