/**
 * IMP-060 E2 — publicação oficial não usa cutover Railway.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { test, beforeEach } from "node:test";
import { criarFilaExecucao } from "../../server/executionQueue.js";
import { criarStoreContextoGate } from "../continuidadeGate/contexto.js";
import { resetStoreContinuidadePadrao } from "../continuidadeGate/integracaoConversa.js";
import { ceoQueueApiUrl, ceoApiUrl } from "../ceoApiBase.js";
import { executiveEngine } from "./index.js";
import { publicarJobFila } from "./filaCliente.js";

const aqui = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(aqui, "../../..");

beforeEach(() => {
  resetStoreContinuidadePadrao();
});

test("E2-CA2: contrato publicarJobFila(pedido) → job com id (assinatura estável)", async () => {
  const urls = [];
  const prev = globalThis.fetch;
  globalThis.fetch = async (url, init) => {
    urls.push({ url: String(url), method: init?.method, body: init?.body });
    return {
      ok: true,
      status: 200,
      json: async () => ({
        ok: true,
        job: {
          id: "JOB-000099",
          estado: "pending",
          titulo: "smoke-e2"
        }
      })
    };
  };
  try {
    const job = await publicarJobFila({
      titulo: "smoke-e2",
      descricao: "IMP-060 E2"
    });
    assert.equal(job.id, "JOB-000099");
    assert.equal(job.estado, "pending");
    assert.equal(urls.length, 1);
    assert.equal(urls[0].method, "POST");
    // Sem host Railway — path relativo (ou companion QUEUE base)
    assert.equal(urls[0].url.includes("railway.app"), false);
    assert.ok(
      urls[0].url === "/api/ceo/queue/jobs" ||
        urls[0].url.endsWith("/api/ceo/queue/jobs")
    );
  } finally {
    globalThis.fetch = prev;
  }
});

test("E2: ceoQueueApiUrl ignora VITE_CEO_API_BASE (cutover desligado na fila)", () => {
  // Em Node sem Vite, ambas as bases costumam estar vazias → paths relativos.
  const q = ceoQueueApiUrl("/api/ceo/queue/jobs");
  const api = ceoApiUrl("/api/ceo/llm-status");
  assert.equal(q.includes("railway.app"), false);
  assert.ok(q === "/api/ceo/queue/jobs" || q.endsWith("/api/ceo/queue/jobs"));
  // LLM continua no helper genérico (cutover BP-001 intacto quando base existir)
  assert.ok(
    api === "/api/ceo/llm-status" || api.endsWith("/api/ceo/llm-status")
  );
});

test("E2: fonte publicarJobFila usa ceoQueueApiUrl, não ceoApiUrl", () => {
  const src = fs.readFileSync(path.join(aqui, "filaCliente.js"), "utf8");
  assert.match(src, /ceoQueueApiUrl\(\s*["']\/api\/ceo\/queue\/jobs["']\s*\)/);
  assert.equal(/ceoApiUrl\s*\(/.test(src), false);
});

test("E2-CA1: persistência fila oficial → JOB-*.json pending em executive/queue", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "ceo-e2-fila-"));
  try {
    fs.mkdirSync(path.join(root, "executive", "queue"), { recursive: true });
    const fila = criarFilaExecucao(root);
    const job = fila.publicar({
      titulo: "IMP-060 E2 homologação",
      descricao: "Artefacto na fila oficial (REQ-045).",
      origem: "ceo",
      projeto: "CEO"
    });
    assert.equal(job.estado, "pending");
    const ficheiro = path.join(root, "executive", "queue", `${job.id}.json`);
    assert.equal(fs.existsSync(ficheiro), true);
    const lido = JSON.parse(fs.readFileSync(ficheiro, "utf8"));
    assert.equal(lido.id, job.id);
    assert.equal(lido.estado, "pending");
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("E2: Núcleo injecta publicarJob sem VITE_CEO_API_BASE — Gate→Aprovado → Job na fila", async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "ceo-e2-nucleo-"));
  fs.mkdirSync(path.join(root, "executive", "queue"), { recursive: true });
  const fila = criarFilaExecucao(root);
  const prev = globalThis.fetch;
  globalThis.fetch = async (url, init) => {
    const u = String(url);
    if (u.includes("/api/ceo/queue/jobs") && init?.method === "POST") {
      const body = JSON.parse(String(init.body || "{}"));
      const job = fila.publicar(body);
      return {
        ok: true,
        status: 201,
        json: async () => ({ ok: true, job })
      };
    }
    return { ok: false, status: 404, json: async () => ({ ok: false }) };
  };
  try {
    const store = criarStoreContextoGate();
    // Sem deps.publicarJob — como Centro de Situação (regressão «Falta publicador»)
    const gate = await executiveEngine.executar("Resolva os bugs.", {
      storeContinuidade: store,
      registro: store.registroJobs
    });
    assert.equal(gate.dados?.motor?.aguardandoGate, true);
    assert.equal(
      /Falta publicador/i.test(gate.mensagem || ""),
      false
    );

    const aprov = await executiveEngine.executar("Aprovado.", {
      storeContinuidade: store,
      registro: store.registroJobs
    });
    assert.equal(/Falta publicador/i.test(aprov.mensagem || ""), false);
    assert.ok(aprov.dados?.job?.id, "Job id esperado após Aprovado");
    const ficheiro = path.join(
      root,
      "executive",
      "queue",
      `${aprov.dados.job.id}.json`
    );
    assert.equal(fs.existsSync(ficheiro), true);
    const lido = JSON.parse(fs.readFileSync(ficheiro, "utf8"));
    assert.equal(lido.estado, "pending");
  } finally {
    globalThis.fetch = prev;
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("E2 evidência: inject → publicarJobFila → executive/queue real (repo)", async () => {
  const prev = globalThis.fetch;
  const fila = criarFilaExecucao(repoRoot);
  let jobId = null;
  globalThis.fetch = async (url, init) => {
    if (String(url).includes("/api/ceo/queue/jobs") && init?.method === "POST") {
      const body = JSON.parse(String(init.body || "{}"));
      body.titulo = body.titulo || "IMP-060 E2 nucleo";
      const job = fila.publicar({
        ...body,
        titulo: "IMP-060 E2 nucleo (inject)",
        descricao: body.descricao || "Evidencia Gate→Aprovado sem deps.publicarJob"
      });
      jobId = job.id;
      return {
        ok: true,
        status: 201,
        json: async () => ({ ok: true, job })
      };
    }
    return { ok: false, status: 404, json: async () => ({ ok: false }) };
  };
  try {
    const store = criarStoreContextoGate();
    await executiveEngine.executar("Resolva os bugs.", {
      storeContinuidade: store,
      registro: store.registroJobs
    });
    const aprov = await executiveEngine.executar("Aprovado.", {
      storeContinuidade: store,
      registro: store.registroJobs
    });
    assert.ok(aprov.dados?.job?.id);
    assert.equal(aprov.dados.job.id, jobId);
    const ficheiro = path.join(repoRoot, "executive", "queue", `${jobId}.json`);
    assert.equal(fs.existsSync(ficheiro), true);
    try {
      fila.atualizarEstado(jobId, "cancelled", {
        resultado: "IMP-060 E2 evidencia — cancelado apos teste"
      });
    } catch {
      /* PROXIMO.md pode estar locked por outro processo — evidência do JSON basta */
    }
  } finally {
    globalThis.fetch = prev;
  }
});
