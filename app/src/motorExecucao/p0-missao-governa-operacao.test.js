/**
 * Regressão — missão activa governa Job operacional (sem store paralelo).
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  adotarJobsDaFilaParaAcompanhamento,
  aplicarPromocaoResultadoAoLastro,
  criarStoreAcompanhamento,
  extrairPromocoesResultadoMissao,
  filtrarJobsPorMissaoActiva,
  jobPertenceAMissaoActiva,
  observarAcompanhamentosActivos,
  ordenarPromocoesPorRecencia
} from "./acompanhamentoJob.js";
import { extrairEstadoOperacional } from "../conversacaoNatural/estadoOperacional.js";

const MISSAO_ALFA = { id: "prj-teste-alfa", nome: "PROJETO TESTE ALFA" };
const MISSAO_MG2 = { id: "prj-mg2", nome: "Motoboy Game 2" };

const JOB_070 = {
  id: "JOB-000070",
  titulo: "MG2 histórico",
  estado: "needs_correction",
  projeto: null,
  criadoEm: "2026-08-09T12:00:00.000Z",
  resultadoEm: "2026-08-09T12:26:00.000Z",
  resultado: {
    status: "sucesso",
    resumo: "Ordem MG2 silhuetas NPC",
    evidencia: "docs/learning/2026-08-09-job-000070-execucao-mg2-ordem-expansoes.md"
  }
};

const JOB_ALFA = {
  id: "JOB-000173",
  titulo: "missão ALFA — condução",
  estado: "needs_correction",
  projeto: "PROJETO TESTE ALFA",
  criadoEm: "2026-08-09T21:00:00.000Z",
  resultadoEm: "2026-08-09T21:05:00.000Z",
  resultado: {
    status: "sucesso",
    resumo: "Resultado exclusivo ALFA",
    evidencia: "executive/queue/alfa-evidencia.txt"
  }
};

test("missao: órfão histórico não pertence a ALFA", () => {
  assert.equal(
    jobPertenceAMissaoActiva(JOB_070, MISSAO_ALFA, { idsPermitidos: [] }),
    false
  );
  assert.equal(jobPertenceAMissaoActiva(JOB_ALFA, MISSAO_ALFA), true);
});

test("missao: filtrarJobsPorMissaoActiva exclui 070/071 órfãos", () => {
  const out = filtrarJobsPorMissaoActiva(
    [JOB_070, JOB_ALFA, { ...JOB_070, id: "JOB-000071" }],
    MISSAO_ALFA
  );
  assert.equal(out.length, 1);
  assert.equal(out[0].id, "JOB-000173");
});

test("missao: adotar não readopta Jobs históricos de outra missão", async () => {
  const store = criarStoreAcompanhamento();
  const adocao = await adotarJobsDaFilaParaAcompanhamento(store, {
    listarJobs: async () => [JOB_070, JOB_ALFA],
    missaoActiva: MISSAO_ALFA
  });
  assert.equal(adocao.ok, true);
  assert.equal(adocao.adotados.length, 1);
  assert.equal(adocao.adotados[0].jobId, "JOB-000173");
  assert.ok(
    adocao.ignorados.some(
      (i) => i.jobId === "JOB-000070" && i.motivo === "fora_da_missao_activa"
    )
  );
  assert.equal(store.obter("JOB-000070"), null);
  assert.equal(store.obter("JOB-000173")?.activo, true);
});

test("missao: promoção e lastro usam Job da missão, não o menor ID global", async () => {
  const store = criarStoreAcompanhamento();
  await adotarJobsDaFilaParaAcompanhamento(store, {
    listarJobs: async () => [JOB_070, JOB_ALFA],
    missaoActiva: MISSAO_ALFA
  });
  const obs = await observarAcompanhamentosActivos(store, {
    obterJob: async (id) => (id === JOB_ALFA.id ? JOB_ALFA : JOB_070),
    missaoActiva: MISSAO_ALFA
  });
  const promocoes = extrairPromocoesResultadoMissao(obs);
  assert.equal(promocoes.length, 1);
  assert.equal(promocoes[0].jobId, "JOB-000173");

  const lastro = aplicarPromocaoResultadoAoLastro(
    { temContextoRelevante: true, factosOficiais: [] },
    promocoes
  );
  assert.match(String(lastro.resultadoMissaoActivo?.jobId), /JOB-000173/);
  assert.match(String(lastro.memoriaTrabalhoExecutiva?.proximaAcao), /JOB-000173/);
  assert.ok(
    !String(lastro.factosOficiais.join("\n")).includes("JOB-000070")
  );
});

test("missao: operacaoAberta fantasma não vem de needs_correction alheio", () => {
  const e = extrairEstadoOperacional({
    jobs: [JOB_070, JOB_ALFA],
    missaoActiva: MISSAO_ALFA
  });
  assert.equal(e.operacaoAberta, true);
  assert.equal(e.jobActivo?.id, "JOB-000173");
  assert.ok(!String(e.jobActivo?.id || "").includes("070"));
});

test("missao: sem missaoActiva mantém comportamento Teste 3 (adopta todos)", async () => {
  const store = criarStoreAcompanhamento();
  const adocao = await adotarJobsDaFilaParaAcompanhamento(store, {
    listarJobs: async () => [JOB_070, JOB_ALFA]
  });
  assert.equal(adocao.adotados.length, 2);
});

test("missao: ordenarPromocoesPorRecencia prefere o mais recente", () => {
  const ord = ordenarPromocoesPorRecencia([
    {
      jobId: "JOB-000070",
      estado: "needs_correction",
      sintese: "velho",
      criadoEm: "2026-08-09T12:00:00.000Z",
      resultadoEm: "2026-08-09T12:26:00.000Z"
    },
    {
      jobId: "JOB-000173",
      estado: "needs_correction",
      sintese: "novo",
      criadoEm: "2026-08-09T21:00:00.000Z",
      resultadoEm: "2026-08-09T21:05:00.000Z"
    }
  ]);
  assert.equal(ord[0].jobId, "JOB-000173");
});

test("missao: MG2 continua a reconhecer Jobs com projecto MG2", () => {
  const jobMg2 = {
    ...JOB_070,
    projeto: "Motoboy Game 2"
  };
  assert.equal(jobPertenceAMissaoActiva(jobMg2, MISSAO_MG2), true);
  assert.equal(jobPertenceAMissaoActiva(jobMg2, MISSAO_ALFA), false);
});
