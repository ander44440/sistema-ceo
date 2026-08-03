/**
 * B1 — factos do Briefing Curado na entrada MRE (camada de contexto).
 */
import test from "node:test";
import assert from "node:assert/strict";
import { montarEntradaMre } from "./integracaoNucleo.js";
import { obterFactosBriefingProjeto } from "../executiveEngine/briefingsProjeto.js";

test("B1: obterFactosBriefingProjeto devolve factos MG2", () => {
  const factos = obterFactosBriefingProjeto({ id: "prj-mg2", nome: "Motoboy Game 2" });
  assert.ok(factos.length >= 5);
  const blob = factos.join(" ");
  assert.match(blob, /WorldLab2/i);
  assert.match(blob, /140\s*m|performance|perf/i);
  assert.match(blob, /outdoor/i);
});

test("B1: montarEntradaMre injeta factos do briefing sem COA vazio", () => {
  const entrada = montarEntradaMre({
    instrucao: "O que sabes sobre este projeto?",
    coaAtivo: { id: "prj-mg2", nome: "Motoboy Game 2" },
    memoria: () => ({ proximoPasso: "Validar Sprint 1", pendencias: [] }),
    intencao: { id: "deliberar", capacidade: "ia" }
  });
  assert.equal(entrada.coaId, "prj-mg2");
  assert.ok(entrada.factosOficiais.length >= 5);
  const blob = entrada.factosOficiais.join("\n");
  assert.match(blob, /WorldLab2/i);
  assert.match(blob, /outdoor/i);
  assert.match(blob, /Validar Sprint 1/);
  assert.ok(entrada.snapshotPainel?.resumo);
  assert.match(String(entrada.snapshotPainel.resumo), /Briefing COA|WorldLab2/i);
  assert.match(entrada.mensagem, /Briefing Curado|factosOficiais/i);
});

test("B1: sem COA conhecido — sem factos de briefing", () => {
  const entrada = montarEntradaMre({
    instrucao: "olá",
    coaAtivo: { id: "outro", nome: "Outro" },
    memoria: () => null
  });
  assert.ok(!entrada.factosOficiais.some((f) => /WorldLab2/i.test(f)));
});
