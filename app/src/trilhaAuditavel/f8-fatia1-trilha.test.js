/**
 * Trilha Auditável V1 — fatia 1 (job.transicao).
 */
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, test } from "node:test";
import { criarFilaExecucao } from "../../server/executionQueue.js";
import {
  TIPO_JOB_TRANSICAO,
  calcularConteudoHash,
  construirEventoJobTransicao,
  appendEvento,
  appendJobTransicao,
  listarPorJob,
  caminhoStoreAudit,
  caminhoEventos,
  validarPayloadSemFamiliasProibidas,
  CHAVES_PAYLOAD_PROIBIDAS
} from "./index.js";

const temps = [];

function tempRoot() {
  const d = mkdtempSync(join(tmpdir(), "ceo-trilha-"));
  temps.push(d);
  return d;
}

after(() => {
  for (const d of temps) {
    try {
      rmSync(d, { recursive: true, force: true });
    } catch {
      /* ignore */
    }
  }
});

test("append: grava job.transicao em JSONL", () => {
  const root = tempRoot();
  const dir = caminhoStoreAudit(root);
  const r = appendJobTransicao(dir, {
    jobId: "JOB-000901",
    indice: 0,
    entradaHistorico: {
      em: "2026-09-09T12:00:00.000Z",
      de: null,
      para: "pending",
      motivo: "criacao",
      actor: "ceo"
    }
  });
  assert.equal(r.ok, true);
  assert.ok(existsSync(caminhoEventos(dir)));
  const linhas = readFileSync(caminhoEventos(dir), "utf8")
    .trim()
    .split(/\r?\n/);
  assert.equal(linhas.length, 1);
  const ev = JSON.parse(linhas[0]);
  assert.equal(ev.tipo, TIPO_JOB_TRANSICAO);
  assert.equal(ev.refs.jobId, "JOB-000901");
  assert.equal(ev.schemaVersao, 1);
  assert.ok(ev.conteudoHash);
});

test("leitura: listarPorJob devolve sequência por indice", () => {
  const root = tempRoot();
  const dir = caminhoStoreAudit(root);
  appendJobTransicao(dir, {
    jobId: "JOB-000902",
    indice: 0,
    entradaHistorico: {
      em: "2026-09-09T12:00:00.000Z",
      de: null,
      para: "pending",
      motivo: "criacao",
      actor: "ceo"
    }
  });
  appendJobTransicao(dir, {
    jobId: "JOB-000902",
    indice: 1,
    entradaHistorico: {
      em: "2026-09-09T12:01:00.000Z",
      de: "pending",
      para: "dispatched",
      motivo: "handoff",
      actor: "dispatcher"
    }
  });
  appendJobTransicao(dir, {
    jobId: "JOB-000999",
    indice: 0,
    entradaHistorico: {
      em: "2026-09-09T12:00:00.000Z",
      de: null,
      para: "pending",
      motivo: "criacao",
      actor: "ceo"
    }
  });
  const lista = listarPorJob(dir, "JOB-000902");
  assert.equal(lista.length, 2);
  assert.equal(lista[0].detalhe.para, "pending");
  assert.equal(lista[1].detalhe.para, "dispatched");
  assert.equal(listarPorJob(dir, "JOB-000999").length, 1);
});

test("duplicidade: mesmo id / mesmo hash+jobId recusado", () => {
  const root = tempRoot();
  const dir = caminhoStoreAudit(root);
  const construido = construirEventoJobTransicao({
    jobId: "JOB-000903",
    indice: 0,
    entradaHistorico: {
      em: "2026-09-09T12:00:00.000Z",
      de: null,
      para: "pending",
      motivo: "criacao",
      actor: "ceo"
    }
  });
  assert.equal(construido.ok, true);
  const a = appendEvento(dir, construido.evento);
  assert.equal(a.ok, true);
  const dupId = appendEvento(dir, { ...construido.evento });
  assert.equal(dupId.ok, false);
  assert.equal(dupId.codigo, "duplicado_id");
  const dupHash = appendEvento(dir, {
    ...construido.evento,
    id: "ta-outro-id"
  });
  assert.equal(dupHash.ok, false);
  assert.equal(dupHash.codigo, "duplicado_hash");
});

