/**
 * Plugin Vite — ponte HTTP do LFC → FS executive/lastro-factual-casos/.
 * Desacoplada de HFC / MO / CSC (ARQ-092 / IMP-092.1).
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  caminhoStoreLfc,
  criarLfcStore,
  criarLfcWriter,
  criarLfcReader,
  ORIGEM_UTILIZADOR
} from "../src/lastroFactualCaso/index.js";
import {
  appendEvento,
  caminhoStoreAudit
} from "../src/trilhaAuditavel/index.js";
import { configurarAdaptadorTrilhaLocal } from "../src/trilhaAuditavel/emissor.js";

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

export function lastroFactualCasoPlugin() {
  const dirLfc = caminhoStoreLfc(REPO_ROOT);
  const store = criarLfcStore(dirLfc);
  const dirAudit = caminhoStoreAudit(REPO_ROOT);

  return {
    name: "ceo-lastro-factual-caso",
    configureServer(server) {
      configurarAdaptadorTrilhaLocal((evento) => appendEvento(dirAudit, evento));
      const writer = criarLfcWriter(store, { superficie: "ponte_http" });
      const reader = criarLfcReader(store);

      server.middlewares.use(async (req, res, next) => {
        if (!req.url || !req.url.startsWith("/api/ceo/lfc")) {
          return next();
        }

        try {
          if (req.method === "POST" && req.url.startsWith("/api/ceo/lfc/writer")) {
            const body = await lerJson(req);
            const op = String(body?.op || "").trim();
            const cmd = { ...(body?.cmd || {}), origem: ORIGEM_UTILIZADOR };
            /** @type {Record<string, Function>} */
            const mapa = {
              criarCaso: writer.criarCaso,
              acrescentarFactos: writer.acrescentarFactos,
              corrigirFacto: writer.corrigirFacto,
              anularFacto: writer.anularFacto,
              arquivarCaso: writer.arquivarCaso,
              excluirCaso: writer.excluirCaso,
              excluirCasoHard: writer.excluirCasoHard
            };
            const fn = mapa[op];
            if (!fn) {
              return enviarJson(res, 400, {
                ok: false,
                codigo: "op_desconhecida",
                mensagem: `Operação não suportada: ${op}`
              });
            }
            const r = fn.call(writer, cmd);
            return enviarJson(res, r.ok ? 200 : 400, r);
          }

          if (req.method === "POST" && req.url.startsWith("/api/ceo/lfc/reader")) {
            const body = await lerJson(req);
            const op = String(body?.op || "").trim();
            const args = body?.args || {};
            /** @type {Record<string, Function>} */
            const mapa = {
              obterCaso: () => reader.obterCaso(args.coaId, args.casoId, args.opts),
              listarCasosDoCoa: () => reader.listarCasosDoCoa(args.coaId, args.opts),
              obterCasoActivo: () => reader.obterCasoActivo(args.coaId),
              resolverCaso: () => reader.resolverCaso(args.coaId, args.cmd),
              listarFactosActivos: () =>
                reader.listarFactosActivos(args.coaId, args.casoId),
              obterFactoActivo: () =>
                reader.obterFactoActivo(args.coaId, args.casoId, args.cmd)
            };
            const fn = mapa[op];
            if (!fn) {
              return enviarJson(res, 400, {
                ok: false,
                codigo: "op_desconhecida",
                mensagem: `Operação Reader não suportada: ${op}`
              });
            }
            const r = fn();
            return enviarJson(res, r.ok === false ? 400 : 200, r);
          }

          return enviarJson(res, 404, { ok: false, mensagem: "Rota LFC desconhecida." });
        } catch (err) {
          return enviarJson(res, 500, {
            ok: false,
            mensagem: err instanceof Error ? err.message : String(err)
          });
        }
      });
    }
  };
}
