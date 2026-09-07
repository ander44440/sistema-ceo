/**
 * Predicado catálogo + mapper/classificador — intenção listagem ≠ navegação.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { classificar } from "../classificadorIntencao/regras.js";
import { ehConsultaCatalogoProjetos } from "../classificadorIntencao/consultaCatalogoProjetos.js";
import {
  mapearCapacidadePorTexto,
  classificarIntencao
} from "./classificar.js";

const POSITIVOS = [
  "Mostrar projetos",
  "Listar projetos",
  "Quais projetos",
  "Quais projetos existem",
  "Ver projetos",
  "Me mostre os projetos"
];

const NEGATIVOS_NAV = [
  "Abrir projetos",
  "Ir para projetos",
  "Navegar para projetos"
];

for (const texto of POSITIVOS) {
  test(`predicado: «${texto}» → catálogo`, () => {
    assert.equal(ehConsultaCatalogoProjetos(texto), true);
  });

  test(`mapper: «${texto}» → projetos`, () => {
    const m = mapearCapacidadePorTexto(texto);
    assert.equal(m.id, "atuar_em_projetos");
    assert.equal(m.capacidade, "projetos");
  });

  test(`C4: «${texto}» → capacidade_operacional + projetos`, () => {
    const saida = classificar(texto);
    assert.equal(saida.classe, "comando_operacional");
    assert.equal(saida.destino, "capacidade_operacional");
    assert.equal(saida.precisaClarificacao, false);
    const intencao = classificarIntencao(texto, saida);
    assert.equal(intencao.capacidade, "projetos");
    assert.equal(intencao.id, "atuar_em_projetos");
  });
}

for (const texto of NEGATIVOS_NAV) {
  test(`predicado: «${texto}» → não catálogo`, () => {
    assert.equal(ehConsultaCatalogoProjetos(texto), false);
  });

  test(`mapper: «${texto}» → navegacao`, () => {
    const m = mapearCapacidadePorTexto(texto);
    assert.equal(m.id, "navegar");
    assert.equal(m.capacidade, "navegacao");
  });

  test(`C4 nav: «${texto}» → capacidade_operacional + navegacao`, () => {
    const saida = classificar(texto);
    assert.equal(saida.classe, "comando_operacional");
    assert.equal(saida.destino, "capacidade_operacional");
    const intencao = classificarIntencao(texto, saida);
    assert.equal(intencao.capacidade, "navegacao");
  });
}

test("frente activa não sequestrar «Listar projetos»", () => {
  const saida = classificar("Listar projetos", { frenteActiva: true });
  assert.equal(saida.classe, "comando_operacional");
  assert.equal(saida.destino, "capacidade_operacional");
  assert.match(saida.razaoCurta || "", /catálogo/i);
});

test('FP: «Liste as tarefas do projeto» → NÃO catálogo', () => {
  assert.equal(ehConsultaCatalogoProjetos("Liste as tarefas do projeto"), false);
  const saida = classificar("Liste as tarefas do projeto");
  assert.notEqual(
    saida.razaoCurta || "",
    "Consulta/listagem do catálogo de projetos → C4"
  );
  assert.equal(
    /catálogo de projetos/i.test(saida.razaoCurta || ""),
    false
  );
  const inten = classificarIntencao("Liste as tarefas do projeto", saida);
  assert.notEqual(inten.id, "atuar_em_projetos");
});
