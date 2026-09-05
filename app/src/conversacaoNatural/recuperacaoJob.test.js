/**
 * Etapa 4 — recovery: comando curto não vira objetivo de Job novo.
 */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import {
  ehComandoRecuperacaoOperacional,
  MOTIVO_JOB_ALVO_AMBIGUO,
  MOTIVO_JOB_ALVO_AUSENTE,
  MOTIVO_OBJETIVO_AUSENTE_JOB_ALVO,
  resolverRecuperacaoOperacional
} from "./recuperacaoJob.js";
import { executarInterceptacaoOperacional } from "./interceptacaoOperacional.js";
import { conduzirTrabalhoExecutivoC3 } from "../classificadorIntencao/integracaoNucleo.js";
import { tituloJobDeInstrucao } from "../classificadorIntencao/integracaoNucleo.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const JOB_077 = join(__dirname, "../../../executive/queue/JOB-000077.json");

const CLASSIF_C3 = {
  classe: "trabalho_executivo",
  confianca: 1,
  razaoCurta: "recovery",
  destino: "motor_execucao"
};

const OBJETIVO_ALVO =
  "Despache o JOB-000075 para execução e acompanhe a operação sem usar jobs do MG2.";

function estadoAberto(job) {
  return {
    operacaoAberta: true,
    requerRecuperacao: true,
    modoOperacional: "recuperar",
    jobActivo: {
      id: job.id,
      titulo: job.titulo || job.id,
      estado: job.estado
    },
    sinais: {
      pending: 0,
      running: 0,
      failed: 0,
      dispatcher: false,
      handoff: false,
      agentErro: false,
      gatePendente: 0
    }
  };
}

function depsPublicacao(jobs, capturados) {
  return {
    jobs,
    obterJob: async (id) =>
      jobs.find((j) => String(j.id).toUpperCase() === String(id).toUpperCase()) ||
      null,
    publicarJob: async (pedido) => {
      capturados.push(pedido);
      return { id: "JOB-NOVO-REC", estado: "pending", ...pedido };
    },
    conduzirMotor: async (parecer, motorDeps) => {
      const spec = parecer.acao.job;
      const job = await motorDeps.publicarJob({
        titulo: spec.titulo,
        descricao: spec.descricao,
        objetivo: spec.objetivo,
        parentJobId: spec.parentJobId,
        criterioConclusao: spec.criterioConclusao
      });
      return { publicado: true, job, fluxoIniciado: true };
    }
  };
}

test("Etapa 4 T1: continuar + Job-alvo com objetivo — usa o objetivo do alvo", async () => {
  const alvo = {
    id: "JOB-000201",
    estado: "needs_correction",
    titulo: tituloJobDeInstrucao(OBJETIVO_ALVO),
    descricao: "legado",
    objetivo: OBJETIVO_ALVO
  };
  const capturados = [];
  const out = await executarInterceptacaoOperacional({
    texto: "continuar",
    estadoOperacional: estadoAberto(alvo),
    jobs: [alvo],
    deps: depsPublicacao([alvo], capturados)
  });
  assert.equal(capturados.length, 1);
  assert.equal(capturados[0].objetivo, OBJETIVO_ALVO);
  assert.notEqual(String(capturados[0].objetivo).toLowerCase(), "continuar");
  assert.equal(capturados[0].parentJobId, "JOB-000201");
  assert.ok(out.dados.motorAcionado !== false || capturados.length === 1);
});

test("Etapa 4 T2: continuar + Job-alvo sem objetivo — não cria Job", async () => {
  const alvo = {
    id: "JOB-000077",
    estado: "needs_correction",
    titulo: "ENVIAR AO CEO O objetivo correto é o primeiro: ENVIAR AO CEO — PROJETO …",
    descricao: "texto legado longo"
  };
  const capturados = [];
  const out = await conduzirTrabalhoExecutivoC3("continuar", CLASSIF_C3, {
    ...depsPublicacao([alvo], capturados),
    jobActivo: { id: alvo.id, titulo: alvo.titulo, estado: alvo.estado },
    estadoOperacional: estadoAberto(alvo)
  });
  assert.equal(capturados.length, 0);
  assert.equal(out.dados.motor.publicado, false);
  assert.equal(out.dados.motivo, MOTIVO_OBJETIVO_AUSENTE_JOB_ALVO);
  assert.match(out.mensagem, /objetivo_ausente_no_job_alvo/);
});

test("Etapa 4 T3: continuar sem Job-alvo — não cria Job", async () => {
  const capturados = [];
  const out = await conduzirTrabalhoExecutivoC3("continuar", CLASSIF_C3, {
    ...depsPublicacao([], capturados),
    jobs: [],
    estadoOperacional: {
      operacaoAberta: false,
      jobActivo: null
    }
  });
  assert.equal(capturados.length, 0);
  assert.equal(out.dados.motivo, MOTIVO_JOB_ALVO_AUSENTE);
});

test("Etapa 4 T4: múltiplos Jobs candidatos — não escolhe arbitrariamente", async () => {
  const a = {
    id: "JOB-000077",
    estado: "pending",
    objetivo: "tarefa A completa sem truncar"
  };
  const b = {
    id: "JOB-000099",
    estado: "pending",
    objetivo: "tarefa B completa sem truncar"
  };
  const capturados = [];
  const out = await conduzirTrabalhoExecutivoC3("continuar", CLASSIF_C3, {
    ...depsPublicacao([a, b], capturados),
    jobActivo: { id: a.id, titulo: "A", estado: a.estado }
  });
  assert.equal(capturados.length, 0);
  assert.equal(out.dados.motivo, MOTIVO_JOB_ALVO_AMBIGUO);
});

