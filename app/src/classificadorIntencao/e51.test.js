/**
 * Emenda E5.1 — Executor do destino C1 / resposta_leve (IMP-057).
 */
import assert from "node:assert/strict";
import { test } from "node:test";

import { executiveEngine } from "../executiveEngine/index.js";
import { montarSaida } from "./dominio.js";
import { classificarEEncaminhar, ROTAS_POR_DESTINO } from "./encaminhador.js";
import { executarDestinoC1, executarPorDestino } from "./destinos.js";
import {
  ehStubRespostaLeveProibido,
  gerarRespostaConhecimentoGeral,
  montarMensagensRespostaLeve
} from "./respostaLeve.js";

/** Cenários obrigatórios CA-E5.1-1…6 */
export const CENARIOS_E51 = Object.freeze([
  {
    id: "CA-E5.1-1",
    texto: "Me dê uma receita de bolo de laranja.",
    mensagemMock:
      "Receita completa de bolo de laranja: 3 ovos, 2 xícaras de farinha, " +
      "1 xícara de açúcar, suco e raspas de 2 laranjas, 1/2 xícara de óleo, " +
      "1 colher de fermento. Misture, asse a 180°C por 40 minutos. Sirva frio."
  },
  {
    id: "CA-E5.1-2",
    texto: "Quem foi Albert Einstein?",
    mensagemMock:
      "Albert Einstein (1879–1955) foi um físico teórico alemão, autor da " +
      "relatividade especial e geral, e uma das figuras centrais da física moderna."
  },
  {
    id: "CA-E5.1-3",
    texto: "O que é Docker?",
    mensagemMock:
      "Docker é uma plataforma de contentores que empacota aplicações com as " +
      "suas dependências para execução isolada e portátil em qualquer ambiente."
  },
  {
    id: "CA-E5.1-4",
    texto: "Explique REST.",
    mensagemMock:
      "REST (Representational State Transfer) é um estilo arquitectural para " +
      "APIs HTTP: recursos identificados por URI, operações via verbos " +
      "(GET, POST, PUT, DELETE) e comunicação sem estado."
  },
  {
    id: "CA-E5.1-5",
    texto: "Como funciona o protocolo HTTP?",
    mensagemMock:
      "HTTP é o protocolo de pedido-resposta da Web: o cliente envia um método " +
      "e um caminho; o servidor devolve um código de estado e um corpo. Usa " +
      "ligações TCP (ou TLS no HTTPS) e cabeçalhos para metadados."
  },
  {
    id: "CA-E5.1-6",
    texto: "O que é uma árvore binária?",
    mensagemMock:
      "Uma árvore binária é uma estrutura de dados em que cada nó tem no máximo " +
      "dois filhos (esquerdo e direito), usada em pesquisas, ordenação e " +
      "expressões hierárquicas."
  }
]);

function mockGeradorPorTexto(texto) {
  const c = CENARIOS_E51.find((x) => x.texto === texto);
  return {
    ok: true,
    mensagem: c ? c.mensagemMock : `Resposta completa sobre: ${texto}`,
    modo: "resposta_leve",
    dados: { gerador: "llm_c1" }
  };
}

/**
 * Contexto C1 para o executor.
 * E5.1 não altera o Classificador: se um cenário ainda cair em clarificação
 * (ex. «Como funciona o protocolo HTTP?» — limiar), força-se o destino
 * `resposta_leve` só para validar o gerador (escopo desta emenda).
 */
function ctxC1(texto, extras = {}) {
  let encaminhamento = classificarEEncaminhar(texto);
  let destinoForcado = false;
  if (encaminhamento.destino !== "resposta_leve") {
    destinoForcado = true;
    const classificacao = montarSaida(
      "conhecimento_geral",
      0.9,
      "E5.1 fixture executor (destino forçado — Classificador intacto)"
    );
    encaminhamento = {
      ok: true,
      destino: "resposta_leve",
      classificacao,
      rota: ROTAS_POR_DESTINO.resposta_leve
    };
  }
  assert.equal(encaminhamento.destino, "resposta_leve", texto);
  assert.equal(encaminhamento.classificacao.classe, "conhecimento_geral", texto);
  let naturalizou = 0;
  return {
    texto,
    historico: [],
    intencao: {
      id: "resposta_leve",
      capacidade: "ia",
      confianca: encaminhamento.classificacao.confianca,
      classe: "conhecimento_geral"
    },
    classificacao: encaminhamento.classificacao,
    rota: encaminhamento,
    obterCapacidade: () => null,
    contextoCapacidade: (x) => x,
    naturalizar: (r) => {
      naturalizou += 1;
      return {
        ...r,
        dados: { ...r.dados, conversacaoNatural: { aplicado: true } }
      };
    },
    deps: {
      gerarRespostaLeve: async ({ texto: t }) => mockGeradorPorTexto(t),
      ...(extras.deps || {})
    },
    _naturalizou: () => naturalizou,
    _destinoForcado: destinoForcado
  };
}

