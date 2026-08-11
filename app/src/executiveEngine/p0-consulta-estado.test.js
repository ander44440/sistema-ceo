/**
 * P0-3 — Consulta de estado deve produzir resposta (T1–T10).
 * Somente leitura; zero Jobs criados pela consulta.
 */

import assert from "node:assert/strict";
import { test, beforeEach } from "node:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { classificar, ehConsultaEstadoOperacional, normalizarTexto } from "../classificadorIntencao/regras.js";
import { executiveEngine } from "./index.js";
import { criarPublicadorFilaMemoria } from "../motorExecucao/ponteParecerJob.js";
import { criarFilaExecucao } from "../../server/executionQueue.js";
import { criarStoreContextoGate } from "../continuidadeGate/contexto.js";
import { resetStoreContinuidadePadrao } from "../continuidadeGate/integracaoConversa.js";
import { resetEstadoTopicosSessao } from "../classificadorIntencao/topicosSessao.js";
import { resetEstadoObjectivoSessao } from "../classificadorIntencao/objectivoSessao.js";
import { reiniciarAutoridadeDelegadaParaTestes } from "../autoridadeDelegada/autoridadeDelegada.js";
import {
  identificarConsultaEstado,
  executarConsultaEstado
} from "./capacidades/consultarEstado.js";

beforeEach(() => {
  resetStoreContinuidadePadrao();
  resetEstadoTopicosSessao();
  resetEstadoObjectivoSessao();
  reiniciarAutoridadeDelegadaParaTestes();
  executiveEngine.reiniciarAcompanhamentoParaTestes();
});

function criarFilaTemp() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "ceo-p03-"));
  const fila = criarFilaExecucao(root);
  return { root, fila };
}

function portasDaFila(fila, store = null) {
  return {
    obterJob: (id) => fila.lerJob(id),
    listarJobs: (estado) => fila.listarPorEstado(estado == null ? null : estado),
    listarPorEstado: (estado) => fila.listarPorEstado(estado == null ? null : estado),
    storeContinuidade: store || undefined,
    publicarJob: async (pedido) => fila.publicar(pedido)
  };
}

function seedJob067(fila, patch = {}) {
  const job = fila.publicar({
    titulo: "Homologação P0-3",
    descricao: "Job de teste consulta estado",
    prioridade: "alta",
    tipo: "execucao_tecnica"
  });
  // Forçar ID estável JOB-000067 quando possível — senão usar o id gerado
  const alvo = path.join(fila.queueDir, "JOB-000067.json");
  const atual = path.join(fila.queueDir, `${job.id}.json`);
  let reg = { ...job, id: "JOB-000067", ...patch };
  if (atual !== alvo && fs.existsSync(atual)) {
    fs.renameSync(atual, alvo);
  }
  fs.writeFileSync(alvo, JSON.stringify(reg, null, 2) + "\n", "utf8");
  return fila.lerJob("JOB-000067");
}

async function consultar(texto, deps) {
  const out = await executiveEngine.executar(texto, deps);
  return out;
}

test("P0-3 unit: identificarConsultaEstado", () => {
  assert.equal(
    identificarConsultaEstado("Qual é o estado do JOB-000067?").tipo,
    "estado_job"
  );
  assert.equal(
    identificarConsultaEstado(
      "Qual foi o resultado produzido pelo Agent no JOB-000067?"
    ).tipo,
    "resultado_job"
  );
  assert.equal(
    identificarConsultaEstado("O JOB-000067 já foi verificado pelo CEO?").tipo,
    "verificacao_job"
  );
  assert.equal(
    identificarConsultaEstado("Quais Gates estão pendentes?").tipo,
    "gates"
  );
  assert.equal(
    identificarConsultaEstado("Qual é o estado da fila?").tipo,
    "fila"
  );
});

test("T1 — estado do JOB-000067 → estado real, 0 Jobs", async () => {
  const { fila } = criarFilaTemp();
  seedJob067(fila, {
    estado: "result",
    resultado: { status: "sucesso", resumo: "P0-2 HOMOLOGADO" }
  });
  const deps = portasDaFila(fila);
  const pub = criarPublicadorFilaMemoria();
  deps.publicarJob = pub.publicarJob.bind(pub);

  const texto = "Qual é o estado do JOB-000067?";
  assert.equal(ehConsultaEstadoOperacional(normalizarTexto(texto)), true);
  assert.notEqual(classificar(texto).classe, "trabalho_executivo");

  const out = await consultar(texto, deps);
  assert.equal(pub.jobs.length, 0);
  assert.match(String(out.mensagem), /JOB-000067/);
  assert.match(String(out.mensagem), /result/i);
  assert.doesNotMatch(
    String(out.mensagem),
    /Pedido interpretado como consulta\/análise/
  );
  assert.equal(out.dados?.consultaSemMutacao, true);
});

test("T2 — estado + Não execute nada → estado real, 0 Jobs", async () => {
  const { fila } = criarFilaTemp();
  seedJob067(fila, { estado: "running" });
  const pub = criarPublicadorFilaMemoria();
  const deps = { ...portasDaFila(fila), publicarJob: pub.publicarJob.bind(pub) };

  const texto =
    "Qual é o estado atual do JOB-000067?\nNão execute nada.";
  const out = await consultar(texto, deps);
  assert.equal(pub.jobs.length, 0);
  assert.match(String(out.mensagem), /JOB-000067/);
  assert.match(String(out.mensagem), /running/i);
});

