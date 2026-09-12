/**
 * IMP-091 B2 — ponto único de sinais + BLOQUEIO-1/5.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  criarTurnEnvelope,
  OBJECTO_INDEFINIDO
} from "./index.js";
import {
  produzirSinaisTurno,
  CATALOGO_SINAIS_FATIA1,
  lerSinalBoolean,
  detectarPanoramaEstadoGeralActual
} from "./produzirSinais.js";
import { detectarPedidoInfoGathering } from "../classificadorIntencao/pedidoInfoGathering.js";
import { detectarPedidoDecisaoExplicita } from "../classificadorIntencao/pedidoDecisaoExplicita.js";
import {
  detectarPedidoConsultaResposta,
  detectarPedidoAnaliseDeliberativa
} from "../mre/politicaAnaliseDeliberativa.js";
import { ehPedidoSituacionalTrabalho } from "../classificadorIntencao/regras.js";
import { objectoDoTurno } from "../classificadorIntencao/recomendacaoOperacional.js";
import {
  ehPedidoConsultaOuRespostaComposta,
  ehOrdemExecucaoOperacional
} from "../autoridadeDelegada/autoridadeDelegada.js";
import { COA_VV, T1_VALEVERDE, T2_PRIORIDADE } from "./imp091-b0-fixtures.js";
import { seleccionarFioCoa } from "../classificadorIntencao/fioConversacional.js";
import { classificar } from "../classificadorIntencao/regras.js";
import { OBJECTO_TURNO } from "../classificadorIntencao/recomendacaoOperacional.js";
import { ehRecomendacaoOperacional } from "../classificadorIntencao/recomendacaoOperacional.js";

function contador(fn) {
  const wrap = (...args) => {
    wrap.calls += 1;
    return fn(...args);
  };
  wrap.calls = 0;
  return wrap;
}

test("B2: catálogo fechado — sem sinais.situacional; consulta canónico", () => {
  const env0 = criarTurnEnvelope({
    mensagemAtual: "qual é o próximo passo do trabalho?",
    coaIdEntrada: "prj-mg2"
  });
  const env = produzirSinaisTurno(env0, { fioCoa: [] });
  assert.equal(env.sinais.situacional, undefined);
  assert.equal(
    Object.prototype.hasOwnProperty.call(env.sinais, "situacional"),
    false
  );
  assert.equal(env.sinais.consulta.valor, true);
  assert.equal(env.derivacoes.situacional, true);
  for (const k of Object.keys(env.sinais)) {
    assert.ok(
      CATALOGO_SINAIS_FATIA1.includes(k),
      `chave fora do catálogo: ${k}`
    );
  }
  assert.equal(env.objecto, OBJECTO_INDEFINIDO);
});

test("B2: objectoDoTurno uma vez; classificador consome objectoTurno sem recalcular", () => {
  const fio = seleccionarFioCoa(
    [{ papel: "usuario", texto: T1_VALEVERDE, coaId: COA_VV }],
    T2_PRIORIDADE,
    { coaId: COA_VV }
  );
  const objectoSpy = contador(objectoDoTurno);
  const env = produzirSinaisTurno(
    criarTurnEnvelope({
      mensagemAtual: T2_PRIORIDADE,
      coaIdEntrada: COA_VV
    }),
    { fioCoa: fio, produtores: { objectoDoTurno: objectoSpy } }
  );
  assert.equal(objectoSpy.calls, 1);
  assert.equal(env.sinais.objecto_turno.valor, OBJECTO_TURNO.B);

  assert.equal(
    ehRecomendacaoOperacional(T2_PRIORIDADE, fio, {
      objectoTurno: env.sinais.objecto_turno.valor
    }),
    false
  );

  const saida = classificar(T2_PRIORIDADE, {
    fioCoa: fio,
    objectoTurno: env.sinais.objecto_turno.valor
  });
  assert.equal(saida.classe, "conversa_projeto");
  assert.equal(saida.destino, "nucleo_mre");
  // produzirSinais não voltou a chamar o spy
  assert.equal(objectoSpy.calls, 1);
});

test("B2: isolamento COA — fio outro COA não entra no objecto", () => {
  const fio = seleccionarFioCoa(
    [
      {
        papel: "usuario",
        texto: "Analise a proposta do bairro popular segundo o Manifesto.",
        coaId: "prj-mg2"
      },
      { papel: "usuario", texto: T1_VALEVERDE, coaId: COA_VV }
    ],
    T2_PRIORIDADE,
    { coaId: COA_VV }
  );
  const env = produzirSinaisTurno(
    criarTurnEnvelope({ mensagemAtual: T2_PRIORIDADE, coaIdEntrada: COA_VV }),
    { fioCoa: fio }
  );
  assert.equal(env.sinais.objecto_turno.valor, OBJECTO_TURNO.B);
  assert.equal(fio.length, 1);
});

test("B2: produtores canónicos ≤1× dentro de produzirSinaisTurno", () => {
  const produtores = {
    detectarPedidoInfoGathering: contador(detectarPedidoInfoGathering),
    detectarPedidoDecisaoExplicita: contador(detectarPedidoDecisaoExplicita),
    detectarPedidoConsultaResposta: contador(detectarPedidoConsultaResposta),
    detectarPedidoAnaliseDeliberativa: contador(detectarPedidoAnaliseDeliberativa),
    ehPedidoSituacionalTrabalho: contador(ehPedidoSituacionalTrabalho),
    ehPedidoConsultaOuRespostaComposta: contador(ehPedidoConsultaOuRespostaComposta),
    ehOrdemExecucaoOperacional: contador(ehOrdemExecucaoOperacional),
    objectoDoTurno: contador(objectoDoTurno),
    detectarPanoramaEstadoGeralActual: contador(detectarPanoramaEstadoGeralActual)
  };

  produzirSinaisTurno(
    criarTurnEnvelope({ mensagemAtual: "olá", coaIdEntrada: "x" }),
    { fioCoa: [], produtores }
  );

  for (const [nome, fn] of Object.entries(produtores)) {
    assert.equal(fn.calls, 1, `${nome} deve correr 1×`);
  }
});

test("B2: BLOQUEIO-1 — consulta plain ≡ situacional na baseline S1b/S2", () => {
  for (const texto of [
    "qual é o próximo passo do trabalho?",
    "qual é o próximo passo? executa o LOD agora"
  ]) {
    const env = produzirSinaisTurno(
      criarTurnEnvelope({ mensagemAtual: texto, coaIdEntrada: "prj-mg2" }),
      { fioCoa: [] }
    );
    assert.equal(env.sinais.consulta.valor, env.derivacoes.situacional);
    assert.equal(lerSinalBoolean(env, "consulta"), env.derivacoes.situacional);
  }
});

test("B2: Fatia 0 — mensagemAtual/coaId intactos após sinais", () => {
  const env0 = criarTurnEnvelope({
    mensagemAtual: "âncora",
    coaIdEntrada: "coa-1"
  });
  const env = produzirSinaisTurno(env0, { fioCoa: [] });
  assert.equal(env.mensagemAtual, "âncora");
  assert.equal(env.perguntaAtual, "âncora");
  assert.equal(env.coaId, "coa-1");
  assert.equal(env.modo, null);
  assert.equal(env.intençãoAtual, null);
  assert.ok(Object.isFrozen(env));
});
