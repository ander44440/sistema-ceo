/**
 * P0 — polaridade de autorização de Job (regressão JOB-000106).
 * «crie Jobs» dentro de proibição ≠ autorização explícita.
 */

import assert from "node:assert/strict";
import { test, beforeEach } from "node:test";
import {
  classificar,
  ehAutorizacaoExplicitaCriarJob,
  ehProibicaoExecucaoExplicita,
  ehIntencaoExecutivaE21,
  normalizarTexto
} from "./regras.js";
import { classificarEEncaminhar } from "./encaminhador.js";
import { executiveEngine } from "../executiveEngine/index.js";
import { criarPublicadorFilaMemoria } from "../motorExecucao/ponteParecerJob.js";
import { resetStoreContinuidadePadrao } from "../continuidadeGate/integracaoConversa.js";
import { resetEstadoTopicosSessao } from "./topicosSessao.js";
import { resetEstadoObjectivoSessao } from "./objectivoSessao.js";
import { reiniciarAutoridadeDelegadaParaTestes } from "../autoridadeDelegada/autoridadeDelegada.js";

beforeEach(() => {
  resetStoreContinuidadePadrao();
  resetEstadoTopicosSessao();
  resetEstadoObjectivoSessao();
  reiniciarAutoridadeDelegadaParaTestes();
  executiveEngine.reiniciarAcompanhamentoParaTestes();
});

const MSG_JOB_000106 = `Não quero que você execute nenhuma ação externa, crie Jobs ou altere qualquer coisa.

Quero apenas uma análise executiva da situação da RotaSul que já está sendo discutida.

Considere os fatos já apresentados sobre:
- atrasos concentrados nas sextas-feiras;
- cliente responsável por aproximadamente 12% do faturamento;
- insatisfação desse cliente;
- ausência de orçamento para aumentar a frota.

Reavalie esse cenário e apresente uma posição executiva clara, explicando o motivo da sua posição.

Não execute nada. Apenas delibere e responda.`;

test("A: cenário JOB-000106 — sem autorização, sem C3, sem Job", async () => {
  const t = normalizarTexto(MSG_JOB_000106);
  assert.equal(ehAutorizacaoExplicitaCriarJob(t), false);
  assert.equal(ehProibicaoExecucaoExplicita(t), true);
  assert.equal(ehIntencaoExecutivaE21(t), false);

  const s = classificar(MSG_JOB_000106);
  assert.notEqual(s.classe, "trabalho_executivo");
  assert.equal(s.permiteJob, false);
  assert.equal(s.destino, "nucleo_mre");

  const fila = criarPublicadorFilaMemoria();
  const out = await executiveEngine.executar(MSG_JOB_000106, {
    publicarJob: fila.publicarJob.bind(fila)
  });
  assert.equal(fila.jobs.length, 0);
  assert.notEqual(out.modo, "motor_execucao");
  assert.notEqual(out.dados?.destino, "motor_execucao");
});

test("B: Não crie Job. → autorização false", () => {
  assert.equal(
    ehAutorizacaoExplicitaCriarJob(normalizarTexto("Não crie Job.")),
    false
  );
});

test("C: Não quero que você crie Jobs. → autorização false", () => {
  assert.equal(
    ehAutorizacaoExplicitaCriarJob(
      normalizarTexto("Não quero que você crie Jobs.")
    ),
    false
  );
});

test("D: Não execute nada. → não autoriza Job", () => {
  const t = normalizarTexto("Não execute nada.");
  assert.equal(ehAutorizacaoExplicitaCriarJob(t), false);
  assert.equal(ehProibicaoExecucaoExplicita(t), true);
});

test("E: Crie um Job para executar X. → autorização true", () => {
  const texto = "Crie um Job para executar X.";
  assert.equal(ehAutorizacaoExplicitaCriarJob(normalizarTexto(texto)), true);
  const s = classificar(texto);
  assert.equal(s.classe, "trabalho_executivo");
  assert.equal(s.destino, "motor_execucao");
});

test("F: Pode criar um Job para executar X. → autorização true", () => {
  assert.equal(
    ehAutorizacaoExplicitaCriarJob(
      normalizarTexto("Pode criar um Job para executar X.")
    ),
    true
  );
});

test("G: Analise + não crie Job → C2, 0 Jobs", async () => {
  const texto = "Analise a proposta. Não crie Job e não execute nada.";
  const s = classificar(texto);
  assert.equal(s.classe, "conversa_projeto");
  assert.equal(s.destino, "nucleo_mre");
  assert.equal(s.permiteJob, false);

  const enc = classificarEEncaminhar(texto);
  assert.equal(enc.destino, "nucleo_mre");

  const fila = criarPublicadorFilaMemoria();
  const out = await executiveEngine.executar(texto, {
    publicarJob: fila.publicarJob.bind(fila)
  });
  assert.equal(fila.jobs.length, 0);
  assert.notEqual(out.modo, "motor_execucao");
});

test("H: autorização positiva E2.1/C3 continua; «Crie Job» + «não execute ainda»", async () => {
  const texto =
    "Crie o Job necessário para implementar o ficheiro x.txt. Não execute ainda a próxima acção.";
  const t = normalizarTexto(texto);
  assert.equal(ehAutorizacaoExplicitaCriarJob(t), true);
  assert.equal(ehIntencaoExecutivaE21(t), true);
  const s = classificar(texto);
  assert.equal(s.classe, "trabalho_executivo");
  assert.equal(s.destino, "motor_execucao");

  const fila = criarPublicadorFilaMemoria();
  const out = await executiveEngine.executar(texto, {
    publicarJob: fila.publicarJob.bind(fila)
  });
  assert.ok(fila.jobs.length >= 1, "Job positivo deve ser criado");
  assert.ok(
    out.modo === "motor_execucao" || out.dados?.motor?.publicado === true
  );
});
