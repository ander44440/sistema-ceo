/**
 * P0 — GATE_PENDING ≠ CONVERSATION_LOCK
 * Gate controla só autorização de execução; não trava conversa/análise.
 */

import assert from "node:assert/strict";
import { test, beforeEach } from "node:test";
import { executiveEngine } from "../executiveEngine/index.js";
import { criarPublicadorFilaMemoria } from "../motorExecucao/ponteParecerJob.js";
import { criarStoreContextoGate } from "./contexto.js";
import {
  resetStoreContinuidadePadrao,
  decidirInterceptacaoContinuidade
} from "./integracaoConversa.js";
import { reconhecerDecisao } from "./reconhecerDecisao.js";
import { resetEstadoTopicosSessao } from "../classificadorIntencao/topicosSessao.js";
import { resetEstadoObjectivoSessao } from "../classificadorIntencao/objectivoSessao.js";

beforeEach(() => {
  resetStoreContinuidadePadrao();
  resetEstadoTopicosSessao();
  resetEstadoObjectivoSessao();
});

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

test("P0-1: análise com Gate pendente não repete só o pedido de aprovação", async () => {
  const store = criarStoreContextoGate();
  const fila = criarPublicadorFilaMemoria();
  const registro = new Map();
  await abrirGateG2(store, fila, registro);

  assert.equal(
    decidirInterceptacaoContinuidade(
      "Analisa a proposta e dá recomendação executiva",
      store
    ),
    "classificador"
  );

  const out = await executiveEngine.executar(
    "Analisa a proposta e dá recomendação executiva",
    {
      storeContinuidade: store,
      publicarJob: fila.publicarJob.bind(fila),
      registro
    }
  );

  assert.notEqual(out.modo, "continuidade_gate_clarificacao");
  assert.equal(out.dados?.clarificacaoGate, undefined);
  assert.equal(
    /Responda Aprovado, Cancela ou Adiar/i.test(out.mensagem) &&
      out.modo === "continuidade_gate_clarificacao",
    false
  );
  assert.notEqual(out.dados?.decisao, "aprovado");
  assert.equal(store.temGatePendente(), true);
});

test("P0-2: estado actual com Gate pendente processa (sem lock)", async () => {
  const store = criarStoreContextoGate();
  const fila = criarPublicadorFilaMemoria();
  await abrirGateG2(store, fila, new Map());

  const out = await executiveEngine.executar("Qual é o estado atual?", {
    storeContinuidade: store,
    publicarJob: fila.publicarJob.bind(fila)
  });

  assert.notEqual(out.modo, "continuidade_gate_clarificacao");
  assert.equal(store.temGatePendente(), true);
  assert.equal(fila.jobs.length, 0);
});

test("P0-3: encerrar o Gate sem execução → rejeita e sai do pendente", async () => {
  const store = criarStoreContextoGate();
  const fila = criarPublicadorFilaMemoria();
  const registro = new Map();
  await abrirGateG2(store, fila, registro);

  assert.equal(
    reconhecerDecisao("Encerrar o Gate sem execução").decisao,
    "rejeitado"
  );
  assert.equal(
    decidirInterceptacaoContinuidade("Encerrar o Gate sem execução", store),
    "continuidade"
  );

  const out = await executiveEngine.executar("Encerrar o Gate sem execução", {
    storeContinuidade: store,
    publicarJob: fila.publicarJob.bind(fila),
    registro
  });

  assert.equal(out.dados?.decisao, "rejeitado");
  assert.equal(store.temGatePendente(), false);
  assert.equal(fila.jobs.length, 0);
});

test("P0-4: aprovação continua a criar Job (autorização intacta)", async () => {
  const store = criarStoreContextoGate();
  const fila = criarPublicadorFilaMemoria();
  const registro = new Map();
  await abrirGateG2(store, fila, registro);

  const out = await executiveEngine.executar("Aprovado.", {
    storeContinuidade: store,
    publicarJob: fila.publicarJob.bind(fila),
    registro
  });

  assert.equal(out.dados?.decisao, "aprovado");
  assert.ok(out.dados?.job?.id);
  assert.equal(fila.jobs.length, 1);
  assert.equal(store.temGatePendente(), false);
});

test("P0-5: mudança de prioridade com Gate pendente não trava", async () => {
  const store = criarStoreContextoGate();
  const fila = criarPublicadorFilaMemoria();
  await abrirGateG2(store, fila, new Map());

  const out = await executiveEngine.executar(
    "Muda a prioridade: agora o foco é o outdoor",
    {
      storeContinuidade: store,
      publicarJob: fila.publicarJob.bind(fila)
    }
  );

  assert.notEqual(out.modo, "continuidade_gate_clarificacao");
  assert.notEqual(out.modo, "clarificacao_gate_shift");
  assert.notEqual(out.modo, "clarificacao_gate_objectivo");
  assert.equal(store.temGatePendente(), true);
  assert.equal(fila.jobs.length, 0);
});

test("P0-6: consulta Gate + Não execute nada → sem Job (regressão JOB-000066)", async () => {
  const store = criarStoreContextoGate();
  const fila = criarPublicadorFilaMemoria();
  await abrirGateG2(store, fila, new Map());
  const jobsAntes = fila.jobs.length;

  const msg =
    "Qual é o Gate que está pendente neste momento?\nNão execute nada. Apenas responda com o ID do Gate/Job e o assunto associado.";

  const out = await executiveEngine.executar(msg, {
    storeContinuidade: store,
    publicarJob: fila.publicarJob.bind(fila)
  });

  assert.notEqual(out.modo, "motor_execucao");
  assert.notEqual(out.dados?.decisao, "aprovado");
  assert.equal(store.temGatePendente(), true);
  assert.equal(fila.jobs.length, jobsAntes);
});
