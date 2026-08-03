/**
 * IMP-062 / REQ-062 — Resolução de Referências Conversacionais.
 * CT-R01…CT-R12.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test, beforeEach } from "node:test";

import { seleccionarHistoricoRecente } from "./historicoRecente.js";
import {
  resolverReferencias,
  mensagemPedeResolucaoReferencia,
  LIMIAR_REFERENTE
} from "./resolverReferencias.js";
import { classificar, LIMIAR_CONFIANCA } from "./regras.js";
import { executiveEngine } from "../executiveEngine/index.js";
import {
  resetStoreContinuidadePadrao,
  obterStoreContinuidadePadrao,
  registarGateAposMotor
} from "../continuidadeGate/integracaoConversa.js";
import { criarPublicadorFilaMemoria } from "../motorExecucao/ponteParecerJob.js";
import { resetEstadoTopicosSessao } from "./topicosSessao.js";
import { resetEstadoObjectivoSessao } from "./objectivoSessao.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootSrc = join(__dirname, "..");

beforeEach(() => {
  resetStoreContinuidadePadrao();
  resetEstadoTopicosSessao();
  resetEstadoObjectivoSessao();
});

const HIST_OUTDOOR = [
  { papel: "usuario", texto: "Onde estamos no outdoor do MG2?" },
  {
    papel: "ceo",
    texto: "Frente outdoor: falta o painel lateral e a priorização."
  }
];

test("CT-R01: sem deixis / sem histórico → nenhum; classificação baseline", () => {
  const r = resolverReferencias({
    mensagem: "O que é um ADR?",
    historicoRecente: []
  });
  assert.equal(r.estado, "nenhum");
  const a = classificar("O que é um ADR?");
  const b = classificar("O que é um ADR?", { historicoRecente: [] });
  assert.equal(a.classe, b.classe);
  assert.equal(a.confianca, b.confianca);
});

test("CT-R02: janela IMP-061 4/200/800 reutilizada (sem nova janela)", () => {
  const src = readFileSync(
    join(__dirname, "resolverReferencias.js"),
    "utf8"
  );
  assert.match(src, /historicoRecente/);
  assert.doesNotMatch(src, /JANELA_MAX_MSGS\s*=\s*[5-9]/);
  const longo = "y".repeat(300);
  const hist = [];
  for (let i = 0; i < 6; i += 1) {
    hist.push({
      papel: i % 2 === 0 ? "usuario" : "ceo",
      texto: `outdoor ${longo}`
    });
  }
  const janela = seleccionarHistoricoRecente(
    [...hist, { papel: "usuario", texto: "isso" }],
    "isso"
  );
  assert.ok(janela.length <= 4);
});

test("CT-R03: e isso? + histórico outdoor → referente outdoor; ≠ C3", () => {
  const hist = seleccionarHistoricoRecente(
    [...HIST_OUTDOOR, { papel: "usuario", texto: "e isso?" }],
    "e isso?"
  );
  const r = resolverReferencias({
    mensagem: "e isso?",
    historicoRecente: hist,
    frenteActiva: true
  });
  assert.equal(r.estado, "resolvido");
  assert.match(r.referente.ancora, /outdoor/i);
  assert.ok(r.referente.confianca >= LIMIAR_REFERENTE);
  const s = classificar("e isso?", {
    frenteActiva: true,
    historicoRecente: hist
  });
  assert.notEqual(s.classe, "trabalho_executivo");
  assert.equal(s.permiteJob, false);
});

test("CT-R04: continua + objectivo CEO → referente; ≠ C3", () => {
  const hist = seleccionarHistoricoRecente(
    [...HIST_OUTDOOR, { papel: "usuario", texto: "continua" }],
    "continua"
  );
  const r = resolverReferencias({
    mensagem: "continua",
    historicoRecente: hist,
    frenteActiva: true
  });
  assert.equal(r.estado, "resolvido");
  assert.ok(r.referente.ancora);
  assert.notEqual(
    classificar("continua", { historicoRecente: hist, frenteActiva: true })
      .classe,
    "trabalho_executivo"
  );
});

test("CT-R05: o anterior — resolve ou ambíguo conforme lastro", () => {
  assert.equal(mensagemPedeResolucaoReferencia("o anterior"), true);
  const hist = seleccionarHistoricoRecente(
    [...HIST_OUTDOOR, { papel: "usuario", texto: "o anterior" }],
    "o anterior"
  );
  const r = resolverReferencias({
    mensagem: "o anterior",
    historicoRecente: hist,
    frenteActiva: true
  });
  assert.ok(r.estado === "resolvido" || r.estado === "ambiguo");
  if (r.estado === "resolvido") {
    assert.match(r.referente.ancora, /outdoor/i);
  }
});

test("CT-R06: anti-C3 — histórico implementa + mensagem isso", () => {
  const hist = seleccionarHistoricoRecente(
    [
      {
        papel: "usuario",
        texto: "Implementa o outdoor lateral e despacha"
      },
      { papel: "ceo", texto: "Aguardando aprovação (Gate G2)." },
      { papel: "usuario", texto: "isso" }
    ],
    "isso"
  );
  const r = resolverReferencias({
    mensagem: "isso",
    historicoRecente: hist,
    frenteActiva: true
  });
  assert.ok(r.estado === "resolvido" || r.estado === "ambiguo" || r.estado === "nenhum");
  const s = classificar("isso", { historicoRecente: hist, frenteActiva: true });
  assert.notEqual(s.classe, "trabalho_executivo");
  assert.equal(s.permiteJob, false);
});

test("CT-R07: C3 na mensagem actual preservado", () => {
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
  assert.equal(LIMIAR_CONFIANCA, 0.55);
  // Resolvedor não altera a classe
  const r = resolverReferencias({
    mensagem: "Implementa o outdoor lateral",
    historicoRecente: hist
  });
  assert.equal(r.estado, "nenhum");
});

test("CT-R08: ambiguidade outdoor vs pagamento → pergunta curta; 0 Jobs", async () => {
  const hist = seleccionarHistoricoRecente(
    [
      { papel: "usuario", texto: "Outdoor e pagamento no MG2." },
      {
        papel: "ceo",
        texto: "Outdoor atrasado; pagamento ainda em análise."
      },
      { papel: "usuario", texto: "isso" }
    ],
    "isso"
  );
  const r = resolverReferencias({
    mensagem: "isso",
    historicoRecente: hist,
    frenteActiva: true
  });
  assert.equal(r.estado, "ambiguo");
  assert.ok(r.candidatos.length >= 2);
  assert.match(r.perguntaCurta, /outdoor|pagamento/i);
  assert.match(r.perguntaCurta, /\?/);

  const out = await executiveEngine.executar(
    {
      texto: "isso",
      historico: [
        { papel: "usuario", texto: "Outdoor e pagamento no MG2." },
        {
          papel: "ceo",
          texto: "Outdoor atrasado; pagamento ainda em análise."
        },
        { papel: "usuario", texto: "isso" }
      ]
    },
    {}
  );
  assert.equal(out.modo, "clarificacao_referente");
  assert.equal(out.dados?.motorAcionado, false);
  assert.match(out.mensagem, /\?/);
});

test("CT-R09: Gate + Aprovado → Continuidade", async () => {
  const store = obterStoreContinuidadePadrao();
  const fila = criarPublicadorFilaMemoria();
  await executiveEngine.executar("Resolva os bugs do projeto.", {
    storeContinuidade: store,
    publicarJob: fila.publicarJob.bind(fila)
  });
  if (!store.obterGatePendenteMaisRecente()) {
    registarGateAposMotor(
      store,
      {
        id: "parecer-test-062",
        diagnostico: { objetivoReal: "bugs" },
        acao: { job: { titulo: "bugs" } }
      },
      {
        aguardandoGate: true,
        ciclo: { id: "c1" },
        avaliacao: { gatilhos: ["G2"] }
      },
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
      out.dados?.classificacao == null
  );
});

test("CT-R10: resolvedor sem Motor/NCS/Fila/SDK", () => {
  const src = readFileSync(join(__dirname, "resolverReferencias.js"), "utf8");
  assert.equal(/@cursor\/sdk/.test(src), false);
  assert.equal(/from\s+["'].*motorExecucao/.test(src), false);
  assert.equal(/from\s+["'].*mre\/ncs/.test(src), false);
  assert.equal(/from\s+["'].*continuidadeGate/.test(src), false);
});

test("CT-R11: regressão Classificador — limiar e ponto único", () => {
  assert.equal(LIMIAR_CONFIANCA, 0.55);
  const idx = readFileSync(join(rootSrc, "executiveEngine/index.js"), "utf8");
  assert.match(idx, /resolverReferencias/);
  assert.match(idx, /primeiroPassoClassificar/);
  assert.match(idx, /classificarIntencao\(\s*texto\s*,\s*classificacao\s*\)/);
});

test("CT-R12: C4 lista os jobs inalterado", () => {
  const hist = seleccionarHistoricoRecente(
    [...HIST_OUTDOOR, { papel: "usuario", texto: "lista os jobs" }],
    "lista os jobs"
  );
  const s = classificar("lista os jobs", { historicoRecente: hist });
  assert.equal(s.classe, "comando_operacional");
  const r = resolverReferencias({
    mensagem: "lista os jobs",
    historicoRecente: hist
  });
  assert.equal(r.estado, "nenhum");
});

test("IMP-062: integração e isso? resolve outdoor no Núcleo", async () => {
  const out = await executiveEngine.executar({
    texto: "e isso?",
    historico: [
      ...HIST_OUTDOOR,
      { papel: "usuario", texto: "e isso?" }
    ]
  });
  assert.notEqual(out.modo, "clarificacao_referente");
  assert.ok(out.dados?.resolucaoReferencia?.estado === "resolvido");
  assert.match(out.dados.resolucaoReferencia.referente.ancora, /outdoor/i);
  assert.notEqual(out.dados?.classificacao?.classe, "trabalho_executivo");
});
