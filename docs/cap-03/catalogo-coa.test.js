"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");
const Catalogo = require("./catalogo-coa.js");

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

function entradaMinima(extra) {
  return Object.assign(
    {
      nome: "Última Milha",
      objetivoPrincipal: "Concluir integração de pagamento"
    },
    extra || {}
  );
}

test("E1: cria ProjetoCOA com metadados obrigatórios e especializacao projeto", () => {
  const cat = Catalogo.criar(criarStorage(), {
    agora: () => "2026-07-25T12:00:00.000Z"
  });
  const p = cat.criarProjeto(entradaMinima({ descricao: "App de entregas" }));

  assert.ok(p.coaId);
  assert.equal(p.especializacao, Catalogo.ESPECIALIZACAO.PROJETO);
  assert.equal(p.nome, "Última Milha");
  assert.equal(p.objetivoPrincipal, "Concluir integração de pagamento");
  assert.equal(p.descricao, "App de entregas");
  assert.equal(p.statusCicloVida, Catalogo.STATUS_CICLO_VIDA.ATIVO);
  assert.equal(p.ultimaAtividade, "2026-07-25T12:00:00.000Z");
  assert.equal(p.criadoEm, "2026-07-25T12:00:00.000Z");
  assert.equal(p.atualizadoEm, "2026-07-25T12:00:00.000Z");
});

test("E1: coaId é único, estável e imutável após criação", () => {
  const cat = Catalogo.criar(criarStorage());
  const a = cat.criarProjeto(entradaMinima({ nome: "Sistema CEO" }));
  const b = cat.criarProjeto(
    entradaMinima({ nome: "Motoboy Game 2", objetivoPrincipal: "Desenvolver MG2" })
  );
  assert.notEqual(a.coaId, b.coaId);

  const novamente = cat.obterPorId(a.coaId);
  assert.equal(novamente.coaId, a.coaId);
  assert.equal(novamente.nome, "Sistema CEO");
});

test("E1: listarProjetos e obterPorId cobrem o catálogo", () => {
  const cat = Catalogo.criar(criarStorage());
  assert.deepEqual(cat.listarProjetos(), []);

  const p = cat.criarProjeto(entradaMinima());
  const lista = cat.listarProjetos();
  assert.equal(lista.length, 1);
  assert.equal(lista[0].coaId, p.coaId);
  assert.equal(cat.obterPorId(p.coaId).nome, p.nome);
  assert.equal(cat.obterPorId("inexistente"), null);
});

test("E1: rejeita campos obrigatórios ausentes e statusCicloVida inválido", () => {
  const cat = Catalogo.criar(criarStorage());
  assert.throws(() => cat.criarProjeto({ objetivoPrincipal: "X" }), /nome/);
  assert.throws(() => cat.criarProjeto({ nome: "Y" }), /objetivoPrincipal/);
  assert.throws(
    () =>
      cat.criarProjeto(
        entradaMinima({ statusCicloVida: "em-andamento" })
      ),
    /statusCicloVida/
  );
});

test("E1: statusCicloVida é ciclo de vida do Projeto — catálogo não expõe coaAtivoId", () => {
  const cat = Catalogo.criar(criarStorage());
  const p = cat.criarProjeto(
    entradaMinima({ statusCicloVida: Catalogo.STATUS_CICLO_VIDA.PAUSADO })
  );
  assert.equal(p.statusCicloVida, "pausado");
  assert.equal(Object.prototype.hasOwnProperty.call(p, "coaAtivoId"), false);
  assert.equal(typeof cat.obterAtivo, "undefined");
  assert.equal(typeof cat.trocar, "undefined");
  assert.equal(typeof cat.bootstrap, "undefined");
});

test("E1: persistência do catálogo é separada (D12) e recupera entre sessões", () => {
  const storage = criarStorage();
  const cat1 = Catalogo.criar(storage);
  const criado = cat1.criarProjeto(entradaMinima({ nome: "MG2" }));

  assert.equal(cat1.chavePersistencia, Catalogo.STORE_KEY);
  assert.ok(storage._dados.has(Catalogo.STORE_KEY));
  assert.equal(
    storage._dados.has("ceo.cap03.operacional"),
    false,
    "E1 não deve criar repositório operacional"
  );

  const cat2 = Catalogo.criar(storage);
  const obtido = cat2.obterPorId(criado.coaId);
  assert.equal(obtido.nome, "MG2");
  assert.equal(obtido.coaId, criado.coaId);
});

test("E1: atualizarUltimaAtividade mantém coaId e atualiza timestamps (D11)", () => {
  let tick = 0;
  const cat = Catalogo.criar(criarStorage(), {
    agora: () => "2026-07-25T1" + tick++ + ":00:00.000Z"
  });
  const p = cat.criarProjeto(entradaMinima());
  const atualizado = cat.atualizarUltimaAtividade(p.coaId);
  assert.equal(atualizado.coaId, p.coaId);
  assert.notEqual(atualizado.ultimaAtividade, p.ultimaAtividade);
  assert.equal(atualizado.criadoEm, p.criadoEm);
});

test("E1: API não expõe sessão, isolamento, Home, conversa, navegação nem migração", () => {
  const cat = Catalogo.criar(criarStorage());
  const proibidos = [
    "obterAtivo",
    "trocar",
    "bootstrap",
    "filtrarPorCoaAtivo",
    "montarResumo",
    "enviar",
    "listarHistorico",
    "migrar",
    "inventariar"
  ];
  proibidos.forEach(function (nome) {
    assert.equal(typeof cat[nome], "undefined", "não deve expor " + nome);
  });
});
