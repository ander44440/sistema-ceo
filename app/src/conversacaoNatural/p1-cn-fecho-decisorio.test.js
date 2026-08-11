/**
 * CN — fecho decisório: não enfraquecer decisão já tomada pelo MRE.
 * OBJ2 — fecho A/B/C (C = adiar).
 */

import assert from "node:assert/strict";
import { test } from "node:test";
import { parecerValidoCompleto } from "../mre/parecer/fixtures.js";
import {
  _resetVariacaoParaTestes,
  aplicarConversacaoNatural,
  deveApresentarFechoDecisorio,
  inferirLetraFechoAbc,
  temEscolhaDecisoriaValida
} from "./index.js";

const ALT_ENG = "Priorizar estabilidade técnica";
const ALT_FIN = "Reduzir custos imediatamente";
const ALT_COM = "Acelerar aquisição";

const INSTR_DECIDA =
  "Há conflito entre Engenharia, Financeiro e Comercial. " +
  "Engenharia quer estabilidade, Financeiro quer cortar custo, Comercial quer acelerar. " +
  "Decida. Contexto: AlfaTech.";

const INSTR_ABC =
  "Contrato novo:\n" +
  "A) Aceitar agora\n" +
  "B) Recusar o contrato\n" +
  "C) Adiar a aceitação\n" +
  "Decide A, B ou C.";

function parecerAbc(estado, recomendacao) {
  const p = parecerValidoCompleto();
  p.coaId = "prj-alfatech";
  p.decisaoExecutiva.estado = estado;
  p.decisaoExecutiva.recomendacao = recomendacao;
  p.decisaoExecutiva.alternativas = [
    "Aceitar agora",
    "Recusar o contrato",
    "Adiar a aceitação"
  ];
  p.decisaoExecutiva.justificativa =
    "Com base no risco contratual e no tempo disponível, a escolha prevalece.";
  p.lacunas = [];
  p.acao = {
    tipo: "orientar",
    descricao: "Registar a decisão e comunicar ao comercial",
    job: null
  };
  return p;
}

function parecerFechoMonitorar() {
  const p = parecerValidoCompleto();
  p.coaId = "prj-alfatech";
  p.decisaoExecutiva.estado = "monitorar";
  p.decisaoExecutiva.recomendacao =
    `Decisão sob conflito: escolha executiva — «${ALT_ENG}». ` +
    "Critério dominante nos elementos já fornecidos; conflito entre áreas não impede o fecho.";
  p.decisaoExecutiva.alternativas = [ALT_ENG, ALT_FIN, ALT_COM];
  p.decisaoExecutiva.justificativa =
    "Com base no risco de regressão e no progresso sustentável, prioriza-se estabilidade técnica.";
  p.lacunas = [];
  p.acao = {
    tipo: "orientar",
    descricao: "Manter estabilidade técnica como eixo; rever custo depois",
    job: null
  };
  return p;
}

test("helper: fecho só com pedido explícito + escolha válida", () => {
  assert.equal(
    temEscolhaDecisoriaValida("monitorar", `escolha — «${ALT_ENG}»`),
    true
  );
  assert.equal(temEscolhaDecisoriaValida("solicitar_dados", "pedir orçamento"), false);
  assert.equal(
    deveApresentarFechoDecisorio(INSTR_DECIDA, "monitorar", ALT_ENG),
    true
  );
  assert.equal(
    deveApresentarFechoDecisorio(
      "Analise o conflito entre áreas e recomende",
      "monitorar",
      ALT_ENG
    ),
    false
  );
});

