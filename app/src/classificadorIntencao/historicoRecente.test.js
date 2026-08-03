/**
 * IMP-061 / REQ-061 — Histórico Conversacional no Classificador.
 * CT-01…CT-12 + janela 4/200/800.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test, beforeEach } from "node:test";

import {
  seleccionarHistoricoRecente,
  historicoTemReferenciaProjeto,
  mensagemEhDeixisOuFollowUp,
  JANELA_MAX_MSGS,
  CAP_CHARS_MSG,
  CAP_CHARS_TOTAL
} from "./historicoRecente.js";
import {
  classificar,
  aplicarDesambiguacaoHistorico,
  LIMIAR_CONFIANCA
} from "./regras.js";
import { primeiroPassoClassificar } from "./integracaoNucleo.js";
import { executiveEngine } from "../executiveEngine/index.js";
import {
  resetStoreContinuidadePadrao,
  obterStoreContinuidadePadrao,
  registarGateAposMotor
} from "../continuidadeGate/integracaoConversa.js";
import { criarPublicadorFilaMemoria } from "../motorExecucao/ponteParecerJob.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootSrc = join(__dirname, "..");

beforeEach(() => {
  resetStoreContinuidadePadrao();
});

const HIST_OUTDOOR = [
  { papel: "usuario", texto: "Onde estamos no outdoor do MG2?" },
  {
    papel: "ceo",
    texto: "Frente outdoor: falta o painel lateral e a priorização."
  }
];

test("CT-01: sem histórico → idêntico ao baseline (amostra IMP-057)", () => {
  const amostras = [
    "Bom dia",
    "O que é um ADR?",
    "lista os jobs",
    "Implementa o outdoor lateral",
    "onde estamos no outdoor?",
    "resolve isso"
  ];
  for (const texto of amostras) {
    const a = classificar(texto);
    const b = classificar(texto, {});
    const c = classificar(texto, { historicoRecente: [] });
    assert.equal(a.classe, b.classe, texto);
    assert.equal(a.confianca, b.confianca, texto);
    assert.equal(a.destino, b.destino, texto);
    assert.equal(a.permiteJob, b.permiteJob, texto);
    assert.equal(a.classe, c.classe, texto);
    assert.equal(a.confianca, c.confianca, texto);
    assert.equal(a.destino, c.destino, texto);
  }
  const comFrente = "onde estamos no outdoor?";
  const f1 = classificar(comFrente, { frenteActiva: true });
  const f2 = classificar(comFrente, {
    frenteActiva: true,
    historicoRecente: []
  });
  assert.equal(f1.classe, f2.classe);
  assert.equal(f1.confianca, f2.confianca);
  assert.equal(f1.destino, f2.destino);
});

test("CT-02: janela máx. 4; caps 200/msg e 800 total", () => {
  assert.equal(JANELA_MAX_MSGS, 4);
  assert.equal(CAP_CHARS_MSG, 200);
  assert.equal(CAP_CHARS_TOTAL, 800);

  const longo = "x".repeat(500);
  const hist = [];
  for (let i = 0; i < 8; i += 1) {
    hist.push({ papel: i % 2 === 0 ? "usuario" : "ceo", texto: `${longo}-${i}` });
  }
  const actual = "e isso?";
  hist.push({ papel: "usuario", texto: actual });

  const janela = seleccionarHistoricoRecente(hist, actual);
  assert.ok(janela.length <= 4);
  assert.equal(janela.length, 4, "só 4 anteriores");
  let total = 0;
  for (const item of janela) {
    assert.ok(item.texto.length <= CAP_CHARS_MSG + 1); // … pode contar
    assert.ok(item.texto.length <= 200 || item.texto.endsWith("…"));
    total += item.texto.length;
  }
  assert.ok(total <= CAP_CHARS_TOTAL);
});

test("CT-03: deixis + histórico projecto → C2; não C3", () => {
  const hist = seleccionarHistoricoRecente(
    [...HIST_OUTDOOR, { papel: "usuario", texto: "e isso?" }],
    "e isso?"
  );
  assert.equal(historicoTemReferenciaProjeto(hist), true);
  assert.equal(mensagemEhDeixisOuFollowUp("e isso?"), true);

  const s = classificar("e isso?", {
    frenteActiva: true,
    historicoRecente: hist
  });
  assert.equal(s.classe, "conversa_projeto");
  assert.notEqual(s.classe, "trabalho_executivo");
  assert.equal(s.permiteJob, false);
  assert.ok(s.confianca >= LIMIAR_CONFIANCA);
  assert.equal(s.precisaClarificacao, false);
  assert.equal(s.destino, "nucleo_mre");
  assert.match(s.razaoCurta, /Histórico recente|C1↔C2|C2/i);
});

test("CT-04: anti-C3 — histórico com «implementa» não força C3 em follow-up", () => {
  const histBase = [
    { papel: "usuario", texto: "Implementa o outdoor lateral e despacha" },
    { papel: "ceo", texto: "Aguardando aprovação (Gate G2)." }
  ];
  for (const msg of ["ok", "e agora?"]) {
    const hist = seleccionarHistoricoRecente(
      [...histBase, { papel: "usuario", texto: msg }],
      msg
    );
    const s = classificar(msg, {
      frenteActiva: true,
      historicoRecente: hist
    });
    assert.notEqual(s.classe, "trabalho_executivo", msg);
    assert.equal(s.permiteJob, false, msg);
  }
});

test("CT-05: C3 na mensagem actual permanece C3 com histórico", () => {
  const hist = seleccionarHistoricoRecente(
    [
      ...HIST_OUTDOOR,
      { papel: "usuario", texto: "Implementa o outdoor lateral" }
    ],
    "Implementa o outdoor lateral"
  );
  const s = classificar("Implementa o outdoor lateral", {
    frenteActiva: true,
    historicoRecente: hist
  });
  assert.equal(s.classe, "trabalho_executivo");
  assert.equal(s.destino, "motor_execucao");
  assert.equal(s.permiteJob, true);
});

test("CT-06: limiar 0,55 preservado", () => {
  assert.equal(LIMIAR_CONFIANCA, 0.55);
  const vago = classificar("resolve isso");
  assert.ok(
    vago.precisaClarificacao === true || vago.confianca < LIMIAR_CONFIANCA
  );
  assert.equal(
    vago.permiteJob && vago.classe === "trabalho_executivo",
    false
  );
});

test("CT-07: SC-01 — ADR sem projecto no histórico → C1", () => {
  const s = classificar("O que é um ADR?", {
    historicoRecente: [
      { papel: "usuario", texto: "Bom dia" },
      { papel: "ceo", texto: "Bom dia. Qual é o objectivo?" }
    ]
  });
  assert.equal(s.classe, "conhecimento_geral");
  assert.equal(s.permiteJob, false);
  assert.equal(s.destino, "resposta_leve");
});

test("CT-08: C4 «lista os jobs» — histórico não altera", () => {
  const hist = seleccionarHistoricoRecente(
    [
      ...HIST_OUTDOOR,
      { papel: "usuario", texto: "lista os jobs" }
    ],
    "lista os jobs"
  );
  const sem = classificar("lista os jobs");
  const com = classificar("lista os jobs", { historicoRecente: hist });
  assert.equal(sem.classe, "comando_operacional");
  assert.equal(com.classe, "comando_operacional");
  assert.equal(com.destino, "capacidade_operacional");
});

test("CT-09: Gate pendente + Aprovado → Continuidade; Classificador não decide", async () => {
  const store = obterStoreContinuidadePadrao();
  const fila = criarPublicadorFilaMemoria();
  await executiveEngine.executar("Resolva os bugs do projeto.", {
    storeContinuidade: store,
    publicarJob: fila.publicarJob.bind(fila)
  });
  // Registar gate se motor devolveu aguardando (caminho típico)
  const pendente = store.obterGatePendenteMaisRecente?.() || store.obterContextoActivo?.();
  if (!pendente || !store.obterGatePendenteMaisRecente) {
    // fallback: abrir gate manualmente para o teste de precedência
    registarGateAposMotor(
      store,
      {
        id: "parecer-test-061",
        diagnostico: { objetivoReal: "bugs" },
        acao: { job: { titulo: "bugs" } }
      },
      { aguardandoGate: true, ciclo: { id: "c1" }, avaliacao: { gatilhos: ["G2"] } },
      "bugs"
    );
  }

  const out = await executiveEngine.executar("Aprovado.", {
    storeContinuidade: store,
    publicarJob: fila.publicarJob.bind(fila),
    decisaoAprovacao: "aprovado"
  });
  assert.ok(
    out.modo === "continuidade_gate" ||
      out.dados?.encaminhamento?.destino === "continuidade_gate" ||
      out.dados?.motor?.publicado === true ||
      out.dados?.classificacao == null,
    `esperado caminho continuidade/gate, modo=${out.modo}`
  );
  // Não deve ser classificação C1–C4 fresca como destino principal de «Aprovado»
  if (out.dados?.classificacao) {
    assert.fail("Aprovado com Gate não deveria reclassificar via Classificador");
  }
});

test("CT-10: Classificador / historicoRecente sem Gate/Motor/NCS/SDK", () => {
  for (const rel of [
    "classificadorIntencao/historicoRecente.js",
    "classificadorIntencao/regras.js"
  ]) {
    const src = readFileSync(join(rootSrc, rel), "utf8");
    assert.equal(/@cursor\/sdk/.test(src), false, rel);
    assert.equal(/from\s+["'].*continuidadeGate/.test(src), false, rel);
    assert.equal(/from\s+["'].*motorExecucao/.test(src), false, rel);
    assert.equal(/from\s+["'].*mre\/ncs/.test(src), false, rel);
  }
});

test("CT-11: EIC V1 — Núcleo um classificar + historicoRecente opcional", () => {
  const src = readFileSync(join(rootSrc, "executiveEngine/index.js"), "utf8");
  assert.match(src, /seleccionarHistoricoRecente/);
  assert.match(src, /primeiroPassoClassificar\(\s*texto\s*,\s*contextoClassificacao\s*\)/);
  assert.match(src, /classificarIntencao\(\s*texto\s*,\s*classificacao\s*\)/);
  assert.doesNotMatch(src, /const intencao = classificarIntencao\(\s*texto\s*\)\s*;/);
});

test("CT-12: SC-01…05 regressão com e sem histórico vazio", () => {
  const sc01 = classificar("O que é um ADR?");
  assert.equal(sc01.classe, "conhecimento_geral");

  const sc02 = classificar("onde estamos no outdoor?", { frenteActiva: true });
  assert.equal(sc02.classe, "conversa_projeto");

  const sc03 = primeiroPassoClassificar("implementa o outdoor lateral");
  assert.equal(sc03.classificacao.classe, "trabalho_executivo");

  const sc04 = classificar("lista os jobs");
  assert.equal(sc04.classe, "comando_operacional");

  const sc05 = classificar("resolve isso");
  assert.equal(
    sc05.permiteJob && sc05.classe === "trabalho_executivo",
    false
  );
});

test("IMP-061: aplicarDesambiguacaoHistorico é no-op sem histórico", () => {
  const base = classificar("e isso?", { frenteActiva: true });
  const same = aplicarDesambiguacaoHistorico(base, "e isso?", {
    frenteActiva: true
  });
  assert.equal(same.classe, base.classe);
  assert.equal(same.confianca, base.confianca);
});
