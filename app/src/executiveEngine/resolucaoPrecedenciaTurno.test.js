/**
 * Resolução de Precedência por Turno — V1 (testes unitários).
 */
import assert from "node:assert/strict";
import { test, beforeEach } from "node:test";
import {
  AUTORIDADE,
  TIPO_TURNO_PREC,
  resolverPrecedenciaTurno,
  cnPodeAlterarDestino,
  anexarPrecedenciaNaResposta
} from "./resolucaoPrecedenciaTurno.js";
import { executiveEngine } from "./index.js";
import { criarPublicadorFilaMemoria } from "../motorExecucao/ponteParecerJob.js";
import { resetStoreContinuidadePadrao } from "../continuidadeGate/integracaoConversa.js";
import { resetEstadoTopicosSessao } from "../classificadorIntencao/topicosSessao.js";
import { resetEstadoObjectivoSessao } from "../classificadorIntencao/objectivoSessao.js";
import { reiniciarAutoridadeDelegadaParaTestes } from "../autoridadeDelegada/autoridadeDelegada.js";

beforeEach(() => {
  resetStoreContinuidadePadrao();
  resetEstadoTopicosSessao();
  resetEstadoObjectivoSessao();
  reiniciarAutoridadeDelegadaParaTestes();
});

test("V1: Gate vence tudo", () => {
  const r = resolverPrecedenciaTurno({
    gateContinuidade: true,
    pedidoDecisaoExplicita: true,
    cto003Candidato: true,
    objetoOperacionalReal: true
  });
  assert.equal(r.autoridade, AUTORIDADE.GATE);
  assert.equal(r.acao, "continuar_gate");
  assert.equal(r.permiteCto003, false);
});

test("V1: PD bloqueia AD/CTO e força C2", () => {
  const r = resolverPrecedenciaTurno({
    pedidoDecisaoExplicita: true,
    adOrdemExecucao: true,
    cto003Candidato: true,
    objetoOperacionalReal: true
  });
  assert.equal(r.autoridade, AUTORIDADE.PEDIDO_DECISAO);
  assert.equal(r.destinoPermitido, "nucleo_mre");
  assert.equal(r.permiteAdExecucao, false);
  assert.equal(r.permiteCto003, false);
  assert.equal(r.tipoTurno, TIPO_TURNO_PREC.DECISAO);
});

test("V1: situacional → C2 consulta (não C4 panorama)", () => {
  const r = resolverPrecedenciaTurno({
    pedidoSituacionalTrabalho: true,
    panoramaEstadoGeral: true
  });
  assert.equal(r.forcarC2, true);
  assert.equal(r.forcarC4Panorama, false);
  assert.equal(r.tipoTurno, TIPO_TURNO_PREC.CONSULTA);
  assert.equal(r.permiteAdExecucao, false);
});

test("P1: situacional + destino C4 → não forcarC2", () => {
  const r = resolverPrecedenciaTurno({
    pedidoSituacionalTrabalho: true,
    destinoClassificador: "capacidade_operacional",
    fase: "pos_classificador"
  });
  assert.equal(r.forcarC2, false);
  assert.equal(r.acao, "seguir_classificador");
  assert.equal(r.destinoPermitido, "capacidade_operacional");
});

test("P1: situacional sem destino C4 → forcarC2", () => {
  const semDestino = resolverPrecedenciaTurno({
    pedidoSituacionalTrabalho: true
  });
  assert.equal(semDestino.forcarC2, true);
  const c2 = resolverPrecedenciaTurno({
    pedidoSituacionalTrabalho: true,
    destinoClassificador: "nucleo_mre"
  });
  assert.equal(c2.forcarC2, true);
});

