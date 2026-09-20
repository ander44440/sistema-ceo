/**
 * IMP-094 Fase 3 — Um caminho deliberativo (MRE + CG) + OBS-4/OBS-8.
 */
import assert from "node:assert/strict";
import { describe, it, before, after, beforeEach } from "node:test";
import {
  funilDeliberarUnicoActiva,
  anexarObservabilidadeDeliberar
} from "./funilDeliberarUnico.js";
import { capacidadeIa } from "./capacidades/ia.js";
import { flagMre } from "../mre/roteamentoDeliberativo.js";
import { reiniciarStoresPosDeliberacaoParaTestes } from "../mre/integracaoNucleo.js";
import { definirComplexidadeRoteamentoAtivo } from "./complexidadeDecisao.js";
import {
  criarChamarLlmMock,
  mapaLlmFluxoFeliz
} from "../mre/pipeline/llmMock.js";
import { executiveEngine } from "./index.js";
import {
  inicializarCatalogo,
  selecionarProjeto
} from "../catalogoProjetos/index.js";
import { definirContextoConversacional } from "../modules/conversa/store.js";
import { configurarAdaptadorTrilhaLocal } from "../trilhaAuditavel/emissor.js";

const COA = "prj-sistema-ceo";

const TC20 =
  "Analise a priorização outdoor vs pagamento no MG2 com o lastro autorizado do COA activo. " +
  "Dê recomendação executiva (aprovar / modificar / não priorizar). Não invente factos.";

/** @type {typeof fetch | undefined} */
let fetchPrev;
/** @type {ReturnType<typeof criarChamarLlmMock> | null} */
let mockMre = null;
let actosCg = [];

const ESTAGIOS_MRE = [
  "0_diagnostico",
  "1_enquadramento",
  "3_principios",
  "4_analise",
  "5a_riscos",
  "5b_oportunidades",
  "6_decisao",
  "7_acao"
];

function montarFetchComLlm() {
  const mapa = mapaLlmFluxoFeliz();
  mockMre = criarChamarLlmMock(mapa);
  actosCg = [];
  let idxMre = 0;
  return async (url, init) => {
    const u = String(url);
    if (u.includes("llm-status")) {
      return {
        ok: true,
        json: async () => ({ ok: true, configurado: true })
      };
    }
    if (u.includes("deliberar")) {
      const body =
        init?.body && typeof init.body === "string"
          ? JSON.parse(init.body)
          : {};
      // Adaptador MRE: temperature 0.2; llm_rapido: 0.4
      const temp = Number(body.temperature);
      if (temp === 0.2) {
        const estagio =
          ESTAGIOS_MRE[Math.min(idxMre, ESTAGIOS_MRE.length - 1)];
        idxMre += 1;
        actosCg.push(`mre:${estagio}`);
        const out = await mockMre({
          estagio,
          schemaHint: "{}",
          contexto: {},
          retentativa: false
        });
        return {
          ok: true,
          json: async () => ({
            ok: true,
            texto: JSON.stringify(out),
            modelo: "mock-f3",
            uso: { prompt_tokens: 1, completion_tokens: 1 }
          })
        };
      }
      actosCg.push(temp === 0.4 ? "llm_rapido" : `llm_outro:${temp}`);
      return {
        ok: true,
        json: async () => ({
          ok: true,
          texto:
            "Análise rápida (bypass): priorizar pagamento sobre outdoor.",
          modelo: "mock-f3-rapido",
          uso: { prompt_tokens: 1, completion_tokens: 1 }
        })
      };
    }
    return { ok: false, status: 404, json: async () => ({}) };
  };
}

before(() => {
  configurarAdaptadorTrilhaLocal(() => ({ ok: true }));
  inicializarCatalogo();
  try {
    selecionarProjeto(COA);
  } catch {
    /* ok */
  }
  definirContextoConversacional(COA);
  definirComplexidadeRoteamentoAtivo(true);
  flagMre.ativo = true;
  fetchPrev = globalThis.fetch;
});

after(() => {
  globalThis.fetch = fetchPrev;
  delete process.env.CEO_FUNIL_DELIBERAR_UNICO;
});

beforeEach(() => {
  reiniciarStoresPosDeliberacaoParaTestes();
  delete process.env.CEO_FUNIL_DELIBERAR_UNICO;
  flagMre.ativo = true;
});

describe("IMP-094 F3 — flag rollback", () => {
  it("activa por omissão", () => {
    delete process.env.CEO_FUNIL_DELIBERAR_UNICO;
    assert.equal(funilDeliberarUnicoActiva(), true);
  });

  it("CEO_FUNIL_DELIBERAR_UNICO=off desactiva", () => {
    process.env.CEO_FUNIL_DELIBERAR_UNICO = "off";
    assert.equal(funilDeliberarUnicoActiva(), false);
    delete process.env.CEO_FUNIL_DELIBERAR_UNICO;
  });
});

