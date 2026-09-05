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
import {
  montarPromptDespacho,
  MOTIVO_OBJETIVO_AUSENTE_DESPACHO
} from "./contratoDespacho.js";

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
    "contratoDespacho.js",
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

const OBJETIVO_LONGO =
  "Implementar o botão Pausar no Centro de Situação com persistência do estado de voz e sem alterar o Motor nem a fila histórica.";

test("Etapa 2 T1: objetivo longo e título truncado — Agent recebe objetivo completo", () => {
  const titulo = `${OBJETIVO_LONGO.slice(0, 71)}…`;
  assert.ok(OBJETIVO_LONGO.length > 72);
  assert.ok(titulo.length <= 72);
  const out = montarPromptDespacho({
    id: "JOB-000201",
    objetivo: OBJETIVO_LONGO,
    titulo
  });
  assert.equal(out.ok, true);
  assert.equal(out.prompt.includes(OBJETIVO_LONGO), true);
  assert.match(out.prompt, /^[\s\S]*Objetivo: /m);
  assert.equal(out.prompt.includes("…"), true);
  assert.equal(out.objetivo, OBJETIVO_LONGO);
});

test("Etapa 2 T2: objetivo ≠ título — Agent recebe o objetivo, não o título como instrução", () => {
  const objetivo =
    "Despache o JOB-000075 para execução e acompanhe a operação sem usar jobs do MG2.";
  const titulo = "Despache o JOB-000075 para execução e acompanhe a opera…";
  const out = montarPromptDespacho({
    id: "JOB-000202",
    objetivo,
    titulo
  });
  assert.equal(out.ok, true);
  assert.match(out.prompt, /Objetivo: Despache o JOB-000075/);
  assert.match(out.prompt, /Título \(identificação\):/);
  assert.equal(out.prompt.includes(objetivo), true);
  const idxObjetivo = out.prompt.indexOf(`Objetivo: ${objetivo}`);
  const idxTitulo = out.prompt.indexOf("Título (identificação):");
  assert.ok(idxObjetivo >= 0);
  assert.ok(idxTitulo > idxObjetivo);
  assert.equal(out.prompt.includes(`Objetivo: ${titulo}`), false);
});

test("Etapa 2 T3: criterioConclusao — Agent recebe objetivo + critério", () => {
  const objetivo =
    "Criar o ficheiro homologacao.txt com exactamente a linha HOMOLOGADO.";
  const criterio = "ficheiro homologacao.txt existe com linha HOMOLOGADO";
  const out = montarPromptDespacho({
    id: "JOB-000203",
    objetivo,
    titulo: "Criar homologacao.txt",
    criterioConclusao: criterio,
    projeto: "prj-mg2",
    projetoNome: "Motoboy Game 2"
  });
  assert.equal(out.ok, true);
  assert.equal(out.prompt.includes(`Objetivo: ${objetivo}`), true);
  assert.equal(out.prompt.includes(`Critério de conclusão: ${criterio}`), true);
  assert.match(out.prompt, /Projeto: Motoboy Game 2 \(prj-mg2\)/);
});

test("Etapa 2 T4: sem objetivo — não cai para título; erro explícito; Job permanece pending", async () => {
  const soTitulo = montarPromptDespacho({
    id: "JOB-000204",
    titulo: "Continuar"
  });
  assert.equal(soTitulo.ok, false);
  assert.equal(soTitulo.motivo, MOTIVO_OBJETIVO_AUSENTE_DESPACHO);
  assert.match(soTitulo.mensagem, /objetivo_ausente/);
  assert.equal(soTitulo.prompt, undefined);

  const vazio = montarPromptDespacho({
    id: "JOB-000205",
    objetivo: "   ",
    titulo: "Tarefa truncada que não deve ser usada",
    descricao: "descrição legado também não substitui"
  });
  assert.equal(vazio.ok, false);
  assert.equal(vazio.motivo, MOTIVO_OBJETIVO_AUSENTE_DESPACHO);

  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ceo-ciclo-obj-"));
  const jobPath = path.join(dir, "JOB-000206.json");
  fs.writeFileSync(
    jobPath,
    JSON.stringify({
      id: "JOB-000206",
      estado: "pending",
      titulo: "Continuar"
    })
  );
  const logs = [];
  const r = await ciclo({
    queueDir: dir,
    repoRoot: dir,
    apiKey: "fake-key-nao-chamar-agent",
    model: "composer-2.5",
    dryRun: false,
    log: (m) => logs.push(m)
  });
  assert.equal(r, "error");
  assert.ok(logs.some((l) => /objetivo_ausente/.test(l)));
  const persistido = JSON.parse(fs.readFileSync(jobPath, "utf8"));
  assert.equal(persistido.estado, "pending");
});

test("Etapa 2 T5: título continua disponível para identificação", () => {
  const out = montarPromptDespacho({
    id: "JOB-000207",
    objetivo: "Criar o ficheiro alfa.txt com a linha ALFA.",
    titulo: "Criar alfa.txt"
  });
  assert.equal(out.ok, true);
  assert.equal(out.titulo, "Criar alfa.txt");
  assert.match(out.prompt, /Título \(identificação\): Criar alfa\.txt/);
  assert.match(out.prompt, /Job ID: JOB-000207/);
});
