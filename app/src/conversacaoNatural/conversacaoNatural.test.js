/**
 * Testes PX-003 E2 — Conversação Natural.
 */

import assert from "node:assert/strict";
import { test } from "node:test";
import { gerarComunicadoExecutivo } from "../mre/speaker/speakerExecutivo.js";
import { parecerValidoCompleto } from "../mre/parecer/fixtures.js";
import {
  TIPO_TURNO,
  _resetVariacaoParaTestes,
  aplicarConversacaoNatural,
  classificarTipoTurno,
  extrairContextoImediato,
  naturalizarRespostaNucleo
} from "./index.js";

test("classifica solicitar_dados → bloqueio", () => {
  const p = parecerValidoCompleto();
  p.decisaoExecutiva.estado = "solicitar_dados";
  p.lacunas = ["Falta resultado da Sprint 1"];
  assert.equal(
    classificarTipoTurno({ ok: true, parecer: p }),
    TIPO_TURNO.BLOQUEIO
  );
});

test("classifica fallback → sistema", () => {
  assert.equal(
    classificarTipoTurno({ modo: "fallback", rota: "legado-erro" }),
    TIPO_TURNO.SISTEMA
  );
});

test("PX-003.11 extrai último turno, objetivo e frente", () => {
  const ctx = extrairContextoImediato({
    historico: [
      { papel: "usuario", texto: "Priorizar pagamento" },
      { papel: "ceo", texto: "Aprovo foco em pagamento." }
    ],
    parecer: parecerValidoCompleto(),
    coa: { nome: "Motoboy Game 2" },
    memoria: { projetoAtivo: { nome: "Motoboy Game 2" } }
  });
  assert.equal(ctx.ultimoTurno.papel, "ceo");
  assert.match(ctx.objetivoAtual, /outdoor|pagamento|MG2/i);
  assert.equal(ctx.frenteAtiva, "Motoboy Game 2");
});

test("Antes × Depois 1 — deliberação aprovar (sem Sobre:/Porquê: default)", () => {
  _resetVariacaoParaTestes();
  const parecer = parecerValidoCompleto();
  const antes = gerarComunicadoExecutivo(parecer, "chat");
  assert.equal(antes.ok, true);
  assert.match(antes.comunicado.texto, /Sobre:/);
  assert.match(antes.comunicado.texto, /Porquê:/);
  assert.match(antes.comunicado.texto, /Quando quiser, seguimos/);

  const cn = aplicarConversacaoNatural({
    ok: true,
    modo: "mre",
    mensagem: antes.comunicado.texto,
    canal: "chat",
    dados: {
      parecer,
      comunicado: antes.comunicado,
      coa: { nome: "Motoboy Game 2" },
      memoria: { projetoAtivo: { nome: "Motoboy Game 2" } }
    },
    instrucao: "Adiar outdoor e focar pagamento"
  });

  assert.equal(cn.gerador, "conversacao-natural-v1");
  assert.equal(cn.tipoTurno, TIPO_TURNO.DELIBERACAO);
  assert.ok(!/Sobre:/.test(cn.texto));
  assert.ok(cn.camadas.A);
  // DESP-004: plano (P) ou gesto (B) — fixture multi-etapa preferencialmente P
  assert.ok(cn.camadas.B || cn.camadas.P);
  // DEC-010: síntese executiva sempre presente (mesmo com confiança alta)
  assert.ok(cn.camadas.C);
  assert.match(String(cn.camadas.C), /MG2|pagamento|outdoor|princípio|ADR/i);
  // Condução: pergunta estratégica a partir das alternativas do parecer
  assert.ok(cn.camadas.D);
  assert.match(String(cn.camadas.D), /\?/);
  assert.ok(!/Quando quiser, seguimos/i.test(cn.texto));
  assert.notEqual(cn.texto, cn.textoAntes);
});

