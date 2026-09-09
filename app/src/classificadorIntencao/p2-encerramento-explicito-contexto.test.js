/**
 * P2 — Encerramento explícito de contexto (tópico/objectivos).
 * Não cobre «novo contexto» / «mudando de assunto».
 */

import assert from "node:assert/strict";
import { test, beforeEach } from "node:test";
import {
  criarTopico,
  ehEncerramentoExplicitoContexto
} from "./gestorTopicos.js";
import {
  definirEstadoTopicosSessao,
  obterEstadoTopicosSessao,
  resetEstadoTopicosSessao
} from "./topicosSessao.js";
import { criarObjectivo } from "./gestorObjectivo.js";
import {
  definirEstadoObjectivoSessao,
  obterEstadoObjectivoSessao,
  resetEstadoObjectivoSessao
} from "./objectivoSessao.js";
import { executiveEngine } from "../executiveEngine/index.js";
import { resetStoreContinuidadePadrao } from "../continuidadeGate/integracaoConversa.js";
import { obterProjetoAtivoId } from "../catalogoProjetos/index.js";
import {
  activarEnvelopeParaChave,
  persistirEnvelopeActual
} from "./envelopeSessaoCoa.js";

const ISO = "2026-01-01T12:00:00.000Z";

beforeEach(() => {
  resetStoreContinuidadePadrao();
  resetEstadoTopicosSessao();
  resetEstadoObjectivoSessao();
});

function semearContextoOutdoor() {
  // Alinha chave do envelope ao COA activo para o sync do EE não sobrescrever o seed.
  activarEnvelopeParaChave(obterProjetoAtivoId());
  const top = criarTopico("outdoor", "usuario", ISO);
  const pausa = criarTopico("pagamento", "usuario", ISO);
  definirEstadoTopicosSessao({ topicoActivo: top, pausas: [pausa] });
  const obj = criarObjectivo("priorizar outdoor", "usuario", ISO);
  const ant = criarObjectivo("decidir pagamento", "usuario", ISO);
  definirEstadoObjectivoSessao({
    objetivoActivo: obj,
    objetivoAnterior: ant
  });
  persistirEnvelopeActual();
}

test("A: encerre completamente o tópico anterior → limpa tópico, pausas e objectivos", async () => {
  semearContextoOutdoor();
  assert.equal(
    ehEncerramentoExplicitoContexto("encerre completamente o tópico anterior"),
    true
  );
  await executiveEngine.executar(
    { texto: "encerre completamente o tópico anterior" },
    {}
  );
  const top = obterEstadoTopicosSessao();
  const obj = obterEstadoObjectivoSessao();
  assert.equal(top.topicoActivo, null);
  assert.equal(top.pausas.length, 0);
  assert.equal(obj.objetivoActivo, null);
  assert.equal(obj.objetivoAnterior, null);
});

test("B: novo contexto independente → NÃO dispara resets", async () => {
  semearContextoOutdoor();
  assert.equal(
    ehEncerramentoExplicitoContexto("novo contexto independente"),
    false
  );
  await executiveEngine.executar(
    { texto: "a próxima situação é um novo contexto independente" },
    {}
  );
  assert.equal(obterEstadoTopicosSessao().topicoActivo?.ancora, "outdoor");
  assert.ok(obterEstadoObjectivoSessao().objetivoActivo);
  assert.ok(obterEstadoObjectivoSessao().objetivoAnterior);
});

test("C: mudando de assunto → NÃO dispara resets", async () => {
  semearContextoOutdoor();
  assert.equal(ehEncerramentoExplicitoContexto("mudando de assunto"), false);
  await executiveEngine.executar(
    { texto: "Mudando de assunto, quero falar de receita de bolo" },
    {}
  );
  assert.equal(obterEstadoTopicosSessao().topicoActivo?.ancora, "outdoor");
  assert.ok(obterEstadoObjectivoSessao().objetivoActivo);
  assert.ok(obterEstadoObjectivoSessao().objetivoAnterior);
});
