/**
 * DESP-008 — inteligência executiva (condução de missão).
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  ancoraMissaoEmExecucao,
  fechoParcialMissao,
  missaoActiva,
  perguntaIniciativaMissao,
  perguntaPrioridadeMissao
} from "./inteligenciaExecutiva.js";

test("missaoActiva exige objectivo + lastro", () => {
  assert.equal(missaoActiva({ objectivoPrincipal: "MG2" }), false);
  assert.equal(
    missaoActiva({
      objectivoPrincipal: "Usar CEO no MG2",
      proximaAcao: "Validar Sprint 1"
    }),
    true
  );
  assert.equal(
    missaoActiva({
      objectivoPrincipal: "Usar CEO no MG2",
      pendencias: ["Homologar"]
    }),
    true
  );
});

test("iniciativa de missão aponta próxima acção", () => {
  const q = perguntaIniciativaMissao({
    objectivoPrincipal: "Usar CEO no MG2",
    proximaAcao: "Validar Sprint 1",
    pendencias: []
  });
  assert.ok(q);
  assert.match(q, /missão|Validar Sprint|avanço/i);
});

test("âncora quando entrega diverge do objectivo", () => {
  const a = ancoraMissaoEmExecucao({
    objectivoPrincipal: "Usar CEO no MG2",
    entregaCorrente: "arte-outdoor",
    proximaAcao: "Fechar arte",
    pendencias: []
  });
  assert.ok(a);
  assert.match(a, /Missão|MG2|arte-outdoor/i);
});

test("fecho parcial com novo despacho", () => {
  const f = fechoParcialMissao({
    objectivoPrincipal: "Usar CEO no MG2",
    encerramento: { necessitaNovoDespacho: true, actividadeConcluida: true }
  });
  assert.ok(f);
  assert.match(f, /despacho|objectivo/i);
});

test("prioridade ambígua", () => {
  assert.match(
    String(
      perguntaPrioridadeMissao({
        eventoObjectivo: "ambiguo_objetivo",
        objectivoPrincipal: "Usar CEO no MG2"
      })
    ),
    /Prioridade|mantemos|mudamos/i
  );
  assert.equal(
    perguntaPrioridadeMissao({ eventoObjectivo: "continuar" }),
    null
  );
});
