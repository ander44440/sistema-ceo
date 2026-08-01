/**
 * Testes domínio Classificador — IMP-057 E1
 * (sem regras de classificação / Núcleo / Motor / UI).
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import {
  CLASSES_INTENCAO,
  CLASSE_POR_ID,
  ID_POR_CLASSE,
  LIMIAR_CONFIANCA,
  FLAGS_POR_CLASSE,
  DESTINO_POR_CLASSE,
  ehClasseIntencao,
  flagsDaClasse,
  destinoDaClasse,
  abaixoDoLimiar,
  validarSaida,
  montarSaida
} from "./dominio.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

test("E1-CA1: exactamente quatro classes; rejeição de ad hoc", () => {
  assert.equal(CLASSES_INTENCAO.length, 4);
  assert.deepEqual([...CLASSES_INTENCAO], [
    "conhecimento_geral",
    "conversa_projeto",
    "trabalho_executivo",
    "comando_operacional"
  ]);
  assert.equal(CLASSE_POR_ID.C1, "conhecimento_geral");
  assert.equal(CLASSE_POR_ID.C2, "conversa_projeto");
  assert.equal(CLASSE_POR_ID.C3, "trabalho_executivo");
  assert.equal(CLASSE_POR_ID.C4, "comando_operacional");
  assert.equal(ID_POR_CLASSE.conhecimento_geral, "C1");

  for (const c of CLASSES_INTENCAO) {
    assert.equal(ehClasseIntencao(c), true);
  }
  assert.equal(ehClasseIntencao("conhecimento"), false);
  assert.equal(ehClasseIntencao("C1"), false);
  assert.equal(ehClasseIntencao("deliberar"), false);
  assert.equal(
    validarSaida({
      classe: "marketing",
      confianca: 1,
      razaoCurta: "x",
      destino: "resposta_leve",
      usaFrenteActiva: false,
      permiteJob: false
    }).ok,
    false
  );
});

test("E1-CA2: contrato RF7 — campos e tipos", () => {
  const ok = montarSaida("conhecimento_geral", 0.9, "Saudação genérica");
  assert.equal(validarSaida(ok).ok, true);
  assert.equal(typeof ok.classe, "string");
  assert.equal(typeof ok.confianca, "number");
  assert.equal(typeof ok.razaoCurta, "string");
  assert.equal(typeof ok.destino, "string");
  assert.equal(typeof ok.usaFrenteActiva, "boolean");
  assert.equal(typeof ok.permiteJob, "boolean");

  assert.equal(validarSaida(null).ok, false);
  assert.equal(
    validarSaida({
      classe: "conhecimento_geral",
      confianca: 1.5,
      razaoCurta: "x",
      destino: "resposta_leve",
      usaFrenteActiva: false,
      permiteJob: false
    }).ok,
    false
  );
  assert.equal(
    validarSaida({
      classe: "conhecimento_geral",
      confianca: 0.9,
      razaoCurta: "",
      destino: "resposta_leve",
      usaFrenteActiva: false,
      permiteJob: false
    }).ok,
    false
  );
  assert.equal(
    validarSaida({
      classe: "conhecimento_geral",
      confianca: 0.9,
      razaoCurta: "Usar CURSOR_API_KEY=x",
      destino: "resposta_leve",
      usaFrenteActiva: false,
      permiteJob: false
    }).ok,
    false
  );
  assert.equal(LIMIAR_CONFIANCA, 0.55);
  assert.equal(abaixoDoLimiar(0.54), true);
  assert.equal(abaixoDoLimiar(0.55), false);
});

test("E1-CA3: flags usaFrenteActiva / permiteJob por classe", () => {
  assert.deepEqual(FLAGS_POR_CLASSE.conhecimento_geral, {
    usaFrenteActiva: false,
    permiteJob: false
  });
  assert.deepEqual(FLAGS_POR_CLASSE.conversa_projeto, {
    usaFrenteActiva: true,
    permiteJob: false
  });
  assert.deepEqual(FLAGS_POR_CLASSE.trabalho_executivo, {
    usaFrenteActiva: true,
    permiteJob: true
  });
  assert.deepEqual(FLAGS_POR_CLASSE.comando_operacional, {
    usaFrenteActiva: false,
    permiteJob: false
  });

  const c1 = montarSaida("conhecimento_geral", 0.95, "Facto geral");
  assert.equal(c1.usaFrenteActiva, false);
  assert.equal(c1.permiteJob, false);
  assert.equal(c1.destino, "resposta_leve");

  const c2 = montarSaida("conversa_projeto", 0.8, "Pergunta sobre COA");
  assert.equal(c2.usaFrenteActiva, true);
  assert.equal(c2.permiteJob, false);
  assert.equal(c2.destino, "nucleo_mre");

  const c3 = montarSaida("trabalho_executivo", 0.85, "Despacho de implementação");
  assert.equal(c3.usaFrenteActiva, true);
  assert.equal(c3.permiteJob, true);
  assert.equal(c3.destino, "motor_execucao");

  const c4 = montarSaida("comando_operacional", 0.9, "Listar jobs");
  assert.equal(c4.usaFrenteActiva, false);
  assert.equal(c4.permiteJob, false);
  assert.equal(c4.destino, "capacidade_operacional");

  // C4 override Job tipado (fila operacional)
  const c4job = montarSaida("comando_operacional", 0.9, "Publicar job operacional", {
    permiteJobOverride: true
  });
  assert.equal(c4job.permiteJob, true);

  // Flags incoerentes rejeitadas
  assert.equal(
    validarSaida({
      classe: "conhecimento_geral",
      confianca: 1,
      razaoCurta: "x",
      destino: "resposta_leve",
      usaFrenteActiva: true,
      permiteJob: false
    }).ok,
    false
  );
  assert.equal(
    validarSaida({
      classe: "trabalho_executivo",
      confianca: 1,
      razaoCurta: "x",
      destino: "motor_execucao",
      usaFrenteActiva: true,
      permiteJob: false
    }).ok,
    false
  );

  assert.equal(flagsDaClasse("conversa_projeto").usaFrenteActiva, true);
  assert.equal(destinoDaClasse("trabalho_executivo"), "motor_execucao");
});

test("E1-CA4: domínio sem I/O, UI, Fila, Motor ou SDK", () => {
  const src = readFileSync(join(__dirname, "dominio.js"), "utf8");
  assert.equal(/@cursor\/sdk/.test(src), false);
  assert.equal(/node:fs|writeFile|fetch\(/.test(src), false);
  assert.equal(/document\.|window\./.test(src), false);
  assert.equal(/from\s+["'].*motorExecucao/.test(src), false);
  assert.equal(/from\s+["'].*executiveEngine/.test(src), false);
  assert.equal(/from\s+["'].*fila|queue/i.test(src), false);
  assert.equal(/classificarIntencao\s*\(/.test(src), false);
});

test("limiar: confiança baixa força clarificação e bloqueia Job", () => {
  const s = montarSaida("trabalho_executivo", 0.4, "Ambíguo");
  assert.equal(s.precisaClarificacao, true);
  assert.equal(s.destino, "clarificacao");
  assert.equal(s.permiteJob, false);
  assert.equal(validarSaida(s).ok, true);
});
