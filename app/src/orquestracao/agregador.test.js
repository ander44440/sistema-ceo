/**
 * Testes agregador + snapshot — IMP-055 E2 (sem UI / SSE / coletores reais).
 */

import assert from "node:assert/strict";
import { test } from "node:test";
import { NOS_V1, ESTADOS, validarSnapshot, extrairVistaPrincipal } from "./dominio.js";
import {
  PATH_SNAPSHOT,
  ESTADOS_STUB_V1,
  criarAgregadorOrquestracao,
  sanitizarSnapshotPublico,
  sanitizarValorPublico
} from "./agregador.js";

test("E2-CA1: snapshot tem 6 nós com IDs canónicos e estados válidos", async () => {
  const agg = criarAgregadorOrquestracao({
    agora: () => "2026-08-01T12:00:00.000Z"
  });
  const snap = await agg.obterSnapshot();
  assert.equal(validarSnapshot(snap).ok, true);
  assert.equal(snap.nos.length, 6);
  const ids = snap.nos.map((n) => n.id).sort();
  assert.deepEqual(ids, [...NOS_V1].sort());
  for (const no of snap.nos) {
    assert.ok(ESTADOS.includes(no.estado));
    assert.ok(no.descricaoResumida.trim());
    assert.equal(no.atualizadoEm, "2026-08-01T12:00:00.000Z");
  }
  assert.equal(snap.em, "2026-08-01T12:00:00.000Z");
});

test("E2 path canónico paridade Vite/server", () => {
  assert.equal(PATH_SNAPSHOT, "/api/ceo/orquestracao/snapshot");
});

test("E2-CA3: falha de uma fonte não derruba o snapshot (nó → Erro)", async () => {
  const agg = criarAgregadorOrquestracao({
    fontes: {
      cto: () => {
        throw new Error("cto offline");
      },
      agent: async () => ({ estado: "Executando", origemSinal: "teste" })
    }
  });
  const snap = await agg.obterSnapshot();
  assert.equal(snap.nos.length, 6);
  const cto = snap.nos.find((n) => n.id === "cto");
  const agent = snap.nos.find((n) => n.id === "agent");
  assert.equal(cto.estado, "Erro");
  assert.equal(agent.estado, "Executando");
  assert.equal(validarSnapshot(snap).ok, true);
});

test("E2-CA3: estado inválido na fonte → Erro no nó", async () => {
  const agg = criarAgregadorOrquestracao({
    fontes: {
      speaker: () => ({ estado: "Online", origemSinal: "bad" })
    }
  });
  const snap = await agg.obterSnapshot();
  assert.equal(snap.nos.find((n) => n.id === "speaker").estado, "Erro");
});

test("E2-CA4: resposta pública redige segredos", async () => {
  const agg = criarAgregadorOrquestracao({
    fontes: {
      backend: () => ({
        estado: "Disponivel",
        origemSinal: "teste",
        detalhe: {
          health: "ok",
          apiKey: "sk-secret-nao-vazar",
          nested: { token: "abc", safe: true }
        }
      })
    }
  });
  const httpBody = await agg.obterSnapshotHttp();
  assert.equal(httpBody.ok, true);
  const backend = httpBody.nos.find((n) => n.id === "backend");
  assert.equal(backend.detalhe.apiKey, "[redacted]");
  assert.equal(backend.detalhe.nested.token, "[redacted]");
  assert.equal(backend.detalhe.nested.safe, true);
  assert.equal(backend.detalhe.health, "ok");
  assert.equal(JSON.stringify(httpBody).includes("sk-secret"), false);
});

test("E2 stubs documentados aplicados por omissão", async () => {
  const snap = await criarAgregadorOrquestracao().obterSnapshot();
  for (const id of NOS_V1) {
    const no = snap.nos.find((n) => n.id === id);
    assert.equal(no.estado, ESTADOS_STUB_V1[id], id);
    assert.equal(no.origemSinal, "stub-e2");
  }
});

test("E2 Progressividade: vista principal sem detalhe/origemSinal", async () => {
  const snap = await criarAgregadorOrquestracao().obterSnapshot();
  for (const no of snap.nos) {
    const vista = extrairVistaPrincipal(no);
    assert.equal("detalhe" in vista, false);
    assert.equal("origemSinal" in vista, false);
  }
});

test("sanitizarValorPublico redige padrões de chave em strings", () => {
  assert.equal(
    sanitizarValorPublico({ password: "x", ok: 1 }).password,
    "[redacted]"
  );
  assert.equal(
    sanitizarSnapshotPublico({
      em: "t",
      nos: [{ id: "ceo", detalhe: { secret: "y" } }]
    }).nos[0].detalhe.secret,
    "[redacted]"
  );
});
