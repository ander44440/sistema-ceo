/**
 * Testes coletores + heartbeat — IMP-055 E6.
 */

import assert from "node:assert/strict";
import { test } from "node:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  mapearBackend,
  mapearAgent,
  mapearDispatcher,
  mapearCto,
  mapearCeo,
  mapearSpeaker,
  heartbeatFresco,
  HEARTBEAT_TTL_MS
} from "./mapeadores.js";
import {
  escreverHeartbeat,
  lerHeartbeat,
  avaliarHeartbeat,
  PATH_HEARTBEAT,
  validarCorpoHeartbeat
} from "./heartbeat.js";
import { criarFontesColetores } from "./coletores.js";
import { criarAgregadorOrquestracao } from "./agregador.js";
import { criarSinaisRuntime } from "./sinaisRuntime.js";
import { NOS_V1 } from "./dominio.js";

test("E6-CA4: health ok → Disponivel; fail → Erro", () => {
  assert.equal(mapearBackend({ ok: true }).estado, "Disponivel");
  assert.equal(mapearBackend({ ok: false }).estado, "Erro");
  assert.equal(mapearBackend(null).estado, "Erro");
});

test("E6-CA4: fila pending/running/failed → estados Agent", () => {
  assert.equal(mapearAgent({ running: 1 }).estado, "Executando");
  assert.equal(mapearAgent({ pending: 2 }).estado, "Aguardando");
  assert.equal(
    mapearAgent({ failedRecente: true, ultimoFailedId: "JOB-1" }).estado,
    "Erro"
  );
  assert.equal(mapearAgent({}).estado, "Ocioso");
});

test("E6-CA3: heartbeat TTL — fresco vs expirado", () => {
  const agora = Date.parse("2026-08-01T12:00:00.000Z");
  const fresco = new Date(agora - 10_000).toISOString();
  const velho = new Date(agora - HEARTBEAT_TTL_MS - 1000).toISOString();
  assert.equal(heartbeatFresco(fresco, agora).fresco, true);
  assert.equal(heartbeatFresco(velho, agora).fresco, false);
  assert.equal(
    mapearDispatcher({ fresco: false, idadeMs: 90_000 }).estado,
    "Erro"
  );
  assert.equal(
    mapearDispatcher({ fresco: true, estadoWatcher: "idle", pending: 0 }).estado,
    "Disponivel"
  );
  assert.equal(
    mapearDispatcher({ fresco: true, estadoWatcher: "busy" }).estado,
    "Executando"
  );
});

test("E6 mapeadores ceo/cto/speaker", () => {
  assert.equal(mapearCeo({ emCiclo: true }).estado, "Executando");
  assert.equal(mapearCeo({}).estado, "Disponivel");
  assert.equal(mapearCto({ emVoo: true, configurado: true }).estado, "Executando");
  assert.equal(mapearCto({ configurado: false }).estado, "Erro");
  assert.equal(mapearCto({ configurado: true }).estado, "Disponivel");
  assert.equal(mapearSpeaker({ falando: true }).estado, "Executando");
  assert.equal(mapearSpeaker({}).estado, "Ocioso");
});

test("E6 heartbeat ficheiro + validação POST", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "ceo-hb-"));
  const salvo = escreverHeartbeat(root, {
    estado: "idle",
    pending: 0,
    origem: "teste"
  });
  assert.ok(salvo.em);
  const lido = lerHeartbeat(root);
  assert.equal(lido.estado, "idle");
  const av = avaliarHeartbeat(root, Date.now());
  assert.equal(av.fresco, true);
  assert.equal(PATH_HEARTBEAT, "/api/ceo/orquestracao/heartbeat");
  assert.equal(validarCorpoHeartbeat({}).ok, true);
  assert.equal(validarCorpoHeartbeat(null).ok, false);
  fs.rmSync(root, { recursive: true, force: true });
});

test("E6-CA1: agregador com coletores — 6 nós com origem real", async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "ceo-col-"));
  escreverHeartbeat(root, { estado: "idle", pending: 0 });
  const sinais = criarSinaisRuntime();
  const jobs = {
    pending: [],
    running: [{ id: "JOB-000001", estado: "running" }],
    failed: []
  };
  const agg = criarAgregadorOrquestracao({
    deps: {
      repoRoot: root,
      listarPorEstado: (e) => jobs[e] || [],
      llmConfigurado: () => true,
      sinais,
      healthOk: () => true
    }
  });
  const snap = await agg.obterSnapshotHttp();
  assert.equal(snap.nos.length, 6);
  const porId = Object.fromEntries(snap.nos.map((n) => [n.id, n]));
  assert.equal(porId.backend.estado, "Disponivel");
  assert.equal(porId.backend.origemSinal, "health");
  assert.equal(porId.agent.estado, "Executando");
  assert.equal(porId.agent.origemSinal, "fila");
  assert.equal(porId.dispatcher.estado, "Disponivel");
  assert.equal(porId.dispatcher.origemSinal, "dispatcher-heartbeat");
  assert.equal(porId.speaker.origemSinal, "speaker-heuristico");
  assert.equal(porId.cto.origemSinal, "cto-connector");
  assert.equal(porId.ceo.origemSinal, "nucleo");
  for (const id of NOS_V1) {
    assert.ok(porId[id], id);
    assert.notEqual(porId[id].origemSinal, "stub-e2");
  }
  fs.rmSync(root, { recursive: true, force: true });
});

test("E6-CA3: sem heartbeat → Dispatcher Erro (não Disponível falso)", async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "ceo-nohb-"));
  const fontes = criarFontesColetores({
    repoRoot: root,
    listarPorEstado: () => [],
    llmConfigurado: () => true,
    healthOk: () => true
  });
  const sinal = await fontes.dispatcher();
  assert.equal(sinal.estado, "Erro");
  assert.equal(sinal.detalhe.motivo, "heartbeat_expirado");
  fs.rmSync(root, { recursive: true, force: true });
});

test("E6-CA2: coletores não expõem API de escrita de fila", () => {
  const fontes = criarFontesColetores({
    repoRoot: os.tmpdir(),
    listarPorEstado: () => [],
    healthOk: () => true
  });
  const keys = Object.keys(fontes).sort();
  assert.deepEqual(keys, [
    "agent",
    "backend",
    "ceo",
    "cto",
    "dispatcher",
    "speaker"
  ].sort());
  assert.equal("publicar" in fontes, false);
  assert.equal("atualizarEstado" in fontes, false);
});

test("E6 health down simulado", async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "ceo-hd-"));
  escreverHeartbeat(root, { estado: "idle" });
  const agg = criarAgregadorOrquestracao({
    deps: {
      repoRoot: root,
      listarPorEstado: () => [],
      llmConfigurado: () => true,
      healthOk: () => false
    }
  });
  const snap = await agg.obterSnapshot();
  assert.equal(snap.nos.find((n) => n.id === "backend").estado, "Erro");
  fs.rmSync(root, { recursive: true, force: true });
});

test("E6 pending na fila → Agent Aguardando", async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "ceo-pend-"));
  escreverHeartbeat(root, { estado: "idle", pending: 1 });
  const agg = criarAgregadorOrquestracao({
    deps: {
      repoRoot: root,
      listarPorEstado: (e) =>
        e === "pending" ? [{ id: "JOB-000002", estado: "pending" }] : [],
      llmConfigurado: () => true,
      healthOk: () => true
    }
  });
  const snap = await agg.obterSnapshot();
  assert.equal(snap.nos.find((n) => n.id === "agent").estado, "Aguardando");
  fs.rmSync(root, { recursive: true, force: true });
});
