/**
 * IMP-091 — residual E2.3/E2.2: com sinais, ehIntencaoExecutivaE21 não reavalia objecto/PD.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  ehAutoexplicacaoInstitucionalE23,
  ehConhecimentoGeralE22,
  ehIntencaoExecutivaE21,
  normalizarTexto
} from "../classificadorIntencao/regras.js";
import {
  objectoDoTurno,
  OBJECTO_TURNO
} from "../classificadorIntencao/recomendacaoOperacional.js";
import { detectarPedidoDecisaoExplicita } from "../classificadorIntencao/pedidoDecisaoExplicita.js";
import { validarContextoAtivo } from "../classificadorIntencao/validadorContextoAtivo.js";
import { classificar } from "../classificadorIntencao/regras.js";

function contador(fn) {
  const wrap = (...args) => {
    wrap.calls += 1;
    wrap.lastArgs = args;
    return fn(...args);
  };
  wrap.calls = 0;
  wrap.lastArgs = null;
  return wrap;
}

test("E2.3: com objecto/pd/analise → objectoDoTurno e PD = 0", () => {
  const t = normalizarTexto("Qual é o seu papel no Sistema CEO?");
  const spyObj = contador(objectoDoTurno);
  const spyPd = contador(detectarPedidoDecisaoExplicita);
  const opts = {
    objectoTurno: OBJECTO_TURNO.INDEFINIDO,
    pedidoDecisaoExplicita: false,
    pedidoAnaliseDeliberativa: false,
    calcObjectoDoTurno: spyObj,
    detectarPedidoDecisaoExplicita: spyPd
  };
  assert.equal(ehAutoexplicacaoInstitucionalE23(t, [], opts), true);
  assert.equal(spyObj.calls, 0);
  assert.equal(spyPd.calls, 0);
  assert.equal(ehIntencaoExecutivaE21(t, [], opts), false);
});

test("E2.2: com objecto/pd → objectoDoTurno = 0", () => {
  const t = normalizarTexto("O que é um ADR?");
  const spyObj = contador(objectoDoTurno);
  const opts = {
    objectoTurno: OBJECTO_TURNO.INDEFINIDO,
    pedidoDecisaoExplicita: false,
    pedidoAnaliseDeliberativa: false,
    calcObjectoDoTurno: spyObj
  };
  assert.equal(ehConhecimentoGeralE22(t, [], opts), true);
  assert.equal(spyObj.calls, 0);
});

test("E2.3 fallback sem sinais: ainda detecta e pode chamar objectoDoTurno", () => {
  const t = normalizarTexto("Qual é o seu papel no Sistema CEO?");
  const spyObj = contador(objectoDoTurno);
  assert.equal(
    ehAutoexplicacaoInstitucionalE23(t, [], { calcObjectoDoTurno: spyObj }),
    true
  );
  // Fallback pode ou não chamar objecto (texto meta); equivalência semântica
  assert.equal(ehAutoexplicacaoInstitucionalE23(t), true);
  assert.equal(ehIntencaoExecutivaE21(t), false);
});

test("E2.3 via VCA oficial: analise=true short-circuit → 0 objectoDoTurno", () => {
  const spyObj = contador(objectoDoTurno);
  const r = validarContextoAtivo({
    mensagem: "Qual é o seu papel?",
    objectoTurno: OBJECTO_TURNO.INDEFINIDO,
    pedidoDecisaoExplicita: false,
    pedidoAnaliseDeliberativa: true,
    calcObjectoDoTurno: spyObj
  });
  assert.equal(r.veredicto, "metaconversa");
  assert.equal(spyObj.calls, 0);
});

test("E2.3 via classificar com sinais: C2 sem reavaliar destino", () => {
  const texto = "Qual é o seu papel no Sistema CEO?";
  const s = classificar(texto, {
    objectoTurno: OBJECTO_TURNO.INDEFINIDO,
    pedidoDecisaoExplicita: false,
    pedidoAnaliseDeliberativa: false
  });
  assert.equal(s.classe, "conversa_projeto");
  assert.match(s.razaoCurta || "", /E2\.3/i);
});

test("E2.2 fallback sem sinais preserva C1", () => {
  assert.equal(ehConhecimentoGeralE22(normalizarTexto("O que é um ADR?")), true);
  const s = classificar("O que é um ADR?");
  assert.equal(s.classe, "conhecimento_geral");
});
