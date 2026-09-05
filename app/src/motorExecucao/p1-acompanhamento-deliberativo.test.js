/**
 * OBJ1 — não ecoar Jobs históricos deliberativos em turno com pedido A/B/C.
 * OBJ2 (JOB-000095) — não promover ruído deliberativo ao lastro sob pedidoDecisao.
 */
import assert from "node:assert/strict";
import { test, beforeEach } from "node:test";
import {
  ehJobRuidoDeliberativo,
  filtrarMensagensAcompanhamentoDeliberativo,
  filtrarLastroRuidoDeliberativoSobPedidoDecisao,
  montarMensagemProgresso
} from "./acompanhamentoJob.js";
import { detectarPedidoDecisaoExplicita } from "../classificadorIntencao/pedidoDecisaoExplicita.js";
import {
  schemaHintConsciencia,
  blocoContextoEntradaMre
} from "../conscienciaOperacional/influenciaDeliberacao.js";
import { executiveEngine } from "../executiveEngine/index.js";
import { jobFilaParaResumoConsciencia } from "../executiveEngine/filaCliente.js";
import { reiniciarAutoridadeDelegadaParaTestes } from "../autoridadeDelegada/autoridadeDelegada.js";

const PEDIDO_ABC = `Contrato novo:
A) Aceitar agora
B) Recusar o contrato
C) Adiar a aceitação

Decide A, B ou C. Não execute.`;

function job095() {
  return {
    id: "JOB-000095",
    estado: "needs_correction",
    titulo: "Decide A/B/C contrato",
    descricao: `${PEDIDO_ABC}\nNão crie nenhum Job.`,
    projeto: "Motoboy Game 2",
    resultado: {
      decisao: "C",
      resumo: "Decisão executiva: C (adiar a aceitação do contrato)."
    }
  };
}

function job093() {
  return {
    id: "JOB-000093",
    estado: "needs_correction",
    titulo: "TESTE C9 — criação de ficheiro",
    descricao: "Criar executive/queue/teste-c9-execucao-real.txt",
    resultado: {
      resumo: "Criado teste-c9-execucao-real.txt",
      evidencia: "executive/queue/teste-c9-execucao-real.txt"
    },
    verificacao: { motivo: "homologação C9 incompleta" }
  };
}

function jobTecnicoRunning() {
  return {
    id: "JOB-TEC-001",
    estado: "running",
    titulo: "Implementar endpoint de saúde",
    descricao: "Adicionar GET /health no servidor Node.",
    objetivo: "Adicionar GET /health no servidor Node e devolver 200."
  };
}

/** Job técnico em result — promoção legítima (não ruído deliberativo). */
function jobTecnicoNeedsCorrection() {
  return {
    id: "JOB-000074",
    titulo: "HOMOLOGACAO TESTE 2 — execucao efetiva SDK",
    estado: "result",
    origem: "ceo",
    objetivo:
      "Criar o ficheiro de homologação técnica com a linha exacta combinada.",
    projeto: "Motoboy Game 2",
    resultado: {
      status: "sucesso",
      resumo:
        "Ficheiro de homologacao Teste 2 criado com linha exacta e token T2-1786290728726.",
      evidencia: "executive/queue/teste2-execucao-efetiva-T2-1786290728726.txt",
      token: "T2-1786290728726"
    },
    verificacao: { ok: false, motivo: "objetivo_nao_atendido" }
  };
}

function obsDe(...jobs) {
  const mensagens = jobs.map((j) => montarMensagemProgresso(j)).filter((m) => m.ok);
  const resultados = jobs.map((j) => ({ ok: true, job: j, estado: j.estado }));
  return {
    ok: true,
    mensagens,
    resultados,
    aindaActivos: jobs.length,
    fonte: "fila_persistida"
  };
}

/** Espelha anexarMensagensAcompanhamento do EE (filtro + join). */
function mensagemComAcompanhamento(base, obs, texto) {
  const uso = detectarPedidoDecisaoExplicita(texto)
    ? filtrarMensagensAcompanhamentoDeliberativo(obs)
    : obs;
  const textos = (uso?.mensagens || [])
    .map((m) => (m && typeof m.texto === "string" ? m.texto.trim() : ""))
    .filter(Boolean);
  if (!textos.length) return String(base || "");
  const b = String(base || "").trim();
  return b ? `${b}\n${textos.join("\n")}` : textos.join("\n");
}

