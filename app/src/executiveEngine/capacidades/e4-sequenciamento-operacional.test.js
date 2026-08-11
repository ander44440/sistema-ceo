/**
 * E4 — Sequenciamento operacional (próxima prioridade após X).
 * T1–T7: classificação C4, lastro de sequência, sem MRE/Manifesto/deliberação.
 */

import assert from "node:assert/strict";
import { test, beforeEach, afterEach } from "node:test";
import {
  classificar,
  ehPedidoAnaliseOuRecomendacao,
  normalizarTexto
} from "../../classificadorIntencao/regras.js";
import {
  ehRecomendacaoOperacional,
  ehDeliberacaoDeProposta,
  identificarObjetoRecomendacaoOperacional
} from "../../classificadorIntencao/recomendacaoOperacional.js";
import { detectarPedidoAnaliseDeliberativa } from "../../mre/politicaAnaliseDeliberativa.js";
import { deveAnexarManifestoMg2 } from "../../camadaConhecimento/manifestoMg2.js";
import { mapearCapacidadePorTexto } from "../classificar.js";
import { executarRecomendacaoOperacional } from "./recomendacaoOperacional.js";
import {
  ehLastroAlinhadoAoObjeto,
  classificarGeneroLastro,
  seleccionarLastroOperacional
} from "./lastroOperacional.js";
import {
  contarMencoesTopicoActivo,
  deduplicarFactoTopicoActivo,
  garantirReflexoEstadoExecutivo
} from "../../conscienciaOperacional/influenciaDeliberacao.js";
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

const MSG_REAL =
  "Qual deve ser nossa prioridade depois da validação da Sprint 1?";

const MSG_REAL_CEO =
  "CEO, qual deve ser nossa prioridade depois da validação da Sprint 1?";

const SEQUENCIA_LOD =
  "Após validação, avançar para LOD na Sprint 2.";

const COA_MG2 = { id: "prj-mg2", nome: "Motoboy Game 2" };

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

function assertC4Operacional(texto, label = texto) {
  assert.equal(ehRecomendacaoOperacional(texto), true, `${label}: operacional`);
  assert.equal(ehDeliberacaoDeProposta(texto), false, `${label}: não proposta`);
  assert.equal(
    detectarPedidoAnaliseDeliberativa(texto),
    false,
    `${label}: não deliberativa`
  );
  assert.equal(
    ehPedidoAnaliseOuRecomendacao(normalizarTexto(texto)),
    false,
    `${label}: não análise classificador`
  );
  const s = classificar(texto);
  assert.equal(s.classe, "comando_operacional", `${label}: C4`);
  assert.equal(s.destino, "capacidade_operacional", `${label}: destino C4`);
  const cap = mapearCapacidadePorTexto(texto);
  assert.equal(cap.id, "recomendar_operacional", `${label}: capacidade`);
  assert.equal(
    deveAnexarManifestoMg2(texto, COA_MG2),
    false,
    `${label}: sem Manifesto`
  );
  return { s, cap };
}

test("T1 — prioridade depois da validação Sprint 1 → C4 / proxima_prioridade_apos / sem MRE", () => {
  assertC4Operacional(MSG_REAL, "T1");
  assertC4Operacional(MSG_REAL_CEO, "T1 CEO");
  const obj = identificarObjetoRecomendacaoOperacional(MSG_REAL);
  assert.equal(obj.tipo, "proxima_prioridade_apos");
  assert.match(String(obj.referencia || ""), /validação.*Sprint\s*1/i);
  assert.doesNotMatch(String(obj.tipo), /proposta|bairro|feature/i);

  for (const frase of [
    "qual deve ser a próxima prioridade?",
    "qual é a prioridade depois da Sprint 1?",
    "o que vem depois da Sprint 1?",
    "qual deve ser o próximo passo após a validação da Sprint 1?",
    "qual sequência devemos seguir depois da Sprint 1?"
  ]) {
    assert.equal(
      ehRecomendacaoOperacional(frase),
      true,
      `marcador: ${frase}`
    );
  }
});

test("T2 — lastro de sequência → recupera LOD / Sprint 2", async () => {
  const obj = identificarObjetoRecomendacaoOperacional(MSG_REAL);
  assert.equal(classificarGeneroLastro(SEQUENCIA_LOD), "proxima_acao");
  assert.equal(ehLastroAlinhadoAoObjeto(SEQUENCIA_LOD, obj), true);
  const sel = seleccionarLastroOperacional(
    {
      decisoes: [],
      proximasAcoes: [{ texto: SEQUENCIA_LOD }],
      proximoPasso: SEQUENCIA_LOD
    },
    obj
  );
  assert.equal(sel.usouLastro, true);
  assert.match(String(sel.proxima), /LOD|Sprint\s*2/i);

  const out = await executarRecomendacaoOperacional(MSG_REAL, {
    lerMemoriaFn: () => ({
      decisoes: [],
      proximasAcoes: [{ texto: SEQUENCIA_LOD }],
      proximoPasso: SEQUENCIA_LOD,
      pendencias: []
    })
  });
  assert.equal(out.dados?.mreInvocado, false);
  assert.equal(out.dados?.anexarManifesto, false);
  assert.equal(out.dados?.objeto?.tipo, "proxima_prioridade_apos");
  assert.match(String(out.mensagem), /LOD|Sprint\s*2/i);
  assert.doesNotMatch(String(out.mensagem), /\baprovar\b|\bmodificar\b|não priorizar|Sugiro monitorar/i);
});

