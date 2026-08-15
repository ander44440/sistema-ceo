/**
 * Frente 3 — disciplina factual / lastro (emenda DESP-009).
 * Matriz F3-01 … F3-12 do contrato aprovado.
 */
import assert from "node:assert/strict";
import { test, beforeEach } from "node:test";
import {
  actualizarMemoriaTrabalhoExecutiva,
  definirRefinoEicAtivo,
  factosLastroRefinoEic,
  resetMemoriaTrabalhoExecutiva
} from "./refinoEic.js";
import {
  enriquecerMensagemComMemoriaTrabalho,
  montarEntradaMre
} from "../mre/integracaoNucleo.js";
import { aplicarPromocaoResultadoAoLastro } from "../motorExecucao/acompanhamentoJob.js";
import {
  atualizarAposInstrucao,
  detectarPromocaoDecisaoProduto,
  lerMemoria
} from "../executiveMemory/index.js";
import {
  criarProjeto,
  inicializarCatalogo,
  recarregarCatalogo,
  selecionarProjeto
} from "../catalogoProjetos/index.js";
import { reconhecerDecisao } from "../continuidadeGate/reconhecerDecisao.js";

const REC = "Adiar outdoor; focar pagamento";
const PEDIDO_ANALISE =
  "Analise e recomende. Não execute. Não decida por mim.";
const PEDIDO_APROVAR_PALAVRA =
  "Diga se aprovar, modificar ou não priorizar a proposta.";

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

function resetCatalogo() {
  globalThis.localStorage = criarStorage();
  recarregarCatalogo();
  inicializarCatalogo();
}

function respostaParecerAprovar(recomendacao, acaoDesc) {
  return {
    ok: true,
    mensagem: `Aprovo: ${recomendacao}`,
    dados: {
      parecer: {
        decisaoExecutiva: {
          estado: "aprovar",
          recomendacao
        },
        acao: acaoDesc ? { descricao: acaoDesc } : {}
      }
    }
  };
}

function colherPos(mensagem, extra = {}) {
  return actualizarMemoriaTrabalhoExecutiva({
    fase: "pos",
    mensagem,
    memoriaExecutiva: extra.memoriaExecutiva || {
      decisoes: [],
      pendencias: [],
      proximasAcoes: []
    },
    resposta: extra.resposta || respostaParecerAprovar(REC, "Validar Sprint 1"),
    promocoesResultadoOperacao: extra.promocoesResultadoOperacao
  });
}

function lastroDe(mte) {
  return {
    temContextoRelevante: true,
    memoriaTrabalhoExecutiva: mte,
    factosOficiais: factosLastroRefinoEic(mte)
  };
}

function temDecisaoEmVigorCom(texto, recorte) {
  const linhas = Array.isArray(texto) ? texto : [String(texto || "")];
  const rxRec = recorte instanceof RegExp ? recorte : new RegExp(recorte, "i");
  return linhas.some(
    (l) => /Decisão em vigor/i.test(l) && rxRec.test(l)
  );
}

beforeEach(() => {
  definirRefinoEicAtivo(true);
  resetMemoriaTrabalhoExecutiva();
  resetCatalogo();
});

test("F3-01: análise sem fecho não promove recomendação a decisão vigente", () => {
  actualizarMemoriaTrabalhoExecutiva({
    fase: "pre",
    mensagem: PEDIDO_ANALISE,
    objetivoConversacional: {
      id: "o",
      enunciado: "Usar CEO no MG2",
      origem: "usuario",
      actualizadoEm: "t"
    },
    memoriaExecutiva: { decisoes: [], pendencias: [], proximasAcoes: [] }
  });
  const pos = colherPos(PEDIDO_ANALISE);
  assert.equal(
    pos.decisoesTomadas.some((d) => /Adiar outdoor/i.test(d)),
    false
  );
  assert.match(String(pos.posicaoCeoNaoVigente || ""), /Adiar outdoor/i);
  const factos = factosLastroRefinoEic(pos);
  assert.equal(temDecisaoEmVigorCom(factos, /Adiar outdoor/), false);
  assert.ok(
    factos.some(
      (f) =>
        /Posição do CEO \(não vigente\)/i.test(f) && /Adiar outdoor/i.test(f)
    )
  );
});

