"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");
const Catalogo = require("./catalogo-coa.js");
const Sessao = require("./sessao-coa.js");

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

function montar(extras) {
  const storage = criarStorage();
  const catalogo = Catalogo.criar(storage);
  const projetos = (extras && extras.projetos) || [];
  const criados = projetos.map(function (p) {
    return catalogo.criarProjeto(p);
  });
  const sessao = Sessao.criar({ catalogo: catalogo, storage: storage });
  return { storage: storage, catalogo: catalogo, sessao: sessao, criados: criados };
}

test("E2: bootstrap com catálogo vazio exige criação do primeiro Projeto", () => {
  const { sessao } = montar();
  const r = sessao.bootstrap();
  assert.equal(r.status, "catalogo_vazio");
  assert.equal(r.coaAtivoId, null);
  assert.equal(r.resolucao, Sessao.RESOLUCAO.CATALOGO_VAZIO);
  const ativo = sessao.obterAtivo();
  assert.equal(ativo.status, "catalogo_vazio");
  assert.equal(ativo.coaAtivoId, null);
});

test("E2: bootstrap escolhe primeiro do catálogo quando não há persistido nem mg2", () => {
  const { sessao, criados } = montar({
    projetos: [
      { nome: "Sistema CEO", objetivoPrincipal: "Governar o CEO" },
      { nome: "Última Milha", objetivoPrincipal: "Concluir app" }
    ]
  });
  const r = sessao.bootstrap();
  assert.equal(r.status, "ok");
  assert.equal(r.resolucao, Sessao.RESOLUCAO.PRIMEIRO_CATALOGO);
  assert.equal(r.coaAtivoId, criados[0].coaId);
  assert.equal(sessao.obterAtivo().coaAtivoId, criados[0].coaId);
});

test("E2: bootstrap prefere mg2 (D14) quando não há último válido", () => {
  const { sessao, criados } = montar({
    projetos: [
      { nome: "Sistema CEO", objetivoPrincipal: "Governar" },
      {
        nome: Sessao.NOME_MG2,
        objetivoPrincipal: "Desenvolver MG2"
      }
    ]
  });
  const r = sessao.bootstrap();
  assert.equal(r.resolucao, Sessao.RESOLUCAO.MG2);
  assert.equal(r.coaAtivoId, criados[1].coaId);
});

test("E2: bootstrap restaura último COA persistido se ainda existir (D14)", () => {
  const storage = criarStorage();
  const catalogo = Catalogo.criar(storage);
  const a = catalogo.criarProjeto({
    nome: "Sistema CEO",
    objetivoPrincipal: "A"
  });
  const b = catalogo.criarProjeto({
    nome: "Última Milha",
    objetivoPrincipal: "B"
  });
  const s1 = Sessao.criar({ catalogo: catalogo, storage: storage });
  s1.bootstrap();
  s1.trocar(b.coaId);

  const s2 = Sessao.criar({ catalogo: catalogo, storage: storage });
  const r = s2.bootstrap();
  assert.equal(r.resolucao, Sessao.RESOLUCAO.ULTIMO_PERSISTIDO);
  assert.equal(r.coaAtivoId, b.coaId);
  assert.notEqual(r.coaAtivoId, a.coaId);
});

test("E2: exatamente um COA ativo — trocar atualiza e obtém o novo", () => {
  const { sessao, criados } = montar({
    projetos: [
      { nome: "A", objetivoPrincipal: "1" },
      { nome: "B", objetivoPrincipal: "2" }
    ]
  });
  sessao.bootstrap();
  assert.equal(sessao.obterAtivo().coaAtivoId, criados[0].coaId);

  const t = sessao.trocar(criados[1].coaId);
  assert.equal(t.status, "ok");
  assert.equal(t.coaAtivoId, criados[1].coaId);
  assert.equal(t.coaAtivoAnteriorId, criados[0].coaId);
  assert.equal(sessao.obterAtivo().coaAtivoId, criados[1].coaId);
  assert.equal(sessao.obterAtivo().coa.nome, "B");
});

test("E2: D19 — coaAtivoId só via O; API não expõe setter nem cópia gravável", () => {
  const { sessao, criados } = montar({
    projetos: [{ nome: "A", objetivoPrincipal: "1" }]
  });
  sessao.bootstrap();
  const vista = sessao.obterAtivo();
  assert.equal(vista.coaAtivoId, criados[0].coaId);
  assert.throws(function () {
    vista.coaAtivoId = "hack";
  });
  assert.equal(sessao.obterAtivo().coaAtivoId, criados[0].coaId);
  assert.equal(typeof sessao.coaAtivoId, "undefined");
  assert.equal(typeof sessao.setAtivo, "undefined");
  assert.equal(typeof sessao.definirAtivo, "undefined");
});

test("E2: D15 — conversa em andamento exige confirmação mínima", () => {
  const { sessao, criados } = montar({
    projetos: [
      { nome: "A", objetivoPrincipal: "1" },
      { nome: "B", objetivoPrincipal: "2" }
    ]
  });
  sessao.bootstrap();
  const pendente = sessao.trocar(criados[1].coaId, {
    conversaEmAndamento: true
  });
  assert.equal(pendente.status, "confirmacao_requerida");
  assert.equal(sessao.obterAtivo().coaAtivoId, criados[0].coaId);

  const ok = sessao.trocar(criados[1].coaId, {
    conversaEmAndamento: true,
    confirmado: true
  });
  assert.equal(ok.status, "ok");
  assert.equal(ok.coaAtivoId, criados[1].coaId);
});

test("E2: troca para coaId inexistente falha sem alterar ativo", () => {
  const { sessao, criados } = montar({
    projetos: [{ nome: "A", objetivoPrincipal: "1" }]
  });
  sessao.bootstrap();
  assert.throws(() => sessao.trocar("coa-inexistente"), /inexistente/);
  assert.equal(sessao.obterAtivo().coaAtivoId, criados[0].coaId);
});

test("E2: persistência da sessão usa chave própria — E1 intocada", () => {
  const { sessao, storage, catalogo, criados } = montar({
    projetos: [{ nome: "A", objetivoPrincipal: "1" }]
  });
  sessao.bootstrap();
  assert.ok(storage._dados.has(Sessao.STORE_KEY));
  assert.ok(storage._dados.has(Catalogo.STORE_KEY));
  assert.notEqual(Sessao.STORE_KEY, Catalogo.STORE_KEY);
  assert.equal(catalogo.obterPorId(criados[0].coaId).nome, "A");
  assert.equal(typeof catalogo.bootstrap, "undefined");
  assert.equal(typeof catalogo.trocar, "undefined");
});

test("E2: API não expõe isolamento, Home, conversa, navegação nem migração", () => {
  const { sessao } = montar({
    projetos: [{ nome: "A", objetivoPrincipal: "1" }]
  });
  [
    "filtrarPorCoa",
    "montarResumo",
    "enviar",
    "listarHistorico",
    "migrar",
    "inventariar",
    "criarProjeto"
  ].forEach(function (nome) {
    assert.equal(typeof sessao[nome], "undefined", nome);
  });
});