test("hash: conteudoHash estável para os mesmos campos", () => {
  const campos = {
    tipo: TIPO_JOB_TRANSICAO,
    jobId: "JOB-000904",
    quando: "2026-09-09T12:00:00.000Z",
    de: "",
    para: "pending",
    motivo: "criacao",
    actor: "ceo",
    indice: 0
  };
  const h1 = calcularConteudoHash(campos);
  const h2 = calcularConteudoHash({ ...campos });
  assert.equal(h1, h2);
  const h3 = calcularConteudoHash({ ...campos, para: "running" });
  assert.notEqual(h1, h3);
  const ev = construirEventoJobTransicao({
    jobId: "JOB-000904",
    indice: 0,
    entradaHistorico: {
      em: campos.quando,
      de: null,
      para: "pending",
      motivo: "criacao",
      actor: "ceo"
    }
  });
  assert.equal(ev.ok, true);
  assert.equal(ev.evento.conteudoHash, h1);
});

test("payload proibido: famílias transcript/MEP/KNW rejeitadas", () => {
  for (const chave of CHAVES_PAYLOAD_PROIBIDAS) {
    const r = validarPayloadSemFamiliasProibidas({ detalhe: { [chave]: "x" } });
    assert.equal(r.ok, false, chave);
    assert.ok(r.chaves.includes(chave));
  }
  const root = tempRoot();
  const dir = caminhoStoreAudit(root);
  const base = construirEventoJobTransicao({
    jobId: "JOB-000905",
    indice: 0,
    entradaHistorico: {
      em: "2026-09-09T12:00:00.000Z",
      de: null,
      para: "pending",
      motivo: "criacao",
      actor: "ceo"
    }
  });
  assert.equal(base.ok, true);
  const contaminado = {
    ...base.evento,
    id: "ta-contaminado",
    detalhe: { ...base.evento.detalhe, transcript: "segredo" }
  };
  const r = appendEvento(dir, contaminado);
  assert.equal(r.ok, false);
  assert.equal(r.codigo, "payload_proibido");
});

test("paridade: sequência da Trilha == historicoCiclo após persistir Job", () => {
  const root = tempRoot();
  const fila = criarFilaExecucao(root);
  const job = fila.publicar({
    titulo: "Job trilha fatia 1",
    descricao: "Teste de paridade Trilha × historicoCiclo",
    objetivo:
      "Validar que cada transição persistida gera um evento job.transicao na Trilha Auditável.",
    projeto: "prj-teste-trilha"
  });
  fila.atualizarEstado(job.id, "dispatched", {
    motivo: "handoff_teste",
    actor: "dispatcher"
  });
  fila.atualizarEstado(job.id, "running", {
    motivo: "inicio_teste",
    actor: "executor"
  });

  const actual = fila.lerJob(job.id);
  const hist = actual.historicoCiclo;
  const trilha = listarPorJob(caminhoStoreAudit(root), job.id);

  assert.equal(trilha.length, hist.length);
  for (let i = 0; i < hist.length; i++) {
    assert.equal(trilha[i].refs.jobId, job.id);
    assert.equal(trilha[i].tipo, TIPO_JOB_TRANSICAO);
    assert.equal(trilha[i].detalhe.para, hist[i].para);
    assert.equal(trilha[i].detalhe.de, hist[i].de);
    assert.equal(trilha[i].detalhe.indice, i);
    assert.equal(trilha[i].detalhe.motivo, hist[i].motivo);
  }
});

test("fail-soft: Job permanece gravado mesmo se espelho for idempotente", () => {
  const root = tempRoot();
  const fila = criarFilaExecucao(root);
  const job = fila.publicar({
    titulo: "Job fail-soft",
    descricao: "Regravação sem novas entradas não duplica Trilha",
    objetivo:
      "Garantir que reescrever o mesmo Job sem novo historicoCiclo não cria eventos duplicados."
  });
  const dir = caminhoStoreAudit(root);
  assert.equal(listarPorJob(dir, job.id).length, 1);
  // segunda transição
  fila.atualizarEstado(job.id, "dispatched", {
    motivo: "handoff",
    actor: "dispatcher"
  });
  assert.equal(listarPorJob(dir, job.id).length, 2);
  const depois = fila.lerJob(job.id);
  assert.equal(depois.estado, "dispatched");
  assert.ok(existsSync(join(root, "executive", "queue", `${job.id}.json`)));
});
