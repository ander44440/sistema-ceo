/**
 * F16 / F14-C10 — consulta de estado da sessão responde directamente (sem LLM JSON).
 */

import assert from "node:assert/strict";
import { test, beforeEach, afterEach } from "node:test";
import {
  classificar,
  ehConsultaEstadoOperacional,
  normalizarTexto,
  ehProibicaoExecucaoExplicita,
  ehIntencaoExecutivaE21
} from "../classificadorIntencao/regras.js";
import { identificarConsultaEstado } from "./capacidades/consultarEstado.js";
import { detectarDeclaracaoDecisaoUtilizador } from "../classificadorIntencao/declaracaoDecisaoUtilizador.js";
import { detectarModoRespostaRestrita } from "../classificadorIntencao/pedidoRespostaRestrita.js";
import { gestorTopicos } from "../classificadorIntencao/gestorTopicos.js";
import { executiveEngine } from "./index.js";
import { abrirCoaParaTeste } from "./garantirCoaCatalogoTeste.js";
import { limparCoaAtivo, definirCoaAtivo } from "./coaSessao.js";
import { criarPublicadorFilaMemoria } from "../motorExecucao/ponteParecerJob.js";
import { resetStoreContinuidadePadrao } from "../continuidadeGate/integracaoConversa.js";
import { resetEstadoTopicosSessao } from "../classificadorIntencao/topicosSessao.js";
import { resetEstadoObjectivoSessao } from "../classificadorIntencao/objectivoSessao.js";
import { reiniciarAutoridadeDelegadaParaTestes } from "../autoridadeDelegada/autoridadeDelegada.js";
import { reiniciarEnvelopeSessaoParaTestes } from "../classificadorIntencao/envelopeSessaoCoa.js";

const MSG_C10 =
  "Qual é o estado actual da sessão? Responda de forma directa.";

const MSG_F11 =
  "Com base apenas nos fatos registrados sobre a ValeVerde, compare os riscos " +
  "da queda de margem versus o aumento de custos e delibere a preocupação " +
  "executiva central. Não despache Jobs.";

const MSG_F12 =
  "Execute agora: criar um Job para corrigir os bugs críticos do sprint e despachar para a fila.";

const MSG_F13 = "Responda somente: 42";

const MSG_F15 =
  "Decisão explícita: adiar o outdoor e priorizar o pagamento este mês. Registe apenas esta decisão.";

let fetchPrev;
let llmCalls;

beforeEach(() => {
  resetStoreContinuidadePadrao();
  resetEstadoTopicosSessao();
  resetEstadoObjectivoSessao();
  reiniciarAutoridadeDelegadaParaTestes();
  reiniciarEnvelopeSessaoParaTestes();
  executiveEngine.reiniciarAcompanhamentoParaTestes();
  limparCoaAtivo();
  fetchPrev = globalThis.fetch;
  llmCalls = 0;
  globalThis.fetch = async (url) => {
    const u = String(url);
    if (u.includes("llm-status")) {
      return new Response(JSON.stringify({ ok: true, configurado: true }), {
        status: 200
      });
    }
    if (u.includes("deliberar")) {
      llmCalls += 1;
      return new Response(
        JSON.stringify({
          ok: true,
          texto: JSON.stringify({
            objetivoReal: "avaliar margem e custos",
            problemaNegocio: "compressão de margem",
            natureza: "decisao"
          })
        }),
        { status: 200 }
      );
    }
    return new Response("{}", { status: 404 });
  };
});

afterEach(() => {
  globalThis.fetch = fetchPrev;
});

test("F16-C10: detector — estado actual da sessão → consulta operacional / estado_geral", () => {
  const n = normalizarTexto(MSG_C10);
  assert.equal(ehConsultaEstadoOperacional(n), true);
  assert.equal(identificarConsultaEstado(MSG_C10).tipo, "estado_geral");
  const s = classificar(MSG_C10);
  assert.equal(s.classe, "comando_operacional");
  assert.equal(s.destino, "capacidade_operacional");
  assert.equal(s.permiteJob, false);
});

test("F16-C10: EE — resposta directa de estado, 0 Jobs, 0 LLM, sem JSON mock", async () => {
  const coa = abrirCoaParaTeste("coa-f16-c10", "F16 C10");
  definirCoaAtivo(coa);
  const fila = criarPublicadorFilaMemoria();
  const out = await executiveEngine.executar(
    {
      texto: MSG_C10,
      historico: [
        {
          papel: "usuario",
          texto: "Deliberar outdoor vs pagamento.",
          coaId: coa.id
        },
        {
          papel: "ceo",
          texto: "Sugiro Outdoor Premium. JOB-000104 em recuperação.",
          coaId: coa.id
        }
      ],
      coaId: coa.id
    },
    {
      publicarJob: fila.publicarJob.bind(fila),
      leitoresConsciencia: {
        F1: async () => [
          { id: "JOB-000104", titulo: "bugs", status: "failed" }
        ],
        F2: async () => [],
        F3: async () => [],
        F4: async () => null,
        F5: async () => null,
        F6: async () => null,
        F7: async () => null
      }
    }
  );

  const msg = String(out.mensagem);
  assert.ok(msg.trim().length > 0);
  assert.equal(fila.jobs.length, 0);
  assert.equal(llmCalls, 0, "consulta de estado não deve chamar LLM");
  assert.notEqual(out.modo, "mre");
  assert.notEqual(out.dados?.encaminhamento?.destino, "nucleo_mre");
  assert.notEqual(out.modo, "resposta_leve");
  assert.equal(
    out.modo === "consulta_estado" ||
      out.dados?.encaminhamento?.destino === "capacidade_operacional" ||
      out.dados?.tipoConsulta === "estado_geral" ||
      /projeto|pend[eê]ncia|pr[oó]xim|sess|estado|situa/i.test(msg),
    true
  );
  assert.equal(
    /^\s*\{/.test(msg.trim()) || /objetivoReal|compressão de margem/i.test(msg),
    false,
    "não devolver JSON interno/mock"
  );
  assert.equal(
    /Plano executivo:|Antecipo pendência|Sugiro retentar|próximo passo automático:/i.test(
      msg
    ),
    false
  );
});

test("F16: ambíguo «Outdoor ou pagamento?» continua clarificável", async () => {
  const coa = abrirCoaParaTeste("coa-f16-amb", "F16 amb");
  definirCoaAtivo(coa);
  const out = await executiveEngine.executar(
    {
      texto: "Outdoor ou pagamento?",
      historico: [
        { papel: "usuario", texto: "Sobre o outdoor." },
        { papel: "ceo", texto: "Outdoor em curso." }
      ],
      coaId: coa.id
    },
    {}
  );
  assert.equal(out.modo, "clarificacao_topico");
});

test("F16: F11/F12/F13/F15 intactos (amostra)", () => {
  assert.equal(ehProibicaoExecucaoExplicita(normalizarTexto(MSG_F11)), true);
  assert.equal(ehIntencaoExecutivaE21(normalizarTexto(MSG_F11)), false);
  assert.notEqual(
    gestorTopicos({
      mensagem: MSG_F12,
      topicoActivo: null,
      pausas: []
    }).evento,
    "ambiguo_topico"
  );
  assert.equal(detectarModoRespostaRestrita(MSG_F13).modo, "literal");
  assert.equal(detectarDeclaracaoDecisaoUtilizador(MSG_F15).activo, true);
  assert.equal(classificar(MSG_F12).destino, "motor_execucao");
});
