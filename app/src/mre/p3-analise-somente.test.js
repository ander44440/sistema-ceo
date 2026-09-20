/**
 * P3 — Modo ANÁLISE SOMENTE (proibição explícita de decisão/recomendação).
 */

import assert from "node:assert/strict";
import { test, afterEach } from "node:test";
import {
  ehAnaliseSomente,
  detectarPedidoAnaliseDeliberativa,
  obterAnaliseSomenteActiva,
  hintEstagio6AnaliseDeliberativa,
  montarProsaAnaliseDeliberativa
} from "../mre/politicaAnaliseDeliberativa.js";

afterEach(() => {
  detectarPedidoAnaliseDeliberativa("");
});

test("P3: detector cobre formulações explícitas", () => {
  assert.equal(ehAnaliseSomente("apenas analise"), true);
  assert.equal(ehAnaliseSomente("somente analisar os riscos"), true);
  assert.equal(ehAnaliseSomente("não quero recomendação ainda"), true);
  assert.equal(ehAnaliseSomente("não tome nenhuma decisão"), true);
  assert.equal(ehAnaliseSomente("vamos apenas avaliar os cenários"), true);
  assert.equal(ehAnaliseSomente("analise e recomenda a proposta"), false);
  // F1B / C3 — formulações equivalentes da bateria baseline
  assert.equal(ehAnaliseSomente("Analise só a situação"), true);
  assert.equal(ehAnaliseSomente("Quero apenas a análise"), true);
  assert.equal(ehAnaliseSomente("sem recomendação e sem dizer o que aprovar"), true);
  assert.equal(
    ehAnaliseSomente(
      "Analise só a situação: orçamento exclusivo. Quero apenas a análise — sem recomendação e sem dizer o que aprovar ou priorizar."
    ),
    true
  );
});

test("P3: detectar activa path P1-2 e flag análise-somente", () => {
  assert.equal(
    detectarPedidoAnaliseDeliberativa("apenas analise a proposta do bairro"),
    true
  );
  assert.equal(obterAnaliseSomenteActiva(), true);
  assert.match(hintEstagio6AnaliseDeliberativa(), /ANÁLISE SOMENTE/i);
  assert.doesNotMatch(
    hintEstagio6AnaliseDeliberativa(),
    /aprovar, modificar ou não priorizar/i
  );
});

test("P3: prosa sem Recomendação/Decisão em modo análise-somente", () => {
  detectarPedidoAnaliseDeliberativa("não quero recomendação; apenas analise");
  const prosa = montarProsaAnaliseDeliberativa({
    analise: "Cenário A tem risco alto; cenário B depende de dados em falta.",
    principiosAplicados: [],
    decisaoExecutiva: {
      estado: "monitorar",
      recomendacao: "Aprovar a opção B",
      justificativa: "Critério X"
    },
    lacunas: ["Orçamento Q3 ausente"]
  });
  assert.match(prosa, /Cenário A|risco/i);
  assert.match(prosa, /Lacunas:/i);
  assert.doesNotMatch(prosa, /Recomendação:/i);
  assert.doesNotMatch(prosa, /Decisão:/i);
  assert.doesNotMatch(prosa, /Aprovar a opção B/i);
});

test("P3: P1-2 normal continua a incluir Recomendação", () => {
  detectarPedidoAnaliseDeliberativa("Analise a proposta do bairro e recomenda.");
  assert.equal(obterAnaliseSomenteActiva(), false);
  const prosa = montarProsaAnaliseDeliberativa({
    analise: "Alinhamento parcial à visão.",
    principiosAplicados: [],
    decisaoExecutiva: {
      estado: "monitorar",
      recomendacao: "Modificar o âmbito",
      justificativa: "Risco de dispersão"
    },
    lacunas: []
  });
  assert.match(prosa, /Recomendação:/i);
  assert.match(hintEstagio6AnaliseDeliberativa(), /ANÁLISE\/RECOMENDAÇÃO/i);
});
