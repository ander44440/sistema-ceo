/**
 * Cliente do motor de linguagem — apenas via /api/ceo/* (chave no servidor).
 */

let cacheStatus = null;
let cacheEm = 0;

export async function obterStatusLlm() {
  const agora = Date.now();
  if (cacheStatus && agora - cacheEm < 15000) return cacheStatus;
  try {
    const resp = await fetch("/api/ceo/llm-status");
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
 * @param {{ messages: Array<{role:string,content:string}>, temperature?: number }} pedido
 */
export async function deliberarComLlm(pedido) {
  const resp = await fetch("/api/ceo/deliberar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: pedido.messages,
      temperature: pedido.temperature ?? 0.4,
      max_tokens: pedido.max_tokens ?? 900
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