test("decisão explícita + monitorar → prosa de decisão clara (sem «Acompanho sem fechar»)", () => {
  _resetVariacaoParaTestes();
  const parecer = parecerFechoMonitorar();
  const coaAntes = { id: "prj-alfatech", nome: "AlfaTech" };
  const cn = aplicarConversacaoNatural({
    ok: true,
    modo: "mre",
    mensagem: "x",
    canal: "chat",
    instrucao: INSTR_DECIDA,
    dados: {
      parecer,
      coa: coaAntes,
      memoria: { projetoAtivo: { id: "prj-alfatech", nome: "AlfaTech" } }
    }
  });

  const a = String(cn.camadas.A || "");
  const texto = String(cn.texto || "");
  assert.match(a, /Decisão/i);
  assert.match(a + texto, new RegExp(ALT_ENG, "i"));
  assert.match(a + texto, /Crit[eé]rio/i);
  assert.doesNotMatch(texto, /Acompanho sem fechar decisão/i);
  assert.doesNotMatch(texto, /^Plano:/m);
  assert.doesNotMatch(texto, /O que mudaria esta decisão/i);
  assert.equal(cn.contextoImediato.frenteAtiva, "AlfaTech");
});

test("decisão explícita + Continuidade MG2 → decisão permanece clara; activo AlfaTech", () => {
  _resetVariacaoParaTestes();
  const parecer = parecerFechoMonitorar();
  const instrucao =
    `${INSTR_DECIDA} Continuidade: Motoboy Game 2.`;
  const cn = aplicarConversacaoNatural({
    ok: true,
    modo: "mre",
    mensagem: "x",
    canal: "chat",
    instrucao,
    dados: {
      parecer,
      coa: { id: "prj-alfatech", nome: "AlfaTech" },
      memoria: { projetoAtivo: { id: "prj-alfatech", nome: "AlfaTech" } }
    }
  });

  assert.match(String(cn.camadas.A || ""), /Decisão/i);
  assert.match(String(cn.texto || ""), new RegExp(ALT_ENG, "i"));
  assert.doesNotMatch(String(cn.texto || ""), /Acompanho sem fechar decisão/i);
  assert.doesNotMatch(String(cn.texto || ""), /^Plano:/m);
  assert.equal(cn.contextoImediato.frenteAtiva, "AlfaTech");
  assert.notEqual(cn.contextoImediato.frenteAtiva, "Motoboy Game 2");
});

test("análise sem decisão → CN permanece com softener de monitorar", () => {
  _resetVariacaoParaTestes();
  const parecer = parecerValidoCompleto();
  parecer.decisaoExecutiva.estado = "monitorar";
  parecer.decisaoExecutiva.recomendacao = "Observar Sprint 1 antes de outdoor";
  parecer.decisaoExecutiva.alternativas = [];
  parecer.lacunas = [];
  const cn = aplicarConversacaoNatural({
    ok: true,
    modo: "mre",
    mensagem: "x",
    canal: "chat",
    instrucao: "o que achas do outdoor?",
    dados: {
      parecer,
      coa: { id: "prj-alfatech", nome: "AlfaTech" }
    }
  });

  assert.match(
    String(cn.camadas.A || ""),
    /Acompanho sem fechar|Critério de mudança/i
  );
  assert.equal(cn.contextoImediato.frenteAtiva, "AlfaTech");
});

test("lacuna bloqueante → continua solicitando o dado; não finge decisão", () => {
  _resetVariacaoParaTestes();
  const parecer = parecerValidoCompleto();
  parecer.decisaoExecutiva.estado = "solicitar_dados";
  parecer.decisaoExecutiva.recomendacao =
    "Solicitar o orçamento aprovado do Q3 antes de fechar";
  parecer.lacunas = ["Orçamento aprovado do Q3"];
  parecer.confianca = 0.4;
  const cn = aplicarConversacaoNatural({
    ok: true,
    modo: "mre",
    mensagem: "x",
    canal: "chat",
    instrucao: `${INSTR_DECIDA} Falta o orçamento do Q3.`,
    dados: {
      parecer,
      coa: { id: "prj-alfatech", nome: "AlfaTech" }
    }
  });

  assert.match(String(cn.texto || ""), /preciso de mais dados|orçamento|Q3/i);
  assert.doesNotMatch(String(cn.camadas.A || ""), /^Decisão:/i);
  assert.doesNotMatch(String(cn.texto || ""), /escolha executiva/i);
  assert.equal(cn.contextoImediato.frenteAtiva, "AlfaTech");
});

