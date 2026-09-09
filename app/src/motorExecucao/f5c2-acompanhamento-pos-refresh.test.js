/**
 * F5-C2 — Após refresh, Jobs não-terminais voltam ao acompanhamento.
 * Foco: pending (antes excluído), dispatched, running; terminais fora.
 */
import assert from "node:assert/strict";
import { test, beforeEach } from "node:test";
import {
  ESTADOS_ADOTAVEIS_FILA,
  adotarJobsDaFilaParaAcompanhamento,
  criarStoreAcompanhamento,
  ehEstadoAdotavelDaFila,
  observarAcompanhamentosActivos
} from "./acompanhamentoJob.js";
import { executiveEngine } from "../executiveEngine/index.js";
import {
  criarProjeto,
  inicializarCatalogo,
  limparProjetoAtivo,
  listarProjetos,
  obterProjetoAtivo,
  recarregarCatalogo,
  selecionarProjeto
} from "../catalogoProjetos/index.js";
import { VERSAO, gravarDocumento } from "../catalogoProjetos/persistencia.js";

function criarStorage() {
  const map = new Map();
  return {
    getItem(k) {
      return map.has(String(k)) ? map.get(String(k)) : null;
    },
    setItem(k, v) {
      map.set(String(k), String(v));
    },
    removeItem(k) {
      map.delete(String(k));
    }
  };
}

function jobCanonico(estado, extra = {}) {
  return {
    id: extra.id || `JOB-F5C2-${estado}`,
    estado,
    titulo: extra.titulo || `Trabalho ${estado}`,
    objetivo: extra.objetivo || "Entregar artefacto F5-C2 sem truncar missão.",
    projeto: extra.projeto || "prj-f5c2",
    projetoNome: extra.projetoNome || "Projeto F5-C2",
    ...extra
  };
}

beforeEach(() => {
  globalThis.localStorage = criarStorage();
  gravarDocumento({
    versao: VERSAO,
    projetoAtivoId: null,
    empresaAtivaId: null,
    empresas: [],
    projetos: [],
    gabinete: {}
  });
  recarregarCatalogo();
  inicializarCatalogo();
  limparProjetoAtivo();
  executiveEngine.reiniciarAcompanhamentoParaTestes();
});

test("F5-C2: pending faz parte dos estados adoptáveis", () => {
  assert.equal(ehEstadoAdotavelDaFila("pending"), true);
  assert.ok(ESTADOS_ADOTAVEIS_FILA.includes("pending"));
  assert.equal(ehEstadoAdotavelDaFila("dispatched"), true);
  assert.equal(ehEstadoAdotavelDaFila("running"), true);
  assert.equal(ehEstadoAdotavelDaFila("completed"), false);
  assert.equal(ehEstadoAdotavelDaFila("failed"), false);
  assert.equal(ehEstadoAdotavelDaFila("cancelled"), false);
});

test("F5-C2: store vazio (refresh) readopta pending/dispatched/running da missão", async () => {
  const missao = { id: "prj-f5c2", nome: "Projeto F5-C2" };
  const fila = [
    jobCanonico("pending", { id: "JOB-F5C2-P" }),
    jobCanonico("dispatched", { id: "JOB-F5C2-D" }),
    jobCanonico("running", { id: "JOB-F5C2-R" }),
    jobCanonico("completed", { id: "JOB-F5C2-C" }),
    jobCanonico("pending", {
      id: "JOB-F5C2-OUTRO",
      projeto: "prj-outro",
      projetoNome: "Outro"
    })
  ];

  const store = criarStoreAcompanhamento();
  assert.equal(store.listarActivos().length, 0);

  const adocao = await adotarJobsDaFilaParaAcompanhamento(store, {
    listarJobs: async () => fila,
    missaoActiva: missao
  });

  assert.equal(adocao.ok, true);
  const ids = adocao.adotados.map((a) => a.jobId).sort();
  assert.deepEqual(ids, ["JOB-F5C2-D", "JOB-F5C2-P", "JOB-F5C2-R"]);

  assert.ok(store.obter("JOB-F5C2-P")?.activo);
  assert.ok(store.obter("JOB-F5C2-D")?.activo);
  assert.ok(store.obter("JOB-F5C2-R")?.activo);
  assert.equal(store.obter("JOB-F5C2-C"), null);
  assert.equal(store.obter("JOB-F5C2-OUTRO"), null);

  assert.ok(
    adocao.ignorados.some(
      (i) => i.jobId === "JOB-F5C2-C" && i.motivo === "terminal_historico"
    )
  );
  assert.ok(
    adocao.ignorados.some(
      (i) => i.jobId === "JOB-F5C2-OUTRO" && i.motivo === "fora_da_missao_activa"
    )
  );
});

test("F5-C2: EE após reinício do store readopta pending da missão activa", async () => {
  criarProjeto({ nome: "Projeto F5-C2" });
  const p = listarProjetos().find((x) => /F5-C2/i.test(x.nome));
  assert.ok(p);
  selecionarProjeto(p.id);
  assert.ok(obterProjetoAtivo()?.id);

  const jobPending = jobCanonico("pending", {
    id: "JOB-F5C2-EE-P",
    projeto: p.id,
    projetoNome: p.nome
  });
  const jobTerm = jobCanonico("completed", {
    id: "JOB-F5C2-EE-C",
    projeto: p.id,
    projetoNome: p.nome
  });

  executiveEngine.reiniciarAcompanhamentoParaTestes();
  assert.equal(
    executiveEngine.obterStoreAcompanhamento().listarActivos().length,
    0
  );

  const obs = await executiveEngine.observarAcompanhamentosTurno({
    listarJobsEmAcompanhamento: async () => [jobPending, jobTerm],
    obterJob: async (id) =>
      id === jobPending.id ? jobPending : id === jobTerm.id ? jobTerm : null,
    missaoActiva: { id: p.id, nome: p.nome }
  });

  assert.ok(obs.aindaActivos >= 1);
  assert.ok(
    executiveEngine.obterStoreAcompanhamento().obter(jobPending.id)?.activo
  );
  assert.equal(
    executiveEngine.obterStoreAcompanhamento().obter(jobTerm.id),
    null
  );

  const obs2 = await observarAcompanhamentosActivos(
    executiveEngine.obterStoreAcompanhamento(),
    {
      obterJob: async (id) =>
        id === jobPending.id ? jobPending : id === jobTerm.id ? jobTerm : null,
      missaoActiva: { id: p.id, nome: p.nome }
    }
  );
  assert.ok(obs2.aindaActivos >= 1);
});
