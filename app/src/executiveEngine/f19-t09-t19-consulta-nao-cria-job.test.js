/**
 * F19 — T09/T19: consulta de estado/Job não cria Job; permanece em C4.
 * Regressão: C5/F12 (execução explícita) e C10/F16 intactos.
 */

import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";
import {
  classificar,
  ehConsultaEstadoOperacional,
  ehIntencaoExecutivaE21,
  normalizarTexto
} from "../classificadorIntencao/regras.js";
import { identificarConsultaEstado } from "./capacidades/consultarEstado.js";
import { deveInterceptarOperacional } from "../conversacaoNatural/interceptacaoOperacional.js";
import { executiveEngine } from "./index.js";
import { abrirCoaParaTeste } from "./garantirCoaCatalogoTeste.js";
import { limparCoaAtivo, definirCoaAtivo } from "./coaSessao.js";
import { criarPublicadorFilaMemoria } from "../motorExecucao/ponteParecerJob.js";
import { resetStoreContinuidadePadrao } from "../continuidadeGate/integracaoConversa.js";
import { resetEstadoTopicosSessao } from "../classificadorIntencao/topicosSessao.js";
import { resetEstadoObjectivoSessao } from "../classificadorIntencao/objectivoSessao.js";
import { reiniciarAutoridadeDelegadaParaTestes } from "../autoridadeDelegada/autoridadeDelegada.js";
import { reiniciarEnvelopeSessaoParaTestes } from "../classificadorIntencao/envelopeSessaoCoa.js";

const MSG_T09 =
  "Qual é o estado operacional actual da sessão? Resuma COA activo e Jobs em aberto, sem deliberar.";

const MSG_T19 =
  "Qual foi o último Job criado neste COA e em que estado está? Só consulta, sem criar outro.";

const MSG_C10 =
  "Qual é o estado actual da sessão? Responda de forma directa.";

const MSG_F12 =
  "Execute agora: criar um Job para corrigir os bugs críticos do sprint e despachar para a fila.";

const MSG_EXEC =
  "Execute agora: abra um Job para preparar a proposta de ajuste de preço da ValeVerde.";

let fetchPrev;
let llmCalls;

beforeEach(() => {
  resetStoreContinuidadePadrao();
  resetEstadoTopicosSessao();
  resetEstadoObjectivoSessao();
  reiniciarAutoridadeDelegadaParaTestes();
  reiniciarEnvelopeSessaoParaTestes();
  executiveEngine.reiniciarAcompanhamentoParaTestes();
  limparCoaAtivo();
  fetchPrev = globalThis.fetch;
  llmCalls = 0;
  globalThis.fetch = async (url) => {
    const u = String(url);
    if (u.includes("llm-status")) {
      return new Response(JSON.stringify({ ok: true, configurado: true }), {
        status: 200
      });
    }
    if (u.includes("deliberar")) {
      llmCalls += 1;
      return new Response(
        JSON.stringify({
          ok: true,
          texto: JSON.stringify({
            objetivoReal: "mock",
            problemaNegocio: "mock",
            natureza: "decisao"
          })
        }),
        { status: 200 }
      );
    }
    return new Response("{}", { status: 404 });
  };
});

afterEach(() => {
  globalThis.fetch = fetchPrev;
});

test("F19 detectors: T09/T19 são consulta de estado (não E2.1)", () => {
  const n09 = normalizarTexto(MSG_T09);
  const n19 = normalizarTexto(MSG_T19);
  assert.equal(ehConsultaEstadoOperacional(n09), true);
  assert.equal(ehConsultaEstadoOperacional(n19), true);
  assert.equal(ehIntencaoExecutivaE21(n09), false);
  assert.equal(ehIntencaoExecutivaE21(n19), false);
  assert.equal(identificarConsultaEstado(MSG_T09).tipo, "estado_geral");
  assert.equal(identificarConsultaEstado(MSG_T19).tipo, "ultimo_job");
  assert.equal(classificar(MSG_T09).destino, "capacidade_operacional");
  assert.equal(classificar(MSG_T09).permiteJob, false);
  assert.equal(classificar(MSG_T19).destino, "capacidade_operacional");
  assert.equal(classificar(MSG_T19).permiteJob, false);
});

