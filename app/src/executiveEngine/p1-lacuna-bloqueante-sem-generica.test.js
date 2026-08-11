/**
 * Lacuna bloqueante nomeada — sem genérica «Informação essencial…».
 */
import assert from "node:assert/strict";
import { test, beforeEach } from "node:test";
import {
  talvezInjetarLacunaSolicitarDados,
  ehLacunaGenericaEssencial,
  LACUNA_GENERICA_ESSENCIAL,
  derivarLacunaNomeadaDeRecomendacao
} from "../mre/ncs/politicas.js";
import {
  executarRotaDeliberativa,
  reiniciarStoresPosDeliberacaoParaTestes
} from "../mre/integracaoNucleo.js";
import {
  criarChamarLlmMock,
  mapaLlmFluxoFeliz
} from "../mre/pipeline/llmMock.js";
import { criarPublicadorFilaMemoria } from "../motorExecucao/ponteParecerJob.js";
import { detectarPedidoDecisaoExplicita } from "../classificadorIntencao/pedidoDecisaoExplicita.js";
import { detectarPedidoAnaliseDeliberativa } from "../mre/politicaAnaliseDeliberativa.js";
import { resetStoreContinuidadePadrao } from "../continuidadeGate/integracaoConversa.js";
import { resetEstadoTopicosSessao } from "../classificadorIntencao/topicosSessao.js";
import { resetEstadoObjectivoSessao } from "../classificadorIntencao/objectivoSessao.js";
import { reiniciarAutoridadeDelegadaParaTestes } from "../autoridadeDelegada/autoridadeDelegada.js";
import {
  criarProjeto,
  obterProjetoAtivo,
  recarregarCatalogo,
  inicializarCatalogo,
  selecionarProjeto
} from "../catalogoProjetos/index.js";

function criarStorage() {
  const map = new Map();
  return {
    getItem(k) {
      return map.has(String(k)) ? map.get(String(k)) : null;
    },
    setItem(k, v) {
      map.set(String(k), String(v));
    },
    removeItem(k) {
      map.delete(String(k));
    }
  };
}

beforeEach(() => {
  globalThis.localStorage = criarStorage();
  recarregarCatalogo();
  inicializarCatalogo();
  resetStoreContinuidadePadrao();
  resetEstadoTopicosSessao();
  resetEstadoObjectivoSessao();
  reiniciarAutoridadeDelegadaParaTestes();
  reiniciarStoresPosDeliberacaoParaTestes();
});

const MSG_DECIDE = `Engenharia recomenda estabilidade.
Financeiro recomenda cortar custo.
Comercial recomenda acelerar.

Decide qual posição prevalece.
Não quero que delegues a análise.`;

const MSG_ANALISE = `Analise a proposta do bairro popular e dê uma recomendação executiva.
Não crie Job e não execute nada.`;

function coaAlfa() {
  const p = criarProjeto({ nome: "AlfaTech" });
  selecionarProjeto(p.id);
  return { id: p.id, nome: "AlfaTech", status: "ativo" };
}

test("unit: derivar orçamento Q3 da recomendação", () => {
  const d = derivarLacunaNomeadaDeRecomendacao(
    "Solicitar o orçamento aprovado do Q3 antes de fechar",
    "Sem orçamento Q3 não há critério."
  );
  assert.match(String(d), /orçamento aprovado do Q3/i);
  assert.equal(ehLacunaGenericaEssencial(d), false);
});

test("unit: duas lacunas reais → ambas; sem genérica", () => {
  const lacunas = [
    "Orçamento aprovado do Q3",
    "Prazo contratual desconhecido",
    LACUNA_GENERICA_ESSENCIAL
  ];
  talvezInjetarLacunaSolicitarDados("solicitar_dados", lacunas, null, {
    recomendacao: "Solicitar dados"
  });
  assert.equal(lacunas.length, 2);
  assert.ok(lacunas.some((l) => /orçamento|Q3/i.test(l)));
  assert.ok(lacunas.some((l) => /prazo/i.test(l)));
  assert.ok(!lacunas.some((l) => ehLacunaGenericaEssencial(l)));
});

test("unit: sem lacuna nomeada → genérica permitida", () => {
  const lacunas = [];
  talvezInjetarLacunaSolicitarDados("solicitar_dados", lacunas, null, {
    recomendacao: "Preciso de mais contexto geral"
  });
  assert.equal(lacunas.length, 1);
  assert.equal(lacunas[0], LACUNA_GENERICA_ESSENCIAL);
});

