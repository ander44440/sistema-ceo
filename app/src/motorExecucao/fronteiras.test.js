/**
 * Fronteiras, degradação e regressões — IMP-056 E6
 * Isolamento Motor / Dispatcher / CTO / UI / Painel.
 */

import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { parecerDelegarValido } from "../mre/parecer/fixtures.js";
import {
  conduzirAposParecer,
  iniciarFluxoAposJob
} from "./integracaoOrquestrador.js";
import { criarPublicadorFilaMemoria } from "./ponteParecerJob.js";
import {
  processarResultadoEEncerrar,
  montarMensagemResultado,
  tentarEncerrarPorProsa
} from "./resultadoEncerramento.js";
import { montarCiclo, ESTADOS_JOB, validarTransicaoJob } from "./dominio.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const srcRoot = join(__dirname, "..");

function ler(rel) {
  return readFileSync(join(srcRoot, rel), "utf8");
}

function fontesMotor() {
  return readdirSync(__dirname)
    .filter((f) => f.endsWith(".js") && !f.endsWith(".test.js"))
    .map((f) => ({ nome: f, src: readFileSync(join(__dirname, f), "utf8") }));
}

test("E6-CA1: suite negativa REQ-054/055 — CTO e Painel não publicam Jobs", () => {
  const ctoCap = ler("executiveEngine/capacidades/consultarCto.js");
  const ctoCliente = ler("ctoConnector/cliente.js");
  const ctoDom = (() => {
    try {
      return ler("ctoConnector/dominio.js");
    } catch {
      return "";
    }
  })();

  for (const [nome, src] of [
    ["consultarCto", ctoCap],
    ["cliente", ctoCliente],
    ["dominio-cto", ctoDom]
  ]) {
    if (!src) continue;
    assert.equal(
      /criarJobDoParecer|conduzirAposParecer|publicarJobFila|conduzirMotorExecucao/.test(
        src
      ),
      false,
      `CTO ${nome} não deve publicar Jobs`
    );
  }

  const painel = [
    "orquestracao/ui.js",
    "orquestracao/agregador.js",
    "orquestracao/coletores.js",
    "orquestracao/cliente.js",
    "orquestracao/detalhe.js"
  ];
  for (const rel of painel) {
    const src = ler(rel);
    assert.equal(
      /criarJobDoParecer|conduzirAposParecer|publicarJobFila|POST.*queue\/jobs/.test(
        src
      ),
      false,
      `Painel ${rel} não publica Jobs`
    );
    assert.equal(/@cursor\/sdk/.test(src), false, rel);
  }
});

test("E6-CA2: sem Agent — Job fica dispatched (≠ completed/failed)", async () => {
  const fila = criarPublicadorFilaMemoria();
  const parecer = {
    ...parecerDelegarValido(),
    id: "parecer-e6-pending"
  };
  const r = await conduzirAposParecer(parecer, {
    publicarJob: fila.publicarJob.bind(fila)
  });
  assert.equal(r.publicado, true);
  assert.equal(r.job.estado, "dispatched");
  assert.equal(r.fluxoIniciado, true);
  assert.equal(r.ciclo.etapa, "Dispatcher");
  assert.equal(r.ciclo.estadoJob, "dispatched");
  assert.equal(r.execucaoConcluida, false);

  // Simula PC/watcher ausente: nenhum tick de execução — não completa
  const ainda = processarResultadoEEncerrar(r.ciclo, {
    id: r.job.id,
    estado: "dispatched"
  });
  assert.equal(ainda.execucaoConcluida, false);
  assert.equal(ainda.motivo, "despachado_aguarda_execucao");
  assert.notEqual(ainda.ciclo?.estadoJob, "failed");
  assert.notEqual(ainda.ciclo?.estadoJob, "completed");
  assert.equal(fila.jobs[0].estado, "dispatched");

  // Handoff sem Agent: Job fica dispatched (≠ completed)
  const handoff = iniciarFluxoAposJob(
    montarCiclo("c", "CriacaoDoJob", {
      jobId: r.job.id,
      estadoJob: "pending",
      requerDespacho: true
    }),
    { id: r.job.id, estado: "pending", historicoCiclo: [] }
  );
  assert.equal(handoff.ok, true);
  assert.equal(handoff.ciclo.estadoJob, "dispatched");
  assert.notEqual(handoff.ciclo.estadoJob, "completed");
});

