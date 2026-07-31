/**
 * Serviço LLM — lógica extraída de app/server/ceoLlmPlugin.js (BP-001 E3).
 * Contrato e variáveis de ambiente idênticos ao plugin Vite.
 */

function truthyEnv(v) {
  const s = String(v || '').trim().toLowerCase();
  return s === '1' || s === 'true' || s === 'yes' || s === 'on';
}

/**
 * Antivírus / proxy corporativo por vezes quebra a cadeia TLS (UNABLE_TO_VERIFY_LEAF_SIGNATURE).
 * Só com CEO_LLM_TLS_INSECURE=1 — uso local consciente; não é default.
 */
export function aplicarTlsInseguroSePedido(env = process.env) {
  if (!truthyEnv(env.CEO_LLM_TLS_INSECURE)) return false;
  if (process.env.NODE_TLS_REJECT_UNAUTHORIZED === '0') return true;
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  console.warn(
    '[ceo-llm] CEO_LLM_TLS_INSECURE=1 — verificação TLS desativada neste processo Node (só para desbloquear SSL inspecionado em local).',
  );
  return true;
}

function mensagemErroRede(err) {
  if (!err) return 'Falha ao contactar o modelo.';
  const base = err.message || String(err);
  const code = err.cause?.code || err.code;
  if (!code) return base;
  if (code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE') {
    return (
      `${base} (${code}). ` +
      'Cadeia SSL rejeitada (comum com antivírus/proxy). ' +
      'Mitigação local: CEO_LLM_TLS_INSECURE=1 em app/.env e reiniciar o Vite — ou instalar o CA corporativo via NODE_EXTRA_CA_CERTS.'
    );
  }
  return `${base} (${code})`;
}

export function configDeEnv(env = process.env) {
  const key =
    env.CEO_LLM_API_KEY ||
    env.OPENAI_API_KEY ||
    env.CEO_OPENAI_API_KEY ||
    '';
  const base = (env.CEO_LLM_BASE_URL || 'https://api.openai.com/v1').replace(
    /\/$/,
    '',
  );
  const model = env.CEO_LLM_MODEL || 'gpt-4o-mini';
  return {
    key: String(key).trim(),
    base,
    model,
    configurado: Boolean(String(key).trim()),
    tlsInseguro: truthyEnv(env.CEO_LLM_TLS_INSECURE),
  };
}

export async function chamarLlm(cfg, body) {
  const url = `${cfg.base}/chat/completions`;
  let resp;
  try {
    resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cfg.key}`,
      },
      body: JSON.stringify({
        model: cfg.model,
        temperature: body.temperature ?? 0.4,
        max_tokens: body.max_tokens ?? 900,
        messages: body.messages,
      }),
    });
  } catch (err) {
    const e = new Error(mensagemErroRede(err));
    e.status = 502;
    e.cause = err;
    throw e;
  }

  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    const detalhe =
      (data && data.error && data.error.message) || `HTTP ${resp.status}`;
    const err = new Error(detalhe);
    err.status = resp.status;
    throw err;
  }

  const texto =
    data &&
    data.choices &&
    data.choices[0] &&
    data.choices[0].message &&
    data.choices[0].message.content;

  return {
    texto: String(texto || '').trim(),
    modelo: data.model || cfg.model,
    uso: data.usage || null,
  };
}
