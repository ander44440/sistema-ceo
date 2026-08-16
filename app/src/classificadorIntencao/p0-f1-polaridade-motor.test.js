/**
 * F1 Motor/Polaridade — recorte sobre baseline 29afde9.
 * Proibição / pergunta informacional não entra no Motor.
 */
import assert from "node:assert/strict";
import { test, beforeEach } from "node:test";
import {
  classificar,
  ehProibicaoExecucaoExplicita,
  ehAutorizacaoExplicitaCriarJob,
  ehIntencaoExecutivaE21,
  temVerboExecucao,
  normalizarTexto,
  classificarEEncaminhar
} from "./index.js";
import { executiveEngine } from "../executiveEngine/index.js";
import { criarPublicadorFilaMemoria } from "../motorExecucao/ponteParecerJob.js";
import { resetStoreContinuidadePadrao } from "../continuidadeGate/integracaoConversa.js";
import { resetEstadoTopicosSessao } from "./topicosSessao.js";
import { resetEstadoObjectivoSessao } from "./objectivoSessao.js";

beforeEach(() => {
  resetStoreContinuidadePadrao();
  resetEstadoTopicosSessao();
  resetEstadoObjectivoSessao();
});

const MSG_ULTIMA_MILHA =
  "CEO, o que você sabe atualmente sobre o projeto ULTIMA MILHA? " +
  "Separe fatos confirmados, informações não confirmadas e o que você não sabe. " +
  "Não pesquise, não execute e não tome decisões.";

const MSG_ANALISE =
  "Analise a proposta. Não crie Job e não execute nada.";

test("F1: «não execute» é proibição; não é E2.1", () => {
  const t = normalizarTexto("Não execute nada. Apenas responda.");
  assert.equal(ehProibicaoExecucaoExplicita(t), true);
  assert.equal(ehIntencaoExecutivaE21(t), false);
  assert.equal(temVerboExecucao(t), false);
});

test("F1: «crie Jobs» dentro de proibição não autoriza Job", () => {
  const t = normalizarTexto(
    "Não quero que você execute nenhuma ação externa, crie Jobs ou altere qualquer coisa. Não execute nada."
  );
  assert.equal(ehAutorizacaoExplicitaCriarJob(t), false);
  assert.equal(ehProibicaoExecucaoExplicita(t), true);
});

test("F1: Última Milha informacional → C2, sem Job", async () => {
  const s = classificar(MSG_ULTIMA_MILHA);
  assert.notEqual(s.classe, "trabalho_executivo");
  assert.equal(s.permiteJob, false);
  assert.equal(classificarEEncaminhar(MSG_ULTIMA_MILHA).destino, "nucleo_mre");

  const fila = criarPublicadorFilaMemoria();
  const out = await executiveEngine.executar(MSG_ULTIMA_MILHA, {
    publicarJob: fila.publicarJob.bind(fila)
  });
  assert.equal(fila.jobs.length, 0);
  assert.notEqual(out.modo, "motor_execucao");
  assert.equal(out.dados?.motor?.publicado, undefined);
});

test("F1: análise + não execute → C2, 0 Jobs", async () => {
  const s = classificar(MSG_ANALISE);
  assert.equal(s.classe, "conversa_projeto");
  assert.equal(s.destino, "nucleo_mre");
  const fila = criarPublicadorFilaMemoria();
  const out = await executiveEngine.executar(MSG_ANALISE, {
    publicarJob: fila.publicarJob.bind(fila)
  });
  assert.equal(fila.jobs.length, 0);
  assert.notEqual(out.modo, "motor_execucao");
});

test("F1: incidente «não quero que você execute nada» → C2, 0 Jobs", async () => {
  const msg = "Não quero que você execute nada.";
  const t = normalizarTexto(msg);
  assert.equal(ehProibicaoExecucaoExplicita(t), true);
  assert.equal(ehIntencaoExecutivaE21(t), false);
  const s = classificar(msg);
  assert.notEqual(s.classe, "trabalho_executivo");
  assert.equal(s.permiteJob, false);
  assert.equal(classificarEEncaminhar(msg).destino, "nucleo_mre");
  const fila = criarPublicadorFilaMemoria();
  const out = await executiveEngine.executar(msg, {
    publicarJob: fila.publicarJob.bind(fila)
  });
  assert.equal(fila.jobs.length, 0);
  assert.notEqual(out.modo, "motor_execucao");
});

test("F1: comando explícito continua C3", async () => {
  const s = classificar("Implemente o botão agora.");
  assert.equal(s.classe, "trabalho_executivo");
  assert.equal(s.destino, "motor_execucao");
  const fila = criarPublicadorFilaMemoria();
  const out = await executiveEngine.executar("Implemente o botão agora.", {
    publicarJob: fila.publicarJob.bind(fila)
  });
  assert.equal(out.modo, "motor_execucao");
  assert.equal(s.permiteJob, true);
});
