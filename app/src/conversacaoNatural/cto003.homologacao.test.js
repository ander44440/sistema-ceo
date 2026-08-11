/**
 * CTO-003 — Homologação prática (uso real simulado).
 * Despacho CTO: validação obrigatória antes de promover à Baseline.
 *
 * Critério de aprovação (durante operação aberta):
 * - não regressar a DELIBERAR
 * - não perguntar objectivo / prioridade
 * - não reclassificar missão (clarificação → C3/C2 operacional)
 * - não criar objectivos inventados
 * - não perder o Job activo
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  ehObjectivoInventado,
  extrairEstadoOperacional,
  detectarModoExecutivo
} from "./disciplinaExecutiva.js";
import {
  ehComandoSobreJobActivo,
  ehPerguntaProibidaComOperacao,
  montarAckRecuperacao
} from "./estadoOperacional.js";
import { aplicarConversacaoNatural } from "./index.js";
import { comporPorTipo } from "./compor.js";
import { TIPO_TURNO } from "./tiposTurno.js";
import { executarDestinoClarificacao } from "../classificadorIntencao/destinos.js";
import { devePreservarMissao } from "../classificadorIntencao/preservarMissao.js";

/** Asserções transversais do critério de aprovação CTO. */
function assertCriterioAprovacao(opts) {
  const {
    modo,
    texto = "",
    perguntas = [],
    objectivoEcoado = null,
    jobIdEsperado = null,
    estadoOp = null
  } = opts;

  assert.notEqual(
    modo,
    "deliberar",
    "Critério: não regressar a DELIBERAR com operação aberta"
  );
  assert.ok(
    modo === "executar" || modo === "recuperar",
    `Critério: modo operacional esperado, obtido «${modo}»`
  );
  assert.equal(
    ehPerguntaProibidaComOperacao(texto),
    false,
    `Critério: prosa não pergunta objectivo/prioridade — «${texto}»`
  );
  for (const p of perguntas) {
    assert.equal(
      ehPerguntaProibidaComOperacao(p),
      false,
      `Critério: pergunta proibida — «${p}»`
    );
  }
  if (objectivoEcoado != null) {
    assert.equal(
      ehObjectivoInventado(objectivoEcoado),
      false,
      "Critério: não criar objectivo inventado"
    );
  }
  if (jobIdEsperado && estadoOp) {
    assert.equal(
      estadoOp.operacaoAberta,
      true,
      "Critério: operação permanece aberta"
    );
    assert.ok(
      estadoOp.jobActivo?.id === jobIdEsperado ||
        estadoOp.sinais.pending > 0 ||
        estadoOp.sinais.running > 0 ||
        estadoOp.sinais.failed > 0 ||
        estadoOp.sinais.agentErro ||
        estadoOp.sinais.dispatcher,
      `Critério: não perder Job/sinal activo (esperado ${jobIdEsperado})`
    );
  }
}

test("HOM-CTO-003.1: Job running → «reenviar»", () => {
  const lastro = {
    temContextoRelevante: true,
    contagens: { jobsPendentes: 0, jobsEmExecucao: 1, gatesPendentes: 0 },
    factosOficiais: [
      "Estado Executivo — Job em execução JOB-000040: nomear vias MG2"
    ],
    estadoOperacional: null
  };
  const estadoOp = extrairEstadoOperacional({
    lastroConsciencia: lastro,
    jobs: [
      { id: "JOB-000040", titulo: "nomear vias MG2", estado: "running" }
    ]
  });
  lastro.estadoOperacional = estadoOp;

  assert.equal(estadoOp.operacaoAberta, true);
  assert.ok(estadoOp.sinais.running >= 1);
  assert.equal(ehComandoSobreJobActivo("reenviar"), true);

  const modo = detectarModoExecutivo({
    instrucao: "reenviar",
    estadoOperacional: estadoOp,
    lastroConsciencia: lastro
  });
  assert.equal(modo, "executar");

  const cn = aplicarConversacaoNatural({
    ok: true,
    modo: "local",
    mensagem: "Entendi: Definir o efeito esperado. É isso — ou mudámos de prioridade?",
    instrucao: "reenviar",
    historico: [
      {
        papel: "ceo",
        texto: "Execução iniciada. Job JOB-000040 criado em pending. Handoff ao Dispatcher iniciado."
      },
      { papel: "usuario", texto: "reenviar" }
    ],
    dados: {
      lastroConsciencia: lastro,
      parecer: {
        diagnostico: { objetivoReal: "Nomear todas as vias do MG2" },
        decisaoExecutiva: { estado: "delegar", recomendacao: "Reenviar Job" },
        confianca: 0.8,
        enquadramento: { tipoPedido: "execucao" }
      }
    }
  });

  assertCriterioAprovacao({
    modo: cn.modoAdaptacao === "execucao" ? modo : modo,
    texto: cn.texto,
    perguntas: cn.perguntas || [],
    objectivoEcoado: cn.contextoImediato?.objectivoPrincipal,
    jobIdEsperado: "JOB-000040",
    estadoOp: cn.contextoImediato?.estadoOperacional || estadoOp
  });
  assert.doesNotMatch(cn.texto, /mudámos de prioridade|qual é o objetiv/i);
  assert.equal(cn.contextoImediato?.operacaoAberta, true);
});

