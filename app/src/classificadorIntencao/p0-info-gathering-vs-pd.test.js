/**
 * P0 — distinguir pedido de decisão (PD) vs info-gathering / lacunas.
 * Caso real ValeVerde ordem 74: não forçar fecho nem repetir recomendação.
 */

import assert from "node:assert/strict";
import { test } from "node:test";
import { detectarPedidoDecisaoExplicita } from "./pedidoDecisaoExplicita.js";
import {
  detectarPedidoInfoGathering,
  hintEstagio6InfoGathering
} from "./pedidoInfoGathering.js";
import { classificar, ehPedidoAnaliseOuRecomendacao, normalizarTexto } from "./regras.js";
import {
  ehRecomendacaoOperacional,
  objectoDoTurno,
  OBJECTO_TURNO
} from "./recomendacaoOperacional.js";
import { seleccionarFioCoa } from "./fioConversacional.js";
import {
  enriquecerMensagemComFioRecente,
  enriquecerMensagemComMemoriaTrabalho
} from "../mre/integracaoNucleo.js";
import { gerarComunicadoExecutivo } from "../mre/speaker/speakerExecutivo.js";
import {
  comporDeliberacao,
  deveApresentarFechoDecisorio
} from "../conversacaoNatural/compor.js";
import { parecerValidoCompleto } from "../mre/parecer/fixtures.js";
import { garantirReflexoEstadoExecutivo } from "../conscienciaOperacional/influenciaDeliberacao.js";
import {
  PREFIXO_DECLARACAO_LASTRO_INSUFICIENTE,
  garantirDisciplinaLastroInsuficiente
} from "../conscienciaOperacional/disciplinaLastroInsuficiente.js";
import { LACUNA_GENERICA_ESSENCIAL } from "../mre/ncs/politicas.js";

const ORDEM_74 =
  "CEO, antes de falar com o cliente, quais informações você gostaria de obter " +
  "para decidir se vale a pena negociar preço, defender o valor atual ou aceitar " +
  "o risco de perder esse cliente?";

const REC_FORTE_ANTERIOR =
  "Desenvolver uma estratégia de retenção que destaque o valor agregado da empresa " +
  "e considere ajustes de preço ou ofertas especiais para manter o cliente importante.";

const T1_VALEVERDE = `CEO, seguem os primeiros dados da ValeVerde Alimentos:

A empresa possui 120 funcionários.
Faturamento anual: R$ 48 milhões.
Nos últimos 6 meses, a margem líquida caiu de 8% para 4%.
A principal causa identificada pela diretoria financeira é o aumento de 15% no custo das matérias-primas.
A diretoria comercial quer aumentar preços em 10%.
A diretoria comercial teme perder clientes.
A produção afirma que consegue reduzir desperdícios em aproximadamente 5%.
Não existem outras informações disponíveis neste momento.`;

function parecerLacunas(lacunas, recomendacao) {
  const p = parecerValidoCompleto();
  p.decisaoExecutiva.estado = "solicitar_dados";
  p.decisaoExecutiva.recomendacao = recomendacao;
  p.decisaoExecutiva.justificativa =
    "Sem estes factos a escolha entre negociar, defender ou aceitar risco é prematura.";
  p.decisaoExecutiva.alternativas = [];
  p.lacunas = lacunas;
  p.confianca = 0.4;
  p.diagnostico.objetivoReal = "obter informações antes de decidir";
  p.analise = "Faltam dados materiais para fechar.";
  p.acao = { tipo: "perguntar", descricao: "Obter as informações listadas.", job: null };
  return p;
}

// --- PD ---

test("PD1: Quais informações… para decidir? → PD false + info-gathering", () => {
  const t = "Quais informações precisamos obter para decidir?";
  assert.equal(detectarPedidoInfoGathering(t), true);
  assert.equal(detectarPedidoDecisaoExplicita(t), false);
});

test("PD2: Antes de decidir, o que precisamos descobrir? → PD false", () => {
  const t = "Antes de decidir, o que precisamos descobrir?";
  assert.equal(detectarPedidoInfoGathering(t), true);
  assert.equal(detectarPedidoDecisaoExplicita(t), false);
});

