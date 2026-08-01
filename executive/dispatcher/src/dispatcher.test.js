/**
 * Testes leves do dispatcher (sem SDK).
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { listarPendentes } from "./listPending.js";
import { adquirirLock, libertarLock, lerLock } from "./lock.js";
import { ciclo } from "./ciclo.js";

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
