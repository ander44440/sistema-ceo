/**
 * Testes Emenda E2.1 — Priorização de Intenções Executivas (IMP-057).
 */
import assert from "node:assert/strict";
import { test, beforeEach } from "node:test";

import { LIMIAR_CONFIANCA } from "./dominio.js";
import {
  classificar,
  ehIntencaoExecutivaE21,
  ehPerguntaDeliberativa
} from "./regras.js";
import { classificarEEncaminhar } from "./encaminhador.js";
import { executiveEngine } from "../executiveEngine/index.js";
import { contemSugiroComoRespostaFinal } from "./integracaoNucleo.js";
import { criarPublicadorFilaMemoria } from "../motorExecucao/ponteParecerJob.js";
import { resetStoreContinuidadePadrao } from "../continuidadeGate/integracaoConversa.js";

beforeEach(() => {
  resetStoreContinuidadePadrao();
});

/** Exemplos obrigatórios C3 — Emenda E2.1 */
export const EXEMPLOS_C3_E21 = Object.freeze([
  "Resolva os bugs.",
  "Corrija esse problema.",
  "Faça um diagnóstico.",
  "Implemente esta funcionalidade.",
  "Acione o CTO.",
  "Acione o Engenheiro.",
  "Delegue esta tarefa.",
  "Execute esta análise.",
  "Gere um relatório.",
  "Crie um Job.",
  "Investigue este erro."
]);

/** Exemplos obrigatórios C2 — Emenda E2.1 */
export const EXEMPLOS_C2_E21 = Object.freeze([
  "Como devemos priorizar os bugs?",
  "O que você acha dessa arquitetura?",
  "Qual seria a melhor estratégia?",
  "Explique esse módulo.",
  "Analise este projeto."
]);

test("CA-E2.1-1: todos os verbos executivos → C3 / motor_execucao", () => {
  for (const texto of EXEMPLOS_C3_E21) {
    const s = classificar(texto);
    assert.equal(s.classe, "trabalho_executivo", texto);
    assert.equal(s.destino, "motor_execucao", texto);
    assert.equal(s.permiteJob, true, texto);
    assert.ok(s.confianca >= LIMIAR_CONFIANCA, `${texto} conf=${s.confianca}`);
    assert.equal(s.precisaClarificacao, false, texto);
    assert.equal(ehIntencaoExecutivaE21(
      texto.trim().toLowerCase().replace(/[?？!.]+$/g, "").replace(/\s+/g, " ")
    ), true, `E2.1 detect: ${texto}`);

    const rota = classificarEEncaminhar(texto);
    assert.equal(rota.destino, "motor_execucao", texto);
  }
});

test("CA-E2.1-2: frente activa não rebaixa E2.1 para C2", () => {
  for (const texto of EXEMPLOS_C3_E21) {
    const s = classificar(texto, { frenteActiva: true });
    assert.equal(s.classe, "trabalho_executivo", `frente+ ${texto}`);
    assert.notEqual(s.classe, "conversa_projeto", texto);
    assert.equal(s.destino, "motor_execucao", texto);
  }

  // Frase com «projeto» + imperativo — boost C2 não vence
  const s = classificar("Resolva os bugs do projeto.", { frenteActiva: true });
  assert.equal(s.classe, "trabalho_executivo");
});

test("CA-E2.1-3: exemplos deliberativos permanecem C2", () => {
  for (const texto of EXEMPLOS_C2_E21) {
    const n = texto.toLowerCase().replace(/[?.!]+$/g, "");
    assert.ok(
      ehPerguntaDeliberativa(n) ||
        /\bexplique\b/i.test(texto) ||
        /\banalis/i.test(texto),
      texto
    );
    const s = classificar(texto, { frenteActiva: true });
    assert.equal(s.classe, "conversa_projeto", texto);
    assert.equal(s.permiteJob, false, texto);
    assert.notEqual(s.destino, "motor_execucao", texto);
  }
});

test("E2.1 demo Núcleo: 3 cenários → C3 → Motor → Gate/Job → anti-Sugiro", async () => {
  const demos = [
    "Resolva os bugs do projeto.",
    "Acione o CTO para fazer um diagnóstico.",
    "Implemente esta funcionalidade."
  ];

  console.log("\n--- DEMO E2.1 ---");
  for (const texto of demos) {
    resetStoreContinuidadePadrao();
    const fila = criarPublicadorFilaMemoria();
    const out = await executiveEngine.executar(texto, {
      publicarJob: fila.publicarJob.bind(fila),
      decisaoAprovacao: null
    });

    assert.equal(out.dados?.classificacao?.classe, "trabalho_executivo", texto);
    assert.equal(out.dados?.encaminhamento?.destino, "motor_execucao", texto);
    assert.equal(out.dados?.motorAcionado, true, texto);
    assert.equal(out.modo, "motor_execucao", texto);
    assert.ok(
      out.dados?.motor?.aguardandoGate === true ||
        out.dados?.motor?.publicado === true,
      `Gate ou Job: ${texto}`
    );
    assert.equal(contemSugiroComoRespostaFinal(out.mensagem), false, texto);

    console.log({
      texto,
      classe: out.dados?.classificacao?.classe,
      destino: out.dados?.encaminhamento?.destino,
      gate: out.dados?.motor?.aguardandoGate,
      publicado: out.dados?.motor?.publicado,
      msg: String(out.mensagem).slice(0, 110)
    });
  }
  console.log("--- fim DEMO E2.1 ---\n");
});
