/**
 * Respostas contextualizadas — IMP-059 E5
 * Demos canónicas + CA1–CA5.
 */

import assert from "node:assert/strict";
import { test } from "node:test";
import { capacidadeIa } from "../executiveEngine/capacidades/ia.js";
import { consultarEstadoExecutivoAntesDeResponder } from "./consultarAntesDeResponder.js";
import {
  comporProsaLastro,
  garantirReflexoEstadoExecutivo
} from "./influenciaDeliberacao.js";

const AGORA = "2026-08-01T20:42:00.000Z";

const DEMO1_ESPERADO =
  "Neste momento existe uma execução em andamento para correção dos bugs.\n\n" +
  "Minha recomendação é concluir essa execução antes de redefinir as prioridades do MG2.";

const DEMO2_ESPERADO =
  "Existe um Gate aguardando sua decisão.\n\n" +
  "Minha recomendação é concluir essa aprovação antes de iniciar novas frentes.";

function leitoresBase() {
  return {
    F1: () => [],
    F2: () => [],
    F3: () => [],
    F4: () => ({ estado: "ocioso" }),
    F5: () => ({ estado: "ocioso", emCurso: false }),
    F6: () => ({ estado: "ocioso", ocupado: false }),
    F7: () => ({ disponivel: true, alertas: 0 }),
    F8: () => ({ id: "mg2", nome: "MG2" })
  };
}

test("E5 Demo 1 — Job em execução → prosa canónica", async () => {
  const r = await consultarEstadoExecutivoAntesDeResponder({
    idClasse: "C2",
    leitores: {
      ...leitoresBase(),
      F2: () => [
        { id: "JOB-BUGS", titulo: "correção dos bugs", status: "running" }
      ]
    },
    agora: () => AGORA
  });
  const instrucao = "Como devemos priorizar o MG2?";
  assert.equal(comporProsaLastro(r.lastroParaNucleo, instrucao), DEMO1_ESPERADO);

  const out = await capacidadeIa.executar({
    instrucao,
    intencao: { id: "deliberar", capacidade: "ia" },
    memoria: () => null,
    lastroConsciencia: r.lastroParaNucleo
  });
  assert.equal(out.mensagem, DEMO1_ESPERADO);
});

test("E5 Demo 2 — Gate pendente → prosa canónica (P1)", async () => {
  const r = await consultarEstadoExecutivoAntesDeResponder({
    idClasse: "C2",
    leitores: {
      ...leitoresBase(),
      F2: () => [
        { id: "JOB-X", titulo: "outro", status: "running" }
      ],
      F3: () => [
        { gateId: "G-1", parecerId: "PAR-1", resumo: "Aprovar" }
      ]
    },
    agora: () => AGORA
  });
  const instrucao = "O que devemos fazer agora?";
  assert.equal(comporProsaLastro(r.lastroParaNucleo, instrucao), DEMO2_ESPERADO);

  const out = await capacidadeIa.executar({
    instrucao,
    intencao: { id: "deliberar", capacidade: "ia" },
    memoria: () => null,
    lastroConsciencia: r.lastroParaNucleo
  });
  assert.equal(out.mensagem, DEMO2_ESPERADO);
});

test("E5 Demo 3 — sem contexto → deliberação normal (sem Estado Executivo artificial)", async () => {
  const r = await consultarEstadoExecutivoAntesDeResponder({
    idClasse: "C2",
    leitores: {
      F1: () => [],
      F2: () => [],
      F3: () => [],
      F4: () => ({ estado: "ocioso" }),
      F5: () => ({ estado: "ocioso", emCurso: false }),
      F6: () => ({ estado: "ocioso", ocupado: false }),
      F7: () => ({ disponivel: true, alertas: 0 }),
      F8: () => ({ id: null, nome: null })
    },
    agora: () => AGORA
  });
  assert.equal(r.lastroParaNucleo, null);
  assert.equal(comporProsaLastro(null, "Como devemos priorizar o MG2?"), null);

  const out = await capacidadeIa.executar({
    instrucao: "Como devemos priorizar o MG2?",
    intencao: { id: "deliberar", capacidade: "ia" },
    memoria: () => null
  });
  assert.equal(/Estado Executivo|execução em andamento|Gate aguardando/i.test(out.mensagem), false);
  assert.match(out.mensagem, /deliberar|linguagem|LLM|chave|frente/i);
});

test("E5-CA1/CA2/CA3: CU1–CU3", async () => {
  // CA1
  const job = await consultarEstadoExecutivoAntesDeResponder({
    idClasse: "C2",
    leitores: {
      ...leitoresBase(),
      F2: () => [
        { id: "J", titulo: "correção dos bugs", status: "running" }
      ]
    },
    agora: () => AGORA
  });
  assert.match(
    comporProsaLastro(job.lastroParaNucleo, "Como devemos priorizar o MG2?"),
    /execução em andamento/
  );

  // CA2
  const gate = await consultarEstadoExecutivoAntesDeResponder({
    idClasse: "C2",
    leitores: {
      ...leitoresBase(),
      F3: () => [{ gateId: "G", parecerId: "P" }]
    },
    agora: () => AGORA
  });
  assert.match(
    comporProsaLastro(gate.lastroParaNucleo, "O que devemos fazer agora?"),
    /Gate aguardando sua decisão/
  );

  // CA3
  const vazio = await consultarEstadoExecutivoAntesDeResponder({
    idClasse: "C2",
    leitores: leitoresBase(),
    agora: () => AGORA
  });
  // frente sozinha não força lastro
  assert.equal(vazio.temContextoRelevante, false);
  const msg = "Resposta deliberativa normal sobre prioridades.";
  assert.equal(
    garantirReflexoEstadoExecutivo(msg, vazio.lastroParaNucleo).mensagem,
    msg
  );
});

test("E5-CA4: sem dump da fila; E5-CA5: sem credenciais", () => {
  const lastro = {
    temContextoRelevante: true,
    fontePrioritaria: { id: "F2", nivel: "P2", nome: "Jobs" },
    factosOficiais: [
      "Estado Executivo — Job em execução J1: correção dos bugs",
      "apiKey: sk-secret-nao-vazar",
      "CURSOR_API_KEY=xyz"
    ],
    contagens: { jobsPendentes: 0, jobsEmExecucao: 1, gatesPendentes: 0 },
    prioridadeActiva: [],
    consultadoEm: AGORA
  };
  const prosa = comporProsaLastro(lastro, "Como devemos priorizar o MG2?");
  assert.ok(prosa);
  assert.equal(/\bpending\b|\bJOB-\d+\b.*JOB-/i.test(prosa), false);
  assert.equal(/sk-secret|CURSOR_API_KEY|apiKey/i.test(prosa), false);
  // prosa canónica curta (2 parágrafos)
  assert.equal(prosa.split("\n\n").length, 2);
});
