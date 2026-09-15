/**
 * IMP-093 M4 — ENFORCE padrão, anti-bypass, paths oficiais, rollback SHADOW.
 */

import assert from "node:assert/strict";
import { describe, it, before, after, beforeEach, afterEach } from "node:test";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  configurarAdaptadorTrilhaLocal,
  resetAdaptadorTrilhaParaTestes
} from "../trilhaAuditavel/emissor.js";
import { TIPO_CG_AUTORIZACAO } from "../trilhaAuditavel/dominio.js";
import { deliberarComLlm } from "../executiveEngine/llmCliente.js";
import {
  CG_FASE,
  CG_ROLLBACK_SHADOW_ENV,
  ESTADOS_CG,
  FONTES_CG,
  MODO_ENFORCE,
  MODO_SOMBRA,
  USOS_CG,
  atravessarGateLlm,
  cgBypassPermitido,
  cgEmProducao,
  enviadoSubconjuntoAutorizado,
  governarContexto,
  messagesDePacoteAutorizado,
  resolverModoCg,
  serializarBodyLlm
} from "./index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC_ROOT = path.resolve(__dirname, "..");

/**
 * @param {string} dir
 * @param {(f: string) => boolean} [filter]
 * @returns {string[]}
 */
function listarJs(dir, filter) {
  /** @type {string[]} */
  const out = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (ent.name === "node_modules" || ent.name === "dist") continue;
      out.push(...listarJs(full, filter));
    } else if (ent.isFile() && /\.(js|mjs|cjs)$/.test(ent.name)) {
      if (!filter || filter(full)) out.push(full);
    }
  }
  return out;
}

describe("IMP-093 M4 — ENFORCE padrão", () => {
  const prev = process.env.CEO_CG_MODO;
  afterEach(() => {
    if (prev === undefined) delete process.env.CEO_CG_MODO;
    else process.env.CEO_CG_MODO = prev;
  });

  it("CG_FASE=M4 e default ENFORCE", () => {
    delete process.env.CEO_CG_MODO;
    assert.equal(CG_FASE, "M4");
    assert.equal(CG_ROLLBACK_SHADOW_ENV, "CEO_CG_MODO");
    assert.equal(resolverModoCg({}), MODO_ENFORCE);
    assert.equal(resolverModoCg({ actoChamada: "mre:S3" }), MODO_ENFORCE);
    assert.equal(resolverModoCg({ cgMeta: { actoChamada: "llm_rapido" } }), MODO_ENFORCE);
  });

  it("produção: cgMeta.modo=sombra não baixa o nível", () => {
    delete process.env.CEO_CG_MODO;
    const prevNode = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";
    try {
      assert.equal(cgEmProducao(), true);
      assert.equal(
        resolverModoCg({ cgMeta: { modo: "sombra" } }),
        MODO_ENFORCE
      );
      assert.equal(resolverModoCg({ modo: "shadow" }), MODO_ENFORCE);
    } finally {
      if (prevNode === undefined) delete process.env.NODE_ENV;
      else process.env.NODE_ENV = prevNode;
    }
  });
});

