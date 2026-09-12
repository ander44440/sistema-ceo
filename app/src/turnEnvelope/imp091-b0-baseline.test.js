/**
 * IMP-091 B0 — valida artefacto de baseline (sem implementar Fatia 1).
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  BASELINE_PATH,
  capturarBaselineB0,
  serializarBaseline
} from "./imp091-b0-capturar.js";
import { FIXTURES_B0 } from "./imp091-b0-fixtures.js";

const IDS_OBRIGATORIOS = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "N1",
  "N2",
  "N3",
  "N4",
  "N5",
  "N6",
  "N7",
  "S1",
  "S2",
  "S3",
  "S4",
  "GATE",
  "AD_ACK",
  "VCA",
  "E4_A",
  "B_C2",
  "IG_PD_D25"
];

function carregarBaseline() {
  return JSON.parse(readFileSync(BASELINE_PATH, "utf8"));
}

function nucleoEquivalencia(caso) {
  return {
    id: caso.id,
    destino_efectivo: caso.destino_efectivo,
    classe: caso.classe,
    early_path: caso.early_path,
    forcarC2: caso.forcarC2,
    flags_chave: caso.flags_chave,
    modo_resposta: caso.modo_resposta,
    objecto_turno_observado: caso.objecto_turno_observado,
    meta_resposta: {
      continuidade: caso.meta_resposta?.continuidade,
      classificadorSaltado: caso.meta_resposta?.classificadorSaltado,
      motorAcionado: caso.meta_resposta?.motorAcionado,
      mreInvocado: caso.meta_resposta?.mreInvocado,
      decisaoGate: caso.meta_resposta?.decisaoGate,
      validacaoContexto: caso.meta_resposta?.validacaoContexto,
      envelopeModo: caso.meta_resposta?.envelopeModo,
      envelopeIntencao: caso.meta_resposta?.envelopeIntencao
    }
  };
}

test("B0: artefacto existe e cobre IDs obrigatórios", () => {
  const b = carregarBaseline();
  assert.equal(b.meta.artefacto, "IMP-091-B0-baseline");
  assert.equal(b.meta.versao, "0.1");
  const ids = b.casos.map((c) => c.id);
  for (const id of IDS_OBRIGATORIOS) {
    assert.ok(ids.includes(id), `falta caso ${id}`);
  }
  assert.equal(FIXTURES_B0.length, b.casos.length);
});

test("B0: Fatia 0 sombra — envelope sem modo/intenção nos casos capturados", () => {
  const b = carregarBaseline();
  for (const c of b.casos) {
    assert.equal(c.meta_resposta.envelopeModo, null, c.id);
    assert.equal(c.meta_resposta.envelopeIntencao, null, c.id);
  }
});

test("B0: early-paths especiais", () => {
  const b = carregarBaseline();
  const byId = Object.fromEntries(b.casos.map((c) => [c.id, c]));
  assert.equal(byId.GATE.early_path, "gate");
  assert.equal(byId.AD_ACK.early_path, "ad_ack");
  assert.equal(byId.VCA.early_path, "vca");
  assert.equal(byId.E4_A.destino_efectivo, "capacidade_operacional");
  assert.equal(byId.E4_A.objecto_turno_observado, "A");
});

test("B0: recaptura equivale ao artefacto congelado (sem mudar comportamento)", async () => {
  const frozen = carregarBaseline();
  const live = await capturarBaselineB0();
  assert.equal(live.casos.length, frozen.casos.length);
  const frozenMap = Object.fromEntries(
    frozen.casos.map((c) => [c.id, nucleoEquivalencia(c)])
  );
  for (const c of live.casos) {
    assert.deepEqual(
      nucleoEquivalencia(c),
      frozenMap[c.id],
      `divergência B0 em ${c.id}`
    );
  }
  // Garante que o serializador permanece estável na forma (meta dinâmica excluída)
  assert.ok(serializarBaseline(frozen).includes('"artefacto": "IMP-091-B0-baseline"'));
});
