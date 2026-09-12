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
  identificarObjetoRecomendacaoOperacional,
  objectoDoTurno,
  OBJECTO_TURNO
} from "./recomendacaoOperacional.js";
import { detectarPedidoDecisaoExplicita } from "./pedidoDecisaoExplicita.js";
import { mapearCapacidadePorTexto } from "../executiveEngine/classificar.js";
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

test("E4 gate: ValeVerde contexto + análise + prioridade → não operacional", () => {
  const texto = `CEO, seguem os primeiros dados da ValeVerde Alimentos:

A empresa possui 120 funcionários.
Faturamento anual: R$ 48 milhões.
Nos últimos 6 meses, a margem líquida caiu de 8% para 4%.
A principal causa identificada pela diretoria financeira é o aumento de 15% no custo das matérias-primas.
A diretoria comercial quer aumentar preços em 10%.
A diretoria comercial teme perder clientes.
A produção afirma que consegue reduzir desperdícios em aproximadamente 5%.
Não existem outras informações disponíveis neste momento.

Analise a situação, identifique o problema central, avalie as alternativas disponíveis e recomende uma prioridade executiva.

Não execute nada. Apenas delibere.`;
  assert.equal(ehRecomendacaoOperacional(texto), false);
  assert.equal(
    ehPedidoAnaliseOuRecomendacao(normalizarTexto(texto)),
    true
  );
  const s = classificar(texto);
  assert.equal(s.classe, "conversa_projeto");
  assert.equal(s.destino, "nucleo_mre");
});

test("E4 gate: pedido puro «qual prioridade recomenda agora» → operacional", () => {
  assertOperacional("Qual prioridade você recomenda agora?");
});

test("E4 gate: análise + prioridade com sprint/JOB/gate → operacional", () => {
  assertOperacional(
    "Analise e recomende a prioridade da Sprint 2 após o gate."
  );
  assertOperacional(
    "Analise o JOB-000067 e recomende a próxima prioridade na fila."
  );
});

test("E4 gate: deliberação de proposta existente → C2 preservado", () => {
  assertDeliberativo("Analise a proposta do bairro popular.");
  assertDeliberativo("Você recomenda aprovar a proposta do bairro popular?");
});

function assertNegocioC2(texto, label = texto) {
  assert.equal(ehRecomendacaoOperacional(texto), false, `${label}: não E4`);
  assert.equal(
    detectarPedidoDecisaoExplicita(texto),
    false,
    `${label}: não PD`
  );
  assert.equal(
    ehPedidoAnaliseOuRecomendacao(normalizarTexto(texto)),
    true,
    `${label}: juízo de negócio → análise C2`
  );
  const s = classificar(texto);
  assert.equal(s.classe, "conversa_projeto", `${label}: C2`);
  assert.equal(s.destino, "nucleo_mre", `${label}: destino MRE`);
  assert.notEqual(
    mapearCapacidadePorTexto(texto).id,
    "recomendar_operacional",
    `${label}: não recomendar_operacional`
  );
  return s;
}

const R1_HFC =
  "CEO, surgiu uma nova situação na ValeVerde. Um dos principais fornecedores informou que terá um reajuste de 12% nos próximos 30 dias. Ainda não sabemos se existem fornecedores alternativos com capacidade suficiente. Quero que você avalie o impacto potencial dessa situação, identifique o que precisamos descobrir antes de agir e recomende a prioridade executiva para tratar o problema. Não execute nada.";

const R2_HFC =
  "CEO, descobrimos que temos apenas dois fornecedores possíveis para essa matéria-prima. Um é o atual, que anunciou o aumento de 12%. O outro é 8% mais barato, mas só consegue fornecer 60% do nosso volume. Qual deve ser nossa prioridade agora?";

test("E4 lastro negócio: R2 HFC fornecedores + prioridade → C2/MRE", () => {
  assertNegocioC2(R2_HFC, "R2");
});

test("E4 lastro negócio: R2 sem prefixo CEO → C2/MRE", () => {
  const texto = R2_HFC.replace(/^CEO,\s*/i, "");
  assertNegocioC2(texto, "R2 sem CEO");
});

test("E4 lastro negócio: P2 melhor decisão → C2/MRE (não PD)", () => {
  const texto =
    "CEO, temos dois fornecedores possíveis para essa matéria-prima. O atual aumentou 12%. O segundo é 8% mais barato, mas só consegue fornecer 60% do nosso volume. Qual é a melhor decisão e por quê?";
  assertNegocioC2(texto, "P2");
});

test("E4 lastro negócio: P1 o que acha / fazer primeiro → C2/MRE", () => {
  const texto =
    "CEO, nosso principal fornecedor avisou que vai aumentar os preços em 12% no próximo mês. O que você acha que devemos fazer primeiro?";
  assertNegocioC2(texto, "P1");
});

test("E4 lastro negócio: prioridade agora após parágrafo de negócio → C2/MRE", () => {
  const texto = `A matéria-prima subiu. Há um fornecedor actual e um segundo mais barato, com volume limitado.
Qual deve ser nossa prioridade agora?`;
  assertNegocioC2(texto, "parágrafo + prioridade agora");
});

test("E4 lastro negócio: qual prioridade recomenda dentro de dilema de preço → C2/MRE", () => {
  const texto =
    "Dois fornecedores: o actual anunciou reajuste de preço; o outro é mais barato. Qual prioridade você recomenda?";
  assertNegocioC2(texto, "qual prioridade + dilema");
});

