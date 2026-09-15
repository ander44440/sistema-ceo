/**
 * IMP-093 M1 — testes CORE do Context Governor.
 */

import assert from "node:assert/strict";
import { describe, it, afterEach } from "node:test";
import {
  ESTADOS_CG,
  FONTES_CG,
  USOS_CG,
  CODIGOS_VIOLACAO,
  MODO_SOMBRA,
  MODO_ENFORCE,
  governarContexto,
  resolverModoCg,
  isModoEnforce,
  CG_FASE
} from "./index.js";

describe("IMP-093 M1 — CORE governarContexto", () => {
  const prev = process.env.CEO_CG_MODO;
  afterEach(() => {
    if (prev === undefined) delete process.env.CEO_CG_MODO;
    else process.env.CEO_CG_MODO = prev;
  });

  it("fase M4 — ENFORCE é o padrão", () => {
    delete process.env.CEO_CG_MODO;
    assert.equal(CG_FASE, "M4");
    assert.equal(resolverModoCg({}), MODO_ENFORCE);
    assert.equal(isModoEnforce({}), true);
  });

  it("pedido sem actoChamada → bloqueado_violacao_invariante", () => {
    const r = governarContexto({
      conteudoCandidato: { messages: [] },
      fontesLastroAutorizadas: []
    });
    assert.equal(r.estado, ESTADOS_CG.BLOQUEADO_VIOLACAO_INVARIANTE);
    assert.equal(r.autorizado, false);
    assert.equal(r.teriaBloqueado, true);
  });

  it("IN-1: disponível ≠ autorizado — nao_etiquetado sem fonte autorizada", () => {
    const r = governarContexto({
      actoChamada: "llm_direct",
      coaAtivo: { id: "coa-a" },
      fontesLastroAutorizadas: [],
      conteudoCandidato: {
        messages: [{ role: "user", content: "olá" }]
      }
    });
    assert.ok(r.remocoes.length > 0 || r.autorizado === false);
    assert.ok(
      r.violacoes.includes(CODIGOS_VIOLACAO.V3_FONTE) ||
        r.violacoes.includes(CODIGOS_VIOLACAO.V5_INSUF)
    );
  });

  it("CC-01: fragmento de outro COA é removido", () => {
    const r = governarContexto({
      actoChamada: "llm_direct",
      coaAtivo: { id: "coa-a" },
      fontesLastroAutorizadas: [FONTES_CG.LFC_ACTIVOS, FONTES_CG.TURNO_ATUAL],
      conteudoCandidato: {
        fragmentos: [
          {
            id: "ok",
            texto: "facto A",
            coaId: "coa-a",
            casoId: "caso-1",
            fonte: FONTES_CG.LFC_ACTIVOS,
            uso: USOS_CG.FACTO
          },
          {
            id: "estranho",
            texto: "facto B",
            coaId: "coa-b",
            casoId: "caso-9",
            fonte: FONTES_CG.LFC_ACTIVOS,
            uso: USOS_CG.FACTO
          }
        ]
      },
      casoAtivo: { casoId: "caso-1" }
    });
    assert.equal(r.autorizado, true);
    assert.equal(r.estado, ESTADOS_CG.AUTORIZADO_APOS_ISOLAMENTO);
    assert.ok(r.remocoes.some((x) => x.fragmentoId === "estranho"));
    assert.ok(r.violacoes.includes(CODIGOS_VIOLACAO.V1_COA));
    assert.ok(
      Array.isArray(r.pacoteAutorizado.fragmentos) &&
        r.pacoteAutorizado.fragmentos.every((f) => f.id !== "estranho")
    );
  });

  it("pacote limpo com fontes autorizadas → autorizado_integral", () => {
    const r = governarContexto({
      actoChamada: "mre:S3",
      coaAtivo: { id: "coa-a" },
      casoAtivo: { casoId: "caso-1" },
      fontesLastroAutorizadas: [FONTES_CG.LFC_ACTIVOS, FONTES_CG.TURNO_ATUAL],
      conteudoCandidato: {
        fragmentos: [
          {
            id: "t1",
            texto: "pedido actual",
            coaId: "coa-a",
            fonte: FONTES_CG.TURNO_ATUAL,
            uso: USOS_CG.MANDATO_PROMPT
          },
          {
            id: "f1",
            texto: "preço 10",
            coaId: "coa-a",
            casoId: "caso-1",
            fonte: FONTES_CG.LFC_ACTIVOS,
            uso: USOS_CG.FACTO
          }
        ]
      }
    });
    assert.equal(r.estado, ESTADOS_CG.AUTORIZADO_INTEGRAL);
    assert.equal(r.autorizado, true);
    assert.equal(r.remocoes.length, 0);
  });

  it("RFR: HFC como facto é rejeitado", () => {
    const r = governarContexto({
      actoChamada: "mre:S3",
      coaAtivo: { id: "coa-a" },
      casoAtivo: { casoId: "caso-1" },
      fontesLastroAutorizadas: [
        FONTES_CG.LFC_ACTIVOS,
        FONTES_CG.HFC_CONTINUIDADE
      ],
      regimeEspecial: { rfr: true },
      conteudoCandidato: {
        fragmentos: [
          {
            id: "hfc1",
            texto: "tema antigo",
            coaId: "coa-a",
            fonte: FONTES_CG.HFC_CONTINUIDADE,
            uso: USOS_CG.FACTO
          }
        ]
      }
    });
    assert.ok(r.violacoes.includes(CODIGOS_VIOLACAO.V3_FONTE));
    assert.ok(r.autorizado === false || r.remocoes.length > 0);
  });

  it("rollback SHADOW via CEO_CG_MODO=sombra", () => {
    process.env.CEO_CG_MODO = "sombra";
    assert.equal(resolverModoCg({}), MODO_SOMBRA);
  });
});