test("F3-02: continuidade N+1 não trata recomendação como facto confirmado", () => {
  actualizarMemoriaTrabalhoExecutiva({
    fase: "pre",
    mensagem: PEDIDO_ANALISE,
    memoriaExecutiva: { decisoes: [], pendencias: [], proximasAcoes: [] }
  });
  colherPos(PEDIDO_ANALISE);

  const n1 = actualizarMemoriaTrabalhoExecutiva({
    fase: "pre",
    mensagem: "O que está decidido? e agora?",
    memoriaExecutiva: { decisoes: [], pendencias: [], proximasAcoes: [] }
  });
  const factos = factosLastroRefinoEic(n1);
  const entrada = montarEntradaMre({
    instrucao: "O que está decidido?",
    memoria: () => ({ pendencias: [] }),
    lastroConsciencia: lastroDe(n1)
  });
  const enriquecida = enriquecerMensagemComMemoriaTrabalho(
    "O que está decidido?",
    lastroDe(n1)
  );

  assert.equal(temDecisaoEmVigorCom(factos, /Adiar outdoor/), false);
  assert.equal(temDecisaoEmVigorCom(entrada.mensagem, /Adiar outdoor/), false);
  assert.equal(temDecisaoEmVigorCom(enriquecida, /Adiar outdoor/), false);
  assert.match(enriquecida, /Posição do CEO \(não vigente\)/i);
  assert.equal(
    n1.decisoesTomadas.some((d) => /Adiar outdoor/i.test(d)),
    false
  );
});

test("F3-03: «aprovar, modificar ou não priorizar» não registra decisão", () => {
  const p = criarProjeto({ nome: "Frente 3 F3-03" });
  selecionarProjeto(p.id);
  assert.equal(detectarPromocaoDecisaoProduto(PEDIDO_APROVAR_PALAVRA), null);
  const antes = (lerMemoria().decisoes || []).length;
  atualizarAposInstrucao({
    instrucao: PEDIDO_APROVAR_PALAVRA,
    capacidade: "ia",
    ok: true,
    mensagem: "análise"
  });
  assert.equal((lerMemoria().decisoes || []).length, antes);
  atualizarAposInstrucao({
    instrucao: PEDIDO_ANALISE,
    capacidade: "ia",
    ok: true,
    mensagem: "análise"
  });
  assert.equal((lerMemoria().decisoes || []).length, antes);
});

test("F3-04: estado «aprovar» do parecer não é aprovação do utilizador", () => {
  actualizarMemoriaTrabalhoExecutiva({
    fase: "pre",
    mensagem: PEDIDO_ANALISE,
    memoriaExecutiva: { decisoes: [], pendencias: [], proximasAcoes: [] }
  });
  const pos = colherPos(PEDIDO_ANALISE);
  assert.equal(pos.decisoesTomadas.length, 0);
  assert.match(String(pos.posicaoCeoNaoVigente || ""), /Adiar outdoor/i);
});

test("F3-05: Speaker «Aprovo: …» não vira Decisão em vigor", () => {
  actualizarMemoriaTrabalhoExecutiva({
    fase: "pre",
    mensagem: PEDIDO_ANALISE,
    memoriaExecutiva: { decisoes: [], pendencias: [], proximasAcoes: [] }
  });
  const pos = actualizarMemoriaTrabalhoExecutiva({
    fase: "pos",
    mensagem: PEDIDO_ANALISE,
    memoriaExecutiva: { decisoes: [], pendencias: [], proximasAcoes: [] },
    resposta: {
      ok: true,
      mensagem: `Aprovo: ${REC}`,
      dados: {
        parecer: {
          decisaoExecutiva: { estado: "aprovar", recomendacao: REC },
          acao: { descricao: "Validar Sprint 1" }
        }
      }
    }
  });
  assert.equal(detectarPromocaoDecisaoProduto("Aprovo"), null);
  assert.equal(detectarPromocaoDecisaoProduto(`Aprovo: ${REC}`), null);
  assert.equal(
    pos.decisoesTomadas.some((d) => /Adiar outdoor/i.test(d)),
    false
  );
  assert.equal(pos.ciclo?.decisao || null, null);
  assert.equal(
    temDecisaoEmVigorCom(factosLastroRefinoEic(pos), /Adiar outdoor/),
    false
  );
});