test("HOM-CTO-003.2: Job falhado → «forçar»", async () => {
  const estadoOp = extrairEstadoOperacional({
    jobs: [
      { id: "JOB-000041", titulo: "botão Pausar", estado: "failed" }
    ],
    historico: [
      {
        papel: "ceo",
        texto: "Job JOB-000041 falhou na publicação."
      }
    ]
  });
  assert.equal(estadoOp.requerRecuperacao, true);
  assert.equal(
    detectarModoExecutivo({
      instrucao: "forçar",
      estadoOperacional: estadoOp
    }),
    "recuperar"
  );

  const out = await executarDestinoClarificacao({
    texto: "forçar",
    historico: [
      { papel: "usuario", texto: "COLOQUE UM BOTÃO PAUSAR" },
      {
        papel: "ceo",
        texto: "Execução iniciada. Job JOB-000041 criado em pending."
      },
      { papel: "usuario", texto: "forçar" }
    ],
    intencao: { id: "clarificacao", capacidade: "ia", confianca: 0.35 },
    classificacao: {
      classe: "conhecimento_geral",
      confianca: 0.35,
      precisaClarificacao: true,
      destino: "clarificacao"
    },
    rota: { destino: "clarificacao" },
    obterCapacidade: () => null,
    contextoCapacidade: (p) => p,
    conduzirMotorPadrao: async () => ({
      publicado: true,
      job: { id: "JOB-000041", estado: "pending" },
      fluxoIniciado: true
    }),
    deps: {
      lastroConsciencia: {
        temContextoRelevante: true,
        contagens: {
          jobsPendentes: 0,
          jobsEmExecucao: 0,
          gatesPendentes: 0,
          jobsFalhado: 1
        },
        estadoOperacional: estadoOp,
        factosOficiais: ["Job JOB-000041 falhou"]
      },
      conduzirMotor: async () => ({
        publicado: true,
        job: { id: "JOB-000041", estado: "pending" },
        fluxoIniciado: true
      })
    },
    naturalizar: (r) => r
  });

  assert.equal(out.dados?.recuperacaoOperacional, true);
  assert.equal(out.dados?.preservacaoMissao, "CTO-003");
  assert.equal(out.dados?.rota, "motor_execucao");
  assert.notEqual(out.dados?.rota, "clarificacao");
  assertCriterioAprovacao({
    modo: "recuperar",
    texto: out.mensagem || "",
    jobIdEsperado: "JOB-000041",
    estadoOp
  });
});

