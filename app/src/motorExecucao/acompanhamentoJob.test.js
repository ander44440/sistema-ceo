/**
 * Teste 1 — Acompanhamento da operação (Job → CEO conversacional).
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  criarStoreAcompanhamento,
  deveEmitirActualizacao,
  ehEstadoAcompanhamentoAberto,
  montarMensagemProgresso,
  observarUmAcompanhamento,
  registarAcompanhamentoAposHandoff,
  adotarJobsDaFilaParaAcompanhamento
} from "./acompanhamentoJob.js";
import { montarMensagemResultado } from "./resultadoEncerramento.js";
import { conduzirAposParecer } from "./integracaoOrquestrador.js";
import { criarPublicadorFilaMemoria } from "./ponteParecerJob.js";
import {
  extrairEstadoOperacional,
  ehEstadoOperacaoAbertaJob,
  ESTADOS_ACOMPANHAMENTO_OPERACIONAL
} from "../conversacaoNatural/estadoOperacional.js";
import {
  criarEstadoExecutivo,
  ehStatusJobEmAcompanhamento
} from "../conscienciaOperacional/dominio.js";
import { montarFactosLastro } from "../conscienciaOperacional/consultarAntesDeResponder.js";

function jobBase(estado, extra = {}) {
  return {
    id: "JOB-000101",
    titulo: "missão acompanhamento",
    estado,
    criadoEm: "2026-08-09T12:00:00.000Z",
    ...extra
  };
}

test("1–4: dispatched/running/result/needs_correction mantêm operação aberta", () => {
  for (const est of [
    "dispatched",
    "running",
    "result",
    "needs_correction"
  ]) {
    assert.equal(ehEstadoAcompanhamentoAberto(est), true, est);
    assert.equal(ehEstadoOperacaoAbertaJob(est), true, est);
    assert.ok(ESTADOS_ACOMPANHAMENTO_OPERACIONAL.includes(est));

    const e = extrairEstadoOperacional({
      jobs: [jobBase(est)]
    });
    assert.equal(e.operacaoAberta, true, `operacaoAberta ${est}`);
    assert.equal(e.jobActivo?.estado, est);
  }
});

test("5–7: completed/failed/cancelled encerram acompanhamento", async () => {
  for (const terminal of ["completed", "failed", "cancelled"]) {
    const store = criarStoreAcompanhamento();
    const job = jobBase("dispatched");
    registarAcompanhamentoAposHandoff(store, job);
    assert.equal(store.obter(job.id)?.activo, true);

    const jobTerm = {
      ...job,
      estado: terminal,
      resultado:
        terminal === "completed"
          ? { status: "sucesso", resumo: "missão acompanhamento entregue" }
          : { status: "falhou", resumo: "falha" },
      concluidoEm: "2026-08-09T13:00:00.000Z"
    };

    const r = await observarUmAcompanhamento(store, job.id, {
      obterJob: async () => jobTerm
    });
    assert.equal(r.terminal, true, terminal);
    assert.equal(r.emitiu, true, terminal);
    assert.equal(store.obter(job.id)?.activo, false, terminal);
    assert.equal(store.obter(job.id)?.mensagemTerminalEmitida, true, terminal);
    assert.ok(r.mensagem?.ok || r.mensagem?.texto);
  }
});

test("8: mensagem terminal emitida apenas uma vez", async () => {
  const store = criarStoreAcompanhamento();
  registarAcompanhamentoAposHandoff(store, jobBase("running"));
  const jobDone = {
    ...jobBase("completed"),
    resultado: { status: "ok", resumo: "missão acompanhamento ok" },
    concluidoEm: "2026-08-09T14:00:00.000Z"
  };
  const a = await observarUmAcompanhamento(store, "JOB-000101", {
    obterJob: async () => jobDone
  });
  const b = await observarUmAcompanhamento(store, "JOB-000101", {
    obterJob: async () => jobDone
  });
  assert.equal(a.emitiu, true);
  assert.equal(b.emitiu, false);
  assert.equal(b.motivo, "acompanhamento_inactivo");
});

test("9: mudança repetida do mesmo estado não gera spam", async () => {
  const store = criarStoreAcompanhamento();
  // registo marca dispatched como já reportado
  registarAcompanhamentoAposHandoff(store, jobBase("dispatched"));
  const r1 = await observarUmAcompanhamento(store, "JOB-000101", {
    obterJob: async () => jobBase("dispatched")
  });
  assert.equal(r1.emitiu, false);
  assert.equal(deveEmitirActualizacao(store.obter("JOB-000101"), "dispatched"), false);

  const r2 = await observarUmAcompanhamento(store, "JOB-000101", {
    obterJob: async () => jobBase("running")
  });
  assert.equal(r2.emitiu, true);
  assert.equal(r2.mensagem?.tipo, "progresso");

  const r3 = await observarUmAcompanhamento(store, "JOB-000101", {
    obterJob: async () => jobBase("running")
  });
  assert.equal(r3.emitiu, false);
});

test("10: dispatched não produz execucaoConcluida=true", async () => {
  const fila = criarPublicadorFilaMemoria();
  const parecer = {
    id: "par-acomp-1",
    versaoContrato: "1.0",
    acao: {
      tipo: "despachar",
      job: {
        titulo: "missão acompanhamento",
        descricao: "validar acompanhamento contínuo do Job"
      }
    },
    decisaoExecutiva: { estado: "delegar" }
  };
  const r = await conduzirAposParecer(parecer, {
    publicarJob: fila.publicarJob.bind(fila)
  });
  assert.equal(r.despachado, true);
  assert.equal(r.execucaoConcluida, false);
  assert.equal(r.job.estado, "dispatched");

  const store = criarStoreAcompanhamento();
  const reg = registarAcompanhamentoAposHandoff(store, r.job);
  assert.equal(reg.execucaoConcluida, false);
  assert.equal(reg.ok, true);

  const obs = await observarUmAcompanhamento(store, r.job.id, {
    obterJob: async () => r.job
  });
  assert.equal(obs.execucaoConcluida, false);
  assert.equal(obs.terminal, false);
});

test("11: Job já terminal não é reaberto", () => {
  const store = criarStoreAcompanhamento();
  const job = jobBase("completed", {
    resultado: { resumo: "já feito" },
    concluidoEm: "2026-08-09T15:00:00.000Z"
  });
  const r = registarAcompanhamentoAposHandoff(store, job);
  assert.equal(r.ok, false);
  assert.equal(r.motivo, "job_terminal");
  assert.equal(store.listarActivos().length, 0);

  // registo activo → terminal → tentativa de re-registo não reabre
  registarAcompanhamentoAposHandoff(store, jobBase("running"));
  store.aplicarReport("JOB-000101", "completed", { terminal: true });
  const deNovo = store.registar("JOB-000101", {});
  assert.equal(deNovo.activo, false);
  assert.equal(deNovo.mensagemTerminalEmitida, true);
});

test("12: consulta do estado utiliza Job persistido como fonte de verdade", async () => {
  const store = criarStoreAcompanhamento();
  registarAcompanhamentoAposHandoff(store, jobBase("dispatched"));

  /** @type {object|null} */
  let persistido = jobBase("dispatched");
  const obterJob = async (id) => {
    assert.equal(id, "JOB-000101");
    return persistido;
  };

  const a = await observarUmAcompanhamento(store, "JOB-000101", { obterJob });
  assert.equal(a.fonte, "fila_persistida");
  assert.equal(a.estado, "dispatched");

  persistido = jobBase("result", {
    resultado: { resumo: "evidência parcial missão acompanhamento" }
  });
  const b = await observarUmAcompanhamento(store, "JOB-000101", { obterJob });
  assert.equal(b.estado, "result");
  assert.equal(b.terminal, false);
  assert.equal(b.execucaoConcluida, false);
  assert.match(b.mensagem?.texto || "", /aguarda verificação/i);
});

