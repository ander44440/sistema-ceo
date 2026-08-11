/**
 * Etapa 4 — CN não anexa envelope executivo com lastro persistente rico.
 * CONTEXTO ≠ RESPOSTA. Não altera gerarResumoDoDia / panorama explícito.
 */

import assert from "node:assert/strict";
import { test, beforeEach, afterEach } from "node:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { executiveEngine } from "../executiveEngine/index.js";
import { criarPublicadorFilaMemoria } from "../motorExecucao/ponteParecerJob.js";
import { criarFilaExecucao } from "../../server/executionQueue.js";
import { resetStoreContinuidadePadrao } from "../continuidadeGate/integracaoConversa.js";
import { resetEstadoTopicosSessao } from "../classificadorIntencao/topicosSessao.js";
import { resetEstadoObjectivoSessao } from "../classificadorIntencao/objectivoSessao.js";
import { reiniciarAutoridadeDelegadaParaTestes } from "../autoridadeDelegada/autoridadeDelegada.js";
import {
  deveAnexarContextoExecutivo,
  deveAnteciparPendencia
} from "./prioridadeIntencao.js";
import { aplicarConversacaoNatural } from "./index.js";
import { TIPO_TURNO, classificarTipoTurno } from "./tiposTurno.js";
import { limparHistorico } from "../modules/conversa/store.js";
import { enviarAoNucleo } from "../modules/conversa/enviarAoNucleo.js";
import { gravarDocumento, VERSAO } from "../catalogoProjetos/persistencia.js";
import {
  recarregarCatalogo,
  selecionarProjeto,
  abrirDiaExecutivo,
  obterProjetoAtivo
} from "../catalogoProjetos/index.js";

function assertSemEnvelopeCn(msg) {
  const t = String(msg || "");
  assert.doesNotMatch(t, /Objectivo principal:/i);
  assert.doesNotMatch(t, /Mantemos o objectivo:/i);
  assert.doesNotMatch(t, /Foco executivo:/i);
  assert.doesNotMatch(t, /Antecipo pendência aberta:/i);
}

function documentoRicoMg2() {
  const agora = new Date().toISOString();
  const pendencias = [];
  for (let i = 1; i <= 6; i += 1) {
    pendencias.push({
      id: `pen-e4-${i}`,
      texto: `Pendência crítica E4-${i}: bloqueio operacional`,
      status: "aberta",
      criadoEm: agora
    });
  }
  const decisoes = [];
  for (let i = 1; i <= 9; i += 1) {
    decisoes.push({
      id: `dec-e4-${i}`,
      texto: `Decisão E4-${i} registada`,
      origem: "teste",
      criadoEm: agora
    });
  }
  return {
    versao: VERSAO,
    projetoAtivoId: "prj-mg2",
    gabinete: { rotaId: "dashboard", atualizadoEm: agora },
    projetos: [
      {
        id: "prj-mg2",
        nome: "Motoboy Game 2",
        descricao: "Contexto operacional ADR-015",
        estado: "ativo",
        criadoEm: agora,
        ultimaAtividadeEm: agora,
        decisoes,
        pendencias,
        proximasAcoes: [
          {
            id: "px-e4-1",
            texto: "1. o objetivo atual; 2. a prioridade; 3. a decisão",
            criadoEm: agora
          }
        ],
        historicoResumido: [],
        proximoPassoSugerido: null,
        diaExecutivo: {
          status: "em_curso",
          dataRef: agora.slice(0, 10),
          abertoEm: agora,
          encerradoEm: null,
          intencaoDoDia: "Fechar gates M0/M1 e estabilizar uso diário",
          continuidade: []
        }
      }
    ]
  };
}

function seedLastroRico() {
  gravarDocumento(documentoRicoMg2());
  recarregarCatalogo();
  selecionarProjeto("prj-mg2");
  abrirDiaExecutivo({
    intencaoDoDia: "Fechar gates M0/M1 e estabilizar uso diário"
  });
  const ativo = obterProjetoAtivo();
  assert.equal(ativo?.id, "prj-mg2");
  assert.ok((ativo?.pendencias || []).length >= 6);
  assert.ok((ativo?.decisoes || []).length >= 9);
}

