/**
 * 2ª bateria real ValeVerde — frases exactas que falharam em produção.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { detectarModoRespostaRestrita } from "./pedidoRespostaRestrita.js";
import { tentarRespostaRestrita } from "./comporRespostaRestrita.js";
import { detectarPedidoAnaliseDeliberativa } from "../mre/politicaAnaliseDeliberativa.js";

const HIST_B2 = [
  {
    papel: "usuario",
    texto: "Registrar ValeVerde e apenas confirmar."
  },
  {
    papel: "ceo",
    texto:
      "Contexto registado: ValeVerde. Confirmação feita — sem análise nem recomendação neste turno."
  },
  {
    papel: "usuario",
    texto:
      "Assuma a empresa ValeVerde: 120 funcionários, faturamento R$48M, margem de 8% para 4%, matéria-prima +15%, preço +10%, desperdício ~5%."
  },
  {
    papel: "usuario",
    texto:
      "Ignore ValeVerde. Qual a diferença entre decisão e recomendação?"
  },
  {
    papel: "ceo",
    texto:
      "Decisão é fecho vinculativo; recomendação é juízo sem obrigatoriedade de execução."
  }
];

test("B2-T02: «Informar os fatos registrados sobre ValeVerde» → factos (não registo)", () => {
  const t = "Informar os fatos registrados sobre ValeVerde.";
  const d = detectarModoRespostaRestrita(t);
  assert.equal(d.activo, true, "deve activar resposta restrita");
  assert.equal(d.modo, "factos");
  assert.equal(detectarPedidoAnaliseDeliberativa(t), false);
  const out = tentarRespostaRestrita(t, { historico: HIST_B2 });
  assert.match(out.mensagem, /Factos|fatos/i);
  assert.match(out.mensagem, /120|48|margem|8%/i);
  assert.doesNotMatch(out.mensagem, /^Contexto registado/i);
  assert.doesNotMatch(out.mensagem, /recomendo|urg[eê]ncia|aprovar/i);
});

test("B2-T02b: variante «fatos registados» / «recuperar os fatos iniciais»", () => {
  assert.equal(
    detectarModoRespostaRestrita(
      "Informar os fatos registados sobre ValeVerde."
    ).modo,
    "factos"
  );
  assert.equal(
    detectarModoRespostaRestrita("Recuperar os fatos iniciais de ValeVerde.")
      .modo,
    "factos"
  );
  const out = tentarRespostaRestrita(
    "Recuperar os fatos iniciais de ValeVerde.",
    { historico: HIST_B2 }
  );
  assert.match(out.mensagem, /120|48|margem/i);
  assert.doesNotMatch(out.mensagem, /diferença entre decisão/i);
  assert.doesNotMatch(out.mensagem, /recomendo|urg[eê]ncia/i);
});

test("B2-T05: pergunta sim/não sobre facto na conversa actual", () => {
  const t =
    "Na conversa atual, foi informado que haveria aumento de 10%?";
  const d = detectarModoRespostaRestrita(t);
  assert.equal(d.modo, "sim_nao");
  const out = tentarRespostaRestrita(t, { historico: HIST_B2 });
  assert.match(out.mensagem, /^SIM\b/i);
  assert.doesNotMatch(out.mensagem, /lastro insuficiente|recomendo/i);

  const outNao = tentarRespostaRestrita(
    "Na conversa atual, foi informado que haveria aumento de 50%?",
    { historico: HIST_B2 }
  );
  assert.match(outNao.mensagem, /^N[AÃ]O\b/i);
});

test("B2-T06: «Apenas registrar a correção e confirmar» → confirmação", () => {
  const t =
    "ValeVerde não atua em serviços. O correto é logística. Apenas registrar a correção e confirmar.";
  const d = detectarModoRespostaRestrita(t);
  assert.equal(d.modo, "confirmacao");
  assert.equal(detectarPedidoAnaliseDeliberativa(t), false);
  const out = tentarRespostaRestrita(t, { historico: HIST_B2 });
  assert.match(out.mensagem, /confirmada|confirmado/i);
  assert.match(out.mensagem, /log[ií]stica/i);
  assert.doesNotMatch(
    out.mensagem,
    /aprovar|recomendo|urg[eê]ncia|aumento de 10%/i
  );
});

test("B2: «fatos registrados» NÃO é modo registo", () => {
  const d = detectarModoRespostaRestrita(
    "Informar os fatos registrados sobre ValeVerde."
  );
  assert.notEqual(d.modo, "registo");
});

test("B2-T01 regressão: Registrar ValeVerde e apenas confirmar → registo", () => {
  const t = "Registrar ValeVerde e apenas confirmar.";
  assert.equal(detectarModoRespostaRestrita(t).modo, "registo");
});
