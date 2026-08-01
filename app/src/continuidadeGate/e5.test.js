/**
 * Testes fluxos Aprovado / Rejeitado / Adiado — IMP-058 E5
 * (preserva integração E4; Motor P10; sem commit / sem Agent).
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test, beforeEach } from "node:test";
import { executiveEngine } from "../executiveEngine/index.js";
import { criarPublicadorFilaMemoria } from "../motorExecucao/ponteParecerJob.js";
import { avancarAposGate } from "../motorExecucao/politicaAprovacao.js";
import { montarCiclo } from "../motorExecucao/dominio.js";
import { criarStoreContextoGate } from "./contexto.js";
import { resetStoreContinuidadePadrao } from "./integracaoConversa.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootSrc = join(__dirname, "..");

beforeEach(() => {
  resetStoreContinuidadePadrao();
});

async function abrirGateBugs(store, fila) {
  return executiveEngine.executar("Resolva os bugs.", {
    storeContinuidade: store,
    publicarJob: fila.publicarJob.bind(fila),
    registro: store.registroJobs
  });
}

test("E5-CA1: Aprovado → Job + Motor + Dispatcher", async () => {
  const store = criarStoreContextoGate();
  const fila = criarPublicadorFilaMemoria();

  const gate = await abrirGateBugs(store, fila);
  assert.equal(gate.dados?.motor?.aguardandoGate, true);

  const aprov = await executiveEngine.executar("Aprovado.", {
    storeContinuidade: store,
    publicarJob: fila.publicarJob.bind(fila),
    registro: store.registroJobs
  });

  assert.equal(aprov.dados?.decisao, "aprovado");
  assert.ok(aprov.dados?.job?.id);
  assert.equal(fila.jobs.length, 1);
  assert.equal(aprov.dados?.motor?.fluxoIniciado, true);
  assert.equal(aprov.dados?.handoff?.para, "dispatcher_req053");
  assert.equal(store.temGatePendente(), false);
});

test("E5-CA2: Rejeitado → encerra sem Job", async () => {
  const store = criarStoreContextoGate();
  const fila = criarPublicadorFilaMemoria();

  await abrirGateBugs(store, fila);
  const rej = await executiveEngine.executar("Cancela.", {
    storeContinuidade: store,
    publicarJob: fila.publicarJob.bind(fila),
    registro: store.registroJobs
  });

  assert.equal(rej.dados?.decisao, "rejeitado");
  assert.equal(fila.jobs.length, 0);
  assert.equal(rej.dados?.job, null);
  assert.equal(rej.dados?.motor?.motivo, "gate_rejeitado");
  assert.equal(store.temGatePendente(), false);
  assert.match(rej.mensagem, /rejeitado|não criado/i);
});

test("E5-CA3: Adiado → Gate pendente; retoma com Autorizado", async () => {
  const store = criarStoreContextoGate();
  const fila = criarPublicadorFilaMemoria();

  await abrirGateBugs(store, fila);
  const adi = await executiveEngine.executar("Depois.", {
    storeContinuidade: store,
    publicarJob: fila.publicarJob.bind(fila),
    registro: store.registroJobs
  });

  assert.equal(adi.dados?.decisao, "adiado");
  assert.equal(fila.jobs.length, 0);
  assert.equal(adi.dados?.store?.permanecePendente, true);
  assert.equal(store.temGatePendente(), true);
  assert.equal(adi.dados?.motor?.aguardandoGate, true);
  assert.equal(adi.dados?.motor?.gatePermanecerPendente, true);
  assert.equal(adi.dados?.motor?.ciclo?.etapa, "Aprovacao");

  const retoma = await executiveEngine.executar("Autorizado.", {
    storeContinuidade: store,
    publicarJob: fila.publicarJob.bind(fila),
    registro: store.registroJobs
  });

  assert.equal(retoma.dados?.decisao, "aprovado");
  assert.equal(fila.jobs.length, 1);
  assert.ok(retoma.dados?.job?.id);
  assert.equal(store.temGatePendente(), false);
});

test("E5-CA4: sem repetir solicitação original (C3)", async () => {
  const store = criarStoreContextoGate();
  const fila = criarPublicadorFilaMemoria();
  await abrirGateBugs(store, fila);

  const aprov = await executiveEngine.executar("Pode prosseguir.", {
    storeContinuidade: store,
    publicarJob: fila.publicarJob.bind(fila),
    registro: store.registroJobs
  });

  assert.equal(aprov.dados?.classificadorSaltado, true);
  assert.equal(aprov.dados?.solicitacaoResumo?.toLowerCase().includes("bugs"), true);
  assert.ok(aprov.dados?.job?.id);
});

test("E5-CA5: idempotência — segunda aprovação não duplica Job", async () => {
  const store = criarStoreContextoGate();
  const fila = criarPublicadorFilaMemoria();

  const g1 = await abrirGateBugs(store, fila);
  const parecer = store.obterContextoActivo()?.parecerSnapshot;
  assert.ok(parecer?.id);

  const a1 = await executiveEngine.executar("Aprovado.", {
    storeContinuidade: store,
    publicarJob: fila.publicarJob.bind(fila),
    registro: store.registroJobs
  });
  assert.equal(fila.jobs.length, 1);
  const jobId = a1.dados?.job?.id;

  // Segunda «Aprovado.» sem Gate → Classificador; sem novo Job
  const a2 = await executiveEngine.executar("Aprovado.", {
    storeContinuidade: store,
    publicarJob: fila.publicarJob.bind(fila),
    registro: store.registroJobs
  });
  assert.equal(fila.jobs.length, 1);
  assert.notEqual(a2.dados?.continuidade, true);

  // Reabre mesmo parecer (corrida) + Aprovado → idempotente
  store.abrirGate({
    parecerId: parecer.id,
    parecerSnapshot: parecer,
    solicitacaoResumo: "Resolva os bugs.",
    abertoEm: "2026-08-01T20:00:00.000Z",
    gateId: "GATE-IDEM"
  });
  const a3 = await executiveEngine.executar("Aprovado.", {
    storeContinuidade: store,
    publicarJob: fila.publicarJob.bind(fila),
    registro: store.registroJobs
  });
  assert.equal(fila.jobs.length, 1);
  assert.equal(a3.dados?.idempotente, true);
  assert.equal(a3.dados?.job?.id, jobId);
});

test("E5-CA6: Dispatcher reutilizado (sem segundo watcher)", async () => {
  const store = criarStoreContextoGate();
  const fila = criarPublicadorFilaMemoria();
  await abrirGateBugs(store, fila);
  const aprov = await executiveEngine.executar("Aprovado.", {
    storeContinuidade: store,
    publicarJob: fila.publicarJob.bind(fila),
    registro: store.registroJobs
  });
  assert.equal(aprov.dados?.handoff?.para, "dispatcher_req053");
  const src = readFileSync(
    join(rootSrc, "continuidadeGate/integracaoConversa.js"),
    "utf8"
  );
  assert.equal(/criarWatcher|segundo.?dispatcher/i.test(src), false);
});

test("E5 P10: Motor avancarAposGate(adiado) permanece em Aprovacao", () => {
  const ciclo = montarCiclo("c-p10", "Aprovacao", { requerDespacho: true });
  const r = avancarAposGate(
    ciclo,
    "adiado",
    { requerDespacho: true, alteraCodigo: true }
  );
  assert.equal(r.ok, true);
  assert.equal(r.ciclo.etapa, "Aprovacao");
  assert.equal(r.permanecePendente, true);
});

test("E5 demo: três cenários Aprovado / Rejeitado / Adiado", async () => {
  console.log("\n=== DEMO IMP-058 E5 ===\n");

  // --- Aprovado ---
  {
    const store = criarStoreContextoGate();
    const fila = criarPublicadorFilaMemoria();
    const g = await abrirGateBugs(store, fila);
    console.log("--- Aprovado ---");
    console.log('Usuário: "Resolva os bugs."');
    console.log(`CEO: "${g.mensagem}"`);
    const a = await executiveEngine.executar("Aprovado.", {
      storeContinuidade: store,
      publicarJob: fila.publicarJob.bind(fila),
      registro: store.registroJobs
    });
    console.log('Usuário: "Aprovado."');
    console.log(`CEO: "${a.mensagem}"`);
    console.log(`Jobs: ${fila.jobs.length} | handoff: ${a.dados?.handoff?.para}`);
    assert.equal(fila.jobs.length, 1);
  }

  // --- Rejeitado ---
  {
    const store = criarStoreContextoGate();
    const fila = criarPublicadorFilaMemoria();
    await abrirGateBugs(store, fila);
    const r = await executiveEngine.executar("Rejeitado.", {
      storeContinuidade: store,
      publicarJob: fila.publicarJob.bind(fila),
      registro: store.registroJobs
    });
    console.log("\n--- Rejeitado ---");
    console.log('Usuário: "Rejeitado."');
    console.log(`CEO: "${r.mensagem}"`);
    console.log(`Jobs: ${fila.jobs.length} | Gate pendente: ${store.temGatePendente()}`);
    assert.equal(fila.jobs.length, 0);
    assert.equal(store.temGatePendente(), false);
  }

  // --- Adiado + retoma ---
  {
    const store = criarStoreContextoGate();
    const fila = criarPublicadorFilaMemoria();
    await abrirGateBugs(store, fila);
    const d = await executiveEngine.executar("Adiar.", {
      storeContinuidade: store,
      publicarJob: fila.publicarJob.bind(fila),
      registro: store.registroJobs
    });
    console.log("\n--- Adiado ---");
    console.log('Usuário: "Adiar."');
    console.log(`CEO: "${d.mensagem}"`);
    console.log(`Jobs: ${fila.jobs.length} | Gate pendente: ${store.temGatePendente()}`);
    const t = await executiveEngine.executar("Pode executar.", {
      storeContinuidade: store,
      publicarJob: fila.publicarJob.bind(fila),
      registro: store.registroJobs
    });
    console.log('Usuário: "Pode executar." (retoma)');
    console.log(`CEO: "${t.mensagem}"`);
    console.log(`Jobs: ${fila.jobs.length}`);
    assert.equal(fila.jobs.length, 1);
  }

  console.log("\n=== fim DEMO E5 ===\n");
});
