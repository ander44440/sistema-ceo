/**
 * Correção: criação de Job da missão activa (PROJETO TESTE ALFA).
 * Quatro bloqueios identificados — sem arquitectura nova.
 */
import assert from "node:assert/strict";
import { test, beforeEach } from "node:test";
import {
  ehProibicaoExecucaoExplicita,
  ehAutorizacaoExplicitaCriarJob,
  normalizarTexto
} from "./regras.js";
import {
  montarParecerTrabalhoExecutivo,
  conduzirTrabalhoExecutivoC3
} from "./integracaoNucleo.js";
import { deveInterceptarOperacional } from "../conversacaoNatural/interceptacaoOperacional.js";
import { extrairEstadoOperacional } from "../conversacaoNatural/estadoOperacional.js";
import { executiveEngine } from "../executiveEngine/index.js";
import { criarPublicadorFilaMemoria } from "../motorExecucao/ponteParecerJob.js";
import { resetStoreContinuidadePadrao } from "../continuidadeGate/integracaoConversa.js";
import { resetEstadoTopicosSessao } from "./topicosSessao.js";
import { resetEstadoObjectivoSessao } from "./objectivoSessao.js";
import { reiniciarAutoridadeDelegadaParaTestes } from "../autoridadeDelegada/autoridadeDelegada.js";
import { definirCoaAtivo } from "../executiveEngine/coaSessao.js";
import { criarProjeto } from "../catalogoProjetos/index.js";

const MISSAO_ALFA = { id: "prj-teste-alfa", nome: "PROJETO TESTE ALFA" };

const MSG_CRIAR_COM_NAO_EXECUTE =
  "Crie o Job necessário para criar o ficheiro projeto-teste-alfa.txt " +
  "com exactamente as linhas PROJETO TESTE ALFA e EXECUÇÃO INICIAL CONCLUÍDA. " +
  "Não execute ainda a próxima acção.";

const JOB_070 = {
  id: "JOB-000070",
  titulo: "MG2",
  estado: "needs_correction",
  projeto: null
};

beforeEach(() => {
  resetStoreContinuidadePadrao();
  resetEstadoTopicosSessao();
  resetEstadoObjectivoSessao();
  reiniciarAutoridadeDelegadaParaTestes();
  executiveEngine.reiniciarAcompanhamentoParaTestes();
});

test("1: autorização criar Job + «não execute próxima» → não bloqueia criação", () => {
  const t = normalizarTexto(MSG_CRIAR_COM_NAO_EXECUTE);
  assert.equal(ehAutorizacaoExplicitaCriarJob(t), true);
  assert.equal(ehProibicaoExecucaoExplicita(t), false);
  assert.equal(
    ehProibicaoExecucaoExplicita(normalizarTexto("Não execute nada.")),
    true
  );
});

test("2: CTO-003 não intercepta criar Job sem Job da missão", () => {
  assert.equal(
    deveInterceptarOperacional({
      texto: MSG_CRIAR_COM_NAO_EXECUTE,
      missaoActiva: MISSAO_ALFA,
      jobs: [JOB_070],
      historico: [
        {
          papel: "ceo",
          texto: "Job JOB-000070 criado em pending. Handoff ao Dispatcher."
        }
      ],
      estadoOperacional: {
        operacaoAberta: true,
        jobActivo: { id: "JOB-000070", titulo: "x", estado: "needs_correction" },
        sinais: { pending: 0, running: 0, failed: 0, dispatcher: false, handoff: true, agentErro: false, gatePendente: 0 }
      }
    }),
    false
  );
});

test("3: jobActivo histórico de outro projeto não entra na missão ALFA", () => {
  const estado = extrairEstadoOperacional({
    missaoActiva: MISSAO_ALFA,
    jobs: [JOB_070],
    historico: [
      {
        papel: "ceo",
        texto: "Execução iniciada. Job JOB-000070 criado em pending."
      }
    ]
  });
  assert.equal(estado.jobActivo, null);
  assert.equal(estado.operacaoAberta, false);
});

