/**
 * FASE 2 — Espelho de sessão: empresaAtiva ao lado de coaAtivo (S1–S12).
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
  obterEmpresaAtivaId,
  obterProjetoAtivo,
  obterProjetoAtivoId,
  recarregarCatalogo,
  inicializarCatalogo,
  selecionarProjeto
} from "../catalogoProjetos/index.js";
import {
  comoCoa,
  definirCoaAtivo,
  definirEmpresaAtiva,
  inicializarCoaSessao,
  limparCoaAtivo,
  obterCoaAtivo,
  obterEmpresaAtiva,
  obterEmpresaAtivaSessao
} from "./coaSessao.js";
import { construirContextoSessao } from "./contextoSessao.js";
import { executiveEngine } from "./index.js";
import { capacidadeProjetos } from "./capacidades/projetos.js";

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
  inicializarCoaSessao();
}

function assertCoerenciaSessao() {
  const emp = obterEmpresaAtiva();
  const coa = obterCoaAtivo();
  assert.ok(emp, "empresaAtiva deve existir após FASE 1");
  assert.equal(emp.id, obterEmpresaAtivaId());
  if (coa) {
    assert.equal(coa.empresaId, emp.id);
  } else {
    assert.equal(obterProjetoAtivoId(), null);
  }
}

beforeEach(() => {
  reset();
});

test("S1: Seed inicial — emp-patrocinador + prj-mg2 coerentes", () => {
  const emp = obterEmpresaAtiva();
  const coa = obterCoaAtivo();
  assert.equal(emp?.id, ID_EMPRESA_PATROCINADOR);
  assert.equal(coa?.id, "prj-mg2");
  assert.equal(coa?.empresaId, emp.id);
  assert.deepEqual(obterEmpresaAtivaSessao(), emp);
  assertCoerenciaSessao();
});

test("S2: Seleção de projeto de outra empresa atualiza empresa", () => {
  const outra = criarEmpresa({ nome: "Delta Corp FASE2" });
  const pOutro = criarProjeto({ nome: "Projeto Delta FASE2" });
  assert.equal(pOutro.empresaId, outra.id);
  assert.equal(obterEmpresaAtiva()?.id, outra.id);
  assert.equal(obterCoaAtivo()?.id, pOutro.id);

  selecionarProjeto("prj-mg2");
  assert.equal(obterEmpresaAtiva()?.id, ID_EMPRESA_PATROCINADOR);
  assert.equal(obterCoaAtivo()?.id, "prj-mg2");

  const coa = definirCoaAtivo({ nome: "Projeto Delta FASE2" });
  assert.equal(coa?.id, pOutro.id);
  assert.equal(obterEmpresaAtiva()?.id, outra.id);
  assert.equal(coa.empresaId, outra.id);
  assertCoerenciaSessao();
});

test("S3: Seleção de empresa preserva ou realinha projeto", () => {
  const outra = criarEmpresa({ nome: "Beta Org FASE2" });
  const pBeta = criarProjeto({ nome: "Beta Ops" });
  selecionarProjeto("prj-mg2");
  assert.equal(obterCoaAtivo()?.id, "prj-mg2");

  definirEmpresaAtiva({ id: outra.id });
  assert.equal(obterEmpresaAtiva()?.id, outra.id);
  assert.equal(obterCoaAtivo()?.id, pBeta.id);
  assert.equal(obterCoaAtivo()?.empresaId, outra.id);

  definirEmpresaAtiva({ nome: "Patrocinador" });
  assert.equal(obterEmpresaAtiva()?.id, ID_EMPRESA_PATROCINADOR);
  assert.ok(obterCoaAtivo());
  assert.equal(obterCoaAtivo().empresaId, ID_EMPRESA_PATROCINADOR);
  assertCoerenciaSessao();
});

test("S4: Empresa sem projetos → empresaAtiva ok e coaAtivo null", () => {
  criarEmpresa({ nome: "Vazia Sem Projetos" });
  const emp = obterEmpresaAtiva();
  assert.ok(emp);
  assert.match(emp.nome, /Vazia Sem Projetos/i);
  assert.equal(obterCoaAtivo(), null);
  assert.equal(obterProjetoAtivo(), null);
  assert.equal(limparCoaAtivo(), null);
  assertCoerenciaSessao();
});

test("S5: Painel contém Empresa + Projeto", () => {
  const painel = construirContextoSessao({ memoria: {}, intencao: { id: "n/d" } });
  assert.match(painel, /Empresa ativa:\s*Patrocinador\s*\(emp-patrocinador,/);
  assert.match(painel, /Projeto ativo:\s*Motoboy Game 2\s*\(prj-mg2,/);
  const idxEmp = painel.indexOf("Empresa ativa:");
  const idxPrj = painel.indexOf("Projeto ativo:");
  assert.ok(idxEmp >= 0 && idxPrj > idxEmp);
});

test("S6: Painel de empresa sem projetos", () => {
  criarEmpresa({ nome: "Orphan Co" });
  const painel = construirContextoSessao({ memoria: {} });
  assert.match(painel, /Empresa ativa:\s*Orphan Co/);
  assert.match(painel, /Projeto ativo:\s*\(nenhum\)/);
});

test("S7: Invariante empresa/projeto após trocas", () => {
  const e2 = criarEmpresa({ nome: "Empresa Dois" });
  const p2 = criarProjeto({ nome: "P2" });
  const e3 = criarEmpresa({ nome: "Empresa Tres" });
  const p3 = criarProjeto({ nome: "P3" });

  definirCoaAtivo({ id: p2.id });
  assertCoerenciaSessao();
  assert.equal(obterEmpresaAtiva().id, e2.id);

  definirEmpresaAtiva({ id: e3.id });
  assertCoerenciaSessao();
  assert.equal(obterCoaAtivo().id, p3.id);

  definirEmpresaAtiva({ nome: "empresa dois" });
  assertCoerenciaSessao();
  assert.equal(obterCoaAtivo().id, p2.id);
});

test("S8: Shape de comoCoa — campos operacionais + empresaId FK", () => {
  const p = obterProjetoAtivo();
  const coa = comoCoa(p);
  assert.equal(coa.id, p.id);
  assert.equal(coa.nome, p.nome);
  assert.equal(coa.status, p.estado || "ativo");
  assert.ok(coa.desde);
  assert.equal(coa.empresaId, p.empresaId);
  assert.equal(comoCoa(null), null);

  const viaObter = obterCoaAtivo();
  assert.equal(viaObter.empresaId, ID_EMPRESA_PATROCINADOR);
  assert.ok(!("estado" in viaObter));
});

test("S9: Seleção de empresa por ID/nome exacto, sem fuzzy", () => {
  criarEmpresa({ nome: "Acme Exact" });
  selecionarProjeto("prj-mg2");

  const porId = definirEmpresaAtiva({ id: obterEmpresaAtivaId() });
  assert.ok(porId);

  definirEmpresaAtiva({ nome: "acme exact" });
  assert.equal(obterEmpresaAtiva()?.nome, "Acme Exact");

  const fuzzy = definirEmpresaAtiva({ nome: "Acme" });
  assert.equal(obterEmpresaAtiva()?.nome, "Acme Exact");
  assert.ok(fuzzy);
  assert.equal(fuzzy.nome, "Acme Exact");

  const miss = definirEmpresaAtiva({ nome: "Acme Exact Extra" });
  assert.equal(miss?.nome, "Acme Exact");
});

test("S10: contextoCapacidade expõe empresaAtiva passivamente", () => {
  executiveEngine.inicializar();
  const ctx = executiveEngine.montarContextoCapacidade({
    texto: "ping",
    historico: [],
    intencao: { id: "consulta" }
  });
  assert.ok(ctx.empresaAtiva);
  assert.equal(ctx.empresaAtiva.id, ID_EMPRESA_PATROCINADOR);
  assert.equal(ctx.empresaAtiva.nome, obterEmpresaAtiva().nome);
  assert.ok(ctx.coaAtivo);
  assert.equal(ctx.coaAtivo.id, "prj-mg2");

  const ctxSemCoa = executiveEngine.montarContextoCapacidade({
    texto: "ping",
    historico: [],
    intencao: { id: "consulta" },
    coaAtivo: null
  });
  assert.equal(ctxSemCoa.coaAtivo, null);
  assert.equal(ctxSemCoa.empresaAtiva?.id, ID_EMPRESA_PATROCINADOR);
});

test("S11: Regressão CTO-003.1/P1 — menção incidental não troca projecto", async () => {
  const alfa = criarProjeto({ nome: "PROJETO TESTE ALFA FASE2" });
  assert.equal(obterProjetoAtivoId(), alfa.id);
  const empAntes = obterEmpresaAtiva()?.id;

  const out = await capacidadeProjetos.executar({
    instrucao:
      "Continuo no ALFA; Motoboy Game 2 / MG2 / motoboy só como referência.",
    memoria: () => ({
      projetoAtivo: { id: alfa.id, nome: alfa.nome },
      projetosAtivos: [{ id: alfa.id, nome: alfa.nome }],
      decisoes: [],
      pendencias: [],
      proximasAcoes: [],
      ultimasAcoes: [],
      proximoPasso: null
    })
  });
  assert.equal(out.ok, true);
  assert.equal(obterProjetoAtivoId(), alfa.id);
  assert.equal(obterCoaAtivo()?.id, alfa.id);
  assert.equal(obterEmpresaAtiva()?.id, empAntes);
  assertCoerenciaSessao();
});

test("S12: Smoke suítes decisão / E4 / P1-2 / CN / lastro COA / catálogo", () => {
  const ficheiros = [
    "src/catalogoProjetos/p1-empresa-fase1-catalogo.test.js",
    "src/catalogoProjetos/p0-cto0031-anti-regressao-contexto.test.js",
    "src/executiveEngine/capacidades/p1-cto0031-ancora-explicita-projetos.test.js",
    "src/executiveEngine/p1-decisao-sob-conflito.test.js",
    "src/classificadorIntencao/p1-precedencia-decisao-sobre-e4.test.js",
    "src/executiveEngine/p1-ordem-p12-vs-decisao.test.js",
    "src/executiveEngine/p1-2-analise-deliberativa.test.js",
    "src/conversacaoNatural/p1-cn-fecho-decisorio.test.js",
    "src/executiveEngine/p1-lastro-normativo-coa.test.js"
  ];
  const r = spawnSync(process.execPath, ["--test", ...ficheiros], {
    cwd: APP_ROOT,
    encoding: "utf8",
    env: process.env
  });
  assert.equal(
    r.status,
    0,
    `S12 smoke falhou (status=${r.status})\n${r.stdout}\n${r.stderr}`
  );
});
