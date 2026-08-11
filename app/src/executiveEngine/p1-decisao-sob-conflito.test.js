/**
 * Decisão sob conflito — T1–T6 (fecho quando o utilizador exige decisão).
 */
import assert from "node:assert/strict";
import { test, beforeEach } from "node:test";
import {
  aplicarPoliticaDecisaoSobConflito,
  detectarPedidoDecisaoExplicita,
  ehHandoffAnaliticoComoEscape,
  ehFatoBloqueanteNomeado,
  hintEstagio6DecisaoSobConflito,
  temFatoBloqueanteNomeado
} from "../mre/politicaDecisaoSobConflito.js";
import { detectarPedidoAnaliseDeliberativa } from "../mre/politicaAnaliseDeliberativa.js";
import { mensagemEhExploratoria } from "../mre/integracaoNucleo.js";
import {
  executarRotaDeliberativa,
  reiniciarStoresPosDeliberacaoParaTestes
} from "../mre/integracaoNucleo.js";
import {
  criarChamarLlmMock,
  mapaLlmFluxoFeliz
} from "../mre/pipeline/llmMock.js";
import { criarPublicadorFilaMemoria } from "../motorExecucao/ponteParecerJob.js";
import { resetStoreContinuidadePadrao } from "../continuidadeGate/integracaoConversa.js";
import { resetEstadoTopicosSessao } from "../classificadorIntencao/topicosSessao.js";
import { resetEstadoObjectivoSessao } from "../classificadorIntencao/objectivoSessao.js";
import { reiniciarAutoridadeDelegadaParaTestes } from "../autoridadeDelegada/autoridadeDelegada.js";

beforeEach(() => {
  resetStoreContinuidadePadrao();
  resetEstadoTopicosSessao();
  resetEstadoObjectivoSessao();
  reiniciarAutoridadeDelegadaParaTestes();
  reiniciarStoresPosDeliberacaoParaTestes();
});

const MSG_CONFLITO_DECIDE = `Engenharia diz priorizar estabilidade técnica.
Financeiro diz cortar custo agora.
Comercial diz acelerar aquisição.

Decide qual posição prevalece e justifica com o critério dominante.
Não quero que delegues a análise.`;

const MSG_EXPLORATORIA = `Engenharia, Financeiro e Comercial divergem no trade-off.
O que achas? Quais alternativas vê?`;

test("unit: detectarPedidoDecisaoExplicita — positivos e negativos", () => {
  assert.equal(detectarPedidoDecisaoExplicita(MSG_CONFLITO_DECIDE), true);
  assert.equal(detectarPedidoDecisaoExplicita("Decida entre A e B."), true);
  assert.equal(detectarPedidoDecisaoExplicita("Tome a decisão agora."), true);
  assert.equal(detectarPedidoDecisaoExplicita("Escolha entre outdoor e pagamento."), true);
  assert.equal(detectarPedidoDecisaoExplicita("Feche a decisão com o critério de risco."), true);
  assert.equal(detectarPedidoDecisaoExplicita("Quero a sua decisão."), true);

  assert.equal(detectarPedidoDecisaoExplicita(MSG_EXPLORATORIA), false);
  assert.equal(
    detectarPedidoDecisaoExplicita(
      "Analise a proposta do bairro e dê uma recomendação executiva."
    ),
    false
  );
  assert.equal(detectarPedidoAnaliseDeliberativa(
    "Analise a proposta do bairro e dê uma recomendação executiva."
  ), true);
});

test("unit: exploração não neutraliza pedido explícito de decisão", () => {
  const msg =
    "Há trade-off e alternativas entre Engenharia e Comercial. Decide agora.";
  assert.equal(detectarPedidoDecisaoExplicita(msg), true);
  // Sem override, trade-off activaria exploração; com decide o detector do núcleo desliga.
  assert.equal(mensagemEhExploratoria(msg), false);
});

