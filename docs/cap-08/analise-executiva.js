/**
 * Componente L — Análise Executiva (IMP-008 / ARQ-011).
 *
 * Produz o Objeto de Análise Executiva (contrato L→M), avalia suficiência
 * e registra incertezas/confiança. Somente leitura sobre H/I/F.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.CeoAnaliseExecutiva = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const SUFICIENCIA = Object.freeze({
    SUFICIENTE: "suficiente",
    INSUFICIENTE: "insuficiente"
  });

  const ELEMENTOS = Object.freeze([
    "contexto",
    "lacunas",
    "riscos",
    "dependencias",
    "alternativas",
    "justificativa",
    "confianca"
  ]);

  function texto(valor) {
    return typeof valor === "string" ? valor.trim() : "";
  }

  function copiar(valor) {
    return JSON.parse(JSON.stringify(valor));
  }

  function congelarCampoLista(valor) {
    if (typeof valor === "string") return valor;
    return Object.freeze(Array.isArray(valor) ? valor.slice() : [String(valor)]);
  }

  function declaracaoOuLista(valor, rotuloAusencia) {
    if (Array.isArray(valor)) {
      const limpos = valor
        .map(function (v) {
          return typeof v === "string" ? texto(v) : v;
        })
        .filter(function (v) {
          return v !== null && v !== undefined && texto(String(v));
        });
      if (limpos.length) return limpos;
      return rotuloAusencia;
    }
    const t = texto(valor);
    return t || rotuloAusencia;
  }

  function somenteLeitura(deps) {
    const d = deps || {};
    const bloqueio = function (nome) {
      return function () {
        throw new Error(
          "L é somente leitura: operação proibida sobre " + nome + "."
        );
      };
    };
    return Object.freeze({
      memoria: d.memoria
        ? Object.freeze({
            listar: d.memoria.listar.bind(d.memoria),
            consultar: d.memoria.consultar.bind(d.memoria),
            registrar: bloqueio("memoria.registrar"),
            inicializar: bloqueio("memoria.inicializar")
          })
        : null,
      estadoDia: d.estadoDia
        ? Object.freeze({
            obter: d.estadoDia.obter.bind(d.estadoDia),
            atualizar: bloqueio("estadoDia.atualizar"),
            inicializar: bloqueio("estadoDia.inicializar")
          })
        : null,
      conducao: d.conducao
        ? Object.freeze({
            obterPacoteAtual: d.conducao.obterPacoteAtual.bind(d.conducao),
            obterPropostaAtual: d.conducao.obterPropostaAtual.bind(d.conducao),
            montarContexto: bloqueio("conducao.montarContexto"),
            proporProximoPasso: bloqueio("conducao.proporProximoPasso"),
            proporPrioridade: bloqueio("conducao.proporPrioridade"),
            pedirAutoridade: bloqueio("conducao.pedirAutoridade"),
            confirmar: bloqueio("conducao.confirmar"),
            rejeitar: bloqueio("conducao.rejeitar")
          })
        : null
    });
  }

  function coletarFontes(leitura, snap) {
    const fontes = [];
    if (snap.contextoAtivo) {
      fontes.push({ origem: "B", id: "contexto", valor: snap.contextoAtivo });
    }
    if (leitura.conducao) {
      const pacote = leitura.conducao.obterPacoteAtual();
      const proposta = leitura.conducao.obterPropostaAtual();
      if (pacote) {
        fontes.push({
          origem: "I",
          id: "pacote",
          valor: pacote.resumo || pacote.motivoPedido || "pacote"
        });
      }
      if (proposta) {
        fontes.push({
          origem: "I",
          id: proposta.id || "proposta",
          valor: proposta.enunciado || proposta.justificativa || ""
        });
      }
    }
    if (leitura.estadoDia) {
      const est = leitura.estadoDia.obter();
      if (est.status === "encontrado" && est.estado) {
        fontes.push({
          origem: "F",
          id: "estado",
          valor: (est.estado.foco || "") + " | " + (est.estado.proximo || "")
        });
      }
    }
    if (leitura.memoria) {
      const mem = leitura.memoria.listar();
      if (mem.status === "encontrado" && Array.isArray(mem.registros)) {
        mem.registros.slice(0, 3).forEach(function (r) {
          fontes.push({
            origem: "H",
            id: r.id || "memoria",
            valor: r.decisao || ""
          });
        });
      }
    }
    return fontes.filter(function (f) {
      return texto(String(f.valor));
    });
  }

  function criar(deps) {
    const leitura = somenteLeitura(deps);
    let seq = 0;
    const cache = new Map();

    function montarAnalise(opcoes) {
      const opts = opcoes || {};
      const snap = {
        contextoAtivo: texto(opts.contextoAtivo) || "Motoboy Game 2 (MG2)",
        objetivo: texto(opts.objetivo) || "",
        forcarInsuficiencia: opts.forcarInsuficiencia === true
      };

      const fontes = coletarFontes(leitura, snap);
      const pacote = leitura.conducao
        ? leitura.conducao.obterPacoteAtual()
        : null;
      const proposta = leitura.conducao
        ? leitura.conducao.obterPropostaAtual()
        : null;

      const contexto =
        texto(opts.contexto) ||
        (pacote && (pacote.resumo || pacote.motivoPedido)) ||
        snap.objetivo ||
        (fontes[0] && fontes[0].valor) ||
        "";

      if (!texto(contexto)) {
        throw new Error(
          "RF-02: contexto obrigatório — informe contexto ou forneça insumos."
        );
      }

      const lacunas = declaracaoOuLista(
        opts.lacunas,
        "Nenhuma lacuna identificada"
      );
      const riscos = declaracaoOuLista(
        opts.riscos,
        "Nenhum risco relevante identificado"
      );
      const dependencias = declaracaoOuLista(
        opts.dependencias,
        "Nenhuma dependência pertinente identificada"
      );

      let alternativas;
      if (opts.alternativas != null) {
        alternativas = declaracaoOuLista(opts.alternativas, null);
        if (alternativas === null) {
          alternativas = texto(opts.justificativaAlternativaUnica) ||
            "Alternativa única justificada: avançar com o objetivo informado.";
        }
      } else if (texto(opts.justificativaAlternativaUnica)) {
        alternativas = texto(opts.justificativaAlternativaUnica);
      } else if (proposta && texto(proposta.enunciado)) {
        alternativas = [
          "Seguir proposta de condução: " + proposta.enunciado,
          "Manter status quo até nova evidência"
        ];
      } else {
        alternativas =
          "Alternativa única justificada: avançar com o objetivo informado na ausência de opções registradas.";
      }

      const justificativa =
        texto(opts.justificativa) ||
        (proposta && proposta.justificativa) ||
        "Análise baseada nos insumos registrados disponíveis para o objetivo em questão.";

      const confianca =
        texto(opts.confianca) || (fontes.length >= 2 ? "média" : "baixa");

      let suficiencia = SUFICIENCIA.SUFICIENTE;
      let incertezasRemanescentes =
        "Nenhuma incerteza remanescente relevante";
      let justificativaTiming =
        "Há base registrada suficiente para recomendar agora, com transparência sobre limitações.";

      if (
        snap.forcarInsuficiencia ||
        opts.suficiencia === SUFICIENCIA.INSUFICIENTE
      ) {
        suficiencia = SUFICIENCIA.INSUFICIENTE;
      } else if (
        opts.suficiencia == null &&
        fontes.length === 0 &&
        !texto(opts.objetivo) &&
        !texto(opts.contexto) &&
        !pacote &&
        !proposta
      ) {
        suficiencia = SUFICIENCIA.INSUFICIENTE;
      } else if (opts.suficiencia === SUFICIENCIA.SUFICIENTE) {
        suficiencia = SUFICIENCIA.SUFICIENTE;
      }

      if (suficiencia === SUFICIENCIA.INSUFICIENTE) {
        incertezasRemanescentes =
          opts.incertezasRemanescentes != null
            ? declaracaoOuLista(
                opts.incertezasRemanescentes,
                "Informação insuficiente para recomendar"
              )
            : "Informação insuficiente para recomendar com segurança";
        justificativaTiming = null;
      } else if (opts.incertezasRemanescentes != null) {
        incertezasRemanescentes = declaracaoOuLista(
          opts.incertezasRemanescentes,
          "Nenhuma incerteza remanescente relevante"
        );
        if (texto(opts.justificativaTiming)) {
          justificativaTiming = texto(opts.justificativaTiming);
        }
      } else if (texto(opts.justificativaTiming)) {
        justificativaTiming = texto(opts.justificativaTiming);
      }

      seq += 1;
      const analise = Object.freeze({
        id: "ANL-" + String(seq).padStart(3, "0"),
        contexto: contexto,
        lacunas: congelarCampoLista(lacunas),
        riscos: congelarCampoLista(riscos),
        dependencias: congelarCampoLista(dependencias),
        alternativas: congelarCampoLista(alternativas),
        justificativa: justificativa,
        confianca: confianca,
        suficiencia: suficiencia,
        incertezasRemanescentes: congelarCampoLista(incertezasRemanescentes),
        justificativaTiming: justificativaTiming,
        fontes: Object.freeze(fontes.map(copiar)),
        objetivo: snap.objetivo || null,
        fronteiraExecucao:
          "Análise ≠ execução: orientação apenas; execução MG2 permanece fora do CEO."
      });

      cache.set(analise.id, analise);
      return analise;
    }

    function obterAnalise(id) {
      if (!id || !cache.has(id)) {
        throw new Error("Análise Executiva desconhecida: " + id);
      }
      return cache.get(id);
    }

    function listarElementos() {
      return ELEMENTOS.slice();
    }

    return Object.freeze({
      montarAnalise: montarAnalise,
      obterAnalise: obterAnalise,
      listarElementos: listarElementos
    });
  }

  return Object.freeze({
    SUFICIENCIA: SUFICIENCIA,
    ELEMENTOS: ELEMENTOS,
    criar: criar,
    somenteLeitura: somenteLeitura
  });
});
