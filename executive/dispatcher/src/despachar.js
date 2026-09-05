/**
 * Invoca Cursor Agent local para consumir a fila (REQ-053).
 */

import { Agent, CursorAgentError } from "@cursor/sdk";
import { montarPromptDespacho } from "./contratoDespacho.js";

/**
 * @param {{
 *   repoRoot: string,
 *   apiKey: string,
 *   model: string,
 *   jobId: string,
 *   objetivo?: string,
 *   criterioConclusao?: string,
 *   projeto?: string,
 *   projetoNome?: string,
 *   titulo?: string
 * }} opts
 */
export async function despacharAgent(opts) {
  const {
    repoRoot,
    apiKey,
    model,
    jobId,
    objetivo,
    criterioConclusao,
    projeto,
    projetoNome,
    titulo
  } = opts;

  const contrato = montarPromptDespacho({
    id: jobId,
    objetivo,
    criterioConclusao,
    projeto,
    projetoNome,
    titulo
  });
  if (!contrato.ok) {
    return {
      ok: false,
      status: "objetivo_ausente",
      result: contrato.mensagem,
      error: contrato.mensagem
    };
  }

  const prompt = contrato.prompt;

  try {
    const result = await Agent.prompt(prompt, {
      apiKey,
      model: { id: model },
      local: { cwd: repoRoot }
    });
    const erroSdk =
      result &&
      result.error &&
      typeof result.error === "object" &&
      typeof result.error.message === "string"
        ? result.error.message
        : null;
    return {
      ok: result.status === "finished",
      status: result.status,
      result: result.result || erroSdk || null,
      error: erroSdk,
      runId: result.id,
      durationMs: result.durationMs
    };
  } catch (err) {
    if (err instanceof CursorAgentError) {
      return {
        ok: false,
        status: "startup_error",
        result: err.message,
        error: err.message,
        retryable: err.isRetryable
      };
    }
    throw err;
  }
}