test('P1 EE: «qual deve ser o próximo passo» permanece C4', async () => {
  const fila = criarPublicadorFilaMemoria();
  let motorChamado = false;
  const out = await executiveEngine.executar(
    { texto: "qual deve ser o próximo passo", historico: [] },
    {
      publicarJob: fila.publicarJob.bind(fila),
      listarPorEstado: async () => [],
      conduzirMotor: async () => {
        motorChamado = true;
        return { publicado: true, job: { id: "JOB-PROBE", estado: "pending" } };
      }
    }
  );
  assert.equal(out.dados?.classificacao?.classe, "comando_operacional");
  assert.equal(out.dados?.encaminhamento?.destino, "capacidade_operacional");
  assert.notEqual(out.dados?.mreInvocado, true);
  assert.notEqual(out.dados?.motorAcionado, true);
  assert.equal(motorChamado, false);
});

test('P1 EE: «explique o estado da fila» continua C2', async () => {
  const fila = criarPublicadorFilaMemoria();
  const out = await executiveEngine.executar(
    { texto: "explique o estado da fila", historico: [] },
    {
      publicarJob: fila.publicarJob.bind(fila),
      listarPorEstado: async () => []
    }
  );
  assert.equal(out.dados?.classificacao?.classe, "conversa_projeto");
  assert.equal(out.dados?.encaminhamento?.destino, "nucleo_mre");
});

test("V1: panorama geral → C4", () => {
  const r = resolverPrecedenciaTurno({ panoramaEstadoGeral: true });
  assert.equal(r.forcarC4Panorama, true);
  assert.equal(r.destinoPermitido, "capacidade_operacional");
  assert.equal(r.tipoTurno, TIPO_TURNO_PREC.CONSULTA);
});

test("Autodiagnóstico CEO: «estado atual» não vira consulta situacional/panorama", async () => {
  const { ehPedidoAutodiagnosticoOuAutoavaliacaoCeo } = await import(
    "../classificadorIntencao/regras.js"
  );
  const { normalizarTexto } = await import("../classificadorIntencao/lexicon.js");
  const texto =
    "CEO, faça um autodiagnóstico do seu estado atual. Avalie suas capacidades atuais e limitações.";
  assert.equal(
    ehPedidoAutodiagnosticoOuAutoavaliacaoCeo(normalizarTexto(texto)),
    true
  );

  const fila = criarPublicadorFilaMemoria();
  const out = await executiveEngine.executar(
    { texto, historico: [] },
    { publicarJob: fila.publicarJob.bind(fila), listarPorEstado: async () => [] }
  );
  assert.equal(fila.jobs.length, 0, "não cria Job");
  assert.notEqual(out.dados?.precedenciaTurno?.forcarC4Panorama, true);
  assert.doesNotMatch(
    String(out.mensagem || ""),
    /consulta_situacional|Bloqueio por lacuna/i
  );
  assert.notEqual(out.dados?.encaminhamento?.destino, "motor_execucao");
});

test("Autoavaliação CEO: não capturada como panorama por «estado atual»", async () => {
  const { ehPedidoAutodiagnosticoOuAutoavaliacaoCeo } = await import(
    "../classificadorIntencao/regras.js"
  );
  const { normalizarTexto } = await import("../classificadorIntencao/lexicon.js");
  const texto =
    "Faça uma autoavaliação do seu estado atual como CEO — o que funciona e o que limita.";
  assert.equal(
    ehPedidoAutodiagnosticoOuAutoavaliacaoCeo(normalizarTexto(texto)),
    true
  );

  const fila = criarPublicadorFilaMemoria();
  const out = await executiveEngine.executar(
    { texto, historico: [] },
    { publicarJob: fila.publicarJob.bind(fila), listarPorEstado: async () => [] }
  );
  assert.equal(fila.jobs.length, 0);
  assert.doesNotMatch(
    String(out.mensagem || ""),
    /consulta_situacional|Bloqueio por lacuna/i
  );
});

test("Consulta situacional/panorama legítima com «estado atual» preservada", async () => {
  const { ehPedidoAutodiagnosticoOuAutoavaliacaoCeo } = await import(
    "../classificadorIntencao/regras.js"
  );
  const { normalizarTexto } = await import("../classificadorIntencao/lexicon.js");
  assert.equal(
    ehPedidoAutodiagnosticoOuAutoavaliacaoCeo(
      normalizarTexto("Qual é o estado atual?")
    ),
    false
  );

  const fila = criarPublicadorFilaMemoria();
  const out = await executiveEngine.executar(
    { texto: "Qual é o estado atual?", historico: [] },
    { publicarJob: fila.publicarJob.bind(fila), listarPorEstado: async () => [] }
  );
  assert.equal(fila.jobs.length, 0);
  assert.equal(out.dados?.encaminhamento?.destino, "capacidade_operacional");
  assert.equal(out.dados?.precedenciaTurno?.tipoTurno, TIPO_TURNO_PREC.CONSULTA);
});

