/**
 * Plugin Vite — ponte HTTP da Trilha Auditável → JSONL em executive/audit/.
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  appendEvento,
  caminhoStoreAudit,
  listarEventos,
  listarPorJob
} from "../src/trilhaAuditavel/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
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

export function trilhaAuditavelPlugin() {
  const dirStore = caminhoStoreAudit(REPO_ROOT);

  return {
    name: "ceo-trilha-auditavel",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url || !req.url.startsWith("/api/ceo/trilha")) {
          return next();
        }

        try {
          if (req.method === "POST" && req.url.startsWith("/api/ceo/trilha/eventos")) {
            const body = await lerJson(req);
            const evento = body && body.evento;
            if (!evento || typeof evento !== "object") {
              return enviarJson(res, 400, {
                ok: false,
                mensagem: "evento é obrigatório."
              });
            }
            const r = appendEvento(dirStore, evento);
            if (!r.ok) {
              const status =
                r.codigo === "duplicado_id" || r.codigo === "duplicado_hash"
                  ? 409
                  : 400;
              return enviarJson(res, status, r);
            }
            return enviarJson(res, 201, r);
          }

          if (req.method === "GET" && req.url.startsWith("/api/ceo/trilha/jobs/")) {
            const jobId = decodeURIComponent(
              req.url.replace(/^\/api\/ceo\/trilha\/jobs\//, "").split("?")[0]
            );
            const eventos = listarPorJob(dirStore, jobId);
            return enviarJson(res, 200, { ok: true, jobId, eventos });
          }

          if (req.method === "GET" && req.url.startsWith("/api/ceo/trilha/eventos")) {
            const eventos = listarEventos(dirStore, {});
            return enviarJson(res, 200, { ok: true, eventos });
          }

          return enviarJson(res, 404, {
            ok: false,
            mensagem: "Rota da Trilha não encontrada."
          });
        } catch (err) {
          return enviarJson(res, 500, {
            ok: false,
            mensagem: err && err.message ? err.message : "Erro na Trilha."
          });
        }
      });
    }
  };
}
