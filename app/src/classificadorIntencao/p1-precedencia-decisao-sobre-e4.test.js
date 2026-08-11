/**
 * Precedência: pedido explícito de decisão > E4/C4 recomendação operacional.
 */
import assert from "node:assert/strict";
import { test, beforeEach } from "node:test";
import { classificar } from "./regras.js";
import { ehRecomendacaoOperacional } from "./recomendacaoOperacional.js";
import { detectarPedidoDecisaoExplicita } from "./pedidoDecisaoExplicita.js";
import { mapearCapacidadePorTexto } from "../executiveEngine/classificar.js";
import { primeiroPassoClassificar } from "./integracaoNucleo.js";
import {
  criarProjeto,
  obterProjetoAtivo,
  obterProjetoAtivoId,
  recarregarCatalogo,
  inicializarCatalogo,
  selecionarProjeto
} from "../catalogoProjetos/index.js";
import { atualizarAposInstrucao } from "../executiveMemory/index.js";
import { detectarPedidoAnaliseDeliberativa } from "../mre/politicaAnaliseDeliberativa.js";

function criarStorage() {
  const map = new Map();
  return {
    getItem(k) {
      return map.has(String(k)) ? map.get(String(k)) : null;
    },
    setItem(k, v) {
      map.set(String(k), String(v));
    },
    removeItem(k) {
      map.delete(String(k));
    }
  };
}

function resetCatalogo() {
  globalThis.localStorage = criarStorage();
  recarregarCatalogo();
  inicializarCatalogo();
}

beforeEach(() => {
  resetCatalogo();
});

const MSG_DECIDA_PRIORIDADE =
  "Decida a prioridade entre Engenharia, Financeiro e Comercial.";

const MSG_CONFLITO_DECIDE = `Engenharia recomenda priorizar estabilidade técnica.
Financeiro recomenda cortar custo imediatamente.
Comercial recomenda acelerar aquisição de clientes.

Contexto: empresa AlfaTech.
Decide a prioridade executiva sob este conflito.`;

test('1: "Decida a prioridade entre A e B" → C2/MRE (não E4)', () => {
  const texto = "Decida a prioridade entre A e B";
  assert.equal(detectarPedidoDecisaoExplicita(texto), true);
  assert.equal(ehRecomendacaoOperacional(texto), false);
  const s = classificar(texto);
  assert.equal(s.classe, "conversa_projeto");
  assert.equal(s.destino, "nucleo_mre");
  const mapa = mapearCapacidadePorTexto(texto);
  assert.notEqual(mapa.id, "recomendar_operacional");
  const rota = primeiroPassoClassificar(texto, { frenteActiva: true });
  assert.equal(rota.destino, "nucleo_mre");
});

test('2: "Qual deveria ser a prioridade?" → E4/C4 normal', () => {
  const texto = "Qual deveria ser a prioridade?";
  assert.equal(detectarPedidoDecisaoExplicita(texto), false);
  assert.equal(ehRecomendacaoOperacional(texto), true);
  const s = classificar(texto);
  assert.equal(s.classe, "comando_operacional");
  assert.equal(s.destino, "capacidade_operacional");
  assert.equal(mapearCapacidadePorTexto(texto).id, "recomendar_operacional");
});

test('3: "Analise as prioridades da equipe" → deliberativo (não E4 forçado)', () => {
  const texto = "Analise as prioridades da equipe";
  assert.equal(detectarPedidoDecisaoExplicita(texto), false);
  assert.equal(ehRecomendacaoOperacional(texto), false);
  const s = classificar(texto);
  assert.equal(s.classe, "conversa_projeto");
  assert.equal(s.destino, "nucleo_mre");
  // P1-2 / análise — não é desvio E4
  assert.equal(detectarPedidoAnaliseDeliberativa(texto), true);
});

test("4: conflito + Decide a prioridade → não contorna MRE (mesmo com «recomenda»)", () => {
  assert.equal(detectarPedidoDecisaoExplicita(MSG_CONFLITO_DECIDE), true);
  assert.equal(ehRecomendacaoOperacional(MSG_CONFLITO_DECIDE), false);
  const s = classificar(MSG_CONFLITO_DECIDE);
  assert.equal(s.classe, "conversa_projeto");
  assert.equal(s.destino, "nucleo_mre");
  assert.notEqual(s.destino, "capacidade_operacional");
  assert.equal(
    /E4: recomendação operacional/.test(String(s.razaoCurta || "")),
    false
  );  assert.notEqual(
    mapearCapacidadePorTexto(MSG_CONFLITO_DECIDE).id,
    "recomendar_operacional"
  );
  const rota = primeiroPassoClassificar(MSG_CONFLITO_DECIDE, {
    frenteActiva: true
  });
  assert.equal(rota.destino, "nucleo_mre");
});

test("5: contexto AlfaTech permanece intacto sob pedido de decisão", () => {
  const alfa = criarProjeto({ nome: "AlfaTech" });
  selecionarProjeto(alfa.id);
  assert.equal(obterProjetoAtivo()?.nome, "AlfaTech");

  assert.equal(ehRecomendacaoOperacional(MSG_DECIDA_PRIORIDADE), false);
  classificar(MSG_DECIDA_PRIORIDADE);
  mapearCapacidadePorTexto(MSG_CONFLITO_DECIDE);

  assert.equal(obterProjetoAtivoId(), alfa.id);
  assert.equal(obterProjetoAtivo()?.nome, "AlfaTech");
});

test("6: menção incidental a MG2 não altera projecto activo (AlfaTech)", () => {
  const alfa = criarProjeto({ nome: "AlfaTech" });
  selecionarProjeto(alfa.id);

  const texto = `${MSG_DECIDA_PRIORIDADE}
Continuo em AlfaTech; Motoboy Game 2 / MG2 foi só referência lateral.`;
  assert.equal(detectarPedidoDecisaoExplicita(texto), true);
  assert.equal(ehRecomendacaoOperacional(texto), false);
  assert.equal(classificar(texto).destino, "nucleo_mre");

  atualizarAposInstrucao({
    instrucao: texto,
    capacidade: "ia",
    ok: true,
    mensagem: "ok"
  });

  assert.equal(obterProjetoAtivoId(), alfa.id);
  assert.equal(obterProjetoAtivo()?.nome, "AlfaTech");
});
