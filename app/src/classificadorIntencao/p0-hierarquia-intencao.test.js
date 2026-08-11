/**
 * P0 — Hierarquia CONSULTA → ANÁLISE → DECISÃO → AUTORIZAÇÃO → EXECUÇÃO
 * Consulta/análise nunca criam Job; «não execute» bloqueia antes do Motor.
 */

import assert from "node:assert/strict";
import { test, beforeEach } from "node:test";
import {
  classificar,
  ehProibicaoExecucaoExplicita,
  ehConsultaEstadoOperacional,
  ehPedidoAnaliseOuRecomendacao,
  ehComandoExecucaoExplicito,
  temVerboExecucao,
  normalizarTexto
} from "./regras.js";
import { executiveEngine } from "../executiveEngine/index.js";
import { criarPublicadorFilaMemoria } from "../motorExecucao/ponteParecerJob.js";
import { criarStoreContextoGate } from "../continuidadeGate/contexto.js";
import { resetStoreContinuidadePadrao } from "../continuidadeGate/integracaoConversa.js";
import { resetEstadoTopicosSessao } from "./topicosSessao.js";
import { resetEstadoObjectivoSessao } from "./objectivoSessao.js";
import {
  ehOrdemExecucaoOperacional,
  reiniciarAutoridadeDelegadaParaTestes
} from "../autoridadeDelegada/autoridadeDelegada.js";

beforeEach(() => {
  resetStoreContinuidadePadrao();
  resetEstadoTopicosSessao();
  resetEstadoObjectivoSessao();
  reiniciarAutoridadeDelegadaParaTestes();
  executiveEngine.reiniciarAcompanhamentoParaTestes();
});

const BUG_MSG =
  "Qual é o Gate que está pendente neste momento?\nNão execute nada. Apenas responda com o ID do Gate/Job e o assunto associado.";

async function abrirGateG2(store, fila, registro) {
  const r = await executiveEngine.executar("Resolva os bugs.", {
    storeContinuidade: store,
    publicarJob: fila.publicarJob.bind(fila),
    registro
  });
  assert.equal(r.dados?.motor?.aguardandoGate, true);
  assert.equal(store.temGatePendente(), true);
  return r;
}

test("P0-unit: proibição explícita e negação de verbo", () => {
  const t = normalizarTexto(BUG_MSG);
  assert.equal(ehProibicaoExecucaoExplicita(t), true);
  assert.equal(ehConsultaEstadoOperacional(t), true);
  assert.equal(ehComandoExecucaoExplicito(t), false);
  assert.equal(temVerboExecucao(t), false);
  assert.equal(ehOrdemExecucaoOperacional(BUG_MSG), false);
});

test("T1 — Consulta simples: Qual é o Gate pendente? → sem Job", async () => {
  const texto = "Qual é o Gate pendente?";
  const s = classificar(texto);
  assert.notEqual(s.classe, "trabalho_executivo", texto);
  assert.equal(s.permiteJob, false, texto);

  const fila = criarPublicadorFilaMemoria();
  const out = await executiveEngine.executar(texto, {
    publicarJob: fila.publicarJob.bind(fila)
  });
  assert.notEqual(out.modo, "motor_execucao");
  assert.equal(fila.jobs.length, 0);
  assert.equal(out.dados?.motor?.publicado, undefined);
});

test("T2 — Consulta com bloqueio explícito (bug real) → sem Job", async () => {
  const s = classificar(BUG_MSG);
  assert.notEqual(s.classe, "trabalho_executivo");
  assert.equal(s.permiteJob, false);
  assert.equal(s.destino, "capacidade_operacional");

  const fila = criarPublicadorFilaMemoria();
  const out = await executiveEngine.executar(BUG_MSG, {
    publicarJob: fila.publicarJob.bind(fila)
  });
  assert.notEqual(out.modo, "motor_execucao");
  assert.equal(fila.jobs.length, 0);
  assert.equal(out.dados?.bloqueioP0, undefined);
});

test("T3 — Consulta de Job → sem Job", async () => {
  const texto = "Qual é o estado do JOB-000063?";
  const s = classificar(texto);
  assert.equal(s.permiteJob, false);
  assert.notEqual(s.classe, "trabalho_executivo");

  const fila = criarPublicadorFilaMemoria();
  const out = await executiveEngine.executar(texto, {
    publicarJob: fila.publicarJob.bind(fila)
  });
  assert.equal(fila.jobs.length, 0);
  assert.notEqual(out.modo, "motor_execucao");
});

test("T4 — Análise → sem Job", async () => {
  const texto = "Analise a proposta do bairro.";
  assert.equal(ehPedidoAnaliseOuRecomendacao(normalizarTexto(texto)), true);
  const s = classificar(texto);
  assert.equal(s.classe, "conversa_projeto");
  assert.equal(s.permiteJob, false);

  const fila = criarPublicadorFilaMemoria();
  const out = await executiveEngine.executar(texto, {
    publicarJob: fila.publicarJob.bind(fila)
  });
  assert.equal(fila.jobs.length, 0);
  assert.notEqual(out.modo, "motor_execucao");
});

