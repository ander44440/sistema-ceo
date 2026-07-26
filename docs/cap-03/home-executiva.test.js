"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");
const Catalogo = require("./catalogo-coa.js");
const Sessao = require("./sessao-coa.js");
const Politica = require("./politica-isolamento.js");
const Home = require("./home-executiva.js");

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

function montar() {
  const storage = criarStorage();
  const catalogo = Catalogo.criar(storage);
  const a = catalogo.criarProjeto({
    nome: "Sistema CEO",
    objetivoPrincipal: "Governar o CEO"
  });
  const b = catalogo.criarProjeto({
    nome: "Última Milha",
    objetivoPrincipal: "Concluir pagamentos"
  });
  const sessao = Sessao.criar({ catalogo: catalogo, storage: storage });
  sessao.bootstrap();
  sessao.trocar(a.coaId);
  const politica = Politica.criar({ sessao: sessao, storage: storage });
  const home = Home.criar({
    catalogo: catalogo,
    sessao: sessao,
    politica: politica
  });
  return {
    storage: storage,
    catalogo: catalogo,
    sessao: sessao,
    politica: politica,
    home: home,
    a: a,
    b: b
  };
}

test("E5: Resumo Executivo identifica COA ativo e metadados", () => {
  const { home, a } = montar();
  const resumo = home.montarResumo();
  assert.equal(resumo.status, "ok");
  assert.equal(resumo.coaAtivoId, a.coaId);
  assert.equal(resumo.projeto, "Sistema CEO");
  assert.equal(resumo.objetivo, "Governar o CEO");
  assert.ok(resumo.ultimaAtividade);
  assert.equal(resumo.statusCicloVida, "ativo");
});

test("E5: Resumo é composição dinâmica — não persiste entidade própria", () => {
  const { home, storage, politica, a } = montar();
  home.montarResumo();
  const chaves = Array.from(storage._dados.keys());
  assert.equal(
    chaves.some(function (k) {
      return /resumo|home-executiva/i.test(k);
    }),
    false
  );
  politica.gravar({
    tipo: "atividade",
    titulo: "Revisar pagamento"
  });
  const resumo = home.montarResumo();
  assert.equal(resumo.situacaoAtual, "Revisar pagamento");
  assert.equal(resumo.coaAtivoId, a.coaId);
});

test("E5: blocos auxiliares filtrados pelo COA ativo via P", () => {
  const { home, politica, sessao, a, b } = montar();
  politica.gravar({ tipo: "decisao", titulo: "Decisão A" });
  politica.gravar({ tipo: "conhecimento", titulo: "Saber A" });
  sessao.trocar(b.coaId);
  politica.gravar({ tipo: "decisao", titulo: "Decisão B" });
  politica.gravar({ tipo: "atividade", titulo: "Atividade B" });

  const blocosB = home.montarBlocos();
  assert.equal(blocosB.coaAtivoId, b.coaId);
  assert.equal(blocosB.decisoesPendentes.length, 1);
  assert.equal(blocosB.decisoesPendentes[0].titulo, "Decisão B");
  assert.equal(blocosB.atividadesRecentes[0].titulo, "Atividade B");
  assert.equal(blocosB.conhecimentosRecentes.length, 0);

  home.trocarCoa(a.coaId);
  const blocosA = home.montarBlocos();
  assert.equal(blocosA.coaAtivoId, a.coaId);
  assert.equal(blocosA.decisoesPendentes[0].titulo, "Decisão A");
  assert.equal(blocosA.atividadesRecentes.length, 0);
});

test("E5: troca de COA atualiza Home imediatamente", () => {
  const { home, b } = montar();
  const antes = home.montarHome();
  assert.equal(antes.resumo.projeto, "Sistema CEO");

  const depois = home.trocarCoa(b.coaId);
  assert.equal(depois.status, "ok");
  assert.equal(depois.home.resumo.projeto, "Última Milha");
  assert.equal(depois.home.resumo.objetivo, "Concluir pagamentos");
  assert.equal(depois.home.coaAtivoId, b.coaId);
  assert.equal(
    depois.home.seletorProjetos.filter(function (p) {
      return p.ativo;
    }).length,
    1
  );
});

test("E5: ausência explícita quando não há registros operacionais", () => {
  const { home } = montar();
  const resumo = home.montarResumo();
  assert.match(resumo.situacaoAtual, /Ausência explícita/i);
  assert.match(resumo.proximoPasso, /Ausência explícita/i);
  assert.match(resumo.risco, /Ausência explícita/i);
  assert.match(resumo.pendencias, /Ausência explícita/i);
});

test("E5: usa só APIs públicas — não expõe repo nem gravação", () => {
  const { home } = montar();
  [
    "gravar",
    "inserir",
    "repo",
    "enviar",
    "listarHistorico",
    "navegar",
    "migrar",
    "criarProjeto"
  ].forEach(function (nome) {
    assert.equal(typeof home[nome], "undefined", nome);
  });
});

test("E5: baselines E1–E4 intactas (módulos não modificados na integração)", () => {
  const Catalogo = require("./catalogo-coa.js");
  const Sessao = require("./sessao-coa.js");
  const Politica = require("./politica-isolamento.js");
  const Tela = require("./tela-projetos.js");
  const { catalogo, sessao, politica, home, a } = montar();
  assert.equal(typeof Catalogo.criar, "function");
  assert.equal(typeof Sessao.criar, "function");
  assert.equal(typeof Politica.criar, "function");
  assert.equal(typeof Tela.criar, "function");
  assert.equal(home.montarResumo().coaAtivoId, a.coaId);
  assert.equal(catalogo.obterPorId(a.coaId).nome, "Sistema CEO");
  assert.equal(sessao.obterAtivo().status, "ativo");
  assert.equal(typeof politica.listar, "function");
});

test("E5: API não implementa conversa, navegação nem migração (E6–E8)", () => {
  const { home } = montar();
  assert.equal(typeof home.enviar, "undefined");
  assert.equal(typeof home.listarHistorico, "undefined");
  assert.equal(typeof home.montarMenu, "undefined");
  assert.equal(typeof home.navegar, "undefined");
  assert.equal(typeof home.migrar, "undefined");
});