function ctxRico() {
  return {
    objectivoPrincipal: "Usar o CEO diariamente no desenvolvimento do MG2",
    objetivoAtual: "Usar o CEO diariamente no desenvolvimento do MG2",
    proximaAcao: "1. o objetivo atual; 2. a prioridade",
    pendencias: [
      "Pendência crítica E4-1: bloqueio operacional",
      "Pendência crítica E4-2: bloqueio operacional",
      "Pendência crítica E4-3: bloqueio operacional",
      "Pendência crítica E4-4: bloqueio operacional",
      "Pendência crítica E4-5: bloqueio operacional",
      "Pendência crítica E4-6: bloqueio operacional"
    ],
    decisoesTomadas: Array.from({ length: 9 }, (_, i) => `Decisão E4-${i + 1}`),
    frenteAtiva: "Motoboy Game 2",
    missaoActiva: true
  };
}

beforeEach(() => {
  resetStoreContinuidadePadrao();
  resetEstadoTopicosSessao();
  resetEstadoObjectivoSessao();
  reiniciarAutoridadeDelegadaParaTestes();
  limparHistorico();
  seedLastroRico();
});

afterEach(() => {
  limparHistorico();
});

test("E4-unit: default não anexa; panorama sim; pendência sozinha não antecipa", () => {
  assert.equal(
    deveAnexarContextoExecutivo({ instrucao: "Bom dia, CEO." }),
    false
  );
  assert.equal(
    deveAnexarContextoExecutivo({
      instrucao: "Analise a proposta do outdoor."
    }),
    false
  );
  assert.equal(
    deveAnexarContextoExecutivo({
      instrucao: "Qual é o estado do JOB-000068?"
    }),
    false
  );
  assert.equal(
    deveAnexarContextoExecutivo({
      instrucao: "Quero agora analisar outra proposta."
    }),
    false
  );
  assert.equal(
    deveAnexarContextoExecutivo({
      instrucao: "Onde estamos no projeto?"
    }),
    true
  );
  assert.equal(
    deveAnexarContextoExecutivo({
      instrucao: "Qual é o estado atual?"
    }),
    true
  );
  assert.equal(
    deveAnteciparPendencia({
      instrucao: "O que achas?",
      pendencias: ctxRico().pendencias
    }),
    false
  );
  assert.equal(
    deveAnteciparPendencia({
      instrucao: "Quais pendências estão abertas?",
      pendencias: ctxRico().pendencias
    }),
    true
  );
});

test("E4-1 — pergunta sem panorama + lastro rico → zero envelope CN", async () => {
  const pub = criarPublicadorFilaMemoria();
  const out = await executiveEngine.executar(
    "O que achas desta direcção para o outdoor?",
    { publicarJob: pub.publicarJob.bind(pub) }
  );
  assert.equal(pub.jobs.length, 0);
  assertSemEnvelopeCn(out.mensagem);
});

test("E4-2 — saudação com lastro rico → sem envelope", async () => {
  const pub = criarPublicadorFilaMemoria();
  const out = await executiveEngine.executar("Bom dia, CEO.", {
    publicarJob: pub.publicarJob.bind(pub)
  });
  assert.equal(pub.jobs.length, 0);
  assert.match(String(out.mensagem), /Bom dia/i);
  assertSemEnvelopeCn(out.mensagem);
  assert.doesNotMatch(String(out.mensagem), /Há 6 pendências/i);
});

test("E4-3 — análise com lastro rico → sem envelope CN", async () => {
  const pub = criarPublicadorFilaMemoria();
  const out = await executiveEngine.executar(
    "Analise a proposta do bairro popular. Não execute nada.",
    { publicarJob: pub.publicarJob.bind(pub) }
  );
  assert.equal(pub.jobs.length, 0);
  assertSemEnvelopeCn(out.mensagem);
});

