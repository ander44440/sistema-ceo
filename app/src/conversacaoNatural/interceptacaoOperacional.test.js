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
