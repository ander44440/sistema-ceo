/**
 * Recorte: consulta factual de catálogo (sem MRE deliberativo).
 */
import assert from "node:assert/strict";
import { test, beforeEach } from "node:test";
import { STORAGE_KEY } from "./persistencia.js";
import { recarregarCatalogo } from "./index.js";
import {
  identificarConsultaFactualCatalogo,
  executarConsultaFactualCatalogo
} from "./consultaFactual.js";
import { executiveEngine, registrarCapacidade } from "../executiveEngine/index.js";
import { criarPublicadorFilaMemoria } from "../motorExecucao/ponteParecerJob.js";
import { resetStoreContinuidadePadrao } from "../continuidadeGate/integracaoConversa.js";
import { resetEstadoTopicosSessao } from "../classificadorIntencao/topicosSessao.js";
import { resetEstadoObjectivoSessao } from "../classificadorIntencao/objectivoSessao.js";

function criarStorage() {
  const map = new Map();
  return {
    getItem(k) {
      return map.has(String(k)) ? map.get(String(k)) : null;
    },
    setItem(k, v) {
      map.set(String(k), String(v));
    },
    removeItem(k) {
      map.delete(String(k));
    }
  };
}

function projetoBase(id, nome, extra = {}) {
  return {
    id,
    nome,
    descricao: "",
    estado: "ativo",
    empresaId: "emp-patrocinador",
    criadoEm: "2026-07-01T00:00:00.000Z",
    ultimaAtividadeEm: "2026-07-23T12:00:00.000Z",
    decisoes: [],
    pendencias: [],
    proximasAcoes: [],
    historicoResumido: [],
    proximoPassoSugerido: null,
    diaExecutivo: {
      status: "nao_iniciado",
      abertoEm: null,
      encerradoEm: null,
      intencaoDoDia: null,
      continuidade: []
    },
    ...extra
  };
}

function seedMg2() {
  globalThis.localStorage = criarStorage();
  const mg2 = projetoBase("prj-mg2", "Motoboy Game 2", {
    decisoes: [
      {
        id: "dec-mvp-001-seed",
        texto: "DEC-MVP-001: Taxa zerada em corrida cancelada",
        quando: "2026-07-23T12:00:00.000Z",
        origem: "teste"
      },
      {
        id: "dec-2",
        texto: "Outdoors laterais e piscantes",
        quando: "2026-07-30T12:00:00.000Z",
        origem: "teste"
      },
      {
        id: "dec-3",
        texto: "Performance: distância primeiro, depois LOD, depois chunks",
        quando: "2026-08-01T12:00:00.000Z",
        origem: "teste"
      },
      {
        id: "dec-4",
        texto: "Lastro via briefing/contexto — proibido fingir conhecimento",
        quando: "2026-08-02T12:00:00.000Z",
        origem: "teste"
      }
    ],
    pendencias: [
      {
        id: "pen-estado-001",
        texto: "Verificação do estado atual do projeto",
        status: "aberta",
        quando: "2026-08-10T15:00:00.000Z"
      }
    ]
  });
  const doc = {
    versao: 2,
    projetoAtivoId: "prj-mg2",
    empresaAtivaId: "emp-patrocinador",
    gabinete: { rotaId: "dashboard", atualizadoEm: "2026-08-01T00:00:00.000Z" },
    empresas: [{ id: "emp-patrocinador", nome: "Patrocinador" }],
    projetos: [mg2]
  };
  globalThis.localStorage.setItem(STORAGE_KEY, JSON.stringify(doc));
  recarregarCatalogo();
}

beforeEach(() => {
  resetStoreContinuidadePadrao();
  resetEstadoTopicosSessao();
  resetEstadoObjectivoSessao();
  seedMg2();
});

