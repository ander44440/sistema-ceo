/**
 * E4 — Isolamento lastro deliberativo × recomendação operacional (T1–T10).
 */

import assert from "node:assert/strict";
import { test, beforeEach, afterEach } from "node:test";
import {
  ehLastroDeliberativoIncompativel,
  ehLastroAlinhadoAoObjeto,
  seleccionarLastroOperacional
} from "./lastroOperacional.js";
import { executarRecomendacaoOperacional } from "./recomendacaoOperacional.js";
import { identificarObjetoRecomendacaoOperacional } from "../../classificadorIntencao/recomendacaoOperacional.js";
import { classificar } from "../../classificadorIntencao/regras.js";
import { detectarPedidoAnaliseDeliberativa } from "../../mre/politicaAnaliseDeliberativa.js";
import { deveAnexarManifestoMg2 } from "../../camadaConhecimento/manifestoMg2.js";
import { executiveEngine } from "../index.js";
import { criarPublicadorFilaMemoria } from "../../motorExecucao/ponteParecerJob.js";
import { atualizarAposInstrucao, lerMemoria } from "../../executiveMemory/index.js";
import { gravarDocumento, VERSAO } from "../../catalogoProjetos/persistencia.js";
import {
  recarregarCatalogo,
  selecionarProjeto,
  obterProjetoAtivo,
  obterWorkspaceAtivo
} from "../../catalogoProjetos/index.js";
import { resetStoreContinuidadePadrao } from "../../continuidadeGate/integracaoConversa.js";
import { resetEstadoTopicosSessao } from "../../classificadorIntencao/topicosSessao.js";
import { resetEstadoObjectivoSessao } from "../../classificadorIntencao/objectivoSessao.js";
import { reiniciarAutoridadeDelegadaParaTestes } from "../../autoridadeDelegada/autoridadeDelegada.js";
import { limparHistorico } from "../../modules/conversa/store.js";
import { enviarAoNucleo } from "../../modules/conversa/enviarAoNucleo.js";

const COA_MG2 = { id: "prj-mg2", nome: "Motoboy Game 2" };
const PEDIDO_SPRINT =
  "Você recomenda manter a validação da Sprint 1 de performance como prioridade?";
const PEDIDO_REAL =
  "CEO, considerando o estado atual do MG2, você recomenda manter a validação da Sprint 1 de performance como nossa próxima decisão prioritária? Justifique brevemente.";

const TEMPLATE_DELIB =
  "APROVAR, MODIFICAR ou NÃO PRIORIZAR a proposta";
const TEXTO_MANIFESTO =
  "Justifique a recomendação aplicando especificamente os princípios do Manifesto ao caso concreto. Não repita o Manifesto e não use princípios genéricos de governança do CEO.";
const DECISAO_SPRINT_REAL =
  "Manter a validação da Sprint 1 de performance como prioridade até fechar o gate de perf.";

function assertSemResiduoDeliberativo(msg) {
  const t = String(msg || "");
  assert.doesNotMatch(t, /APROVAR,\s*MODIFICAR\s+ou\s+N[AÃ]O\s+PRIORIZAR/i);
  assert.doesNotMatch(t, /Decisão recente de referência:\s*APROVAR/i);
  assert.doesNotMatch(t, /princípios do Manifesto/i);
  assert.doesNotMatch(t, /aplicando especificamente os princípios/i);
  assert.doesNotMatch(t, /Não repita o Manifesto/i);
  assert.doesNotMatch(t, /princípios genéricos de governança/i);
  assert.doesNotMatch(t, /bairro popular/i);
}

function estadoContaminado(extra = {}) {
  return {
    decisoes: [
      { id: "d1", texto: TEMPLATE_DELIB },
      ...(extra.decisoes || [])
    ],
    proximasAcoes: [
      { id: "p1", texto: TEXTO_MANIFESTO },
      ...(extra.proximasAcoes || [])
    ],
    pendencias: extra.pendencias || [],
    proximoPasso: extra.proximoPasso || TEXTO_MANIFESTO
  };
}

