/**
 * E4 — Lastro operacional semântico: tipagem + alinhamento sem dígito isolado.
 */

import assert from "node:assert/strict";
import { test, beforeEach, afterEach } from "node:test";
import {
  ehLastroInstrucaoOuBriefing,
  classificarGeneroLastro,
  ehLastroAlinhadoAoObjeto,
  seleccionarLastroOperacional,
  tokensObjetoOperacional
} from "./lastroOperacional.js";
import { executarRecomendacaoOperacional } from "./recomendacaoOperacional.js";
import { identificarObjetoRecomendacaoOperacional } from "../../classificadorIntencao/recomendacaoOperacional.js";
import { executiveEngine } from "../index.js";
import { criarPublicadorFilaMemoria } from "../../motorExecucao/ponteParecerJob.js";
import { gravarDocumento, VERSAO } from "../../catalogoProjetos/persistencia.js";
import {
  recarregarCatalogo,
  selecionarProjeto
} from "../../catalogoProjetos/index.js";
import { resetStoreContinuidadePadrao } from "../../continuidadeGate/integracaoConversa.js";
import { resetEstadoTopicosSessao } from "../../classificadorIntencao/topicosSessao.js";
import { resetEstadoObjectivoSessao } from "../../classificadorIntencao/objectivoSessao.js";
import { reiniciarAutoridadeDelegadaParaTestes } from "../../autoridadeDelegada/autoridadeDelegada.js";
import { limparHistorico } from "../../modules/conversa/store.js";

const BRIEFING = `1. o objetivo atual;
2. a prioridade atual;
3. a decisão mais recente;
4. a próxima ação;
5. e o que está aguardando minha decisão?
Não proponha nenhuma ação nova.`;

const PEDIDO_REAL =
  "CEO, considerando o estado atual do MG2, você recomenda manter a validação da Sprint 1 de performance como nossa próxima decisão prioritária? Justifique brevemente.";

const COA_MG2 = { id: "prj-mg2", nome: "Motoboy Game 2" };

function objSprint(n = 1) {
  return identificarObjetoRecomendacaoOperacional(
    `Você recomenda manter a validação da Sprint ${n} de performance como prioridade?`
  );
}

beforeEach(() => {
  resetStoreContinuidadePadrao();
  resetEstadoTopicosSessao();
  resetEstadoObjectivoSessao();
  reiniciarAutoridadeDelegadaParaTestes();
  limparHistorico();
});

afterEach(() => {
  gravarDocumento({
    versao: VERSAO,
    projetoAtivoId: null,
    gabinete: {},
    projetos: []
  });
  recarregarCatalogo();
});

test("T1 — briefing exacto → REJEITAR", () => {
  const obj = objSprint(1);
  assert.equal(ehLastroInstrucaoOuBriefing(BRIEFING), true);
  assert.equal(classificarGeneroLastro(BRIEFING), "briefing");
  assert.equal(ehLastroAlinhadoAoObjeto(BRIEFING, obj), false);
  const sel = seleccionarLastroOperacional(
    { decisoes: [], proximasAcoes: [{ texto: BRIEFING }], proximoPasso: BRIEFING },
    obj
  );
  assert.equal(sel.usouLastro, false);
  assert.equal(sel.proxima, null);
});

test("T2 — pergunta sobre Sprint 1 → REJEITAR como decisão/ação", () => {
  const obj = objSprint(1);
  const q = "Qual é a prioridade da Sprint 1?";
  assert.equal(classificarGeneroLastro(q), "pergunta");
  assert.equal(ehLastroAlinhadoAoObjeto(q, obj), false);
});

test("T3 — decisão real → ACEITAR como decisao_operacional", () => {
  const obj = objSprint(1);
  const d = "Manter a validação da Sprint 1 como prioridade.";
  assert.equal(classificarGeneroLastro(d), "decisao_operacional");
  assert.equal(ehLastroAlinhadoAoObjeto(d, obj), true);
  const sel = seleccionarLastroOperacional(
    { decisoes: [{ texto: d }], proximasAcoes: [{ texto: BRIEFING }] },
    obj
  );
  assert.equal(sel.decisao, d);
  assert.equal(sel.generoDecisao, "decisao_operacional");
});

test("T4 — ação real → ACEITAR como proxima_acao", () => {
  const obj = objSprint(1);
  const a = "Validar Sprint 1 com o Patrocinador.";
  assert.equal(classificarGeneroLastro(a), "proxima_acao");
  assert.equal(ehLastroAlinhadoAoObjeto(a, obj), true);
  const sel = seleccionarLastroOperacional(
    { decisoes: [], proximasAcoes: [{ texto: a }], proximoPasso: a },
    obj
  );
  assert.equal(sel.proxima, a);
  assert.equal(sel.generoProxima, "proxima_acao");
  assert.equal(sel.decisao, null);
});

