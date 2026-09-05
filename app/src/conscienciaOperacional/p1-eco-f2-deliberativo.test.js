/**
 * Classe F2 — sob pedidoDecisao não há prosa operacional (reconciliada / P2 / Outras fontes).
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  comporProsaLastro,
  garantirReflexoEstadoExecutivo,
  schemaHintConsciencia
} from "./influenciaDeliberacao.js";
import { detectarPedidoDecisaoExplicita } from "../classificadorIntencao/pedidoDecisaoExplicita.js";

const PEDIDO_ABC = `Contrato novo:
A) Aceitar agora
B) Recusar o contrato
C) Adiar a aceitação

Decide A, B ou C. Não execute.`;

const FACTO_093 =
  "Estado Executivo — Job em correção JOB-000093: TESTE C9 — acompanhamento aberto — resultado: Ficheiro executive/queue/teste-c9-execucao-real.txt criado. | evidência: executive/queue/teste-c9-execucao-real.txt";

const FACTO_095 =
  "Estado Executivo — Job em correção JOB-000095: Decide A/B/C — acompanhamento aberto — resultado: Decisão executiva: C. | evidência: —";

const FACTO_RUNNING =
  "Estado Executivo — Job em execução JOB-RUN: implementar endpoint";

function lastroF2(factos, extra = {}) {
  return {
    temContextoRelevante: true,
    fontePrioritaria: { id: "F2", nome: "Jobs em execução" },
    contagens: { jobsPendentes: 0, jobsEmExecucao: 1, gatesPendentes: 0 },
    factosOficiais: Array.isArray(factos) ? factos : [factos],
    resultadoMissaoActivo: null,
    ...extra
  };
}

test("1: pedidoDecisao + F2 needs_correction → prosa null; sem prefixo_lastro", () => {
  assert.equal(detectarPedidoDecisaoExplicita(PEDIDO_ABC), true);
  const lastro = lastroF2([FACTO_093, FACTO_095]);
  const prosa = comporProsaLastro(lastro, PEDIDO_ABC);
  assert.equal(prosa, null);

  const deliberativa = "Decisão: C — adiar a aceitação do contrato.";
  const reflexo = garantirReflexoEstadoExecutivo(deliberativa, lastro, PEDIDO_ABC);
  assert.equal(reflexo.aplicada, false);
  assert.equal(reflexo.motivo, "sem_prosa");
  assert.equal(reflexo.mensagem, deliberativa);
  assert.doesNotMatch(reflexo.mensagem, /Já incorporei|execução em andamento|Job em correção|prefixo|Tenha isto em conta/i);
});

test("2: sem pedidoDecisao → Outras fontes / Teste 3 / P2 preservados", () => {
  const textoContinuidade = "Use o resultado para continuar a missão";
  assert.equal(detectarPedidoDecisaoExplicita(textoContinuidade), false);
  const prosaT3 = comporProsaLastro(lastroF2(FACTO_093), textoContinuidade);
  assert.match(String(prosaT3 || ""), /Já incorporei o resultado reconciliado/i);

  const textoNeutro = "Como vamos priorizar o MG2?";
  const prosaP2 = comporProsaLastro(lastroF2(FACTO_RUNNING), textoNeutro);
  assert.match(String(prosaP2 || ""), /execução em andamento/i);

  // Outras fontes: lastro sem F2/running (ex. frente)
  const lastroFrente = {
    temContextoRelevante: true,
    fontePrioritaria: { id: "F8" },
    contagens: { jobsPendentes: 0, jobsEmExecucao: 0, gatesPendentes: 0 },
    factosOficiais: ["Estado Executivo — Frente activa: ALFA"],
    resultadoMissaoActivo: null
  };
  const prosaOutras = comporProsaLastro(lastroFrente, textoNeutro);
  assert.match(String(prosaOutras || ""), /Frente activa: ALFA/i);
  assert.match(String(prosaOutras || ""), /Tenha isto em conta/i);
});

test("A/B: decisão + running → deliberação intacta; sem P2/E5", () => {
  const lastro = lastroF2(FACTO_RUNNING);
  assert.equal(comporProsaLastro(lastro, PEDIDO_ABC), null);
  const deliberativa = "Decisão: B — recusar o contrato neste momento.";
  const reflexo = garantirReflexoEstadoExecutivo(deliberativa, lastro, PEDIDO_ABC);
  assert.equal(reflexo.mensagem, deliberativa);
  assert.notEqual(reflexo.motivo, "prefixo_lastro");
  assert.notEqual(reflexo.motivo, "prosa_canonica_e5");
});

test("C: sem pedidoDecisao + F2 running → P2 preservado", () => {
  const texto = "Como vamos priorizar o MG2?";
  const lastro = lastroF2(FACTO_RUNNING);
  const prosa = comporProsaLastro(lastro, texto);
  assert.match(String(prosa || ""), /execução em andamento/i);
  const reflexo = garantirReflexoEstadoExecutivo(
    "Sugiro replanejar o roadmap.",
    lastro,
    texto
  );
  assert.equal(reflexo.aplicada, true);
  assert.match(reflexo.mensagem, /execução em andamento/i);
});

test("D: Teste 3 sem decisão → prosa reconciliada preservada", () => {
  const texto = "Use o resultado para continuar a missão";
  const prosa = comporProsaLastro(lastroF2(FACTO_093), texto);
  assert.match(String(prosa || ""), /Já incorporei o resultado reconciliado/i);
  assert.match(String(prosa || ""), /JOB-000093/);
});

test("registo: schemaHint sob pedidoDecisao não embute prosa Outras fontes", () => {
  const hint = schemaHintConsciencia(lastroF2(FACTO_093), PEDIDO_ABC);
  assert.doesNotMatch(hint, /Padrão de prosa esperado:\s*\nJob em correção/i);
  assert.doesNotMatch(hint, /Tenha isto em conta antes de avançar/i);
});
