/**
 * IMP-092.2 — Reader canónico LFC.
 * Ligação interna para testes / consumidores futuros — sem wiring de conversa.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, test } from "node:test";
import {
  ORIGEM_UTILIZADOR,
  READER_CANONICO_ID,
  WRITER_CANONICO_ID,
  criarLfcStore,
  criarLfcWriter,
  criarLfcReader,
  ESTADO_FACTO,
  ESTADO_LASTRO
} from "./index.js";
import {
  configurarAdaptadorTrilhaLocal,
  resetAdaptadorTrilhaParaTestes
} from "../trilhaAuditavel/emissor.js";

/** @type {string} */
let tmpRoot;
/** @type {ReturnType<typeof criarLfcStore>} */
let store;
/** @type {ReturnType<typeof criarLfcWriter>} */
let writer;
/** @type {ReturnType<typeof criarLfcReader>} */
let reader;

beforeEach(() => {
  tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "lfc-0922-"));
  store = criarLfcStore(
    path.join(tmpRoot, "executive", "lastro-factual-casos")
  );
  configurarAdaptadorTrilhaLocal(() => ({ ok: true, medium: "noop" }));
  writer = criarLfcWriter(store, { superficie: "teste", emitirTrilha: false });
  reader = criarLfcReader(store);
});

afterEach(() => {
  resetAdaptadorTrilhaParaTestes();
  fs.rmSync(tmpRoot, { recursive: true, force: true });
});

test("leitura de todos os factos activos", () => {
  const c = writer.criarCaso({
    coaId: "coa-a",
    titulo: "ValeVerde",
    origem: ORIGEM_UTILIZADOR,
    factosIniciais: [
      "Atua no mercado de serviços.",
      "Possui clientes recorrentes.",
      "Perdeu dois clientes.",
      "Motivo desconhecido."
    ]
  });
  const r = reader.listarFactosActivos("coa-a", c.casoId);
  assert.equal(r.ok, true);
  assert.equal(r.factos.length, 4);
  assert.equal(r.readerId, READER_CANONICO_ID);
  assert.ok(r.factos.every((f) => f.estado === ESTADO_FACTO.ACTIVO));
});

test("leitura de um único facto", () => {
  const c = writer.criarCaso({
    coaId: "coa-a",
    titulo: "ValeVerde",
    origem: ORIGEM_UTILIZADOR,
    factosIniciais: [
      "Atua no mercado de serviços.",
      "Perdeu dois clientes importantes."
    ]
  });
  const r = reader.obterFactoActivo("coa-a", c.casoId, {
    textoContem: "dois clientes"
  });
  assert.equal(r.ok, true);
  assert.match(r.facto.texto, /dois clientes/i);
});

test("correção não retorna facto antigo como activo", () => {
  const c = writer.criarCaso({
    coaId: "coa-a",
    titulo: "ValeVerde",
    origem: ORIGEM_UTILIZADOR,
    factosIniciais: ["Atua no mercado de serviços."]
  });
  writer.corrigirFacto({
    coaId: "coa-a",
    casoId: c.casoId,
    origem: ORIGEM_UTILIZADOR,
    correçãoExplícita: true,
    alvoTexto: "serviços",
    textoNovo: "Atua no mercado de logística."
  });
  const activos = reader.listarFactosActivos("coa-a", c.casoId);
  assert.equal(activos.factos.length, 1);
  assert.match(activos.factos[0].texto, /log[ií]stica/i);
  const antigo = reader.obterFactoActivo("coa-a", c.casoId, {
    textoContem: "serviços"
  });
  assert.equal(antigo.ok, false);
  assert.equal(antigo.codigo, "facto_nao_encontrado");
});

test("anulação remove facto da listagem activa", () => {
  const c = writer.criarCaso({
    coaId: "coa-a",
    titulo: "ValeVerde",
    origem: ORIGEM_UTILIZADOR,
    factosIniciais: ["Facto 1.", "Facto 2."]
  });
  const doc = store.get("coa-a", c.casoId);
  const id = doc.factos[0].id;
  writer.anularFacto({
    coaId: "coa-a",
    casoId: c.casoId,
    factoId: id,
    origem: ORIGEM_UTILIZADOR
  });
  const r = reader.listarFactosActivos("coa-a", c.casoId);
  assert.equal(r.factos.length, 1);
  assert.equal(r.factos[0].texto, "Facto 2.");
});

test("isolamento entre COAs", () => {
  const a = writer.criarCaso({
    coaId: "coa-a",
    titulo: "ValeVerde",
    origem: ORIGEM_UTILIZADOR,
    factosIniciais: ["Só A."]
  });
  writer.criarCaso({
    coaId: "coa-b",
    titulo: "ValeVerde",
    origem: ORIGEM_UTILIZADOR,
    factosIniciais: ["Só B."]
  });
  const r = reader.obterCaso("coa-b", a.casoId);
  assert.equal(r.ok, false);
  assert.equal(r.codigo, "caso_nao_encontrado");
  assert.equal(reader.listarCasosDoCoa("coa-a").casos.length, 1);
  assert.equal(reader.listarCasosDoCoa("coa-b").casos.length, 1);
});

