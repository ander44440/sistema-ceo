/**
 * C5 — falha ENUM_ILEGAL / pipeline não apaga reorientação explícita de handoff.
 */
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import {
  ehReorientacaoExplicitaHandoffCto,
  montarFalhaControlada
} from "./pipeline/estagios.js";
import { executarPipeline07 } from "./pipeline/orquestrador.js";
import { criarChamarLlmMock, mapaLlmFluxoFeliz } from "./pipeline/llmMock.js";
import { executarRotaDeliberativa } from "./integracaoNucleo.js";
import { criarPublicadorFilaMemoria } from "../motorExecucao/ponteParecerJob.js";
import { naturalizarRespostaNucleo } from "../conversacaoNatural/index.js";

const MSG_C5 =
  "Pare. Reoriente as tarefas: a única tarefa agora é preparar o handoff ao CTO com critério de pronto, sem deliberar o outdoor.";

describe("C5 detector reorientação handoff", () => {
  test("detecta T2 homologado", () => {
    assert.equal(ehReorientacaoExplicitaHandoffCto(MSG_C5), true);
  });

  test("não força handoff em deliberação genérica", () => {
    assert.equal(
      ehReorientacaoExplicitaHandoffCto(
        "Precisamos priorizar o outdoor e o orçamento desta sprint."
      ),
      false
    );
  });

  test("não basta mencionar handoff isolado", () => {
    assert.equal(
      ehReorientacaoExplicitaHandoffCto("Como funciona o handoff na fila?"),
      false
    );
  });
});

describe("C5 montarFalhaControlada preserva orientação", () => {
  test("ENUM/pipeline + handoff explícito → monitorar com handoff/critério (sem Falha técnica)", () => {
    const falha = montarFalhaControlada(
      { mensagem: MSG_C5 },
      "Enum ilegal no estágio 6: modificar",
      []
    );
    assert.equal(falha._recuperacaoOrientacaoExplicita, true);
    assert.equal(falha.decisaoExecutiva.estado, "aprovar");
    assert.equal(falha.lacunas.length, 0);
    assert.match(falha.analise, /handoff ao CTO/i);
    assert.match(falha.analise, /crit[eé]rio de pronto/i);
    assert.match(falha.decisaoExecutiva.recomendacao, /crit[eé]rio de pronto/i);
    assert.doesNotMatch(falha.analise, /Falha t[eé]cnica no racioc[ií]nio/i);
    assert.doesNotMatch(
      falha.decisaoExecutiva.recomendacao,
      /Solicitar dados ou nova tentativa/i
    );
    assert.equal(falha.acao.job, null);
    assert.match(falha.analise, /[Nn][aã]o delibero o outdoor/i);
    assert.doesNotMatch(
      falha.analise,
      /priorizar (o )?outdoor|continuar.*outdoor/i
    );
  });

  test("falha genérica (sem handoff) mantém solicitar_dados / Falha técnica", () => {
    const falha = montarFalhaControlada(
      { mensagem: "Priorize o outdoor desta semana." },
      "Enum ilegal no estágio 6: modificar",
      []
    );
    assert.equal(falha._recuperacaoOrientacaoExplicita, undefined);
    assert.equal(falha.decisaoExecutiva.estado, "solicitar_dados");
    assert.ok(falha.lacunas.includes("Falha técnica no raciocínio"));
  });
});

