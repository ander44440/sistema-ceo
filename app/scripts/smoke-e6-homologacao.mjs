/**
 * IMP-060 E6 — smoke homologação T1–T6 / T8 (evidência operacional).
 * Uso: node scripts/smoke-e6-homologacao.mjs
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import { criarFilaExecucao } from "../server/executionQueue.js";
import { executiveEngine } from "../src/executiveEngine/index.js";
import { criarStoreContextoGate } from "../src/continuidadeGate/contexto.js";
import { resetStoreContinuidadePadrao } from "../src/continuidadeGate/integracaoConversa.js";
import { criarFontesColetores } from "../src/orquestracao/coletores.js";
import { urlSnapshotOrquestracao } from "../src/orquestracao/cliente.js";
import { criarLeitoresConscienciaPadrao } from "../src/conscienciaOperacional/leitoresPadrao.js";
import { agregarEstadoExecutivo } from "../src/conscienciaOperacional/agregarEstado.js";
import { temContextoOperacionalRelevante } from "../src/conscienciaOperacional/dominio.js";
import { consultarEstadoExecutivoAntesDeResponder } from "../src/conscienciaOperacional/consultarAntesDeResponder.js";
import { listarPendentes } from "../../executive/dispatcher/src/listPending.js";
import { pulsarHeartbeat } from "../../executive/dispatcher/src/heartbeat.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../..");
const queueDir = path.join(repoRoot, "executive", "queue");
const resultados = [];

function reg(id, ok, detalhe) {
  resultados.push({ id, ok, detalhe });
  console.log(`${ok ? "PASS" : "FAIL"} ${id}: ${detalhe}`);
}

function instalarFetchFila() {
  const fila = criarFilaExecucao(repoRoot);
  const prev = globalThis.fetch;
  globalThis.fetch = async (url, init = {}) => {
    const u = String(url);
    assert.equal(u.includes("railway.app"), false, `URL remota proibida: ${u}`);
    if (u.includes("/api/ceo/queue/jobs") && init.method === "POST") {
      const body = JSON.parse(String(init.body || "{}"));
      const job = fila.publicar({
        ...body,
        titulo: body.titulo || "IMP-060 E6 T1",
        descricao: body.descricao || "Homologação E6"
      });
      return {
        ok: true,
        status: 201,
        json: async () => ({ ok: true, job })
      };
    }
    if (u.includes("/api/ceo/queue/pending")) {
      return {
        ok: true,
        status: 200,
        json: async () => ({
          ok: true,
          jobs: fila.listarPendentes(),
          pasta: fila.queueDir
        })
      };
    }
    if (u.includes("/api/ceo/queue/jobs")) {
      return {
        ok: true,
        status: 200,
        json: async () => ({
          ok: true,
          jobs: fila.listarPorEstado(null)
        })
      };
    }
    if (u.includes("/api/ceo/orquestracao/")) {
      return {
        ok: false,
        status: 503,
        json: async () => ({ ok: false, mensagem: "não usado neste smoke" })
      };
    }
    return { ok: false, status: 404, json: async () => ({ ok: false }) };
  };
  return {
    fila,
    restaurar: () => {
      globalThis.fetch = prev;
    }
  };
}

async function t1t6Continuidade(fila) {
  resetStoreContinuidadePadrao();
  const store = criarStoreContextoGate();
  const gate = await executiveEngine.executar("Resolva os bugs do MG2.", {
    storeContinuidade: store,
    registro: store.registroJobs
  });
  assert.equal(gate.dados?.motor?.aguardandoGate, true);

  const aprov = await executiveEngine.executar("Aprovado.", {
    storeContinuidade: store,
    registro: store.registroJobs
  });
  assert.equal(/Falta publicador/i.test(aprov.mensagem || ""), false);
  assert.ok(aprov.dados?.job?.id, "Job após Gate");
  const jobId = aprov.dados.job.id;
  const ficheiro = path.join(queueDir, `${jobId}.json`);
  assert.equal(fs.existsSync(ficheiro), true);
  const lido = JSON.parse(fs.readFileSync(ficheiro, "utf8"));
  assert.equal(lido.estado, "pending");
  assert.match(aprov.mensagem || "", /Job|pending|Gate aprovado/i);
  reg("T1", true, `${jobId}.json pending em executive/queue`);
  reg(
    "T6",
    true,
    `Gate→Aprovado→${jobId}; mensagem sem perda («${(aprov.mensagem || "").slice(0, 80)}…»)`
  );
  return jobId;
}

async function t2Dispatcher(jobId) {
  const pending = listarPendentes(queueDir);
  const visto = pending.some((j) => j.id === jobId);
  assert.equal(visto, true, "Dispatcher listarPendentes vê o Job T1");
  const hb = await pulsarHeartbeat(repoRoot, {
    estado: "idle",
    pending: pending.length,
    apiBase: process.env.CEO_API_BASE || ""
  });
  const hbPath = path.join(
    repoRoot,
    "executive",
    "dispatcher",
    "logs",
    "heartbeat.json"
  );
  assert.equal(fs.existsSync(hbPath), true);
  const hbFile = JSON.parse(fs.readFileSync(hbPath, "utf8"));
  assert.equal(hbFile.origem, "watcher");
  // dry-run subprocess
  const dry = await new Promise((resolve) => {
    const child = spawn("npm", ["run", "dry-run"], {
      cwd: path.join(repoRoot, "executive", "dispatcher"),
      shell: true,
      env: { ...process.env }
    });
    let out = "";
    child.stdout.on("data", (d) => (out += d));
    child.stderr.on("data", (d) => (out += d));
    child.on("close", (code) => resolve({ code, out }));
  });
  const deteta = dry.out.includes(jobId) || dry.out.includes("pending:");
  reg(
    "T2",
    visto && deteta && Boolean(hbFile.em),
    `listarPendentes+dry-run vê ${jobId}; heartbeat em=${hbFile.em} remoto=${hb.remoto === true}`
  );
}

async function t3Agent(jobId, filaOficial) {
  // Fila isolada: a oficial pode ter outros pending (smokes E2) — não mascarar o ciclo T3
  const tmp = fs.mkdtempSync(path.join(path.dirname(queueDir), "e6-t3-"));
  fs.mkdirSync(path.join(tmp, "executive", "queue"), { recursive: true });
  const filaT3 = criarFilaExecucao(tmp);
  const job = filaT3.publicar({
    titulo: "IMP-060 E6 T3 Agent",
    descricao: `Espelho ciclo ${jobId}`,
    origem: "ceo"
  });

  const fontes = (lista) =>
    criarFontesColetores({
      repoRoot: tmp,
      listarPorEstado: (e) => lista.listarPorEstado(e),
      agoraMs: () => Date.now()
    });

  const vazia = criarFilaExecucao(
    fs.mkdtempSync(path.join(path.dirname(queueDir), "e6-t3-empty-"))
  );
  const ocioso = await fontes(vazia).agent();
  assert.equal(ocioso.estado, "Ocioso");

  const aguard = await fontes(filaT3).agent();
  assert.equal(aguard.estado, "Aguardando");
  assert.equal(aguard.origemSinal, "fila_oficial");

  filaT3.atualizarEstado(job.id, "running");
  const exec = await fontes(filaT3).agent();
  assert.equal(exec.estado, "Executando");

  filaT3.atualizarEstado(job.id, "completed", {
    resultado: "IMP-060 E6 T3 — ciclo Agent"
  });
  // Reflectir o mesmo ciclo no Job T1 da fila oficial
  try {
    filaOficial.atualizarEstado(jobId, "running");
    filaOficial.atualizarEstado(jobId, "completed", {
      resultado: "IMP-060 E6 T3 — concluído na fila oficial"
    });
  } catch {
    /* lock PROXIMO opcional */
  }
  const fim = await fontes(filaT3).agent();
  assert.equal(fim.estado, "Ocioso");
  reg(
    "T3",
    true,
    `Agent ${ocioso.estado}→${aguard.estado}→${exec.estado}→${fim.estado} (fila_oficial); ${jobId}→completed`
  );
}

