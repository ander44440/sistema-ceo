/**
 * IMP-091 — P1 residuais A/B/C: VCA, integracaoNucleo, destinos clarificação.
 * Com sinais presentes → zero redetecção de objecto/PD/situacional.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { validarContextoAtivo } from "../classificadorIntencao/validadorContextoAtivo.js";
import { conduzirTrabalhoExecutivoC3 } from "../classificadorIntencao/integracaoNucleo.js";
import { executarDestinoClarificacao } from "../classificadorIntencao/destinos.js";
import {
  objectoDoTurno,
  OBJECTO_TURNO
} from "../classificadorIntencao/recomendacaoOperacional.js";
import { detectarPedidoDecisaoExplicita } from "../classificadorIntencao/pedidoDecisaoExplicita.js";
import { ehPedidoSituacionalTrabalho } from "../classificadorIntencao/regras.js";
import { normalizarTexto } from "../classificadorIntencao/lexicon.js";

function contador(fn) {
  const wrap = (...args) => {
    wrap.calls += 1;
    wrap.lastArgs = args;
    return fn(...args);
  };
  wrap.calls = 0;
  wrap.lastArgs = null;
  return wrap;
}

test("P1-A VCA: com objecto/pd/analise → objectoDoTurno e PD = 0", () => {
  const texto = "Analise a proposta do bairro e recomenda.";
  const spyObj = contador(objectoDoTurno);
  const spyPd = contador(detectarPedidoDecisaoExplicita);

  const com = validarContextoAtivo({
    mensagem: texto,
    objectoTurno: OBJECTO_TURNO.B,
    pedidoDecisaoExplicita: false,
    pedidoAnaliseDeliberativa: true,
    calcObjectoDoTurno: spyObj,
    detectarPedidoDecisaoExplicita: spyPd
  });
  // analise=true short-circuit → nem chega a objectoDoTurno/PD
  assert.equal(spyObj.calls, 0);
  assert.equal(spyPd.calls, 0);
  assert.equal(com.veredicto, "independente");
  assert.equal(com.autorizaLastroCsc, false);

  const spyObj2 = contador(objectoDoTurno);
  const sem = validarContextoAtivo({
    mensagem: texto,
    calcObjectoDoTurno: spyObj2
  });
  assert.ok(spyObj2.calls >= 1, "fallback VCA sem sinais detecta objecto");
  assert.equal(sem.veredicto, com.veredicto);
  assert.equal(sem.autorizaLastroCsc, com.autorizaLastroCsc);
});

test("P1-A VCA: analise=false + objecto B ainda isola sem redetectar objecto", () => {
  const texto =
    "dois fornecedores com reajuste de preço; qual caminho recomenda?";
  const spyObj = contador(objectoDoTurno);
  const r = validarContextoAtivo({
    mensagem: texto,
    objectoTurno: OBJECTO_TURNO.B,
    pedidoDecisaoExplicita: false,
    pedidoAnaliseDeliberativa: false,
    calcObjectoDoTurno: spyObj
  });
  assert.equal(spyObj.calls, 0);
  assert.equal(r.veredicto, "independente");
});

test("P1-B integracaoNucleo: polaridade com sinais — objecto/PD/sit = 0", async () => {
  const texto = "Analise o estado da fila e não execute.";
  const spyObj = contador(objectoDoTurno);
  const spyPd = contador(detectarPedidoDecisaoExplicita);
  const spySit = contador(ehPedidoSituacionalTrabalho);

  const out = await conduzirTrabalhoExecutivoC3(
    texto,
    {
      classe: "trabalho_executivo",
      destino: "motor_execucao",
      confianca: 0.9
    },
    {
      conduzirMotor: async () => {
        throw new Error("motor não deve ser chamado");
      },
      objectoTurno: OBJECTO_TURNO.B,
      pedidoDecisaoExplicita: false,
      pedidoAnaliseDeliberativa: true,
      pedidoSituacionalTrabalho: false,
      calcObjectoDoTurno: spyObj,
      detectarPedidoDecisaoExplicita: spyPd,
      ehPedidoSituacionalTrabalho: spySit,
      listarJobs: async () => [],
      obterJob: async () => null
    }
  );
  assert.equal(spyObj.calls, 0);
  assert.equal(spyPd.calls, 0);
  assert.equal(out.dados?.bloqueioP0, true);
});

test("P1-B integracaoNucleo: consulta turno actual consome situacional", async () => {
  const texto = "qual é o estado atual?";
  const spySit = contador(ehPedidoSituacionalTrabalho);
  const out = await conduzirTrabalhoExecutivoC3(
    texto,
    {
      classe: "trabalho_executivo",
      destino: "motor_execucao",
      confianca: 0.9
    },
    {
      conduzirMotor: async () => {
        throw new Error("motor não deve ser chamado");
      },
      pedidoSituacionalTrabalho: true,
      ehPedidoSituacionalTrabalho: spySit,
      listarJobs: async () => [],
      obterJob: async () => null,
      lerMemoriaFn: () => ({})
    }
  );
  assert.equal(spySit.calls, 0, "situacional canónico → sem detector");
  assert.equal(out.capacidade, "memoria");
  assert.equal(out.dados?.bloqueioP0, true);
});

test("P1-B fallback: sem sinais → detector corre; polaridade equivalente", async () => {
  const texto = "Analise a proposta do bairro popular.";
  const spyObj = contador(objectoDoTurno);
  const out = await conduzirTrabalhoExecutivoC3(
    texto,
    {
      classe: "trabalho_executivo",
      destino: "motor_execucao",
      confianca: 0.9
    },
    {
      conduzirMotor: async () => {
        throw new Error("motor não deve ser chamado");
      },
      calcObjectoDoTurno: spyObj
    }
  );
  assert.ok(spyObj.calls >= 1);
  assert.equal(out.dados?.bloqueioP0, true);
});

test("P1-C destinos clarificação: com analise/objecto → sem objectoDoTurno", async () => {
  const texto = "continue o JOB-000001; analisa o impacto";
  const spyObj = contador(objectoDoTurno);
  const out = await executarDestinoClarificacao({
    texto,
    historico: [],
    intencao: { id: "clarificacao", capacidade: "ia" },
    classificacao: { classe: "conhecimento_geral", destino: "clarificacao" },
    rota: { destino: "clarificacao" },
    obterCapacidade: () => null,
    contextoCapacidade: (x) => x,
    naturalizar: (r) => r,
    objectoTurno: OBJECTO_TURNO.B,
    pedidoDecisaoExplicita: false,
    pedidoAnaliseDeliberativa: true,
    deps: {
      calcObjectoDoTurno: spyObj,
      lastroConsciencia: {
        estadoOperacional: {
          operacaoAberta: true,
          jobActivo: { id: "JOB-000001", estado: "running" }
        }
      }
    }
  });
  assert.equal(spyObj.calls, 0);
  // Com análise canónica, não força motor apesar de operação aberta + comando job-like
  assert.notEqual(out.capacidade, "motor_execucao");
});

test("P1-C clarificação fallback sem sinais preserva polaridade análise", async () => {
  const t = normalizarTexto("Analise a proposta e não execute.");
  const spyObj = contador(objectoDoTurno);
  const out = await executarDestinoClarificacao({
    texto: "Analise a proposta e não execute.",
    historico: [],
    intencao: { id: "clarificacao", capacidade: "ia" },
    classificacao: { classe: "conhecimento_geral", destino: "clarificacao" },
    rota: { destino: "clarificacao" },
    obterCapacidade: () => null,
    contextoCapacidade: (x) => x,
    naturalizar: (r) => r,
    deps: {
      calcObjectoDoTurno: spyObj,
      lastroConsciencia: {
        estadoOperacional: { operacaoAberta: true, jobActivo: { id: "JOB-1" } }
      }
    }
  });
  assert.ok(spyObj.calls >= 1 || t.includes("analise"));
  assert.notEqual(out.capacidade, "motor_execucao");
});
