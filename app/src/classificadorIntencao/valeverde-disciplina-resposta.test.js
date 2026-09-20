/**
 * Bateria ValeVerde — disciplina executiva da resposta (registo/facto/confirmação/lacunas).
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  detectarModoRespostaRestrita,
  ehPedidoRespostaRestrita
} from "./pedidoRespostaRestrita.js";
import { tentarRespostaRestrita } from "./comporRespostaRestrita.js";
import { detectarPedidoInfoGathering } from "./pedidoInfoGathering.js";
import { aplicarPoliticaInfoGathering } from "./pedidoInfoGathering.js";
import { detectarPedidoAnaliseDeliberativa } from "../mre/politicaAnaliseDeliberativa.js";

const HIST_VALE = [
  {
    papel: "usuario",
    texto:
      "Assuma a empresa ValeVerde: 120 funcionários, faturamento R$48M, margem caiu de 8% para 4%."
  },
  {
    papel: "usuario",
    texto:
      "ValeVerde não atua em serviços. O setor correto é logística. Apenas confirme a correção."
  }
];

test("T01: registrar contexto + apenas confirmar → registo (não análise)", () => {
  const t =
    "Registrar o contexto ValeVerde e apenas confirmar.";
  const d = detectarModoRespostaRestrita(t);
  assert.equal(d.activo, true);
  assert.equal(d.modo, "registo");
  assert.equal(detectarPedidoAnaliseDeliberativa(t), false);
  const out = tentarRespostaRestrita(t, { historico: HIST_VALE });
  assert.equal(out.activo, true);
  assert.match(out.mensagem, /Contexto registado/i);
  assert.match(out.mensagem, /ValeVerde/i);
  assert.doesNotMatch(out.mensagem, /recomendo|urg[eê]ncia|aprovar|prioridade/i);
});

test("T03/T05: informar somente os fatos → factos sem interpretação", () => {
  const t = "Informar somente os fatos fornecidos sobre ValeVerde.";
  assert.equal(detectarModoRespostaRestrita(t).modo, "factos");
  const out = tentarRespostaRestrita(t, { historico: HIST_VALE });
  assert.match(out.mensagem, /Factos fornecidos/i);
  assert.match(out.mensagem, /120|48|margem|8%/i);
  assert.doesNotMatch(out.mensagem, /recomendo|devemos|urg[eê]ncia|aprovar/i);

  const t5 = "Informe os quatro fatos fornecidos inicialmente.";
  assert.equal(detectarModoRespostaRestrita(t5).modo, "factos");
});

test("T05 bateria: analisando apenas os fatos + preocupação → NÃO modo factos", () => {
  const t =
    "CEO, analisando apenas os fatos registrados sobre a ValeVerde Alimentos, qual é hoje a principal preocupação executiva da empresa e por quê?";
  const d = detectarModoRespostaRestrita(t);
  assert.notEqual(d.modo, "factos");
  assert.equal(d.activo, false);
  assert.equal(ehPedidoRespostaRestrita(t), false);
  // Não bloqueia o caminho deliberativo por resposta restrita / LFC listagem
});

test("T06: apenas confirmar correção → confirmação sem decisão", () => {
  const t =
    "ValeVerde não atua em serviços. O setor correto é logística. Apenas confirme a correção.";
  assert.equal(detectarModoRespostaRestrita(t).modo, "confirmacao");
  const out = tentarRespostaRestrita(t, { historico: HIST_VALE });
  assert.match(out.mensagem, /Correcção confirmada|Correção confirmada|confirmada/i);
  assert.match(out.mensagem, /log[ií]stica/i);
  assert.doesNotMatch(out.mensagem, /aprovar|recomendo|urg[eê]ncia|decis[aã]o/i);
});

test("T07: setor correto — apenas o fato", () => {
  const t =
    "Qual é o setor correto da ValeVerde? Responder apenas com o fato.";
  const d = detectarModoRespostaRestrita(t);
  assert.equal(d.modo, "dado_unico");
  assert.equal(d.chave, "setor");
  const out = tentarRespostaRestrita(t, { historico: HIST_VALE });
  assert.match(out.mensagem, /^Log[ií]stica\.?$/i);
  assert.doesNotMatch(out.mensagem, /recomendo|urg[eê]ncia|analis/i);
});

test("T04: nome da empresa → dado único", () => {
  const t = "Qual o nome da empresa fictícia?";
  assert.equal(detectarModoRespostaRestrita(t).modo, "dado_unico");
  const out = tentarRespostaRestrita(t, { historico: HIST_VALE });
  assert.match(out.mensagem, /ValeVerde/i);
});

test("T08: listar informações mínimas sem recomendar → lacunas + IG", () => {
  const t =
    "Listar informações mínimas necessárias antes de avaliar aumento de preço. Não recomendar nada.";
  assert.equal(detectarModoRespostaRestrita(t).modo, "lacunas");
  assert.equal(detectarPedidoInfoGathering(t), true);
  assert.equal(detectarPedidoAnaliseDeliberativa(t), false);
  const out = tentarRespostaRestrita(t, {});
  assert.match(out.mensagem, /Informações mínimas/i);
  assert.match(out.mensagem, /1\./);
  assert.doesNotMatch(out.mensagem, /\baprovo\b|\badiar\b|recomendo aumentar/i);
});

test("política IG: aprovar → solicitar_dados", () => {
  const out = aplicarPoliticaInfoGathering(
    {
      estado: "aprovar",
      recomendacao: "Aprovar aumento de preço agora.",
      justificativa: "Urgente"
    },
    { pedidoInfoGathering: true }
  );
  assert.equal(out.estado, "solicitar_dados");
  assert.doesNotMatch(out.recomendacao, /Aprovar aumento/i);
});

test("ehPedidoRespostaRestrita cobre bateria falhada", () => {
  assert.equal(
    ehPedidoRespostaRestrita(
      "Registrar o contexto ValeVerde e apenas confirmar."
    ),
    true
  );
  assert.equal(
    ehPedidoRespostaRestrita("O que acha da estratégia de preços?"),
    false
  );
});
