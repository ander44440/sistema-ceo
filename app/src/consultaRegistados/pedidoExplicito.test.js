/**
 * IMP-086 — D-PED / CA-086-6 / CA-086-8
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { detectarPedidoExplicitoConsulta } from "./pedidoExplicito.js";

test("CA-086-8: âncoras positivas de decisão", () => {
  const a = detectarPedidoExplicitoConsulta("O que decidimos sobre payout?");
  assert.equal(a.ehPedido, true);
  assert.equal(a.ramo, "decisao");
  assert.ok(a.termo && /payout/i.test(a.termo));

  const b = detectarPedidoExplicitoConsulta("Consulta à memória organizacional");
  assert.equal(b.ehPedido, true);
  assert.equal(b.ramo, "decisao");
});

test("CA-086-8: âncoras positivas de discussão", () => {
  const a = detectarPedidoExplicitoConsulta("O que discutimos no transcript?");
  assert.equal(a.ehPedido, true);
  assert.ok(a.ramo === "discussao" || a.ramo === "ambos");
});

test("D-PED: decisão somente → ramo decisao", () => {
  const r = detectarPedidoExplicitoConsulta(
    "O que ficou registrado sobre o início dos testes reais do CEO."
  );
  assert.equal(r.ehPedido, true);
  assert.equal(r.ramo, "decisao");
});

test("D-PED: discussão / histórico físico somente → ramo discussao", () => {
  const a = detectarPedidoExplicitoConsulta(
    "Consulte o histórico físico das nossas conversas."
  );
  assert.equal(a.ehPedido, true);
  assert.equal(a.ramo, "discussao");

  const b = detectarPedidoExplicitoConsulta(
    "O que discutimos no histórico da conversa?"
  );
  assert.equal(b.ehPedido, true);
  assert.equal(b.ramo, "discussao");
});

test("D-PED: histórico físico + decisão → ramo ambos", () => {
  const r = detectarPedidoExplicitoConsulta(
    "CEO, consulte o histórico físico das nossas conversas e me diga o que ficou registrado sobre o início dos testes reais do CEO."
  );
  assert.equal(r.ehPedido, true);
  assert.equal(r.ramo, "ambos");
  assert.ok(r.termo && /in[ií]cio dos testes reais/i.test(r.termo));
});

test("D-PED: «histórico físico» sem contexto de consulta → não pedido", () => {
  const r = detectarPedidoExplicitoConsulta(
    "O histórico físico ainda não está pronto no Railway."
  );
  assert.equal(r.ehPedido, false);
});

test("CA-086-6/8: âncoras negativas não são consulta", () => {
  for (const t of [
    "Continuar o job",
    "Despacha a melhoria",
    "Status do job JOB-1",
    "O que sabes do domínio do payout",
    "Retomar o fio",
    "Abrir o dia"
  ]) {
    const r = detectarPedidoExplicitoConsulta(t);
    assert.equal(r.ehPedido, false, t);
  }
});

test("sem âncora positiva ⇒ não pedido", () => {
  assert.equal(detectarPedidoExplicitoConsulta("Qual o próximo passo?").ehPedido, false);
});

test("COA nomeado extraído", () => {
  const r = detectarPedidoExplicitoConsulta("O que decidimos no COA coa-mg2?");
  assert.equal(r.ehPedido, true);
  assert.equal(r.coaNomeado, "coa-mg2");
});
