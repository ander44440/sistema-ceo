/**
 * Testes IMP-020 Bloco B4 — C7 metadados + C8 flagNcs (TN-09…12, TR-03, rollback).
 */

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  desligarNcs,
  extrairMetadadosNcs,
  flagNcs,
  fixturePacoteMetodo,
  isNcsAtiva,
  ligarNcs,
  mesclarMetadadosNcs
} from "./index.js";
import { executarDeliberacaoMre } from "../executarDeliberacao.js";
import { criarChamarLlmMock, mapaLlmFluxoFeliz } from "../pipeline/llmMock.js";
import { gerarComunicadoExecutivo } from "../speaker/speakerExecutivo.js";
import { validarParecerExecutivo } from "../parecer/validarParecerExecutivo.js";
import { parecerValidoCompleto } from "../parecer/fixtures.js";

function entradaBase(extra = {}) {
  return {
    mensagem: "Como você decidiria quais demandas priorizar hoje?",
    coaId: "prj-mg2",
    intencao: { id: "deliberar", capacidade: "ia" },
    snapshotPainel: { resumo: "Painel disponível" },
    factosOficiais: [],
    ...extra
  };
}

function depsMock(extra = {}) {
  return {
    chamarLlm: criarChamarLlmMock(mapaLlmFluxoFeliz()),
    ...extra
  };
}

test("C8: flagNcs default off; isNcsAtiva respeita deps", () => {
  assert.equal(flagNcs.ativo, false);
  assert.equal(isNcsAtiva(), false);
  assert.equal(isNcsAtiva({}), false);
  assert.equal(isNcsAtiva({ flagNcs: true }), true);
  assert.equal(isNcsAtiva({ flagNcs: false }), false);
});

test("C7: extrairMetadadosNcs — mínimo natureza + fundamento; null sem pacote", () => {
  assert.equal(extrairMetadadosNcs(null), null);
  assert.equal(extrairMetadadosNcs(undefined), null);
  const m = extrairMetadadosNcs(fixturePacoteMetodo());
  assert.equal(m.naturezaCognitiva, "metodo_de_decisao");
  assert.ok(typeof m.fundamentoNatureza === "string" && m.fundamentoNatureza.length > 0);
  assert.equal(typeof m.confiancaNatureza, "number");
});

test("C7: mesclarMetadadosNcs só com flag on", () => {
  const pacote = fixturePacoteMetodo();
  const off = mesclarMetadadosNcs({ falhaControlada: false }, pacote, false);
  assert.equal(off.naturezaCognitiva, undefined);
  assert.equal(off.falhaControlada, false);
  const on = mesclarMetadadosNcs({ falhaControlada: false }, pacote, true);
  assert.equal(on.naturezaCognitiva, "metodo_de_decisao");
  assert.ok(on.fundamentoNatureza);
});

test("TN-09: flag on → parecer.metadados com naturezaCognitiva + fundamentoNatureza", async () => {
  const out = await executarDeliberacaoMre(entradaBase(), depsMock({ flagNcs: true }));
  assert.equal(out.ok, true);
  assert.ok(out.pacoteNcs);
  assert.equal(out.parecer.metadados.naturezaCognitiva, "metodo_de_decisao");
  assert.ok(
    typeof out.parecer.metadados.fundamentoNatureza === "string" &&
      out.parecer.metadados.fundamentoNatureza.length > 0
  );
  const v = validarParecerExecutivo(out.parecer);
  assert.equal(v.ok, true);
});

test("TN-10: Speaker consome só o parecer — sem canal paralelo NCS", async () => {
  const out = await executarDeliberacaoMre(entradaBase(), depsMock({ flagNcs: true }));
  assert.equal(out.ok, true);
  const r = gerarComunicadoExecutivo(out.parecer, "chat");
  assert.equal(r.ok, true);
  assert.equal(r.comunicado.parecerId, out.parecer.id);
  assert.equal(r.comunicado.referenciaDecisao, out.parecer.decisaoExecutiva.estado);
  assert.equal(r.comunicado.pacoteNcs, undefined);
  assert.equal(r.comunicado.metadados?.naturezaCognitiva, undefined);
  assert.ok(!String(r.comunicado.texto).includes("naturezaCognitiva"));
});

