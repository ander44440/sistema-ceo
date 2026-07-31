/**
 * Testes Bloco 3 — IMP-017 / IMP-018 / IMP-019
 */

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  aplicarPrincipiosProibido,
  clonarComMutacoes,
  criarChamarLlmMock,
  criarPublicadorFilaMemoria,
  criarStoreRetencaoMemoria,
  despacharJobDoParecer,
  avaliarChecklistFecho,
  esbocoPlanoValMre,
  executarDeliberacaoMre,
  executarRotaDeliberativa,
  gerarRelatorioFechoImp010,
  mapaLlmFluxoFeliz,
  marcasBloco3Implementado,
  montarPlanoRetencao,
  parecerDelegarValido,
  parecerValidoCompleto,
  persistirRetencao,
  registarDecisaoGatePrincipio,
  reiniciarStoresPosDeliberacaoParaTestes
} from "./index.js";

test("T17-01: não despacha se acao ≠ despachar", async () => {
  const pub = criarPublicadorFilaMemoria();
  const r = await despacharJobDoParecer(parecerValidoCompleto(), {
    publicarJob: pub.publicarJob
  });
  assert.equal(r.despachado, false);
  assert.equal(r.motivo, "acao_nao_despachar");
  assert.equal(pub.jobs.length, 0);
});

test("T17-02: delegar → despacha job com parecerId", async () => {
  const pub = criarPublicadorFilaMemoria();
  const parecer = parecerDelegarValido();
  const r = await despacharJobDoParecer(parecer, {
    publicarJob: pub.publicarJob,
    registro: new Map()
  });
  assert.equal(r.despachado, true);
  assert.ok(r.job.id);
  assert.equal(r.job.parecerId, parecer.id);
  assert.equal(pub.jobs.length, 1);
});

test("T17-03: idempotência por parecerId", async () => {
  const pub = criarPublicadorFilaMemoria();
  const reg = new Map();
  const parecer = parecerDelegarValido();
  const r1 = await despacharJobDoParecer(parecer, {
    publicarJob: pub.publicarJob,
    registro: reg
  });
  const r2 = await despacharJobDoParecer(parecer, {
    publicarJob: pub.publicarJob,
    registro: reg
  });
  assert.equal(r1.despachado, true);
  assert.equal(r2.idempotente, true);
  assert.equal(pub.jobs.length, 1);
});

test("T17-04: parecer inválido não despacha", async () => {
  const pub = criarPublicadorFilaMemoria();
  const r = await despacharJobDoParecer({ id: "x" }, {
    publicarJob: pub.publicarJob
  });
  assert.equal(r.despachado, false);
  assert.equal(r.motivo, "parecer_invalido");
});

test("T17-05: rota deliberativa com delegar regista efeito fila", async () => {
  reiniciarStoresPosDeliberacaoParaTestes();
  const pub = criarPublicadorFilaMemoria();
  const mapa = mapaLlmFluxoFeliz({
    "6_decisao": {
      estado: "delegar",
      recomendacao: "Delegar outdoor",
      alternativas: [],
      justificativa:
        "Princípio Priorizar uso diário no MG2 (ADR-015); risco medio aceite; delegar."
    }
  });
  const out = await executarRotaDeliberativa(
    {
      instrucao: "Delegar o outdoor à fila",
      intencao: { id: "deliberar", capacidade: "ia" },
      memoria: () => ({ projetoAtivo: { id: "coa-mg2", nome: "MG2" } }),
      coaAtivo: { id: "coa-mg2", nome: "MG2" }
    },
    {
      chamarLlm: criarChamarLlmMock(mapa),
      publicarJob: pub.publicarJob
    }
  );
  assert.equal(out.ok, true);
  assert.equal(out.dados.efeitosPosDeliberacao.fila.despachado, true);
  assert.ok(pub.jobs[0].parecerId);
});

test("T18-01: persistir memória e precedente", () => {
  const store = criarStoreRetencaoMemoria();
  const parecer = parecerValidoCompleto();
  parecer.aprendizado = {
    registrarMemoria: true,
    criarPrecedente: true,
    atualizarPrincipios: false
  };
  const plano = montarPlanoRetencao(parecer.id, parecer.aprendizado);
  const r = persistirRetencao(parecer, plano, { store });
  assert.equal(r.persistido, true);
  assert.ok(r.registo.memoria);
  assert.ok(r.registo.precedente);
  assert.equal(store.listarMemorias().length, 1);
  assert.equal(store.listarPrecedentes().length, 1);
});

