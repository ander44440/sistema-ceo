/**
 * Snapshot situacional — CONSULTA com/sem lastro.
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  comporAnaliseConsultaDesdeSnapshot,
  diagnosticoConsultaSituacional,
  injectarSnapshotSituacionalNaEntrada,
  montarSnapshotSituacionalConsulta
} from "./snapshotSituacionalConsulta.js";
import { executarDeliberacaoMre } from "./executarDeliberacao.js";
import { gerarComunicadoExecutivo } from "./speaker/speakerExecutivo.js";
import { detectarPedidoDecisaoExplicita } from "./politicaDecisaoSobConflito.js";

const PERGUNTA_4 =
  "Em que etapa estamos? O que acabamos de concluir? O que estamos fazendo agora? Qual deveria ser o próximo passo?";

function chamarLlmSpyInventor() {
  return async (pedido) => {
    // Se CONSULTA chamar LLM nos estágios 0/4/6, falha o contrato
    if (
      pedido?.estagio === "0_diagnostico" ||
      pedido?.estagio === "4_analise" ||
      pedido?.estagio === "6_decisao"
    ) {
      throw new Error(`LLM indevido em CONSULTA: ${pedido.estagio}`);
    }
    if (pedido?.estagio === "1_enquadramento") {
      return { tipoPedido: "informacao", urgencia: "media", escopo: "consulta" };
    }
    if (pedido?.estagio === "3_principios") {
      return { principiosAplicados: ["Respeito absoluto ao tempo do utilizador"] };
    }
    if (pedido?.estagio === "5a_riscos") {
      return { riscos: [] };
    }
    if (pedido?.estagio === "5b_oportunidades") {
      return { oportunidades: [] };
    }
    if (pedido?.estagio === "7_acao") {
      return { descricao: "Informar estado do trabalho" };
    }
    return {};
  };
}

describe("P5b snapshot situacional CONSULTA", () => {
  it("evidência recente da sessão vence MTE genérico (continuidade/Atenção)", () => {
    const snap = montarSnapshotSituacionalConsulta({
      lastro: {
        temContextoRelevante: true,
        memoriaTrabalhoExecutiva: {
          objectivoAtivo: "fase de continuidade",
          proximaAcao: "Atenção",
          decisoesTomadas: ["Estado operacional Atenção"],
          hierarquia: {
            objectivoEstrategico: "Dia em curso",
            objectivoAtual: "fase de continuidade",
            entregaCorrente: "fase de continuidade"
          },
          estadoConversa: { emExecucao: "fase de continuidade" },
          pendencias: ["pendências sobre riscos e papel do usuário"]
        }
      },
      factosOficiais: [
        "Estado Executivo — Frente activa: MG2",
        "Estado operacional: Atenção"
      ],
      historico: [
        {
          papel: "usuario",
          texto: "Criar a V1 de resolução de precedência"
        },
        {
          papel: "ceo",
          texto: "Precedência V1 implementada e testes técnicos aprovados."
        },
        {
          papel: "usuario",
          texto: "Corrigir CONSULTA → RESPONDER e criar Snapshot Situacional"
        },
        {
          papel: "ceo",
          texto: "Snapshot situacional ligado; modo consulta factual activo."
        }
      ]
    });

    assert.equal(snap.temLastroSuficiente, true);
    assert.match(snap.etapaAtual || "", /Snapshot Situacional|CONSULTA/i);
    assert.doesNotMatch(snap.etapaAtual || "", /fase de continuidade|Atenção/i);
    assert.match(snap.ultimaConclusao || "", /Precedência V1|Snapshot|consulta/i);
    assert.doesNotMatch(snap.ultimaConclusao || "", /fase de continuidade|Atenção/i);
    assert.match(snap.emCursoAgora || "", /Snapshot Situacional|CONSULTA/i);
    assert.ok(snap.fontes.includes("sessao.historico"));
  });

  it("abertura/saudação NÃO vira última conclusão (objetivo de agora → LACUNA)", () => {
    const snap = montarSnapshotSituacionalConsulta({
      lastro: null,
      factosOficiais: [],
      historico: [
        { papel: "usuario", texto: "Bom dia" },
        {
          papel: "ceo",
          texto: "Bom dia. Qual é o objetivo de agora?"
        },
        { papel: "usuario", texto: PERGUNTA_4 }
      ]
    });
    assert.equal(snap.ultimaConclusao, null);
    assert.ok(snap.lacunas.includes("última conclusão"));
    const analise = comporAnaliseConsultaDesdeSnapshot(snap);
    assert.doesNotMatch(analise, /objetivo de agora/i);
    assert.doesNotMatch(analise, /Qual é o objetivo/i);
  });

  it("conclusão real no histórico é reconhecida", () => {
    const snap = montarSnapshotSituacionalConsulta({
      lastro: null,
      factosOficiais: [],
      historico: [
        {
          papel: "usuario",
          texto: "Corrigir o seletor de evidência recente"
        },
        {
          papel: "ceo",
          texto: "Seletor corrigido: aberturas excluídas; testes aprovados."
        },
        { papel: "usuario", texto: PERGUNTA_4 }
      ]
    });
    assert.match(snap.ultimaConclusao || "", /Seletor corrigido|aprovados/i);
    assert.doesNotMatch(snap.ultimaConclusao || "", /objetivo de agora/i);
  });

  it("só lastro genérico antigo → lacunas honestas (não preenche com Atenção/continuidade)", () => {
    const snap = montarSnapshotSituacionalConsulta({
      lastro: {
        memoriaTrabalhoExecutiva: {
          hierarquia: { entregaCorrente: "fase de continuidade" },
          estadoConversa: { emExecucao: "Atenção" },
          proximaAcao: "Atenção",
          decisoesTomadas: ["Estado operacional Atenção"],
          pendencias: ["pendências sobre riscos e papel do usuário"]
        }
      },
      factosOficiais: ["Estado Executivo — Frente activa: MG2"],
      historico: []
    });
    assert.equal(snap.temLastroSuficiente, false);
    assert.equal(snap.etapaAtual, null);
    assert.equal(snap.ultimaConclusao, null);
    const analise = comporAnaliseConsultaDesdeSnapshot(snap);
    assert.match(analise, /evidência recente insuficiente|Informação ausente/i);
    assert.doesNotMatch(analise, /fase de continuidade/);
    assert.doesNotMatch(analise, /Estado operacional Atenção/);
  });

  it("com lastro MTE específico + ops: ainda monta âncoras (sem sessão)", () => {
    const snap = montarSnapshotSituacionalConsulta({
      lastro: {
        temContextoRelevante: true,
        memoriaTrabalhoExecutiva: {
          objectivoAtivo: "Fechar CONSULTA→RESPONDER",
          proximaAcao: "Validar no UI a pergunta das 4 questões",
          decisoesTomadas: ["Precedência V1 aprovada nos testes técnicos"],
          hierarquia: {
            objectivoEstrategico: "Uso diário MG2",
            objectivoAtual: "Lastro factual para consulta",
            entregaCorrente: "Correção mínima — snapshot situacional"
          },
          estadoConversa: {
            emExecucao: "Injectar snapshot antes do estágio 0/2"
          }
        },
        factosOficiais: []
      },
      factosOficiais: [
        "Estado Executivo — Job em execução JOB-000200: patch consulta"
      ],
      historico: []
    });

    assert.equal(snap.temLastroSuficiente, true);
    assert.match(snap.etapaAtual || "", /snapshot situacional|JOB-000200/i);
    assert.match(snap.ultimaConclusao || "", /Precedência V1/i);
    assert.match(snap.emCursoAgora || "", /Injectar snapshot|JOB-000200/i);
    assert.match(snap.proximoPasso || "", /Validar no UI/i);
  });

  it("sem lastro: declara lacunas e não inventa", () => {
    const snap = montarSnapshotSituacionalConsulta({
      lastro: null,
      factosOficiais: [],
      historico: []
    });
    assert.equal(snap.temLastroSuficiente, false);
    assert.deepEqual(snap.lacunas, [
      "etapa atual",
      "última conclusão",
      "o que está sendo feito agora",
      "próximo passo"
    ]);
    const analise = comporAnaliseConsultaDesdeSnapshot(snap);
    assert.match(analise, /evidência recente insuficiente|Informação ausente|lastro insuficiente/i);
    assert.doesNotMatch(analise, /falta de clareza|elaborar um relat/i);
  });

  it("injectarSnapshot acrescenta factosOficiais", () => {
    const entrada = {
      mensagem: PERGUNTA_4,
      factosOficiais: ["Acervo: item X"]
    };
    injectarSnapshotSituacionalNaEntrada(entrada, {
      lastro: {
        memoriaTrabalhoExecutiva: {
          proximaAcao: "Correr build",
          hierarquia: { entregaCorrente: "P5b snapshot" },
          estadoConversa: { emExecucao: "Testes unitários" },
          decisoesTomadas: ["Modo CONSULTA→RESPONDER ligado"]
        }
      },
      historico: []
    });
    assert.ok(entrada.snapshotSituacional?.temLastroSuficiente);
    assert.ok(
      entrada.factosOficiais.some((f) => /SNAPSHOT SITUACIONAL/.test(f))
    );
    assert.match(entrada.mensagem, /\[SNAPSHOT SITUACIONAL — CONSULTA\]/);
  });

  it("pipeline CONSULTA com lastro: responde as 4 âncoras sem Delegar/Plano/relatório", async () => {
    const lastro = {
      temContextoRelevante: true,
      memoriaTrabalhoExecutiva: {
        proximaAcao: "Homologar pergunta situacional no UI",
        decisoesTomadas: ["Anti-Delegar/Plano já aplicado"],
        hierarquia: {
          entregaCorrente: "Lastro factual CONSULTA",
          objectivoAtual: "Responder etapa/conclusão/agora/próximo"
        },
        estadoConversa: { emExecucao: "Montagem do snapshot situacional" }
      }
    };
    const entrada = {
      mensagem: PERGUNTA_4,
      coaId: "mg2",
      coaAtivo: { id: "mg2", nome: "MG2" },
      intencao: { id: "deliberar_objetivo" },
      snapshotPainel: {
        resumo: "Painel OK",
        proximoPasso: "Homologar pergunta situacional no UI",
        estado: "activo"
      },
      factosOficiais: [
        "Estado Executivo — Frente activa: MG2"
      ],
      historico: [
        { papel: "usuario", texto: "Corrija o lastro da consulta situacional" },
        { papel: "ceo", texto: "Snapshot situacional em implementação." }
      ],
      lastroConsciencia: lastro,
      consultaNaoEAcao: true,
      tipoTurno: "consulta"
    };

    const out = await executarDeliberacaoMre(entrada, {
      chamarLlm: chamarLlmSpyInventor(),
      pedidoConsultaResposta: true,
      lastroConsciencia: lastro,
      historico: entrada.historico,
      proibirDespacho: true
    });

    assert.equal(out.ok, true);
    const parecer = out.parecer;
    assert.ok(parecer, "parecer esperado");
    assert.match(parecer.analise, /Etapa actual|Sessão|lastro da consulta/i);
    assert.match(
      parecer.analise,
      /Snapshot situacional|Anti-Delegar|Homologar|implement/i
    );
    assert.doesNotMatch(parecer.analise, /fase de continuidade/);
    assert.doesNotMatch(parecer.analise, /Estado operacional Atenção/);
    assert.doesNotMatch(parecer.analise, /falta de clareza|elaborar um relat/i);
    assert.notEqual(parecer.decisaoExecutiva?.estado, "delegar");

    const falado = gerarComunicadoExecutivo(parecer, "chat", {
      pedidoConsulta: true
    });
    assert.equal(falado.ok, true);
    assert.doesNotMatch(falado.comunicado.texto, /Delego|Plano:/i);
  });

  it("pipeline CONSULTA sem lastro: declara lacuna, não inventa", async () => {
    const entrada = {
      mensagem: PERGUNTA_4,
      coaId: "mg2",
      coaAtivo: { id: "mg2" },
      intencao: { id: "deliberar_objetivo" },
      snapshotPainel: { resumo: "vazio", proximoPasso: null, estado: null },
      factosOficiais: [],
      historico: [],
      consultaNaoEAcao: true,
      tipoTurno: "consulta"
    };

    const out = await executarDeliberacaoMre(entrada, {
      chamarLlm: chamarLlmSpyInventor(),
      pedidoConsultaResposta: true,
      historico: [],
      proibirDespacho: true
    });

    assert.equal(out.ok, true);
    const parecer = out.parecer;
    assert.match(
      parecer.analise,
      /evidência recente insuficiente|Informação ausente|lastro insuficiente/i
    );
    assert.doesNotMatch(
      parecer.analise,
      /falta de clareza|elaborar (um )?relat|Delegar|fase de continuidade/i
    );
    assert.equal(parecer.decisaoExecutiva?.estado, "solicitar_dados");
  });

  it("diagnóstico CONSULTA não inventa problema de negócio", () => {
    const d = diagnosticoConsultaSituacional({
      snapshotSituacional: {
        temLastroSuficiente: true,
        lacunas: []
      }
    });
    assert.match(d.objetivoReal, /consulta situacional/i);
    assert.match(d.problemaNegocio, /não há problema de negócio/i);
  });

  it("DECISÃO explícita continua detectável (regressão)", () => {
    assert.equal(
      detectarPedidoDecisaoExplicita(
        "Decide entre Alfa e Beta com os factos actuais."
      ),
      true
    );
    assert.equal(detectarPedidoDecisaoExplicita(PERGUNTA_4), false);
  });

  it("AÇÃO explícita não activa snapshot CONSULTA (regressão)", async () => {
    let chamouEstagio0Llm = false;
    const chamarLlm = async (pedido) => {
      if (pedido?.estagio === "0_diagnostico") {
        chamouEstagio0Llm = true;
        return {
          objetivoReal: "Executar melhoria",
          problemaNegocio: "melhoria aprovada pendente",
          natureza: "operacional"
        };
      }
      if (pedido?.estagio === "1_enquadramento") {
        return { tipoPedido: "execucao", urgencia: "alta", escopo: "job" };
      }
      if (pedido?.estagio === "3_principios") {
        return {
          principiosAplicados: ["Respeito absoluto ao tempo do utilizador"]
        };
      }
      if (pedido?.estagio === "4_analise") {
        return { analise: "Executar a melhoria aprovada conforme Gate." };
      }
      if (pedido?.estagio === "5a_riscos") {
        return { riscos: [{ nivel: "baixo", texto: "risco residual baixo" }] };
      }
      if (pedido?.estagio === "5b_oportunidades") {
        return { oportunidades: [] };
      }
      if (pedido?.estagio === "6_decisao") {
        return {
          estado: "delegar",
          recomendacao: "Despachar execução da melhoria",
          alternativas: ["Adiar"],
          justificativa:
            "Sem riscos materiais identificados; decisão com base nos princípios aplicados."
        };
      }
      if (pedido?.estagio === "7_acao") {
        return {
          descricao: "Publicar Job da melhoria",
          tipo: "despachar",
          prioridade: "alta",
          job: {
            titulo: "Melhoria aprovada",
            descricao: "Executar melhoria"
          }
        };
      }
      return {};
    };

    const out = await executarDeliberacaoMre(
      {
        mensagem: "Execute a melhoria aprovada agora",
        coaId: "mg2",
        coaAtivo: { id: "mg2" },
        intencao: { id: "executar_fila" },
        snapshotPainel: { resumo: "ok", proximoPasso: "executar", estado: "ok" },
        factosOficiais: ["Gate aprovado"]
      },
      { chamarLlm, pedidoConsultaResposta: false }
    );

    assert.equal(out.ok, true);
    assert.equal(chamouEstagio0Llm, true, "AÇÃO deve usar estágio 0 LLM");
    assert.equal(
      out.parecer?.dossier?.factosUsados?.some((f) =>
        /SNAPSHOT SITUACIONAL/.test(f)
      ),
      false
    );
  });

  describe("A2 — âncora explícita da instrução vs foco recente do histórico", () => {
    const Q_OUTDOOR = "Qual o próximo passo do outdoor?";
    const histPagamentoLast = [
      { papel: "user", texto: "Vamos priorizar outdoor laterais no MG2." },
      { papel: "ceo", texto: "Combinado — foco no outdoor." },
      {
        papel: "user",
        texto: "Agora quero falar de pagamento dos fornecedores."
      },
      { papel: "ceo", texto: "Ok — pagamento dos fornecedores em vista." }
    ];
    const histOutdoorLast = [
      {
        papel: "user",
        texto: "Agora quero falar de pagamento dos fornecedores."
      },
      { papel: "ceo", texto: "Ok — pagamento." },
      { papel: "user", texto: "Vamos priorizar outdoor laterais no MG2." },
      { papel: "ceo", texto: "Combinado — foco no outdoor laterais." }
    ];

    it("A) outdoor nomeado prevalece sobre pagamento recente no hist", () => {
      const snap = montarSnapshotSituacionalConsulta({
        historico: histPagamentoLast,
        instrucao: Q_OUTDOOR
      });
      const blob = `${snap.etapaAtual || ""}\n${snap.emCursoAgora || ""}\n${comporAnaliseConsultaDesdeSnapshot(snap)}`;
      assert.match(blob, /outdoor/i);
      assert.doesNotMatch(blob, /pagamento/i);
      assert.match(snap.etapaAtual || "", /outdoor/i);
    });

    it("B) outdoor nomeado + hist outdoor continua correcto", () => {
      const snap = montarSnapshotSituacionalConsulta({
        historico: histOutdoorLast,
        instrucao: Q_OUTDOOR
      });
      assert.match(snap.etapaAtual || "", /outdoor/i);
      assert.doesNotMatch(snap.etapaAtual || "", /pagamento/i);
      assert.match(comporAnaliseConsultaDesdeSnapshot(snap), /outdoor/i);
    });

    it("C) situacional sem âncora explícita mantém foco recente do hist", () => {
      const snap = montarSnapshotSituacionalConsulta({
        historico: histPagamentoLast,
        instrucao: PERGUNTA_4
      });
      assert.match(snap.etapaAtual || "", /pagamento/i);
      assert.doesNotMatch(snap.etapaAtual || "", /outdoor/i);
    });
  });
});