test("Antes × Depois 2 — bloqueio solicitar_dados", () => {
  _resetVariacaoParaTestes();
  const parecer = parecerValidoCompleto();
  parecer.decisaoExecutiva.estado = "solicitar_dados";
  parecer.decisaoExecutiva.recomendacao = "Preciso do resultado da Sprint 1";
  parecer.lacunas = ["Resultado da Sprint 1 de perf"];
  parecer.confianca = 0.4;
  const antesTemplate =
    "Sobre: Decidir LOD.\n\nPreciso de dados: Preciso do resultado da Sprint 1.\n\n" +
    "Porquê: falta evidência.\n\nPróximo gesto: Pedir Sprint 1.\n\n" +
    "Para avançar: Resultado da Sprint 1 de perf?\n\nLacunas residuais: Resultado da Sprint 1 de perf.";
  const cn = aplicarConversacaoNatural({
    ok: true,
    modo: "mre",
    mensagem: antesTemplate,
    dados: { parecer },
    instrucao: "Posso avançar LOD?"
  });
  assert.equal(cn.tipoTurno, TIPO_TURNO.BLOQUEIO);
  assert.match(cn.texto, /preciso|Sprint|Resultado/i);
  assert.ok(!/Lacunas residuais/i.test(cn.texto));
  assert.ok(!/Sobre:/.test(cn.texto));
});

test("Antes × Depois 3 — sistema remove vazamento .env", () => {
  _resetVariacaoParaTestes();
  const bruto =
    "Não consigo deliberar: motor indisponível (chave).\n\n" +
    "Configure `CEO_LLM_API_KEY` em `app/.env` (veja `.env.example`), reinicie o servidor e volte a tentar.\n\n" +
    "Enquanto isso, seguimos no local.";
  const cn = aplicarConversacaoNatural({
    ok: true,
    modo: "fallback",
    mensagem: bruto,
    dados: { rota: "deliberativa-sem-llm" }
  });
  assert.equal(cn.tipoTurno, TIPO_TURNO.SISTEMA);
  assert.ok(!/CEO_LLM_API_KEY/.test(cn.texto));
  assert.ok(!/\.env\.example/.test(cn.texto));
});

test("Antes × Depois 4 — abertura com variação controlada", () => {
  _resetVariacaoParaTestes();
  const a = aplicarConversacaoNatural({
    ok: true,
    modo: "local",
    mensagem: "Bom dia. Qual é o objetivo de agora?",
    dados: { intencao: { id: "saudacao" }, rota: "deterministica" },
    instrucao: "bom dia"
  });
  const b = aplicarConversacaoNatural({
    ok: true,
    modo: "local",
    mensagem: "Bom dia. Qual é o objetivo de agora?",
    dados: { intencao: { id: "saudacao" }, rota: "deterministica" },
    instrucao: "bom dia"
  });
  assert.equal(a.tipoTurno, TIPO_TURNO.ABERTURA);
  assert.equal(b.tipoTurno, TIPO_TURNO.ABERTURA);
  assert.notEqual(a.texto, b.texto);
});

test("Antes × Depois 5 — naturalizarRespostaNucleo marca gerador CN", () => {
  _resetVariacaoParaTestes();
  const parecer = parecerValidoCompleto();
  const speaker = gerarComunicadoExecutivo(parecer, "chat");
  const out = naturalizarRespostaNucleo(
    {
      ok: true,
      capacidade: "ia",
      mensagem: speaker.comunicado.texto,
      modo: "mre",
      dados: {
        parecer,
        comunicado: speaker.comunicado,
        rota: "deliberativa",
        coa: { nome: "Motoboy Game 2" },
        memoria: { projetoAtivo: { nome: "Motoboy Game 2" } }
      }
    },
    { historico: [], instrucao: "Focar pagamento", canalSpeaker: "chat" }
  );
  assert.equal(out.dados.conversacaoNatural.gerador, "conversacao-natural-v1");
  assert.equal(out.dados.comunicado.metadados.gerador, "conversacao-natural-v1");
  assert.ok(out.dados.comunicado.metadados.textoSpeakerAntes);
  assert.match(out.dados.comunicado.metadados.textoSpeakerAntes, /Sobre:/);
  assert.ok(!/Sobre:/.test(out.mensagem));
  assert.ok(out.dados.textoVoz);
  assert.ok(out.dados.conversacaoNatural.camadas);
});