test("E4 lastro negócio: R1 HFC avalie + prioridade executiva → C2/MRE", () => {
  assertNegocioC2(R1_HFC, "R1");
});

test("E4 lastro negócio: pedido nu sem lastro permanece operacional", () => {
  assertOperacional("Qual deveria ser a prioridade?");
  assertOperacional("Qual é a próxima decisão que você recomenda?");
});

const MISTO_A_B =
  "Há um JOB-000067 na fila. Dois fornecedores para essa matéria-prima: o actual anunciou +12% e o outro é 8% mais barato, mas só cobre 60% do volume. Qual deve ser nossa prioridade agora?";

const CAMINHO_CONTRATO =
  "Qual caminho: renovar contrato ou trocar fornecedor?";

test("Fatia 1: objectoDoTurno — A / B / misto / indefinido", () => {
  assert.equal(
    objectoDoTurno("Qual prioridade você recomenda agora?"),
    OBJECTO_TURNO.A
  );
  assert.equal(objectoDoTurno("Qual deveria ser a prioridade?"), OBJECTO_TURNO.A);
  assert.equal(
    objectoDoTurno("Analise e recomende a prioridade da Sprint 2 após o gate."),
    OBJECTO_TURNO.A
  );
  assert.equal(objectoDoTurno(R2_HFC), OBJECTO_TURNO.B);
  assert.equal(objectoDoTurno(CAMINHO_CONTRATO), OBJECTO_TURNO.B);
  assert.equal(
    objectoDoTurno(
      "CEO, temos dois fornecedores. Qual é a melhor decisão e por quê?"
    ),
    OBJECTO_TURNO.B
  );
  assert.equal(objectoDoTurno(MISTO_A_B), OBJECTO_TURNO.MISTO);
  assert.equal(objectoDoTurno("Você recomenda?"), OBJECTO_TURNO.INDEFINIDO);
  assert.equal(objectoDoTurno("prioridade"), OBJECTO_TURNO.INDEFINIDO);
  assert.equal(objectoDoTurno("decisão"), OBJECTO_TURNO.INDEFINIDO);
  assert.equal(objectoDoTurno("recomenda"), OBJECTO_TURNO.INDEFINIDO);
  // Pedido operacional nu não herda lastro B do fio
  assert.equal(
    objectoDoTurno("Qual prioridade você recomenda agora?", R2_HFC),
    OBJECTO_TURNO.A
  );
});

test("Fatia 1.1: R2 ValeVerde exacto → B / C2 / MRE", () => {
  assert.equal(objectoDoTurno(R2_HFC), OBJECTO_TURNO.B);
  assertNegocioC2(R2_HFC, "Fatia 1 R2");
});

test("Fatia 1.2: melhor decisão + dilema de negócio → B / C2", () => {
  const texto =
    "Temos dois fornecedores possíveis. O actual aumentou 12%; o outro é 8% mais barato com 60% do volume. Qual é a melhor decisão?";
  assert.equal(objectoDoTurno(texto), OBJECTO_TURNO.B);
  assertNegocioC2(texto, "Fatia 1 melhor decisão");
});

test("Fatia 1.3: prioridade com contexto de negócio → B / C2", () => {
  const texto =
    "Dois fornecedores e um reajuste de 12%. Qual deve ser nossa prioridade?";
  assert.equal(objectoDoTurno(texto), OBJECTO_TURNO.B);
  assertNegocioC2(texto, "Fatia 1 prioridade + negócio");
});

test("Fatia 1.4: qual prioridade recomenda agora sem B → A / E4", () => {
  assert.equal(
    objectoDoTurno("Qual prioridade você recomenda agora?"),
    OBJECTO_TURNO.A
  );
  assertOperacional("Qual prioridade você recomenda agora?");
});

test("Fatia 1.5: qual deveria ser a prioridade sem B → A / E4", () => {
  assert.equal(objectoDoTurno("Qual deveria ser a prioridade?"), OBJECTO_TURNO.A);
  assertOperacional("Qual deveria ser a prioridade?");
});

test("Fatia 1.6: análise Sprint/JOB/gate/fila → A / E4", () => {
  assertOperacional(
    "Analise e recomende a prioridade da Sprint 2 após o gate."
  );
  assertOperacional(
    "Analise o JOB-000067 e recomende a próxima prioridade na fila."
  );
  assert.equal(
    objectoDoTurno("Analise o JOB-000067 e recomende a próxima prioridade na fila."),
    OBJECTO_TURNO.A
  );
});

test("Fatia 1.7: renovar contrato ou trocar fornecedor → B / C2", () => {
  assert.equal(objectoDoTurno(CAMINHO_CONTRATO), OBJECTO_TURNO.B);
  assertNegocioC2(CAMINHO_CONTRATO, "Fatia 1 caminho");
});

test("Fatia 1.8: misto A+B → B governa (C2/MRE, não E4)", () => {
  assert.equal(objectoDoTurno(MISTO_A_B), OBJECTO_TURNO.MISTO);
  assertNegocioC2(MISTO_A_B, "Fatia 1 misto");
});

test("Fatia 1: palavras isoladas não determinam E4", () => {
  for (const palavra of ["prioridade", "decisão", "recomenda", "Você recomenda?"]) {
    assert.notEqual(objectoDoTurno(palavra), OBJECTO_TURNO.A, palavra);
    assert.equal(ehRecomendacaoOperacional(palavra), false, palavra);
  }
});