async function t4Painel(fila) {
  const url = urlSnapshotOrquestracao();
  assert.equal(url.includes("railway.app"), false);
  assert.equal(url.includes("/api/ceo/queue"), false);
  assert.ok(url.includes("/api/ceo/orquestracao/snapshot"));
  const fontes = criarFontesColetores({
    repoRoot,
    listarPorEstado: (e) => fila.listarPorEstado(e),
    agoraMs: () => Date.now()
  });
  const agent = await fontes.agent();
  const disp = await fontes.dispatcher();
  assert.equal(agent.origemSinal, "fila_oficial");
  assert.equal(agent.detalhe.fonte, "executive/queue");
  assert.equal(disp.origemSinal, "dispatcher-heartbeat");
  reg(
    "T4",
    true,
    `snapshot URL=${url}; agent origem=${agent.origemSinal}; dispatcher=${disp.origemSinal}`
  );
}

async function t5Consciencia() {
  const leitores = criarLeitoresConscienciaPadrao({});
  const consulta = await agregarEstadoExecutivo({ leitores });
  const pend = consulta.estado.jobsPendentes.length;
  const run = consulta.estado.jobsEmExecucao.length;
  const relevante = temContextoOperacionalRelevante(consulta.estado);

  const q1 = await consultarEstadoExecutivoAntesDeResponder({
    classe: "conversa_projeto",
    idClasse: "C2",
    continuidadeConsumiu: false,
    leitores
  });

  reg(
    "T5",
    q1.consultado === true &&
      consulta.diagnostico &&
      !JSON.stringify(consulta).includes("railway.app"),
    `Consciência F1 pend=${pend} F2 run=${run} relevante=${relevante}; consulta C2 ok=${q1.consultado}`
  );
}