describe("IMP-093 M4 — estados enforce + trilha", () => {
  /** @type {object[]} */
  let eventos = [];
  let transportCalls = 0;
  const prev = process.env.CEO_CG_MODO;

  before(() => {
    delete process.env.CEO_CG_MODO;
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

  beforeEach(() => {
    eventos = [];
    transportCalls = 0;
  });

  /**
   * @param {object} meta
   * @param {Array<{role:string,content:string}>} [messages]
   */
  async function run(meta, messages) {
    return deliberarComLlm(
      {
        messages: messages || [
          { role: "system", content: "sys" },
          { role: "user", content: "user" }
        ],
        temperature: 0.1,
        max_tokens: 40,
        cgMeta: { actoChamada: "m4_teste", ...meta }
      },
      {
        transportar: async (body) => {
          transportCalls += 1;
          return { texto: "ok", origem: "llm", _body: body };
        }
      }
    );
  }

  it("autorização integral → fetch com pacote autorizado", async () => {
    const saida = await run({
      coaAtivo: { id: "coa-a" },
      casoAtivo: { casoId: "c1" },
      fontesLastroAutorizadas: [FONTES_CG.TURNO_ATUAL],
      conteudoCandidato: {
        fragmentos: [
          {
            id: "t1",
            papel: "user",
            texto: "pedido limpo",
            coaId: "coa-a",
            fonte: FONTES_CG.TURNO_ATUAL,
            uso: USOS_CG.MANDATO_PROMPT
          }
        ]
      }
    });
    assert.equal(saida.cg.modo, MODO_ENFORCE);
    assert.equal(saida.cg.estado, ESTADOS_CG.AUTORIZADO_INTEGRAL);
    assert.equal(transportCalls, 1);
    assert.ok(eventos.some((e) => e.tipo === TIPO_CG_AUTORIZACAO));
  });

  it("isolamento → remove contaminação; enviado ⊆ autorizado", async () => {
    const saida = await run(
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
    assert.equal(saida.cg.estado, ESTADOS_CG.AUTORIZADO_APOS_ISOLAMENTO);
    assert.equal(transportCalls, 1);
    assert.equal(saida.cg.enviadoSubconjunto, true);
    assert.ok(saida._body.messages.every((m) => m.content !== "estranho"));
    assert.equal(
      enviadoSubconjuntoAutorizado(
        saida._body.messages,
        {
          fragmentos: [
            {
              id: "ok",
              papel: "user",
              texto: "limpo",
              fonte: FONTES_CG.LFC_ACTIVOS
            }
          ]
        }
      ),
      true
    );
  });

  it("contaminação total / insuficiência → bloqueio sem fetch", async () => {
    const saida = await run({
      coaAtivo: { id: "coa-a" },
      fontesLastroAutorizadas: [],
      objetivoOuAssuntoTurno: "preciso lastro",
      conteudoCandidato: {
        messages: [{ role: "user", content: "x" }]
      }
    });
    assert.equal(saida.codigo, "cg_bloqueado");
    assert.equal(transportCalls, 0);
    assert.equal(saida.cg.autorizado, false);
    assert.ok(eventos.some((e) => e.tipo === TIPO_CG_AUTORIZACAO));
  });

  it("esclarecimento (LFC sem casoId) → bloqueio sem fetch", async () => {
    const saida = await run({
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
    assert.equal(saida.codigo, "cg_bloqueado");
    assert.ok(
      saida.cg.estado === ESTADOS_CG.BLOQUEADO_ESCLARECIMENTO ||
        saida.cg.estado === ESTADOS_CG.BLOQUEADO_INSUFICIENCIA ||
        saida.cg.autorizado === false
    );
  });

  it("violação de invariante (acto vazio) → bloqueio sem fetch", async () => {
    const saida = await atravessarGateLlm(
      { messages: [{ role: "user", content: "z" }] },
      async () => {
        transportCalls += 1;
        return { texto: "no" };
      },
      {
        metaCg: {
          actoChamada: "   ",
          fontesLastroAutorizadas: [FONTES_CG.TURNO_ATUAL],
          conteudoCandidato: { messages: [{ role: "user", content: "z" }] }
        }
      }
    );
    assert.equal(saida.codigo, "cg_bloqueado");
    assert.equal(saida.cg.estado, ESTADOS_CG.BLOQUEADO_VIOLACAO_INVARIANTE);
    assert.equal(transportCalls, 0);
  });

  it("helper enviado ⊆ autorizado", () => {
    const pacote = {
      fragmentos: [{ id: "1", papel: "user", texto: "a", fonte: FONTES_CG.TURNO_ATUAL }]
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

describe("IMP-093 M4 — anti-bypass estático e runtime", () => {
  const prevBypass = process.env.CEO_CG_BYPASS;
  const prevCgBypass = process.env.CG_BYPASS;
  const prevModo = process.env.CEO_CG_MODO;

  afterEach(() => {
    if (prevBypass === undefined) delete process.env.CEO_CG_BYPASS;
    else process.env.CEO_CG_BYPASS = prevBypass;
    if (prevCgBypass === undefined) delete process.env.CG_BYPASS;
    else process.env.CG_BYPASS = prevCgBypass;
    if (prevModo === undefined) delete process.env.CEO_CG_MODO;
    else process.env.CEO_CG_MODO = prevModo;
  });

  it("CG_BYPASS / CEO_CG_BYPASS nunca são honrados", () => {
    process.env.CEO_CG_BYPASS = "1";
    process.env.CG_BYPASS = "true";
    assert.equal(cgBypassPermitido(), false);
  });

  it("único fetch oficial a /api/ceo/deliberar está em llmCliente.js", () => {
    const files = listarJs(SRC_ROOT, (f) => !/\.test\.js$/.test(f));
    /** @type {string[]} */
    const hits = [];
    // Só invocações reais (string literal de URL), não menções em comentários.
    const reFetch =
      /(?:ceoApiUrl\s*\(\s*|fetch\s*\([^)]*)['"`]\/api\/ceo\/deliberar['"`]/;
    for (const f of files) {
      const src = fs.readFileSync(f, "utf8");
      if (reFetch.test(src)) {
        hits.push(path.relative(SRC_ROOT, f).replace(/\\/g, "/"));
      }
    }
    assert.deepEqual(hits, ["executiveEngine/llmCliente.js"]);
  });

  it("deliberarComLlm sempre passa por atravessarGateLlm", () => {
    const src = fs.readFileSync(
      path.join(SRC_ROOT, "executiveEngine", "llmCliente.js"),
      "utf8"
    );
    assert.match(src, /import\s+\{\s*atravessarGateLlm\s*\}/);
    assert.match(src, /return\s+atravessarGateLlm\s*\(/);
    assert.match(src, /transportarDeliberarHttp/);
  });

  it("paths oficiais de LLM delegam a deliberarComLlm", () => {
    const paths = [
      "executiveEngine/capacidades/ia.js",
      "mre/adaptadorLlmCeo.js",
      "classificadorIntencao/respostaLeve.js"
    ];
    for (const rel of paths) {
      const src = fs.readFileSync(path.join(SRC_ROOT, rel), "utf8");
      assert.match(
        src,
        /deliberarComLlm/,
        `${rel} deve usar deliberarComLlm`
      );
      assert.doesNotMatch(
        src,
        /transportarDeliberarHttp/,
        `${rel} não deve chamar transporte bruto`
      );
      assert.doesNotMatch(
        src,
        /\/api\/ceo\/deliberar/,
        `${rel} não deve fetch deliberar directamente`
      );
    }
  });

  it("nenhum transporte LLM alternativo (openai/anthropic SDK) em paths oficiais", () => {
    const paths = [
      "executiveEngine/llmCliente.js",
      "executiveEngine/capacidades/ia.js",
      "mre/adaptadorLlmCeo.js",
      "classificadorIntencao/respostaLeve.js",
      "contextGovernor/gateLlm.js"
    ];
    for (const rel of paths) {
      const src = fs.readFileSync(path.join(SRC_ROOT, rel), "utf8");
      assert.doesNotMatch(src, /@anthropic|openai\.com|api\.openai|@openai/i);
    }
  });

  it("CORE: disponível ≠ autorizado (não etiquetado não passa como facto)", () => {
    delete process.env.CEO_CG_MODO;
    const r = governarContexto({
      actoChamada: "llm_direct",
      coaAtivo: { id: "coa-a" },
      fontesLastroAutorizadas: [FONTES_CG.TURNO_ATUAL],
      conteudoCandidato: {
        fragmentos: [
          {
            id: "x",
            texto: "opaco",
            fonte: FONTES_CG.NAO_ETIQUETADO,
            uso: USOS_CG.FACTO
          }
        ]
      }
    });
    assert.ok(r.autorizado === false || r.remocoes.length > 0);
  });
});

describe("IMP-093 M4 — rollback SHADOW (CEO_CG_MODO=sombra)", () => {
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

  it("env sombra → modo sombra e body original", async () => {
    assert.equal(resolverModoCg({}), MODO_SOMBRA);
    const pedido = {
      messages: [{ role: "user", content: "orig" }],
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
    const saida = await deliberarComLlm(pedido, {
      transportar: async (body) => {
        recebido = JSON.stringify({
          messages: body.messages,
          temperature: body.temperature ?? 0.4,
          max_tokens: body.max_tokens ?? 900
        });
        return { texto: "shadow", origem: "llm" };
      }
    });
    assert.equal(saida.cg.modo, MODO_SOMBRA);
    assert.equal(saida.cg.fase, "M4");
    assert.equal(recebido, esperado);
  });

  it("CEO_CG_MODO=shadow também activa rollback", () => {
    process.env.CEO_CG_MODO = "shadow";
    assert.equal(resolverModoCg({}), MODO_SOMBRA);
  });
});
