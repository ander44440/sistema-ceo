/**
 * Plugin Vite — ponte HTTP do HFC → JSONL em executive/historico-conversas/.
 * Distinto da Trilha Auditável (ARQ-087).
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  appendMensagem,
  caminhoStoreHfc,
  listarMensagensFisicas
} from "../src/historicoFisicoConversas/index.js";

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

export function historicoFisicoConversasPlugin() {
  const dirStore = caminhoStoreHfc(REPO_ROOT);

  return {
    name: "ceo-historico-fisico-conversas",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url || !req.url.startsWith("/api/ceo/historico-conversas")) {
          return next();
        }

        try {
          if (
            req.method === "POST" &&
            req.url.startsWith("/api/ceo/historico-conversas/mensagens")
          ) {
            const body = await lerJson(req);
            const evento = body && body.evento;
            if (!evento || typeof evento !== "object") {
              return enviarJson(res, 400, {
                ok: false,
                mensagem: "evento é obrigatório."
              });
            }
            const r = appendMensagem(dirStore, evento);
            if (!r.ok) {
              return enviarJson(res, 400, r);
            }
            return enviarJson(res, r.duplicado ? 200 : 201, r);
          }

          // IMP-089 Fatia 1 — leitura read-only por COA (consumo consulta; sem writers).
          if (
            req.method === "GET" &&
            req.url.startsWith("/api/ceo/historico-conversas/mensagens")
          ) {
            const u = new URL(req.url, "http://localhost");
            const coaId = u.searchParams.get("coaId");
            const mensagens = listarMensagensFisicas(
              dirStore,
              coaId ? { coaId } : {}
            );
            return enviarJson(res, 200, { ok: true, mensagens });
          }

          return enviarJson(res, 404, {
            ok: false,
            mensagem: "Rota do HFC não encontrada."
          });
        } catch (err) {
          return enviarJson(res, 500, {
            ok: false,
            mensagem: err && err.message ? err.message : "Erro no HFC."
          });
        }
      });
    }
  };
}
