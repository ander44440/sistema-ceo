/**
 * Testes integração Orquestrador — IMP-056 E4
 * (sem Dispatcher real, sem UI, sem HTTP / @cursor/sdk).
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import {
  parecerDelegarValido,
  parecerSolicitarDadosValido
} from "../mre/parecer/fixtures.js";
import { aplicarEfeitosPosDeliberacao } from "../mre/posDeliberacao/efeitosPosDeliberacao.js";
import { criarPublicadorFilaMemoria } from "./ponteParecerJob.js";
import {
  conduzirAposParecer,
  conduzirAposDecisaoGate,
  iniciarFluxoAposJob,
  consumirJobCriadoParaFluxo
} from "./integracaoOrquestrador.js";
import { montarCiclo } from "./dominio.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootSrc = join(__dirname, "..");

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

test("E4-CA1: intenção → plano → (gate se preciso) → Job pending → fluxo", async () => {
  const fila = criarPublicadorFilaMemoria();
  const parecer = parecerDespacho({ id: "parecer-e4-feliz" });

  const r = await conduzirAposParecer(parecer, {
    publicarJob: fila.publicarJob.bind(fila)
  });

  assert.equal(r.publicado, true);
  assert.equal(r.despachado, true);
  assert.equal(r.job.estado, "pending");
  assert.equal(r.fluxoIniciado, true);
  assert.equal(r.ciclo.etapa, "Dispatcher");
  assert.equal(r.ciclo.jobId, r.job.id);
  assert.equal(r.handoff.para, "dispatcher_req053");
  assert.equal(r.execucaoConcluida, false);
  assert.equal(fila.jobs.length, 1);

  // Com Gate G2: primeiro aguarda; depois aprova
  const fila2 = criarPublicadorFilaMemoria();
  const comCodigo = parecerDespacho({
    id: "parecer-e4-gate",
    acao: {
      tipo: "despachar",
      descricao: "patch",
      job: {
        titulo: "Patch",
        descricao: "Alterar código",
        alteraCodigo: true
      }
    }
  });
  const pendente = await conduzirAposParecer(comCodigo, {
    publicarJob: fila2.publicarJob.bind(fila2)
  });
  assert.equal(pendente.aguardandoGate, true);
  assert.equal(pendente.publicado, false);
  assert.equal(fila2.jobs.length, 0);
  assert.equal(pendente.ciclo.etapa, "Aprovacao");

  const aposGate = await conduzirAposDecisaoGate(comCodigo, "aprovado", {
    publicarJob: fila2.publicarJob.bind(fila2)
  });
  assert.equal(aposGate.publicado, true);
  assert.equal(aposGate.job.estado, "pending");
  assert.equal(aposGate.fluxoIniciado, true);
  assert.equal(aposGate.ciclo.etapa, "Dispatcher");
});

test("E4-CA2: nenhum @cursor/sdk no Motor nem no fio Orquestrador deste fluxo", () => {
  const ficheiros = [
    "integracaoOrquestrador.js",
    "ponteParecerJob.js",
    "politicaAprovacao.js",
    "dominio.js"
  ];
  for (const f of ficheiros) {
    const src = readFileSync(join(__dirname, f), "utf8");
    assert.equal(/@cursor\/sdk/.test(src), false, f);
  }
  const efeitos = readFileSync(
    join(rootSrc, "mre/posDeliberacao/efeitosPosDeliberacao.js"),
    "utf8"
  );
  assert.equal(/@cursor\/sdk/.test(efeitos), false);
  assert.match(efeitos, /conduzirAposParecer/);
  assert.equal(/node:fs|writeFile/.test(efeitos), false);
});

test("E4-CA3: Painel e CTO não publicam Jobs (inalterados nesse aspecto)", () => {
  const cto = readFileSync(
    join(rootSrc, "executiveEngine/capacidades/consultarCto.js"),
    "utf8"
  );
  const ctoCliente = readFileSync(
    join(rootSrc, "ctoConnector/cliente.js"),
    "utf8"
  );
  assert.equal(/criarJobDoParecer|conduzirAposParecer|publicarJobFila/.test(cto), false);
  assert.equal(/criarJobDoParecer|conduzirAposParecer/.test(ctoCliente), false);

  const orqUi = readFileSync(join(rootSrc, "orquestracao/ui.js"), "utf8");
  const orqAgg = readFileSync(
    join(rootSrc, "orquestracao/agregador.js"),
    "utf8"
  );
  assert.equal(/criarJobDoParecer|conduzirAposParecer|publicarJobFila/.test(orqUi), false);
  assert.equal(
    /criarJobDoParecer|conduzirAposParecer|publicarJobFila/.test(orqAgg),
    false
  );
});

test("E4-CA4: falha ao publicar não marca parecer como execução concluída", async () => {
  const parecer = parecerDespacho({ id: "parecer-e4-falha" });
  const r = await conduzirAposParecer(parecer, {
    async publicarJob() {
      throw new Error("fila indisponível");
    }
  });
  assert.equal(r.publicado, false);
  assert.equal(r.despachado, false);
  assert.equal(r.execucaoConcluida, false);
  assert.equal(r.parecerExecucaoConcluida, false);
  assert.equal(r.motivo, "falha_publicacao");
  assert.match(r.mensagem, /fila indisponível/);

  const efeitos = await aplicarEfeitosPosDeliberacao(
    parecer,
    { efeitos: [] },
    {
      async publicarJob() {
        throw new Error("boom");
      }
    }
  );
  // aplicarEfeitos não engole throw do conduzir — conduzir captura
  assert.equal(efeitos.fila.despachado, false);
  assert.equal(efeitos.fila.execucaoConcluida, false);
  assert.equal(efeitos.fila.parecerExecucaoConcluida, false);
});

test("consumir Job E3 → handoff Dispatcher; sem despacho encerra", async () => {
  const ciclo = montarCiclo("c-hand", "CriacaoDoJob", {
    jobId: "JOB-TEST-000001",
    estadoJob: "pending",
    requerDespacho: true
  });
  const fluxo = consumirJobCriadoParaFluxo(
    { id: "JOB-TEST-000001", estado: "pending" },
    ciclo
  );
  assert.equal(fluxo.ok, true);
  assert.equal(fluxo.ciclo.etapa, "Dispatcher");

  const bad = iniciarFluxoAposJob(ciclo, {
    id: "JOB-X",
    estado: "completed"
  });
  assert.equal(bad.ok, false);

  const fila = criarPublicadorFilaMemoria();
  const sem = await conduzirAposParecer(parecerSolicitarDadosValido(), {
    publicarJob: fila.publicarJob.bind(fila)
  });
  assert.equal(sem.publicado, false);
  assert.equal(sem.motivo, "sem_despacho");
  assert.equal(sem.ciclo.etapa, "Encerramento");
  assert.equal(fila.jobs.length, 0);
});

test("efeitosPosDeliberacao + executiveEngine: fio Motor sem SDK", async () => {
  const fila = criarPublicadorFilaMemoria();
  const parecer = parecerDespacho({ id: "parecer-e4-efeitos" });
  const out = await aplicarEfeitosPosDeliberacao(
    parecer,
    { efeitos: [] },
    { publicarJob: fila.publicarJob.bind(fila) }
  );
  assert.equal(out.fila.despachado, true);
  assert.equal(out.fila.fluxoIniciado, true);
  assert.equal(out.motor.ciclo.etapa, "Dispatcher");
  assert.equal(out.fila.execucaoConcluida, false);

  const { executiveEngine } = await import("../executiveEngine/index.js");
  const eng = await executiveEngine.conduzirMotorExecucao(
    parecerDespacho({ id: "parecer-e4-eng" }),
    { publicarJob: criarPublicadorFilaMemoria().publicarJob }
  );
  assert.equal(eng.publicado, true);
  assert.equal(eng.fluxoIniciado, true);

  const engSrc = readFileSync(
    join(rootSrc, "executiveEngine/index.js"),
    "utf8"
  );
  assert.equal(/@cursor\/sdk/.test(engSrc), false);
});