test("4: parecer C3 propaga coaId/projeto do COA activo", async () => {
  const parecer = montarParecerTrabalhoExecutivo(
    "Crie o Job para o ficheiro ALFA",
    { classe: "trabalho_executivo", confianca: 0.9, razaoCurta: "c3" },
    { coaId: MISSAO_ALFA.id, projeto: MISSAO_ALFA.nome }
  );
  assert.equal(parecer.coaId, MISSAO_ALFA.id);
  assert.equal(parecer.projeto, MISSAO_ALFA.nome);

  let projetoMotor = null;
  const out = await conduzirTrabalhoExecutivoC3(
    MSG_CRIAR_COM_NAO_EXECUTE,
    { classe: "trabalho_executivo", confianca: 0.9, razaoCurta: "criar job" },
    {
      obterCoaAtivo: () => MISSAO_ALFA,
      conduzirMotor: async (p, deps) => {
        projetoMotor = deps.projeto;
        assert.equal(p.coaId, MISSAO_ALFA.id);
        return {
          publicado: true,
          job: {
            id: "JOB-TEST-ALFA",
            estado: "pending",
            projeto: deps.projeto
          },
          fluxoIniciado: true
        };
      }
    }
  );
  assert.equal(out.dados?.motor?.publicado, true);
  assert.equal(out.dados?.bloqueioP0, undefined);
  assert.ok(
    projetoMotor === MISSAO_ALFA.id || projetoMotor === MISSAO_ALFA.nome,
    `projeto no Motor: ${projetoMotor}`
  );
});

test("EE: criar Job ALFA com histórico 070 — chega ao Motor e publica com projeto ALFA", async () => {
  const alfa = criarProjeto({
    nome: "PROJETO TESTE ALFA",
    descricao: "Missão de validação Dia 3"
  });
  definirCoaAtivo({ id: alfa.id, nome: alfa.nome });

  const fila = criarPublicadorFilaMemoria();
  const deps = {
    listarPorEstado: async (e) => {
      if (e === "needs_correction") return [JOB_070];
      return [];
    },
    leitoresConsciencia: {
      F1: async () => [],
      F2: async () => [
        { id: "JOB-000070", titulo: "MG2", status: "needs_correction" }
      ],
      F3: async () => [],
      F4: async () => ({ estado: "activo" }),
      F5: async () => ({ estado: "ocioso", emCurso: false }),
      F6: async () => ({ estado: "ocioso", ocupado: false }),
      F7: async () => ({ disponivel: false, alertas: 0 }),
      F8: async () => ({ id: alfa.id, nome: alfa.nome })
    },
    publicarJob: fila.publicarJob.bind(fila)
  };

  const out = await executiveEngine.executar(
    {
      texto: MSG_CRIAR_COM_NAO_EXECUTE,
      historico: [
        {
          papel: "ceo",
          texto:
            "Execução iniciada. Job JOB-000070 criado em pending. Handoff ao Dispatcher."
        }
      ]
    },
    deps
  );

  assert.notEqual(out.dados?.bloqueioP0, true);
  assert.notEqual(out.dados?.interceptacaoOperacional, "CTO-003");
  assert.equal(out.modo, "motor_execucao");
  assert.ok(
    out.dados?.motor?.aguardandoGate === true || fila.jobs.length >= 1,
    "ordem deve chegar ao Motor (Gate ou publicação)"
  );

  if (out.dados?.motor?.aguardandoGate) {
    const aprov = await executiveEngine.executar("Aprovado.", deps);
    assert.ok(
      aprov.dados?.job?.id || fila.jobs.length >= 1,
      "após Aprovado, Job deve existir"
    );
  }

  assert.ok(fila.jobs.length >= 1, "Job deve ser criado");
  const job = fila.jobs[fila.jobs.length - 1];
  assert.ok(!/^JOB-00007[0124]$/i.test(String(job.id)), `id inesperado: ${job.id}`);
  const proj = String(job.projeto || "");
  assert.ok(
    /alfa/i.test(proj) || proj === alfa.id || /TESTE ALFA/i.test(proj),
    `projeto deve ser ALFA, obtido: ${proj}`
  );
});
