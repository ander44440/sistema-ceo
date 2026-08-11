/**
 * P0-2 integração: Agent → result → verificação CEO → estado final.
 * Não atalha RESULT→COMPLETED: passa por verificarResultadoJob.
 */

import assert from "node:assert/strict";
import { test } from "node:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { criarFilaExecucao } from "../../server/executionQueue.js";
import {
  reconciliarAposAgent,
  verificarJobsEmResult,
  listarAguardandoVerificacao
} from "../../../executive/dispatcher/src/posAgent.js";
import { ciclo } from "../../../executive/dispatcher/src/ciclo.js";

function criarFilaTemp() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "ceo-p02-int-"));
  const fila = criarFilaExecucao(root);
  return { root, fila, queueDir: fila.queueDir };
}

test("INT-1: Agent produz result → integração verifica → completed", () => {
  const { fila, queueDir } = criarFilaTemp();
  const job = fila.publicar({
    titulo: "Criar p0-2-homologacao.txt com linha P0-2 HOMOLOGADO",
    descricao:
      "Objectivo: criar arquivo p0-2-homologacao.txt contendo exactamente P0-2 HOMOLOGADO",
    prioridade: "alta"
  });

  fila.marcarDespachado(job.id, { actor: "dispatcher" });
  fila.marcarRunning(job.id, { actor: "agent" });

  // Simula Agent a gravar result sem verificação (adiar)
  const emResult = fila.registarResultado(
    job.id,
    {
      status: "sucesso",
      resumo: "Criado p0-2-homologacao.txt com linha P0-2 HOMOLOGADO",
      evidencia: "conteúdo verificado: P0-2 HOMOLOGADO"
    },
    { adiarVerificacao: true, actor: "agent" }
  );
  assert.equal(emResult.estado, "result");
  assert.equal(listarAguardandoVerificacao(queueDir).length, 1);

  // Integração (dispatcher pós-Agent) dispara verificação formal
  const rec = reconciliarAposAgent(queueDir, job.id);
  assert.equal(rec.acao, "completed");
  assert.equal(rec.job.estado, "completed");
  assert.equal(rec.job.verificacao?.ok, true);
  assert.ok(rec.job.verificacao?.motivo);
  assert.ok(
    rec.job.historicoCiclo.some(
      (h) => h.de === "result" && h.para === "completed"
    )
  );
});

test("INT-2: result insuficiente → needs_correction", () => {
  const { fila, queueDir } = criarFilaTemp();
  const job = fila.publicar({
    titulo: "Integrar Stripe checkout completo no pagamento",
    descricao: "Implementar Stripe checkout end-to-end com webhooks",
    prioridade: "alta"
  });
  fila.marcarDespachado(job.id);
  fila.marcarRunning(job.id);
  fila.registarResultado(
    job.id,
    {
      status: "sucesso",
      resumo: "Arquivo alterado.",
      evidencia: "tocou num ficheiro"
    },
    { adiarVerificacao: true }
  );

  const rec = reconciliarAposAgent(queueDir, job.id);
  assert.ok(
    rec.job.estado === "needs_correction" || rec.job.estado === "failed",
    `esperado needs_correction|failed, got ${rec.job.estado}`
  );
  assert.notEqual(rec.job.estado, "completed");
  assert.ok(rec.job.verificacao);
  assert.equal(rec.job.verificacao.ok, false);
});

test("INT-3: result com falha do executor → failed", () => {
  const { fila, queueDir } = criarFilaTemp();
  const job = fila.publicar({
    titulo: "Criar artefacto de teste",
    descricao: "Gerar ficheiro de homologação",
    prioridade: "normal"
  });
  fila.marcarDespachado(job.id);
  fila.marcarRunning(job.id);
  fila.registarResultado(
    job.id,
    {
      status: "failed",
      resumo: "Não foi possível criar o ficheiro",
      evidencia: "erro de permissão"
    },
    { adiarVerificacao: true }
  );

  const rec = reconciliarAposAgent(queueDir, job.id);
  assert.equal(rec.job.estado, "failed");
  assert.notEqual(rec.job.estado, "completed");
});

test("INT-4: registarResultado sem adiar → verificação automática na fila", () => {
  const { fila } = criarFilaTemp();
  const job = fila.publicar({
    titulo: "Criar p0-2-homologacao.txt com P0-2 HOMOLOGADO",
    descricao: "Homologação automática result→verify",
    prioridade: "alta"
  });
  fila.marcarDespachado(job.id);
  fila.marcarRunning(job.id);
  const final = fila.registarResultado(job.id, {
    status: "sucesso",
    resumo: "Criado p0-2-homologacao.txt com P0-2 HOMOLOGADO",
    evidencia: "linha exacta P0-2 HOMOLOGADO"
  });
  assert.equal(final.estado, "completed");
  assert.equal(final.verificacao?.ok, true);
});

test("INT-5: ciclo dispatcher verifica Jobs em result sem pending", async () => {
  const { fila, queueDir, root } = criarFilaTemp();
  const job = fila.publicar({
    titulo: "Homologação ciclo idle verify",
    descricao: "Job em result deve ser verificado mesmo sem pending",
    prioridade: "alta"
  });
  fila.marcarDespachado(job.id);
  fila.marcarRunning(job.id);
  fila.registarResultado(
    job.id,
    {
      status: "sucesso",
      resumo: "Homologação ciclo idle verify concluída com evidência",
      evidencia: "ok"
    },
    { adiarVerificacao: true }
  );
  assert.equal(fila.lerJob(job.id).estado, "result");

  const logs = [];
  const r = await ciclo({
    queueDir,
    repoRoot: root,
    apiKey: null,
    model: "composer-2.5",
    dryRun: false,
    log: (m) => logs.push(m)
  });

  assert.equal(r, "verified");
  assert.equal(fila.lerJob(job.id).estado, "completed");
  assert.ok(logs.some((l) => /verifica/i.test(l)));
});

test("INT-6: verificarJobsEmResult processa lote", () => {
  const { fila, queueDir } = criarFilaTemp();
  const a = fila.publicar({
    titulo: "Job A homologacao P0-2 HOMOLOGADO",
    descricao: "A"
  });
  const b = fila.publicar({
    titulo: "Job B homologacao P0-2 HOMOLOGADO",
    descricao: "B"
  });
  for (const id of [a.id, b.id]) {
    fila.marcarDespachado(id);
    fila.marcarRunning(id);
    fila.registarResultado(
      id,
      {
        status: "sucesso",
        resumo: "homologacao P0-2 HOMOLOGADO ok",
        evidencia: "ok"
      },
      { adiarVerificacao: true }
    );
  }
  const out = verificarJobsEmResult(queueDir);
  assert.equal(out.verificados.length, 2);
  assert.equal(fila.lerJob(a.id).estado, "completed");
  assert.equal(fila.lerJob(b.id).estado, "completed");
});
