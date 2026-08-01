/**
 * Fronteiras, regressões e somente leitura — IMP-059 E6
 */

import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test, beforeEach } from "node:test";
import { executiveEngine } from "../executiveEngine/index.js";
import { criarPublicadorFilaMemoria } from "../motorExecucao/ponteParecerJob.js";
import { classificar } from "../classificadorIntencao/regras.js";
import { criarStoreContextoGate } from "../continuidadeGate/contexto.js";
import {
  resetStoreContinuidadePadrao,
  decidirInterceptacaoContinuidade
} from "../continuidadeGate/integracaoConversa.js";
import { agregarEstadoExecutivo } from "./agregarEstado.js";
import { consultarEstadoExecutivoAntesDeResponder } from "./consultarAntesDeResponder.js";
import { criarLeitoresConscienciaPadrao } from "./leitoresPadrao.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const MODULOS = [
  "dominio.js",
  "agregarEstado.js",
  "consultarAntesDeResponder.js",
  "influenciaDeliberacao.js",
  "leitoresPadrao.js",
  "index.js"
];

beforeEach(() => {
  resetStoreContinuidadePadrao();
});

function lerModulo(nome) {
  return readFileSync(join(__dirname, nome), "utf8");
}

test("E6-CA1: consulta/agregação não cria Job (CA4/CA5 read-only)", async () => {
  const fila = criarPublicadorFilaMemoria();
  const n0 = fila.jobs.length;

  await agregarEstadoExecutivo({
    leitores: {
      F2: () => [{ id: "J1", titulo: "t", status: "running" }],
      F3: () => [{ gateId: "G", parecerId: "P" }]
    }
  });
  await consultarEstadoExecutivoAntesDeResponder({
    idClasse: "C2",
    leitores: {
      F2: () => [{ id: "J1", titulo: "t", status: "running" }]
    }
  });

  assert.equal(fila.jobs.length, n0);
});

test("E6-CA2: léxico Gate → Continuidade, não deliberação Consciência (CA8)", async () => {
  const store = criarStoreContextoGate();
  const fila = criarPublicadorFilaMemoria();

  await executiveEngine.executar("Resolva os bugs do MG2.", {
    storeContinuidade: store,
    publicarJob: fila.publicarJob.bind(fila),
    registro: store.registroJobs
  });
  assert.equal(store.temGatePendente(), true);

  assert.equal(
    decidirInterceptacaoContinuidade("Aprovado.", store),
    "continuidade"
  );

  const out = await executiveEngine.executar("Aprovado.", {
    storeContinuidade: store,
    publicarJob: fila.publicarJob.bind(fila),
    registro: store.registroJobs
  });

  assert.equal(out.dados?.continuidade, true);
  assert.equal(out.dados?.classificadorSaltado, true);
  assert.equal(out.dados?.conscienciaOperacional?.consultado, undefined);
  assert.equal(/^Neste momento existe uma execução/i.test(out.mensagem), false);
});