test("consciência F2 aceita dispatched/result/needs_correction", () => {
  for (const st of ["dispatched", "running", "result", "needs_correction"]) {
    assert.equal(ehStatusJobEmAcompanhamento(st), true);
    const estado = criarEstadoExecutivo({
      jobsEmExecucao: [{ id: "JOB-F2", titulo: "t", status: st }]
    });
    assert.equal(estado.jobsEmExecucao[0].status, st);
  }

  const factos = montarFactosLastro({
    estado: criarEstadoExecutivo({
      jobsEmExecucao: [
        { id: "JOB-D", titulo: "handoff", status: "dispatched" }
      ]
    }),
    consultadoEm: new Date().toISOString(),
    prioridadeActiva: [],
    diagnostico: { fontesDegradadas: [] }
  });
  assert.ok(factos.some((f) => /dispatched|handoff/i.test(f)));
  assert.ok(factos.some((f) => /não concluído/i.test(f)));
});

test("montarMensagemProgresso / Resultado: dispatched ≠ completed", () => {
  const prog = montarMensagemProgresso(jobBase("dispatched"));
  assert.equal(prog.ok, true);
  assert.equal(prog.conclusao, false);
  assert.match(prog.texto, /não concluído/i);

  const term = montarMensagemResultado(jobBase("dispatched"));
  assert.equal(term.ok, false);
});

