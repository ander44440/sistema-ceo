/**
 * IMP-057 E5 — Destinos C1–C4 (ligação real, anti-fallback).
 */
import assert from "node:assert/strict";
import { test, beforeEach } from "node:test";

import { executiveEngine } from "../executiveEngine/index.js";
import {
  contemSugiroComoRespostaFinal,
  classificarEEncaminhar
} from "./index.js";
import {
  executarPorDestino,
  CAPACIDADES_C4
} from "./destinos.js";
import { criarPublicadorFilaMemoria } from "../motorExecucao/ponteParecerJob.js";
import { resetStoreContinuidadePadrao } from "../continuidadeGate/integracaoConversa.js";
import { resetEstadoTopicosSessao } from "./topicosSessao.js";
import { resetEstadoObjectivoSessao } from "./objectivoSessao.js";

const FIX = {
  C1: "Bom dia",
  C2: "Como priorizar o pagamento no MG2?",
  C3: "Quero que você resolva os bugs do projeto.",
  C4: "listar jobs"
};

beforeEach(() => {
  resetStoreContinuidadePadrao();
  resetEstadoTopicosSessao();
  resetEstadoObjectivoSessao();
});

test("E5: mapa CAPACIDADES_C4 não inclui motor nem ia deliberativa", () => {
  assert.ok(CAPACIDADES_C4.includes("fila"));
  assert.ok(CAPACIDADES_C4.includes("memoria"));
  assert.equal(CAPACIDADES_C4.includes("motor_execucao"), false);
  assert.equal(CAPACIDADES_C4.includes("ia"), false);
});

test("E5-CA1: C2 com mock publicarJob → zero chamadas", async () => {
  let jobs = 0;
  const out = await executiveEngine.executar(FIX.C2, {
    publicarJob: async () => {
      jobs += 1;
      return { id: "JOB-LEAK", estado: "pending" };
    }
  });
  assert.equal(out.dados?.encaminhamento?.destino, "nucleo_mre");
  assert.equal(out.dados?.classificacao?.classe, "conversa_projeto");
  assert.equal(out.dados?.motorAcionado, false);
  assert.equal(out.dados?.publicarJobProibido, true);
  assert.equal(jobs, 0, "C2 não pode publicar Job");
});

test("E5-CA2: C3 → Motor; prosa ≠ Sugiro isolado", async () => {
  let motor = 0;
  const fila = criarPublicadorFilaMemoria();
  const out = await executiveEngine.executar(
    "Implementa o outdoor e despacha",
    {
      publicarJob: fila.publicarJob.bind(fila),
      decisaoAprovacao: "aprovado",
      conduzirMotor: async (parecer, deps) => {
        motor += 1;
        return executiveEngine.conduzirMotorExecucao(parecer, deps);
      }
    }
  );
  assert.ok(motor >= 1);
  assert.equal(out.dados?.encaminhamento?.destino, "motor_execucao");
  assert.equal(out.dados?.motorAcionado, true);
  assert.equal(out.dados?.mreFallback, false);
  assert.equal(contemSugiroComoRespostaFinal(out.mensagem), false);
  assert.ok(
    out.dados?.motor?.publicado === true ||
      out.dados?.motor?.aguardandoGate === true
  );
});

test("E5-CA3: C4 listar jobs → fila, não Motor", async () => {
  const out = await executiveEngine.executar(FIX.C4);
  assert.equal(out.dados?.classificacao?.classe, "comando_operacional");
  assert.equal(out.dados?.encaminhamento?.destino, "capacidade_operacional");
  assert.equal(out.capacidade, "fila");
  assert.equal(out.dados?.motorAcionado, false);
  assert.equal(out.dados?.mreInvocado, false);
});

test("E5-CA4: falha do destino preserva classificação", async () => {
  const rota = classificarEEncaminhar(FIX.C4);
  const out = await executarPorDestino({
    texto: FIX.C4,
    historico: [],
    intencao: { id: "listar_jobs_fila", capacidade: "fila", confianca: 0.9 },
    classificacao: rota.classificacao,
    rota,
    obterCapacidade: () => ({
      id: "fila",
      async executar() {
        throw new Error("fila offline");
      }
    }),
    contextoCapacidade: (x) => x,
    naturalizar: (r) => r,
    deps: {}
  });
  assert.equal(out.ok, false);
  assert.match(out.mensagem, /fila offline|Falha na capacidade/i);
  // Núcleo anexa classificação; aqui validamos que destino C4 não virou MRE
  assert.equal(out.dados?.rota, "capacidade_operacional");
  assert.equal(out.dados?.mreInvocado, false);
  assert.equal(out.dados?.motorAcionado, false);
  assert.equal(out.dados?.destinoRespeitado, "capacidade_operacional");

  const viaNucleo = await executiveEngine.executar(FIX.C4);
  assert.ok(viaNucleo.dados?.classificacao?.classe);
});

