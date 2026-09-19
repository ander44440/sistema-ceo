/**
 * R-H02 — fail-closed no path C4/dashboard sem lastro institucional.
 */
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import {
  capacidadeDashboard,
  detetarPedidoLastroInstitucionalPainelJob
} from "./dashboard.js";

const PEDIDO_RH02 =
  "Qual é o estado actual do painel executivo e do job activo deste projecto?";

describe("R-H02 detetar pedido institucional", () => {
  test("detecta painel executivo + job activo", () => {
    const d = detetarPedidoLastroInstitucionalPainelJob(PEDIDO_RH02);
    assert.equal(d.exige, true);
    assert.equal(d.exigePainel, true);
    assert.equal(d.exigeJob, true);
  });

  test("não trata navegação genérica como pedido institucional", () => {
    const d = detetarPedidoLastroInstitucionalPainelJob(
      "Abra o Centro de Situação"
    );
    assert.equal(d.exige, false);
  });
});

describe("R-H02 capacidade dashboard", () => {
  test("sem COA/jobs: declara insuficiência e não usa resumirContexto/seed", async () => {
    const out = await capacidadeDashboard.executar({
      instrucao: PEDIDO_RH02,
      memoria: () => ({
        projetoAtivo: { id: "prj-mg2", nome: "Motoboy Game 2" },
        pendencias: [],
        proximasAcoes: [],
        proximoPasso: null
      }),
      coaAtivo: null,
      listarJobs: async () => []
    });

    assert.equal(out.dados?.lastroInstitucionalInsuficiente, true);
    assert.match(out.mensagem, /lastro institucional|Lacuna institucional/i);
    assert.doesNotMatch(out.mensagem, /Motoboy Game 2/);
    assert.doesNotMatch(out.mensagem, /projeto ativo:/i);
    assert.doesNotMatch(out.mensagem, /sem pendências abertas/i);
    assert.doesNotMatch(out.mensagem, /Centro de Situação é a superfície/);
  });

  test("visão de posto sem pedido institucional: dashboard normal (pode resumir)", async () => {
    const out = await capacidadeDashboard.executar({
      instrucao: "Mostra a visão do posto de comando",
      memoria: () => ({
        projetoAtivo: { id: "prj-mg2", nome: "Motoboy Game 2" },
        pendencias: [],
        proximasAcoes: [],
        proximoPasso: null
      }),
      coaAtivo: null
    });

    assert.equal(out.dados?.lastroInstitucionalInsuficiente, undefined);
    assert.match(out.mensagem, /Centro de Situação é a superfície/);
    assert.match(out.mensagem, /projeto ativo: Motoboy Game 2/);
  });

  test("com COA + job utilizável: não força insuficiência", async () => {
    const out = await capacidadeDashboard.executar({
      instrucao: PEDIDO_RH02,
      memoria: () => ({
        projetoAtivo: { id: "prj-x", nome: "Projecto X" },
        pendencias: [],
        proximasAcoes: [],
        proximoPasso: "Seguir"
      }),
      coaAtivo: { id: "prj-x", nome: "Projecto X" },
      obterPainelExecutivo: async () => ({
        estadoExecutivo: "em_curso",
        resumoExecutivo: "ok"
      }),
      listarJobs: async () => [{ id: "JOB-1", estado: "running" }]
    });

    assert.equal(out.dados?.lastroInstitucionalInsuficiente, undefined);
    assert.match(out.mensagem, /Centro de Situação é a superfície/);
  });
});
