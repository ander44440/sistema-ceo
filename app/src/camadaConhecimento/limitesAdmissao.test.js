/**
 * IMP-070 B2 / REQ-073 — Limites de admissão.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  CATEGORIAS_EXCLUIDAS,
  PROIBICOES_ABSOLUTAS,
  TIPOS_LOGICOS_ADMITIDOS,
  avaliarAdmissao,
  recusarAdmissao
} from "./limitesAdmissao.js";

/** Candidato mínimo válido */
function baseOk(extra = {}) {
  return {
    conteudo: "Regra reutilizável: taxa zerada em corrida cancelada",
    tipoLogico: "regra_dominio",
    reutilizavel: true,
    independenteDeDecisaoEspecifica: true,
    patrimonioCeo: true,
    origem: "DEC-MVP-001 / Patrocinador 23/07/2026",
    ...extra
  };
}

test("CA-073-1: exige reutilizável + independente + património + origem", () => {
  assert.equal(avaliarAdmissao(baseOk()).ok, true);

  assert.ok(recusarAdmissao(baseOk({ reutilizavel: false })));
  assert.ok(
    avaliarAdmissao(baseOk({ reutilizavel: false })).motivosRecusa.includes(
      "falta_reutilizavel_cnc002"
    )
  );
  assert.ok(
    avaliarAdmissao(
      baseOk({ independenteDeDecisaoEspecifica: false })
    ).motivosRecusa.includes("falta_independente_decisao_cnc002")
  );
  assert.ok(
    avaliarAdmissao(baseOk({ patrimonioCeo: false })).motivosRecusa.includes(
      "nao_patrimonio_ceo"
    )
  );
  assert.ok(
    avaliarAdmissao(baseOk({ origem: "" })).motivosRecusa.includes(
      "conteudo_sem_origem"
    )
  );
});

test("CA-073-2: tipo lógico ∈ conjunto admitido", () => {
  for (const tipo of TIPOS_LOGICOS_ADMITIDOS) {
    if (tipo === "lastro_estado_curado") {
      assert.equal(
        avaliarAdmissao(baseOk({ tipoLogico: tipo, dumpLiveEstado: false })).ok,
        true
      );
      continue;
    }
    assert.equal(avaliarAdmissao(baseOk({ tipoLogico: tipo })).ok, true, tipo);
  }
  const bad = avaliarAdmissao(baseOk({ tipoLogico: "codigo_fonte_jogo" }));
  assert.equal(bad.ok, false);
  assert.ok(bad.motivosRecusa.some((m) => /tipo_logico_invalido/.test(m)));

  const dump = avaliarAdmissao(
    baseOk({ tipoLogico: "lastro_estado_curado", dumpLiveEstado: true })
  );
  assert.equal(dump.ok, false);
});

test("CA-073-3: categorias excluídas recusadas", () => {
  for (const cat of CATEGORIAS_EXCLUIDAS) {
    const r = avaliarAdmissao(baseOk({ categoriaExcluida: cat }));
    assert.equal(r.ok, false, cat);
    assert.ok(r.motivosRecusa.some((m) => m.includes(cat)));
  }
});

test("CA-073-4: proibições absolutas recusadas", () => {
  for (const p of PROIBICOES_ABSOLUTAS) {
    const r = avaliarAdmissao(baseOk({ proibicaoAbsoluta: p }));
    assert.equal(r.ok, false, p);
  }
  assert.equal(
    avaliarAdmissao(
      baseOk({ conteudo: "API_KEY=sk-secret-123 não partilhar" })
    ).ok,
    false
  );
  assert.equal(
    avaliarAdmissao(
      baseOk({
        conteudo: "Importar o repositório do jogo e sync do repo MG2"
      })
    ).ok,
    false
  );
});

test("CA-073-5: referências por ID ok; absorção recusada", () => {
  const ok = avaliarAdmissao(
    baseOk({
      referenciasExternas: ["REQ-030", "ADR-015", "CNC-002"],
      absorveArtefactoReferenciado: false
    })
  );
  assert.equal(ok.ok, true);
  assert.deepEqual(ok.referenciasExternas, ["REQ-030", "ADR-015", "CNC-002"]);

  const absorve = avaliarAdmissao(
    baseOk({
      referenciasExternas: ["CON-001"],
      absorveArtefactoReferenciado: true
    })
  );
  assert.equal(absorve.ok, false);
  assert.ok(
    absorve.motivosRecusa.includes("absorcao_artefacto_referenciado_proibida")
  );
});

test("B2: tentarIncluirComLimites recusa inadmissível e aceita válido", async () => {
  const {
    reiniciarAcervoParaTestes,
    tentarIncluirComLimites,
    consultarFonteOficial
  } = await import("./fonteOficial.js");
  reiniciarAcervoParaTestes();

  const fail = tentarIncluirComLimites({
    id: "KNW-010",
    ...baseOk({ categoriaExcluida: "fila_ops_jobs_gates" })
  });
  assert.equal(fail.incluido, false);
  assert.equal(consultarFonteOficial({ ambitoCoa: "prj-mg2" }).itens.length, 0);

  const ok = tentarIncluirComLimites({
    id: "KNW-011",
    ambitoCoa: "prj-mg2",
    ...baseOk()
  });
  assert.equal(ok.incluido, true);
  assert.equal(consultarFonteOficial({ ambitoCoa: "prj-mg2" }).itens.length, 1);
});