/**
 * Regressão MVP — consulta tipada LFC (F2) + não inventar campo ausente.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, it } from "node:test";
import { detectarModoRespostaRestrita } from "../classificadorIntencao/pedidoRespostaRestrita.js";
import {
  corrigirRespostaConsultaCampoLfc,
  ehConsultaCampoUnicoLfc,
  extrairChaveConsultaCampoLfc,
  responderCampoNosFactosLfc
} from "./consultaCampoLfc.js";
import { processarTurnoLfc } from "./wiringConversacional.js";
import {
  ORIGEM_UTILIZADOR,
  criarLfcReader,
  criarLfcStore,
  criarLfcWriter
} from "./index.js";
import {
  configurarAdaptadorTrilhaLocal,
  resetAdaptadorTrilhaParaTestes
} from "../trilhaAuditavel/emissor.js";

const T1 =
  "Qual é o código secreto registrado nos fatos ativos do LFC deste caso? Responda somente com o valor do LFC.";

/** @type {string} */
let tmpRoot;
/** @type {ReturnType<typeof criarLfcStore>} */
let store;
/** @type {ReturnType<typeof criarLfcWriter>} */
let writer;
/** @type {ReturnType<typeof criarLfcReader>} */
let reader;

beforeEach(() => {
  tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "lfc-mvp-"));
  const dirLfc = path.join(tmpRoot, "executive", "lastro-factual-casos");
  store = criarLfcStore(dirLfc);
  configurarAdaptadorTrilhaLocal(() => ({ ok: true }));
  writer = criarLfcWriter(store, { superficie: "teste" });
  reader = criarLfcReader(store);
});

afterEach(() => {
  resetAdaptadorTrilhaParaTestes();
  fs.rmSync(tmpRoot, { recursive: true, force: true });
});

describe("consultaCampoLfc — tipagem T1", () => {
  it("detecta T1 como dado_unico / codigo_secreto", () => {
    assert.equal(ehConsultaCampoUnicoLfc(T1), true);
    assert.equal(extrairChaveConsultaCampoLfc(T1), "codigo_secreto");
    const d = detectarModoRespostaRestrita(T1);
    assert.equal(d.activo, true);
    assert.equal(d.modo, "dado_unico");
    assert.equal(d.chave, "codigo_secreto");
  });

  it("extrai BETA-TOKEN do facto B1 e não devolve 120 funcionários", () => {
    const factos = [
      { texto: "120 funcionários" },
      { texto: "B1 código secreto BETA-TOKEN-992" },
      { texto: "B2 orçamento exclusivo R$ 8.888.000" }
    ];
    const out = responderCampoNosFactosLfc(factos, "codigo_secreto", T1);
    assert.equal(out, "BETA-TOKEN-992");
    assert.doesNotMatch(out, /120/);
  });

  it("declara ausência quando LFC não tem código secreto (caso ValeVerde)", () => {
    const factos = [
      { texto: "120 funcionários" },
      { texto: "faturamento anual de R$ 48 milhões" },
      { texto: "margem líquida caiu de 8% para 4%" }
    ];
    const out = responderCampoNosFactosLfc(factos, "codigo_secreto", T1);
    assert.match(out, /Não tenho o código secreto/i);
    assert.doesNotMatch(out, /120/);
  });

  it("corrige prosa LLM que devolveu outro facto activo", () => {
    const r = corrigirRespostaConsultaCampoLfc({
      resposta: "120 funcionários",
      instrucao: T1,
      factos: [
        { texto: "120 funcionários" },
        { texto: "margem líquida caiu de 8% para 4%" }
      ]
    });
    assert.equal(r.aplicada, true);
    assert.match(r.mensagem, /Não tenho o código secreto/i);
  });
});

describe("processarTurnoLfc — T1 sem LLM", () => {
  it("Beta: devolve BETA-TOKEN-992 por caminho restrito", async () => {
    const coaId = "prj-beta-mvp";
    const reg = writer.criarCaso({
      coaId,
      titulo: "caso B",
      origem: ORIGEM_UTILIZADOR,
      factosIniciais: [
        "B1 código secreto BETA-TOKEN-992",
        "B2 orçamento exclusivo R$ 8.888.000",
        "B3 fornecedor exclusivo SulVerde SA"
      ]
    });
    assert.equal(reg.ok, true);

    const out = await processarTurnoLfc(T1, { coaId, writer, reader });
    assert.equal(out.activo, true);
    assert.equal(out.modo, "dado_unico");
    assert.match(String(out.mensagem), /BETA-TOKEN-992/);
    assert.doesNotMatch(String(out.mensagem), /120/);
  });

  it("COA só com 120 funcionários: T1 não devolve 120", async () => {
    const coaId = "prj-sistema-ceo-sim";
    const reg = writer.criarCaso({
      coaId,
      titulo: "ValeVerde",
      origem: ORIGEM_UTILIZADOR,
      factosIniciais: [
        "120 funcionários",
        "faturamento anual de R$ 48 milhões",
        "margem líquida caiu de 8% para 4%"
      ]
    });
    assert.equal(reg.ok, true);

    const out = await processarTurnoLfc(T1, { coaId, writer, reader });
    assert.equal(out.activo, true);
    assert.equal(out.modo, "dado_unico");
    assert.match(String(out.mensagem), /Não tenho o código secreto/i);
    assert.doesNotMatch(String(out.mensagem), /120\s*funcion/i);
  });
});
