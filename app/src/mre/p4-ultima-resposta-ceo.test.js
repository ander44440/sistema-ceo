/**
 * P4 — última resposta CEO completa chega ao Estágio 4 sob AUTOANÁLISE.
 */

import assert from "node:assert/strict";
import { test, afterEach } from "node:test";
import {
  extrairUltimaRespostaCeo,
  executarRotaDeliberativa
} from "./integracaoNucleo.js";
import {
  detectarPedidoAnaliseDeliberativa,
  obterAutoanaliseActiva
} from "./politicaAnaliseDeliberativa.js";
import { executarPipeline07 } from "./pipeline/orquestrador.js";

afterEach(() => {
  detectarPedidoAnaliseDeliberativa("");
});

const TEXTO_LONGO =
  "Decisão: Aprovar a Opção A por estabilidade. ".repeat(8) +
  "Critério: sistema fora do ar exige mitigação imediata sem regressão.";

test("P4: extrairUltimaRespostaCeo — último papel ceo, texto completo", () => {
  const texto = extrairUltimaRespostaCeo([
    { papel: "usuario", texto: "dilema Opção A vs B, sistema fora do ar" },
    { papel: "ceo", texto: "Resposta antiga curta." },
    { papel: "usuario", texto: "outra" },
    { papel: "ceo", texto: TEXTO_LONGO }
  ]);
  assert.equal(texto, TEXTO_LONGO);
  assert.ok(texto.length > 160);
});

test("P4: extrairUltimaRespostaCeo — aceita papel assistente", () => {
  const texto = extrairUltimaRespostaCeo([
    { papel: "usuario", texto: "pedido" },
    { papel: "assistente", texto: TEXTO_LONGO }
  ]);
  assert.equal(texto, TEXTO_LONGO);
});

test("P4: extrairUltimaRespostaCeo — sem ceo/assistente devolve null", () => {
  assert.equal(
    extrairUltimaRespostaCeo([{ papel: "usuario", texto: "só isto" }]),
    null
  );
});

test("P4: executarRotaDeliberativa — AUTO injecta ultimaRespostaCeo na entrada→estágio 4", async () => {
  const instrucao =
    "Analise criticamente sua resposta anterior. O que você acertou, onde errou e o que poderia ter feito melhor?";
  detectarPedidoAnaliseDeliberativa(instrucao);
  assert.equal(obterAutoanaliseActiva(), true);

  /** @type {object|null} */
  let contextoEstagio4 = null;
  const out = await executarRotaDeliberativa(
    {
      instrucao,
      historico: [
        {
          papel: "usuario",
          texto: "Opção A ou B? O sistema está fora do ar."
        },
        { papel: "ceo", texto: TEXTO_LONGO },
        { papel: "usuario", texto: instrucao }
      ],
      coaAtivo: { id: "prj-mg2", nome: "Motoboy Game 2" },
      memoria: () => ({ pendencias: [] }),
      intencao: { id: "deliberar", capacidade: "ia" }
    },
    {
      canal: "chat",
      skipFila: true,
      chamarLlm: async (pedido) => {
        if (pedido.estagio === "4_analise") {
          contextoEstagio4 = pedido.contexto;
          return { analise: "Acertei X; errei Y; poderia Z." };
        }
        if (pedido.estagio === "0_diagnostico") {
          return {
            objetivoReal: "autoanálise da resposta anterior",
            problemaNegocio: "crítica da resposta do CEO",
            natureza: "estrategico"
          };
        }
        if (pedido.estagio === "1_enquadramento") {
          return {
            tipoPedido: "informacao",
            urgencia: "media",
            escopo: "autoanálise"
          };
        }
        if (pedido.estagio === "3_principios") {
          return { principiosAplicados: ["clareza"] };
        }
        if (pedido.estagio === "5a_riscos") {
          return { riscos: [] };
        }
        if (pedido.estagio === "5b_oportunidades") {
          return { oportunidades: [] };
        }
        if (pedido.estagio === "6_decisao") {
          return {
            estado: "monitorar",
            recomendacao: "",
            alternativas: [],
            justificativa: "Análise da resposta anterior; riscos e princípios considerados."
          };
        }
        if (String(pedido.estagio || "").startsWith("7")) {
          return { descricao: "Sem acção", prioridade: "normal" };
        }
        return {};
      }
    }
  );

  assert.equal(out.ok, true);
  assert.ok(contextoEstagio4);
  assert.equal(contextoEstagio4.ultimaRespostaCeo, TEXTO_LONGO);
  assert.ok(String(contextoEstagio4.ultimaRespostaCeo).length > 160);
});