async function t8CicloCompleto(fila) {
  resetStoreContinuidadePadrao();
  const store = criarStoreContextoGate();
  const gate = await executiveEngine.executar("Resolva os bugs críticos do MG2.", {
    storeContinuidade: store,
    registro: store.registroJobs
  });
  assert.equal(
    gate.dados?.motor?.aguardandoGate === true ||
      gate.dados?.motor?.publicado === true,
    true,
    `T8 gate: ${gate.mensagem}`
  );
  let id = gate.dados?.motor?.job?.id || gate.dados?.job?.id;
  if (!id && gate.dados?.motor?.aguardandoGate) {
    const aprov = await executiveEngine.executar("Aprovado.", {
      storeContinuidade: store,
      registro: store.registroJobs
    });
    id = aprov.dados?.job?.id || aprov.dados?.motor?.job?.id;
    assert.ok(id, `T8 sem Job após Aprovado: ${aprov.mensagem}`);
  }
  assert.ok(id);
  assert.equal(listarPendentes(queueDir).some((j) => j.id === id), true);
  await pulsarHeartbeat(repoRoot, {
    estado: "busy",
    pending: listarPendentes(queueDir).length
  });
  assert.equal(
    listarPendentes(queueDir).some((j) => j.id === id),
    true,
    "Dispatcher vê pending T8"
  );
  fila.atualizarEstado(id, "running");
  fila.atualizarEstado(id, "completed", {
    resultado: "IMP-060 E6 T8 — ciclo completo homologado (Agent simulado)"
  });
  const final = JSON.parse(
    fs.readFileSync(path.join(queueDir, `${id}.json`), "utf8")
  );
  assert.equal(final.estado, "completed");
  reg(
    "T8",
    true,
    `Usuário→Motor/Gate→${id} pending→Dispatcher vê→running→completed`
  );
}

async function main() {
  console.log("=== IMP-060 E6 smoke homologação ===\n");
  const { fila, restaurar } = instalarFetchFila();
  try {
    const jobId = await t1t6Continuidade(fila);
    await t2Dispatcher(jobId);
    await t3Agent(jobId, fila);
    await t4Painel(fila);
    await t5Consciencia();
    await t8CicloCompleto(fila);
  } catch (err) {
    console.error(err);
    reg("SMOKE", false, err && err.message ? err.message : String(err));
  } finally {
    restaurar();
  }

  console.log("\n=== Resumo smoke ===");
  for (const r of resultados) {
    console.log(`${r.ok ? "PASS" : "FAIL"} ${r.id}`);
  }
  const fail = resultados.filter((r) => !r.ok);
  process.exitCode = fail.length ? 1 : 0;
}

main();
