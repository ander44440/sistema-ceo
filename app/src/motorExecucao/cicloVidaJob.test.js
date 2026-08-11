/**
 * P0-2 — Ciclo de vida dos Jobs
 * PENDING → DISPATCHED → RUNNING → RESULT → VERIFICATION → COMPLETED
 */

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  marcarDespachado,
  marcarRunning,
  registrarResultadoBruto,
  verificarResultadoJob,
  marcarFalhaExecucao,
  avaliarAusenciaResultado,
  retomarCorrecao,
  processarResultadoComVerificacao,
  resumirCicloVidaJob
} from "./cicloVidaJob.js";
import { validarTransicaoJob } from "./dominio.js";
import { criarPublicadorFilaMemoria } from "./ponteParecerJob.js";
import { iniciarFluxoAposJob } from "./integracaoOrquestrador.js";
import { montarCiclo } from "./dominio.js";
import { classificar } from "../classificadorIntencao/regras.js";
import { mensagemInicioExecucao } from "../classificadorIntencao/integracaoNucleo.js";

function jobBase(overrides = {}) {
  const agora = "2026-08-08T12:00:00.000Z";
  return {
    id: "JOB-TEST-P0-2",
    titulo: "Alterar configuracao do outdoor",
    descricao: "Alterar X no modulo outdoor conforme spec",
    estado: "pending",
    criadoEm: agora,
    iniciadoEm: null,
    despachadoEm: null,
    concluidoEm: null,
    resultado: null,
    historicoCiclo: [
      {
        em: agora,
        de: null,
        para: "pending",
        motivo: "criacao",
        actor: "ceo"
      }
    ],
    ...overrides
  };
}

test("T1 — Criação: Job nasce PENDING", async () => {
  const fila = criarPublicadorFilaMemoria();
  const job = await fila.publicarJob({
    titulo: "Alterar X",
    descricao: "Alterar X"
  });
  assert.equal(job.estado, "pending");
  assert.equal(fila.jobs.length, 1);
});

test("T2 — Handoff: DISPATCHED, não COMPLETED", () => {
  const job = jobBase();
  const ciclo = montarCiclo("c1", "CriacaoDoJob", {
    jobId: job.id,
    estadoJob: "pending",
    requerDespacho: true
  });
  const fluxo = iniciarFluxoAposJob(ciclo, job);
  assert.equal(fluxo.ok, true);
  assert.equal(fluxo.handoff.estadoJob, "dispatched");
  assert.equal(job.estado, "dispatched");
  assert.notEqual(job.estado, "completed");
  const msg = mensagemInicioExecucao({
    publicado: true,
    fluxoIniciado: true,
    job,
    handoff: fluxo.handoff
  });
  assert.match(msg, /dispatched|não concluído|handoff ≠ conclusão/i);
  assert.doesNotMatch(msg, /concluído com sucesso/i);
});

test("T3 — Execução iniciada: RUNNING, não COMPLETED", () => {
  let job = jobBase();
  job = marcarDespachado(job).job;
  const r = marcarRunning(job);
  assert.equal(r.ok, true);
  assert.equal(r.job.estado, "running");
  assert.ok(r.job.iniciadoEm);
  assert.notEqual(r.job.estado, "completed");
});

test("T4 — Execução com sucesso: RESULT antes de COMPLETED", () => {
  let job = jobBase();
  job = marcarDespachado(job).job;
  job = marcarRunning(job).job;
  const r = registrarResultadoBruto(job, {
    status: "sucesso",
    resumo: "Alterado X no modulo outdoor",
    evidencia: "ficheiro config outdoor actualizado"
  });
  assert.equal(r.ok, true);
  assert.equal(r.job.estado, "result");
  assert.notEqual(r.job.estado, "completed");
});

test("T5 — Verificação positiva: COMPLETED", () => {
  let job = jobBase();
  job = marcarDespachado(job).job;
  job = marcarRunning(job).job;
  job = registrarResultadoBruto(job, {
    status: "sucesso",
    resumo: "Alterado configuracao outdoor conforme pedido",
    evidencia: "diff aplicado em outdoor/config"
  }).job;
  const v = verificarResultadoJob(job);
  assert.equal(v.ok, true);
  assert.equal(v.job.estado, "completed");
  assert.equal(v.job.verificacao.ok, true);
});

test("T6 — Verificação negativa: NEEDS_CORRECTION (não COMPLETED)", () => {
  let job = jobBase({
    titulo: "Alterar sistema de pagamento Stripe",
    descricao: "Integrar Stripe checkout completo"
  });
  job = marcarDespachado(job).job;
  job = marcarRunning(job).job;
  // Executor diz sucesso genérico sem atender ao objectivo
  job = registrarResultadoBruto(job, {
    status: "sucesso",
    resumo: "Arquivo alterado.",
    evidencia: "tocou num ficheiro"
  }).job;
  const v = verificarResultadoJob(job);
  assert.equal(v.ok, true);
  assert.notEqual(v.job.estado, "completed");
  assert.ok(
    v.job.estado === "needs_correction" || v.job.estado === "failed",
    v.job.estado
  );
});

