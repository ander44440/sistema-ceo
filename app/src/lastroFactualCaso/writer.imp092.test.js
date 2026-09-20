/**
 * IMP-092.1 — Writer canónico LFC.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, test } from "node:test";
import {
  ORIGEM_UTILIZADOR,
  WRITER_CANONICO_ID,
  criarLfcStore,
  criarLfcWriter,
  ESTADO_FACTO,
  ESTADO_LASTRO,
  TIPO_TRILHA_LFC_MUTACAO
} from "./index.js";
import {
  configurarAdaptadorTrilhaLocal,
  resetAdaptadorTrilhaParaTestes
} from "../trilhaAuditavel/emissor.js";
import { appendEvento, caminhoStoreAudit } from "../trilhaAuditavel/index.js";

/** @type {string} */
let tmpRoot;
/** @type {ReturnType<typeof criarLfcStore>} */
let store;
/** @type {ReturnType<typeof criarLfcWriter>} */
let writer;
/** @type {object[]} */
let eventosTrilha;

beforeEach(() => {
  tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "lfc-092-"));
  const dirLfc = path.join(tmpRoot, "executive", "lastro-factual-casos");
  const dirAudit = caminhoStoreAudit(tmpRoot);
  store = criarLfcStore(dirLfc);
  eventosTrilha = [];
  configurarAdaptadorTrilhaLocal((evento) => {
    const r = appendEvento(dirAudit, evento);
    if (r.ok) eventosTrilha.push(evento);
    return r;
  });
  writer = criarLfcWriter(store, { superficie: "teste" });
});

afterEach(() => {
  resetAdaptadorTrilhaParaTestes();
  fs.rmSync(tmpRoot, { recursive: true, force: true });
});

test("criação de caso com múltiplos factos + guardado só após persistência", () => {
  const r = writer.criarCaso({
    coaId: "coa-a",
    titulo: "ValeVerde",
    origem: ORIGEM_UTILIZADOR,
    factosIniciais: [
      "Atua no mercado de serviços.",
      "Possui clientes recorrentes.",
      "Perdeu dois clientes importantes.",
      "Ainda não sabemos por que saíram."
    ]
  });
  assert.equal(r.ok, true);
  assert.equal(r.autorizaProsaGuardado, true);
  assert.equal(r.nFactos, 4);
  assert.equal(r.writerId, WRITER_CANONICO_ID);
  assert.match(r.casoId, /^[0-9a-f-]{36}$/i);

  const doc = store.get("coa-a", r.casoId);
  assert.ok(doc);
  assert.equal(doc.factos.length, 4);
  assert.equal(store.obterPonteiroActivo("coa-a"), r.casoId);
  assert.ok(eventosTrilha.some((e) => e.tipo === TIPO_TRILHA_LFC_MUTACAO));
});

test("acrescentar factos e persistência após «novo turno» (nova instância writer)", () => {
  const c = writer.criarCaso({
    coaId: "coa-a",
    titulo: "ValeVerde",
    origem: ORIGEM_UTILIZADOR,
    factosIniciais: ["Atua no mercado de serviços."]
  });
  const writer2 = criarLfcWriter(store, { superficie: "teste-turno-2" });
  const r = writer2.acrescentarFactos({
    coaId: "coa-a",
    casoId: c.casoId,
    origem: ORIGEM_UTILIZADOR,
    factos: ["Possui clientes recorrentes."]
  });
  assert.equal(r.ok, true);
  assert.equal(r.autorizaProsaGuardado, true);
  const doc = store.get("coa-a", c.casoId);
  assert.equal(doc.factos.filter((f) => f.estado === ESTADO_FACTO.ACTIVO).length, 2);
  assert.equal(doc.versao, 2);
});

test("correção explícita serviços → logística", () => {
  const c = writer.criarCaso({
    coaId: "coa-a",
    titulo: "ValeVerde",
    origem: ORIGEM_UTILIZADOR,
    factosIniciais: ["Atua no mercado de serviços."]
  });
  const r = writer.corrigirFacto({
    coaId: "coa-a",
    casoId: c.casoId,
    origem: ORIGEM_UTILIZADOR,
    correçãoExplícita: true,
    alvoTexto: "serviços",
    textoNovo: "Atua no mercado de logística."
  });
  assert.equal(r.ok, true);
  const doc = store.get("coa-a", c.casoId);
  const activos = doc.factos.filter((f) => f.estado === ESTADO_FACTO.ACTIVO);
  assert.equal(activos.length, 1);
  assert.match(activos[0].texto, /log[ií]stica/i);
  assert.equal(
    doc.factos.filter((f) => f.estado === ESTADO_FACTO.CORRIGIDO).length,
    1
  );
});

