"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");
const Memoria = require("./memoria-organizacional.js");

function criarStorage() {
  const dados = new Map();
  return {
    getItem(chave) {
      return dados.has(chave) ? dados.get(chave) : null;
    },
    setItem(chave, valor) {
      dados.set(chave, String(valor));
    },
    removeItem(chave) {
      dados.delete(chave);
    }
  };
}

function registroCompleto() {
  return {
    decisao: "Manter a taxa zerada no cancelamento",
    quem: "Patrocinador",
    quando: "2026-07-24",
    porque: "Preservar a regra homologada",
    baseadoEm: "DEC-MVP-001",
    resultado: "Regra mantida sem ambiguidade"
  };
}

test("eleva a decisão do módulo D à memória H no primeiro uso", () => {
  const memoria = Memoria.criar(criarStorage());
  const registros = memoria.inicializar();

  assert.equal(registros.length, 1);
  assert.equal(registros[0].id, "DEC-MVP-001");
  assert.equal(registros[0].contexto, Memoria.CONTEXTO_ATIVO);
  Memoria.CAMPOS_OBRIGATORIOS.forEach((campo) => {
    assert.ok(registros[0][campo], `campo ${campo} deveria estar preenchido`);
  });
});

test("recupera histórico em nova instância usando o mesmo storage", () => {
  const storage = criarStorage();
  const primeiraSessao = Memoria.criar(storage);
  primeiraSessao.inicializar();
  const criado = primeiraSessao.registrar(registroCompleto());

  const segundaSessao = Memoria.criar(storage);
  const recuperado = segundaSessao.consultar("regra homologada");

  assert.equal(recuperado.status, "encontrado");
  assert.equal(recuperado.registros.length, 1);
  assert.equal(recuperado.registros[0].id, criado.id);
});

test("recusa decisão sem qualquer um dos cinco campos obrigatórios", () => {
  Memoria.CAMPOS_OBRIGATORIOS.forEach((campo) => {
    const memoria = Memoria.criar(criarStorage());
    const incompleto = registroCompleto();
    delete incompleto[campo];

    assert.throws(
      () => memoria.registrar(incompleto),
      new RegExp(`Campos obrigatórios ausentes: ${campo}`)
    );
  });
});

test("declara ausência sem inventar registros", () => {
  const memoria = Memoria.criar(criarStorage());
  memoria.inicializar();

  const resultado = memoria.consultar("publicação na loja");

  assert.equal(resultado.status, "ausente");
  assert.deepEqual(resultado.registros, []);
  assert.match(resultado.mensagem, /^Ausência explícita:/);
});

test("mantém o contexto ativo restrito ao MG2", () => {
  const memoria = Memoria.criar(criarStorage());
  memoria.inicializar();
  const registro = memoria.registrar({
    ...registroCompleto(),
    contexto: "Outro projeto"
  });

  assert.equal(registro.contexto, "Motoboy Game 2 (MG2)");
});

test("não expõe operações de recomendação, prioridade ou coordenação", () => {
  const memoria = Memoria.criar(criarStorage());

  assert.equal(memoria.recomendar, undefined);
  assert.equal(memoria.priorizar, undefined);
  assert.equal(memoria.coordenarPapeis, undefined);
});
