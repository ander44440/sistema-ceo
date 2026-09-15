/**
 * IMP-093 M2 — etiquetagem de fragmentos + preservação de meta + SHADOW.
 */

import assert from "node:assert/strict";
import { describe, it, before, after } from "node:test";
import {
  configurarAdaptadorTrilhaLocal,
  resetAdaptadorTrilhaParaTestes
} from "../trilhaAuditavel/emissor.js";
import { deliberarComLlm } from "../executiveEngine/llmCliente.js";
import {
  CG_FASE,
  FONTES_CG,
  MODO_SOMBRA,
  USOS_CG,
  contarEtiquetasFragmentos,
  criarFragmento,
  etiquetarMensagemLlm,
  montarCgMetaDeEntradaMre,
  montarCgMetaPromptDirecto,
  resolverModoCg,
  serializarBodyLlm
} from "./index.js";

describe("IMP-093 M2 — etiquetagem", () => {
  it("fase M4 e ENFORCE por defeito", () => {
    delete process.env.CEO_CG_MODO;
    assert.equal(CG_FASE, "M4");
    assert.equal(resolverModoCg({}), "enforce");
  });

  it("rotula DIC / objetivo / system sem inventar COA", () => {
    const messages = [
      { role: "system", content: "Constituição do CEO..." },
      {
        role: "system",
        content: "Dossier Institucional Curado — identidade do Sistema CEO"
      },
      { role: "user", content: "OBJETIVO ATUAL DA INTERAÇÃO:\nanalisar ValeVerde" }
    ];
    const meta = montarCgMetaPromptDirecto({
      messages,
      coa: { id: "coa-vv", nome: "VV" },
      dicMeta: { injectado: true },
      instrucao: "analisar ValeVerde",
      actoChamada: "llm_rapido"
    });
    assert.equal(meta.coaAtivo.id, "coa-vv");
    assert.ok(meta.fontesLastroAutorizadas.includes(FONTES_CG.TURNO_ATUAL));
    assert.ok(meta.fontesLastroAutorizadas.includes(FONTES_CG.DIC));
    const frags = meta.conteudoCandidato.fragmentos;
    assert.equal(frags[0].fonte, FONTES_CG.NAO_DECLARADA);
    assert.equal(frags[0].coaId, null);
    assert.equal(frags[1].fonte, FONTES_CG.DIC);
    assert.equal(frags[2].fonte, FONTES_CG.TURNO_ATUAL);
    assert.equal(frags[2].coaId, "coa-vv");
  });

  it("mensagem sem origem → nao_etiquetado", () => {
    const f = etiquetarMensagemLlm(
      { role: "assistant", content: "resposta antiga opaca" },
      3,
      {}
    );
    assert.equal(f.fonte, FONTES_CG.NAO_ETIQUETADO);
    assert.equal(f.coaId, null);
    assert.equal(f.casoId, null);
  });

  it("preserva metadados LFC reais na entrada MRE (não inventa caso)", () => {
    const meta = montarCgMetaDeEntradaMre(
      {
        coaId: "coa-a",
        factosOficiais: [
          "[LFC activo — autoridade factual do caso] preço = 10",
          "Pendência: fechar gate"
        ],
        lfcConsumo: { autorizado: true, casoId: "caso-1", motivo: "lfc_activos" },
        rfr: { activo: true }
      },
      {
        instrucao: "analisa só com factos registados",
        historico: [{ papel: "usuario", texto: "oi", coaId: "coa-a" }]
      }
    );
    assert.equal(meta.casoAtivo.casoId, "caso-1");
    assert.ok(meta.fontesLastroAutorizadas.includes(FONTES_CG.LFC_ACTIVOS));
    assert.equal(meta.regimeEspecial.rfr, true);
    const lfc = meta.conteudoCandidato.fragmentos.find(
      (f) => f.fonte === FONTES_CG.LFC_ACTIVOS
    );
    assert.ok(lfc);
    assert.equal(lfc.casoId, "caso-1");
    assert.equal(lfc.coaId, "coa-a");
    const pend = meta.conteudoCandidato.fragmentos.find((f) =>
      /Pendência/.test(f.texto)
    );
    assert.equal(pend.fonte, FONTES_CG.NAO_DECLARADA);
    assert.equal(pend.casoId, null);
  });

  it("sem lfcConsumo.autorizado não marca factos como lfc_activos", () => {
    const meta = montarCgMetaDeEntradaMre(
      {
        coaId: "coa-a",
        factosOficiais: [
          "[LFC activo — autoridade factual do caso] não deveria ser LFC"
        ],
        lfcConsumo: { autorizado: false, casoId: null }
      },
      { instrucao: "x" }
    );
    const frags = meta.conteudoCandidato.fragmentos.filter((f) =>
      /não deveria/.test(f.texto)
    );
    assert.equal(frags[0].fonte, FONTES_CG.NAO_DECLARADA);
    assert.ok(!meta.fontesLastroAutorizadas.includes(FONTES_CG.LFC_ACTIVOS));
  });

  it("contarEtiquetasFragmentos reporta nao_etiquetado", () => {
    const c = contarEtiquetasFragmentos([
      criarFragmento({ id: "a", fonte: FONTES_CG.TURNO_ATUAL, uso: USOS_CG.MANDATO_PROMPT }),
      criarFragmento({ id: "b", fonte: FONTES_CG.NAO_ETIQUETADO }),
      criarFragmento({ id: "c", fonte: FONTES_CG.NAO_DECLARADA })
    ]);
    assert.equal(c.total, 3);
    assert.equal(c.naoEtiquetado, 1);
    assert.equal(c.naoDeclarada, 1);
  });
});

describe("IMP-093 M2 — SHADOW com fragmentos etiquetados (rollback)", () => {
  const prev = process.env.CEO_CG_MODO;

  before(() => {
    process.env.CEO_CG_MODO = "sombra";
    configurarAdaptadorTrilhaLocal((evento) => ({
      ok: true,
      medium: "local",
      id: evento.id
    }));
  });
  after(() => {
    if (prev === undefined) delete process.env.CEO_CG_MODO;
    else process.env.CEO_CG_MODO = prev;
    resetAdaptadorTrilhaParaTestes();
  });

  it("fragmentos no cgMeta não alteram body HTTP", async () => {
    const messages = [
      { role: "system", content: "sys" },
      { role: "user", content: "pergunta" }
    ];
    const pedido = {
      messages,
      temperature: 0.2,
      max_tokens: 100,
      cgMeta: montarCgMetaPromptDirecto({
        messages,
        coa: { id: "coa-z" },
        instrucao: "pergunta",
        actoChamada: "llm_direct"
      })
    };
    const esperado = serializarBodyLlm(pedido);
    let recebido = null;
    const saida = await deliberarComLlm(pedido, {
      transportar: async (body) => {
        recebido = JSON.stringify({
          messages: body.messages,
          temperature: body.temperature ?? 0.4,
          max_tokens: body.max_tokens ?? 900
        });
        return { texto: "ok", origem: "llm" };
      }
    });
    assert.equal(recebido, esperado);
    assert.equal(saida.cg.modo, MODO_SOMBRA);
    assert.equal(saida.cg.fase, "M4");
    assert.ok(saida.cg.etiquetas);
    assert.ok(saida.cg.etiquetas.total >= 2);
  });
});
