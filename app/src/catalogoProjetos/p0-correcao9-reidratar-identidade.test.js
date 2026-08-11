/**
 * Correção 9 — mutações de identidade reidratam do localStorage (não usam RAM stale).
 */
import assert from "node:assert/strict";
import { test, beforeEach } from "node:test";
import {
  STORAGE_KEY,
  VERSAO,
  carregarDocumento,
  ErroPersistenciaCatalogo
} from "./persistencia.js";
import {
  criarProjeto,
  listarProjetos,
  obterProjetoAtivo,
  selecionarProjeto,
  selecionarProjetoPorRef,
  recarregarCatalogo,
  inicializarCatalogo
} from "./index.js";
import { garantirProjetoParaNovaMissao } from "../executiveEngine/garantirProjetoNovaMissao.js";
import { conduzirTrabalhoExecutivoC3 } from "../classificadorIntencao/integracaoNucleo.js";
import {
  jobPertenceAMissaoActiva,
  nomeProjetoDoJob
} from "../motorExecucao/acompanhamentoJob.js";

const ID_STALE = "prj-STALE";
const ID_CANONICO = "prj-CANONICO";

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

function projetoBase(id, nome) {
  return {
    id,
    nome,
    descricao: "",
    estado: "ativo",
    criadoEm: "2026-08-09T21:18:45.997Z",
    ultimaAtividadeEm: "2026-08-09T21:18:45.997Z",
    decisoes: [],
    pendencias: [],
    proximasAcoes: [],
    historicoResumido: [],
    proximoPassoSugerido: null,
    diaExecutivo: {
      status: "nao_iniciado",
      abertoEm: null,
      encerradoEm: null,
      intencaoDoDia: null,
      continuidade: []
    }
  };
}

function resetCatalogo() {
  globalThis.localStorage = criarStorage();
  recarregarCatalogo();
  inicializarCatalogo();
}

/**
 * Caso crítico:
 * LS  → PROJETO TESTE ALFA = prj-CANONICO
 * RAM → PROJETO TESTE ALFA = prj-STALE
 * (LS escrito directamente; singleton doc não é limpo)
 */
function instalarRamStaleComLsCanonico() {
  resetCatalogo();

  // 1) RAM stale: criar ALFA (id gerado), depois forçar id STALE no LS+RAM via rewrite controlado
  const gerado = criarProjeto({ nome: "PROJETO TESTE ALFA" });
  assert.ok(gerado?.id);

  // Documento stale em RAM: ALFA = prj-STALE (+ seeds)
  const docStale = {
    versao: VERSAO,
    projetoAtivoId: ID_STALE,
    gabinete: { rotaId: "dashboard", atualizadoEm: new Date().toISOString() },
    projetos: [
      projetoBase(ID_STALE, "PROJETO TESTE ALFA"),
      projetoBase("prj-mg2", "Motoboy Game 2"),
      projetoBase("prj-sistema-ceo", "Sistema CEO")
    ]
  };
  // Grava stale no LS temporariamente e reidrata para ficar na RAM
  globalThis.localStorage.setItem(STORAGE_KEY, JSON.stringify(docStale));
  recarregarCatalogo();
  assert.equal(obterProjetoAtivo()?.id, ID_STALE);

  // 2) Sobrescreve LS com canónico SEM limpar o singleton (defeito estrutural)
  const docCanon = {
    versao: VERSAO,
    projetoAtivoId: ID_CANONICO,
    gabinete: { rotaId: "dashboard", atualizadoEm: new Date().toISOString() },
    projetos: [
      projetoBase(ID_CANONICO, "PROJETO TESTE ALFA"),
      projetoBase("prj-mg2", "Motoboy Game 2"),
      projetoBase("prj-sistema-ceo", "Sistema CEO")
    ]
  };
  globalThis.localStorage.setItem(STORAGE_KEY, JSON.stringify(docCanon));

  // Prova divergência: LS canónico, RAM ainda stale (obterProjetoAtivo sem mutação de identidade)
  assert.equal(
    carregarDocumento()?.projetos.find((p) => p.nome === "PROJETO TESTE ALFA")?.id,
    ID_CANONICO
  );
  assert.equal(obterProjetoAtivo()?.id, ID_STALE);

  return { idOrfao: ID_STALE, idCanonico: ID_CANONICO };
}

beforeEach(() => {
  resetCatalogo();
});

test("C9-crítico: RAM stale + LS canónico → nova missão devolve prj-CANONICO", () => {
  const { idOrfao, idCanonico } = instalarRamStaleComLsCanonico();
  assert.equal(idOrfao, ID_STALE);
  assert.equal(idCanonico, ID_CANONICO);

  const g = garantirProjetoParaNovaMissao(
    `Quero iniciar uma nova missão no PROJETO TESTE ALFA.

Objetivo:
criar o arquivo executive/queue/projeto-teste-alfa-c9.txt`
  );

  assert.equal(g.aplicado, true);
  assert.equal(g.criado, false);
  assert.equal(g.projeto?.id, ID_CANONICO);
  assert.notEqual(g.projeto?.id, ID_STALE);
  assert.equal(obterProjetoAtivo()?.id, ID_CANONICO);
});

