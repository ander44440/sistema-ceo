/**
 * Regressão — sequência de protocolo Agente Executivo (falhas VAL meta).
 */
import assert from "node:assert/strict";
import { describe, it, before } from "node:test";
import {
  detectarPedidoProtocoloExecutivo,
  tentarRespostaProtocoloExecutivo
} from "../executiveEngine/protocoloAgenteExecutivo.js";
import { classificarIntencao } from "../executiveEngine/classificar.js";
import { executiveEngine } from "../executiveEngine/index.js";
import { inicializarCatalogo, selecionarProjeto } from "../catalogoProjetos/index.js";
import { definirContextoConversacional } from "../modules/conversa/store.js";

const COA = "prj-sistema-ceo";

const CASOS = [
  {
    id: "primeira",
    q: "Qual é a primeira coisa que você deve fazer quando recebe uma nova demanda do usuário?",
    modo: "primeira_accao",
    must: [/classificar/i, /intenção|intencao/i],
    mustNot: [/ouvir atentamente/i, /Falha técnica/i, /lastro suficiente/i]
  },
  {
    id: "procedimento",
    q: "Quando uma demanda do usuário estiver clara, qual deve ser o seu procedimento antes de iniciar qualquer execução?",
    modo: "procedimento_pre_execucao",
    must: [/próximo gesto|proximo gesto|Gate|classific/i],
    mustNot: [/Falha técnica/i, /lastro suficiente/i, /Confirmação com o Usuário/i]
  },
  {
    id: "fluxo",
    q: "O usuário apresenta uma demanda clara, sem necessidade de esclarecimentos. Descreva, passo a passo, o que você deve fazer a partir desse momento até encaminhar a demanda para execução.",
    modo: "fluxo_ate_execucao",
    must: [/CTO|Job|Gate/i],
    mustNot: [/Falha técnica/i, /lastro suficiente/i]
  },
  {
    id: "faz_agora",
    q: "Você recebeu uma demanda clara do usuário e não existem informações faltantes. O que você faz agora?",
    modo: "fluxo_ate_execucao",
    must: [/Classificar|Registar|Job|CTO/i],
    mustNot: [/Sou o CEO — Executivo Digital/i, /Falha técnica/i, /lastro suficiente/i]
  },
  {
    id: "reauth_cto",
    q: "A demanda do usuário está clara e pronta para execução. Você precisa pedir uma nova autorização do usuário antes de encaminhá-la ao CTO ou à IA especialista?",
    modo: "reautorizacao",
    must: [/\bNão\b/i],
    mustNot: [/^Sim/i, /Falha técnica/i, /lastro suficiente/i]
  },
  {
    id: "apos_recebeu",
    q: "O usuário já apresentou uma demanda clara e autorizada. O CTO recebeu a demanda para análise. O que você deve fazer agora como Agente Executivo?",
    modo: "apos_cto_recebeu",
    must: [/acompanhar|Não\s+\*\*duplicar|não duplicar|Manter o contexto/i],
    mustNot: [/Falha técnica/i, /lastro suficiente/i]
  },
  {
    id: "apos_entregou",
    q: "O CTO concluiu a análise da demanda e entregou uma orientação técnica. Como Agente Executivo, qual é a sua responsabilidade a partir desse ponto?",
    modo: "apos_cto_entregou",
    must: [/Sintetizar|próximo gesto|proximo gesto|encaminhar/i],
    mustNot: [/Falha técnica/i, /lastro suficiente/i]
  },
  {
    id: "reauth_pos",
    q: "O usuário já autorizou a execução e o CTO já concluiu sua análise técnica. Você deve pedir nova autorização ao usuário antes de encaminhar a orientação para a IA especialista?",
    modo: "reautorizacao",
    must: [/\bNão\b/i],
    mustNot: [/^Sim,/i, /Falha técnica/i, /lastro suficiente/i]
  },
  {
    id: "acao_pronta",
    q: "Considere esta situação:\n\n* O usuário já autorizou a execução.\n* O CTO já concluiu a análise técnica.\n* A orientação está pronta para seguir para a IA especialista.\n\nComo Agente Executivo, qual ação deve ocorrer agora?",
    modo: "acao_pronta_especialista",
    must: [/encaminhar/i],
    mustNot: [/Falha técnica/i, /lastro suficiente/i, /\bdeve pedir nova autorização\b/i]
  }
];