test("result mantém acompanhamento aberto (nunca conclusão)", async () => {
  const store = criarStoreAcompanhamento();
  registarAcompanhamentoAposHandoff(store, jobBase("running"));
  const r = await observarUmAcompanhamento(store, "JOB-000101", {
    obterJob: async () =>
      jobBase("result", { resultado: { resumo: "bruto" } })
  });
  assert.equal(r.terminal, false);
  assert.equal(r.execucaoConcluida, false);
  assert.equal(store.obter("JOB-000101")?.activo, true);
});

/* ——— Teste 3: adopção da fila + retorno do resultado ——— */

test("T3-A: result fora do store é adotado, observado e progresso sem conclusão", async () => {
  const store = criarStoreAcompanhamento();
  const job = jobBase("result", {
    id: "JOB-000201",
    resultado: {
      status: "sucesso",
      resumo: "artefacto homologacao entregue",
      evidencia: "executive/queue/x.txt"
    },
    resultadoEm: "2026-08-09T16:00:00.000Z"
  });
  const snapResultado = structuredClone(job.resultado);

  const adocao = await adotarJobsDaFilaParaAcompanhamento(store, {
    listarJobs: async () => [job]
  });
  assert.equal(adocao.ok, true);
  assert.equal(adocao.adotados.length, 1);
  assert.equal(adocao.adotados[0].novo, true);
  assert.equal(store.obter(job.id)?.activo, true);
  assert.equal(store.obter(job.id)?.ultimoEstadoReportado, null);

  const obs = await observarUmAcompanhamento(store, job.id, {
    obterJob: async () => job
  });
  assert.equal(obs.emitiu, true);
  assert.equal(obs.terminal, false);
  assert.equal(obs.execucaoConcluida, false);
  assert.equal(obs.mensagem?.tipo, "progresso");
  assert.match(obs.mensagem?.texto || "", /resultado disponível|aguarda verificação/i);
  assert.match(obs.mensagem?.texto || "", /artefacto homologacao/i);
  assert.equal(obs.mensagem?.conclusao, false);
  assert.deepEqual(job.resultado, snapResultado);
});

test("T3-B: result → needs_correction emite por estado, sem terminal/conclusão", async () => {
  const store = criarStoreAcompanhamento();
  const jobResult = jobBase("result", {
    id: "JOB-000202",
    resultado: { resumo: "entrega parcial" }
  });
  await adotarJobsDaFilaParaAcompanhamento(store, {
    listarJobs: async () => [jobResult]
  });
  const a = await observarUmAcompanhamento(store, "JOB-000202", {
    obterJob: async () => jobResult
  });
  assert.equal(a.emitiu, true);
  assert.equal(a.terminal, false);
  assert.equal(a.execucaoConcluida, false);

  const jobNc = {
    ...jobResult,
    estado: "needs_correction",
    verificacao: { ok: false, motivo: "objetivo_nao_atendido" },
    correcao: { motivo: "objetivo_nao_atendido" }
  };
  const snapRes = structuredClone(jobNc.resultado);
  const snapVer = structuredClone(jobNc.verificacao);

  const b = await observarUmAcompanhamento(store, "JOB-000202", {
    obterJob: async () => jobNc
  });
  assert.equal(b.emitiu, true);
  assert.equal(b.terminal, false);
  assert.equal(b.execucaoConcluida, false);
  assert.equal(b.mensagem?.tipo, "progresso");
  assert.match(b.mensagem?.texto || "", /requer correção|verificado/i);
  assert.match(b.mensagem?.texto || "", /objetivo_nao_atendido/);
  assert.equal(store.obter("JOB-000202")?.activo, true);
  assert.equal(store.obter("JOB-000202")?.mensagemTerminalEmitida, false);
  assert.deepEqual(jobNc.resultado, snapRes);
  assert.deepEqual(jobNc.verificacao, snapVer);

  const term = montarMensagemResultado(jobNc);
  assert.equal(term.ok, false);
});

