/**
 * Adapter LLM do CEO → saídas JSON por estágio do MRE (IMP-014).
 */

import { deliberarComLlm } from "../executiveEngine/llmCliente.js";
import { parseSaidaJson } from "./pipeline/llmEstagio.js";

/**
 * @param {object} [opts]
 * @param {(pedido: object) => Promise<{texto:string}>} [opts.deliberar] — injetável
 */
export function criarChamarLlmCeo(opts = {}) {
  const deliberar = opts.deliberar || deliberarComLlm;

  return async function chamarLlm(pedido) {
    const messages = [
      {
        role: "system",
        content:
          "És um módulo interno do Motor de Raciocínio Executivo. " +
          "Responde APENAS com um único objeto JSON válido, sem markdown, sem prosa. " +
          `Schema esperado: ${pedido.schemaHint}`
      },
      {
        role: "user",
        content: JSON.stringify({
          estagio: pedido.estagio,
          retentativa: Boolean(pedido.retentativa),
          contexto: pedido.contexto
        })
      }
    ];

    const saida = await deliberar({
      messages,
      temperature: 0.2,
      max_tokens: 700
    });
    return parseSaidaJson(saida.texto);
  };
}