test("C9-1: criarProjeto com RAM stale selecciona ID do LS", () => {
  instalarRamStaleComLsCanonico();
  const seleccionado = criarProjeto({ nome: "PROJETO TESTE ALFA" });
  assert.equal(seleccionado.id, ID_CANONICO);
  assert.notEqual(seleccionado.id, ID_STALE);
});

test("C9-2: RAM e LS iguais — comportamento normal preservado", () => {
  const alfa = criarProjeto({ nome: "PROJETO TESTE ALFA" });
  const id = alfa.id;
  const deNovo = criarProjeto({ nome: "PROJETO TESTE ALFA" });
  assert.equal(deNovo.id, id);
  assert.equal(obterProjetoAtivo().id, id);
  assert.equal(
    listarProjetos().filter((p) => p.nome === "PROJETO TESTE ALFA").length,
    1
  );
});

test("C9-3: projecto inexistente no LS — cria normalmente", () => {
  instalarRamStaleComLsCanonico();
  const novo = criarProjeto({ nome: "PROJETO TESTE DELTA" });
  assert.ok(novo?.id);
  assert.equal(novo.nome, "PROJETO TESTE DELTA");
  assert.equal(obterProjetoAtivo().id, novo.id);
  const ls = carregarDocumento();
  assert.ok(ls.projetos.some((p) => p.id === novo.id && p.nome === "PROJETO TESTE DELTA"));
});

test("C9-4: criação de projecto novo persiste (sobrevive a recarregarCatalogo)", () => {
  const criado = criarProjeto({ nome: "PROJETO TESTE EPSILON" });
  const id = criado.id;
  recarregarCatalogo();
  assert.equal(obterProjetoAtivo()?.id, id);
  assert.ok(listarProjetos().some((p) => p.id === id));
});

test("C9-5: falha de persistência — Correção 5 (sem Job)", async () => {
  const s = globalThis.localStorage;
  const orig = s.setItem.bind(s);
  s.setItem = (k, v) => {
    if (String(k) === STORAGE_KEY) throw new Error("QuotaExceededError(simulado)");
    return orig(k, v);
  };
  try {
    assert.throws(
      () => criarProjeto({ nome: "PROJETO QUE FALHA" }),
      (err) =>
        err instanceof ErroPersistenciaCatalogo ||
        err?.name === "ErroPersistenciaCatalogo"
    );
  } finally {
    s.setItem = orig;
  }

  // C3 não cria Job quando persistência falha na nova missão
  s.setItem = (k, v) => {
    if (String(k) === STORAGE_KEY) throw new Error("QuotaExceededError(simulado)");
    return orig(k, v);
  };
  try {
    let publicou = false;
    const out = await conduzirTrabalhoExecutivoC3(
      `Quero iniciar uma nova missão no PROJETO TESTE ZETA.

Objetivo:
criar ficheiro zeta.txt`,
      { classe: "trabalho_executivo", confianca: 0.95, razaoCurta: "c3" },
      {
        conduzirMotor: async () => {
          publicou = true;
          return { publicado: true, job: { id: "JOB-NAO" }, fluxoIniciado: true };
        }
      }
    );
    assert.equal(out.ok, false);
    assert.equal(out.modo, "falha_persistencia_projeto");
    assert.equal(publicou, false);
  } finally {
    s.setItem = orig;
  }
});

test("C9-6: C3 + C8 — Job.projeto = canónico e projetoNome = ALFA", async () => {
  instalarRamStaleComLsCanonico();
  const msg = `Quero iniciar uma nova missão no PROJETO TESTE ALFA.

Objetivo:
criar o arquivo executive/queue/projeto-teste-alfa-c9.txt
Execute essa missão.`;

  let job = null;
  const out = await conduzirTrabalhoExecutivoC3(
    msg,
    { classe: "trabalho_executivo", confianca: 0.95, razaoCurta: "c3" },
    {
      coaId: ID_STALE,
      projeto: ID_STALE,
      obterCoaAtivo: () => ({ id: ID_STALE, nome: "PROJETO TESTE ALFA" }),
      conduzirMotor: async (parecer, deps) => {
        job = {
          id: "JOB-TEST-C9",
          estado: "pending",
          projeto: deps.projeto,
          projetoNome: deps.projetoNome
        };
        return { publicado: true, job, fluxoIniciado: true };
      }
    }
  );

  assert.equal(out.ok, true);
  assert.equal(job.projeto, ID_CANONICO);
  assert.notEqual(job.projeto, ID_STALE);
  assert.equal(job.projetoNome, "PROJETO TESTE ALFA");
  assert.equal(nomeProjetoDoJob(job), "PROJETO TESTE ALFA");
});

test("C9-7: Correção 7 — Job GAMA não pertence a missão ALFA", () => {
  const jobGama = {
    id: "JOB-GAMA",
    projeto: "prj-gama",
    projetoNome: "PROJETO TESTE GAMA",
    estado: "needs_correction"
  };
  assert.equal(
    jobPertenceAMissaoActiva(jobGama, {
      id: ID_CANONICO,
      nome: "PROJETO TESTE ALFA"
    }),
    false
  );
});

test("C9-8: seleccionarPorRef por nome após RAM stale → canónico", () => {
  instalarRamStaleComLsCanonico();
  const sel = selecionarProjetoPorRef({ nome: "PROJETO TESTE ALFA" });
  assert.equal(sel?.id, ID_CANONICO);
});