test("E6-CA3: inventário — Motor não introduz segundo watcher/acordador", () => {
  const motor = fontesMotor();
  const proibidos = [
    /@cursor\/sdk/,
    /child_process/,
    /spawn\s*\(/,
    /fork\s*\(/,
    /node-watch|chokidar/,
    /setInterval\s*\([^)]*pending/,
    /watchQueue|iniciarWatcher|startDispatcher/i
  ];
  for (const { nome, src } of motor) {
    for (const re of proibidos) {
      assert.equal(re.test(src), false, `${nome} viola ${re}`);
    }
  }

  // Handoff explícito ao Dispatcher REQ-053 (único acordador)
  const intSrc = motor.find((m) => m.nome === "integracaoOrquestrador.js").src;
  assert.match(intSrc, /dispatcher_req053/);
  assert.match(intSrc, /REQ-053/);

  // executiveEngine não importa SDK
  assert.equal(/@cursor\/sdk/.test(ler("executiveEngine/index.js")), false);
});

test("E6-CA4: segredos ausentes em Jobs e mensagens de Resultado", async () => {
  const fila = criarPublicadorFilaMemoria();
  const parecer = {
    ...parecerDelegarValido(),
    id: "parecer-e6-segredo",
    acao: {
      tipo: "despachar",
      descricao: "tarefa",
      job: {
        titulo: "Tarefa segura",
        descricao: "Sem credenciais no texto"
      }
    }
  };
  const r = await conduzirAposParecer(parecer, {
    publicarJob: fila.publicarJob.bind(fila)
  });
  const blobJob = JSON.stringify(r.job) + JSON.stringify(r.payload);
  assert.equal(/CURSOR_API_KEY|sk-[a-zA-Z0-9]{10,}/.test(blobJob), false);
  assert.equal(/api[_-]?key/i.test(blobJob), false);

  const msg = montarMensagemResultado({
    id: r.job.id,
    estado: "completed",
    resultado: "Entrega OK sem secrets"
  });
  assert.equal(/CURSOR_API_KEY|sk-/.test(msg.texto), false);

  // Payload com secret no texto é rejeitado pela sanitização (cursor)
  const { criarJobDoParecer } = await import("./ponteParecerJob.js");
  const bloqueado = await criarJobDoParecer(
    {
      ...parecerDelegarValido(),
      id: "parecer-e6-bad",
      acao: {
        tipo: "despachar",
        descricao: "x",
        job: {
          titulo: "X",
          descricao: "Usar CURSOR_API_KEY=secret no Agent"
        }
      }
    },
    { publicarJob: fila.publicarJob.bind(fila) }
  );
  assert.equal(bloqueado.publicado, false);
});

test("E6: isolamento UI — Motor sem document/window; prosa ≠ completed", () => {
  for (const { nome, src } of fontesMotor()) {
    assert.equal(/document\.|window\.|localStorage/.test(src), false, nome);
  }
  assert.equal(tentarEncerrarPorProsa("feito").ok, false);
  assert.equal(ESTADOS_JOB.length, 8);
  assert.equal(validarTransicaoJob("pending", "failed").ok, false);
  assert.equal(validarTransicaoJob("running", "completed").ok, false);
});

test("E6: checklist operacional PC off / CU5 (documentado + comportamento)", async () => {
  // Comportamento CU5: dispatched sem executor ≠ completed/failed
  const fila = criarPublicadorFilaMemoria();
  const r = await conduzirAposParecer(
    { ...parecerDelegarValido(), id: "parecer-e6-cu5" },
    { publicarJob: fila.publicarJob.bind(fila) }
  );
  assert.equal(r.job.estado, "dispatched");
  assert.equal(r.handoff.para, "dispatcher_req053");
  assert.equal(r.ciclo.etapa, "Dispatcher");
  assert.equal(r.execucaoConcluida, false);
  assert.notEqual(r.job.estado, "completed");
});
