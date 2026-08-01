/**
 * Testes contexto Gate pendente — IMP-058 E3
 * (sem Conversa / Motor / UI / Dispatcher / I/O).
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { criarStoreContextoGate } from "./contexto.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

test("E3-CA1: Gate aberto → contexto recuperável sem repetir C3", () => {
  const store = criarStoreContextoGate();
  const reg = store.abrirGate({
    parecerId: "PAR-E3-1",
    cicloId: "CIC-E3-1",
    abertoEm: "2026-08-01T16:00:00.000Z",
    parecerSnapshot: { id: "PAR-E3-1", resumo: "Implemente outdoor" },
    solicitacaoResumo: "Implemente outdoor"
  });

  assert.equal(reg.gate.estado, "pendente");
  assert.equal(reg.parecerSnapshot?.id, "PAR-E3-1");
  assert.equal(reg.solicitacaoResumo, "Implemente outdoor");

  const activo = store.obterContextoActivo();
  assert.ok(activo);
  assert.equal(activo?.gate.parecerId, "PAR-E3-1");
  assert.equal(activo?.gate.cicloId, "CIC-E3-1");
  assert.deepEqual(activo?.parecerSnapshot, {
    id: "PAR-E3-1",
    resumo: "Implemente outdoor"
  });

  // Decisão curta — sem repetir solicitação
  const cons = store.consumirDecisao("Autorizado.", {
    agora: "2026-08-01T16:05:00.000Z"
  });
  assert.equal(cons.ok, true);
  assert.equal(cons.localizado, true);
  assert.equal(cons.reconhecimento.decisao, "aprovado");
  assert.equal(cons.registo?.solicitacaoResumo, "Implemente outdoor");
  assert.equal(cons.registo?.parecerSnapshot?.id, "PAR-E3-1");
});

test("E3-CA2: com dois Gates, activo = mais recente; decisão localiza o correcto", () => {
  const store = criarStoreContextoGate();
  store.abrirGate({
    parecerId: "PAR-OLD",
    gateId: "G-OLD",
    abertoEm: "2026-08-01T10:00:00.000Z",
    solicitacaoResumo: "Pedido antigo"
  });
  store.abrirGate({
    parecerId: "PAR-NEW",
    gateId: "G-NEW",
    abertoEm: "2026-08-01T12:00:00.000Z",
    solicitacaoResumo: "Pedido novo"
  });

  const activo = store.obterGatePendenteMaisRecente();
  assert.equal(activo?.gateId, "G-NEW");
  assert.equal(store.obterContextoActivo()?.solicitacaoResumo, "Pedido novo");

  const loc = store.localizarParaDecisao("Pode executar.");
  assert.equal(loc.localizado, true);
  assert.equal(loc.gate?.gateId, "G-NEW");
  assert.equal(loc.gate?.parecerId, "PAR-NEW");

  const cons = store.consumirDecisao("Pode executar.");
  assert.equal(cons.ok, true);
  assert.equal(cons.gate?.gateId, "G-NEW");
  assert.equal(cons.gate?.estado, "resolvido_aprovado");

  // Antigo continua pendente; torna-se o activo
  assert.equal(store.obterGatePendenteMaisRecente()?.gateId, "G-OLD");
});

test("E3-CA3: após aprovado/rejeitado deixa de estar pendente", () => {
  const store = criarStoreContextoGate();
  store.abrirGate({
    parecerId: "PAR-REJ",
    gateId: "G-REJ",
    abertoEm: "2026-08-01T11:00:00.000Z"
  });
  const rej = store.consumirDecisao("Cancela.");
  assert.equal(rej.ok, true);
  assert.equal(rej.gate?.estado, "resolvido_rejeitado");
  assert.equal(rej.permanecePendente, false);
  assert.equal(store.temGatePendente(), false);
  assert.equal(store.obterContextoActivo(), null);

  store.abrirGate({
    parecerId: "PAR-APR",
    gateId: "G-APR",
    abertoEm: "2026-08-01T11:30:00.000Z"
  });
  const apr = store.consumirDecisao("Aprovado.");
  assert.equal(apr.ok, true);
  assert.equal(apr.gate?.estado, "resolvido_aprovado");
  assert.equal(apr.podeCriarJob, true);
  assert.equal(store.temGatePendente(), false);
});

test("E3-CA4: após adiado permanece recuperável como pendente", () => {
  const store = criarStoreContextoGate();
  store.abrirGate({
    parecerId: "PAR-ADI",
    gateId: "G-ADI",
    abertoEm: "2026-08-01T13:00:00.000Z",
    solicitacaoResumo: "Corrigir bugs"
  });

  const adi = store.consumirDecisao("Depois.");
  assert.equal(adi.ok, true);
  assert.equal(adi.permanecePendente, true);
  assert.equal(adi.gate?.estado, "pendente");
  assert.equal(adi.gate?.adiamentos, 1);
  assert.equal(store.temGatePendente(), true);

  const activo = store.obterContextoActivo();
  assert.equal(activo?.gate.gateId, "G-ADI");
  assert.equal(activo?.solicitacaoResumo, "Corrigir bugs");

  // Retoma sem repetir C3
  const retoma = store.consumirDecisao("Pode prosseguir.");
  assert.equal(retoma.ok, true);
  assert.equal(retoma.gate?.estado, "resolvido_aprovado");
  assert.equal(retoma.registo?.solicitacaoResumo, "Corrigir bugs");
});

test("E3: limpeza segura e localização sem Gate", () => {
  const store = criarStoreContextoGate();
  store.abrirGate({
    parecerId: "PAR-L1",
    gateId: "G-L1",
    abertoEm: "2026-08-01T09:00:00.000Z"
  });
  store.consumirDecisao("Rejeitado.");
  assert.equal(store.limparResolvidos(), 1);
  assert.equal(store.listarRegistos().length, 0);

  const sem = store.localizarParaDecisao("Aprovado.");
  assert.equal(sem.localizado, false);
  assert.equal(sem.reconhecimento.reconhecida, true);

  const fora = store.localizarParaDecisao("ok");
  assert.equal(fora.localizado, false);
  assert.equal(fora.reconhecimento.reconhecida, false);

  store.abrirGate({ parecerId: "PAR-X", gateId: "G-X" });
  store.limparTudo();
  assert.equal(store.temGatePendente(), false);
});

test("E3-CA5: store sem Jobs / Motor / SDK / I/O", () => {
  const src = readFileSync(join(__dirname, "contexto.js"), "utf8");
  assert.equal(src.includes("@cursor/sdk"), false);
  assert.equal(/\bfetch\s*\(/.test(src), false);
  assert.equal(/from\s+["'].*conversa/.test(src), false);
  assert.equal(/from\s+["'].*motorExecucao/.test(src), false);
  assert.equal(/from\s+["'].*executionQueue/.test(src), false);
  assert.equal(/from\s+["'].*classificador/.test(src), false);
  assert.equal(/localStorage|indexedDB|fs\.|http\.|express/.test(src), false);
  assert.equal(/document\.|window\./.test(src), false);
  assert.match(src, /from\s+["']\.\/dominio\.js["']/);
  assert.match(src, /from\s+["']\.\/reconhecerDecisao\.js["']/);
});
