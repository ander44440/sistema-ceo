/**
 * IMP-074 — Testes estruturais do canal C3 (não é VAL).
 */
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, test } from "node:test";
import { FICHEIRO_EVENTOS } from "./adapterFs.js";
import { htmlBlocoMepC3 } from "../modules/centroSituacao/blocoMepC3.js";
import {
  listarPropostasC3,
  proporEvolucaoDesidentificada
} from "./c3.js";
import {
  consultarObjecto,
  historico,
  inicializarPersistenciaFisica,
  listarObjectos,
  promoverMaturidade,
  reiniciarMepParaTestes
} from "./index.js";

const ACTO_OK = Object.freeze({
  papel: "ceo_agente",
  tipoLacunaProduto: "lacuna de governação de produto",
  objectoCandidato: "MDL",
  enunciadoDesidentificado: "O produto precisa de um recorte mínimo visível da MEP.",
  evidenciaNaoPrivada: "VAL-074"
});

beforeEach(() => {
  reiniciarMepParaTestes();
});

test("bloco UI C3 não importa mepCeo nem adapter; markup usa vista já filtrada", () => {
  const fonte = readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), "../modules/centroSituacao/blocoMepC3.js"),
    "utf8"
  );
  assert.equal(/from ["'].*mepCeo/.test(fonte), false);
  assert.equal(/adapterFs/.test(fonte), false);
  const vazio = htmlBlocoMepC3([]);
  assert.match(vazio, /Nenhuma proposta de produto em CONCEBIDO/);
  assert.match(vazio, /aria-label="Propostas de evolução do produto"/);
  proporEvolucaoDesidentificada({ ...ACTO_OK });
  const html = htmlBlocoMepC3(listarPropostasC3());
  assert.match(html, /MDL-001/);
  assert.equal(/transcript|origemCanal/.test(html), false);
});

test("C3 cria exactamente um objecto CONCEBIDO / hipótese com origemCanal C3", () => {
  const n0 = listarObjectos().length;
  const r = proporEvolucaoDesidentificada({ ...ACTO_OK });
  assert.equal(r.ok, true);
  assert.equal(r.objecto.tipo, "MDL");
  assert.equal(r.objecto.maturidade, "CONCEBIDO");
  assert.equal(r.objecto.classificacao, "hipotese");
  assert.equal(r.objecto.payload.origemCanal, "C3");
  assert.equal(r.objecto.payload.tipoLacunaProduto, ACTO_OK.tipoLacunaProduto);
  assert.equal(listarObjectos().length, n0 + 1);
  assert.equal(historico(r.objecto.id).length, 1);
});

test("C3 recusa campo em falta e C2 inalterado", () => {
  const n0 = listarObjectos().length;
  const r = proporEvolucaoDesidentificada({
    papel: "cto",
    tipoLacunaProduto: "x",
    objectoCandidato: "MCP",
    enunciadoDesidentificado: "hipótese"
  });
  assert.equal(r.ok, false);
  assert.equal(listarObjectos().length, n0);
});

test("C3 recusa campos extra (id, maturidade, origem)", () => {
  const n0 = listarObjectos().length;
  const r = proporEvolucaoDesidentificada({
    ...ACTO_OK,
    maturidade: "HOMOLOGADO",
    id: "MDL-999",
    origemCanal: "C3"
  });
  assert.equal(r.ok, false);
  assert.equal(r.motivo, "campos_nao_permitidos");
  assert.equal(listarObjectos().length, n0);
});

test("C3 recusa objectoCandidato fora de MCP|EPC|MDL", () => {
  const r = proporEvolucaoDesidentificada({
    ...ACTO_OK,
    objectoCandidato: "BSL"
  });
  assert.equal(r.ok, false);
  assert.equal(r.motivo, "objecto_candidato_invalido");
});

test("C3 recusa conteúdo proibido fail-closed", () => {
  const n0 = listarObjectos().length;
  const r = proporEvolucaoDesidentificada({
    ...ACTO_OK,
    enunciadoDesidentificado: "Copiar transcript do cliente COA-001"
  });
  assert.equal(r.ok, false);
  assert.equal(r.motivo, "conteudo_proibido");
  assert.equal(listarObjectos().length, n0);
});

test("C3 não chama promoção; objecto permanece CONCEBIDO", () => {
  const r = proporEvolucaoDesidentificada({ ...ACTO_OK, objectoCandidato: "EPC" });
  assert.equal(r.ok, true);
  assert.equal(consultarObjecto(r.objecto.id).maturidade, "CONCEBIDO");
  const promo = promoverMaturidade(r.objecto.id, "DEFINIDO", {
    papel: ["cto", "usuario"],
    evidencia: { tipo: "ARQ", referencia: "ARQ-033" }
  });
  assert.equal(promo.ok, true);
  assert.equal(listarPropostasC3().some((p) => p.id === r.objecto.id), false);
});

test("listarPropostasC3 só devolve CONCEBIDO com origem C3 e campos de vista", () => {
  proporEvolucaoDesidentificada({ ...ACTO_OK });
  const vista = listarPropostasC3();
  assert.equal(vista.length, 1);
  assert.deepEqual(Object.keys(vista[0]).sort(), [
    "enunciadoDesidentificado",
    "id",
    "maturidade",
    "tipoLacunaProduto"
  ]);
  assert.equal(vista[0].maturidade, "CONCEBIDO");
  assert.equal(vista[0].transcript, undefined);
  assert.equal(vista[0].payload, undefined);
});

test("C3 persiste via criarObjecto / IMP-073 quando o store está activo", () => {
  const dir = mkdtempSync(join(tmpdir(), "mep-c3-"));
  const boot = inicializarPersistenciaFisica(dir);
  assert.equal(boot.ok, true);
  const r = proporEvolucaoDesidentificada({ ...ACTO_OK, objectoCandidato: "MCP" });
  assert.equal(r.ok, true);
  const log = join(dir, FICHEIRO_EVENTOS);
  assert.equal(existsSync(log), true);
  assert.equal(readFileSync(log, "utf8").includes("origemCanal"), true);
  assert.equal(readFileSync(log, "utf8").includes('"C3"'), true);
  reiniciarMepParaTestes();
});