describe("C5 pipeline ENUM_ILEGAL + handoff", () => {
  test("estado modificar ilegal → recuperação handoff (não solicitar_dados)", async () => {
    const mapa = mapaLlmFluxoFeliz({
      "6_decisao": {
        estado: "modificar",
        recomendacao: "Modificar o outdoor",
        alternativas: [],
        justificativa: "x"
      }
    });
    const r = await executarPipeline07(
      {
        mensagem: MSG_C5,
        coaId: "coa-c5-teste",
        snapshotPainel: { resumo: "sessão de teste", estado: "ativo" },
        factosOficiais: ["sessão activa de teste"]
      },
      { chamarLlm: criarChamarLlmMock(mapa) }
    );
    assert.equal(r.falhaControlada, true);
    assert.equal(r.parcial._recuperacaoOrientacaoExplicita, true);
    assert.equal(r.parcial.decisaoExecutiva.estado, "aprovar");
    assert.match(String(r.parcial.analise || ""), /handoff/i);
    assert.match(String(r.parcial.analise || ""), /crit[eé]rio de pronto/i);
    assert.doesNotMatch(
      String(r.parcial.analise || ""),
      /Falha t[eé]cnica no racioc[ií]nio/i
    );
    assert.equal(r.parcial.acao?.job, null);
  });

  test("T12-06 regressão: enum ilegal sem handoff → solicitar_dados", async () => {
    const mapa = mapaLlmFluxoFeliz({
      "6_decisao": {
        estado: "talvez",
        recomendacao: "x",
        alternativas: [],
        justificativa: "y"
      }
    });
    const r = await executarPipeline07(
      {
        mensagem: "Decidir prioridade do outdoor vs pagamento",
        coaId: "coa-t",
        snapshotPainel: { resumo: "ok" },
        factosOficiais: ["facto"]
      },
      { chamarLlm: criarChamarLlmMock(mapa) }
    );
    assert.equal(r.falhaControlada, true);
    assert.ok(
      ["solicitar_dados", "adiar"].includes(r.parcial.decisaoExecutiva.estado)
    );
    assert.equal(r.parcial._recuperacaoOrientacaoExplicita, undefined);
  });
});

describe("C5 e2e rota deliberativa + CN", () => {
  test("H01/H02: prosa final aceita handoff e critério; H03/H04 outdoor/jobs", async () => {
    const pub = criarPublicadorFilaMemoria();
    const mapa = mapaLlmFluxoFeliz({
      "4_analise": {
        analise: "Continuar deliberação sobre priorizar outdoor."
      },
      "6_decisao": {
        estado: "modificar",
        recomendacao: "Modificar priorização do outdoor",
        alternativas: [],
        justificativa: "enum ilegal no harness"
      }
    });
    const out = await executarRotaDeliberativa(
      {
        instrucao: MSG_C5,
        intencao: { id: "deliberar", capacidade: "ia", classe: "conversa_projeto" },
        // Homologação C5: autorizaLastroCsc=true → path com COA (não isolamento C3)
        coaAtivo: { id: "coa-c5-teste", nome: "Sessão C5" },
        memoria: () => ({
          projetoAtivo: { id: "coa-c5-teste", nome: "Sessão C5" },
          pendencias: [],
          proximasAcoes: [],
          proximoPasso: null
        })
      },
      {
        chamarLlm: criarChamarLlmMock(mapa),
        publicarJob: pub.publicarJob.bind(pub)
      }
    );
    const nat = naturalizarRespostaNucleo(
      {
        ok: true,
        mensagem: out.mensagem,
        modo: out.modo || "nucleo_mre",
        dados: out.dados || {},
        intencao: { id: "deliberar", capacidade: "ia" }
      },
      { texto: MSG_C5, intencao: { id: "deliberar", capacidade: "ia" } }
    );
    const msg = String(nat.mensagem || out.mensagem || "");
    assert.match(msg, /handoff/i);
    assert.match(msg, /CTO|crit[eé]rio de pronto/i);
    assert.doesNotMatch(msg, /preciso de mais dados/i);
    assert.doesNotMatch(msg, /Falha t[eé]cnica no racioc[ií]nio/i);
    assert.doesNotMatch(msg, /priorizar (o )?outdoor|continuar.*delibera/i);
    assert.equal(pub.jobs.length, 0);
    assert.doesNotMatch(msg, /job-[a-z0-9-]{6,}|Painel executivo:|COA id:/i);
  });
});