test("PD3: Ajude-me a decidir entre A e B. → PD true", () => {
  const t = "Ajude-me a decidir entre A e B.";
  assert.equal(detectarPedidoInfoGathering(t), false);
  assert.equal(detectarPedidoDecisaoExplicita(t), true);
});

test("PD4: Decida entre negociar ou defender o preço. → PD true", () => {
  const t = "Decida entre negociar ou defender o preço.";
  assert.equal(detectarPedidoInfoGathering(t), false);
  assert.equal(detectarPedidoDecisaoExplicita(t), true);
});

// --- Info-gathering / composição ---

test("IG5: ordem 74 → info-gathering; CN/Speaker sem Decisão: nem retenção forçada", () => {
  assert.equal(detectarPedidoInfoGathering(ORDEM_74), true);
  assert.equal(detectarPedidoDecisaoExplicita(ORDEM_74), false);
  assert.equal(deveApresentarFechoDecisorio(ORDEM_74, "aprovar", REC_FORTE_ANTERIOR), false);

  const lacunas = [
    "elasticidade de preço deste cliente",
    "margem contribuída pelo cliente",
    "capacidade de resposta da concorrência em 30 dias"
  ];
  const rec =
    "Obter: (1) margem do cliente; (2) histórico de renegociações; (3) risco de contágio de preço.";
  const parecer = parecerLacunas(lacunas, rec);

  const speaker = gerarComunicadoExecutivo(parecer, "chat", {
    pedidoInfoGathering: true
  });
  assert.equal(speaker.ok, true);
  assert.doesNotMatch(speaker.comunicado.texto, /^Decisão:/i);
  assert.doesNotMatch(speaker.comunicado.texto, /^(Aprovo|Delego|Vou monitorar)\b/i);
  assert.match(speaker.comunicado.texto, /margem|elasticidade|histórico/i);

  const cn = comporDeliberacao(parecer, {}, { instrucao: ORDEM_74, canal: "chat" });
  assert.doesNotMatch(cn.texto, /^Decisão:/i);
  assert.doesNotMatch(cn.texto, /iguale o preço da concorrência/i);
  assert.match(cn.texto, /margem|elasticidade|histórico|Obter/i);
  assert.deepEqual(cn.camadasUsadas, ["info_gathering"]);
});

test("IG6: mesmo caso com fio de recomendação forte → pergunta governa; banner anti-mandato", () => {
  const hist = [
    { papel: "usuario", texto: "Você recomenda reduzir nosso preço ou negociar de outra forma?" },
    { papel: "ceo", texto: `Decisão: ${REC_FORTE_ANTERIOR}` },
    { papel: "usuario", texto: ORDEM_74 }
  ];
  const enriquecida = enriquecerMensagemComFioRecente(ORDEM_74, hist);
  assert.match(enriquecida, /NÃO mandato/i);
  assert.match(enriquecida, /pergunta\/instrução ACTUAL governa/i);
  assert.match(enriquecida, /estratégia de retenção/i);

  assert.equal(detectarPedidoInfoGathering(ORDEM_74), true);
  assert.equal(detectarPedidoDecisaoExplicita(ORDEM_74), false);

  const parecer = parecerLacunas(
    ["volume comprometido nos próximos 90 dias", "custo de servir este cliente"],
    "Listar lacunas: volume, custo de servir, alternativas de valor sem desconto."
  );
  const cn = comporDeliberacao(parecer, {}, { instrucao: ORDEM_74, canal: "chat" });
  assert.doesNotMatch(cn.texto, /^Decisão:/i);
  assert.doesNotMatch(cn.texto, /retenção que destaque o valor agregado/i);
  assert.match(cn.texto, /volume|custo de servir|lacunas/i);
});

