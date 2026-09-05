/**
 * P4 final — estágio 4 + speaker sem «Recomendação:» sob AUTOANÁLISE.
 */

import assert from "node:assert/strict";
import { test, afterEach } from "node:test";
import {
  detectarPedidoAnaliseDeliberativa,
  obterAutoanaliseActiva
} from "./politicaAnaliseDeliberativa.js";
import { gerarComunicadoExecutivo } from "./speaker/speakerExecutivo.js";
import { parecerValidoCompleto } from "./parecer/fixtures.js";
import { estagio4Analise } from "./pipeline/estagios.js";

afterEach(() => {
  detectarPedidoAnaliseDeliberativa("");
});

test("P4 final: estagio4Analise injecta hint AUTOANÁLISE no schemaHint", async () => {
  detectarPedidoAnaliseDeliberativa(
    "Analise criticamente sua resposta anterior."
  );
  assert.equal(obterAutoanaliseActiva(), true);
  let visto = "";
  await estagio4Analise(
    { lacunas: [] },
    {
      chamarLlm: async (pedido) => {
        visto = String(pedido.schemaHint || "");
        return { analise: "Acertei X; errei Y." };
      }
    }
  );
  assert.match(visto, /AUTOANÁLISE/i);
  assert.match(visto, /OBJETO ÚNICO E OBRIGATÓRIO/i);
  assert.match(visto, /contexto\.ultimaRespostaCeo/);
  assert.doesNotMatch(visto, /bloco 'CEO:/i);
  assert.doesNotMatch(visto, /fio recente/i);
  assert.match(visto, /o que acertou/i);
  assert.match(visto, /onde errou/i);
  assert.match(visto, /contexto\.diagnostico\.objetivoReal/);
  assert.match(visto, /contexto\.diagnostico\.problemaNegocio/);
  assert.match(visto, /SOMENTE contexto de referência/i);
  assert.match(visto, /É PROIBIDO no campo 'analise'/i);
  assert.match(visto, /Recomendação:/i);
  assert.match(visto, /Decisão:/i);
  assert.match(visto, /crítica de contexto\.ultimaRespostaCeo/i);
});

test("P4 final: estagio4Analise sem AUTO não altera schemaHint base", async () => {
  detectarPedidoAnaliseDeliberativa("Analise a proposta do bairro e recomenda.");
  assert.equal(obterAutoanaliseActiva(), false);
  let visto = "";
  await estagio4Analise(
    { lacunas: [] },
    {
      chamarLlm: async (pedido) => {
        visto = String(pedido.schemaHint || "");
        return { analise: "Análise normal." };
      }
    }
  );
  assert.equal(visto, "{ analise: string }");
});

test("P4 final: speaker sem Recomendação sob AUTOANÁLISE", () => {
  detectarPedidoAnaliseDeliberativa("onde você errou na resposta anterior?");
  assert.equal(obterAutoanaliseActiva(), true);
  const p = parecerValidoCompleto();
  p.analise =
    "Acertei o diagnóstico de risco; errei ao omitir a lacuna; poderia ser mais concreto.";
  p.decisaoExecutiva.recomendacao = "Aprovar a Opção A";
  const r = gerarComunicadoExecutivo(p, "chat", { pedidoAnalise: true });
  assert.equal(r.ok, true);
  assert.match(r.comunicado.texto, /Acertei|errei/i);
  assert.doesNotMatch(r.comunicado.texto, /Recomendação:/i);
  assert.doesNotMatch(r.comunicado.texto, /Aprovar a Opção A/i);
});

test("P4 final: speaker P1-2 normal mantém Recomendação", () => {
  detectarPedidoAnaliseDeliberativa("Analise a proposta do bairro e recomenda.");
  assert.equal(obterAutoanaliseActiva(), false);
  const p = parecerValidoCompleto();
  p.analise = "Alinhamento parcial.";
  p.decisaoExecutiva.recomendacao = "Modificar o âmbito";
  const r = gerarComunicadoExecutivo(p, "chat", { pedidoAnalise: true });
  assert.equal(r.ok, true);
  assert.match(r.comunicado.texto, /Recomendação:/i);
  assert.match(r.comunicado.texto, /Modificar o âmbito/i);
});