test("TN-11: aprendizado não muta decisão/ação/NCS", async () => {
  const out = await executarDeliberacaoMre(entradaBase(), depsMock({ flagNcs: true }));
  assert.equal(out.ok, true);
  const nat = out.parecer.metadados.naturezaCognitiva;
  const fund = out.parecer.metadados.fundamentoNatureza;
  const estado = out.parecer.decisaoExecutiva.estado;
  const acaoTipo = out.parecer.acao.tipo;

  assert.equal(out.pacoteNcs.naturezaCognitiva, nat);
  assert.equal(out.pipeline.parcial.decisaoExecutiva.estado, estado);
  assert.equal(out.pipeline.parcial.acao.tipo, acaoTipo);
  assert.equal(out.parecer.metadados.naturezaCognitiva, nat);
  assert.equal(out.parecer.metadados.fundamentoNatureza, fund);
  assert.equal(out.pacoteNcs.naturezaCognitiva, "metodo_de_decisao");
});

test("TN-12: flag off (default) → sem classificação automática; sem metadados NCS", async () => {
  assert.equal(flagNcs.ativo, false);
  const out = await executarDeliberacaoMre(entradaBase(), depsMock());
  assert.equal(out.ok, true);
  assert.equal(out.pacoteNcs, null);
  assert.equal(out.parecer.metadados?.naturezaCognitiva, undefined);
  assert.equal(out.parecer.metadados?.fundamentoNatureza, undefined);
  assert.equal(out.pipeline.pacoteNcs, null);
});

test("TR-03: parecer sem metadados NCS continua válido V1–V6", () => {
  const p = parecerValidoCompleto();
  assert.equal(p.metadados?.naturezaCognitiva, undefined);
  const v = validarParecerExecutivo(p);
  assert.equal(v.ok, true);
});

test("Rollback: off → on → off restaura baseline observável", async () => {
  const prev = flagNcs.ativo;
  try {
    desligarNcs();
    const off1 = await executarDeliberacaoMre(entradaBase(), depsMock());
    assert.equal(off1.pacoteNcs, null);
    assert.equal(off1.parecer.metadados?.naturezaCognitiva, undefined);

    ligarNcs();
    assert.equal(flagNcs.ativo, true);
    const on = await executarDeliberacaoMre(entradaBase(), depsMock());
    assert.ok(on.pacoteNcs);
    assert.equal(on.parecer.metadados.naturezaCognitiva, "metodo_de_decisao");

    desligarNcs();
    assert.equal(flagNcs.ativo, false);
    const off2 = await executarDeliberacaoMre(entradaBase(), depsMock());
    assert.equal(off2.pacoteNcs, null);
    assert.equal(off2.parecer.metadados?.naturezaCognitiva, undefined);
  } finally {
    flagNcs.ativo = prev;
  }
});

test("TB4-injetado+flag on: metadados mesmo com pacote injetado", async () => {
  const out = await executarDeliberacaoMre(
    entradaBase(),
    depsMock({ flagNcs: true, pacoteNcs: fixturePacoteMetodo() })
  );
  assert.equal(out.parecer.metadados.naturezaCognitiva, "metodo_de_decisao");
  assert.ok(out.parecer.metadados.fundamentoNatureza);
});

test("TB4-injetado+flag off: políticas via injeção; sem metadados NCS", async () => {
  const out = await executarDeliberacaoMre(
    entradaBase(),
    depsMock({ flagNcs: false, pacoteNcs: fixturePacoteMetodo() })
  );
  assert.equal(out.pacoteNcs.naturezaCognitiva, "metodo_de_decisao");
  assert.equal(out.parecer.metadados?.naturezaCognitiva, undefined);
});
