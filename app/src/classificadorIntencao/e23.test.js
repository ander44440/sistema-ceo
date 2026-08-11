/**
 * Emenda E2.3 — Autoexplicação Institucional do CEO (IMP-057).
 */
import assert from "node:assert/strict";
import { test, beforeEach } from "node:test";

import { executiveEngine } from "../executiveEngine/index.js";
import { reiniciarAutoridadeDelegadaParaTestes } from "../autoridadeDelegada/autoridadeDelegada.js";
import { LIMIAR_CONFIANCA } from "./dominio.js";
import {
  classificar,
  ehAutoexplicacaoInstitucionalE23,
  ehIntencaoExecutivaE21,
  normalizarTexto
} from "./regras.js";
import { classificarEEncaminhar } from "./encaminhador.js";

beforeEach(() => {
  reiniciarAutoridadeDelegadaParaTestes();
});

/** Exemplos obrigatórios CA-E2.3-1…7 */
export const EXEMPLOS_E23 = Object.freeze([
  ["CA-E2.3-1", "Qual é o seu papel?"],
  ["CA-E2.3-2", "Como você toma decisões?"],
  ["CA-E2.3-3", "Quando você decide criar um Job?"],
  ["CA-E2.3-4", "Quando você prefere apenas responder?"],
  ["CA-E2.3-5", "Qual a diferença entre você e o CTO?"],
  [
    "CA-E2.3-6",
    "Qual capacidade você considera mais importante desenvolver agora?"
  ],
  ["CA-E2.3-7", "Qual é a maior fraqueza do CEO hoje?"]
]);

test("CA-E2.3-1…7: autoexplicação institucional → conversa_projeto / nucleo_mre", () => {
  console.log("\n--- DEMO E2.3 ---");
  for (const [id, texto] of EXEMPLOS_E23) {
    const t = normalizarTexto(texto);
    assert.equal(ehAutoexplicacaoInstitucionalE23(t), true, `detect ${id}`);
    assert.equal(ehIntencaoExecutivaE21(t), false, `não E2.1 ${id}`);

    const s = classificar(texto);
    const rota = classificarEEncaminhar(texto);
    console.log({
      id,
      texto,
      classe: s.classe,
      destino: rota.destino,
      clarificacao: s.precisaClarificacao,
      conf: s.confianca
    });

    assert.equal(s.classe, "conversa_projeto", id);
    assert.equal(s.destino, "nucleo_mre", id);
    assert.equal(s.precisaClarificacao, false, id);
    assert.ok(s.confianca >= LIMIAR_CONFIANCA, `${id} conf=${s.confianca}`);
    assert.equal(s.permiteJob, false, id);
    assert.equal(rota.destino, "nucleo_mre", id);
    assert.notEqual(rota.destino, "clarificacao", id);
    assert.notEqual(rota.destino, "motor_execucao", id);
  }
  console.log("--- fim DEMO E2.3 ---\n");
});

test("CA-E2.3-8: nenhum Job", async () => {
  let jobs = 0;
  for (const [, texto] of EXEMPLOS_E23) {
    const out = await executiveEngine.executar(texto, {
      publicarJob: async () => {
        jobs += 1;
        return { id: "JOB-LEAK-E23", estado: "pending" };
      }
    });
    assert.equal(out.dados?.encaminhamento?.destino, "nucleo_mre", texto);
    assert.equal(out.dados?.classificacao?.classe, "conversa_projeto", texto);
    assert.equal(out.dados?.motorAcionado, false, texto);
  }
  assert.equal(jobs, 0);
});

test("CA-E2.3-9: nenhum Gate", async () => {
  for (const [, texto] of EXEMPLOS_E23) {
    const out = await executiveEngine.executar(texto);
    assert.equal(out.dados?.motor?.aguardandoGate, undefined, texto);
    assert.ok(!/aguardando aprovação|Gate G2/i.test(String(out.mensagem)), texto);
  }
});

test("CA-E2.3-10: nenhuma Clarificação", () => {
  for (const [, texto] of EXEMPLOS_E23) {
    const s = classificar(texto);
    const rota = classificarEEncaminhar(texto);
    assert.equal(s.precisaClarificacao, false, texto);
    assert.notEqual(rota.destino, "clarificacao", texto);
  }
});

test("E2.3: «criar um Job» meta não vira C3; imperativo E2.1 permanece C3", () => {
  const meta = classificar("Quando você decide criar um Job?");
  assert.equal(meta.classe, "conversa_projeto");
  assert.equal(meta.destino, "nucleo_mre");

  const exec = classificar("Crie um job para corrigir o bug.");
  assert.equal(exec.classe, "trabalho_executivo");
});

test("E2.3: variante longa do papel (produção)", () => {
  const s = classificar("Qual é o seu papel dentro desta empresa?");
  assert.equal(s.classe, "conversa_projeto");
  assert.equal(s.precisaClarificacao, false);
  assert.equal(s.destino, "nucleo_mre");
});

/** IMP-067 — léxico path meta expandido (identidade, propósito, Sistema CEO, EIC, limites). */
export const EXEMPLOS_E23_IMP067 = Object.freeze([
  ["IMP067-1", "Qual é o seu propósito?"],
  ["IMP067-2", "Qual a sua identidade?"],
  ["IMP067-3", "O que é o Sistema CEO?"],
  ["IMP067-4", "Como funciona o Sistema CEO?"],
  ["IMP067-5", "O que é a EIC?"],
  ["IMP067-6", "Quais são os seus limites?"],
  ["IMP067-7", "O que você não faz?"],
  ["IMP067-8", "Como funciona o Classificador de Intenção?"],
  ["IMP067-9", "Para que você existe?"]
]);

test("E2.3 IMP-067: léxico institucional expandido → C2 / sem Job", () => {
  for (const [id, texto] of EXEMPLOS_E23_IMP067) {
    const t = normalizarTexto(texto);
    assert.equal(ehAutoexplicacaoInstitucionalE23(t), true, `detect ${id}`);
    assert.equal(ehIntencaoExecutivaE21(t), false, `não E2.1 ${id}`);
    const s = classificar(texto);
    assert.equal(s.classe, "conversa_projeto", id);
    assert.equal(s.destino, "nucleo_mre", id);
    assert.equal(s.precisaClarificacao, false, id);
    assert.equal(s.permiteJob, false, id);
  }
});

test("E2.3 IMP-067: não captura C1 mundano / projecto / identidade local curta", () => {
  assert.equal(
    ehAutoexplicacaoInstitucionalE23(normalizarTexto("O que é um ADR?")),
    false
  );
  assert.equal(
    ehAutoexplicacaoInstitucionalE23(
      normalizarTexto("Como devemos priorizar outdoor vs LOD?")
    ),
    false
  );
  // «Quem és tu?» permanece fora de E2.3 → pergunta_identidade local
  assert.equal(
    ehAutoexplicacaoInstitucionalE23(normalizarTexto("Quem és tu?")),
    false
  );
});