test("T18-02: proposta princípio fica pendente_gate (H1)", () => {
  const store = criarStoreRetencaoMemoria();
  const parecer = clonarComMutacoes(parecerValidoCompleto(), {
    "aprendizado.atualizarPrincipios": true,
    "aprendizado.propostaPrincipio":
      "Sempre priorizar desbloqueio operacional sobre polish visual no MG2."
  });
  const plano = montarPlanoRetencao(parecer.id, parecer.aprendizado);
  const r = persistirRetencao(parecer, plano, { store });
  assert.equal(r.persistido, true);
  assert.equal(r.registo.estadoHomologacaoPrincipio, "pendente_gate");
  assert.equal(store.listarPropostasPendentes().length, 1);
});

test("T18-03: idempotência retenção", () => {
  const store = criarStoreRetencaoMemoria();
  const parecer = parecerValidoCompleto();
  parecer.aprendizado.registrarMemoria = true;
  const plano = montarPlanoRetencao(parecer.id, parecer.aprendizado);
  persistirRetencao(parecer, plano, { store });
  const r2 = persistirRetencao(parecer, plano, { store });
  assert.equal(r2.idempotente, true);
  assert.equal(store.listarMemorias().length, 1);
});

test("T18-04: Gate regista veredicto sem aplicar princípio", () => {
  const store = criarStoreRetencaoMemoria();
  const parecer = clonarComMutacoes(parecerValidoCompleto(), {
    "aprendizado.atualizarPrincipios": true,
    "aprendizado.propostaPrincipio": "Regra geral testável de priorização MG2."
  });
  persistirRetencao(
    parecer,
    montarPlanoRetencao(parecer.id, parecer.aprendizado),
    { store }
  );
  const g = registarDecisaoGatePrincipio(parecer.id, "aprovado", store);
  assert.equal(g.ok, true);
  assert.equal(
    g.registo.estadoHomologacaoPrincipio,
    "aprovado_aguardando_aplicacao_manual"
  );
  assert.throws(() => aplicarPrincipiosProibido(), (e) => e.codigo === "H1_PROIBIDO");
});

test("T18-05: deliberação completa persiste retenção na fachada", async () => {
  reiniciarStoresPosDeliberacaoParaTestes();
  const store = criarStoreRetencaoMemoria();
  const out = await executarRotaDeliberativa(
    {
      instrucao: "Adiar outdoor e focar pagamento",
      intencao: { id: "deliberar", capacidade: "ia" },
      memoria: () => ({ projetoAtivo: { id: "coa-mg2", nome: "MG2" } }),
      coaAtivo: { id: "coa-mg2", nome: "MG2" }
    },
    {
      chamarLlm: criarChamarLlmMock(mapaLlmFluxoFeliz()),
      skipFila: true,
      storeRetencao: store
    }
  );
  assert.equal(out.ok, true);
  assert.equal(out.dados.efeitosPosDeliberacao.retencao.persistido, true);
});

test("T19-01: checklist incompleto sem marcas", () => {
  const c = avaliarChecklistFecho({});
  assert.equal(c.completo, false);
  assert.equal(c.okCount, 0);
});

test("T19-02: checklist completo com marcas Bloco 3", () => {
  const c = avaliarChecklistFecho(marcasBloco3Implementado());
  assert.equal(c.completo, true);
  assert.equal(c.okCount, 8);
});

test("T19-03: esboço VAL não declara produção", () => {
  const rel = gerarRelatorioFechoImp010();
  assert.equal(rel.checklist.completo, true);
  assert.equal(rel.valEsboco.status, "esboco");
  assert.equal(rel.producao.declarada, false);
  const esboco = esbocoPlanoValMre();
  assert.ok(esboco.objetivos.length >= 3);
});

test("T19-04: pipeline Bloco 1 ainda válido após Bloco 3", async () => {
  const out = await executarDeliberacaoMre(
    {
      mensagem: "Priorizar pagamento?",
      coaId: "coa-mg2",
      snapshotPainel: { resumo: "ok" },
      factosOficiais: ["f1"],
      intencao: { id: "deliberar" }
    },
    { chamarLlm: criarChamarLlmMock(mapaLlmFluxoFeliz()) }
  );
  assert.equal(out.ok, true);
});