test("F3-06: «Fica decidido: X» promove a decisão vigente", () => {
  actualizarMemoriaTrabalhoExecutiva({
    fase: "pre",
    mensagem: PEDIDO_ANALISE,
    memoriaExecutiva: { decisoes: [], pendencias: [], proximasAcoes: [] }
  });
  colherPos(PEDIDO_ANALISE);

  const fecho = `Fica decidido: ${REC}`;
  const promo = detectarPromocaoDecisaoProduto(fecho);
  assert.equal(promo?.tipo, "aceite");
  assert.match(String(promo?.texto || ""), /Adiar outdoor/i);

  const pos = colherPos(fecho);
  assert.ok(pos.decisoesTomadas.some((d) => /Adiar outdoor/i.test(d)));
  assert.equal(pos.posicaoCeoNaoVigente, null);
  assert.ok(temDecisaoEmVigorCom(factosLastroRefinoEic(pos), /Adiar outdoor/));
});

test("F3-07: «Rejeito X» promove decisão vigente de recusa", () => {
  const enunciado = `Rejeito ${REC}`;
  const promo = detectarPromocaoDecisaoProduto(enunciado);
  assert.equal(promo?.tipo, "recusa");
  assert.match(String(promo?.texto || ""), /^Recusa:/);
  assert.match(String(promo?.texto || ""), /Adiar outdoor/i);

  actualizarMemoriaTrabalhoExecutiva({
    fase: "pre",
    mensagem: enunciado,
    memoriaExecutiva: { decisoes: [], pendencias: [], proximasAcoes: [] }
  });
  const pos = colherPos(enunciado);
  assert.ok(pos.decisoesTomadas.some((d) => /^Recusa:/i.test(d)));
  assert.equal(
    pos.decisoesTomadas.some(
      (d) => /Adiar outdoor/i.test(d) && !/^Recusa:/i.test(d)
    ),
    false
  );
  assert.ok(temDecisaoEmVigorCom(factosLastroRefinoEic(pos), /Recusa:/));
});

test("F3-08: Job result/needs_correction não promove decisão de produto", () => {
  const sintese =
    "Decisão executiva: C (adiar a aceitação). Posição deliberativa do Job 106.";
  const promoJob = {
    jobId: "JOB-000106",
    estado: "needs_correction",
    sintese,
    titulo: "análise deliberativa",
    evidencias: [],
    actualizadoEm: "2026-08-14T00:00:00.000Z"
  };
  const lastro = aplicarPromocaoResultadoAoLastro(
    {
      temContextoRelevante: true,
      memoriaTrabalhoExecutiva: {
        decisoesTomadas: [],
        pendencias: [],
        posicaoCeoNaoVigente: REC
      }
    },
    [promoJob]
  );
  assert.deepEqual(lastro.memoriaTrabalhoExecutiva.decisoesTomadas, []);
  assert.equal(
    lastro.factosOficiais.some((f) => /Decisão em vigor/i.test(f)),
    false
  );
  assert.ok(
    lastro.factosOficiais.some((f) => /Resultado reconciliado JOB-000106/i.test(f))
  );
  assert.match(String(lastro.memoriaTrabalhoExecutiva.proximaAcao || ""), /JOB-000106/);

  const mte = actualizarMemoriaTrabalhoExecutiva({
    fase: "pre",
    mensagem: "continuar",
    memoriaExecutiva: { decisoes: [], pendencias: [], proximasAcoes: [] },
    promocoesResultadoOperacao: [promoJob]
  });
  assert.equal(
    mte.decisoesTomadas.some((d) => /Decisão executiva|JOB-000106/i.test(d)),
    false
  );
  const factos = factosLastroRefinoEic(mte);
  assert.equal(temDecisaoEmVigorCom(factos, /Decisão executiva|adiar a aceitação/), false);
});

