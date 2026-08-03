/**
 * Testes IMP-020 Bloco B2 — C2 Classificador NCS.
 */

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  classificarNaturezaCognitiva,
  decidirNaturezaCognitiva,
  validarPacoteNcs
} from "./index.js";

test("TN-01: «Como você decidiria…» sem itens → metodo_de_decisao", () => {
  const r = classificarNaturezaCognitiva({
    mensagem:
      "Tenho cinco demandas críticas e só posso executar duas hoje. Como você decidiria quais fazer primeiro?",
    intencao: { id: "deliberar", capacidade: "ia" }
  });
  assert.equal(r.ok, true);
  assert.equal(r.pacote.naturezaCognitiva, "metodo_de_decisao");
  assert.equal(validarPacoteNcs(r.pacote).ok, true);
  assert.equal(r.pacote.exigeItensConcretos, false);
});

test("TN-02: «Qual das cinco…» + itens → decisao_operacional", () => {
  const r = classificarNaturezaCognitiva({
    mensagem:
      "Qual das cinco devo fazer? 1) pagamento 2) outdoor 3) Gate E5 4) docs 5) fila"
  });
  assert.equal(r.ok, true);
  assert.equal(r.pacote.naturezaCognitiva, "decisao_operacional");
  assert.equal(r.pacote.exigeItensConcretos, true);
  assert.equal(validarPacoteNcs(r.pacote).ok, true);
});

test("TN-02b: entre A e B → decisao_operacional", () => {
  const r = classificarNaturezaCognitiva({
    mensagem: "Entre pagamento e outdoor, o que faço primeiro?"
  });
  assert.equal(r.pacote.naturezaCognitiva, "decisao_operacional");
});

test("TN-03: «Monte um plano…» → planejamento", () => {
  const r = classificarNaturezaCognitiva({
    mensagem: "Monte um plano para entregar o Gate E5"
  });
  assert.equal(r.ok, true);
  assert.equal(r.pacote.naturezaCognitiva, "planejamento");
  assert.equal(validarPacoteNcs(r.pacote).ok, true);
});

test("TN-04: «Explique por que…» → explicacao", () => {
  const r = classificarNaturezaCognitiva({
    mensagem: "Explique por que adiámos o outdoor"
  });
  assert.equal(r.ok, true);
  assert.equal(r.pacote.naturezaCognitiva, "explicacao");
  assert.equal(validarPacoteNcs(r.pacote).ok, true);
});

test("TB2-R3: misto método + escolha concreta → operacional prevalece", () => {
  const r = classificarNaturezaCognitiva({
    mensagem:
      "Como você priorizaria, e entre pagamento e outdoor o que faço primeiro?"
  });
  assert.equal(r.pacote.naturezaCognitiva, "decisao_operacional");
  assert.equal(r.classificacao.regraDesempate, "R3.1");
});

test("TB2-R3: misto plano + método → planejamento prevalece", () => {
  const r = classificarNaturezaCognitiva({
    mensagem: "Monte um plano para a semana e diga como decidir as prioridades"
  });
  assert.equal(r.pacote.naturezaCognitiva, "planejamento");
  assert.equal(r.classificacao.regraDesempate, "R3.2");
});

test("TB2-05: saída sempre passa no validador C4", () => {
  const msgs = [
    "Quais critérios usarias para cortar o backlog?",
    "Por que o parecer pediu mais dados?",
    "xyz ruido sem padrao claro"
  ];
  for (const mensagem of msgs) {
    const r = classificarNaturezaCognitiva({ mensagem });
    assert.equal(r.ok, true, mensagem);
    assert.equal(validarPacoteNcs(r.pacote).ok, true, mensagem);
  }
});

test("TB2-06: intenção só-leitura não redefine natureza", () => {
  const a = decidirNaturezaCognitiva("Monte um plano para o MG2", {
    id: "deliberar"
  });
  const b = decidirNaturezaCognitiva("Monte um plano para o MG2", {
    id: "pergunta_aberta"
  });
  assert.equal(a.naturezaCognitiva, b.naturezaCognitiva);
  assert.equal(a.naturezaCognitiva, "planejamento");
});

test("TB2-07: mensagem vazia ainda classifica (R3.5)", () => {
  const r = classificarNaturezaCognitiva({ mensagem: "   " });
  assert.equal(r.ok, true);
  assert.equal(r.pacote.naturezaCognitiva, "metodo_de_decisao");
  assert.ok(r.classificacao.confiancaNatureza < 0.5);
  assert.equal(r.classificacao.regraDesempate, "R3.5");
});
