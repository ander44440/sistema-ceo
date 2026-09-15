/**
 * Cliente do motor de linguagem — apenas via /api/ceo/* (chave no servidor).
 * IMP-093 M4: todo envio oficial passa pelo CG-GATE (ENFORCE padrão).
 * `transportarDeliberarHttp` é o único fetch a `/api/ceo/deliberar` em app/src —
 * invocado somente através de `atravessarGateLlm` / `deliberarComLlm`.
 */

import { ceoApiUrl } from "../ceoApiBase.js";
import { atravessarGateLlm } from "../contextGovernor/gateLlm.js";

let cacheStatus = null;
let cacheEm = 0;

export async function obterStatusLlm() {
  const agora = Date.now();
  if (cacheStatus && agora - cacheEm < 15000) return cacheStatus;
  try {
    const resp = await fetch(ceoApiUrl("/api/ceo/llm-status"));
    const data = await resp.json();
    cacheStatus = data;
    cacheEm = agora;
    return data;
  } catch {
    cacheStatus = { ok: false, configurado: false };
    cacheEm = agora;
    return cacheStatus;
  }
}

/**
 * Transporte HTTP bruto (sem CG). Usado pelo gate e testes de igualdade de body.
 * @param {{ messages: Array<{role:string,content:string}>, temperature?: number, max_tokens?: number }} body
 */
export async function transportarDeliberarHttp(body) {
  const resp = await fetch(ceoApiUrl("/api/ceo/deliberar"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: body.messages,
      temperature: body.temperature ?? 0.4,
      max_tokens: body.max_tokens ?? 900
    })
  });

  const data = await resp.json().catch(() => ({}));
  if (!resp.ok || !data.ok) {
    const err = new Error(
      (data && data.mensagem) || `Falha LLM (HTTP ${resp.status})`
    );
    err.codigo = data && data.codigo;
    err.status = resp.status;
    throw err;
  }

  return {
    texto: data.texto,
    modelo: data.modelo,
    uso: data.uso,
    origem: "llm"
  };
}

/**
 * @param {{
 *   messages: Array<{role:string,content:string}>,
 *   temperature?: number,
 *   max_tokens?: number,
 *   cgMeta?: object,
 *   actoChamada?: string
 * }} pedido
 * @param {object} [opts] — { metaCg?, transportar? } para testes
 */
export async function deliberarComLlm(pedido, opts = {}) {
  const transportar =
    typeof opts.transportar === "function"
      ? opts.transportar
      : transportarDeliberarHttp;

  return atravessarGateLlm(pedido, transportar, {
    metaCg: opts.metaCg
  });
}
