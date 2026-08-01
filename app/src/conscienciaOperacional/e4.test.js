/**
 * Testes integração Consciência → Núcleo/MRE — IMP-059 E4
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { montarEntradaMre } from "../mre/integracaoNucleo.js";
import { capacidadeIa } from "../executiveEngine/capacidades/ia.js";
import { consultarEstadoExecutivoAntesDeResponder } from "./consultarAntesDeResponder.js";
import {
  comporProsaLastro,
  garantirReflexoEstadoExecutivo,
  schemaHintConsciencia,
  prosaMencionaJobEmExecucao,
  prosaMencionaGatePendente
} from "./influenciaDeliberacao.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const AGORA = "2026-08-01T20:39:00.000Z";

function leitoresOciosos() {
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

test("E4-CA1 + Demo 1: Job em execução influencia a recomendação", async () => {
  const consulta = await consultarEstadoExecutivoAntesDeResponder({
    idClasse: "C2",
    leitores: {
      ...leitoresOciosos(),
      F2: () => [
        {
          id: "JOB-BUGS",
          titulo: "correção dos bugs",
          status: "running"
        }
      ]
    },
    agora: () => AGORA
  });

  assert.equal(consulta.temContextoRelevante, true);
  const lastro = consulta.lastroParaNucleo;
  assert.ok(lastro);

  const instrucao = "Como devemos priorizar o MG2?";
  const prosa = comporProsaLastro(lastro, instrucao);
  assert.ok(prosa);
  assert.match(prosa, /execu[cç][aã]o em andamento/i);
  assert.match(prosa, /correção dos bugs/i);
  assert.match(prosa, /redefinir as prioridades do MG2/i);

  const entrada = montarEntradaMre({
    instrucao,
    coaAtivo: null,
    memoria: () => null,
    intencao: { id: "deliberar", capacidade: "ia" },
    lastroConsciencia: lastro
  });
  assert.ok(entrada.factosOficiais.some((f) => /JOB-BUGS|correção/i.test(f)));
  assert.match(entrada.mensagem, /Estado Executivo Atual/i);
  assert.match(schemaHintConsciencia(lastro), /Job em execução/i);

  const outIa = await capacidadeIa.executar({
    instrucao,
    intencao: { id: "deliberar", capacidade: "ia" },
    memoria: () => null,
    lastroConsciencia: lastro
  });
  assert.equal(outIa.ok, true);
  assert.ok(prosaMencionaJobEmExecucao(outIa.mensagem));
  assert.match(outIa.mensagem, /redefinir as prioridades do MG2/i);
});

test("E4-CA2 + Demo 2: Gate pendente tem prioridade absoluta", async () => {
  const consulta = await consultarEstadoExecutivoAntesDeResponder({
    idClasse: "C2",
    leitores: {
      ...leitoresOciosos(),
      F2: () => [
        { id: "JOB-X", titulo: "outro trabalho", status: "running" }
      ],
      F3: () => [
        {
          gateId: "G-99",
          parecerId: "PAR-99",
          resumo: "Aprovar despacho"
        }
      ]
    },
    agora: () => AGORA
  });

  const lastro = consulta.lastroParaNucleo;
  assert.equal(lastro.fontePrioritaria?.id, "F3");

  const instrucao = "O que devemos fazer agora?";
  const prosa = comporProsaLastro(lastro, instrucao);
  assert.ok(prosa);
  assert.match(prosa, /Gate/i);
  assert.match(prosa, /aguardando sua decis/i);
  assert.match(prosa, /iniciar novas frentes/i);
  // Gate manda — não é a prosa de Job running
  assert.equal(prosaMencionaJobEmExecucao(prosa), false);
  assert.equal(prosaMencionaGatePendente(prosa), true);

  const outIa = await capacidadeIa.executar({
    instrucao,
    intencao: { id: "deliberar", capacidade: "ia" },
    memoria: () => null,
    lastroConsciencia: lastro
  });
  assert.ok(prosaMencionaGatePendente(outIa.mensagem));
  assert.match(outIa.mensagem, /iniciar novas frentes/i);
});

test("E4-CA3: sem contexto operacional → resposta idêntica à actual", async () => {
  const consulta = await consultarEstadoExecutivoAntesDeResponder({
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
  assert.equal(consulta.lastroParaNucleo, null);

  const mensagemActual =
    "Não consigo deliberar com fluidez sobre «prioridades»: motor de linguagem indisponível (chave não configurada — MRE indisponível).\n\n" +
    "Configure `CEO_LLM_API_KEY` em `app/.env` (veja `.env.example`), reinicie o servidor e volte a tentar.\n\n" +
    "Enquanto isso, seguimos no local: data/hora, estado da sessão, projetos e navegação. Qual frente atacamos agora?";

  const reflexo = garantirReflexoEstadoExecutivo(
    mensagemActual,
    consulta.lastroParaNucleo,
    "Como priorizar?"
  );
  assert.equal(reflexo.aplicada, false);
  assert.equal(reflexo.mensagem, mensagemActual);

  const entradaSem = montarEntradaMre({
    instrucao: "Como priorizar?",
    memoria: () => null,
    intencao: { id: "deliberar" }
  });
  const entradaCom = montarEntradaMre({
    instrucao: "Como priorizar?",
    memoria: () => null,
    intencao: { id: "deliberar" },
    lastroConsciencia: null
  });
  assert.equal(entradaSem.mensagem, entradaCom.mensagem);
  assert.deepEqual(entradaSem.factosOficiais, entradaCom.factosOficiais);

  const outIa = await capacidadeIa.executar({
    instrucao: "Como priorizar o MG2?",
    intencao: { id: "deliberar", capacidade: "ia" },
    memoria: () => null
  });
  const outIaComNull = await capacidadeIa.executar({
    instrucao: "Como priorizar o MG2?",
    intencao: { id: "deliberar", capacidade: "ia" },
    memoria: () => null,
    lastroConsciencia: null
  });
  assert.equal(outIa.mensagem, outIaComNull.mensagem);
});

test("E4-CA4: nenhuma escrita em Fila, Motor ou Dispatcher na camada Consciência", () => {
  const ficheiros = [
    "influenciaDeliberacao.js",
    "leitoresPadrao.js",
    "consultarAntesDeResponder.js",
    "agregarEstado.js"
  ];
  for (const f of ficheiros) {
    const src = readFileSync(join(__dirname, f), "utf8");
    assert.equal(src.includes("@cursor/sdk"), false, f);
    assert.equal(/publicarJobFila\s*\(/.test(src), false, f);
    assert.equal(/conduzirAposDecisaoGate/.test(src), false, f);
    assert.equal(/from\s+["'].*motorExecucao/.test(src), false, f);
  }
  // leitoresPadrao lê Continuidade; não a muta
  const leitores = readFileSync(join(__dirname, "leitoresPadrao.js"), "utf8");
  assert.equal(/abrirGate|consumirDecisao|registarJobPublicado/.test(leitores), false);
});

test("E4-CA5: resposta do CEO reflecte o Estado Executivo actual", () => {
  const lastroJob = {
    consultadoEm: AGORA,
    temContextoRelevante: true,
    fontePrioritaria: { id: "F2", nivel: "P2", nome: "Jobs em execução" },
    prioridadeActiva: [],
    factosOficiais: [
      "Estado Executivo — Job em execução JOB-1: correção dos bugs"
    ],
    contagens: { jobsPendentes: 0, jobsEmExecucao: 1, gatesPendentes: 0 }
  };

  const generica = "Sugiro replanejar o roadmap do MG2 para a próxima sprint.";
  const out = garantirReflexoEstadoExecutivo(
    generica,
    lastroJob,
    "Como devemos priorizar o MG2?"
  );
  assert.equal(out.aplicada, true);
  assert.ok(prosaMencionaJobEmExecucao(out.mensagem));
  assert.match(out.mensagem, /correção dos bugs/);
  // E5: prosa canónica substitui genérica sem lastro
  assert.equal(/Sugiro replanejar/i.test(out.mensagem), false);
  assert.match(out.mensagem, /prioridades do MG2/);
});

test("E4: Continuidade / Motor não são importados pela influência", () => {
  const src = readFileSync(
    join(__dirname, "influenciaDeliberacao.js"),
    "utf8"
  );
  assert.equal(/continuidadeGate/.test(src), false);
  assert.equal(/motorExecucao/.test(src), false);
  assert.equal(/executionQueue/.test(src), false);
});
