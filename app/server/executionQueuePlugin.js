/**
 * Plugin Vite — API da Fila de Execução (REQ-045).
 * CEO → Queue; sem binding a executores.
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { criarFilaExecucao } from "./executionQueue.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
/** Raiz do repo CEO (pai de app/). */
const REPO_ROOT = path.resolve(__dirname, "..", "..");

function lerJson(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      try {
        let raw = Buffer.concat(chunks).toString("utf8") || "{}";
        if (raw.charCodeAt(0) === 0xfeff) raw = raw.slice(1);
        resolve(JSON.parse(raw));
      } catch (err) {
        reject(err);
      }
    });
    req.on("error", reject);
  });
}

function enviarJson(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

export function executionQueuePlugin() {
  const fila = criarFilaExecucao(REPO_ROOT);

  return {
    name: "ceo-execution-queue",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url || !req.url.startsWith("/api/ceo/queue")) {
          return next();
        }

        try {
          if (req.method === "GET" && req.url.startsWith("/api/ceo/queue/pending")) {
            const jobs = fila.listarPendentes();
            return enviarJson(res, 200, { ok: true, jobs, pasta: fila.queueDir });
          }

          if (req.method === "GET" && req.url.startsWith("/api/ceo/queue/jobs")) {
            const jobs = fila.listarPorEstado(null);
            return enviarJson(res, 200, { ok: true, jobs });
          }

          if (req.method === "POST" && req.url.startsWith("/api/ceo/queue/jobs")) {
            const body = await lerJson(req);
            if (!body || (!body.titulo && !body.descricao)) {
              return enviarJson(res, 400, {
                ok: false,
                mensagem: "titulo ou descricao é obrigatório."
              });
            }
            const job = fila.publicar(body);
            return enviarJson(res, 201, { ok: true, job });
          }

          if (req.method === "PATCH" && req.url.startsWith("/api/ceo/queue/jobs/")) {
            const id = decodeURIComponent(
              req.url.replace(/^\/api\/ceo\/queue\/jobs\//, "").split("?")[0]
            );
            const body = await lerJson(req);
            if (!body || !body.estado) {
              return enviarJson(res, 400, {
                ok: false,
                mensagem: "estado é obrigatório."
              });
            }
            const job = fila.atualizarEstado(id, body.estado, {
              resultado: body.resultado
            });
            return enviarJson(res, 200, { ok: true, job });
          }

          return enviarJson(res, 404, { ok: false, mensagem: "Rota da fila não encontrada." });
        } catch (err) {
          return enviarJson(res, 500, {
            ok: false,
            mensagem: err && err.message ? err.message : "Erro na fila."
          });
        }
      });
    }
  };
}
