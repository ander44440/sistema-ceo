/**
 * F5-C4 — envelope CSC (tópico/pausas/objectivo) persiste por COA e sobrevive a refresh.
 */
import assert from "node:assert/strict";
import { test, beforeEach } from "node:test";
import {
  criarProjeto,
  inicializarCatalogo,
  obterProjetoAtivoId,
  recarregarCatalogo,
  selecionarProjeto
} from "../catalogoProjetos/index.js";
import { VERSAO, gravarDocumento } from "../catalogoProjetos/persistencia.js";
import {
  descartarHistoricosEmMemoria,
  reiniciarStoreConversaParaTestes
} from "../modules/conversa/store.js";
import { criarTopico } from "./gestorTopicos.js";
import { criarObjectivo } from "./gestorObjectivo.js";
import {
  activarEnvelopeParaChave,
  aplicarResultadoGestaoObjectivoPersistente,
  aplicarResultadoGestaoTopicosPersistente,
  limparEnvelopeActual,
  obterChaveEnvelopeActual,
  reiniciarEnvelopeSessaoParaTestes
} from "./envelopeSessaoCoa.js";
import {
  carregarBucketEnvelope,
  limparDocumentoEnvelope
} from "./persistenciaEnvelopeSessao.js";
import { executiveEngine } from "../executiveEngine/index.js";
import { resetStoreContinuidadePadrao } from "../continuidadeGate/integracaoConversa.js";
import { obterEstadoTopicosSessao } from "./topicosSessao.js";
import { obterEstadoObjectivoSessao } from "./objectivoSessao.js";

const ISO = "2026-09-08T12:00:00.000Z";

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

function resetAmbiente() {
  globalThis.localStorage = criarStorage();
  gravarDocumento({
    versao: VERSAO,
    projetoAtivoId: null,
    empresaAtivaId: null,
    empresas: [],
    projetos: [],
    gabinete: {}
  });
  recarregarCatalogo();
  reiniciarStoreConversaParaTestes();
  reiniciarEnvelopeSessaoParaTestes();
  limparDocumentoEnvelope();
  resetStoreContinuidadePadrao();
  inicializarCatalogo();
}

function simularRefreshPreservandoDisco() {
  const rawEnv = globalThis.localStorage.getItem("ceo.conversa.envelope.v2");
  const rawChat = globalThis.localStorage.getItem("ceo.conversa.transcript.v2");
  const rawGab = globalThis.localStorage.getItem("ceo.onda01.gabinete.v1");
  descartarHistoricosEmMemoria();
  recarregarCatalogo();
  if (rawGab) globalThis.localStorage.setItem("ceo.onda01.gabinete.v1", rawGab);
  if (rawChat) {
    globalThis.localStorage.setItem("ceo.conversa.transcript.v2", rawChat);
  }
  if (rawEnv) {
    globalThis.localStorage.setItem("ceo.conversa.envelope.v2", rawEnv);
  }
  descartarHistoricosEmMemoria();
  inicializarCatalogo();
}

function semearEnvelopeOutdoor() {
  const top = criarTopico("outdoor", "usuario", ISO);
  const pausa = criarTopico("pagamento", "usuario", ISO);
  aplicarResultadoGestaoTopicosPersistente({
    commitEstado: true,
    topicoActivo: top,
    pausas: [pausa],
    evento: "continuar",
    razaoTopico: "teste F5-C4"
  });
  const obj = criarObjectivo("priorizar outdoor na campanha", "usuario", ISO);
  const ant = criarObjectivo("decidir pagamento", "usuario", ISO);
  aplicarResultadoGestaoObjectivoPersistente({
    commitEstado: true,
    objetivoActivo: obj,
    objetivoAnterior: ant,
    evento: "estabelecer",
    razaoObjectivo: "teste F5-C4"
  });
}

beforeEach(() => {
  resetAmbiente();
});

