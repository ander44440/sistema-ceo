/**
 * Testes domínio Continuidade do Gate — IMP-058 E1
 * (sem Conversa / Motor / UI / Dispatcher / I/O).
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import {
  DECISOES_GATE,
  ESTADOS_GATE,
  EFEITO_POR_DECISAO,
  ehDecisaoGate,
  ehEstadoGate,
  continuidadeAplica,
  efeitoDaDecisao,
  validarTransicaoGate,
  validarGatePendente,
  criarGatePendente,
  aplicarDecisaoGate,
  compararGateMaisRecente,
  seleccionarGatePendenteMaisRecente
} from "./dominio.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

test("E1-CA1: exactamente três decisões; rejeição de ad hoc", () => {
  assert.equal(DECISOES_GATE.length, 3);
  assert.deepEqual([...DECISOES_GATE], ["aprovado", "rejeitado", "adiado"]);

  for (const d of DECISOES_GATE) {
    assert.equal(ehDecisaoGate(d), true);
  }
  assert.equal(ehDecisaoGate("ok"), false);
  assert.equal(ehDecisaoGate("autorizado"), false);
  assert.equal(ehDecisaoGate("APROVADO"), false);
  assert.equal(ehDecisaoGate(""), false);

  assert.equal(validarTransicaoGate("pendente", "autorizado").ok, false);
  assert.equal(validarTransicaoGate("pendente", "sim").ok, false);

  assert.throws(() => efeitoDaDecisao(/** @type {any} */ ("marketing")), TypeError);
});

test("E1-CA2: estados ARQ-019; adiado permanece pendente (não Encerramento)", () => {
  assert.deepEqual([...ESTADOS_GATE], [
    "inexistente",
    "pendente",
    "resolvido_aprovado",
    "resolvido_rejeitado"
  ]);
  for (const e of ESTADOS_GATE) {
    assert.equal(ehEstadoGate(e), true);
  }
  assert.equal(ehEstadoGate("Encerramento"), false);
  assert.equal(ehEstadoGate("resolvido_adiado"), false);
  assert.equal(ehEstadoGate("aguardando_gate"), false);

  assert.deepEqual(EFEITO_POR_DECISAO.adiado, {
    estadoDestino: "pendente",
    podeCriarJob: false,
    permanecePendente: true
  });
  assert.equal(EFEITO_POR_DECISAO.adiado.estadoDestino, "pendente");
  assert.equal(EFEITO_POR_DECISAO.aprovado.estadoDestino, "resolvido_aprovado");
  assert.equal(EFEITO_POR_DECISAO.rejeitado.estadoDestino, "resolvido_rejeitado");
  assert.equal(EFEITO_POR_DECISAO.aprovado.podeCriarJob, true);
  assert.equal(EFEITO_POR_DECISAO.rejeitado.podeCriarJob, false);

  const gate = criarGatePendente({
    parecerId: "PAR-1",
    cicloId: "CIC-1",
    abertoEm: "2026-08-01T12:00:00.000Z"
  });
  const adiado = aplicarDecisaoGate(gate, "adiado", {
    agora: "2026-08-01T12:01:00.000Z"
  });
  assert.equal(adiado.ok, true);
  if (!adiado.ok) return;
  assert.equal(adiado.gate.estado, "pendente");
  assert.equal(adiado.permanecePendente, true);
  assert.equal(adiado.podeCriarJob, false);
  assert.equal(adiado.gate.adiamentos, 1);
  assert.equal(adiado.gate.ultimaDecisao, "adiado");
});

