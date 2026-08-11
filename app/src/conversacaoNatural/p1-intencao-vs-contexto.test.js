/**
 * P1 — Intenção actual > resposta específica > contexto > resumo genérico.
 */

import assert from "node:assert/strict";
import { test, beforeEach } from "node:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { executiveEngine } from "../executiveEngine/index.js";
import { criarPublicadorFilaMemoria } from "../motorExecucao/ponteParecerJob.js";
import { criarFilaExecucao } from "../../server/executionQueue.js";
import { criarStoreContextoGate } from "../continuidadeGate/contexto.js";
import { resetStoreContinuidadePadrao } from "../continuidadeGate/integracaoConversa.js";
import { resetEstadoTopicosSessao } from "../classificadorIntencao/topicosSessao.js";
import { resetEstadoObjectivoSessao } from "../classificadorIntencao/objectivoSessao.js";
import { reiniciarAutoridadeDelegadaParaTestes } from "../autoridadeDelegada/autoridadeDelegada.js";
import {
  devePreservarRespostaNucleo,
  deveAnexarContextoExecutivo,
  ehPedidoResumoExecutivo,
  ehInstrucaoUsavelComoObjectivo
} from "./prioridadeIntencao.js";
import { classificarTipoTurno, TIPO_TURNO } from "./tiposTurno.js";
import { aplicarConversacaoNatural } from "./index.js";

beforeEach(() => {
  resetStoreContinuidadePadrao();
  resetEstadoTopicosSessao();
  resetEstadoObjectivoSessao();
  reiniciarAutoridadeDelegadaParaTestes();
});

function assertSemResumoGenerico(msg) {
  const t = String(msg || "");
  assert.doesNotMatch(t, /Objectivo principal:/i);
  assert.doesNotMatch(t, /Mantemos o objectivo:/i);
  assert.doesNotMatch(t, /Foco executivo:/i);
  assert.doesNotMatch(t, /Antecipo pendência aberta:/i);
  assert.doesNotMatch(t, /O que mudaria esta decisão/i);
}

function filaComJob068() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "ceo-p1-"));
  const fila = criarFilaExecucao(root);
  const j = fila.publicar({
    titulo: "Homologação",
    descricao: "teste"
  });
  const alvo = path.join(fila.queueDir, "JOB-000068.json");
  fs.renameSync(path.join(fila.queueDir, `${j.id}.json`), alvo);
  const job = JSON.parse(fs.readFileSync(alvo, "utf8"));
  job.id = "JOB-000068";
  job.estado = "completed";
  job.verificacao = { ok: true, motivo: "evidencia_estruturada" };
  job.resultado = { status: "sucesso", resumo: "P0-2 HOMOLOGADO" };
  fs.writeFileSync(alvo, JSON.stringify(job, null, 2));
  return {
    obterJob: (id) => fila.lerJob(id),
    listarJobs: (e) => fila.listarPorEstado(e == null ? null : e)
  };
}

test("P1-unit: perguntas não viram objectivo; resumo só quando pedido", () => {
  assert.equal(
    ehInstrucaoUsavelComoObjectivo("Qual é o estado do JOB-000068?"),
    false
  );
  assert.equal(ehPedidoResumoExecutivo("Onde estamos no projeto?"), true);
  assert.equal(
    devePreservarRespostaNucleo({
      intencaoId: "consultar_estado",
      modo: "consulta_estado",
      instrucao: "Qual é o estado do JOB-000068?"
    }),
    true
  );
  assert.equal(
    deveAnexarContextoExecutivo({
      instrucao: "Analise a proposta do bairro."
    }),
    false
  );
  assert.equal(
    deveAnexarContextoExecutivo({
      instrucao: "O que achas desta direcção?"
    }),
    false
  );
  assert.equal(
    deveAnexarContextoExecutivo({
      instrucao: "Onde estamos no projeto?"
    }),
    true
  );
  assert.equal(
    classificarTipoTurno({
      modo: "consulta_estado",
      intencaoId: "consultar_estado",
      instrucao: "Qual é o estado do JOB-000068?"
    }),
    TIPO_TURNO.SISTEMA
  );
});

test("T1 — Consulta Job sem resumo executivo", async () => {
  const ports = filaComJob068();
  const pub = criarPublicadorFilaMemoria();
  const out = await executiveEngine.executar("Qual é o estado do JOB-000068?", {
    ...ports,
    publicarJob: pub.publicarJob.bind(pub)
  });
  assert.equal(pub.jobs.length, 0);
  assert.match(String(out.mensagem), /JOB-000068/);
  assert.match(String(out.mensagem), /completed/i);
  assertSemResumoGenerico(out.mensagem);
  assert.ok(
    !String(out.mensagem).trim().startsWith("Objectivo"),
    "resposta não começa com Objectivo"
  );
});

test("T2 — Consulta Gate sem objectivo/prioridade genéricos", async () => {
  const store = criarStoreContextoGate();
  store.abrirGate({
    gateId: "G-P1",
    parecerId: "parecer-p1",
    solicitacaoResumo: "Aprovar expansão do bairro"
  });
  const pub = criarPublicadorFilaMemoria();
  const out = await executiveEngine.executar("Qual é o Gate pendente?", {
    storeContinuidade: store,
    publicarJob: pub.publicarJob.bind(pub)
  });
  assert.equal(pub.jobs.length, 0);
  assert.match(String(out.mensagem), /G-P1|Gate/i);
  assertSemResumoGenerico(out.mensagem);
});

test("T3 — Prioridade actual", async () => {
  const pub = criarPublicadorFilaMemoria();
  const out = await executiveEngine.executar("Qual é a prioridade atual?", {
    publicarJob: pub.publicarJob.bind(pub)
  });
  assert.equal(pub.jobs.length, 0);
  assertSemResumoGenerico(out.mensagem);
  assert.doesNotMatch(String(out.mensagem), /^Objectivo principal:/i);
});