test("HOM-CTO-003.3: dispatcher indisponível", () => {
  const estadoOp = extrairEstadoOperacional({
    consultaEstado: {
      jobsPendentes: [
        { id: "JOB-000042", titulo: "despacho", status: "pending" }
      ],
      jobsEmExecucao: [],
      gatesPendentes: [],
      dispatcher: { estado: "erro", detalhe: "indisponível" },
      agent: { estado: "ocioso", ocupado: false }
    }
  });
  assert.equal(estadoOp.operacaoAberta, true);
  assert.equal(estadoOp.sinais.dispatcher, true);

  const modo = detectarModoExecutivo({
    instrucao: "estado",
    estadoOperacional: estadoOp
  });
  assert.notEqual(modo, "deliberar");

  const ack = montarAckRecuperacao(estadoOp, "estado");
  assert.match(ack, /JOB-000042|pending|Estado operacional/i);
  assert.equal(ehPerguntaProibidaComOperacao(ack), false);

  const espelho = comporPorTipo(TIPO_TURNO.ESPELHO, {
    ctxImediato: {
      operacaoAberta: true,
      estadoOperacional: estadoOp,
      objectivoPrincipal: "Despachar ao Cursor"
    },
    instrucao: "HA JOBS NA FILA?"
  });
  assertCriterioAprovacao({
    modo,
    texto: espelho.texto,
    perguntas: espelho.perguntas,
    jobIdEsperado: "JOB-000042",
    estadoOp
  });
});

test("HOM-CTO-003.4: Agent em erro", () => {
  const historico = [
    {
      papel: "ceo",
      texto: "Execução iniciada. Job JOB-000043 criado em pending. Handoff ao Dispatcher iniciado."
    },
    { papel: "usuario", texto: "E AGENT CONTINUA COM ERRO" }
  ];
  const estadoOp = extrairEstadoOperacional({
    historico,
    consultaEstado: {
      jobsPendentes: [
        { id: "JOB-000043", titulo: "vias", status: "pending" }
      ],
      jobsEmExecucao: [],
      gatesPendentes: [],
      dispatcher: { estado: "activo" },
      agent: { estado: "erro", ocupado: false, detalhe: "Agent failed" }
    }
  });
  assert.equal(estadoOp.requerRecuperacao, true);
  assert.equal(estadoOp.sinais.agentErro, true);
  assert.equal(
    detectarModoExecutivo({
      instrucao: "FORCE O ENVIO NOVAMENTE",
      estadoOperacional: estadoOp,
      historico
    }),
    "recuperar"
  );

  assert.equal(
    devePreservarMissao({
      texto: "FORCE O ENVIO NOVAMENTE",
      historico,
      classificacao: { classe: "conhecimento_geral", confianca: 0.2 },
      deps: {
        lastroConsciencia: {
          temContextoRelevante: true,
          estadoOperacional: estadoOp,
          contagens: { jobsPendentes: 1, jobsEmExecucao: 0, gatesPendentes: 0 }
        }
      }
    }),
    true
  );

  assertCriterioAprovacao({
    modo: "recuperar",
    texto: montarAckRecuperacao(estadoOp, "FORCE O ENVIO NOVAMENTE"),
    jobIdEsperado: "JOB-000043",
    estadoOp
  });
});

test("HOM-CTO-003.5: reinício do backend com operação aberta", () => {
  // Simula pós-restart: sem memória de conversa em RAM — só lastro da fila/Consciência
  const lastroAposRestart = {
    temContextoRelevante: true,
    contagens: { jobsPendentes: 1, jobsEmExecucao: 0, gatesPendentes: 0 },
    factosOficiais: [
      "Estado Executivo — Job pendente JOB-000044: reenviar vias"
    ]
  };
  const estadoOp = extrairEstadoOperacional({
    lastroConsciencia: lastroAposRestart,
    historico: [] // sessão nova — histórico vazio
  });
  assert.equal(estadoOp.operacaoAberta, true);
  assert.equal(
    detectarModoExecutivo({
      instrucao: "continuar",
      lastroConsciencia: lastroAposRestart,
      historico: []
    }),
    "executar"
  );

  const cn = aplicarConversacaoNatural({
    ok: true,
    modo: "local",
    mensagem: "Pronto.",
    instrucao: "continuar",
    historico: [],
    dados: { lastroConsciencia: lastroAposRestart }
  });
  assert.equal(cn.contextoImediato.operacaoAberta, true);
  assert.notEqual(
    detectarModoExecutivo({
      instrucao: "continuar",
      estadoOperacional: cn.contextoImediato.estadoOperacional
    }),
    "deliberar"
  );
  assert.doesNotMatch(cn.texto, /qual é o objetiv|mudámos de prioridade/i);
  assertCriterioAprovacao({
    modo: "executar",
    texto: cn.texto,
    perguntas: cn.perguntas || [],
    estadoOp: cn.contextoImediato.estadoOperacional
  });
});

