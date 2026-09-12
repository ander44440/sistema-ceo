/**
 * IMP-091 — limpeza P1-1…P1-4: com sinal presente o detector não corre;
 * sem sinal o fallback permanece semanticamente equivalente.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  temVerboExecucao,
  desambiguarJobs,
  ehPedidoAnaliseOuRecomendacao,
  normalizarTexto
} from "../classificadorIntencao/regras.js";
import {
  ehPedidoMistoEstadoERecomendacaoOperacional,
  ehRecomendacaoOperacional,
  objectoDoTurno,
  OBJECTO_TURNO
} from "../classificadorIntencao/recomendacaoOperacional.js";
import { detectarPedidoDecisaoExplicita } from "../classificadorIntencao/pedidoDecisaoExplicita.js";
import { deveInterceptarOperacional } from "../conversacaoNatural/interceptacaoOperacional.js";
import {
  identificarConsultaEstado,
  executarConsultaEstado
} from "../executiveEngine/capacidades/consultarEstado.js";
import { ehPedidoSituacionalTrabalho } from "../classificadorIntencao/regras.js";

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

test("P1-1: temVerboExecucao / desambiguarJobs — com objectoTurno, objectoDoTurno=0", () => {
  const texto = normalizarTexto(
    "analise o impacto e recomenda prioridade; jobs para outdoor"
  );
  const spyObj = contador(objectoDoTurno);
  const opts = {
    objectoTurno: OBJECTO_TURNO.B,
    pedidoDecisaoExplicita: false,
    calcObjectoDoTurno: spyObj
  };
  const comSinal = temVerboExecucao(texto, [], opts);
  assert.equal(spyObj.calls, 0, "objecto canónico → sem objectoDoTurno");
  assert.equal(comSinal, false);

  const spyObj2 = contador(objectoDoTurno);
  const semSinal = temVerboExecucao(texto, [], {
    calcObjectoDoTurno: spyObj2
  });
  assert.ok(spyObj2.calls >= 1, "fallback sem objectoTurno chama detector");
  assert.equal(semSinal, comSinal, "equivalência semântica temVerboExecucao");

  const spyObj3 = contador(objectoDoTurno);
  assert.equal(
    desambiguarJobs(texto, [], {
      objectoTurno: OBJECTO_TURNO.B,
      pedidoDecisaoExplicita: false,
      calcObjectoDoTurno: spyObj3
    }),
    null
  );
  assert.equal(spyObj3.calls, 0);
});

test("P1-2: CTO-003 — com pd/objecto, detectarPd e objectoDoTurno = 0", () => {
  const texto = "continue o JOB-000001";
  const spyPd = contador(detectarPedidoDecisaoExplicita);
  const spyObj = contador(objectoDoTurno);
  const estadoAberto = {
    operacaoAberta: true,
    jobActivo: { id: "JOB-000001", estado: "running" }
  };

  const comSinais = deveInterceptarOperacional({
    texto,
    estadoOperacional: estadoAberto,
    pedidoDecisaoExplicita: false,
    objectoTurno: OBJECTO_TURNO.A,
    detectarPedidoDecisaoExplicita: spyPd,
    calcObjectoDoTurno: spyObj
  });
  assert.equal(spyPd.calls, 0, "pd canónico → sem detectarPedidoDecisaoExplicita");
  assert.equal(spyObj.calls, 0, "objecto canónico → sem objectoDoTurno");

  const spyPd2 = contador(detectarPedidoDecisaoExplicita);
  const semSinais = deveInterceptarOperacional({
    texto,
    estadoOperacional: estadoAberto,
    detectarPedidoDecisaoExplicita: spyPd2
  });
  assert.ok(spyPd2.calls >= 1, "fallback sem pd chama detector");
  assert.equal(semSinais, comSinais, "equivalência CTO-003 com pd=false");
});

test("P1-2: CTO-003 — pd canónico true bloqueia interceptação sem redetectar", () => {
  const texto = "continue o trabalho; qual decisão devemos tomar?";
  const spyPd = contador(detectarPedidoDecisaoExplicita);
  const bloqueado = deveInterceptarOperacional({
    texto,
    estadoOperacional: { operacaoAberta: true },
    pedidoDecisaoExplicita: true,
    objectoTurno: OBJECTO_TURNO.B,
    detectarPedidoDecisaoExplicita: spyPd,
    calcObjectoDoTurno: contador(objectoDoTurno)
  });
  assert.equal(bloqueado, false);
  assert.equal(spyPd.calls, 0);
});

test("P1-3: ehPedidoMisto — com objecto/pd, detectores = 0", () => {
  const texto =
    "Onde estamos no estado atual da fila e qual prioridade você recomenda agora?";
  const spyPd = contador(detectarPedidoDecisaoExplicita);
  const spyObj = contador(objectoDoTurno);
  const opts = {
    objectoTurno: OBJECTO_TURNO.A,
    pedidoDecisaoExplicita: false,
    infoGathering: false,
    detectarPedidoDecisaoExplicita: spyPd,
    calcObjectoDoTurno: spyObj
  };
  const com = ehPedidoMistoEstadoERecomendacaoOperacional(texto, [], opts);
  assert.equal(spyPd.calls, 0);
  assert.equal(spyObj.calls, 0);
  assert.equal(com, true);
  assert.equal(ehRecomendacaoOperacional(texto, [], opts), true);

  const spyPd2 = contador(detectarPedidoDecisaoExplicita);
  const spyObj2 = contador(objectoDoTurno);
  const sem = ehPedidoMistoEstadoERecomendacaoOperacional(texto, [], {
    detectarPedidoDecisaoExplicita: spyPd2,
    calcObjectoDoTurno: spyObj2
  });
  assert.ok(spyPd2.calls + spyObj2.calls >= 1, "fallback sem sinais detecta");
  assert.equal(sem, com);
});

test("P1-4: identificarConsultaEstado — com situacional, detector = 0", () => {
  const texto = "qual é o estado atual?";
  const spySit = contador(ehPedidoSituacionalTrabalho);

  const comTrue = identificarConsultaEstado(texto, {
    situacional: true,
    ehPedidoSituacionalTrabalho: spySit
  });
  assert.equal(spySit.calls, 0);
  assert.equal(comTrue.tipo, "desconhecida");

  const spySit2 = contador(ehPedidoSituacionalTrabalho);
  const comFalse = identificarConsultaEstado(texto, {
    situacional: false,
    ehPedidoSituacionalTrabalho: spySit2
  });
  assert.equal(spySit2.calls, 0);
  assert.equal(comFalse.tipo, "estado_geral");

  const spySit3 = contador(ehPedidoSituacionalTrabalho);
  const sem = identificarConsultaEstado(texto, {
    ehPedidoSituacionalTrabalho: spySit3
  });
  assert.equal(spySit3.calls, 1);
  // fallback: texto «estado atual» sem sit → estado_geral (sit false para este léxico)
  assert.equal(sem.tipo, comFalse.tipo);
});

test("P1-4: executarConsultaEstado propaga situacional (turno actual)", async () => {
  const spySit = contador(ehPedidoSituacionalTrabalho);
  await executarConsultaEstado("qual é o estado atual?", {
    situacional: true,
    ehPedidoSituacionalTrabalho: spySit,
    lerMemoriaFn: () => ({}),
    listarJobs: async () => [],
    obterJob: async () => null
  });
  assert.equal(
    spySit.calls,
    0,
    "portas.situacional presente → sem ehPedidoSituacionalTrabalho"
  );
});

test("P1-1 semântica: ehPedidoAnalise com objecto B ≡ fallback real", () => {
  const t = normalizarTexto(
    "dois fornecedores com reajuste de preço; qual caminho recomenda?"
  );
  const com = ehPedidoAnaliseOuRecomendacao(t, [], {
    objectoTurno: OBJECTO_TURNO.B,
    pedidoDecisaoExplicita: false
  });
  const sem = ehPedidoAnaliseOuRecomendacao(t, []);
  assert.equal(com, true);
  assert.equal(sem, true);
});
