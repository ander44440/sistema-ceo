/**
 * Correção 1 — Continuidade por JOB-ID (não criar wrapper).
 * «Despache/Acompanhe/Verifique o JOB-NNNNNN» ≠ criar Job novo.
 */
import assert from "node:assert/strict";
import { test, beforeEach } from "node:test";
import {
  ehAutorizacaoExplicitaCriarJob,
  ehReferenciaExplicitaJobId,
  extrairIdsJobMencionados,
  normalizarTexto
} from "./regras.js";
import { conduzirTrabalhoExecutivoC3 } from "./integracaoNucleo.js";
import { executiveEngine } from "../executiveEngine/index.js";
import { criarPublicadorFilaMemoria } from "../motorExecucao/ponteParecerJob.js";
import { resetStoreContinuidadePadrao } from "../continuidadeGate/integracaoConversa.js";
import { resetEstadoTopicosSessao } from "./topicosSessao.js";
import { resetEstadoObjectivoSessao } from "./objectivoSessao.js";
import { reiniciarAutoridadeDelegadaParaTestes } from "../autoridadeDelegada/autoridadeDelegada.js";

const JOB075 = {
  id: "JOB-000075",
  titulo: "ALFA — ficheiro",
  estado: "completed",
  projeto: "prj-teste-alfa",
  descricao: "criar ficheiro"
};

beforeEach(() => {
  resetStoreContinuidadePadrao();
  resetEstadoTopicosSessao();
  resetEstadoObjectivoSessao();
  reiniciarAutoridadeDelegadaParaTestes();
  executiveEngine.reiniciarAcompanhamentoParaTestes();
});

test("unit: Despache o JOB-000075 ≠ autorização criar Job", () => {
  const t = normalizarTexto("Despache o JOB-000075");
  assert.equal(ehReferenciaExplicitaJobId(t), true);
  assert.deepEqual(extrairIdsJobMencionados(t), ["JOB-000075"]);
  assert.equal(ehAutorizacaoExplicitaCriarJob(t), false);
  assert.equal(
    ehAutorizacaoExplicitaCriarJob(
      normalizarTexto("Crie o Job necessário para o ficheiro ALFA")
    ),
    true
  );
});

async function depsComJob075(fila) {
  return {
    obterJob: async (id) =>
      String(id).toUpperCase() === "JOB-000075" ? JOB075 : null,
    listarPorEstado: async () => [],
    publicarJob: fila.publicarJob.bind(fila),
    leitoresConsciencia: {
      F1: async () => [],
      F2: async () => [],
      F3: async () => [],
      F4: async () => ({ estado: "activo" }),
      F5: async () => ({ estado: "ocioso", emCurso: false }),
      F6: async () => ({ estado: "ocioso", ocupado: false }),
      F7: async () => ({ disponivel: false, alertas: 0 }),
      F8: async () => ({ id: "prj-teste-alfa", nome: "PROJETO TESTE ALFA" })
    }
  };
}

test("A: Despache o JOB-000075 → não cria Job; referencia 075", async () => {
  const fila = criarPublicadorFilaMemoria();
  const deps = await depsComJob075(fila);
  const out = await executiveEngine.executar("Despache o JOB-000075", deps);
  assert.equal(fila.jobs.length, 0);
  assert.equal(out.dados?.continuidadeJobId || out.dados?.motor?.motivo === "continuidade_job_existente", true);
  assert.equal(out.dados?.jobReferenciado?.id || out.dados?.idsJobMencionados?.[0], "JOB-000075");
  assert.match(String(out.mensagem || ""), /JOB-000075/);
  assert.notEqual(out.dados?.motor?.publicado, true);
});

test("B: Acompanhe o JOB-000075 → não cria Job", async () => {
  const fila = criarPublicadorFilaMemoria();
  const deps = await depsComJob075(fila);
  const out = await executiveEngine.executar("Acompanhe o JOB-000075", deps);
  assert.equal(fila.jobs.length, 0);
  assert.notEqual(out.dados?.motor?.publicado, true);
});

test("C: Verifique o JOB-000075 → não cria Job", async () => {
  const fila = criarPublicadorFilaMemoria();
  const deps = await depsComJob075(fila);
  const out = await executiveEngine.executar("Verifique o JOB-000075", deps);
  assert.equal(fila.jobs.length, 0);
  assert.notEqual(out.dados?.motor?.publicado, true);
});

test("D: JOB-000075 completed → informa existente, sem wrapper", async () => {
  const fila = criarPublicadorFilaMemoria();
  const deps = await depsComJob075(fila);
  const out = await conduzirTrabalhoExecutivoC3(
    "Despache o JOB-000075 para execução e acompanhe.",
    {
      classe: "trabalho_executivo",
      confianca: 0.9,
      razaoCurta: "c3",
      destino: "motor_execucao"
    },
    {
      obterJob: deps.obterJob,
      publicarJob: fila.publicarJob.bind(fila),
      conduzirMotor: async () => {
        assert.fail("Motor não deve publicar wrapper");
      }
    }
  );
  assert.equal(out.dados?.continuidadeJobId, true);
  assert.equal(out.dados?.jobReferenciado?.id, "JOB-000075");
  assert.equal(out.dados?.jobReferenciado?.estado, "completed");
  assert.equal(fila.jobs.length, 0);
});

test("E: criar Job legítimo sem JOB-ID continua a funcionar", async () => {
  const fila = criarPublicadorFilaMemoria();
  assert.equal(
    ehAutorizacaoExplicitaCriarJob(
      normalizarTexto("Crie o Job necessário para criar o ficheiro alfa.txt")
    ),
    true
  );
  const out = await conduzirTrabalhoExecutivoC3(
    "Crie o Job necessário para criar o ficheiro alfa.txt",
    {
      classe: "trabalho_executivo",
      confianca: 0.9,
      razaoCurta: "criar",
      destino: "motor_execucao"
    },
    {
      obterJob: async () => null,
      publicarJob: fila.publicarJob.bind(fila),
      conduzirMotor: async (_p, motorDeps) => {
        const job = await motorDeps.publicarJob({
          titulo: "alfa",
          descricao: "criar ficheiro",
          projeto: "prj-teste-alfa"
        });
        return { publicado: true, job, fluxoIniciado: true };
      }
    }
  );
  assert.notEqual(out.dados?.continuidadeJobId, true);
  assert.ok(fila.jobs.length >= 1 || out.dados?.motor?.publicado === true);
});