function documentoGabinete(opts = {}) {
  const agora = new Date().toISOString();
  return {
    versao: VERSAO,
    projetoAtivoId: "prj-mg2",
    gabinete: { rotaId: "dashboard", atualizadoEm: agora },
    projetos: [
      {
        id: "prj-mg2",
        nome: "Motoboy Game 2",
        descricao: "teste lastro",
        estado: "ativo",
        criadoEm: agora,
        ultimaAtividadeEm: agora,
        decisoes: opts.decisoes || [{ id: "d1", texto: TEMPLATE_DELIB, quando: agora }],
        pendencias: opts.pendencias || [],
        proximasAcoes: opts.proximasAcoes || [
          { id: "px1", texto: TEXTO_MANIFESTO, quando: agora }
        ],
        historicoResumido: [],
        proximoPassoSugerido: opts.proximoPassoSugerido || "Fechar validação Sprint 1",
        diaExecutivo: {
          status: "em_curso",
          dataRef: agora.slice(0, 10),
          abertoEm: agora,
          encerradoEm: null,
          intencaoDoDia: "Estabilizar Sprint 1",
          continuidade: []
        }
      }
    ]
  };
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

test("unit: ehLastroDeliberativoIncompativel cobre templates e Manifesto", () => {
  assert.equal(ehLastroDeliberativoIncompativel(TEMPLATE_DELIB), true);
  assert.equal(ehLastroDeliberativoIncompativel(TEXTO_MANIFESTO), true);
  assert.equal(
    ehLastroDeliberativoIncompativel(
      "Recomendação: aprovar a proposta do bairro popular"
    ),
    true
  );
  assert.equal(ehLastroDeliberativoIncompativel(DECISAO_SPRINT_REAL), false);
});

test("unit: alinhamento ao objeto — Sprint vs bairro", () => {
  const obj = identificarObjetoRecomendacaoOperacional(PEDIDO_SPRINT);
  assert.equal(ehLastroAlinhadoAoObjeto(DECISAO_SPRINT_REAL, obj), true);
  assert.equal(
    ehLastroAlinhadoAoObjeto("Adiar a proposta do bairro popular", obj),
    false
  );
  assert.equal(ehLastroAlinhadoAoObjeto(TEMPLATE_DELIB, obj), false);
});

test("T1 — decisão template não ecoa; objeto Sprint 1", async () => {
  const out = await executarRecomendacaoOperacional(PEDIDO_SPRINT, {
    lerMemoriaFn: () => estadoContaminado()
  });
  assert.match(String(out.mensagem), /Sprint\s*1|validação/i);
  assert.equal(out.dados?.objeto?.tipo, "validacao_sprint");
  assertSemResiduoDeliberativo(out.mensagem);
  assert.doesNotMatch(String(out.mensagem), /proposta do bairro|aprovação de proposta/i);
  assert.equal(out.dados?.lastroUsado, false);
});

test("T2 — proximaAcao Manifesto não ecoa", async () => {
  const out = await executarRecomendacaoOperacional(PEDIDO_SPRINT, {
    lerMemoriaFn: () => ({
      decisoes: [],
      proximasAcoes: [{ texto: TEXTO_MANIFESTO }],
      proximoPasso: TEXTO_MANIFESTO,
      pendencias: []
    })
  });
  assertSemResiduoDeliberativo(out.mensagem);
  assert.doesNotMatch(String(out.mensagem), /Manifesto/i);
});

test("T3 — histórico bairro não contamina Sprint", async () => {
  const out = await executarRecomendacaoOperacional(PEDIDO_SPRINT, {
    lerMemoriaFn: () =>
      estadoContaminado({
        decisoes: [
          {
            texto:
              "Parecer: modificar a proposta do bairro popular segundo o Manifesto"
          }
        ]
      })
  });
  assertSemResiduoDeliberativo(out.mensagem);
  assert.doesNotMatch(String(out.mensagem), /bairro/i);
});

test("T4 — decisão real sobre Sprint 1 pode ser lastro", async () => {
  const out = await executarRecomendacaoOperacional(PEDIDO_SPRINT, {
    lerMemoriaFn: () => ({
      decisoes: [
        { texto: TEMPLATE_DELIB },
        { texto: DECISAO_SPRINT_REAL }
      ],
      proximasAcoes: [{ texto: TEXTO_MANIFESTO }],
      pendencias: [],
      proximoPasso: null
    })
  });
  assert.match(String(out.mensagem), /Sprint\s*1|validação|performance/i);
  assert.match(String(out.mensagem), /Decisão alinhada|Manter a validação/i);
  assertSemResiduoDeliberativo(out.mensagem);
  assert.equal(out.dados?.lastroUsado, true);
  assert.match(String(out.dados?.lastroAlinhado?.decisao || ""), /Sprint\s*1/i);
});

test("T5 — só lastro incompatível → resposta prudente", async () => {
  const out = await executarRecomendacaoOperacional(PEDIDO_SPRINT, {
    lerMemoriaFn: () => estadoContaminado()
  });
  assert.match(String(out.mensagem), /sem lastro operacional compatível|não reutilizo pareceres/i);
  assertSemResiduoDeliberativo(out.mensagem);
  assert.equal(out.dados?.lastroUsado, false);
});

test("T6 — recomendar_operacional não sobrescreve proximoPasso com a pergunta", async () => {
  gravarDocumento(
    documentoGabinete({
      proximoPassoSugerido: "Fechar validação Sprint 1",
      decisoes: [{ id: "d1", texto: DECISAO_SPRINT_REAL }],
      proximasAcoes: [
        { id: "px1", texto: "Continuar validação da Sprint 1 de performance" }
      ]
    })
  );
  recarregarCatalogo();
  selecionarProjeto("prj-mg2");
  const antes = obterWorkspaceAtivo().proximoPasso;

  const fila = criarPublicadorFilaMemoria();
  const out = await executiveEngine.executar(PEDIDO_SPRINT, {
    publicarJob: fila.publicarJob.bind(fila),
    coaAtivo: COA_MG2
  });
  assert.equal(fila.jobs.length, 0);
  assert.equal(out.modo, "recomendacao_operacional");

  const depois = obterWorkspaceAtivo().proximoPasso;
  assert.doesNotMatch(String(depois || ""), /Você recomenda manter/i);
  assert.doesNotMatch(String(depois || ""), /Justifique brevemente/i);
  // Não deve virar a pergunta; preferir manter âncora operacional prévia
  if (antes) {
    assert.equal(depois, antes);
  }

  // Unit directo do early-return
  const snap = lerMemoria();
  atualizarAposInstrucao({
    instrucao: PEDIDO_REAL,
    intencao: { id: "recomendar_operacional" },
    capacidade: "memoria",
    ok: true,
    mensagem: out.mensagem,
    dados: { modo: "recomendacao_operacional", jaPersistido: true }
  });
  const apos = obterWorkspaceAtivo().proximoPasso;
  assert.equal(apos, depois);
  assert.ok(snap);
});

test("T7 — C2 bairro + Manifesto intacto", () => {
  const texto =
    "Analise a proposta do bairro popular segundo o Manifesto.";
  const s = classificar(texto);
  assert.equal(s.classe, "conversa_projeto");
  assert.equal(detectarPedidoAnaliseDeliberativa(texto), true);
  assert.equal(deveAnexarManifestoMg2(texto, COA_MG2), true);
});

test("T8 — C4 Sprint sem MRE/Manifesto", async () => {
  gravarDocumento(documentoGabinete());
  recarregarCatalogo();
  selecionarProjeto("prj-mg2");

  const s = classificar(PEDIDO_SPRINT);
  assert.equal(s.classe, "comando_operacional");
  assert.equal(deveAnexarManifestoMg2(PEDIDO_SPRINT, COA_MG2), false);

  const fila = criarPublicadorFilaMemoria();
  const out = await executiveEngine.executar(PEDIDO_SPRINT, {
    publicarJob: fila.publicarJob.bind(fila),
    coaAtivo: COA_MG2
  });
  assert.equal(fila.jobs.length, 0);
  assert.notEqual(out.modo, "nucleo_mre");
  assert.equal(out.dados?.mreInvocado, false);
  assert.equal(out.dados?.anexarManifesto, false);
  assert.equal(out.modo, "recomendacao_operacional");
  assertSemResiduoDeliberativo(out.mensagem);
});

test("T9 — mensagem real Etapa 4 com lastro rico contaminado", async () => {
  gravarDocumento(
    documentoGabinete({
      decisoes: [
        { id: "d0", texto: TEMPLATE_DELIB },
        {
          id: "d1",
          texto: "Parecer: aprovar a proposta do bairro popular segundo o Manifesto"
        },
        { id: "d2", texto: DECISAO_SPRINT_REAL }
      ],
      proximasAcoes: [{ id: "px", texto: TEXTO_MANIFESTO }],
      proximoPassoSugerido: TEXTO_MANIFESTO
    })
  );
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
  assertSemResiduoDeliberativo(out.mensagem);
  assert.match(String(out.mensagem), /Sprint\s*1|validação|performance/i);
  // Deve preferir decisão real alinhada, não o template
  assert.match(String(out.mensagem), /Manter a validação|Decisão alinhada/i);
});

test("T10 — integração enviarAoNucleo", async () => {
  gravarDocumento(
    documentoGabinete({
      decisoes: [
        { id: "d0", texto: TEMPLATE_DELIB },
        { id: "d1", texto: DECISAO_SPRINT_REAL }
      ],
      proximasAcoes: [{ id: "px", texto: TEXTO_MANIFESTO }]
    })
  );
  recarregarCatalogo();
  selecionarProjeto("prj-mg2");

  const fila = criarPublicadorFilaMemoria();
  const out = await enviarAoNucleo(PEDIDO_REAL, {
    reproduzirTts: false,
    publicarJob: fila.publicarJob.bind(fila)
  });
  assert.equal(fila.jobs.length, 0);
  assert.equal(out.ok, true);
  const msg = String(out.mensagem || out.resposta?.mensagem || "");
  assertSemResiduoDeliberativo(msg);
  assert.match(msg, /Sprint\s*1|validação/i);
  assert.equal(out.resposta?.modo || out.dados?.modo, "recomendacao_operacional");
});

test("seleccionarLastroOperacional ignora template e escolhe alinhado", () => {
  const obj = identificarObjetoRecomendacaoOperacional(PEDIDO_SPRINT);
  const sel = seleccionarLastroOperacional(
    {
      decisoes: [{ texto: TEMPLATE_DELIB }, { texto: DECISAO_SPRINT_REAL }],
      proximasAcoes: [{ texto: TEXTO_MANIFESTO }],
      proximoPasso: TEXTO_MANIFESTO
    },
    obj
  );
  assert.equal(sel.decisao, DECISAO_SPRINT_REAL);
  assert.equal(sel.proxima, null);
  assert.equal(sel.usouLastro, true);
});
