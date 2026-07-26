"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");
const Catalogo = require("./catalogo-coa.js");
const Sessao = require("./sessao-coa.js");
const Politica = require("./politica-isolamento.js");
const Tela = require("./tela-projetos.js");

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

function montarVazio() {
  const storage = criarStorage();
  const catalogo = Catalogo.criar(storage);
  const sessao = Sessao.criar({ catalogo: catalogo, storage: storage });
  const politica = Politica.criar({ sessao: sessao, storage: storage });
  const tela = Tela.criar({ catalogo: catalogo, sessao: sessao });
  return { catalogo: catalogo, sessao: sessao, politica: politica, tela: tela };
}

test("E4: catálogo vazio — estado precisaCriarPrimeiroProjeto", () => {
  const { tela } = montarVazio();
  const estado = tela.inicializar();
  assert.equal(estado.vazio, true);
  assert.equal(estado.precisaCriarPrimeiroProjeto, true);
  assert.equal(estado.projetos.length, 0);
  assert.match(estado.mensagem || "", /primeiro Projeto/i);
});

test("E4: criar Projeto usa apenas catálogo e fica imediatamente listável", () => {
  const { tela, catalogo } = montarVazio();
  tela.inicializar();
  const r = tela.criarProjeto({
    nome: "Última Milha",
    objetivoPrincipal: "Concluir pagamentos"
  });
  assert.equal(r.projeto.nome, "Última Milha");
  assert.equal(r.estado.vazio, false);
  assert.equal(r.estado.projetos.length, 1);
  assert.equal(catalogo.listarProjetos().length, 1);
  assert.equal(r.estado.projetos[0].selecionado, true);
});

test("E4: Projeto ativo destacado após bootstrap/abrir", () => {
  const { tela, sessao } = montarVazio();
  tela.inicializar();
  const a = tela.criarProjeto({
    nome: "Sistema CEO",
    objetivoPrincipal: "Governar"
  });
  const b = tela.criarProjeto({
    nome: "Motoboy Game 2",
    objetivoPrincipal: "Desenvolver MG2"
  });
  const aberto = tela.abrirProjeto(b.projeto.coaId);
  assert.equal(aberto.status, "ok");
  assert.equal(aberto.estado.coaAtivoId, b.projeto.coaId);
  const ativo = aberto.estado.projetos.find(function (p) {
    return p.ativo;
  });
  assert.ok(ativo);
  assert.equal(ativo.nome, "Motoboy Game 2");
  assert.equal(sessao.obterAtivo().coaAtivoId, b.projeto.coaId);
  assert.notEqual(a.projeto.coaId, aberto.estado.coaAtivoId);
});

test("E4: selecionar e abrir usam sessão pública — seleção inválida tratada", () => {
  const { tela } = montarVazio();
  tela.inicializar();
  tela.criarProjeto({ nome: "A", objetivoPrincipal: "1" });
  const invalido = tela.selecionarProjeto("coa-fantasma");
  assert.equal(invalido.status, "invalido");
  assert.match(invalido.estado.mensagem || "", /não encontrado/i);

  const ok = tela.selecionarProjeto(tela.montarEstado().projetos[0].coaId);
  assert.equal(ok.status, "ok");
  assert.equal(ok.estado.selecionadoId, ok.projeto.coaId);

  const aberto = tela.abrirProjeto();
  assert.equal(aberto.status, "ok");
  assert.equal(aberto.estado.coaAtivoId, ok.projeto.coaId);
});

test("E4: metadados exibíveis — nome, statusCicloVida, ultimaAtividade", () => {
  const { tela } = montarVazio();
  tela.inicializar();
  tela.criarProjeto({
    nome: "X",
    objetivoPrincipal: "Y",
    statusCicloVida: "pausado"
  });
  const item = tela.montarEstado().projetos[0];
  assert.equal(item.nome, "X");
  assert.equal(item.statusCicloVida, "pausado");
  assert.ok(item.ultimaAtividade);
  assert.equal(item.objetivoPrincipal, "Y");
});

test("E4: não duplica regras — não grava em storage próprio nem altera P", () => {
  const { tela, politica, catalogo, sessao } = montarVazio();
  tela.inicializar();
  tela.criarProjeto({ nome: "A", objetivoPrincipal: "1" });
  tela.abrirProjeto(tela.montarEstado().projetos[0].coaId);
  assert.equal(politica.listar().length, 0);
  assert.equal(typeof tela.gravar, "undefined");
  assert.equal(typeof tela.trocar, "undefined");
  assert.equal(typeof tela.criarProjetoInterno, "undefined");
  assert.equal(typeof catalogo.listarProjetos, "function");
  assert.equal(typeof sessao.obterAtivo, "function");
});

test("E4: API não expõe Home, conversa, navegação nem migração", () => {
  const { tela } = montarVazio();
  [
    "montarResumo",
    "enviar",
    "listarHistorico",
    "navegar",
    "migrar",
    "inventariar"
  ].forEach(function (nome) {
    assert.equal(typeof tela[nome], "undefined", nome);
  });
});

test("E4: baselines E1–E3 intactas após uso da tela", () => {
  const { catalogo, sessao, politica, tela } = montarVazio();
  tela.inicializar();
  const r = tela.criarProjeto({ nome: "A", objetivoPrincipal: "1" });
  tela.abrirProjeto(r.projeto.coaId);
  politica.gravar({ tipo: "generico", conteudo: "ok" });
  assert.equal(politica.listar().length, 1);
  assert.equal(catalogo.obterPorId(r.projeto.coaId).nome, "A");
  assert.equal(sessao.obterAtivo().status, "ativo");
});