test("HOM-CTO-003.6: sequência extensa de comandos operacionais", async () => {
  const job = { id: "JOB-000045", titulo: "missão MG2", estado: "pending" };
  /** @type {Array<{papel:string,texto:string}>} */
  const historico = [
    {
      papel: "ceo",
      texto: "Execução iniciada. Job JOB-000045 criado em pending. Handoff ao Dispatcher iniciado."
    }
  ];
  const comandos = [
    "estado",
    "REENVIAR",
    "FORCE O ENVIO",
    "tentar novamente",
    "continuar",
    "HA JOBS NA FILA?",
    "pausar",
    "cancelar"
  ];

  for (const cmd of comandos) {
    historico.push({ papel: "usuario", texto: cmd });
    const estadoOp = extrairEstadoOperacional({
      jobs: [job],
      historico,
      lastroConsciencia: {
        contagens: { jobsPendentes: 1, jobsEmExecucao: 0, gatesPendentes: 0 },
        factosOficiais: [
          `Estado Executivo — Job pendente ${job.id}: ${job.titulo}`
        ]
      }
    });
    const modo = detectarModoExecutivo({
      instrucao: cmd,
      estadoOperacional: estadoOp,
      historico
    });
    assert.notEqual(modo, "deliberar", `comando «${cmd}» regressou a DELIBERAR`);
    assert.equal(ehComandoSobreJobActivo(cmd), true);

    const espelho = comporPorTipo(TIPO_TURNO.ESPELHO, {
      ctxImediato: {
        operacaoAberta: true,
        estadoOperacional: estadoOp,
        objectivoPrincipal: "Nomear vias e botão Pausar no MG2",
        missaoActiva: true
      },
      instrucao: cmd
    });
    assertCriterioAprovacao({
      modo,
      texto: espelho.texto,
      perguntas: espelho.perguntas,
      objectivoEcoado: "Nomear vias e botão Pausar no MG2",
      jobIdEsperado: "JOB-000045",
      estadoOp
    });

    historico.push({ papel: "ceo", texto: espelho.texto });
  }

  // Clarificação no meio da sequência não reabre missão
  const estadoFinal = extrairEstadoOperacional({
    jobs: [job],
    historico
  });
  const clar = await executarDestinoClarificacao({
    texto: "REENVIAR AO CURSOR",
    historico,
    intencao: { id: "clarificacao", capacidade: "ia" },
    classificacao: {
      classe: "conhecimento_geral",
      confianca: 0.3,
      precisaClarificacao: true,
      destino: "clarificacao"
    },
    rota: { destino: "clarificacao" },
    obterCapacidade: () => null,
    contextoCapacidade: (p) => p,
    deps: {
      lastroConsciencia: {
        temContextoRelevante: true,
        estadoOperacional: estadoFinal,
        contagens: { jobsPendentes: 1, jobsEmExecucao: 0, gatesPendentes: 0 }
      },
      conduzirMotor: async () => ({
        publicado: true,
        job: { id: "JOB-000045", estado: "pending" },
        fluxoIniciado: true
      })
    },
    naturalizar: (r) => r
  });
  assert.equal(clar.dados?.preservacaoMissao, "CTO-003");
  assert.ok(
    clar.dados?.recuperacaoOperacional === true ||
      clar.dados?.rota === "motor_execucao" ||
      clar.dados?.rota === "nucleo_mre"
  );
  assert.notEqual(clar.dados?.rota, "clarificacao");
});

test("HOM-CTO-003: critério negativo — sem operação → DELIBERAR permitido", () => {
  const modo = detectarModoExecutivo({
    instrucao: "O que achas das opções para as vias?",
    historico: [],
    lastroConsciencia: {
      contagens: { jobsPendentes: 0, jobsEmExecucao: 0, gatesPendentes: 0 }
    }
  });
  assert.equal(modo, "deliberar");
});