test("evidência: resposta composta pela CN, não pelo template Speaker", () => {
  _resetVariacaoParaTestes();
  const parecer = parecerValidoCompleto();
  const speaker = gerarComunicadoExecutivo(parecer, "chat").comunicado.texto;
  const cn = aplicarConversacaoNatural({
    ok: true,
    modo: "mre",
    mensagem: speaker,
    dados: {
      parecer,
      coa: { nome: "Motoboy Game 2" }
    },
    instrucao: "Adiar outdoor"
  });
  assert.ok(cn.textoAntes.includes("Sobre:"));
  assert.ok(Object.keys(cn.camadas).length >= 2);
  assert.equal(cn.meta.gerador, "conversacao-natural-v1");
});

test("DEC-010: deliberação conduz com síntese + pergunta (não muleta passiva)", () => {
  _resetVariacaoParaTestes();
  const parecer = parecerValidoCompleto();
  parecer.decisaoExecutiva.alternativas = [];
  parecer.lacunas = [];
  const cn = aplicarConversacaoNatural({
    ok: true,
    modo: "mre",
    mensagem: "x",
    dados: { parecer, coa: { nome: "Motoboy Game 2" } },
    instrucao: "Adiar outdoor"
  });
  assert.ok(cn.camadas.C, "síntese obrigatória");
  // Sem alternativas + gesto B: pergunta de foco no objectivo (não repetir a acção)
  assert.ok(cn.camadas.D);
  assert.match(String(cn.camadas.D), /objectivo|próximo|autorizamos|Confirmamos|\?/i);
  assert.ok(!/Quando quiser, seguimos|Seguimos quando autorizar/i.test(cn.texto));
});

test("DESP-002: deliberação com lastro — sem Antecipo/Objectivo automáticos (Etapa 4)", () => {
  _resetVariacaoParaTestes();
  const parecer = parecerValidoCompleto();
  parecer.decisaoExecutiva.alternativas = [];
  parecer.lacunas = [];
  const cn = aplicarConversacaoNatural({
    ok: true,
    modo: "mre",
    mensagem: "x",
    dados: {
      parecer,
      coa: { nome: "Motoboy Game 2" },
      refinoEic: {
        hierarquia: {
          objectivoEstrategico: "Usar CEO no MG2",
          objectivoAtual: "fechar pagamento",
          entregaCorrente: "integração"
        },
        pendencias: ["Validar Sprint 1 de perf"],
        proximaAcao: "Validar Sprint 1"
      }
    },
    instrucao: "Adiar outdoor"
  });
  assert.doesNotMatch(String(cn.texto), /Antecipo pendência aberta/i);
  assert.doesNotMatch(String(cn.texto), /Objectivo principal:/i);
  assert.ok(cn.camadas.A || cn.camadas.D, "deliberação/condução intacta");
});

test("DESP-002: shift de tópico — sem envelope Objectivo automático (Etapa 4)", () => {
  _resetVariacaoParaTestes();
  const parecer = parecerValidoCompleto();
  const cn = aplicarConversacaoNatural({
    ok: true,
    modo: "mre",
    mensagem: "x",
    dados: {
      parecer,
      coa: { nome: "Motoboy Game 2" },
      gestaoTopicos: {
        evento: "shift",
        topicoActivo: { ancora: "arte-outdoor" }
      },
      refinoEic: {
        hierarquia: {
          objectivoEstrategico: "Usar CEO no MG2",
          objectivoAtual: "pagamento",
          entregaCorrente: "arte-outdoor"
        }
      }
    },
    instrucao: "falar da arte do outdoor"
  });
  assert.equal(cn.camadas.E, undefined);
  assert.doesNotMatch(String(cn.texto), /Objectivo principal:/i);
  assert.ok(cn.camadas.A, "parecer deliberativo mantém-se");
});

