/**
 * P3 final — CN não impõe Decisão/Critério/alternativa em ANÁLISE SOMENTE.
 */

import assert from "node:assert/strict";
import { test, afterEach } from "node:test";
import { parecerValidoCompleto } from "../mre/parecer/fixtures.js";
import { detectarPedidoAnaliseDeliberativa } from "../mre/politicaAnaliseDeliberativa.js";
import {
  montarProsaDecisaoExecutiva,
  comporDeliberacao
} from "./compor.js";

afterEach(() => {
  detectarPedidoAnaliseDeliberativa("");
});

function parecerComDecisao() {
  const p = parecerValidoCompleto();
  p.analise =
    "Cenário A tem risco operacional elevado; cenário B depende de orçamento Q3.";
  p.decisaoExecutiva.estado = "aprovar";
  p.decisaoExecutiva.recomendacao = "Aprovar a Opção A";
  p.decisaoExecutiva.justificativa =
    "Priorizar estabilidade técnica face ao risco de regressão.";
  p.decisaoExecutiva.alternativas = ["Opção B — acelerar aquisição"];
  p.acao = { tipo: "monitorar", descricao: "Preparar handoff à equipa" };
  p.lacunas = [];
  return p;
}

const FRASES = [
  "apenas analise",
  "não tome nenhuma decisão",
  "não faça recomendação"
];

for (const frase of FRASES) {
  test(`P3 CN: «${frase}» → montarProsaDecisaoExecutiva sem Decisão/Critério/alternativa`, () => {
    const p = parecerComDecisao();
    const out = montarProsaDecisaoExecutiva(
      p.decisaoExecutiva.estado,
      p.decisaoExecutiva.recomendacao,
      p.decisaoExecutiva.justificativa,
      p.analise,
      p.decisaoExecutiva.alternativas,
      { fechoDecisorio: true, instrucao: frase, analiseSomente: true }
    );
    assert.match(out, /Cenário A|risco/i);
    assert.doesNotMatch(out, /Decisão:/i);
    assert.doesNotMatch(out, /Critério:/i);
    assert.doesNotMatch(out, /Em alternativa ficaria/i);
    assert.doesNotMatch(out, /Aprovar a Opção A/i);
  });
}

test("P3 CN: comporDeliberacao com apenas analise + sem decisão + sem recomendação", () => {
  const instrucao =
    "apenas analise — não tome nenhuma decisão e não faça recomendação";
  const p = parecerComDecisao();
  const out = comporDeliberacao(p, {}, { instrucao, canal: "chat" });
  assert.match(out.texto, /Cenário A|risco|orçamento/i);
  assert.doesNotMatch(out.texto, /Decisão:/i);
  assert.doesNotMatch(out.texto, /Critério:/i);
  assert.doesNotMatch(out.texto, /Em alternativa ficaria/i);
  assert.doesNotMatch(out.texto, /Próximo passo:/i);
  assert.doesNotMatch(out.texto, /Recomendação:/i);
});

test("P3 CN: fecho decisório normal preserva Decisão:", () => {
  const p = parecerComDecisao();
  const out = montarProsaDecisaoExecutiva(
    p.decisaoExecutiva.estado,
    p.decisaoExecutiva.recomendacao,
    p.decisaoExecutiva.justificativa,
    p.analise,
    p.decisaoExecutiva.alternativas,
    {
      fechoDecisorio: true,
      instrucao: "Decida entre A e B agora.",
      analiseSomente: false
    }
  );
  assert.match(out, /Decisão:/i);
});
