/**
 * FASE 3 — Âncoras de empresa (E1–E22).
 */
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { test, beforeEach } from "node:test";
import {
  ID_EMPRESA_PATROCINADOR,
  criarEmpresa,
  criarProjeto,
  inicializarCatalogo,
  obterEmpresaAtivaId,
  obterProjetoAtivoId,
  recarregarCatalogo,
  selecionarProjeto
} from "../catalogoProjetos/index.js";
import {
  detectarAncoraEmpresa,
  temAncoraExplicitaProjeto
} from "../classificadorIntencao/ancoraEmpresa.js";
import { classificar } from "../classificadorIntencao/regras.js";
import {
  classificarIntencao,
  mapearCapacidadePorTexto,
  resolverMetadadosContexto
} from "../executiveEngine/classificar.js";
import { capacidadeEmpresas } from "../executiveEngine/capacidades/empresas.js";
import { capacidadeProjetos } from "../executiveEngine/capacidades/projetos.js";
import {
  definirCoaAtivo,
  obterCoaAtivo,
  obterEmpresaAtiva
} from "../executiveEngine/coaSessao.js";
import { executiveEngine } from "../executiveEngine/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP_ROOT = path.resolve(__dirname, "../..");

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

function reset() {
  globalThis.localStorage = criarStorage();
  recarregarCatalogo();
  inicializarCatalogo();
  executiveEngine.inicializar();
}

beforeEach(() => {
  reset();
});

function snapshotContexto() {
  return {
    empresaId: obterEmpresaAtivaId(),
    projetoId: obterProjetoAtivoId()
  };
}

function assertSemWrite(antes) {
  assert.equal(obterEmpresaAtivaId(), antes.empresaId);
  assert.equal(obterProjetoAtivoId(), antes.projetoId);
}

test("E1: «fale sobre a AlfaTech» — sem WRITE", async () => {
  criarEmpresa({ nome: "AlfaTech" });
  selecionarProjeto("prj-mg2");
  const antes = snapshotContexto();
  assert.equal(detectarAncoraEmpresa("fale sobre a AlfaTech"), null);
  await capacidadeEmpresas.executar({ instrucao: "fale sobre a AlfaTech" });
  assertSemWrite(antes);
  assert.notEqual(
    resolverMetadadosContexto("fale sobre a AlfaTech").acaoContexto,
    "trocar"
  );
});

test("E2: menção incidental «AlfaTech» — sem WRITE", async () => {
  criarEmpresa({ nome: "AlfaTech" });
  selecionarProjeto("prj-mg2");
  const antes = snapshotContexto();
  assert.equal(detectarAncoraEmpresa("AlfaTech"), null);
  await capacidadeEmpresas.executar({ instrucao: "AlfaTech" });
  assertSemWrite(antes);
});

test("E3: menção incidental MG2 — sem WRITE (CTO-003.1)", async () => {
  const alfa = criarProjeto({ nome: "PROJETO TESTE ALFA E3" });
  const antes = snapshotContexto();
  await capacidadeProjetos.executar({
    instrucao: "Continuo no ALFA; Motoboy Game 2 / MG2 só referência.",
    memoria: () => ({ projetoAtivo: { id: alfa.id, nome: alfa.nome } })
  });
  assert.equal(obterProjetoAtivoId(), alfa.id);
  assert.equal(obterEmpresaAtivaId(), antes.empresaId);
});

test("E4: «empresa AlfaTech» sem verbo — sem WRITE", async () => {
  criarEmpresa({ nome: "AlfaTech" });
  selecionarProjeto("prj-mg2");
  const antes = snapshotContexto();
  assert.equal(detectarAncoraEmpresa("empresa AlfaTech"), null);
  await capacidadeEmpresas.executar({ instrucao: "empresa AlfaTech" });
  assertSemWrite(antes);
});

test("E5: «a AlfaTech» — sem WRITE", async () => {
  criarEmpresa({ nome: "AlfaTech" });
  selecionarProjeto("prj-mg2");
  const antes = snapshotContexto();
  assert.equal(detectarAncoraEmpresa("a AlfaTech"), null);
  assertSemWrite(antes);
});

test("E6: «abrir empresa AlfaTech» — WRITE empresa", async () => {
  const emp = criarEmpresa({ nome: "AlfaTech" });
  selecionarProjeto("prj-mg2");
  assert.equal(obterEmpresaAtivaId(), ID_EMPRESA_PATROCINADOR);
  const ancora = detectarAncoraEmpresa("abrir empresa AlfaTech");
  assert.equal(ancora?.tipo, "trocar_empresa");
  assert.equal(ancora?.ref, "AlfaTech");
  await capacidadeEmpresas.executar({ instrucao: "abrir empresa AlfaTech" });
  assert.equal(obterEmpresaAtivaId(), emp.id);
  assert.equal(obterCoaAtivo(), null);
});

