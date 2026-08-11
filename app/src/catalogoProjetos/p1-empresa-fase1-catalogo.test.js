/**
 * FASE 1 — Empresa no catálogo: migração v1→v2, APIs, invariantes (T1–T16).
 */
import assert from "node:assert/strict";
import { test, beforeEach } from "node:test";
import {
  STORAGE_KEY,
  VERSAO,
  carregarDocumento,
  gravarDocumento
} from "./persistencia.js";
import {
  ID_EMPRESA_PATROCINADOR,
  migrarDocumentoParaV2,
  criarEmpresa,
  criarProjeto,
  selecionarEmpresa,
  selecionarEmpresaPorRef,
  selecionarProjeto,
  selecionarProjetoPorRef,
  obterEmpresaAtiva,
  obterEmpresaAtivaId,
  obterEmpresa,
  listarEmpresas,
  listarProjetos,
  listarProjetosDaEmpresa,
  obterProjetoAtivo,
  obterProjetoAtivoId,
  obterProjeto,
  recarregarCatalogo,
  inicializarCatalogo
} from "./index.js";

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

function projetoV1(id, nome) {
  return {
    id,
    nome,
    descricao: "",
    estado: "ativo",
    criadoEm: "2026-08-01T00:00:00.000Z",
    ultimaAtividadeEm: "2026-08-01T00:00:00.000Z",
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
    }
  };
}

function docV1(activoId = "prj-mg2") {
  return {
    versao: 1,
    projetoAtivoId: activoId,
    gabinete: { rotaId: "dashboard", atualizadoEm: "2026-08-01T00:00:00.000Z" },
    projetos: [
      projetoV1("prj-mg2", "Motoboy Game 2"),
      projetoV1("prj-sistema-ceo", "Sistema CEO"),
      projetoV1("prj-ultima-milha", "Última Milha")
    ]
  };
}

function reset() {
  globalThis.localStorage = criarStorage();
  recarregarCatalogo();
  inicializarCatalogo();
}

beforeEach(() => {
  reset();
});

function assertCoerenciaActivos() {
  const pid = obterProjetoAtivoId();
  const eid = obterEmpresaAtivaId();
  assert.ok(eid);
  assert.ok(obterEmpresa(eid));
  if (pid) {
    const p = obterProjeto(pid);
    assert.ok(p);
    assert.equal(p.empresaId, eid);
  }
}

test("T1: documento antigo v1 → migra para v2 com empresas e empresaId", () => {
  globalThis.localStorage.setItem(STORAGE_KEY, JSON.stringify(docV1("prj-mg2")));
  recarregarCatalogo();
  const d = carregarDocumento();
  assert.equal(d.versao, VERSAO);
  assert.ok(Array.isArray(d.empresas) && d.empresas.length >= 1);
  assert.ok(d.empresas.some((e) => e.id === ID_EMPRESA_PATROCINADOR));
  assert.ok(d.projetos.every((p) => p.empresaId === ID_EMPRESA_PATROCINADOR));
  assert.equal(d.projetoAtivoId, "prj-mg2");
  assert.equal(d.empresaAtivaId, ID_EMPRESA_PATROCINADOR);
});

test("T2: migração idempotente — não duplica emp-patrocinador", () => {
  globalThis.localStorage.setItem(STORAGE_KEY, JSON.stringify(docV1()));
  recarregarCatalogo();
  const a = carregarDocumento();
  const n = a.empresas.filter((e) => e.id === ID_EMPRESA_PATROCINADOR).length;
  assert.equal(n, 1);
  const { doc: b, migrou } = migrarDocumentoParaV2(a);
  assert.equal(
    b.empresas.filter((e) => e.id === ID_EMPRESA_PATROCINADOR).length,
    1
  );
  assert.equal(b.versao, VERSAO);
  assert.equal(migrou, false);
  recarregarCatalogo();
  assert.equal(
    carregarDocumento().empresas.filter((e) => e.id === ID_EMPRESA_PATROCINADOR)
      .length,
    1
  );
});

