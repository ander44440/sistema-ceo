/**
 * Utilitários de chamada LLM por estágio (schema JSON parcial).
 * Dependência injetável — testes não usam rede.
 */

/**
 * @typedef {{ estagio: string, schemaHint: string, contexto: object }} PedidoLlmEstagio
 * @typedef {(pedido: PedidoLlmEstagio) => Promise<object|string>} ChamarLlmEstagio
 */

/**
 * @param {unknown} raw
 * @returns {object}
 */
export function parseSaidaJson(raw) {
  if (raw && typeof raw === "object" && !Array.isArray(raw)) return /** @type {object} */ (raw);
  const texto = String(raw ?? "").trim();
  const fence = texto.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidato = fence ? fence[1].trim() : texto;
  const inicio = candidato.indexOf("{");
  const fim = candidato.lastIndexOf("}");
  if (inicio >= 0 && fim > inicio) {
    return JSON.parse(candidato.slice(inicio, fim + 1));
  }
  return JSON.parse(candidato);
}

/**
 * Uma retentativa; depois propaga o erro.
 * @param {ChamarLlmEstagio} chamarLlm
 * @param {PedidoLlmEstagio} pedido
 */
export async function chamarComRetry(chamarLlm, pedido) {
  try {
    return parseSaidaJson(await chamarLlm(pedido));
  } catch (err1) {
    try {
      return parseSaidaJson(await chamarLlm({ ...pedido, retentativa: true }));
    } catch (err2) {
      const e = err2 instanceof Error ? err2 : new Error(String(err2));
      e.causaOriginal = err1;
      e.estagio = pedido.estagio;
      throw e;
    }
  }
}
