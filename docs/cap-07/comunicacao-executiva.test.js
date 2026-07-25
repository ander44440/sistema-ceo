"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");
const path = require("node:path");
const Comunicacao = require("./comunicacao-executiva.js");
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
    motivoPedido: "Validar comunicação CAP-07"
  });
  conducao.proporProximoPasso("Codificar taxa zerada");
  const k = Comunicacao.criar({ memoria, estadoDia, conducao });
  return { memoria, estadoDia, conducao, k, storage };
}

test("RF-01: mensagem sempre traz síntese não vazia antes do detalhe", () => {
  const { k } = montarPilha();
  const msg = k.montarMensagem({ tipo: "recomendacao" });
  assert.ok(msg.sintese);
  assert.equal(msg.detalhe, null);
  assert.ok(msg.sintese.length <= Comunicacao.LIMITE_SINTESE);
});

test("RF-02: detalhe só aparece após expansão sob demanda", () => {
  const { k } = montarPilha();
  const msg = k.montarMensagem({ tipo: "contexto" });
  assert.equal(msg.detalhe, null);
  const exp = k.expandirDetalhe(msg.id);
  assert.ok(exp.detalhe);
  assert.equal(exp.detalheExpandido, true);
});

test("RF-03: tipos de interação distintos produzem mensagens distinguíveis", () => {
  const { k } = montarPilha();
  const a = k.montarMensagem({ tipo: "autoridade" });
  const r = k.montarMensagem({ tipo: "recomendacao" });
  const f = k.montarMensagem({ tipo: "feedback", feedback: "Proposta confirmada" });
  assert.notEqual(a.sintese, r.sintese);
  assert.match(a.sintese, /autoridade|confirmar/i);
  assert.match(r.sintese, /Recomendação|vigência/i);
  assert.match(f.sintese, /Feedback/i);
});

test("RF-04: ausência explícita quando não há base", () => {
  const k = Comunicacao.criar({});
  const msg = k.montarMensagem({
    tipo: "ausencia",
    insumos: { contextoAtivo: "Motoboy Game 2 (MG2)" }
  });
  assert.equal(msg.transparencia, "ausencia");
  assert.match(msg.sintese, /^Ausência explícita/);
});

test("RF-05 / D2: K bloqueia escrita em H, I e F", () => {
  const { memoria, estadoDia, conducao } = montarPilha();
  const leitura = Comunicacao.somenteLeitura({
    memoria,
    estadoDia,
    conducao
  });

  assert.throws(() => leitura.memoria.registrar({}), /somente leitura/);
  assert.throws(() => leitura.estadoDia.atualizar({}), /somente leitura/);
  assert.throws(() => leitura.conducao.confirmar(), /somente leitura/);
  assert.throws(() => leitura.conducao.montarContexto({}), /somente leitura/);

  // leituras permanecem disponíveis
  assert.equal(leitura.memoria.listar().status, "encontrado");
  assert.equal(leitura.estadoDia.obter().status, "encontrado");
  assert.ok(leitura.conducao.obterPacoteAtual());
});

test("RF-05: montarMensagem não altera estado nem memória", () => {
  const { memoria, estadoDia, k } = montarPilha();
  const antesMem = JSON.stringify(memoria.listar());
  const antesEst = JSON.stringify(estadoDia.obter());
  k.montarMensagem({ tipo: "recomendacao" });
  k.expandirDetalhe("MSG-001");
  assert.equal(JSON.stringify(memoria.listar()), antesMem);
  assert.equal(JSON.stringify(estadoDia.obter()), antesEst);
});

test("RF-06: recomendação comunica proposta sem vigência", () => {
  const { k } = montarPilha();
  const msg = k.montarMensagem({ tipo: "recomendacao" });
  assert.equal(msg.vigencia, "proposta");
  assert.match(msg.avisoVigencia, /não vigora até confirmação/i);
});

test("RNF-04: toda mensagem reafirma fronteira de execução", () => {
  const { k } = montarPilha();
  const msg = k.montarMensagem({ tipo: "contexto" });
  assert.match(msg.fronteiraExecucao, /fora do CEO/);
});

test("contrato Mensagem contém campos obrigatórios da ARQ-010", () => {
  const { k } = montarPilha();
  const msg = k.montarMensagem({ tipo: "recomendacao" });
  assert.ok(msg.id);
  assert.ok(msg.tipo);
  assert.ok(msg.sintese);
  assert.ok(msg.transparencia);
  assert.ok(msg.vigencia);
  assert.ok(Array.isArray(msg.fontes));
  assert.ok(msg.fontes.length > 0);
});

test("tipo inválido é rejeitado", () => {
  const { k } = montarPilha();
  assert.throws(() => k.montarMensagem({ tipo: "chat" }), /Tipo de interação inválido/);
});