test("T3: persistência / read-after-write preserva empresaAtivaId e empresaId", () => {
  const criado = criarProjeto({ nome: "PROJETO PERSIST EMP" });
  assert.equal(criado.empresaId, obterEmpresaAtivaId());
  const raw = globalThis.localStorage.getItem(STORAGE_KEY);
  const noDisk = JSON.parse(raw);
  assert.equal(noDisk.versao, VERSAO);
  assert.equal(noDisk.empresaAtivaId, ID_EMPRESA_PATROCINADOR);
  assert.ok(noDisk.projetos.find((p) => p.id === criado.id)?.empresaId);
  recarregarCatalogo();
  assert.equal(obterProjetoAtivoId(), criado.id);
  assert.equal(obterEmpresaAtivaId(), ID_EMPRESA_PATROCINADOR);
  assert.equal(obterProjetoAtivo().empresaId, ID_EMPRESA_PATROCINADOR);
});

test("T4: reidratação identidade — mutação lê LS e mantém coerência", () => {
  const alfa = criarProjeto({ nome: "PROJETO REIDRAT EMP" });
  const d = carregarDocumento();
  d.projetoAtivoId = "prj-mg2";
  d.empresaAtivaId = ID_EMPRESA_PATROCINADOR;
  gravarDocumento(d);
  // RAM ainda em ALFA; mutação deve reidratar do LS
  selecionarProjeto(alfa.id);
  assert.equal(obterProjetoAtivoId(), alfa.id);
  assertCoerenciaActivos();
});

test("T5: empresa activa após init v2 = emp-patrocinador + prj-mg2", () => {
  assert.equal(obterEmpresaAtivaId(), ID_EMPRESA_PATROCINADOR);
  assert.equal(obterEmpresaAtiva()?.nome, "Patrocinador");
  assert.equal(obterProjetoAtivoId(), "prj-mg2");
  assertCoerenciaActivos();
});

test("T6: projecto activo seed inalterado semanticamente (prj-mg2)", () => {
  assert.equal(obterProjetoAtivo()?.id, "prj-mg2");
  assert.equal(obterProjetoAtivo()?.nome, "Motoboy Game 2");
  assert.ok(listarProjetos().some((p) => p.id === "prj-mg2"));
});

test("T7: troca explícita de projecto sincroniza empresaAtivaId", () => {
  const emp = criarEmpresa({ nome: "AlfaTech Corp" });
  assert.equal(obterEmpresaAtivaId(), emp.id);
  assert.equal(obterProjetoAtivoId(), null);
  const p = criarProjeto({ nome: "Projeto AlfaTech A" });
  assert.equal(p.empresaId, emp.id);
  selecionarProjeto("prj-mg2");
  assert.equal(obterProjetoAtivoId(), "prj-mg2");
  assert.equal(obterEmpresaAtivaId(), ID_EMPRESA_PATROCINADOR);
  selecionarProjeto(p.id);
  assert.equal(obterEmpresaAtivaId(), emp.id);
});

test("T8: troca explícita de empresa — mantém ou escolhe projecto da empresa", () => {
  const emp = criarEmpresa({ nome: "Beta Corp" });
  const pb = criarProjeto({ nome: "Beta One" });
  selecionarProjeto("prj-mg2");
  assert.equal(obterEmpresaAtivaId(), ID_EMPRESA_PATROCINADOR);
  selecionarEmpresa(emp.id);
  assert.equal(obterEmpresaAtivaId(), emp.id);
  assert.equal(obterProjetoAtivoId(), pb.id);
});

test("T9: empresa sem projectos → projetoAtivoId null", () => {
  const emp = criarEmpresa({ nome: "Vazia SA" });
  assert.equal(obterEmpresaAtivaId(), emp.id);
  assert.equal(obterProjetoAtivoId(), null);
  assert.equal(obterProjetoAtivo(), null);
  assert.deepEqual(listarProjetosDaEmpresa(emp.id), []);
});

test("T10: projecto sem empresaId (doc corrompido) → normalização atribui default", () => {
  const d = carregarDocumento();
  const p = d.projetos.find((x) => x.id === "prj-mg2");
  delete p.empresaId;
  gravarDocumento(d);
  recarregarCatalogo();
  assert.equal(obterProjeto("prj-mg2").empresaId, ID_EMPRESA_PATROCINADOR);
  assertCoerenciaActivos();
});

