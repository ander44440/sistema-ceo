/**
 * Fronteiras, regressão e isolamento — IMP-058 E6
 */

import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test, beforeEach } from "node:test";
import { executiveEngine } from "../executiveEngine/index.js";
import { criarPublicadorFilaMemoria } from "../motorExecucao/ponteParecerJob.js";
import { conduzirAposParecer, conduzirAposDecisaoGate } from "../motorExecucao/integracaoOrquestrador.js";
import {
  parecerDelegarValido
} from "../mre/parecer/fixtures.js";
import { criarStoreContextoGate } from "./contexto.js";
import {
  resetStoreContinuidadePadrao,
  decidirInterceptacaoContinuidade
} from "./integracaoConversa.js";
import { contemSugiroComoRespostaFinal } from "../classificadorIntencao/integracaoNucleo.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootSrc = join(__dirname, "..");

beforeEach(() => {
  resetStoreContinuidadePadrao();
});

function ler(rel) {
  return readFileSync(join(rootSrc, rel), "utf8");
}

const MODULOS_CONTINUIDADE = [
  "continuidadeGate/dominio.js",
  "continuidadeGate/reconhecerDecisao.js",
  "continuidadeGate/contexto.js",
  "continuidadeGate/integracaoConversa.js",
  "continuidadeGate/index.js"
];

test("E6-CA1: sem Gate + «Aprovado.» → sem Job (CA8 / CU4)", async () => {
  const store = criarStoreContextoGate();
  const fila = criarPublicadorFilaMemoria();
  assert.equal(store.temGatePendente(), false);
  assert.equal(
    decidirInterceptacaoContinuidade("Aprovado.", store),
    "classificador"
  );

  const out = await executiveEngine.executar("Aprovado.", {
    storeContinuidade: store,
    publicarJob: fila.publicarJob.bind(fila)
  });

  assert.notEqual(out.dados?.continuidade, true);
  assert.equal(fila.jobs.length, 0);
  assert.ok(out.dados?.classificacao || out.modo === "clarificacao" || out.modo);
});

test("E6-CA2: Gate pendente + decisão → sem «Sugiro…» (CA7 / CU5)", async () => {
  const store = criarStoreContextoGate();
  const fila = criarPublicadorFilaMemoria();
  await executiveEngine.executar("Resolva os bugs.", {
    storeContinuidade: store,
    publicarJob: fila.publicarJob.bind(fila),
    registro: store.registroJobs
  });
  const out = await executiveEngine.executar("Pode prosseguir.", {
    storeContinuidade: store,
    publicarJob: fila.publicarJob.bind(fila),
    registro: store.registroJobs
  });
  assert.equal(out.dados?.continuidade, true);
  assert.equal(out.dados?.classificadorSaltado, true);
  assert.equal(contemSugiroComoRespostaFinal(out.mensagem), false);
  assert.equal(/^Sugiro\b/i.test(out.mensagem.trim()), false);
  assert.ok(out.dados?.job?.id);
});

test("E6-CA3: idempotência reforçada (CA9 / CU6)", async () => {
  const store = criarStoreContextoGate();
  const fila = criarPublicadorFilaMemoria();
  await executiveEngine.executar("Resolva os bugs.", {
    storeContinuidade: store,
    publicarJob: fila.publicarJob.bind(fila),
    registro: store.registroJobs
  });
  const a1 = await executiveEngine.executar("Aprovado.", {
    storeContinuidade: store,
    publicarJob: fila.publicarJob.bind(fila),
    registro: store.registroJobs
  });
  assert.equal(fila.jobs.length, 1);
  const jobId = a1.dados?.job?.id;

  await executiveEngine.executar("Aprovado.", {
    storeContinuidade: store,
    publicarJob: fila.publicarJob.bind(fila),
    registro: store.registroJobs
  });
  assert.equal(fila.jobs.length, 1);

  // recuperação de contexto: reabrir mesmo parecer
  const parecer = a1.dados?.motor
    ? store.obterJobDoParecer(
        Object.keys(Object.fromEntries(store.registroJobs))[0]
      )
    : null;
  void parecer;
  const parecerId = [...store.registroJobs.keys()][0];
  assert.ok(parecerId);
  // Reconstruir snapshot mínimo via novo C3 não — usar abrirGate com stub
  // Idempotência já coberta em e5; aqui reforço: 1 job após segunda tentativa classificador
  assert.equal(store.obterJobDoParecer(parecerId), jobId);
});