test("P4: pipeline sem AUTO — parcial/contexto sem ultimaRespostaCeo", async () => {
  detectarPedidoAnaliseDeliberativa("Analise a proposta do bairro e recomenda.");
  assert.equal(obterAutoanaliseActiva(), false);

  /** @type {object|null} */
  let contextoEstagio4 = null;
  await executarPipeline07(
    {
      mensagem: "Analise a proposta do bairro e recomenda.",
      ultimaRespostaCeo: TEXTO_LONGO,
      coaId: "prj-mg2",
      factosOficiais: ["facto A"],
      snapshotPainel: { resumo: "painel" }
    },
    {
      chamarLlm: async (pedido) => {
        if (pedido.estagio === "4_analise") {
          contextoEstagio4 = pedido.contexto;
          return { analise: "Análise da proposta." };
        }
        if (pedido.estagio === "0_diagnostico") {
          return {
            objetivoReal: "avaliar proposta",
            problemaNegocio: "bairro",
            natureza: "estrategico"
          };
        }
        if (pedido.estagio === "1_enquadramento") {
          return {
            tipoPedido: "decisao",
            urgencia: "media",
            escopo: "proposta"
          };
        }
        if (pedido.estagio === "3_principios") {
          return { principiosAplicados: ["clareza"] };
        }
        if (pedido.estagio === "5a_riscos") return { riscos: [] };
        if (pedido.estagio === "5b_oportunidades") return { oportunidades: [] };
        if (pedido.estagio === "6_decisao") {
          return {
            estado: "aprovar",
            recomendacao: "Modificar âmbito",
            alternativas: ["Adiar"],
            justificativa: "Princípios e riscos suportam decisão."
          };
        }
        if (String(pedido.estagio || "").startsWith("7")) {
          return { descricao: "Seguir", prioridade: "normal" };
        }
        return {};
      }
    }
  );

  assert.ok(contextoEstagio4);
  assert.equal(contextoEstagio4.ultimaRespostaCeo, undefined);
});

test("P4: pipeline com AUTO + entrada.ultimaRespostaCeo → estágio 4", async () => {
  detectarPedidoAnaliseDeliberativa(
    "Analise criticamente sua resposta anterior."
  );
  assert.equal(obterAutoanaliseActiva(), true);

  /** @type {object|null} */
  let contextoEstagio4 = null;
  await executarPipeline07(
    {
      mensagem: "Analise criticamente sua resposta anterior.",
      ultimaRespostaCeo: TEXTO_LONGO,
      coaId: "prj-mg2",
      factosOficiais: ["facto A"],
      snapshotPainel: { resumo: "painel" }
    },
    {
      pedidoAnaliseDeliberativa: true,
      chamarLlm: async (pedido) => {
        if (pedido.estagio === "4_analise") {
          contextoEstagio4 = pedido.contexto;
          return { analise: "Acertei; errei; melhoraria." };
        }
        if (pedido.estagio === "0_diagnostico") {
          return {
            objetivoReal: "autoanálise",
            problemaNegocio: "resposta anterior",
            natureza: "estrategico"
          };
        }
        if (pedido.estagio === "1_enquadramento") {
          return {
            tipoPedido: "informacao",
            urgencia: "baixa",
            escopo: "autoanálise"
          };
        }
        if (pedido.estagio === "3_principios") {
          return { principiosAplicados: ["clareza"] };
        }
        if (pedido.estagio === "5a_riscos") return { riscos: [] };
        if (pedido.estagio === "5b_oportunidades") return { oportunidades: [] };
        if (pedido.estagio === "6_decisao") {
          return {
            estado: "monitorar",
            recomendacao: "",
            alternativas: [],
            justificativa: "Crítica da resposta anterior com princípios."
          };
        }
        if (String(pedido.estagio || "").startsWith("7")) {
          return { descricao: "N/A", prioridade: "normal" };
        }
        return {};
      }
    }
  );

  assert.equal(contextoEstagio4?.ultimaRespostaCeo, TEXTO_LONGO);
});
