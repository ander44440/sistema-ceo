/**
 * Etapa 5A — Job persistido ≠ operação activa da sessão.
 * Não altera JSON histórico, estados, TTL, nem JOB-ID explícito.
 */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import {
  adotarJobsDaFilaParaAcompanhamento,
  criarStoreAcompanhamento,
  ehOperacaoAtivaCorrente,
  idsAdotadosDoStoreSessao,
  jobTemObjetivoCanonico
} from "./acompanhamentoJob.js";
import { extrairEstadoOperacional } from "../conversacaoNatural/estadoOperacional.js";
import {
  listarCandidatosJobAberto,
  MOTIVO_JOB_ALVO_AUSENTE,
  MOTIVO_OBJETIVO_AUSENTE_JOB_ALVO,
  resolverRecuperacaoOperacional
} from "../conversacaoNatural/recuperacaoJob.js";
import { deveInterceptarOperacional } from "../conversacaoNatural/interceptacaoOperacional.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const QUEUE = join(__dirname, "../../../executive/queue");
const JOB_077_PATH = join(QUEUE, "JOB-000077.json");

const COA_MG2 = { id: "prj-mg2", nome: "Motoboy Game 2" };
const OBJETIVO_NOVO =
  "Implementar GET /health no servidor Node e devolver 200 sem alterar a fila histórica.";

function lerJobDisco(nome) {
  const raw = readFileSync(join(QUEUE, nome));
  const hash = createHash("sha256").update(raw).digest("hex");
  const job = JSON.parse(raw.toString("utf8").replace(/^\uFEFF/, ""));
  return { raw, hash, job };
}

function jobNovoSessao(extra = {}) {
  return {
    id: "JOB-000201",
    estado: "pending",
    titulo: "endpoint saúde",
    objetivo: OBJETIVO_NOVO,
    projeto: "prj-mg2",
    origem: "ceo",
    ...extra
  };
}

test("Etapa 5A T1: needs_correction antigo sem objetivo + COA MG2 ≠ operação activa", () => {
  const legado = {
    id: "JOB-000077",
    estado: "needs_correction",
    titulo: "ENVIAR AO CEO…",
    descricao: "texto legado",
    projeto: "prj-mg2"
  };
  assert.equal(jobTemObjetivoCanonico(legado), false);
  assert.equal(
    ehOperacaoAtivaCorrente(legado, { missaoActiva: COA_MG2 }),
    false
  );
  const e = extrairEstadoOperacional({
    jobs: [legado],
    missaoActiva: COA_MG2
  });
  assert.equal(e.operacaoAberta, false);
  assert.equal(e.jobActivo, null);
  assert.equal(
    deveInterceptarOperacional({
      texto: "continuar",
      jobs: [legado],
      missaoActiva: COA_MG2
    }),
    false
  );
  assert.deepEqual(listarCandidatosJobAberto([legado], { missaoActiva: COA_MG2 }), []);
});

test("Etapa 5A T2: JOB-000077 real permanece no disco e não vira jobActivo", () => {
  const { hash, job } = lerJobDisco("JOB-000077.json");
  assert.equal(job.id, "JOB-000077");
  assert.equal(job.estado, "needs_correction");
  assert.equal(Object.prototype.hasOwnProperty.call(job, "objetivo"), false);
  const e = extrairEstadoOperacional({
    jobs: [job],
    missaoActiva: COA_MG2
  });
  assert.equal(e.operacaoAberta, false);
  assert.equal(e.jobActivo, null);
  const hashDepois = createHash("sha256")
    .update(readFileSync(JOB_077_PATH))
    .digest("hex");
  assert.equal(hashDepois, hash);
});

test("Etapa 5A T3: Job novo com objetivo adoptado na sessão pode ser operação activa", () => {
  const novo = jobNovoSessao({ estado: "running" });
  const e = extrairEstadoOperacional({
    jobs: [novo],
    missaoActiva: COA_MG2
  });
  assert.equal(e.operacaoAberta, true);
  assert.equal(e.jobActivo?.id, "JOB-000201");

  const ncSessao = jobNovoSessao({
    id: "JOB-000202",
    estado: "needs_correction"
  });
  const eNc = extrairEstadoOperacional({
    jobs: [ncSessao],
    missaoActiva: COA_MG2,
    idsAdotadosSessao: ["JOB-000202"]
  });
  assert.equal(eNc.operacaoAberta, true);
  assert.equal(eNc.jobActivo?.id, "JOB-000202");
});

