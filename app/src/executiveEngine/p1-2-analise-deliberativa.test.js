/**
 * P1-2 — C2 análise deliberativa efetiva (não delegação fictícia).
 */

import assert from "node:assert/strict";
import { test, beforeEach } from "node:test";
import {
  aplicarPoliticaAnaliseDeliberativa,
  detectarPedidoAnaliseDeliberativa,
  ehDelegacaoFicticiaAnalise,
  montarProsaAnaliseDeliberativa
} from "../mre/politicaAnaliseDeliberativa.js";
import { reiniciarStoresPosDeliberacaoParaTestes } from "../mre/integracaoNucleo.js";
import { executarRotaDeliberativa } from "../mre/integracaoNucleo.js";
import {
  criarChamarLlmMock,
  mapaLlmFluxoFeliz
} from "../mre/pipeline/llmMock.js";
import { criarPublicadorFilaMemoria } from "../motorExecucao/ponteParecerJob.js";
import { executiveEngine } from "../executiveEngine/index.js";
import { classificar } from "../classificadorIntencao/regras.js";
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

const MSG_ORIGINAL = `Analise a proposta de criar, do outro lado da rodovia, um bairro popular com casas e pequenos prédios residenciais.

Não crie Job e não execute nada.

Avalie a proposta segundo o Manifesto do MG2 e dê uma recomendação executiva.

Não quero que você repita o Manifesto. Quero saber quais princípios da visão do MG2 influenciam sua recomendação e se você aprovaria, modificaria ou não priorizaria essa proposta.`;

test("P1-2 unit: detectar análise e delegação fictícia", () => {
  assert.equal(detectarPedidoAnaliseDeliberativa(MSG_ORIGINAL), true);
  assert.equal(
    ehDelegacaoFicticiaAnalise(
      "delegar",
      "Delegar a análise a uma equipe especializada considerando a urgência"
    ),
    true
  );
  const remapped = aplicarPoliticaAnaliseDeliberativa(
    {
      estado: "delegar",
      recomendacao:
        "Delegar a análise da proposta a uma equipe especializada",
      alternativas: [],
      justificativa: "Falta informação no Acervo."
    },
    { pedidoAnalise: true }
  );
  assert.notEqual(remapped.estado, "delegar");
  assert.doesNotMatch(remapped.recomendacao, /Delegar a análise|garantir uma análise/i);
  assert.match(remapped.recomendacao, /posição executiva|análise acima|inexistentes/i);
});

test("P1-2 unit: prosa de análise lidera com campo analise", () => {
  const prosa = montarProsaAnaliseDeliberativa({
    analise:
      "A proposta alinha-se parcialmente à visão de cidade vivida, mas compete com gates abertos.",
    principiosAplicados: ["Priorizar uso diário MG2 (ADR-015)"],
    decisaoExecutiva: {
      estado: "monitorar",
      recomendacao: "Modificar e não priorizar nesta onda",
      justificativa: "Princípio ADR-015; risco de dispersão."
    },
    lacunas: []
  });
  assert.match(prosa, /cidade vivida|gates abertos/i);
  assert.match(prosa, /Recomendação:/i);
  assert.match(prosa, /ADR-015|Princípios/i);
  assert.doesNotMatch(prosa, /Delego a execução|equipe especializ/i);
});

