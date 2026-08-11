/**
 * Correção 3 — solicitação operacional concreta → C3 (não C1 por falso positivo).
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  classificar,
  ehIntencaoExecutivaE21,
  normalizarTexto,
  ehReferenciaExplicitaJobId,
  ehAutorizacaoExplicitaCriarJob
} from "./regras.js";
import { pontuarLexico, LEXICO_C1 } from "./lexicon.js";
import {
  jobPertenceAMissaoActiva,
  filtrarJobsPorMissaoActiva
} from "../motorExecucao/acompanhamentoJob.js";

const MSG_ALFA4 = `Quero iniciar uma nova missão independente do PROJETO TESTE ALFA.

Objetivo:
criar o arquivo executive/queue/projeto-teste-alfa-4.txt

Conteúdo exato:
PROJETO TESTE ALFA 4
NOVA MISSÃO INDEPENDENTE

Execute essa missão e acompanhe até a conclusão.`;

test("A: mensagem ALFA-4 → C3 trabalho_executivo, permiteJob", () => {
  const s = classificar(MSG_ALFA4);
  assert.notEqual(s.classe, "conhecimento_geral");
  assert.equal(s.classe, "trabalho_executivo");
  assert.equal(s.destino, "motor_execucao");
  assert.equal(s.permiteJob, true);
  assert.equal(ehIntencaoExecutivaE21(normalizarTexto(MSG_ALFA4)), true);
});

test("B: Execute essa missão + tarefa concreta → C3", () => {
  const t =
    "Execute essa missão e acompanhe até a conclusão: criar o ficheiro dados.txt com a linha OK.";
  const s = classificar(t);
  assert.equal(s.classe, "trabalho_executivo");
  assert.equal(s.permiteJob, true);
});

test("C: Crie o arquivo X com conteúdo Y → C3", () => {
  const t =
    "Crie o arquivo executive/queue/demo.txt com o conteúdo HELLO WORLD.";
  const s = classificar(t);
  assert.equal(s.classe, "trabalho_executivo");
  assert.equal(s.destino, "motor_execucao");
  assert.equal(s.permiteJob, true);
});

test("D: Quanto é 25 x 4? → C1 aritmética", () => {
  const s = classificar("Quanto é 25 x 4?");
  assert.equal(s.classe, "conhecimento_geral");
  assert.equal(s.permiteJob, false);
  const hits = pontuarLexico(normalizarTexto("Quanto é 25 x 4?"), LEXICO_C1);
  assert.ok(hits.hits.includes("aritmetica"));
});

test("E: Qual é o resultado de 12 * 8? → C1", () => {
  const s = classificar("Qual é o resultado de 12 * 8?");
  assert.equal(s.classe, "conhecimento_geral");
  assert.equal(s.permiteJob, false);
});

test("F: exato / arquivo / ALFA 4 sem falso positivo aritmético", () => {
  const amostras = [
    "O conteúdo exato é PROJETO TESTE ALFA 4.",
    "criar o arquivo na pasta do projeto",
    "ALFA 4 é o nome da fatia"
  ];
  for (const texto of amostras) {
    const hits = pontuarLexico(normalizarTexto(texto), LEXICO_C1);
    assert.equal(
      hits.hits.includes("aritmetica"),
      false,
      `falso positivo em: ${texto}`
    );
  }
});

test("G: Correção 1 — Despache o JOB-ID ≠ criar Job", () => {
  const t = normalizarTexto("Despache o JOB-000075");
  assert.equal(ehReferenciaExplicitaJobId(t), true);
  assert.equal(ehAutorizacaoExplicitaCriarJob(t), false);
});

test("H: isolamento missão — órfão MG2 fora de ALFA", () => {
  const MISSAO_ALFA = { id: "prj-teste-alfa", nome: "PROJETO TESTE ALFA" };
  const job070 = { id: "JOB-000070", projeto: null, estado: "needs_correction" };
  const jobAlfa = {
    id: "JOB-000081",
    projeto: "PROJETO TESTE ALFA",
    estado: "completed"
  };
  assert.equal(jobPertenceAMissaoActiva(job070, MISSAO_ALFA, { idsPermitidos: [] }), false);
  assert.equal(jobPertenceAMissaoActiva(jobAlfa, MISSAO_ALFA), true);
  const f = filtrarJobsPorMissaoActiva([job070, jobAlfa], MISSAO_ALFA);
  assert.equal(f.length, 1);
  assert.equal(f[0].id, "JOB-000081");
});

test("informativo: Como criar um arquivo? não é E2.1 C3 por pergunta", () => {
  const s = classificar("Como criar um arquivo de texto no Windows?");
  assert.notEqual(s.classe, "trabalho_executivo");
});
