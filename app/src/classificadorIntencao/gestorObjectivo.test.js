/**
 * IMP-064 / REQ-064 — Objetivo Conversacional (Goal Tracking).
 * CT-G01…CT-G14.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test, beforeEach } from "node:test";

import {
  gestorObjectivo,
  criarObjectivo,
  LIMIAR_OBJECTIVO
} from "./gestorObjectivo.js";
import {
  obterEstadoObjectivoSessao,
  definirEstadoObjectivoSessao,
  resetEstadoObjectivoSessao,
  aplicarResultadoGestaoObjectivo
} from "./objectivoSessao.js";
import {
  resetEstadoTopicosSessao,
  definirEstadoTopicosSessao
} from "./topicosSessao.js";
import { criarTopico, gestorTopicos } from "./gestorTopicos.js";
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

const ISO = "2026-08-03T18:00:00.000Z";

test("CT-G01: neutro / sem marcadores — activo inalterado; baseline 061+062+063", () => {
  const activo = criarObjectivo("priorizar outdoor", "usuario", ISO);
  const r = gestorObjectivo({
    mensagem: "O que é um ADR?",
    objetivoActivo: activo,
    objetivoAnterior: null,
    agoraIso: ISO
  });
  assert.equal(r.evento, "neutro");
  assert.equal(r.objetivoActivo?.enunciado, "priorizar outdoor");
  assert.equal(LIMIAR_CONFIANCA, 0.55);
  assert.equal(LIMIAR_OBJECTIVO, 0.65);
});

test("CT-G02: estabelecer + mudar → ≤1 activo e ≤1 anterior", () => {
  const e1 = gestorObjectivo({
    mensagem: "O objectivo é priorizar o outdoor",
    objetivoActivo: null,
    objetivoAnterior: null,
    agoraIso: ISO
  });
  assert.equal(e1.evento, "estabelecer");
  assert.ok(e1.objetivoActivo);
  assert.equal(e1.objetivoAnterior, null);

  const e2 = gestorObjectivo({
    mensagem: "Agora o objectivo é decidir o pagamento",
    objetivoActivo: e1.objetivoActivo,
    objetivoAnterior: null,
    agoraIso: ISO
  });
  assert.equal(e2.evento, "mudar");
  assert.match(e2.objetivoActivo?.enunciado || "", /pagamento/i);
  assert.match(e2.objetivoAnterior?.enunciado || "", /outdoor/i);
});

test("CT-G03: estabelecer — objectivo activo auditável", () => {
  const r = gestorObjectivo({
    mensagem: "O objectivo é priorizar o outdoor",
    agoraIso: ISO
  });
  assert.equal(r.evento, "estabelecer");
  assert.match(r.objetivoActivo.enunciado, /priorizar.*outdoor/i);
  assert.equal(r.commitEstado, true);
  assert.ok(r.razaoObjectivo);
});

test("CT-G04: continua com objectivo activo → continuar", () => {
  const activo = criarObjectivo("priorizar outdoor", "usuario", ISO);
  const r = gestorObjectivo({
    mensagem: "continua",
    objetivoActivo: activo,
    agoraIso: ISO
  });
  assert.equal(r.evento, "continuar");
  assert.equal(r.objetivoActivo?.enunciado, "priorizar outdoor");
});

test("CT-G05: mudar explícito; anterior preenchido; ≠ C3", () => {
  const activo = criarObjectivo("priorizar outdoor", "usuario", ISO);
  const r = gestorObjectivo({
    mensagem: "Agora o objectivo é decidir o pagamento",
    objetivoActivo: activo,
    agoraIso: ISO
  });
  assert.equal(r.evento, "mudar");
  assert.match(r.objetivoActivo.enunciado, /pagamento/i);
  assert.equal(r.objetivoAnterior?.enunciado, "priorizar outdoor");
  const s = classificar("Agora o objectivo é decidir o pagamento", {
    frenteActiva: true
  });
  assert.notEqual(s.classe, "trabalho_executivo");
  assert.equal(s.permiteJob, false);
});

test("CT-G06: ambíguo → pergunta curta; 0 Jobs", async () => {
  const activo = criarObjectivo("priorizar outdoor", "usuario", ISO);
  const r = gestorObjectivo({
    mensagem: "priorizar outdoor ou decidir pagamento?",
    objetivoActivo: activo,
    agoraIso: ISO
  });
  assert.equal(r.evento, "ambiguo_objetivo");
  assert.match(r.perguntaCurta, /\?/);
  assert.equal(r.commitEstado, false);

  definirEstadoObjectivoSessao({ objetivoActivo: activo, objetivoAnterior: null });
  const out = await executiveEngine.executar(
    { texto: "priorizar outdoor ou decidir pagamento?" },
    {}
  );
  assert.equal(out.modo, "clarificacao_objectivo");
  assert.equal(out.dados?.motorAcionado, false);
});

test("CT-G07: anti-C3 — eventos de goal não forçam C3", () => {
  for (const m of [
    "O objectivo é priorizar o outdoor",
    "Agora o objectivo é decidir o pagamento",
    "priorizar outdoor ou decidir pagamento?"
  ]) {
    const s = classificar(m, { frenteActiva: true });
    assert.notEqual(s.classe, "trabalho_executivo", m);
    assert.equal(s.permiteJob, false, m);
  }
});

test("CT-G08: C3 na mensagem actual preservado; gestor ≠ Job", () => {
  const s = classificar("Implementa o outdoor lateral", { frenteActiva: true });
  assert.equal(s.classe, "trabalho_executivo");
  const r = gestorObjectivo({
    mensagem: "Implementa o outdoor lateral",
    objetivoActivo: criarObjectivo("priorizar outdoor", "usuario", ISO),
    agoraIso: ISO
  });
  assert.equal(typeof r.classe, "undefined");
  assert.ok(["continuar", "neutro", "estabelecer", "mudar"].includes(r.evento));
});

test("CT-G09: Objectivo ≠ Tópico — shift 063 sem marcador de goal preserva objectivo", () => {
  const obj = criarObjectivo("priorizar outdoor", "usuario", ISO);
  definirEstadoObjectivoSessao({ objetivoActivo: obj, objetivoAnterior: null });
  definirEstadoTopicosSessao({
    topicoActivo: criarTopico("outdoor", "usuario", ISO),
    pausas: []
  });
  const top = gestorTopicos({
    mensagem: "Agora sobre o pagamento",
    topicoActivo: criarTopico("outdoor", "usuario", ISO),
    pausas: [],
    agoraIso: ISO
  });
  assert.equal(top.evento, "shift");
  const goal = gestorObjectivo({
    mensagem: "Agora sobre o pagamento",
    objetivoActivo: obj,
    topicoActivo: top.topicoActivo,
    agoraIso: ISO
  });
  assert.equal(goal.evento, "neutro");
  assert.equal(goal.objetivoActivo?.enunciado, "priorizar outdoor");
});

test("CT-G10: Gate + Aprovado → Continuidade", async () => {
  const store = obterStoreContinuidadePadrao();
  const pub = criarPublicadorFilaMemoria();
  registarGateAposMotor(
    store,
    {
      id: "parecer-g10",
      diagnostico: { objetivoReal: "outdoor" },
      acao: { job: { titulo: "outdoor" } }
    },
    {
      aguardandoGate: true,
      ciclo: { id: "c-g10" },
      avaliacao: { gatilhos: ["G2"] }
    },
    "Despachar outdoor"
  );
  const out = await executiveEngine.executar(
    { texto: "Aprovado" },
    {
      storeContinuidade: store,
      publicarJob: pub.publicar,
      decisaoAprovacao: "aprovado"
    }
  );
  assert.ok(
    out.modo === "continuidade_gate" ||
      out.dados?.encaminhamento?.destino === "continuidade_gate" ||
      out.dados?.classificacao == null
  );
  assert.notEqual(out.modo, "clarificacao_objectivo");
});

test("CT-G11: Gate pendente + mudança de objectivo → clarificação; Gate não auto-fechado", async () => {
  const store = obterStoreContinuidadePadrao();
  registarGateAposMotor(
    store,
    {
      id: "parecer-g11",
      diagnostico: { objetivoReal: "outdoor" },
      acao: { job: { titulo: "outdoor" } }
    },
    {
      aguardandoGate: true,
      ciclo: { id: "c-g11" },
      avaliacao: { gatilhos: ["G2"] }
    },
    "Despachar outdoor"
  );
  definirEstadoObjectivoSessao({
    objetivoActivo: criarObjectivo("priorizar outdoor", "usuario", ISO),
    objetivoAnterior: null
  });
  const out = await executiveEngine.executar(
    { texto: "Agora o objectivo é decidir o pagamento" },
    { storeContinuidade: store }
  );
  assert.equal(out.modo, "clarificacao_gate_objectivo");
  assert.match(out.mensagem, /Gate|objectivo|pagamento/i);
  assert.equal(out.dados?.motorAcionado, false);
  assert.ok(store.obterGatePendenteMaisRecente());
});

test("CT-G12: source gestor sem Motor/NCS/Fila/SDK; sem classe/permiteJob", () => {
  const src = readFileSync(join(__dirname, "gestorObjectivo.js"), "utf8");
  assert.doesNotMatch(src, /from\s+["'].*motorExecucao/);
  assert.doesNotMatch(src, /from\s+["'].*mre\/ncs/);
  assert.doesNotMatch(src, /publicarJob|conduzirApos|@cursor\/sdk|@anthropic|openai/i);
  assert.doesNotMatch(src, /permiteJob\s*[:=]\s*true/);
  assert.doesNotMatch(src, /\bclasse\s*[:=]/);
  assert.match(src, /Objectivo ≠ Tópico|Objectivo ≠ Classe|Objectivo ≠ Job|IMP-064/);
});

test("CT-G13: regressão — Classificador recebe contexto sem mudar limiar", () => {
  const obj = criarObjectivo("priorizar outdoor", "usuario", ISO);
  const a = classificar("Como priorizar o outdoor?", { frenteActiva: true });
  const b = classificar("Como priorizar o outdoor?", {
    frenteActiva: true,
    objetivoConversacional: obj
  });
  assert.equal(a.classe, b.classe);
  assert.equal(a.permiteJob, b.permiteJob);
  assert.equal(LIMIAR_CONFIANCA, 0.55);
  const idx = readFileSync(join(rootSrc, "executiveEngine", "index.js"), "utf8");
  assert.match(idx, /gestorObjectivo/);
  assert.match(idx, /objetivoConversacional/);
});

test("CT-G14: ambiguidade objectivo + deixis → uma pergunta (prioridade objectivo)", async () => {
  definirEstadoObjectivoSessao({
    objetivoActivo: criarObjectivo("priorizar outdoor", "usuario", ISO),
    objetivoAnterior: null
  });
  const out = await executiveEngine.executar(
    {
      texto: "priorizar outdoor ou decidir pagamento?",
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
  assert.equal(out.modo, "clarificacao_objectivo");
  assert.notEqual(out.modo, "clarificacao_referente");
  assert.notEqual(out.modo, "clarificacao_topico");
  assert.equal((out.mensagem.match(/\?/g) || []).length, 1);
});

test("CT-G-extra: store só com commitEstado", () => {
  const activo = criarObjectivo("priorizar outdoor", "usuario", ISO);
  definirEstadoObjectivoSessao({ objetivoActivo: activo, objetivoAnterior: null });
  aplicarResultadoGestaoObjectivo({
    evento: "ambiguo_objetivo",
    objetivoActivo: criarObjectivo("decidir pagamento", "usuario", ISO),
    objetivoAnterior: null,
    perguntaCurta: "?",
    razaoObjectivo: "teste",
    commitEstado: false
  });
  assert.equal(
    obterEstadoObjectivoSessao().objetivoActivo?.enunciado,
    "priorizar outdoor"
  );
});