test("DESP-005: antecipa risco/oportunidade com evidência e pergunta de controlo", () => {
  _resetVariacaoParaTestes();
  const parecer = parecerValidoCompleto();
  // Sem plano (acção simples) para o risco aparecer em N, não só no P
  parecer.acao = {
    tipo: "orientar",
    descricao: "Manter foco em pagamento",
    job: null
  };
  parecer.decisaoExecutiva.alternativas = [];
  parecer.enquadramento.tipoPedido = "informacao";
  const cn = aplicarConversacaoNatural({
    ok: true,
    modo: "mre",
    mensagem: "x",
    dados: { parecer, coa: { nome: "Motoboy Game 2" } },
    instrucao: "Mantemos pagamento?"
  });
  assert.ok(cn.camadas.N, "camada antecipação");
  assert.match(String(cn.camadas.N), /Antecipo|Oportunidade|risco/i);
  assert.match(String(cn.camadas.D), /\?/);
  assert.match(
    String(cn.camadas.D),
    /agora|materializar|Simplificamos|Reservamos|Tratamos|Confirmamos/i
  );
});

test("DESP-005: sem evidência — sem antecipação intrusiva", () => {
  _resetVariacaoParaTestes();
  const parecer = parecerValidoCompleto();
  parecer.riscos = [];
  parecer.oportunidades = [];
  parecer.decisaoExecutiva.alternativas = [];
  parecer.acao = { tipo: "orientar", descricao: "Ok", job: null };
  parecer.enquadramento = {
    tipoPedido: "informacao",
    urgencia: "baixa",
    escopo: "só confirmação"
  };
  const cn = aplicarConversacaoNatural({
    ok: true,
    modo: "mre",
    mensagem: "x",
    dados: {
      parecer,
      coa: { nome: "Motoboy Game 2" },
      refinoEic: { hierarquia: {}, pendencias: [], proximaAcao: null }
    },
    instrucao: "ok"
  });
  assert.equal(cn.camadas.N, undefined);
});

test("DESP-004: plano executivo antes da decisão em problema multi-etapa", () => {
  _resetVariacaoParaTestes();
  const parecer = parecerValidoCompleto();
  const cn = aplicarConversacaoNatural({
    ok: true,
    modo: "mre",
    mensagem: "x",
    dados: { parecer, coa: { nome: "Motoboy Game 2" } },
    instrucao: "Como organizar outdoor vs pagamento nesta sprint?"
  });
  assert.ok(cn.camadas.P, "camada Plano");
  assert.match(String(cn.camadas.P), /Plano:/i);
  assert.match(String(cn.camadas.P), /1\)/);
  assert.match(String(cn.camadas.P), /2\)/);
  assert.match(String(cn.camadas.P), /Dependência:|Risco:|Prioridade:/i);
  // Plano aparece antes da decisão na prosa
  const idxP = cn.texto.indexOf("Plano:");
  const idxDec = cn.texto.indexOf(String(cn.camadas.A).slice(0, 24));
  assert.ok(idxP >= 0 && idxDec > idxP, "plano antes da decisão");
});

test("DESP-004: pedido simples sem plano burocrático", () => {
  _resetVariacaoParaTestes();
  const parecer = parecerValidoCompleto();
  parecer.riscos = [];
  parecer.decisaoExecutiva.alternativas = [];
  parecer.acao = { tipo: "orientar", descricao: "Confirmar foco em pagamento", job: null };
  parecer.enquadramento.tipoPedido = "informacao";
  const cn = aplicarConversacaoNatural({
    ok: true,
    modo: "mre",
    mensagem: "x",
    dados: { parecer, coa: { nome: "Motoboy Game 2" } },
    instrucao: "Mantemos pagamento?"
  });
  assert.equal(cn.camadas.P, undefined);
  assert.ok(cn.camadas.A);
});

