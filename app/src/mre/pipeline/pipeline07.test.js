/**
 * Testes IMP-012 — Pipeline MRE estágios 0–7 (T12-01…T12-10).
 */

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  assertTransicao,
  criarChamarLlmMock,
  executarDeliberacaoMre,
  executarPipeline07,
  mapaLlmFluxoFeliz,
  montarParecerExecutivo,
  stubAprendizadoNeutro,
  validarParecerExecutivo
} from "../index.js";

function entradaBase(extra = {}) {
  return {
    mensagem: "Devemos adiar o outdoor lateral e focar no pagamento?",
    coaId: "coa-mg2",
    intencao: { id: "deliberar" },
    snapshotPainel: {
      resumo: "COA MG2; próximo passo: pagamento; outdoor pendente",
      proximoPasso: "Integração pagamento",
      estado: "ativo"
    },
    factosOficiais: ["Pagamento é prioridade do dia", "Outdoor estava em job cancelado"],
    ...extra
  };
}

test("T12-01: fluxo feliz → blocos 0–7 e parecer válido (com stub aprendizado)", async () => {
  const ordemEstagios = [];
  const r = await executarPipeline07(entradaBase(), {
    chamarLlm: criarChamarLlmMock(mapaLlmFluxoFeliz()),
    ordemEstagios
  });
  assert.equal(r.falhaControlada, false);
  assert.ok(r.parcial.diagnostico);
  assert.ok(r.parcial.acao);
  assert.equal(r.parcial.decisaoExecutiva.estado, "aprovar");
  assert.ok(["orientar", "registar", "despachar"].includes(r.parcial.acao.tipo));

  const parecer = montarParecerExecutivo(r.parcial, stubAprendizadoNeutro());
  const v = validarParecerExecutivo(parecer);
  assert.equal(v.ok, true, JSON.stringify(v.violacoes, null, 2));
});

test("T12-02: lacunas materiais → solicitar_dados + perguntar", async () => {
  const r = await executarPipeline07(
    entradaBase({
      coaId: null,
      snapshotPainel: null,
      factosOficiais: [],
      shortCircuit: true,
      mensagem: "O que faço com o outdoor?"
    }),
    { chamarLlm: criarChamarLlmMock(mapaLlmFluxoFeliz()) }
  );
  assert.equal(r.parcial.decisaoExecutiva.estado, "solicitar_dados");
  assert.equal(r.parcial.acao.tipo, "perguntar");
  assert.ok(r.parcial.lacunas.length > 0);
});

test("T12-03: 5a e 5b concluem antes do 6", async () => {
  const ordemEstagios = [];
  await executarPipeline07(entradaBase(), {
    chamarLlm: criarChamarLlmMock(mapaLlmFluxoFeliz()),
    ordemEstagios
  });
  const i6 = ordemEstagios.indexOf("6");
  assert.ok(ordemEstagios.indexOf("5a") < i6);
  assert.ok(ordemEstagios.indexOf("5b") < i6);
});

test("T12-04: salto de estágio rejeitado (T1)", () => {
  assert.throws(() => assertTransicao([], "6"), /Transição ilegal/);
  assert.throws(() => assertTransicao(["0", "1"], "4"), /Transição ilegal/);
  assert.doesNotThrow(() => assertTransicao(["0", "1", "2", "3", "4"], "5a"));
  assert.doesNotThrow(() => assertTransicao(["0", "1", "2", "3", "4", "5a", "5b"], "6"));
});

test("T12-05: dossier sem COA/Painel — lacuna sem factos inventados", async () => {
  const r = await executarPipeline07(
    entradaBase({
      coaId: null,
      snapshotPainel: null,
      factosOficiais: [],
      shortCircuit: true
    }),
    { chamarLlm: criarChamarLlmMock(mapaLlmFluxoFeliz()) }
  );
  assert.ok(r.parcial.lacunas.some((l) => /COA|Painel/i.test(l)));
  assert.equal(r.parcial.dossier.factosUsados.length, 0);
  assert.match(r.parcial.dossier.resumoPainel, /Sem painel|Indisponível|ausente/i);
});

test("T12-06: enum ilegal no estágio 6 → falha controlada", async () => {
  const mapa = mapaLlmFluxoFeliz({
    "6_decisao": { estado: "talvez", recomendacao: "x", alternativas: [], justificativa: "y" }
  });
  const r = await executarPipeline07(entradaBase(), {
    chamarLlm: criarChamarLlmMock(mapa)
  });
  assert.equal(r.falhaControlada, true);
  assert.ok(["solicitar_dados", "adiar"].includes(r.parcial.decisaoExecutiva.estado));
  assert.ok(!["talvez"].includes(r.parcial.decisaoExecutiva.estado));
});

test("T12-07: delegar → despachar + job", async () => {
  const mapa = mapaLlmFluxoFeliz({
    "6_decisao": {
      estado: "delegar",
      recomendacao: "Delegar outdoor à fila",
      alternativas: [],
      justificativa:
        "Princípio Priorizar uso diário no MG2 (ADR-015); risco medio aceite; delegar execução."
    }
  });
  const r = await executarPipeline07(entradaBase(), {
    chamarLlm: criarChamarLlmMock(mapa)
  });
  assert.equal(r.falhaControlada, false);
  assert.equal(r.parcial.decisaoExecutiva.estado, "delegar");
  assert.equal(r.parcial.acao.tipo, "despachar");
  assert.ok(r.parcial.acao.job?.titulo);
  assert.ok(r.parcial.acao.job?.descricao);
});

