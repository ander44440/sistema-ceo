/**
 * F22 / VAL-094 T07 — mudança de assunto + consulta de estado.
 * Histórico deliberativo (margem/outdoor) não substitui a consulta actual.
 */

import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";
import {
  classificar,
  ehConsultaEstadoOperacional,
  ehConsultaEstadoParaC4,
  ehMudancaAssuntoComConsultaEstado,
  normalizarTexto
} from "./regras.js";
import { identificarConsultaEstado } from "../executiveEngine/capacidades/consultarEstado.js";
import { executiveEngine } from "../executiveEngine/index.js";
import { abrirCoaParaTeste } from "../executiveEngine/garantirCoaCatalogoTeste.js";
import { limparCoaAtivo, definirCoaAtivo } from "../executiveEngine/coaSessao.js";
import { criarPublicadorFilaMemoria } from "../motorExecucao/ponteParecerJob.js";
import { resetStoreContinuidadePadrao } from "../continuidadeGate/integracaoConversa.js";
import { resetEstadoTopicosSessao, definirEstadoTopicosSessao } from "./topicosSessao.js";
import { resetEstadoObjectivoSessao } from "./objectivoSessao.js";
import { reiniciarAutoridadeDelegadaParaTestes } from "../autoridadeDelegada/autoridadeDelegada.js";
import { reiniciarEnvelopeSessaoParaTestes } from "./envelopeSessaoCoa.js";

const MSG_T07 =
  "Mude de assunto. Esqueça preço e margem por agora. Qual é o estado actual da sessão e do projeto activo?";

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
          texto:
            "Adio por agora: Adiar a avaliação. Estágio 7 de ação. Sugiro aguardar. Antecipo risco sobre margem."
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

test("F22-T07: detectors — mudança de assunto + estado → C4 consulta", () => {
  const n = normalizarTexto(MSG_T07);
  assert.equal(ehConsultaEstadoOperacional(n), true);
  assert.equal(ehMudancaAssuntoComConsultaEstado(n), true);
  assert.equal(ehConsultaEstadoParaC4(n, {}), true);
  assert.equal(identificarConsultaEstado(MSG_T07).tipo, "estado_geral");
  const s = classificar(MSG_T07);
  assert.equal(s.classe, "comando_operacional");
  assert.equal(s.destino, "capacidade_operacional");
  assert.equal(s.permiteJob, false);
});

test("F22-T07 EE: histórico margem/outdoor não domina; consulta sem MRE/Job", async () => {
  const coa = abrirCoaParaTeste("coa-f22-t07", "F22 T07");
  definirCoaAtivo(coa);
  definirEstadoTopicosSessao({
    topicoActivo: { id: "t-margem", rotulo: "margem vs outdoor", estado: "activo" },
    pausas: []
  });
  const fila = criarPublicadorFilaMemoria();

  const historico = [
    {
      papel: "usuario",
      texto: "Liste os factos da ValeVerde.",
      coaId: coa.id
    },
    {
      papel: "ceo",
      texto:
        "Factos: 120 funcionários; margem caiu de 8% para 4%; outdoor pendente.",
      coaId: coa.id
    },
    {
      papel: "usuario",
      texto:
        "Delibere se cortamos custos ou protegemos margem via preço. Não despache Jobs.",
      coaId: coa.id
    },
    {
      papel: "ceo",
      texto:
        "Sugiro Adiar. A margem e o outdoor exigem mais dados. Quer que tratemos deste risco agora?",
      coaId: coa.id
    },
    {
      papel: "usuario",
      texto: "Decisão minha: proteger a margem via preço. Não execute.",
      coaId: coa.id
    },
    {
      papel: "ceo",
      texto:
        "Decisão registada: proteger a margem via preço. Sem execução automática neste turno.",
      coaId: coa.id
    }
  ];

  const out = await executiveEngine.executar(
    { texto: MSG_T07, historico, coaId: coa.id },
    {
      publicarJob: fila.publicarJob.bind(fila),
      listarJobs: async () => [],
      listarPorEstado: async () => [],
      leitoresConsciencia: {
        F1: async () => [
          { id: "JOB-000122", titulo: "proposta preco", status: "dispatched" }
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
  assert.equal(fila.jobs.length, 0, "consulta não cria Job");
  assert.equal(llmCalls, 0, "consulta resolvida sem MRE");
  assert.notEqual(out.modo, "mre");
  assert.notEqual(out.dados?.encaminhamento?.destino, "nucleo_mre");
  assert.equal(
    out.modo === "consulta_estado" ||
      out.dados?.encaminhamento?.destino === "capacidade_operacional" ||
      out.dados?.tipoConsulta === "estado_geral",
    true
  );
  assert.match(msg, /projeto|sess|estado|situa/i);
  assert.equal(/est[aá]gio\s*7/i.test(msg), false, "não inventar estágio 7");
  assert.equal(
    /Sugiro|Antecipo|Quer que tratemos|Plano executivo/i.test(msg),
    false,
    "sem recomendação/plano não solicitado"
  );
  // Histórico deliberativo não deve substituir a consulta
  assert.equal(
    /outdoor|proteger a margem via pre[cç]o|queda de margem/i.test(msg),
    false,
    "histórico margem/outdoor não domina a resposta"
  );
});