test("E4-4 — consulta Job com lastro rico → sem envelope CN", async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "ceo-e4-"));
  const fila = criarFilaExecucao(root);
  const j = fila.publicar({ titulo: "Homologação", descricao: "teste" });
  const alvo = path.join(fila.queueDir, "JOB-000068.json");
  fs.renameSync(path.join(fila.queueDir, `${j.id}.json`), alvo);
  const job = JSON.parse(fs.readFileSync(alvo, "utf8"));
  job.id = "JOB-000068";
  job.estado = "completed";
  job.verificacao = { ok: true };
  job.resultado = { status: "sucesso", resumo: "ok" };
  fs.writeFileSync(alvo, JSON.stringify(job, null, 2));

  const pub = criarPublicadorFilaMemoria();
  const out = await executiveEngine.executar(
    "Qual é o estado do JOB-000068?",
    {
      obterJob: (id) => fila.lerJob(id),
      listarJobs: (e) => fila.listarPorEstado(e == null ? null : e),
      publicarJob: pub.publicarJob.bind(pub)
    }
  );
  assert.equal(pub.jobs.length, 0);
  assert.match(String(out.mensagem), /JOB-000068/);
  assertSemEnvelopeCn(out.mensagem);
});

test("E4-5 — mudança de assunto com lastro rico → sem envelope CN", async () => {
  const pub = criarPublicadorFilaMemoria();
  const out = await executiveEngine.executar(
    "Quero agora analisar outra proposta.",
    { publicarJob: pub.publicarJob.bind(pub) }
  );
  assert.equal(pub.jobs.length, 0);
  assertSemEnvelopeCn(out.mensagem);
});

test("E4-6 — panorama explícito continua permitido", async () => {
  const pub = criarPublicadorFilaMemoria();
  const out = await executiveEngine.executar("Onde estamos no projeto?", {
    publicarJob: pub.publicarJob.bind(pub)
  });
  assert.equal(pub.jobs.length, 0);
  assert.ok(String(out.mensagem).length > 20);
  // Panorama pode mencionar projecto/estado; CN pode anexar contexto neste caso
  assert.match(String(out.mensagem), /Motoboy Game 2|projeto|Dia|Situação|pendênc/i);
});

test("E4-7 — Qual é o estado atual? → estado_geral / panorama permitido", async () => {
  const pub = criarPublicadorFilaMemoria();
  const out = await executiveEngine.executar("Qual é o estado atual?", {
    publicarJob: pub.publicarJob.bind(pub)
  });
  assert.equal(pub.jobs.length, 0);
  assert.ok(
    out.dados?.tipoConsulta === "estado_geral" ||
      /Dia em curso|Situação do projeto|Motoboy Game 2/i.test(
        String(out.mensagem)
      )
  );
});

test("E4-CN: DELIBERACAO com lastro rico não prefixa Objectivo/Antecipo", () => {
  const cn = aplicarConversacaoNatural({
    ok: true,
    modo: "llm",
    mensagem: "A direcção do outdoor faz sentido se LOD estiver estável.",
    instrucao: "O que achas desta direcção para o outdoor?",
    dados: {
      intencao: { id: "conversa_projeto" },
      memoria: {
        projetoAtivo: { id: "prj-mg2", nome: "Motoboy Game 2" },
        pendencias: ctxRico().pendencias.map((texto) => ({
          texto,
          status: "aberta"
        })),
        proximoPasso: ctxRico().proximaAcao
      }
    },
    memoria: {
      projetoAtivo: { id: "prj-mg2", nome: "Motoboy Game 2" },
      pendencias: ctxRico().pendencias.map((texto) => ({
        texto,
        status: "aberta"
      })),
      proximoPasso: ctxRico().proximaAcao
    }
  });
  assert.notEqual(cn.tipoTurno, TIPO_TURNO.SISTEMA);
  assertSemEnvelopeCn(cn.texto);
});

test("E4-8 — integração enviarAoNucleo com lastro rico → 0 Jobs, sem envelope CN", async () => {
  const pub = criarPublicadorFilaMemoria();
  const out = await enviarAoNucleo(
    "Analise a proposta do outdoor. Não execute nada.",
    {
      reproduzirTts: false,
      publicarJob: pub.publicarJob.bind(pub)
    }
  );
  assert.equal(pub.jobs.length, 0);
  assert.equal(out.ok, true);
  assertSemEnvelopeCn(out.mensagem);
  assert.equal(
    classificarTipoTurno({
      modo: out.resposta?.modo,
      intencaoId: out.dados?.intencao?.id,
      instrucao: "Analise a proposta do outdoor. Não execute nada.",
      dados: out.dados
    }) === TIPO_TURNO.SISTEMA ||
      !/Objectivo principal:/i.test(String(out.mensagem)),
    true
  );
});
