/**
 * FRENTE 7 — Isolamento VCA no caminho deliberativo (COA/memória/Porta/briefing).
 */
import assert from "node:assert/strict";
import { test, before, after } from "node:test";
import { definirCoaAtivo, obterCoaAtivo, limparCoaAtivo } from "../coaSessao.js";
import { construirContextoSessao } from "../contextoSessao.js";
import { montarMensagensLlm } from "../promptGovernanca.js";
import { montarEntradaMre } from "../../mre/integracaoNucleo.js";
import { capacidadeIa } from "./ia.js";
import { executiveEngine } from "../index.js";
import {
  definirEstadoTopicosSessao,
  resetEstadoTopicosSessao
} from "../../classificadorIntencao/topicosSessao.js";
import { criarTopico } from "../../classificadorIntencao/gestorTopicos.js";

const ISO = "2026-09-07T12:00:00.000Z";
const COA_MG2 = { id: "prj-mg2", nome: "Motoboy Game 2", status: "ativo" };

const memProjecto = {
  projetoAtivo: { id: "prj-mg2", nome: "Motoboy Game 2" },
  pendencias: [{ texto: "Outdoor do Centro", status: "aberta" }],
  proximoPasso: "Fechar outdoor",
  proximasAcoes: [{ texto: "Fechar outdoor" }],
  decisoes: [],
  ultimasAcoes: [],
  projetosAtivos: [{ id: "prj-mg2", nome: "Motoboy Game 2" }]
};

before(() => {
  definirCoaAtivo(COA_MG2);
});

after(() => {
  limparCoaAtivo();
  resetEstadoTopicosSessao();
});

test("E2: montarEntradaMre com coaAtivo null — sem COA/briefing/memória de projecto", () => {
  assert.equal(obterCoaAtivo()?.id, "prj-mg2", "sessão tem COA activo");

  const entrada = montarEntradaMre({
    instrucao: "Quanto é 2+2?",
    coaAtivo: null,
    memoria: () => memProjecto,
    historico: [],
    intencao: { id: "deliberar", capacidade: "ia", classe: "conversa_projeto" }
  });

  assert.equal(entrada.coaAtivo, null);
  assert.equal(entrada.coaId, null);
  assert.equal(entrada.projecaoSubordinada, null);
  assert.equal(entrada.snapshotPainel, null);
  assert.ok(
    !entrada.factosOficiais.some((f) =>
      /Próximo passo:|Pendência:|Painel próximo|outdoor|Motoboy/i.test(f)
    ),
    `factos de projecto não devem entrar: ${entrada.factosOficiais.join(" | ")}`
  );
  assert.doesNotMatch(entrada.mensagem, /Projecção subordinada \(briefing\)/i);
});

test("E2: construirContextoSessao / montarMensagensLlm com coa null", () => {
  assert.equal(obterCoaAtivo()?.id, "prj-mg2");

  const painel = construirContextoSessao({
    memoria: memProjecto,
    coa: null,
    intencao: { id: "deliberar" }
  });
  assert.match(painel, /Projeto ativo: \(nenhum\)/);
  assert.doesNotMatch(painel, /prj-mg2/);

  const msgs = montarMensagensLlm({
    instrucao: "Quanto é 2+2?",
    historico: [],
    memoria: null,
    coa: null,
    intencao: { id: "deliberar", capacidade: "ia" }
  });
  const blob = msgs.map((m) => m.content).join("\n");
  assert.doesNotMatch(blob, /prj-mg2/);
  assert.doesNotMatch(blob, /WorldLab2|COA MG2/i);
  assert.ok(
    !msgs.some(
      (m) =>
        m.role === "system" &&
        /Projecção subordinada|BRIEFING DO PROJETO —/i.test(m.content) &&
        /Motoboy|outdoor|prj-mg2/i.test(m.content)
    ),
    "não deve haver mensagem de briefing do projecto anterior"
  );
  assert.match(blob, /Projeto ativo: \(nenhum\)/);
});

test("E3: controlo negativo — coa objecto preserva projecto", () => {
  const entrada = montarEntradaMre({
    instrucao: "Onde estamos no outdoor?",
    coaAtivo: COA_MG2,
    memoria: () => memProjecto,
    historico: [],
    intencao: { id: "deliberar", capacidade: "ia" }
  });
  assert.equal(entrada.coaAtivo?.id, "prj-mg2");
  assert.ok(
    entrada.factosOficiais.some((f) => /Próximo passo:|Pendência:/i.test(f)) ||
      entrada.projecaoSubordinada != null ||
      entrada.coaId === "prj-mg2"
  );

  const painel = construirContextoSessao({
    memoria: memProjecto,
    coa: COA_MG2,
    intencao: { id: "deliberar" }
  });
  assert.match(painel, /prj-mg2/);
});

test("E2: capacidadeIa sob coaAtivo null não reabre COA nos metadados", async () => {
  assert.equal(obterCoaAtivo()?.id, "prj-mg2");
  const out = await capacidadeIa.executar({
    instrucao: "Explique brevemente o que é um ADR.",
    historico: [],
    coaAtivo: null,
    memoria: () => memProjecto,
    intencao: {
      id: "deliberar",
      capacidade: "ia",
      classe: "conversa_projeto",
      destino: "nucleo_mre"
    },
    validacaoContexto: {
      veredicto: "conhecimento_geral",
      autorizaLastroCsc: false
    }
  });
  assert.equal(out.ok, true);
  assert.equal(out.dados?.coa, null);
  assert.equal(out.dados?.memoria, null);
});

test("E1 regressão: isolamento → C1 (CT-V03 equivalente)", async () => {
  definirEstadoTopicosSessao({
    topicoActivo: criarTopico("outdoor", "usuario", ISO),
    pausas: []
  });
  const out = await executiveEngine.executar(
    {
      texto: "O que é um ADR?",
      historico: [
        { papel: "usuario", texto: "Onde estamos no outdoor do MG2?" },
        { papel: "ceo", texto: "Outdoor em curso; priorizar lateral." },
        { papel: "usuario", texto: "O que é um ADR?" }
      ]
    },
    {}
  );
  assert.equal(out.dados?.validacaoContexto?.autorizaLastroCsc, false);
  assert.equal(out.dados?.classificacao?.classe, "conhecimento_geral");
  assert.notEqual(out.dados?.classificacao?.classe, "conversa_projeto");
});
