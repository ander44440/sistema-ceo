"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");
const Memoria = require("./memoria-organizacional.js");
const EstadoDia = require("./estado-dia.js");
const Conducao = require("./conducao-executiva.js");
const Papeis = require("./coordenacao-papeis.js");

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
  const conducao = Conducao.criar({ memoria: memoria, estadoDia: estadoDia });
  const papeis = Papeis.criar({ memoria: memoria, estadoDia: estadoDia });
  return { memoria, estadoDia, conducao, papeis, storage };
}

test("E2: monta contexto a partir de H + F + B antes da autoridade", () => {
  const { conducao } = montarPilha();
  const pacote = conducao.montarContexto({
    tema: "taxa",
    motivoPedido: "Confirmar próximo passo do Dia"
  });

  assert.equal(pacote.contexto, "Motoboy Game 2 (MG2)");
  assert.equal(pacote.status, "encontrado");
  assert.ok(pacote.fontes.some((f) => f.tipo === "B"));
  assert.ok(pacote.fontes.some((f) => f.tipo === "F"));
  assert.ok(pacote.fontes.some((f) => f.tipo === "H"));
  assert.match(pacote.resumo, /Memória|Estado/);
});

test("E2: declara ausência explícita quando não há base", () => {
  const storageVazio = criarStorage();
  const memoriaVazia = Memoria.criar(storageVazio);
  const estadoVazio = EstadoDia.criar(storageVazio);
  storageVazio.setItem(Memoria.STORE_KEY, "[]");
  const conducao = Conducao.criar({ memoria: memoriaVazia, estadoDia: estadoVazio });

  const pacote = conducao.montarContexto({ motivoPedido: "Decisão sem base" });
  assert.equal(pacote.status, "ausente");
  assert.match(pacote.resumo, /^Ausência explícita:/);
});

test("E2: bloqueia proposta/autoridade sem montar contexto (RF-02)", () => {
  const { conducao } = montarPilha();
  assert.throws(
    () => conducao.proporProximoPasso("Qualquer coisa"),
    /Ordem RF-02 violada/
  );
  assert.throws(() => conducao.pedirAutoridade(), /Ordem RF-02 violada/);
});

test("E3: proposta traz justificativa e só vigora após confirmação", () => {
  const { conducao, estadoDia } = montarPilha();
  conducao.montarContexto({
    tema: "cancelamento",
    motivoPedido: "Definir próximo passo"
  });
  const proposta = conducao.proporProximoPasso(
    "Implementar taxa zerada no cancelamento"
  );

  assert.ok(proposta.justificativa);
  assert.equal(proposta.vigencia, false);
  assert.equal(proposta.status, "proposta");
  assert.match(proposta.fronteiraExecucao, /execução técnica permanece fora/);

  const pedido = conducao.pedirAutoridade();
  assert.deepEqual(pedido.ordem, ["contexto", "proposta", "autoridade"]);
  assert.ok(pedido.contexto.id);

  const antes = estadoDia.obter().estado.proximo;
  const conf = conducao.confirmar();
  assert.equal(conf.proposta.vigencia, true);
  assert.equal(conf.estado.proximo, "Implementar taxa zerada no cancelamento");
  assert.notEqual(antes, conf.estado.proximo);
});

test("E3: rejeitar preserva a base e não aplica vigência", () => {
  const { conducao, estadoDia } = montarPilha();
  const proximoAntes = estadoDia.obter().estado.proximo;
  conducao.montarContexto({ motivoPedido: "Teste rejeição" });
  conducao.proporPrioridade("Prioridade experimental");
  const rej = conducao.rejeitar();

  assert.equal(rej.proposta.vigencia, false);
  assert.equal(rej.proposta.status, "rejeitada");
  assert.ok(rej.basePreservada.justificativa);
  assert.equal(estadoDia.obter().estado.proximo, proximoAntes);
});

test("E3: prioridade confirmada atualiza atenção do Dia", () => {
  const { conducao } = montarPilha();
  conducao.montarContexto({ motivoPedido: "Priorizar" });
  conducao.proporPrioridade("Fechar regra de payout");
  const conf = conducao.confirmar();
  assert.deepEqual(conf.estado.atencoes, ["Fechar regra de payout"]);
});

test("E4: classifica atenção por papel com base em H/F", () => {
  const { papeis } = montarPilha();
  const resultado = papeis.coordenar({
    itens: [
      { id: "X1", enunciado: "Homologar REQ-033 e ARQ-009" },
      { id: "X2", enunciado: "Implementar testes do componente H" },
      { id: "X3", enunciado: "Confirmar decisão de prioridade do Dia" },
      { id: "X4", enunciado: "Item sem classificação clara xyz" }
    ]
  });

  assert.equal(resultado.status, "encontrado");
  const mapa = Object.fromEntries(
    resultado.itens
      .filter((i) => i.origem === "explicito")
      .map((i) => [i.id, i.papel])
  );
  assert.equal(mapa.X1, "CTO");
  assert.equal(mapa.X2, "Engenheiro");
  assert.equal(mapa.X3, "Patrocinador");
  assert.equal(mapa.X4, "Patrocinador");
});

test("E5: fluxo ponta a ponta memória → contexto → proposta → confirmação → persistência", () => {
  const { memoria, estadoDia, conducao, papeis } = montarPilha();

  const pacote = conducao.montarContexto({
    tema: "taxa",
    motivoPedido: "Avançar edge case de cancelamento"
  });
  assert.equal(pacote.status, "encontrado");

  const proposta = conducao.proporProximoPasso(
    "Codificar taxa zerada conforme DEC-MVP-001"
  );
  assert.ok(proposta.justificativa.includes(pacote.id));

  const autoridade = conducao.pedirAutoridade();
  assert.equal(autoridade.ordem[0], "contexto");

  const conf = conducao.confirmar();
  assert.equal(conf.estado.proximo, "Codificar taxa zerada conforme DEC-MVP-001");

  const registrado = memoria.registrar({
    decisao: "Confirmar execução da taxa zerada no cancelamento",
    quem: "Patrocinador",
    quando: "2026-07-24",
    porque: "Alinhar condução CAP-05 ao registro D elevado",
    baseadoEm: "DEC-MVP-001 + pacote " + pacote.id,
    resultado: "Próximo passo vigente atualizado no Estado do Dia"
  });
  assert.equal(registrado.id, "DEC-ORG-002");

  const atencao = papeis.coordenar();
  assert.equal(atencao.status, "encontrado");
  assert.ok(atencao.porPapel.Patrocinador.length + atencao.porPapel.CTO.length + atencao.porPapel.Engenheiro.length > 0);

  const estadoFinal = estadoDia.obter();
  assert.equal(estadoFinal.status, "encontrado");
  assert.equal(estadoFinal.estado.contexto, "Motoboy Game 2 (MG2)");
});
