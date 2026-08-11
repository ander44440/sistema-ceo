/**
 * Correção 4 — nova missão em projecto nomeado cria/selecciona COA antes do Job.
 */
import assert from "node:assert/strict";
import { test, beforeEach } from "node:test";
import {
  extrairNomeProjetoNovaMissao,
  ehIntencaoNovaMissaoEmProjeto,
  garantirProjetoParaNovaMissao
} from "../executiveEngine/garantirProjetoNovaMissao.js";
import {
  conduzirTrabalhoExecutivoC3,
  montarParecerTrabalhoExecutivo,
  extrairObjectivoRealParaJob
} from "./integracaoNucleo.js";
import {
  ehReferenciaExplicitaJobId,
  ehAutorizacaoExplicitaCriarJob,
  classificar,
  normalizarTexto
} from "./regras.js";
import { jobPertenceAMissaoActiva } from "../motorExecucao/acompanhamentoJob.js";
import {
  criarProjeto,
  listarProjetos,
  obterProjetoAtivo,
  selecionarProjeto,
  recarregarCatalogo,
  inicializarCatalogo
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

const MSG_BETA = `Quero iniciar uma nova missão no PROJETO TESTE BETA.

Objetivo:
criar o arquivo executive/queue/projeto-teste-beta-1.txt

Conteúdo exato:
PROJETO TESTE BETA 1
NOVA MISSÃO BETA

Execute essa missão e acompanhe até a conclusão.
Não utilize nem altere nenhuma operação do PROJETO TESTE ALFA.`;

const MSG_ALFA4 = `Quero iniciar uma nova missão independente do PROJETO TESTE ALFA.

Objetivo:
criar o arquivo executive/queue/projeto-teste-alfa-4.txt

Execute essa missão e acompanhe até a conclusão.`;

beforeEach(() => {
  resetCatalogo();
});

test("extracção: nova missão no PROJETO TESTE BETA", () => {
  assert.equal(extrairNomeProjetoNovaMissao(MSG_BETA), "PROJETO TESTE BETA");
  assert.equal(ehIntencaoNovaMissaoEmProjeto(MSG_BETA), true);
});

test("E: menção incidental / independente → não extrai", () => {
  assert.equal(
    extrairNomeProjetoNovaMissao(
      "O ficheiro do PROJETO TESTE BETA está correcto. Não altere nada."
    ),
    null
  );
  assert.equal(extrairNomeProjetoNovaMissao(MSG_ALFA4), null);
  assert.equal(
    extrairNomeProjetoNovaMissao(
      "Não utilize nem altere nenhuma operação do PROJETO TESTE ALFA."
    ),
    null
  );
});

test("A: projecto existente — selecciona, sem duplicar, Job com ID correcto", async () => {
  const beta = criarProjeto({ nome: "PROJETO TESTE BETA" });
  const idBeta = beta.id;
  selecionarProjeto("prj-mg2");
  assert.notEqual(obterProjetoAtivo().id, idBeta);

  const nAntes = listarProjetos().filter((p) => p.nome === "PROJETO TESTE BETA")
    .length;

  let projetoMotor = null;
  let parecerCoa = null;
  const out = await conduzirTrabalhoExecutivoC3(
    MSG_BETA,
    { classe: "trabalho_executivo", confianca: 0.95, razaoCurta: "c3" },
    {
      // COA stale do caller (ALFA/MG2) — deve ser sobrescrito
      coaId: "prj-mg2",
      projeto: "prj-mg2",
      obterCoaAtivo: () => ({ id: "prj-mg2", nome: "Motoboy Game 2" }),
      conduzirMotor: async (parecer, deps) => {
        parecerCoa = parecer.coaId;
        projetoMotor = deps.projeto;
        return {
          publicado: true,
          job: {
            id: "JOB-TEST-BETA-EXIST",
            estado: "pending",
            projeto: deps.projeto
          },
          fluxoIniciado: true
        };
      }
    }
  );

  assert.equal(out.ok, true);
  assert.equal(parecerCoa, idBeta);
  assert.equal(projetoMotor, idBeta);
  assert.equal(obterProjetoAtivo().id, idBeta);
  assert.equal(
    listarProjetos().filter((p) => p.nome === "PROJETO TESTE BETA").length,
    nAntes
  );
  assert.equal(out.dados?.projetoNovaMissao?.criado, false);
  assert.equal(out.dados?.projetoNovaMissao?.id, idBeta);
});

test("B: projecto inexistente — cria uma vez, selecciona, Job com novo ID", async () => {
  assert.equal(
    listarProjetos().some((p) => p.nome === "PROJETO TESTE BETA"),
    false
  );

  let projetoMotor = null;
  const out = await conduzirTrabalhoExecutivoC3(
    MSG_BETA,
    { classe: "trabalho_executivo", confianca: 0.95, razaoCurta: "c3" },
    {
      coaId: "prj-stale-alfa",
      projeto: "prj-stale-alfa",
      conduzirMotor: async (parecer, deps) => {
        projetoMotor = deps.projeto;
        assert.equal(parecer.projeto, deps.projeto);
        assert.equal(parecer.coaId, deps.projeto);
        return {
          publicado: true,
          job: { id: "JOB-TEST-BETA-NEW", estado: "pending", projeto: deps.projeto },
          fluxoIniciado: true
        };
      }
    }
  );

  const beta = obterProjetoAtivo();
  assert.equal(beta.nome, "PROJETO TESTE BETA");
  assert.equal(projetoMotor, beta.id);
  assert.equal(out.dados?.projetoNovaMissao?.criado, true);
  assert.equal(
    listarProjetos().filter((p) => p.nome === "PROJETO TESTE BETA").length,
    1
  );
});

test("C: ALFA activo + pedido BETA → activo vira BETA; Job não reutiliza ALFA", async () => {
  const alfa = criarProjeto({ nome: "PROJETO TESTE ALFA" });
  selecionarProjeto(alfa.id);
  assert.equal(obterProjetoAtivo().nome, "PROJETO TESTE ALFA");

  let projetoMotor = null;
  await conduzirTrabalhoExecutivoC3(
    MSG_BETA,
    { classe: "trabalho_executivo", confianca: 0.95, razaoCurta: "c3" },
    {
      coaId: alfa.id,
      projeto: alfa.id,
      obterCoaAtivo: () => ({ id: alfa.id, nome: alfa.nome }),
      conduzirMotor: async (_p, deps) => {
        projetoMotor = deps.projeto;
        return {
          publicado: true,
          job: { id: "JOB-TEST-C", estado: "pending", projeto: deps.projeto },
          fluxoIniciado: true
        };
      }
    }
  );

  const activo = obterProjetoAtivo();
  assert.equal(activo.nome, "PROJETO TESTE BETA");
  assert.notEqual(activo.id, alfa.id);
  assert.equal(projetoMotor, activo.id);
  assert.notEqual(projetoMotor, alfa.id);
});

test("D: segunda missão no mesmo BETA — reutiliza; não duplica projecto", async () => {
  const g1 = garantirProjetoParaNovaMissao(MSG_BETA);
  assert.equal(g1.criado, true);
  const id = g1.projeto.id;

  const g2 = garantirProjetoParaNovaMissao(
    "Quero iniciar uma nova missão no PROJETO TESTE BETA. Execute agora."
  );
  assert.equal(g2.aplicado, true);
  assert.equal(g2.criado, false);
  assert.equal(g2.projeto.id, id);
  assert.equal(
    listarProjetos().filter((p) => p.nome === "PROJETO TESTE BETA").length,
    1
  );
});

test("E2: garantirProjeto sem âncora não muda COA", () => {
  selecionarProjeto("prj-mg2");
  const antes = obterProjetoAtivo().id;
  const g = garantirProjetoParaNovaMissao(
    "O JOB-000083 pertence ao PROJETO TESTE BETA? Responda somente SIM ou NÃO."
  );
  assert.equal(g.aplicado, false);
  assert.equal(obterProjetoAtivo().id, antes);
  assert.equal(
    listarProjetos().some((p) => p.nome === "PROJETO TESTE BETA"),
    false
  );
});

test("F: Correções 1–3 + isolamento não regressam", () => {
  // Correção 1
  const t = normalizarTexto("Despache o JOB-000075");
  assert.equal(ehReferenciaExplicitaJobId(t), true);
  assert.equal(ehAutorizacaoExplicitaCriarJob(t), false);

  // Correção 2 — objectivo = tarefa real
  const obj = extrairObjectivoRealParaJob(
    "Crie o Job necessário para criar o ficheiro x.txt. Não execute ainda."
  );
  assert.match(obj, /ficheiro|arquivo|x\.txt/i);
  assert.doesNotMatch(obj, /Crie o Job necessário/i);

  // Correção 3 — ALFA-4 → C3
  const s = classificar(MSG_ALFA4);
  assert.equal(s.classe, "trabalho_executivo");
  assert.equal(s.permiteJob, true);

  // Isolamento missão
  const missao = { id: "prj-beta", nome: "PROJETO TESTE BETA" };
  assert.equal(
    jobPertenceAMissaoActiva(
      { id: "JOB-1", projeto: "prj-outro", estado: "completed" },
      missao,
      { idsPermitidos: [] }
    ),
    false
  );
  assert.equal(
    jobPertenceAMissaoActiva(
      { id: "JOB-2", projeto: "prj-beta", estado: "completed" },
      missao,
      { idsPermitidos: [] }
    ),
    true
  );

  // Parecer ainda propaga coa explícito
  const p = montarParecerTrabalhoExecutivo("Execute tarefa", { confianca: 0.9 }, {
    coaId: "prj-x",
    projeto: "prj-x"
  });
  assert.equal(p.coaId, "prj-x");
  assert.equal(p.projeto, "prj-x");
});