test("F19: CTO-003 não intercepta T09/T19 com operação aberta", () => {
  const estadoAberto = {
    operacaoAberta: true,
    requerRecuperacao: false,
    modoOperacional: "executar",
    jobActivo: { id: "JOB-000122", titulo: "proposta", estado: "dispatched" },
    sinais: {
      pending: 0,
      running: 1,
      failed: 0,
      dispatcher: true,
      handoff: false,
      agentErro: false,
      gatePendente: 0
    }
  };
  const jobs = [
    {
      id: "JOB-000122",
      titulo: "proposta",
      estado: "dispatched",
      projeto: "coa-f19"
    }
  ];
  assert.equal(
    deveInterceptarOperacional({
      texto: MSG_T09,
      estadoOperacional: estadoAberto,
      jobs,
      missaoActiva: { id: "coa-f19", nome: "F19" }
    }),
    false
  );
  assert.equal(
    deveInterceptarOperacional({
      texto: MSG_T19,
      estadoOperacional: estadoAberto,
      jobs,
      missaoActiva: { id: "coa-f19", nome: "F19" }
    }),
    false
  );
});

test("F19-T09 EE: após Job aberto, consulta não cria Job e responde estado", async () => {
  const coa = abrirCoaParaTeste("coa-f19-t09", "F19 T09");
  definirCoaAtivo(coa);
  const fila = criarPublicadorFilaMemoria();

  const outExec = await executiveEngine.executar(
    { texto: MSG_EXEC, historico: [], coaId: coa.id },
    { publicarJob: fila.publicarJob.bind(fila) }
  );
  assert.equal(outExec.modo, "motor_execucao");
  assert.equal(fila.jobs.length, 1);
  const jobsAntes = fila.jobs.length;

  const out = await executiveEngine.executar(
    {
      texto: MSG_T09,
      historico: [
        { papel: "usuario", texto: MSG_EXEC, coaId: coa.id },
        { papel: "ceo", texto: String(outExec.mensagem), coaId: coa.id }
      ],
      coaId: coa.id
    },
    {
      publicarJob: fila.publicarJob.bind(fila),
      listarJobs: async () =>
        fila.jobs.map((j) => ({
          id: j.id,
          titulo: j.titulo,
          estado: j.estado || "dispatched",
          projeto: coa.id,
          criadoEm: j.criadoEm || new Date().toISOString()
        })),
      listarPorEstado: async () =>
        fila.jobs.map((j) => ({
          id: j.id,
          titulo: j.titulo,
          estado: j.estado || "dispatched",
          projeto: coa.id,
          criadoEm: j.criadoEm || new Date().toISOString()
        })),
      leitoresConsciencia: {
        F1: async () =>
          fila.jobs.map((j) => ({
            id: j.id,
            titulo: j.titulo,
            status: j.estado || "dispatched"
          })),
        F2: async () => [],
        F3: async () => [],
        F4: async () => null,
        F5: async () => null,
        F6: async () => null,
        F7: async () => null
      }
    }
  );

  assert.equal(fila.jobs.length, jobsAntes, "T09 não pode criar Job");
  assert.notEqual(out.modo, "motor_execucao");
  assert.notEqual(out.modo, "interceptacao_operacional");
  assert.notEqual(out.modo, "mre");
  assert.equal(llmCalls, 0);
  assert.equal(
    out.modo === "consulta_estado" ||
      out.dados?.encaminhamento?.destino === "capacidade_operacional" ||
      out.dados?.tipoConsulta === "estado_geral",
    true
  );
  assert.equal(out.dados?.consultaSemMutacao !== false, true);
  const msg = String(out.mensagem);
  assert.match(msg, /projeto|COA|Jobs?|estado|sess/i);
  assert.doesNotMatch(msg, /Job JOB-\d+ criado/i);
});

