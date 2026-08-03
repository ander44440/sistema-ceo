import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Configuração do Backend de Produção (BP-001).
 * Porta: process.env.PORT (Railway) ou 8787 em local.
 */

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Carrega KEY=VALUE de ficheiros .env para process.env (sem sobrescrever já definidos).
 * Procura server/.env e app/.env — paridade local com o Vite.
 */
export function carregarEnvLocal() {
  const candidatos = [
    resolve(__dirname, '../../.env'),
    resolve(__dirname, '../../app/.env'),
  ];
  for (const caminho of candidatos) {
    if (!existsSync(caminho)) continue;
    const texto = readFileSync(caminho, 'utf8');
    for (const linha of texto.split(/\r?\n/)) {
      const t = linha.trim();
      if (!t || t.startsWith('#')) continue;
      const i = t.indexOf('=');
      if (i <= 0) continue;
      const chave = t.slice(0, i).trim();
      let valor = t.slice(i + 1).trim();
      if (
        (valor.startsWith('"') && valor.endsWith('"')) ||
        (valor.startsWith("'") && valor.endsWith("'"))
      ) {
        valor = valor.slice(1, -1);
      }
      if (process.env[chave] === undefined) {
        process.env[chave] = valor;
      }
    }
  }
}

/** Raiz do repo CEO (pai de executive/). Override: CEO_DATA_ROOT. */
export function resolverRepoRoot(env = process.env) {
  if (env.CEO_DATA_ROOT && String(env.CEO_DATA_ROOT).trim()) {
    return resolve(String(env.CEO_DATA_ROOT).trim());
  }
  return resolve(__dirname, '../..');
}

export function fromEnv(env = process.env) {
  const port = Number(env.PORT);
  return {
    port: Number.isFinite(port) && port > 0 ? port : 8787,
    repoRoot: resolverRepoRoot(env),
  };
}