test("T4 — Decisão mais recente", async () => {
  const pub = criarPublicadorFilaMemoria();
  const out = await executiveEngine.executar(
    "Qual foi a decisão mais recente?",
    { publicarJob: pub.publicarJob.bind(pub) }
  );
  assert.equal(pub.jobs.length, 0);
  assertSemResumoGenerico(out.mensagem);
});

test("T5 — Pendências abertas", async () => {
  const pub = criarPublicadorFilaMemoria();
  const out = await executiveEngine.executar(
    "Quais são as pendências abertas?",
    { publicarJob: pub.publicarJob.bind(pub) }
  );
  assert.equal(pub.jobs.length, 0);
  assert.match(String(out.mensagem), /[Pp]endênc/);
  assert.doesNotMatch(String(out.mensagem), /Objectivo principal:/i);
});

test("T6 — Consulta geral: resumo executivo apropriado", async () => {
  const pub = criarPublicadorFilaMemoria();
  const out = await executiveEngine.executar("Onde estamos no projeto?", {
    publicarJob: pub.publicarJob.bind(pub)
  });
  assert.equal(pub.jobs.length, 0);
  // Pode mencionar objectivo/estado do projeto — é o pedido
  assert.ok(String(out.mensagem).length > 20);
});

test("T7 — Saudação natural, sem relatório", async () => {
  const pub = criarPublicadorFilaMemoria();
  const out = await executiveEngine.executar("Bom dia, CEO.", {
    publicarJob: pub.publicarJob.bind(pub)
  });
  assert.equal(pub.jobs.length, 0);
  assert.match(String(out.mensagem), /Bom dia/i);
  assert.doesNotMatch(String(out.mensagem), /Objectivo principal:/i);
  assert.doesNotMatch(String(out.mensagem), /0 decisões registradas/i);
});

test("T8 — Análise sem resumo executivo genérico", async () => {
  const pub = criarPublicadorFilaMemoria();
  const out = await executiveEngine.executar("Analise a proposta do bairro.", {
    publicarJob: pub.publicarJob.bind(pub)
  });
  assert.equal(pub.jobs.length, 0);
  assert.notEqual(out.modo, "motor_execucao");
  assertSemResumoGenerico(out.mensagem);
});

test("T9 — Execução segue C3/Gate", async () => {
  const pub = criarPublicadorFilaMemoria();
  const out = await executiveEngine.executar("Implemente o outdoor.", {
    publicarJob: pub.publicarJob.bind(pub),
    decisaoAprovacao: null
  });
  assert.equal(out.modo, "motor_execucao");
  assert.ok(
    out.dados?.motor?.aguardandoGate === true ||
      out.dados?.motor?.publicado === true ||
      pub.jobs.length >= 1
  );
});

test("T10 — Consulta + Não execute → estado, 0 Jobs", async () => {
  const ports = filaComJob068();
  const pub = criarPublicadorFilaMemoria();
  const out = await executiveEngine.executar(
    "Qual é o estado do JOB-000068? Não execute nada.",
    { ...ports, publicarJob: pub.publicarJob.bind(pub) }
  );
  assert.equal(pub.jobs.length, 0);
  assert.match(String(out.mensagem), /JOB-000068/);
  assertSemResumoGenerico(out.mensagem);
});

test("T11 — Estado actual com Gate pendente: responde, não re-pede aprovação", async () => {
  const store = criarStoreContextoGate();
  const pub = criarPublicadorFilaMemoria();
  await executiveEngine.executar("Resolva os bugs.", {
    storeContinuidade: store,
    publicarJob: pub.publicarJob.bind(pub),
    registro: new Map()
  });
  assert.equal(store.temGatePendente(), true);
  const jobsAntes = pub.jobs.length;

  const out = await executiveEngine.executar("Qual é o estado atual?", {
    storeContinuidade: store,
    publicarJob: pub.publicarJob.bind(pub)
  });
  assert.equal(pub.jobs.length, jobsAntes);
  assert.notEqual(out.modo, "continuidade_gate_clarificacao");
  assert.doesNotMatch(
    String(out.mensagem),
    /^Aguardando aprovação \(Gate/i
  );
});

test("T12 — Mudança de assunto com Gate: processa nova intenção", async () => {
  const store = criarStoreContextoGate();
  const pub = criarPublicadorFilaMemoria();
  await executiveEngine.executar("Resolva os bugs.", {
    storeContinuidade: store,
    publicarJob: pub.publicarJob.bind(pub),
    registro: new Map()
  });
  const jobsAntes = pub.jobs.length;

  const out = await executiveEngine.executar(
    "Quero agora analisar outra proposta.",
    {
      storeContinuidade: store,
      publicarJob: pub.publicarJob.bind(pub)
    }
  );
  assert.equal(pub.jobs.length, jobsAntes);
  assert.notEqual(out.modo, "motor_execucao");
  assert.doesNotMatch(
    String(out.mensagem),
    /^Aguardando aprovação \(Gate/i
  );
});

test("P1: CN não prefixa Objectivo em prosa de consulta", () => {
  const cn = aplicarConversacaoNatural({
    mensagem:
      "ID: JOB-000068\nEstado atual: completed\nVerificação do CEO: Sim.",
    ok: true,
    modo: "consulta_estado",
    instrucao: "Qual é o estado do JOB-000068?",
    dados: { intencao: { id: "consultar_estado" } }
  });
  assert.equal(cn.tipoTurno, TIPO_TURNO.SISTEMA);
  assert.match(cn.texto, /JOB-000068/);
  assert.doesNotMatch(cn.texto, /Objectivo principal/i);
});
