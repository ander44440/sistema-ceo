/**
 * Isolamento da MTE por COA (Opção C) — residual não atravessa projecto.
 */
import assert from "node:assert/strict";
import { test, beforeEach } from "node:test";
import {
  actualizarMemoriaTrabalhoExecutiva,
  obterMemoriaTrabalhoExecutiva,
  resetMemoriaTrabalhoExecutiva,
  factosLastroRefinoEic,
  definirRefinoEicAtivo
} from "./refinoEic.js";
import { construirContextoSessao } from "./contextoSessao.js";
import { lastroSugereMissao } from "../classificadorIntencao/preservarMissao.js";
import {
  enriquecerMensagemComMemoriaTrabalho,
  montarEntradaMre
} from "../mre/integracaoNucleo.js";
import { aplicarPromocaoResultadoAoLastro } from "../motorExecucao/acompanhamentoJob.js";
import {
  criarProjeto,
  limparProjetoAtivo,
  recarregarCatalogo,
  registrarDecisao,
  selecionarProjeto
} from "../catalogoProjetos/index.js";
import { VERSAO, gravarDocumento } from "../catalogoProjetos/persistencia.js";

const MARCA_A = "MARCADOR-ALFA-UNICO-MTE";
const ACAO_A = "ACAO-ALFA-UNICA-MTE";
const MARCA_B = "DECISAO-BRAVO-MTE";
const ACAO_B = "ACAO-BRAVO-MTE";

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

function resetCatalogoVazio() {
  globalThis.localStorage = criarStorage();
  gravarDocumento({
    versao: VERSAO,
    projetoAtivoId: null,
    empresaAtivaId: null,
    empresas: [],
    projetos: [],
    gabinete: {}
  });
  recarregarCatalogo();
}

function coaDe(projeto) {
  return { id: projeto.id, nome: projeto.nome };
}

function actualizarNoCoa(projeto, extra = {}) {
  return actualizarMemoriaTrabalhoExecutiva({
    fase: extra.fase || "pre",
    mensagem: extra.mensagem || "continuar",
    classe: "conversa_projeto",
    destino: extra.destino || "nucleo_mre",
    veredictoVca: extra.veredictoVca || "pertence",
    coa: coaDe(projeto),
    objetivoConversacional: extra.objetivoConversacional || null,
    memoriaExecutiva: extra.memoriaExecutiva || {
      decisoes: [],
      pendencias: [],
      proximasAcoes: []
    },
    promocoesResultadoOperacao: extra.promocoesResultadoOperacao,
    resposta: extra.resposta
  });
}

function lastroDesp009(mte) {
  return {
    temContextoRelevante: true,
    memoriaTrabalhoExecutiva: mte,
    factosOficiais: factosLastroRefinoEic(mte)
  };
}

beforeEach(() => {
  definirRefinoEicAtivo(true);
  resetMemoriaTrabalhoExecutiva();
  resetCatalogoVazio();
});

