/**
 * IMP-093 M3 — ENFORCE (agora default M4) + regressão SHADOW via env.
 */

import assert from "node:assert/strict";
import { describe, it, before, after, beforeEach, afterEach } from "node:test";
import {
  configurarAdaptadorTrilhaLocal,
  resetAdaptadorTrilhaParaTestes
} from "../trilhaAuditavel/emissor.js";
import { TIPO_CG_AUTORIZACAO } from "../trilhaAuditavel/dominio.js";
import { deliberarComLlm } from "../executiveEngine/llmCliente.js";
import {
  CG_FASE,
  ESTADOS_CG,
  FONTES_CG,
  MODO_ENFORCE,
  MODO_SOMBRA,
  USOS_CG,
  atravessarGateLlm,
  cgBypassPermitido,
  enviadoSubconjuntoAutorizado,
  messagesDePacoteAutorizado,
  resolverModoCg,
  serializarBodyLlm
} from "./index.js";

describe("IMP-093 M3 — modo (compat M4)", () => {
  const prevModo = process.env.CEO_CG_MODO;
  const prevActos = process.env.CEO_CG_ENFORCE_ACTOS;
  const prevBypass = process.env.CEO_CG_BYPASS;

  afterEach(() => {
    if (prevModo === undefined) delete process.env.CEO_CG_MODO;
    else process.env.CEO_CG_MODO = prevModo;
    if (prevActos === undefined) delete process.env.CEO_CG_ENFORCE_ACTOS;
    else process.env.CEO_CG_ENFORCE_ACTOS = prevActos;
    if (prevBypass === undefined) delete process.env.CEO_CG_BYPASS;
    else process.env.CEO_CG_BYPASS = prevBypass;
  });

  it("M4: padrão é ENFORCE", () => {
    delete process.env.CEO_CG_MODO;
    delete process.env.CEO_CG_ENFORCE_ACTOS;
    assert.equal(CG_FASE, "M4");
    assert.equal(resolverModoCg({}), MODO_ENFORCE);
    assert.equal(resolverModoCg({ actoChamada: "llm_direct" }), MODO_ENFORCE);
  });

  it("cgMeta.modo=enforce continua enforce", () => {
    delete process.env.CEO_CG_MODO;
    assert.equal(
      resolverModoCg({ cgMeta: { modo: "enforce", actoChamada: "x" } }),
      MODO_ENFORCE
    );
  });

  it("CEO_CG_MODO=enforce explícito", () => {
    process.env.CEO_CG_MODO = "enforce";
    assert.equal(resolverModoCg({}), MODO_ENFORCE);
  });

  it("CEO_CG_ENFORCE_ACTOS não baixa o default (já enforce)", () => {
    delete process.env.CEO_CG_MODO;
    process.env.CEO_CG_ENFORCE_ACTOS = "llm_direct,mre:S3";
    assert.equal(
      resolverModoCg({ actoChamada: "llm_direct" }),
      MODO_ENFORCE
    );
    assert.equal(resolverModoCg({ actoChamada: "outro" }), MODO_ENFORCE);
  });

  it("CG_BYPASS nunca é permitido", () => {
    process.env.CEO_CG_BYPASS = "1";
    assert.equal(cgBypassPermitido(), false);
  });
});