test("T3-C: completed continua mensagem terminal uma vez", async () => {
  const store = criarStoreAcompanhamento();
  registarAcompanhamentoAposHandoff(store, jobBase("running", { id: "JOB-000203" }));
  const done = {
    ...jobBase("completed", { id: "JOB-000203" }),
    resultado: { status: "ok", resumo: "missão ok" },
    verificacao: { ok: true, motivo: "cobertura_objetivo" },
    concluidoEm: "2026-08-09T16:10:00.000Z"
  };
  const a = await observarUmAcompanhamento(store, "JOB-000203", {
    obterJob: async () => done
  });
  const b = await observarUmAcompanhamento(store, "JOB-000203", {
    obterJob: async () => done
  });
  assert.equal(a.emitiu, true);
  assert.equal(a.terminal, true);
  assert.match(a.mensagem?.texto || "", /concluído/i);
  assert.equal(b.emitiu, false);
});

test("T3-D: Job já adotado não duplica nem reseta anti-duplicação", async () => {
  const store = criarStoreAcompanhamento();
  const job = jobBase("result", {
    id: "JOB-000204",
    resultado: { resumo: "x" }
  });
  await adotarJobsDaFilaParaAcompanhamento(store, {
    listarJobs: async () => [job]
  });
  await observarUmAcompanhamento(store, "JOB-000204", {
    obterJob: async () => job
  });
  const depoisObs = store.obter("JOB-000204");
  assert.equal(depoisObs?.ultimoEstadoReportado, "result");

  const deNovo = await adotarJobsDaFilaParaAcompanhamento(store, {
    listarJobs: async () => [job]
  });
  assert.equal(deNovo.adotados[0].novo, false);
  assert.equal(
    store.obter("JOB-000204")?.ultimoEstadoReportado,
    "result"
  );
  assert.equal(store.obter("JOB-000204")?.mensagemTerminalEmitida, false);

  const obs2 = await observarUmAcompanhamento(store, "JOB-000204", {
    obterJob: async () => job
  });
  assert.equal(obs2.emitiu, false);
});

test("T3-E: completed histórico fora do store NÃO é auto-adotado", async () => {
  const store = criarStoreAcompanhamento();
  const historico = jobBase("completed", {
    id: "JOB-000205",
    resultado: { resumo: "antigo" },
    concluidoEm: "2026-08-01T00:00:00.000Z"
  });
  const adocao = await adotarJobsDaFilaParaAcompanhamento(store, {
    listarJobs: async () => [historico]
  });
  assert.equal(adocao.adotados.length, 0);
  assert.ok(
    adocao.ignorados.some(
      (i) => i.jobId === "JOB-000205" && i.motivo === "terminal_historico"
    )
  );
  assert.equal(store.obter("JOB-000205"), null);
  assert.equal(store.listarActivos().length, 0);
});

test("T3-F: adoptar/observar não muta resultado nem verificacao", async () => {
  const store = criarStoreAcompanhamento();
  const job = jobBase("needs_correction", {
    id: "JOB-000206",
    resultado: { status: "sucesso", resumo: "bruto preservado", token: "T" },
    verificacao: {
      ok: false,
      motivo: "objetivo_nao_atendido",
      em: "2026-08-09T16:20:00.000Z"
    }
  });
  const r0 = structuredClone(job.resultado);
  const v0 = structuredClone(job.verificacao);
  await adotarJobsDaFilaParaAcompanhamento(store, {
    listarJobs: async () => [job]
  });
  await observarUmAcompanhamento(store, "JOB-000206", {
    obterJob: async () => job
  });
  assert.deepEqual(job.resultado, r0);
  assert.deepEqual(job.verificacao, v0);
});
