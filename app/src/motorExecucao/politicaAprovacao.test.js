/**
 * Testes Política de Aprovação — IMP-056 E2
 * (sem Orquestrador / Dispatcher / UI / Fila).
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { montarCiclo, validarTransicao } from "./dominio.js";
import {
  GATILHOS_V1,
  exigeAprovacao,
  gatilhosDisparados,
  avaliarPolitica,
  contextoCicloDaPolitica,
  podeCriarJob,
  montarPedidoGate,
  validarPedidoGate,
  aplicarDecisaoGate,
  avancarAposPlano,
  avancarAposGate
} from "./politicaAprovacao.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

test("E2-CA1: efeito externo / código / docs de produto ⇒ exigeAprovacao true", () => {
  assert.equal(GATILHOS_V1.length, 3);
  assert.deepEqual(
    GATILHOS_V1.map((g) => g.id),
    ["G1", "G2", "G3"]
  );

  assert.equal(
    exigeAprovacao({
      requerDespacho: true,
      efeitoExterno: true
    }),
    true
  );
  assert.equal(
    exigeAprovacao({
      requerDespacho: true,
      alteraCodigo: true
    }),
    true
  );
  assert.equal(
    exigeAprovacao({
      requerDespacho: true,
      alteraDocsProduto: true
    }),
    true
  );
  assert.deepEqual(
    gatilhosDisparados({
      requerDespacho: true,
      efeitoExterno: true,
      alteraCodigo: true
    }),
    ["G1", "G2"]
  );

  const a = avaliarPolitica({
    requerDespacho: true,
    alteraCodigo: true
  });
  assert.equal(a.exigeAprovacao, true);
  assert.equal(a.proximaEtapaAposPlano, "Aprovacao");
});

test("E2-CA2: comunicação-only / sem despacho ⇒ não exige aprovação de Job", () => {
  assert.equal(exigeAprovacao({}), false);
  assert.equal(exigeAprovacao({ requerDespacho: false }), false);
  assert.equal(
    exigeAprovacao({
      requerDespacho: false,
      efeitoExterno: true,
      alteraCodigo: true
    }),
    false
  );
  assert.deepEqual(gatilhosDisparados({ requerDespacho: false }), []);

  const a = avaliarPolitica({ requerDespacho: false });
  assert.equal(a.exigeAprovacao, false);
  assert.equal(a.proximaEtapaAposPlano, "Encerramento");
  assert.equal(podeCriarJob({ requerDespacho: false }), false);

  // Despacho sem G1–G3: V1 mínima não exige Gate
  assert.equal(exigeAprovacao({ requerDespacho: true }), false);
  assert.equal(
    avaliarPolitica({ requerDespacho: true }).proximaEtapaAposPlano,
    "CriacaoDoJob"
  );
});

test("E2-CA3: rejeitado ou adiado impede transição para Criação do Job", () => {
  const ctxPolitica = {
    requerDespacho: true,
    efeitoExterno: true
  };
  assert.equal(podeCriarJob(ctxPolitica, null), false);
  assert.equal(podeCriarJob(ctxPolitica, "rejeitado"), false);
  assert.equal(podeCriarJob(ctxPolitica, "adiado"), false);
  assert.equal(podeCriarJob(ctxPolitica, "aprovado"), true);

  const ctxRejeitado = contextoCicloDaPolitica(ctxPolitica, {
    decisaoAprovacao: "rejeitado"
  });
  assert.equal(
    validarTransicao("Aprovacao", "CriacaoDoJob", ctxRejeitado).ok,
    false
  );
  assert.equal(
    validarTransicao("Aprovacao", "Encerramento", ctxRejeitado).ok,
    true
  );

  const ctxAdiado = contextoCicloDaPolitica(ctxPolitica, {
    decisaoAprovacao: "adiado"
  });
  assert.equal(
    validarTransicao("Aprovacao", "CriacaoDoJob", ctxAdiado).ok,
    false
  );

  let ciclo = montarCiclo("c-e2", "Plano", { requerDespacho: true });
  const gate = avancarAposPlano(ciclo, ctxPolitica);
  assert.equal(gate.ok, true);
  assert.equal(gate.ciclo.etapa, "Aprovacao");

  const rejeitado = avancarAposGate(gate.ciclo, "rejeitado", ctxPolitica);
  assert.equal(rejeitado.ok, true);
  assert.equal(rejeitado.ciclo.etapa, "Encerramento");
  assert.equal(rejeitado.ciclo.jobId, undefined);

  const outra = avancarAposPlano(
    montarCiclo("c-e2b", "Plano", { requerDespacho: true }),
    ctxPolitica
  );
  const adiado = avancarAposGate(outra.ciclo, "adiado", ctxPolitica);
  assert.equal(adiado.ok, true);
  assert.equal(adiado.ciclo.etapa, "Aprovacao");
  assert.equal(adiado.permanecePendente, true);
  assert.equal(adiado.ciclo.jobId, undefined);

  assert.equal(
    validarTransicao("Aprovacao", "Encerramento", ctxAdiado).ok,
    false
  );

  const aprovado = avancarAposGate(gate.ciclo, "aprovado", ctxPolitica, {
    jobId: "JOB-E2-001"
  });
  assert.equal(aprovado.ok, true);
  assert.equal(aprovado.ciclo.etapa, "CriacaoDoJob");
  assert.equal(aprovado.ciclo.jobId, "JOB-E2-001");
  assert.equal(aprovado.ciclo.estadoJob, "pending");
});

test("E2-CA4: política sem efeitos laterais (não chama Fila)", () => {
  const src = readFileSync(join(__dirname, "politicaAprovacao.js"), "utf8");
  assert.equal(/from\s+["'].*queue/i.test(src), false);
  assert.equal(/from\s+["'].*fila/i.test(src), false);
  assert.equal(/@cursor\/sdk/.test(src), false);
  assert.equal(/node:fs|writeFile|fetch\(/.test(src), false);
  assert.equal(/document\.|window\./.test(src), false);
  assert.equal(/publicarJob|POST.*queue/i.test(src), false);

  // Chamadas puras não mutam o pedido
  const pedido = montarPedidoGate("Plano X", {
    requerDespacho: true,
    alteraDocsProduto: true
  });
  const antes = JSON.stringify(pedido);
  const r = aplicarDecisaoGate(pedido, "aprovado", { motivo: "ok" });
  assert.equal(r.ok, true);
  assert.equal(r.resultado.decisao, "aprovado");
  assert.equal(JSON.stringify(pedido), antes);
  assert.equal(validarPedidoGate({}).ok, false);
});

test("contrato Gate: pedido → decisão; integração Plano → política", () => {
  const pedido = montarPedidoGate(
    "Alterar docs do produto MG2",
    { requerDespacho: true, alteraDocsProduto: true },
    { resumoDespacho: "JOB docs", parecerId: "par-9" }
  );
  assert.equal(pedido.parecerId, "par-9");
  assert.equal(exigeAprovacao(pedido.contexto), true);

  const ciclo = montarCiclo("c-int", "Plano");
  const soComunica = avancarAposPlano(ciclo, { requerDespacho: false });
  assert.equal(soComunica.ok, true);
  assert.equal(soComunica.ciclo.etapa, "Encerramento");

  const despachoIsento = avancarAposPlano(
    montarCiclo("c-isento", "Plano"),
    { requerDespacho: true },
    { jobId: "JOB-E2-ISENTO" }
  );
  assert.equal(despachoIsento.ok, true);
  assert.equal(despachoIsento.ciclo.etapa, "CriacaoDoJob");
  assert.equal(despachoIsento.avaliacao.exigeAprovacao, false);
});