test("E7: «ativar a empresa» / «trocar para a empresa» / «selecionar»", async () => {
  const beta = criarEmpresa({ nome: "BetaCorp" });
  criarProjeto({ nome: "Beta Ops" });
  selecionarProjeto("prj-mg2");

  await capacidadeEmpresas.executar({
    instrucao: "ativar a empresa BetaCorp"
  });
  assert.equal(obterEmpresaAtivaId(), beta.id);

  const alfa = criarEmpresa({ nome: "AlfaTech" });
  await capacidadeEmpresas.executar({
    instrucao: "trocar para a empresa AlfaTech"
  });
  assert.equal(obterEmpresaAtivaId(), alfa.id);

  await capacidadeEmpresas.executar({
    instrucao: "selecionar empresa BetaCorp"
  });
  assert.equal(obterEmpresaAtivaId(), beta.id);
});

test("E8: «abrir projeto X» — WRITE projeto", async () => {
  const p = criarProjeto({ nome: "Projeto X E8" });
  selecionarProjeto("prj-mg2");
  await capacidadeProjetos.executar({ instrucao: "abrir projeto Projeto X E8" });
  assert.equal(obterProjetoAtivoId(), p.id);
});

test("E9: «trocar para projeto X» — WRITE projeto", async () => {
  const p = criarProjeto({ nome: "Projeto Y E9" });
  selecionarProjeto("prj-mg2");
  await capacidadeProjetos.executar({
    instrucao: "trocar para projeto Projeto Y E9"
  });
  assert.equal(obterProjetoAtivoId(), p.id);
});

test("E10: empresa + projeto explícitos → projeto vence", async () => {
  const empA = criarEmpresa({ nome: "Empresa A" });
  const pA = criarProjeto({ nome: "Proj A" });
  criarEmpresa({ nome: "Empresa B" });
  criarProjeto({ nome: "Proj B" });
  selecionarProjeto(pA.id);
  assert.equal(obterEmpresaAtivaId(), empA.id);

  const frase =
    "abrir empresa Empresa B e abrir projeto Proj A";
  assert.ok(detectarAncoraEmpresa(frase));
  assert.ok(temAncoraExplicitaProjeto(frase));
  const mapa = mapearCapacidadePorTexto(frase);
  assert.equal(mapa.capacidade, "projetos");

  await capacidadeProjetos.executar({ instrucao: frase });
  assert.equal(obterProjetoAtivoId(), pA.id);
  assert.equal(obterEmpresaAtivaId(), empA.id);

  // capacidade empresas com ambas âncoras: não força empresa B (projecto vence)
  await capacidadeEmpresas.executar({ instrucao: frase });
  assert.equal(obterEmpresaAtivaId(), empA.id);
  assert.equal(obterProjetoAtivoId(), pA.id);
});

test("E11: empresa sem projetos → coaAtivo null", async () => {
  criarEmpresa({ nome: "Vazia E11" });
  await capacidadeEmpresas.executar({
    instrucao: "abrir empresa Vazia E11"
  });
  assert.ok(obterEmpresaAtiva());
  assert.match(obterEmpresaAtiva().nome, /Vazia E11/);
  assert.equal(obterCoaAtivo(), null);
  assert.equal(obterProjetoAtivoId(), null);
});

test("E12: projeto de outra empresa → empresa sincronizada", async () => {
  const outra = criarEmpresa({ nome: "Outra Emp" });
  const p = criarProjeto({ nome: "Proj Outra" });
  selecionarProjeto("prj-mg2");
  assert.equal(obterEmpresaAtivaId(), ID_EMPRESA_PATROCINADOR);
  definirCoaAtivo({ nome: "Proj Outra" });
  assert.equal(obterProjetoAtivoId(), p.id);
  assert.equal(obterEmpresaAtivaId(), outra.id);
});

test("E13: «o projeto AlfaTech está atrasado» — sem WRITE", async () => {
  criarEmpresa({ nome: "AlfaTech" });
  selecionarProjeto("prj-mg2");
  const antes = snapshotContexto();
  assert.equal(
    detectarAncoraEmpresa("o projeto AlfaTech está atrasado"),
    null
  );
  await capacidadeEmpresas.executar({
    instrucao: "o projeto AlfaTech está atrasado"
  });
  await capacidadeProjetos.executar({
    instrucao: "o projeto AlfaTech está atrasado"
  });
  assertSemWrite(antes);
  const meta = resolverMetadadosContexto("o projeto AlfaTech está atrasado");
  assert.equal(meta.alvoContexto, "projeto");
  assert.equal(meta.acaoContexto, "consultar");
});

