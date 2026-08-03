/**
 * Testes IMP-011 — Contrato e Validação do ParecerExecutivo (T11-01…T11-12).
 */

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  clonarComMutacoes,
  parecerValidoCompleto,
  validarParecerExecutivo
} from "./index.js";

function temRegra(resultado, regra) {
  return resultado.violacoes.some((x) => x.regra === regra);
}

test("T11-01: fixture válido completo → ok", () => {
  const r = validarParecerExecutivo(parecerValidoCompleto());
  assert.equal(r.ok, true, JSON.stringify(r.violacoes, null, 2));
  assert.equal(r.violacoes.length, 0);
});

test("T11-02: campo obrigatório ausente / string vazia → V1", () => {
  const r1 = validarParecerExecutivo(
    clonarComMutacoes(parecerValidoCompleto(), { analise: "   " })
  );
  assert.equal(r1.ok, false);
  assert.ok(temRegra(r1, "V1"));

  const r2 = validarParecerExecutivo(
    clonarComMutacoes(parecerValidoCompleto(), { "diagnostico.objetivoReal": "" })
  );
  assert.equal(r2.ok, false);
  assert.ok(temRegra(r2, "V1"));
});

test("T11-03: enum ilegal em estado → rejeitado", () => {
  const r = validarParecerExecutivo(
    clonarComMutacoes(parecerValidoCompleto(), {
      "decisaoExecutiva.estado": "talvez_depois"
    })
  );
  assert.equal(r.ok, false);
  assert.ok(
    r.violacoes.some((x) => x.caminho === "decisaoExecutiva.estado"),
    JSON.stringify(r.violacoes)
  );
});

test("T11-04: solicitar_dados sem perguntar ou sem lacunas → V3", () => {
  const r1 = validarParecerExecutivo(
    clonarComMutacoes(parecerValidoCompleto(), {
      "decisaoExecutiva.estado": "solicitar_dados",
      "acao.tipo": "orientar",
      lacunas: ["falta X"]
    })
  );
  assert.equal(r1.ok, false);
  assert.ok(temRegra(r1, "V3"));

  const r2 = validarParecerExecutivo(
    clonarComMutacoes(parecerValidoCompleto(), {
      "decisaoExecutiva.estado": "solicitar_dados",
      "acao.tipo": "perguntar",
      lacunas: []
    })
  );
  assert.equal(r2.ok, false);
  assert.ok(temRegra(r2, "V3"));
});

test("T11-05: delegar sem job → V3", () => {
  const r = validarParecerExecutivo(
    clonarComMutacoes(parecerValidoCompleto(), {
      "decisaoExecutiva.estado": "delegar",
      "acao.tipo": "despachar",
      "acao.job": null
    })
  );
  assert.equal(r.ok, false);
  assert.ok(temRegra(r, "V3"));
});

test("T11-06: monitorar/adiar com tipo ≠ aguardar → V3", () => {
  const r1 = validarParecerExecutivo(
    clonarComMutacoes(parecerValidoCompleto(), {
      "decisaoExecutiva.estado": "monitorar",
      "acao.tipo": "orientar"
    })
  );
  assert.equal(r1.ok, false);
  assert.ok(temRegra(r1, "V3"));

  const r2 = validarParecerExecutivo(
    clonarComMutacoes(parecerValidoCompleto(), {
      "decisaoExecutiva.estado": "adiar",
      "acao.tipo": "registar"
    })
  );
  assert.equal(r2.ok, false);
  assert.ok(temRegra(r2, "V3"));
});

test("T11-07: rejeitar + despachar → V3", () => {
  const r = validarParecerExecutivo(
    clonarComMutacoes(parecerValidoCompleto(), {
      "decisaoExecutiva.estado": "rejeitar",
      "acao.tipo": "despachar",
      "acao.job": {
        titulo: "x",
        descricao: "y"
      }
    })
  );
  assert.equal(r.ok, false);
  assert.ok(temRegra(r, "V3"));
});

test("T11-08: aprovar + despachar sem job → V3", () => {
  const r = validarParecerExecutivo(
    clonarComMutacoes(parecerValidoCompleto(), {
      "decisaoExecutiva.estado": "aprovar",
      "acao.tipo": "despachar",
      "acao.job": null
    })
  );
  assert.equal(r.ok, false);
  assert.ok(temRegra(r, "V3"));
});

test("T11-09: atualizarPrincipios=true sem proposta → V4", () => {
  const base = parecerValidoCompleto();
  const mut = clonarComMutacoes(base, {
    "aprendizado.atualizarPrincipios": true
  });
  delete mut.aprendizado.propostaPrincipio;
  const r = validarParecerExecutivo(mut);
  assert.equal(r.ok, false);
  assert.ok(temRegra(r, "V4"));
});

test("T11-10: confianca = 1.5 → V1", () => {
  const r = validarParecerExecutivo(
    clonarComMutacoes(parecerValidoCompleto(), { confianca: 1.5 })
  );
  assert.equal(r.ok, false);
  assert.ok(temRegra(r, "V1"));
  assert.ok(r.violacoes.some((x) => x.caminho === "confianca"));
});

test("T11-11: justificativa sem referência nem ausência → V5", () => {
  const r = validarParecerExecutivo(
    clonarComMutacoes(parecerValidoCompleto(), {
      "decisaoExecutiva.justificativa": "Porque sim, vamos nessa."
    })
  );
  assert.equal(r.ok, false);
  assert.ok(temRegra(r, "V5"));
});

test("T11-12: metadados com chave desconhecida não invalida → V6", () => {
  const r = validarParecerExecutivo(
    clonarComMutacoes(parecerValidoCompleto(), {
      metadados: { modeloUsado: "fixture-llm", latenciaMs: 12, chaveNova: true }
    })
  );
  assert.equal(r.ok, true, JSON.stringify(r.violacoes, null, 2));
});