function leitoresComJob(job) {
  return {
    F1: async () => [],
    F2: async () => [jobFilaParaResumoConsciencia(job)],
    F3: async () => [],
    F4: async () => ({ estado: "ocioso" }),
    F5: async () => ({ estado: "ocioso", emCurso: false }),
    F6: async () => ({ estado: "ocioso", ocupado: false }),
    F7: async () => ({ disponivel: true, alertas: 0 }),
    F8: async () => ({ id: null, nome: null })
  };
}

beforeEach(() => {
  reiniciarAutoridadeDelegadaParaTestes();
  executiveEngine.reiniciarAcompanhamentoParaTestes();
});

test("1: pedido A/B/C + JOB-000095 needs_correction → sem eco do resultado C", () => {
  assert.equal(detectarPedidoDecisaoExplicita(PEDIDO_ABC), true);
  assert.equal(ehJobRuidoDeliberativo(job095()), true);
  const msg = mensagemComAcompanhamento(
    "C — adiar a aceitação.",
    obsDe(job095()),
    PEDIDO_ABC
  );
  assert.doesNotMatch(msg, /JOB-000095/);
  assert.doesNotMatch(msg, /Decisão executiva:\s*C/i);
  assert.match(msg, /C — adiar/i);
});

test("2: pedido A/B/C + JOB-000093 needs_correction → sem eco C9", () => {
  const msg = mensagemComAcompanhamento(
    "Decisão: monitorar.",
    obsDe(job093()),
    PEDIDO_ABC
  );
  assert.doesNotMatch(msg, /JOB-000093/);
  assert.doesNotMatch(msg, /teste-c9|TESTE C9/i);
});

test("3: turno sem pedido de decisão + Job técnico running → acompanhamento continua", () => {
  const texto = "Como vai o endpoint de saúde?";
  assert.equal(detectarPedidoDecisaoExplicita(texto), false);
  const msg = mensagemComAcompanhamento(
    "A seguir o progresso.",
    obsDe(jobTecnicoRunning()),
    texto
  );
  assert.match(msg, /JOB-TEC-001/);
  assert.match(msg, /running/i);
});

test("filtro: decisão + running operacional preservado; histórico removido", () => {
  const obs = obsDe(job095(), job093(), jobTecnicoRunning());
  const filtrado = filtrarMensagensAcompanhamentoDeliberativo(obs);
  const ids = filtrado.mensagens.map((m) => m.jobId);
  assert.deepEqual(ids, ["JOB-TEC-001"]);
});

test("A: pedidoDecisao + Job deliberativo → sem promoção / sem prosa reconciliada / sem Job novo", async () => {
  const job = job095();
  assert.equal(detectarPedidoDecisaoExplicita(PEDIDO_ABC), true);
  assert.equal(ehJobRuidoDeliberativo(job), true);

  let publicacoes = 0;
  const out = await executiveEngine.executar(PEDIDO_ABC, {
    publicarJob: async () => {
      publicacoes += 1;
      throw new Error("não deve publicar Job em turno deliberativo");
    },
    listarJobsEmAcompanhamento: async () => [job],
    obterJob: async () => job,
    listarPorEstado: async (est) =>
      !est || est === "needs_correction" ? [job] : [],
    leitoresConsciencia: leitoresComJob(job)
  });

  assert.equal(publicacoes, 0);
  assert.doesNotMatch(
    String(out.mensagem || ""),
    /Já incorporei o resultado reconciliado/i
  );
  assert.doesNotMatch(
    String(out.dados?.refinoEic?.proximaAcao || ""),
    /JOB-000095/
  );
  const pend = out.dados?.refinoEic?.pendencias || [];
  assert.equal(
    pend.some((p) => /JOB-000095/.test(String(p))),
    false
  );
  assert.notEqual(out.dados?.encaminhamento?.destino, "motor_execucao");
});

test("B: sem pedidoDecisao + Job técnico → promoção legítima preservada", async () => {
  const job = jobTecnicoNeedsCorrection();
  const texto =
    "Use o resultado do JOB-000074 para continuar a missão";
  assert.equal(detectarPedidoDecisaoExplicita(texto), false);
  assert.equal(ehJobRuidoDeliberativo(job), false);

  const out = await executiveEngine.executar(texto, {
    missaoActiva: { id: "prj-mg2", nome: "Motoboy Game 2" },
    listarJobsEmAcompanhamento: async () => [job],
    obterJob: async () => job,
    listarPorEstado: async (est) =>
      !est || est === "result" || est === "needs_correction" ? [job] : [],
    leitoresConsciencia: leitoresComJob(job)
  });

  assert.match(
    String(out.mensagem || ""),
    /incorporei o resultado|resultado reconciliado/i
  );
  assert.match(String(out.dados?.refinoEic?.proximaAcao || ""), /JOB-000074/);
});

