/**
 * F20 / VAL-094 T04 — declaração natural de decisão do utilizador.
 * «Decisão minha» / «Minha decisão é» preservadas sem MRE nem Job.
 */

import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";
import {
  detectarDeclaracaoDecisaoUtilizador,
  tentarRespostaDeclaracaoDecisao
} from "./declaracaoDecisaoUtilizador.js";
import { detectarPedidoDecisaoExplicita } from "./pedidoDecisaoExplicita.js";
import { executiveEngine } from "../executiveEngine/index.js";
import { abrirCoaParaTeste } from "../executiveEngine/garantirCoaCatalogoTeste.js";
import { limparCoaAtivo, definirCoaAtivo } from "../executiveEngine/coaSessao.js";
import { criarPublicadorFilaMemoria } from "../motorExecucao/ponteParecerJob.js";
import { resetStoreContinuidadePadrao } from "../continuidadeGate/integracaoConversa.js";
import { resetEstadoTopicosSessao } from "./topicosSessao.js";
import { resetEstadoObjectivoSessao } from "./objectivoSessao.js";
import { reiniciarAutoridadeDelegadaParaTestes } from "../autoridadeDelegada/autoridadeDelegada.js";
import { reiniciarEnvelopeSessaoParaTestes } from "./envelopeSessaoCoa.js";

const MSG_T04 =
  "Decisão minha: proteger a margem via preço. Não execute.";

const MSG_MINHA_E =
  "Minha decisão é: proteger a margem via preço.";

const MSG_DECISAO = "Decisão: adiar o outdoor e priorizar o pagamento.";

const MSG_EXPLICITA =
  "Decisão explícita: adiar o outdoor e priorizar o pagamento este mês. Registe apenas esta decisão.";

const MSG_CEO_DECIDIR = "Você deve decidir entre outdoor e pagamento.";

const MSG_DECIDA = "Decida se devemos aumentar o preço.";

/** T18 — decisão + execução no mesmo turno: comportamento actual preservado (não alterar). */
const MSG_T18 =
  "Decisão: manter o fornecedor SulVerde. Agora execute: abra um Job só para documentar essa decisão no repositório.";

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
            "Aguardar a coleta de dados. Sugiro Aguardar. Considerando riscos."
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

test("F20-T04: detector — Decisão minha / Minha decisão / Decisão / Decisão explícita", () => {
  const casos = [
    [MSG_T04, /proteger.*margem.*pre[cç]o/i],
    [MSG_MINHA_E, /proteger.*margem.*pre[cç]o/i],
    [MSG_DECISAO, /adiar.*outdoor/i],
    [MSG_EXPLICITA, /adiar.*outdoor/i],
    [
      "Decisão minha, registada: vamos proteger a margem via ajuste de preço. Não execute ainda.",
      /proteger.*margem/i
    ]
  ];
  for (const [texto, re] of casos) {
    const d = detectarDeclaracaoDecisaoUtilizador(texto);
    assert.equal(d.activo, true, `deve declarar: ${texto}`);
    assert.match(String(d.enunciado), re, texto);
    assert.equal(detectarPedidoDecisaoExplicita(texto), false, texto);
  }
});

test("F20: pedido ao CEO decidir ≠ declaração do utilizador", () => {
  for (const texto of [MSG_CEO_DECIDIR, MSG_DECIDA]) {
    assert.equal(
      detectarDeclaracaoDecisaoUtilizador(texto).activo,
      false,
      texto
    );
    assert.equal(detectarPedidoDecisaoExplicita(texto), true, texto);
  }
});

test("F20-T04 EE: Decisão minha preservada, sem MRE, 0 Jobs", async () => {
  const coa = abrirCoaParaTeste("coa-f20-t04", "F20 T04");
  definirCoaAtivo(coa);
  const fila = criarPublicadorFilaMemoria();
  const out = await executiveEngine.executar(
    { texto: MSG_T04, historico: [], coaId: coa.id },
    { publicarJob: fila.publicarJob.bind(fila) }
  );

  const msg = String(out.mensagem);
  assert.match(msg, /Decisão registada/i);
  assert.match(msg, /proteger/i);
  assert.match(msg, /margem/i);
  assert.match(msg, /pre[cç]o/i);
  assert.match(msg, /Sem execução automática/i);
  assert.equal(/Aguardar|Sugiro Aguardar|vigil[aâ]ncia/i.test(msg), false);
  assert.equal(fila.jobs.length, 0);
  assert.equal(llmCalls, 0);
  assert.notEqual(out.modo, "mre");
  assert.notEqual(out.dados?.encaminhamento?.destino, "nucleo_mre");
  assert.notEqual(out.modo, "motor_execucao");
});

test("F20: Minha decisão é — EE sem Job", async () => {
  const coa = abrirCoaParaTeste("coa-f20-minha", "F20 minha");
  definirCoaAtivo(coa);
  const fila = criarPublicadorFilaMemoria();
  const out = await executiveEngine.executar(
    { texto: MSG_MINHA_E, historico: [], coaId: coa.id },
    { publicarJob: fila.publicarJob.bind(fila) }
  );
  assert.match(String(out.mensagem), /Decisão registada/i);
  assert.match(String(out.mensagem), /proteger/i);
  assert.equal(fila.jobs.length, 0);
  assert.equal(llmCalls, 0);
});

test("F20: T18 decisão+execução — F21: PC não engole; C3 trata execução", () => {
  // F21: declaração + ordem explícita → detector activo com comOrdemExecucao;
  // tentarResposta não fecha o turno na Porta Canónica.
  const d = detectarDeclaracaoDecisaoUtilizador(MSG_T18);
  assert.equal(d.activo, true);
  assert.equal(d.comOrdemExecucao, true);
  assert.match(String(d.enunciado), /SulVerde/i);
  const r = tentarRespostaDeclaracaoDecisao(MSG_T18);
  assert.equal(r.activo, false);
  assert.equal(r.comOrdemExecucao, true);
});
