/**
 * PD > ESPELHO ACK — pedido de decisão não vira recuperação operacional.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { TIPO_TURNO } from "./tiposTurno.js";
import { comporPorTipo } from "./compor.js";
import { naturalizarRespostaNucleo } from "./index.js";
import { extrairEstadoOperacional } from "./estadoOperacional.js";
import { reconhecerDecisao } from "../continuidadeGate/reconhecerDecisao.js";
import { ehPedidoDecisaoForaDoGate } from "../conscienciaOperacional/influenciaDeliberacao.js";
import { executiveEngine } from "../executiveEngine/index.js";
import { reiniciarAutoridadeDelegadaParaTestes } from "../autoridadeDelegada/autoridadeDelegada.js";
import {
  inicializarCatalogo,
  recarregarCatalogo,
  selecionarProjeto
} from "../catalogoProjetos/index.js";

const JOB_104 = {
  id: "JOB-000104",
  estado: "failed",
  titulo: "Execute a melhoria aprovada.",
  falha: { podeRetentar: true },
  resultado: { resumo: "falhou" },
  concluidoEm: "2026-08-11T19:09:29.265Z",
  criadoEm: "2026-08-11T19:08:18.100Z"
};

function estadoCom104() {
  return extrairEstadoOperacional({ jobs: [JOB_104] });
}

function ctx104() {
  const estadoOperacional = estadoCom104();
  return {
    estadoOperacional,
    operacaoAberta: estadoOperacional.operacaoAberta,
    missaoActiva: true
  };
}

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

test("1: Decida entre A e B. + Job 104 → núcleo, sem ACK 104", () => {
  const texto = "Decida entre A e B.";
  assert.equal(ehPedidoDecisaoForaDoGate(texto), true);
  const out = comporPorTipo(TIPO_TURNO.ESPELHO, {
    instrucao: texto,
    ctxImediato: ctx104(),
    mensagemOriginal: "Parecer deliberativo A/B/C."
  });
  assert.doesNotMatch(out.texto, /JOB-000104|em recuperação/i);
  assert.match(out.texto, /Parecer deliberativo|A\/B\/C/i);
  assert.equal(out.modoExecutivo, "deliberar");
});

test("2: Decida entre A e B? → deliberativo (sem ACK 104)", () => {
  const nat = naturalizarRespostaNucleo(
    {
      ok: true,
      mensagem: "Parecer deliberativo A/B/C.",
      intencao: { id: "deliberar_objetivo" },
      capacidade: "ia",
      dados: {}
    },
    {
      instrucao: "Decida entre A e B?",
      historico: [],
      canalSpeaker: "chat",
      lastroConsciencia: {
        temContextoRelevante: true,
        estadoOperacional: estadoCom104(),
        contagens: {
          jobsPendentes: 0,
          jobsEmExecucao: 0,
          gatesPendentes: 0,
          jobsFalhado: 1
        }
      }
    }
  );
  assert.doesNotMatch(String(nat.mensagem), /JOB-000104|em recuperação/i);
});

test("3: Decida entre A, B, C e D. → deliberativo", () => {
  const nat = naturalizarRespostaNucleo(
    {
      ok: true,
      mensagem: "Escolho deliberar entre A–D.",
      intencao: { id: "deliberar_objetivo" },
      capacidade: "ia",
      dados: {}
    },
    {
      instrucao: "Decida entre A, B, C e D.",
      historico: [],
      canalSpeaker: "chat",
      lastroConsciencia: {
        temContextoRelevante: true,
        estadoOperacional: estadoCom104(),
        contagens: {
          jobsPendentes: 0,
          jobsEmExecucao: 0,
          gatesPendentes: 0,
          jobsFalhado: 1
        }
      }
    }
  );
  assert.doesNotMatch(String(nat.mensagem), /JOB-000104|em recuperação/i);
});

test("4: ambiguos genuínos isso/ajuda/faz → ESPELHO ACK intacto", () => {
  for (const texto of ["isso", "ajuda", "faz"]) {
    assert.equal(ehPedidoDecisaoForaDoGate(texto), false);
    const out = comporPorTipo(TIPO_TURNO.ESPELHO, {
      instrucao: texto,
      ctxImediato: ctx104(),
      mensagemOriginal: "núcleo"
    });
    assert.match(out.texto, /JOB-000104|em recuperação|Operação/i);
  }
});

test("5: Gate Aprovado./Pode prosseguir. → reconhecerDecisao intacto", () => {
  assert.equal(reconhecerDecisao("Aprovado.").reconhecida, true);
  assert.equal(reconhecerDecisao("Pode prosseguir.").reconhecida, true);
  assert.equal(ehPedidoDecisaoForaDoGate("Aprovado."), false);
  assert.equal(ehPedidoDecisaoForaDoGate("Pode prosseguir."), false);
});

test("EE: Decida entre A e B. + 104 → sem Motor/Job novo / sem ACK 104", async () => {
  globalThis.localStorage = criarStorage();
  recarregarCatalogo();
  inicializarCatalogo();
  selecionarProjeto("prj-sistema-ceo");
  reiniciarAutoridadeDelegadaParaTestes();
  executiveEngine.reiniciarAcompanhamentoParaTestes();

  let publicacoes = 0;
  const out = await executiveEngine.executar(
    { texto: "Decida entre A e B.", historico: [] },
    {
      missaoActiva: { id: "prj-sistema-ceo", nome: "Sistema CEO" },
      listarJobsEmAcompanhamento: async () => [],
      listarJobs: async () => [JOB_104],
      listarPorEstado: async (est) => {
        if (!est || est === "failed") return [JOB_104];
        return [];
      },
      obterJob: async (id) =>
        String(id) === "JOB-000104" ? JOB_104 : null,
      leitoresConsciencia: {
        F1: async () => [],
        F2: async () => [],
        F3: async () => [],
        F4: async () => null,
        F5: async () => null,
        F6: async () => null,
        F7: async () => null,
        F8: async () => null
      },
      publicarJob: async () => {
        publicacoes += 1;
        return { id: "JOB-NOVO" };
      },
      conduzirMotor: async () => ({
        ok: true,
        mensagem: "motor-nao-deveria",
        dados: { motorAcionado: true }
      })
    }
  );
  assert.equal(publicacoes, 0);
  assert.notEqual(out.dados?.interceptacaoOperacional, "CTO-003");
  assert.doesNotMatch(String(out.mensagem || ""), /JOB-000104 em recuperação/i);
});
