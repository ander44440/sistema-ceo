/**
 * Ordem P1-2 vs DECISÃO SOB CONFLITO (Opção A).
 * Pedido explícito de decisão → saltar P1-2; senão P1-2 intacto.
 */
import assert from "node:assert/strict";
import { test, beforeEach } from "node:test";
import {
  executarRotaDeliberativa,
  reiniciarStoresPosDeliberacaoParaTestes
} from "../mre/integracaoNucleo.js";
import {
  criarChamarLlmMock,
  mapaLlmFluxoFeliz
} from "../mre/pipeline/llmMock.js";
import { criarPublicadorFilaMemoria } from "../motorExecucao/ponteParecerJob.js";
import { ehRecomendacaoOperacional } from "../classificadorIntencao/recomendacaoOperacional.js";
import { classificar } from "../classificadorIntencao/regras.js";
import { detectarPedidoDecisaoExplicita } from "../classificadorIntencao/pedidoDecisaoExplicita.js";
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

const MSG_CONFLITO_DECIDE = `Engenharia recomenda priorizar estabilidade técnica.
Financeiro recomenda cortar custo imediatamente.
Comercial recomenda acelerar aquisição de clientes.

Decide qual posição prevalece e justifica com o critério dominante.
Não quero que delegues a análise.`;

const MSG_ANALISE_RECOMENDA = `Analise a proposta do bairro popular e dê uma recomendação executiva.
Não crie Job e não execute nada.`;

const ALT_ESTABILIDADE = "Priorizar estabilidade técnica";
const ALT_CUSTO = "Cortar custo agora";
const ALT_AQUISICAO = "Acelerar aquisição";

function mockDelegarComAlternativas() {
  return mapaLlmFluxoFeliz({
    "4_analise": {
      analise: "Três posições em tensão: Eng, Fin, Com."
    },
    "6_decisao": {
      estado: "delegar",
      recomendacao:
        "Delegar a análise a uma equipe especializada pelo conflito entre áreas",
      alternativas: [ALT_ESTABILIDADE, ALT_CUSTO, ALT_AQUISICAO],
      justificativa: "Há conflito entre áreas."
    }
  });
}

function coaAlfa() {
  const p = criarProjeto({ nome: "AlfaTech" });
  selecionarProjeto(p.id);
  return { id: p.id, nome: "AlfaTech", status: "ativo" };
}

test("T1 — Conflito + Decide + LLM delegar → escolha explícita; sem prosa P1-2", async () => {
  assert.equal(detectarPedidoDecisaoExplicita(MSG_CONFLITO_DECIDE), true);
  const coa = coaAlfa();
  const pub = criarPublicadorFilaMemoria();
  const out = await executarRotaDeliberativa(
    {
      instrucao: MSG_CONFLITO_DECIDE,
      intencao: {
        id: "deliberar_objetivo",
        capacidade: "ia",
        classe: "conversa_projeto"
      },
      coaAtivo: coa,
      memoria: () => ({ projetoAtivo: { id: coa.id, nome: coa.nome } })
    },
    {
      chamarLlm: criarChamarLlmMock(mockDelegarComAlternativas()),
      publicarJob: pub.publicarJob.bind(pub)
    }
  );
  assert.equal(out.ok, true);
  const de = out.dados?.parecer?.decisaoExecutiva;
  assert.ok(de);
  assert.notEqual(de.estado, "delegar");
  assert.ok(["aprovar", "rejeitar", "monitorar"].includes(de.estado));
  assert.match(
    String(de.recomendacao),
    new RegExp(
      `${ALT_ESTABILIDADE}|${ALT_CUSTO}|${ALT_AQUISICAO}|Decisão sob conflito|escolha executiva`,
      "i"
    )
  );
  assert.doesNotMatch(
    String(de.recomendacao),
    /posição executiva está na análise acima|Não transfero esta deliberação/i
  );
  assert.doesNotMatch(
    String(out.mensagem || ""),
    /posição executiva está na análise acima|Não transfero esta deliberação/i
  );
  assert.equal(obterProjetoAtivo()?.nome, "AlfaTech");
  assert.equal(pub.jobs.length, 0);
});

test("T2 — Analise e recomenda + LLM delegar → P1-2 intacto", async () => {
  assert.equal(detectarPedidoDecisaoExplicita(MSG_ANALISE_RECOMENDA), false);
  const coa = coaAlfa();
  const pub = criarPublicadorFilaMemoria();
  const out = await executarRotaDeliberativa(
    {
      instrucao: MSG_ANALISE_RECOMENDA,
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

test("T3 — Decide + solicitar_dados + orçamento Q3 → permanece solicitar_dados", async () => {
  const msg = `${MSG_CONFLITO_DECIDE}

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
            alternativas: [ALT_ESTABILIDADE],
            justificativa: "Sem orçamento Q3 não há critério financeiro."
          }
        })
      ),
      publicarJob: pub.publicarJob.bind(pub)
    }
  );
  assert.equal(out.ok, true);
  const de = out.dados?.parecer?.decisaoExecutiva;
  assert.equal(de.estado, "solicitar_dados");
  assert.match(String(de.recomendacao), /orçamento|Q3/i);
});

test("T4 — Decide + delegar + alternativas → estado válido e alternativa nomeada", async () => {
  const coa = coaAlfa();
  const pub = criarPublicadorFilaMemoria();
  const out = await executarRotaDeliberativa(
    {
      instrucao: "Decide entre estabilidade, corte de custo e aquisição.",
      intencao: {
        id: "deliberar_objetivo",
        capacidade: "ia",
        classe: "conversa_projeto"
      },
      coaAtivo: coa,
      memoria: () => ({ projetoAtivo: { id: coa.id, nome: coa.nome } })
    },
    {
      chamarLlm: criarChamarLlmMock(mockDelegarComAlternativas()),
      publicarJob: pub.publicarJob.bind(pub)
    }
  );
  assert.equal(out.ok, true);
  const de = out.dados?.parecer?.decisaoExecutiva;
  assert.ok(["aprovar", "rejeitar", "monitorar"].includes(de.estado));
  assert.ok(
    [ALT_ESTABILIDADE, ALT_CUSTO, ALT_AQUISICAO].some((a) =>
      String(de.recomendacao).includes(a)
    ),
    `recomendação deve nomear alternativa: ${de.recomendacao}`
  );
});

test('T5 — "Recomenda prioridade" sem decisão explícita → E4/C4', () => {
  const texto = "Qual deveria ser a prioridade?";
  assert.equal(detectarPedidoDecisaoExplicita(texto), false);
  assert.equal(ehRecomendacaoOperacional(texto), true);
  const s = classificar(texto);
  assert.equal(s.classe, "comando_operacional");
  assert.equal(s.destino, "capacidade_operacional");
});
