"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");
const Catalogo = require("./catalogo-coa.js");
const Sessao = require("./sessao-coa.js");
const Politica = require("./politica-isolamento.js");
const Home = require("./home-executiva.js");
const Conversa = require("./conversa-executiva.js");

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
  const home = Home.criar({
    catalogo: catalogo,
    sessao: sessao,
    politica: politica
  });
  const conversa = Conversa.criar({
    sessao: sessao,
    politica: politica,
    home: home
  });
  return {
    storage: storage,
    catalogo: catalogo,
    sessao: sessao,
    politica: politica,
    home: home,
    conversa: conversa,
    a: a,
    b: b
  };
}

test("E6: enviar associa turno ao coaAtivoId via O e grava via P", () => {
  const { conversa, a, politica } = montar();
  const t = conversa.enviar("O que exige minha atenção hoje?");
  assert.ok(t.turnoId);
  assert.equal(t.coaId, a.coaId);
  assert.equal(t.textoUsuario, "O que exige minha atenção hoje?");
  assert.equal(t.vigencia, "proposta");
  assert.equal(t.estado, "registrado");
  assert.match(t.resposta, /Sistema CEO/);
  assert.match(t.limitacao || t.resposta, /determinístic|motor de linguagem/i);
  assert.equal(politica.listar({ tipo: "turnoConversa" }).length, 1);
});

test("E6: histórico isolado por COA — sem vazamento após troca", () => {
  const { conversa, sessao, a, b } = montar();
  conversa.enviar("Mensagem no A");
  sessao.trocar(b.coaId);
  conversa.enviar("Mensagem no B");

  const histB = conversa.listarHistorico();
  assert.equal(histB.length, 1);
  assert.equal(histB[0].textoUsuario, "Mensagem no B");
  assert.equal(histB[0].coaId, b.coaId);

  sessao.trocar(a.coaId);
  const histA = conversa.listarHistorico();
  assert.equal(histA.length, 1);
  assert.equal(histA[0].textoUsuario, "Mensagem no A");
  assert.equal(histA[0].coaId, a.coaId);
});

test("E6: após troca, superfície opera imediatamente no novo COA", () => {
  const { conversa, sessao, b } = montar();
  conversa.enviar("Antes");
  sessao.trocar(b.coaId);
  const superficie = conversa.montarSuperficie();
  assert.equal(superficie.disponivel, true);
  assert.equal(superficie.coaAtivoId, b.coaId);
  assert.equal(superficie.projeto, "Última Milha");
  assert.equal(superficie.historico.length, 0);
  const t = conversa.enviar("Depois no B");
  assert.equal(t.coaId, b.coaId);
  assert.equal(conversa.listarHistorico().length, 1);
});

test("E6: exemplos fixos ilustrativos — sem roteamento", () => {
  const { conversa } = montar();
  const s = conversa.montarSuperficie();
  assert.ok(s.exemplos.length >= 3);
  assert.deepEqual(s.exemplos, Conversa.EXEMPLOS);
});

test("E6: D18 — vigencia proposta; processamento determinístico", () => {
  const { conversa } = montar();
  const t = conversa.enviar("Planeje esta iniciativa");
  assert.equal(t.vigencia, "proposta");
  assert.match(t.resposta, /proposta/i);
  assert.equal(typeof conversa.inferir, "undefined");
  assert.equal(typeof conversa.chamarLLM, "undefined");
});

test("E6: sem COA ativo — enviar bloqueado", () => {
  const storage = criarStorage();
  const catalogo = Catalogo.criar(storage);
  const sessao = Sessao.criar({ catalogo: catalogo, storage: storage });
  sessao.bootstrap();
  const politica = Politica.criar({ sessao: sessao, storage: storage });
  const conversa = Conversa.criar({ sessao: sessao, politica: politica });
  assert.throws(() => conversa.enviar("Oi"), /COA ativo/i);
  assert.equal(conversa.montarSuperficie().disponivel, false);
});

test("E6: não cria persistência própria nem altera baselines E1–E5", () => {
  const { conversa, storage, home } = montar();
  conversa.enviar("Teste");
  const chaves = Array.from(storage._dados.keys());
  assert.equal(
    chaves.some(function (k) {
      return /conversa\.v|chat\.v/i.test(k);
    }),
    false
  );
  assert.ok(chaves.includes(Politica.STORE_KEY));
  assert.equal(typeof home.montarResumo, "function");
  assert.equal(typeof conversa.gravar, "undefined");
  assert.equal(typeof conversa.trocar, "undefined");
  assert.equal(typeof conversa.navegar, "undefined");
  assert.equal(typeof conversa.migrar, "undefined");
});

test("E6: API não antecipa E7/E8", () => {
  const { conversa } = montar();
  ["montarMenu", "navegar", "inventariar", "migrar", "criarProjeto"].forEach(
    function (nome) {
      assert.equal(typeof conversa[nome], "undefined", nome);
    }
  );
});
