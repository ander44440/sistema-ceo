/**
 * Plugin Vite — persistência JSON do onboarding (REQ-046).
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..", "..");
const DIR = path.join(REPO_ROOT, "executive", "onboarding");

function garantir() {
  fs.mkdirSync(DIR, { recursive: true });
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

function enviar(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

export function onboardingPlugin() {
  return {
    name: "ceo-onboarding",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url || !req.url.startsWith("/api/ceo/onboarding")) {
          return next();
        }
        try {
          garantir();
          if (req.method === "GET" && req.url.startsWith("/api/ceo/onboarding/carregar")) {
            const perfilPath = path.join(DIR, "perfil.json");
            const transPath = path.join(DIR, "transcricao.json");
            let perfil = null;
            let transcricao = [];
            if (fs.existsSync(perfilPath)) {
              perfil = JSON.parse(fs.readFileSync(perfilPath, "utf8"));
            }
            if (fs.existsSync(transPath)) {
              transcricao = JSON.parse(fs.readFileSync(transPath, "utf8"));
            }
            return enviar(res, 200, { ok: true, perfil, transcricao });
          }
          if (req.method === "POST" && req.url.startsWith("/api/ceo/onboarding/salvar")) {
            const body = await lerJson(req);
            if (body.perfil) {
              fs.writeFileSync(
                path.join(DIR, "perfil.json"),
                JSON.stringify(body.perfil, null, 2) + "\n",
                "utf8"
              );
            }
            if (body.transcricao) {
              fs.writeFileSync(
                path.join(DIR, "transcricao.json"),
                JSON.stringify(body.transcricao, null, 2) + "\n",
                "utf8"
              );
            }
            return enviar(res, 200, { ok: true });
          }
          return enviar(res, 404, { ok: false, mensagem: "Rota onboarding não encontrada." });
        } catch (err) {
          return enviar(res, 500, {
            ok: false,
            mensagem: err?.message || "Erro onboarding"
          });
        }
      });
    }
  };
}