test("F3-09: Gate «Aprovado.» não promove recomendação de produto", () => {
  const gate = reconhecerDecisao("Aprovado.");
  assert.equal(gate.reconhecida, true);
  assert.equal(gate.decisao, "aprovado");
  assert.equal(detectarPromocaoDecisaoProduto("Aprovado."), null);
  assert.equal(detectarPromocaoDecisaoProduto("Pode prosseguir."), null);

  actualizarMemoriaTrabalhoExecutiva({
    fase: "pre",
    mensagem: PEDIDO_ANALISE,
    memoriaExecutiva: { decisoes: [], pendencias: [], proximasAcoes: [] }
  });
  colherPos(PEDIDO_ANALISE);

  const pos = colherPos("Aprovado.");
  assert.equal(
    pos.decisoesTomadas.some((d) => /Adiar outdoor/i.test(d)),
    false
  );
  assert.match(String(pos.posicaoCeoNaoVigente || ""), /Adiar outdoor/i);
});

test("F3-10: DESP-009 redefinido — recomendação ≠ decisoesTomadas; próxima acção é proposta", () => {
  actualizarMemoriaTrabalhoExecutiva({
    fase: "pre",
    mensagem: "focar pagamento",
    memoriaExecutiva: {
      decisoes: [],
      pendencias: [],
      proximasAcoes: [{ texto: "Avaliar outdoor" }]
    }
  });
  const pos = colherPos("focar pagamento");
  assert.match(String(pos.proximaAcao), /Sprint 1/i);
  assert.equal(
    pos.decisoesTomadas.some((d) => /Adiar outdoor/i.test(d)),
    false
  );
  assert.match(String(pos.posicaoCeoNaoVigente || ""), /Adiar outdoor/i);
});

test("F3-11: facto do último turno (pedido, não fecho) não vira decisoesTomadas", () => {
  const pedido = "Preciso que analise o outdoor e recomende o próximo passo.";
  actualizarMemoriaTrabalhoExecutiva({
    fase: "pre",
    mensagem: pedido,
    memoriaExecutiva: { decisoes: [], pendencias: [], proximasAcoes: [] }
  });
  const pos = colherPos(pedido);
  assert.equal(pos.decisoesTomadas.length, 0);
  assert.equal(detectarPromocaoDecisaoProduto(pedido), null);
});

test("F3-12: objectivo + pendência + job running continuam no lastro C2", () => {
  const m = actualizarMemoriaTrabalhoExecutiva({
    fase: "pre",
    mensagem: "continuar missão",
    objetivoConversacional: {
      id: "o",
      enunciado: "Usar CEO no MG2",
      origem: "usuario",
      actualizadoEm: "t"
    },
    memoriaExecutiva: {
      decisoes: [],
      pendencias: [{ texto: "Validar Sprint 1", status: "aberta" }],
      proximasAcoes: [{ texto: "Validar Sprint 1" }]
    }
  });
  m.estadoConversa = {
    ...(m.estadoConversa || {}),
    emExecucao: "JOB-TEC-001 running"
  };
  const factos = factosLastroRefinoEic(m);
  assert.ok(factos.some((f) => /Objectivo|Usar CEO no MG2/i.test(f)));
  assert.ok(factos.some((f) => /Pendência|Sprint 1/i.test(f)));
  assert.ok(factos.some((f) => /Em execução|JOB-TEC-001/i.test(f)));

  const entrada = montarEntradaMre({
    instrucao: "continuar",
    coaAtivo: { id: "prj-mg2", nome: "Motoboy Game 2" },
    memoria: () => ({ pendencias: [] }),
    lastroConsciencia: lastroDe(m)
  });
  assert.match(entrada.mensagem, /conduzir a missão|hierarquia de objectivos/i);
  assert.match(entrada.mensagem, /Sprint 1/i);
  assert.match(entrada.mensagem, /JOB-TEC-001|Em execução/i);
});
