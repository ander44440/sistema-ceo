/**
 * IMP-091 Bloco B1 — infraestrutura TurnEnvelope (COW / append-once / materializador).
 * Sem detectores, sem Precedência, sem projecção de flags, sem wiring de produção.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  criarTurnEnvelope,
  registarPassoEnvelope,
  gravarSinalAppendOnce,
  selarInterpretacao,
  OBJECTO_INDEFINIDO
} from "./index.js";

function base() {
  return criarTurnEnvelope({
    mensagemAtual: "mensagem âncora B1",
    coaIdEntrada: "prj-b1",
    canal: "chat"
  });
}

test("B1: Fatia 0 intacta — freeze e âncoras após APIs B1", () => {
  const env = base();
  assert.ok(Object.isFrozen(env));
  assert.equal(env.mensagemAtual, "mensagem âncora B1");
  assert.equal(env.perguntaAtual, env.mensagemAtual);
  assert.equal(env.modo, null);
  assert.equal(env.intençãoAtual, null);
  assert.equal(env.objecto, OBJECTO_INDEFINIDO);
  assert.throws(() => {
    env.mensagemAtual = "hack";
  }, TypeError);
  assert.throws(() => {
    env.coaId = "x";
  }, TypeError);
});

test("B1: registarPassoEnvelope — COW; original intacto; novo congelado", () => {
  const env = base();
  const len0 = env.rastreio.length;
  const next = registarPassoEnvelope(env, { fase: "teste_passo", n: 1 });
  assert.notEqual(next, env);
  assert.equal(env.rastreio.length, len0);
  assert.equal(next.rastreio.length, len0 + 1);
  assert.equal(next.rastreio[len0].fase, "teste_passo");
  assert.ok(Object.isFrozen(next));
  assert.ok(Object.isFrozen(next.rastreio));
  assert.equal(next.mensagemAtual, env.mensagemAtual);
  assert.equal(next.coaId, env.coaId);
  assert.throws(() => {
    next.modo = "hack";
  }, TypeError);
});

test("B1: gravarSinalAppendOnce — primeira escrita cria sinal congelado", () => {
  const env = base();
  const next = gravarSinalAppendOnce(env, "ig", {
    id: "ig",
    valor: true,
    fonte: "detectarPedidoInfoGathering",
    em: "2026-09-12T15:00:00.000Z",
    fase: "sinais"
  });
  assert.equal(env.sinais, null);
  assert.ok(next.sinais);
  assert.ok(Object.isFrozen(next.sinais));
  assert.ok(Object.isFrozen(next.sinais.ig));
  assert.equal(next.sinais.ig.valor, true);
  assert.equal(next.sinais.ig.fonte, "detectarPedidoInfoGathering");
  assert.ok(next.rastreio.some((p) => p.fase === "sinais" && p.chave === "ig"));
  assert.throws(() => {
    next.sinais.ig = {};
  }, TypeError);
});

test("B1: gravarSinalAppendOnce — segunda escrita mantém primeiro + telemetria", () => {
  let env = base();
  env = gravarSinalAppendOnce(env, "pd", {
    id: "pd",
    valor: false,
    fonte: "detectarPedidoDecisaoExplicita",
    em: "2026-09-12T15:00:00.000Z",
    fase: "sinais"
  });
  const depois = gravarSinalAppendOnce(env, "pd", {
    id: "pd",
    valor: true,
    fonte: "intruso",
    em: "2026-09-12T15:01:00.000Z",
    fase: "sinais"
  });
  assert.equal(depois.sinais.pd.valor, false);
  assert.equal(depois.sinais.pd.fonte, "detectarPedidoDecisaoExplicita");
  assert.ok(
    depois.rastreio.some(
      (p) => p.fase === "append_once_rejeitado" && p.chave === "pd"
    )
  );
});

test("B1: selarInterpretacao — só materializa campos da decisão; sem escolha própria", () => {
  let env = base();
  env = gravarSinalAppendOnce(env, "consulta", {
    id: "consulta",
    valor: true,
    fonte: "detectarPedidoConsultaResposta",
    em: "2026-09-12T15:00:00.000Z",
    fase: "sinais"
  });

  const decisao = {
    modo: "informar",
    objecto: "B",
    autoridade: "precedencia_v1",
    intençãoAtual: {
      classe: "C1",
      destino: "resposta_leve",
      confiança: null,
      sinais: ["consulta"]
    },
    sinais: {
      destino: {
        id: "destino",
        valor: "resposta_leve",
        fonte: "resolverPrecedenciaTurno",
        em: "2026-09-12T15:00:01.000Z",
        fase: "selagem"
      },
      classe_c: {
        id: "classe_c",
        valor: "C1",
        fonte: "resolverPrecedenciaTurno",
        em: "2026-09-12T15:00:01.000Z",
        fase: "selagem"
      }
    }
  };

  const selado = selarInterpretacao(env, decisao);
  assert.equal(selado.modo, "informar");
  assert.equal(selado.objecto, "B");
  assert.equal(selado.autoridade, "precedencia_v1");
  assert.deepEqual(selado.intençãoAtual, decisao.intençãoAtual);
  assert.ok(Object.isFrozen(selado.intençãoAtual));
  assert.equal(selado.sinais.consulta.valor, true);
  assert.equal(selado.sinais.destino.valor, "resposta_leve");
  assert.equal(selado.sinais.classe_c.valor, "C1");
  assert.ok(selado.rastreio.some((p) => p.fase === "selagem"));
  // Âncoras Fatia 0
  assert.equal(selado.mensagemAtual, "mensagem âncora B1");
  assert.equal(selado.perguntaAtual, selado.mensagemAtual);
  assert.equal(selado.coaId, "prj-b1");
});

test("B1: selarInterpretacao — ausência de campo na decisão não inventa modo", () => {
  const env = base();
  const selado = selarInterpretacao(env, {
    objecto: "A"
    // sem modo
  });
  assert.equal(selado.modo, null);
  assert.equal(selado.objecto, "A");
});

test("B1: selarInterpretacao — não reavalia mapa (copia modo literal mesmo se 'estranho')", () => {
  const env = base();
  const selado = selarInterpretacao(env, { modo: "valor_vindo_da_precedencia" });
  assert.equal(selado.modo, "valor_vindo_da_precedencia");
});

test("B1: mutação in-place de sinais/rastreio após COW falha", () => {
  let env = base();
  env = gravarSinalAppendOnce(env, "ig", {
    valor: true,
    fonte: "t",
    em: "2026-09-12T15:00:00.000Z",
    fase: "sinais"
  });
  assert.throws(() => {
    env.sinais.novo = { valor: 1 };
  }, TypeError);
  assert.throws(() => {
    env.rastreio.push({ fase: "hack" });
  }, TypeError);
});
