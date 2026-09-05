/**
 * Política híbrida Gate P1 — bloqueia despacho, não substitui deliberação
 * (objecto ≠ Gate; ARQ-019 léxico intacto via reconhecerDecisao).
 */
import assert from "node:assert/strict";
import { test, beforeEach } from "node:test";
import {
  AVISO_GATE_INFORMATIVO,
  comporProsaLastro,
  ehPedidoDecisaoForaDoGate,
  garantirReflexoEstadoExecutivo,
  schemaHintConsciencia
} from "./influenciaDeliberacao.js";
import { detectarPedidoDecisaoExplicita } from "../classificadorIntencao/pedidoDecisaoExplicita.js";
import { reconhecerDecisao } from "../continuidadeGate/reconhecerDecisao.js";
import { executiveEngine } from "../executiveEngine/index.js";
import { criarPublicadorFilaMemoria } from "../motorExecucao/ponteParecerJob.js";
import { criarStoreContextoGate } from "../continuidadeGate/contexto.js";
import { resetStoreContinuidadePadrao } from "../continuidadeGate/integracaoConversa.js";
import { resetEstadoTopicosSessao } from "../classificadorIntencao/topicosSessao.js";
import { resetEstadoObjectivoSessao } from "../classificadorIntencao/objectivoSessao.js";
import { reiniciarAutoridadeDelegadaParaTestes } from "../autoridadeDelegada/autoridadeDelegada.js";

const DEMO2_GATE =
  "Existe um Gate aguardando sua decisão.\n\n" +
  "Minha recomendação é concluir essa aprovação antes de iniciar novas frentes.";

function lastroGate() {
  return {
    temContextoRelevante: true,
    fontePrioritaria: { id: "F3", nivel: "P1", nome: "Gates pendentes" },
    contagens: { jobsPendentes: 0, jobsEmExecucao: 0, gatesPendentes: 1 },
    factosOficiais: [
      "Estado Executivo — Gate pendente G-1 (parecer PAR-1): Aprovar melhoria X"
    ],
    resultadoMissaoActivo: null
  };
}

beforeEach(() => {
  resetStoreContinuidadePadrao();
  resetEstadoTopicosSessao();
  resetEstadoObjectivoSessao();
  reiniciarAutoridadeDelegadaParaTestes();
  executiveEngine.reiniciarAcompanhamentoParaTestes();
});

test("distinção: Decida A/B/C ≠ Gate; Aprovado/Pode prosseguir = Gate", () => {
  assert.equal(detectarPedidoDecisaoExplicita("Decida entre A, B e C."), true);
  assert.equal(reconhecerDecisao("Decida entre A, B e C.").reconhecida, false);
  assert.equal(ehPedidoDecisaoForaDoGate("Decida entre A, B e C."), true);

  assert.equal(detectarPedidoDecisaoExplicita("Qual decisão devemos tomar?"), true);
  assert.equal(ehPedidoDecisaoForaDoGate("Qual decisão devemos tomar?"), true);

  assert.equal(reconhecerDecisao("Aprovado.").reconhecida, true);
  assert.equal(reconhecerDecisao("Pode prosseguir.").reconhecida, true);
  assert.equal(ehPedidoDecisaoForaDoGate("Aprovado."), false);
  assert.equal(ehPedidoDecisaoForaDoGate("Pode prosseguir."), false);
});

test("1: Gate + Decida A/B/C → deliberação preservada + aviso; sem prosa_canonica_e5", () => {
  const texto = "Decida entre A, B e C.";
  assert.equal(comporProsaLastro(lastroGate(), texto), null);
  const deliberativa = "Decisão: C — adiar a aceitação do contrato.";
  const reflexo = garantirReflexoEstadoExecutivo(
    deliberativa,
    lastroGate(),
    texto
  );
  assert.equal(reflexo.motivo, "aviso_gate_informativo");
  assert.match(reflexo.mensagem, /Decisão:\s*C/i);
  assert.match(reflexo.mensagem, /Gate de execução pendente/i);
  assert.match(reflexo.mensagem, /permanece bloqueado/i);
  assert.doesNotMatch(
    reflexo.mensagem,
    /Existe um Gate aguardando sua decisão[\s\S]*Minha recomendação é concluir essa aprovação/
  );
  assert.ok(reflexo.mensagem.includes(AVISO_GATE_INFORMATIVO));
});

