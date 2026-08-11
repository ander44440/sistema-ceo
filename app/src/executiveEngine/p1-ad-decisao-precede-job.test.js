/**
 * Precedência DECISÃO > Autoridade Delegada (escape DECISÃO → JOB).
 * AD-D1…AD-D7 + AD-R.
 */
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { test, beforeEach } from "node:test";
import executiveEngine from "./index.js";
import {
  activarAutoridadeDelegada,
  autoridadeDelegadaActiva,
  reiniciarAutoridadeDelegadaParaTestes
} from "../autoridadeDelegada/autoridadeDelegada.js";
import { detectarPedidoDecisaoExplicita } from "../classificadorIntencao/pedidoDecisaoExplicita.js";
import {
  criarEmpresa,
  criarProjeto,
  inicializarCatalogo,
  obterProjetoAtivo,
  recarregarCatalogo,
  selecionarProjeto
} from "../catalogoProjetos/index.js";
import { inicializarCoaSessao, obterCoaAtivo } from "./coaSessao.js";
import { resetStoreContinuidadePadrao } from "../continuidadeGate/integracaoConversa.js";
import { resetEstadoTopicosSessao } from "../classificadorIntencao/topicosSessao.js";
import { resetEstadoObjectivoSessao } from "../classificadorIntencao/objectivoSessao.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP_ROOT = path.resolve(__dirname, "../..");

const MSG_DECIDE_ABC = `Há três opções:
A) Priorizar estabilidade técnica
B) Aplicar corte de custo agora
C) Implementar aceleração de aquisição

Decide qual posição prevalece entre A, B e C.
Não quero que delegues a análise.`;

const MSG_DECIDE_SEM_JOB = `${MSG_DECIDE_ABC}

Restrições: sem Job, sem Dispatcher, sem handoff, sem execução.`;

function criarStorage() {
  const map = new Map();
  return {
    getItem(k) {
      return map.has(String(k)) ? map.get(String(k)) : null;
    },
    setItem(k, v) {
      map.set(String(k), String(v));
    },
    removeItem(k) {
      map.delete(String(k));
    }
  };
}

function depsMotor() {
  let motorChamado = false;
  let jobs = [];
  return {
    get motorChamado() {
      return motorChamado;
    },
    get jobs() {
      return jobs;
    },
    deps: {
      listarPorEstado: async () => [],
      leitoresConsciencia: {
        F1: async () => [],
        F2: async () => [],
        F3: async () => [],
        F4: async () => ({ estado: "activo" }),
        F5: async () => ({ estado: "ocioso", emCurso: false }),
        F6: async () => ({ estado: "ocioso", ocupado: false }),
        F7: async () => ({ disponivel: false, alertas: 0 }),
        F8: async () => {
          try {
            const coa = obterCoaAtivo();
            return coa
              ? { id: coa.id, nome: coa.nome }
              : { id: "n/d", nome: "n/d" };
          } catch {
            return { id: "n/d", nome: "n/d" };
          }
        }
      },
      publicarJob: async (pedido) => {
        const job = {
          id: `JOB-AD-D-${jobs.length + 1}`,
          estado: "pending",
          ...pedido
        };
        jobs.push(job);
        return job;
      },
      conduzirMotor: async () => {
        motorChamado = true;
        const job = {
          id: `JOB-AD-D-M-${jobs.length + 1}`,
          estado: "pending"
        };
        jobs.push(job);
        return { publicado: true, job, fluxoIniciado: true };
      }
    }
  };
}

function activarAd() {
  const r = activarAutoridadeDelegada({
    texto:
      "Delego autoridade de fecho operacional. Podes decidir no perímetro do COA activo.",
    agente: "usuario"
  });
  assert.equal(r.ok, true);
  assert.equal(autoridadeDelegadaActiva(), true);
}

function assertSemMg2Forcado(texto) {
  const t = String(texto || "");
  assert.doesNotMatch(t, /performance\s+MG2/i);
  assert.doesNotMatch(
    t,
    /melhorias de performance priorit[aá]rias do MG2/i
  );
  assert.doesNotMatch(
    t,
    /Decis[aã]o fechada sob Autoridade Delegada \(performance MG2\)/i
  );
}

function assertZeroJobs(ctx, out) {
  assert.equal(ctx.jobs.length, 0, `Jobs inesperados: ${JSON.stringify(ctx.jobs)}`);
  assert.equal(ctx.motorChamado, false);
  assert.notEqual(out.capacidade, "motor_execucao");
  assert.notEqual(out.modo, "autoridade_delegada_execucao");
  assert.equal(out.dados?.motorAcionado !== true, true);
}

beforeEach(() => {
  globalThis.localStorage = criarStorage();
  recarregarCatalogo();
  inicializarCatalogo();
  inicializarCoaSessao();
  reiniciarAutoridadeDelegadaParaTestes();
  resetStoreContinuidadePadrao();
  resetEstadoTopicosSessao();
  resetEstadoObjectivoSessao();
  executiveEngine.inicializar();
});

