/**
 * Testes integração Continuidade ↔ Conversa — IMP-058 E4
 * (Motor real in-memory; sem Agent / UI / @cursor/sdk).
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test, beforeEach } from "node:test";
import { executiveEngine } from "../executiveEngine/index.js";
import { criarPublicadorFilaMemoria } from "../motorExecucao/ponteParecerJob.js";
import { criarStoreContextoGate } from "./contexto.js";
import {
  resetStoreContinuidadePadrao,
  decidirInterceptacaoContinuidade,
  mensagemAguardandoGateContinuidade
} from "./integracaoConversa.js";
import { resetEstadoTopicosSessao } from "../classificadorIntencao/topicosSessao.js";
import { resetEstadoObjectivoSessao } from "../classificadorIntencao/objectivoSessao.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootSrc = join(__dirname, "..");

beforeEach(() => {
  resetStoreContinuidadePadrao();
  resetEstadoTopicosSessao();
  resetEstadoObjectivoSessao();
});

test("E4-CA1: Gate pendente + «Aprovado.» → Continuidade; sem «Sugiro…»", async () => {
  const store = criarStoreContextoGate();
  const fila = criarPublicadorFilaMemoria();
  const registro = new Map();

  const r1 = await executiveEngine.executar("Resolva os bugs.", {
    storeContinuidade: store,
    publicarJob: fila.publicarJob.bind(fila),
    registro
  });

  assert.equal(r1.dados?.motor?.aguardandoGate, true);
  assert.equal(store.temGatePendente(), true);
  assert.equal(r1.dados?.classificadorSaltado, undefined);
  assert.match(r1.mensagem, /Aguardando aprovação \(Gate/i);
  assert.equal(/\bSugiro\b/i.test(r1.mensagem), false);

  const r2 = await executiveEngine.executar("Aprovado.", {
    storeContinuidade: store,
    publicarJob: fila.publicarJob.bind(fila),
    registro
  });

  assert.equal(r2.dados?.continuidade, true);
  assert.equal(r2.dados?.classificadorSaltado, true);
  assert.equal(r2.dados?.decisao, "aprovado");
  assert.equal(/\bSugiro\b/i.test(r2.mensagem), false);
  assert.equal(r2.dados?.classificacao, null);
  assert.ok(r2.dados?.job?.id, "Job criado após aprovação");
  assert.equal(fila.jobs.length, 1);
  assert.equal(store.temGatePendente(), false);
});

test("E4 demo: Resolva os bugs → Gate G2 → Aprovado → Job + Dispatcher", async () => {
  const store = criarStoreContextoGate();
  const fila = criarPublicadorFilaMemoria();
  const registro = new Map();

  const gate = await executiveEngine.executar("Resolva os bugs.", {
    storeContinuidade: store,
    publicarJob: fila.publicarJob.bind(fila),
    registro
  });

  console.log("\n--- DEMO IMP-058 E4 ---");
  console.log('Usuário: "Resolva os bugs."');
  console.log(`CEO: "${gate.mensagem}"`);

  assert.equal(gate.dados?.motor?.aguardandoGate, true);
  assert.ok(
    (gate.dados?.motor?.avaliacao?.gatilhos || []).includes("G2"),
    "política G2 (alteraCodigo/bugs)"
  );
  assert.equal(
    gate.mensagem,
    mensagemAguardandoGateContinuidade(
      gate.dados.motor,
      null,
      gate.dados.parecer
    )
  );
  assert.match(gate.mensagem, /Aguardando aprovação \(Gate G2\)/i);
  assert.match(gate.mensagem, /Aprovado|Cancela|Adiar/i);

  const ctx = store.obterContextoActivo();
  assert.ok(ctx?.parecerSnapshot, "contexto com parecer sem repetir C3");
  assert.match(String(ctx.solicitacaoResumo), /bugs/i);

  const aprov = await executiveEngine.executar("Aprovado.", {
    storeContinuidade: store,
    publicarJob: fila.publicarJob.bind(fila),
    registro
  });

  console.log('Usuário: "Aprovado."');
  console.log(`CEO: "${aprov.mensagem}"`);
  console.log(`Job: ${aprov.dados?.job?.id}`);
  console.log(`Handoff: ${aprov.dados?.handoff?.para || "—"}`);
  console.log(`Repetiu solicitação? ${/\bResolva os bugs\b/i.test(aprov.mensagem) && aprov.dados?.decisao !== "aprovado" ? "SIM (falha)" : "NÃO"}`);
  console.log("--- fim demo ---\n");

  assert.equal(aprov.dados?.decisao, "aprovado");
  assert.ok(aprov.dados?.job?.id);
  assert.equal(aprov.dados?.job?.estado || fila.jobs[0]?.estado, "pending");
  assert.equal(aprov.dados?.motor?.fluxoIniciado, true);
  assert.equal(aprov.dados?.handoff?.para, "dispatcher_req053");
  assert.equal(aprov.dados?.classificadorSaltado, true);
  assert.equal(fila.jobs.length, 1);
  // Não pediu de novo a tarefa como classificação C3
  assert.equal(aprov.modo, "continuidade_gate");
});

test("E4-CA2: sem Gate pendente → Classificador IMP-057 inalterado", async () => {
  const store = criarStoreContextoGate();
  assert.equal(decidirInterceptacaoContinuidade("Bom dia", store), "classificador");

  const out = await executiveEngine.executar("Bom dia", {
    storeContinuidade: store
  });
  assert.equal(out.dados?.classificacao?.classe, "conhecimento_geral");
  assert.equal(out.dados?.encaminhamento?.destino, "resposta_leve");
  assert.equal(out.dados?.continuidade, undefined);
  assert.equal(out.dados?.classificadorSaltado, undefined);
});

test("E4-CA3: Gate pendente + pedido novo → processa (P0; sem lock conversacional)", async () => {
  const store = criarStoreContextoGate();
  const fila = criarPublicadorFilaMemoria();

  await executiveEngine.executar("Resolva os bugs.", {
    storeContinuidade: store,
    publicarJob: fila.publicarJob.bind(fila)
  });
  assert.equal(store.temGatePendente(), true);

  assert.equal(
    decidirInterceptacaoContinuidade("Implemente o outdoor agora", store),
    "classificador"
  );

  const out = await executiveEngine.executar("Implemente o outdoor agora", {
    storeContinuidade: store,
    publicarJob: fila.publicarJob.bind(fila)
  });

  // P0: não trava em clarificação de Gate; processa a nova instrução
  assert.notEqual(out.modo, "continuidade_gate_clarificacao");
  assert.notEqual(out.dados?.clarificacaoGate, true);
  assert.equal(out.dados?.classificadorSaltado, undefined);
  // Sem decisão V1 → Gate original permanece; não auto-aprova o Gate G2
  assert.notEqual(out.dados?.decisao, "aprovado");
  assert.equal(store.temGatePendente(), true);
  assert.equal(
    /Aguardando aprovação \(Gate/i.test(out.mensagem) &&
      /Responda Aprovado/i.test(out.mensagem) &&
      out.modo === "continuidade_gate_clarificacao",
    false
  );
});

test("E4-CA4: integração sem @cursor/sdk", () => {
  for (const rel of [
    "continuidadeGate/integracaoConversa.js",
    "continuidadeGate/contexto.js",
    "continuidadeGate/reconhecerDecisao.js",
    "executiveEngine/index.js"
  ]) {
    const src = readFileSync(join(rootSrc, rel), "utf8");
    assert.equal(/@cursor\/sdk/.test(src), false, rel);
  }
});

test("E4-CA5: abertura de contexto quando Motor exige Gate", async () => {
  const store = criarStoreContextoGate();
  const fila = criarPublicadorFilaMemoria();

  assert.equal(store.temGatePendente(), false);
  const r = await executiveEngine.executar("Resolva os bugs do projeto.", {
    storeContinuidade: store,
    publicarJob: fila.publicarJob.bind(fila)
  });

  assert.equal(r.dados?.motor?.aguardandoGate, true);
  assert.equal(r.dados?.continuidadeGateRegistado, true);
  assert.equal(store.temGatePendente(), true);
  assert.ok(store.obterContextoActivo()?.parecerSnapshot?.id);
  assert.ok(r.dados?.motor?.continuidadeGate?.registado);
});

test("E4: Classificador e Motor não foram alterados (ficheiros canónicos)", () => {
  // Guardrail: IMP-057 / IMP-056 núcleo sem imports de continuidadeGate
  for (const rel of [
    "classificadorIntencao/dominio.js",
    "classificadorIntencao/regras.js",
    "classificadorIntencao/encaminhador.js",
    "classificadorIntencao/integracaoNucleo.js",
    "classificadorIntencao/destinos.js",
    "motorExecucao/dominio.js",
    "motorExecucao/politicaAprovacao.js",
    "motorExecucao/ponteParecerJob.js",
    "motorExecucao/integracaoOrquestrador.js"
  ]) {
    const src = readFileSync(join(rootSrc, rel), "utf8");
    assert.equal(
      /continuidadeGate/.test(src),
      false,
      `${rel} não deve importar continuidadeGate`
    );
  }
});
