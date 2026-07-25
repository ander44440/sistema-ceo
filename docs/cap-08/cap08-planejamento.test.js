"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");
const Analise = require("./analise-executiva.js");
const Planejamento = require("./planejamento-executivo.js");
const Memoria = require("../cap-05/memoria-organizacional.js");
const EstadoDia = require("../cap-05/estado-dia.js");
const Conducao = require("../cap-05/conducao-executiva.js");

function criarStorage() {
  const dados = new Map();
  return {
    getItem(chave) {
      return dados.has(chave) ? dados.get(chave) : null;
    },
    setItem(chave, valor) {
      dados.set(chave, String(valor));
    }
  };
}

function montarPilha() {
  const storage = criarStorage();
  const memoria = Memoria.criar(storage);
  const estadoDia = EstadoDia.criar(storage);
  memoria.inicializar();
  estadoDia.inicializar();
  const conducao = Conducao.criar({ memoria, estadoDia });
  conducao.montarContexto({
    tema: "taxa",
    motivoPedido: "Planejar CAP-08"
  });
  conducao.proporProximoPasso("Codificar taxa zerada");
  const l = Analise.criar({ memoria, estadoDia, conducao });
  const m = Planejamento.criar({ analise: l });
  return { memoria, estadoDia, conducao, l, m };
}

test("RF-01/RF-02: análise contém os sete elementos obrigatórios", () => {
  const { l } = montarPilha();
  const a = l.montarAnalise({ objetivo: "Definir taxa" });
  assert.ok(a.contexto);
  assert.ok(a.lacunas);
  assert.ok(a.riscos);
  assert.ok(a.dependencias);
  assert.ok(a.alternativas);
  assert.ok(a.justificativa);
  assert.ok(a.confianca);
  assert.ok(a.id.startsWith("ANL-"));
});

test("RF-03: suficiência declara incertezas, confiança e justificativa de timing", () => {
  const { l } = montarPilha();
  const a = l.montarAnalise({
    objetivo: "Definir taxa",
    suficiencia: "suficiente",
    incertezasRemanescentes: ["Impacto de churn ainda não medido"],
    justificativaTiming: "Há base para recomendar agora apesar do churn"
  });
  assert.equal(a.suficiencia, "suficiente");
  assert.match(String(a.incertezasRemanescentes), /churn/i);
  assert.ok(a.confianca);
  assert.match(a.justificativaTiming, /recomendar agora/i);
});

test("RF-03: insuficiência explícita é válida e bloqueia recomendação", () => {
  const { l, m } = montarPilha();
  const a = l.montarAnalise({
    objetivo: "Tema sem base",
    forcarInsuficiencia: true
  });
  assert.equal(a.suficiencia, "insuficiente");
  assert.equal(a.justificativaTiming, null);
  assert.throws(
    () => m.recomendar({ analise: a }),
    /bloqueia recomendação|insuficiente/i
  );
});

test("RF-04: recomendação só após suficiência e antes do plano", () => {
  const { l, m } = montarPilha();
  const a = l.montarAnalise({ objetivo: "Taxa" });
  const r = m.recomendar({
    analise: a,
    enunciado: "Adotar taxa zerada no piloto"
  });
  assert.equal(r.analiseId, a.id);
  assert.equal(r.vigencia, "proposta");
  const p = m.planejar({ recomendacao: r });
  assert.equal(p.recomendacaoId, r.id);
  assert.equal(p.analiseId, a.id);
});

test("RF-05: plano coordenado com passos e rastreio", () => {
  const { l, m } = montarPilha();
  const a = l.montarAnalise({ objetivo: "Taxa" });
  const r = m.recomendar({ analise: a, enunciado: "Piloto de taxa" });
  const p = m.planejar({
    recomendacaoId: r.id,
    passos: ["Especificar regra", "Implementar", "Validar com patrocinador"]
  });
  assert.equal(p.passos.length, 3);
  assert.ok(p.ordemOuDependencias);
  assert.equal(p.vigencia, "proposta");
});

test("RF-06/RNF-03: fronteira de execução reafirmada", () => {
  const { l, m } = montarPilha();
  const a = l.montarAnalise({ objetivo: "Taxa" });
  const r = m.recomendar({ analise: a });
  const p = m.planejar({ recomendacao: r });
  assert.match(a.fronteiraExecucao, /fora do CEO/);
  assert.match(r.fronteiraExecucao, /fora/);
  assert.match(p.fronteiraExecucao, /não executa o MG2/);
});

test("RF-07: recomendação e plano nascem como proposta", () => {
  const { l, m } = montarPilha();
  const a = l.montarAnalise({ objetivo: "Taxa" });
  const r = m.recomendar({ analise: a });
  const p = m.planejar({ recomendacao: r });
  assert.equal(r.vigencia, "proposta");
  assert.equal(p.vigencia, "proposta");
  assert.match(r.avisoVigencia, /não vigora/i);
  assert.match(p.avisoVigencia, /não vigora/i);
});

test("RF-08: L/M não alteram memória nem estado", () => {
  const { memoria, estadoDia, l, m } = montarPilha();
  const antesMem = JSON.stringify(memoria.listar());
  const antesEst = JSON.stringify(estadoDia.obter());
  const a = l.montarAnalise({ objetivo: "Taxa" });
  const r = m.recomendar({ analise: a });
  m.planejar({ recomendacao: r });
  assert.equal(JSON.stringify(memoria.listar()), antesMem);
  assert.equal(JSON.stringify(estadoDia.obter()), antesEst);
});

test("RF-08/D2: fachada somente leitura bloqueia escrita em H/I/F", () => {
  const { memoria, estadoDia, conducao } = montarPilha();
  const leitura = Analise.somenteLeitura({ memoria, estadoDia, conducao });
  assert.throws(() => leitura.memoria.registrar({}), /somente leitura/);
  assert.throws(() => leitura.estadoDia.atualizar({}), /somente leitura/);
  assert.throws(() => leitura.conducao.confirmar(), /somente leitura/);
});

test("RF-09: cadeia objetivo → análise → recomendação → plano rastreável", () => {
  const { l, m } = montarPilha();
  const a = l.montarAnalise({ objetivo: "Taxa zerada" });
  const r = m.recomendar({ analiseId: a.id, enunciado: "Piloto" });
  const p = m.planejar({ recomendacaoId: r.id });
  assert.equal(l.obterAnalise(p.analiseId).id, a.id);
  assert.equal(m.obterRecomendacao(p.recomendacaoId).analiseId, a.id);
  assert.equal(p.analiseId, a.id);
});

test("cadeia CTO: Analisar → Suficiência → Recomendar → Planejar", () => {
  const { l, m } = montarPilha();
  const a = l.montarAnalise({ objetivo: "Taxa" });
  assert.ok(["suficiente", "insuficiente"].includes(a.suficiencia));
  if (a.suficiencia === "suficiente") {
    const r = m.recomendar({ analise: a });
    const p = m.planejar({ recomendacao: r });
    assert.ok(p.id.startsWith("PLN-"));
  }
});
