/**
 * Testes regras/lexicon — IMP-057 E2
 * (sem Núcleo / Motor / UI / Dispatcher).
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { LIMIAR_CONFIANCA } from "./dominio.js";
import {
  classificar,
  temVerboExecucao,
  desambiguarJobs,
  calcularConfianca,
  resolverEmpates
} from "./regras.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

test("E2-CA1: fixtures C1 → conhecimento_geral sem Job", () => {
  for (const texto of [
    "Que horas são?",
    "Bom dia",
    "Oi",
    "Quem és tu?",
    "O que é um ADR?"
  ]) {
    const s = classificar(texto);
    assert.equal(s.classe, "conhecimento_geral", texto);
    assert.equal(s.permiteJob, false, texto);
    assert.equal(s.usaFrenteActiva, false, texto);
    assert.ok(s.confianca >= LIMIAR_CONFIANCA, `${texto} conf=${s.confianca}`);
    assert.equal(s.destino, "resposta_leve", texto);
  }
});

test("E2-CA2: fixtures C4 (status/jobs listar) → comando_operacional, não C3", () => {
  for (const texto of [
    "Lista os jobs pendentes",
    "Mostrar jobs",
    "status",
    "estado atual",
    "Mostra o painel",
    "memória executiva"
  ]) {
    const s = classificar(texto);
    assert.equal(s.classe, "comando_operacional", texto);
    assert.notEqual(s.classe, "trabalho_executivo", texto);
    assert.equal(s.destino, "capacidade_operacional", texto);
  }
  assert.equal(desambiguarJobs("lista os jobs pendentes"), "c4");
  assert.equal(desambiguarJobs("cria um job para outdoor"), "c3");
});

test("E2-CA3: empate C2/C3 sem verbo de execução → C2", () => {
  const semVerbo = classificar("Onde estamos no outdoor?", {
    frenteActiva: true
  });
  assert.equal(semVerbo.classe, "conversa_projeto");
  assert.equal(semVerbo.permiteJob, false);
  assert.equal(temVerboExecucao("onde estamos no outdoor"), false);

  const comVerbo = classificar(
    "Implementa o outdoor lateral e despacha",
    { frenteActiva: true }
  );
  assert.equal(comVerbo.classe, "trabalho_executivo");
  assert.equal(comVerbo.permiteJob, true);
  assert.equal(comVerbo.destino, "motor_execucao");

  const empate = resolverEmpates(
    {
      conhecimento_geral: 0,
      conversa_projeto: 0.75,
      trabalho_executivo: 0.72,
      comando_operacional: 0
    },
    "outdoor no mg2",
    { frenteActiva: true }
  );
  assert.equal(empate.classe, "conversa_projeto");
});

test("E2-CA4: confiança < 0,55 ⇒ clarificação; nunca C3+Job", () => {
  const vago = classificar("resolve isso");
  assert.ok(
    vago.precisaClarificacao === true || vago.confianca < LIMIAR_CONFIANCA
  );
  assert.equal(vago.permiteJob, false);
  if (vago.precisaClarificacao) {
    assert.equal(vago.destino, "clarificacao");
  }
  // mesmo que a classe candidata fosse C3, Job fica bloqueado
  assert.notEqual(
    vago.permiteJob && vago.classe === "trabalho_executivo",
    true
  );

  const vazio = classificar("  ");
  assert.equal(vazio.precisaClarificacao, true);
  assert.equal(vazio.permiteJob, false);

  assert.ok(calcularConfianca(0.4, 0.35, true) < LIMIAR_CONFIANCA);
});

test("E2-CA5: módulo puro sem fetch/Fila/SDK/Núcleo/Motor", () => {
  for (const f of ["regras.js", "lexicon.js"]) {
    const src = readFileSync(join(__dirname, f), "utf8");
    assert.equal(/@cursor\/sdk/.test(src), false, f);
    assert.equal(/\bfetch\s*\(/.test(src), false, f);
    assert.equal(/node:fs|writeFile/.test(src), false, f);
    assert.equal(/from\s+["'].*executiveEngine/.test(src), false, f);
    assert.equal(/from\s+["'].*motorExecucao/.test(src), false, f);
    assert.equal(/document\.|window\./.test(src), false, f);
  }
});

test("CU2/CU5 e RF9: frente activa + projecto", () => {
  const c2 = classificar("O que sabes do MG2?", { frenteActiva: true });
  assert.equal(c2.classe, "conversa_projeto");
  assert.equal(c2.usaFrenteActiva, true);
  assert.equal(c2.permiteJob, false);

  const fazAi = classificar("faz aí");
  assert.equal(fazAi.permiteJob, false);
});