test("ciclo Decidir: prosa com critério e alternativa", () => {
  _resetVariacaoParaTestes();
  const parecer = parecerValidoCompleto();
  const cn = aplicarConversacaoNatural({
    ok: true,
    modo: "mre",
    mensagem: "x",
    dados: { parecer, coa: { nome: "Motoboy Game 2" } },
    instrucao: "Adiar outdoor e focar pagamento"
  });
  assert.match(String(cn.camadas.A), /Critério:/i);
  assert.match(String(cn.camadas.A), /Em alternativa|paralelo|Rejeitar/i);
});

test("ciclo Decidir: monitorar pergunta critério de mudança", () => {
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
    dados: { parecer, coa: { nome: "Motoboy Game 2" } },
    instrucao: "o que achas do outdoor?"
  });
  assert.match(String(cn.camadas.A), /Acompanho sem fechar|Critério de mudança/i);
  assert.match(String(cn.camadas.D), /mudaria|prazo|risco|evidência/i);
  assert.ok(!/autorizamos/i.test(String(cn.camadas.D || "")));
});

test("DESP-002: encerramento executivo com próxima acção", () => {
  _resetVariacaoParaTestes();
  const cn = aplicarConversacaoNatural({
    ok: true,
    modo: "local",
    mensagem: "Ok.",
    instrucao: "encerrar o dia",
    dados: {
      coa: { nome: "Motoboy Game 2" },
      refinoEic: {
        hierarquia: { objectivoEstrategico: "Usar CEO no MG2" },
        proximaAcao: "Retomar pagamento amanhã",
        pendencias: []
      }
    }
  });
  assert.equal(cn.tipoTurno, TIPO_TURNO.FECHO);
  assert.match(cn.texto, /Encerro/i);
  assert.match(cn.texto, /Objectivo|Usar CEO/i);
  assert.match(cn.texto, /Próxima acção|pagamento/i);
  assert.ok(!/preservado\.?$/i.test(cn.texto));
});

test("DESP-006: confirmação rápida — resposta proporcional (sem plano/antecipação)", () => {
  _resetVariacaoParaTestes();
  const parecer = parecerValidoCompleto();
  parecer.decisaoExecutiva.alternativas = [];
  const cn = aplicarConversacaoNatural({
    ok: true,
    modo: "mre",
    mensagem: "x",
    dados: { parecer, coa: { nome: "Motoboy Game 2" } },
    instrucao: "ok"
  });
  assert.equal(cn.modoAdaptacao, "rapido");
  assert.equal(cn.camadas.P, undefined);
  assert.equal(cn.camadas.N, undefined);
  assert.equal(cn.camadas.C, undefined);
  assert.ok(cn.camadas.A);
});

test("DESP-006: pedido de detalhe — mantém síntese e profundidade", () => {
  _resetVariacaoParaTestes();
  const parecer = parecerValidoCompleto();
  const cn = aplicarConversacaoNatural({
    ok: true,
    modo: "mre",
    mensagem: "x",
    dados: { parecer, coa: { nome: "Motoboy Game 2" } },
    instrucao: "Porquê adiar o outdoor? Explica o critério."
  });
  assert.equal(cn.modoAdaptacao, "detalhe");
  assert.ok(cn.camadas.A);
  assert.ok(cn.camadas.C, "detalhe preserva síntese");
});

