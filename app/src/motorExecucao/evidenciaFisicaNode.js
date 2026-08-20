/**
 * Etapa 9-B — adaptação Node para observação de evidência física.
 * Só deve ser importado em Dispatcher / testes Node (não no ciclo de vida puro).
 */

import fs from "node:fs";
import path from "node:path";
import { MAX_BYTES_LEITURA_EVIDENCIA } from "./evidenciaFisica.js";
import { candidatosRepoMg2 } from "../camadaConhecimento/manifestoMg2.js";

/**
 * I/O injectável baseado em node:fs (leitura controlada).
 * @returns {import("./evidenciaFisica.js").IoEvidenciaArquivo}
 */
export function criarIoFsNode() {
  return {
    exists(p) {
      return fs.existsSync(p);
    },
    stat(p) {
      const s = fs.statSync(p);
      return {
        isFile: s.isFile(),
        isDirectory: s.isDirectory(),
        size: s.size
      };
    },
    realpath(p) {
      return fs.realpathSync(p);
    },
    readFile(p, maxBytes) {
      const lim = maxBytes ?? MAX_BYTES_LEITURA_EVIDENCIA;
      const fd = fs.openSync(p, "r");
      try {
        const st = fs.fstatSync(fd);
        if (st.size > lim) {
          return { ok: false, motivo: "leitura_excedida", bytes: st.size };
        }
        const buf = Buffer.alloc(st.size);
        fs.readSync(fd, buf, 0, st.size, 0);
        return {
          ok: true,
          conteudo: buf.toString("utf8"),
          bytes: st.size
        };
      } finally {
        fs.closeSync(fd);
      }
    }
  };
}

/**
 * Roots permitidos mínimos: CEO_REPO_ROOT + MG2 (env / candidatos) quando aplicável.
 * @param {{
 *   ceoRepoRoot?: string|null,
 *   mg2RepoRoot?: string|null,
 *   projetoId?: string|null,
 *   env?: Record<string, string|undefined>
 * }} opts
 * @returns {string[]}
 */
export function rootsPermitidosDoContexto(opts = {}) {
  const env = opts.env || process.env;
  /** @type {string[]} */
  const roots = [];
  const ceo = String(opts.ceoRepoRoot || env.CEO_REPO_ROOT || "").trim();
  if (ceo) roots.push(path.resolve(ceo));

  const projeto = String(opts.projetoId || "").trim().toLowerCase();
  const mg2Env = String(
    opts.mg2RepoRoot || env.CEO_MG2_REPO || env.MG2_REPO_ROOT || ""
  ).trim();

  const precisaMg2 =
    Boolean(mg2Env) ||
    projeto === "prj-mg2" ||
    projeto === "coa-mg2" ||
    projeto === "mg2";

  if (precisaMg2) {
    for (const c of candidatosRepoMg2(mg2Env || undefined)) {
      const r = path.resolve(c);
      if (fs.existsSync(r) && !roots.includes(r)) roots.push(r);
    }
  }

  return roots;
}

/**
 * Opções de verificação para Dispatcher / fila Node.
 * @param {{ repoRoot: string, projetoId?: string|null }} ctx
 */
export function optsVerificacaoEvidenciaFisica(ctx) {
  return {
    rootsPermitidos: rootsPermitidosDoContexto({
      ceoRepoRoot: ctx.repoRoot,
      projetoId: ctx.projetoId
    }),
    fsIo: criarIoFsNode(),
    pathApi: path
  };
}
