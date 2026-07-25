/**
 * Componente K — Comunicação Executiva (IMP-007 / ARQ-010).
 *
 * Camada de expressão: monta Mensagens a partir de insumos já produzidos
 * por H/I/F/B/J. Somente leitura — nunca grava memória, estado ou vigência.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.CeoComunicacaoExecutiva = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const TIPOS = Object.freeze([
    "autoridade",
    "recomendacao",
    "feedback",
    "ausencia",
    "atencao",
    "contexto"
  ]);

  const TRANSPARENCIA = Object.freeze({
    OK: "ok",
    LIMITACAO: "limitacao",
    AUSENCIA: "ausencia"
  });

  const VIGENCIA = Object.freeze({
    PROPOSTA: "proposta",
    VIGENTE: "vigente",
    NA: "N/A"
  });

  const LIMITE_SINTESE = 220;

  function texto(valor) {
    return typeof valor === "string" ? valor.trim() : "";
  }

  function copiar(valor) {
    return JSON.parse(JSON.stringify(valor));
  }

  function encurtar(valor, limite) {
    const t = texto(valor);
    if (t.length <= limite) return t;
    return t.slice(0, limite - 1).trim() + "…";
  }

  function validarTipo(tipo) {
    if (TIPOS.indexOf(tipo) === -1) {
      throw new TypeError(
        "Tipo de interação inválido. Use: " + TIPOS.join(", ") + "."
      );
    }
  }

  /**
   * Empacota APIs H/I/F em fachada somente-leitura.
   * Qualquer tentativa de escrita é rejeitada (proteção estrutural D2).
   */
  function somenteLeitura(deps) {
    const d = deps || {};
    const bloqueio = function (nome) {
      return function () {
        throw new Error(
          "K é somente leitura: operação proibida sobre " + nome + "."
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
        : null,
      papeis: d.papeis
        ? Object.freeze({
            coordenar: d.papeis.coordenar.bind(d.papeis)
          })
        : null
    });
  }

  function coletarFontes(insumos) {
    const fontes = [];
    const snap = insumos || {};

    if (snap.contextoAtivo) {
      fontes.push({ origem: "B", id: "contexto", valor: snap.contextoAtivo });
    }

    if (snap.pacote && Array.isArray(snap.pacote.fontes)) {
      snap.pacote.fontes.forEach(function (f, idx) {
        fontes.push({
          origem: f.tipo || "I",
          id: f.rotulo || "fonte-" + idx,
          valor: f.valor
        });
      });
    }

    if (snap.proposta) {
      fontes.push({
        origem: "I",
        id: snap.proposta.id || "proposta",
        valor: snap.proposta.enunciado || snap.proposta.justificativa || ""
      });
    }

    if (snap.estado) {
      fontes.push({
        origem: "F",
        id: "estado",
        valor:
          (snap.estado.foco || "") +
          " | " +
          (snap.estado.proximo || "")
      });
    }

    if (Array.isArray(snap.registrosMemoria)) {
      snap.registrosMemoria.forEach(function (r) {
        fontes.push({
          origem: "H",
          id: r.id || "memoria",
          valor: r.decisao || ""
        });
      });
    }

    if (Array.isArray(snap.atencoes)) {
      snap.atencoes.forEach(function (a, idx) {
        fontes.push({
          origem: "J",
          id: a.id || "att-" + idx,
          valor: a.enunciado || a,
          papel: a.papel
        });
      });
    }

    return fontes.filter(function (f) {
      return texto(f.valor);
    });
  }

  function decidirTransparencia(fontes, forcarAusencia) {
    if (forcarAusencia || !fontes.length) return TRANSPARENCIA.AUSENCIA;
    const fracas = fontes.filter(function (f) {
      return /ausente|ausência|limitação|limitacao/i.test(String(f.valor));
    });
    if (fracas.length && fracas.length === fontes.length) {
      return TRANSPARENCIA.LIMITACAO;
    }
    if (fracas.length) return TRANSPARENCIA.LIMITACAO;
    return TRANSPARENCIA.OK;
  }

  function montarSintese(tipo, insumos, fontes, transparencia) {
    const snap = insumos || {};
    const proposta = snap.proposta || {};
    const pacote = snap.pacote || {};

    if (transparencia === TRANSPARENCIA.AUSENCIA) {
      return encurtar(
        "Ausência explícita: não há base registrada para esta comunicação (" +
          tipo +
          ").",
        LIMITE_SINTESE
      );
    }

    switch (tipo) {
      case "contexto":
        return encurtar(
          "Contexto: " +
            (pacote.resumo ||
              (fontes[0] && fontes[0].valor) ||
              "base registrada disponível") +
            (pacote.motivoPedido ? " — " + pacote.motivoPedido : ""),
          LIMITE_SINTESE
        );
      case "autoridade":
        return encurtar(
          "Pedido de autoridade: " +
            (proposta.enunciado ||
              pacote.motivoPedido ||
              "confirmar a proposta apresentada") +
            " (só vigora após confirmar).",
          LIMITE_SINTESE
        );
      case "recomendacao":
        return encurtar(
          "Recomendação (ainda sem vigência): " +
            (proposta.enunciado || "definir próximo passo") +
            ".",
          LIMITE_SINTESE
        );
      case "feedback":
        return encurtar(
          "Feedback: " +
            (snap.feedback ||
              proposta.status ||
              "ato de autoridade processado") +
            ".",
          LIMITE_SINTESE
        );
      case "atencao": {
        const item =
          (snap.atencoes && snap.atencoes[0] && (snap.atencoes[0].enunciado || snap.atencoes[0])) ||
          (fontes[0] && fontes[0].valor) ||
          "há item de atenção";
        const papel =
          (snap.atencoes && snap.atencoes[0] && snap.atencoes[0].papel) ||
          (fontes[0] && fontes[0].papel) ||
          "Patrocinador";
        return encurtar("Atenção (" + papel + "): " + item + ".", LIMITE_SINTESE);
      }
      case "ausencia":
        return encurtar(
          "Ausência explícita: nada registrado pertinente a este ponto.",
          LIMITE_SINTESE
        );
      default:
        return encurtar("Comunicação executiva.", LIMITE_SINTESE);
    }
  }

  function montarDetalhe(tipo, insumos, fontes, transparencia) {
    if (transparencia === TRANSPARENCIA.AUSENCIA) {
      return {
        disponivel: false,
        texto:
          "Ausência explícita: não há detalhe registrado para expandir.",
        fontes: []
      };
    }

    const partes = [];
    const snap = insumos || {};

    if (snap.pacote && snap.pacote.resumo) {
      partes.push("Pacote: " + snap.pacote.resumo);
    }
    if (snap.proposta && snap.proposta.justificativa) {
      partes.push("Justificativa: " + snap.proposta.justificativa);
    }
    if (snap.proposta && snap.proposta.fronteiraExecucao) {
      partes.push(snap.proposta.fronteiraExecucao);
    }
    fontes.slice(0, 6).forEach(function (f) {
      partes.push("[" + f.origem + " · " + f.id + "] " + f.valor);
    });

    if (!partes.length) {
      return {
        disponivel: false,
        texto: "Ausência explícita: detalhe adicional não disponível.",
        fontes: []
      };
    }

    return {
      disponivel: true,
      texto: partes.join("\n"),
      fontes: fontes
    };
  }

  function criar(deps) {
    const leitura = somenteLeitura(deps);
    let seq = 0;
    const cache = new Map();

    function lerInsumos(opcoes) {
      const opts = opcoes || {};
      if (opts.insumos) return copiar(opts.insumos);

      const snap = {
        contextoAtivo: "Motoboy Game 2 (MG2)",
        pacote: null,
        proposta: null,
        estado: null,
        registrosMemoria: [],
        atencoes: [],
        feedback: texto(opts.feedback) || null
      };

      if (leitura.conducao) {
        snap.pacote = leitura.conducao.obterPacoteAtual();
        snap.proposta = leitura.conducao.obterPropostaAtual();
      }
      if (leitura.estadoDia) {
        const est = leitura.estadoDia.obter();
        if (est.status === "encontrado") snap.estado = est.estado;
      }
      if (leitura.memoria) {
        const mem = leitura.memoria.listar();
        if (mem.status === "encontrado") snap.registrosMemoria = mem.registros;
      }
      if (leitura.papeis) {
        const pap = leitura.papeis.coordenar();
        if (pap.status === "encontrado") snap.atencoes = pap.itens.slice(0, 3);
      }

      return snap;
    }

    function montarMensagem(opcoes) {
      const opts = opcoes || {};
      const tipo = texto(opts.tipo) || "contexto";
      validarTipo(tipo);

      const insumos = lerInsumos(opts);
      const fontes = coletarFontes(insumos);
      const transparencia = decidirTransparencia(
        fontes,
        tipo === "ausencia" || opts.forcarAusencia === true
      );
      const sintese = montarSintese(tipo, insumos, fontes, transparencia);

      if (!texto(sintese)) {
        throw new Error("RF-01: síntese obrigatória não pode ser vazia.");
      }

      let vigencia = VIGENCIA.NA;
      if (tipo === "recomendacao" || tipo === "autoridade") {
        if (insumos.proposta && insumos.proposta.vigencia === true) {
          vigencia = VIGENCIA.VIGENTE;
        } else {
          vigencia = VIGENCIA.PROPOSTA;
        }
      }

      seq += 1;
      const detalheLatente = montarDetalhe(tipo, insumos, fontes, transparencia);

      const mensagem = Object.freeze({
        id: "MSG-" + String(seq).padStart(3, "0"),
        tipo: tipo,
        sintese: sintese,
        detalhe: null,
        detalheDisponivel: detalheLatente.disponivel,
        transparencia: transparencia,
        vigencia: vigencia,
        fontes: Object.freeze(fontes.map(copiar)),
        avisoVigencia:
          vigencia === VIGENCIA.PROPOSTA
            ? "Proposta comunicada — não vigora até confirmação do patrocinador."
            : vigencia === VIGENCIA.VIGENTE
              ? "Estado já vigente (confirmado anteriormente)."
              : null,
        fronteiraExecucao:
          "Comunicação ≠ execução: orientação apenas; execução MG2 permanece fora do CEO."
      });

      cache.set(mensagem.id, {
        mensagem: mensagem,
        detalheLatente: detalheLatente,
        insumos: insumos
      });

      return mensagem;
    }

    function expandirDetalhe(mensagemOuId) {
      const id =
        typeof mensagemOuId === "string"
          ? mensagemOuId
          : mensagemOuId && mensagemOuId.id;
      if (!id || !cache.has(id)) {
        throw new Error("Mensagem desconhecida para expansão de detalhe.");
      }
      const entry = cache.get(id);
      const det = entry.detalheLatente;
      const expandida = Object.freeze(
        Object.assign({}, entry.mensagem, {
          detalhe: det.texto,
          detalheExpandido: true,
          detalheDisponivel: det.disponivel
        })
      );
      entry.mensagem = expandida;
      return expandida;
    }

    function listarTipos() {
      return TIPOS.slice();
    }

    return Object.freeze({
      montarMensagem: montarMensagem,
      expandirDetalhe: expandirDetalhe,
      listarTipos: listarTipos
    });
  }

  return Object.freeze({
    TIPOS: TIPOS,
    TRANSPARENCIA: TRANSPARENCIA,
    VIGENCIA: VIGENCIA,
    LIMITE_SINTESE: LIMITE_SINTESE,
    criar: criar,
    somenteLeitura: somenteLeitura
  });
});
