/**
 * CTO-003 — Interceptação operacional pré-classificador (correção pós-homologação).
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  deveInterceptarOperacional,
  executarInterceptacaoOperacional
} from "./interceptacaoOperacional.js";
import { ehComandoSobreJobActivo } from "./estadoOperacional.js";
import executiveEngine from "../executiveEngine/index.js";

test("REPITA é comando operacional", () => {
  assert.equal(ehComandoSobreJobActivo("REPITA"), true);
  assert.equal(ehComandoSobreJobActivo("REENVIAR"), true);
});

test("repetir decisão deliberativa não intercepta (CTO-003)", () => {
  const estadoAberto = {
    operacaoAberta: true,
    requerRecuperacao: false,
    modoOperacional: "recuperar",
    jobActivo: { id: "JOB-1", titulo: "t", estado: "needs_correction" },
    sinais: {
      pending: 0,
      running: 0,
      failed: 0,
      dispatcher: false,
      handoff: false,
      agentErro: false,
      gatePendente: 0
    }
  };
  assert.equal(
    deveInterceptarOperacional({
      texto:
        "Repetir uma decisão enquanto 093/095 estiverem em needs_correction.",
      estadoOperacional: estadoAberto
    }),
    false
  );
  assert.equal(
    deveInterceptarOperacional({
      texto: "REPITA",
      estadoOperacional: estadoAberto
    }),
    true
  );
  assert.equal(
    deveInterceptarOperacional({
      texto: "repetir o Job",
      estadoOperacional: estadoAberto
    }),
    true
  );
  assert.equal(
    deveInterceptarOperacional({
      texto: "repetir a execução",
      estadoOperacional: estadoAberto
    }),
    true
  );
});

test("deve interceptar com operação aberta + comando", () => {
  assert.equal(
    deveInterceptarOperacional({
      texto: "REENVIAR",
      estadoOperacional: {
        operacaoAberta: true,
        requerRecuperacao: false,
        modoOperacional: "executar",
        jobActivo: { id: "JOB-1", titulo: "t", estado: "pending" },
        sinais: {
          pending: 1,
          running: 0,
          failed: 0,
          dispatcher: false,
          handoff: true,
          agentErro: false,
          gatePendente: 0
        }
      }
    }),
    true
  );
  assert.equal(
    deveInterceptarOperacional({
      texto: "REENVIAR",
      estadoOperacional: {
        operacaoAberta: false,
        requerRecuperacao: false,
        modoOperacional: null,
        jobActivo: null,
        sinais: {
          pending: 0,
          running: 0,
          failed: 0,
          dispatcher: false,
          handoff: false,
          agentErro: false,
          gatePendente: 0
        }
      }
    }),
    false
  );
});

test("executar interceptação marca classificacaoEvitada", async () => {
  const out = await executarInterceptacaoOperacional({
    texto: "REPITA",
    estadoOperacional: {
      operacaoAberta: true,
      requerRecuperacao: true,
      modoOperacional: "recuperar",
      jobActivo: { id: "JOB-000045", titulo: "x", estado: "pending" },
      sinais: {
        pending: 1,
        running: 0,
        failed: 0,
        dispatcher: true,
        handoff: true,
        agentErro: false,
        gatePendente: 0
      }
    },
    deps: {}
  });
  assert.equal(out.dados.classificacaoEvitada, true);
  assert.equal(out.dados.interceptacaoOperacional, "CTO-003");
  assert.equal(out.modo, "interceptacao_operacional");
  assert.doesNotMatch(out.mensagem, /mudámos de prioridade|Entendi:/i);
});

test("EE: REENVIAR com Job pending não passa pelo classificador", async () => {
  let motorChamado = false;
  const out = await executiveEngine.executar(
    {
      texto: "REENVIAR",
      historico: [
        {
          papel: "ceo",
          texto:
            "Execução iniciada. Job JOB-000099 criado em pending. Handoff ao Dispatcher iniciado."
        }
      ]
    },
    {
      listarPorEstado: async (e) => {
        if (e === "pending") {
          return [
            {
              id: "JOB-000099",
              titulo: "missão",
              estado: "pending",
              criadoEm: "2026-08-07T00:50:00.000Z"
            }
          ];
        }
        return [];
      },
      leitoresConsciencia: {
        F1: async () => [
          { id: "JOB-000099", titulo: "missão", status: "pending" }
        ],
        F2: async () => [],
        F3: async () => [],
        F4: async () => ({ estado: "activo" }),
        F5: async () => ({ estado: "ocioso", emCurso: false }),
        F6: async () => ({ estado: "ocioso", ocupado: false }),
        F7: async () => ({ disponivel: false, alertas: 0 }),
        F8: async () => ({ id: null, nome: null })
      },
      publicarJob: async (pedido) => ({
        id: "JOB-000100",
        estado: "pending",
        ...pedido
      }),
      conduzirMotor: async () => {
        motorChamado = true;
        return {
          publicado: true,
          job: { id: "JOB-000100", estado: "pending" },
          fluxoIniciado: true
        };
      }
    }
  );

  assert.equal(out.dados?.interceptacaoOperacional, "CTO-003");
  assert.equal(out.dados?.classificacaoEvitada, true);
  assert.doesNotMatch(
    String(out.mensagem || ""),
    /mudámos de prioridade|É isso\?/i
  );
  assert.notEqual(out.modo, "clarificacao_objectivo");
  assert.notEqual(out.modo, "clarificacao_referente");
  assert.ok(motorChamado || out.modo === "interceptacao_operacional");
});

const ESTADO_JOB_ABERTO = {
  operacaoAberta: true,
  requerRecuperacao: false,
  modoOperacional: "executar",
  jobActivo: { id: "JOB-000200", titulo: "missão operacional", estado: "pending" },
  sinais: {
    pending: 1,
    running: 0,
    failed: 0,
    dispatcher: true,
    handoff: true,
    agentErro: false,
    gatePendente: 0
  }
};

test("C4 «estado da fila» com Job aberto não intercepta (CTO-003)", () => {
  assert.equal(
    deveInterceptarOperacional({
      texto: "estado da fila",
      estadoOperacional: ESTADO_JOB_ABERTO
    }),
    false
  );
});

test("C4 «estado da fila de execução» com Job aberto não intercepta (CTO-003)", () => {
  assert.equal(
    deveInterceptarOperacional({
      texto: "estado da fila de execução",
      estadoOperacional: ESTADO_JOB_ABERTO
    }),
    false
  );
});

test("«estado» / «ESTADO» com Job aberto continuam CTO-003", () => {
  assert.equal(
    deveInterceptarOperacional({
      texto: "estado",
      estadoOperacional: ESTADO_JOB_ABERTO
    }),
    true
  );
  assert.equal(
    deveInterceptarOperacional({
      texto: "ESTADO",
      estadoOperacional: ESTADO_JOB_ABERTO
    }),
    true
  );
});

test("EE: Job aberto + «estado da fila» segue C4 sem classificacaoEvitada", async () => {
  const historico = [
    {
      papel: "ceo",
      texto:
        "Execução iniciada. Job JOB-000200 criado em pending. Handoff ao Dispatcher iniciado."
    }
  ];
  let motorChamado = false;
  const out = await executiveEngine.executar(
    { texto: "estado da fila", historico },
    {
      listarPorEstado: async (e) => {
        if (e === "pending") {
          return [
            {
              id: "JOB-000200",
              titulo: "missão operacional",
              estado: "pending",
              objetivo: "Implementar o outdoor lateral no MG2.",
              projeto: "prj-mg2",
              criadoEm: "2026-08-07T01:00:00.000Z"
            }
          ];
        }
        return [];
      },
      leitoresConsciencia: {
        F1: async () => [
          { id: "JOB-000200", titulo: "missão operacional", status: "pending" }
        ],
        F2: async () => [],
        F3: async () => [],
        F4: async () => ({ estado: "activo" }),
        F5: async () => ({ estado: "ocioso", emCurso: false }),
        F6: async () => ({ estado: "ocioso", ocupado: false }),
        F7: async () => ({ disponivel: false, alertas: 0 }),
        F8: async () => ({ id: null, nome: null })
      },
      publicarJob: async (p) => ({
        id: "JOB-000201",
        estado: "pending",
        ...p
      }),
      conduzirMotor: async () => {
        motorChamado = true;
        return {
          publicado: true,
          job: { id: "JOB-000201", estado: "pending" },
          fluxoIniciado: true
        };
      }
    }
  );

  assert.notEqual(out.dados?.interceptacaoOperacional, "CTO-003");
  assert.notEqual(out.dados?.classificacaoEvitada, true);
  assert.equal(out.dados?.classificacao?.classe, "comando_operacional");
  assert.equal(out.dados?.encaminhamento?.destino, "capacidade_operacional");
  assert.equal(motorChamado, false);
});