test("E14: «qual é o estado do projeto X?» — sem WRITE", async () => {
  const p = criarProjeto({ nome: "Projeto X E14" });
  selecionarProjeto("prj-mg2");
  const antes = snapshotContexto();
  await capacidadeProjetos.executar({
    instrucao: "qual é o estado do projeto Projeto X E14?"
  });
  assertSemWrite(antes);
  assert.notEqual(obterProjetoAtivoId(), p.id);
});

test("E15: «decida pela empresa» — sem WRITE", async () => {
  criarEmpresa({ nome: "AlfaTech" });
  selecionarProjeto("prj-mg2");
  const antes = snapshotContexto();
  const meta = resolverMetadadosContexto("decida pela empresa");
  assert.equal(meta.acaoContexto, "decidir");
  assert.equal(detectarAncoraEmpresa("decida pela empresa"), null);
  const intencao = classificarIntencao("decida pela empresa");
  assert.notEqual(intencao.capacidade, "empresas");
  assertSemWrite(antes);
});

test("E16: «decida no projeto X» — sem WRITE", async () => {
  criarProjeto({ nome: "Projeto X E16" });
  selecionarProjeto("prj-mg2");
  const antes = snapshotContexto();
  const meta = resolverMetadadosContexto("decida no projeto Projeto X E16");
  assert.equal(meta.acaoContexto, "decidir");
  await capacidadeProjetos.executar({
    instrucao: "decida no projeto Projeto X E16"
  });
  assertSemWrite(antes);
});

test("E17: fuzzy rejeitado («Acme» ↛ «Acme Exact»)", async () => {
  criarEmpresa({ nome: "Acme Exact" });
  selecionarProjeto("prj-mg2");
  assert.equal(obterEmpresaAtivaId(), ID_EMPRESA_PATROCINADOR);
  await capacidadeEmpresas.executar({ instrucao: "abrir empresa Acme" });
  assert.equal(obterEmpresaAtivaId(), ID_EMPRESA_PATROCINADOR);
});

test("E18: exact case-insensitive aceite", async () => {
  const emp = criarEmpresa({ nome: "AlfaTech" });
  selecionarProjeto("prj-mg2");
  await capacidadeEmpresas.executar({
    instrucao: "abrir empresa alfatech"
  });
  assert.equal(obterEmpresaAtivaId(), emp.id);
});

test("E19: regressão decisão > E4", () => {
  const ficheiros = [
    "src/classificadorIntencao/p1-precedencia-decisao-sobre-e4.test.js",
    "src/executiveEngine/p1-decisao-sob-conflito.test.js"
  ];
  const r = spawnSync(process.execPath, ["--test", ...ficheiros], {
    cwd: APP_ROOT,
    encoding: "utf8"
  });
  assert.equal(r.status, 0, r.stdout + r.stderr);
});

test("E20: smoke P1-2 / CN / lastro COA / FASE1 / FASE2", () => {
  const ficheiros = [
    "src/executiveEngine/p1-ordem-p12-vs-decisao.test.js",
    "src/executiveEngine/p1-2-analise-deliberativa.test.js",
    "src/conversacaoNatural/p1-cn-fecho-decisorio.test.js",
    "src/executiveEngine/p1-lastro-normativo-coa.test.js",
    "src/catalogoProjetos/p1-empresa-fase1-catalogo.test.js",
    "src/executiveEngine/p2-empresa-sessao-contexto.test.js"
  ];
  const r = spawnSync(process.execPath, ["--test", ...ficheiros], {
    cwd: APP_ROOT,
    encoding: "utf8"
  });
  assert.equal(r.status, 0, r.stdout + r.stderr);
});

test("E21: braço curto «empresa …» sem WRITE", async () => {
  criarEmpresa({ nome: "AlfaTech" });
  selecionarProjeto("prj-mg2");
  const antes = snapshotContexto();
  const mapa = mapearCapacidadePorTexto("empresa AlfaTech");
  assert.equal(mapa.capacidade, "empresas");
  assert.equal(mapa.id, "consultar_empresa");
  assert.equal(detectarAncoraEmpresa("empresa AlfaTech"), null);
  await capacidadeEmpresas.executar({ instrucao: "empresa AlfaTech" });
  assertSemWrite(antes);
});

test("E22: E2.3 identidade — não troca", async () => {
  criarEmpresa({ nome: "AlfaTech" });
  selecionarProjeto("prj-mg2");
  const antes = snapshotContexto();
  const texto = "Qual é o seu papel nesta empresa?";
  const saida = classificar(texto);
  assert.equal(saida.classe, "conversa_projeto");
  assert.equal(detectarAncoraEmpresa(texto), null);
  await capacidadeEmpresas.executar({ instrucao: texto });
  assertSemWrite(antes);
});
