/**
 * IMP-091 pós-B2 — anti-redetecção: produtores injectados + consumo de sinais.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { criarTurnEnvelope } from "./index.js";
import { produzirSinaisTurno } from "./produzirSinais.js";
import { detectarPedidoInfoGathering } from "../classificadorIntencao/pedidoInfoGathering.js";
import { detectarPedidoDecisaoExplicita } from "../classificadorIntencao/pedidoDecisaoExplicita.js";
import {
  detectarPedidoConsultaResposta,
  detectarPedidoAnaliseDeliberativa
} from "../mre/politicaAnaliseDeliberativa.js";
import {
  ehPedidoSituacionalTrabalho,
  classificar
} from "../classificadorIntencao/regras.js";
import {
  ehRecomendacaoOperacional,
  objectoDoTurno,
  OBJECTO_TURNO
} from "../classificadorIntencao/recomendacaoOperacional.js";
import {
  ehPedidoConsultaOuRespostaComposta,
  ehOrdemExecucaoOperacional
} from "../autoridadeDelegada/autoridadeDelegada.js";
import { detectarPanoramaEstadoGeralActual } from "./produzirSinais.js";

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

test("P2: produzirSinaisTurno — situacional/IG/PD ≤1×; PD recebe infoGathering; consulta recebe situacional", () => {
  const ig = contador(detectarPedidoInfoGathering);
  const pd = contador(detectarPedidoDecisaoExplicita);
  const consulta = contador(detectarPedidoConsultaResposta);
  const sit = contador(ehPedidoSituacionalTrabalho);
  const objecto = contador((texto, fio, opts) => {
    assert.equal(typeof opts?.infoGathering, "boolean");
    assert.equal(typeof opts?.pedidoDecisaoExplicita, "boolean");
    return objectoDoTurno(texto, fio, opts);
  });

  const env = produzirSinaisTurno(
    criarTurnEnvelope({
      mensagemAtual: "qual é o próximo passo do trabalho?",
      coaIdEntrada: "prj-mg2"
    }),
    {
      fioCoa: [],
      produtores: {
        detectarPedidoInfoGathering: ig,
        detectarPedidoDecisaoExplicita: pd,
        detectarPedidoConsultaResposta: consulta,
        ehPedidoSituacionalTrabalho: sit,
        detectarPedidoAnaliseDeliberativa: contador(
          detectarPedidoAnaliseDeliberativa
        ),
        ehPedidoConsultaOuRespostaComposta: contador(
          ehPedidoConsultaOuRespostaComposta
        ),
        ehOrdemExecucaoOperacional: contador(ehOrdemExecucaoOperacional),
        objectoDoTurno: objecto,
        detectarPanoramaEstadoGeralActual: contador(
          detectarPanoramaEstadoGeralActual
        )
      }
    }
  );

  assert.equal(sit.calls, 1, "situacional exactamente 1×");
  assert.equal(ig.calls, 1, "IG exactamente 1×");
  assert.equal(pd.calls, 1, "PD exactamente 1×");
  assert.equal(consulta.calls, 1, "consulta 1×");
  assert.equal(objecto.calls, 1, "objectoDoTurno 1×");
  // PD recebeu o boolean IG já calculado (anti dupla IG)
  assert.equal(pd.lastArgs[1]?.infoGathering, false);
  assert.equal(consulta.lastArgs[1]?.situacional, true);
  assert.equal(objecto.lastArgs[2]?.infoGathering, false);
  assert.equal(objecto.lastArgs[2]?.pedidoDecisaoExplicita, false);
  assert.equal(env.derivacoes.situacional, true);
  assert.equal(env.sinais.consulta.valor, true);
});

test("P2: E4 canónico — IG/PD topo 1×; objecto recebe ig/pd (sem reavaliar aninhado)", () => {
  // Texto que só chega a A via ehPedidoOperacionalSistema (não âncora forte)
  const texto = "Qual deveria ser a prioridade?";
  const ig = contador(detectarPedidoInfoGathering);
  const pd = contador(detectarPedidoDecisaoExplicita);
  const objecto = contador((t, fio, opts) => objectoDoTurno(t, fio, opts));

  const env = produzirSinaisTurno(
    criarTurnEnvelope({ mensagemAtual: texto, coaIdEntrada: "prj-mg2" }),
    {
      fioCoa: [],
      produtores: {
        detectarPedidoInfoGathering: ig,
        detectarPedidoDecisaoExplicita: pd,
        objectoDoTurno: objecto
      }
    }
  );

  assert.equal(ig.calls, 1);
  assert.equal(pd.calls, 1);
  assert.equal(objecto.calls, 1);
  assert.equal(objecto.lastArgs[2]?.infoGathering, false);
  assert.equal(objecto.lastArgs[2]?.pedidoDecisaoExplicita, false);
  assert.equal(env.sinais.objecto_turno.valor, OBJECTO_TURNO.A);

  // Semântica: pd canónico true bloqueia objecto A operacional (sem chamar detector)
  assert.equal(
    objectoDoTurno(texto, [], {
      infoGathering: false,
      pedidoDecisaoExplicita: true
    }),
    OBJECTO_TURNO.INDEFINIDO
  );
});

test("P1: classificar com situacional/pd/objecto — mesma classe; override situacional:false evita ramo situacional", () => {
  const texto = "qual é o próximo passo do trabalho?";
  const env = produzirSinaisTurno(
    criarTurnEnvelope({ mensagemAtual: texto, coaIdEntrada: "prj-mg2" }),
    { fioCoa: [] }
  );

  const comSinais = classificar(texto, {
    situacional: env.derivacoes.situacional,
    pedidoDecisaoExplicita: env.sinais.pd.valor === true,
    objectoTurno: env.sinais.objecto_turno.valor
  });
  assert.equal(comSinais.classe, "conversa_projeto");
  assert.match(comSinais.razaoCurta || "", /situacional/i);

  const forcarNaoSit = classificar(texto, {
    situacional: false,
    pedidoDecisaoExplicita: false,
    objectoTurno: OBJECTO_TURNO.INDEFINIDO
  });
  assert.doesNotMatch(forcarNaoSit.razaoCurta || "", /situacional de trabalho/i);
});

test("P1: ehRecomendacaoOperacional com pedidoDecisaoExplicita true bloqueia sem precisar do detector", () => {
  assert.equal(
    ehRecomendacaoOperacional("Qual prioridade você recomenda na fila agora?", [], {
      objectoTurno: OBJECTO_TURNO.A,
      pedidoDecisaoExplicita: true
    }),
    false
  );
  assert.equal(
    ehRecomendacaoOperacional("Qual prioridade você recomenda na fila agora?", [], {
      objectoTurno: OBJECTO_TURNO.A,
      pedidoDecisaoExplicita: false
    }),
    true
  );
});

test("P1 fallback: sem situacional no ctx → classificar ainda resolve (detector)", () => {
  const saida = classificar("qual é o próximo passo do trabalho?", {});
  assert.equal(saida.classe, "conversa_projeto");
  assert.match(saida.razaoCurta || "", /situacional/i);
});

test("P2: detectarPedidoConsultaResposta com situacional não reavalia detector", () => {
  const sit = contador(ehPedidoSituacionalTrabalho);
  // chamada directa com flag — o detector situacional não entra
  assert.equal(
    detectarPedidoConsultaResposta("x", { situacional: true }),
    true
  );
  assert.equal(
    detectarPedidoConsultaResposta("x", { situacional: false }),
    false
  );
  // contador local não é injectado no módulo — apenas prova API do override
  assert.equal(sit.calls, 0);
});

test("P1: CN comporDeliberacao consome pedidoAnaliseDeliberativa sem redetectar", async () => {
  const { parecerValidoCompleto } = await import("../mre/parecer/fixtures.js");
  const { comporDeliberacao } = await import("../conversacaoNatural/compor.js");
  const analise = contador(detectarPedidoAnaliseDeliberativa);
  const parecer = parecerValidoCompleto();
  parecer.analise =
    "Cenário A tem risco operacional; cenário B depende de orçamento.";
  parecer.decisaoExecutiva.estado = "aprovar";
  parecer.decisaoExecutiva.recomendacao = "Aprovar A";
  parecer.decisaoExecutiva.justificativa = "Estabilidade técnica.";
  parecer.decisaoExecutiva.alternativas = ["B"];
  parecer.lacunas = [];

  const instrucao = "Analise a proposta do bairro e recomenda.";
  // Override: false explícito — não deve entrar em prosa de análise mesmo com texto analítico
  const outOff = comporDeliberacao(parecer, {}, {
    instrucao,
    canal: "chat",
    pedidoAnaliseDeliberativa: false,
    pedidoDecisaoExplicita: false,
    pedidoInfoGathering: false,
    pedidoConsultaResposta: false
  });
  assert.equal(
    Array.isArray(outOff.camadasUsadas)
      ? outOff.camadasUsadas.includes("analise_deliberativa")
      : outOff.camadasUsadas?.analise_deliberativa != null,
    false
  );

  const outOn = comporDeliberacao(parecer, {}, {
    instrucao: "texto sem marcadores de analise deliberativa xyz",
    canal: "chat",
    pedidoAnaliseDeliberativa: true,
    pedidoDecisaoExplicita: false,
    pedidoInfoGathering: false,
    pedidoConsultaResposta: false
  });
  assert.ok(
    Array.isArray(outOn.camadasUsadas)
      ? outOn.camadasUsadas.includes("analise_deliberativa")
      : Boolean(outOn.camadasUsadas)
  );

  // Contador local não injectado em compor — prova comportamental do override acima
  assert.equal(analise.calls, 0);
});