test("T7 — Falha de execução: FAILED + motivo", () => {
  let job = jobBase();
  job = marcarDespachado(job).job;
  job = marcarRunning(job).job;
  const f = marcarFalhaExecucao(job, {
    motivo: "build_quebrada",
    etapa: "RUNNING",
    evidencia: "npm test exit 1",
    impacto: "entrega bloqueada",
    podeRetentar: true,
    proximaAcao: "corrigir testes"
  });
  assert.equal(f.ok, true);
  assert.equal(f.job.estado, "failed");
  assert.equal(f.job.falha.motivo, "build_quebrada");
  assert.ok(f.job.falha.etapa);
  assert.ok(f.job.falha.proximaAcao);
});

test("T8 — Resultado ausente: FAILED explícito, nunca COMPLETED", () => {
  let job = jobBase({
    estado: "running",
    iniciadoEm: "2026-08-01T00:00:00.000Z",
    despachadoEm: "2026-08-01T00:00:00.000Z",
    historicoCiclo: []
  });
  // Ensure legal path
  job = jobBase();
  job = marcarDespachado(job).job;
  job = marcarRunning(job).job;
  job = {
    ...job,
    iniciadoEm: "2026-08-01T00:00:00.000Z"
  };
  const r = avaliarAusenciaResultado(job, {
    agora: "2026-08-08T12:00:00.000Z",
    timeoutMs: 1000
  });
  assert.equal(r.aplicavel, true);
  assert.equal(r.ok, true);
  assert.equal(r.job.estado, "failed");
  assert.equal(r.job.falha.motivo, "resultado_ausente_timeout");
  assert.notEqual(r.job.estado, "completed");
});

test("T9 — Recuperação: NEEDS_CORRECTION → RUNNING", () => {
  let job = jobBase({
    titulo: "Implementar botao pausar",
    descricao: "Implementar botao pausar no CEO"
  });
  job = processarResultadoComVerificacao(job, {
    status: "sucesso",
    resumo: "mexi num ficheiro",
    evidencia: "ok"
  }).job;
  assert.equal(job.estado, "needs_correction");
  const retoma = retomarCorrecao(job);
  assert.equal(retoma.ok, true);
  assert.equal(retoma.job.estado, "running");
});

test("T10 — Consulta de estado: não cria Job; classifica como consulta", () => {
  const s = classificar("Qual é o estado do JOB-000063?");
  assert.equal(s.permiteJob, false);
  assert.notEqual(s.classe, "trabalho_executivo");
  const fila = criarPublicadorFilaMemoria();
  assert.equal(fila.jobs.length, 0);
});

test("T11 — Fechamento: COMPLETED persistente e consultável", () => {
  let job = jobBase();
  job = processarResultadoComVerificacao(job, {
    status: "sucesso",
    resumo: "Alterar configuracao do outdoor concluido",
    evidencia: "outdoor config X actualizado"
  }).job;
  assert.equal(job.estado, "completed");
  const resumo = resumirCicloVidaJob(job);
  assert.equal(resumo.ok, true);
  assert.equal(resumo.estado, "completed");
  assert.equal(resumo.terminal, true);
  assert.ok(resumo.verificacao?.ok);
  assert.ok(resumo.resultado);
  // Segunda consulta — mesmo estado
  const deNovo = resumirCicloVidaJob(job);
  assert.equal(deNovo.estado, "completed");
});

test("T12 — Auditoria: histórico reconstrói transições em ordem", () => {
  let job = jobBase();
  job = marcarDespachado(job).job;
  job = marcarRunning(job).job;
  job = registrarResultadoBruto(job, {
    status: "sucesso",
    resumo: "Alterar configuracao do outdoor feito",
    evidencia: "patch aplicado"
  }).job;
  job = verificarResultadoJob(job).job;
  const hist = job.historicoCiclo.map((h) => h.para);
  assert.deepEqual(hist.slice(-4), [
    "dispatched",
    "running",
    "result",
    "completed"
  ]);
  assert.equal(validarTransicaoJob("running", "completed").ok, false);
});

test("P0-2: running→completed directo é ilegal", () => {
  assert.equal(validarTransicaoJob("running", "completed").ok, false);
  assert.equal(validarTransicaoJob("dispatched", "completed").ok, false);
  assert.equal(validarTransicaoJob("pending", "completed").ok, false);
});