test("identificar: contagem / DEC / pendência; recusa análise e execução", () => {
  assert.equal(
    identificarConsultaFactualCatalogo(
      "Quantas decisões estão registradas no MG2?"
    )?.tipo,
    "contagem_decisoes"
  );
  assert.equal(
    identificarConsultaFactualCatalogo("Qual é a DEC-MVP-001?")?.tipo,
    "registro_decisao"
  );
  assert.equal(
    identificarConsultaFactualCatalogo(
      "Em que data foi registrada a DEC-MVP-001 do MG2?"
    )?.tipo,
    "data_decisao"
  );
  assert.equal(
    identificarConsultaFactualCatalogo("Qual é a pendência aberta do MG2?")
      ?.tipo,
    "pendencia_aberta"
  );
  assert.equal(
    identificarConsultaFactualCatalogo(
      "Qual é a data e o ID da pendência aberta?"
    )?.tipo,
    "pendencia_id_data"
  );
  assert.equal(
    identificarConsultaFactualCatalogo("Analise as decisões do MG2."),
    null
  );
  assert.equal(
    identificarConsultaFactualCatalogo("Implemente o botão agora."),
    null
  );
});

test("contagem usa decisoes.length", () => {
  const r = executarConsultaFactualCatalogo(
    "Quantas decisões estão registradas no MG2?"
  );
  assert.equal(r.mensagem, "4");
  assert.equal(r.dados.fonte, "decisoes.length");
});

test("DEC-MVP-001 texto e data", () => {
  const reg = executarConsultaFactualCatalogo("Qual é a DEC-MVP-001?");
  assert.match(reg.mensagem, /Taxa zerada em corrida cancelada/);
  const data = executarConsultaFactualCatalogo(
    "Em que data foi registrada a DEC-MVP-001 do MG2?"
  );
  assert.equal(data.mensagem, "23/07");
});

test("pendência aberta + id/data", () => {
  const p = executarConsultaFactualCatalogo("Qual é a pendência aberta?");
  assert.match(p.mensagem, /Verificação do estado atual do projeto/);
  const meta = executarConsultaFactualCatalogo(
    "Qual é a data e o ID da pendência aberta?"
  );
  assert.match(meta.mensagem, /pen-estado-001/);
  assert.match(meta.mensagem, /10\/08/);
});

test("dado inexistente — não inventa", () => {
  const r = executarConsultaFactualCatalogo("Qual é a DEC-ZZZ-999?");
  assert.match(r.mensagem, /não consta no registro/i);
  assert.doesNotMatch(r.mensagem, /Sugiro|Rejeitar|próximo passo/i);
});

test("EE: consulta factual não invoca MRE nem recomenda", async () => {
  let mre = 0;
  const original = executiveEngine.obterCapacidade("ia");
  const ia = {
    id: "ia",
    executar: async () => {
      mre += 1;
      return { ok: true, mensagem: "NÃO DEVERIA DELIBERAR", modo: "nucleo_mre" };
    }
  };
  registrarCapacidade(ia);
  try {
    const fila = criarPublicadorFilaMemoria();
    const out = await executiveEngine.executar(
      "Quantas decisões estão registradas no MG2?",
      { publicarJob: fila.publicarJob.bind(fila) }
    );
    assert.equal(mre, 0);
    assert.equal(out.dados?.mreInvocado, false);
    assert.equal(out.modo, "consulta_factual_catalogo");
    assert.equal(String(out.mensagem).trim(), "4");
    assert.doesNotMatch(out.mensagem, /Sugiro|Rejeitar|próximo passo/i);
    assert.equal(fila.jobs.length, 0);
  } finally {
    if (original) registrarCapacidade(original);
  }
});

test("EE: DEC inexistente fail-closed sem deliberação", async () => {
  let mre = 0;
  const original = executiveEngine.obterCapacidade("ia");
  registrarCapacidade({
    id: "ia",
    executar: async () => {
      mre += 1;
      return { ok: true, mensagem: "Sugiro Rejeitar", modo: "nucleo_mre" };
    }
  });
  try {
    const out = await executiveEngine.executar("Qual é a DEC-INEXIST-001?");
    assert.equal(mre, 0);
    assert.match(out.mensagem, /não consta no registro/i);
    assert.doesNotMatch(out.mensagem, /Sugiro|Rejeitar/i);
  } finally {
    if (original) registrarCapacidade(original);
  }
});

test("EE: comando executivo não é interceptado como factual", async () => {
  const fila = criarPublicadorFilaMemoria();
  const out = await executiveEngine.executar("Implemente o botão agora.", {
    publicarJob: fila.publicarJob.bind(fila)
  });
  assert.notEqual(out.modo, "consulta_factual_catalogo");
  assert.equal(out.dados?.classificacao?.classe, "trabalho_executivo");
});
