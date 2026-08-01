/**
 * Testes extensibilidade + fecho — IMP-055 E7.
 */

import assert from "node:assert/strict";
import { test } from "node:test";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { NOS_V1, montarNo } from "./dominio.js";
import {
  criarRegistoOrquestracao,
  montarNoDeRegisto,
  validarNoDeRegisto
} from "./registo.js";
import { criarAgregadorOrquestracao } from "./agregador.js";
import {
  htmlGrelhaNos,
  checklistProgressividadeHtml,
  contarCartoesHtml,
  htmlPainelOrquestracao
} from "./ui.js";
import { escreverHeartbeat } from "./heartbeat.js";
import os from "node:os";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test("E7-CA1: nó dummy no registo — renderer UI inalterado", async () => {
  const reg = criarRegistoOrquestracao();
  for (const id of NOS_V1) {
    reg.registrar({
      id,
      nome: id.toUpperCase(),
      papel: "Outro",
      coletor: async () => ({ estado: "Ocioso", origemSinal: "t" }),
      prioridadeVisual: NOS_V1.indexOf(id)
    });
  }
  reg.registrar({
    id: "dummy-validador",
    nome: "Validador",
    papel: "Outro",
    coletor: async () => ({
      estado: "Disponivel",
      origemSinal: "dummy",
      detalhe: { motivo: "extensao" }
    }),
    mapeadorEstado: (s) => s.estado,
    prioridadeVisual: 999,
    descricoes: {
      Disponivel: "Extensão de teste pronta."
    }
  });

  const snap = await reg.montarSnapshot();
  assert.equal(snap.nos.length, 7);
  assert.ok(snap.nos.some((n) => n.id === "dummy-validador"));

  // Renderer genérico — mesma função E3/E4, sem switch por id
  const html = htmlGrelhaNos(snap.nos);
  assert.equal(contarCartoesHtml(html), 7);
  assert.match(html, /Validador/);
  assert.match(html, /Extensão de teste pronta/);
  const check = checklistProgressividadeHtml(html);
  assert.equal(check.ok, true, check.falhas.join("; "));
});

test("E7: V1 via registrarNosV1 + agregador com registo", async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "ceo-e7-"));
  escreverHeartbeat(root, { estado: "idle" });
  const agg = criarAgregadorOrquestracao({
    deps: {
      repoRoot: root,
      listarPorEstado: () => [],
      llmConfigurado: () => true,
      healthOk: () => true
    }
  });
  assert.ok(agg.registo);
  assert.equal(agg.registo.ids().length, 6);
  const snap = await agg.obterSnapshotHttp();
  assert.equal(snap.nos.length, 6);
  fs.rmSync(root, { recursive: true, force: true });
});

test("E7: montarNoDeRegisto / validarNoDeRegisto", () => {
  const no = montarNoDeRegisto({
    id: "ci-runner",
    nome: "CI",
    estado: "Ocioso",
    descricaoResumida: "Sem pipeline."
  });
  assert.equal(validarNoDeRegisto(no).ok, true);
  assert.throws(() =>
    montarNoDeRegisto({
      id: "x",
      nome: "X",
      estado: "Online",
      descricaoResumida: "bad"
    })
  );
});

test("E7-CA3: README do painel existe e cobre Progressividade/portas", () => {
  const readme = path.join(__dirname, "README.md");
  assert.equal(fs.existsSync(readme), true);
  const txt = fs.readFileSync(readme, "utf8");
  assert.match(txt, /Progressividade/);
  assert.match(txt, /\/api\/ceo\/orquestracao\/snapshot/);
  assert.match(txt, /\/api\/ceo\/orquestracao\/stream/);
  assert.match(txt, /RegistoNoOrquestracao|registo\.js/);
});

test("E7-CA2: matriz CA/NA publicada em evidencias", () => {
  const matriz = path.resolve(
    __dirname,
    "../../../docs/implementation/evidencias/IMP-055-matriz-ca-na.md"
  );
  assert.equal(fs.existsSync(matriz), true);
  const txt = fs.readFileSync(matriz, "utf8");
  for (const id of ["CA1", "CA2", "CA3", "CA4", "CA5", "CA6", "CA7", "CA8"]) {
    assert.match(txt, new RegExp(id));
  }
  for (const id of ["NA1", "NA2", "NA3"]) {
    assert.match(txt, new RegExp(id));
  }
});

test("E7 regressão: shell painel + V1 grelha Progressividade", () => {
  const shell = htmlPainelOrquestracao();
  assert.match(shell, /Orquestração/);
  assert.equal(shell.includes("cs-chat"), false);
  const nos = NOS_V1.map((id) => montarNo(id, "Ocioso"));
  const html = htmlGrelhaNos(nos);
  assert.equal(contarCartoesHtml(html), 6);
  assert.equal(checklistProgressividadeHtml(html).ok, true);
});