test("Pedido operacional legítimo não é autodiagnóstico", async () => {
  const { ehPedidoAutodiagnosticoOuAutoavaliacaoCeo } = await import(
    "../classificadorIntencao/regras.js"
  );
  const { normalizarTexto } = await import("../classificadorIntencao/lexicon.js");
  const texto = "Qual é o estado atual da fila de execução?";
  assert.equal(
    ehPedidoAutodiagnosticoOuAutoavaliacaoCeo(normalizarTexto(texto)),
    false
  );

  const fila = criarPublicadorFilaMemoria();
  const out = await executiveEngine.executar(
    { texto, historico: [] },
    { publicarJob: fila.publicarJob.bind(fila), listarPorEstado: async () => [] }
  );
  assert.equal(fila.jobs.length, 0);
  assert.equal(out.dados?.classificacao?.classe, "comando_operacional");
  assert.equal(out.dados?.encaminhamento?.destino, "capacidade_operacional");
});

test("P2: composta + AD → classificador; sem forcarC2; sem execução AD", () => {
  const r = resolverPrecedenciaTurno({
    adOrdemExecucao: true,
    objetoOperacionalReal: true,
    pedidoConsultaOuRespostaComposta: true,
    fase: "pre_classificador"
  });
  assert.equal(r.acao, "seguir_classificador");
  assert.equal(r.permiteAdExecucao, false);
  assert.equal(r.forcarC2, false);
  assert.equal(r.autoridade, AUTORIDADE.CLASSIFICADOR);
});

test("P2: ordem pura AD → permiteAdExecucao; composta não altera situacional", () => {
  const pura = resolverPrecedenciaTurno({
    adOrdemExecucao: true,
    objetoOperacionalReal: true
  });
  assert.equal(pura.permiteAdExecucao, true);
  assert.equal(pura.acao, "permitir_ad_execucao_c3");

  const sit = resolverPrecedenciaTurno({
    pedidoSituacionalTrabalho: true,
    adOrdemExecucao: true,
    objetoOperacionalReal: true,
    pedidoConsultaOuRespostaComposta: true
  });
  assert.equal(sit.forcarC2, true);
  assert.equal(sit.permiteAdExecucao, false);
  assert.equal(sit.acao, "forcar_analise_situacional_c2");
});

test("V1: AD/CTO só com objeto operacional", () => {
  const sem = resolverPrecedenciaTurno({
    cto003Candidato: true,
    objetoOperacionalReal: false
  });
  assert.equal(sem.permiteCto003, false);

  const com = resolverPrecedenciaTurno({
    cto003Candidato: true,
    objetoOperacionalReal: true
  });
  assert.equal(com.permiteCto003, true);
  assert.equal(com.destinoPermitido, "motor_execucao");
  assert.equal(com.tipoTurno, TIPO_TURNO_PREC.ACAO);
});

test("V1: CN nunca altera destino", () => {
  const r = resolverPrecedenciaTurno({
    destinoClassificador: "nucleo_mre",
    fase: "pos_destino"
  });
  assert.equal(cnPodeAlterarDestino(r, "nucleo_mre", "motor_execucao"), false);
  assert.equal(r.bloqueados.includes(AUTORIDADE.CONSCIENCIA_CN), true);
  const out = anexarPrecedenciaNaResposta(
    {
      mensagem: "ok",
      dados: { encaminhamento: { destino: "nucleo_mre" } }
    },
    r
  );
  assert.equal(out.dados.encaminhamento.destino, "nucleo_mre");
  assert.ok(out.dados.precedenciaTurno);
});
