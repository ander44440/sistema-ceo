/**
 * Testes reconhecimento de decisão — IMP-058 E2
 * (sem Conversa / Motor / UI / Dispatcher / I/O).
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { criarGatePendente, DECISOES_GATE } from "./dominio.js";
import {
  LEXICO_DECISAO_GATE,
  ENUNCIADOS_MINIMOS_V1,
  normalizarEnunciadoDecisao,
  reconhecerDecisao,
  reconhecerParaGate
} from "./reconhecerDecisao.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

test("E2-CA1: oito enunciados mínimos mapeiam correctamente", () => {
  assert.equal(ENUNCIADOS_MINIMOS_V1.length, 8);
  assert.equal(Object.keys(LEXICO_DECISAO_GATE).length, 8);

  const esperado = {
    Aprovado: "aprovado",
    "Pode executar": "aprovado",
    Autorizado: "aprovado",
    "Pode prosseguir": "aprovado",
    Cancela: "rejeitado",
    Rejeitado: "rejeitado",
    Depois: "adiado",
    Adiar: "adiado"
  };

  for (const [enunciado, decisao] of Object.entries(esperado)) {
    const r = reconhecerDecisao(enunciado);
    assert.equal(r.reconhecida, true, enunciado);
    assert.equal(r.decisao, decisao, enunciado);
    assert.ok(DECISOES_GATE.includes(r.decisao));
  }
});

test("E2-CA2: variações triviais (ponto, caixa, espaços, aspas)", () => {
  const casos = [
    ["aprovado.", "aprovado"],
    ["APROVADO", "aprovado"],
    ["  Pode executar.  ", "aprovado"],
    ["autorizado!", "aprovado"],
    ["Pode  prosseguir…", "aprovado"],
    ["«Cancela»", "rejeitado"],
    ['"Rejeitado."', "rejeitado"],
    ["depois?", "adiado"],
    ["ADIAR", "adiado"]
  ];

  for (const [texto, decisao] of casos) {
    const r = reconhecerDecisao(texto);
    assert.equal(r.reconhecida, true, texto);
    assert.equal(r.decisao, decisao, texto);
  }

  assert.equal(normalizarEnunciadoDecisao("  Pode   Executar!!! "), "pode executar");
});

test("E2-CA3: fora do léxico → reconhecida false (sem forçar)", () => {
  const negativos = [
    "ok",
    "sim",
    "pode",
    "executar",
    "Aprovado o outdoor",
    "Implemente o outdoor e despacha",
    "Sugiro priorizar",
    "lista os jobs",
    "",
    null,
    "autoriza",
    "cancelar",
    "mais tarde"
  ];

  for (const texto of negativos) {
    const r = reconhecerDecisao(texto);
    assert.equal(r.reconhecida, false, String(texto));
    assert.equal(r.decisao, null, String(texto));
  }
});

test("E2: integração domínio E1 — reconhecerParaGate", () => {
  const gate = criarGatePendente({
    parecerId: "PAR-E2",
    cicloId: "CIC-E2",
    abertoEm: "2026-08-01T15:00:00.000Z"
  });

  const prep = reconhecerParaGate("Autorizado.", gate);
  assert.equal(prep.reconhecimento.reconhecida, true);
  assert.equal(prep.reconhecimento.decisao, "aprovado");
  assert.equal(prep.aplicavel, true);
  assert.equal(prep.transicao?.ok, true);

  const aplicado = reconhecerParaGate("Depois.", gate, {
    aplicar: true,
    agora: "2026-08-01T15:01:00.000Z"
  });
  assert.equal(aplicado.aplicavel, true);
  assert.equal(aplicado.aplicacao?.ok, true);
  if (aplicado.aplicacao?.ok) {
    assert.equal(aplicado.aplicacao.gate.estado, "pendente");
    assert.equal(aplicado.aplicacao.gate.adiamentos, 1);
    assert.equal(aplicado.aplicacao.permanecePendente, true);
  }

  const semGate = reconhecerParaGate("Aprovado.", null);
  assert.equal(semGate.reconhecimento.reconhecida, true);
  assert.equal(semGate.aplicavel, false);

  const fora = reconhecerParaGate("ok", gate);
  assert.equal(fora.reconhecimento.reconhecida, false);
  assert.equal(fora.aplicavel, false);

  const resolvido = reconhecerParaGate("Aprovado.", gate, { aplicar: true });
  assert.equal(resolvido.aplicacao?.ok, true);
  const segunda = reconhecerParaGate(
    "Aprovado.",
    resolvido.aplicacao?.ok ? resolvido.aplicacao.gate : null
  );
  assert.equal(segunda.aplicavel, false);
});

test("E2-CA4: módulo puro sem fetch/Fila/Motor/SDK", () => {
  const src = readFileSync(join(__dirname, "reconhecerDecisao.js"), "utf8");
  assert.equal(src.includes("@cursor/sdk"), false);
  assert.equal(/\bfetch\s*\(/.test(src), false);
  assert.equal(/from\s+["'].*conversa/.test(src), false);
  assert.equal(/from\s+["'].*motorExecucao/.test(src), false);
  assert.equal(/from\s+["'].*executionQueue/.test(src), false);
  assert.equal(/localStorage|indexedDB|fs\.|http\.|express/.test(src), false);
  assert.equal(/document\.|window\./.test(src), false);
  // Integra só ao domínio E1
  assert.match(src, /from\s+["']\.\/dominio\.js["']/);
});

test("E2-CA5: léxico V1 fechado (8 chaves; sem ad hoc)", () => {
  const chaves = Object.keys(LEXICO_DECISAO_GATE);
  assert.equal(chaves.length, 8);
  assert.deepEqual(chaves.sort(), [
    "adiar",
    "aprovado",
    "autorizado",
    "cancela",
    "depois",
    "pode executar",
    "pode prosseguir",
    "rejeitado"
  ]);
  // Sem sinónimos extra tipo "ok" / "sim"
  assert.equal("ok" in LEXICO_DECISAO_GATE, false);
  assert.equal("sim" in LEXICO_DECISAO_GATE, false);
});