test("DESP-006: mudança de assunto — sem âncora Objectivo automática (Etapa 4)", () => {
  _resetVariacaoParaTestes();
  const parecer = parecerValidoCompleto();
  parecer.decisaoExecutiva.alternativas = [];
  const cn = aplicarConversacaoNatural({
    ok: true,
    modo: "mre",
    mensagem: "x",
    dados: {
      parecer,
      coa: { nome: "Motoboy Game 2" },
      refinoEic: {
        hierarquia: {
          objectivoEstrategico: "Usar CEO no MG2",
          objectivoActual: "Fechar outdoor"
        },
        pendencias: [],
        proximaAcao: null
      },
      gestaoObjectivos: { evento: "mudar" },
      gestaoTopicos: { evento: "shift", ancora: "pagamento" }
    },
    instrucao: "Agora quero falar de pagamento"
  });
  assert.equal(cn.modoAdaptacao, "mudanca");
  assert.equal(cn.camadas.E, undefined);
  assert.doesNotMatch(String(cn.texto), /Objectivo principal:/i);
  assert.ok(cn.camadas.A);
});

test("DESP-006: exploração — não fecha com muleta; mantém condução", () => {
  _resetVariacaoParaTestes();
  const parecer = parecerValidoCompleto();
  parecer.decisaoExecutiva.estado = "monitorar";
  parecer.decisaoExecutiva.recomendacao = "Explorar trade-offs antes de fechar";
  parecer.lacunas = [];
  const cn = aplicarConversacaoNatural({
    ok: true,
    modo: "mre",
    mensagem: "x",
    dados: { parecer, coa: { nome: "Motoboy Game 2" } },
    instrucao: "O que achas das opções para outdoor?"
  });
  assert.equal(cn.modoAdaptacao, "exploratorio");
  assert.equal(cn.camadas.F, undefined);
  assert.ok(cn.camadas.A || cn.camadas.D);
});

test("DESP-007: recupera decisão permanente quando pedida", () => {
  _resetVariacaoParaTestes();
  const parecer = parecerValidoCompleto();
  parecer.decisaoExecutiva.alternativas = [];
  const cn = aplicarConversacaoNatural({
    ok: true,
    modo: "mre",
    mensagem: "x",
    historico: [
      { papel: "usuario", texto: "focar pagamento" },
      { papel: "ceo", texto: "Priorizei pagamento." },
      { papel: "usuario", texto: "ok" },
      { papel: "ceo", texto: "Seguimos." },
      { papel: "usuario", texto: "onde paramos?" }
    ],
    dados: {
      parecer,
      coa: { nome: "Motoboy Game 2" },
      refinoEic: {
        hierarquia: { objectivoEstrategico: "Usar CEO no MG2" },
        decisoesTomadas: ["Adiar outdoor e focar pagamento"],
        pendencias: ["Validar Sprint 1"],
        proximaAcao: "Validar Sprint 1"
      }
    },
    instrucao: "Onde paramos? Lembra o que decidimos?"
  });
  assert.ok(cn.contextoImediato.decisoesTomadas.length >= 1);
  assert.ok(cn.camadas.M, "camada memória");
  assert.match(String(cn.camadas.M), /decisão|Adiar outdoor|pagamento/i);
  assert.ok(!/cor do botão|facto temporário/i.test(cn.texto));
});

test("DESP-007: confirmação rápida não despeja memória", () => {
  _resetVariacaoParaTestes();
  const parecer = parecerValidoCompleto();
  const cn = aplicarConversacaoNatural({
    ok: true,
    modo: "mre",
    mensagem: "x",
    historico: [
      { papel: "usuario", texto: "a" },
      { papel: "ceo", texto: "b" },
      { papel: "usuario", texto: "c" },
      { papel: "ceo", texto: "d" }
    ],
    dados: {
      parecer,
      coa: { nome: "Motoboy Game 2" },
      refinoEic: {
        hierarquia: { objectivoEstrategico: "Usar CEO no MG2" },
        decisoesTomadas: ["Adiar outdoor e focar pagamento"],
        pendencias: ["Validar Sprint 1"],
        proximaAcao: "Validar Sprint 1"
      }
    },
    instrucao: "ok"
  });
  assert.equal(cn.modoAdaptacao, "rapido");
  assert.equal(cn.camadas.M, undefined);
});

