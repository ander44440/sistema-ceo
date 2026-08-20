/**
 * Etapa 1 — objectivo canónico na publicação de Jobs novos.
 * Não migra verificador, dispatcher, recovery nem Jobs históricos.
 */

import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { criarFilaExecucao } from "../../server/executionQueue.js";
import {
  exigirObjetivoCanonico,
  MOTIVO_OBJETIVO_AUSENTE,
  textoObjetivoCanonico
} from "./objetivoJob.js";
import { criarPublicadorFilaMemoria } from "./ponteParecerJob.js";
import {
  montarParecerTrabalhoExecutivo,
  tituloJobDeInstrucao
} from "../classificadorIntencao/integracaoNucleo.js";
import { montarPayloadJobDoParecer } from "./ponteParecerJob.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = join(__dirname, "..", "..", "..");
const QUEUE = join(REPO, "executive", "queue");

const INSTRUCAO_LONGA =
  "Crie o Job necessário para criar o ficheiro projeto-teste-alfa.txt " +
  "com exactamente as linhas PROJETO TESTE ALFA e EXECUÇÃO INICIAL CONCLUÍDA. " +
  "Não execute ainda a próxima acção.";

function hashFicheiro(id) {
  const raw = readFileSync(join(QUEUE, `${id}.json`));
  return createHash("sha256").update(raw).digest("hex");
}

test("TESTE 1: instrução longa — objetivo completo; título pode truncar", () => {
  const parecer = montarParecerTrabalhoExecutivo(INSTRUCAO_LONGA, {
    classe: "trabalho_executivo",
    confianca: 0.9
  });
  const spec = parecer.acao.job;
  assert.ok(spec.objetivo.includes("projeto-teste-alfa.txt"));
  assert.ok(spec.objetivo.includes("PROJETO TESTE ALFA"));
  assert.ok(spec.objetivo.includes("EXECUÇÃO INICIAL CONCLUÍDA"));
  assert.equal(spec.objetivo.includes("…"), false);
  assert.ok(spec.objetivo.length > 72);
  assert.ok(spec.titulo.length <= 72);
  assert.ok(INSTRUCAO_LONGA.length > spec.titulo.length);
});

test("TESTE 2: objetivo >72 — permanece completo; título ≤72", async () => {
  const tarefa =
    "Implementar o botão Pausar no Centro de Situação com persistência do estado de voz e sem alterar o Motor.";
  assert.ok(tarefa.length > 72);
  const parecer = montarParecerTrabalhoExecutivo(tarefa, {
    classe: "trabalho_executivo",
    confianca: 0.9
  });
  const fila = criarPublicadorFilaMemoria();
  const payload = montarPayloadJobDoParecer(parecer, {
    origem: "ceo"
  });
  assert.equal(payload.ok, true);
  const job = await fila.publicarJob(payload.payload);
  assert.equal(job.objetivo, tarefa);
  assert.ok(job.titulo.length <= 72);
  assert.equal(job.objetivo.length > 72, true);
});

test("TESTE 3: objetivo ≠ título — texto original preservado", async () => {
  const tarefa =
    "Despache o JOB-000075 para execução e acompanhe a operação sem usar jobs do MG2.";
  const parecer = montarParecerTrabalhoExecutivo(tarefa, {
    classe: "trabalho_executivo",
    confianca: 0.9
  });
  assert.notEqual(parecer.acao.job.objetivo, parecer.acao.job.titulo);
  assert.equal(parecer.acao.job.objetivo, tarefa);
  const root = mkdtempSync(join(tmpdir(), "ceo-obj-e1-"));
  const fila = criarFilaExecucao(root);
  const job = fila.publicar({
    titulo: parecer.acao.job.titulo,
    descricao: parecer.acao.job.descricao,
    objetivo: parecer.acao.job.objetivo
  });
  assert.equal(job.objetivo, tarefa);
  assert.notEqual(job.objetivo, job.titulo);
});

test("TESTE 4: sem objetivo válido — não publica; erro objetivo_ausente", async () => {
  const gate = exigirObjetivoCanonico({ titulo: "Continuar" });
  assert.equal(gate.ok, false);
  assert.equal(gate.motivo, MOTIVO_OBJETIVO_AUSENTE);

  const filaMem = criarPublicadorFilaMemoria();
  await assert.rejects(
    () => filaMem.publicarJob({ titulo: "Continuar" }),
    /objetivo_ausente/
  );

  const root = mkdtempSync(join(tmpdir(), "ceo-obj-e1-vazio-"));
  const fila = criarFilaExecucao(root);
  assert.throws(
    () => fila.publicar({ titulo: "Continuar" }),
    /objetivo_ausente/
  );
  assert.equal(fila.listarPendentes().length, 0);

  const explicitoVazio = exigirObjetivoCanonico({
    titulo: "x",
    descricao: "texto legado",
    objetivo: "   "
  });
  assert.equal(explicitoVazio.ok, false);
  assert.equal(textoObjetivoCanonico({ titulo: "x" }), "");
});

test("TESTE 5: criterioConclusao separado; objetivo presente", () => {
  const root = mkdtempSync(join(tmpdir(), "ceo-obj-e1-crit-"));
  const fila = criarFilaExecucao(root);
  const objetivo =
    "Criar o ficheiro homologacao.txt com exactamente a linha HOMOLOGADO.";
  const criterio = "ficheiro homologacao.txt existe com linha HOMOLOGADO";
  const job = fila.publicar({
    titulo: tituloJobDeInstrucao(objetivo),
    descricao: objetivo,
    objetivo,
    criterioConclusao: criterio
  });
  assert.equal(job.objetivo, objetivo);
  assert.equal(job.criterioConclusao, criterio);
  assert.notEqual(job.objetivo, job.criterioConclusao);
});

test("TESTE 6: Jobs históricos na fila oficial não foram alterados", () => {
  const ids = [
    "JOB-000075",
    "JOB-000076",
    "JOB-000077",
    "JOB-000107"
  ];
  const hashes = {};
  for (const id of ids) {
    const job = JSON.parse(readFileSync(join(QUEUE, `${id}.json`), "utf8"));
    assert.equal(
      Object.prototype.hasOwnProperty.call(job, "objetivo"),
      false,
      `${id} não deve receber migração de objetivo`
    );
    hashes[id] = hashFicheiro(id);
  }
  for (const id of ids) {
    assert.equal(hashFicheiro(id), hashes[id]);
  }
});