test("IG7: O que falta saber? após parecer forte → pergunta actual governa", () => {
  const t = "O que falta saber?";
  assert.equal(detectarPedidoInfoGathering(t), true);
  assert.equal(detectarPedidoDecisaoExplicita(t), false);

  const parecer = parecerLacunas(
    ["confirmação do prazo da proposta concorrente"],
    "Falta saber o prazo efectivo da oferta concorrente e a disposição do cliente para contraprestações."
  );
  const cn = comporDeliberacao(parecer, {}, { instrucao: t, canal: "chat" });
  assert.doesNotMatch(cn.texto, /^Decisão:/i);
  assert.match(cn.texto, /falta|prazo|oferta/i);
});

test("IG8: Quais riscos ainda não avaliamos? → lacunas, sem fecho", () => {
  const t = "Quais riscos ainda não avaliamos?";
  assert.equal(detectarPedidoInfoGathering(t), true);
  assert.equal(detectarPedidoDecisaoExplicita(t), false);
  assert.match(hintEstagio6InfoGathering(), /NÃO feche a decisão/);

  const parecer = parecerLacunas(
    ["risco de contágio de desconto", "risco de capacidade do fornecedor"],
    "Riscos ainda não avaliados: contágio de desconto; capacidade; retaliação."
  );
  const cn = comporDeliberacao(parecer, {}, { instrucao: t, canal: "chat" });
  assert.doesNotMatch(cn.texto, /^Decisão:/i);
  assert.match(cn.texto, /risco|contágio|capacidade/i);
});

test("IG: MTE omite próximaAção/posição em info-gathering", () => {
  const lastro = {
    memoriaTrabalhoExecutiva: {
      hierarquia: { objectivoAtual: "reter cliente 15%" },
      proximaAcao: "igualar preço da concorrência",
      posicaoCeoNaoVigente: "retenção com match de preço",
      decisoesTomadas: ["igualar preço"],
      pendencias: ["falar com cliente"]
    }
  };
  const out = enriquecerMensagemComMemoriaTrabalho(ORDEM_74, lastro, {
    omitirInstrucaoOperacional: true
  });
  assert.doesNotMatch(out, /Próxima acção:/i);
  assert.doesNotMatch(out, /Posição do CEO/i);
  assert.doesNotMatch(out, /Decisão em vigor:/i);
  assert.match(out, /só contexto factual/i);
  assert.match(out, /Pendências abertas:/i);
  assert.match(out, /Objectivo actual:/i);
});

// --- Regressão ---

test("R9: T1 fatos + T2 prioridade → B/C2 (não E4)", () => {
  const fio = seleccionarFioCoa(
    [{ papel: "usuario", texto: T1_VALEVERDE, coaId: "prj-vv" }],
    "Qual deve ser nossa prioridade agora?",
    { coaId: "prj-vv" }
  );
  const t = "Qual deve ser nossa prioridade agora?";
  assert.equal(objectoDoTurno(t, fio), OBJECTO_TURNO.B);
  assert.equal(ehRecomendacaoOperacional(t, fio), false);
  assert.equal(ehPedidoAnaliseOuRecomendacao(normalizarTexto(t), fio), true);
  const s = classificar(t, { fioCoa: fio });
  assert.equal(s.classe, "conversa_projeto");
  assert.equal(s.destino, "nucleo_mre");
});

test("R10: operação A legítima continua E4", () => {
  const t = "Qual prioridade você recomenda agora na Sprint 2 após o gate?";
  assert.equal(objectoDoTurno(t), OBJECTO_TURNO.A);
  assert.equal(ehRecomendacaoOperacional(t), true);
  const s = classificar(t);
  assert.equal(s.destino, "capacidade_operacional");
});

test("R11: O que faria primeiro? com fio B não vira PD automático", () => {
  const t = "O que você faria primeiro, antes de oferecer qualquer desconto?";
  const fio = [
    {
      papel: "ceo",
      texto: `Decisão: ${REC_FORTE_ANTERIOR}`,
      coaId: "prj-vv"
    }
  ];
  assert.equal(detectarPedidoDecisaoExplicita(t), false);
  assert.equal(ehRecomendacaoOperacional(t, fio), false);
  assert.notEqual(objectoDoTurno(t, fio), OBJECTO_TURNO.A);
});

