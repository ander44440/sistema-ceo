/**
 * Etapa 2 — contrato Dispatcher → Agent.
 * Fonte de verdade: job.objetivo (completo). Título só identificação.
 * Sem fallback silencioso para titulo/descricao.
 */

export const MOTIVO_OBJETIVO_AUSENTE_DESPACHO = "objetivo_ausente";

const MSG_OBJETIVO_AUSENTE =
  "objetivo_ausente: despacho recusado — Job exige objetivo (string não vazia). Título não substitui o objetivo.";

/**
 * @param {object|null|undefined} job
 * @returns {string}
 */
export function objetivoCanonicoDoJob(job) {
  if (!job || typeof job !== "object") return "";
  return String(job.objetivo ?? "").trim();
}

/**
 * @param {object|null|undefined} job
 * @returns {string}
 */
function linhaProjeto(job) {
  if (!job || typeof job !== "object") return "";
  const id = String(job.projeto || "").trim();
  const nome = String(job.projetoNome || "").trim();
  if (nome && id && nome !== id) return `${nome} (${id})`;
  return nome || id;
}

/**
 * Monta o prompt explícito para o Agent.
 * Não trunca `objetivo`. Não usa `titulo` como instrução.
 *
 * @param {object|null|undefined} job
 * @returns {{ ok: true, prompt: string, objetivo: string, titulo: string } | { ok: false, motivo: string, mensagem: string }}
 */
export function montarPromptDespacho(job) {
  const objetivo = objetivoCanonicoDoJob(job);
  if (!objetivo) {
    return {
      ok: false,
      motivo: MOTIVO_OBJETIVO_AUSENTE_DESPACHO,
      mensagem: MSG_OBJETIVO_AUSENTE
    };
  }

  const id = String(job.id || job.jobId || "").trim();
  const titulo = String(job.titulo || "").trim();
  const criterio = String(job.criterioConclusao || "").trim();
  const projeto = linhaProjeto(job);

  const introducao = [
    "Consuma a Fila de Execução do CEO (REQ-045).",
    "Siga o skill consumir-fila-execucao e a regra fila-execucao para o protocolo de estados.",
    "A tarefa a executar é o Objetivo abaixo (fonte de verdade, texto completo).",
    "O título é só identificação e pode estar truncado. Não substitua o objetivo pelo título.",
    "Não precisa de reler o JSON para descobrir a tarefa."
  ].join(" ");

  const contrato = [`Job ID: ${id}`, `Objetivo: ${objetivo}`];
  if (criterio) contrato.push(`Critério de conclusão: ${criterio}`);
  if (projeto) contrato.push(`Projeto: ${projeto}`);
  if (titulo) contrato.push(`Título (identificação): ${titulo}`);

  const protocolo = [
    "Protocolo P0-2: pending→dispatched→running→result (com evidência) ou failed.",
    "NUNCA marque completed — a verificação é do CEO/dispatcher após result.",
    "Não peça ao utilizador para colar o Job.",
    "Não invente Jobs. Não altere Constituição/Governança.",
    "Ao terminar, responda com um resumo curto do resultado."
  ].join(" ");

  return {
    ok: true,
    prompt: `${introducao}\n\n${contrato.join("\n")}\n\n${protocolo}`,
    objetivo,
    titulo
  };
}
