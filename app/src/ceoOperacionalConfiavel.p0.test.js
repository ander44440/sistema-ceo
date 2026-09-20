/**
 * CEO Operacional Confiável — regressões P0 (contexto na mensagem, saudação,
 * autodiagnóstico ≠ execução, factos do turno no MRE).
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  ehSaudacaoPura,
  mapearCapacidadePorTexto,
  normalizarTexto
} from "./executiveEngine/classificar.js";
import {
  ehIntencaoExecutivaE21,
  ehPedidoAutodiagnosticoOuAutoavaliacaoCeo
} from "./classificadorIntencao/regras.js";
import { ehRecomendacaoOperacional } from "./classificadorIntencao/recomendacaoOperacional.js";
import {
  devePreservarRespostaNucleo,
  ehPedidoAnaliseConversa
} from "./conversacaoNatural/prioridadeIntencao.js";
import { classificarTipoTurno, TIPO_TURNO } from "./conversacaoNatural/tiposTurno.js";
import { montarEntradaMre } from "./mre/integracaoNucleo.js";
import {
  factosMateriaisDoTurno,
  PREFIXO_FACTO_UTILIZADOR
} from "./mre/factosTurnoUtilizador.js";
import { detectarPedidoExplicitoConsulta } from "./consultaRegistados/pedidoExplicito.js";

const MSG_VALEVERDE =
  "Bom dia. Assuma a empresa ValeVerde: 120 funcionários, faturamento R$48M, " +
  "margem caiu de 8% para 4%, matéria-prima +15%, preço +10%, desperdício ~5%. " +
  "Faça uma primeira leitura das prioridades. Não execute.";

const MSG_VALEVERDE_PRIORIDADE =
  "Temos dois fornecedores: um atual +12% e outro 8% mais barato com 60% do volume. " +
  "Qual deve ser nossa prioridade agora?";

test("P0: saudação pura ≠ «Bom dia» + análise ValeVerde", () => {
  assert.equal(ehSaudacaoPura(normalizarTexto("bom dia")), true);
  assert.equal(ehSaudacaoPura(normalizarTexto("oi")), true);
  assert.equal(ehSaudacaoPura(normalizarTexto(MSG_VALEVERDE)), false);
  assert.notEqual(mapearCapacidadePorTexto(MSG_VALEVERDE).id, "saudacao");
});

test("P0: ValeVerde / prioridade de negócio não é E4 operacional", () => {
  assert.equal(ehRecomendacaoOperacional(normalizarTexto(MSG_VALEVERDE)), false);
  assert.equal(
    ehRecomendacaoOperacional(normalizarTexto(MSG_VALEVERDE_PRIORIDADE)),
    false
  );
  assert.notEqual(
    mapearCapacidadePorTexto(MSG_VALEVERDE_PRIORIDADE).id,
    "recomendar_operacional"
  );
});

test("P0: factos da mensagem entram no lastro MRE (≠ só Acervo)", () => {
  const factos = factosMateriaisDoTurno(MSG_VALEVERDE, []);
  assert.ok(factos.length >= 1);
  assert.ok(factos.every((f) => f.startsWith(PREFIXO_FACTO_UTILIZADOR)));
  assert.ok(factos.some((f) => /vale\s*verde|48|margem|8%/i.test(f)));

  const entrada = montarEntradaMre({
    instrucao: MSG_VALEVERDE,
    coaAtivo: { id: "prj-valeverde-teste", nome: "ValeVerde" },
    memoria: () => ({ pendencias: [] }),
    historico: []
  });
  assert.ok(
    (entrada.factosOficiais || []).some((f) =>
      String(f).includes(PREFIXO_FACTO_UTILIZADOR)
    )
  );
  assert.match(entrada.mensagem, /LASTRO DO TURNO/i);
  assert.match(entrada.mensagem, /NÃO diga/i);
});

test("P0: autodiagnóstico nunca é E2.1 / Job", () => {
  const t = normalizarTexto(
    "Faça um autodiagnóstico do seu estado atual e liste limitações."
  );
  assert.equal(ehPedidoAutodiagnosticoOuAutoavaliacaoCeo(t), true);
  assert.equal(ehIntencaoExecutivaE21(t), false);
});

test("P0: análise preserva núcleo e não vira ABERTURA", () => {
  assert.equal(ehPedidoAnaliseConversa(MSG_VALEVERDE), true);
  assert.equal(
    devePreservarRespostaNucleo({
      instrucao: MSG_VALEVERDE,
      intencaoId: "deliberar_objetivo",
      modo: "llm"
    }),
    true
  );
  assert.equal(
    classificarTipoTurno({
      instrucao: MSG_VALEVERDE,
      intencaoId: "saudacao",
      forcarAbertura: true,
      modo: "llm"
    }),
    TIPO_TURNO.SISTEMA
  );
});

test("P0: «o que já foi informado» activa consulta registados (discussão)", () => {
  const r = detectarPedidoExplicitoConsulta(
    "Faça uma leitura do que já foi informado até aqui nesta conversa."
  );
  assert.equal(r.ehPedido, true);
  assert.ok(r.ramo === "discussao" || r.ramo === "ambos");
});