test("2: Gate + Qual decisão devemos tomar? → deliberação + aviso", () => {
  const texto = "Qual decisão devemos tomar?";
  const deliberativa = "Sugiro adiar até haver critérios claros (alternativa C).";
  const reflexo = garantirReflexoEstadoExecutivo(
    deliberativa,
    lastroGate(),
    texto
  );
  assert.equal(reflexo.motivo, "aviso_gate_informativo");
  assert.match(reflexo.mensagem, /Sugiro adiar|alternativa C/i);
  assert.match(reflexo.mensagem, /Gate de execução pendente/i);
});

test("3: Gate + Decida + melhoria → objecto A/B/C, não Gate", () => {
  const texto =
    "Decida entre A, B e C considerando a alternativa que implementa a melhoria.";
  assert.equal(ehPedidoDecisaoForaDoGate(texto), true);
  const deliberativa =
    "Decisão: A — aceitar agora, priorizando a melhoria já especificada.";
  const reflexo = garantirReflexoEstadoExecutivo(
    deliberativa,
    lastroGate(),
    texto
  );
  assert.match(reflexo.mensagem, /Decisão:\s*A/i);
  assert.doesNotMatch(
    reflexo.mensagem,
    /^Existe um Gate aguardando sua decisão/
  );
  assert.match(reflexo.mensagem, /despacho ou execução dependente desse Gate/i);
  const hint = schemaHintConsciencia(lastroGate(), texto);
  assert.match(hint, /INFORMAR|não substituir/i);
  assert.doesNotMatch(hint, /PRIORIDADE ABSOLUTA/);
});

test("6: Gate sem pedido de decisão → prosa canónica E5 preservada", () => {
  const texto = "O que devemos fazer agora?";
  assert.equal(detectarPedidoDecisaoExplicita(texto), false);
  assert.equal(comporProsaLastro(lastroGate(), texto), DEMO2_GATE);
  const reflexo = garantirReflexoEstadoExecutivo(
    "Sugiro replanejar o roadmap.",
    lastroGate(),
    texto
  );
  assert.equal(reflexo.motivo, "prosa_canonica_e5");
  assert.equal(reflexo.mensagem, DEMO2_GATE);
});

test("4/5/7: Gate + Aprovado / Pode prosseguir → Continuidade; despacho só após aprovação", async () => {
  const store = criarStoreContextoGate();
  const fila = criarPublicadorFilaMemoria();
  const registro = new Map();

  const aberto = await executiveEngine.executar("Resolva os bugs.", {
    storeContinuidade: store,
    publicarJob: fila.publicarJob.bind(fila),
    registro
  });
  assert.equal(aberto.dados?.motor?.aguardandoGate, true);
  assert.equal(store.temGatePendente(), true);
  assert.equal(fila.jobs.length, 0, "despacho bloqueado enquanto Gate pendente");

  const aprova = await executiveEngine.executar("Aprovado.", {
    storeContinuidade: store,
    publicarJob: fila.publicarJob.bind(fila),
    registro
  });
  assert.equal(aprova.dados?.continuidade, true);
  assert.equal(aprova.dados?.decisao, "aprovado");
  assert.ok(aprova.dados?.job?.id, "despacho após aprovação do Gate");

  // Segundo ciclo: Pode prosseguir
  const store2 = criarStoreContextoGate();
  const fila2 = criarPublicadorFilaMemoria();
  const reg2 = new Map();
  await executiveEngine.executar("Resolva os bugs.", {
    storeContinuidade: store2,
    publicarJob: fila2.publicarJob.bind(fila2),
    registro: reg2
  });
  assert.equal(fila2.jobs.length, 0);
  const prossegue = await executiveEngine.executar("Pode prosseguir.", {
    storeContinuidade: store2,
    publicarJob: fila2.publicarJob.bind(fila2),
    registro: reg2
  });
  assert.equal(prossegue.dados?.continuidade, true);
  assert.equal(prossegue.dados?.decisao, "aprovado");
  assert.ok(prossegue.dados?.job?.id);
});