test("F5-C4: refresh recupera tópico, pausas e objectivo do COA", () => {
  const a = criarProjeto({ nome: "COA F5-C4 Alfa" });
  assert.equal(obterChaveEnvelopeActual(), a.id);
  semearEnvelopeOutdoor();

  assert.equal(obterEstadoTopicosSessao().topicoActivo?.ancora, "outdoor");
  assert.equal(obterEstadoTopicosSessao().pausas[0]?.ancora, "pagamento");
  assert.match(
    obterEstadoObjectivoSessao().objetivoActivo?.enunciado || "",
    /outdoor/i
  );

  const disco = carregarBucketEnvelope(a.id);
  assert.equal(disco.topicos.topicoActivo?.ancora, "outdoor");
  assert.equal(disco.objectivo.objetivoActivo?.enunciado.includes("outdoor"), true);

  simularRefreshPreservandoDisco();
  assert.equal(obterProjetoAtivoId(), a.id);
  assert.equal(obterEstadoTopicosSessao().topicoActivo?.ancora, "outdoor");
  assert.equal(obterEstadoTopicosSessao().pausas.length, 1);
  assert.equal(obterEstadoTopicosSessao().pausas[0].ancora, "pagamento");
  assert.match(
    obterEstadoObjectivoSessao().objetivoActivo?.enunciado || "",
    /outdoor/i
  );
  assert.match(
    obterEstadoObjectivoSessao().objetivoAnterior?.enunciado || "",
    /pagamento/i
  );
});

test("F5-C4: isolamento A/B e retorno a A", () => {
  const a = criarProjeto({ nome: "COA F5-C4 A" });
  semearEnvelopeOutdoor();

  const b = criarProjeto({ nome: "COA F5-C4 B" });
  assert.equal(obterChaveEnvelopeActual(), b.id);
  assert.equal(obterEstadoTopicosSessao().topicoActivo, null);
  assert.equal(obterEstadoObjectivoSessao().objetivoActivo, null);

  aplicarResultadoGestaoTopicosPersistente({
    commitEstado: true,
    topicoActivo: criarTopico("bugs / erros", "usuario", ISO),
    pausas: [],
    evento: "continuar",
    razaoTopico: "B"
  });
  aplicarResultadoGestaoObjectivoPersistente({
    commitEstado: true,
    objetivoActivo: criarObjectivo("corrigir bugs críticos", "usuario", ISO),
    objetivoAnterior: null,
    evento: "estabelecer",
    razaoObjectivo: "B"
  });

  selecionarProjeto(a.id);
  assert.equal(obterEstadoTopicosSessao().topicoActivo?.ancora, "outdoor");
  assert.match(
    obterEstadoObjectivoSessao().objetivoActivo?.enunciado || "",
    /outdoor/i
  );

  selecionarProjeto(b.id);
  assert.equal(obterEstadoTopicosSessao().topicoActivo?.ancora, "bugs / erros");
  assert.match(
    obterEstadoObjectivoSessao().objetivoActivo?.enunciado || "",
    /bugs/i
  );
});

test("F5-C4: encerramento explícito limpa runtime + disco; refresh não reaparece", async () => {
  const a = criarProjeto({ nome: "COA F5-C4 Encerrar" });
  semearEnvelopeOutdoor();
  assert.ok(carregarBucketEnvelope(a.id).topicos.topicoActivo);

  const out = await executiveEngine.executar(
    "Encerre completamente o tópico anterior",
    { storeContinuidade: resetStoreContinuidadePadrao() }
  );
  assert.equal(out.ok, true);
  assert.equal(obterEstadoTopicosSessao().topicoActivo, null);
  assert.equal(obterEstadoObjectivoSessao().objetivoActivo, null);
  assert.equal(carregarBucketEnvelope(a.id).topicos.topicoActivo, null);
  assert.equal(carregarBucketEnvelope(a.id).objectivo.objetivoActivo, null);

  simularRefreshPreservandoDisco();
  assert.equal(obterEstadoTopicosSessao().topicoActivo, null);
  assert.equal(obterEstadoObjectivoSessao().objetivoActivo, null);
});

test("F5-C4: limparEnvelopeActual remove persistência da chave activa", () => {
  const a = criarProjeto({ nome: "COA F5-C4 Limpar" });
  semearEnvelopeOutdoor();
  limparEnvelopeActual();
  assert.equal(obterEstadoTopicosSessao().topicoActivo, null);
  assert.deepEqual(carregarBucketEnvelope(a.id), {
    topicos: { topicoActivo: null, pausas: [] },
    objectivo: { objetivoActivo: null, objetivoAnterior: null }
  });
});