test("CN fecho decisório não cria nem altera projeto ativo", () => {
  _resetVariacaoParaTestes();
  const parecer = parecerFechoMonitorar();
  const coa = Object.freeze({ id: "prj-alfatech", nome: "AlfaTech" });
  const cn = aplicarConversacaoNatural({
    ok: true,
    modo: "mre",
    mensagem: "x",
    canal: "chat",
    instrucao: INSTR_DECIDA,
    dados: { parecer, coa }
  });
  assert.equal(cn.contextoImediato.frenteAtiva, "AlfaTech");
  assert.equal(coa.id, "prj-alfatech");
  assert.equal(coa.nome, "AlfaTech");
});

test("6: A/B/C com escolha C → contém C + adiar", () => {
  _resetVariacaoParaTestes();
  assert.equal(
    inferirLetraFechoAbc(
      INSTR_ABC,
      "rejeitar",
      "Rejeitar a aceitação do novo contrato neste momento"
    ),
    "C"
  );
  assert.equal(
    temEscolhaDecisoriaValida("adiar", "Adiar a aceitação", { pedidoAbc: true }),
    true
  );
  const cn = aplicarConversacaoNatural({
    ok: true,
    modo: "mre",
    mensagem: "x",
    canal: "chat",
    instrucao: INSTR_ABC,
    dados: {
      parecer: parecerAbc(
        "rejeitar",
        "Rejeitar a aceitação do novo contrato neste momento"
      ),
      coa: { id: "prj-alfatech", nome: "AlfaTech" }
    }
  });
  const a = String(cn.camadas.A || "");
  assert.match(a, /\bC\b/);
  assert.match(a, /adiar/i);
});

test("7: C não produz apenas «rejeitar» sem adiar", () => {
  _resetVariacaoParaTestes();
  const cn = aplicarConversacaoNatural({
    ok: true,
    modo: "mre",
    mensagem: "x",
    canal: "chat",
    instrucao: INSTR_ABC,
    dados: {
      parecer: parecerAbc(
        "adiar",
        "Rejeitar a aceitação do novo contrato neste momento"
      ),
      coa: { id: "prj-alfatech", nome: "AlfaTech" }
    }
  });
  const a = String(cn.camadas.A || "");
  assert.match(a, /C\s*[—\-].*adiar/i);
  assert.doesNotMatch(a, /^Decisão:\s*Rejeitar a aceitação/i);
});

test("8: B / recusar contrato → linguagem de rejeição", () => {
  _resetVariacaoParaTestes();
  const cn = aplicarConversacaoNatural({
    ok: true,
    modo: "mre",
    mensagem: "x",
    canal: "chat",
    instrucao: INSTR_ABC,
    dados: {
      parecer: parecerAbc("rejeitar", "Recusar o contrato"),
      coa: { id: "prj-alfatech", nome: "AlfaTech" }
    }
  });
  const a = String(cn.camadas.A || "");
  assert.match(a, /\bB\b/);
  assert.match(a, /recusar|rejeitar/i);
});

test("9: A / aceitar → linguagem de aprovação", () => {
  _resetVariacaoParaTestes();
  const cn = aplicarConversacaoNatural({
    ok: true,
    modo: "mre",
    mensagem: "x",
    canal: "chat",
    instrucao: INSTR_ABC,
    dados: {
      parecer: parecerAbc("aprovar", "Aceitar o contrato agora"),
      coa: { id: "prj-alfatech", nome: "AlfaTech" }
    }
  });
  const a = String(cn.camadas.A || "");
  assert.match(a, /\bA\b/);
  assert.match(a, /aceitar|aprovar/i);
});
