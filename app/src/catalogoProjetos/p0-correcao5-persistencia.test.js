/**
 * Correção 5 — persistência durable do catálogo com read-after-write e falha explícita.
 */
import assert from "node:assert/strict";
import { test, beforeEach } from "node:test";
import {
  STORAGE_KEY,
  VERSAO,
  gravarDocumento,
  carregarDocumento,
  ErroPersistenciaCatalogo
} from "./persistencia.js";
import {
  criarProjeto,
  listarProjetos,
  obterProjetoAtivo,
  selecionarProjeto,
  recarregarCatalogo,
  inicializarCatalogo
} from "./index.js";
import {
  extrairNomeProjetoNovaMissao,
  garantirProjetoParaNovaMissao
} from "../executiveEngine/garantirProjetoNovaMissao.js";
import {
  ehReferenciaExplicitaJobId,
  ehAutorizacaoExplicitaCriarJob,
  classificar,
  normalizarTexto
} from "../classificadorIntencao/regras.js";
import {
  extrairObjectivoRealParaJob,
  conduzirTrabalhoExecutivoC3
} from "../classificadorIntencao/integracaoNucleo.js";

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

/** Após hidratar, setItem da chave oficial passa a falhar (getItem continua). */
function armarFalhaEscritaCatalogo() {
  const s = globalThis.localStorage;
  const orig = s.setItem.bind(s);
  s.setItem = (k, v) => {
    if (String(k) === STORAGE_KEY) {
      throw new Error("QuotaExceededError(simulado)");
    }
    return orig(k, v);
  };
  return () => {
    s.setItem = orig;
  };
}

function resetCatalogoComStorage(storage) {
  globalThis.localStorage = storage;
  recarregarCatalogo();
  inicializarCatalogo();
}

beforeEach(() => {
  resetCatalogoComStorage(criarStorage());
});

test("A: criarProjeto com localStorage — persiste e sobrevive a nova leitura", () => {
  const criado = criarProjeto({ nome: "PROJETO TESTE GAMMA" });
  assert.ok(criado && criado.id);
  assert.equal(criado.nome, "PROJETO TESTE GAMMA");

  const raw = globalThis.localStorage.getItem(STORAGE_KEY);
  assert.ok(raw);
  const noDisk = JSON.parse(raw);
  assert.equal(noDisk.versao, VERSAO);
  assert.ok(noDisk.projetos.some((p) => p.id === criado.id));
  assert.equal(noDisk.projetoAtivoId, criado.id);

  recarregarCatalogo();
  const activo = obterProjetoAtivo();
  assert.equal(activo.id, criado.id);
  assert.equal(activo.nome, "PROJETO TESTE GAMMA");
  assert.equal(
    listarProjetos().filter((p) => p.nome === "PROJETO TESTE GAMMA").length,
    1
  );
});

test("B: setItem falha — criarProjeto NÃO retorna sucesso; erro propagado", () => {
  const alfa = criarProjeto({ nome: "PROJETO TESTE ALFA" });
  assert.equal(obterProjetoAtivo().id, alfa.id);

  const restaurar = armarFalhaEscritaCatalogo();
  try {
    assert.throws(
      () => criarProjeto({ nome: "PROJETO TESTE BETA" }),
      (err) =>
        err instanceof ErroPersistenciaCatalogo ||
        (err && err.name === "ErroPersistenciaCatalogo")
    );
  } finally {
    restaurar();
  }

  assert.equal(
    listarProjetos().some((p) => p.nome === "PROJETO TESTE BETA"),
    false
  );
  assert.equal(obterProjetoAtivo().id, alfa.id);

  const lido = carregarDocumento();
  assert.ok(lido);
  assert.equal(
    lido.projetos.some((p) => p.nome === "PROJETO TESTE BETA"),
    false
  );
  assert.equal(lido.projetoAtivoId, alfa.id);
});

