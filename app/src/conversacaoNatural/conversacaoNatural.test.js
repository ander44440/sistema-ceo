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
  assert.ok(cn.camadas.B);
  // Porquê só se confiança baixa — fixture tem 0.82
  assert.equal(cn.camadas.C, undefined);
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
