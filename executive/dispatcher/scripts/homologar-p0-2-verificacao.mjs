/**
 * Homologação real P0-2: PENDING → … → RESULT → VERIFICATION → COMPLETED
 * Simula Agent (grava result no ficheiro) + integração dispatcher (verifica).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { criarFilaExecucao } from "../../../app/server/executionQueue.js";
import {
  verificarJobsEmResult,
  reconciliarAposAgent
} from "../src/posAgent.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, "..", "..", "..");
const QUEUE = path.join(REPO, "executive", "queue");
const ARTEFACTO = path.join(QUEUE, "p0-2-homologacao-int.txt");

const fila = criarFilaExecucao(REPO);

// 1) Publicar Job de homologação (equivalente ao JOB-000067)
const job = fila.publicar({
  origem: "ceo",
  tipo: "execucao_tecnica",
  prioridade: "alta",
  titulo:
    "Homologação P0-2 integração: criar p0-2-homologacao-int.txt com P0-2 HOMOLOGADO",
  descricao:
    "Objectivo: criar arquivo de teste p0-2-homologacao-int.txt contendo exactamente uma linha: P0-2 HOMOLOGADO. Fluxo: PENDING→DISPATCHED→RUNNING→RESULT→VERIFICATION→COMPLETED. Não alterar MG2.",
  criterioConclusao:
    "Ficheiro p0-2-homologacao-int.txt existe com linha exacta P0-2 HOMOLOGADO"
});

console.log("=== HOMOLOGAÇÃO P0-2 INTEGRAÇÃO ===");
console.log("ID:", job.id);

// 2) Handoff + execução (como Dispatcher/Agent)
fila.marcarDespachado(job.id, { actor: "dispatcher", motivo: "handoff_agent" });
fila.marcarRunning(job.id, { actor: "agent", motivo: "execucao_iniciada" });

// 3) Agent produz artefacto + grava RESULT (sem completed — skill)
fs.writeFileSync(ARTEFACTO, "P0-2 HOMOLOGADO\n", "utf8");
const conteudo = fs.readFileSync(ARTEFACTO, "utf8").trim();
if (conteudo !== "P0-2 HOMOLOGADO") {
  throw new Error(`Artefacto inválido: ${conteudo}`);
}

const emResult = fila.registarResultado(
  job.id,
  {
    status: "sucesso",
    resumo:
      "Homologação P0-2 integração: criado p0-2-homologacao-int.txt com linha P0-2 HOMOLOGADO",
    evidencia: `${path.relative(REPO, ARTEFACTO)} — conteúdo verificado: P0-2 HOMOLOGADO`,
    artefacto: "p0-2-homologacao-int.txt",
    linhaIdentificavel: "P0-2 HOMOLOGADO",
    estadosPercorridos: ["pending", "dispatched", "running", "result"]
  },
  { adiarVerificacao: true, actor: "agent", motivo: "homologacao_p0_2_int" }
);

console.log("Após Agent (result):", emResult.estado);
console.log("Resultado Agent:", JSON.stringify(emResult.resultado, null, 2));

// 4) Integração: pass de verificação (como ciclo do dispatcher)
const pass = verificarJobsEmResult(QUEUE);
const final =
  pass.verificados.find((j) => j.id === job.id) ||
  reconciliarAposAgent(QUEUE, job.id).job ||
  fila.lerJob(job.id);

const estados = (final.historicoCiclo || []).map((h) => h.para);
console.log("Histórico estados:", estados.join(" → "));
console.log("Verificação:", JSON.stringify(final.verificacao, null, 2));
console.log("Critério:", final.criterioConclusao || final.titulo);
console.log("Estado final:", final.estado);
console.log(
  "Evidência ficheiro:",
  fs.existsSync(ARTEFACTO) ? fs.readFileSync(ARTEFACTO, "utf8").trim() : "(ausente)"
);

if (final.estado !== "completed") {
  console.error("FALHA: esperado completed, got", final.estado);
  process.exit(1);
}

// Também reconciliar JOB-000067 se ainda estiver em result
const j67 = fila.lerJob("JOB-000067");
if (j67 && j67.estado === "result") {
  const r67 = reconciliarAposAgent(QUEUE, "JOB-000067");
  console.log("JOB-000067 (legado):", r67.acao, "→", r67.job?.estado);
}

console.log("OK — fluxo real RESULT→VERIFICATION→COMPLETED comprovado.");
