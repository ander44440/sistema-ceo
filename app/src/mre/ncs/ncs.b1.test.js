/**
 * Testes IMP-020 Bloco B1 — C1 / C3 / C4 (contrato e fronteira NCS).
 */

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  NaturezaCognitiva,
  derivarCamposNcs,
  ehNaturezaCognitiva,
  fixturePacoteDecisaoOperacional,
  fixturePacoteExplicacao,
  fixturePacoteIncompleto,
  fixturePacoteMetodo,
  fixturePacoteNaturezaIlegal,
  fixturePacotePlanejamento,
  montarPacoteNcs,
  validarPacoteNcs
} from "./index.js";

test("TB1-01: catálogo C1 expõe exatamente as quatro naturezas", () => {
  assert.deepEqual([...NaturezaCognitiva], [
    "metodo_de_decisao",
    "decisao_operacional",
    "planejamento",
    "explicacao"
  ]);
  assert.equal(NaturezaCognitiva.length, 4);
  assert.equal(ehNaturezaCognitiva("decisao"), false);
  assert.equal(ehNaturezaCognitiva("metodo_de_decisao"), true);
});

test("TB1-02: montarPacoteNcs — método (derivações)", () => {
  const p = montarPacoteNcs({
    naturezaCognitiva: "metodo_de_decisao",
    confiancaNatureza: 0.7,
    fundamentoNatureza: "teste método"
  });
  assert.equal(p.exigeItensConcretos, false);
  assert.equal(p.politicaLacunas, "inventario_nao_obrigatorio");
  assert.equal(p.modoEsperadoEstagio6, "entregar_criterios");
  assert.equal(validarPacoteNcs(p).ok, true);
});

test("TB1-03: montarPacoteNcs — decisão operacional (derivações)", () => {
  const p = montarPacoteNcs({ naturezaCognitiva: "decisao_operacional" });
  assert.equal(p.exigeItensConcretos, true);
  assert.equal(p.politicaLacunas, "inventario_material_obrigatorio");
  assert.equal(p.modoEsperadoEstagio6, "escolher_itens");
  assert.equal(validarPacoteNcs(p).ok, true);
});

test("TB1-04: montarPacoteNcs — planejamento e explicação", () => {
  const plan = montarPacoteNcs({ naturezaCognitiva: "planejamento" });
  const exp = montarPacoteNcs({ naturezaCognitiva: "explicacao" });
  assert.equal(plan.modoEsperadoEstagio6, "estruturar_plano");
  assert.equal(exp.modoEsperadoEstagio6, "justificar");
  assert.equal(plan.politicaLacunas, "nao_aplica_escolha");
  assert.equal(exp.politicaLacunas, "nao_aplica_escolha");
  assert.equal(validarPacoteNcs(plan).ok, true);
  assert.equal(validarPacoteNcs(exp).ok, true);
});

test("TB1-05: montarPacoteNcs rejeita natureza ilegal", () => {
  assert.throws(() => montarPacoteNcs({ naturezaCognitiva: "decisao" }));
});

test("TB1-06: fixtures — um pacote válido por natureza", () => {
  const validos = [
    fixturePacoteMetodo(),
    fixturePacoteDecisaoOperacional(),
    fixturePacotePlanejamento(),
    fixturePacoteExplicacao()
  ];
  assert.equal(validos.length, 4);
  for (const p of validos) {
    const r = validarPacoteNcs(p);
    assert.equal(r.ok, true, r.violacoes.map((x) => x.mensagem).join("; "));
  }
});

test("TB1-07: validador rejeita natureza ilegal (TN-05)", () => {
  const r = validarPacoteNcs(fixturePacoteNaturezaIlegal());
  assert.equal(r.ok, false);
  assert.ok(r.violacoes.some((x) => x.caminho === "naturezaCognitiva"));
});

test("TB1-08: validador rejeita pacote incompleto", () => {
  const r = validarPacoteNcs(fixturePacoteIncompleto());
  assert.equal(r.ok, false);
  assert.ok(r.violacoes.length >= 1);
});

test("TB1-09: validador rejeita inconsistência NCS-V2", () => {
  const base = fixturePacoteMetodo();
  const inconsistente = {
    ...base,
    exigeItensConcretos: true
  };
  const r = validarPacoteNcs(inconsistente);
  assert.equal(r.ok, false);
  assert.ok(r.violacoes.some((x) => x.regra === "NCS-V2"));
});

test("TB1-10: derivarCamposNcs cobre as quatro naturezas", () => {
  for (const n of NaturezaCognitiva) {
    const d = derivarCamposNcs(n);
    assert.equal(typeof d.exigeItensConcretos, "boolean");
    assert.ok(d.politicaLacunas);
    assert.ok(d.modoEsperadoEstagio6);
  }
});
