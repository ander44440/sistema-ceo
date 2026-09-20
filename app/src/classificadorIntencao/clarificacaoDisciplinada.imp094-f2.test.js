/**
 * IMP-094 Fase 2 — Clarificação disciplinada (CL-1/CL-2/CL-3) + OBS-7.
 */
import assert from "node:assert/strict";
import { describe, it, before, after } from "node:test";
import {
  funilClarificacaoEstritaActiva,
  permiteClarificacaoTurno,
  disciplinarSaidaClarificacao,
  ehFamiliaCanonicaAntiClarificacao
} from "./clarificacaoDisciplinada.js";
import { classificar } from "./regras.js";
import { classificarIntencao } from "../executiveEngine/classificar.js";
import { executiveEngine } from "../executiveEngine/index.js";
import {
  inicializarCatalogo,
  selecionarProjeto
} from "../catalogoProjetos/index.js";
import { definirContextoConversacional } from "../modules/conversa/store.js";
import { montarSaida } from "./dominio.js";

const COA = "prj-sistema-ceo";

const TC_CANONICOS = [
  "Você está no contexto CEO. Qual é o seu papel neste sistema?",
  "Qual é a primeira coisa que você deve fazer quando recebe uma nova demanda do usuário?",
  "Quando uma demanda do usuário estiver clara, qual deve ser o seu procedimento antes de iniciar qualquer execução?",
  "O usuário apresenta uma demanda clara, sem necessidade de esclarecimentos. Descreva, passo a passo, o que você deve fazer a partir desse momento até encaminhar a demanda para execução.",
  "A demanda do usuário está clara e pronta para execução. Você precisa pedir uma nova autorização do usuário antes de encaminhá-la ao CTO ou à IA especialista?",
  "Qual é o código secreto registrado nos fatos ativos do LFC deste caso? Responda somente com o valor do LFC."
];

let fetchPrev;

before(() => {
  inicializarCatalogo();
  try {
    selecionarProjeto(COA);
  } catch {
    /* ok */
  }
  definirContextoConversacional(COA);
  fetchPrev = globalThis.fetch;
  globalThis.fetch = async (url) => {
    if (String(url).includes("deliberar")) {
      throw new Error("LLM não esperado em F2 canónico");
    }
    return new Response("{}", { status: 404 });
  };
});

after(() => {
  globalThis.fetch = fetchPrev;
  delete process.env.CEO_FUNIL_CLARIFICACAO_ESTRITA;
});

describe("IMP-094 F2 — flag rollback", () => {
  it("activa por omissão", () => {
    delete process.env.CEO_FUNIL_CLARIFICACAO_ESTRITA;
    assert.equal(funilClarificacaoEstritaActiva(), true);
  });

  it("CEO_FUNIL_CLARIFICACAO_ESTRITA=off desactiva", () => {
    process.env.CEO_FUNIL_CLARIFICACAO_ESTRITA = "off";
    assert.equal(funilClarificacaoEstritaActiva(), false);
    assert.equal(
      permiteClarificacaoTurno("demanda clara sem lexicon", {
        motivoCandidato: "limiar"
      }).permitido,
      true
    );
    delete process.env.CEO_FUNIL_CLARIFICACAO_ESTRITA;
  });
});

describe("IMP-094 F2 — permiteClarificacaoTurno CL-1/2/3", () => {
  it("CL-2: protocolo/DIC/LFC/demanda clara → não permite", () => {
    delete process.env.CEO_FUNIL_CLARIFICACAO_ESTRITA;
    for (const q of TC_CANONICOS) {
      assert.equal(ehFamiliaCanonicaAntiClarificacao(q), true, q);
      assert.equal(
        permiteClarificacaoTurno(q, { motivoCandidato: "limiar" }).permitido,
        false,
        q
      );
    }
  });

  it("CL-3: limiar sem bloqueio → não permite", () => {
    delete process.env.CEO_FUNIL_CLARIFICACAO_ESTRITA;
    const r = permiteClarificacaoTurno("xyzabc frase sem lexicon forte", {
      motivoCandidato: "limiar_ou_classificador"
    });
    assert.equal(r.permitido, false);
    assert.match(r.razao, /cl3|cl1/i);
  });

  it("CL-1: ambiguo bloqueante explícito (não canónico) → permite", () => {
    delete process.env.CEO_FUNIL_CLARIFICACAO_ESTRITA;
    const r = permiteClarificacaoTurno("e quanto ao pagamento?", {
      ambiguoBloqueante: true,
      motivoCandidato: "vca"
    });
    assert.equal(r.permitido, true);
  });
});

describe("IMP-094 F2 — classificador sem clarificação indevida", () => {
  for (const q of TC_CANONICOS) {
    it(`classificar: ${q.slice(0, 42)}…`, () => {
      delete process.env.CEO_FUNIL_CLARIFICACAO_ESTRITA;
      const s = classificar(q, { frenteActiva: true });
      assert.notEqual(s.destino, "clarificacao", q);
      assert.notEqual(s.precisaClarificacao, true, q);
      const int = classificarIntencao(q, null, {
        contextoClassificacao: { frenteActiva: true }
      });
      assert.notEqual(int.destino, "clarificacao", q);
    });
  }

  it("limiar baixo disciplinado (não canónico) → sem clarificação automática", () => {
    delete process.env.CEO_FUNIL_CLARIFICACAO_ESTRITA;
    const baixa = montarSaida(
      "conhecimento_geral",
      0.4,
      "Sem lexicon; default restritivo C1"
    );
    assert.equal(baixa.precisaClarificacao, true);
    const d = disciplinarSaidaClarificacao(
      baixa,
      "frase aleatoria sem pedido canonico"
    );
    assert.equal(d.clarificacaoEvitada, true);
    assert.notEqual(d.saida.destino, "clarificacao");
    assert.equal(d.saida.precisaClarificacao, false);
  });
});

describe("IMP-094 F2 — EE OBS-7 + zero clarificação canónica", () => {
  for (const q of TC_CANONICOS.slice(0, 4)) {
    it(`EE OBS-7: ${q.slice(0, 40)}…`, async () => {
      delete process.env.CEO_FUNIL_CLARIFICACAO_ESTRITA;
      const out = await executiveEngine.executar({
        texto: q,
        historico: [],
        coaId: COA
      });
      assert.notEqual(out.modo, "clarificacao");
      assert.ok(
        !/^clarificacao/.test(String(out.dados?.encaminhamento?.destino || ""))
      );
      assert.equal(out.dados?.clarificacaoEvitada, true);
      assert.equal(out.dados?.destinoClarificacao, null);
      assert.doesNotMatch(out.mensagem, /Falha técnica/i);
    });
  }
});
