/**
 * Lastro normativo por COA — princípios MG2 não contaminam outros projectos.
 */
import assert from "node:assert/strict";
import { test, beforeEach } from "node:test";
import {
  catalogoPrincipiosParaCoa,
  ehPrincipioEscopoMg2,
  PRINCIPIO_USO_DIARIO_MG2,
  PRINCIPIO_USO_DIARIO_ACTIVO
} from "../mre/pipeline/catalogoPrincipios.js";
import { estagio3Principios } from "../mre/pipeline/estagios.js";
import {
  executarRotaDeliberativa,
  reiniciarStoresPosDeliberacaoParaTestes,
  montarEntradaMre
} from "../mre/integracaoNucleo.js";
import {
  criarChamarLlmMock,
  mapaLlmFluxoFeliz
} from "../mre/pipeline/llmMock.js";
import { criarPublicadorFilaMemoria } from "../motorExecucao/ponteParecerJob.js";
import { detectarPedidoDecisaoExplicita } from "../classificadorIntencao/pedidoDecisaoExplicita.js";
import { deveAnexarManifestoMg2 } from "../camadaConhecimento/manifestoMg2.js";
import { resetStoreContinuidadePadrao } from "../continuidadeGate/integracaoConversa.js";
import { resetEstadoTopicosSessao } from "../classificadorIntencao/topicosSessao.js";
import { resetEstadoObjectivoSessao } from "../classificadorIntencao/objectivoSessao.js";
import { reiniciarAutoridadeDelegadaParaTestes } from "../autoridadeDelegada/autoridadeDelegada.js";
import {
  criarProjeto,
  obterProjetoAtivo,
  obterProjetoAtivoId,
  recarregarCatalogo,
  inicializarCatalogo,
  selecionarProjeto
} from "../catalogoProjetos/index.js";

function criarStorage() {
  const map = new Map();
  return {
    getItem(k) {
      return map.has(String(k)) ? map.get(String(k)) : null;
    },
    setItem(k, v) {
      map.set(String(k), String(v));
    },
    removeItem(k) {
      map.delete(String(k));
    }
  };
}

beforeEach(() => {
  globalThis.localStorage = criarStorage();
  recarregarCatalogo();
  inicializarCatalogo();
  resetStoreContinuidadePadrao();
  resetEstadoTopicosSessao();
  resetEstadoObjectivoSessao();
  reiniciarAutoridadeDelegadaParaTestes();
  reiniciarStoresPosDeliberacaoParaTestes();
});

const MSG_DECIDE = `Engenharia recomenda estabilidade.
Financeiro recomenda cortar custo.
Comercial recomenda acelerar.

Decide qual posição prevalece.
Não quero que delegues a análise.`;

function assertSemMg2NosPrincipios(principios) {
  for (const p of principios || []) {
    assert.equal(
      ehPrincipioEscopoMg2(p),
      false,
      `princípio contaminado: ${p}`
    );
    assert.doesNotMatch(String(p), /\bMG2\b/);
  }
}

test("unit: catálogo AlfaTech/outro exclui MG2; MG2 inclui", () => {
  const alfa = catalogoPrincipiosParaCoa({ id: "prj-alfa", nome: "AlfaTech" });
  const outro = catalogoPrincipiosParaCoa({ id: "prj-beta", nome: "BetaCorp" });
  const mg2 = catalogoPrincipiosParaCoa({ id: "prj-mg2", nome: "Motoboy Game 2" });
  assert.ok(!alfa.includes(PRINCIPIO_USO_DIARIO_MG2));
  assert.ok(alfa.includes(PRINCIPIO_USO_DIARIO_ACTIVO));
  assert.ok(!outro.includes(PRINCIPIO_USO_DIARIO_MG2));
  assert.ok(mg2.includes(PRINCIPIO_USO_DIARIO_MG2));
});

test("AlfaTech + deliberação → nenhum princípio contém MG2", async () => {
  const p = criarProjeto({ nome: "AlfaTech" });
  selecionarProjeto(p.id);
  const idAntes = obterProjetoAtivoId();
  const coa = { id: p.id, nome: "AlfaTech" };
  const pub = criarPublicadorFilaMemoria();
  const out = await executarRotaDeliberativa(
    {
      instrucao: "Priorize outdoor versus pagamento nesta sprint.",
      intencao: {
        id: "deliberar_objetivo",
        capacidade: "ia",
        classe: "conversa_projeto"
      },
      coaAtivo: coa,
      memoria: () => ({ projetoAtivo: { id: coa.id, nome: coa.nome } })
    },
    {
      chamarLlm: criarChamarLlmMock(
        mapaLlmFluxoFeliz({
          "3_principios": {
            principiosAplicados: [
              "Respeito absoluto ao tempo do utilizador",
              PRINCIPIO_USO_DIARIO_MG2
            ]
          }
        })
      ),
      publicarJob: pub.publicarJob.bind(pub)
    }
  );
  assert.equal(out.ok, true);
  const princ = out.dados?.parecer?.principiosAplicados || [];
  assertSemMg2NosPrincipios(princ);
  assert.ok(princ.includes("Respeito absoluto ao tempo do utilizador"));
  assert.equal(obterProjetoAtivoId(), idAntes);
  assert.equal(obterProjetoAtivo()?.nome, "AlfaTech");
});

