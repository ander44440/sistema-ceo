/**
 * IMP-060 E4 — cliente MVP não usa Railway como fonte da fila.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { listarJobsPendentes, publicarJobFila } from "./filaCliente.js";

const aqui = path.dirname(fileURLToPath(import.meta.url));

test("E4: listarJobsPendentes e publicarJobFila usam ceoQueueApiUrl", () => {
  const src = fs.readFileSync(path.join(aqui, "filaCliente.js"), "utf8");
  assert.match(src, /ceoQueueApiUrl\(\s*["']\/api\/ceo\/queue\/jobs["']\s*\)/);
  assert.match(src, /ceoQueueApiUrl\(\s*path\s*\)/);
  assert.match(src, /\/api\/ceo\/queue\/pending/);
  assert.equal(/ceoApiUrl\s*\(/.test(src), false);
  assert.match(src, /from\s+["']\.\.\/ceoApiBase\.js["']/);
  assert.doesNotMatch(src, /import\s*\{[^}]*\bceoApiUrl\b/);
});

test("E4: consultas operacionais do cliente não prefixam Railway", async () => {
  const urls = [];
  const prev = globalThis.fetch;
  globalThis.fetch = async (url) => {
    urls.push(String(url));
    return {
      ok: true,
      status: 200,
      json: async () => ({
        ok: true,
        jobs: [{ id: "JOB-000001", estado: "pending" }],
        job: { id: "JOB-000001", estado: "pending" }
      })
    };
  };
  try {
    await listarJobsPendentes();
    await publicarJobFila({ titulo: "e4", descricao: "teste" });
    assert.equal(urls.length, 2);
    for (const u of urls) {
      assert.equal(u.includes("railway.app"), false, u);
      assert.ok(
        u === "/api/ceo/queue/pending" ||
          u === "/api/ceo/queue/jobs" ||
          u.endsWith("/api/ceo/queue/pending") ||
          u.endsWith("/api/ceo/queue/jobs")
      );
    }
  } finally {
    globalThis.fetch = prev;
  }
});
