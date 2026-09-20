/**
 * F13 / F10-C6 — pedido literal «Responda somente: N» domina o turno no EE.
 */

import assert from "node:assert/strict";
import { test, beforeEach, afterEach } from "node:test";
import {
  detectarModoRespostaRestrita,
  extrairPayloadRespostaLiteral
} from "./pedidoRespostaRestrita.js";
import { tentarRespostaRestrita } from "./comporRespostaRestrita.js";
import { classificar, ehProibicaoExecucaoExplicita, ehIntencaoExecutivaE21, normalizarTexto } from "./regras.js";
import { executiveEngine } from "../executiveEngine/index.js";
import { abrirCoaParaTeste } from "../executiveEngine/garantirCoaCatalogoTeste.js";
import { limparCoaAtivo, definirCoaAtivo } from "../executiveEngine/coaSessao.js";
import { criarPublicadorFilaMemoria } from "../motorExecucao/ponteParecerJob.js";
import { resetStoreContinuidadePadrao } from "../continuidadeGate/integracaoConversa.js";
import { resetEstadoTopicosSessao } from "./topicosSessao.js";
import { resetEstadoObjectivoSessao } from "./objectivoSessao.js";
import { reiniciarAutoridadeDelegadaParaTestes } from "../autoridadeDelegada/autoridadeDelegada.js";
import { reiniciarEnvelopeSessaoParaTestes } from "./envelopeSessaoCoa.js";
import { gestorTopicos } from "./gestorTopicos.js";

const MSG_C6 = "Responda somente: 42";
const HIST_MARGEM = [
  {
    papel: "usuario",
    texto:
      "A margem caiu de 18% para 12%. Custos subiram. Outdoor Premium está em discussão."
  },
  {
    papel: "ceo",
    texto:
      "Vigilância sobre margem e outdoor. Recomendo monitorar custos e adiar Outdoor Premium."
  }
];

const MSG_F11 =
  "Com base apenas nos fatos registrados sobre a ValeVerde, compare os riscos " +
  "da queda de margem versus o aumento de custos e delibere a preocupação " +
  "executiva central. Não despache Jobs.";

const MSG_F12 =
  "Execute agora: criar um Job para corrigir os bugs críticos do sprint e despachar para a fila.";

let fetchPrev;
let llmCalls;

beforeEach(() => {
  resetStoreContinuidadePadrao();
  resetEstadoTopicosSessao();
  resetEstadoObjectivoSessao();
  reiniciarAutoridadeDelegadaParaTestes();
  reiniciarEnvelopeSessaoParaTestes();
  executiveEngine.reiniciarAcompanhamentoParaTestes();
  limparCoaAtivo();
  fetchPrev = globalThis.fetch;
  llmCalls = 0;
  globalThis.fetch = async (url) => {
    const u = String(url);
    if (u.includes("llm-status")) {
      return new Response(JSON.stringify({ ok: true, configurado: true }), {
        status: 200
      });
    }
    if (u.includes("deliberar")) {
      llmCalls += 1;
      return new Response(
        JSON.stringify({
          ok: true,
          texto:
            "Com base na vigilância de margem e outdoor, mantenho monitorização dos custos."
        }),
        { status: 200 }
      );
    }
    return new Response("{}", { status: 404 });
  };
});

afterEach(() => {
  globalThis.fetch = fetchPrev;
});

test("F13-C6: detector — Responda somente: 42 → literal", () => {
  assert.equal(extrairPayloadRespostaLiteral(normalizarTexto(MSG_C6)), "42");
  const d = detectarModoRespostaRestrita(MSG_C6);
  assert.equal(d.activo, true);
  assert.equal(d.modo, "literal");
  assert.equal(d.payload, "42");
  const t = tentarRespostaRestrita(MSG_C6, { historico: HIST_MARGEM });
  assert.equal(t.activo, true);
  assert.equal(String(t.mensagem).trim(), "42");
});