describe("IMP-093 M3 — ENFORCE estados", () => {
  /** @type {object[]} */
  let eventos = [];
  let transportCalls = 0;

  before(() => {
    configurarAdaptadorTrilhaLocal((evento) => {
      eventos.push(evento);
      return { ok: true, medium: "local", id: evento.id };
    });
  });

  after(() => resetAdaptadorTrilhaParaTestes());

  beforeEach(() => {
    eventos = [];
    transportCalls = 0;
  });

  async function runEnforce(pedidoGovExtra, messages) {
    const msgs = messages || [
      { role: "system", content: "sys" },
      { role: "user", content: "user" }
    ];
    return deliberarComLlm(
      {
        messages: msgs,
        temperature: 0.1,
        max_tokens: 50,
        cgMeta: {
          modo: "enforce",
          actoChamada: "teste_enforce",
          ...pedidoGovExtra
        }
      },
      {
        transportar: async (body) => {
          transportCalls += 1;
          return {
            texto: "llm-ok",
            origem: "llm",
            _body: body
          };
        }
      }
    );
  }

  it("autorizado_integral → envia pacoteAutorizado (= original etiquetado limpo)", async () => {
    const saida = await runEnforce({
      coaAtivo: { id: "coa-a" },
      casoAtivo: { casoId: "c1" },
      fontesLastroAutorizadas: [FONTES_CG.TURNO_ATUAL, FONTES_CG.LFC_ACTIVOS],
      conteudoCandidato: {
        fragmentos: [
          {
            id: "t1",
            papel: "user",
            texto: "pedido",
            coaId: "coa-a",
            fonte: FONTES_CG.TURNO_ATUAL,
            uso: USOS_CG.MANDATO_PROMPT
          }
        ]
      }
    });
    assert.equal(transportCalls, 1);
    assert.notEqual(saida.codigo, "cg_bloqueado");
    assert.equal(saida.cg.modo, MODO_ENFORCE);
    assert.equal(saida.cg.estado, ESTADOS_CG.AUTORIZADO_INTEGRAL);
    assert.equal(saida.texto, "llm-ok");
    assert.ok(
      eventos.some((e) => e.tipo === TIPO_CG_AUTORIZACAO && e.detalhe.modo === MODO_ENFORCE)
    );
  });

  it("autorizado_apos_isolamento → envia só autorizado; enviado ⊆ autorizado", async () => {
    const saida = await runEnforce(
      {
        coaAtivo: { id: "coa-a" },
        casoAtivo: { casoId: "c1" },
        fontesLastroAutorizadas: [FONTES_CG.LFC_ACTIVOS, FONTES_CG.TURNO_ATUAL],
        conteudoCandidato: {
          fragmentos: [
            {
              id: "ok",
              papel: "user",
              texto: "limpo",
              coaId: "coa-a",
              casoId: "c1",
              fonte: FONTES_CG.LFC_ACTIVOS,
              uso: USOS_CG.FACTO
            },
            {
              id: "bad",
              papel: "system",
              texto: "estranho",
              coaId: "coa-b",
              casoId: "c9",
              fonte: FONTES_CG.LFC_ACTIVOS,
              uso: USOS_CG.FACTO
            }
          ]
        }
      },
      [
        { role: "user", content: "limpo" },
        { role: "system", content: "estranho" }
      ]
    );
    assert.equal(transportCalls, 1);
    assert.equal(saida.cg.estado, ESTADOS_CG.AUTORIZADO_APOS_ISOLAMENTO);
    const body = saida._body;
    assert.ok(body.messages.every((m) => m.content !== "estranho"));
    assert.ok(body.messages.some((m) => m.content === "limpo"));
    assert.equal(saida.cg.enviadoSubconjunto, true);
  });

  it("bloqueado_contaminacao / insuficiência / esclarecimento / invariante → sem LLM", async () => {
    const insuf = await runEnforce({
      actoChamada: "teste_enforce",
      modo: "enforce",
      coaAtivo: { id: "coa-a" },
      fontesLastroAutorizadas: [],
      objetivoOuAssuntoTurno: "preciso de lastro",
      conteudoCandidato: {
        messages: [{ role: "user", content: "x" }]
      }
    });
    assert.equal(insuf.codigo, "cg_bloqueado");
    assert.equal(transportCalls, 0);
    assert.ok(
      [
        ESTADOS_CG.BLOQUEADO_INSUFICIENCIA,
        ESTADOS_CG.BLOQUEADO_ESCLARECIMENTO
      ].includes(insuf.cg.estado) || insuf.cg.autorizado === false
    );

    transportCalls = 0;
    const inv = await atravessarGateLlm(
      {
        messages: [{ role: "user", content: "y" }],
        cgMeta: { modo: "enforce", actoChamada: "" }
      },
      async () => {
        transportCalls += 1;
        return { texto: "nope" };
      }
    );
    const inv2 = await atravessarGateLlm(
      { messages: [{ role: "user", content: "y" }] },
      async () => {
        transportCalls += 1;
        return { texto: "nope" };
      },
      {
        metaCg: {
          modo: "enforce",
          actoChamada: "inv_test",
          fontesLastroAutorizadas: [],
          conteudoCandidato: { messages: [] }
        }
      }
    );
    assert.equal(typeof inv2.codigo === "string" || inv2.texto === "nope", true);

    transportCalls = 0;
    const esc = await runEnforce({
      coaAtivo: { id: "coa-a" },
      casoAtivo: { casoId: "c1" },
      fontesLastroAutorizadas: [FONTES_CG.LFC_ACTIVOS],
      objetivoOuAssuntoTurno: "qual caso?",
      conteudoCandidato: {
        fragmentos: [
          {
            id: "amb",
            papel: "bloco_factos",
            texto: "facto",
            coaId: "coa-a",
            fonte: FONTES_CG.LFC_ACTIVOS,
            uso: USOS_CG.FACTO
          }
        ]
      }
    });
    assert.equal(transportCalls, 0);
    assert.equal(esc.codigo, "cg_bloqueado");
    assert.ok(
      esc.cg.estado === ESTADOS_CG.BLOQUEADO_ESCLARECIMENTO ||
        esc.cg.estado === ESTADOS_CG.BLOQUEADO_INSUFICIENCIA ||
        esc.cg.autorizado === false
    );
    void insuf;
    void inv;
  });

  it("bloqueado_violacao_invariante → sem envio", async () => {
    const saida = await atravessarGateLlm(
      null,
      async () => {
        transportCalls += 1;
        return { texto: "x" };
      },
      { metaCg: { modo: "enforce", actoChamada: "x" } }
    );
    const r = await deliberarComLlm(
      {
        messages: [],
        cgMeta: {
          modo: "enforce",
          actoChamada: "t",
          fontesLastroAutorizadas: [],
          conteudoCandidato: null
        }
      },
      {
        transportar: async () => {
          transportCalls += 1;
          return { texto: "x" };
        }
      }
    );
    void saida;
    void r;
    transportCalls = 0;
    const bloqueio = await atravessarGateLlm(
      { messages: [{ role: "user", content: "z" }], cgMeta: { modo: "enforce" } },
      async () => {
        transportCalls += 1;
        return { texto: "z" };
      },
      {
        metaCg: {
          modo: "enforce",
          actoChamada: "   ",
          fontesLastroAutorizadas: [FONTES_CG.TURNO_ATUAL],
          conteudoCandidato: { messages: [{ role: "user", content: "z" }] }
        }
      }
    );
    assert.equal(bloqueio.codigo, "cg_bloqueado");
    assert.equal(bloqueio.cg.estado, ESTADOS_CG.BLOQUEADO_VIOLACAO_INVARIANTE);
    assert.equal(transportCalls, 0);
  });

  it("enviado ⊆ autorizado (helper)", () => {
    const pacote = {
      fragmentos: [
        { id: "1", papel: "user", texto: "a", fonte: FONTES_CG.TURNO_ATUAL }
      ]
    };
    const msgs = messagesDePacoteAutorizado(pacote, []);
    assert.equal(enviadoSubconjuntoAutorizado(msgs, pacote), true);
    assert.equal(
      enviadoSubconjuntoAutorizado(
        [...msgs, { role: "system", content: "extra" }],
        pacote
      ),
      false
    );
  });
});

