/**
 * Testes Resultado e Encerramento — IMP-056 E5
 * (sem Dispatcher real / UI / Agent/SDK).
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { montarCiclo, validarTransicao } from "./dominio.js";
import {
  jobEstaTerminal,
  montarMensagemResultado,
  sintetizarResultadoJob,
  tentarEncerrarPorProsa,
  avancarCicloAteEncerramento,
  processarResultadoEEncerrar,
  observarJobEProcessar,
  tickObservadorJob
} from "./resultadoEncerramento.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

function cicloEmDispatcher(jobId = "JOB-E5-001") {
  return montarCiclo("ciclo-e5", "Dispatcher", {
    jobId,
    estadoJob: "pending",
    requerDespacho: true,
    parecerId: "par-e5"
  });
}

test("E5-CA1: Job completed ⇒ Resultado com jobId ao posto de comando", async () => {
  const job = {
    id: "JOB-E5-OK",
    estado: "completed",
    resultado: "Outdoor lateral implementado"
  };
  assert.equal(jobEstaTerminal(job), true);
  const msg = montarMensagemResultado(job);
  assert.equal(msg.ok, true);
  assert.equal(msg.jobId, "JOB-E5-OK");
  assert.equal(msg.tipo, "sucesso");
  assert.match(msg.texto, /JOB-E5-OK/);
  assert.match(msg.texto, /Outdoor lateral/);

  const r = processarResultadoEEncerrar(cicloEmDispatcher("JOB-E5-OK"), job);
  assert.equal(r.processado, true);
  assert.equal(r.execucaoConcluida, true);
  assert.equal(r.ciclo.etapa, "Encerramento");
  assert.equal(r.ciclo.estadoJob, "completed");
  assert.equal(r.ciclo.jobId, "JOB-E5-OK");
  assert.equal(r.mensagemPostoComando.jobId, "JOB-E5-OK");
  assert.ok(r.etapasAvancadas.includes("Resultado"));
  assert.ok(r.etapasAvancadas.includes("Encerramento"));
});

test("E5-CA2: Job failed ⇒ mensagem de falha; estado permanece failed", () => {
  const job = {
    id: "JOB-E5-FAIL",
    estado: "failed",
    motivo: "timeout no Agent"
  };
  const msg = montarMensagemResultado(job);
  assert.equal(msg.ok, true);
  assert.equal(msg.tipo, "falha");
  assert.match(msg.texto, /falhou/i);
  assert.match(msg.texto, /timeout/);

  const r = processarResultadoEEncerrar(cicloEmDispatcher("JOB-E5-FAIL"), job);
  assert.equal(r.processado, true);
  assert.equal(r.ciclo.etapa, "Encerramento");
  assert.equal(r.ciclo.estadoJob, "failed");
  assert.equal(r.estadoJob, "failed");
  assert.equal(r.mensagemPostoComando.estado, "failed");
  // não inventar completed
  assert.notEqual(r.ciclo.estadoJob, "completed");
});

test("E5-CA3: Encerramento só após estado terminal", () => {
  const ciclo = cicloEmDispatcher();
  const pending = processarResultadoEEncerrar(ciclo, {
    id: "JOB-E5-PEND",
    estado: "pending"
  });
  assert.equal(pending.processado, false);
  assert.equal(pending.execucaoConcluida, false);
  assert.equal(pending.motivo, "aguarda_execucao");

  const running = processarResultadoEEncerrar(ciclo, {
    id: "JOB-E5-RUN",
    estado: "running"
  });
  assert.equal(running.processado, false);
  assert.equal(running.execucaoConcluida, false);
  assert.equal(running.motivo, "em_execucao");
  assert.equal(running.ciclo.etapa, "Execucao");
  assert.equal(running.ciclo.estadoJob, "running");

  assert.equal(
    avancarCicloAteEncerramento(ciclo, { id: "x", estado: "pending" }).ok,
    false
  );

  // máquina: Resultado → Encerramento exige terminal no ctx
  assert.equal(
    validarTransicao("Resultado", "Encerramento", { estadoJob: "running" }).ok,
    false
  );
  assert.equal(
    validarTransicao("Resultado", "Encerramento", {
      estadoJob: "completed"
    }).ok,
    true
  );

  const cancelado = processarResultadoEEncerrar(cicloEmDispatcher("JOB-E5-CAN"), {
    id: "JOB-E5-CAN",
    estado: "cancelled",
    motivo: "cancelamento governado"
  });
  assert.equal(cancelado.processado, true);
  assert.equal(cancelado.ciclo.estadoJob, "cancelled");
  assert.equal(cancelado.ciclo.etapa, "Encerramento");
});

test("E5-CA4: prosa “feito” sem Job terminal não dispara Encerramento", () => {
  const prosa = tentarEncerrarPorProsa(
    "Feito! Já implementei tudo e o trabalho está completed."
  );
  assert.equal(prosa.ok, false);
  assert.equal(prosa.motivo, "prosa_nao_e_terminal");

  const ciclo = cicloEmDispatcher("JOB-E5-PROSA");
  // “parecer” que só fala — sem job terminal
  const r = processarResultadoEEncerrar(ciclo, {
    id: "JOB-E5-PROSA",
    estado: "pending",
    resultado: "feito na prosa do MRE"
  });
  assert.equal(r.execucaoConcluida, false);
  assert.notEqual(r.ciclo?.etapa, "Encerramento");

  // job sem estado terminal explícito
  assert.equal(jobEstaTerminal({ id: "x", resultado: "done" }), false);
  assert.equal(montarMensagemResultado({ id: "x", estado: "running" }).ok, false);
});

test("observador/tick: porta obterJob → mensagem; sem SDK/UI/HTTP no módulo", async () => {
  const mensagens = [];
  const estado = {
    ciclo: cicloEmDispatcher("JOB-E5-OBS"),
    async obterJob() {
      return {
        id: "JOB-E5-OBS",
        estado: "completed",
        resultado: { resumo: "ok via observador" }
      };
    },
    onMensagem(m) {
      mensagens.push(m);
    }
  };
  const tick = await tickObservadorJob(estado);
  assert.equal(tick.processado, true);
  assert.equal(estado.ciclo.etapa, "Encerramento");
  assert.equal(mensagens.length, 1);
  assert.equal(mensagens[0].jobId, "JOB-E5-OBS");
  assert.match(sintetizarResultadoJob({ resultado: { resumo: "x" } }), /x/);

  const uma = await observarJobEProcessar({
    ciclo: cicloEmDispatcher("JOB-E5-OBS2"),
    obterJob: () => ({
      id: "JOB-E5-OBS2",
      estado: "failed",
      erro: "build broke"
    })
  });
  assert.equal(uma.mensagemPostoComando.tipo, "falha");

  const src = readFileSync(join(__dirname, "resultadoEncerramento.js"), "utf8");
  assert.equal(/@cursor\/sdk/.test(src), false);
  assert.equal(/\bfetch\s*\(/.test(src), false);
  assert.equal(/document\.|window\./.test(src), false);
  assert.equal(/from\s+["'].*dispatcher/i.test(src), false);
});
