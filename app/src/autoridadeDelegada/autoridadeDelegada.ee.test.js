/**
 * CAP-01 / IMP-071 — integração EE: AD activa + EXECUTE → Motor (não loop de ack).
 */
import assert from "node:assert/strict";
import { test, beforeEach } from "node:test";
import executiveEngine from "../executiveEngine/index.js";
import {
  reiniciarAutoridadeDelegadaParaTestes,
  autoridadeDelegadaActiva,
  activarAutoridadeDelegada,
  ehOrdemExecucaoOperacional
} from "./autoridadeDelegada.js";

beforeEach(() => {
  reiniciarAutoridadeDelegadaParaTestes();
});

const depsMotor = () => {
  let motorChamado = false;
  let ultimoPedido = null;
  return {
    get motorChamado() {
      return motorChamado;
    },
    get ultimoPedido() {
      return ultimoPedido;
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
        F8: async () => ({ id: "mg2", nome: "Motoboy Game 2" })
      },
      publicarJob: async (pedido) => {
        ultimoPedido = pedido;
        return { id: "JOB-AD-001", estado: "pending", ...pedido };
      },
      conduzirMotor: async () => {
        motorChamado = true;
        return {
          publicado: true,
          job: { id: "JOB-AD-001", estado: "pending" },
          fluxoIniciado: true
        };
      }
    }
  };
};

test("EE: activação AD sem EXECUTE → ack, sem pergunta deliberativa, sem Motor", async () => {
  const ctx = depsMotor();
  const out = await executiveEngine.executar(
    {
      texto:
        "VOCE ESTA AUTORIZADO A TOMAR TODAS AS MEDIDAS QUE JULGA NECESSÁRIAS, PARA UMA MELHOR PERFORMANCE DO MG2 OK..",
      historico: []
    },
    ctx.deps
  );

  assert.equal(autoridadeDelegadaActiva(), true);
  assert.equal(out.modo, "autoridade_delegada");
  assert.equal(out.dados?.motorAcionado, false);
  assert.match(String(out.mensagem || ""), /Autoridade Delegada activa/i);
  assert.doesNotMatch(
    String(out.mensagem || ""),
    /O que mudaria esta decisão/i
  );
  assert.equal(ctx.motorChamado, false);
});

test("EE: AD activa + EXECUTE → Motor/C3, não re-ack", async () => {
  const ctx = depsMotor();
  await executiveEngine.executar(
    {
      texto:
        "VOCE ESTA AUTORIZADO A TOMAR TODAS AS MEDIDAS QUE JULGA NECESSÁRIAS, PARA UMA MELHOR PERFORMANCE DO MG2 OK..",
      historico: []
    },
    ctx.deps
  );

  const out = await executiveEngine.executar(
    {
      texto: "EXECUTE AS MELHORIAS QUE VC JULGA NECESSARIAS OK",
      historico: []
    },
    ctx.deps
  );

  assert.equal(autoridadeDelegadaActiva(), true);
  assert.notEqual(out.modo, "autoridade_delegada");
  assert.doesNotMatch(
    String(out.mensagem || ""),
    /^Autoridade Delegada activa\. Assumo o fecho/i
  );
  assert.doesNotMatch(
    String(out.mensagem || ""),
    /O que mudaria esta decisão/i
  );
  assert.ok(
    ctx.motorChamado || out.dados?.motorAcionado === true,
    "deve acionar Motor sob AD + EXECUTE"
  );
  assert.equal(out.capacidade, "motor_execucao");
});

test("EE: mandato + EXECUTE no mesmo turno → activa e despacha Motor", async () => {
  const ctx = depsMotor();
  const out = await executiveEngine.executar(
    {
      texto:
        "VOCE ESTA AUTORIZADO A TOMAR TODAS AS MEDIDAS QUE JULGA NECESSÁRIAS. EXECUTE AS MELHORIAS DE PERFORMANCE DO MG2",
      historico: []
    },
    ctx.deps
  );

  assert.equal(autoridadeDelegadaActiva(), true);
  assert.notEqual(out.modo, "autoridade_delegada");
  assert.ok(
    ctx.motorChamado || out.dados?.motorAcionado === true,
    "mesmo turno: activar + executar"
  );
});

function activarAdTeste() {
  const r = activarAutoridadeDelegada({
    texto: "delego a autoridade — você decide no perímetro do MG2",
    agente: "usuario",
    perimetro: "coa-mg2"
  });
  assert.equal(r.ok, true);
  assert.equal(autoridadeDelegadaActiva(), true);
}

test("P2 EE: ordem pura sob AD continua Motor", async () => {
  for (const texto of [
    "implemente esta funcionalidade",
    "executa a tarefa agora"
  ]) {
    reiniciarAutoridadeDelegadaParaTestes();
    activarAdTeste();
    const ctx = depsMotor();
    const out = await executiveEngine.executar(
      { texto, historico: [] },
      ctx.deps
    );
    assert.equal(ehOrdemExecucaoOperacional(texto), true, texto);
    assert.equal(out.dados?.precedenciaTurno?.acao, "permitir_ad_execucao_c3", texto);
    assert.ok(
      ctx.motorChamado || out.dados?.motorAcionado === true,
      texto
    );
    assert.equal(out.dados?.encaminhamento?.destino, "motor_execucao", texto);
  }
});

test("P2 EE: ordem composta sob AD não fabrica C3; destino = sem AD", async () => {
  const compostas = [
    "executa e me diga o estado da fila",
    "execute a consulta do estado da fila",
    "faz isso e me diga quais jobs estão abertos"
  ];
  for (const texto of compostas) {
    assert.equal(ehOrdemExecucaoOperacional(texto), true, texto);

    reiniciarAutoridadeDelegadaParaTestes();
    const ctxSem = depsMotor();
    const semAd = await executiveEngine.executar(
      { texto, historico: [] },
      ctxSem.deps
    );

    reiniciarAutoridadeDelegadaParaTestes();
    activarAdTeste();
    const ctxCom = depsMotor();
    const comAd = await executiveEngine.executar(
      { texto, historico: [] },
      ctxCom.deps
    );

    assert.equal(autoridadeDelegadaActiva(), true, texto);
    assert.equal(comAd.dados?.precedenciaTurno?.acao, "seguir_classificador", texto);
    assert.ok(comAd.dados?.classificacao?.classe, texto);
    assert.notEqual(
      comAd.dados?.classificacao?.razoes?.[0],
      "CAP-01: ordem de execução sob Autoridade Delegada activa",
      texto
    );
    assert.equal(ctxCom.motorChamado, false, texto);
    assert.notEqual(comAd.dados?.motorAcionado, true, texto);
    assert.equal(
      comAd.dados?.encaminhamento?.destino,
      semAd.dados?.encaminhamento?.destino,
      texto
    );
    assert.equal(comAd.dados?.classificacao?.classe, semAd.dados?.classificacao?.classe, texto);
  }
});

test("P2 EE: «implementa isso e explique o próximo passo» continua C2 sem Motor", async () => {
  reiniciarAutoridadeDelegadaParaTestes();
  activarAdTeste();
  const ctx = depsMotor();
  const out = await executiveEngine.executar(
    { texto: "implementa isso e explique o próximo passo", historico: [] },
    ctx.deps
  );
  assert.equal(out.dados?.classificacao?.classe, "conversa_projeto");
  assert.equal(out.dados?.encaminhamento?.destino, "nucleo_mre");
  assert.equal(ctx.motorChamado, false);
  assert.notEqual(out.dados?.motorAcionado, true);
});