test("múltiplos casos no mesmo COA", () => {
  const c1 = writer.criarCaso({
    coaId: "coa-a",
    titulo: "ValeVerde",
    origem: ORIGEM_UTILIZADOR,
    factosIniciais: ["V1."]
  });
  const c2 = writer.criarCaso({
    coaId: "coa-a",
    titulo: "ValeVerde",
    origem: ORIGEM_UTILIZADOR,
    factosIniciais: ["V2."]
  });
  assert.notEqual(c1.casoId, c2.casoId);
  const lista = reader.listarCasosDoCoa("coa-a");
  assert.equal(lista.casos.length, 2);
  assert.equal(reader.obterCasoActivo("coa-a").casoId, c2.casoId);
});

test("caso inexistente", () => {
  const r = reader.obterCaso("coa-a", "00000000-0000-4000-8000-000000000099");
  assert.equal(r.ok, false);
  assert.equal(r.codigo, "caso_nao_encontrado");
  const f = reader.listarFactosActivos(
    "coa-a",
    "00000000-0000-4000-8000-000000000099"
  );
  assert.equal(f.ok, false);
  assert.deepEqual(f.factos, []);
});

test("caso ambíguo — não escolhe em silêncio", () => {
  writer.criarCaso({
    coaId: "coa-a",
    titulo: "ValeVerde",
    origem: ORIGEM_UTILIZADOR,
    factosIniciais: ["A."]
  });
  writer.criarCaso({
    coaId: "coa-a",
    titulo: "ValeVerde",
    origem: ORIGEM_UTILIZADOR,
    factosIniciais: ["B."]
  });
  const r = reader.resolverCaso("coa-a", { titulo: "ValeVerde" });
  assert.equal(r.ok, false);
  assert.equal(r.codigo, "caso_ambiguo");
  assert.equal(r.casoId, null);
  assert.equal(r.candidatos.length, 2);
});

test("sem COA — não recupera LFC persistente", () => {
  assert.equal(reader.listarFactosActivos("", "x").codigo, "coa_ausente");
  assert.equal(reader.obterCaso(null, "x").codigo, "coa_ausente");
  assert.equal(reader.resolverCaso(undefined, { deixis: true }).codigo, "coa_ausente");
});

test("persistência após novo turno/processo (nova instância Reader)", () => {
  const c = writer.criarCaso({
    coaId: "coa-a",
    titulo: "ValeVerde",
    origem: ORIGEM_UTILIZADOR,
    factosIniciais: ["Persistido."]
  });
  const reader2 = criarLfcReader(store);
  const r = reader2.listarFactosActivos("coa-a", c.casoId);
  assert.equal(r.ok, true);
  assert.equal(r.factos[0].texto, "Persistido.");
});

test("Writer → Reader end-to-end", () => {
  assert.equal(writer.id, WRITER_CANONICO_ID);
  assert.equal(reader.id, READER_CANONICO_ID);
  const c = writer.criarCaso({
    coaId: "coa-a",
    titulo: "ValeVerde",
    origem: ORIGEM_UTILIZADOR,
    factosIniciais: [
      "Atua no mercado de serviços.",
      "Perdeu dois clientes."
    ]
  });
  assert.equal(c.autorizaProsaGuardado, true);
  writer.corrigirFacto({
    coaId: "coa-a",
    casoId: c.casoId,
    origem: ORIGEM_UTILIZADOR,
    correçãoExplícita: true,
    alvoTexto: "serviços",
    textoNovo: "Atua no mercado de logística."
  });
  const activos = reader.listarFactosActivos("coa-a", c.casoId);
  assert.equal(activos.factos.length, 2);
  assert.ok(activos.factos.some((f) => /log[ií]stica/i.test(f.texto)));
  assert.ok(activos.factos.some((f) => /dois clientes/i.test(f.texto)));
  assert.ok(!activos.factos.some((f) => /servi[cç]os/i.test(f.texto)));

  const resolvido = reader.resolverCaso("coa-a", {
    casoId: c.casoId,
    actualizarPonteiro: true
  });
  assert.equal(resolvido.ok, true);
  assert.equal(reader.obterCasoActivo("coa-a").casoId, c.casoId);
});

test("tombstone não é recuperável como caso normal", () => {
  const c = writer.criarCaso({
    coaId: "coa-a",
    titulo: "ValeVerde",
    origem: ORIGEM_UTILIZADOR,
    factosIniciais: ["X."]
  });
  writer.excluirCaso({
    coaId: "coa-a",
    casoId: c.casoId,
    origem: ORIGEM_UTILIZADOR
  });
  const r = reader.obterCaso("coa-a", c.casoId);
  assert.equal(r.ok, false);
  assert.equal(r.codigo, "caso_nao_encontrado");
  const comFlag = reader.obterCaso("coa-a", c.casoId, {
    incluirExcluidos: true
  });
  assert.equal(comFlag.ok, true);
  assert.equal(comFlag.caso.estadoLastro, ESTADO_LASTRO.EXCLUIDO);
});
