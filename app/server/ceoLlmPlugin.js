/**
 * Plugin Vite — deliberação LLM no servidor (chave fora do browser).
 * Compatível com API estilo OpenAI (/v1/chat/completions).
 */

function lerJson(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      try {
        const raw = Buffer.concat(chunks).toString("utf8") || "{}";
        resolve(JSON.parse(raw));
      } catch (err) {
        reject(err);
      }
    });
    req.on("error", reject);
  });
}

function enviarJson(res, status, body) {
  const payload = JSON.stringify(body);
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(payload);
}

function truthyEnv(v) {
  const s = String(v || "").trim().toLowerCase();
  return s === "1" || s === "true" || s === "yes" || s === "on";
}

/**
 * Antivírus / proxy corporativo por vezes quebra a cadeia TLS (UNABLE_TO_VERIFY_LEAF_SIGNATURE).
 * Só com CEO_LLM_TLS_INSECURE=1 — uso local consciente; não é default.
 */
function aplicarTlsInseguroSePedido(env) {
  if (!truthyEnv(env.CEO_LLM_TLS_INSECURE)) return false;
  if (process.env.NODE_TLS_REJECT_UNAUTHORIZED === "0") return true;
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  console.warn(
    "[ceo-llm] CEO_LLM_TLS_INSECURE=1 — verificação TLS desativada neste processo Node (só para desbloquear SSL inspecionado em local)."
  );
  return true;
}

function mensagemErroRede(err) {
  if (!err) return "Falha ao contactar o modelo.";
  const base = err.message || String(err);
  const code = err.cause?.code || err.code;
  if (!code) return base;
  if (code === "UNABLE_TO_VERIFY_LEAF_SIGNATURE") {
    return (
      `${base} (${code}). ` +
      "Cadeia SSL rejeitada (comum com antivírus/proxy). " +
      "Mitigação local: CEO_LLM_TLS_INSECURE=1 em app/.env e reiniciar o Vite — ou instalar o CA corporativo via NODE_EXTRA_CA_CERTS."
    );
  }
  return `${base} (${code})`;
}

function configDeEnv(env) {
  const key =
    env.CEO_LLM_API_KEY ||
    env.OPENAI_API_KEY ||
    env.CEO_OPENAI_API_KEY ||
    "";
  const base = (env.CEO_LLM_BASE_URL || "https://api.openai.com/v1").replace(
    /\/$/,
    ""
  );
  const model = env.CEO_LLM_MODEL || "gpt-4o-mini";
  return {
    key: String(key).trim(),
    base,
    model,
    configurado: Boolean(String(key).trim()),
    tlsInseguro: truthyEnv(env.CEO_LLM_TLS_INSECURE)
  };
}

async function chamarLlm(cfg, body) {
  const url = `${cfg.base}/chat/completions`;
  let resp;
  try {
    resp = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cfg.key}`
      },
      body: JSON.stringify({
        model: cfg.model,
        temperature: body.temperature ?? 0.4,
        max_tokens: body.max_tokens ?? 900,
        messages: body.messages
      })
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
      (data && data.error && data.error.message) ||
      `HTTP ${resp.status}`;
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
    texto: String(texto || "").trim(),
    modelo: data.model || cfg.model,
    uso: data.usage || null
  };
}

function criarHandler(env) {
  return async (req, res, next) => {
    if (req.method === "GET" && req.url && req.url.startsWith("/api/ceo/llm-status")) {
      const cfg = configDeEnv(env);
      return enviarJson(res, 200, {
        ok: true,
        configurado: cfg.configurado,
        modelo: cfg.model,
        base: cfg.base.replace(/https?:\/\//, "").split("/")[0],
        tlsInseguro: cfg.tlsInseguro
      });
    }

    if (req.method !== "POST" || !req.url || !req.url.startsWith("/api/ceo/deliberar")) {
      return next();
    }

    const cfg = configDeEnv(env);
    if (!cfg.configurado) {
      return enviarJson(res, 503, {
        ok: false,
        codigo: "LLM_NAO_CONFIGURADO",
        mensagem:
          "Motor de linguagem não configurado. Defina CEO_LLM_API_KEY (ou OPENAI_API_KEY) em app/.env e reinicie o servidor."
      });
    }

    try {
      const body = await lerJson(req);
      if (!body || !Array.isArray(body.messages) || !body.messages.length) {
        return enviarJson(res, 400, {
          ok: false,
          codigo: "PEDIDO_INVALIDO",
          mensagem: "messages[] é obrigatório."
        });
      }

      const resultado = await chamarLlm(cfg, body);
      if (!resultado.texto) {
        return enviarJson(res, 502, {
          ok: false,
          codigo: "RESPOSTA_VAZIA",
          mensagem: "O modelo devolveu resposta vazia."
        });
      }

      return enviarJson(res, 200, {
        ok: true,
        texto: resultado.texto,
        modelo: resultado.modelo,
        uso: resultado.uso,
        origem: "llm"
      });
    } catch (err) {
      return enviarJson(res, err.status && err.status < 600 ? err.status : 502, {
        ok: false,
        codigo: "LLM_FALHOU",
        mensagem: err && err.message ? err.message : "Falha ao contactar o modelo."
      });
    }
  };
}

export function ceoLlmPlugin(env) {
  const envSafe = env || {};
  aplicarTlsInseguroSePedido(envSafe);
  const handler = criarHandler(envSafe);
  return {
    name: "ceo-llm-plugin",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url && req.url.startsWith("/api/ceo/")) {
          return handler(req, res, next);
        }
        return next();
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url && req.url.startsWith("/api/ceo/")) {
          return handler(req, res, next);
        }
        return next();
      });
    }
  };
}
