/**
 * Precedência mínima: listar/mostrar/quais + projeto(s) → projetos
 * (não navegacao). Abrir / ir para projetos mantém navegacao.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { classificar } from "../classificadorIntencao/regras.js";
import {
  mapearCapacidadePorTexto,
  classificarIntencao
} from "./classificar.js";

test('mapper: «Mostrar projetos» → atuar_em_projetos / projetos', () => {
  const m = mapearCapacidadePorTexto("Mostrar projetos");
  assert.equal(m.id, "atuar_em_projetos");
  assert.equal(m.capacidade, "projetos");
});

test('mapper: «Listar projetos» → atuar_em_projetos / projetos', () => {
  const m = mapearCapacidadePorTexto("Listar projetos");
  assert.equal(m.id, "atuar_em_projetos");
  assert.equal(m.capacidade, "projetos");
});

test('mapper: «Quais projetos» → atuar_em_projetos / projetos', () => {
  const m = mapearCapacidadePorTexto("Quais projetos");
  assert.equal(m.id, "atuar_em_projetos");
  assert.equal(m.capacidade, "projetos");
});

test('mapper: «Abrir projetos» → navegar / navegacao', () => {
  const m = mapearCapacidadePorTexto("Abrir projetos");
  assert.equal(m.id, "navegar");
  assert.equal(m.capacidade, "navegacao");
});

test('mapper: «Ir para projetos» → navegar / navegacao', () => {
  const m = mapearCapacidadePorTexto("Ir para projetos");
  assert.equal(m.id, "navegar");
  assert.equal(m.capacidade, "navegacao");
});

test('C4: «Mostrar projetos» → destino capacidade_operacional + projetos', () => {
  const saida = classificar("Mostrar projetos");
  assert.equal(saida.classe, "comando_operacional");
  assert.equal(saida.destino, "capacidade_operacional");
  const intencao = classificarIntencao("Mostrar projetos", saida);
  assert.equal(intencao.capacidade, "projetos");
  assert.equal(intencao.id, "atuar_em_projetos");
});