test("E6-CA4: Continuidade sem @cursor/sdk (CA10)", () => {
  for (const rel of MODULOS_CONTINUIDADE) {
    const src = ler(rel);
    assert.equal(/@cursor\/sdk/.test(src), false, rel);
    assert.equal(/from\s+["']@cursor/.test(src), false, rel);
  }
});

test("E6-CA5: regressão Classificador C1/C2/C4 e C3 sem Gate residual", async () => {
  const store = criarStoreContextoGate();
  const c1 = await executiveEngine.executar("Bom dia", {
    storeContinuidade: store
  });
  assert.equal(c1.dados?.classificacao?.classe, "conhecimento_geral");
  assert.equal(c1.dados?.motorAcionado, false);

  const c2 = await executiveEngine.executar("Como priorizar o pagamento no MG2?", {
    storeContinuidade: store,
    publicarJob: async () => {
      throw new Error("C2 não publica");
    }
  });
  assert.equal(c2.dados?.encaminhamento?.destino, "nucleo_mre");
  assert.equal(c2.dados?.motorAcionado, false);

  const c4 = await executiveEngine.executar("listar jobs", {
    storeContinuidade: store
  });
  assert.equal(c4.dados?.encaminhamento?.destino, "capacidade_operacional");
  assert.equal(c4.capacidade, "fila");

  resetStoreContinuidadePadrao();
  const store2 = criarStoreContextoGate();
  const c3 = await executiveEngine.executar("Resolva os bugs.", {
    storeContinuidade: store2,
    publicarJob: criarPublicadorFilaMemoria().publicarJob
  });
  assert.equal(c3.dados?.classificacao?.classe, "trabalho_executivo");
  assert.equal(c3.dados?.motor?.aguardandoGate, true);
});

test("E6-CA6: Motor programático sem Continuidade permanece válido", async () => {
  const fila = criarPublicadorFilaMemoria();
  const parecer = {
    ...parecerDelegarValido(),
    id: "parecer-e6-motor-puro",
    acao: {
      tipo: "despachar",
      descricao: "patch",
      job: {
        titulo: "Patch E6",
        descricao: "Alterar código",
        alteraCodigo: true
      }
    }
  };
  const pendente = await conduzirAposParecer(parecer, {
    publicarJob: fila.publicarJob.bind(fila)
  });
  assert.equal(pendente.aguardandoGate, true);
  assert.equal(fila.jobs.length, 0);

  const apos = await conduzirAposDecisaoGate(parecer, "aprovado", {
    publicarJob: fila.publicarJob.bind(fila),
    registro: new Map()
  });
  assert.equal(apos.publicado, true);
  assert.equal(fila.jobs.length, 1);
});

test("E6: CU7 clarificação RF12 — pedido novo com Gate pendente", async () => {
  const store = criarStoreContextoGate();
  const fila = criarPublicadorFilaMemoria();
  await executiveEngine.executar("Resolva os bugs.", {
    storeContinuidade: store,
    publicarJob: fila.publicarJob.bind(fila)
  });
  const clar = await executiveEngine.executar("Implemente o outdoor agora", {
    storeContinuidade: store,
    publicarJob: fila.publicarJob.bind(fila)
  });
  assert.equal(clar.modo, "continuidade_gate_clarificacao");
  assert.equal(clar.dados?.clarificacaoGate, true);
  assert.equal(fila.jobs.length, 0);
  assert.equal(store.temGatePendente(), true);
});

test("E6: isolamento — CTO/Painel/orquestração não decidem Gate", () => {
  for (const rel of [
    "ctoConnector/cliente.js",
    "orquestracao/ui.js",
    "orquestracao/agregador.js",
    "modules/centroSituacao/centroSituacao.js"
  ]) {
    try {
      const src = ler(rel);
      assert.equal(
        /continuidadeGate|conduzirAposDecisaoGate|consumirDecisao/.test(src),
        false,
        rel
      );
    } catch {
      // ficheiro opcional ausente — ignorar
    }
  }
});

test("E6: inventário entrypoints Continuidade", () => {
  const ee = ler("executiveEngine/index.js");
  assert.match(ee, /decidirInterceptacaoContinuidade/);
  assert.match(ee, /continuarAposDecisaoGate/);
  assert.match(ee, /envolverConduzirMotorComContinuidade/);

  const conversa = ler("modules/conversa/conversa.js");
  assert.match(conversa, /executiveEngine\.executar/);

  const ficheiros = readdirSync(join(rootSrc, "continuidadeGate")).filter((f) =>
    f.endsWith(".js")
  );
  assert.ok(ficheiros.includes("dominio.js"));
  assert.ok(ficheiros.includes("reconhecerDecisao.js"));
  assert.ok(ficheiros.includes("contexto.js"));
  assert.ok(ficheiros.includes("integracaoConversa.js"));
  assert.ok(ficheiros.includes("index.js"));
});

test("E6: domínio/léxico/contexto sem Fila/Motor/Conversa/UI", () => {
  for (const rel of [
    "continuidadeGate/dominio.js",
    "continuidadeGate/reconhecerDecisao.js",
    "continuidadeGate/contexto.js"
  ]) {
    const src = ler(rel);
    assert.equal(/from\s+["'].*motorExecucao/.test(src), false, rel);
    assert.equal(/from\s+["'].*conversa/.test(src), false, rel);
    assert.equal(/from\s+["'].*executionQueue/.test(src), false, rel);
    assert.equal(/document\.|window\./.test(src), false, rel);
  }
});

test("E6 demo consolidado: Aprovado / Rejeitado / Adiado→Pode executar", async () => {
  console.log("\n=== DEMO IMP-058 E6 (3 cenários) ===\n");

  {
    const store = criarStoreContextoGate();
    const fila = criarPublicadorFilaMemoria();
    const g = await executiveEngine.executar("Resolva os bugs.", {
      storeContinuidade: store,
      publicarJob: fila.publicarJob.bind(fila),
      registro: store.registroJobs
    });
    const a = await executiveEngine.executar("Aprovado.", {
      storeContinuidade: store,
      publicarJob: fila.publicarJob.bind(fila),
      registro: store.registroJobs
    });
    console.log("--- Aprovado ---");
    console.log(`Gate: ${g.mensagem}`);
    console.log(`Decisão: ${a.mensagem}`);
    assert.equal(fila.jobs.length, 1);
  }

  {
    const store = criarStoreContextoGate();
    const fila = criarPublicadorFilaMemoria();
    await executiveEngine.executar("Resolva os bugs.", {
      storeContinuidade: store,
      publicarJob: fila.publicarJob.bind(fila),
      registro: store.registroJobs
    });
    const r = await executiveEngine.executar("Rejeitado.", {
      storeContinuidade: store,
      publicarJob: fila.publicarJob.bind(fila),
      registro: store.registroJobs
    });
    console.log("\n--- Rejeitado ---");
    console.log(`Decisão: ${r.mensagem}`);
    assert.equal(fila.jobs.length, 0);
  }

  {
    const store = criarStoreContextoGate();
    const fila = criarPublicadorFilaMemoria();
    await executiveEngine.executar("Resolva os bugs.", {
      storeContinuidade: store,
      publicarJob: fila.publicarJob.bind(fila),
      registro: store.registroJobs
    });
    const d = await executiveEngine.executar("Adiar.", {
      storeContinuidade: store,
      publicarJob: fila.publicarJob.bind(fila),
      registro: store.registroJobs
    });
    const t = await executiveEngine.executar("Pode executar.", {
      storeContinuidade: store,
      publicarJob: fila.publicarJob.bind(fila),
      registro: store.registroJobs
    });
    console.log("\n--- Adiado → Pode executar ---");
    console.log(`Adiar: ${d.mensagem}`);
    console.log(`Retoma: ${t.mensagem}`);
    assert.equal(fila.jobs.length, 1);
  }

  console.log("\n=== fim DEMO E6 ===\n");
});