test("DESP-007: abertura leve — sem retomar Objectivo/decisão automaticamente (Etapa 4)", () => {
  _resetVariacaoParaTestes();
  const cn = aplicarConversacaoNatural({
    ok: true,
    modo: "local",
    mensagem: "Bom dia",
    instrucao: "bom dia",
    dados: {
      intencao: { id: "saudacao" },
      coa: { nome: "Motoboy Game 2" },
      refinoEic: {
        hierarquia: { objectivoEstrategico: "Usar CEO no MG2" },
        decisoesTomadas: ["Priorizar pagamento"],
        proximaAcao: "Validar Sprint 1",
        pendencias: []
      }
    }
  });
  assert.equal(cn.tipoTurno, TIPO_TURNO.ABERTURA);
  assert.match(cn.texto, /Bom dia/i);
  assert.doesNotMatch(cn.texto, /Objectivo principal:/i);
  assert.doesNotMatch(cn.texto, /Priorizar pagamento/i);
  assert.doesNotMatch(cn.texto, /Antecipo pendência/i);
});

test("DESP-008: «ok» a meio da missão — mantém iniciativa (próxima acção)", () => {
  _resetVariacaoParaTestes();
  const parecer = parecerValidoCompleto();
  parecer.decisaoExecutiva.alternativas = [];
  parecer.lacunas = [];
  parecer.riscos = [];
  parecer.oportunidades = [];
  const cn = aplicarConversacaoNatural({
    ok: true,
    modo: "mre",
    mensagem: "x",
    historico: [
      { papel: "usuario", texto: "focar pagamento" },
      { papel: "ceo", texto: "Priorizei pagamento." },
      { papel: "usuario", texto: "segue" },
      { papel: "ceo", texto: "Plano em curso." },
      { papel: "usuario", texto: "ok" }
    ],
    dados: {
      parecer,
      coa: { nome: "Motoboy Game 2" },
      refinoEic: {
        hierarquia: {
          objectivoEstrategico: "Usar CEO no MG2",
          objectivoAtual: "fechar pagamento",
          entregaCorrente: "integração pagamento"
        },
        decisoesTomadas: ["Adiar outdoor; focar pagamento"],
        pendencias: ["Validar Sprint 1"],
        proximaAcao: "Validar Sprint 1",
        estadoConversa: {
          emExecucao: "integração pagamento",
          pendentes: ["Validar Sprint 1"],
          concluidos: [],
          bloqueio: null
        }
      }
    },
    instrucao: "ok"
  });
  assert.equal(cn.contextoImediato.missaoActiva, true);
  assert.equal(cn.modoAdaptacao, "rapido");
  assert.ok(cn.camadas.D || cn.camadas.N, "condução na missão");
  assert.match(
    String(cn.camadas.D || cn.camadas.N || cn.texto),
    /Sprint|missão|próxim|pendência|Validar|avanço/i
  );
  assert.equal(cn.camadas.P, undefined);
  assert.equal(cn.camadas.C, undefined);
});

