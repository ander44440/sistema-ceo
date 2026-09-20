/**
 * F25 / VAL-094 T20 — encerramento: resumo composto COA + LFC + Jobs.
 * Sem próximos passos quando proibidos; sem Job; sem MRE.
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, test } from "node:test";
import {
  classificar,
  ehConsultaEstadoOperacional,
  ehConsultaEstadoParaC4,
  ehPedidoResumoCompostoSessao,
  ehProibicaoProximosPassos,
  normalizarTexto
} from "../classificadorIntencao/regras.js";
import {
  identificarConsultaEstado,
  executarConsultaEstado
} from "./capacidades/consultarEstado.js";
import { mapearCapacidadePorTexto } from "./classificar.js";
import { executiveEngine } from "./index.js";
import { abrirCoaParaTeste } from "./garantirCoaCatalogoTeste.js";
import { limparCoaAtivo, definirCoaAtivo } from "./coaSessao.js";
import { criarPublicadorFilaMemoria } from "../motorExecucao/ponteParecerJob.js";
import { resetStoreContinuidadePadrao } from "../continuidadeGate/integracaoConversa.js";
import { resetEstadoTopicosSessao } from "../classificadorIntencao/topicosSessao.js";
import { resetEstadoObjectivoSessao } from "../classificadorIntencao/objectivoSessao.js";
import { reiniciarAutoridadeDelegadaParaTestes } from "../autoridadeDelegada/autoridadeDelegada.js";
import { reiniciarEnvelopeSessaoParaTestes } from "../classificadorIntencao/envelopeSessaoCoa.js";
import {
  ORIGEM_UTILIZADOR,
  criarLfcStore,
  criarLfcWriter,
  criarLfcReader
} from "../lastroFactualCaso/index.js";

const MSG_T20 =
  "Resuma o COA, LFC e Jobs; sem próximos passos.";

const MSG_T20_LONGO =
  "Encerrar por agora. Resuma o estado final desta sessão: COA activo, último facto LFC confirmado e se há Job aberto — sem propor próximos passos.";

let fetchPrev;
let llmCalls;
/** @type {string|null} */
let tmpDir = null;

beforeEach(() => {
  resetStoreContinuidadePadrao();
  resetEstadoTopicosSessao();
  resetEstadoObjectivoSessao();
  reiniciarAutoridadeDelegadaParaTestes();
  reiniciarEnvelopeSessaoParaTestes();
  executiveEngine.reiniciarAcompanhamentoParaTestes();
  limparCoaAtivo();
  llmCalls = 0;
  fetchPrev = globalThis.fetch;
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
          texto: "Sugiro retomar. Próximo passo: outdoor Premium."
        }),
        { status: 200 }
      );
    }
    return new Response("{}", { status: 404 });
  };
});

afterEach(() => {
  globalThis.fetch = fetchPrev;
  limparCoaAtivo();
  if (tmpDir) {
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch {
      /* ignore */
    }
    tmpDir = null;
  }
});

test("F25-T20 detector: resumo COA+LFC+Jobs → C4 consulta", () => {
  const n = normalizarTexto(MSG_T20);
  assert.equal(ehPedidoResumoCompostoSessao(n), true);
  assert.equal(ehProibicaoProximosPassos(n), true);
  assert.equal(ehConsultaEstadoOperacional(n), true);
  assert.equal(ehConsultaEstadoParaC4(n, {}), true);
  assert.equal(identificarConsultaEstado(MSG_T20).tipo, "resumo_composto");
  assert.equal(mapearCapacidadePorTexto(MSG_T20).id, "consultar_estado");
  const s = classificar(MSG_T20, { frenteActiva: true });
  assert.equal(s.classe, "comando_operacional");
  assert.equal(s.destino, "capacidade_operacional");
  assert.equal(s.permiteJob, false);
});

test("F25-T20 longo (F18): também resumo_composto", () => {
  const n = normalizarTexto(MSG_T20_LONGO);
  assert.equal(ehPedidoResumoCompostoSessao(n), true);
  assert.equal(identificarConsultaEstado(MSG_T20_LONGO).tipo, "resumo_composto");
});

test("F25: ausência de dados declarada sem invenção", async () => {
  const out = await executarConsultaEstado(MSG_T20, {
    listarJobs: async () => [],
    coaId: null,
    lfcReader: null
  });
  assert.match(String(out.mensagem), /COA activo: nenhum/i);
  assert.match(String(out.mensagem), /LFC:/i);
  assert.match(String(out.mensagem), /Jobs: nenhum/i);
  assert.doesNotMatch(String(out.mensagem), /Outdoor|8\.888|invent/i);
  assert.match(String(out.mensagem), /Sem próximos passos/i);
});

test("F25-T20 EE: COA+LFC+Jobs; sem MRE; sem Job; sem próximos passos", async () => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "ceo-f25-t20-"));
  const store = criarLfcStore(tmpDir);
  const writer = criarLfcWriter(store, { superficie: "f25-t20" });
  const reader = criarLfcReader(store);

  const coa = abrirCoaParaTeste("coa-f25-t20", "Isolamento Beta T20");
  definirCoaAtivo(coa);

  const criado = writer.criarCaso({
    coaId: coa.id,
    titulo: "Caso T20",
    origem: ORIGEM_UTILIZADOR,
    factosIniciais: ["Orçamento exclusivo: R$ 8.888.000"]
  });
  assert.equal(criado.ok, true);

  const fila = criarPublicadorFilaMemoria();
  await fila.publicarJob({
    id: "JOB-000201",
    titulo: "Outdoor Premium",
    descricao: "recuperar outdoor",
    estado: "dispatched",
    projeto: coa.id
  });
  const jobsAntes = fila.jobs.length;

  const out = await executiveEngine.executar(
    { texto: MSG_T20, historico: [], coaId: coa.id },
    {
      publicarJob: fila.publicarJob.bind(fila),
      lfcWriter: writer,
      lfcReader: reader,
      listarJobs: async () => fila.jobs,
      obterJob: async (id) => fila.jobs.find((j) => j.id === id) || null
    }
  );

  const msg = String(out.mensagem || "");
  assert.match(msg, /COA activo/i);
  assert.match(msg, /Isolamento Beta T20|coa-f25-t20/i);
  assert.match(msg, /LFC/i);
  assert.match(msg, /8\.888\.000|Orçamento/i);
  assert.match(msg, /JOB-000201|Jobs/i);
  assert.match(msg, /Sem próximos passos/i);
  assert.doesNotMatch(
    msg,
    /Sugiro|Próximo passo:|Quer que|Indique o recurso|mais precis/i
  );
  assert.equal(llmCalls, 0, "não deve deliberar no MRE");
  assert.equal(fila.jobs.length, jobsAntes, "não criar Job novo");
  assert.ok(
    out.dados?.tipoConsulta === "resumo_composto" ||
      out.modo === "consulta_estado" ||
      out.dados?.encaminhamento?.destino === "capacidade_operacional",
    `rota inesperada: modo=${out.modo} tipo=${out.dados?.tipoConsulta}`
  );
});