test("T1 — Análise simples → C2 + análise (mock MRE)", async () => {
  const pub = criarPublicadorFilaMemoria();
  const mapa = mapaLlmFluxoFeliz({
    "4_analise": {
      analise:
        "Proposta de bairro popular: alinhamento parcial à visão; falta lastro de prioridade operacional."
    },
    "6_decisao": {
      estado: "monitorar",
      recomendacao: "Modificar o âmbito e não priorizar agora",
      alternativas: ["Aprovar MVP mínimo"],
      justificativa: "Princípio uso diário MG2 (ADR-015); risco medio de dispersão."
    }
  });
  const out = await executarRotaDeliberativa(
    {
      instrucao: "Analise a proposta do bairro popular.",
      intencao: { id: "deliberar_objetivo", capacidade: "ia", classe: "conversa_projeto" }
    },
    {
      chamarLlm: criarChamarLlmMock(mapa),
      publicarJob: pub.publicarJob.bind(pub)
    }
  );
  assert.equal(out.ok, true);
  assert.match(out.mensagem, /alinhamento parcial|bairro|visão|Recomendação/i);
  assert.doesNotMatch(out.mensagem, /equipe especializ|Delego a execução/i);
  assert.equal(pub.jobs.length, 0);
});

test("T2 — Recomendação → C2 + recomendação", async () => {
  const pub = criarPublicadorFilaMemoria();
  const mapa = mapaLlmFluxoFeliz({
    "4_analise": {
      analise: "Avaliação: funcionalidade útil mas fora da onda actual."
    },
    "6_decisao": {
      estado: "rejeitar",
      recomendacao: "Não priorizar nesta onda",
      alternativas: ["Adiar para após M0"],
      justificativa: "Princípio ADR-015; oportunidade baixa agora."
    }
  });
  const out = await executarRotaDeliberativa(
    {
      instrucao: "Você recomenda aprovar essa proposta?",
      intencao: { id: "deliberar_objetivo", capacidade: "ia" }
    },
    {
      chamarLlm: criarChamarLlmMock(mapa),
      publicarJob: pub.publicarJob.bind(pub)
    }
  );
  assert.equal(out.ok, true);
  assert.match(out.mensagem, /Recomendação|Não priorizar|Avaliação/i);
  assert.equal(pub.jobs.length, 0);
});

test("T3 — Análise + não execute → zero Jobs", async () => {
  const pub = criarPublicadorFilaMemoria();
  const mapa = mapaLlmFluxoFeliz({
    "4_analise": { analise: "Análise da proposta com bloqueio de execução." },
    "6_decisao": {
      estado: "delegar",
      recomendacao:
        "Delegar a análise da proposta a uma equipe especializada",
      alternativas: [],
      justificativa: "Falta de informações no Acervo Oficial."
    }
  });
  const out = await executarRotaDeliberativa(
    {
      instrucao:
        "Analise a proposta. Não crie Job e não execute nada.",
      intencao: { id: "deliberar_objetivo", capacidade: "ia" }
    },
    {
      chamarLlm: criarChamarLlmMock(mapa),
      publicarJob: pub.publicarJob.bind(pub)
    }
  );
  assert.equal(out.ok, true);
  assert.equal(pub.jobs.length, 0);
  assert.notEqual(
    out.dados?.parecer?.decisaoExecutiva?.estado,
    "delegar"
  );
  assert.doesNotMatch(out.mensagem, /equipe especializ/i);
});

test("T4 — Análise segundo Manifesto (mock) → análise + princípios", async () => {
  const pub = criarPublicadorFilaMemoria();
  const mapa = mapaLlmFluxoFeliz({
    "4_analise": {
      analise:
        "Segundo a visão disponível: o bairro reforça cidade vivida, mas a rodovia e gates abertos pesam contra priorizar agora."
    },
    "3_principios": {
      principiosAplicados: ["Priorizar uso diário no MG2 (ADR-015)"]
    },
    "6_decisao": {
      estado: "monitorar",
      recomendacao: "Modificar e não priorizar nesta onda",
      alternativas: [],
      justificativa:
        "Princípio Priorizar uso diário no MG2 (ADR-015); risco medio aceite."
    }
  });
  const out = await executarRotaDeliberativa(
    {
      instrucao: "Avalie essa funcionalidade segundo o Manifesto.",
      intencao: { id: "deliberar_objetivo", capacidade: "ia" }
    },
    {
      chamarLlm: criarChamarLlmMock(mapa),
      publicarJob: pub.publicarJob.bind(pub)
    }
  );
  assert.match(out.mensagem, /cidade vivida|gates|Recomendação|ADR-015|Princípios/i);
  assert.equal(pub.jobs.length, 0);
});

