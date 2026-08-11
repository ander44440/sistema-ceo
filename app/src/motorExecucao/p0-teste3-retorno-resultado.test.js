/**
 * Teste 3 — Retorno do resultado ao lastro / continuidade da missão.
 */
import assert from "node:assert/strict";
import { test, beforeEach } from "node:test";
import {
  aplicarPromocaoResultadoAoLastro,
  criarStoreAcompanhamento,
  extrairPromocoesResultadoMissao,
  factosOficiaisDePromocoesResultado,
  observarAcompanhamentosActivos,
  adotarJobsDaFilaParaAcompanhamento
} from "./acompanhamentoJob.js";
import { jobFilaParaResumoConsciencia } from "../executiveEngine/filaCliente.js";
import { montarFactosLastro } from "../conscienciaOperacional/consultarAntesDeResponder.js";
import { criarEstadoExecutivo, validarJobResumo } from "../conscienciaOperacional/dominio.js";
import {
  classificar,
  ehConsultaEstadoOperacional,
  ehConsultaEstadoParaC4,
  ehPedidoContinuidadeMissao,
  normalizarTexto
} from "../classificadorIntencao/regras.js";
import { deveInterceptarOperacional } from "../conversacaoNatural/interceptacaoOperacional.js";
import { reiniciarAutoridadeDelegadaParaTestes } from "../autoridadeDelegada/autoridadeDelegada.js";
import { validarContextoAtivo } from "../classificadorIntencao/validadorContextoAtivo.js";
import { executiveEngine } from "../executiveEngine/index.js";

beforeEach(() => {
  reiniciarAutoridadeDelegadaParaTestes();
});

const JOB74 = {
  id: "JOB-000074",
  titulo: "HOMOLOGACAO TESTE 2 — execucao efetiva SDK",
  estado: "needs_correction",
  projeto: "Motoboy Game 2",
  resultado: {
    status: "sucesso",
    resumo: "Ficheiro de homologacao Teste 2 criado com linha exacta e token T2-1786290728726.",
    evidencia: "executive/queue/teste2-execucao-efetiva-T2-1786290728726.txt",
    token: "T2-1786290728726"
  },
  verificacao: { ok: false, motivo: "objetivo_nao_atendido" }
};

test("T3-A: JobResumo F2 promove síntese/evidência sem mudar status", () => {
  const r = jobFilaParaResumoConsciencia(JOB74);
  assert.equal(r.status, "needs_correction");
  assert.match(r.sinteseResultado || "", /Ficheiro de homologacao/);
  assert.equal(
    r.evidencia,
    "executive/queue/teste2-execucao-efetiva-T2-1786290728726.txt"
  );
  const v = validarJobResumo(r);
  assert.equal(v.ok, true);
  assert.match(v.job.sinteseResultado || "", /Ficheiro/);
});

test("T3-B: factosOficiais incluem resultado reconciliado", () => {
  const resumo = jobFilaParaResumoConsciencia(JOB74);
  const consulta = {
    estado: criarEstadoExecutivo({
      jobsEmExecucao: [resumo]
    })
  };
  const factos = montarFactosLastro(consulta);
  const facto = factos.find((f) => f.includes("JOB-000074"));
  assert.ok(facto, "facto do Job");
  assert.match(facto, /resultado:/i);
  assert.match(facto, /Ficheiro de homologacao/);
  assert.match(facto, /teste2-execucao-efetiva/);
});

test("T3-C: observação → promoção → lastro/missão", async () => {
  const store = criarStoreAcompanhamento();
  await adotarJobsDaFilaParaAcompanhamento(store, {
    listarJobs: async () => [JOB74]
  });
  const obs = await observarAcompanhamentosActivos(store, {
    obterJob: async () => JOB74
  });
  const promocoes = extrairPromocoesResultadoMissao(obs);
  assert.equal(promocoes.length, 1);
  assert.equal(promocoes[0].jobId, "JOB-000074");
  assert.equal(promocoes[0].estado, "needs_correction");

  const factos = factosOficiaisDePromocoesResultado(promocoes);
  assert.match(factos[0], /Resultado reconciliado JOB-000074/);

  const lastro = aplicarPromocaoResultadoAoLastro(
    { temContextoRelevante: true, factosOficiais: ["outro"] },
    promocoes
  );
  assert.ok(
    lastro.factosOficiais.some((f) => /Resultado reconciliado JOB-000074/.test(f))
  );
  assert.ok(lastro.memoriaTrabalhoExecutiva?.proximaAcao);
  assert.match(
    String(lastro.memoriaTrabalhoExecutiva.proximaAcao),
    /JOB-000074/
  );
  assert.equal(lastro.resultadoMissaoActivo?.jobId, "JOB-000074");
});

