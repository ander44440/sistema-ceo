/**
 * IMP-093 M1 — SHADOW body equality (em M4 exige CEO_CG_MODO=sombra).
 */

import assert from "node:assert/strict";
import { describe, it, before, after } from "node:test";
import {
  configurarAdaptadorTrilhaLocal,
  resetAdaptadorTrilhaParaTestes
} from "../trilhaAuditavel/emissor.js";
import { TIPO_CG_AUTORIZACAO } from "../trilhaAuditavel/dominio.js";
import { deliberarComLlm } from "../executiveEngine/llmCliente.js";
import {
  serializarBodyLlm,
  resolverModoCg,
  MODO_SOMBRA,
  CG_FASE
} from "./index.js";

describe("IMP-093 M1 — SHADOW body equality", () => {
  /** @type {object[]} */
  let eventos = [];
  const prev = process.env.CEO_CG_MODO;

  before(() => {
    process.env.CEO_CG_MODO = "sombra";
    eventos = [];
    configurarAdaptadorTrilhaLocal((evento) => {
      eventos.push(evento);
      return { ok: true, medium: "local", id: evento.id };
    });
  });

  after(() => {
    if (prev === undefined) delete process.env.CEO_CG_MODO;
    else process.env.CEO_CG_MODO = prev;
    resetAdaptadorTrilhaParaTestes();
  });

  it("SHADOW: body enviado ao transporte = serialização original (byte-igual)", async () => {
    assert.equal(CG_FASE, "M4");
    assert.equal(resolverModoCg(), MODO_SOMBRA);

    const pedido = {
      messages: [
        { role: "system", content: "manda X" },
        { role: "user", content: "pergunta com lastro estranho" }
      ],
      temperature: 0.33,
      max_tokens: 512,
      cgMeta: {
        actoChamada: "llm_direct",
        fontesLastroAutorizadas: [],
        coaAtivo: { id: "coa-a" }
      }
    };

    const bodyEsperado = serializarBodyLlm(pedido);
    /** @type {string|null} */
    let bodyRecebido = null;

    const saida = await deliberarComLlm(pedido, {
      transportar: async (body) => {
        bodyRecebido = JSON.stringify({
          messages: body.messages,
          temperature: body.temperature ?? 0.4,
          max_tokens: body.max_tokens ?? 900
        });
        return { texto: "ok", modelo: "mock", uso: {}, origem: "llm" };
      }
    });

    assert.equal(bodyRecebido, bodyEsperado);
    assert.equal(saida.texto, "ok");
    assert.equal(saida.cg?.modo, MODO_SOMBRA);
    assert.equal(saida.cg?.fase, "M4");

    const cgEv = eventos.filter((e) => e && e.tipo === TIPO_CG_AUTORIZACAO);
    assert.ok(cgEv.length >= 1, "deve emitir cg.autorizacao");
    assert.equal(cgEv[0].detalhe.modo, MODO_SOMBRA);
    assert.equal(cgEv[0].refs.actoChamada, "llm_direct");
  });

  it("SHADOW: mesmo com CORE a «bloquear», transporte recebe pacote original", async () => {
    const pedido = {
      messages: [{ role: "user", content: "só isto" }],
      temperature: 0.4,
      max_tokens: 900,
      cgMeta: {
        actoChamada: "mre:S3",
        fontesLastroAutorizadas: [],
        coaAtivo: { id: "coa-x" }
      }
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
        return { texto: "shadow-pass", origem: "llm" };
      }
    });

    assert.equal(recebido, esperado);
    assert.equal(saida.cg?.modo, MODO_SOMBRA);
    assert.equal(typeof saida.cg?.teriaBloqueado, "boolean");
  });
});