test("E5-CA5: falha Motor C3 → erro tipado; sem fallback MRE", async () => {
  const out = await executiveEngine.executar(FIX.C3, {
    conduzirMotor: async () => {
      throw new Error("motor indisponível");
    }
  });
  assert.equal(out.ok, false);
  assert.equal(out.modo, "motor_execucao_falha");
  assert.equal(out.dados?.mreFallback, false);
  assert.equal(out.dados?.mreInvocado, false);
  assert.equal(out.dados?.motorAcionado, true);
  assert.equal(out.dados?.motorFalhou, true);
  assert.equal(out.dados?.classificacao?.classe, "trabalho_executivo");
  assert.match(out.mensagem, /Motor|C3/i);
  assert.doesNotMatch(out.mensagem, /^Sugiro\b/i);
});

test("E5: destino desconhecido → erro tipado (anti-fallback)", async () => {
  const out = await executarPorDestino({
    texto: "x",
    historico: [],
    intencao: { id: "x", capacidade: "ia" },
    classificacao: { classe: "conhecimento_geral", confianca: 0.9 },
    rota: { destino: "destino_inventado", ok: false },
    obterCapacidade: () => null,
    contextoCapacidade: (x) => x,
    deps: {}
  });
  assert.equal(out.ok, false);
  assert.equal(out.modo, "destino_desconhecido");
  assert.match(out.mensagem, /Sem fallback silencioso/);
});

test("E5 demo C1–C4", async () => {
  const c1 = await executiveEngine.executar(FIX.C1);
  const c2 = await executiveEngine.executar(FIX.C2, {
    publicarJob: async () => {
      throw new Error("não deve ser chamado em C2");
    }
  });
  const c3 = await executiveEngine.executar(FIX.C3);
  // Demo compara destinos isolados: limpar Gate da Continuidade entre C3 e C4.
  resetStoreContinuidadePadrao();
  const c4 = await executiveEngine.executar(FIX.C4);

  console.log("\n--- DEMO E5 ---");
  console.log("C1:", {
    texto: FIX.C1,
    classe: c1.dados?.classificacao?.classe,
    destino: c1.dados?.encaminhamento?.destino,
    modo: c1.modo,
    motor: c1.dados?.motorAcionado,
    mre: c1.dados?.mreInvocado,
    msg: String(c1.mensagem).slice(0, 100)
  });
  console.log("C2:", {
    texto: FIX.C2,
    classe: c2.dados?.classificacao?.classe,
    destino: c2.dados?.encaminhamento?.destino,
    modo: c2.modo,
    motor: c2.dados?.motorAcionado,
    publicarJobProibido: c2.dados?.publicarJobProibido,
    msg: String(c2.mensagem).slice(0, 100)
  });
  console.log("C3:", {
    texto: FIX.C3,
    classe: c3.dados?.classificacao?.classe,
    destino: c3.dados?.encaminhamento?.destino,
    modo: c3.modo,
    gate: c3.dados?.motor?.aguardandoGate,
    msg: String(c3.mensagem).slice(0, 120)
  });
  console.log("C4:", {
    texto: FIX.C4,
    classe: c4.dados?.classificacao?.classe,
    destino: c4.dados?.encaminhamento?.destino,
    capacidade: c4.capacidade,
    motor: c4.dados?.motorAcionado,
    msg: String(c4.mensagem).slice(0, 100)
  });
  console.log("--- fim DEMO E5 ---\n");

  assert.equal(c1.dados?.encaminhamento?.destino, "resposta_leve");
  assert.equal(c1.dados?.motorAcionado, false);
  assert.equal(c1.dados?.mreInvocado, false);

  assert.equal(c2.dados?.encaminhamento?.destino, "nucleo_mre");
  assert.equal(c2.dados?.motorAcionado, false);

  assert.equal(c3.dados?.encaminhamento?.destino, "motor_execucao");
  assert.equal(c3.dados?.motorAcionado, true);
  assert.equal(contemSugiroComoRespostaFinal(c3.mensagem), false);

  assert.equal(c4.dados?.encaminhamento?.destino, "capacidade_operacional");
  assert.equal(c4.capacidade, "fila");
  assert.equal(c4.dados?.motorAcionado, false);
});
