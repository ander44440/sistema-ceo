/**
 * Documentação e evidências — IMP-059 E7
 */

import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "../../..");

function lerDocs(rel) {
  return readFileSync(join(repoRoot, rel), "utf8");
}

test("E7-CA1: docs referenciam ARQ-020, REQ-059, Classificador, Continuidade, Motor, Fila/Dispatcher", () => {
  const readme = readFileSync(join(__dirname, "README.md"), "utf8");
  assert.match(readme, /ARQ-020/);
  assert.match(readme, /REQ-059/);
  assert.match(readme, /Classificador|ARQ-018|REQ-057/);
  assert.match(readme, /Continuidade|ARQ-019|REQ-058/);
  assert.match(readme, /Motor|REQ-056|ARQ-017/);
  assert.match(readme, /Fila|REQ-045|Dispatcher|REQ-053/);
});

test("E7-CA2: matriz CA/NA preenchida", () => {
  const matriz = lerDocs(
    "docs/implementation/evidencias/IMP-059-matriz-ca-na.md"
  );
  assert.match(matriz, /CA1/);
  assert.match(matriz, /CA5/);
  assert.match(matriz, /NA1/);
  assert.match(matriz, /NA4/);
  assert.match(matriz, /\*\*OK\*\*/);
});

test("E7-CA3: relatório consolidado e evidências E1–E7", () => {
  const evidencias = [
    "docs/implementation/evidencias/IMP-059-E1-evidencia.md",
    "docs/implementation/evidencias/IMP-059-E2-evidencia.md",
    "docs/implementation/evidencias/IMP-059-E3-evidencia.md",
    "docs/implementation/evidencias/IMP-059-E4-evidencia.md",
    "docs/implementation/evidencias/IMP-059-E5-evidencia.md",
    "docs/implementation/evidencias/IMP-059-E6-evidencia.md",
    "docs/implementation/evidencias/IMP-059-E7-evidencia.md",
    "docs/implementation/evidencias/IMP-059-relatorio-consolidado.md"
  ];
  for (const e of evidencias) {
    assert.ok(existsSync(join(repoRoot, e)), e);
  }
  const rel = lerDocs(
    "docs/implementation/evidencias/IMP-059-relatorio-consolidado.md"
  );
  assert.match(rel, /E5/);
  assert.match(rel, /E6/);
  assert.match(rel, /E7/);
  assert.match(rel, /homolog/i);
});

test("E7-CA4: ARQ-020 e REQ-059 sem alteração normativa nesta sessão de fecho", () => {
  const arq = lerDocs("docs/architecture/ARQ-020-consciencia-operacional.md");
  const req = lerDocs("docs/requirements/REQ-059-consciencia-operacional.md");
  assert.match(arq, /Consciência Operacional/);
  assert.match(req, /REQ-059/);
  // Fecho E7 não reescreve enunciados — artefactos existem e mantêm IDs
  assert.match(arq, /ARQ-020/);
  assert.match(req, /RF1/);
});
