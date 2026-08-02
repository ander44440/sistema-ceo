/**
 * Testes Emenda E2.2 — Cobertura de Classificação (IMP-057).
 */
import assert from "node:assert/strict";
import { test } from "node:test";

import { LIMIAR_CONFIANCA } from "./dominio.js";
import {
  classificar,
  ehConhecimentoGeralE22,
  ehDeliberacaoProjetoE22,
  ehIntencaoExecutivaE21,
  normalizarTexto
} from "./regras.js";
import { classificarEEncaminhar } from "./encaminhador.js";

/** Exemplos obrigatórios C1 — Emenda E2.2 (pedido de implementação). */
export const EXEMPLOS_C1_E22 = Object.freeze([
  "Me dê uma receita de bolo de laranja.",
  "Quem foi Albert Einstein?",
  "O que é Docker?",
  "Explique REST."
]);

/** Exemplos obrigatórios C2 — Emenda E2.2 (pedido de implementação). */
export const EXEMPLOS_C2_E22 = Object.freeze([
  "Como devemos priorizar o MG2?",
  "Você concorda com a arquitetura atual?",
  "Quais capacidades ainda faltam para o CEO?",
  "O que você acha da arquitetura do Motor?"
]);

/** Domínios C1 cobertos (amostra lexical mínima). */
export const AMOSTRAS_DOMINIO_C1_E22 = Object.freeze([
  ["receitas", "Qual a receita de pão?"],
  ["culinária", "Dica de culinária italiana."],
  ["história", "Quem foi Napoleão?"],
  ["ciência", "O que é fotossintese na biologia?"],
  ["matemática", "O que é uma equacao na matematica?"],
  ["programação", "O que é um algoritmo?"],
  ["tecnologia", "O que é Kubernetes?"],
  ["pessoas", "Quem foi Marie Curie?"],
  ["lugares", "Onde fica a capital de Portugal?"],
  ["definições", "O que é JSON?"],
  ["explicações", "Explique HTTP."]
]);

test("CA-E2.2-1: exemplos obrigatórios C1 → conhecimento_geral, sem Clarificação", () => {
  for (const texto of EXEMPLOS_C1_E22) {
    const t = normalizarTexto(texto);
    assert.equal(ehConhecimentoGeralE22(t), true, `detect C1: ${texto}`);
    assert.equal(ehIntencaoExecutivaE21(t), false, `não E2.1: ${texto}`);

    const s = classificar(texto);
    assert.equal(s.classe, "conhecimento_geral", texto);
    assert.equal(s.destino, "resposta_leve", texto);
    assert.equal(s.precisaClarificacao, false, texto);
    assert.ok(s.confianca >= LIMIAR_CONFIANCA, `${texto} conf=${s.confianca}`);

    const rota = classificarEEncaminhar(texto);
    assert.equal(rota.destino, "resposta_leve", texto);
    assert.notEqual(rota.destino, "clarificacao", texto);
  }
});

test("CA-E2.2-2: exemplos obrigatórios C2 → conversa_projeto, sem Clarificação", () => {
  for (const texto of EXEMPLOS_C2_E22) {
    const t = normalizarTexto(texto);
    assert.equal(
      ehDeliberacaoProjetoE22(t, { frenteActiva: true }),
      true,
      `detect C2: ${texto}`
    );
    assert.equal(ehIntencaoExecutivaE21(t), false, `não E2.1: ${texto}`);

    const s = classificar(texto, { frenteActiva: true });
    assert.equal(s.classe, "conversa_projeto", texto);
    assert.equal(s.destino, "nucleo_mre", texto);
    assert.equal(s.precisaClarificacao, false, texto);
    assert.ok(s.confianca >= LIMIAR_CONFIANCA, `${texto} conf=${s.confianca}`);
    assert.equal(s.permiteJob, false, texto);

    // Também sem flag, se o texto já traz âncora de projecto
    const s2 = classificar(texto);
    assert.equal(s2.classe, "conversa_projeto", `sem flag: ${texto}`);
    assert.equal(s2.precisaClarificacao, false, texto);

    const rota = classificarEEncaminhar(texto, { frenteActiva: true });
    assert.equal(rota.destino, "nucleo_mre", texto);
    assert.notEqual(rota.destino, "clarificacao", texto);
  }
});

test("CA-E2.2-3: amostras de domínios C1 cobertos", () => {
  for (const [dominio, texto] of AMOSTRAS_DOMINIO_C1_E22) {
    const s = classificar(texto);
    assert.equal(s.classe, "conhecimento_geral", `${dominio}: ${texto}`);
    assert.equal(s.precisaClarificacao, false, dominio);
    assert.notEqual(s.destino, "clarificacao", dominio);
  }
});

test("CA-E2.2-4: E2.2 não rebaixa E2.1; explique de projecto permanece C2", () => {
  const c3 = classificar("Resolva os bugs.", { frenteActiva: true });
  assert.equal(c3.classe, "trabalho_executivo");

  const explProjeto = classificar("Explique esse módulo.", {
    frenteActiva: true
  });
  assert.equal(explProjeto.classe, "conversa_projeto");
  assert.equal(explProjeto.precisaClarificacao, false);

  const explConceito = classificar("Explique REST.");
  assert.equal(explConceito.classe, "conhecimento_geral");
});

test("E2.2 demo — todos os exemplos obrigatórios", () => {
  console.log("\n--- DEMO E2.2 ---");
  for (const texto of EXEMPLOS_C1_E22) {
    const s = classificar(texto);
    console.log({
      texto,
      classe: s.classe,
      destino: s.destino,
      clarificacao: s.precisaClarificacao,
      conf: s.confianca
    });
    assert.equal(s.classe, "conhecimento_geral");
    assert.equal(s.precisaClarificacao, false);
  }
  for (const texto of EXEMPLOS_C2_E22) {
    const s = classificar(texto, { frenteActiva: true });
    console.log({
      texto,
      classe: s.classe,
      destino: s.destino,
      clarificacao: s.precisaClarificacao,
      conf: s.confianca
    });
    assert.equal(s.classe, "conversa_projeto");
    assert.equal(s.precisaClarificacao, false);
  }
  console.log("--- fim DEMO E2.2 ---\n");
});