// --- P0 pós-auditoria: propósito «tomar a decisão» + reflexo F2 ---

test("P0-1.1: Antes de tomar a decisão, o que falta saber? → PD false", () => {
  const t = "Antes de tomar a decisão, o que falta saber?";
  assert.equal(detectarPedidoInfoGathering(t), true);
  assert.equal(detectarPedidoDecisaoExplicita(t), false);
});

test("P0-1.2: Para tomar a decisão, quais dados precisamos? → PD false", () => {
  const t = "Para tomar a decisão, quais dados precisamos?";
  assert.equal(detectarPedidoInfoGathering(t), true);
  assert.equal(detectarPedidoDecisaoExplicita(t), false);
});

test("P0-1.3: Quais informações precisamos antes de tomar a decisão? → PD false", () => {
  const t = "Quais informações precisamos antes de tomar a decisão?";
  assert.equal(detectarPedidoInfoGathering(t), true);
  assert.equal(detectarPedidoDecisaoExplicita(t), false);
});

test("P0-1.4–6: PD verdadeiro (tome / decida / escolha)", () => {
  assert.equal(detectarPedidoDecisaoExplicita("Tome a decisão agora."), true);
  assert.equal(detectarPedidoInfoGathering("Tome a decisão agora."), false);
  assert.equal(
    detectarPedidoDecisaoExplicita("Decida entre negociar e defender o preço."),
    true
  );
  assert.equal(detectarPedidoDecisaoExplicita("Escolha entre A e B."), true);
});

test("P0-2: IG + Job F2 → reflexo NÃO substitui prosa de lacunas", () => {
  const prosaLacunas =
    "Antes de decidir, obter: (1) margem do cliente; (2) elasticidade de preço; (3) prazo da oferta concorrente.";
  const lastroF2 = {
    temContextoRelevante: true,
    fontePrioritaria: { id: "F2", nome: "Jobs em execução" },
    contagens: { jobsPendentes: 0, jobsEmExecucao: 1, gatesPendentes: 0 },
    factosOficiais: [
      "Estado Executivo — Job em execução JOB-RUN: estratégia de retenção"
    ],
    memoriaTrabalhoExecutiva: {
      proximaAcao: "igualar preço da concorrência",
      posicaoCeoNaoVigente: "retenção com match de preço"
    }
  };
  const reflexo = garantirReflexoEstadoExecutivo(
    prosaLacunas,
    lastroF2,
    ORDEM_74,
    { pedidoInfoGathering: true }
  );
  assert.equal(reflexo.aplicada, false);
  assert.equal(reflexo.motivo, "info_gathering_preservado");
  assert.equal(reflexo.mensagem, prosaLacunas);
  assert.doesNotMatch(reflexo.mensagem, /execução em andamento/i);
  assert.doesNotMatch(reflexo.mensagem, /Minha recomendação é concluir/i);

  // Detecção pela instrução (sem opts) também protege
  const reflexo2 = garantirReflexoEstadoExecutivo(
    prosaLacunas,
    lastroF2,
    ORDEM_74
  );
  assert.equal(reflexo2.aplicada, false);
  assert.equal(reflexo2.mensagem, prosaLacunas);
});

test("P0-2b: IG sem Job → reflexo não altera (comportamento preservado)", () => {
  const prosa = "Lacunas: margem; elasticidade.";
  const lastroVazio = {
    temContextoRelevante: false,
    contagens: { jobsEmExecucao: 0, gatesPendentes: 0 },
    factosOficiais: []
  };
  const reflexo = garantirReflexoEstadoExecutivo(prosa, lastroVazio, ORDEM_74, {
    pedidoInfoGathering: true
  });
  assert.equal(reflexo.aplicada, false);
  assert.equal(reflexo.mensagem, prosa);
});

