/**
 * F11 / F10-C3 — deliberação explícita + «não despache» permanece em C2/MRE.
 * Não deve activar E2.1/C3 só porque «despache» aparece na proibição.
 */

import assert from "node:assert/strict";
import { test, beforeEach } from "node:test";
import {
  classificar,
  ehProibicaoExecucaoExplicita,
  ehIntencaoExecutivaE21,
  normalizarTexto
} from "./regras.js";
import { classificarEEncaminhar } from "./encaminhador.js";
import { executiveEngine } from "../executiveEngine/index.js";
import { criarPublicadorFilaMemoria } from "../motorExecucao/ponteParecerJob.js";
import { resetStoreContinuidadePadrao } from "../continuidadeGate/integracaoConversa.js";
import { resetEstadoTopicosSessao } from "./topicosSessao.js";
import { resetEstadoObjectivoSessao } from "./objectivoSessao.js";
import { reiniciarAutoridadeDelegadaParaTestes } from "../autoridadeDelegada/autoridadeDelegada.js";

beforeEach(() => {
  resetStoreContinuidadePadrao();
  resetEstadoTopicosSessao();
  resetEstadoObjectivoSessao();
  reiniciarAutoridadeDelegadaParaTestes();
  executiveEngine.reiniciarAcompanhamentoParaTestes();
});

const MSG_F10_C3 =
  "Com base apenas nos fatos registrados sobre a ValeVerde, compare os riscos " +
  "da queda de margem versus o aumento de custos e delibere a preocupação " +
  "executiva central. Não despache Jobs.";

test("F11-C3: deliberar + Não despache Jobs → proibição, sem E2.1, C2/MRE, 0 Jobs", async () => {
  const t = normalizarTexto(MSG_F10_C3);
  assert.equal(ehProibicaoExecucaoExplicita(t), true);
  assert.equal(ehIntencaoExecutivaE21(t), false);

  const s = classificar(MSG_F10_C3);
  assert.notEqual(s.classe, "trabalho_executivo");
  assert.equal(s.destino, "nucleo_mre");
  assert.equal(s.permiteJob, false);
  assert.match(s.razaoCurta || "", /proibi|an[aá]lise|deliber/i);

  const enc = classificarEEncaminhar(MSG_F10_C3);
  assert.equal(enc.destino, "nucleo_mre");

  const fila = criarPublicadorFilaMemoria();
  const out = await executiveEngine.executar(MSG_F10_C3, {
    publicarJob: fila.publicarJob.bind(fila)
  });
  assert.equal(fila.jobs.length, 0, "deliberar + não despachar não cria Job");
  assert.notEqual(out.modo, "motor_execucao");
  assert.notEqual(out.dados?.destino, "motor_execucao");
});

test("F11-C3: variantes de proibição de despacho", () => {
  const variantes = [
    "Delibere o próximo passo. Não despache Jobs.",
    "Compare os cenários e delibere. Não despachar Jobs.",
    "Avalie a situação. Sem despachar.",
    "Recomende a posição. Nunca despache Jobs neste turno."
  ];
  for (const texto of variantes) {
    const t = normalizarTexto(texto);
    assert.equal(
      ehProibicaoExecucaoExplicita(t),
      true,
      `proibição esperada: ${texto}`
    );
    assert.equal(ehIntencaoExecutivaE21(t), false, `E2.1 bloqueado: ${texto}`);
    const s = classificar(texto);
    assert.equal(s.permiteJob, false, `sem Job: ${texto}`);
    assert.notEqual(s.destino, "motor_execucao", `sem C3: ${texto}`);
  }
});

test("F11-C3: pedido explícito de execução legítimo continua C3", async () => {
  const texto =
    "Despache um Job para criar o ficheiro executive/queue/f11-exec.txt com OK.";
  assert.equal(ehProibicaoExecucaoExplicita(normalizarTexto(texto)), false);
  assert.equal(ehIntencaoExecutivaE21(normalizarTexto(texto)), true);
  const s = classificar(texto);
  assert.equal(s.classe, "trabalho_executivo");
  assert.equal(s.destino, "motor_execucao");
  assert.equal(s.permiteJob, true);

  const fila = criarPublicadorFilaMemoria();
  const out = await executiveEngine.executar(texto, {
    publicarJob: fila.publicarJob.bind(fila)
  });
  assert.ok(fila.jobs.length >= 1, "execução legítima deve criar Job");
  assert.ok(
    out.modo === "motor_execucao" || out.dados?.motor?.publicado === true
  );
});