test("T5 — estado factual → ACEITAR como estado_factual", () => {
  const obj = objSprint(1);
  const e = "Sprint 1 ainda aguarda validação.";
  assert.equal(classificarGeneroLastro(e), "estado_factual");
  assert.equal(ehLastroAlinhadoAoObjeto(e, obj), true);
  const sel = seleccionarLastroOperacional(
    { decisoes: [{ texto: e }], proximasAcoes: [] },
    obj
  );
  assert.equal(sel.factual, e);
});

test("T6 — item numerado incompatível não casa só pelo número", () => {
  const obj = objSprint(2);
  const tokens = tokensObjetoOperacional(obj);
  assert.ok(!tokens.includes("2"));
  const lixo = "2. validar alguma outra coisa";
  assert.equal(ehLastroAlinhadoAoObjeto(lixo, obj), false);
});

test("T7 — Sprint 2 + briefing começando com 2. → REJEITAR", () => {
  const obj = objSprint(2);
  const briefing2 = `2. a prioridade atual;
3. a decisão mais recente;
4. a próxima ação;
Não proponha nenhuma ação nova.`;
  assert.equal(ehLastroInstrucaoOuBriefing(briefing2), true);
  assert.equal(ehLastroAlinhadoAoObjeto(briefing2, obj), false);
});

test("T8 — bairro + Manifesto → REJEITAR para Sprint 1", () => {
  const obj = objSprint(1);
  const bairro =
    "Parecer: aprovar a proposta do bairro popular segundo o Manifesto.";
  assert.equal(ehLastroAlinhadoAoObjeto(bairro, obj), false);
  const sel = seleccionarLastroOperacional(
    {
      decisoes: [{ texto: bairro }, { texto: "APROVAR, MODIFICAR ou NÃO PRIORIZAR a proposta" }],
      proximasAcoes: [{ texto: BRIEFING }]
    },
    obj
  );
  assert.equal(sel.usouLastro, false);
});

test("T9 — nenhum lastro válido → recomendação prudente", async () => {
  const out = await executarRecomendacaoOperacional(
    "Você recomenda manter a validação da Sprint 1 de performance como prioridade?",
    {
      lerMemoriaFn: () => ({
        decisoes: [{ texto: BRIEFING }],
        proximasAcoes: [{ texto: BRIEFING }],
        proximoPasso: BRIEFING,
        pendencias: []
      })
    }
  );
  assert.equal(out.dados?.lastroUsado, false);
  assert.doesNotMatch(String(out.mensagem), /objetivo atual|Não proponha/i);
  assert.match(String(out.mensagem), /sem lastro operacional compatível|não reutilizo/i);
});

test("T10 — cenário real Etapa 4", async () => {
  const agora = new Date().toISOString();
  gravarDocumento({
    versao: VERSAO,
    projetoAtivoId: "prj-mg2",
    gabinete: { rotaId: "dashboard", atualizadoEm: agora },
    projetos: [
      {
        id: "prj-mg2",
        nome: "Motoboy Game 2",
        estado: "ativo",
        criadoEm: agora,
        ultimaAtividadeEm: agora,
        decisoes: [
          { id: "d0", texto: "APROVAR, MODIFICAR ou NÃO PRIORIZAR a proposta" },
          {
            id: "d1",
            texto: "Parecer: modificar a proposta do bairro segundo o Manifesto"
          }
        ],
        pendencias: [],
        proximasAcoes: [{ id: "px", texto: BRIEFING }],
        historicoResumido: [],
        proximoPassoSugerido: BRIEFING,
        diaExecutivo: {
          status: "em_curso",
          dataRef: agora.slice(0, 10),
          abertoEm: agora,
          encerradoEm: null,
          intencaoDoDia: "Estabilizar uso diário",
          continuidade: []
        }
      }
    ]
  });
  recarregarCatalogo();
  selecionarProjeto("prj-mg2");

  const fila = criarPublicadorFilaMemoria();
  const out = await executiveEngine.executar(PEDIDO_REAL, {
    publicarJob: fila.publicarJob.bind(fila),
    coaAtivo: COA_MG2
  });
  assert.equal(fila.jobs.length, 0);
  assert.equal(out.modo, "recomendacao_operacional");
  assert.match(String(out.dados?.objeto?.rotulo || ""), /Sprint\s*1|validação/i);
  assert.doesNotMatch(String(out.mensagem), /objetivo atual|Não proponha|APROVAR,\s*MODIFICAR|Manifesto|bairro/i);
  assert.match(String(out.mensagem), /Sprint\s*1|validação/i);
  assert.equal(out.dados?.mreInvocado, false);
  assert.equal(out.dados?.anexarManifesto, false);
});

test("unit: dígito isolado não ancora; composto sprint N alinha", () => {
  const obj = objSprint(1);
  const tokens = tokensObjetoOperacional(obj);
  assert.ok(!tokens.includes("1"));
  assert.ok(tokens.includes("sprint-1") || tokens.includes("sprint1"));
  assert.equal(
    ehLastroAlinhadoAoObjeto("1. o objetivo atual; 2. a prioridade atual", obj),
    false
  );
  assert.equal(
    ehLastroAlinhadoAoObjeto("Validar a Sprint 1 de performance com o Patrocinador.", obj),
    true
  );
});
