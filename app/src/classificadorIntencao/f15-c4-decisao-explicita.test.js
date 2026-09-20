/**
 * F15 / F14-C4 — decisão explícita do utilizador preservada (sem MRE genérico, sem Job).
 */

import assert from "node:assert/strict";
import { test, beforeEach, afterEach } from "node:test";
import {
  detectarDeclaracaoDecisaoUtilizador,
  tentarRespostaDeclaracaoDecisao
} from "./declaracaoDecisaoUtilizador.js";
import { detectarPedidoDecisaoExplicita } from "./pedidoDecisaoExplicita.js";
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
import { detectarModoRespostaRestrita } from "./pedidoRespostaRestrita.js";

const MSG_C4 =
  "Decisão explícita: adiar o outdoor e priorizar o pagamento este mês. Registe apenas esta decisão.";

const MSG_F11 =
  "Com base apenas nos fatos registrados sobre a ValeVerde, compare os riscos " +
  "da queda de margem versus o aumento de custos e delibere a preocupação " +
  "executiva central. Não despache Jobs.";

const MSG_F12 =
  "Execute agora: criar um Job para corrigir os bugs críticos do sprint e despachar para a fila.";

const MSG_F13 = "Responda somente: 42";

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
            "Acompanho sem fechar decisão: vigilância de margem. Manter vigilância sem despacho."
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

test("F15-C4: detector — Declaração ≠ PD (pedir decisão ao CEO)", () => {
  const d = detectarDeclaracaoDecisaoUtilizador(MSG_C4);
  assert.equal(d.activo, true);
  assert.match(d.enunciado, /adiar.*outdoor/i);
  assert.match(d.enunciado, /pagamento/i);
  assert.equal(detectarPedidoDecisaoExplicita(MSG_C4), false);

  const r = tentarRespostaDeclaracaoDecisao(MSG_C4);
  assert.equal(r.activo, true);
  assert.match(r.mensagem, /Decisão registada/i);
  assert.match(r.mensagem, /adiar.*outdoor/i);
  assert.match(r.mensagem, /pagamento/i);
  assert.match(r.mensagem, /Sem execução automática/i);
});

test("F15-C4: EE — decisão explícita preservada, sem MRE genérico, 0 Jobs", async () => {
  const coa = abrirCoaParaTeste("coa-f15-c4", "F15 C4");
  definirCoaAtivo(coa);
  const fila = criarPublicadorFilaMemoria();
  const out = await executiveEngine.executar(
    { texto: MSG_C4, historico: [], coaId: coa.id },
    { publicarJob: fila.publicarJob.bind(fila) }
  );

  const msg = String(out.mensagem);
  assert.match(msg, /Decisão registada/i);
  assert.match(msg, /adiar/i);
  assert.match(msg, /outdoor/i);
  assert.match(msg, /pagamento/i);
  assert.equal(/vigil[aâ]ncia de margem|Acompanho sem fechar/i.test(msg), false);
  assert.equal(fila.jobs.length, 0);
  assert.equal(llmCalls, 0, "declaração não deve deliberar no MRE");
  assert.notEqual(out.modo, "mre");
  assert.notEqual(out.dados?.encaminhamento?.destino, "nucleo_mre");
  assert.notEqual(out.modo, "motor_execucao");
});

test("F15: deliberativo continua em MRE", async () => {
  const texto =
    "Delibere a preocupação executiva central sobre a margem sem inventar factos.";
  assert.equal(detectarDeclaracaoDecisaoUtilizador(texto).activo, false);
  const coa = abrirCoaParaTeste("coa-f15-delib", "F15 delib");
  definirCoaAtivo(coa);
  const fila = criarPublicadorFilaMemoria();
  const out = await executiveEngine.executar(
    { texto, historico: [], coaId: coa.id },
    { publicarJob: fila.publicarJob.bind(fila) }
  );
  assert.equal(fila.jobs.length, 0);
  assert.ok(
    out.modo === "mre" ||
      out.dados?.encaminhamento?.destino === "nucleo_mre" ||
      llmCalls > 0 ||
      /margem|lastro|analis/i.test(String(out.mensagem))
  );
});

test("F15: execução explícita continua C3", async () => {
  assert.equal(detectarDeclaracaoDecisaoUtilizador(MSG_F12).activo, false);
  const s = classificar(MSG_F12);
  assert.equal(s.destino, "motor_execucao");
  const coa = abrirCoaParaTeste("coa-f15-exec", "F15 exec");
  definirCoaAtivo(coa);
  const fila = criarPublicadorFilaMemoria();
  const out = await executiveEngine.executar(
    { texto: MSG_F12, historico: [], coaId: coa.id },
    { publicarJob: fila.publicarJob.bind(fila) }
  );
  assert.equal(out.modo, "motor_execucao");
  assert.ok(fila.jobs.length >= 1 || out.dados?.motor?.aguardandoGate === true);
});

test("F15: F11/F12/F13 intactos (amostra)", () => {
  assert.equal(ehProibicaoExecucaoExplicita(normalizarTexto(MSG_F11)), true);
  assert.equal(ehIntencaoExecutivaE21(normalizarTexto(MSG_F11)), false);
  assert.notEqual(
    gestorTopicos({
      mensagem: MSG_F12,
      topicoActivo: null,
      pausas: []
    }).evento,
    "ambiguo_topico"
  );
  assert.equal(detectarModoRespostaRestrita(MSG_F13).modo, "literal");
  assert.equal(detectarDeclaracaoDecisaoUtilizador(MSG_F13).activo, false);
});
