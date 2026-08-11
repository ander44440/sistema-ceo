/**
 * Correção 7 — acompanhamento filtrado pela missão do turno corrente
 * (não pela missão/COA anterior à nova mensagem).
 */
import assert from "node:assert/strict";
import { test, beforeEach } from "node:test";
import {
  resolverMissaoActivaDoTurno,
  extrairNomeProjetoNovaMissao
} from "./garantirProjetoNovaMissao.js";
import { executiveEngine } from "./index.js";
import {
  adotarJobsDaFilaParaAcompanhamento,
  criarStoreAcompanhamento,
  jobPertenceAMissaoActiva,
  observarAcompanhamentosActivos
} from "../motorExecucao/acompanhamentoJob.js";
import {
  criarProjeto,
  inicializarCatalogo,
  listarProjetos,
  obterProjetoAtivo,
  recarregarCatalogo,
  selecionarProjeto
} from "../catalogoProjetos/index.js";

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

function resetCatalogo() {
  globalThis.localStorage = criarStorage();
  recarregarCatalogo();
  inicializarCatalogo();
}

const MSG_ALFA = `Quero iniciar uma nova missão no PROJETO TESTE ALFA.

Objetivo:
criar o arquivo executive/queue/projeto-teste-alfa-6.txt

Conteúdo exato:
PROJETO TESTE ALFA 6
OBJETIVO REAL HOMOLOGADO

Execute essa missão e acompanhe até a conclusão.`;

const MSG_MESMO_ALFA =
  "Qual o estado da missão actual no PROJETO TESTE ALFA? Não crie Job.";

beforeEach(() => {
  resetCatalogo();
  executiveEngine.reiniciarAcompanhamentoParaTestes();
});

test("C7-resolver: nova missão ALFA prevalece sobre COA GAMA", () => {
  const gama = criarProjeto({ nome: "PROJETO TESTE GAMA" });
  const alfa = criarProjeto({ nome: "PROJETO TESTE ALFA" });
  selecionarProjeto(gama.id);
  assert.equal(obterProjetoAtivo()?.id, gama.id);
  assert.equal(extrairNomeProjetoNovaMissao(MSG_ALFA), "PROJETO TESTE ALFA");

  const missao = resolverMissaoActivaDoTurno(MSG_ALFA);
  assert.equal(missao?.id, alfa.id);
  assert.equal(missao?.nome, "PROJETO TESTE ALFA");
  assert.notEqual(missao?.id, gama.id);
});

test("C7-1: GAMA needs_correction NÃO anexa em turno de nova missão ALFA", async () => {
  const gama = criarProjeto({ nome: "PROJETO TESTE GAMA" });
  const alfa = criarProjeto({ nome: "PROJETO TESTE ALFA" });
  selecionarProjeto(gama.id);

  const jobGama = {
    id: "JOB-000087",
    titulo: "missão GAMA",
    estado: "needs_correction",
    projeto: gama.id,
    resultado: {
      status: "sucesso",
      resumo: "Artefacto GAMA criado",
      evidencia: "executive/queue/projeto-teste-gama-1.txt"
    }
  };
  const jobAlfaAberto = {
    id: "JOB-000089",
    titulo: "missão ALFA 6",
    estado: "dispatched",
    projeto: alfa.id
  };

  const missao = resolverMissaoActivaDoTurno(MSG_ALFA);
  const obs = await executiveEngine.observarAcompanhamentosTurno({
    missaoActiva: missao,
    listarJobsEmAcompanhamento: async () => [jobGama, jobAlfaAberto],
    obterJob: async (id) =>
      id === jobGama.id ? jobGama : id === jobAlfaAberto.id ? jobAlfaAberto : null
  });

  const textos = (obs.mensagens || [])
    .map((m) => String(m?.texto || ""))
    .join("\n");
  assert.ok(!textos.includes("JOB-000087"), "GAMA não deve aparecer");
  assert.ok(!textos.includes("Artefacto GAMA"), "sem resumo GAMA");
  const jobIdsMsg = (obs.mensagens || []).map((m) => m.jobId || m.job?.id);
  assert.ok(!jobIdsMsg.includes("JOB-000087"));
  // GAMA desactivado; ALFA dispatched pode emitir progresso
  const idsResultado = (obs.resultados || [])
    .map((r) => r?.job?.id || r?.reg?.jobId)
    .filter(Boolean);
  assert.ok(!idsResultado.includes("JOB-000087"));
  assert.ok(
    idsResultado.includes("JOB-000089") ||
      (obs.aindaActivos >= 1 && !textos.includes("JOB-000087"))
  );
});

test("C7-2: ALFA com Job aberto — acompanhamento ALFA aparece", async () => {
  const alfa = criarProjeto({ nome: "PROJETO TESTE ALFA" });
  selecionarProjeto(alfa.id);

  const jobAlfa = {
    id: "JOB-ALFA-OPEN",
    titulo: "missão ALFA em curso",
    estado: "needs_correction",
    projeto: alfa.id,
    resultado: {
      status: "sucesso",
      resumo: "Resultado exclusivo ALFA",
      evidencia: "executive/queue/alfa.txt"
    }
  };

  const missao = resolverMissaoActivaDoTurno(
    "Continuar a missão no PROJETO TESTE ALFA. Qual o estado?"
  );
  // sem âncora «nova missão» → COA ALFA
  assert.equal(missao?.id, alfa.id);

  const obs = await executiveEngine.observarAcompanhamentosTurno({
    missaoActiva: missao,
    listarJobsEmAcompanhamento: async () => [jobAlfa],
    obterJob: async () => jobAlfa
  });

  const textos = (obs.mensagens || []).map((m) => String(m?.texto || "")).join("\n");
  assert.match(textos, /JOB-ALFA-OPEN|ALFA|Resultado/);
  assert.ok(obs.aindaActivos >= 1);
});

