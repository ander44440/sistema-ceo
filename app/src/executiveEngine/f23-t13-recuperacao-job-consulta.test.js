/**
 * F23 / VAL-094 T13 — consulta de Job em recuperação/dispatched sem falha MRE.
 */

import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";
import {
  classificar,
  ehConsultaEstadoOperacional,
  ehConsultaEstadoParaC4,
  ehIntencaoExecutivaE21,
  normalizarTexto
} from "../classificadorIntencao/regras.js";
import { identificarConsultaEstado } from "./capacidades/consultarEstado.js";
import { executiveEngine } from "./index.js";
import { abrirCoaParaTeste } from "./garantirCoaCatalogoTeste.js";
import { limparCoaAtivo, definirCoaAtivo } from "./coaSessao.js";
import { criarPublicadorFilaMemoria } from "../motorExecucao/ponteParecerJob.js";
import { resetStoreContinuidadePadrao } from "../continuidadeGate/integracaoConversa.js";
import { resetEstadoTopicosSessao } from "../classificadorIntencao/topicosSessao.js";
import { resetEstadoObjectivoSessao } from "../classificadorIntencao/objectivoSessao.js";
import { reiniciarAutoridadeDelegadaParaTestes } from "../autoridadeDelegada/autoridadeDelegada.js";
import { reiniciarEnvelopeSessaoParaTestes } from "../classificadorIntencao/envelopeSessaoCoa.js";

const MSG_T13 =
  "Há algum Job deste projeto em recuperação ou dispatched por concluir? Diga só o estado, sem criar Job novo.";

const MSG_F12 =
  "Execute agora: criar um Job para corrigir os bugs críticos do sprint e despachar para a fila.";

const MSG_C10 =
  "Qual é o estado actual da sessão? Responda de forma directa.";

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
          texto: "Não foi possível concluir a deliberação executiva com parecer válido."
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

test("F23-T13: detectors — recuperação/dispatched → C4 consulta, não E2.1", () => {
  const n = normalizarTexto(MSG_T13);
  assert.equal(ehConsultaEstadoOperacional(n), true);
  assert.equal(ehConsultaEstadoParaC4(n, {}), true);
  assert.equal(ehIntencaoExecutivaE21(n), false);
  assert.equal(identificarConsultaEstado(MSG_T13).tipo, "fila");
  const s = classificar(MSG_T13);
  assert.equal(s.classe, "comando_operacional");
  assert.equal(s.destino, "capacidade_operacional");
  assert.equal(s.permiteJob, false);
});

test("F23-T13 EE: Job dispatched → estado operacional, 0 Jobs novos, 0 MRE", async () => {
  const coa = abrirCoaParaTeste("coa-f23-t13", "F23 T13");
  definirCoaAtivo(coa);
  const fila = criarPublicadorFilaMemoria();
  const jobExistente = {
    id: "JOB-000200",
    titulo: "documentar decisao SulVerde",
    estado: "dispatched",
    projeto: coa.id,
    criadoEm: "2026-09-20T16:00:00.000Z"
  };
  // seed via publicar para manter API da fila memória
  await fila.publicarJob({
    id: jobExistente.id,
    titulo: jobExistente.titulo,
    objetivo: jobExistente.titulo,
    projeto: coa.id,
    estado: "dispatched"
  });
  // garantir estado dispatched no seed
  if (fila.jobs[0]) fila.jobs[0].estado = "dispatched";
  const jobsAntes = fila.jobs.length;

  const listar = async (estado) => {
    const todos = fila.jobs.map((j) => ({
      id: j.id,
      titulo: j.titulo,
      estado: j.estado || "dispatched",
      projeto: coa.id,
      criadoEm: j.criadoEm || jobExistente.criadoEm
    }));
    if (estado == null) return todos;
    return todos.filter((j) => j.estado === estado);
  };

  const out = await executiveEngine.executar(
    {
      texto: MSG_T13,
      historico: [
        {
          papel: "usuario",
          texto: "Execute agora: abra um Job para documentar SulVerde.",
          coaId: coa.id
        },
        {
          papel: "ceo",
          texto: "Job JOB-000200 criado (dispatched).",
          coaId: coa.id
        }
      ],
      coaId: coa.id
    },
    {
      publicarJob: fila.publicarJob.bind(fila),
      listarJobs: listar,
      listarPorEstado: listar,
      obterJob: async (id) =>
        fila.jobs.find((j) => j.id === id)
          ? {
              id,
              titulo: fila.jobs[0].titulo,
              estado: fila.jobs[0].estado || "dispatched",
              projeto: coa.id
            }
          : null,
      leitoresConsciencia: {
        F1: async () => [
          { id: "JOB-000200", titulo: "documentar", status: "dispatched" }
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

  assert.equal(fila.jobs.length, jobsAntes, "não criar Job novo");
  assert.equal(llmCalls, 0, "não enviar a MRE");
  assert.notEqual(out.modo, "mre");
  assert.notEqual(out.dados?.encaminhamento?.destino, "nucleo_mre");
  assert.notEqual(out.modo, "motor_execucao");
  assert.equal(
    out.modo === "consulta_estado" ||
      out.dados?.tipoConsulta === "fila" ||
      out.dados?.encaminhamento?.destino === "capacidade_operacional",
    true
  );
  const msg = String(out.mensagem);
  assert.match(msg, /JOB-000200|dispatched|fila|Jobs?/i);
  assert.equal(
    /Não foi possível concluir a deliberação|Falha técnica no raciocínio|lastro insuficiente/i.test(
      msg
    ),
    false
  );
  assert.doesNotMatch(msg, /Job JOB-\d+ criado/i);
});

test("F23: execução explícita continua C3", async () => {
  assert.equal(classificar(MSG_F12).destino, "motor_execucao");
  const coa = abrirCoaParaTeste("coa-f23-c3", "F23 C3");
  definirCoaAtivo(coa);
  const fila = criarPublicadorFilaMemoria();
  const out = await executiveEngine.executar(
    { texto: MSG_F12, historico: [], coaId: coa.id },
    { publicarJob: fila.publicarJob.bind(fila) }
  );
  assert.equal(out.modo, "motor_execucao");
  assert.ok(
    fila.jobs.length >= 1 || out.dados?.motor?.aguardandoGate === true
  );
});

test("F23: consulta de estado continua C4", () => {
  assert.equal(
    ehConsultaEstadoOperacional(normalizarTexto(MSG_C10)),
    true
  );
  assert.equal(identificarConsultaEstado(MSG_C10).tipo, "estado_geral");
  assert.equal(classificar(MSG_C10).destino, "capacidade_operacional");
});