test("isolamento A → B: MTE de A não entra no lastro/MRE de B", () => {
  const a = criarProjeto({ nome: "COA MTE Alfa" });
  const b = criarProjeto({ nome: "COA MTE Bravo" });
  selecionarProjeto(a.id);

  const mA = actualizarNoCoa(a, {
    mensagem: `objectivo ${MARCA_A}`,
    objetivoConversacional: {
      id: "oa",
      enunciado: MARCA_A,
      origem: "usuario",
      actualizadoEm: "t"
    },
    memoriaExecutiva: {
      decisoes: [{ texto: MARCA_A }],
      pendencias: [{ texto: MARCA_A, status: "aberta" }],
      proximasAcoes: [{ texto: ACAO_A }]
    }
  });
  assert.match(String(mA.proximaAcao), new RegExp(ACAO_A));
  assert.equal(mA.coaId, a.id);

  selecionarProjeto(b.id);
  const mB = actualizarNoCoa(b, {
    mensagem: "abrir frente nova",
    memoriaExecutiva: {
      decisoes: [{ texto: MARCA_B }],
      pendencias: [],
      proximasAcoes: [{ texto: ACAO_B }]
    }
  });

  assert.equal(mB.coaId, b.id);
  assert.doesNotMatch(JSON.stringify(mB), new RegExp(MARCA_A));
  assert.doesNotMatch(JSON.stringify(mB), new RegExp(ACAO_A));
  assert.equal(obterMemoriaTrabalhoExecutiva(a.id), null);
  assert.equal(obterMemoriaTrabalhoExecutiva(b.id)?.coaId, b.id);

  const lastroB = lastroDesp009(mB);
  assert.doesNotMatch(JSON.stringify(lastroB), new RegExp(MARCA_A));
  const msgMre = enriquecerMensagemComMemoriaTrabalho("pedido B", lastroB);
  assert.doesNotMatch(msgMre, new RegExp(MARCA_A));
  const entrada = montarEntradaMre({
    instrucao: "como avançamos?",
    coaAtivo: coaDe(b),
    memoria: () => ({ pendencias: [] }),
    lastroConsciencia: lastroB
  });
  assert.doesNotMatch(entrada.mensagem, new RegExp(MARCA_A));
  assert.doesNotMatch(entrada.mensagem, new RegExp(ACAO_A));
});

test("continuidade dentro do mesmo COA", () => {
  const a = criarProjeto({ nome: "COA MTE Continuidade" });
  actualizarNoCoa(a, {
    objetivoConversacional: {
      id: "oa",
      enunciado: MARCA_A,
      origem: "usuario",
      actualizadoEm: "t"
    },
    memoriaExecutiva: {
      decisoes: [{ texto: MARCA_A }],
      pendencias: [],
      proximasAcoes: [{ texto: ACAO_A }]
    }
  });
  const t2 = actualizarNoCoa(a, {
    mensagem: "e agora?"
  });
  assert.equal(t2.coaId, a.id);
  assert.match(String(t2.proximaAcao), new RegExp(ACAO_A));
  assert.match(String(t2.objectivoAtivo), new RegExp(MARCA_A));
});

test("DESP-009: mesmo COA sem F2 — MTE corrente entra no lastro C2", () => {
  const a = criarProjeto({ nome: "COA MTE Desp009" });
  const mte = actualizarNoCoa(a, {
    objetivoConversacional: {
      id: "oa",
      enunciado: MARCA_A,
      origem: "usuario",
      actualizadoEm: "t"
    },
    memoriaExecutiva: {
      decisoes: [{ texto: MARCA_A }],
      pendencias: [{ texto: "pendência A", status: "aberta" }],
      proximasAcoes: [{ texto: ACAO_A }]
    }
  });
  const lastro = lastroDesp009(mte);
  assert.equal(lastro.temContextoRelevante, true);
  assert.equal(lastro.memoriaTrabalhoExecutiva.coaId, a.id);
  assert.ok(lastro.factosOficiais.some((f) => new RegExp(ACAO_A).test(f)));
  const entrada = montarEntradaMre({
    instrucao: "ok",
    coaAtivo: coaDe(a),
    memoria: () => ({ pendencias: [] }),
    lastroConsciencia: lastro
  });
  assert.match(entrada.mensagem, new RegExp(ACAO_A));
  assert.match(entrada.mensagem, /Estado executivo da conversa|hierarquia de objectivos/i);
});

