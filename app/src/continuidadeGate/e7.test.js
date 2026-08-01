/**
 * Documentação e evidências — IMP-058 E7
 */

import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..", "..", "..");
const appSrc = join(__dirname, "..");

function lerRepo(rel) {
  return readFileSync(join(repoRoot, rel), "utf8");
}

test("E7-CA1: README referencia ARQ-019, REQ-058, Motor, Fila/Dispatcher", () => {
  const readme = readFileSync(join(__dirname, "README.md"), "utf8");
  assert.match(readme, /ARQ-019/);
  assert.match(readme, /REQ-058/);
  assert.match(readme, /ARQ-017|REQ-056/);
  assert.match(readme, /REQ-045|REQ-053|Dispatcher|Fila/);
  assert.match(readme, /IMP-058/);
});

test("E7-CA2: matriz CA/NA existe e cobre CA1–CA11 e NA1–NA4", () => {
  const matriz = lerRepo(
    "docs/implementation/evidencias/IMP-058-matriz-ca-na.md"
  );
  for (const id of [
    "CA1",
    "CA2",
    "CA3",
    "CA4",
    "CA5",
    "CA6",
    "CA7",
    "CA8",
    "CA9",
    "CA10",
    "CA11",
    "NA1",
    "NA2",
    "NA3",
    "NA4"
  ]) {
    assert.match(matriz, new RegExp(`\\b${id}\\b`), id);
  }
  assert.match(matriz, /OK/);
});

test("E7-CA3: relatório consolidado E6+E7 existe", () => {
  assert.equal(
    existsSync(
      join(repoRoot, "docs/implementation/evidencias/IMP-058-relatorio-consolidado.md")
    ),
    true
  );
  const rel = lerRepo(
    "docs/implementation/evidencias/IMP-058-relatorio-consolidado.md"
  );
  assert.match(rel, /E6/);
  assert.match(rel, /E7/);
  assert.match(rel, /IMP-058/);
});

test("E7-CA4: ARQ-019 e REQ-058 não alterados nesta sessão de fecho (marcadores estáveis)", () => {
  // Guardrail: ficheiros existem e mantêm título canónico (não reescritos pela E7)
  const arq = lerRepo(
    "docs/architecture/ARQ-019-continuidade-do-gate-de-execucao.md"
  );
  const req = lerRepo(
    "docs/requirements/REQ-058-continuidade-do-gate-de-execucao.md"
  );
  assert.match(arq, /^# ARQ-019/m);
  assert.match(req, /^# REQ-058/m);
  // E7 não deve ter injetado bloco "alterado por E7"
  assert.equal(/alterado por E7|reescrito na E7/i.test(arq), false);
  assert.equal(/alterado por E7|reescrito na E7/i.test(req), false);
});

test("E7: evidências E1–E5 presentes", () => {
  for (const f of [
    "IMP-058-E1-evidencia.md",
    "IMP-058-E2-evidencia.md",
    "IMP-058-E3-evidencia.md",
    "IMP-058-E4-evidencia.md",
    "IMP-058-E5-evidencia.md"
  ]) {
    assert.equal(
      existsSync(join(repoRoot, "docs/implementation/evidencias", f)),
      true,
      f
    );
  }
});

test("E7: catálogo docs/README menciona IMP-058", () => {
  const cat = lerRepo("docs/README.md");
  assert.match(cat, /IMP-058/);
  assert.match(cat, /continuidade-do-gate/);
});

test("E7: index.js exporta API E1–E4 usada em produção", () => {
  const idx = readFileSync(join(__dirname, "index.js"), "utf8");
  assert.match(idx, /criarStoreContextoGate/);
  assert.match(idx, /reconhecerDecisao/);
  assert.match(idx, /continuarAposDecisaoGate/);
  void appSrc;
});