before(() => {
  inicializarCatalogo();
  try {
    selecionarProjeto(COA);
  } catch {
    /* COA pode não existir em catálogo de teste — EE ainda recebe coaId */
  }
  definirContextoConversacional(COA);
  globalThis.fetch = async (url) => {
    const u = String(url);
    if (u.includes("deliberar")) {
      throw new Error("LLM não deve ser chamado no protocolo executivo");
    }
    return new Response("{}", { status: 404 });
  };
});

describe("Protocolo Agente Executivo — detecção", () => {
  for (const c of CASOS) {
    it(`detecta ${c.id}`, () => {
      const d = detectarPedidoProtocoloExecutivo(c.q);
      assert.equal(d.activo, true, c.q);
      assert.equal(d.modo, c.modo, c.q);
      const cls = classificarIntencao(c.q, { frenteActiva: true });
      assert.notEqual(cls.destino, "clarificacao", c.q);
      assert.notEqual(cls.precisaClarificacao, true, c.q);
    });
  }
});

describe("Protocolo Agente Executivo — EE sem falha técnica", () => {
  for (const c of CASOS) {
    it(`EE ${c.id}`, async () => {
      const local = tentarRespostaProtocoloExecutivo(c.q);
      assert.equal(local.activo, true);
      for (const re of c.must) assert.match(local.mensagem, re);
      for (const re of c.mustNot) assert.doesNotMatch(local.mensagem, re);

      const out = await executiveEngine.executar({
        texto: c.q,
        historico: [],
        coaId: COA
      });
      assert.ok(out.ok !== false, out.mensagem);
      assert.doesNotMatch(out.mensagem, /Falha técnica no raciocínio/i);
      assert.doesNotMatch(
        out.mensagem,
        /Não tenho lastro suficiente neste turno/i
      );
      for (const re of c.must) assert.match(out.mensagem, re);
      for (const re of c.mustNot) assert.doesNotMatch(out.mensagem, re);
    });
  }
});

/** Gap de roteamento — autodiagnóstico sem âncora «papel|ceo|agente executivo». */
const AUTODIAG_FUNCIONAMENTO = [
  "Faça um autodiagnóstico do seu funcionamento atual.",
  "Quais são suas limitações?",
  "Em quais situações você falha?",
  "Avalie seu próprio funcionamento.",
  "Faça uma autoavaliação das suas capacidades."
];

const FUNCIONAMENTO_NAO_AUTODIAG = [
  "Como funciona o outdoor no MG2?",
  "Qual o funcionamento do Gate de execução?",
  "Explique o funcionamento do fluxo de Jobs.",
  "Avalie o funcionamento do outdoor nesta sprint."
];

describe("Protocolo — autodiagnóstico de funcionamento (gap)", () => {
  for (const q of AUTODIAG_FUNCIONAMENTO) {
    it(`detecta: ${q.slice(0, 48)}`, () => {
      const d = detectarPedidoProtocoloExecutivo(q);
      assert.equal(d.activo, true, q);
      assert.equal(d.modo, "autodiagnostico_papel", q);
      const local = tentarRespostaProtocoloExecutivo(q);
      assert.equal(local.activo, true, q);
      assert.match(local.mensagem, /Autodiagnóstico do papel/i);
      assert.doesNotMatch(local.mensagem, /lastro suficiente/i);
    });
  }

  for (const q of FUNCIONAMENTO_NAO_AUTODIAG) {
    it(`não detecta funcionamento alheio: ${q.slice(0, 48)}`, () => {
      const d = detectarPedidoProtocoloExecutivo(q);
      assert.equal(d.activo, false, q);
      assert.equal(d.modo, null, q);
    });
  }
});

describe("Protocolo — EE autodiagnóstico funcionamento sem lastro falso", () => {
  for (const q of AUTODIAG_FUNCIONAMENTO) {
    it(`EE sem lastro: ${q.slice(0, 40)}`, async () => {
      const out = await executiveEngine.executar({
        texto: q,
        historico: [],
        coaId: COA
      });
      assert.ok(out.ok !== false, out.mensagem);
      assert.doesNotMatch(
        out.mensagem,
        /Não tenho lastro suficiente neste turno/i
      );
      assert.doesNotMatch(out.mensagem, /COA ativo ausente/i);
      assert.match(out.mensagem, /Autodiagnóstico do papel|Responsabilidades/i);
    });
  }
});
