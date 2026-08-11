/**
 * Plugin Vite — deliberação LLM + Conector CTO (chave fora do browser).
 * Transporte: llmTransport.js (REQ-054 Opção B).
 */

import {
  aplicarTlsInseguroSePedido,
  configDeEnv,
  configDeEnvCto,
  chamarLlm
} from "./llmTransport.js";
import { criarExecutarConsultaCto } from "./ctoConnector/index.js";
import { sinaisRuntimeGlobal } from "../src/orquestracao/sinaisRuntime.js";

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

function pathOf(url) {
  if (!url) return "";
  const q = url.indexOf("?");
  return q >= 0 ? url.slice(0, q) : url;
}

function criarHandler(env) {
  const executarCto = criarExecutarConsultaCto({
    configDeEnvCto,
    chamarLlm,
    env
  });

  return async (req, res, next) => {
    const path = pathOf(req.url);

    if (req.method === "GET" && path === "/api/ceo/llm-status") {
      const cfg = configDeEnv(env);
      return enviarJson(res, 200, {
        ok: true,
        configurado: cfg.configurado,
        modelo: cfg.model,
        base: cfg.base.replace(/https?:\/\//, "").split("/")[0],
        tlsInseguro: cfg.tlsInseguro
      });
    }

    // P1-3 — Manifesto canónico MG2 (fonte: docs/MANIFESTO-MG2.md no repo do jogo)
    if (req.method === "GET" && path === "/api/ceo/manifesto-mg2") {
      try {
        const fs = await import("node:fs");
        const { carregarManifestoMg2DoDisco } = await import(
          "../src/camadaConhecimento/manifestoMg2.js"
        );
        const doc = carregarManifestoMg2DoDisco({
          fs,
          repoRoot: env.CEO_MG2_REPO || process.env.CEO_MG2_REPO
        });
        if (!doc.ok) {
          return enviarJson(res, 404, {
            ok: false,
            erro: doc.erro || "Manifesto canónico indisponível",
            caminhoRelativo: doc.caminhoRelativo
          });
        }
        return enviarJson(res, 200, {
          ok: true,
          origem: doc.origem,
          caminhoRelativo: doc.caminhoRelativo,
          caminhoAbsoluto: doc.caminhoAbsoluto,
          mtimeMs: doc.mtimeMs,
          secoes: doc.secoes,
          principiosSelecionaveis: doc.principiosSelecionaveis,
          conteudo: doc.conteudo
        });
      } catch (err) {
        return enviarJson(res, 500, {
          ok: false,
          erro: err && err.message ? err.message : "Falha ao carregar Manifesto"
        });
      }
    }

    if (req.method === "POST" && path === "/api/ceo/cto/consultar") {
      sinaisRuntimeGlobal.inicioConsultaCto();
      sinaisRuntimeGlobal.inicioCicloCeo();
      try {
        const body = await lerJson(req);
        const out = await executarCto(body);
        sinaisRuntimeGlobal.fimConsultaCto(
          out && out.body && out.body.estado ? out.body.estado : null
        );
        return enviarJson(res, out.httpStatus, out.body);
      } catch (err) {
        sinaisRuntimeGlobal.fimConsultaCto("erro_transporte");
        return enviarJson(res, 500, {
          estado: "erro_transporte",
          codigo: "CTO_INTERNO",
          mensagem: err && err.message ? err.message : "Falha no Conector CTO.",
          rastreio: {
            modelo: null,
            latenciaMs: 0,
            criadoEm: new Date().toISOString()
          }
        });
      } finally {
        sinaisRuntimeGlobal.fimCicloCeo();
      }
    }

    if (req.method !== "POST" || path !== "/api/ceo/deliberar") {
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

    sinaisRuntimeGlobal.inicioCicloCeo();
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
    } finally {
      sinaisRuntimeGlobal.fimCicloCeo();
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
