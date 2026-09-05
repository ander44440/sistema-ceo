/**
 * C3 — PD > CTO-003 quando objecto ≠ operação/Gate (política CTO).
 * Não altera pedidoDecisaoExplicita, F2, Gate híbrido, CN nem MRE.
 */
import assert from "node:assert/strict";
import { test, beforeEach } from "node:test";
import {
  deveInterceptarOperacional
} from "./interceptacaoOperacional.js";
import { ehComandoSobreJobActivo } from "./estadoOperacional.js";
import { detectarPedidoDecisaoExplicita } from "../classificadorIntencao/pedidoDecisaoExplicita.js";
import { reconhecerDecisao } from "../continuidadeGate/reconhecerDecisao.js";
import { reiniciarAutoridadeDelegadaParaTestes } from "../autoridadeDelegada/autoridadeDelegada.js";
import { executiveEngine } from "../executiveEngine/index.js";

const ESTADO_ABERTO = {
  operacaoAberta: true,
  requerRecuperacao: false,
  modoOperacional: "executar",
  jobActivo: {
    id: "JOB-TEC-C3-001",
    titulo: "Implementar endpoint de saúde",
    estado: "running"
  },
  sinais: {
    pending: 0,
    running: 1,
    failed: 0,
    dispatcher: false,
    handoff: false,
    agentErro: false,
    gatePendente: 0
  }
};

const JOB_RUN = {
  id: "JOB-TEC-C3-001",
  estado: "running",
  titulo: "Implementar endpoint de saúde",
  descricao: "GET /health",
  objetivo: "Implementar GET /health no servidor Node e devolver 200.",
  projeto: "proj-c3",
  projetoNome: "C3"
};

beforeEach(() => {
  reiniciarAutoridadeDelegadaParaTestes();
  executiveEngine.reiniciarAcompanhamentoParaTestes();
});

function depsOp(publicados) {
  return {
    missaoActiva: { id: JOB_RUN.projeto, nome: JOB_RUN.projetoNome },
    publicarJob: async (p) => {
      const j = {
        id: `JOB-MEM-C3-${publicados.length + 1}`,
        estado: "pending",
        titulo: p?.titulo || "mem"
      };
      publicados.push(j);
      return j;
    },
    listarJobsEmAcompanhamento: async () => [JOB_RUN],
    obterJob: async (id) => (id === JOB_RUN.id ? JOB_RUN : null),
    listarPorEstado: async (est) =>
      !est || est === "running" ? [JOB_RUN] : [],
    leitoresConsciencia: {
      F1: async () => [],
      F2: async () => [
        {
          id: JOB_RUN.id,
          estado: JOB_RUN.estado,
          titulo: JOB_RUN.titulo
        }
      ],
      F3: async () => [],
      F4: async () => ({ estado: "ocioso" }),
      F5: async () => ({ estado: "ocioso", emCurso: false }),
      F6: async () => ({ estado: "ocioso", ocupado: false }),
      F7: async () => ({ disponivel: true, alertas: 0 }),
      F8: async () => ({ id: JOB_RUN.projeto, nome: JOB_RUN.projetoNome })
    }
  };
}

test("unit: PD∧CJ∧op → deveInterceptar=false (objecto ≠ Gate)", () => {
  const t1 = "Decida entre A e B dado o estado do Job.";
  const t2 = "Qual decisão tomar? Não repita a execução.";
  assert.equal(detectarPedidoDecisaoExplicita(t1), true);
  assert.equal(ehComandoSobreJobActivo(t1), true);
  assert.equal(reconhecerDecisao(t1).reconhecida, false);
  assert.equal(
    deveInterceptarOperacional({ texto: t1, estadoOperacional: ESTADO_ABERTO }),
    false
  );

  assert.equal(detectarPedidoDecisaoExplicita(t2), true);
  assert.equal(ehComandoSobreJobActivo(t2), true);
  assert.equal(
    deveInterceptarOperacional({ texto: t2, estadoOperacional: ESTADO_ABERTO }),
    false
  );
});

