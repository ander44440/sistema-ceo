/**
 * IMP-060 E5 — Painel/Consciência na fila oficial.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { PATH_SNAPSHOT, urlSnapshotOrquestracao } from "./cliente.js";
import { PATH_STREAM, urlStreamOrquestracao } from "./streamContrato.js";
import { criarFontesColetores } from "./coletores.js";

const aqui = path.dirname(fileURLToPath(import.meta.url));

test("E5: snapshot/stream usam ceoPainelApiUrl (não cutover remoto)", () => {
  assert.equal(urlSnapshotOrquestracao(), PATH_SNAPSHOT);
  assert.equal(urlStreamOrquestracao(), PATH_STREAM);
  assert.equal(urlSnapshotOrquestracao("https://x.railway.app").includes("railway"), true); // override explícito
  assert.equal(urlSnapshotOrquestracao().includes("railway"), false);
  const srcCliente = fs.readFileSync(path.join(aqui, "cliente.js"), "utf8");
  const srcStream = fs.readFileSync(path.join(aqui, "streamContrato.js"), "utf8");
  assert.match(srcCliente, /ceoPainelApiUrl/);
  assert.match(srcStream, /ceoPainelApiUrl/);
  assert.doesNotMatch(srcCliente, /import\.meta\.env.*VITE_CEO_API_BASE/);
  assert.doesNotMatch(srcStream, /import\.meta\.env.*VITE_CEO_API_BASE/);
});

test("E5-CA1: coletor Agent lê fila injectada (oficial) com contagens", async () => {
  const jobs = {
    pending: [{ id: "JOB-1", estado: "pending" }],
    running: [{ id: "JOB-2", estado: "running" }],
    completed: [{ id: "JOB-3", estado: "completed" }],
    failed: []
  };
  const fontes = criarFontesColetores({
    repoRoot: "/tmp",
    listarPorEstado: (e) => jobs[e] || [],
    agoraMs: () => Date.now()
  });
  const agent = await fontes.agent();
  assert.equal(agent.origemSinal, "fila_oficial");
  assert.equal(agent.estado, "Executando");
  assert.equal(agent.detalhe.pending, 1);
  assert.equal(agent.detalhe.running, 1);
  assert.equal(agent.detalhe.completed, 1);
  assert.equal(agent.detalhe.failed, 0);
  assert.equal(agent.detalhe.fonte, "executive/queue");
});

test("E5: fontes orquestração sem /api/ceo/queue no cliente Painel", () => {
  const src = fs.readFileSync(path.join(aqui, "cliente.js"), "utf8");
  assert.equal(src.includes("/api/ceo/queue"), false);
});
