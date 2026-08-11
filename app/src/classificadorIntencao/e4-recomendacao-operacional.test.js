/**
 * E4 — Recomendação operacional ≠ deliberação de proposta (T1–T10).
 */

import assert from "node:assert/strict";
import { test, beforeEach } from "node:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  classificar,
  ehPedidoAnaliseOuRecomendacao,
  normalizarTexto
} from "./regras.js";
import {
  ehRecomendacaoOperacional,
  ehDeliberacaoDeProposta,
  identificarObjetoRecomendacaoOperacional
} from "./recomendacaoOperacional.js";
import { detectarPedidoAnaliseDeliberativa } from "../mre/politicaAnaliseDeliberativa.js";
import { deveAnexarManifestoMg2 } from "../camadaConhecimento/manifestoMg2.js";
import { executiveEngine } from "../executiveEngine/index.js";
import { criarPublicadorFilaMemoria } from "../motorExecucao/ponteParecerJob.js";
import { criarFilaExecucao } from "../../server/executionQueue.js";
import { resetStoreContinuidadePadrao } from "../continuidadeGate/integracaoConversa.js";
import { resetEstadoTopicosSessao } from "./topicosSessao.js";
import { resetEstadoObjectivoSessao } from "./objectivoSessao.js";
import { reiniciarAutoridadeDelegadaParaTestes } from "../autoridadeDelegada/autoridadeDelegada.js";

const COA_MG2 = { id: "prj-mg2", nome: "Motoboy Game 2" };

beforeEach(() => {
  resetStoreContinuidadePadrao();
  resetEstadoTopicosSessao();
  resetEstadoObjectivoSessao();
  reiniciarAutoridadeDelegadaParaTestes();
});

function assertOperacional(texto, label = texto) {
  assert.equal(ehRecomendacaoOperacional(texto), true, `${label}: operacional`);
  assert.equal(ehDeliberacaoDeProposta(texto), false, `${label}: não proposta`);
  assert.equal(
    detectarPedidoAnaliseDeliberativa(texto),
    false,
    `${label}: não deliberativa`
  );
  assert.equal(
    ehPedidoAnaliseOuRecomendacao(normalizarTexto(texto)),
    false,
    `${label}: não análise classificador`
  );
  const s = classificar(texto);
  assert.equal(s.classe, "comando_operacional", `${label}: C4`);
  assert.equal(s.destino, "capacidade_operacional", `${label}: destino C4`);
  assert.equal(
    deveAnexarManifestoMg2(texto, COA_MG2),
    false,
    `${label}: sem Manifesto`
  );
  return s;
}

function assertDeliberativo(texto, label = texto) {
  assert.equal(ehRecomendacaoOperacional(texto), false, `${label}: não operacional`);
  assert.equal(
    detectarPedidoAnaliseDeliberativa(texto),
    true,
    `${label}: deliberativa`
  );
  const s = classificar(texto);
  assert.equal(s.classe, "conversa_projeto", `${label}: C2`);
  return s;
}

test("T1 — próxima decisão que recomenda → operacional", () => {
  assertOperacional("Qual é a próxima decisão que você recomenda?");
});

test("T2 — manter validação Sprint 1 → objeto sprint/validação, não proposta", () => {
  const texto =
    "Você recomenda manter a validação da Sprint 1 de performance como nossa próxima decisão prioritária?";
  assertOperacional(texto);
  const obj = identificarObjetoRecomendacaoOperacional(texto);
  assert.match(obj.rotulo, /Sprint\s*1|validação/i);
  assert.notEqual(obj.tipo, "proposta");
  assert.ok(
    obj.tipo === "validacao_sprint" ||
      obj.tipo === "sprint" ||
      obj.tipo === "manter" ||
      obj.tipo === "prioridade"
  );
});

test("T3 — qual prioridade recomenda agora → operacional", () => {
  assertOperacional("Qual prioridade você recomenda agora?");
});

test("T4 — analise proposta bairro → C2 deliberativo", () => {
  assertDeliberativo("Analise a proposta do bairro popular.");
  assert.equal(
    deveAnexarManifestoMg2("Analise a proposta do bairro popular.", COA_MG2),
    true
  );
});

test("T5 — recomenda aprovar proposta bairro → C2 deliberativo", () => {
  assertDeliberativo("Você recomenda aprovar a proposta do bairro popular?");
});

test("T6 — avalie segundo Manifesto → Manifesto presente", () => {
  const texto = "Avalie a proposta segundo o Manifesto.";
  assertDeliberativo(texto);
  assert.equal(deveAnexarManifestoMg2(texto, COA_MG2), true);
});

test("T7 — estado atual + próxima decisão recomenda → misto operacional", async () => {
  const texto =
    "Qual é o estado atual e qual próxima decisão você recomenda?";
  assertOperacional(texto);
  const fila = criarPublicadorFilaMemoria();
  const out = await executiveEngine.executar(texto, {
    publicarJob: fila.publicarJob.bind(fila)
  });
  assert.equal(fila.jobs.length, 0);
  assert.equal(out.modo, "recomendacao_operacional");
  assert.equal(out.dados?.anexarManifesto, false);
  assert.doesNotMatch(String(out.mensagem), /Recomendação:\s*aprovar/i);
  assert.doesNotMatch(String(out.mensagem), /§\s*5|§\s*15|§\s*10/);
  assert.match(String(out.mensagem), /Recomendação operacional/i);
});