describe("IMP-094 F3 — OBS-4 / OBS-8 helper", () => {
  it("anexa veredicto deliberar + cgAplicado quando llmInvocado", () => {
    const out = anexarObservabilidadeDeliberar(
      { ok: true, mensagem: "x", dados: { rota: "deliberativa" } },
      { llmInvocado: true }
    );
    assert.equal(out.dados.veredictoCaminho, "deliberar");
    assert.equal(out.dados.llmInvocado, true);
    assert.equal(out.dados.cgAplicado, true);
    assert.equal(out.dados.caminhoDeliberativo, "mre");
  });

  it("cgAplicado false quando sem LLM", () => {
    const out = anexarObservabilidadeDeliberar(
      { ok: true, mensagem: "x", dados: {} },
      { llmInvocado: false }
    );
    assert.equal(out.dados.llmInvocado, false);
    assert.equal(out.dados.cgAplicado, false);
    assert.equal(out.dados.caminhoDeliberativo, "mre");
  });
});

describe("IMP-094 F3 — elimina bypass llm_rapido", () => {
  it("moderado + flag on → MRE (não llm_rapido); OBS-4/8", async () => {
    globalThis.fetch = montarFetchComLlm();
    const out = await capacidadeIa.executar({
      instrucao: "em que ponto estamos?",
      historico: [],
      intencao: {
        id: "deliberar_objetivo",
        capacidade: "ia",
        classe: "conversa_projeto",
        destino: "nucleo_mre"
      },
      coaAtivo: { id: COA, nome: "CEO" },
      lastroConsciencia: {
        temContextoRelevante: true,
        factosOficiais: [
          "Briefing MG2: outdoor vs pagamento em disputa de prioridade"
        ]
      },
      memoria: () => ({}),
      skipFilaConsciencia: true
    });
    assert.notEqual(out.modo, "llm_rapido");
    assert.doesNotMatch(String(out.dados?.rota || ""), /deliberativa-rapida/);
    assert.equal(out.dados?.caminhoDeliberativo, "mre");
    assert.equal(out.dados?.veredictoCaminho, "deliberar");
    assert.equal(out.dados?.llmInvocado, true);
    assert.equal(out.dados?.cgAplicado, true);
    assert.ok(actosCg.some((a) => String(a).startsWith("mre:")));
    assert.ok(!actosCg.includes("llm_rapido"));
  });

  it("rollback off: moderado pode usar llm_rapido", async () => {
    process.env.CEO_FUNIL_DELIBERAR_UNICO = "off";
    globalThis.fetch = montarFetchComLlm();
    const out = await capacidadeIa.executar({
      instrucao: "em que ponto estamos?",
      historico: [],
      intencao: {
        id: "deliberar_objetivo",
        capacidade: "ia",
        classe: "conversa_projeto",
        destino: "nucleo_mre"
      },
      coaAtivo: { id: COA, nome: "CEO" },
      memoria: () => ({}),
      skipFilaConsciencia: true
    });
    assert.equal(out.modo, "llm_rapido");
    assert.match(String(out.dados?.rota || ""), /deliberativa-rapida/);
    assert.ok(actosCg.includes("llm_rapido"));
    delete process.env.CEO_FUNIL_DELIBERAR_UNICO;
  });

  it("C1 conhecimento geral permanece fora do caminho MRE deliberativo", async () => {
    const { gerarRespostaConhecimentoGeral } = await import(
      "../classificadorIntencao/respostaLeve.js"
    );
    globalThis.fetch = montarFetchComLlm();
    const out = await gerarRespostaConhecimentoGeral({
      texto: "Qual é a capital da França?",
      historico: []
    });
    assert.ok(out.ok !== false || out.mensagem);
    assert.notEqual(out.dados?.caminhoDeliberativo, "mre");
    assert.notEqual(out.modo, "mre");
    // C1 usa LLM directo (não acto mre:*)
    assert.ok(!actosCg.some((a) => String(a).startsWith("mre:")));
  });
});

describe("IMP-094 F3 — TC-20 via EE", () => {
  it("deliberação de projecto: MRE+CG, OBS-4/8, sem llm_rapido", async () => {
    globalThis.fetch = montarFetchComLlm();
    const out = await executiveEngine.executar({
      texto: TC20,
      historico: []
    });
    assert.equal(out.dados?.caminhoDeliberativo, "mre");
    assert.equal(out.dados?.veredictoCaminho, "deliberar");
    assert.equal(out.dados?.llmInvocado, true);
    assert.equal(out.dados?.cgAplicado, true);
    assert.notEqual(out.modo, "llm_rapido");
    assert.doesNotMatch(String(out.dados?.rota || ""), /deliberativa-rapida/);
    assert.ok(actosCg.some((a) => String(a).startsWith("mre:")));
    assert.ok(!actosCg.includes("llm_rapido"));
  });
});
