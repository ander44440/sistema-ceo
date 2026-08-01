/**
 * Testes agregador Consciência Operacional — IMP-059 E2
 * (sem Conversa / Núcleo / Motor / UI; leitores mock).
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import {
  IDS_FONTES,
  NIVEIS_PRIORIDADE,
  FONTES_ESTADO_EXECUTIVO,
  validarEstadoExecutivo,
  temContextoOperacionalRelevante
} from "./dominio.js";
import {
  agregarEstadoExecutivo,
  criarAgregadorConsciencia,
  normalizarLeituraFonte
} from "./agregarEstado.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const AGORA_FIXO = "2026-08-01T20:35:00.000Z";

/** @returns {import("./agregarEstado.js").LeitoresFontes} */
function leitoresOciosos() {
  return {
    F1: () => [],
    F2: () => [],
    F3: () => [],
    F4: () => ({ estado: "ocioso" }),
    F5: () => ({ estado: "ocioso", emCurso: false }),
    F6: () => ({ estado: "ocioso", ocupado: false }),
    F7: () => ({ disponivel: true, alertas: 0 }),
    F8: () => ({ id: null, nome: null })
  };
}

test("E2-CA1: agregação produz snapshot válido com as oito fontes", async () => {
  const consulta = await agregarEstadoExecutivo({
    leitores: {
      ...leitoresOciosos(),
      F2: () => [{ id: "J-r", titulo: "bugs", status: "running" }],
      F3: () => [{ gateId: "G1", parecerId: "PAR-1", resumo: "aprovar?" }],
      F8: () => ({ id: "mg2", nome: "MG2" })
    },
    agora: () => AGORA_FIXO
  });

  assert.equal(consulta.consultadoEm, AGORA_FIXO);
  const v = validarEstadoExecutivo(consulta.estado);
  assert.equal(v.ok, true);
  for (const fonte of FONTES_ESTADO_EXECUTIVO) {
    assert.ok(fonte.chave in consulta.estado, fonte.chave);
  }
  for (const id of IDS_FONTES) {
    assert.ok(consulta.diagnostico.fontes[id], id);
    assert.equal(typeof consulta.diagnostico.fontes[id].ok, "boolean");
  }
  assert.equal(consulta.estado.jobsEmExecucao.length, 1);
  assert.equal(consulta.estado.gatesPendentes.length, 1);
  assert.equal(consulta.temContextoRelevante, true);
});

test("E2-CA1: leitores ausentes → defaults ociosos (fontes explicitamente ausentes)", async () => {
  const consulta = await agregarEstadoExecutivo({
    leitores: {},
    agora: () => AGORA_FIXO
  });
  assert.equal(validarEstadoExecutivo(consulta.estado).ok, true);
  assert.equal(consulta.temContextoRelevante, false);
  for (const id of IDS_FONTES) {
    assert.equal(consulta.diagnostico.fontes[id].origem, "ausente");
    assert.equal(consulta.diagnostico.fontes[id].ok, true);
    assert.equal(consulta.diagnostico.fontes[id].degradada, false);
  }
});

test("E2 prioridade P1–P7 aplicada na consulta", async () => {
  assert.deepEqual(
    [...(await agregarEstadoExecutivo({ agora: () => AGORA_FIXO })).diagnostico
      .ordemPrioridade],
    [...NIVEIS_PRIORIDADE]
  );

  const consulta = await agregarEstadoExecutivo({
    leitores: {
      F1: () => [{ id: "P", titulo: "p", status: "pending" }],
      F2: () => [{ id: "R", titulo: "r", status: "running" }],
      F3: () => [{ gateId: "G", parecerId: "PAR" }],
      F4: () => ({ estado: "activo" }),
      F5: () => ({ emCurso: true }),
      F6: () => ({ ocupado: true }),
      F7: () => ({ disponivel: true, alertas: 1 }),
      F8: () => ({ id: "mg2", nome: "MG2" })
    },
    agora: () => AGORA_FIXO
  });

  assert.deepEqual(
    consulta.prioridadeActiva.map((f) => f.id),
    ["F3", "F2", "F1", "F6", "F4", "F5", "F7", "F8"]
  );
  assert.equal(consulta.prioridadeActiva[0].nivel, "P1");
});

