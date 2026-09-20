/**
 * 3ª bateria real — frases exactas do HFC (painel 127.0.0.1:5173).
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { detectarModoRespostaRestrita } from "./pedidoRespostaRestrita.js";
import { tentarRespostaRestrita } from "./comporRespostaRestrita.js";
import { detectarPedidoAnaliseDeliberativa } from "../mre/politicaAnaliseDeliberativa.js";

const T01 = `CEO, vamos iniciar um caso de trabalho chamado ValeVerde.

A ValeVerde é uma empresa fictícia.

Fatos iniciais:

* Atua no mercado de serviços.
* Possui clientes recorrentes.
* No último mês, perdeu dois clientes importantes.
* Ainda não sabemos por que esses clientes saíram.

Por enquanto, apenas registre este contexto como ponto de partida do caso ValeVerde.

Não faça análise.
Não proponha soluções.
Não faça recomendações.

Apenas confirme que o contexto foi registrado e aguarde.`;

const HIST_POLUIDO = [
  {
    papel: "usuario",
    texto:
      "CEO, responda apenas SIM ou NÃO:\n\nNa conversa atual da ValeVerde, eu informei que quero aumentar em 10% o preço de algum produto ou serviço?\n\nNão explique."
  },
  {
    papel: "usuario",
    texto:
      "CEO, corrija uma informação do caso ValeVerde.\n\nA informação anterior dizia que a ValeVerde atua no mercado de serviços.\n\nA informação correta é:\nA ValeVerde atua no mercado de logística.\n\nApenas registre a correção e confirme.\nNão faça análise nem recomendação."
  },
  { papel: "usuario", texto: T01 }
];

test("B3-T01: registo com «Fatos iniciais» → modo registo (NÃO listagem)", () => {
  const d = detectarModoRespostaRestrita(T01);
  assert.equal(d.modo, "registo", "não pode cair em factos por causa do rótulo");
  assert.equal(detectarPedidoAnaliseDeliberativa(T01), false);
  const out = tentarRespostaRestrita(T01, { historico: HIST_POLUIDO });
  assert.match(out.mensagem, /Contexto registado/i);
  assert.match(out.mensagem, /ValeVerde/i);
  assert.doesNotMatch(out.mensagem, /Factos fornecidos/i);
  assert.doesNotMatch(out.mensagem, /SIM ou NÃO|aumentar em 10%/i);
  assert.doesNotMatch(out.mensagem, /recomendo|urg[eê]ncia|aprovar/i);
});

test("B3-T02: recuperar factos → bullets do último arranque (sem lixo antigo)", () => {
  const t =
    "CEO, sem analisar:\n\nQuais são os fatos que foram registrados sobre a ValeVerde até agora?\n\nResponda somente com os fatos informados. Não acrescente interpretações, hipóteses ou recomendações.";
  assert.equal(detectarModoRespostaRestrita(t).modo, "factos");
  const out = tentarRespostaRestrita(t, { historico: HIST_POLUIDO });
  assert.match(out.mensagem, /Factos fornecidos/i);
  assert.match(out.mensagem, /servi[cç]os|clientes recorrentes|dois clientes/i);
  assert.doesNotMatch(out.mensagem, /SIM ou NÃO|quero aumentar em 10%/i);
  assert.doesNotMatch(out.mensagem, /recomendo|hip[oó]tese|urg[eê]ncia/i);
});

test("B3-T05: SIM/NÃO — aumento 10% NÃO foi afirmado nesta bateria", () => {
  const t =
    "CEO, responda apenas SIM ou NÃO:\n\nNa conversa atual da ValeVerde, eu informei que quero aumentar em 10% o preço de algum produto ou serviço?\n\nNão explique.";
  assert.equal(detectarModoRespostaRestrita(t).modo, "sim_nao");
  const out = tentarRespostaRestrita(t, { historico: HIST_POLUIDO });
  assert.match(out.mensagem, /^N[AÃ]O\b/i);
});

test("B3-T06: correção logística → confirmação curta", () => {
  const t =
    "CEO, corrija uma informação do caso ValeVerde.\n\nA informação anterior dizia que a ValeVerde atua no mercado de serviços.\n\nA informação correta é:\nA ValeVerde atua no mercado de logística.\n\nApenas registre a correção e confirme.\nNão faça análise nem recomendação.";
  assert.equal(detectarModoRespostaRestrita(t).modo, "confirmacao");
  const out = tentarRespostaRestrita(t, { historico: HIST_POLUIDO });
  assert.match(out.mensagem, /confirmada|confirmado/i);
  assert.match(out.mensagem, /log[ií]stica/i);
  assert.doesNotMatch(out.mensagem, /aprovar|recomendo|urg[eê]ncia/i);
});

test("B2 regressão: Informar os fatos registrados → factos", () => {
  assert.equal(
    detectarModoRespostaRestrita(
      "Informar os fatos registrados sobre ValeVerde."
    ).modo,
    "factos"
  );
});

test("B2 regressão: Registrar ValeVerde e apenas confirmar → registo", () => {
  assert.equal(
    detectarModoRespostaRestrita("Registrar ValeVerde e apenas confirmar.").modo,
    "registo"
  );
});
