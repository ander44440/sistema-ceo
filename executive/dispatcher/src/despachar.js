/**
 * Invoca Cursor Agent local para consumir a fila (REQ-053).
 */

import { Agent, CursorAgentError } from "@cursor/sdk";

/**
 * @param {{ repoRoot: string, apiKey: string, model: string, jobId: string, titulo: string }} opts
 */
export async function despacharAgent(opts) {
  const { repoRoot, apiKey, model, jobId, titulo } = opts;

  const prompt = [
    "Consuma a Fila de Execução do CEO (REQ-045).",
    "Siga o skill consumir-fila-execucao e a regra fila-execucao.",
    `Há pelo menos o Job pending ${jobId}` +
      (titulo ? ` («${titulo}»).` : "."),
    "Protocolo: marcar running → executar só o pedido em titulo/descricao → completed ou failed com resultado.",
    "Não peça ao utilizador para colar o Job.",
    "Não invente Jobs. Não altere Constituição/Governança.",
    "Ao terminar, responda com um resumo curto do resultado."
  ].join(" ");

  try {
    const result = await Agent.prompt(prompt, {
      apiKey,
      model: { id: model },
      local: { cwd: repoRoot }
    });
    return {
      ok: result.status === "finished",
      status: result.status,
      result: result.result,
      runId: result.id,
      durationMs: result.durationMs
    };
  } catch (err) {
    if (err instanceof CursorAgentError) {
      return {
        ok: false,
        status: "startup_error",
        result: err.message,
        retryable: err.isRetryable
      };
    }
    throw err;
  }
}