test("T5 — Recomendação → sem Job", async () => {
  const texto = "Você recomenda aprovar a expansão?";
  const s = classificar(texto);
  assert.equal(s.classe, "conversa_projeto");
  assert.equal(s.permiteJob, false);

  const fila = criarPublicadorFilaMemoria();
  const out = await executiveEngine.executar(texto, {
    publicarJob: fila.publicarJob.bind(fila)
  });
  assert.equal(fila.jobs.length, 0);
  assert.notEqual(out.modo, "motor_execucao");
});

test("T6 — Mudança de prioridade → sem execução automática", async () => {
  const texto = "Mude a prioridade para expansão do mundo.";
  const s = classificar(texto);
  assert.notEqual(s.classe, "trabalho_executivo");
  assert.equal(s.permiteJob, false);

  const fila = criarPublicadorFilaMemoria();
  const out = await executiveEngine.executar(texto, {
    publicarJob: fila.publicarJob.bind(fila)
  });
  assert.equal(fila.jobs.length, 0);
  assert.notEqual(out.modo, "motor_execucao");
});

test("T7 — Comando explícito → fluxo de execução (Gate/Job)", async () => {
  const texto = "Implemente a expansão do bairro.";
  assert.equal(ehComandoExecucaoExplicito(normalizarTexto(texto)), true);
  const s = classificar(texto);
  assert.equal(s.classe, "trabalho_executivo");
  assert.equal(s.permiteJob, true);

  const fila = criarPublicadorFilaMemoria();
  const out = await executiveEngine.executar(texto, {
    publicarJob: fila.publicarJob.bind(fila),
    decisaoAprovacao: null
  });
  assert.equal(out.modo, "motor_execucao");
  assert.ok(
    out.dados?.motor?.aguardandoGate === true ||
      out.dados?.motor?.publicado === true ||
      fila.jobs.length >= 1
  );
});

test("T8 — Gate pendente + consulta → resposta, sem Job novo", async () => {
  const store = criarStoreContextoGate();
  const fila = criarPublicadorFilaMemoria();
  await abrirGateG2(store, fila, new Map());
  const jobsAposGate = fila.jobs.length;

  const out = await executiveEngine.executar("Qual é o estado atual?", {
    storeContinuidade: store,
    publicarJob: fila.publicarJob.bind(fila)
  });

  assert.notEqual(out.modo, "continuidade_gate_clarificacao");
  assert.notEqual(out.modo, "motor_execucao");
  assert.equal(store.temGatePendente(), true);
  assert.equal(fila.jobs.length, jobsAposGate);
});

test("T9 — Gate pendente + análise → análise, sem execução", async () => {
  const store = criarStoreContextoGate();
  const fila = criarPublicadorFilaMemoria();
  await abrirGateG2(store, fila, new Map());
  const jobsAposGate = fila.jobs.length;

  const out = await executiveEngine.executar(
    "Analise novamente essa proposta.",
    {
      storeContinuidade: store,
      publicarJob: fila.publicarJob.bind(fila)
    }
  );

  assert.notEqual(out.modo, "motor_execucao");
  assert.notEqual(out.dados?.decisao, "aprovado");
  assert.equal(store.temGatePendente(), true);
  assert.equal(fila.jobs.length, jobsAposGate);
});

test("T10 — Gate pendente + Pode executar → autorização", async () => {
  const store = criarStoreContextoGate();
  const fila = criarPublicadorFilaMemoria();
  const registro = new Map();
  await abrirGateG2(store, fila, registro);

  const out = await executiveEngine.executar("Pode executar.", {
    storeContinuidade: store,
    publicarJob: fila.publicarJob.bind(fila),
    registro
  });

  assert.equal(out.dados?.decisao, "aprovado");
  assert.ok(out.dados?.job?.id);
  assert.equal(fila.jobs.length, 1);
  assert.equal(store.temGatePendente(), false);
});

test("T11 — Bloqueio explícito não criar Job → zero Jobs", async () => {
  const texto = "Não crie Job. Apenas me diga o que está pendente.";
  const s = classificar(texto);
  assert.equal(s.permiteJob, false);
  assert.notEqual(s.classe, "trabalho_executivo");

  const fila = criarPublicadorFilaMemoria();
  const out = await executiveEngine.executar(texto, {
    publicarJob: fila.publicarJob.bind(fila)
  });
  assert.equal(fila.jobs.length, 0);
  assert.notEqual(out.modo, "motor_execucao");
});

test("P0-regressão: Gate pendente + mensagem do bug → zero Jobs novos", async () => {
  const store = criarStoreContextoGate();
  const fila = criarPublicadorFilaMemoria();
  await abrirGateG2(store, fila, new Map());
  const jobsAposGate = fila.jobs.length;

  const out = await executiveEngine.executar(BUG_MSG, {
    storeContinuidade: store,
    publicarJob: fila.publicarJob.bind(fila)
  });

  assert.notEqual(out.modo, "motor_execucao");
  assert.notEqual(out.dados?.decisao, "aprovado");
  assert.equal(store.temGatePendente(), true);
  assert.equal(fila.jobs.length, jobsAposGate);
});