test("decisão + orçamento Q3 ausente → somente lacuna Q3 (sem genérica)", async () => {
  const msg = `${MSG_DECIDE}

Atenção: falta o orçamento aprovado do Q3.`;
  assert.equal(detectarPedidoDecisaoExplicita(msg), true);
  const coa = coaAlfa();
  const pub = criarPublicadorFilaMemoria();
  const out = await executarRotaDeliberativa(
    {
      instrucao: msg,
      intencao: {
        id: "deliberar_objetivo",
        capacidade: "ia",
        classe: "conversa_projeto"
      },
      coaAtivo: coa,
      memoria: () => ({ projetoAtivo: { id: coa.id, nome: coa.nome } })
    },
    {
      chamarLlm: criarChamarLlmMock(
        mapaLlmFluxoFeliz({
          "4_analise": {
            analise: "Conflito Eng/Fin/Com; orçamento Q3 ausente."
          },
          "6_decisao": {
            estado: "solicitar_dados",
            recomendacao:
              "Solicitar o orçamento aprovado do Q3 antes de fechar",
            alternativas: ["Priorizar estabilidade técnica"],
            justificativa: "Sem orçamento Q3 não há critério financeiro."
          }
        })
      ),
      publicarJob: pub.publicarJob.bind(pub)
    }
  );
  assert.equal(out.ok, true);
  const de = out.dados?.parecer?.decisaoExecutiva;
  const lacunas = out.dados?.parecer?.lacunas || [];
  assert.equal(de.estado, "solicitar_dados");
  assert.ok(lacunas.length >= 1);
  assert.ok(
    lacunas.every((l) => !ehLacunaGenericaEssencial(l)),
    `lacunas sem genérica: ${JSON.stringify(lacunas)}`
  );
  assert.ok(
    lacunas.some((l) => /orçamento aprovado do Q3/i.test(l)),
    `deve nomear Q3: ${JSON.stringify(lacunas)}`
  );
  // Preferência: só a lacuna Q3 (sem extras genéricos)
  const nomeadasQ3 = lacunas.filter((l) => /orçamento|Q3/i.test(l));
  assert.equal(nomeadasQ3.length, lacunas.length);
  assert.match(String(out.mensagem || ""), /orçamento|Q3/i);
  assert.doesNotMatch(
    String(out.mensagem || ""),
    /Informação essencial não especificada/i
  );
  assert.equal(obterProjetoAtivo()?.nome, "AlfaTech");
});

test("decisão + duas lacunas reais no acumulador → ambas; sem genérica", () => {
  const lacunas = [
    "Orçamento aprovado do Q3",
    "Assinatura do contrato ausente"
  ];
  talvezInjetarLacunaSolicitarDados("solicitar_dados", lacunas, null, {
    recomendacao: "Solicitar orçamento e assinatura"
  });
  assert.deepEqual(lacunas, [
    "Orçamento aprovado do Q3",
    "Assinatura do contrato ausente"
  ]);
});

test("decisão sem lacuna → fecho normal (não solicitar_dados)", async () => {
  const coa = coaAlfa();
  const pub = criarPublicadorFilaMemoria();
  const out = await executarRotaDeliberativa(
    {
      instrucao: MSG_DECIDE,
      intencao: {
        id: "deliberar_objetivo",
        capacidade: "ia",
        classe: "conversa_projeto"
      },
      coaAtivo: coa,
      memoria: () => ({ projetoAtivo: { id: coa.id, nome: coa.nome } })
    },
    {
      chamarLlm: criarChamarLlmMock(
        mapaLlmFluxoFeliz({
          "4_analise": { analise: "Três posições em tensão." },
          "6_decisao": {
            estado: "delegar",
            recomendacao:
              "Delegar a análise a uma equipe especializada pelo conflito",
            alternativas: [
              "Priorizar estabilidade técnica",
              "Cortar custo",
              "Acelerar aquisição"
            ],
            justificativa: "Há conflito entre áreas."
          }
        })
      ),
      publicarJob: pub.publicarJob.bind(pub)
    }
  );
  assert.equal(out.ok, true);
  const de = out.dados?.parecer?.decisaoExecutiva;
  assert.notEqual(de.estado, "solicitar_dados");
  assert.ok(["aprovar", "rejeitar", "monitorar"].includes(de.estado));
  assert.match(
    String(de.recomendacao),
    /escolha executiva|Priorizar estabilidade|Decisão/i
  );
  const lacunas = out.dados?.parecer?.lacunas || [];
  assert.ok(!lacunas.some((l) => ehLacunaGenericaEssencial(l)));
});

test("análise sem decisão → P1-2 preservado", async () => {
  assert.equal(detectarPedidoDecisaoExplicita(MSG_ANALISE), false);
  assert.equal(detectarPedidoAnaliseDeliberativa(MSG_ANALISE), true);
  const coa = coaAlfa();
  const pub = criarPublicadorFilaMemoria();
  const out = await executarRotaDeliberativa(
    {
      instrucao: MSG_ANALISE,
      intencao: {
        id: "deliberar_objetivo",
        capacidade: "ia",
        classe: "conversa_projeto"
      },
      coaAtivo: coa,
      memoria: () => ({ projetoAtivo: { id: coa.id, nome: coa.nome } })
    },
    {
      chamarLlm: criarChamarLlmMock(
        mapaLlmFluxoFeliz({
          "4_analise": {
            analise: "Proposta de bairro: alinhamento parcial."
          },
          "6_decisao": {
            estado: "delegar",
            recomendacao:
              "Delegar a análise a uma equipe especializada considerando a urgência",
            alternativas: ["Modificar e não priorizar"],
            justificativa: "Falta lastro no Acervo."
          }
        })
      ),
      publicarJob: pub.publicarJob.bind(pub)
    }
  );
  assert.equal(out.ok, true);
  const de = out.dados?.parecer?.decisaoExecutiva;
  assert.notEqual(de.estado, "delegar");
  assert.match(
    String(de.recomendacao),
    /posição executiva está na análise acima|Não transfero esta deliberação/i
  );
  assert.equal(pub.jobs.length, 0);
});