test("reconstrução ao entrar em B usa o contexto de B, não o residual de A", () => {
  const a = criarProjeto({ nome: "COA MTE Rebuild A" });
  const b = criarProjeto({ nome: "COA MTE Rebuild B" });
  selecionarProjeto(a.id);
  actualizarNoCoa(a, {
    objetivoConversacional: {
      id: "oa",
      enunciado: MARCA_A,
      origem: "usuario",
      actualizadoEm: "t"
    },
    memoriaExecutiva: {
      decisoes: [{ texto: MARCA_A }],
      pendencias: [{ texto: MARCA_A, status: "aberta" }],
      proximasAcoes: [{ texto: ACAO_A }]
    }
  });

  selecionarProjeto(b.id);
  registrarDecisao(MARCA_B, "teste");
  const mB = actualizarNoCoa(b, {
    objetivoConversacional: {
      id: "ob",
      enunciado: "frente Bravo",
      origem: "usuario",
      actualizadoEm: "t"
    },
    memoriaExecutiva: {
      decisoes: [{ texto: MARCA_B }],
      pendencias: [],
      proximasAcoes: [{ texto: ACAO_B }]
    }
  });
  assert.match(String(mB.decisoesTomadas.join(" ")), new RegExp(MARCA_B));
  assert.match(String(mB.proximaAcao), new RegExp(ACAO_B));
  assert.doesNotMatch(String(mB.objectivoAtivo || ""), new RegExp(MARCA_A));
  assert.doesNotMatch(String(mB.proximaAcao || ""), new RegExp(ACAO_A));
});

test("limparProjetoAtivo limpa a MTE", () => {
  const a = criarProjeto({ nome: "COA MTE Fechar" });
  actualizarNoCoa(a, {
    memoriaExecutiva: {
      decisoes: [],
      pendencias: [],
      proximasAcoes: [{ texto: ACAO_A }]
    }
  });
  assert.ok(obterMemoriaTrabalhoExecutiva());
  limparProjetoAtivo();
  assert.equal(obterMemoriaTrabalhoExecutiva(), null);
  assert.equal(obterMemoriaTrabalhoExecutiva(a.id), null);
});

test("VCA negado não escreve sobre o slot de outro COA", () => {
  const a = criarProjeto({ nome: "COA MTE VCA" });
  actualizarNoCoa(a, {
    memoriaExecutiva: {
      decisoes: [],
      pendencias: [],
      proximasAcoes: [{ texto: ACAO_A }]
    }
  });
  const aposVca = actualizarMemoriaTrabalhoExecutiva({
    fase: "pre",
    mensagem: "Não pode alterar o MARCADOR-VCA-NEGADO. Qual a capital da França?",
    classe: "conhecimento_geral",
    destino: "resposta_leve",
    veredictoVca: "nao_pertence",
    coa: null,
    memoriaExecutiva: { decisoes: [], pendencias: [], proximasAcoes: [] }
  });
  assert.match(String(aposVca?.proximaAcao), new RegExp(ACAO_A));
  assert.doesNotMatch(JSON.stringify(aposVca || {}), /MARCADOR-VCA-NEGADO/);
  const slot = obterMemoriaTrabalhoExecutiva(a.id);
  assert.equal(slot?.coaId, a.id);
  assert.match(String(slot.proximaAcao), new RegExp(ACAO_A));
});

test("lastroSugereMissao não arma missão de A no lastro reconstruído de B", () => {
  const a = criarProjeto({ nome: "COA MTE Missao A" });
  const b = criarProjeto({ nome: "COA MTE Missao B" });
  const mA = actualizarNoCoa(a, {
    memoriaExecutiva: {
      decisoes: [],
      pendencias: [],
      proximasAcoes: [{ texto: ACAO_A }]
    }
  });
  assert.equal(
    lastroSugereMissao({
      deps: { lastroConsciencia: { memoriaTrabalhoExecutiva: mA } }
    }),
    true
  );

  selecionarProjeto(b.id);
  const mB = actualizarNoCoa(b, {
    mensagem: "olá",
    memoriaExecutiva: { decisoes: [], pendencias: [], proximasAcoes: [] }
  });
  assert.doesNotMatch(String(mB.proximaAcao || ""), new RegExp(ACAO_A));
  assert.equal(
    lastroSugereMissao({
      deps: {
        lastroConsciencia: {
          memoriaTrabalhoExecutiva: mB
        }
      }
    }),
    false
  );
});