test("unit: handoff e facto bloqueante", () => {
  assert.equal(
    ehHandoffAnaliticoComoEscape(
      "delegar",
      "Delegar a análise a uma equipe especializada"
    ),
    true
  );
  assert.equal(ehFatoBloqueanteNomeado("Conflito entre Engenharia e Financeiro"), false);
  assert.equal(
    ehFatoBloqueanteNomeado("Falta o orçamento aprovado do Q3"),
    true
  );
  assert.equal(
    temFatoBloqueanteNomeado({
      lacunas: ["Conflito entre áreas Comercial e Engenharia"]
    }),
    false
  );
  assert.match(hintEstagio6DecisaoSobConflito(), /DECISÃO SOB CONFLITO|facto realmente bloqueante/i);
});

test("T1 — conflito Eng/Fin/Com + Decide → não delegar; fecho explícito", async () => {
  const pub = criarPublicadorFilaMemoria();
  const mapa = mapaLlmFluxoFeliz({
    "4_analise": {
      analise:
        "Três posições em tensão: estabilidade (Eng), corte de custo (Fin), aquisição (Com)."
    },
    "6_decisao": {
      estado: "delegar",
      recomendacao:
        "Delegar a análise a uma equipe especializada considerando o conflito",
      alternativas: [
        "Priorizar estabilidade técnica",
        "Cortar custo",
        "Acelerar aquisição"
      ],
      justificativa: "Há conflito entre áreas."
    }
  });
  const out = await executarRotaDeliberativa(
    {
      instrucao: MSG_CONFLITO_DECIDE,
      intencao: {
        id: "deliberar_objetivo",
        capacidade: "ia",
        classe: "conversa_projeto"
      }
    },
    {
      chamarLlm: criarChamarLlmMock(mapa),
      publicarJob: pub.publicarJob.bind(pub)
    }
  );
  assert.equal(out.ok, true);
  const estado = out.dados?.parecer?.decisaoExecutiva?.estado;
  assert.ok(["aprovar", "rejeitar", "monitorar"].includes(estado), `estado=${estado}`);
  assert.notEqual(estado, "delegar");
  assert.doesNotMatch(
    out.mensagem,
    /Delego a execução|delegar a análise|equipe especializ/i
  );
  assert.match(out.mensagem, /Decisão|escolha|Priorizar|estabilidade|critério/i);
  assert.equal(pub.jobs.length, 0);
});

test("T2 — conflito sem verbo decidir (exploração) → pode solicitar_dados/monitorar", () => {
  assert.equal(detectarPedidoDecisaoExplicita(MSG_EXPLORATORIA), false);
  assert.equal(mensagemEhExploratoria(MSG_EXPLORATORIA), true);

  const kept = aplicarPoliticaDecisaoSobConflito(
    {
      estado: "solicitar_dados",
      recomendacao: "Preciso de mais contexto sobre o trade-off",
      alternativas: [],
      justificativa: "Exploração"
    },
    { pedidoDecisao: false }
  );
  assert.equal(kept.estado, "solicitar_dados");
});

test("T3 — analisa e recomenda (P1-2) não é pedido de decisão", () => {
  const msg =
    "Analise a proposta do bairro popular e dê uma recomendação executiva. Não crie Job.";
  assert.equal(detectarPedidoDecisaoExplicita(msg), false);
  assert.equal(detectarPedidoAnaliseDeliberativa(msg), true);

  const remapped = aplicarPoliticaDecisaoSobConflito(
    {
      estado: "delegar",
      recomendacao: "Delegar a análise",
      alternativas: [],
      justificativa: "x"
    },
    { pedidoDecisao: false }
  );
  assert.equal(remapped.estado, "delegar");
});