test("T5 — Consulta Job → C4 sem alteração", () => {
  const s = classificar("Qual é o estado do JOB-000068?");
  assert.equal(s.classe, "comando_operacional");
  assert.equal(s.destino, "capacidade_operacional");
});

test("T6 — Comando de execução → C3 sem alteração", () => {
  const s = classificar("Implemente o botão pausar no MG2 agora.");
  assert.equal(s.classe, "trabalho_executivo");
  assert.equal(s.permiteJob, true);
});

test("T7 — Motor deliberativo indisponível → mensagem explícita, sem falsa delegação", async () => {
  const pub = criarPublicadorFilaMemoria();
  const out = await executiveEngine.executar(MSG_ORIGINAL, {
    publicarJob: pub.publicarJob.bind(pub)
  });
  assert.equal(classificar(MSG_ORIGINAL).classe, "conversa_projeto");
  assert.equal(pub.jobs.length, 0);
  assert.doesNotMatch(
    out.mensagem,
    /Delegar a análise|Delego a execução|garantir uma análise fundamentada/i
  );
  // Sem chave LLM: incapacidade explícita OU análise real se LLM estiver configurado no ambiente
  if (/indisponível|não consigo concluir a análise|chave não configurada/i.test(out.mensagem)) {
    assert.match(out.mensagem, /análise deliberativa|indisponível|não invento/i);
  } else {
    assert.match(out.mensagem, /Recomendação|análise|proposta|bairro/i);
  }
});

test("P1-2 aceite: mensagem original nunca vira Job nem delegação fictícia", async () => {
  const pub = criarPublicadorFilaMemoria();
  const mapa = mapaLlmFluxoFeliz({
    "4_analise": {
      analise:
        "Proposta de bairro popular: conceito alinhável à visão, execução integral fora da prioridade actual."
    },
    "6_decisao": {
      estado: "delegar",
      recomendacao:
        "Delegar a análise da proposta de criação do bairro popular a uma equipe especializada, considerando a urgência e a necessidade de informações adicionais",
      alternativas: [],
      justificativa: "Falta de informações no Acervo Oficial."
    }
  });
  const out = await executarRotaDeliberativa(
    {
      instrucao: MSG_ORIGINAL,
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
  assert.equal(pub.jobs.length, 0);
  assert.match(out.mensagem, /bairro|visão|Recomendação|alinh/i);
  assert.doesNotMatch(
    out.mensagem,
    /equipe especializ|Delegar a análise da proposta de criação/i
  );
  assert.notEqual(out.dados?.parecer?.decisaoExecutiva?.estado, "delegar");
});

test("P1-2: C2 sem publicador injectado não faz fallback para fila oficial", async () => {
  const mapa = mapaLlmFluxoFeliz({
    "4_analise": { analise: "Análise sem publicador." },
    "6_decisao": {
      estado: "delegar",
      recomendacao: "Delegar outdoor à fila de especialistas",
      alternativas: [],
      justificativa: "Princípio ADR-015; risco medio."
    }
  });
  // Sem publicarJob — antes criava Job via publicarJobFila; agora não
  const out = await executarRotaDeliberativa(
    {
      instrucao: "Analise a proposta do outdoor.",
      intencao: { id: "deliberar", capacidade: "ia" }
    },
    { chamarLlm: criarChamarLlmMock(mapa) }
  );
  assert.equal(out.ok, true);
  assert.equal(
    out.dados?.efeitosPosDeliberacao?.fila?.despachado,
    false
  );
  assert.match(
    String(out.dados?.efeitosPosDeliberacao?.fila?.motivo || ""),
    /publicador_ausente|nao_avaliado|skip/i
  );
});
