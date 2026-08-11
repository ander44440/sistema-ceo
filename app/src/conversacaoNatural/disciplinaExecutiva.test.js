/**
 * CTO-002 — Disciplina executiva (Deliberar / Executar).
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  detectarModoExecutivo,
  ehObjectivoInventado,
  ehOrdemOperacional,
  extrairEfeitoEsperado,
  filtrarObjectivoInventado,
  montarAckExecucao
} from "./disciplinaExecutiva.js";
import { detectarModoAdaptacao } from "./adaptacaoConversacional.js";
import { filtrarPlaceholderObjectivo } from "./contextoImediato.js";
import { sanitizarProsaUsuario } from "./sanitizarProsa.js";
import { comporPorTipo } from "./compor.js";
import { TIPO_TURNO } from "./tiposTurno.js";

test("detecta EXECUTAR em autoridade e despacho", () => {
  assert.equal(
    detectarModoExecutivo({ instrucao: "AUTORIZADO" }),
    "executar"
  );
  assert.equal(
    detectarModoExecutivo({
      instrucao: "ENVIE AO CURSOR"
    }),
    "executar"
  );
  assert.equal(
    detectarModoExecutivo({
      instrucao: "FAVOR DESPACHAR NOVAMENTE"
    }),
    "executar"
  );
  assert.equal(
    detectarModoExecutivo({
      instrucao: "NAO MUDAMOS, A PRIORIDADE É DESPACHAR AO CURSOR"
    }),
    "executar"
  );
});

test("detecta DELIBERAR em exploração", () => {
  assert.equal(
    detectarModoExecutivo({
      instrucao: "O que achas das opções para as vias?"
    }),
    "deliberar"
  );
});

test("não inventa objectivo placeholder", () => {
  assert.equal(
    ehObjectivoInventado(
      "Definir o efeito esperado da última instrução ou pedir o estado atual."
    ),
    true
  );
  assert.equal(
    filtrarObjectivoInventado(
      "Definir o efeito esperado da última instrução ou pedir o estado atual."
    ),
    null
  );
  assert.equal(
    filtrarPlaceholderObjectivo(
      "Definir o efeito esperado da última instrução ou pedir o estado atual."
    ),
    null
  );
  assert.equal(
    filtrarPlaceholderObjectivo("Nomear todas as vias do MG2"),
    "Nomear todas as vias do MG2"
  );
});

test("extrai efeito esperado da instrução do utilizador", () => {
  const efeito = extrairEfeitoEsperado(
    "O efeito esperado: QUE TODAS AS VIAS SEJAM IDENTIFICADAS POR NOMES. ENVIE AO CURSOR"
  );
  assert.match(efeito, /VIAS.*NOMES/i);
});

test("ordem operacional reconhecida", () => {
  assert.equal(ehOrdemOperacional("AUTORIZADO"), true);
  assert.equal(ehOrdemOperacional("REENVIAR AO CURSOR"), true);
  assert.equal(ehOrdemOperacional("Como devemos organizar?"), false);
});

test("ack de execução é curto", () => {
  const t = montarAckExecucao({
    oQue: "Despacho iniciado.",
    resultado: "Job JOB-000038 em pending.",
    proximo: "Definir o efeito esperado da última instrução."
  });
  assert.match(t, /Despacho iniciado/);
  assert.doesNotMatch(t, /efeito esperado/i);
});

test("modo adaptacao força execucao sob CTO-002", () => {
  assert.equal(
    detectarModoAdaptacao({ instrucao: "FORCE O ENVIO NOVAMENTE" }),
    "execucao"
  );
});

test("ESPELHO em EXECUTAR não pede confirmação de prioridade", () => {
  const out = comporPorTipo(TIPO_TURNO.ESPELHO, {
    parecer: null,
    ctxImediato: {
      objectivoPrincipal:
        "Definir o efeito esperado da última instrução ou pedir o estado atual.",
      missaoActiva: true
    },
    mensagemOriginal: "",
    canal: "chat",
    instrucao: "AUTORIZADO"
  });
  assert.doesNotMatch(out.texto, /mudámos de prioridade/i);
  assert.doesNotMatch(out.texto, /efeito esperado/i);
  assert.equal(out.perguntas.length, 0);
});

test("sanitizar remove objectivo inventado da prosa", () => {
  const t = sanitizarProsaUsuario(
    "Objectivo principal: Definir o efeito esperado da última instrução ou pedir o estado atual..\n\nFeito."
  );
  assert.doesNotMatch(t, /efeito esperado/i);
  assert.match(t, /Feito/);
});
