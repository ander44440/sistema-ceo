"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");
const Catalogo = require("./catalogo-coa.js");
const Sessao = require("./sessao-coa.js");
const Politica = require("./politica-isolamento.js");
const Conversa = require("./conversa-executiva.js");
const Navegacao = require("./navegacao.js");

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
    objetivoPrincipal: "Governar"
  });
  const b = catalogo.criarProjeto({
    nome: "Última Milha",
    objetivoPrincipal: "Pagamentos"
  });
  const sessao = Sessao.criar({ catalogo: catalogo, storage: storage });
  sessao.bootstrap();
  sessao.trocar(a.coaId);
  const politica = Politica.criar({ sessao: sessao, storage: storage });
  const conversa = Conversa.criar({ sessao: sessao, politica: politica });
  const nav = Navegacao.criar({ sessao: sessao });
  return {
    storage: storage,
    catalogo: catalogo,
    sessao: sessao,
    politica: politica,
    conversa: conversa,
    nav: nav,
    a: a,
    b: b
  };
}

test("E7: cinco destinos observáveis com Painel e Projetos apontando às superfícies", () => {
  const { nav } = montar();
  const destinos = nav.listarDestinos();
  assert.equal(destinos.length, 5);
  const ids = destinos.map(function (d) {
    return d.id;
  });
  assert.deepEqual(ids, [
    "painel",
    "projetos",
    "conversas",
    "memoria",
    "configuracoes"
  ]);
  assert.equal(
    destinos.find(function (d) {
      return d.id === "painel";
    }).pagina,
    "home.html"
  );
  assert.equal(
    destinos.find(function (d) {
      return d.id === "projetos";
    }).pagina,
    "projetos.html"
  );
});

test("E7: Conversas, Memória e Configurações são esqueleto (D16)", () => {
  const { nav } = montar();
  ["conversas", "memoria", "configuracoes"].forEach(function (id) {
    const r = nav.irPara(id);
    assert.equal(r.status, "ok");
    assert.equal(r.destino.esqueleto, true);
    assert.match(nav.montarEstado().observacao || "", /mínima|D16/i);
  });
  const painel = nav.irPara("painel");
  assert.equal(painel.destino.esqueleto, false);
  assert.equal(nav.montarEstado().observacao, null);
});

test("E7: navegação não altera o COA ativo", () => {
  const { nav, sessao, a } = montar();
  const antes = sessao.obterAtivo().coaAtivoId;
  ["projetos", "conversas", "memoria", "configuracoes", "painel"].forEach(
    function (id) {
      const r = nav.irPara(id);
      assert.equal(r.coaPreservado, true, id);
      assert.equal(r.coaAtivoId, antes, id);
    }
  );
  assert.equal(sessao.obterAtivo().coaAtivoId, a.coaId);
  assert.equal(antes, a.coaId);
});

test("E7: T não expõe troca de COA nem persistência", () => {
  const { nav } = montar();
  ["trocar", "bootstrap", "gravar", "criarProjeto", "migrar", "inventariar"].forEach(
    function (nome) {
      assert.equal(typeof nav[nome], "undefined", nome);
    }
  );
});

test("E7: contexto operacional preservado durante navegação", () => {
  const { nav, conversa, politica, a } = montar();
  conversa.enviar("Registro antes da navegação");
  nav.irPara("memoria");
  nav.irPara("configuracoes");
  nav.irPara("painel");
  const hist = conversa.listarHistorico();
  assert.equal(hist.length, 1);
  assert.equal(hist[0].coaId, a.coaId);
  assert.equal(politica.listar({ tipo: "turnoConversa" }).length, 1);
});

test("E7: destino inválido não muda destino atual nem COA", () => {
  const { nav, sessao } = montar();
  nav.irPara("projetos");
  const r = nav.irPara("inexistente");
  assert.equal(r.status, "invalido");
  assert.equal(nav.destinoAtual().id, "projetos");
  assert.equal(r.coaPreservado, true);
  assert.equal(r.coaAtivoId, sessao.obterAtivo().coaAtivoId);
});

test("E7: troca explícita de COA continua exclusiva de O (REQ-038)", () => {
  const { nav, sessao, b } = montar();
  nav.irPara("projetos");
  sessao.trocar(b.coaId);
  const estado = nav.montarEstado();
  assert.equal(estado.coaAtivoId, b.coaId);
  assert.equal(estado.destinoAtual.id, "projetos");
});

test("E7: destino inicial padrão é Painel e reflete no estado", () => {
  const { nav } = montar();
  assert.equal(nav.destinoAtual().id, Navegacao.DESTINO_PADRAO);
  const estado = nav.montarEstado();
  assert.equal(estado.destinoAtual.id, "painel");
  assert.equal(
    estado.destinos.filter(function (d) {
      return d.atual;
    }).length,
    1
  );
  assert.equal(estado.statusSessao, "ativo");
});