test("T8 — analise estado JOB e recomende → objeto Job, não proposta", async () => {
  const texto = "Analise o estado do JOB-000067 e recomende o que fazer.";
  assertOperacional(texto);
  const obj = identificarObjetoRecomendacaoOperacional(texto);
  assert.equal(obj.tipo, "job");
  assert.equal(obj.id, "JOB-000067");

  const root = fs.mkdtempSync(path.join(os.tmpdir(), "ceo-e4-op-"));
  const filaDisk = criarFilaExecucao(root);
  const j = filaDisk.publicar({ titulo: "X", descricao: "y" });
  const alvo = path.join(filaDisk.queueDir, "JOB-000067.json");
  fs.renameSync(path.join(filaDisk.queueDir, `${j.id}.json`), alvo);
  const job = JSON.parse(fs.readFileSync(alvo, "utf8"));
  job.id = "JOB-000067";
  job.estado = "completed";
  fs.writeFileSync(alvo, JSON.stringify(job, null, 2));

  const pub = criarPublicadorFilaMemoria();
  const out = await executiveEngine.executar(texto, {
    publicarJob: pub.publicarJob.bind(pub),
    obterJob: (id) => filaDisk.lerJob(id),
    listarJobs: (e) => filaDisk.listarPorEstado(e == null ? null : e)
  });
  assert.equal(pub.jobs.length, 0);
  assert.equal(out.modo, "recomendacao_operacional");
  assert.equal(out.dados?.objeto?.id, "JOB-000067");
  assert.doesNotMatch(String(out.mensagem), /Recomendação:\s*aprovar/i);
  assert.doesNotMatch(String(out.mensagem), /aprovar,\s*modificar ou não priorizar/i);
});

test("T9 — casos A/B reais COA MG2 + contexto rico", async () => {
  const casoA =
    "CEO, onde estamos agora e qual é a próxima decisão que você recomenda?";
  const casoB =
    "Você recomenda manter a validação da Sprint 1 de performance como nossa próxima decisão prioritária?";

  // Antes (documentado): ambos iam a C2 + Manifesto; agora C4 operacional
  assertOperacional(casoA, "caso A");
  assertOperacional(casoB, "caso B");
  assert.equal(deveAnexarManifestoMg2(casoA, COA_MG2), false);
  assert.equal(deveAnexarManifestoMg2(casoB, COA_MG2), false);

  const fila = criarPublicadorFilaMemoria();
  const outA = await executiveEngine.executar(casoA, {
    publicarJob: fila.publicarJob.bind(fila),
    coaAtivo: COA_MG2
  });
  const outB = await executiveEngine.executar(casoB, {
    publicarJob: fila.publicarJob.bind(fila),
    coaAtivo: COA_MG2
  });
  assert.equal(fila.jobs.length, 0);
  assert.equal(outA.modo, "recomendacao_operacional");
  assert.equal(outB.modo, "recomendacao_operacional");
  assert.doesNotMatch(String(outA.mensagem), /Recomendação:\s*aprovar|modificar ou não priorizar a proposta/i);
  assert.doesNotMatch(String(outB.mensagem), /Recomendação:\s*aprovar/i);
  assert.doesNotMatch(String(outB.mensagem), /§\s*\d+/);
  const objB = outB.dados?.objeto;
  assert.ok(objB);
  assert.match(String(objB.rotulo || ""), /Sprint|validação/i);
});

test("T10 — histórico bairro popular não contamina objeto actual", async () => {
  const historico = [
    {
      papel: "usuario",
      texto: "Analise a proposta do bairro popular segundo o Manifesto."
    },
    {
      papel: "ceo",
      texto: "Recomendação: modificar a proposta do bairro popular."
    }
  ];
  const texto =
    "Qual é a próxima decisão que você recomenda?";
  assertOperacional(texto);
  const obj = identificarObjetoRecomendacaoOperacional(texto);
  assert.doesNotMatch(String(obj.rotulo), /bairro/i);
  assert.notEqual(obj.tipo, "proposta");

  const fila = criarPublicadorFilaMemoria();
  const out = await executiveEngine.executar(
    { texto, historico },
    {
      publicarJob: fila.publicarJob.bind(fila),
      coaAtivo: COA_MG2
    }
  );
  assert.equal(fila.jobs.length, 0);
  assert.equal(out.modo, "recomendacao_operacional");
  assert.doesNotMatch(String(out.mensagem), /bairro popular/i);
  assert.equal(out.dados?.anexarManifesto, false);
  assert.equal(deveAnexarManifestoMg2(texto, COA_MG2), false);
});

test("E4 unit: recomenda isolado não activa deliberação P1-2", () => {
  assert.equal(detectarPedidoAnaliseDeliberativa("Você recomenda?"), false);
  assert.equal(ehRecomendacaoOperacional("Você recomenda?"), false);
});
