/**
 * IMP-057 E7 — Documentação e fecho (checks automatizados leves).
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "../../..");
const readme = join(__dirname, "README.md");
const matriz = join(
  repoRoot,
  "docs/implementation/evidencias/IMP-057-matriz-ca-na.md"
);
const relatorio = join(
  repoRoot,
  "docs/implementation/evidencias/IMP-057-relatorio-consolidado.md"
);

test("E7-CA2: README referencia ARQ-018, REQ-057, ARQ-017/REQ-056", () => {
  assert.ok(existsSync(readme), "README do Classificador");
  const t = readFileSync(readme, "utf8");
  assert.match(t, /ARQ-018/);
  assert.match(t, /REQ-057/);
  assert.match(t, /ARQ-017/);
  assert.match(t, /REQ-056/);
  assert.match(t, /LIMIAR|0[,.]55/);
  assert.match(t, /motor_execucao|Motor/);
});

test("E7-CA1: matriz CA1–CA11 e NA1–NA3 existe e cobre IDs", () => {
  assert.ok(existsSync(matriz), "IMP-057-matriz-ca-na.md");
  const t = readFileSync(matriz, "utf8");
  for (let i = 1; i <= 11; i++) {
    assert.match(t, new RegExp(`CA${i}`), `CA${i}`);
  }
  for (let i = 1; i <= 3; i++) {
    assert.match(t, new RegExp(`NA${i}`), `NA${i}`);
  }
});

test("E7-CA3: relatório consolidado lista ficheiros tocados", () => {
  assert.ok(existsSync(relatorio), "relatório consolidado");
  const t = readFileSync(relatorio, "utf8");
  assert.match(t, /classificadorIntencao/);
  assert.match(t, /executiveEngine/);
  assert.match(t, /Ficheiros|ficheiros/);
});
