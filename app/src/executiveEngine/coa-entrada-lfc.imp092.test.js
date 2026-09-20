/**
 * Regressão: COA da entrada vs sessão (ADR-022 + IMP-094 F4).
 */
import assert from "node:assert/strict";
import test from "node:test";
import {
  funilCoaRigidoActiva,
  resolverCoaTurno
} from "./funilCoaRigido.js";

test("IMP-094 F4: divergência entrada≠sessão é falha (não prevalece em silêncio)", () => {
  delete process.env.CEO_FUNIL_COA_RIGIDO;
  assert.equal(funilCoaRigidoActiva(), true);
  const r = resolverCoaTurno({
    entrada: "prj-1789236801846-5",
    sessao: { id: "prj-mg2" },
    autorizaContextoSessao: true
  });
  assert.equal(r.ok, false);
  assert.equal(r.codigo, "coa_divergente");
  assert.equal(r.coaId, null);
});

test("IMP-094 F4 rollback: off → entrada prevalece (legado IMP-092)", () => {
  process.env.CEO_FUNIL_COA_RIGIDO = "off";
  const r = resolverCoaTurno({
    entrada: "prj-1789236801846-5",
    sessao: { id: "prj-mg2" },
    autorizaContextoSessao: true
  });
  assert.equal(r.ok, true);
  assert.equal(r.coaId, "prj-1789236801846-5");
  assert.equal(r.legado, true);
  delete process.env.CEO_FUNIL_COA_RIGIDO;
});

test("entrada alinhada à sessão → ok", () => {
  delete process.env.CEO_FUNIL_COA_RIGIDO;
  const r = resolverCoaTurno({
    entrada: "prj-mg2",
    sessao: { id: "prj-mg2", nome: "MG2" },
    autorizaContextoSessao: true
  });
  assert.equal(r.ok, true);
  assert.equal(r.coaId, "prj-mg2");
});
