/**
 * IMP-060 E5 — Consciência F1/F2 na fila oficial.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { criarLeitoresConscienciaPadrao } from "./leitoresPadrao.js";

const aqui = path.dirname(fileURLToPath(import.meta.url));

test("E5-CA2: leitoresPadrao F1/F2 usam filaCliente (não Railway)", () => {
  const src = fs.readFileSync(path.join(aqui, "leitoresPadrao.js"), "utf8");
  assert.match(src, /listarJobsPorEstado/);
  assert.match(src, /filaCliente/);
  assert.equal(/ceoApiUrl\s*\(|VITE_CEO_API_BASE/.test(src), false);
});

test("E5: F1/F2 adaptam Jobs da fila oficial para JobResumo", async () => {
  const prev = globalThis.fetch;
  globalThis.fetch = async (url) => {
    const u = String(url);
    assert.equal(u.includes("railway"), false);
    if (u.includes("/pending")) {
      return {
        ok: true,
        json: async () => ({
          ok: true,
          jobs: [
            {
              id: "JOB-000100",
              titulo: "Pendência E5",
              estado: "pending"
            }
          ]
        })
      };
    }
    return {
      ok: true,
      json: async () => ({
        ok: true,
        jobs: [
          {
            id: "JOB-000101",
            titulo: "Em curso E5",
            estado: "running"
          },
          {
            id: "JOB-000100",
            titulo: "Pendência E5",
            estado: "pending"
          }
        ]
      })
    };
  };
  try {
    const leitores = criarLeitoresConscienciaPadrao({});
    const pend = await leitores.F1();
    const run = await leitores.F2();
    assert.equal(pend.length, 1);
    assert.equal(pend[0].status, "pending");
    assert.equal(pend[0].id, "JOB-000100");
    assert.equal(run.length, 1);
    assert.equal(run[0].status, "running");
  } finally {
    globalThis.fetch = prev;
  }
});
