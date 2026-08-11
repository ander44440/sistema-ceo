/**
 * DESP-005 — antecipação executiva.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { parecerValidoCompleto } from "../mre/parecer/fixtures.js";
import {
  perguntaEhGenericaAutorizacao,
  recolherSinais,
  seleccionarAntecipacao
} from "./antecipacaoExecutiva.js";

test("selecciona risco com evidência no parecer", () => {
  const parecer = parecerValidoCompleto();
  parecer.acao = { tipo: "orientar", descricao: "Focar pagamento", job: null };
  const s = seleccionarAntecipacao({
    parecer,
    ctxImediato: { pendencias: [], proximaAcao: null },
    canal: "chat",
    jaTemPlanoComRisco: false
  });
  assert.ok(s);
  assert.equal(s.tipo, "risco");
  assert.match(s.prosa, /Antecipo risco/i);
  assert.match(String(s.pergunta), /\?/);
});

test("com plano+risco, antecipa impacto futuro ou oportunidade", () => {
  const parecer = parecerValidoCompleto();
  const s = seleccionarAntecipacao({
    parecer,
    ctxImediato: { pendencias: [], proximaAcao: null },
    canal: "chat",
    jaTemPlanoComRisco: true
  });
  assert.ok(s);
  assert.ok(["risco", "dependencia", "oportunidade"].includes(s.tipo));
});

test("sem evidência → null", () => {
  const s = seleccionarAntecipacao({
    parecer: {
      decisaoExecutiva: { estado: "aprovar", recomendacao: "ok", alternativas: [] },
      riscos: [],
      oportunidades: [],
      acao: { descricao: "ok" },
      enquadramento: { escopo: "" }
    },
    ctxImediato: { pendencias: [], proximaAcao: null },
    canal: "chat"
  });
  assert.equal(s, null);
});

test("solicitar_dados não antecipa", () => {
  const parecer = parecerValidoCompleto();
  parecer.decisaoExecutiva.estado = "solicitar_dados";
  assert.equal(
    seleccionarAntecipacao({ parecer, canal: "chat", ctxImediato: {} }),
    null
  );
});

test("recolherSinais: pendência só com panorama ou pedido de pendência", () => {
  const semAutorizacao = recolherSinais({
    parecer: { riscos: [], oportunidades: [], acao: { descricao: "x" } },
    ctxImediato: { pendencias: ["Validar Sprint 1"], proximaAcao: null },
    instrucao: "O que achas disto?"
  });
  assert.equal(
    semAutorizacao.some((s) => s.tipo === "pendencia"),
    false
  );

  const comPedido = recolherSinais({
    parecer: { riscos: [], oportunidades: [], acao: { descricao: "x" } },
    ctxImediato: { pendencias: ["Validar Sprint 1"], proximaAcao: null },
    instrucao: "Quais são as pendências abertas?"
  });
  assert.ok(comPedido.some((s) => s.tipo === "pendencia"));

  const comPanorama = recolherSinais({
    parecer: { riscos: [], oportunidades: [], acao: { descricao: "x" } },
    ctxImediato: { pendencias: ["Validar Sprint 1"], proximaAcao: null },
    instrucao: "Onde estamos no projeto?"
  });
  assert.ok(comPanorama.some((s) => s.tipo === "pendencia"));
});

test("perguntaEhGenericaAutorizacao", () => {
  assert.equal(
    perguntaEhGenericaAutorizacao("Qual é o próximo passo que autorizamos?"),
    true
  );
  assert.equal(
    perguntaEhGenericaAutorizacao("Quer que tratemos deste risco agora?"),
    false
  );
});
