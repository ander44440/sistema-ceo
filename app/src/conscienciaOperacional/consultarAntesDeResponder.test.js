/**
 * Testes consulta obrigatória C2/C3 — IMP-059 E3
 * (sem prosa E5; sem mutar Motor / Continuidade / Fila).
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { montarEntradaMre } from "../mre/integracaoNucleo.js";
import {
  classeExigeConsultaConsciencia,
  consultarEstadoExecutivoAntesDeResponder,
  montarLastroParaNucleo,
  metadadoConscienciaParaDados,
  criarConsultaConsciencia
} from "./consultarAntesDeResponder.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const AGORA = "2026-08-01T20:36:00.000Z";

/** @returns {import("./agregarEstado.js").LeitoresFontes} */
function leitoresOciosos() {
  return {
    F1: () => [],
    F2: () => [],
    F3: () => [],
    F4: () => ({ estado: "ocioso" }),
    F5: () => ({ estado: "ocioso", emCurso: false }),
    F6: () => ({ estado: "ocioso", ocupado: false }),
    F7: () => ({ disponivel: true, alertas: 0 }),
    F8: () => ({ id: null, nome: null })
  };
}

test("E3-CA1: C2 e C3 disparam consulta antes da resposta", async () => {
  for (const idClasse of ["C2", "C3"]) {
    const r = await consultarEstadoExecutivoAntesDeResponder({
      idClasse,
      leitores: leitoresOciosos(),
      agora: () => AGORA
    });
    assert.equal(r.consultado, true, idClasse);
    assert.equal(r.obrigatorio, true, idClasse);
    assert.ok(r.consulta, idClasse);
    assert.equal(r.consulta.consultadoEm, AGORA);
  }
  assert.equal(classeExigeConsultaConsciencia("conversa_projeto"), true);
  assert.equal(classeExigeConsultaConsciencia("trabalho_executivo"), true);
});

test("E3-CA2: C1 e C4 sem obrigação de consulta", async () => {
  for (const idClasse of ["C1", "C4"]) {
    const r = await consultarEstadoExecutivoAntesDeResponder({
      idClasse,
      leitores: {
        F2: () => {
          throw new Error("não deve ser chamado");
        }
      },
      agora: () => AGORA
    });
    assert.equal(r.consultado, false, idClasse);
    assert.equal(r.obrigatorio, false, idClasse);
    assert.equal(r.motivo, "classe_sem_obrigacao");
    assert.equal(r.lastroParaNucleo, null);
    assert.equal(r.consulta, null);
  }
});

test("E3-CA3: Continuidade consumiu → Consciência não consulta", async () => {
  let chamado = 0;
  const r = await consultarEstadoExecutivoAntesDeResponder({
    idClasse: "C2",
    continuidadeConsumiu: true,
    leitores: {
      F2: () => {
        chamado += 1;
        return [];
      }
    }
  });
  assert.equal(r.consultado, false);
  assert.equal(r.motivo, "continuidade_gate_precedente");
  assert.equal(r.lastroParaNucleo, null);
  assert.equal(chamado, 0);
});