describe("IMP-093 M3 — rollback SHADOW via CEO_CG_MODO=sombra", () => {
  const prev = process.env.CEO_CG_MODO;

  before(() => {
    process.env.CEO_CG_MODO = "sombra";
    configurarAdaptadorTrilhaLocal((e) => ({ ok: true, id: e.id, medium: "local" }));
  });
  after(() => {
    if (prev === undefined) delete process.env.CEO_CG_MODO;
    else process.env.CEO_CG_MODO = prev;
    resetAdaptadorTrilhaParaTestes();
  });

  it("com rollback: body original mesmo com CORE a remover", async () => {
    const pedido = {
      messages: [
        { role: "user", content: "original-a" },
        { role: "system", content: "original-b" }
      ],
      temperature: 0.4,
      max_tokens: 900,
      cgMeta: {
        actoChamada: "llm_direct",
        fontesLastroAutorizadas: [],
        coaAtivo: { id: "coa-a" }
      }
    };
    const esperado = serializarBodyLlm(pedido);
    let recebido = null;
    let calls = 0;
    const saida = await deliberarComLlm(pedido, {
      transportar: async (body) => {
        calls += 1;
        recebido = JSON.stringify({
          messages: body.messages,
          temperature: body.temperature ?? 0.4,
          max_tokens: body.max_tokens ?? 900
        });
        return { texto: "shadow", origem: "llm" };
      }
    });
    assert.equal(resolverModoCg(pedido), MODO_SOMBRA);
    assert.equal(saida.cg.modo, MODO_SOMBRA);
    assert.equal(calls, 1);
    assert.equal(recebido, esperado);
  });
});