test("DESP-008: entrega diverge — sem âncora Objectivo automática (Etapa 4)", () => {
  _resetVariacaoParaTestes();
  const parecer = parecerValidoCompleto();
  parecer.decisaoExecutiva.alternativas = [];
  const cn = aplicarConversacaoNatural({
    ok: true,
    modo: "mre",
    mensagem: "x",
    historico: [
      { papel: "usuario", texto: "Usar CEO no MG2 é o objectivo" },
      { papel: "ceo", texto: "Objectivo principal: Usar CEO no MG2." },
      { papel: "usuario", texto: "e a arte do outdoor?" }
    ],
    dados: {
      parecer,
      coa: { nome: "Motoboy Game 2" },
      refinoEic: {
        hierarquia: {
          objectivoEstrategico: "Usar CEO no MG2",
          objectivoAtual: "pagamento",
          entregaCorrente: "arte-outdoor"
        },
        decisoesTomadas: ["Priorizar pagamento"],
        proximaAcao: "Fechar arte sem perder pagamento",
        pendencias: [],
        estadoConversa: {
          emExecucao: "arte-outdoor",
          pendentes: [],
          concluidos: [],
          bloqueio: null
        }
      }
    },
    instrucao: "falar da arte do outdoor"
  });
  assert.equal(cn.camadas.E, undefined);
  assert.doesNotMatch(String(cn.texto), /Objectivo principal:/i);
  assert.ok(cn.camadas.A);
});

test("DESP-009: naturalizar com lastro Engine → missão activa na CN", () => {
  _resetVariacaoParaTestes();
  const out = naturalizarRespostaNucleo(
    {
      ok: true,
      modo: "local",
      mensagem: "Seguimos.",
      dados: { rota: "deterministica" }
    },
    {
      instrucao: "ok",
      historico: [
        { papel: "usuario", texto: "focar pagamento" },
        { papel: "ceo", texto: "Priorizei." },
        { papel: "usuario", texto: "ok" }
      ],
      lastroConsciencia: {
        temContextoRelevante: true,
        memoriaTrabalhoExecutiva: {
          objectivoAtivo: "Usar CEO no MG2",
          hierarquia: {
            objectivoEstrategico: "Usar CEO no MG2",
            objectivoAtual: "pagamento",
            entregaCorrente: "integração"
          },
          decisoesTomadas: ["Adiar outdoor; focar pagamento"],
          pendencias: ["Validar Sprint 1"],
          proximaAcao: "Validar Sprint 1",
          estadoConversa: {
            emExecucao: "integração",
            pendentes: [],
            concluidos: [],
            bloqueio: null
          }
        }
      }
    }
  );
  assert.equal(
    out.dados.conversacaoNatural.contextoImediato.missaoActiva,
    true
  );
  // Etapa 4: lastro interno activo; prosa não despeja Objectivo/Antecipo automaticamente
  assert.doesNotMatch(String(out.mensagem), /Objectivo principal:/i);
  assert.doesNotMatch(String(out.mensagem), /Antecipo pendência aberta/i);
});

test("DESP-008: actividade concluída — condução sem envelope Objectivo (Etapa 4)", () => {
  _resetVariacaoParaTestes();
  const parecer = parecerValidoCompleto();
  parecer.decisaoExecutiva.alternativas = [];
  parecer.lacunas = [];
  parecer.riscos = [];
  parecer.oportunidades = [];
  parecer.acao = { tipo: "orientar", descricao: "Ponto fechado", job: null };
  const cn = aplicarConversacaoNatural({
    ok: true,
    modo: "mre",
    mensagem: "x",
    dados: {
      parecer,
      coa: { nome: "Motoboy Game 2" },
      refinoEic: {
        hierarquia: { objectivoEstrategico: "Usar CEO no MG2" },
        decisoesTomadas: ["Fechar Sprint 1"],
        pendencias: [],
        proximaAcao: null,
        encerramento: {
          actividadeConcluida: true,
          necessitaNovoDespacho: true
        },
        estadoConversa: {
          emExecucao: null,
          concluidos: ["Sprint 1"],
          pendentes: [],
          bloqueio: null
        }
      }
    },
    instrucao: "fechámos a sprint"
  });
  assert.doesNotMatch(String(cn.texto), /Objectivo principal:/i);
  assert.ok(cn.camadas.A || cn.camadas.D);
  assert.match(
    String(cn.camadas.D || cn.camadas.A || cn.texto),
    /próximo|autorizamos|Confirmamos|Ponto fechado|\?/i
  );
});
