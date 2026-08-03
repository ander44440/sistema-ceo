/**
 * Plugin Vite — snapshot + SSE + heartbeat + coletores (IMP-055 E2/E5/E6).
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  PATH_SNAPSHOT,
  criarAgregadorOrquestracao
} from "../src/orquestracao/agregador.js";
import {
  PATH_STREAM,
  INTERVALO_PULSE_MS
} from "../src/orquestracao/streamContrato.js";
import { correrLoopSseOrquestracao } from "../src/orquestracao/streamServidor.js";
import {
  PATH_HEARTBEAT,
  escreverHeartbeat,
  validarCorpoHeartbeat
} from "../src/orquestracao/heartbeat.js";
import { sinaisRuntimeGlobal } from "../src/orquestracao/sinaisRuntime.js";
import { criarFilaExecucao } from "./executionQueue.js";
import { configDeEnvCto } from "./llmTransport.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..", "..");

function pathOf(url) {
  if (!url) return "";
  const q = url.indexOf("?");
  return q >= 0 ? url.slice(0, q) : url;
}

function enviarJson(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

function lerJson(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}"));
      } catch (e) {
        reject(e);
      }
    });
    req.on("error", reject);
  });
}

/**
 * @param {object} [env]
 */
export function orquestracaoPlugin(env = {}) {
  const fila = criarFilaExecucao(REPO_ROOT);
  const agregador = criarAgregadorOrquestracao({
    deps: {
      repoRoot: REPO_ROOT,
      listarPorEstado: (estado) => fila.listarPorEstado(estado),
      llmConfigurado: () => Boolean(configDeEnvCto(env).configurado),
      sinais: sinaisRuntimeGlobal,
      healthOk: () => true
    }
  });

  async function handleStream(req, res) {
    res.writeHead(200, {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive"
    });
    if (typeof res.flushHeaders === "function") res.flushHeaders();

    let fechado = false;
    const marcarFechado = () => {
      fechado = true;
    };
    req.on("close", marcarFechado);
    req.on("aborted", marcarFechado);

    try {
      await correrLoopSseOrquestracao({
        obterSnapshotHttp: () => agregador.obterSnapshotHttp(),
        enviar: (event, data) => {
          if (fechado) return;
          res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
        },
        intervaloPulseMs: INTERVALO_PULSE_MS,
        abortado: () => fechado || req.aborted === true
      });
    } catch {
      /* cliente desligou */
    } finally {
      try {
        res.end();
      } catch {
        /* ignore */
      }
    }
  }

  async function handler(req, res, next) {
    const pathUrl = pathOf(req.url);

    if (req.method === "GET" && pathUrl === PATH_SNAPSHOT) {
      try {
        const body = await agregador.obterSnapshotHttp();
        return enviarJson(res, 200, body);
      } catch (err) {
        return enviarJson(res, 500, {
          ok: false,
          codigo: "ORQUESTRACAO_SNAPSHOT_FALHOU",
          mensagem: err && err.message ? err.message : "Falha no snapshot."
        });
      }
    }

    if (req.method === "GET" && pathUrl === PATH_STREAM) {
      return handleStream(req, res);
    }

    if (req.method === "POST" && pathUrl === PATH_HEARTBEAT) {
      try {
        const body = await lerJson(req);
        const v = validarCorpoHeartbeat(body);
        if (!v.ok) {
          return enviarJson(res, 400, { ok: false, mensagem: v.mensagem });
        }
        const salvo = escreverHeartbeat(REPO_ROOT, {
          em: body.em,
          pid: body.pid,
          estado: body.estado,
          pending: body.pending,
          origem: body.origem || "http"
        });
        return enviarJson(res, 200, { ok: true, heartbeat: salvo });
      } catch (err) {
        return enviarJson(res, 500, {
          ok: false,
          mensagem: err && err.message ? err.message : "Falha no heartbeat."
        });
      }
    }

    return next();
  }

  return {
    name: "ceo-orquestracao",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url && req.url.startsWith("/api/ceo/orquestracao")) {
          return handler(req, res, next);
        }
        return next();
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url && req.url.startsWith("/api/ceo/orquestracao")) {
          return handler(req, res, next);
        }
        return next();
      });
    }
  };
}
