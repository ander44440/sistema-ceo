/**
 * Documentação e matriz — IMP-056 E7
 */

import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "../../..");

test("E7-CA1: matriz CA1–CA11 e NA1–NA3 mapeados a evidência", () => {
  const matriz = readFileSync(
    join(repoRoot, "docs/implementation/evidencias/IMP-056-matriz-ca-na.md"),
    "utf8"
  );
  for (let i = 1; i <= 11; i++) {
    assert.match(matriz, new RegExp(`\\| CA${i} \\|`), `CA${i}`);
  }
  for (const na of ["NA1", "NA2", "NA3"]) {
    assert.match(matriz, new RegExp(`\\| ${na} \\|`), na);
  }
  assert.match(matriz, /dominio\.test\.js/);
  assert.match(matriz, /fronteiras\.test\.js/);
  assert.match(matriz, /resultadoEncerramento/);
});

test("E7-CA2: README referencia ARQ-017, REQ-056, REQ-045, REQ-053", () => {
  const readme = readFileSync(join(__dirname, "README.md"), "utf8");
  assert.match(readme, /ARQ-017/);
  assert.match(readme, /REQ-056/);
  assert.match(readme, /REQ-045/);
  assert.match(readme, /REQ-053/);
  assert.match(readme, /IMP-056/);
});

test("E7-CA3: lista explícita de ficheiros da implementação existe", () => {
  const matriz = readFileSync(
    join(repoRoot, "docs/implementation/evidencias/IMP-056-matriz-ca-na.md"),
    "utf8"
  );
  assert.match(matriz, /E7-CA3/);
  assert.match(matriz, /motorExecucao\/dominio\.js/);
  assert.match(matriz, /efeitosPosDeliberacao\.js/);
  assert.match(matriz, /executiveEngine\/index\.js/);
  assert.match(matriz, /não alterar/i);

  const obrigatorios = [
    "dominio.js",
    "politicaAprovacao.js",
    "ponteParecerJob.js",
    "integracaoOrquestrador.js",
    "resultadoEncerramento.js",
    "README.md",
    "fronteiras.test.js"
  ];
  for (const f of obrigatorios) {
    assert.equal(existsSync(join(__dirname, f)), true, f);
  }
});
