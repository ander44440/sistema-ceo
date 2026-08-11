/**
 * Correção 8 — identidade estável de projecto no Job (`projeto` + `projetoNome`).
 */
import assert from "node:assert/strict";
import { test, beforeEach } from "node:test";
import {
  montarPayloadJobDoParecer,
  criarPublicadorFilaMemoria,
  criarJobDoParecer
} from "../motorExecucao/ponteParecerJob.js";
import {
  jobPertenceAMissaoActiva,
  nomeProjetoDoJob,
  projectoDoJob
} from "../motorExecucao/acompanhamentoJob.js";
import {
  conduzirTrabalhoExecutivoC3,
  montarParecerTrabalhoExecutivo
} from "../classificadorIntencao/integracaoNucleo.js";
import {
  criarProjeto,
  inicializarCatalogo,
  obterProjetoAtivo,
  recarregarCatalogo,
  selecionarProjeto
} from "../catalogoProjetos/index.js";
import { parecerDelegarValido } from "../mre/parecer/fixtures.js";

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

beforeEach(() => {
  globalThis.localStorage = criarStorage();
  recarregarCatalogo();
  inicializarCatalogo();
});

function parecerDespacho(mut = {}) {
  const p = parecerDelegarValido();
  return {
    ...p,
    ...mut,
    acao: { ...p.acao, ...(mut.acao || {}) },
    decisaoExecutiva: {
      ...p.decisaoExecutiva,
      ...(mut.decisaoExecutiva || {})
    }
  };
}

const MSG_ALFA = `Quero iniciar uma nova missão no PROJETO TESTE ALFA.

Objetivo:
criar o arquivo executive/queue/projeto-teste-alfa-c8.txt

Conteúdo exato:
PROJETO TESTE ALFA C8
IDENTIDADE ESTAVEL

Execute essa missão e acompanhe até a conclusão.`;

test("C8-1: montarPayload persiste projeto + projetoNome", () => {
  const parecer = parecerDespacho({
    coaId: "prj-orfao-1",
    projeto: "prj-orfao-1",
    projetoNome: "PROJETO TESTE ALFA"
  });
  const m = montarPayloadJobDoParecer(parecer, {
    projeto: "prj-orfao-1",
    projetoNome: "PROJETO TESTE ALFA"
  });
  assert.equal(m.ok, true);
  assert.equal(m.payload.projeto, "prj-orfao-1");
  assert.equal(m.payload.projetoNome, "PROJETO TESTE ALFA");
});

test("C8-2: criarJobDoParecer propaga projetoNome ao Job publicado", async () => {
  const fila = criarPublicadorFilaMemoria();
  const parecer = parecerDespacho({
    coaId: "prj-x",
    projetoNome: "PROJETO TESTE GAMA"
  });
  const r = await criarJobDoParecer(parecer, {
    publicarJob: (pedido) => fila.publicarJob(pedido),
    projeto: "prj-x",
    projetoNome: "PROJETO TESTE GAMA"
  });
  assert.equal(r.publicado, true);
  assert.equal(r.job.projeto, "prj-x");
  assert.equal(r.job.projetoNome, "PROJETO TESTE GAMA");
  assert.equal(r.payload.projetoNome, "PROJETO TESTE GAMA");
});

test("C8-3: ID órfão + projetoNome ALFA pertence à missão ALFA", () => {
  const job = {
    id: "JOB-ORFÃO",
    projeto: "prj-1786308577407-3",
    projetoNome: "PROJETO TESTE ALFA",
    estado: "needs_correction"
  };
  assert.equal(projectoDoJob(job), "prj-1786308577407-3");
  assert.equal(nomeProjetoDoJob(job), "PROJETO TESTE ALFA");
  assert.equal(
    jobPertenceAMissaoActiva(job, {
      id: "prj-1786310325997-1",
      nome: "PROJETO TESTE ALFA"
    }),
    true
  );
  assert.equal(
    jobPertenceAMissaoActiva(job, {
      id: "prj-gama",
      nome: "PROJETO TESTE GAMA"
    }),
    false
  );
});

test("C8-4: sem projetoNome, ID órfão não casa com ALFA canónico", () => {
  const job = {
    id: "JOB-OLD",
    projeto: "prj-1786308577407-3",
    estado: "completed"
  };
  assert.equal(
    jobPertenceAMissaoActiva(job, {
      id: "prj-1786310325997-1",
      nome: "PROJETO TESTE ALFA"
    }),
    false
  );
});

test("C8-5: C3 nova missão ALFA — parecer/Motor recebem projetoNome", async () => {
  const alfa = criarProjeto({ nome: "PROJETO TESTE ALFA" });
  selecionarProjeto("prj-mg2");

  let visto = null;
  const out = await conduzirTrabalhoExecutivoC3(
    MSG_ALFA,
    { classe: "trabalho_executivo", confianca: 0.95, razaoCurta: "c3" },
    {
      coaId: "prj-mg2",
      projeto: "prj-mg2",
      obterCoaAtivo: () => ({ id: "prj-mg2", nome: "Motoboy Game 2" }),
      conduzirMotor: async (parecer, deps) => {
        visto = { parecer, deps };
        return {
          publicado: true,
          job: {
            id: "JOB-TEST-C8",
            estado: "pending",
            projeto: deps.projeto,
            projetoNome: deps.projetoNome
          },
          fluxoIniciado: true
        };
      }
    }
  );

  assert.equal(out.ok, true);
  assert.equal(visto.deps.projeto, alfa.id);
  assert.equal(visto.deps.projetoNome, "PROJETO TESTE ALFA");
  assert.equal(visto.parecer.projetoNome, "PROJETO TESTE ALFA");
  assert.equal(visto.parecer.coaId, alfa.id);
  assert.equal(obterProjetoAtivo().id, alfa.id);
});

test("C8-6: montarParecer com projetoNome explícito", () => {
  const p = montarParecerTrabalhoExecutivo(
    "Crie o ficheiro x",
    { classe: "trabalho_executivo", confianca: 0.9, razaoCurta: "c3" },
    {
      coaId: "prj-1",
      projeto: "prj-1",
      projetoNome: "PROJETO TESTE BETA"
    }
  );
  assert.equal(p.projeto, "prj-1");
  assert.equal(p.projetoNome, "PROJETO TESTE BETA");
});

test("C8-7: regressão C7 — GAMA não pertence a missão ALFA mesmo com nome GAMA", () => {
  const jobGama = {
    id: "JOB-000087",
    projeto: "prj-1786315315281-1",
    projetoNome: "PROJETO TESTE GAMA",
    estado: "needs_correction"
  };
  assert.equal(
    jobPertenceAMissaoActiva(jobGama, {
      id: "prj-alfa",
      nome: "PROJETO TESTE ALFA"
    }),
    false
  );
});