test("E1-CA3: transição só a partir de pendente; inexistente não aplica", () => {
  assert.equal(continuidadeAplica("pendente"), true);
  assert.equal(continuidadeAplica("inexistente"), false);
  assert.equal(continuidadeAplica("resolvido_aprovado"), false);
  assert.equal(continuidadeAplica("resolvido_rejeitado"), false);
  assert.equal(continuidadeAplica(null), false);

  const okAprov = validarTransicaoGate("pendente", "aprovado");
  assert.equal(okAprov.ok, true);
  if (okAprov.ok) {
    assert.equal(okAprov.para, "resolvido_aprovado");
    assert.equal(okAprov.podeCriarJob, true);
  }

  const okRej = validarTransicaoGate("pendente", "rejeitado");
  assert.equal(okRej.ok, true);
  if (okRej.ok) {
    assert.equal(okRej.para, "resolvido_rejeitado");
    assert.equal(okRej.podeCriarJob, false);
  }

  const okAdi = validarTransicaoGate("pendente", "adiado");
  assert.equal(okAdi.ok, true);
  if (okAdi.ok) {
    assert.equal(okAdi.para, "pendente");
    assert.equal(okAdi.permanecePendente, true);
  }

  const semGate = validarTransicaoGate("inexistente", "aprovado");
  assert.equal(semGate.ok, false);
  if (!semGate.ok) {
    assert.match(semGate.mensagem, /nenhum Gate pendente/i);
  }

  assert.equal(validarTransicaoGate("resolvido_aprovado", "aprovado").ok, false);
  assert.equal(validarTransicaoGate("resolvido_rejeitado", "rejeitado").ok, false);
  assert.equal(validarTransicaoGate("estado_x", "aprovado").ok, false);

  const gate = criarGatePendente({ parecerId: "PAR-2", abertoEm: "2026-08-01T10:00:00.000Z" });
  const aprovado = aplicarDecisaoGate(gate, "aprovado", {
    agora: "2026-08-01T10:05:00.000Z"
  });
  assert.equal(aprovado.ok, true);
  if (!aprovado.ok) return;
  assert.equal(aprovado.gate.estado, "resolvido_aprovado");

  const segunda = aplicarDecisaoGate(aprovado.gate, "aprovado");
  assert.equal(segunda.ok, false);
});

test("E1: modelo GatePendente — criar e validar", () => {
  const g = criarGatePendente({
    parecerId: "  PAR-ABC  ",
    cicloId: "CIC-9",
    gateId: "GATE-1",
    abertoEm: "2026-08-01T14:00:00.000Z"
  });
  assert.equal(g.parecerId, "PAR-ABC");
  assert.equal(g.cicloId, "CIC-9");
  assert.equal(g.gateId, "GATE-1");
  assert.equal(g.estado, "pendente");
  assert.equal(g.adiamentos, 0);
  assert.equal(g.ultimaDecisao, null);
  assert.equal(validarGatePendente(g).ok, true);

  assert.equal(validarGatePendente(null).ok, false);
  assert.equal(validarGatePendente({}).ok, false);
  assert.equal(
    validarGatePendente({
      ...g,
      parecerId: ""
    }).ok,
    false
  );
  assert.equal(
    validarGatePendente({
      ...g,
      estado: "Encerramento"
    }).ok,
    false
  );
  assert.throws(() => criarGatePendente({ parecerId: "" }), TypeError);
});

test("E1: helper Gate pendente mais recente (RF4 domínio)", () => {
  const a = criarGatePendente({
    parecerId: "PAR-A",
    gateId: "G-A",
    abertoEm: "2026-08-01T08:00:00.000Z"
  });
  const b = criarGatePendente({
    parecerId: "PAR-B",
    gateId: "G-B",
    abertoEm: "2026-08-01T09:00:00.000Z"
  });
  const c = criarGatePendente({
    parecerId: "PAR-C",
    gateId: "G-C",
    abertoEm: "2026-08-01T07:00:00.000Z"
  });
  const resolvido = aplicarDecisaoGate(c, "rejeitado");
  assert.equal(resolvido.ok, true);

  assert.ok(compararGateMaisRecente(b, a) > 0);
  const mais = seleccionarGatePendenteMaisRecente([
    a,
    b,
    resolvido.ok ? resolvido.gate : c
  ]);
  assert.ok(mais);
  assert.equal(mais?.gateId, "G-B");
  assert.equal(seleccionarGatePendenteMaisRecente([]), null);
  assert.equal(
    seleccionarGatePendenteMaisRecente([resolvido.ok ? resolvido.gate : c]),
    null
  );
});

test("E1-CA4: domínio sem I/O, UI, Fila, Classificador ou SDK", () => {
  const src = readFileSync(join(__dirname, "dominio.js"), "utf8");
  assert.equal(src.includes("@cursor/sdk"), false);
  assert.equal(/\bfetch\s*\(/.test(src), false);
  assert.equal(/from\s+["'].*conversa/.test(src), false);
  assert.equal(/from\s+["'].*motorExecucao/.test(src), false);
  assert.equal(/from\s+["'].*classificador/.test(src), false);
  assert.equal(/from\s+["'].*executionQueue/.test(src), false);
  assert.equal(/localStorage|indexedDB|fs\.|http\.|express/.test(src), false);
  assert.equal(/document\.|window\./.test(src), false);
});
