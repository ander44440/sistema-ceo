/**
 * Orquestrador MRE — estágios 0–7 (IMP-012 / REQ-049).
 * Não produz prosa de utilizador. Não integra Núcleo/Speaker/Fila/Voice/Chat.
 */

import {
  estagio0Diagnostico,
  estagio1Enquadramento,
  estagio2Dossier,
  estagio3Principios,
  estagio4Analise,
  estagio5aRiscos,
  estagio5bOportunidades,
  estagio6Decisao,
  estagio7Acao,
  montarFalhaControlada,
  assegurarJustificativaV5
} from "./estagios.js";
import {
  aplicarPoliticaDecisaoNcs,
  calcularShortCircuitNcs,
  talvezInjetarLacunaSolicitarDados
} from "../ncs/politicas.js";
import { obterPacoteNcs } from "../ncs/portador.js";
import {
  aplicarPoliticaAnaliseDeliberativa,
  aplicarPoliticaConsultaResposta,
  detectarPedidoAnaliseDeliberativa,
  detectarPedidoConsultaResposta,
  ehPedidoDelegacaoExplicita,
  obterAutoanaliseActiva
} from "../politicaAnaliseDeliberativa.js";
import {
  aplicarPoliticaDecisaoSobConflito,
  detectarPedidoDecisaoExplicita
} from "../politicaDecisaoSobConflito.js";
import {
  comporAnaliseConsultaDesdeSnapshot,
  injectarSnapshotSituacionalNaEntrada
} from "../snapshotSituacionalConsulta.js";

/**
 * @typedef {object} EntradaMre
 * @property {string} mensagem
 * @property {string|null} [coaId]
 * @property {object|null} [intencao]
 * @property {object|null} [snapshotPainel]
 * @property {string[]} [factosOficiais]
 * @property {boolean} [shortCircuit]
 */

/**
 * @typedef {object} DepsPipeline
 * @property {(pedido: object) => Promise<object|string>} chamarLlm
 * @property {boolean} [preferirDespacho]
 * @property {boolean} [preferirSolicitarDados]
 * @property {string[]} [ordemEstagios] — preenchido pelo orquestrador para testes
 * @property {object} [pacoteNcs] — Pacote NCS imutável da corrida (C5); só leitura
 */

/**
 * Avança estritamente na ordem; rejeita saltos (T1).
 * @param {string[]} concluidos
 * @param {string} proximo
 */
export function assertTransicao(concluidos, proximo) {
  const ordem = [
    "0",
    "1",
    "2",
    "3",
    "4",
    "5a",
    "5b",
    "6",
    "7"
  ];
  // 5a e 5b podem concluir em qualquer ordem relativa, ambos após 4
  const precisa = {
    "0": [],
    "1": ["0"],
    "2": ["1"],
    "3": ["2"],
    "4": ["3"],
    "5a": ["4"],
    "5b": ["4"],
    "6": ["5a", "5b"],
    "7": ["6"]
  };
  const reqs = precisa[proximo] || [];
  for (const r of reqs) {
    if (!concluidos.includes(r)) {
      const err = new Error(
        `Transição ilegal (T1): ${proximo} exige ${r}; concluídos=[${concluidos.join(",")}]`
      );
      err.codigo = "TRANSICAO_ILEGAL";
      throw err;
    }
  }
  if (!ordem.includes(proximo)) {
    const err = new Error(`Estágio desconhecido: ${proximo}`);
    err.codigo = "ESTAGIO_DESCONHECIDO";
    throw err;
  }
}

/**
 * Executa pipeline 0–7.
 * @param {EntradaMre} entrada
 * @param {DepsPipeline} deps
 * @returns {Promise<{ ok: boolean, parcial: object, ordem: string[], falhaControlada: boolean }>}
 */