test("T11: empresa sem projectos + criarProjeto → projecto na empresa e activo", () => {
  const emp = criarEmpresa({ nome: "Nova Casa" });
  assert.equal(obterProjetoAtivoId(), null);
  const p = criarProjeto({ nome: "Primeiro da Nova Casa" });
  assert.equal(p.empresaId, emp.id);
  assert.equal(obterProjetoAtivoId(), p.id);
  assert.equal(obterEmpresaAtivaId(), emp.id);
});

test("T12: inconsistência forçada → normalizar alinha empresa ao projecto", () => {
  const emp = criarEmpresa({ nome: "Gama Ltd" });
  criarProjeto({ nome: "Gama Proj" });
  const d = carregarDocumento();
  d.projetoAtivoId = "prj-mg2";
  d.empresaAtivaId = emp.id; // inconsistente
  gravarDocumento(d);
  recarregarCatalogo();
  assert.equal(obterProjetoAtivoId(), "prj-mg2");
  assert.equal(obterEmpresaAtivaId(), ID_EMPRESA_PATROCINADOR);
  assertCoerenciaActivos();
});

test("T13: listarProjetos global vs listarProjetosDaEmpresa", () => {
  const emp = criarEmpresa({ nome: "Delta Inc" });
  criarProjeto({ nome: "Delta Only" });
  const todos = listarProjetos();
  const daDelta = listarProjetosDaEmpresa(emp.id);
  const doPatro = listarProjetosDaEmpresa(ID_EMPRESA_PATROCINADOR);
  assert.ok(todos.some((p) => p.nome === "Motoboy Game 2"));
  assert.equal(daDelta.length, 1);
  assert.equal(daDelta[0].nome, "Delta Only");
  assert.ok(doPatro.some((p) => p.id === "prj-mg2"));
  assert.ok(!daDelta.some((p) => p.id === "prj-mg2"));
  assert.equal(todos.length, daDelta.length + doPatro.length);
});

test("T14: selecionarEmpresaPorRef — exacto sim; fuzzy não", () => {
  assert.equal(selecionarEmpresaPorRef({ nome: "patro" }), null);
  assert.equal(selecionarEmpresaPorRef({ nome: "Patrocinador" })?.id, ID_EMPRESA_PATROCINADOR);
  assert.equal(
    selecionarEmpresaPorRef({ id: ID_EMPRESA_PATROCINADOR })?.id,
    ID_EMPRESA_PATROCINADOR
  );
  criarEmpresa({ nome: "Exact Match Co" });
  assert.equal(selecionarEmpresaPorRef({ nome: "exact" }), null);
  assert.equal(selecionarEmpresaPorRef({ nome: "Exact Match Co" })?.nome, "Exact Match Co");
});

test("T15: API legado — criar/selecionar/listar + empresaId preenchido", () => {
  const nAntes = listarProjetos().length;
  const p = criarProjeto({ nome: "Legado OK" });
  assert.ok(p.empresaId);
  assert.equal(listarProjetos().length, nAntes + 1);
  assert.ok(selecionarProjetoPorRef({ nome: "mg2" }));
  assert.equal(obterProjetoAtivoId(), "prj-mg2");
  assert.equal(obterProjetoAtivo().empresaId, ID_EMPRESA_PATROCINADOR);
});

test("T16: duas empresas + dois projectos — trocas nunca inconsistentes", () => {
  const e1 = criarEmpresa({ nome: "Empresa Um" });
  const p1 = criarProjeto({ nome: "Proj Um" });
  const e2 = criarEmpresa({ nome: "Empresa Dois" });
  const p2 = criarProjeto({ nome: "Proj Dois" });
  selecionarProjeto(p1.id);
  assert.equal(obterEmpresaAtivaId(), e1.id);
  assertCoerenciaActivos();
  selecionarEmpresa(e2.id);
  assert.equal(obterProjetoAtivoId(), p2.id);
  assert.equal(obterEmpresaAtivaId(), e2.id);
  assertCoerenciaActivos();
  selecionarProjeto(p1.id);
  assert.equal(obterEmpresaAtivaId(), e1.id);
  assertCoerenciaActivos();
  assert.equal(listarEmpresas().filter((e) => e.ativa).length, 1);
});