test("T4 — pedido decisão + lacuna real (orçamento) → solicitar_dados preservado", () => {
  const out = aplicarPoliticaDecisaoSobConflito(
    {
      estado: "solicitar_dados",
      recomendacao: "Solicitar o orçamento aprovado do Q3 antes de fechar",
      alternativas: [],
      justificativa: "Sem orçamento não há critério financeiro."
    },
    {
      pedidoDecisao: true,
      lacunas: ["Falta o orçamento aprovado do Q3"]
    }
  );
  assert.equal(out.estado, "solicitar_dados");
  assert.match(out.recomendacao, /orçamento/i);
});

test("T5 — Continuidade MG2 no contexto não substitui a decisão pedida", () => {
  assert.equal(detectarPedidoDecisaoExplicita(MSG_CONFLITO_DECIDE), true);

  const out = aplicarPoliticaDecisaoSobConflito(
    {
      estado: "delegar",
      recomendacao: "Delegar a análise; Continuidade: Motoboy Game 2",
      alternativas: ["Priorizar estabilidade técnica"],
      justificativa: "Continuidade: Motoboy Game 2 não resolve o conflito."
    },
    {
      pedidoDecisao: true,
      lacunas: ["Continuidade: Motoboy Game 2"],
      analise: "Conflito Eng/Fin/Com com critérios no texto."
    }
  );
  assert.notEqual(out.estado, "delegar");
  assert.doesNotMatch(out.recomendacao, /Delegar a análise/i);
  assert.match(out.recomendacao, /Decisão|escolha|Priorizar estabilidade/i);
  // Continuidade não vira o critério de fecho por si
  assert.doesNotMatch(
    out.recomendacao,
    /^Continuidade: Motoboy Game 2$/i
  );
});

test("T6 — prosa/fecho sem Delego; pedido decisão não vira aprovar automático", () => {
  const semSinalAprovar = aplicarPoliticaDecisaoSobConflito(
    {
      estado: "delegar",
      recomendacao: "Delegar a análise a especialistas",
      alternativas: ["Opção A", "Opção B"],
      justificativa: "Conflito"
    },
    { pedidoDecisao: true, lacunas: [] }
  );
  assert.equal(semSinalAprovar.estado, "monitorar");
  assert.notEqual(semSinalAprovar.estado, "aprovar");
  assert.doesNotMatch(semSinalAprovar.recomendacao, /Delego|delegar a análise/i);

  const comAprovar = aplicarPoliticaDecisaoSobConflito(
    {
      estado: "delegar",
      recomendacao: "Aprovar priorizar estabilidade apesar do conflito",
      alternativas: ["Priorizar estabilidade técnica"],
      justificativa: "Risco técnico domina"
    },
    { pedidoDecisao: true }
  );
  assert.equal(comAprovar.estado, "aprovar");
});

test("integração: solicitar_dados sem facto bloqueante sob pedido decisão → fecho", async () => {
  const pub = criarPublicadorFilaMemoria();
  const mapa = mapaLlmFluxoFeliz({
    "4_analise": { analise: "Conflito Eng vs Fin vs Com com dados no pedido." },
    "6_decisao": {
      estado: "solicitar_dados",
      recomendacao: "Precisamos analisar mais o conflito entre áreas",
      alternativas: ["Priorizar Comercial"],
      justificativa: "Há conflito."
    }
  });
  const out = await executarRotaDeliberativa(
    {
      instrucao: MSG_CONFLITO_DECIDE,
      intencao: {
        id: "deliberar_objetivo",
        capacidade: "ia",
        classe: "conversa_projeto"
      }
    },
    {
      chamarLlm: criarChamarLlmMock(mapa),
      publicarJob: pub.publicarJob.bind(pub)
    }
  );
  assert.equal(out.ok, true);
  assert.notEqual(out.dados?.parecer?.decisaoExecutiva?.estado, "solicitar_dados");
  assert.notEqual(out.dados?.parecer?.decisaoExecutiva?.estado, "delegar");
  assert.doesNotMatch(out.mensagem, /Delego a execução|precisamos analisar mais/i);
});
