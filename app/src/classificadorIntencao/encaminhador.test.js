/**
 * Testes Encaminhador — IMP-057 E3
 * (sem UI / Dispatcher / execução real de Núcleo ou Motor).
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { montarSaida } from "./dominio.js";
import {
  encaminharPorClasse,
  classificarEEncaminhar,
  tabelaEncaminhamentoV1,
  ROTAS_POR_DESTINO
} from "./encaminhador.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

test("E3-CA1: C1→resposta leve; C2→núcleo/MRE; C3→motor; C4→capacidades", () => {
  const c1 = encaminharPorClasse(
    montarSaida("conhecimento_geral", 0.9, "Saudação")
  );
  assert.equal(c1.ok, true);
  assert.equal(c1.destino, "resposta_leve");
  assert.equal(c1.rota.acaoPrevista, "resposta_imediata");
  assert.equal(c1.rota.nome, "Resposta imediata");

  const c2 = encaminharPorClasse(
    montarSaida("conversa_projeto", 0.85, "Outdoor")
  );
  assert.equal(c2.destino, "nucleo_mre");
  assert.equal(c2.rota.acaoPrevista, "nucleo_mre");
  assert.equal(c2.rota.nome, "Núcleo / MRE");

  const c3 = encaminharPorClasse(
    montarSaida("trabalho_executivo", 0.9, "Despacho")
  );
  assert.equal(c3.destino, "motor_execucao");
  assert.equal(c3.rota.acaoPrevista, "motor_execucao");
  assert.equal(c3.rota.sistemaAlvo, "motor_execucao_imp056");
  assert.equal(c3.mapa.C3, "motor_execucao");

  const c4 = encaminharPorClasse(
    montarSaida("comando_operacional", 0.9, "Status")
  );
  assert.equal(c4.destino, "capacidade_operacional");
  assert.equal(c4.rota.acaoPrevista, "capacidades_operacionais");

  const tab = tabelaEncaminhamentoV1();
  assert.equal(tab.length, 4);
  assert.deepEqual(
    tab.map((r) => r.destino),
    [
      "resposta_leve",
      "nucleo_mre",
      "motor_execucao",
      "capacidade_operacional"
    ]
  );
});

test("E3-CA2: encaminhador não publica Job nem chama Motor/Fila", () => {
  const src = readFileSync(join(__dirname, "encaminhador.js"), "utf8");
  assert.equal(/@cursor\/sdk/.test(src), false);
  assert.equal(/\bfetch\s*\(/.test(src), false);
  assert.equal(/publicarJob|conduzirMotor|despacharJob/.test(src), false);
  assert.equal(/from\s+["'].*motorExecucao/.test(src), false);
  assert.equal(/from\s+["'].*executiveEngine/.test(src), false);
  assert.equal(/document\.|window\./.test(src), false);

  const r = classificarEEncaminhar("Implementa o outdoor e despacha", {
    frenteActiva: true
  });
  assert.equal(r.executaEfeitos, false);
  assert.equal(r.destino, "motor_execucao");
  // só decide — não há efeito de Job neste módulo
  assert.equal("job" in r, false);
});

test("E3-CA3: clarificação quando a saída o indicar", () => {
  const clar = encaminharPorClasse(
    montarSaida("trabalho_executivo", 0.3, "Ambíguo")
  );
  assert.equal(clar.ok, true);
  assert.equal(clar.destino, "clarificacao");
  assert.equal(clar.rota.acaoPrevista, "pedir_clarificacao");
  assert.equal(clar.classificacao.precisaClarificacao, true);
  assert.equal(clar.classificacao.permiteJob, false);

  const viaTexto = classificarEEncaminhar("resolve isso");
  assert.equal(viaTexto.destino, "clarificacao");
  assert.equal(viaTexto.executaEfeitos, false);

  assert.equal(ROTAS_POR_DESTINO.clarificacao.permiteJob, false);
});

test("integração Classificador→rotas C1–C4 via classificarEEncaminhar", () => {
  const r1 = classificarEEncaminhar("Que horas são?");
  assert.equal(r1.destino, "resposta_leve");
  assert.equal(r1.classificacao.classe, "conhecimento_geral");

  const r2 = classificarEEncaminhar("Onde estamos no outdoor?", {
    frenteActiva: true
  });
  assert.equal(r2.destino, "nucleo_mre");
  assert.equal(r2.classificacao.classe, "conversa_projeto");

  const r3 = classificarEEncaminhar("Implementa o outdoor lateral e despacha");
  assert.equal(r3.destino, "motor_execucao");
  assert.equal(r3.classificacao.classe, "trabalho_executivo");

  const r4 = classificarEEncaminhar("Lista os jobs pendentes");
  assert.equal(r4.destino, "capacidade_operacional");
  assert.equal(r4.classificacao.classe, "comando_operacional");

  const bad = encaminharPorClasse({ classe: "x" });
  assert.equal(bad.ok, false);
  assert.equal(bad.destino, "clarificacao");
});
