/**
 * Testes domínio Estado Executivo — IMP-059 E1
 * (sem agregador / Conversa / Núcleo / Motor / UI / I/O).
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import {
  FONTES_ESTADO_EXECUTIVO,
  PRIORIDADE_FONTES,
  IDS_FONTES,
  NIVEIS_PRIORIDADE,
  ehIdFonte,
  ehNivelPrioridade,
  prioridadeDaFonte,
  compararPrioridadeFontes,
  validarJobResumo,
  validarGateResumo,
  validarConflitoFoco,
  criarEstadoExecutivo,
  estadoExecutivoVazio,
  validarEstadoExecutivo,
  fonteEstaActiva,
  temContextoOperacionalRelevante,
  priorizarFontes,
  fontePrioritaria
} from "./dominio.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

test("E1-CA1: oito fontes F1–F8 no modelo V1", () => {
  assert.equal(FONTES_ESTADO_EXECUTIVO.length, 8);
  assert.deepEqual([...IDS_FONTES], [
    "F1",
    "F2",
    "F3",
    "F4",
    "F5",
    "F6",
    "F7",
    "F8"
  ]);
  assert.deepEqual(
    FONTES_ESTADO_EXECUTIVO.map((f) => f.chave),
    [
      "jobsPendentes",
      "jobsEmExecucao",
      "gatesPendentes",
      "dispatcher",
      "cto",
      "agent",
      "painel",
      "frenteActiva"
    ]
  );

  for (const id of IDS_FONTES) {
    assert.equal(ehIdFonte(id), true);
  }
  assert.equal(ehIdFonte("F9"), false);
  assert.equal(ehIdFonte("jobs"), false);

  const vazio = estadoExecutivoVazio();
  const validacao = validarEstadoExecutivo(vazio);
  assert.equal(validacao.ok, true);
  for (const fonte of FONTES_ESTADO_EXECUTIVO) {
    assert.ok(fonte.chave in vazio, `chave ${fonte.chave} ausente`);
  }
  assert.ok("conflitosFoco" in vazio);
});

test("E1-CA2: prioridade P1–P7 alinhada a ARQ-020 §5", () => {
  assert.deepEqual([...NIVEIS_PRIORIDADE], [
    "P1",
    "P2",
    "P3",
    "P4",
    "P5",
    "P6",
    "P7"
  ]);
  assert.equal(PRIORIDADE_FONTES.length, 7);
  for (const n of NIVEIS_PRIORIDADE) {
    assert.equal(ehNivelPrioridade(n), true);
  }
  assert.equal(ehNivelPrioridade("P8"), false);

  assert.equal(prioridadeDaFonte("F3"), "P1");
  assert.equal(prioridadeDaFonte("F2"), "P2");
  assert.equal(prioridadeDaFonte("F1"), "P3");
  assert.equal(prioridadeDaFonte("F6"), "P4");
  assert.equal(prioridadeDaFonte("F4"), "P4");
  assert.equal(prioridadeDaFonte("F5"), "P5");
  assert.equal(prioridadeDaFonte("F7"), "P6");
  assert.equal(prioridadeDaFonte("F8"), "P7");

  assert.ok(compararPrioridadeFontes("F3", "F2") < 0);
  assert.ok(compararPrioridadeFontes("F2", "F1") < 0);
  assert.ok(compararPrioridadeFontes("F1", "F6") < 0);
  assert.equal(compararPrioridadeFontes("F6", "F4"), 0);
  assert.ok(compararPrioridadeFontes("F5", "F8") < 0);

  const estado = criarEstadoExecutivo({
    jobsPendentes: [{ id: "J-p", titulo: "pendente", status: "pending" }],
    jobsEmExecucao: [{ id: "J-r", titulo: "bugs", status: "running" }],
    gatesPendentes: [{ gateId: "G1", parecerId: "PAR-1" }],
    agent: { estado: "ocupado", ocupado: true },
    dispatcher: { estado: "activo" },
    cto: { estado: "em_curso", emCurso: true },
    painel: { disponivel: true, alertas: 2 },
    frenteActiva: { id: "mg2", nome: "MG2" }
  });

  const ordenadas = priorizarFontes(estado, { incluirFrente: true });
  assert.deepEqual(
    ordenadas.map((f) => f.id),
    ["F3", "F2", "F1", "F6", "F4", "F5", "F7", "F8"]
  );
  assert.equal(fontePrioritaria(estado)?.id, "F3");
  assert.equal(fontePrioritaria(estado)?.nivel, "P1");
});

test("E1-CA3: snapshot vazio / irrelevante → temContextoOperacionalRelevante false", () => {
  const vazio = estadoExecutivoVazio();
  assert.equal(temContextoOperacionalRelevante(vazio), false);
  assert.equal(fontePrioritaria(vazio), null);
  assert.deepEqual([...priorizarFontes(vazio)], []);

  const soFrente = criarEstadoExecutivo({
    frenteActiva: { id: "mg2", nome: "MG2" }
  });
  assert.equal(fonteEstaActiva(soFrente, "F8"), true);
  assert.equal(temContextoOperacionalRelevante(soFrente), false);
  assert.equal(fontePrioritaria(soFrente), null);
  assert.equal(
    fontePrioritaria(soFrente, { incluirFrente: true })?.id,
    "F8"
  );

  const soPainelSemAlerta = criarEstadoExecutivo({
    painel: { disponivel: true, alertas: 0 }
  });
  assert.equal(temContextoOperacionalRelevante(soPainelSemAlerta), false);

  const comJobRunning = criarEstadoExecutivo({
    jobsEmExecucao: [{ id: "J1", titulo: "bugs", status: "running" }],
    frenteActiva: { id: "mg2", nome: "MG2" }
  });
  assert.equal(temContextoOperacionalRelevante(comJobRunning), true);
  assert.equal(fontePrioritaria(comJobRunning)?.id, "F2");
});

test("modelo imutável: Object.freeze profundo após criarEstadoExecutivo", () => {
  const estado = criarEstadoExecutivo({
    jobsEmExecucao: [{ id: "J1", titulo: "bugs", status: "running" }],
    gatesPendentes: [{ gateId: "G1", parecerId: "PAR-1", resumo: "ok" }],
    conflitosFoco: [
      {
        tipo: "job_running_vs_priorizacao",
        fontes: ["F2"],
        resumo: "Job em execução"
      }
    ]
  });

  assert.ok(Object.isFrozen(estado));
  assert.ok(Object.isFrozen(estado.jobsEmExecucao));
  assert.ok(Object.isFrozen(estado.jobsEmExecucao[0]));
  assert.ok(Object.isFrozen(estado.gatesPendentes[0]));
  assert.ok(Object.isFrozen(estado.dispatcher));
  assert.ok(Object.isFrozen(estado.conflitosFoco[0]));
  assert.ok(Object.isFrozen(estado.conflitosFoco[0].fontes));

  assert.throws(() => {
    // @ts-expect-error — mutação proibida
    estado.jobsEmExecucao.push({ id: "X", titulo: "x", status: "running" });
  }, TypeError);

  assert.throws(() => {
    // @ts-expect-error
    estado.dispatcher.estado = "erro";
  }, TypeError);
});

test("validações de domínio rejeitam payloads inválidos", () => {
  assert.equal(validarJobResumo({ id: "", titulo: "x", status: "pending" }).ok, false);
  assert.equal(validarJobResumo({ id: "1", titulo: "x", status: "done" }).ok, false);
  assert.equal(validarGateResumo({ gateId: "G", parecerId: "" }).ok, false);
  assert.equal(
    validarConflitoFoco({ tipo: "x", fontes: ["F9"], resumo: "r" }).ok,
    false
  );

  assert.throws(
    () =>
      criarEstadoExecutivo({
        jobsPendentes: [{ id: "J", titulo: "t", status: "running" }]
      }),
    /pending/
  );
  assert.throws(
    () =>
      criarEstadoExecutivo({
        jobsEmExecucao: [{ id: "J", titulo: "t", status: "pending" }]
      }),
    /running/
  );

  const invalido = validarEstadoExecutivo({
    jobsPendentes: [],
    jobsEmExecucao: []
  });
  assert.equal(invalido.ok, false);
  assert.ok(invalido.erros.length > 0);

  assert.throws(() => compararPrioridadeFontes("F1", "FX"), TypeError);
});

test("fonteEstaActiva cobre sinais F1–F7 e F8", () => {
  const e = criarEstadoExecutivo({
    jobsPendentes: [{ id: "P", titulo: "p", status: "pending" }],
    jobsEmExecucao: [{ id: "R", titulo: "r", status: "running" }],
    gatesPendentes: [{ gateId: "G", parecerId: "PAR" }],
    dispatcher: { estado: "erro" },
    cto: { emCurso: true },
    agent: { ocupado: true },
    painel: { disponivel: true, alertas: 1 },
    frenteActiva: { nome: "MG2" }
  });
  for (const id of IDS_FONTES) {
    assert.equal(fonteEstaActiva(e, id), true, id);
  }

  const ocioso = estadoExecutivoVazio();
  for (const id of ["F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8"]) {
    assert.equal(fonteEstaActiva(ocioso, id), false, id);
  }
});

test("E1-CA4: domínio sem I/O, UI, Fila, Motor, Classificador, agregador ou SDK", () => {
  const src = readFileSync(join(__dirname, "dominio.js"), "utf8");
  assert.equal(src.includes("@cursor/sdk"), false);
  assert.equal(/\bfetch\s*\(/.test(src), false);
  assert.equal(/from\s+["'].*conversa/.test(src), false);
  assert.equal(/from\s+["'].*executiveEngine/.test(src), false);
  assert.equal(/from\s+["'].*motorExecucao/.test(src), false);
  assert.equal(/from\s+["'].*classificador/.test(src), false);
  assert.equal(/from\s+["'].*continuidadeGate/.test(src), false);
  assert.equal(/from\s+["'].*executionQueue/.test(src), false);
  assert.equal(/from\s+["'].*agregar/.test(src), false);
  assert.equal(/localStorage|indexedDB|fs\.|http\.|express/.test(src), false);
  assert.equal(/document\.|window\./.test(src), false);
});
