/**
 * OBJ1 — não ecoar Jobs históricos deliberativos em turno com pedido A/B/C.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  ehJobRuidoDeliberativo,
  filtrarMensagensAcompanhamentoDeliberativo,
  montarMensagemProgresso
} from "./acompanhamentoJob.js";
import { detectarPedidoDecisaoExplicita } from "../classificadorIntencao/pedidoDecisaoExplicita.js";

const PEDIDO_ABC = `Contrato novo:
A) Aceitar agora
B) Recusar o contrato
C) Adiar a aceitação

Decide A, B ou C. Não execute.`;

function job095() {
  return {
    id: "JOB-000095",
    estado: "needs_correction",
    titulo: "Decide A/B/C contrato",
    descricao: `${PEDIDO_ABC}\nNão crie nenhum Job.`,
    resultado: {
      decisao: "C",
      resumo: "Decisão executiva: C (adiar a aceitação do contrato)."
    }
  };
}

function job093() {
  return {
    id: "JOB-000093",
    estado: "needs_correction",
    titulo: "TESTE C9 — criação de ficheiro",
    descricao: "Criar executive/queue/teste-c9-execucao-real.txt",
    resultado: {
      resumo: "Criado teste-c9-execucao-real.txt",
      evidencia: "executive/queue/teste-c9-execucao-real.txt"
    },
    verificacao: { motivo: "homologação C9 incompleta" }
  };
}

function jobTecnicoRunning() {
  return {
    id: "JOB-TEC-001",
    estado: "running",
    titulo: "Implementar endpoint de saúde",
    descricao: "Adicionar GET /health no servidor Node."
  };
}

function obsDe(...jobs) {
  const mensagens = jobs.map((j) => montarMensagemProgresso(j)).filter((m) => m.ok);
  const resultados = jobs.map((j) => ({ ok: true, job: j, estado: j.estado }));
  return {
    ok: true,
    mensagens,
    resultados,
    aindaActivos: jobs.length,
    fonte: "fila_persistida"
  };
}

/** Espelha anexarMensagensAcompanhamento do EE (filtro + join). */
function mensagemComAcompanhamento(base, obs, texto) {
  const uso = detectarPedidoDecisaoExplicita(texto)
    ? filtrarMensagensAcompanhamentoDeliberativo(obs)
    : obs;
  const textos = (uso?.mensagens || [])
    .map((m) => (m && typeof m.texto === "string" ? m.texto.trim() : ""))
    .filter(Boolean);
  if (!textos.length) return String(base || "");
  const b = String(base || "").trim();
  return b ? `${b}\n${textos.join("\n")}` : textos.join("\n");
}

test("1: pedido A/B/C + JOB-000095 needs_correction → sem eco do resultado C", () => {
  assert.equal(detectarPedidoDecisaoExplicita(PEDIDO_ABC), true);
  assert.equal(ehJobRuidoDeliberativo(job095()), true);
  const msg = mensagemComAcompanhamento(
    "C — adiar a aceitação.",
    obsDe(job095()),
    PEDIDO_ABC
  );
  assert.doesNotMatch(msg, /JOB-000095/);
  assert.doesNotMatch(msg, /Decisão executiva:\s*C/i);
  assert.match(msg, /C — adiar/i);
});

test("2: pedido A/B/C + JOB-000093 needs_correction → sem eco C9", () => {
  const msg = mensagemComAcompanhamento(
    "Decisão: monitorar.",
    obsDe(job093()),
    PEDIDO_ABC
  );
  assert.doesNotMatch(msg, /JOB-000093/);
  assert.doesNotMatch(msg, /teste-c9|TESTE C9/i);
});

test("3: turno sem pedido de decisão + Job técnico running → acompanhamento continua", () => {
  const texto = "Como vai o endpoint de saúde?";
  assert.equal(detectarPedidoDecisaoExplicita(texto), false);
  const msg = mensagemComAcompanhamento(
    "A seguir o progresso.",
    obsDe(jobTecnicoRunning()),
    texto
  );
  assert.match(msg, /JOB-TEC-001/);
  assert.match(msg, /running/i);
});

test("filtro: decisão + running operacional preservado; histórico removido", () => {
  const obs = obsDe(job095(), job093(), jobTecnicoRunning());
  const filtrado = filtrarMensagensAcompanhamentoDeliberativo(obs);
  const ids = filtrado.mensagens.map((m) => m.jobId);
  assert.deepEqual(ids, ["JOB-TEC-001"]);
});