test("C: documento antigo + falha de escrita — antigo permanece; create falha", () => {
  const antigo = criarProjeto({ nome: "PROJETO ANTIGO" });
  const restaurar = armarFalhaEscritaCatalogo();
  try {
    assert.throws(() => criarProjeto({ nome: "PROJETO NOVO FANTASMA" }));
  } finally {
    restaurar();
  }

  assert.equal(obterProjetoAtivo().id, antigo.id);
  assert.equal(obterProjetoAtivo().nome, "PROJETO ANTIGO");
  assert.equal(
    listarProjetos().some((p) => p.nome === "PROJETO NOVO FANTASMA"),
    false
  );
  const lido = carregarDocumento();
  assert.equal(lido.projetoAtivoId, antigo.id);
});

test("D: seleccionar projecto existente continua a funcionar", () => {
  const a = criarProjeto({ nome: "PROJETO A" });
  const b = criarProjeto({ nome: "PROJETO B" });
  assert.equal(obterProjetoAtivo().id, b.id);
  selecionarProjeto(a.id);
  assert.equal(obterProjetoAtivo().id, a.id);
  recarregarCatalogo();
  assert.equal(obterProjetoAtivo().id, a.id);
});

test("E: criar projecto existente — não duplica; selecciona", () => {
  const p1 = criarProjeto({ nome: "PROJETO UNICO" });
  const p2 = criarProjeto({ nome: "PROJETO UNICO" });
  assert.equal(p1.id, p2.id);
  assert.equal(
    listarProjetos().filter((p) => p.nome === "PROJETO UNICO").length,
    1
  );
});

test("F: Correção 4 — detecção de nova missão + create durable", () => {
  const msg =
    "Quero iniciar uma nova missão no PROJETO TESTE BETA. Execute essa missão.";
  assert.equal(extrairNomeProjetoNovaMissao(msg), "PROJETO TESTE BETA");
  const g = garantirProjetoParaNovaMissao(msg);
  assert.equal(g.aplicado, true);
  assert.equal(g.criado, true);
  assert.equal(g.projeto.nome, "PROJETO TESTE BETA");
  recarregarCatalogo();
  assert.equal(obterProjetoAtivo().nome, "PROJETO TESTE BETA");
});

test("B2: C3 com falha de persistência — não cria Job", async () => {
  criarProjeto({ nome: "Motoboy Game 2 Extra" });
  const restaurar = armarFalhaEscritaCatalogo();
  let motorChamado = false;
  try {
    const out = await conduzirTrabalhoExecutivoC3(
      "Quero iniciar uma nova missão no PROJETO TESTE BETA. Criar ficheiro x.txt. Execute.",
      { classe: "trabalho_executivo", confianca: 0.95, razaoCurta: "c3" },
      {
        conduzirMotor: async () => {
          motorChamado = true;
          return { publicado: true, job: { id: "JOB-X" }, fluxoIniciado: true };
        }
      }
    );
    assert.equal(out.ok, false);
    assert.equal(out.modo, "falha_persistencia_projeto");
    assert.equal(motorChamado, false);
    assert.match(out.mensagem, /persist/i);
  } finally {
    restaurar();
  }
});

test("G: Correções 1–3 sem regressão unitária", () => {
  const t = normalizarTexto("Despache o JOB-000075");
  assert.equal(ehReferenciaExplicitaJobId(t), true);
  assert.equal(ehAutorizacaoExplicitaCriarJob(t), false);

  const obj = extrairObjectivoRealParaJob(
    "Crie o Job necessário para criar o ficheiro x.txt. Não execute ainda."
  );
  assert.match(obj, /ficheiro|arquivo|x\.txt/i);

  const s = classificar(
    "Quero iniciar uma nova missão independente do PROJETO TESTE ALFA.\nExecute essa missão: criar o ficheiro a.txt com OK."
  );
  assert.equal(s.classe, "trabalho_executivo");
});

test("H: gravarDocumento com RAW confirma payload idêntico", () => {
  const doc = {
    versao: VERSAO,
    projetoAtivoId: "prj-x",
    gabinete: { rotaId: "dashboard", atualizadoEm: "2026-01-01T00:00:00.000Z" },
    projetos: [{ id: "prj-x", nome: "X", estado: "ativo" }]
  };
  const r = gravarDocumento(doc);
  assert.equal(r.ok, true);
  assert.equal(r.medium, "localStorage");
  const raw = globalThis.localStorage.getItem(STORAGE_KEY);
  assert.equal(raw, JSON.stringify({ ...doc, versao: VERSAO }));
});
