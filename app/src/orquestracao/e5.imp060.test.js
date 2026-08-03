/**
 * IMP-060 E5 — Painel/Consciência na fila oficial + fallback híbrido BP-001.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import {
  PATH_SNAPSHOT,
  fundirNosHibrido,
  obterSnapshotOrquestracao,
  urlSnapshotOrquestracao
} from "./cliente.js";
import { PATH_STREAM, urlStreamOrquestracao } from "./streamContrato.js";
import { criarFontesColetores } from "./coletores.js";
import { NOS_V1, montarNo } from "./dominio.js";

const aqui = path.dirname(fileURLToPath(import.meta.url));

test("E5: snapshot/stream preferem ceoPainelApiUrl (não cutover remoto por defeito)", () => {
  assert.equal(urlSnapshotOrquestracao(), PATH_SNAPSHOT);
  assert.equal(urlStreamOrquestracao(), PATH_STREAM);
  assert.equal(urlSnapshotOrquestracao("https://x.railway.app").includes("railway"), true);
  assert.equal(urlSnapshotOrquestracao().includes("railway"), false);
  const srcCliente = fs.readFileSync(path.join(aqui, "cliente.js"), "utf8");
  const srcStream = fs.readFileSync(path.join(aqui, "streamContrato.js"), "utf8");
  assert.match(srcCliente, /ceoPainelApiUrl/);
  assert.match(srcCliente, /ceoApiUrl/);
  assert.match(srcStream, /ceoPainelApiUrl/);
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

test("híbrido: fundirNosHibrido preserva online e marca fila local", () => {
  const remoto = NOS_V1.map((id) =>
    montarNo(id, id === "backend" ? "Disponivel" : "Ocioso")
  );
  const nos = fundirNosHibrido(remoto);
  assert.equal(nos.length, 6);
  const porId = Object.fromEntries(nos.map((n) => [n.id, n]));
  assert.equal(porId.backend.estado, "Disponivel");
  assert.equal(porId.cto.estado, "Ocioso");
  assert.equal(porId.agent.estado, "Aguardando");
  assert.equal(porId.dispatcher.estado, "Aguardando");
  assert.equal(porId.agent.detalhe.motivo, "companion_ausente");
  assert.match(porId.agent.descricaoResumida, /PC/i);
});

test("híbrido: local falha + fallbackApiBase → fonte hibrido", async () => {
  /** @type {string[]} */
  const urls = [];
  const nosRemotos = NOS_V1.map((id) =>
    montarNo(id, id === "backend" ? "Disponivel" : "Ocioso")
  );
  const fetchImpl = async (url) => {
    urls.push(String(url));
    if (String(url).includes("railway.test")) {
      return {
        ok: true,
        json: async () => ({ ok: true, em: "t1", nos: nosRemotos })
      };
    }
    return { ok: false, status: 404, json: async () => ({}) };
  };
  const out = await obterSnapshotOrquestracao({
    fetchImpl,
    fallbackApiBase: "https://railway.test"
  });
  assert.equal(out.ok, true);
  assert.equal(out.fonte, "hibrido");
  assert.equal(urls.length, 2);
  assert.ok(urls[1].includes("railway.test"));
  const porId = Object.fromEntries(out.nos.map((n) => [n.id, n]));
  assert.equal(porId.backend.estado, "Disponivel");
  assert.equal(porId.agent.estado, "Aguardando");
  assert.equal(porId.dispatcher.detalhe.motivo, "companion_ausente");
});

test("híbrido: local ok → uma chamada fonte local", async () => {
  /** @type {string[]} */
  const urls = [];
  const nosLocais = NOS_V1.map((id) => montarNo(id, "Disponivel"));
  const fetchImpl = async (url) => {
    urls.push(String(url));
    return {
      ok: true,
      json: async () => ({ ok: true, em: "t0", nos: nosLocais })
    };
  };
  const out = await obterSnapshotOrquestracao({
    fetchImpl,
    fallbackApiBase: "https://railway.test"
  });
  assert.equal(out.ok, true);
  assert.equal(out.fonte, "local");
  assert.equal(urls.length, 1);
});
