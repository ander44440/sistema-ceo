/**
 * CTO-001 — testes de preservação da missão sob baixa confiança.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  devePreservarMissao,
  montarConfirmacaoNatural,
  sanitizarProsaUtilizador,
  JARGÃO_PROIBIDO,
  hipoteseNaturalPorClasse
} from "./preservarMissao.js";
import { executarDestinoClarificacao } from "./destinos.js";

test("CTO-001: confirmação natural não expõe Job / deliberar / comando operacional", () => {
  const msg = montarConfirmacaoNatural({
    classificacao: { classe: "conversa_projeto", confianca: 0.45 },
    texto: "e agora?"
  });
  assert.equal(JARGÃO_PROIBIDO.test(msg), false);
  assert.doesNotMatch(msg, /\bJob\b/i);
  assert.doesNotMatch(msg, /deliberar/i);
  assert.doesNotMatch(msg, /comando operacional/i);
});

test("CTO-001: duas hipóteses em confiança muito baixa — prosa natural", () => {
  const msg = montarConfirmacaoNatural({
    classificacao: { classe: "conhecimento_geral", confianca: 0.3 },
    texto: "ok"
  });
  assert.equal(JARGÃO_PROIBIDO.test(msg), false);
  assert.match(msg, /hipótese|Prefere|Confirma|frase/i);
});

test("CTO-001: sanitizar remove jargão se vazar", () => {
  const s = sanitizarProsaUtilizador(
    "Quer deliberar ou executar um Job ou comando operacional?"
  );
  assert.equal(JARGÃO_PROIBIDO.test(s), false);
});

test("CTO-001: com histórico de missão → preservar (não menu de classes)", () => {
  assert.equal(
    devePreservarMissao({
      historico: [
        { papel: "user", texto: "Vamos tratar dos outdoors na avenida." },
        { papel: "ceo", texto: "Combinado — foco nos outdoors laterais." }
      ],
      texto: "e o pagamento?",
      classificacao: { classe: "conhecimento_geral", confianca: 0.4 }
    }),
    true
  );
});

test("CTO-001: sem contexto → não forçar preservação", () => {
  assert.equal(
    devePreservarMissao({
      historico: [],
      texto: "xyz",
      classificacao: { classe: "conhecimento_geral", confianca: 0.3 }
    }),
    false
  );
});

test("CTO-001: executar clarificação com missão → C2 (hipótese), sem jargão", async () => {
  const out = await executarDestinoClarificacao({
    texto: "e agora?",
    historico: [
      { papel: "user", texto: "Priorizar outdoor e pagamento no MG2." },
      { papel: "ceo", texto: "Foco no outdoor; depois pagamento." }
    ],
    intencao: { id: "clarificacao", capacidade: "ia", confianca: 0.4 },
    classificacao: {
      classe: "conversa_projeto",
      confianca: 0.4,
      precisaClarificacao: true,
      destino: "clarificacao"
    },
    rota: { destino: "clarificacao" },
    obterCapacidade: (id) =>
      id === "ia"
        ? {
            id: "ia",
            executar: async () => ({
              ok: true,
              mensagem: "Seguimos no outdoor; pagamento a seguir.",
              modo: "nucleo_mre"
            })
          }
        : null,
    contextoCapacidade: (p) => p,
    deps: {
      lastroConsciencia: {
        temContextoRelevante: true,
        memoriaTrabalhoExecutiva: {
          objetivoAtual: "Outdoor na avenida",
          proximaAcao: "Confirmar laterais"
        }
      }
    },
    naturalizar: (r) => r
  });

  assert.equal(out.dados?.preservacaoMissao, "CTO-001");
  assert.equal(out.dados?.hipoteseMissao, true);
  assert.equal(out.dados?.rota, "nucleo_mre");
  assert.equal(JARGÃO_PROIBIDO.test(out.mensagem || ""), false);
  assert.doesNotMatch(out.mensagem || "", /comando operacional|deliberar sobre|\bJob\b/i);
});

test("CTO-001: clarificação sem missão → confirmação natural", async () => {
  const out = await executarDestinoClarificacao({
    texto: "hmm",
    historico: [],
    intencao: { id: "clarificacao", capacidade: "ia" },
    classificacao: {
      classe: "conhecimento_geral",
      confianca: 0.42,
      precisaClarificacao: true,
      destino: "clarificacao"
    },
    rota: { destino: "clarificacao" },
    obterCapacidade: () => null,
    contextoCapacidade: (p) => p,
    deps: {}
  });

  assert.equal(out.modo, "clarificacao");
  assert.equal(out.dados?.confirmacaoNatural, true);
  assert.equal(JARGÃO_PROIBIDO.test(out.mensagem), false);
  assert.doesNotMatch(out.mensagem, /Job|deliberar|comando operacional/i);
});

test("CTO-001: hipóteses naturais sem nomes internos", () => {
  for (const c of [
    "conversa_projeto",
    "trabalho_executivo",
    "conhecimento_geral",
    "comando_operacional"
  ]) {
    const h = hipoteseNaturalPorClasse(c);
    assert.equal(JARGÃO_PROIBIDO.test(h), false, c);
  }
});
