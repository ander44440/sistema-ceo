/**
 * CTO-003 — Persistência do Estado Operacional.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  ehComandoSobreJobActivo,
  ehPerguntaProibidaComOperacao,
  extrairEstadoOperacional,
  montarAckRecuperacao,
  montarEstadoOperacionalNoLastro
} from "./estadoOperacional.js";
import { detectarModoExecutivo } from "./disciplinaExecutiva.js";
import { detectarModoAdaptacao } from "./adaptacaoConversacional.js";
import { devePreservarMissao } from "../classificadorIntencao/preservarMissao.js";
import { comporPorTipo } from "./compor.js";
import { TIPO_TURNO } from "./tiposTurno.js";

test("Job pending → operação aberta e modo EXECUTAR", () => {
  const e = extrairEstadoOperacional({
    lastroConsciencia: {
      contagens: { jobsPendentes: 1, jobsEmExecucao: 0, gatesPendentes: 0 },
      factosOficiais: ["Estado Executivo — Job pendente JOB-000038: reenviar"]
    }
  });
  assert.equal(e.operacaoAberta, true);
  assert.equal(e.requerRecuperacao, false);
  assert.equal(e.modoOperacional, "executar");
  assert.equal(
    detectarModoExecutivo({
      instrucao: "qual o próximo passo?",
      estadoOperacional: e
    }),
    "executar"
  );
});

test("Agent/dispatcher erro → RECUPERAR", () => {
  const e = extrairEstadoOperacional({
    historico: [
      {
        papel: "ceo",
        texto: "Execução iniciada. Job JOB-000038 criado em pending. Handoff ao Dispatcher iniciado."
      },
      { papel: "usuario", texto: "ERRO NO DESPACHER, FORCE O ENVIO NOVAMENTE" },
      { papel: "usuario", texto: "E AGENT CONTINUA COM ERRO" }
    ]
  });
  assert.equal(e.operacaoAberta, true);
  assert.equal(e.requerRecuperacao, true);
  assert.equal(
    detectarModoExecutivo({
      instrucao: "FORCE O ENVIO NOVAMENTE",
      estadoOperacional: e,
      historico: e.jobActivo ? [] : undefined
    }),
    "recuperar"
  );
});

test("comandos REGRA 3 reconhecidos", () => {
  assert.equal(ehComandoSobreJobActivo("REENVIAR AO CURSOR"), true);
  assert.equal(ehComandoSobreJobActivo("tentar novamente"), true);
  assert.equal(ehComandoSobreJobActivo("HA JOBS NA FILA?"), true);
  assert.equal(ehComandoSobreJobActivo("estado"), true);
  assert.equal(ehComandoSobreJobActivo("o que achas das vias?"), false);
});

test("perguntas proibidas com operação (REGRA 4)", () => {
  assert.equal(
    ehPerguntaProibidaComOperacao("É isso — ou mudámos de prioridade?"),
    true
  );
  assert.equal(ehPerguntaProibidaComOperacao("Qual é o objetivo de agora?"), true);
  assert.equal(ehPerguntaProibidaComOperacao("Despacho em curso."), false);
});

test("ESPELHO com Job activo não pergunta prioridade", () => {
  const estadoOperacional = extrairEstadoOperacional({
    jobs: [{ id: "JOB-000038", titulo: "reenviar", estado: "pending" }]
  });
  const out = comporPorTipo(TIPO_TURNO.ESPELHO, {
    parecer: null,
    ctxImediato: {
      objectivoPrincipal: "Nomear vias",
      missaoActiva: true,
      operacaoAberta: true,
      estadoOperacional
    },
    instrucao: "HA JOBS NA FILA?"
  });
  assert.doesNotMatch(out.texto, /mudámos de prioridade/i);
  assert.doesNotMatch(out.texto, /qual é o objetiv/i);
  assert.equal(out.perguntas.length, 0);
});

test("preservar missão quando operação aberta (CTO-003)", () => {
  assert.equal(
    devePreservarMissao({
      texto: "REENVIAR",
      historico: [],
      classificacao: { classe: "conhecimento_geral", confianca: 0.2 },
      deps: {
        lastroConsciencia: {
          temContextoRelevante: true,
          contagens: { jobsPendentes: 1, jobsEmExecucao: 0, gatesPendentes: 0 },
          estadoOperacional: {
            operacaoAberta: true,
            requerRecuperacao: false,
            modoOperacional: "executar",
            jobActivo: { id: "JOB-1", titulo: "x", estado: "pending" },
            sinais: {
              pending: 1,
              running: 0,
              failed: 0,
              dispatcher: false,
              handoff: false,
              agentErro: false,
              gatePendente: 0
            }
          }
        }
      }
    }),
    true
  );
});

test("adaptacao sob Job activo → execucao", () => {
  assert.equal(
    detectarModoAdaptacao({
      instrucao: "continua",
      ctxImediato: {
        missaoActiva: true,
        operacaoAberta: true,
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
            handoff: false,
            agentErro: false,
            gatePendente: 0
          }
        }
      }
    }),
    "execucao"
  );
});

test("ack recuperação menciona Job", () => {
  const e = extrairEstadoOperacional({
    jobs: [{ id: "JOB-000038", titulo: "x", estado: "failed" }]
  });
  assert.match(montarAckRecuperacao(e, "REENVIAR"), /JOB-000038|reenviar/i);
});

test("montarEstadoOperacionalNoLastro a partir da consulta", () => {
  const e = montarEstadoOperacionalNoLastro({
    estado: {
      jobsPendentes: [{ id: "JOB-9", titulo: "t", status: "pending" }],
      jobsEmExecucao: [],
      gatesPendentes: [],
      dispatcher: { estado: "ocioso" },
      agent: { estado: "ocioso", ocupado: false }
    }
  });
  assert.equal(e.operacaoAberta, true);
  assert.equal(e.jobActivo?.id, "JOB-9");
});