test("C7-3: mesma mensagem no mesmo projecto — acompanhamento continua", async () => {
  const alfa = criarProjeto({ nome: "PROJETO TESTE ALFA" });
  selecionarProjeto(alfa.id);

  const jobAlfa = {
    id: "JOB-ALFA-SAME",
    titulo: "missão ALFA",
    estado: "running",
    projeto: alfa.id
  };

  const missao = resolverMissaoActivaDoTurno(MSG_MESMO_ALFA);
  assert.equal(missao?.id, alfa.id);

  const obs = await executiveEngine.observarAcompanhamentosTurno({
    missaoActiva: missao,
    listarJobsEmAcompanhamento: async () => [jobAlfa],
    obterJob: async () => jobAlfa
  });

  assert.ok(obs.aindaActivos >= 1);
  assert.equal(jobPertenceAMissaoActiva(jobAlfa, missao), true);
  const ids = (obs.resultados || []).map((r) => r?.job?.id).filter(Boolean);
  assert.ok(ids.includes("JOB-ALFA-SAME"));
});

test("C7-4: Job terminal de outro projecto não contamina", async () => {
  const gama = criarProjeto({ nome: "PROJETO TESTE GAMA" });
  const alfa = criarProjeto({ nome: "PROJETO TESTE ALFA" });
  selecionarProjeto(gama.id);

  const jobGamaTerminal = {
    id: "JOB-GAMA-DONE",
    titulo: "GAMA done",
    estado: "completed",
    projeto: gama.id,
    resultado: { status: "sucesso", resumo: "feito GAMA" }
  };

  const missao = resolverMissaoActivaDoTurno(MSG_ALFA);
  assert.equal(missao?.id, alfa.id);

  const store = criarStoreAcompanhamento();
  const adocao = await adotarJobsDaFilaParaAcompanhamento(store, {
    listarJobs: async () => [jobGamaTerminal],
    missaoActiva: missao
  });
  assert.equal(adocao.adotados.length, 0);
  assert.ok(
    adocao.ignorados.some(
      (i) =>
        i.jobId === "JOB-GAMA-DONE" &&
        (i.motivo === "terminal_historico" || i.motivo === "fora_da_missao_activa")
    )
  );

  const obs = await observarAcompanhamentosActivos(store, {
    obterJob: async () => jobGamaTerminal,
    missaoActiva: missao
  });
  assert.equal((obs.mensagens || []).length, 0);
});

test("C7-5: executar resolve missão ANTES de observar (GAMA activo → ALFA)", async () => {
  const gama = criarProjeto({ nome: "PROJETO TESTE GAMA" });
  const alfa = criarProjeto({ nome: "PROJETO TESTE ALFA" });
  selecionarProjeto(gama.id);

  const jobGama = {
    id: "JOB-000087",
    titulo: "GAMA needs_correction",
    estado: "needs_correction",
    projeto: gama.id,
    resultado: {
      status: "sucesso",
      resumo: "Resumo GAMA contaminante",
      evidencia: "executive/queue/gama.txt"
    }
  };

  // Simula o prefixo de executar: resolver → observar (sem criar Job real)
  const missaoTurno = resolverMissaoActivaDoTurno(MSG_ALFA, {
    listarProjetos,
    obterProjetoAtivo
  });
  assert.equal(missaoTurno?.id, alfa.id);

  const obs = await executiveEngine.observarAcompanhamentosTurno({
    missaoActiva: missaoTurno,
    listarJobsEmAcompanhamento: async () => [jobGama],
    obterJob: async () => jobGama
  });

  const respostaFake = {
    ok: true,
    mensagem: "Missão ALFA aceite.",
    dados: {}
  };
  // anexarMensagensAcompanhamento is module-private — replicate via obs check
  const textos = (obs.mensagens || []).map((m) => m.texto).join("\n");
  assert.ok(!textos.includes("JOB-000087"));
  assert.ok(!textos.includes("Resumo GAMA contaminante"));
  assert.equal((obs.mensagens || []).length, 0);

  // COA físico ainda pode ser GAMA (Correção 7 não muta catálogo aqui)
  assert.equal(obterProjetoAtivo()?.id, gama.id);
});

test("C7-6: inverso — nova missão GAMA não anexa Job ALFA aberto", async () => {
  const alfa = criarProjeto({ nome: "PROJETO TESTE ALFA" });
  const gama = criarProjeto({ nome: "PROJETO TESTE GAMA" });
  selecionarProjeto(alfa.id);

  const jobAlfa = {
    id: "JOB-ALFA-NC",
    titulo: "ALFA aberto",
    estado: "needs_correction",
    projeto: alfa.id,
    resultado: { status: "sucesso", resumo: "ALFA contaminante" }
  };

  const msgGama = `Quero iniciar uma nova missão no PROJETO TESTE GAMA.

Objetivo:
criar ficheiro gama.txt`;

  const missao = resolverMissaoActivaDoTurno(msgGama);
  assert.equal(missao?.id, gama.id);

  const obs = await executiveEngine.observarAcompanhamentosTurno({
    missaoActiva: missao,
    listarJobsEmAcompanhamento: async () => [jobAlfa],
    obterJob: async () => jobAlfa
  });
  const textos = (obs.mensagens || []).map((m) => String(m?.texto || "")).join("\n");
  assert.ok(!textos.includes("JOB-ALFA-NC"));
  assert.ok(!textos.includes("ALFA contaminante"));
});
