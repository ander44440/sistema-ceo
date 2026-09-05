/**
 * P1 — Somente o Motor cria/publica Jobs de execução.
 * C4/fila = consulta. Sem POST directo.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test, beforeEach, afterEach } from "node:test";
import { classificar } from "./regras.js";
import { classificarEEncaminhar } from "./encaminhador.js";
import { capacidadeFila } from "../executiveEngine/capacidades/fila.js";
import { executiveEngine } from "../executiveEngine/index.js";
import { criarPublicadorFilaMemoria } from "../motorExecucao/ponteParecerJob.js";
import { resetStoreContinuidadePadrao } from "../continuidadeGate/integracaoConversa.js";
import {
  definirGestorTopicosAtivo,
  resetEstadoTopicosSessao
} from "./topicosSessao.js";
import { resetEstadoObjectivoSessao } from "./objectivoSessao.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

beforeEach(() => {
  resetStoreContinuidadePadrao();
  resetEstadoTopicosSessao();
  resetEstadoObjectivoSessao();
  // Isolamento de prova P1: o gestor de tópicos não faz parte deste contrato.
  definirGestorTopicosAtivo(false);
});

afterEach(() => {
  definirGestorTopicosAtivo(true);
  resetEstadoTopicosSessao();
  resetEstadoObjectivoSessao();
});

test("P1: publicar job → C3 / motor_execucao", async () => {
  const texto = "publicar job teste";
  const s = classificar(texto);
  const rota = classificarEEncaminhar(texto);
  assert.equal(s.classe, "trabalho_executivo");
  assert.equal(s.destino, "motor_execucao");
  assert.equal(rota.destino, "motor_execucao");

  const fila = criarPublicadorFilaMemoria();
  const out = await executiveEngine.executar(texto, {
    publicarJob: fila.publicarJob.bind(fila)
  });
  assert.equal(out.dados?.classificacao?.classe, "trabalho_executivo");
  assert.equal(out.dados?.encaminhamento?.destino, "motor_execucao");
  assert.equal(out.dados?.motorAcionado, true);
  assert.ok(
    out.dados?.motor?.aguardandoGate === true ||
      out.dados?.motor?.publicado === true
  );
});

test("P1: enviar job para a fila → C3 / Motor", async () => {
  const texto = "enviar job para a fila";
  const s = classificar(texto);
  assert.equal(s.classe, "trabalho_executivo");
  assert.equal(s.destino, "motor_execucao");

  const fila = criarPublicadorFilaMemoria();
  const out = await executiveEngine.executar(texto, {
    publicarJob: fila.publicarJob.bind(fila)
  });
  assert.equal(out.dados?.classificacao?.classe, "trabalho_executivo");
  assert.equal(out.dados?.encaminhamento?.destino, "motor_execucao");
  assert.equal(out.dados?.motorAcionado, true);
  assert.ok(
    out.dados?.motor?.aguardandoGate === true ||
      out.dados?.motor?.publicado === true
  );
});

test("P1: listar jobs → C4 / fila, só consulta", async () => {
  const texto = "listar jobs";
  const s = classificar(texto);
  assert.equal(s.classe, "comando_operacional");
  assert.equal(s.destino, "capacidade_operacional");

  const posts = [];
  const origFetch = globalThis.fetch;
  globalThis.fetch = async (url, opts = {}) => {
    const method = String(opts.method || "GET").toUpperCase();
    if (method === "POST") posts.push(String(url));
    return {
      ok: true,
      status: 200,
      async json() {
        return { ok: true, jobs: [] };
      }
    };
  };
  try {
    const out = await executiveEngine.executar(texto, {
      publicarJob: async () => {
        throw new Error("C4 consulta não pode publicar via Motor");
      }
    });
    assert.equal(out.dados?.classificacao?.classe, "comando_operacional");
    assert.equal(out.dados?.encaminhamento?.destino, "capacidade_operacional");
    assert.equal(out.capacidade, "fila");
    assert.equal(out.dados?.motorAcionado, false);
    assert.equal(out.dados?.publicacaoDirecta, false);
    assert.equal(posts.length, 0);
  } finally {
    globalThis.fetch = origFetch;
  }
});

test("P1: capacidadeFila com publicar_job_fila não faz POST nem cria Job", async () => {
  const posts = [];
  const origFetch = globalThis.fetch;
  globalThis.fetch = async (url, opts = {}) => {
    const method = String(opts.method || "GET").toUpperCase();
    if (method === "POST") {
      posts.push(String(url));
      return {
        ok: true,
        status: 200,
        async json() {
          return {
            ok: true,
            job: { id: "JOB-NAO-DEVE-EXISTIR", estado: "pending" }
          };
        }
      };
    }
    return {
      ok: true,
      status: 200,
      async json() {
        return { ok: true, jobs: [] };
      }
    };
  };
  try {
    const out = await capacidadeFila.executar({
      texto: "publicar job teste",
      intencao: { id: "publicar_job_fila", capacidade: "fila" }
    });
    assert.equal(out.ok, false);
    assert.equal(out.modo, "publicacao_job_proibida_c4");
    assert.equal(out.dados?.publicacaoDirecta, false);
    assert.equal(out.dados?.job, undefined);
    assert.equal(posts.length, 0);
  } finally {
    globalThis.fetch = origFetch;
  }
});

test("P1: fonte de fila.js não publica Job por POST", () => {
  const src = readFileSync(
    join(__dirname, "../executiveEngine/capacidades/fila.js"),
    "utf8"
  );
  assert.equal(/publicarJobFila/.test(src), false);
  assert.equal(/method:\s*["']POST["']/.test(src), false);
  assert.equal(/queue\/jobs/.test(src), false);
});