test("contraditório sem correção explícita não altera LFC", () => {
  const c = writer.criarCaso({
    coaId: "coa-a",
    titulo: "ValeVerde",
    origem: ORIGEM_UTILIZADOR,
    factosIniciais: ["Atua no mercado de serviços."]
  });
  const antes = JSON.stringify(store.get("coa-a", c.casoId));
  const r = writer.acrescentarFactos({
    coaId: "coa-a",
    casoId: c.casoId,
    origem: ORIGEM_UTILIZADOR,
    factos: ["Atua no mercado de logística."]
  });
  assert.equal(r.ok, false);
  assert.equal(r.codigo, "esclarecimento_contradicao");
  assert.equal(r.autorizaProsaGuardado, false);
  assert.equal(JSON.stringify(store.get("coa-a", c.casoId)), antes);
});

test("isolamento por COA", () => {
  const a = writer.criarCaso({
    coaId: "coa-a",
    titulo: "ValeVerde",
    origem: ORIGEM_UTILIZADOR,
    factosIniciais: ["Facto A."]
  });
  const b = writer.criarCaso({
    coaId: "coa-b",
    titulo: "ValeVerde",
    origem: ORIGEM_UTILIZADOR,
    factosIniciais: ["Facto B."]
  });
  assert.equal(store.get("coa-a", b.casoId), null);
  assert.equal(store.get("coa-b", a.casoId), null);
  assert.equal(store.listByCoa("coa-a").length, 1);
  assert.equal(store.listByCoa("coa-b").length, 1);
});

test("recusa escrita sem COA", () => {
  const r = writer.criarCaso({
    titulo: "ValeVerde",
    origem: ORIGEM_UTILIZADOR,
    factosIniciais: ["X."]
  });
  assert.equal(r.ok, false);
  assert.equal(r.codigo, "coa_ausente");
  assert.equal(r.autorizaProsaGuardado, false);
});

test("inferência do CEO (origem ≠ utilizador) não grava", () => {
  const r = writer.criarCaso({
    coaId: "coa-a",
    titulo: "ValeVerde",
    origem: "ceo_inferencia",
    factosIniciais: ["Urgência alta inventada."]
  });
  assert.equal(r.ok, false);
  assert.equal(r.codigo, "origem_nao_utilizador");
  assert.equal(store.listByCoa("coa-a").length, 0);
});

test("reinício do mesmo nome produz novo casoId sem auto-arquivar", () => {
  const c1 = writer.criarCaso({
    coaId: "coa-a",
    titulo: "ValeVerde",
    origem: ORIGEM_UTILIZADOR,
    factosIniciais: ["Atua no mercado de serviços."]
  });
  const c2 = writer.criarCaso({
    coaId: "coa-a",
    titulo: "ValeVerde",
    origem: ORIGEM_UTILIZADOR,
    factosIniciais: ["Atua no mercado de serviços."]
  });
  assert.notEqual(c1.casoId, c2.casoId);
  const d1 = store.get("coa-a", c1.casoId);
  assert.equal(d1.estadoLastro, ESTADO_LASTRO.ACTIVO);
  assert.equal(store.obterPonteiroActivo("coa-a"), c2.casoId);
  assert.equal(store.listByCoa("coa-a").length, 2);
});

test("tombstone de exclusão", () => {
  const c = writer.criarCaso({
    coaId: "coa-a",
    titulo: "ValeVerde",
    origem: ORIGEM_UTILIZADOR,
    factosIniciais: ["X."]
  });
  const r = writer.excluirCaso({
    coaId: "coa-a",
    casoId: c.casoId,
    origem: ORIGEM_UTILIZADOR
  });
  assert.equal(r.ok, true);
  assert.equal(r.modo, "tombstone");
  const doc = store.get("coa-a", c.casoId);
  assert.equal(doc.estadoLastro, ESTADO_LASTRO.EXCLUIDO);
  assert.equal(store.listByCoa("coa-a").length, 0);
  assert.equal(store.listByCoa("coa-a", { incluirExcluidos: true }).length, 1);
});

test("writer único — identidade canónica", () => {
  const w2 = criarLfcWriter(store, { superficie: "outro" });
  assert.equal(writer.id, WRITER_CANONICO_ID);
  assert.equal(w2.id, WRITER_CANONICO_ID);
  assert.equal(writer.criarCaso.name, w2.criarCaso.name);
});

test("anular e arquivar", () => {
  const c = writer.criarCaso({
    coaId: "coa-a",
    titulo: "ValeVerde",
    origem: ORIGEM_UTILIZADOR,
    factosIniciais: ["Facto 1.", "Facto 2."]
  });
  const doc0 = store.get("coa-a", c.casoId);
  const id0 = doc0.factos[0].id;
  const an = writer.anularFacto({
    coaId: "coa-a",
    casoId: c.casoId,
    factoId: id0,
    origem: ORIGEM_UTILIZADOR
  });
  assert.equal(an.ok, true);
  const arq = writer.arquivarCaso({
    coaId: "coa-a",
    casoId: c.casoId,
    origem: ORIGEM_UTILIZADOR
  });
  assert.equal(arq.ok, true);
  assert.equal(store.get("coa-a", c.casoId).estadoLastro, ESTADO_LASTRO.ARQUIVADO);
  assert.equal(store.obterPonteiroActivo("coa-a"), null);
});