test("T12-08: short-circuit T4 → análise/riscos mínimos + solicitar_dados", async () => {
  const r = await executarPipeline07(
    entradaBase({ shortCircuit: true, coaId: null, snapshotPainel: null }),
    { chamarLlm: criarChamarLlmMock(mapaLlmFluxoFeliz()) }
  );
  assert.equal(r.parcial.shortCircuit, true);
  assert.ok(r.parcial.analise);
  assert.ok(Array.isArray(r.parcial.riscos));
  assert.ok(Array.isArray(r.parcial.oportunidades));
  assert.equal(r.parcial.decisaoExecutiva.estado, "solicitar_dados");
});

test("T12-09: timeout LLM → retry e falha controlada", async () => {
  const r = await executarPipeline07(entradaBase(), {
    chamarLlm: criarChamarLlmMock(mapaLlmFluxoFeliz(), {
      estagioFalhar: "4_analise",
      falharVezes: 2,
      mensagemErro: "Timeout LLM simulado"
    })
  });
  assert.equal(r.falhaControlada, true);
  assert.match(String(r.erro || r.parcial.analise), /Timeout|Falha|falha/i);
});

test("T12-10: saída sem mensagem ao utilizador", async () => {
  const r = await executarPipeline07(entradaBase(), {
    chamarLlm: criarChamarLlmMock(mapaLlmFluxoFeliz())
  });
  assert.equal(r.parcial.mensagemUsuario, undefined);
  assert.equal(r.parcial.textoParaUtilizador, undefined);
  assert.equal(r.parcial.comunicado, undefined);
});

test("T12-int: deliberação completa usa validador IMP-011", async () => {
  const out = await executarDeliberacaoMre(entradaBase(), {
    chamarLlm: criarChamarLlmMock(mapaLlmFluxoFeliz())
  });
  assert.equal(out.ok, true, JSON.stringify(out.validacao?.violacoes, null, 2));
  assert.equal(out.validacao.ok, true);
});

test("T12-prioridade: LLM 'média' no job é saneada para 'normal' (V1)", async () => {
  const { normalizarPrioridadeJob } = await import("./estagios.js");
  assert.equal(normalizarPrioridadeJob("média"), "normal");
  assert.equal(normalizarPrioridadeJob("media"), "normal");
  assert.equal(normalizarPrioridadeJob("alta"), "alta");
  assert.equal(normalizarPrioridadeJob("baixa"), "baixa");
  assert.equal(normalizarPrioridadeJob("xyz"), "normal");
  assert.equal(normalizarPrioridadeJob(undefined), "normal");

  const out = await executarDeliberacaoMre(
    entradaBase({
      mensagem:
        "entre neste repositório (https://agents.craft.do/) e avaliae o quanto isso seria util para nossos projetos"
    }),
    {
      chamarLlm: criarChamarLlmMock({
        ...mapaLlmFluxoFeliz(),
        "6_decisao": {
          estado: "delegar",
          recomendacao: "Delegar avaliação do Craft Agents",
          alternativas: ["Monitorar", "Adiar"],
          justificativa:
            "Princípios de cautela e transparência; riscos de dependência externa."
        },
        "7_acao_job": {
          descricao: "Despachar avaliação Craft Agents",
          job: {
            titulo: "Avaliar Craft Agents",
            descricao: "Parecer de utilidade",
            prioridade: "média"
          }
        }
      })
    }
  );
  assert.equal(out.ok, true, JSON.stringify(out.validacao?.violacoes, null, 2));
  assert.equal(out.parecer.acao.job.prioridade, "normal");
  assert.equal(out.validacao.ok, true);
});

test("T12-V5: justificativa sem riscos/princípios é saneada (Scrum/Kanban)", async () => {
  const { assegurarJustificativaV5 } = await import("./estagios.js");
  const san = assegurarJustificativaV5(
    "A urgência alta exige uma análise cuidadosa das abordagens.",
    {
      riscos: [{ nivel: "alto", texto: "Escolha inadequada" }],
      principiosAplicados: ["Respeito absoluto ao tempo do utilizador"],
      oportunidades: []
    }
  );
  assert.match(san, /riscos/i);

  const out = await executarDeliberacaoMre(
    entradaBase({
      mensagem:
        "Compare Scrum e Kanban para uma equipe de cinco desenvolvedores e recomende qual abordagem adotar."
    }),
    {
      chamarLlm: criarChamarLlmMock({
        ...mapaLlmFluxoFeliz(),
        "6_decisao": {
          estado: "delegar",
          recomendacao: "Comparar Scrum e Kanban com a equipe",
          alternativas: ["Adotar Scrum", "Adotar Kanban"],
          justificativa:
            "A urgência alta e a necessidade de uma decisão rápida exigem uma análise cuidadosa das abordagens, garantindo produtividade."
        },
        "7_acao_job": {
          descricao: "Análise comparativa Scrum vs Kanban",
          job: {
            titulo: "Comparar Scrum e Kanban",
            descricao: "Recomendação para equipe de 5",
            prioridade: "alta"
          }
        }
      })
    }
  );
  assert.equal(out.ok, true, JSON.stringify(out.validacao?.violacoes, null, 2));
  assert.match(out.parecer.decisaoExecutiva.justificativa, /riscos/i);
});
