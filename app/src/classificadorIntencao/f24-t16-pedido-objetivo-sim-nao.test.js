/**
 * F24 / VAL-094 T16 — pedido novo e objectivo (sim/não) após contexto rico.
 * Resposta directa; sem Sugiro / risco / pergunta de continuidade.
 * Preserva F13 literal; não engole pedidos que pedem recomendação.
 */

import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";
import {
  detectarModoRespostaRestrita
} from "./pedidoRespostaRestrita.js";
import { tentarRespostaRestrita } from "./comporRespostaRestrita.js";
import { classificar } from "./regras.js";
import { executiveEngine } from "../executiveEngine/index.js";
import { abrirCoaParaTeste } from "../executiveEngine/garantirCoaCatalogoTeste.js";
import { limparCoaAtivo, definirCoaAtivo } from "../executiveEngine/coaSessao.js";
import { criarPublicadorFilaMemoria } from "../motorExecucao/ponteParecerJob.js";
import { resetStoreContinuidadePadrao } from "../continuidadeGate/integracaoConversa.js";
import { resetEstadoTopicosSessao } from "./topicosSessao.js";
import { resetEstadoObjectivoSessao } from "./objectivoSessao.js";
import { reiniciarAutoridadeDelegadaParaTestes } from "../autoridadeDelegada/autoridadeDelegada.js";
import { reiniciarEnvelopeSessaoParaTestes } from "./envelopeSessaoCoa.js";

const MSG_T16 =
  "Mantendo o LFC Beta que já listámos, agora preciso de outra coisa: confirme só se o orçamento exclusivo é R$ 8.888.000 — sim ou não.";

const MSG_T16_CURTO = "Orçamento = 8.888.000? sim/não";

const HIST_RICO = [
  {
    papel: "usuario",
    texto:
      "A margem caiu de 18% para 12%. Outdoor Premium em discussão. Avalie riscos e recomende."
  },
  {
    papel: "ceo",
    texto:
      "Sugiro monitorar a margem. Antecipo risco no outdoor. Quer que tratemos do plano agora?"
  },
  {
    papel: "usuario",
    texto: "Liste os factos activos do LFC deste caso."
  },
  {
    papel: "ceo",
    texto:
      "Factos activos:\n1. Orçamento exclusivo: R$ 8.888.000\n2. Fornecedor Alpha\n3. Código secreto BETA-1"
  }
];

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
  llmCalls = 0;
  fetchPrev = globalThis.fetch;
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
            "Sugiro sim. Antecipo risco na margem. Quer que avancemos com Outdoor Premium?"
        }),
        { status: 200 }
      );
    }
    return new Response("{}", { status: 404 });
  };
});

afterEach(() => {
  globalThis.fetch = fetchPrev;
  limparCoaAtivo();
});

test("F24-T16 detector: sim/não e confirme só → modo sim_nao", () => {
  assert.equal(detectarModoRespostaRestrita(MSG_T16).modo, "sim_nao");
  assert.equal(detectarModoRespostaRestrita(MSG_T16_CURTO).modo, "sim_nao");
  assert.equal(
    detectarModoRespostaRestrita("O código secreto é BETA-1? sim ou não").modo,
    "sim_nao"
  );
});

test("F24-T16 composição: SIM directo sem recomendação", () => {
  const out = tentarRespostaRestrita(MSG_T16, { historico: HIST_RICO });
  assert.equal(out.activo, true);
  assert.equal(out.modo, "sim_nao");
  assert.match(String(out.mensagem), /^SIM\.?$/i);
  assert.doesNotMatch(
    String(out.mensagem),
    /Sugiro|Antecipo|Quer que|risco|Plano|recomendo/i
  );

  const curto = tentarRespostaRestrita(MSG_T16_CURTO, { historico: HIST_RICO });
  assert.match(String(curto.mensagem), /^SIM\.?$/i);
});

test("F24-T16: pergunta sim/não simples sem valor no histórico → NÃO", () => {
  const out = tentarRespostaRestrita("Orçamento = 9.999.999? sim/não", {
    historico: HIST_RICO
  });
  assert.match(String(out.mensagem), /^N[AÃ]O\.?$/i);
});

test("F24: pedido que solicita recomendação NÃO activa sim_nao restrito", () => {
  const t = "Você recomenda aumentar o preço em 10%? sim ou não";
  assert.equal(detectarModoRespostaRestrita(t).activo, false);
  const s = classificar(t);
  assert.ok(
    s.destino === "nucleo_mre" || s.classe === "conversa_projeto",
    `destino=${s.destino} classe=${s.classe}`
  );
});

test("F24: literal «Responda somente: 42» intacto (F13)", () => {
  const d = detectarModoRespostaRestrita("Responda somente: 42");
  assert.equal(d.modo, "literal");
  assert.equal(d.payload, "42");
  const out = tentarRespostaRestrita("Responda somente: 42", {
    historico: HIST_RICO
  });
  assert.equal(out.mensagem, "42");
});

test("F24-T16 EE: contexto rico → resposta directa; LLM não invocado", async () => {
  const coa = abrirCoaParaTeste("coa-f24-t16", "Isolamento Beta F24");
  definirCoaAtivo(coa);
  const fila = criarPublicadorFilaMemoria();

  const out = await executiveEngine.executar(
    { texto: MSG_T16, historico: HIST_RICO, coaId: coa.id },
    { publicarJob: fila.publicarJob.bind(fila) }
  );

  const msg = String(out.mensagem || "");
  assert.match(msg, /^SIM\.?$/i);
  assert.doesNotMatch(
    msg,
    /Sugiro|Antecipo|Quer que|Plano executivo|risco|Outdoor|margem/i
  );
  assert.equal(llmCalls, 0, "não deve deliberar no MRE");
  assert.ok(
    out.modo === "porta_canonica" ||
      out.dados?.rota === "resposta_restrita" ||
      out.dados?.modoRespostaRestrita === "sim_nao" ||
      out.modo === "resposta_restrita",
    `modo/rota inesperados: modo=${out.modo} rota=${out.dados?.rota}`
  );
  assert.equal(fila.jobs.length, 0);
});

test("F24-T16 EE curto: Orçamento = X? sim/não com histórico rico", async () => {
  const coa = abrirCoaParaTeste("coa-f24-t16b", "Isolamento Beta F24b");
  definirCoaAtivo(coa);
  const fila = criarPublicadorFilaMemoria();

  const out = await executiveEngine.executar(
    { texto: MSG_T16_CURTO, historico: HIST_RICO, coaId: coa.id },
    { publicarJob: fila.publicarJob.bind(fila) }
  );

  assert.match(String(out.mensagem || ""), /^SIM\.?$/i);
  assert.equal(llmCalls, 0);
  assert.doesNotMatch(
    String(out.mensagem || ""),
    /Sugiro|Antecipo|Quer que/i
  );
});