test("E3-CA4: consulta não cria Job (sem publish / Fila)", async () => {
  const src = readFileSync(
    join(__dirname, "consultarAntesDeResponder.js"),
    "utf8"
  );
  assert.equal(/publicarJob|enqueue|createJob/.test(src), false);
  assert.equal(src.includes("@cursor/sdk"), false);
  assert.equal(/from\s+["'].*motorExecucao/.test(src), false);
  assert.equal(/from\s+["'].*continuidadeGate/.test(src), false);

  const r = await consultarEstadoExecutivoAntesDeResponder({
    idClasse: "C2",
    leitores: {
      ...leitoresOciosos(),
      F2: () => [{ id: "J1", titulo: "bugs", status: "running" }]
    },
    agora: () => AGORA
  });
  assert.equal(r.consultado, true);
  assert.equal(r.consulta.estado.jobsEmExecucao.length, 1);
});

test("Cenário 1 — C2 sem contexto operacional → lastro null (comportamento actual)", async () => {
  const r = await consultarEstadoExecutivoAntesDeResponder({
    classe: "conversa_projeto",
    idClasse: "C2",
    leitores: leitoresOciosos(),
    agora: () => AGORA
  });
  assert.equal(r.consultado, true);
  assert.equal(r.temContextoRelevante, false);
  assert.equal(r.lastroParaNucleo, null);
  assert.equal(r.motivo, "sem_contexto_relevante");

  const entradaSem = montarEntradaMre({
    instrucao: "Como devemos priorizar o MG2?",
    coaAtivo: null,
    memoria: () => null,
    intencao: { id: "deliberar", capacidade: "ia" }
  });
  const entradaComFlagNull = montarEntradaMre({
    instrucao: "Como devemos priorizar o MG2?",
    coaAtivo: null,
    memoria: () => null,
    intencao: { id: "deliberar", capacidade: "ia" },
    lastroConsciencia: r.lastroParaNucleo
  });
  assert.deepEqual(entradaSem.factosOficiais, entradaComFlagNull.factosOficiais);
  assert.equal(entradaComFlagNull.mensagem, entradaSem.mensagem);
});

test("Cenário 2 — C2 com Job em execução → lastro ao Núcleo", async () => {
  const r = await consultarEstadoExecutivoAntesDeResponder({
    idClasse: "C2",
    leitores: {
      ...leitoresOciosos(),
      F2: () => [
        { id: "JOB-BUGS", titulo: "correção dos bugs", status: "running" }
      ]
    },
    agora: () => AGORA
  });
  assert.equal(r.consultado, true);
  assert.equal(r.temContextoRelevante, true);
  assert.ok(r.lastroParaNucleo);
  assert.equal(r.lastroParaNucleo.fontePrioritaria?.id, "F2");
  assert.ok(
    r.lastroParaNucleo.factosOficiais.some((f) =>
      /JOB-BUGS|correção dos bugs|em execução/i.test(f)
    )
  );

  const entrada = montarEntradaMre({
    instrucao: "Como devemos priorizar o MG2?",
    coaAtivo: null,
    memoria: () => null,
    intencao: { id: "deliberar", capacidade: "ia" },
    lastroConsciencia: r.lastroParaNucleo
  });
  assert.ok(
    entrada.factosOficiais.some((f) => /JOB-BUGS|correção dos bugs/i.test(f))
  );
});

test("Cenário 3 — C2 com Gate pendente → prioridade P1 no lastro", async () => {
  const r = await consultarEstadoExecutivoAntesDeResponder({
    idClasse: "C2",
    leitores: {
      ...leitoresOciosos(),
      F2: () => [
        { id: "JOB-X", titulo: "outro", status: "running" }
      ],
      F3: () => [
        {
          gateId: "G-42",
          parecerId: "PAR-42",
          resumo: "Aprovar despacho bugs?"
        }
      ]
    },
    agora: () => AGORA
  });
  assert.equal(r.temContextoRelevante, true);
  assert.equal(r.lastroParaNucleo?.fontePrioritaria?.id, "F3");
  assert.equal(r.lastroParaNucleo?.fontePrioritaria?.nivel, "P1");
  assert.ok(
    r.lastroParaNucleo.factosOficiais.some((f) => /G-42|Gate pendente/i.test(f))
  );
  assert.equal(r.lastroParaNucleo.contagens.gatesPendentes, 1);

  const entrada = montarEntradaMre({
    instrucao: "Vamos priorizar outra frente?",
    coaAtivo: null,
    memoria: () => null,
    lastroConsciencia: r.lastroParaNucleo
  });
  const blob = entrada.factosOficiais.join("\n");
  assert.match(blob, /G-42|Gate pendente/);
});

test("metadado e factory criarConsultaConsciencia", async () => {
  const api = criarConsultaConsciencia({
    leitores: leitoresOciosos(),
    agora: () => AGORA
  });
  const r = await api.antesDeResponder({ idClasse: "C2" });
  const meta = metadadoConscienciaParaDados(r);
  assert.equal(meta.consultado, true);
  assert.equal(meta.temContextoRelevante, false);
  assert.equal(meta.consultadoEm, AGORA);

  const lastro = montarLastroParaNucleo(
    (
      await consultarEstadoExecutivoAntesDeResponder({
        idClasse: "C2",
        leitores: {
          ...leitoresOciosos(),
          F1: () => [{ id: "P1", titulo: "pend", status: "pending" }]
        },
        agora: () => AGORA
      })
    ).consulta
  );
  assert.equal(lastro.temContextoRelevante, true);
  assert.ok(Object.isFrozen(lastro));
});
