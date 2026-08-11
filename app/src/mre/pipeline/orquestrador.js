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
  detectarPedidoAnaliseDeliberativa,
  ehPedidoDelegacaoExplicita
} from "../politicaAnaliseDeliberativa.js";
import {
  aplicarPoliticaDecisaoSobConflito,
  detectarPedidoDecisaoExplicita
} from "../politicaDecisaoSobConflito.js";

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
    const pedidoAnalise =
      deps.pedidoAnaliseDeliberativa === true ||
      detectarPedidoAnaliseDeliberativa(msgUsuario);
    const pedidoDecisao =
      deps.pedidoDecisaoExplicita === true ||
      detectarPedidoDecisaoExplicita(msgUsuario);
    const pedidoDelegacaoExplicita =
      deps.pedidoDelegacaoExplicita === true ||
      ehPedidoDelegacaoExplicita(msgUsuario);
    if (pedidoAnalise) {
      deps.pedidoAnaliseDeliberativa = true;
      if (deps.proibirDespacho !== false) deps.proibirDespacho = true;
    }
    if (pedidoDecisao) {
      deps.pedidoDecisaoExplicita = true;
      if (deps.proibirDespacho !== false) deps.proibirDespacho = true;
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
      shortCircuit
    };

    registrar("4");
    const analise = shortCircuit
      ? "Bloqueio por lacuna: deliberação incompleta até obter dados essenciais."
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
    if (shortCircuit) {
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
      decisaoExecutiva = aplicarPoliticaAnaliseDeliberativa(decisaoExecutiva, {
        pedidoAnalise,
        pedidoDelegacaoExplicita,
        analise
      });
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