test("P0-2c: C4/A operacional continua com reflexo F2 (sem IG)", () => {
  const lastroF2 = {
    temContextoRelevante: true,
    fontePrioritaria: { id: "F2", nome: "Jobs em execução" },
    contagens: { jobsPendentes: 0, jobsEmExecucao: 1, gatesPendentes: 0 },
    factosOficiais: [
      "Estado Executivo — Job em execução JOB-BUGS: correção dos bugs"
    ]
  };
  const instrucaoOps = "Como devemos priorizar o MG2?";
  assert.equal(detectarPedidoInfoGathering(instrucaoOps), false);
  const reflexo = garantirReflexoEstadoExecutivo(
    "Resposta genérica sem lastro.",
    lastroF2,
    instrucaoOps
  );
  assert.equal(reflexo.aplicada, true);
  assert.match(reflexo.mensagem, /execução em andamento/i);
});

test("P0-2d: isolamento COA no fio IG", () => {
  const hist = [
    { papel: "usuario", texto: T1_VALEVERDE, coaId: "prj-vv" },
    { papel: "ceo", texto: `Decisão: ${REC_FORTE_ANTERIOR}`, coaId: "prj-vv" },
    {
      papel: "usuario",
      texto: "Outdoor lateral no MG2 — priorizar?",
      coaId: "prj-mg2"
    },
    { papel: "ceo", texto: "Decisão MG2: adiar outdoor.", coaId: "prj-mg2" }
  ];
  const fio = seleccionarFioCoa(hist, ORDEM_74, { coaId: "prj-vv" });
  assert.ok(fio.every((m) => !m.coaId || m.coaId === "prj-vv"));
  assert.ok(!fio.some((m) => /outdoor|MG2/i.test(m.texto)));
});

test("P0-1 regressão R2 ValeVerde → B/C2/MRE", () => {
  const R2 =
    "CEO, surgiu uma nova situação na ValeVerde. Um dos principais fornecedores " +
    "informou que terá um reajuste de 12% nos próximos 30 dias. Ainda não sabemos " +
    "se existem fornecedores alternativos com capacidade suficiente. Quero que você " +
    "avalie o impacto potencial dessa situação, identifique o que precisamos descobrir " +
    "antes de agir e recomende a prioridade executiva para tratar o problema. Não execute nada.";
  assert.equal(objectoDoTurno(R2), OBJECTO_TURNO.B);
  assert.equal(ehRecomendacaoOperacional(R2), false);
  const s = classificar(R2);
  assert.equal(s.destino, "nucleo_mre");
});

test("D25: ordem 74 — disciplina+reflexo preservam prosa IG (não wipe)", () => {
  const prosaIg =
    "Obter: (1) margem do cliente; (2) elasticidade; (3) prazo da oferta.\n\n" +
    `- ${LACUNA_GENERICA_ESSENCIAL}`;
  const parecer = {
    lacunas: [LACUNA_GENERICA_ESSENCIAL],
    decisaoExecutiva: { estado: "solicitar_dados" }
  };
  const disc = garantirDisciplinaLastroInsuficiente(prosaIg, {
    factosOficiais: [],
    parecer,
    pedidoInfoGathering: true,
    instrucao: ORDEM_74
  });
  assert.equal(disc.aplicada, false);
  assert.equal(disc.mensagem, prosaIg);
  assert.doesNotMatch(
    disc.mensagem,
    new RegExp(PREFIXO_DECLARACAO_LASTRO_INSUFICIENTE)
  );

  const lastroF2 = {
    temContextoRelevante: true,
    fontePrioritaria: { id: "F2" },
    contagens: { jobsEmExecucao: 1, gatesPendentes: 0 },
    factosOficiais: ["Estado Executivo — Job em execução JOB-X: retenção"]
  };
  const reflexo = garantirReflexoEstadoExecutivo(
    disc.mensagem,
    lastroF2,
    ORDEM_74,
    { pedidoInfoGathering: true }
  );
  assert.equal(reflexo.aplicada, false);
  assert.equal(reflexo.mensagem, prosaIg);
  assert.match(reflexo.mensagem, /margem|elasticidade|prazo/i);
});