test("MG2 + deliberação → princípio específico MG2 pode aparecer", async () => {
  const coa = { id: "prj-mg2", nome: "Motoboy Game 2" };
  const pub = criarPublicadorFilaMemoria();
  const out = await executarRotaDeliberativa(
    {
      instrucao: "Priorize outdoor versus pagamento no MG2.",
      intencao: {
        id: "deliberar_objetivo",
        capacidade: "ia",
        classe: "conversa_projeto"
      },
      coaAtivo: coa,
      memoria: () => ({ projetoAtivo: { id: coa.id, nome: coa.nome } })
    },
    {
      chamarLlm: criarChamarLlmMock(mapaLlmFluxoFeliz({}, { escopoMg2: true })),
      publicarJob: pub.publicarJob.bind(pub)
    }
  );
  assert.equal(out.ok, true);
  const princ = out.dados?.parecer?.principiosAplicados || [];
  assert.ok(
    princ.some((p) => ehPrincipioEscopoMg2(p)),
    `esperava princípio MG2: ${JSON.stringify(princ)}`
  );
});

test("outro COA + deliberação → nenhum princípio específico MG2", async () => {
  const p = criarProjeto({ nome: "BetaCorp" });
  selecionarProjeto(p.id);
  const coa = { id: p.id, nome: "BetaCorp" };
  const pub = criarPublicadorFilaMemoria();
  const out = await executarRotaDeliberativa(
    {
      instrucao: "Decida o foco da sprint.",
      intencao: {
        id: "deliberar_objetivo",
        capacidade: "ia",
        classe: "conversa_projeto"
      },
      coaAtivo: coa,
      memoria: () => ({ projetoAtivo: { id: coa.id, nome: coa.nome } })
    },
    {
      chamarLlm: criarChamarLlmMock(
        mapaLlmFluxoFeliz({
          "3_principios": {
            principiosAplicados: [PRINCIPIO_USO_DIARIO_MG2]
          }
        })
      ),
      publicarJob: pub.publicarJob.bind(pub)
    }
  );
  assert.equal(out.ok, true);
  assertSemMg2NosPrincipios(out.dados?.parecer?.principiosAplicados);
});

test("fallback LLM vazio + AlfaTech → nunca inserir MG2", async () => {
  const lacunas = [];
  const out = await estagio3Principios(
    { natureza: "tatica", objetivoReal: "x", problemaNegocio: "y" },
    { tipoPedido: "decisao", urgencia: "media", escopo: "z" },
    {
      coaAtivo: { id: "prj-alfa", nome: "AlfaTech" },
      chamarLlm: async () => ({ principiosAplicados: [] })
    },
    lacunas
  );
  assert.ok(out.includes("Respeito absoluto ao tempo do utilizador"));
  assertSemMg2NosPrincipios(out);
  assert.ok(!out.includes(PRINCIPIO_USO_DIARIO_MG2));
});

test("pedido explícito Manifesto MG2 → anexação continua", () => {
  const msg =
    "Avalie a proposta segundo o Manifesto do MG2 e dê uma recomendação.";
  assert.equal(deveAnexarManifestoMg2(msg, { id: "prj-alfatech", nome: "AlfaTech" }), true);
  assert.equal(deveAnexarManifestoMg2(msg, { id: "prj-mg2", nome: "MG2" }), true);
  const entrada = montarEntradaMre({
    instrucao: msg,
    coaAtivo: { id: "prj-mg2", nome: "Motoboy Game 2" },
    manifestoMg2: {
      ok: true,
      origem: "manifesto_mg2_canonico",
      caminhoRelativo: "docs/MANIFESTO-MG2.md",
      principiosSelecionaveis: ["§13 O mundo deve contar a história"],
      secoes: [],
      conteudo: "# Manifesto"
    }
  });
  assert.equal(entrada.manifestoMg2?.ok, true);
  assert.match(entrada.mensagem, /DIRETRIZ CANÓNICA|Manifesto/i);
});

test("decisão sob conflito + AlfaTech → fecho sem lastro MG2", async () => {
  assert.equal(detectarPedidoDecisaoExplicita(MSG_DECIDE), true);
  const p = criarProjeto({ nome: "AlfaTech" });
  selecionarProjeto(p.id);
  const idAntes = obterProjetoAtivoId();
  const coa = { id: p.id, nome: "AlfaTech" };
  const pub = criarPublicadorFilaMemoria();
  const out = await executarRotaDeliberativa(
    {
      instrucao: MSG_DECIDE,
      intencao: {
        id: "deliberar_objetivo",
        capacidade: "ia",
        classe: "conversa_projeto"
      },
      coaAtivo: coa,
      memoria: () => ({ projetoAtivo: { id: coa.id, nome: coa.nome } })
    },
    {
      chamarLlm: criarChamarLlmMock(
        mapaLlmFluxoFeliz({
          "4_analise": { analise: "Três posições em tensão." },
          "6_decisao": {
            estado: "delegar",
            recomendacao:
              "Delegar a análise a uma equipe especializada pelo conflito",
            alternativas: [
              "Priorizar estabilidade técnica",
              "Cortar custo",
              "Acelerar aquisição"
            ],
            justificativa: "Há conflito entre áreas."
          }
        })
      ),
      publicarJob: pub.publicarJob.bind(pub)
    }
  );
  assert.equal(out.ok, true);
  const de = out.dados?.parecer?.decisaoExecutiva;
  assert.notEqual(de.estado, "delegar");
  assert.match(String(de.recomendacao), /escolha executiva|Priorizar estabilidade|Decisão/i);
  assertSemMg2NosPrincipios(out.dados?.parecer?.principiosAplicados);
  assert.doesNotMatch(String(out.mensagem || ""), /Priorizar uso diário no MG2/i);
  assert.equal(obterProjetoAtivoId(), idAntes);
  assert.equal(obterProjetoAtivo()?.nome, "AlfaTech");
});
