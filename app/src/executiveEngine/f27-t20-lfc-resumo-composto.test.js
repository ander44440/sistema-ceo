/**
 * F27 / VAL-094 T20 residual — LFC no resumo composto (reader async/HTTP).
 * T11 lista factos; T20 deve reutilizar a mesma fonte (await + deixis).
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, test } from "node:test";
import {
  executarConsultaEstado,
  identificarConsultaEstado
} from "./capacidades/consultarEstado.js";
import { processarTurnoLfc } from "../lastroFactualCaso/wiringConversacional.js";
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

const MSG_T11 =
  "Confirme: estamos no Isolamento Beta. Liste apenas os factos activos do LFC deste caso.";

const MSG_T20 =
  "Encerrar por agora. Resuma o estado final desta sessão: COA activo, último facto LFC confirmado e se há Job aberto — sem propor próximos passos.";

/**
 * Simula reader HTTP da UI (todas as ops devolvem Promise).
 * @param {ReturnType<typeof criarLfcReader>} reader
 */
function envolverReaderAsync(reader) {
  return {
    id: "lfc-reader-async-proxy",
    obterCasoActivo(coaId) {
      return Promise.resolve(reader.obterCasoActivo(coaId));
    },
    listarFactosActivos(coaId, casoId) {
      return Promise.resolve(reader.listarFactosActivos(coaId, casoId));
    },
    resolverCaso(coaId, cmd) {
      return Promise.resolve(reader.resolverCaso(coaId, cmd));
    },
    obterCaso(coaId, casoId, opts) {
      return Promise.resolve(reader.obterCaso(coaId, casoId, opts));
    },
    listarCasosDoCoa(coaId, opts) {
      return Promise.resolve(reader.listarCasosDoCoa(coaId, opts));
    }
  };
}

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
          texto: "Sugiro retomar. Próximo passo: outdoor."
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

test("F27: reader async — mesmos factos T11 aparecem no resumo T20", async () => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "ceo-f27-t20-"));
  const store = criarLfcStore(tmpDir);
  const writer = criarLfcWriter(store, { superficie: "f27" });
  const readerSync = criarLfcReader(store);
  const reader = envolverReaderAsync(readerSync);

  const coa = abrirCoaParaTeste("coa-f27-beta", "Isolamento Beta F27");
  definirCoaAtivo(coa);

  const criado = writer.criarCaso({
    coaId: coa.id,
    titulo: "Caso Beta",
    origem: ORIGEM_UTILIZADOR,
    factosIniciais: [
      "B1 código secreto BETA-TOKEN-992",
      "B2 orçamento exclusivo R$ 8.888.000",
      "B3 fornecedor exclusivo SulVerde SA"
    ]
  });
  assert.equal(criado.ok, true);

  const t11 = await processarTurnoLfc(MSG_T11, {
    historico: [],
    coaId: coa.id,
    writer,
    reader,
    permitirFallbackReparse: false
  });
  assert.equal(t11.activo, true);
  assert.match(String(t11.mensagem), /BETA-TOKEN-992/);
  assert.match(String(t11.mensagem), /8\.888\.000/);
  assert.match(String(t11.mensagem), /SulVerde/);

  assert.equal(identificarConsultaEstado(MSG_T20).tipo, "resumo_composto");

  const t20 = await executarConsultaEstado(MSG_T20, {
    listarJobs: async () => [
      {
        id: "JOB-000201",
        titulo: "Documentar decisão",
        estado: "dispatched",
        projeto: coa.id
      }
    ],
    coaId: coa.id,
    lfcReader: reader
  });

  assert.equal(t20.dados?.tipoConsulta, "resumo_composto");
  assert.equal(t20.dados?.casoId, criado.casoId);
  assert.equal(t20.dados?.nFactosLfc, 3);
  const msg = String(t20.mensagem);
  assert.match(msg, /COA activo:.*Isolamento Beta F27/i);
  assert.match(msg, /BETA-TOKEN-992/);
  assert.match(msg, /8\.888\.000/);
  assert.match(msg, /SulVerde/);
  assert.match(msg, /JOB-000201/);
  assert.match(msg, /Sem próximos passos/i);
  assert.doesNotMatch(msg, /nenhum caso activo|Sugiro|Próximo passo:/i);
});

test("F27: outro COA não entra no resumo do COA activo", async () => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "ceo-f27-iso-"));
  const store = criarLfcStore(tmpDir);
  const writer = criarLfcWriter(store, { superficie: "f27-iso" });
  const reader = envolverReaderAsync(criarLfcReader(store));

  const coaA = abrirCoaParaTeste("coa-f27-a", "COA Alpha Contaminante");
  writer.criarCaso({
    coaId: coaA.id,
    titulo: "Alpha",
    origem: ORIGEM_UTILIZADOR,
    factosIniciais: ["ALPHA-TOKEN-SECRET", "120 funcionários ValeVerde"]
  });

  const coaB = abrirCoaParaTeste("coa-f27-b", "Isolamento Beta ISO");
  definirCoaAtivo(coaB);
  writer.criarCaso({
    coaId: coaB.id,
    titulo: "Beta",
    origem: ORIGEM_UTILIZADOR,
    factosIniciais: ["BETA-TOKEN-992", "SulVerde SA"]
  });

  const out = await executarConsultaEstado(MSG_T20, {
    listarJobs: async () => [],
    coaId: coaB.id,
    lfcReader: reader
  });
  const msg = String(out.mensagem);
  assert.match(msg, /BETA-TOKEN-992|SulVerde/);
  assert.doesNotMatch(msg, /ALPHA-TOKEN|120 funcionários|ValeVerde/i);
  assert.match(msg, /Isolamento Beta ISO/i);
});

test("F27 EE: async reader + Jobs; 0 MRE; 0 Job novo", async () => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "ceo-f27-ee-"));
  const store = criarLfcStore(tmpDir);
  const writer = criarLfcWriter(store, { superficie: "f27-ee" });
  const reader = envolverReaderAsync(criarLfcReader(store));

  const coa = abrirCoaParaTeste("coa-f27-ee", "Beta EE F27");
  definirCoaAtivo(coa);
  writer.criarCaso({
    coaId: coa.id,
    titulo: "Caso",
    origem: ORIGEM_UTILIZADOR,
    factosIniciais: ["Orçamento exclusivo: R$ 8.888.000"]
  });

  const fila = criarPublicadorFilaMemoria();
  await fila.publicarJob({
    id: "JOB-F27-1",
    titulo: "Doc decisão",
    objetivo: "documentar",
    estado: "dispatched",
    projeto: coa.id
  });
  if (fila.jobs[0]) fila.jobs[0].estado = "dispatched";
  const nAntes = fila.jobs.length;

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
  assert.match(msg, /8\.888\.000|Orçamento/i);
  assert.match(msg, /COA activo/i);
  assert.match(msg, /Jobs/i);
  assert.match(msg, /Sem próximos passos/i);
  assert.doesNotMatch(msg, /nenhum caso activo/i);
  assert.equal(llmCalls, 0);
  assert.equal(fila.jobs.length, nAntes);
});
