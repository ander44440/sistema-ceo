/**
 * F21 / VAL-094 T18 — decisão + execução explícita no mesmo turno.
 * Regista a decisão e encaminha a ordem para C3/Gate (sem engolir na PC).
 */

import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";
import {
  detectarDeclaracaoDecisaoUtilizador,
  tentarRespostaDeclaracaoDecisao,
  temOrdemExecucaoNoTurno
} from "./declaracaoDecisaoUtilizador.js";
import { normalizarTexto } from "./lexicon.js";
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

const MSG_T18 =
  "Minha decisão é proteger a margem via preço. Execute agora: crie um Job para implementar isso.";

const MSG_T18_ABRA =
  "Decisão: manter o fornecedor SulVerde. Agora execute: abra um Job só para documentar essa decisão no repositório.";

const MSG_NAO_EXEC =
  "Decisão minha: proteger a margem via preço. Não execute.";

const MSG_SO_DECISAO = "Decisão: adiar o outdoor e priorizar o pagamento.";

const MSG_SO_EXEC =
  "Execute agora: criar um Job para corrigir os bugs críticos do sprint e despachar para a fila.";

let fetchPrev;

beforeEach(() => {
  resetStoreContinuidadePadrao();
  resetEstadoTopicosSessao();
  resetEstadoObjectivoSessao();
  reiniciarAutoridadeDelegadaParaTestes();
  reiniciarEnvelopeSessaoParaTestes();
  executiveEngine.reiniciarAcompanhamentoParaTestes();
  limparCoaAtivo();
  fetchPrev = globalThis.fetch;
  globalThis.fetch = async (url) => {
    const u = String(url);
    if (u.includes("llm-status")) {
      return new Response(JSON.stringify({ ok: true, configurado: true }), {
        status: 200
      });
    }
    if (u.includes("deliberar")) {
      return new Response(
        JSON.stringify({ ok: true, texto: "Sugiro Aguardar." }),
        { status: 200 }
      );
    }
    return new Response("{}", { status: 404 });
  };
});

afterEach(() => {
  globalThis.fetch = fetchPrev;
});

test("F21 detectors: decisão+execução vs não-execute vs só decisão/só execução", () => {
  const d18 = detectarDeclaracaoDecisaoUtilizador(MSG_T18);
  assert.equal(d18.activo, true);
  assert.equal(d18.comOrdemExecucao, true);
  assert.match(String(d18.enunciado), /proteger.*margem.*pre[cç]o/i);
  assert.equal(/execute|job/i.test(String(d18.enunciado)), false);
  assert.equal(tentarRespostaDeclaracaoDecisao(MSG_T18).activo, false);
  assert.equal(temOrdemExecucaoNoTurno(normalizarTexto(MSG_T18)), true);

  const dAbra = detectarDeclaracaoDecisaoUtilizador(MSG_T18_ABRA);
  assert.equal(dAbra.activo, true);
  assert.equal(dAbra.comOrdemExecucao, true);
  assert.match(String(dAbra.enunciado), /SulVerde/i);
  assert.equal(tentarRespostaDeclaracaoDecisao(MSG_T18_ABRA).activo, false);

  const dNao = detectarDeclaracaoDecisaoUtilizador(MSG_NAO_EXEC);
  assert.equal(dNao.activo, true);
  assert.equal(dNao.comOrdemExecucao, false);
  assert.equal(tentarRespostaDeclaracaoDecisao(MSG_NAO_EXEC).activo, true);

  const dSo = detectarDeclaracaoDecisaoUtilizador(MSG_SO_DECISAO);
  assert.equal(dSo.activo, true);
  assert.equal(dSo.comOrdemExecucao, false);
  assert.equal(tentarRespostaDeclaracaoDecisao(MSG_SO_DECISAO).activo, true);

  const dExec = detectarDeclaracaoDecisaoUtilizador(MSG_SO_EXEC);
  assert.equal(dExec.activo, false);
  assert.equal(classificar(MSG_SO_EXEC).destino, "motor_execucao");
});

test("F21-T18 EE: decisão+execução → C3/Gate; decisão no texto; Job após Aprovado", async () => {
  const coa = abrirCoaParaTeste("coa-f21-t18", "F21 T18");
  definirCoaAtivo(coa);
  const fila = criarPublicadorFilaMemoria();

  const out = await executiveEngine.executar(
    { texto: MSG_T18, historico: [], coaId: coa.id },
    { publicarJob: fila.publicarJob.bind(fila) }
  );

  assert.equal(out.modo, "motor_execucao");
  assert.equal(out.dados?.encaminhamento?.destino, "motor_execucao");
  assert.notEqual(out.modo, "porta_canonica");
  assert.match(String(out.mensagem), /Decisão registada/i);
  assert.match(String(out.mensagem), /proteger|margem|pre[cç]o/i);
  assert.equal(/Sem execução automática neste turno/i.test(String(out.mensagem)), false);

  assert.ok(
    fila.jobs.length >= 1 ||
      out.dados?.motor?.aguardandoGate === true ||
      out.dados?.motor?.motivo === "aguardando_gate",
    "deve chegar ao motor C3 (Job ou Gate)"
  );

  if (fila.jobs.length === 0 && out.dados?.motor?.aguardandoGate) {
    const out2 = await executiveEngine.executar(
      { texto: "Aprovado", historico: [], coaId: coa.id },
      { publicarJob: fila.publicarJob.bind(fila) }
    );
    assert.ok(
      fila.jobs.length >= 1,
      `após Aprovado deve publicar Job (modo=${out2.modo}, jobs=${fila.jobs.length})`
    );
  }
});

test("F21: decisão + Não execute → sem Job (PC)", async () => {
  const coa = abrirCoaParaTeste("coa-f21-nao", "F21 nao");
  definirCoaAtivo(coa);
  const fila = criarPublicadorFilaMemoria();
  const out = await executiveEngine.executar(
    { texto: MSG_NAO_EXEC, historico: [], coaId: coa.id },
    { publicarJob: fila.publicarJob.bind(fila) }
  );
  assert.equal(out.modo, "porta_canonica");
  assert.match(String(out.mensagem), /Decisão registada/i);
  assert.match(String(out.mensagem), /Sem execução automática/i);
  assert.equal(fila.jobs.length, 0);
});

test("F21: execução explícita sem declaração → C3", async () => {
  const coa = abrirCoaParaTeste("coa-f21-exec", "F21 exec");
  definirCoaAtivo(coa);
  const fila = criarPublicadorFilaMemoria();
  const out = await executiveEngine.executar(
    { texto: MSG_SO_EXEC, historico: [], coaId: coa.id },
    { publicarJob: fila.publicarJob.bind(fila) }
  );
  assert.equal(out.modo, "motor_execucao");
  assert.equal(/Decisão registada/i.test(String(out.mensagem)), false);
  assert.ok(
    fila.jobs.length >= 1 || out.dados?.motor?.aguardandoGate === true
  );
});

test("F21: decisão sem execução → PC, 0 Jobs", async () => {
  const coa = abrirCoaParaTeste("coa-f21-dec", "F21 dec");
  definirCoaAtivo(coa);
  const fila = criarPublicadorFilaMemoria();
  const out = await executiveEngine.executar(
    { texto: MSG_SO_DECISAO, historico: [], coaId: coa.id },
    { publicarJob: fila.publicarJob.bind(fila) }
  );
  assert.equal(out.modo, "porta_canonica");
  assert.match(String(out.mensagem), /Decisão registada/i);
  assert.match(String(out.mensagem), /Sem execução automática/i);
  assert.equal(fila.jobs.length, 0);
});
