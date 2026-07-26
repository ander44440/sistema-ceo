"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");
const Catalogo = require("./catalogo-coa.js");
const Sessao = require("./sessao-coa.js");
const Politica = require("./politica-isolamento.js");
const Inventario = require("./inventario-mvp-mg2.js");
const Migracao = require("./migracao-mg2.js");

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
  const sessao = Sessao.criar({ catalogo: catalogo, storage: storage });
  const politica = Politica.criar({ sessao: sessao, storage: storage });
  const migracao = Migracao.criar({
    catalogo: catalogo,
    sessao: sessao,
    politica: politica,
    storage: storage
  });
  return {
    storage: storage,
    catalogo: catalogo,
    sessao: sessao,
    politica: politica,
    migracao: migracao
  };
}

test("E8: inventário congelado com 3 registros 1:1 e fontes do MVP", () => {
  const { migracao } = montar();
  const inv = migracao.inventariar();
  assert.equal(inv.total, 3);
  assert.deepEqual(
    inv.registros.map((r) => r.origemId),
    ["DEC-MVP-001", "KNW-DIA-001", "ESTADO-DIA-MG2"]
  );
  assert.deepEqual(
    inv.registros.map((r) => r.tipo),
    ["decisao", "conhecimento", "estadoDia"]
  );
  inv.registros.forEach((r) => assert.match(r.fonte, /^docs\/mvp\//));
  assert.equal(inv.coaDestino.nome, "Motoboy Game 2");
});

test("E8: inventário é somente leitura (fixture congelada)", () => {
  const { migracao } = montar();
  assert.throws(() => {
    Inventario.REGISTROS.push({ origemId: "INTRUSO" });
  }, TypeError);
  assert.throws(() => {
    Inventario.REGISTROS[0].conteudo.enunciado = "adulterado";
  }, TypeError);
  const inv = migracao.inventariar();
  inv.registros[0].titulo = "cópia alterada não afeta a fixture";
  assert.equal(
    migracao.inventariar().registros[0].titulo,
    "Taxa zerada em corrida cancelada"
  );
});

test("E8: garantirCoaMg2 cria o COA quando ausente e reutiliza quando presente", () => {
  const { migracao, catalogo } = montar();
  const primeira = migracao.garantirCoaMg2();
  assert.equal(primeira.criado, true);
  const segunda = migracao.garantirCoaMg2();
  assert.equal(segunda.criado, false);
  assert.equal(segunda.coaId, primeira.coaId);
  const projetos = catalogo
    .listarProjetos()
    .filter((p) => p.nome === "Motoboy Game 2");
  assert.equal(projetos.length, 1);
});

test("E8: executar migra os 3 registros para o COA mg2 preservando identidade", () => {
  const { migracao, politica } = montar();
  const resultado = migracao.executar();
  assert.equal(resultado.status, "ok");
  assert.equal(resultado.migrados, 3);
  assert.equal(resultado.jaExistentes, 0);
  const registros = politica.listarDoCoaAtivo();
  assert.equal(registros.length, 3);
  const ids = registros.map((r) => r.id).sort();
  assert.deepEqual(ids, ["DEC-MVP-001", "ESTADO-DIA-MG2", "KNW-DIA-001"]);
  registros.forEach((r) => assert.equal(r.coaId, resultado.coaId));
});

test("E8: idempotência — segunda execução não duplica nem corrompe", () => {
  const { migracao, politica } = montar();
  migracao.executar();
  const segunda = migracao.executar();
  assert.equal(segunda.migrados, 0);
  assert.equal(segunda.jaExistentes, 3);
  assert.equal(politica.listarDoCoaAtivo().length, 3);
  const evidencia = migracao.evidenciar();
  assert.equal(evidencia.totalMigrado, 3);
  assert.equal(evidencia.completo, true);
});

test("E8: reinício parcial — item já evidenciado é pulado, pendentes completados", () => {
  const { storage, migracao, politica } = montar();
  const mg2 = migracao.garantirCoaMg2();
  // Simula interrupção: apenas DEC-MVP-001 evidenciado antes do reinício.
  storage.setItem(
    Migracao.STORE_KEY,
    JSON.stringify([
      {
        origemId: "DEC-MVP-001",
        destinoId: "DEC-MVP-001",
        coaId: mg2.coaId,
        tipo: "decisao",
        fonte: "docs/mvp/decisoes.md",
        status: "migrado",
        executadoEm: "2026-07-26T00:00:00.000Z"
      }
    ])
  );
  const resultado = migracao.executar();
  assert.equal(resultado.jaExistentes, 1);
  assert.equal(resultado.migrados, 2);
  const ids = politica.listarDoCoaAtivo().map((r) => r.id).sort();
  assert.deepEqual(ids, ["ESTADO-DIA-MG2", "KNW-DIA-001"]);
});

test("E8: isolamento — nenhum registro migrado aparece em outros COAs", () => {
  const { migracao, catalogo, sessao, politica } = montar();
  const ceo = catalogo.criarProjeto({
    nome: "Sistema CEO",
    objetivoPrincipal: "Governar"
  });
  const um = catalogo.criarProjeto({
    nome: "Última Milha",
    objetivoPrincipal: "Entregas"
  });
  migracao.executar();
  [ceo.coaId, um.coaId].forEach((coaId) => {
    sessao.trocar(coaId);
    assert.equal(politica.listarDoCoaAtivo().length, 0);
    assert.equal(politica.obter("DEC-MVP-001"), null);
  });
});

test("E8: após executar, o COA ativo permanece em Motoboy Game 2", () => {
  const { migracao, catalogo, sessao } = montar();
  const outro = catalogo.criarProjeto({
    nome: "Sistema CEO",
    objetivoPrincipal: "Governar"
  });
  sessao.bootstrap();
  sessao.trocar(outro.coaId);
  const resultado = migracao.executar();
  const ativo = sessao.obterAtivo();
  assert.equal(ativo.coaAtivoId, resultado.coaId);
  assert.equal(ativo.coa.nome, "Motoboy Game 2");
});

test("E8: completude quantitativa e mapa rastreável origem→destino (D17)", () => {
  const { migracao } = montar();
  assert.deepEqual(
    migracao.mapear().map((m) => m.status),
    ["pendente", "pendente", "pendente"]
  );
  migracao.executar();
  const evidencia = migracao.evidenciar();
  assert.equal(evidencia.totalOrigem, 3);
  assert.equal(evidencia.totalMigrado, 3);
  assert.equal(evidencia.completo, true);
  assert.equal(evidencia.destinosVerificadosNoCoaAtivo, 3);
  evidencia.mapa.forEach((m) => {
    assert.equal(m.origemId, m.destinoId);
    assert.equal(m.status, "migrado");
  });
  evidencia.evidencias.forEach((e) => {
    assert.ok(e.fonte.startsWith("docs/mvp/"));
    assert.ok(e.executadoEm);
    assert.equal(e.coaId, evidencia.coaAtivoId);
  });
});

test("E8: sem transformação semântica — conteúdo e relacionamentos preservados", () => {
  const { migracao, politica } = montar();
  migracao.executar();
  const decisao = politica.obter("DEC-MVP-001");
  assert.deepEqual(decisao.conteudo, Inventario.REGISTROS[0].conteudo);
  const estado = politica.obter("ESTADO-DIA-MG2");
  assert.deepEqual(estado.conteudo.vinculos, ["DEC-MVP-001", "KNW-DIA-001"]);
});

test("E8: RepoMigração usa persistência própria, separada das baselines", () => {
  const { storage, migracao } = montar();
  migracao.executar();
  assert.equal(Migracao.STORE_KEY, "ceo.cap03.migracao.v1");
  assert.ok(storage._dados.has(Migracao.STORE_KEY));
  assert.notEqual(Migracao.STORE_KEY, Catalogo.STORE_KEY);
  assert.notEqual(Migracao.STORE_KEY, Sessao.STORE_KEY);
  assert.notEqual(Migracao.STORE_KEY, Politica.STORE_KEY);
});

test("E8: API restrita — sem reverter() e sem operações fora do IMigracao", () => {
  const { migracao } = montar();
  ["reverter", "gravar", "trocar", "criarProjeto"].forEach((nome) => {
    assert.equal(typeof migracao[nome], "undefined", nome);
  });
  ["inventariar", "garantirCoaMg2", "mapear", "executar", "evidenciar"].forEach(
    (nome) => {
      assert.equal(typeof migracao[nome], "function", nome);
    }
  );
});
