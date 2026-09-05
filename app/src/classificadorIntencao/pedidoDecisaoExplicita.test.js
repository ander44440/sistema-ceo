/**
 * Ampliação estreita — fecho interrogativo em pedidoDecisaoExplicita (classe T3).
 * + menu explícito de alternativas decisórias (aceitar/não aceitar/negociar/adiar).
 * + «qual decisão/posição … recomenda|sugere» (T1 simulação — antes de soAnaliseSemFecho).
 * + imperativo «posição (executiva|clara)» / «termine com posição clara».
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  detectarPedidoDecisaoExplicita,
  temMenuAlternativasDecisorias
} from "./pedidoDecisaoExplicita.js";
import { normalizarTexto } from "./lexicon.js";
import { detectarPedidoAnaliseDeliberativa } from "../mre/politicaAnaliseDeliberativa.js";
import { ehActoExplicitoDeFecho } from "../autoridadeDelegada/autoridadeDelegada.js";

test("fecho interrogativo — positivos (classe T3)", () => {
  assert.equal(detectarPedidoDecisaoExplicita("Qual decisão devemos tomar?"), true);
  assert.equal(detectarPedidoDecisaoExplicita("Que decisão devemos tomar?"), true);
  assert.equal(
    detectarPedidoDecisaoExplicita(
      "Qual decisão devemos tomar enquanto existem Jobs em correção?"
    ),
    true
  );
  assert.equal(detectarPedidoDecisaoExplicita("Que decisão tomar?"), true);
  assert.equal(
    detectarPedidoDecisaoExplicita("Qual caminho devemos escolher?"),
    true
  );
  assert.equal(
    detectarPedidoDecisaoExplicita("Que alternativa devemos escolher?"),
    true
  );
});

test("fecho interrogativo — negativos (exploração / E4 / análise / estado)", () => {
  assert.equal(detectarPedidoDecisaoExplicita("O que achas da decisão?"), false);
  assert.equal(
    detectarPedidoDecisaoExplicita("Qual deveria ser a prioridade?"),
    false
  );
  assert.equal(
    detectarPedidoDecisaoExplicita(
      "Analise a proposta do bairro e dê uma recomendação executiva."
    ),
    false
  );
  assert.equal(
    detectarPedidoDecisaoExplicita("Qual é o estado dos Jobs em correção?"),
    false
  );
});

test("fecho interrogativo — regressão positivos clássicos", () => {
  assert.equal(detectarPedidoDecisaoExplicita("Decida entre A e B."), true);
  assert.equal(detectarPedidoDecisaoExplicita("Decide A, B ou C."), true);
  assert.equal(detectarPedidoDecisaoExplicita("Tome a decisão agora."), true);
  assert.equal(
    detectarPedidoDecisaoExplicita("Escolha entre outdoor e pagamento."),
    true
  );
  assert.equal(
    detectarPedidoDecisaoExplicita("Feche a decisão com o critério de risco."),
    true
  );
  assert.equal(detectarPedidoDecisaoExplicita("Quero a sua decisão."), true);
  assert.equal(detectarPedidoDecisaoExplicita("Preciso da sua decisão."), true);
  assert.equal(
    detectarPedidoDecisaoExplicita("Devemos decidir agora?"),
    true
  );
});

test("T1 — qual decisão/posição recomenda|sugere → pedidoDecisao (antes de soAnaliseSemFecho)", () => {
  assert.equal(
    detectarPedidoDecisaoExplicita(
      "Diga qual decisão você recomenda neste momento e por quê"
    ),
    true
  );
  assert.equal(detectarPedidoDecisaoExplicita("qual decisão você recomenda"), true);
  assert.equal(detectarPedidoDecisaoExplicita("qual posição você recomenda"), true);
  assert.equal(
    detectarPedidoDecisaoExplicita("qual decisão você sugeriria"),
    true
  );
  assert.equal(
    detectarPedidoDecisaoExplicita("Que decisão o CEO recomenda?"),
    true
  );
  assert.equal(
    detectarPedidoDecisaoExplicita(
      "Um cliente representa 12% do faturamento. Há atrasos nas entregas, pressão por desconto e margem apertada. Diga qual decisão você recomenda neste momento e por quê."
    ),
    true
  );
});

test("T1 — P1-2 legítimo permanece sem pedidoDecisao", () => {
  const p12 =
    "Analise a proposta do bairro e dê uma recomendação executiva.";
  assert.equal(detectarPedidoDecisaoExplicita(p12), false);
  assert.equal(detectarPedidoAnaliseDeliberativa(p12), true);
});

const MENU_T2 =
  "Recebemos uma nova proposta comercial com possível aumento de vendas, " +
  "mas prazo de pagamento de 60 dias. A empresa tem períodos de fluxo de caixa apertado. " +
  "Termine com uma posição clara, podendo: aceitar; não aceitar; negociar condição diferente; " +
  "adiar até obter informações essenciais.";

const MENU_COM_AVALIA =
  "Avalie a proposta comercial: aumento de vendas vs prazo 60 dias. " +
  "Recomende uma posição clara: aceitar, não aceitar, negociar ou adiar.";

test("menu alternativas decisórias — positivos (fecho)", () => {
  assert.equal(
    temMenuAlternativasDecisorias(normalizarTexto(MENU_T2)),
    true
  );
  assert.equal(detectarPedidoDecisaoExplicita(MENU_T2), true);
  assert.equal(detectarPedidoDecisaoExplicita(MENU_COM_AVALIA), true);
  assert.equal(
    detectarPedidoDecisaoExplicita(
      "Posição clara entre: aceitar; recusar; negociar; adiar."
    ),
    true
  );
});

test("menu alternativas decisórias — negativos (P1-2 / menção parcial)", () => {
  assert.equal(
    detectarPedidoDecisaoExplicita(
      "Analise a proposta do bairro e dê uma recomendação executiva."
    ),
    false
  );
  assert.equal(
    detectarPedidoDecisaoExplicita(
      "Avalie a proposta e diga se aprovaria, modificaria ou não priorizaria."
    ),
    false
  );
  assert.equal(
    detectarPedidoDecisaoExplicita("Devemos aceitar o contrato?"),
    false
  );
  assert.equal(
    detectarPedidoDecisaoExplicita("Aceitar ou adiar a proposta?"),
    false
  );
  assert.equal(
    temMenuAlternativasDecisorias(normalizarTexto("aceitar ou negociar")),
    false
  );
});

const MSG_ROTASUL = `Não quero que você execute nenhuma ação externa, crie Jobs ou altere qualquer coisa.

Quero apenas uma análise executiva da situação da RotaSul que já está sendo discutida.

Considere os fatos já apresentados sobre:
- atrasos concentrados nas sextas-feiras;
- cliente responsável por aproximadamente 12% do faturamento;
- insatisfação desse cliente;
- ausência de orçamento para aumentar a frota.

Reavalie esse cenário e apresente uma posição executiva clara, explicando o motivo da sua posição.

Não execute nada. Apenas delibere e responda.`;

test("posição executiva imperativa — positivos (antes de soAnaliseSemFecho)", () => {
  assert.equal(
    detectarPedidoDecisaoExplicita("apresente uma posição executiva clara"),
    true
  );
  assert.equal(
    detectarPedidoDecisaoExplicita("dê uma posição executiva"),
    true
  );
  assert.equal(
    detectarPedidoDecisaoExplicita("emita uma posição clara"),
    true
  );
  assert.equal(
    detectarPedidoDecisaoExplicita("declare uma posição executiva"),
    true
  );
  assert.equal(
    detectarPedidoDecisaoExplicita("Termine com uma posição clara."),
    true
  );
});

test("termine apresentando posição — positivos", () => {
  assert.equal(
    detectarPedidoDecisaoExplicita(
      "termine apresentando uma posição executiva clara"
    ),
    true
  );
  assert.equal(
    detectarPedidoDecisaoExplicita("termine apresentando uma posição clara"),
    true
  );
  assert.equal(
    detectarPedidoDecisaoExplicita(
      "termine apresentando uma posição executiva"
    ),
    true
  );
});

test("posição executiva — caso RotaSul → pedidoDecisao; precedência desliga P1-2", () => {
  const pedidoDecisao = detectarPedidoDecisaoExplicita(MSG_ROTASUL);
  assert.equal(pedidoDecisao, true);
  // Opção A (orquestrador): pedidoAnalise = !pedidoDecisao && detectar…
  const pedidoAnalise =
    !pedidoDecisao && detectarPedidoAnaliseDeliberativa(MSG_ROTASUL);
  assert.equal(pedidoAnalise, false);
});

test("posição executiva — caso real termine apresentando → PD; precedência desliga P1-2", () => {
  const msg =
    "Quero apenas uma análise executiva, mas termine apresentando uma posição executiva clara sobre o que deve ser priorizado neste momento.";
  const pedidoDecisao = detectarPedidoDecisaoExplicita(msg);
  assert.equal(pedidoDecisao, true);
  const pedidoAnalise =
    !pedidoDecisao && detectarPedidoAnaliseDeliberativa(msg);
  assert.equal(pedidoAnalise, false);
});

test("posição executiva — negativos (análise pura / deliberar / sem fecho)", () => {
  assert.equal(
    detectarPedidoDecisaoExplicita(
      "Analise a proposta do bairro e dê uma recomendação executiva."
    ),
    false
  );
  assert.equal(
    detectarPedidoDecisaoExplicita(
      "Analise a proposta e termine apresentando uma recomendação executiva"
    ),
    false
  );
  assert.equal(
    detectarPedidoDecisaoExplicita("termine apresentando uma posição"),
    false
  );
  assert.equal(
    detectarPedidoDecisaoExplicita("dê uma recomendação"),
    false
  );
  assert.equal(
    detectarPedidoDecisaoExplicita("Apenas delibere e responda"),
    false
  );
  assert.equal(
    detectarPedidoDecisaoExplicita("delibere e responda"),
    false
  );
  assert.equal(
    detectarPedidoDecisaoExplicita(
      "Quero apenas uma análise executiva. Reavalie esse cenário."
    ),
    false
  );
});

test("posição executiva — AD intacta (assuma decisão/comando ≠ PD por este ajuste)", () => {
  assert.equal(detectarPedidoDecisaoExplicita("assuma a decisão"), false);
  assert.equal(detectarPedidoDecisaoExplicita("assuma o comando"), false);
  assert.equal(ehActoExplicitoDeFecho("assuma a decisão"), true);
  assert.equal(ehActoExplicitoDeFecho("Você decide. Assuma o comando."), true);
});
