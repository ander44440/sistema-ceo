/**
 * Testes domínio Motor de Execução — IMP-056 E1
 * (sem Orquestrador / Dispatcher / UI / Fila).
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import {
  ETAPAS_CICLO,
  ESTADOS_JOB,
  ESTADOS_JOB_TERMINAIS,
  MAPA_ETAPA_ESTADOS_JOB,
  TRANSICOES_JOB,
  ehEtapaCiclo,
  ehEstadoJob,
  ehEstadoJobTerminal,
  indiceEtapa,
  estadosJobDaEtapa,
  estadoJobCompativelComEtapa,
  aprovacaoPermiteCriacaoJob,
  validarTransicao,
  validarTransicaoCiclo,
  validarTransicaoJob,
  validarCiclo,
  montarCiclo,
  avancarCiclo
} from "./dominio.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

test("E1-CA1: nove etapas do fluxo canónico representadas e ordenáveis", () => {
  assert.equal(ETAPAS_CICLO.length, 9);
  const esperadas = [
    "Intencao",
    "Plano",
    "Aprovacao",
    "CriacaoDoJob",
    "Dispatcher",
    "Execucao",
    "Monitoramento",
    "Resultado",
    "Encerramento"
  ];
  assert.deepEqual([...ETAPAS_CICLO], esperadas);
  for (let i = 0; i < ETAPAS_CICLO.length; i++) {
    assert.equal(indiceEtapa(ETAPAS_CICLO[i]), i);
    assert.equal(ehEtapaCiclo(ETAPAS_CICLO[i]), true);
  }
  assert.equal(ehEtapaCiclo("Publicacao"), false);
  assert.throws(() => indiceEtapa("Publicacao"));
  // ordem estrita no caminho feliz
  for (let i = 1; i < ETAPAS_CICLO.length; i++) {
    assert.ok(indiceEtapa(ETAPAS_CICLO[i]) > indiceEtapa(ETAPAS_CICLO[i - 1]));
  }
});

test("E1-CA2: aprovação ausente bloqueia Criação do Job", () => {
  assert.equal(
    aprovacaoPermiteCriacaoJob({ exigeAprovacao: true, decisaoAprovacao: null }),
    false
  );
  assert.equal(
    aprovacaoPermiteCriacaoJob({
      exigeAprovacao: true,
      decisaoAprovacao: "adiado"
    }),
    false
  );
  assert.equal(
    aprovacaoPermiteCriacaoJob({
      exigeAprovacao: true,
      decisaoAprovacao: "rejeitado"
    }),
    false
  );
  assert.equal(
    aprovacaoPermiteCriacaoJob({
      exigeAprovacao: true,
      decisaoAprovacao: "aprovado"
    }),
    true
  );
  assert.equal(aprovacaoPermiteCriacaoJob({ exigeAprovacao: false }), true);

  const bloqueado = validarTransicao("Plano", "CriacaoDoJob", {
    requerDespacho: true,
    exigeAprovacao: true,
    decisaoAprovacao: null
  });
  assert.equal(bloqueado.ok, false);
  assert.match(bloqueado.mensagem, /Aprovação necessária e ausente/);

  const viaGate = validarTransicao("Aprovacao", "CriacaoDoJob", {
    requerDespacho: true,
    exigeAprovacao: true,
    decisaoAprovacao: null
  });
  assert.equal(viaGate.ok, false);

  const ok = validarTransicao("Aprovacao", "CriacaoDoJob", {
    requerDespacho: true,
    exigeAprovacao: true,
    decisaoAprovacao: "aprovado"
  });
  assert.equal(ok.ok, true);

  const isento = validarTransicao("Plano", "CriacaoDoJob", {
    requerDespacho: true,
    exigeAprovacao: false
  });
  assert.equal(isento.ok, true);

  let ciclo = montarCiclo("ciclo-1", "Plano", {
    requerDespacho: true,
    exigeAprovacao: true,
    decisaoAprovacao: null
  });
  const avanco = avancarCiclo(ciclo, "CriacaoDoJob", { jobId: "JOB-x" });
  assert.equal(avanco.ok, false);
  assert.match(avanco.mensagem, /Aprovação necessária e ausente/);
});

test("E1-CA3: mapeamento etapa → estados Job (REQ-045) sem inventar estados", () => {
  assert.equal(ESTADOS_JOB.length, 5);
  assert.deepEqual([...ESTADOS_JOB], [
    "pending",
    "running",
    "completed",
    "failed",
    "cancelled"
  ]);
  for (const e of ESTADOS_JOB) assert.equal(ehEstadoJob(e), true);
  assert.equal(ehEstadoJob("queued"), false);
  assert.equal(ehEstadoJob("success"), false);

  assert.deepEqual([...ESTADOS_JOB_TERMINAIS], [
    "completed",
    "failed",
    "cancelled"
  ]);
  for (const e of ESTADOS_JOB_TERMINAIS) {
    assert.equal(ehEstadoJobTerminal(e), true);
  }
  assert.equal(ehEstadoJobTerminal("pending"), false);

  for (const etapa of ETAPAS_CICLO) {
    const estados = estadosJobDaEtapa(etapa);
    assert.ok(Array.isArray(estados));
    assert.deepEqual(estados, MAPA_ETAPA_ESTADOS_JOB[etapa]);
    for (const s of estados) {
      if (s !== null) {
        assert.equal(ehEstadoJob(s), true, `${etapa} → ${s}`);
      }
    }
  }

  assert.equal(estadoJobCompativelComEtapa("CriacaoDoJob", "pending"), true);
  assert.equal(estadoJobCompativelComEtapa("CriacaoDoJob", "running"), false);
  assert.equal(estadoJobCompativelComEtapa("Intencao", null), true);
  assert.equal(estadoJobCompativelComEtapa("Intencao", "pending"), false);
  assert.equal(estadoJobCompativelComEtapa("Encerramento", "completed"), true);
  assert.equal(estadoJobCompativelComEtapa("Encerramento", "running"), false);
});

test("E1-CA4: domínio não importa UI, Dispatcher SDK nem escreve na fila", () => {
  const src = readFileSync(join(__dirname, "dominio.js"), "utf8");
  assert.equal(/from\s+["'].*orquestracao/.test(src), false);
  assert.equal(/from\s+["'].*dispatcher/i.test(src), false);
  assert.equal(/@cursor\/sdk/.test(src), false);
  assert.equal(/from\s+["'].*queue/i.test(src), false);
  assert.equal(/from\s+["'].*fila/i.test(src), false);
  assert.equal(/\bfs\b|node:fs|writeFile|fetch\(/.test(src), false);
  assert.equal(/document\.|window\.|localStorage/.test(src), false);
  // módulo puro: só funções/constantes exportadas — sem side-effects de I/O
  assert.ok(typeof validarTransicao === "function");
  assert.ok(typeof validarTransicaoJob === "function");
});

test("estados Job: transições legais e ilegais (protocolo)", () => {
  assert.equal(validarTransicaoJob("pending", "running").ok, true);
  assert.equal(validarTransicaoJob("pending", "cancelled").ok, true);
  assert.equal(validarTransicaoJob("running", "completed").ok, true);
  assert.equal(validarTransicaoJob("running", "failed").ok, true);
  assert.equal(validarTransicaoJob("completed", "pending").ok, false);
  assert.equal(validarTransicaoJob("pending", "failed").ok, false);
  assert.equal(validarTransicaoJob("pending", "completed").ok, false);
  assert.equal(validarTransicaoJob("failed", "running").ok, false);
  assert.deepEqual([...TRANSICOES_JOB.completed], []);
});

test("ARQ-017 §3.4: intenção clara, despacho e encerramento", () => {
  assert.equal(
    validarTransicaoCiclo("Intencao", "Plano", { intencaoClara: false }).ok,
    false
  );
  assert.equal(
    validarTransicaoCiclo("Intencao", "Plano", { intencaoClara: true }).ok,
    true
  );
  assert.equal(
    validarTransicao("Plano", "CriacaoDoJob", { requerDespacho: false }).ok,
    false
  );
  assert.equal(
    validarTransicao("Plano", "Encerramento", { requerDespacho: false }).ok,
    true
  );
  assert.equal(
    validarTransicao("Plano", "Encerramento", { requerDespacho: true }).ok,
    false
  );
  assert.equal(
    validarTransicao("Aprovacao", "Encerramento", {
      decisaoAprovacao: "rejeitado"
    }).ok,
    true
  );
  assert.equal(
    validarTransicao("Aprovacao", "Encerramento", {
      decisaoAprovacao: "aprovado"
    }).ok,
    false
  );
  assert.equal(
    validarTransicao("Resultado", "Encerramento", { estadoJob: "running" }).ok,
    false
  );
  assert.equal(
    validarTransicao("Resultado", "Encerramento", {
      estadoJob: "completed"
    }).ok,
    true
  );
});

test("CicloMotor: parecerId/jobId opcionais; validação e avanço feliz parcial", () => {
  const c0 = montarCiclo("c-e1", "Intencao", { parecerId: "par-1" });
  assert.equal(c0.etapa, "Intencao");
  assert.equal(c0.parecerId, "par-1");
  assert.equal(c0.jobId, undefined);
  assert.equal(validarCiclo(c0).ok, true);

  const c1 = avancarCiclo(c0, "Plano", { requerDespacho: true });
  assert.equal(c1.ok, true);
  assert.equal(c1.ciclo.etapa, "Plano");

  const semJob = avancarCiclo(c1.ciclo, "CriacaoDoJob", {
    requerDespacho: true,
    exigeAprovacao: false
  });
  assert.equal(semJob.ok, false);
  assert.match(semJob.mensagem, /jobId/);

  const comJob = avancarCiclo(c1.ciclo, "CriacaoDoJob", {
    requerDespacho: true,
    exigeAprovacao: false,
    jobId: "JOB-E1-001",
    estadoJob: "pending"
  });
  assert.equal(comJob.ok, true);
  assert.equal(comJob.ciclo.jobId, "JOB-E1-001");
  assert.equal(comJob.ciclo.estadoJob, "pending");
  assert.equal(comJob.ciclo.etapa, "CriacaoDoJob");
});
