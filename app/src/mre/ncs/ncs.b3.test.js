/**
 * Testes IMP-020 Bloco B3 — C5 portador + C6 políticas (TN-06…08).
 */

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  anexarPacoteNcs,
  fixturePacoteDecisaoOperacional,
  fixturePacoteMetodo,
  montarPacoteNcs,
  tentarSobrescreverNatureza
} from "./index.js";
import { executarPipeline07 } from "../pipeline/orquestrador.js";
import { criarChamarLlmMock, mapaLlmFluxoFeliz } from "../pipeline/llmMock.js";
import { executarDeliberacaoMre } from "../executarDeliberacao.js";

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

test("TN-06: tentativa de sobrescrever naturezaCognitiva falha (imutabilidade)", () => {
  const pacote = montarPacoteNcs({ naturezaCognitiva: "metodo_de_decisao" });
  const entrada = anexarPacoteNcs(entradaBase(), pacote);
  const r = tentarSobrescreverNatureza(entrada.pacoteNcs, "decisao_operacional");
  assert.equal(r.ok, false);
  assert.equal(entrada.pacoteNcs.naturezaCognitiva, "metodo_de_decisao");
  assert.throws(() =>
    anexarPacoteNcs(entrada, montarPacoteNcs({ naturezaCognitiva: "planejamento" }))
  );
});

test("TN-07: metodo_de_decisao + factosUsados [] não obriga solicitar_dados só por inventário", async () => {
  const pacote = fixturePacoteMetodo();
  const r = await executarPipeline07(entradaBase({ factosOficiais: [] }), {
    chamarLlm: criarChamarLlmMock({
      ...mapaLlmFluxoFeliz(),
      "6_decisao": {
        estado: "solicitar_dados",
        recomendacao: "Pedir a lista das cinco demandas",
        alternativas: [],
        justificativa: "Faltam as demandas listadas; princípios de transparência."
      }
    }),
    pacoteNcs: pacote
  });
  assert.equal(r.falhaControlada, false);
  assert.equal(r.pacoteNcs.naturezaCognitiva, "metodo_de_decisao");
  assert.notEqual(r.parcial.decisaoExecutiva.estado, "solicitar_dados");
  assert.equal(r.parcial.decisaoExecutiva.estado, "aprovar");
  assert.equal(r.parcial.shortCircuit, false);
  assert.ok(!r.parcial.lacunas.some((l) => /itens|alternativas concretas/i.test(l)));
});

test("TN-08: decisao_operacional sem itens materiais pode solicitar_dados", async () => {
  const pacote = fixturePacoteDecisaoOperacional();
  const r = await executarPipeline07(
    entradaBase({
      mensagem: "Qual das opções devo executar?",
      factosOficiais: []
    }),
    {
      chamarLlm: criarChamarLlmMock(mapaLlmFluxoFeliz()),
      pacoteNcs: pacote
    }
  );
  assert.equal(r.parcial.shortCircuit, true);
  assert.equal(r.parcial.decisaoExecutiva.estado, "solicitar_dados");
  assert.ok(
    r.parcial.lacunas.some((l) => /itens|alternativas concretas/i.test(l))
  );
});

test("TB3-topo: ordem 0–7 inalterada com Pacote metodo", async () => {
  const r = await executarPipeline07(entradaBase(), {
    chamarLlm: criarChamarLlmMock(mapaLlmFluxoFeliz()),
    pacoteNcs: fixturePacoteMetodo()
  });
  assert.deepEqual(r.ordem, ["0", "1", "2", "3", "4", "5a", "5b", "6", "7"]);
});

test("TB3-feliz: decisao_operacional com itens — fluxo feliz", async () => {
  const r = await executarPipeline07(
    entradaBase({
      mensagem:
        "Qual das cinco devo fazer? 1) pagamento 2) outdoor 3) gate 4) docs 5) fila",
      factosOficiais: ["Pagamento", "Outdoor"]
    }),
    {
      chamarLlm: criarChamarLlmMock(mapaLlmFluxoFeliz()),
      pacoteNcs: fixturePacoteDecisaoOperacional()
    }
  );
  assert.equal(r.falhaControlada, false);
  assert.equal(r.parcial.shortCircuit, false);
  assert.equal(r.parcial.decisaoExecutiva.estado, "aprovar");
});

test("TB3-deliberacao: pacote injetado propaga; flag off → sem metadados NCS", async () => {
  const out = await executarDeliberacaoMre(entradaBase(), {
    chamarLlm: criarChamarLlmMock(mapaLlmFluxoFeliz()),
    pacoteNcs: fixturePacoteMetodo(),
    flagNcs: false
  });
  assert.equal(out.ok, true);
  assert.equal(out.pacoteNcs.naturezaCognitiva, "metodo_de_decisao");
  assert.equal(out.parecer.metadados?.naturezaCognitiva, undefined);
  assert.equal(out.pipeline.pacoteNcs.naturezaCognitiva, "metodo_de_decisao");
});