test("pré-LLM: filtrar lastro remove 093/095; preserva técnico; hint sem incorporar", () => {
  const ruido095 = job095();
  const ruido093 = job093();
  const tecnico = jobTecnicoRunning();
  assert.equal(ehJobRuidoDeliberativo(ruido095), true);
  assert.equal(ehJobRuidoDeliberativo(ruido093), true);
  assert.equal(ehJobRuidoDeliberativo(tecnico), false);

  const lastro = {
    temContextoRelevante: true,
    fontePrioritaria: { id: "F2", nivel: "P2", nome: "Jobs em execução" },
    contagens: { jobsPendentes: 0, jobsEmExecucao: 3, gatesPendentes: 0 },
    factosOficiais: [
      "Estado Executivo — Job em correção JOB-000095: Decide A/B/C — resultado: Decisão executiva: C.",
      "Estado Executivo — Job em correção JOB-000093: TESTE C9 — resultado: ficheiro teste-c9.",
      "Estado Executivo — Job em execução JOB-TEC-001: Implementar endpoint de saúde"
    ],
    resultadoMissaoActivo: null
  };

  const filtrado = filtrarLastroRuidoDeliberativoSobPedidoDecisao(lastro, [
    ruido095,
    ruido093,
    tecnico
  ]);
  const factos = (filtrado.factosOficiais || []).join("\n");
  assert.doesNotMatch(factos, /JOB-000095/);
  assert.doesNotMatch(factos, /JOB-000093/);
  assert.doesNotMatch(factos, /Decisão executiva:\s*C/i);
  assert.doesNotMatch(factos, /teste-c9|TESTE C9/i);
  assert.match(factos, /JOB-TEC-001/);
  assert.equal(filtrado.contagens.jobsEmExecucao, 1);
  assert.equal(filtrado.fontePrioritaria?.id, "F2");

  const hint = schemaHintConsciencia(filtrado, PEDIDO_ABC);
  assert.doesNotMatch(hint, /Resultado reconciliado do Job já está no lastro/i);
  assert.doesNotMatch(hint, /incorporar à continuidade/i);
  assert.doesNotMatch(hint, /JOB-000095|JOB-000093/i);

  const bloco = blocoContextoEntradaMre(filtrado, PEDIDO_ABC);
  assert.doesNotMatch(bloco, /JOB-000095|JOB-000093|Decisão executiva:\s*C/i);
  assert.match(bloco, /JOB-TEC-001/);
});

test("pré-LLM EE: pedidoDecisao + 093/095 → lastro sem ruído nos factos", async () => {
  const jobs = [job095(), job093()];
  const out = await executiveEngine.executar(PEDIDO_ABC, {
    publicarJob: async () => {
      throw new Error("não publicar");
    },
    listarJobsEmAcompanhamento: async () => jobs,
    obterJob: async (id) => jobs.find((j) => j.id === id) || null,
    listarPorEstado: async (est) =>
      !est || est === "needs_correction" ? jobs : [],
    leitoresConsciencia: {
      F1: async () => [],
      F2: async () => jobs.map((j) => jobFilaParaResumoConsciencia(j)).filter(Boolean),
      F3: async () => [],
      F4: async () => ({ estado: "ocioso" }),
      F5: async () => ({ estado: "ocioso", emCurso: false }),
      F6: async () => ({ estado: "ocioso", ocupado: false }),
      F7: async () => ({ disponivel: true, alertas: 0 }),
      F8: async () => ({ id: null, nome: null })
    }
  });

  const factos = (out.dados?.lastroConsciencia?.factosOficiais || []).join("\n");
  assert.doesNotMatch(factos, /JOB-000095/);
  assert.doesNotMatch(factos, /JOB-000093/);
  assert.doesNotMatch(factos, /Decisão executiva:\s*C/i);
  assert.doesNotMatch(factos, /teste-c9|TESTE C9/i);

  const hint = schemaHintConsciencia(
    out.dados?.lastroConsciencia || { temContextoRelevante: false },
    PEDIDO_ABC
  );
  assert.doesNotMatch(hint, /incorporar à continuidade/i);
  assert.doesNotMatch(hint, /JOB-000095|JOB-000093/i);
});
