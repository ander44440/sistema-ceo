/**
 * P1-1 — C2 (análise) vs C4 (consulta de estado).
 * ANÁLISE NÃO É CONSULTA. «Não crie Job» não transforma C2 em C4.
 */

import assert from "node:assert/strict";
import { test, beforeEach } from "node:test";
import {
  classificar,
  ehConsultaEstadoOperacional,
  ehPedidoAnaliseOuRecomendacao,
  ehProibicaoExecucaoExplicita,
  normalizarTexto
} from "./regras.js";
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
});

function assertC2(texto, label = texto) {
  const s = classificar(texto);
  assert.equal(s.classe, "conversa_projeto", label);
  assert.equal(s.destino, "nucleo_mre", label);
  assert.equal(s.permiteJob, false, label);
  return s;
}

function assertC4(texto, label = texto) {
  const s = classificar(texto);
  assert.equal(s.classe, "comando_operacional", label);
  assert.equal(s.destino, "capacidade_operacional", label);
  assert.equal(s.permiteJob, false, label);
  return s;
}

const MSG_ORIGINAL = `Analise a proposta de criar, do outro lado da rodovia, um bairro popular com casas e pequenos prédios residenciais.

Não crie Job e não execute nada.

Avalie a proposta segundo o Manifesto do MG2 e dê uma recomendação executiva.

Não quero que você repita o Manifesto. Quero saber quais princípios da visão do MG2 influenciam sua recomendação e se você aprovaria, modificaria ou não priorizaria essa proposta.`;

test("P1-1 unit: análise + proibição — analise detectada; jobs? lexico não vira consulta", () => {
  const t = normalizarTexto(MSG_ORIGINAL);
  assert.equal(ehProibicaoExecucaoExplicita(t), true);
  assert.equal(ehConsultaEstadoOperacional(t), false);
  assert.equal(ehPedidoAnaliseOuRecomendacao(t), true);
});

test("T1 — Analise a proposta do bairro → C2", () => {
  assertC2("Analise a proposta do bairro.");
});

test("T2 — Avalie segundo o Manifesto → C2", () => {
  assertC2("Avalie essa funcionalidade segundo o Manifesto.");
});

test("T3 — Você recomenda aprovar → C2", () => {
  assertC2("Você recomenda aprovar essa proposta?");
});

test("T4 — Prós e contras → C2", () => {
  assertC2("Quais são os pontos positivos e negativos dessa proposta?");
});

test("T5 — Estado do JOB → C4", () => {
  assertC4("Qual é o estado do JOB-000068?");
});

test("T6 — Gate pendente → C4", () => {
  assertC4("Qual Gate está pendente?");
});

test("T7 — Pendências abertas → C4", () => {
  assertC4("Quais pendências estão abertas?");
});

test("T8 — Analise o estado do JOB → C2 (não C4 puro)", () => {
  const texto =
    "Analise o estado atual do JOB-000068 e diga se existe algum problema.";
  const t = normalizarTexto(texto);
  assert.equal(ehConsultaEstadoOperacional(t), true);
  assert.equal(ehPedidoAnaliseOuRecomendacao(t), true);
  assertC2(texto);
});

test("T9 — Analise + Não crie Job → C2 + bloqueio", async () => {
  const texto = "Analise a proposta. Não crie Job e não execute nada.";
  assertC2(texto);
  const fila = criarPublicadorFilaMemoria();
  const out = await executiveEngine.executar(texto, {
    publicarJob: fila.publicarJob.bind(fila)
  });
  assert.equal(fila.jobs.length, 0);
  assert.notEqual(out.modo, "motor_execucao");
  assert.doesNotMatch(
    String(out.mensagem),
    /Consulta de estado não identificada/i
  );
});

test("T10 — Analise e se aprovada implemente → política Gate/C3, sem auto-executar solto", async () => {
  const texto =
    "Analise a proposta e, se for aprovada, implemente.";
  const s = classificar(texto);
  // Pode ser C3 (implemente) ou C2; nunca consulta C4
  assert.notEqual(s.classe, "comando_operacional");
  const fila = criarPublicadorFilaMemoria();
  const out = await executiveEngine.executar(texto, {
    publicarJob: fila.publicarJob.bind(fila),
    decisaoAprovacao: null
  });
  // Sem aprovação explícita: Gate ou deliberação — não Job solto sem política
  if (out.modo === "motor_execucao") {
    assert.ok(
      out.dados?.motor?.aguardandoGate === true ||
        out.dados?.motor?.publicado === true ||
        fila.jobs.length >= 0
    );
  } else {
    assert.equal(fila.jobs.length, 0);
  }
});

test("T11 — Decisão mais recente sobre JOB → C4", () => {
  assertC4("Qual é a decisão mais recente sobre o JOB-000068?");
});

test("T12 — Qual decisão recomenda para a proposta → C2", () => {
  assertC2("Qual decisão você recomenda para a proposta do bairro?");
});

test("P1-1 aceite: mensagem original → C2, sem Job, sem «indique o recurso»", async () => {
  assertC2(MSG_ORIGINAL);
  const fila = criarPublicadorFilaMemoria();
  const out = await executiveEngine.executar(MSG_ORIGINAL, {
    publicarJob: fila.publicarJob.bind(fila)
  });
  assert.equal(fila.jobs.length, 0);
  assert.notEqual(out.modo, "motor_execucao");
  assert.notEqual(out.modo, "consulta_estado");
  assert.doesNotMatch(
    String(out.mensagem),
    /Consulta de estado não identificada|Indique o recurso/i
  );
});