test("F13-C6: não captura «Responda somente com os fatos»", () => {
  const t = "Liste os fatos. Responda somente com os fatos.";
  assert.equal(extrairPayloadRespostaLiteral(normalizarTexto(t)), null);
  assert.notEqual(detectarModoRespostaRestrita(t).modo, "literal");
});

test("F13-C6: EE completo — Responda somente: 42 + hist margem → exactamente 42, sem MRE", async () => {
  const coa = abrirCoaParaTeste("coa-f13-c6", "F13 C6");
  definirCoaAtivo(coa);
  const fila = criarPublicadorFilaMemoria();
  const out = await executiveEngine.executar(
    { texto: MSG_C6, historico: HIST_MARGEM, coaId: coa.id },
    { publicarJob: fila.publicarJob.bind(fila) }
  );

  assert.equal(String(out.mensagem).trim(), "42");
  assert.equal(/\b42\b/.test(String(out.mensagem)), true);
  assert.equal(
    /margem|vigil[aâ]ncia|outdoor|monitor/i.test(String(out.mensagem)),
    false
  );
  assert.equal(fila.jobs.length, 0);
  assert.equal(llmCalls, 0, "pedido literal não deve invocar deliberação LLM");
  assert.notEqual(out.modo, "mre");
  assert.notEqual(out.dados?.encaminhamento?.destino, "nucleo_mre");
});

test("F13: pedido deliberativo não restritivo continua podendo ir a MRE/C2", async () => {
  const texto =
    "Delibere a preocupação executiva central sobre a margem sem inventar factos.";
  assert.equal(detectarModoRespostaRestrita(texto).activo, false);
  const s = classificar(texto, { frenteActiva: true });
  assert.notEqual(s.destino, "motor_execucao");

  const coa = abrirCoaParaTeste("coa-f13-delib", "F13 delib");
  definirCoaAtivo(coa);
  const fila = criarPublicadorFilaMemoria();
  const out = await executiveEngine.executar(
    { texto, historico: HIST_MARGEM, coaId: coa.id },
    { publicarJob: fila.publicarJob.bind(fila) }
  );
  assert.notEqual(String(out.mensagem).trim(), "42");
  assert.ok(
    out.modo === "mre" ||
      out.dados?.encaminhamento?.destino === "nucleo_mre" ||
      out.modo === "fallback" ||
      llmCalls > 0 ||
      /margem|lastro|analis|decis/i.test(String(out.mensagem))
  );
});

test("F13: F11 preservada — deliberar + Não despache → sem Job", async () => {
  const t = normalizarTexto(MSG_F11);
  assert.equal(ehProibicaoExecucaoExplicita(t), true);
  assert.equal(ehIntencaoExecutivaE21(t), false);
  const s = classificar(MSG_F11);
  assert.equal(s.permiteJob, false);
  const fila = criarPublicadorFilaMemoria();
  const out = await executiveEngine.executar(MSG_F11, {
    publicarJob: fila.publicarJob.bind(fila)
  });
  assert.equal(fila.jobs.length, 0);
  assert.notEqual(out.modo, "motor_execucao");
});

test("F13: F12 preservada — execução explícita ≠ clarificacao_topico", async () => {
  const r = gestorTopicos({
    mensagem: MSG_F12,
    topicoActivo: null,
    pausas: [],
    frenteActiva: true
  });
  assert.notEqual(r.evento, "ambiguo_topico");
  const s = classificar(MSG_F12);
  assert.equal(s.destino, "motor_execucao");

  const coa = abrirCoaParaTeste("coa-f13-f12", "F13 F12");
  definirCoaAtivo(coa);
  const fila = criarPublicadorFilaMemoria();
  const out = await executiveEngine.executar(
    { texto: MSG_F12, historico: [], coaId: coa.id },
    { publicarJob: fila.publicarJob.bind(fila) }
  );
  assert.notEqual(out.modo, "clarificacao_topico");
  assert.equal(out.modo, "motor_execucao");
  assert.ok(
    fila.jobs.length >= 1 || out.dados?.motor?.aguardandoGate === true
  );
});