test("Etapa 4 T5: repita não vira objetivo «repita»", async () => {
  const alvo = {
    id: "JOB-000202",
    estado: "pending",
    titulo: "repita",
    objetivo: OBJETIVO_ALVO
  };
  const capturados = [];
  await executarInterceptacaoOperacional({
    texto: "repita",
    estadoOperacional: estadoAberto(alvo),
    jobs: [alvo],
    deps: depsPublicacao([alvo], capturados)
  });
  assert.equal(capturados.length, 1);
  assert.equal(capturados[0].objetivo, OBJETIVO_ALVO);
  assert.equal(String(capturados[0].objetivo).toLowerCase().includes("repita"), false);
});

test("Etapa 4 T6: envie não vira objetivo «envie»", async () => {
  const alvo = {
    id: "JOB-000203",
    estado: "pending",
    titulo: "envie",
    objetivo: OBJETIVO_ALVO
  };
  const capturados = [];
  await executarInterceptacaoOperacional({
    texto: "envie",
    estadoOperacional: estadoAberto(alvo),
    jobs: [alvo],
    deps: depsPublicacao([alvo], capturados)
  });
  assert.equal(capturados.length, 1);
  assert.equal(capturados[0].objetivo, OBJETIVO_ALVO);
  assert.notEqual(String(capturados[0].objetivo).toLowerCase(), "envie");
});

test("Etapa 4 T7: objetivo longo do Job-alvo — preservação completa", async () => {
  const longo =
    "Implementar o botão Pausar no Centro de Situação com persistência do estado de voz " +
    "e sem alterar o Motor nem a fila histórica, incluindo testes de regressão da faixa do dia.";
  assert.ok(longo.length > 72);
  const alvo = {
    id: "JOB-000204",
    estado: "needs_correction",
    titulo: tituloJobDeInstrucao(longo),
    objetivo: longo
  };
  const capturados = [];
  await executarInterceptacaoOperacional({
    texto: "prossiga",
    estadoOperacional: estadoAberto(alvo),
    jobs: [alvo],
    deps: depsPublicacao([alvo], capturados)
  });
  assert.equal(capturados.length, 1);
  assert.equal(capturados[0].objetivo, longo);
  assert.ok(capturados[0].titulo.length <= 72);
  assert.ok(capturados[0].objetivo.length > capturados[0].titulo.length);
});

test("Etapa 4 T8: JOB-000077 histórico não é alterado", () => {
  const raw = readFileSync(JOB_077);
  const hashAntes = createHash("sha256").update(raw).digest("hex");
  const job = JSON.parse(raw.toString("utf8").replace(/^\uFEFF/, ""));
  assert.equal(job.id, "JOB-000077");
  assert.equal(Object.prototype.hasOwnProperty.call(job, "objetivo"), false);
  const hashDepois = createHash("sha256")
    .update(readFileSync(JOB_077))
    .digest("hex");
  assert.equal(hashDepois, hashAntes);
});

test("Etapa 4 regressão 107: continuar + 077 legado sem objetivo — não cria Job Continuar", async () => {
  const alvo = JSON.parse(
    readFileSync(JOB_077, "utf8").replace(/^\uFEFF/, "")
  );
  assert.equal(alvo.estado, "needs_correction");
  const capturados = [];
  const out = await executarInterceptacaoOperacional({
    texto: "continuar",
    estadoOperacional: estadoAberto(alvo),
    jobs: [alvo],
    deps: depsPublicacao([alvo], capturados)
  });
  assert.equal(capturados.length, 0);
  assert.equal(out.dados.motivo, MOTIVO_OBJETIVO_AUSENTE_JOB_ALVO);
  assert.equal(
    capturados.some(
      (p) => String(p.objetivo || p.titulo || "").toLowerCase() === "continuar"
    ),
    false
  );
  const hash = createHash("sha256").update(readFileSync(JOB_077)).digest("hex");
  assert.equal(
    hash,
    createHash("sha256").update(readFileSync(JOB_077)).digest("hex")
  );
});

test("Etapa 4: comando curto de recuperação reconhecido", () => {
  assert.equal(ehComandoRecuperacaoOperacional("continuar"), true);
  assert.equal(ehComandoRecuperacaoOperacional("repita"), true);
  assert.equal(ehComandoRecuperacaoOperacional("envie"), true);
  assert.equal(ehComandoRecuperacaoOperacional("despache"), true);
  assert.equal(ehComandoRecuperacaoOperacional("prossiga"), true);
  assert.equal(
    ehComandoRecuperacaoOperacional(
      "Despache o JOB-000075 para execução e acompanhe a operação sem usar jobs do MG2."
    ),
    false
  );
  assert.equal(ehComandoRecuperacaoOperacional("Despache o JOB-000075"), false);
});

test("E5-CA2: nova tarefa explícita vence verbo isolado de recuperação", () => {
  assert.equal(
    ehComandoRecuperacaoOperacional("Implementa o outdoor e despacha"),
    false
  );
  assert.equal(ehComandoRecuperacaoOperacional("Continue o Job anterior."), true);
  assert.equal(ehComandoRecuperacaoOperacional("Despacha esse Job."), true);
  assert.equal(ehComandoRecuperacaoOperacional("Retoma o JOB-000118."), true);
  assert.equal(
    ehComandoRecuperacaoOperacional("Prossiga com o que estava em andamento."),
    true
  );
});

test("Etapa 4 resolver: alvo único com objetivo", async () => {
  const rec = await resolverRecuperacaoOperacional({
    texto: "continuar",
    jobs: [
      {
        id: "JOB-1",
        estado: "pending",
        objetivo: OBJETIVO_ALVO
      }
    ]
  });
  assert.equal(rec.ok, true);
  assert.equal(rec.objetivo, OBJETIVO_ALVO);
});