test("T3-D: consulta factual isolada permanece C4", () => {
  const t1 = normalizarTexto("Qual é o estado do JOB-000074?");
  const t2 = normalizarTexto("Qual o resultado do JOB-000074?");
  assert.equal(ehConsultaEstadoOperacional(t1), true);
  assert.equal(ehConsultaEstadoParaC4(t1, { operacaoAberta: true }), true);
  assert.equal(classificar(t2, { operacaoAberta: true }).classe, "comando_operacional");
});

test("T3-E: continuidade + operação aberta → C2 (não C4)", () => {
  const texto =
    "Use o resultado do JOB-000074 para continuar a missão";
  const t = normalizarTexto(texto);
  assert.equal(ehPedidoContinuidadeMissao(t), true);
  assert.equal(ehConsultaEstadoOperacional(t), true);
  assert.equal(
    ehConsultaEstadoParaC4(t, { operacaoAberta: true }),
    false
  );
  const s = classificar(texto, { operacaoAberta: true });
  assert.equal(s.classe, "conversa_projeto");
  assert.equal(s.permiteJob, false);
});

test("T3-F: continuidade não é interceptada como comando C3", () => {
  const texto =
    "Continua a missão com base no resultado do JOB-000074";
  assert.equal(
    deveInterceptarOperacional({
      texto,
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

test("T3-G: result ≠ completed na promoção", () => {
  const jobResult = {
    ...JOB74,
    estado: "result",
    verificacao: null
  };
  const r = jobFilaParaResumoConsciencia(jobResult);
  assert.equal(r.status, "result");
  assert.notEqual(r.status, "completed");
});

test("T3-H: VCA autoriza lastro em continuidade com operação aberta", () => {
  const isolada = validarContextoAtivo({
    mensagem: "Qual o resultado do JOB-000074?",
    operacaoAberta: true
  });
  assert.equal(isolada.autorizaLastroCsc, false);

  const cont = validarContextoAtivo({
    mensagem: "Use o resultado do JOB-000074 para continuar a missão",
    operacaoAberta: true
  });
  assert.equal(cont.autorizaLastroCsc, true);
  assert.equal(cont.veredicto, "pertence");
});

test("T3-I: EE continuidade adopta resultado no lastro/refino (sem reiniciar missão)", async () => {
  executiveEngine.reiniciarAcompanhamentoParaTestes();
  const out = await executiveEngine.executar(
    "Use o resultado do JOB-000074 para continuar a missão",
    {
      listarJobsEmAcompanhamento: async () => [JOB74],
      obterJob: async () => JOB74,
      listarPorEstado: async (est) =>
        !est || est === "needs_correction" ? [JOB74] : [],
      leitoresConsciencia: {
        F1: async () => [],
        F2: async () => [jobFilaParaResumoConsciencia(JOB74)],
        F3: async () => [],
        F4: async () => ({ estado: "ocioso" }),
        F5: async () => ({ estado: "ocioso", emCurso: false }),
        F6: async () => ({ estado: "ocioso", ocupado: false }),
        F7: async () => ({ disponivel: true, alertas: 0 }),
        F8: async () => ({ id: null, nome: null })
      }
    }
  );
  assert.equal(out.dados?.classificacao?.classe, "conversa_projeto");
  assert.equal(out.dados?.encaminhamento?.destino, "nucleo_mre");
  assert.equal(out.dados?.validacaoContexto?.autorizaLastroCsc, true);
  assert.match(
    String(out.dados?.refinoEic?.proximaAcao || ""),
    /JOB-000074/
  );
  assert.ok(
    (out.dados?.refinoEic?.pendencias || []).some((p) =>
      /JOB-000074/.test(String(p))
    ),
    "pendência de missão com JOB-000074"
  );
  const msgs = out.dados?.acompanhamentoOperacional?.mensagens || [];
  assert.ok(
    msgs.some((m) => /resultado/i.test(String(m.texto || ""))),
    "acompanhamento inclui resultado"
  );
  const cn = out.dados?.conversacaoNatural?.contextoImediato;
  assert.equal(cn?.operacaoAberta || cn?.estadoOperacional?.operacaoAberta, true);
  assert.match(String(out.mensagem || ""), /incorporei o resultado|resultado reconciliado/i);
  assert.doesNotMatch(
    String(out.mensagem || ""),
    /execução em andamento.*redefinir as prioridades/i
  );
});