test("AD-D1: AD activa + Decide A/B/C → C2/MRE, 0 Jobs, sem MG2", async () => {
  activarAd();
  assert.equal(detectarPedidoDecisaoExplicita(MSG_DECIDE_ABC), true);
  const ctx = depsMotor();
  const out = await executiveEngine.executar(
    { texto: MSG_DECIDE_ABC, historico: [] },
    ctx.deps
  );
  assertZeroJobs(ctx, out);
  assertSemMg2Forcado(out.mensagem);
  assert.ok(
    out.modo === "mre" ||
      out.dados?.mreInvocado === true ||
      out.capacidade === "ia" ||
      out.dados?.encaminhamento?.destino === "nucleo_mre" ||
      out.intencao?.destino === "nucleo_mre" ||
      out.intencao?.classe === "conversa_projeto",
    `esperava caminho deliberativo; modo=${out.modo} cap=${out.capacidade}`
  );
  assert.doesNotMatch(String(out.mensagem || ""), /^Decisão fechada sob Autoridade Delegada/i);
});

test("AD-D2: AD + decisão + sem Job/Dispatcher/handoff → 0 Jobs", async () => {
  activarAd();
  const ctx = depsMotor();
  const out = await executiveEngine.executar(
    { texto: MSG_DECIDE_SEM_JOB, historico: [] },
    ctx.deps
  );
  assertZeroJobs(ctx, out);
  assertSemMg2Forcado(out.mensagem);
});

test("AD-D3: AD + decisão com aplica/implementa nas alternativas → não C3", async () => {
  activarAd();
  const texto = `Opções:
A) Aplica LOD agressivo
B) Implementa chunking imediato
C) Mantém baseline

Decide entre A, B e C.`;
  assert.equal(detectarPedidoDecisaoExplicita(texto), true);
  const ctx = depsMotor();
  const out = await executiveEngine.executar(
    { texto, historico: [] },
    ctx.deps
  );
  assertZeroJobs(ctx, out);
});

test("AD-D4: AD + AlfaTech + executa → Job ok, sem MG2 forçado", async () => {
  criarEmpresa({ nome: "AlfaTech" });
  criarProjeto({ nome: "Ops Alfa" });
  assert.match(String(obterProjetoAtivo()?.nome || ""), /Ops Alfa|AlfaTech/i);
  activarAd();
  const ctx = depsMotor();
  const out = await executiveEngine.executar(
    { texto: "executa as melhorias necessárias no perímetro", historico: [] },
    ctx.deps
  );
  assert.ok(
    ctx.motorChamado ||
      ctx.jobs.length > 0 ||
      out.capacidade === "motor_execucao",
    "execução inequívoca deve despachar"
  );
  assertSemMg2Forcado(out.mensagem);
  const blob = JSON.stringify(out) + JSON.stringify(ctx.jobs);
  assert.doesNotMatch(blob, /performance priorit[aá]rias do MG2/i);
  assert.doesNotMatch(blob, /performance MG2/i);
  assert.match(String(out.mensagem || blob), /Ops Alfa|AlfaTech|contexto activo|perímetro/i);
});

test("AD-D5: AD inactiva + decisão A/B/C → decisão sob conflito intacta", async () => {
  assert.equal(autoridadeDelegadaActiva(), false);
  assert.equal(detectarPedidoDecisaoExplicita(MSG_DECIDE_ABC), true);
  const ctx = depsMotor();
  const out = await executiveEngine.executar(
    { texto: MSG_DECIDE_ABC, historico: [] },
    ctx.deps
  );
  assertZeroJobs(ctx, out);
  assert.equal(autoridadeDelegadaActiva(), false);
});

test("AD-D6: AD activa + executa → execução permitida", async () => {
  activarAd();
  const ctx = depsMotor();
  const out = await executiveEngine.executar(
    { texto: "executa", historico: [] },
    ctx.deps
  );
  assert.ok(
    ctx.motorChamado ||
      ctx.jobs.length > 0 ||
      out.capacidade === "motor_execucao",
    "AD + executa deve continuar a executar"
  );
});

test("AD-D7: mesmo turno mandato + decisão A/B/C → 0 Jobs", async () => {
  const ctx = depsMotor();
  const texto = `Delego autoridade de fecho operacional no perímetro do COA.
${MSG_DECIDE_ABC}`;
  assert.equal(detectarPedidoDecisaoExplicita(texto), true);
  const out = await executiveEngine.executar(
    { texto, historico: [] },
    ctx.deps
  );
  assertZeroJobs(ctx, out);
  assertSemMg2Forcado(out.mensagem);
});

test("AD-R: regressão decisão / E4 / P1-2 / CN / lastro / FASE3 / CTO-003.1", () => {
  const ficheiros = [
    "src/executiveEngine/p1-decisao-sob-conflito.test.js",
    "src/classificadorIntencao/p1-precedencia-decisao-sobre-e4.test.js",
    "src/executiveEngine/p1-ordem-p12-vs-decisao.test.js",
    "src/executiveEngine/p1-2-analise-deliberativa.test.js",
    "src/conversacaoNatural/p1-cn-fecho-decisorio.test.js",
    "src/executiveEngine/p1-lastro-normativo-coa.test.js",
    "src/classificadorIntencao/p3-empresa-ancora-fase3.test.js",
    "src/executiveEngine/capacidades/p1-cto0031-ancora-explicita-projetos.test.js",
    "src/autoridadeDelegada/autoridadeDelegada.ee.test.js"
  ];
  const r = spawnSync(process.execPath, ["--test", ...ficheiros], {
    cwd: APP_ROOT,
    encoding: "utf8"
  });
  assert.equal(
    r.status,
    0,
    `AD-R falhou (status=${r.status})\n${r.stdout}\n${r.stderr}`
  );
});
