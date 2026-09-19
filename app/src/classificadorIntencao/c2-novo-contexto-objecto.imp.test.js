/**
 * C2 — novo_contexto + objecto explícito (anti «dúvida geral»; sem missão abandonada).
 */
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { validarContextoAtivo } from "./validadorContextoAtivo.js";
import {
  ehMudancaContextoComObjectoExplicito,
  devePreservarMissao,
  montarConfirmacaoNatural
} from "./preservarMissao.js";
import { historicoDeliberativoParaDestino } from "./fioConversacional.js";
import { executarDestinoClarificacao } from "./destinos.js";

const T2 =
  "Mude o contexto: esqueça a campanha. Agora o assunto é exclusivamente o fornecedor de logística NorteAzul e o prazo de entrega.";

const HIST_OUTDOOR = [
  {
    papel: "usuario",
    texto: "Estamos a discutir a campanha de outdoor e o orçamento de mídia."
  },
  { papel: "ceo", texto: "Ok, falamos da campanha outdoor." }
];

describe("C2 VCA novo_contexto", () => {
  test("T2 homologado → novo_contexto (não independente por P0 análise)", () => {
    const r = validarContextoAtivo({
      mensagem: T2,
      topicoActivo: { titulo: "campanha outdoor", ancora: "outdoor" },
      historicoRecente: HIST_OUTDOOR
    });
    assert.equal(r.veredicto, "novo_contexto");
    assert.equal(r.autorizaLastroCsc, false);
  });
});

describe("C2 objecto explícito + histórico", () => {
  test("detecta mudança com objecto NorteAzul/prazo", () => {
    assert.equal(
      ehMudancaContextoComObjectoExplicito(T2, { veredicto: "novo_contexto" }),
      true
    );
  });

  test("não trata pergunta autónoma (R-H01) como mudança com objecto", () => {
    assert.equal(
      ehMudancaContextoComObjectoExplicito("Quanto custa, em média, um café expresso?", {
        veredicto: "independente"
      }),
      false
    );
  });

  test("novo_contexto esvazia histórico deliberativo (missão abandonada)", () => {
    const h = historicoDeliberativoParaDestino({
      autorizaLastroCsc: false,
      historicoDeliberativo: HIST_OUTDOOR,
      veredictoVca: "novo_contexto"
    });
    assert.equal(h.length, 0);
  });

  test("independente preserva fio deliberativo (Fatia 2 / R-H01)", () => {
    const h = historicoDeliberativoParaDestino({
      autorizaLastroCsc: false,
      historicoDeliberativo: HIST_OUTDOOR,
      veredictoVca: "independente"
    });
    assert.equal(h.length, HIST_OUTDOOR.length);
  });

  test("devePreservarMissao=false com objecto explícito mesmo com hist outdoor", () => {
    assert.equal(
      devePreservarMissao({
        texto: T2,
        historico: HIST_OUTDOOR,
        validacaoContexto: { veredicto: "novo_contexto" },
        classificacao: { classe: "conversa_projeto" }
      }),
      false
    );
  });
});

describe("C2 clarificacao não cai em dúvida geral", () => {
  test("clarificacao com objecto explícito → nucleo_mre (não dúvida geral)", async () => {
    let chamadoC2 = false;
    const out = await executarDestinoClarificacao({
      texto: T2,
      historico: HIST_OUTDOOR,
      validacaoContexto: { veredicto: "novo_contexto", autorizaLastroCsc: false },
      intencao: {
        id: "clarificacao",
        capacidade: "ia",
        precisaClarificacao: true,
        destino: "clarificacao",
        confianca: 0.3
      },
      classificacao: {
        classe: "conhecimento_geral",
        destino: "clarificacao",
        precisaClarificacao: true,
        confianca: 0.3
      },
      rota: { destino: "clarificacao" },
      deps: {},
      obterCapacidade: (id) =>
        id === "ia"
          ? {
              id: "ia",
              async executar(ctx) {
                chamadoC2 = true;
                assert.equal((ctx.historico || []).length, 0);
                return {
                  ok: true,
                  mensagem:
                    "Assunto: fornecedor NorteAzul e prazo de entrega. Campanha abandonada.",
                  modo: "llm_rapido"
                };
              }
            }
          : null,
      contextoCapacidade: (p) => ({
        instrucao: p.texto,
        historico: p.historico,
        intencao: p.intencao
      })
    });
    assert.equal(chamadoC2, true);
    assert.equal(out.dados?.novoContextoObjectoExplicito, true);
    assert.match(out.mensagem, /NorteAzul|prazo/i);
    assert.doesNotMatch(out.mensagem, /d[uú]vida geral/i);
    const conf = montarConfirmacaoNatural({
      classificacao: { classe: "conhecimento_geral", confianca: 0.3 }
    });
    assert.match(conf, /d[uú]vida geral/i);
  });
});