test("construirContextoSessao em B não mostra MTE de A", () => {
  const a = criarProjeto({ nome: "COA MTE Painel A" });
  const b = criarProjeto({ nome: "COA MTE Painel B" });
  selecionarProjeto(a.id);
  actualizarNoCoa(a, {
    objetivoConversacional: {
      id: "oa",
      enunciado: MARCA_A,
      origem: "usuario",
      actualizadoEm: "t"
    },
    memoriaExecutiva: {
      decisoes: [],
      pendencias: [],
      proximasAcoes: [{ texto: ACAO_A }]
    }
  });
  const ctxA = construirContextoSessao({
    memoria: {
      decisoes: [],
      pendencias: [],
      proximasAcoes: [],
      projetoAtivo: a,
      projetosAtivos: [],
      ultimasAcoes: []
    },
    coa: coaDe(a),
    intencao: { id: "x", capacidade: "ia" }
  });
  assert.match(ctxA, new RegExp(ACAO_A));

  selecionarProjeto(b.id);
  actualizarNoCoa(b, {
    memoriaExecutiva: { decisoes: [], pendencias: [], proximasAcoes: [] }
  });
  const ctxB = construirContextoSessao({
    memoria: {
      decisoes: [],
      pendencias: [],
      proximasAcoes: [],
      projetoAtivo: b,
      projetosAtivos: [],
      ultimasAcoes: []
    },
    coa: coaDe(b),
    intencao: { id: "x", capacidade: "ia" }
  });
  assert.doesNotMatch(ctxB, new RegExp(MARCA_A));
  assert.doesNotMatch(ctxB, new RegExp(ACAO_A));
});

test("promoções F2 em B não reintroduzem MTE de A", () => {
  const a = criarProjeto({ nome: "COA MTE Promo A" });
  const b = criarProjeto({ nome: "COA MTE Promo B" });
  selecionarProjeto(a.id);
  const mA = actualizarNoCoa(a, {
    memoriaExecutiva: {
      decisoes: [],
      pendencias: [],
      proximasAcoes: [{ texto: ACAO_A }]
    }
  });
  const lastroComPromoA = aplicarPromocaoResultadoAoLastro(
    { temContextoRelevante: false, memoriaTrabalhoExecutiva: mA },
    [
      {
        jobId: "JOB-000111",
        estado: "result",
        sintese: MARCA_A,
        evidencias: [],
        actualizadoEm: "2026-08-12T00:00:00.000Z"
      }
    ]
  );
  assert.match(JSON.stringify(lastroComPromoA), new RegExp(ACAO_A));

  selecionarProjeto(b.id);
  const mB = actualizarNoCoa(b, {
    memoriaExecutiva: { decisoes: [], pendencias: [], proximasAcoes: [] },
    promocoesResultadoOperacao: [
      {
        jobId: "JOB-000222",
        estado: "result",
        sintese: "resultado Bravo",
        titulo: "Bravo",
        evidencias: [],
        actualizadoEm: "2026-08-12T00:00:00.000Z"
      }
    ]
  });
  assert.equal(mB.coaId, b.id);
  assert.doesNotMatch(JSON.stringify(mB), new RegExp(ACAO_A));
  assert.doesNotMatch(JSON.stringify(mB), new RegExp(MARCA_A));
  assert.match(String(mB.proximaAcao || mB.objectivoAtivo || ""), /JOB-000222/);

  const lastroFinal = lastroDesp009(mB);
  const lastroComPromoB = aplicarPromocaoResultadoAoLastro(lastroFinal, [
    {
      jobId: "JOB-000222",
      estado: "result",
      sintese: "resultado Bravo",
      evidencias: [],
      actualizadoEm: "2026-08-12T00:00:00.000Z"
    }
  ]);
  assert.doesNotMatch(JSON.stringify(lastroComPromoB), new RegExp(ACAO_A));
  assert.match(JSON.stringify(lastroComPromoB), /JOB-000222/);
});
