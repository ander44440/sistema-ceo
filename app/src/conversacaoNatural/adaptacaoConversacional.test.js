/**
 * DESP-006 — adaptação conversacional (profundidade / detalhe / condução).
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  adaptarCamadasAoModo,
  detectarModoAdaptacao,
  ehConfirmacaoRapida,
  ehExploratorio,
  ordemCamadasParaModo
} from "./adaptacaoConversacional.js";

test("detecta confirmação rápida", () => {
  assert.equal(ehConfirmacaoRapida("ok"), true);
  assert.equal(ehConfirmacaoRapida("pode."), true);
  assert.equal(ehConfirmacaoRapida("Adiar outdoor e focar pagamento"), false);
  assert.equal(
    detectarModoAdaptacao({ instrucao: "ok", parecer: { decisaoExecutiva: { estado: "aprovar" } } }),
    "rapido"
  );
});

test("detecta pedido de detalhe", () => {
  assert.equal(
    detectarModoAdaptacao({
      instrucao: "Porquê adiar o outdoor?",
      pediuDetalhe: false
    }),
    "detalhe"
  );
  assert.equal(
    detectarModoAdaptacao({ instrucao: "Segue", pediuDetalhe: true }),
    "detalhe"
  );
});

test("detecta exploração e execução", () => {
  assert.equal(ehExploratorio("O que achas das opções?"), true);
  assert.equal(
    detectarModoAdaptacao({
      instrucao: "Como devemos organizar a sprint?",
      parecer: { enquadramento: { tipoPedido: "informacao" } }
    }),
    "exploratorio"
  );
  assert.equal(
    detectarModoAdaptacao({
      instrucao: "Implementa o job de outdoor",
      parecer: { enquadramento: { tipoPedido: "execucao" } }
    }),
    "execucao"
  );
});

test("detecta mudança de intenção e bloqueio", () => {
  assert.equal(
    detectarModoAdaptacao({
      instrucao: "Agora quero falar de pagamento",
      ctxImediato: { houveShiftTopico: false }
    }),
    "mudanca"
  );
  assert.equal(
    detectarModoAdaptacao({
      instrucao: "Mantemos outdoor?",
      ctxImediato: { houveShiftTopico: true }
    }),
    "mudanca"
  );
  assert.equal(
    detectarModoAdaptacao({
      instrucao: "Posso avançar?",
      parecer: { decisaoExecutiva: { estado: "solicitar_dados" } }
    }),
    "bloqueio"
  );
});

test("adapta camadas: rápido omite plano/antecipação/síntese", () => {
  const out = adaptarCamadasAoModo(
    {
      E: "Âncora",
      P: "Plano: 1) a 2) b",
      A: "Decido X. Em alternativa ficaria Y. Critério de mudança: Z.",
      B: "Gesto",
      C: "Síntese",
      N: "Antecipo risco…",
      D: "Seguimos?",
      F: "Fecho"
    },
    "rapido"
  );
  assert.equal(out.P, null);
  assert.equal(out.N, null);
  assert.equal(out.C, null);
  assert.equal(out.F, null);
  assert.ok(out.A);
  assert.ok(!/Em alternativa|Critério de mudança/i.test(out.A));
  assert.equal(out.D, "Seguimos?");
});

test("adapta camadas: execução CTO-002 omite ensaio/plano/fecho", () => {
  const out = adaptarCamadasAoModo(
    { A: "A", B: "B", C: "C", F: "F", P: "P", D: "?", N: "N" },
    "execucao",
    { confianca: 0.85 }
  );
  assert.equal(out.C, null);
  assert.equal(out.F, null);
  assert.equal(out.P, null);
  assert.equal(out.D, null);
  assert.equal(out.N, null);
  assert.equal(out.A, "A");
  assert.equal(out.B, "B");
});

test("ordem de camadas por modo", () => {
  assert.deepEqual(ordemCamadasParaModo("rapido", "chat"), [
    "E",
    "A",
    "N",
    "D",
    "F"
  ]);
  assert.deepEqual(ordemCamadasParaModo("mudanca", "chat"), [
    "E",
    "M",
    "P",
    "A",
    "B",
    "C",
    "D"
  ]);
  assert.deepEqual(ordemCamadasParaModo("compacto", "centro_situacao"), [
    "A",
    "B"
  ]);
});

test("rapido em missão mantém sinal de condução N", () => {
  const out = adaptarCamadasAoModo(
    {
      A: "Ok.",
      N: "Antecipo a pendência «Sprint 1».",
      D: "Tratamos?",
      P: "Plano",
      C: "Síntese",
      M: "Memória"
    },
    "rapido",
    { missaoActiva: true }
  );
  assert.equal(out.P, null);
  assert.equal(out.C, null);
  assert.equal(out.M, null);
  assert.ok(out.N);
  assert.ok(out.D);
});