test("Etapa 5A T4: Job do projecto A não é operação activa do COA B", () => {
  const jobA = jobNovoSessao({
    projeto: "prj-teste-alfa",
    estado: "running"
  });
  const e = extrairEstadoOperacional({
    jobs: [jobA],
    missaoActiva: COA_MG2
  });
  assert.equal(e.operacaoAberta, false);
  assert.equal(e.jobActivo, null);
  assert.equal(
    ehOperacaoAtivaCorrente(jobA, { missaoActiva: COA_MG2 }),
    false
  );
});

test("Etapa 5A T5: Job legado sem objetivo não é operação activa automática", () => {
  const legado = {
    id: "JOB-000070",
    estado: "pending",
    titulo: "legado",
    descricao: "só descrição",
    projeto: "prj-mg2"
  };
  assert.equal(jobTemObjetivoCanonico(legado), false);
  const e = extrairEstadoOperacional({
    jobs: [legado],
    missaoActiva: COA_MG2
  });
  assert.equal(e.operacaoAberta, false);
  assert.equal(e.jobActivo, null);
});

test("Etapa 5A T6: JOB-ID explícito continua acessível e não adopta sozinho", async () => {
  const { job, hash } = lerJobDisco("JOB-000077.json");
  const recId = await resolverRecuperacaoOperacional({
    texto: "continuar JOB-000077",
    jobs: [job],
    obterJob: async () => job
  });
  assert.equal(recId.ok, false);
  assert.equal(recId.motivo, MOTIVO_OBJETIVO_AUSENTE_JOB_ALVO);
  assert.equal(recId.jobAlvo?.id, "JOB-000077");

  const recCurto = await resolverRecuperacaoOperacional({
    texto: "continuar",
    jobs: [job],
    missaoActiva: COA_MG2
  });
  assert.equal(recCurto.ok, false);
  assert.equal(recCurto.motivo, MOTIVO_JOB_ALVO_AUSENTE);

  const store = criarStoreAcompanhamento();
  await adotarJobsDaFilaParaAcompanhamento(store, {
    listarJobs: async () => [job],
    missaoActiva: COA_MG2
  });
  assert.equal(store.obter("JOB-000077"), null);
  assert.equal(idsAdotadosDoStoreSessao(store).has("JOB-000077"), false);
  const hashDepois = createHash("sha256")
    .update(readFileSync(JOB_077_PATH))
    .digest("hex");
  assert.equal(hashDepois, hash);
});

test("Etapa 5A T7: após reinício (store vazio) Jobs antigos não são readoptados", async () => {
  const { job } = lerJobDisco("JOB-000077.json");
  const store = criarStoreAcompanhamento();
  const adocao = await adotarJobsDaFilaParaAcompanhamento(store, {
    listarJobs: async () => [job],
    missaoActiva: COA_MG2
  });
  assert.equal(adocao.adotados.length, 0);
  assert.ok(
    adocao.ignorados.some(
      (i) =>
        i.jobId === "JOB-000077" &&
        (i.motivo === "needs_correction_historico" || i.motivo === "sem_objetivo")
    )
  );
  const e = extrairEstadoOperacional({
    jobs: [job],
    missaoActiva: COA_MG2,
    idsAdotadosSessao: idsAdotadosDoStoreSessao(store)
  });
  assert.equal(e.operacaoAberta, false);
  assert.equal(e.jobActivo, null);
});

test("Etapa 5A T8: nenhum JSON histórico é alterado", () => {
  for (const nome of [
    "JOB-000077.json",
    "JOB-000074.json",
    "JOB-000093.json",
    "JOB-000095.json",
    "JOB-000107.json"
  ]) {
    const { hash } = lerJobDisco(nome);
    const hash2 = createHash("sha256")
      .update(readFileSync(join(QUEUE, nome)))
      .digest("hex");
    assert.equal(hash2, hash, nome);
  }
});

test("Etapa 5A: origem homologação explícita não é operação activa", () => {
  const job = {
    id: "JOB-000074",
    estado: "running",
    objetivo: OBJETIVO_NOVO,
    projeto: "prj-mg2",
    origem: "homologacao-dia3-teste2"
  };
  assert.equal(ehOperacaoAtivaCorrente(job, { missaoActiva: COA_MG2 }), false);
  const e = extrairEstadoOperacional({
    jobs: [job],
    missaoActiva: COA_MG2
  });
  assert.equal(e.operacaoAberta, false);
});
