/**
 * Evidência real (sem mutar Jobs históricos na fila):
 * missão ALFA activa + Jobs 070/074 na lista → só Job ALFA é adoptado/promovido.
 */
import assert from "node:assert/strict";
import {
  adotarJobsDaFilaParaAcompanhamento,
  aplicarPromocaoResultadoAoLastro,
  criarStoreAcompanhamento,
  extrairPromocoesResultadoMissao,
  observarAcompanhamentosActivos
} from "../src/motorExecucao/acompanhamentoJob.js";
import { extrairEstadoOperacional } from "../src/conversacaoNatural/estadoOperacional.js";
import { executiveEngine } from "../src/executiveEngine/index.js";
import {
  criarProjeto,
  inicializarCatalogo,
  selecionarProjeto
} from "../src/catalogoProjetos/index.js";
import { reiniciarAutoridadeDelegadaParaTestes } from "../src/autoridadeDelegada/autoridadeDelegada.js";

reiniciarAutoridadeDelegadaParaTestes();
inicializarCatalogo();
const alfa = criarProjeto({
  nome: "PROJETO TESTE ALFA",
  descricao: "Evidência regressão de contexto — missão governa Job"
});
selecionarProjeto(alfa.id);
assert.equal(alfa.nome, "PROJETO TESTE ALFA");

const JOB_070 = {
  id: "JOB-000070",
  titulo: "MG2 histórico",
  estado: "needs_correction",
  projeto: null,
  criadoEm: "2026-08-09T12:21:14.401Z",
  resultadoEm: "2026-08-09T12:26:45.000Z",
  resultado: {
    status: "sucesso",
    resumo: "Ordem JOB-000064 executada (itens 2+3): silhuetas carros NPC",
    evidencia: "docs/learning/2026-08-09-job-000070-execucao-mg2-ordem-expansoes.md"
  }
};
const JOB_074 = {
  id: "JOB-000074",
  titulo: "HOMOLOGACAO TESTE 2",
  estado: "needs_correction",
  projeto: null,
  resultado: {
    status: "sucesso",
    resumo: "Ficheiro Teste 2",
    evidencia: "executive/queue/teste2-execucao-efetiva-T2-1786290728726.txt"
  }
};
const JOB_ALFA = {
  id: "JOB-ALFA-EVID",
  titulo: "Condução PROJETO TESTE ALFA",
  estado: "needs_correction",
  projeto: "PROJETO TESTE ALFA",
  criadoEm: "2026-08-09T21:10:00.000Z",
  resultadoEm: "2026-08-09T21:12:00.000Z",
  resultado: {
    status: "sucesso",
    resumo: "Resultado exclusivo da missão ALFA",
    evidencia: "evidencia-alfa-missao.txt"
  }
};

const missao = { id: alfa.id, nome: alfa.nome };
const store = criarStoreAcompanhamento();
const adocao = await adotarJobsDaFilaParaAcompanhamento(store, {
  listarJobs: async () => [JOB_070, JOB_074, JOB_ALFA],
  missaoActiva: missao
});

assert.deepEqual(
  adocao.adotados.map((a) => a.jobId),
  ["JOB-ALFA-EVID"]
);
assert.ok(
  adocao.ignorados.every((i) =>
    ["JOB-000070", "JOB-000074"].includes(i.jobId)
      ? i.motivo === "fora_da_missao_activa"
      : true
  )
);

const obs = await observarAcompanhamentosActivos(store, {
  obterJob: async (id) =>
    [JOB_070, JOB_074, JOB_ALFA].find((j) => j.id === id) || null,
  missaoActiva: missao
});
const promocoes = extrairPromocoesResultadoMissao(obs);
assert.equal(promocoes.length, 1);
assert.equal(promocoes[0].jobId, "JOB-ALFA-EVID");

const lastro = aplicarPromocaoResultadoAoLastro(
  { temContextoRelevante: true, factosOficiais: [] },
  promocoes
);
assert.equal(lastro.resultadoMissaoActivo.jobId, "JOB-ALFA-EVID");
assert.match(String(lastro.memoriaTrabalhoExecutiva.proximaAcao), /JOB-ALFA-EVID/);
assert.ok(!lastro.factosOficiais.some((f) => /JOB-000070|JOB-000074/.test(f)));

const estadoOp = extrairEstadoOperacional({
  jobs: [JOB_070, JOB_074, JOB_ALFA],
  missaoActiva: missao
});
assert.equal(estadoOp.jobActivo?.id, "JOB-ALFA-EVID");
assert.equal(estadoOp.operacaoAberta, true);

executiveEngine.reiniciarAcompanhamentoParaTestes();
const out = await executiveEngine.executar("CONTINUE COM O DESPACHO", {
  missaoActiva: missao,
  listarJobsEmAcompanhamento: async () => [JOB_070, JOB_074, JOB_ALFA],
  obterJob: async (id) =>
    [JOB_070, JOB_074, JOB_ALFA].find((j) => j.id === id) || null,
  listarPorEstado: async (est) => {
    const all = [JOB_070, JOB_074, JOB_ALFA];
    if (!est) return all;
    return all.filter((j) => j.estado === est);
  },
  leitoresConsciencia: {
    F1: async () => [],
    F2: async () => [],
    F3: async () => [],
    F4: async () => ({ estado: "ocioso" }),
    F5: async () => ({ estado: "ocioso", emCurso: false }),
    F6: async () => ({ estado: "ocioso", ocupado: false }),
    F7: async () => ({ disponivel: true, alertas: 0 }),
    F8: async () => ({ id: alfa.id, nome: alfa.nome })
  }
});

const msg = String(out.mensagem || "");
assert.doesNotMatch(msg, /JOB-000070|silhuetas carros NPC/i);
const acomp = out.dados?.acompanhamentoOperacional?.mensagens || [];
assert.ok(
  !acomp.some((m) => /JOB-000070/.test(String(m.texto || ""))),
  "anexo de acompanhamento sem 070"
);
assert.ok(
  acomp.some((m) => /JOB-ALFA-EVID|missão ALFA|Resultado exclusivo/i.test(String(m.texto || ""))) ||
    /JOB-ALFA-EVID|ALFA/i.test(msg),
  "comando operacional referencia Job da missão ALFA"
);

console.log(
  JSON.stringify(
    {
      ok: true,
      missaoActiva: missao,
      adotados: adocao.adotados.map((a) => a.jobId),
      ignoradosForaMissao: adocao.ignorados
        .filter((i) => i.motivo === "fora_da_missao_activa")
        .map((i) => i.jobId),
      promocao: promocoes[0].jobId,
      jobActivo: estadoOp.jobActivo?.id,
      comandoOperacionalSem070: !/JOB-000070/.test(msg),
      mensagemResumo: msg.slice(0, 280)
    },
    null,
    2
  )
);
