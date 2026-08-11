/**
 * Relato/encerramento — auto-preenchimento dos três campos (antes de C4 consulta).
 */
import assert from "node:assert/strict";
import { test, beforeEach } from "node:test";
import {
  ehPedidoRelatoEncerramento,
  ehConsultaEstadoParaC4,
  classificar,
  normalizarTexto
} from "../classificadorIntencao/regras.js";
import { mapearCapacidadePorTexto } from "./classificar.js";
import { deveInterceptarOperacional } from "../conversacaoNatural/interceptacaoOperacional.js";
import {
  gerarContinuidadeDeEstadoOperacional,
  capacidadeMemoria
} from "./capacidades/memoria.js";
import { jobFilaParaResumoConsciencia } from "./filaCliente.js";
import { executiveEngine } from "./index.js";
import { reiniciarAutoridadeDelegadaParaTestes } from "../autoridadeDelegada/autoridadeDelegada.js";

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

beforeEach(() => {
  globalThis.localStorage = criarStorage();
  reiniciarAutoridadeDelegadaParaTestes();
  executiveEngine.reiniciarAcompanhamentoParaTestes();
});

const JOB74 = {
  id: "JOB-000074",
  titulo: "HOMOLOGACAO TESTE 2",
  estado: "needs_correction",
  projeto: "Motoboy Game 2",
  resultado: {
    status: "sucesso",
    resumo: "Ficheiro de homologacao Teste 2 criado com token T2-1786290728726.",
    evidencia: "executive/queue/teste2-execucao-efetiva-T2-1786290728726.txt"
  }
};

const TEXTO_RELATO = `ENCERRAMENTO EXECUTIVO — RELATO DA MISSÃO

Com base exclusivamente no que você acompanhou e no estado real da missão atual, preencha os três campos de encerramento abaixo.

Não crie Job.
Não execute nenhuma ação.

O QUE ANDOU:
—

O QUE FICA:
—

PRÓXIMO PASSO:
—

Preencha os três campos com conteúdo.`;

test("RE-1: ehPedidoRelatoEncerramento reconhece relato e bloqueia C4 consulta", () => {
  const t = normalizarTexto(TEXTO_RELATO);
  assert.equal(ehPedidoRelatoEncerramento(t), true);
  assert.equal(ehConsultaEstadoParaC4(t, { operacaoAberta: true }), false);
  assert.equal(classificar(TEXTO_RELATO).classe, "comando_operacional");
  assert.equal(mapearCapacidadePorTexto(TEXTO_RELATO).id, "encerrar_dia");
});

test("RE-2: relato não é interceptado como comando C3", () => {
  assert.equal(
    deveInterceptarOperacional({
      texto: TEXTO_RELATO,
      estadoOperacional: {
        operacaoAberta: true,
        requerRecuperacao: false,
        modoOperacional: "executar",
        jobActivo: { id: "JOB-000074", titulo: "t", estado: "needs_correction" },
        sinais: {
          pending: 0,
          running: 1,
          failed: 0,
          dispatcher: false,
          handoff: false,
          agentErro: false,
          gatePendente: 0
        }
      }
    }),
    false
  );
});

test("RE-3: gerarContinuidadeDeEstadoOperacional preenche os três campos", async () => {
  const campos = await gerarContinuidadeDeEstadoOperacional({
    listarJobs: async () => [JOB74],
    lastroConsciencia: {
      temContextoRelevante: true,
      resultadoMissaoActivo: {
        jobId: "JOB-000074",
        estado: "needs_correction",
        sintese: JOB74.resultado.resumo,
        evidencia: JOB74.resultado.evidencia
      },
      memoriaTrabalhoExecutiva: {
        proximaAcao: "Retomar JOB-000074 a partir do resultado reconciliado"
      }
    }
  });
  assert.ok(campos);
  assert.match(campos.oQueAndou, /JOB-000074|Ficheiro/);
  assert.match(campos.oQueFica, /needs_correction/);
  assert.match(campos.proximoPassoAmanha, /JOB-000074|Retomar/);
});

test("RE-4: EE relato preenche três campos sem consulta de estado", async () => {
  const {
    inicializarCatalogo,
    selecionarProjeto,
    obterDiaExecutivo
  } = await import("../catalogoProjetos/index.js");
  inicializarCatalogo();
  selecionarProjeto("prj-mg2");
  await executiveEngine.executar({ texto: "abrir o dia: Foco homologacao relato" });
  assert.equal(obterDiaExecutivo()?.status, "em_curso");

  const out = await executiveEngine.executar(TEXTO_RELATO, {
    listarJobsEmAcompanhamento: async () => [JOB74],
    obterJob: async () => JOB74,
    listarJobs: async () => [JOB74],
    listarPorEstado: async (est) =>
      !est || String(JOB74.estado) === String(est) ? [JOB74] : [],
    leitoresConsciencia: {
      F1: async () => [],
      F2: async () => [jobFilaParaResumoConsciencia(JOB74)],
      F3: async () => [],
      F4: async () => ({ estado: "ocioso" }),
      F5: async () => ({ estado: "ocioso", emCurso: false }),
      F6: async () => ({ estado: "ocioso", ocupado: false }),
      F7: async () => ({ disponivel: true, alertas: 0 }),
      F8: async () => ({ id: "mg2", nome: "Motoboy Game 2" })
    }
  });

  assert.doesNotMatch(
    String(out.mensagem || ""),
    /Consulta de estado não identificada/i
  );
  assert.match(String(out.mensagem || ""), /O QUE ANDOU:/i);
  assert.match(String(out.mensagem || ""), /O QUE FICA:/i);
  assert.match(String(out.mensagem || ""), /PRÓXIMO PASSO:/i);
  assert.match(String(out.mensagem || ""), /JOB-000074|Ficheiro|needs_correction/i);
  assert.equal(out.dados?.intencao?.id || out.intencao?.id, "encerrar_dia");
});