test("E6-CA3: sem @cursor/sdk / publish Fila / mutação Motor-Dispatcher", () => {
  for (const m of MODULOS) {
    const src = lerModulo(m);
    assert.equal(src.includes("@cursor/sdk"), false, m);
    assert.equal(/publicarJobFila\s*\(/.test(src), false, m);
    assert.equal(/conduzirAposDecisaoGate|conduzirAposParecer/.test(src), false, m);
    assert.equal(/from\s+["'].*motorExecucao/.test(src), false, m);
    assert.equal(/from\s+["'].*executionQueue/.test(src), false, m);
  }
  // leitoresPadrao: só leitura Continuidade
  const leitores = lerModulo("leitoresPadrao.js");
  assert.equal(/abrirGate|consumirDecisao|registarJobPublicado|limparTudo/.test(leitores), false);
  assert.match(leitores, /obterGatePendenteMaisRecente/);
});

test("E6-CA4: regressão Classificador C1–C4 e Continuidade intactos", () => {
  assert.equal(classificar("Bom dia").classe, "conhecimento_geral");
  assert.equal(classificar("Como priorizar o MG2?").classe, "conversa_projeto");
  assert.equal(classificar("Resolva os bugs agora").classe, "trabalho_executivo");
  assert.equal(classificar("listar jobs").classe, "comando_operacional");

  const store = criarStoreContextoGate();
  assert.equal(decidirInterceptacaoContinuidade("Aprovado.", store), "classificador");
});

test("E6-CA5: NA1–NA4 — isolamento e degradação", async () => {
  // NA1: Consciência ≠ Motor/Fila/Dispatcher
  for (const m of MODULOS) {
    const src = lerModulo(m);
    assert.equal(/iniciarFluxoDispatcher|handoffDispatcher/.test(src), false, m);
  }

  // NA2: não decide Gates
  const cons = lerModulo("consultarAntesDeResponder.js") + lerModulo("influenciaDeliberacao.js");
  assert.equal(/aplicarDecisaoGate|consumirDecisao/.test(cons), false);

  // NA3: C1/C4 sem obrigação
  const c1 = await consultarEstadoExecutivoAntesDeResponder({ idClasse: "C1" });
  const c4 = await consultarEstadoExecutivoAntesDeResponder({ idClasse: "C4" });
  assert.equal(c1.consultado, false);
  assert.equal(c4.consultado, false);

  // NA4: falha de fonte não inventa
  const agg = await agregarEstadoExecutivo({
    leitores: {
      F2: () => {
        throw new Error("fila offline");
      },
      F3: () => [{ gateId: "G", parecerId: "P" }]
    }
  });
  assert.equal(agg.estado.jobsEmExecucao.length, 0);
  assert.equal(agg.estado.gatesPendentes.length, 1);
  assert.ok(agg.diagnostico.fontesDegradadas.includes("F2"));
});

test("E6: nenhuma escrita em Motor, Dispatcher, Fila, Continuidade, Painel", async () => {
  const store = criarStoreContextoGate();
  const fila = criarPublicadorFilaMemoria();
  store.abrirGate({
    gateId: "G-RO",
    parecerId: "PAR-RO",
    cicloId: null,
    abertoEm: new Date().toISOString(),
    solicitacaoResumo: "teste"
  });
  const gateAntes = store.obterGatePendenteMaisRecente();
  const jobsAntes = fila.jobs.length;

  const leitores = criarLeitoresConscienciaPadrao({
    storeContinuidade: store,
    jobsEmExecucao: () => [
      { id: "J", titulo: "correção dos bugs", status: "running" }
    ]
  });

  await consultarEstadoExecutivoAntesDeResponder({
    idClasse: "C2",
    leitores,
    agora: () => "2026-08-01T20:42:00.000Z"
  });

  const gateDepois = store.obterGatePendenteMaisRecente();
  assert.equal(gateDepois?.gateId, gateAntes?.gateId);
  assert.equal(gateDepois?.estado, "pendente");
  assert.equal(fila.jobs.length, jobsAntes);

  // Painel / orquestração — Consciência não importa UI/mutadores
  const dir = readdirSync(__dirname).filter((f) => f.endsWith(".js"));
  for (const f of dir) {
    if (f.endsWith(".test.js")) continue;
    const src = lerModulo(f);
    assert.equal(/htmlPainelOrquestracao|ligarPainelOrquestracao|escreverHeartbeat/.test(src), false, f);
  }
});

test("E6: C2 com lastro não altera contagem de Jobs na Fila", async () => {
  const store = criarStoreContextoGate();
  const fila = criarPublicadorFilaMemoria();
  const n0 = fila.jobs.length;

  await executiveEngine.executar("Como devemos priorizar o MG2?", {
    storeContinuidade: store,
    publicarJob: fila.publicarJob.bind(fila),
    leitoresConsciencia: {
      F1: () => [],
      F2: () => [
        { id: "JOB-BUGS", titulo: "correção dos bugs", status: "running" }
      ],
      F3: () => [],
      F4: () => ({ estado: "ocioso" }),
      F5: () => ({ estado: "ocioso", emCurso: false }),
      F6: () => ({ estado: "ocioso", ocupado: false }),
      F7: () => ({ disponivel: false, alertas: 0 }),
      F8: () => ({ id: "mg2", nome: "MG2" })
    }
  });

  assert.equal(fila.jobs.length, n0);
});
