/**
 * Testes ponte Parecer → Job — IMP-056 E3
 * (sem Orquestrador / Dispatcher / UI / HTTP real).
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { parecerDelegarValido, parecerSolicitarDadosValido } from "../mre/parecer/fixtures.js";
import { montarCiclo } from "./dominio.js";
import {
  parecerRequerDespacho,
  extrairJobSpec,
  montarPayloadJobDoParecer,
  sanitizarPayloadJob,
  criarPublicadorFilaMemoria,
  criarJobDoParecer,
  criarJobDoParecerComCiclo,
  contextoPoliticaDoParecer
} from "./ponteParecerJob.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

function parecerDespacho(mut = {}) {
  const p = parecerDelegarValido();
  return {
    ...p,
    ...mut,
    acao: { ...p.acao, ...(mut.acao || {}) },
    decisaoExecutiva: {
      ...p.decisaoExecutiva,
      ...(mut.decisaoExecutiva || {})
    }
  };
}

test("E3-CA1: publicação resulta em Job pending via caminho REQ-045 (porta)", async () => {
  const fila = criarPublicadorFilaMemoria();
  const parecer = parecerDespacho();
  const r = await criarJobDoParecer(parecer, {
    publicarJob: (pedido) => fila.publicarJob(pedido),
    decisaoAprovacao: null,
    contextoPolitica: { requerDespacho: true }
  });
  assert.equal(r.publicado, true);
  assert.equal(r.job.estado, "pending");
  assert.match(r.job.id, /^JOB-TEST-/);
  assert.equal(fila.jobs.length, 1);
  assert.equal(fila.jobs[0].estado, "pending");
  assert.equal(r.payload.titulo, parecer.acao.job.titulo);
  assert.equal(r.payload.origem, "ceo");
});

test("E3-CA2: Job não contém referência ao Cursor/executor", async () => {
  const fila = criarPublicadorFilaMemoria();
  const parecer = parecerDespacho({
    acao: {
      tipo: "despachar",
      descricao: "x",
      job: {
        titulo: "Tarefa limpa",
        descricao: "Implementar feature sem nomear executor"
      }
    }
  });
  const r = await criarJobDoParecer(parecer, {
    publicarJob: fila.publicarJob.bind(fila)
  });
  assert.equal(r.publicado, true);
  const blob = JSON.stringify(r.job) + JSON.stringify(r.payload);
  assert.equal(/\bcursor\b/i.test(blob), false);
  assert.equal(/@cursor\/sdk/i.test(blob), false);
  assert.equal("executor" in r.payload, false);
  assert.equal("cursor" in r.payload, false);

  const sujo = sanitizarPayloadJob({
    titulo: "X",
    descricao: "Usar Cursor para implementar",
    origem: "ceo"
  });
  assert.equal(sujo.ok, false);

  const comCampo = sanitizarPayloadJob({
    titulo: "X",
    descricao: "Y",
    cursor: "agent",
    origem: "ceo"
  });
  assert.equal(comCampo.ok, true);
  assert.equal("cursor" in comCampo.pedido, false);

  const bloqueado = await criarJobDoParecer(
    parecerDespacho({
      acao: {
        tipo: "despachar",
        descricao: "x",
        job: {
          titulo: "Bad",
          descricao: "Chamar o Cursor SDK agora"
        }
      }
    }),
    { publicarJob: fila.publicarJob.bind(fila) }
  );
  assert.equal(bloqueado.publicado, false);
  assert.equal(bloqueado.motivo, "payload_proibido");
  assert.equal(fila.jobs.length, 1);
});

test("E3-CA3: sem delegar/despachar ⇒ nenhuma publicação", async () => {
  const fila = criarPublicadorFilaMemoria();
  const sem = parecerSolicitarDadosValido();
  assert.equal(parecerRequerDespacho(sem), false);
  const r = await criarJobDoParecer(sem, {
    publicarJob: fila.publicarJob.bind(fila)
  });
  assert.equal(r.publicado, false);
  assert.equal(r.motivo, "sem_despacho");
  assert.equal(fila.jobs.length, 0);

  const soOrientar = parecerDespacho({
    decisaoExecutiva: { estado: "aprovar" },
    acao: { tipo: "orientar", descricao: "só falar", job: null }
  });
  assert.equal(parecerRequerDespacho(soOrientar), false);
  const r2 = await criarJobDoParecer(soOrientar, {
    publicarJob: fila.publicarJob.bind(fila)
  });
  assert.equal(r2.publicado, false);
  assert.equal(fila.jobs.length, 0);

  // Gate rejeitado: despacho com gatilho mas sem aprovação
  const comGate = parecerDespacho({
    acao: {
      tipo: "despachar",
      descricao: "x",
      job: {
        titulo: "Alterar código",
        descricao: "Patch no repo",
        alteraCodigo: true
      }
    }
  });
  const r3 = await criarJobDoParecer(comGate, {
    publicarJob: fila.publicarJob.bind(fila),
    decisaoAprovacao: "rejeitado"
  });
  assert.equal(r3.publicado, false);
  assert.equal(r3.motivo, "aprovacao_ausente");
  assert.equal(fila.jobs.length, 0);

  const r4 = await criarJobDoParecer(comGate, {
    publicarJob: fila.publicarJob.bind(fila),
    decisaoAprovacao: "adiado"
  });
  assert.equal(r4.publicado, false);
  assert.equal(fila.jobs.length, 0);
});

test("E3-CA4: rastreio jobId ↔ parecer/acao", async () => {
  const fila = criarPublicadorFilaMemoria();
  const registro = new Map();
  const parecer = parecerDespacho({ id: "parecer-e3-rastreio" });
  const r = await criarJobDoParecerComCiclo(parecer, {
    publicarJob: fila.publicarJob.bind(fila),
    registro,
    ciclo: montarCiclo("ciclo-e3", "Plano", {
      parecerId: "parecer-e3-rastreio",
      requerDespacho: true
    })
  });
  assert.equal(r.publicado, true);
  assert.equal(r.rastreio.parecerId, "parecer-e3-rastreio");
  assert.equal(r.rastreio.jobId, r.job.id);
  assert.equal(r.payload.parecerId, "parecer-e3-rastreio");
  assert.equal(registro.get("parecer-e3-rastreio"), r.job.id);
  assert.equal(r.ciclo.etapa, "CriacaoDoJob");
  assert.equal(r.ciclo.jobId, r.job.id);
  assert.equal(r.ciclo.parecerId, "parecer-e3-rastreio");

  const idem = await criarJobDoParecer(parecer, {
    publicarJob: fila.publicarJob.bind(fila),
    registro
  });
  assert.equal(idem.publicado, false);
  assert.equal(idem.idempotente, true);
  assert.equal(fila.jobs.length, 1);
});

test("integração E1/E2: política + domínio na ponte", async () => {
  const fila = criarPublicadorFilaMemoria();
  const parecer = parecerDespacho({
    acao: {
      tipo: "despachar",
      descricao: "docs",
      job: {
        titulo: "Docs produto",
        descricao: "Actualizar REQ",
        alteraDocsProduto: true
      }
    }
  });
  const ctx = contextoPoliticaDoParecer(parecer);
  assert.equal(ctx.requerDespacho, true);
  assert.equal(ctx.alteraDocsProduto, true);

  const semGate = await criarJobDoParecer(parecer, {
    publicarJob: fila.publicarJob.bind(fila)
  });
  assert.equal(semGate.publicado, false);
  assert.equal(semGate.motivo, "aprovacao_ausente");

  const comGate = await criarJobDoParecer(parecer, {
    publicarJob: fila.publicarJob.bind(fila),
    decisaoAprovacao: "aprovado",
    ciclo: montarCiclo("c-gate", "Aprovacao", {
      requerDespacho: true,
      exigeAprovacao: true,
      decisaoAprovacao: "aprovado",
      parecerId: parecer.id
    })
  });
  assert.equal(comGate.publicado, true);
  assert.equal(comGate.ciclo.etapa, "CriacaoDoJob");
  assert.equal(extrairJobSpec(parecer).ok, true);
  assert.equal(montarPayloadJobDoParecer(parecer).ok, true);
});

test("E3: módulo sem Orquestrador/Dispatcher/UI/HTTP", () => {
  const src = readFileSync(join(__dirname, "ponteParecerJob.js"), "utf8");
  assert.equal(/@cursor\/sdk/.test(src), false);
  assert.equal(/filaCliente/.test(src), false);
  assert.equal(/node:fs|writeFile/.test(src), false);
  assert.equal(/document\.|window\./.test(src), false);
  assert.equal(/from\s+["'].*dispatcher/i.test(src), false);
  assert.equal(/executiveEngine/.test(src), false);
  // porta injectável — não fetch directo
  assert.equal(/\bfetch\s*\(/.test(src), false);
});
