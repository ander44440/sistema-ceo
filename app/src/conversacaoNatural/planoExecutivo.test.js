/**
 * DESP-004 — testes unitários do plano executivo.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { parecerValidoCompleto } from "../mre/parecer/fixtures.js";
import {
  derivarEtapas,
  montarPlanoExecutivo,
  problemaExigePlanoExecutivo
} from "./planoExecutivo.js";

test("exige plano: trade-off + riscos + acção multi-etapa", () => {
  const parecer = parecerValidoCompleto();
  assert.equal(
    problemaExigePlanoExecutivo({
      parecer,
      instrucao: "Adiar outdoor",
      canal: "chat"
    }),
    true
  );
});

test("exige plano: pedido explícito de etapas", () => {
  assert.equal(
    problemaExigePlanoExecutivo({
      parecer: parecerValidoCompleto(),
      instrucao: "faz um plano passo a passo",
      canal: "chat"
    }),
    true
  );
});

test("não exige plano: centro_situacao ou solicitar_dados", () => {
  const parecer = parecerValidoCompleto();
  assert.equal(
    problemaExigePlanoExecutivo({
      parecer,
      instrucao: "plano",
      canal: "centro_situacao"
    }),
    false
  );
  parecer.decisaoExecutiva.estado = "solicitar_dados";
  assert.equal(
    problemaExigePlanoExecutivo({
      parecer,
      instrucao: "como organizar",
      canal: "chat"
    }),
    false
  );
});

test("derivarEtapas parte acção por ';'", () => {
  const parecer = parecerValidoCompleto();
  const etapas = derivarEtapas(parecer);
  assert.ok(etapas.length >= 2);
  assert.match(etapas[0], /outdoor|caminho/i);
  assert.match(etapas.join(" "), /pagamento|integra/i);
});

test("montarPlanoExecutivo inclui dependência e risco", () => {
  const plano = montarPlanoExecutivo(parecerValidoCompleto(), { canal: "chat" });
  assert.ok(plano);
  assert.match(plano, /Plano:/);
  assert.match(plano, /Dependência:|após|pagamento/i);
  assert.match(plano, /Risco:/i);
});
