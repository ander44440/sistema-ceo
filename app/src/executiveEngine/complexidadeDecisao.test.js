/**
 * IMP-066 / REQ-066 — Tempo de resposta ∝ complexidade (CT-CX).
 */
import assert from "node:assert/strict";
import { test, beforeEach } from "node:test";

import {
  avaliarComplexidadeDecisao,
  definirComplexidadeRoteamentoAtivo,
  COMPLEXIDADE_ROTEAMENTO_ATIVO
} from "../executiveEngine/complexidadeDecisao.js";
import { capacidadeIa } from "../executiveEngine/capacidades/ia.js";
import { flagMre } from "../mre/roteamentoDeliberativo.js";
import { reiniciarStoresPosDeliberacaoParaTestes } from "../mre/integracaoNucleo.js";

beforeEach(() => {
  definirComplexidadeRoteamentoAtivo(true);
  reiniciarStoresPosDeliberacaoParaTestes();
});

test("CT-CX01: saudação → instantaneo; capital → leve", () => {
  const s = avaliarComplexidadeDecisao({
    texto: "Bom dia",
    intencao: { id: "saudacao", capacidade: "ia" }
  });
  assert.equal(s.nivel, "instantaneo");
  assert.equal(s.permiteMreCompleto, false);

  const c = avaliarComplexidadeDecisao({
    texto: "Qual é a capital da França?",
    classe: "conhecimento_geral",
    destino: "resposta_leve"
  });
  assert.equal(c.nivel, "leve");
  assert.ok(c.maxTokens <= 500);
});

test("CT-CX02: retoma curta → moderado (sem MRE completo)", () => {
  const r = avaliarComplexidadeDecisao({
    texto: "Voltando ao Motoboy Game 2, onde paramos?",
    classe: "conversa_projeto",
    destino: "nucleo_mre",
    intencao: { id: "deliberar_objetivo", capacidade: "ia" },
    frenteActiva: true
  });
  assert.equal(r.nivel, "moderado");
  assert.equal(r.permiteMreCompleto, false);
});

test("CT-CX03: priorizar / trade-off → completa", () => {
  const r = avaliarComplexidadeDecisao({
    texto: "Como devemos priorizar outdoor vs pagamento no MG2?",
    classe: "conversa_projeto",
    destino: "nucleo_mre",
    intencao: { id: "deliberar_objetivo", capacidade: "ia" },
    frenteActiva: true
  });
  assert.equal(r.nivel, "completa");
  assert.equal(r.permiteMreCompleto, true);
});

test("CT-CX04: capacidadeIa moderado não chama pipeline MRE", async () => {
  let mreCalls = 0;
  const original = flagMre.ativo;
  flagMre.ativo = true;

  // Spy: executarRotaDeliberativa is imported inside ia — we assert via rota metadata
  // by injecting deliberarComLlm and ensuring modo llm_rapido without MRE deps.
  const out = await capacidadeIa.executar({
    instrucao: "onde paramos?",
    historico: [],
    intencao: {
      id: "deliberar_objetivo",
      capacidade: "ia",
      classe: "conversa_projeto",
      destino: "nucleo_mre"
    },
    memoria: () => ({}),
    // Sem LLM configurado no unit → fallback rápido, não MRE
  });

  assert.equal(out.dados?.complexidadeDecisao?.nivel, "moderado");
  assert.notEqual(out.dados?.rota, undefined);
  assert.match(
    String(out.dados?.rota || ""),
    /deliberativa-rapida|consciencia|fallback|deterministica/
  );
  assert.doesNotMatch(String(out.dados?.rota || ""), /^mre/);
  void mreCalls;
  flagMre.ativo = original;
});

test("CT-CX05: rollback desliga proporcionalidade deliberativa", () => {
  definirComplexidadeRoteamentoAtivo(false);
  assert.equal(COMPLEXIDADE_ROTEAMENTO_ATIVO, false);
  const r = avaliarComplexidadeDecisao({
    texto: "onde paramos?",
    classe: "conversa_projeto",
    destino: "nucleo_mre",
    intencao: { id: "deliberar_objetivo", capacidade: "ia" }
  });
  assert.equal(r.nivel, "completa");
  definirComplexidadeRoteamentoAtivo(true);
});