test("F19-T19 EE: consulta último Job do COA sem MRE e sem criar Job", async () => {
  const coa = abrirCoaParaTeste("coa-f19-t19", "F19 T19");
  definirCoaAtivo(coa);
  const fila = criarPublicadorFilaMemoria();

  const outExec = await executiveEngine.executar(
    { texto: MSG_EXEC, historico: [], coaId: coa.id },
    { publicarJob: fila.publicarJob.bind(fila) }
  );
  assert.equal(fila.jobs.length, 1);
  const jobId = fila.jobs[0].id;
  const jobsAntes = fila.jobs.length;

  const listar = async () =>
    fila.jobs.map((j) => ({
      id: j.id,
      titulo: j.titulo || "proposta",
      estado: j.estado || "dispatched",
      projeto: coa.id,
      criadoEm: j.criadoEm || "2026-09-20T16:23:43.422Z"
    }));

  const out = await executiveEngine.executar(
    {
      texto: MSG_T19,
      historico: [
        { papel: "usuario", texto: MSG_EXEC, coaId: coa.id },
        { papel: "ceo", texto: String(outExec.mensagem), coaId: coa.id }
      ],
      coaId: coa.id
    },
    {
      publicarJob: fila.publicarJob.bind(fila),
      listarJobs: listar,
      listarPorEstado: listar,
      leitoresConsciencia: {
        F1: async () =>
          fila.jobs.map((j) => ({
            id: j.id,
            titulo: j.titulo,
            status: j.estado || "dispatched"
          })),
        F2: async () => [],
        F3: async () => [],
        F4: async () => null,
        F5: async () => null,
        F6: async () => null,
        F7: async () => null
      }
    }
  );

  assert.equal(fila.jobs.length, jobsAntes, "T19 não pode criar Job");
  assert.notEqual(out.modo, "mre");
  assert.notEqual(out.modo, "motor_execucao");
  assert.notEqual(out.modo, "interceptacao_operacional");
  assert.equal(llmCalls, 0);
  assert.equal(
    out.dados?.tipoConsulta === "ultimo_job" ||
      out.modo === "consulta_estado" ||
      out.dados?.encaminhamento?.destino === "capacidade_operacional",
    true
  );
  const msg = String(out.mensagem);
  assert.match(msg, new RegExp(jobId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.match(msg, /dispatched|pending|running|completed|estado/i);
  assert.doesNotMatch(msg, /lastro insuficiente|Falha técnica no raciocínio/i);
  assert.doesNotMatch(msg, /Job JOB-\d+ criado/i);
});

test("F19 regressão C5/F12: Execute agora continua motor_execucao", async () => {
  assert.equal(classificar(MSG_F12).destino, "motor_execucao");
  const coa = abrirCoaParaTeste("coa-f19-c5", "F19 C5");
  definirCoaAtivo(coa);
  const fila = criarPublicadorFilaMemoria();
  const out = await executiveEngine.executar(
    { texto: MSG_F12, historico: [], coaId: coa.id },
    { publicarJob: fila.publicarJob.bind(fila) }
  );
  assert.equal(out.modo, "motor_execucao");
  assert.equal(out.dados?.encaminhamento?.destino, "motor_execucao");
  // Gate G2 pode adiar publicação — o destino continua C3 (não consulta).
  assert.equal(
    fila.jobs.length >= 1 || out.dados?.motor?.aguardandoGate === true,
    true
  );
  assert.notEqual(out.modo, "consulta_estado");
});

test("F19 regressão C10/F16: estado actual da sessão directo", async () => {
  assert.equal(ehConsultaEstadoOperacional(normalizarTexto(MSG_C10)), true);
  assert.equal(identificarConsultaEstado(MSG_C10).tipo, "estado_geral");
  const coa = abrirCoaParaTeste("coa-f19-c10", "F19 C10");
  definirCoaAtivo(coa);
  const fila = criarPublicadorFilaMemoria();
  const out = await executiveEngine.executar(
    {
      texto: MSG_C10,
      historico: [
        {
          papel: "ceo",
          texto: "Job JOB-000104 em recuperação.",
          coaId: coa.id
        }
      ],
      coaId: coa.id
    },
    {
      publicarJob: fila.publicarJob.bind(fila),
      leitoresConsciencia: {
        F1: async () => [
          { id: "JOB-000104", titulo: "bugs", status: "failed" }
        ],
        F2: async () => [],
        F3: async () => [],
        F4: async () => null,
        F5: async () => null,
        F6: async () => null,
        F7: async () => null
      }
    }
  );
  assert.equal(fila.jobs.length, 0);
  assert.equal(llmCalls, 0);
  assert.notEqual(out.modo, "mre");
  assert.notEqual(out.modo, "motor_execucao");
});