test("unit: CJ sem PD continua a interceptar", () => {
  assert.equal(detectarPedidoDecisaoExplicita("REPITA"), false);
  assert.equal(
    deveInterceptarOperacional({
      texto: "REPITA",
      estadoOperacional: ESTADO_ABERTO
    }),
    true
  );
  assert.equal(
    deveInterceptarOperacional({
      texto: "repetir a execução",
      estadoOperacional: ESTADO_ABERTO
    }),
    true
  );
});

test("EE: Decida entre A e B dado o estado do Job → sem CTO-003 / Motor / Job", async () => {
  const publicados = [];
  const texto = "Decida entre A e B dado o estado do Job.";
  const out = await executiveEngine.executar(
    { texto, historico: [] },
    depsOp(publicados)
  );
  assert.equal(out.dados?.interceptacaoOperacional ?? null, null);
  assert.notEqual(out.dados?.encaminhamento?.destino, "motor_execucao");
  assert.equal(out.dados?.motorAcionado ?? false, false);
  assert.equal(publicados.length, 0);
  assert.notEqual(out.modo, "interceptacao_operacional");
});

test("EE: Qual decisão tomar? Não repita a execução → PD preservado", async () => {
  const publicados = [];
  const texto = "Qual decisão tomar? Não repita a execução.";
  const out = await executiveEngine.executar(
    { texto, historico: [] },
    depsOp(publicados)
  );
  assert.equal(out.dados?.interceptacaoOperacional ?? null, null);
  assert.notEqual(out.dados?.encaminhamento?.destino, "motor_execucao");
  assert.equal(out.dados?.motorAcionado ?? false, false);
  assert.equal(publicados.length, 0);
  assert.notEqual(out.modo, "interceptacao_operacional");
});

test("EE: Execute a melhoria aprovada → Motor / Job legítimo", async () => {
  const publicados = [];
  const out = await executiveEngine.executar(
    { texto: "Execute a melhoria aprovada.", historico: [] },
    {
      missaoActiva: { id: "proj-c3", nome: "C3" },
      publicarJob: async (p) => {
        const j = {
          id: `JOB-MEM-EXEC-${publicados.length + 1}`,
          estado: "pending",
          titulo: p?.titulo || "exec"
        };
        publicados.push(j);
        return j;
      },
      listarJobsEmAcompanhamento: async () => [],
      listarPorEstado: async () => [],
      leitoresConsciencia: {
        F1: async () => [],
        F2: async () => [],
        F3: async () => [],
        F4: async () => ({ estado: "ocioso" }),
        F5: async () => ({ estado: "ocioso", emCurso: false }),
        F6: async () => ({ estado: "ocioso", ocupado: false }),
        F7: async () => ({ disponivel: true, alertas: 0 }),
        F8: async () => ({ id: "proj-c3", nome: "C3" })
      }
    }
  );
  assert.equal(out.dados?.encaminhamento?.destino, "motor_execucao");
  assert.equal(out.dados?.motorAcionado, true);
  assert.ok(publicados.length >= 1);
});

test("EE: Decida entre A, B e C → deliberação sem Motor/Job", async () => {
  const publicados = [];
  const out = await executiveEngine.executar(
    { texto: "Decida entre A, B e C.", historico: [] },
    {
      missaoActiva: { id: "proj-c3", nome: "C3" },
      publicarJob: async (p) => {
        publicados.push(p);
        return { id: "X", estado: "pending" };
      },
      listarJobsEmAcompanhamento: async () => [],
      listarPorEstado: async () => [],
      leitoresConsciencia: {
        F1: async () => [],
        F2: async () => [],
        F3: async () => [],
        F4: async () => ({ estado: "ocioso" }),
        F5: async () => ({ estado: "ocioso", emCurso: false }),
        F6: async () => ({ estado: "ocioso", ocupado: false }),
        F7: async () => ({ disponivel: true, alertas: 0 }),
        F8: async () => ({ id: "proj-c3", nome: "C3" })
      }
    }
  );
  assert.equal(out.dados?.motorAcionado ?? false, false);
  assert.equal(publicados.length, 0);
  assert.notEqual(out.dados?.encaminhamento?.destino, "motor_execucao");
});