export async function executarPipeline07(entrada, deps) {
  if (!deps || typeof deps.chamarLlm !== "function") {
    throw new Error("deps.chamarLlm é obrigatório (injetável; sem acoplamento ao Núcleo)");
  }

  const ordem = [];
  const registrar = (id) => {
    assertTransicao(ordem, id);
    ordem.push(id);
    if (Array.isArray(deps.ordemEstagios)) deps.ordemEstagios.push(id);
  };

  const lacunasAcc = [];
  const pacoteNcs = obterPacoteNcs(deps) || obterPacoteNcs(entrada);

  try {
    if (!entrada || !String(entrada.mensagem || "").trim()) {
      throw new Error("Entrada deliberativa sem mensagem");
    }

    // deps.pacoteNcs disponível aos estágios (imutável; estágios não escrevem)
    if (pacoteNcs) {
      deps.pacoteNcs = pacoteNcs;
    }

    const msgUsuario = String(entrada.mensagem || "")
      .split("[DIRETRIZ CANÓNICA — Manifesto")[0]
      .trim();
    // Info-gathering / PD=false explícito do Núcleo prevalece sobre re-detecção
    // na mensagem enriquecida (fio/MTE podem conter «decisão» legado).
    const pedidoInfoGathering = deps.pedidoInfoGathering === true;
    const pedidoDecisao = pedidoInfoGathering
      ? false
      : deps.pedidoDecisaoExplicita === true
        ? true
        : deps.pedidoDecisaoExplicita === false
          ? false
          : detectarPedidoDecisaoExplicita(msgUsuario);
    // CONSULTA → RESPONDER (precedência V1 / situacional); não compete com PD
    const pedidoConsulta =
      !pedidoDecisao &&
      !pedidoInfoGathering &&
      (deps.pedidoConsultaResposta === true
        ? true
        : deps.pedidoConsultaResposta === false
          ? false
          : detectarPedidoConsultaResposta(msgUsuario, {
              consultaNaoEAcao:
                deps.consultaNaoEAcao === true ||
                entrada.consultaNaoEAcao === true,
              tipoTurno: entrada.tipoTurno || deps.tipoTurno,
              precedenciaTurno: entrada.precedenciaTurno || deps.precedenciaTurno
            }));
    // Opção A: pedido de decisão → P1-2 off; consulta ≠ análise de proposta
    const pedidoAnalise =
      !pedidoDecisao &&
      !pedidoConsulta &&
      !pedidoInfoGathering &&
      (deps.pedidoAnaliseDeliberativa === true
        ? true
        : deps.pedidoAnaliseDeliberativa === false
          ? false
          : detectarPedidoAnaliseDeliberativa(msgUsuario));
    const pedidoDelegacaoExplicita =
      deps.pedidoDelegacaoExplicita === true ||
      ehPedidoDelegacaoExplicita(msgUsuario);
    if (pedidoConsulta) {
      deps.pedidoConsultaResposta = true;
      if (deps.proibirDespacho !== false) deps.proibirDespacho = true;
      // Lastro factual ANTES do estágio 0/2 — só CONSULTA
      injectarSnapshotSituacionalNaEntrada(entrada, {
        lastro: deps.lastroConsciencia || entrada.lastroConsciencia || null,
        historico: entrada.historico || deps.historico || null,
        instrucao: msgUsuario
      });
      const snap = entrada.snapshotSituacional;
      if (snap && !snap.temLastroSuficiente && Array.isArray(snap.lacunas)) {
        for (const l of snap.lacunas) {
          lacunasAcc.push(`consulta_situacional: ${l}`);
        }
      }
    } else {
      deps.pedidoConsultaResposta = false;
    }
    if (pedidoAnalise) {
      deps.pedidoAnaliseDeliberativa = true;
      if (deps.proibirDespacho !== false) deps.proibirDespacho = true;
    } else {
      deps.pedidoAnaliseDeliberativa = false;
    }
    if (pedidoInfoGathering) {
      deps.pedidoInfoGathering = true;
      deps.pedidoDecisaoExplicita = false;
      if (deps.proibirDespacho !== false) deps.proibirDespacho = true;
    } else if (pedidoDecisao) {
      deps.pedidoDecisaoExplicita = true;
      if (deps.proibirDespacho !== false) deps.proibirDespacho = true;
    } else if (deps.pedidoDecisaoExplicita === false) {
      /* manter false — não reactivar PD */
    }

    // COA activo para filtro de princípios (escopo MG2 vs global)
    if (!deps.coaAtivo) {
      deps.coaAtivo =
        entrada.coaAtivo ||
        (entrada.coaId ? { id: entrada.coaId } : null);
    }
    if (entrada.coaId && !deps.coaId) {
      deps.coaId = entrada.coaId;
    }

    // P1-3: princípios do estágio 3 = secções do Manifesto canónico quando anexado
    if (
      entrada.manifestoMg2?.ok &&
      Array.isArray(entrada.manifestoMg2.principiosSelecionaveis) &&
      entrada.manifestoMg2.principiosSelecionaveis.length
    ) {
      deps.catalogoPrincipiosManifesto =
        entrada.manifestoMg2.principiosSelecionaveis;
    }

    registrar("0");
    const diagnostico = await estagio0Diagnostico(entrada, deps);

    registrar("1");
    const enquadramento = await estagio1Enquadramento(entrada, diagnostico, deps);
    if (enquadramento.tipoPedido === "ambiguo") {
      lacunasAcc.push("Pedido ambíguo — esclarecimento necessário");
    }

    registrar("2");
    const { dossier } = estagio2Dossier(entrada, lacunasAcc, pacoteNcs);

    const shortCircuit = calcularShortCircuitNcs(
      entrada,
      lacunasAcc,
      enquadramento,
      pacoteNcs
    );

    registrar("3");
    const principiosAplicados = await estagio3Principios(
      diagnostico,
      enquadramento,
      deps,
      lacunasAcc
    );

    const baseParcial = {
      diagnostico,
      enquadramento,
      dossier,
      principiosAplicados,
      lacunas: lacunasAcc.slice(),
      shortCircuit,
      ...(entrada.snapshotSituacional
        ? { snapshotSituacional: entrada.snapshotSituacional }
        : {}),
      ...(obterAutoanaliseActiva() &&
      entrada.ultimaRespostaCeo != null &&
      String(entrada.ultimaRespostaCeo).trim()
        ? { ultimaRespostaCeo: String(entrada.ultimaRespostaCeo) }
        : {})
    };

    registrar("4");
    const analise = shortCircuit
      ? "Bloqueio por lacuna: deliberação incompleta até obter dados essenciais."
      : deps.pedidoConsultaResposta === true
        ? comporAnaliseConsultaDesdeSnapshot(entrada.snapshotSituacional)
        : await estagio4Analise(baseParcial, deps);

    const parcialPos4 = { ...baseParcial, analise };

    // T5 — 5a e 5b após 4; 6 só após ambos (ordem física sequencial 5a→5b é válida)
    registrar("5a");
    const riscos = shortCircuit
      ? [{ nivel: "alto", texto: "Decidir sem dados essenciais" }]
      : await estagio5aRiscos(parcialPos4, deps);

    registrar("5b");
    const oportunidades = shortCircuit
      ? []
      : await estagio5bOportunidades({ ...parcialPos4, riscos }, deps);

    const parcialPos5 = {
      ...parcialPos4,
      riscos,
      oportunidades,
      lacunas: lacunasAcc.slice()
    };

    registrar("6");
    let decisaoExecutiva;
    if (pedidoConsulta) {
      const snap = entrada.snapshotSituacional;
      decisaoExecutiva = {
        estado: snap?.temLastroSuficiente ? "monitorar" : "solicitar_dados",
        recomendacao: comporAnaliseConsultaDesdeSnapshot(snap),
        alternativas: [],
        justificativa:
          "Consulta situacional — resposta com base no snapshot factual. " +
          "Sem riscos materiais inventados; sem problema de negócio a deliberar."
      };
    } else if (shortCircuit) {
      decisaoExecutiva = {
        estado: "solicitar_dados",
        recomendacao: "Solicitar os dados em falta antes de decidir",
        alternativas: ["Adiar", "Prosseguir com risco elevado"],
        justificativa:
          lacunasAcc.length > 0
            ? `Lacunas materiais impedem decisão segura. Princípios ${principiosAplicados.join(", ") || "aplicáveis"} exigem não inventar factos. Riscos de decidir às cegas.`
            : "Sem riscos materiais identificados além da ambiguidade; solicitar esclarecimento."
      };
    } else {
      try {
        decisaoExecutiva = await estagio6Decisao(parcialPos5, deps);
      } catch (err) {
        if (err && err.codigo === "ENUM_ILEGAL") {
          // retry já ocorreu em chamarComRetry; falha controlada
          throw err;
        }
        throw err;
      }
    }

    decisaoExecutiva = aplicarPoliticaDecisaoNcs(
      decisaoExecutiva,
      lacunasAcc,
      pacoteNcs
    );
    // Opção A: pedido explícito de decisão → P1-2 não processa primeiro
    // (evita prosa genérica que impede fecho com alternativas).
    // Sem pedido de decisão → P1-2 intacto («analisa e recomenda»).
    if (!pedidoDecisao) {
      if (pedidoConsulta) {
        decisaoExecutiva = aplicarPoliticaConsultaResposta(decisaoExecutiva, {
          pedidoConsulta: true,
          pedidoDelegacaoExplicita
        });
        const snap = entrada.snapshotSituacional;
        if (snap && !snap.temLastroSuficiente) {
          decisaoExecutiva = {
            ...decisaoExecutiva,
            estado: "solicitar_dados",
            recomendacao:
              snap.lacunas?.length
                ? `Lastro insuficiente. Informação ausente: ${snap.lacunas.join("; ")}.`
                : "Lastro situacional insuficiente — não invento progresso."
          };
        } else if (snap?.temLastroSuficiente) {
          decisaoExecutiva = {
            ...decisaoExecutiva,
            estado:
              decisaoExecutiva.estado === "delegar" ||
              decisaoExecutiva.estado === "aprovar"
                ? "monitorar"
                : decisaoExecutiva.estado,
            recomendacao:
              decisaoExecutiva.recomendacao &&
              !/delegar|elabora(r|ção)\s+(de\s+)?(um\s+)?relat/i.test(
                decisaoExecutiva.recomendacao
              )
                ? decisaoExecutiva.recomendacao
                : comporAnaliseConsultaDesdeSnapshot(snap)
          };
        }
      } else {
        decisaoExecutiva = aplicarPoliticaAnaliseDeliberativa(decisaoExecutiva, {
          pedidoAnalise,
          pedidoDelegacaoExplicita,
          analise
        });
      }
    }
    decisaoExecutiva = aplicarPoliticaDecisaoSobConflito(decisaoExecutiva, {
      pedidoDecisao,
      pedidoDelegacaoExplicita,
      lacunas: lacunasAcc,
      analise
    });
    decisaoExecutiva = {
      ...decisaoExecutiva,
      justificativa: assegurarJustificativaV5(
        decisaoExecutiva.justificativa,
        {
          ...parcialPos5,
          lacunas: lacunasAcc,
          principiosAplicados
        }
      )
    };

    talvezInjetarLacunaSolicitarDados(
      decisaoExecutiva.estado,
      lacunasAcc,
      pacoteNcs,
      {
        recomendacao: decisaoExecutiva.recomendacao,
        justificativa: decisaoExecutiva.justificativa
      }
    );

    registrar("7");
    const acao = await estagio7Acao(
      decisaoExecutiva,
      { ...parcialPos5, lacunas: lacunasAcc },
      deps
    );

    let confianca = 0.75;
    if (lacunasAcc.length) confianca = Math.max(0.25, confianca - 0.15 * lacunasAcc.length);
    if (enquadramento.tipoPedido === "ambiguo") confianca = Math.min(confianca, 0.45);
    if (shortCircuit) confianca = Math.min(confianca, 0.35);

    return {
      ok: true,
      falhaControlada: false,
      ordem: ordem.slice(),
      pacoteNcs: pacoteNcs || null,
      parcial: {
        diagnostico,
        enquadramento,
        dossier,
        principiosAplicados,
        analise,
        riscos,
        oportunidades,
        decisaoExecutiva,
        acao,
        lacunas: lacunasAcc.slice(),
        confianca,
        coaId: entrada.coaId ?? null,
        shortCircuit
      }
    };
  } catch (err) {
    const motivo = err instanceof Error ? err.message : String(err);
    const falha = montarFalhaControlada(entrada || { mensagem: "" }, motivo, lacunasAcc);
    return {
      ok: true,
      falhaControlada: true,
      ordem: ordem.slice(),
      pacoteNcs: pacoteNcs || null,
      parcial: falha,
      erro: motivo
    };
  }
}

export default executarPipeline07;
