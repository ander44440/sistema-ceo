/**
 * Testes leves do dispatcher (sem SDK) — IMP-060 E3.
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { listarPendentes } from "./listPending.js";
import { adquirirLock, libertarLock, lerLock } from "./lock.js";
import { ciclo } from "./ciclo.js";
import { pulsarHeartbeat } from "./heartbeat.js";

const aqui = path.dirname(fileURLToPath(import.meta.url));

test("listarPendentes ordena e filtra pending", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ceo-fila-"));
  fs.writeFileSync(
    path.join(dir, "JOB-000002.json"),
    JSON.stringify({ id: "JOB-000002", estado: "pending", titulo: "B" })
  );
  fs.writeFileSync(
    path.join(dir, "JOB-000001.json"),
    JSON.stringify({ id: "JOB-000001", estado: "completed", titulo: "A" })
  );
  fs.writeFileSync(
    path.join(dir, "JOB-000003.json"),
    JSON.stringify({ id: "JOB-000003", estado: "pending", titulo: "C" })
  );
  const p = listarPendentes(dir);
  assert.equal(p.length, 2);
  assert.equal(p[0].id, "JOB-000002");
  assert.equal(p[1].id, "JOB-000003");
});

test("lock adquire e liberta", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ceo-lock-"));
  assert.equal(lerLock(dir).ativo, false);
  assert.equal(adquirirLock(dir, { jobId: "JOB-1", pid: 1 }), true);
  assert.equal(lerLock(dir).ativo, true);
  assert.equal(adquirirLock(dir, { jobId: "JOB-2", pid: 2 }), false);
  libertarLock(dir);
  assert.equal(lerLock(dir).ativo, false);
});

test("ciclo dry-run com pending", async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ceo-ciclo-"));
  fs.writeFileSync(
    path.join(dir, "JOB-000010.json"),
    JSON.stringify({
      id: "JOB-000010",
      estado: "pending",
      titulo: "Smoke"
    })
  );
  const logs = [];
  const r = await ciclo({
    queueDir: dir,
    repoRoot: dir,
    apiKey: null,
    model: "composer-2.5",
    dryRun: true,
    log: (m) => logs.push(m)
  });
  assert.equal(r, "dry");
  assert.ok(logs.some((l) => l.includes("JOB-000010")));
});

test("E3-CA1: listarPendentes lê BOM UTF-8 (fila oficial)", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ceo-bom-"));
  const job = {
    id: "JOB-000099",
    estado: "pending",
    titulo: "BOM"
  };
  fs.writeFileSync(
    path.join(dir, "JOB-000099.json"),
    "\uFEFF" + JSON.stringify(job),
    "utf8"
  );
  const p = listarPendentes(dir);
  assert.equal(p.length, 1);
  assert.equal(p[0].id, "JOB-000099");
});

test("E3-CA3: fontes do dispatcher não chamam /api/ceo/queue", () => {
  const ficheiros = [
    "index.js",
    "ciclo.js",
    "listPending.js",
    "heartbeat.js",
    "despachar.js",
    "lock.js"
  ];
  for (const f of ficheiros) {
    const src = fs.readFileSync(path.join(aqui, f), "utf8");
    assert.equal(
      /\/api\/ceo\/queue/.test(src),
      false,
      `${f} não deve usar rota de fila remota`
    );
  }
});

test("E3: heartbeat escreve ficheiro local e POST remoto opcional", async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "ceo-hb-"));
  fs.mkdirSync(path.join(root, "executive", "dispatcher", "logs"), {
    recursive: true
  });
  const urls = [];
  const prev = globalThis.fetch;
  globalThis.fetch = async (url, init) => {
    urls.push({ url: String(url), method: init?.method });
    return { ok: true, status: 200, json: async () => ({ ok: true }) };
  };
  try {
    const out = await pulsarHeartbeat(root, {
      estado: "idle",
      pending: 1,
      apiBase: "https://exemplo.test"
    });
    assert.equal(out.remoto, true);
    assert.equal(urls.length, 1);
    assert.equal(urls[0].method, "POST");
    assert.match(urls[0].url, /\/api\/ceo\/orquestracao\/heartbeat$/);
    assert.equal(urls[0].url.includes("/api/ceo/queue"), false);
    const hbPath = path.join(
      root,
      "executive",
      "dispatcher",
      "logs",
      "heartbeat.json"
    );
    assert.equal(fs.existsSync(hbPath), true);
    const hb = JSON.parse(fs.readFileSync(hbPath, "utf8"));
    assert.equal(hb.origem, "watcher");
    assert.equal(hb.pending, 1);
  } finally {
    globalThis.fetch = prev;
    fs.rmSync(root, { recursive: true, force: true });
  }
});