test("E2-CA2: falha de uma fonte degrada só essa fonte; não inventa Jobs/Gates", async () => {
  const consulta = await agregarEstadoExecutivo({
    leitores: {
      ...leitoresOciosos(),
      F2: () => [{ id: "J1", titulo: "bugs", status: "running" }],
      F3: () => {
        throw new Error("continuidade offline");
      },
      F4: () => {
        throw new Error("dispatcher offline");
      }
    },
    agora: () => AGORA_FIXO
  });

  assert.equal(validarEstadoExecutivo(consulta.estado).ok, true);
  assert.equal(consulta.estado.gatesPendentes.length, 0);
  assert.equal(consulta.estado.jobsEmExecucao.length, 1);
  assert.equal(consulta.estado.jobsEmExecucao[0].id, "J1");
  assert.ok(consulta.diagnostico.fontesDegradadas.includes("F3"));
  assert.ok(consulta.diagnostico.fontesDegradadas.includes("F4"));
  assert.equal(consulta.diagnostico.fontes.F3.degradada, true);
  assert.equal(consulta.diagnostico.fontes.F2.degradada, false);
  assert.equal(consulta.diagnostico.fontes.F2.ok, true);
  assert.equal(temContextoOperacionalRelevante(consulta.estado), true);
});

test("E2-CA2: payload inválido degrada fonte sem inventar dados", async () => {
  const consulta = await agregarEstadoExecutivo({
    leitores: {
      F1: () => [{ id: "bad", titulo: "x", status: "running" }],
      F2: () => "nao-array"
    },
    agora: () => AGORA_FIXO
  });
  assert.equal(consulta.estado.jobsPendentes.length, 0);
  assert.equal(consulta.estado.jobsEmExecucao.length, 0);
  assert.equal(consulta.diagnostico.fontes.F1.origem, "invalida");
  assert.equal(consulta.diagnostico.fontes.F2.origem, "invalida");
});

test("snapshot imutável e leitores não mutados", async () => {
  const jobsRunning = [{ id: "J1", titulo: "bugs", status: "running" }];
  const gates = [{ gateId: "G1", parecerId: "PAR-1" }];
  const consulta = await agregarEstadoExecutivo({
    leitores: {
      F2: () => jobsRunning,
      F3: () => gates
    },
    agora: () => AGORA_FIXO
  });

  assert.ok(Object.isFrozen(consulta));
  assert.ok(Object.isFrozen(consulta.estado));
  assert.ok(Object.isFrozen(consulta.estado.jobsEmExecucao));
  assert.ok(Object.isFrozen(consulta.diagnostico));

  assert.throws(() => {
    // @ts-expect-error
    consulta.estado.jobsEmExecucao.push({
      id: "X",
      titulo: "x",
      status: "running"
    });
  }, TypeError);

  // Fonte consultada intacta
  assert.equal(jobsRunning.length, 1);
  assert.equal(jobsRunning[0].id, "J1");
  assert.equal(gates.length, 1);
  assert.equal(gates[0].gateId, "G1");
});

test("criarAgregadorConsciencia.consultar consolida leitura", async () => {
  const agg = criarAgregadorConsciencia({
    leitores: {
      F2: () => [{ id: "J", titulo: "t", status: "running" }]
    },
    agora: () => AGORA_FIXO
  });
  const c = await agg.consultar();
  assert.equal(c.estado.jobsEmExecucao[0].id, "J");
  assert.equal(c.consultadoEm, AGORA_FIXO);
});

test("normalizarLeituraFonte rejeita formatos incorrectos", () => {
  assert.equal(normalizarLeituraFonte("F1", null).ok, false);
  assert.equal(
    normalizarLeituraFonte("F2", [{ id: "1", titulo: "t", status: "pending" }])
      .ok,
    false
  );
  assert.equal(
    normalizarLeituraFonte("F3", [{ gateId: "G", parecerId: "P" }]).ok,
    true
  );
});

test("E2-CA3/CA4: agregador sem publish Job, Motor, Gate, Fila, SDK, Conversa/UI", () => {
  const src = readFileSync(join(__dirname, "agregarEstado.js"), "utf8");
  assert.equal(src.includes("@cursor/sdk"), false);
  assert.equal(/\bfetch\s*\(/.test(src), false);
  assert.equal(/from\s+["'].*conversa/.test(src), false);
  assert.equal(/from\s+["'].*executiveEngine/.test(src), false);
  assert.equal(/from\s+["'].*motorExecucao/.test(src), false);
  assert.equal(/from\s+["'].*continuidadeGate/.test(src), false);
  assert.equal(/from\s+["'].*executionQueue/.test(src), false);
  assert.equal(/from\s+["'].*classificador/.test(src), false);
  assert.equal(/publicarJob|enqueue|createJob|conduzirApos/.test(src), false);
  assert.equal(/localStorage|document\.|window\./.test(src), false);
  // só lê domínio E1
  assert.ok(/from\s+["']\.\/dominio\.js["']/.test(src));
});
