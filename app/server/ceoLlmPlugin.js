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
    configurado: Boolean(String(key).trim())
  };
}

async function chamarLlm(cfg, body) {
  const url = `${cfg.base}/chat/completions`;
  const resp = await fetch(url, {
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
        base: cfg.base.replace(/https?:\/\//, "").split("/")[0]
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
  const handler = criarHandler(env || {});
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