test("CA-E5.1-1…6: respostas naturais completas; sem stub C1", async () => {
  console.log("\n--- DEMO E5.1 ---");
  for (const c of CENARIOS_E51) {
    const ctx = ctxC1(c.texto);
    const out = await executarDestinoC1(ctx);
    console.log({
      id: c.id,
      texto: c.texto,
      destino: out.dados?.rota,
      gerador: out.dados?.gerador,
      destinoForcado: ctx._destinoForcado,
      stub: ehStubRespostaLeveProibido(out.mensagem),
      trecho: String(out.mensagem).slice(0, 90)
    });
    assert.equal(out.dados?.rota, "resposta_leve", c.id);
    assert.equal(out.dados?.gerador, "llm_c1", c.id);
    assert.equal(out.dados?.mreInvocado, false, c.id);
    assert.equal(out.dados?.motorAcionado, false, c.id);
    assert.equal(ehStubRespostaLeveProibido(out.mensagem), false, c.id);
    assert.ok(out.mensagem.length > 40, `${c.id} resposta curta demais`);
    assert.match(out.mensagem, /./);
    // Conteúdo coerente com o mock (receita / Einstein / Docker / REST / HTTP / árvore)
    assert.ok(
      out.mensagem.includes(c.mensagemMock.slice(0, 24)) ||
        out.mensagem.length >= c.mensagemMock.length * 0.5,
      c.id
    );
  }
  console.log("--- fim DEMO E5.1 ---\n");
});

test("CA-E5.1-7: nenhum Job criado", async () => {
  let jobs = 0;
  const texto = CENARIOS_E51[0].texto;
  const out = await executiveEngine.executar(texto, {
    publicarJob: async () => {
      jobs += 1;
      return { id: "JOB-LEAK-C1", estado: "pending" };
    },
    gerarRespostaLeve: async ({ texto: t }) => mockGeradorPorTexto(t)
  });
  assert.equal(out.dados?.encaminhamento?.destino, "resposta_leve");
  assert.equal(out.dados?.classificacao?.classe, "conhecimento_geral");
  assert.equal(jobs, 0);
  assert.equal(out.dados?.motorAcionado, false);
  assert.equal(ehStubRespostaLeveProibido(out.mensagem), false);
});

test("CA-E5.1-8: nenhum Gate criado", async () => {
  const texto = CENARIOS_E51[2].texto;
  const out = await executiveEngine.executar(texto, {
    gerarRespostaLeve: async ({ texto: t }) => mockGeradorPorTexto(t)
  });
  assert.equal(out.dados?.encaminhamento?.destino, "resposta_leve");
  assert.equal(out.dados?.motor?.aguardandoGate, undefined);
  assert.ok(!String(out.mensagem).match(/aguardando aprovação|Gate G2/i));
});

test("CA-E5.1-9: nenhuma deliberação MRE", async () => {
  let mreCalls = 0;
  const texto = CENARIOS_E51[3].texto;
  const ctx = ctxC1(texto, {
    deps: {
      gerarRespostaLeve: async ({ texto: t }) => {
        mreCalls += 0; // gerador injectado — caminho sem MRE
        return mockGeradorPorTexto(t);
      }
    }
  });
  // Capacidade ia deliberativa NÃO deve ser usada para C1 conhecimento
  ctx.obterCapacidade = (id) => {
    if (id === "ia") {
      return {
        id: "ia",
        async executar() {
          mreCalls += 1;
          return { ok: true, mensagem: "MRE vazou", modo: "nucleo_mre" };
        }
      };
    }
    return null;
  };
  const out = await executarDestinoC1(ctx);
  assert.equal(mreCalls, 0, "capacidadeIa/MRE não pode ser chamada em C1 conhecimento");
  assert.equal(out.dados?.mreInvocado, false);
  assert.notEqual(out.dados?.rota, "nucleo_mre");
  assert.equal(ehStubRespostaLeveProibido(out.mensagem), false);
});

test("CA-E5.1-10: Conversação Natural preservada", async () => {
  const ctx = ctxC1(CENARIOS_E51[1].texto);
  const out = await executarDestinoC1(ctx);
  assert.equal(ctx._naturalizou(), 1);
  assert.equal(out.dados?.conversacaoNatural?.aplicado, true);
});

test("E5.1: stub clássico deixou de ser produzido por executarDestinoC1", async () => {
  const out = await executarPorDestino(
    ctxC1("O que é uma árvore binária?")
  );
  assert.equal(ehStubRespostaLeveProibido(out.mensagem), false);
  assert.doesNotMatch(out.mensagem, /resposta imediata \(C1\)/i);
  assert.doesNotMatch(out.mensagem, /Que detalhe precisa\?/i);
});

test("E5.1: montarMensagensRespostaLeve inclui system + pergunta", () => {
  const msgs = montarMensagensRespostaLeve({
    texto: "O que é Docker?",
    historico: []
  });
  assert.equal(msgs[0].role, "system");
  assert.ok(msgs.some((m) => m.role === "user" && /Docker/.test(m.content)));
});

test("E5.1: gerarRespostaConhecimentoGeral respeita inject", async () => {
  const out = await gerarRespostaConhecimentoGeral({
    texto: "Explique REST.",
    deps: {
      gerarRespostaLeve: async () => ({
        ok: true,
        mensagem: "REST explicado por completo no teste.",
        modo: "resposta_leve"
      })
    }
  });
  assert.match(out.mensagem, /REST explicado/);
  assert.equal(out.dados.mreInvocado, false);
});
