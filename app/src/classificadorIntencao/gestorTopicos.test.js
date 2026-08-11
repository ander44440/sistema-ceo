/**
 * IMP-063 / REQ-063 — Gestão de Mudança de Assunto.
 * CT-T01…CT-T13.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test, beforeEach } from "node:test";

import {
  gestorTopicos,
  criarTopico,
  trimPausas,
  aplicarShiftEstado,
  LIMIAR_SHIFT,
  MAX_PAUSAS
} from "./gestorTopicos.js";
import {
  obterEstadoTopicosSessao,
  definirEstadoTopicosSessao,
  resetEstadoTopicosSessao,
  aplicarResultadoGestaoTopicos
} from "./topicosSessao.js";
import { resetEstadoObjectivoSessao } from "./objectivoSessao.js";
import { seleccionarHistoricoRecente } from "./historicoRecente.js";
import { classificar, LIMIAR_CONFIANCA } from "./regras.js";
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
  resetEstadoTopicosSessao();
  resetEstadoObjectivoSessao();
});

const ISO = "2026-08-03T12:00:00.000Z";

test("CT-T01: neutro / sem marcadores — activo inalterado; baseline 061+062", () => {
  const activo = criarTopico("outdoor", "usuario", ISO);
  definirEstadoTopicosSessao({ topicoActivo: activo, pausas: [] });
  const r = gestorTopicos({
    mensagem: "O que é um ADR?",
    historicoRecente: [],
    topicoActivo: activo,
    pausas: [],
    agoraIso: ISO
  });
  assert.equal(r.evento, "neutro");
  assert.equal(r.topicoActivo?.ancora, "outdoor");
  assert.equal(LIMIAR_CONFIANCA, 0.55);
  const s = classificar("O que é um ADR?");
  assert.notEqual(s.classe, "trabalho_executivo");
});

test("CT-T02: shift/retomar respeitam ≤1 activo e ≤2 pausas", () => {
  let activo = criarTopico("outdoor", "usuario", ISO);
  let pausas = [];
  const t1 = gestorTopicos({
    mensagem: "Agora sobre o pagamento",
    topicoActivo: activo,
    pausas,
    agoraIso: ISO
  });
  assert.equal(t1.evento, "shift");
  assert.equal(t1.topicoActivo?.ancora, "pagamento");
  assert.equal(t1.pausas.length, 1);
  assert.ok(t1.pausas.length <= MAX_PAUSAS);

  activo = t1.topicoActivo;
  pausas = t1.pausas;
  const t2 = gestorTopicos({
    mensagem: "Agora sobre o dispatcher",
    topicoActivo: activo,
    pausas,
    agoraIso: ISO
  });
  assert.equal(t2.evento, "shift");
  assert.ok(t2.pausas.length <= 2);
  assert.ok(!t2.topicoActivo || t2.pausas.every((p) => p.ancora !== t2.topicoActivo.ancora));

  const t3 = gestorTopicos({
    mensagem: "Agora sobre a fila",
    topicoActivo: t2.topicoActivo,
    pausas: t2.pausas,
    agoraIso: ISO
  });
  assert.ok(t3.pausas.length <= 2);
  // Activo único
  assert.ok(t3.topicoActivo);
  assert.equal(
    [t3.topicoActivo, ...t3.pausas].filter((x) => x).length,
    1 + t3.pausas.length
  );
});

test("CT-T03: continua no mesmo tópico → continuar", () => {
  const activo = criarTopico("outdoor", "usuario", ISO);
  const r = gestorTopicos({
    mensagem: "continua",
    historicoRecente: [
      { papel: "ceo", texto: "Frente outdoor em curso." }
    ],
    topicoActivo: activo,
    pausas: [],
    agoraIso: ISO
  });
  assert.equal(r.evento, "continuar");
  assert.equal(r.topicoActivo?.ancora, "outdoor");
});

test("CT-T04: shift explícito pagamento; outdoor em pausa; ≠ C3", () => {
  const activo = criarTopico("outdoor", "usuario", ISO);
  const r = gestorTopicos({
    mensagem: "Agora sobre o pagamento",
    topicoActivo: activo,
    pausas: [],
    agoraIso: ISO
  });
  assert.equal(r.evento, "shift");
  assert.equal(r.topicoActivo?.ancora, "pagamento");
  assert.equal(r.pausas[0]?.ancora, "outdoor");
  const s = classificar("Agora sobre o pagamento", { frenteActiva: true });
  assert.notEqual(s.classe, "trabalho_executivo");
  assert.equal(s.permiteJob, false);
});

test("CT-T05: retomar outdoor em pausa", () => {
  const activo = criarTopico("pagamento", "usuario", ISO);
  const pausa = criarTopico("outdoor", "usuario", ISO);
  const r = gestorTopicos({
    mensagem: "Voltando ao outdoor",
    topicoActivo: activo,
    pausas: [pausa],
    agoraIso: ISO
  });
  assert.equal(r.evento, "retomar");
  assert.equal(r.topicoActivo?.ancora, "outdoor");
  assert.ok(r.pausas.some((p) => /pagamento/i.test(p.ancora)));
});

test("CT-T06: ambiguidade → pergunta curta; 0 Jobs", async () => {
  const activo = criarTopico("outdoor", "usuario", ISO);
  const r = gestorTopicos({
    mensagem: "Outdoor ou pagamento?",
    topicoActivo: activo,
    pausas: [criarTopico("pagamento", "usuario", ISO)],
    agoraIso: ISO
  });
  assert.equal(r.evento, "ambiguo_topico");
  assert.match(r.perguntaCurta, /\?/);
  assert.equal(r.commitEstado, false);
  assert.equal(r.topicoActivo?.ancora, "outdoor");

  definirEstadoTopicosSessao({
    topicoActivo: activo,
    pausas: [criarTopico("pagamento", "usuario", ISO)]
  });
  const out = await executiveEngine.executar(
    {
      texto: "Outdoor ou pagamento?",
      historico: [
        { papel: "usuario", texto: "Sobre o outdoor." },
        { papel: "ceo", texto: "Outdoor em curso." }
      ]
    },
    {}
  );
  assert.equal(out.modo, "clarificacao_topico");
  assert.equal(out.dados?.motorAcionado, false);
  assert.match(out.mensagem, /\?/);
});

test("CT-T07: anti-C3 — shift/retomar/ambiguo não forçam C3", () => {
  const msgs = [
    "Agora sobre o pagamento",
    "Voltando ao outdoor",
    "Outdoor ou pagamento?"
  ];
  for (const m of msgs) {
    const s = classificar(m, { frenteActiva: true });
    assert.notEqual(s.classe, "trabalho_executivo", m);
    assert.equal(s.permiteJob, false, m);
  }
  assert.equal(LIMIAR_SHIFT, 0.65);
  assert.equal(LIMIAR_CONFIANCA, 0.55);
});

test("CT-T08: C3 na mensagem actual preservado", () => {
  const hist = seleccionarHistoricoRecente(
    [
      { papel: "usuario", texto: "Onde estamos no outdoor?" },
      { papel: "ceo", texto: "Outdoor em curso." },
      { papel: "usuario", texto: "Implementa o outdoor lateral" }
    ],
    "Implementa o outdoor lateral"
  );
  const s = classificar("Implementa o outdoor lateral", {
    frenteActiva: true,
    historicoRecente: hist
  });
  assert.equal(s.classe, "trabalho_executivo");
  const r = gestorTopicos({
    mensagem: "Implementa o outdoor lateral",
    historicoRecente: hist,
    topicoActivo: criarTopico("outdoor", "usuario", ISO),
    pausas: [],
    agoraIso: ISO
  });
  // Gestor não escreve classe
  assert.ok(["continuar", "shift", "neutro"].includes(r.evento));
  assert.equal(typeof r.classe, "undefined");
});

test("CT-T09: Gate + Aprovado → Continuidade", async () => {
  const store = obterStoreContinuidadePadrao();
  const pub = criarPublicadorFilaMemoria();
  registarGateAposMotor(
    store,
    {
      id: "parecer-t09",
      diagnostico: { objetivoReal: "outdoor" },
      acao: { job: { titulo: "outdoor" } }
    },
    {
      aguardandoGate: true,
      ciclo: { id: "c-t09" },
      avaliacao: { gatilhos: ["G2"] }
    },
    "Despachar outdoor"
  );
  const out = await executiveEngine.executar(
    { texto: "Aprovado" },
    { storeContinuidade: store, publicarJob: pub.publicar, decisaoAprovacao: "aprovado" }
  );
  assert.ok(
    out.modo === "continuidade_gate" ||
      out.dados?.encaminhamento?.destino === "continuidade_gate" ||
      out.dados?.classificacao == null
  );
  assert.notEqual(out.modo, "clarificacao_topico");
});

test("CT-T10: Gate pendente + shift → processa (P0); Gate não auto-fechado", async () => {
  const store = obterStoreContinuidadePadrao();
  registarGateAposMotor(
    store,
    {
      id: "parecer-t10",
      diagnostico: { objetivoReal: "outdoor" },
      acao: { job: { titulo: "outdoor" } }
    },
    {
      aguardandoGate: true,
      ciclo: { id: "c-t10" },
      avaliacao: { gatilhos: ["G2"] }
    },
    "Despachar outdoor"
  );
  definirEstadoTopicosSessao({
    topicoActivo: criarTopico("outdoor", "usuario", ISO),
    pausas: []
  });
  const out = await executiveEngine.executar(
    { texto: "Agora sobre o pagamento" },
    { storeContinuidade: store }
  );
  assert.notEqual(out.modo, "clarificacao_gate_shift");
  assert.notEqual(out.modo, "continuidade_gate_clarificacao");
  // Gate ainda activo (execução ainda requer autorização)
  assert.ok(store.obterGatePendenteMaisRecente());
});

test("CT-T11: source gestor sem Motor/NCS/Fila/SDK", () => {
  const src = readFileSync(join(__dirname, "gestorTopicos.js"), "utf8");
  assert.doesNotMatch(src, /from\s+["'].*motorExecucao/);
  assert.doesNotMatch(src, /from\s+["'].*mre\/ncs/);
  assert.doesNotMatch(src, /publicarJob|conduzirApos|@cursor\/sdk|@anthropic|openai/i);
  assert.doesNotMatch(src, /permiteJob\s*[:=]\s*true/);
  assert.doesNotMatch(src, /\bclasse\s*[:=]/);
});

test("CT-T12: trim pausas e aplicarShift — contrato de estado", () => {
  const a = criarTopico("outdoor", "usuario", ISO);
  const b = criarTopico("pagamento", "usuario", ISO);
  const c = criarTopico("dispatcher", "usuario", ISO);
  const d = criarTopico("fila", "usuario", ISO);
  const estado = aplicarShiftEstado(a, [b, c], d);
  assert.equal(estado.topicoActivo.ancora, "fila");
  assert.ok(estado.pausas.length <= 2);
  assert.equal(trimPausas([a, b, c], d).length, 2);
});

test("CT-T13: ambiguidade tópico + deixis → no máximo uma pergunta (prioridade tópico)", async () => {
  definirEstadoTopicosSessao({
    topicoActivo: criarTopico("outdoor", "usuario", ISO),
    pausas: [criarTopico("pagamento", "usuario", ISO)]
  });
  const out = await executiveEngine.executar(
    {
      texto: "Outdoor ou pagamento?",
      historico: [
        { papel: "usuario", texto: "Outdoor e pagamento no MG2." },
        {
          papel: "ceo",
          texto: "Outdoor atrasado; pagamento ainda em análise."
        }
      ]
    },
    {}
  );
  assert.equal(out.modo, "clarificacao_topico");
  assert.notEqual(out.modo, "clarificacao_referente");
  assert.match(out.mensagem, /\?/);
  // Uma única pergunta na mensagem
  assert.equal((out.mensagem.match(/\?/g) || []).length, 1);
});

test("CT-T-extra: store aplica só com commitEstado", () => {
  const activo = criarTopico("outdoor", "usuario", ISO);
  definirEstadoTopicosSessao({ topicoActivo: activo, pausas: [] });
  aplicarResultadoGestaoTopicos({
    evento: "ambiguo_topico",
    topicoActivo: criarTopico("pagamento", "usuario", ISO),
    pausas: [],
    perguntaCurta: "?",
    razaoTopico: "teste",
    commitEstado: false
  });
  assert.equal(obterEstadoTopicosSessao().topicoActivo?.ancora, "outdoor");
});

test("CT-T-fronteira: gestor não importa destinos/motor", () => {
  const src = readFileSync(join(__dirname, "gestorTopicos.js"), "utf8");
  assert.match(src, /IMP-063|REQ-063|ARQ-024/);
  const idx = readFileSync(join(rootSrc, "executiveEngine", "index.js"), "utf8");
  assert.match(idx, /gestorTopicos/);
  assert.match(idx, /clarificacao_topico|clarificacao_gate_shift/);
});

test("DESP-010: «Adiar outdoor e focar pagamento» não é ambiguidade", () => {
  const r = gestorTopicos({
    mensagem: "Adiar outdoor e focar pagamento. Decide e conduz a missão.",
    topicoActivo: null,
    pausas: [],
    agoraIso: ISO
  });
  assert.notEqual(r.evento, "ambiguo_topico");
  assert.ok(r.evento === "shift" || r.evento === "continuar");
  assert.match(String(r.topicoActivo?.ancora || ""), /pagamento/i);

  // Escolha explícita continua a pedir clarificação
  const amb = gestorTopicos({
    mensagem: "Outdoor ou pagamento?",
    topicoActivo: criarTopico("outdoor", "usuario", ISO),
    pausas: [criarTopico("pagamento", "usuario", ISO)],
    agoraIso: ISO
  });
  assert.equal(amb.evento, "ambiguo_topico");
});
