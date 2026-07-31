/**
 * Testes Bloco 2 — IMP-014 / IMP-015 / IMP-016
 */

import assert from "node:assert/strict";
import { test } from "node:test";
import { classificarIntencao } from "../executiveEngine/classificar.js";
import {
  criarChamarLlmMock,
  ehRotaDeliberativa,
  executarDeliberacaoMre,
  executarRotaDeliberativa,
  flagMre,
  gerarComunicadoExecutivo,
  gerarComunicadosPorCanal,
  mapaLlmFluxoFeliz,
  parecerValidoCompleto,
  textoParaVoz,
  validarParecerExecutivo
} from "./index.js";

test("T14-01: intenções determinísticas não são rota deliberativa", () => {
  assert.equal(ehRotaDeliberativa({ id: "pergunta_data", capacidade: "ia" }), false);
  assert.equal(ehRotaDeliberativa({ id: "saudacao", capacidade: "ia" }), false);
  assert.equal(ehRotaDeliberativa({ id: "consultar_estado", capacidade: "memoria" }), false);
  assert.equal(ehRotaDeliberativa({ id: "abrir_dia", capacidade: "memoria" }), false);
});

test("T14-02: deliberar / deliberar_objetivo / pergunta_aberta são deliberativos", () => {
  assert.equal(ehRotaDeliberativa({ id: "deliberar", capacidade: "ia" }), true);
  assert.equal(ehRotaDeliberativa({ id: "deliberar_objetivo", capacidade: "ia" }), true);
  assert.equal(ehRotaDeliberativa({ id: "pergunta_aberta", capacidade: "ia" }), true);
});

test("T14-03: classificador — priorizar → deliberar_objetivo", () => {
  const i = classificarIntencao("Como priorizar o pagamento no MG2?");
  assert.equal(i.capacidade, "ia");
  assert.ok(ehRotaDeliberativa(i));
});

test("T14-04: flag MRE off desliga rota deliberativa", () => {
  const prev = flagMre.ativo;
  flagMre.ativo = false;
  assert.equal(ehRotaDeliberativa({ id: "deliberar", capacidade: "ia" }), false);
  flagMre.ativo = prev;
});

test("T14-05: fachada Núcleo→MRE com mock produz parecer válido + mensagem", async () => {
  const out = await executarRotaDeliberativa(
    {
      instrucao: "Devemos adiar o outdoor e focar no pagamento?",
      intencao: { id: "deliberar", capacidade: "ia" },
      memoria: () => ({
        proximoPasso: "Pagamento",
        pendencias: [],
        projetoAtivo: { id: "coa-mg2", nome: "MG2" }
      }),
      coaAtivo: { id: "coa-mg2", nome: "MG2" }
    },
    {
      canal: "chat",
      chamarLlm: criarChamarLlmMock(mapaLlmFluxoFeliz())
    }
  );
  assert.equal(out.ok, true);
  assert.equal(out.modo, "mre");
  assert.ok(out.mensagem);
  assert.equal(out.dados.rota, "deliberativa");
  assert.equal(validarParecerExecutivo(out.dados.parecer).ok, true);
  assert.equal(
    out.dados.comunicado.referenciaDecisao,
    out.dados.parecer.decisaoExecutiva.estado
  );
});

test("T15-01: Speaker recusa parecer inválido", () => {
  const r = gerarComunicadoExecutivo({ id: "x" }, "chat");
  assert.equal(r.ok, false);
});

test("T15-02: Speaker fidelidade — referenciaDecisao = estado", () => {
  const p = parecerValidoCompleto();
  const r = gerarComunicadoExecutivo(p, "chat");
  assert.equal(r.ok, true);
  assert.equal(r.comunicado.referenciaDecisao, p.decisaoExecutiva.estado);
  assert.ok(r.comunicado.texto.includes(p.decisaoExecutiva.recomendacao) || r.comunicado.texto.length > 20);
});

test("T15-03: solicitar_dados ⇒ perguntas não vazias", async () => {
  const deliberacao = await executarDeliberacaoMre(
    {
      mensagem: "O que faço?",
      coaId: null,
      snapshotPainel: null,
      factosOficiais: [],
      shortCircuit: true,
      intencao: { id: "deliberar" }
    },
    { chamarLlm: criarChamarLlmMock(mapaLlmFluxoFeliz()) }
  );
  assert.equal(deliberacao.ok, true);
  const r = gerarComunicadoExecutivo(deliberacao.parecer, "chat");
  assert.equal(r.ok, true);
  assert.equal(r.comunicado.referenciaDecisao, "solicitar_dados");
  assert.ok(r.comunicado.perguntas.length >= 1);
});

test("T15-04: Speaker não altera o parecer", () => {
  const p = parecerValidoCompleto();
  const estado = p.decisaoExecutiva.estado;
  gerarComunicadoExecutivo(p, "chat");
  assert.equal(p.decisaoExecutiva.estado, estado);
});

test("T16-01: canais partilham a mesma referenciaDecisao", () => {
  const p = parecerValidoCompleto();
  const r = gerarComunicadosPorCanal(p);
  assert.equal(r.ok, true);
  assert.equal(r.mesmoSignificado, true);
  assert.equal(
    r.porCanal.chat.referenciaDecisao,
    r.porCanal.voz.referenciaDecisao
  );
  assert.equal(
    r.porCanal.chat.referenciaDecisao,
    r.porCanal.centro_situacao.referenciaDecisao
  );
});

test("T16-02: voz usa guiãoVoz; centro tem destaques", () => {
  const p = parecerValidoCompleto();
  const r = gerarComunicadosPorCanal(p);
  assert.ok(r.porCanal.voz.guiãoVoz);
  assert.equal(textoParaVoz(r.porCanal.voz), r.porCanal.voz.guiãoVoz);
  assert.ok(Array.isArray(r.porCanal.centro_situacao.destaques));
  assert.ok(r.porCanal.centro_situacao.destaques.length >= 1);
});

test("T16-03: formas diferentes entre chat e voz", () => {
  const p = parecerValidoCompleto();
  const r = gerarComunicadosPorCanal(p);
  assert.notEqual(r.porCanal.chat.texto, r.porCanal.voz.texto);
});