test("T3 — sem sequência definida → insuficiência explícita", async () => {
  const out = await executarRecomendacaoOperacional(MSG_REAL, {
    lerMemoriaFn: () => ({
      decisoes: [],
      proximasAcoes: [],
      proximoPasso: null,
      pendencias: []
    })
  });
  assert.equal(out.dados?.lastroUsado, false);
  assert.match(
    String(out.mensagem),
    /Não há uma próxima prioridade definida no estado atual após/i
  );
  assert.doesNotMatch(String(out.mensagem), /Sugiro monitorar|LOD|Sprint\s*2/i);
  assert.doesNotMatch(
    String(out.mensagem),
    /\bRecomendação:\s*(aprovar|modificar)|APROVAR,\s*MODIFICAR/i
  );
});

test("T4 — nunca vocabulário deliberativo neste tipo", async () => {
  const out = await executarRecomendacaoOperacional(MSG_REAL, {
    lerMemoriaFn: () => ({
      decisoes: [
        { texto: "APROVAR, MODIFICAR ou NÃO PRIORIZAR a proposta" }
      ],
      proximasAcoes: [{ texto: "Considerando princípios do Manifesto…" }],
      proximoPasso: "Recomendação: modificar"
    })
  });
  assert.doesNotMatch(
    String(out.mensagem),
    /\bRecomendação:\s*(aprovar|modificar)|APROVAR,\s*MODIFICAR|não priorizar a proposta|considerando princ[ií]pios|considerando riscos/i
  );
  assert.match(
    String(out.mensagem),
    /Não há uma próxima prioridade definida no estado atual após/i
  );
});

test("T5 — nunca «Sugiro monitorar» sem evidência", async () => {
  const out = await executarRecomendacaoOperacional(MSG_REAL, {
    lerMemoriaFn: () => ({
      decisoes: [],
      proximasAcoes: [],
      proximoPasso: null,
      pendencias: []
    })
  });
  assert.doesNotMatch(String(out.mensagem), /Sugiro\s+monitorar|Próximo gesto/i);
});

test("T6 — Tópico activo no máximo uma ocorrência", () => {
  const duplicada =
    "Tópico activo: «Motoboy Game 2» (shift).\n\n" +
    "Corpo da resposta.\n\n" +
    "Tópico activo: «Motoboy Game 2» (shift).";
  assert.equal(contarMencoesTopicoActivo(duplicada), 2);
  const limpa = deduplicarFactoTopicoActivo(duplicada);
  assert.equal(contarMencoesTopicoActivo(limpa), 1);

  const lastro = {
    temContextoRelevante: true,
    fontePrioritaria: { id: "F4", nivel: "P3", nome: "tópico" },
    factosOficiais: ["Tópico activo: «Motoboy Game 2» (shift)"],
    contagens: { jobsPendentes: 0, jobsEmExecucao: 0, gatesPendentes: 0 }
  };
  const corpo =
    "Tópico activo: «Motoboy Game 2» (shift).\n\nRecomendação operacional: X.";
  const out = garantirReflexoEstadoExecutivo(corpo, lastro, MSG_REAL);
  assert.equal(contarMencoesTopicoActivo(out.mensagem), 1);
  assert.equal(out.motivo, "ja_reflecte_facto");
});

test("T7 — cenário real completo: C4, sequência, sem MRE/Manifesto/Jobs", async () => {
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
          { id: "d0", texto: "APROVAR, MODIFICAR ou NÃO PRIORIZAR a proposta" }
        ],
        pendencias: [],
        proximasAcoes: [{ id: "px", texto: SEQUENCIA_LOD }],
        historicoResumido: [],
        proximoPassoSugerido: SEQUENCIA_LOD,
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

  assertC4Operacional(MSG_REAL_CEO, "T7 class");

  const fila = criarPublicadorFilaMemoria();
  const out = await executiveEngine.executar(MSG_REAL_CEO, {
    publicarJob: fila.publicarJob.bind(fila),
    coaAtivo: COA_MG2
  });

  assert.equal(fila.jobs.length, 0, "Jobs = 0");
  assert.equal(out.modo, "recomendacao_operacional");
  assert.equal(out.dados?.objeto?.tipo, "proxima_prioridade_apos");
  assert.match(String(out.dados?.objeto?.referencia || ""), /Sprint\s*1/i);
  assert.equal(out.dados?.mreInvocado, false);
  assert.equal(out.dados?.anexarManifesto, false);
  assert.equal(out.dados?.deliberacaoProposta, false);
  assert.match(String(out.mensagem), /LOD|Sprint\s*2/i);
  assert.doesNotMatch(
    String(out.mensagem),
    /\baprovar\b|\bmodificar\b|Sugiro monitorar|considerando riscos|Próximo gesto|Manifesto/i
  );
  assert.ok(
    contarMencoesTopicoActivo(out.mensagem) <= 1,
    "tópico no máximo uma vez"
  );
});