test("T3 — resultado do Agent → real ou ainda não disponível", async () => {
  const { fila } = criarFilaTemp();
  seedJob067(fila, {
    estado: "result",
    resultado: { status: "sucesso", resumo: "artefacto ok" }
  });
  const pub = criarPublicadorFilaMemoria();
  const deps = { ...portasDaFila(fila), publicarJob: pub.publicarJob.bind(pub) };

  const out = await consultar(
    "Qual foi o resultado produzido pelo Agent no JOB-000067?",
    deps
  );
  assert.equal(pub.jobs.length, 0);
  assert.match(String(out.mensagem), /artefacto ok|ainda não disponível/i);
});

test("T4 — verificação pelo CEO", async () => {
  const { fila } = criarFilaTemp();
  seedJob067(fila, { estado: "result", resultado: { resumo: "x" } });
  const pub = criarPublicadorFilaMemoria();
  const deps = { ...portasDaFila(fila), publicarJob: pub.publicarJob.bind(pub) };

  const out = await consultar(
    "O JOB-000067 já foi verificado pelo CEO?",
    deps
  );
  assert.equal(pub.jobs.length, 0);
  assert.match(String(out.mensagem), /Não|Sim/i);
  assert.match(String(out.mensagem), /verific/i);
});

test("T5 — Gates pendentes", async () => {
  const store = criarStoreContextoGate();
  store.abrirGate({
    gateId: "G-P03",
    parecerId: "parecer-p03",
    solicitacaoResumo: "Aprovar homologação P0-3"
  });
  assert.equal(store.temGatePendente(), true);

  const { fila } = criarFilaTemp();
  const pub = criarPublicadorFilaMemoria();
  const deps = {
    ...portasDaFila(fila, store),
    publicarJob: pub.publicarJob.bind(pub),
    storeContinuidade: store
  };

  const out = await consultar("Quais Gates estão pendentes?", deps);
  assert.equal(pub.jobs.length, 0);
  assert.match(String(out.mensagem), /G-P03|Gate/i);
  assert.doesNotMatch(String(out.mensagem), /Aprovado\b/i);
});

test("T6 — pendências abertas", async () => {
  const { fila } = criarFilaTemp();
  const pub = criarPublicadorFilaMemoria();
  const pendencias = [{ texto: "Fechar VAL-011", status: "aberta" }];
  const deps = {
    ...portasDaFila(fila),
    publicarJob: pub.publicarJob.bind(pub)
  };

  // Via handler directo com memória injectada
  const direto = await executarConsultaEstado("Quais são as pendências abertas?", {
    lerMemoriaFn: () => ({ pendencias }),
    ...portasDaFila(fila)
  });
  assert.match(direto.mensagem, /Fechar VAL-011/);

  const out = await consultar("Quais são as pendências abertas?", deps);
  assert.equal(pub.jobs.length, 0);
  assert.match(String(out.mensagem), /[Pp]endênc/);
});

test("T7 — estado da fila", async () => {
  const { fila } = criarFilaTemp();
  seedJob067(fila, { estado: "pending" });
  const pub = criarPublicadorFilaMemoria();
  const deps = { ...portasDaFila(fila), publicarJob: pub.publicarJob.bind(pub) };

  const out = await consultar("Qual é o estado da fila?", deps);
  assert.equal(pub.jobs.length, 0);
  assert.match(String(out.mensagem), /fila|pending|JOB/i);
  assert.equal(classificar("Qual é o estado da fila?").permiteJob, false);
});

test("T8 — Job inexistente", async () => {
  const { fila } = criarFilaTemp();
  const pub = criarPublicadorFilaMemoria();
  const deps = { ...portasDaFila(fila), publicarJob: pub.publicarJob.bind(pub) };

  const out = await consultar("Mostre o estado do JOB-000999999.", deps);
  assert.equal(pub.jobs.length, 0);
  assert.match(String(out.mensagem), /n[aã]o foi encontrado/i);
});

test("T9 — consulta com Gate pendente → responde, sem Job, sem re-pedir aprovação", async () => {
  const store = criarStoreContextoGate();
  const pub = criarPublicadorFilaMemoria();
  const { fila } = criarFilaTemp();
  seedJob067(fila, { estado: "pending" });

  await executiveEngine.executar("Resolva os bugs.", {
    storeContinuidade: store,
    publicarJob: pub.publicarJob.bind(pub),
    registro: new Map()
  });
  assert.equal(store.temGatePendente(), true);
  const jobsAntes = pub.jobs.length;

  const out = await consultar("Qual é o estado do JOB-000067?", {
    ...portasDaFila(fila, store),
    publicarJob: pub.publicarJob.bind(pub),
    storeContinuidade: store
  });

  assert.equal(store.temGatePendente(), true);
  assert.equal(pub.jobs.length, jobsAntes);
  assert.match(String(out.mensagem), /JOB-000067/);
  assert.notEqual(out.modo, "continuidade_gate_clarificacao");
});

test("T10 — consulta após criar Job → não cria segundo Job", async () => {
  const { fila } = criarFilaTemp();
  const pub = criarPublicadorFilaMemoria();
  // Criar um Job real na fila injectada
  const criado = fila.publicar({
    titulo: "Job fresco T10",
    descricao: "teste",
    prioridade: "normal"
  });
  assert.ok(criado.id);

  const deps = {
    ...portasDaFila(fila),
    publicarJob: pub.publicarJob.bind(pub)
  };
  const out = await consultar(`Qual é o estado do ${criado.id}?`, deps);
  assert.equal(pub.jobs.length, 0);
  assert.match(String(out.mensagem), new RegExp(criado.id));
  assert.match(String(out.mensagem), /pending/i);
});
