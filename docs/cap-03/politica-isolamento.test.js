"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");
const Catalogo = require("./catalogo-coa.js");
const Sessao = require("./sessao-coa.js");
const Politica = require("./politica-isolamento.js");

function criarStorage() {
  const dados = new Map();
  return {
    getItem(chave) {
      return dados.has(chave) ? dados.get(chave) : null;
    },
    setItem(chave, valor) {
      dados.set(chave, String(valor));
    },
    _dados: dados
  };
}

function montarDoisCoas() {
  const storage = criarStorage();
  const catalogo = Catalogo.criar(storage);
  const a = catalogo.criarProjeto({
    nome: "Sistema CEO",
    objetivoPrincipal: "Governar"
  });
  const b = catalogo.criarProjeto({
    nome: "Última Milha",
    objetivoPrincipal: "Entregas"
  });
  const sessao = Sessao.criar({ catalogo: catalogo, storage: storage });
  sessao.bootstrap();
  const p = Politica.criar({ sessao: sessao, storage: storage });
  return { storage: storage, catalogo: catalogo, sessao: sessao, p: p, a: a, b: b };
}

test("E3: D4 — todo registro operacional exige coaId (injetado do ativo)", () => {
  const { p, a } = montarDoisCoas();
  const reg = p.gravar({
    tipo: Politica.TIPOS.DECISAO,
    titulo: "Decisão X",
    conteudo: "Fazer Y"
  });
  assert.ok(reg.id);
  assert.equal(reg.coaId, a.coaId);
  assert.equal(reg.tipo, "decisao");
});

test("E3: D4 — gravação sem COA ativo é bloqueada", () => {
  const storage = criarStorage();
  const catalogo = Catalogo.criar(storage);
  const sessao = Sessao.criar({ catalogo: catalogo, storage: storage });
  sessao.bootstrap();
  const p = Politica.criar({ sessao: sessao, storage: storage });
  assert.throws(
    () => p.gravar({ tipo: "generico", conteudo: "x" }),
    /não há COA ativo/i
  );
});

test("E3: D5 — gravação com coaId de outro COA é bloqueada", () => {
  const { p, a, b } = montarDoisCoas();
  assert.equal(a.coaId !== b.coaId, true);
  assert.throws(
    () =>
      p.gravar({
        coaId: b.coaId,
        tipo: "decisao",
        conteudo: "vazamento"
      }),
    /cross-COA/i
  );
  assert.equal(p.listar().length, 0);
});

test("E3: D5/D13 — listarPorCoaId de outro COA é bloqueado", () => {
  const { p, sessao, a, b } = montarDoisCoas();
  p.gravar({ tipo: "conhecimento", titulo: "K-A" });
  assert.throws(() => p.listarPorCoaId(b.coaId), /cross-COA/i);
  assert.throws(() => p.listar({ coaId: b.coaId }), /cross-COA/i);
  assert.equal(p.listarDoCoaAtivo().length, 1);
  assert.equal(p.listarDoCoaAtivo()[0].coaId, a.coaId);
});

test("E3: D13 — listagem e obtenção filtradas pelo coaAtivoId via O", () => {
  const { p, sessao, a, b } = montarDoisCoas();
  p.gravar({ tipo: "atividade", titulo: "Atividade A" });
  sessao.trocar(b.coaId);
  p.gravar({ tipo: "atividade", titulo: "Atividade B" });

  assert.equal(p.listar().length, 1);
  assert.equal(p.listar()[0].titulo, "Atividade B");
  assert.equal(p.listar()[0].coaId, b.coaId);

  sessao.trocar(a.coaId);
  const listaA = p.listar();
  assert.equal(listaA.length, 1);
  assert.equal(listaA[0].titulo, "Atividade A");
  assert.equal(listaA[0].coaId, a.coaId);
});

test("E3: obter registro só no COA ativo; cross-COA rejeitado", () => {
  const { p, sessao, a, b } = montarDoisCoas();
  const regA = p.gravar({ tipo: "pendencia", titulo: "Pend A" });
  sessao.trocar(b.coaId);
  assert.equal(p.obter(regA.id), null);
  assert.throws(() => p.obter(regA.id, { coaId: a.coaId }), /cross-COA/i);
  sessao.trocar(a.coaId);
  assert.equal(p.obter(regA.id).titulo, "Pend A");
});

test("E3: encapsulamento — API pública não expõe repo bruto nem bypass", () => {
  const { p } = montarDoisCoas();
  [
    "inserir",
    "lerTodos",
    "filtrarPorCoa",
    "repo",
    "montarResumo",
    "enviar",
    "migrar",
    "criarProjeto",
    "trocar"
  ].forEach(function (nome) {
    assert.equal(typeof p[nome], "undefined", nome);
  });
});

test("E3: persistência operacional separada de catálogo e sessão (D12)", () => {
  const { p, storage, a } = montarDoisCoas();
  p.gravar({ tipo: "generico", conteudo: 1 });
  assert.ok(storage._dados.has(Politica.STORE_KEY));
  assert.ok(storage._dados.has(Catalogo.STORE_KEY));
  assert.ok(storage._dados.has(Sessao.STORE_KEY));
  assert.notEqual(Politica.STORE_KEY, Catalogo.STORE_KEY);
  assert.notEqual(Politica.STORE_KEY, Sessao.STORE_KEY);

  const bruto = JSON.parse(storage._dados.get(Politica.STORE_KEY));
  assert.equal(bruto.length, 1);
  assert.equal(bruto[0].coaId, a.coaId);
});

test("E3: baselines E1/E2 inalteradas — contratos ainda válidos", () => {
  const { catalogo, sessao, a, b } = montarDoisCoas();
  assert.equal(typeof catalogo.criarProjeto, "function");
  assert.equal(typeof catalogo.bootstrap, "undefined");
  assert.equal(typeof sessao.obterAtivo, "function");
  assert.equal(sessao.obterAtivo().coaAtivoId, a.coaId);
  sessao.trocar(b.coaId);
  assert.equal(sessao.obterAtivo().coaAtivoId, b.coaId);
  assert.equal(catalogo.listarProjetos().length, 2);
});

test("E3: API não expõe Home, conversa, navegação, UI Projetos nem migração", () => {
  const { p } = montarDoisCoas();
  [
    "montarResumo",
    "montarBlocos",
    "enviar",
    "listarHistorico",
    "navegar",
    "abrirProjeto",
    "inventariar",
    "migrar"
  ].forEach(function (nome) {
    assert.equal(typeof p[nome], "undefined", nome);
  });
});
