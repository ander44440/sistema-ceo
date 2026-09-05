/**
 * P4 — AUTOANÁLISE da resposta anterior (hint/prosa sem Decisão/Recomendação).
 */

import assert from "node:assert/strict";
import { test, afterEach } from "node:test";
import {
  ehAutoanaliseRespostaAnterior,
  detectarPedidoAnaliseDeliberativa,
  obterAutoanaliseActiva,
  obterAnaliseSomenteActiva,
  hintEstagio6AnaliseDeliberativa,
  montarProsaAnaliseDeliberativa
} from "./politicaAnaliseDeliberativa.js";

afterEach(() => {
  detectarPedidoAnaliseDeliberativa("");
});

const FRASES = [
  "analise sua resposta anterior",
  "avalie sua resposta anterior",
  "onde você errou?",
  "o que você acertou?",
  "o que você poderia ter feito melhor?",
  "o que você acertou e errou na resposta anterior?",
  "Analise criticamente sua resposta anterior. O que você acertou, onde errou e o que poderia ter feito melhor?"
];

test("P4: detector cobre formulações de autoanálise", () => {
  for (const f of FRASES) {
    assert.equal(ehAutoanaliseRespostaAnterior(f), true, f);
  }
  assert.equal(ehAutoanaliseRespostaAnterior("analise a proposta do bairro"), false);
  assert.equal(ehAutoanaliseRespostaAnterior("apenas analise os riscos"), false);
});

test("P4: detectar activa path P1-2 + hint AUTOANÁLISE", () => {
  assert.equal(
    detectarPedidoAnaliseDeliberativa(
      "Analise criticamente sua resposta anterior. O que você acertou?"
    ),
    true
  );
  assert.equal(obterAutoanaliseActiva(), true);
  assert.equal(obterAnaliseSomenteActiva(), false);
  assert.match(hintEstagio6AnaliseDeliberativa(), /AUTOANÁLISE/i);
  assert.doesNotMatch(
    hintEstagio6AnaliseDeliberativa(),
    /aprovar, modificar ou não priorizar/i
  );
});

test("P4: prosa sem Recomendação/Decisão em autoanálise", () => {
  detectarPedidoAnaliseDeliberativa("onde você errou na resposta anterior?");
  const prosa = montarProsaAnaliseDeliberativa({
    analise:
      "Acertei o diagnóstico de risco; errei ao omitir a lacuna de orçamento; poderia ter sido mais concreto.",
    principiosAplicados: ["ADR-015"],
    decisaoExecutiva: {
      estado: "monitorar",
      recomendacao: "Aprovar a Opção A",
      justificativa: "Critério X"
    },
    lacunas: ["Falta evidência do turno anterior"]
  });
  assert.match(prosa, /Acertei|errei|poderia/i);
  assert.match(prosa, /Lacunas:/i);
  assert.doesNotMatch(prosa, /Recomendação:/i);
  assert.doesNotMatch(prosa, /Decisão:/i);
  assert.doesNotMatch(prosa, /Aprovar a Opção A/i);
});

test("P4: «onde você errou?» activa path sem exigir «analise» no classificador P1-2", () => {
  assert.equal(detectarPedidoAnaliseDeliberativa("onde você errou?"), true);
  assert.equal(obterAutoanaliseActiva(), true);
});
