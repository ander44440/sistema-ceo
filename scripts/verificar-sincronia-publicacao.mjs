/**
 * Verificação de sincronia pós-publicação (somente leitura).
 *
 * Contrato: origin/main SHA === Vercel Production SHA === Railway Production SHA
 *           AND GET /health → HTTP 200
 *
 * Uso: node scripts/verificar-sincronia-publicacao.mjs
 *
 * Não altera Git (exceto fetch de refs remotas), não faz push/commit/merge,
 * não faz deploy/redeploy, não usa railway link.
 */

import { spawnSync } from "node:child_process";
import process from "node:process";

const REPO = "ander44440/sistema-ceo";
const RAILWAY_PROJECT = "674f6af3-17ac-44bd-8bb8-7f407a0f7b57";
const RAILWAY_SERVICE = "5d3da905-8ced-4429-8503-221d14f60e4f";
const RAILWAY_ENV = "production";
const HEALTH_URL = "https://ceo-api-production-43e6.up.railway.app/health";
const SHA_RE = /^[0-9a-f]{40}$/i;

/** @type {"ALINHADO"|"DESALINHADO"|"ERRO DE LEITURA"} */
let resultado = "ERRO DE LEITURA";
/** @type {string[]} */
const notas = [];

/**
 * @param {string} command
 * @param {string[]} args
 * @param {{ encoding?: BufferEncoding, maxBuffer?: number }} [opts]
 */
function run(command, args, opts = {}) {
  // Windows: só o shim `railway` (npm/.ps1) precisa de shell; gh/git com shell
  // partem URLs com `&` (ex. per_page=1).
  const useShell = process.platform === "win32" && command === "railway";
  const r = spawnSync(command, args, {
    encoding: "utf8",
    shell: useShell,
    maxBuffer: opts.maxBuffer ?? 10 * 1024 * 1024,
    ...opts
  });
  return {
    status: r.status,
    error: r.error,
    stdout: (r.stdout || "").trim(),
    stderr: (r.stderr || "").trim()
  };
}

/** @param {string} name */
function requireCli(name) {
  const r = run(name, ["--version"]);
  if (r.error || (r.status !== 0 && r.status !== null && !r.stdout)) {
    notas.push(`ERRO DE LEITURA: ${name} indisponível ou sem autenticação`);
    return false;
  }
  return true;
}

/**
 * @param {string} label
 * @param {() => string|null} fn
 * @returns {string|null}
 */
function readOrStop(label, fn) {
  try {
    const v = fn();
    if (v == null || v === "") {
      notas.push(`ERRO DE LEITURA: falha ao obter ${label}`);
      return null;
    }
    return v;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    notas.push(`ERRO DE LEITURA: falha ao obter ${label} (${msg})`);
    return null;
  }
}

function obterOriginMain() {
  const fetchR = run("git", ["fetch", "origin", "main"]);
  if (fetchR.error) {
    throw new Error(fetchR.error.message);
  }
  // fetch pode escrever em stderr mesmo com sucesso
  const rev = run("git", ["rev-parse", "origin/main"]);
  if (rev.status !== 0 || !rev.stdout) {
    throw new Error(rev.stderr || "rev-parse falhou");
  }
  const sha = rev.stdout.split(/\r?\n/)[0].trim();
  if (!SHA_RE.test(sha)) throw new Error(`SHA inválido: ${sha}`);
  return sha;
}

function obterVercelProduction() {
  const r = run("gh", [
    "api",
    `repos/${REPO}/deployments?environment=Production&per_page=1`,
    "--jq",
    ".[0].sha"
  ]);
  if (r.status !== 0 || !r.stdout) {
    throw new Error(r.stderr || "gh api falhou");
  }
  const sha = r.stdout.split(/\r?\n/)[0].trim();
  if (!SHA_RE.test(sha)) throw new Error(`SHA inválido: ${sha}`);
  return sha;
}

function obterRailwayProduction() {
  const r = run("railway", [
    "deployment",
    "list",
    "-p",
    RAILWAY_PROJECT,
    "-s",
    RAILWAY_SERVICE,
    "-e",
    RAILWAY_ENV,
    "--limit",
    "20",
    "--json"
  ]);
  if (r.status !== 0 || !r.stdout) {
    throw new Error(r.stderr || "railway deployment list falhou");
  }
  /** @type {Array<{ status?: string, meta?: { commitHash?: string } }>} */
  let list;
  try {
    list = JSON.parse(r.stdout);
  } catch {
    throw new Error("JSON Railway inválido");
  }
  if (!Array.isArray(list)) throw new Error("lista Railway inválida");
  const ok = list.find((d) => d && d.status === "SUCCESS");
  const sha = ok && ok.meta && ok.meta.commitHash;
  if (!sha || !SHA_RE.test(String(sha))) {
    throw new Error("nenhum SUCCESS com commitHash");
  }
  return String(sha);
}

/**
 * @returns {Promise<{ code: number|string, detail: string }>}
 */
async function obterHealth() {
  try {
    const res = await fetch(HEALTH_URL, {
      method: "GET",
      signal: AbortSignal.timeout(15000)
    });
    const text = (await res.text()).trim();
    const short =
      text.length > 120 ? `${text.slice(0, 117)}...` : text || "(vazio)";
    return { code: res.status, detail: short };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { code: "ERRO", detail: msg };
  }
}

function imprimirRelatorio(fields) {
  const lines = [
    "PUBLICAÇÃO — verificação de sincronia",
    `Data/hora: ${fields.dataHora}`,
    `origin/main: ${fields.main}`,
    `Vercel Production: ${fields.vercel}`,
    `Railway Production: ${fields.railway}`,
    `Railway /health: ${fields.health}`,
    `Resultado: ${fields.resultado}`,
    `Notas: ${fields.notas || ""}`
  ];
  process.stdout.write(lines.join("\n") + "\n");
}

async function main() {
  const dataHora = new Date().toISOString();

  let mainSha = "ERRO";
  let vercelSha = "ERRO";
  let railwaySha = "ERRO";
  let healthLine = "HTTP ERRO";

  if (!requireCli("git") || !requireCli("gh") || !requireCli("railway") || !requireCli("node")) {
    resultado = "ERRO DE LEITURA";
    imprimirRelatorio({
      dataHora,
      main: mainSha,
      vercel: vercelSha,
      railway: railwaySha,
      health: healthLine,
      resultado,
      notas: notas.join("; ")
    });
    process.exitCode = 1;
    return;
  }

  const m = readOrStop("origin/main", obterOriginMain);
  if (m == null) {
    resultado = "ERRO DE LEITURA";
    imprimirRelatorio({
      dataHora,
      main: mainSha,
      vercel: vercelSha,
      railway: railwaySha,
      health: healthLine,
      resultado,
      notas: notas.join("; ")
    });
    process.exitCode = 1;
    return;
  }
  mainSha = m;

  const v = readOrStop("Vercel Production SHA", obterVercelProduction);
  if (v == null) {
    resultado = "ERRO DE LEITURA";
    imprimirRelatorio({
      dataHora,
      main: mainSha,
      vercel: vercelSha,
      railway: railwaySha,
      health: healthLine,
      resultado,
      notas: notas.join("; ")
    });
    process.exitCode = 1;
    return;
  }
  vercelSha = v;

  const rw = readOrStop("Railway Production SHA", obterRailwayProduction);
  if (rw == null) {
    resultado = "ERRO DE LEITURA";
    imprimirRelatorio({
      dataHora,
      main: mainSha,
      vercel: vercelSha,
      railway: railwaySha,
      health: healthLine,
      resultado,
      notas: notas.join("; ")
    });
    process.exitCode = 1;
    return;
  }
  railwaySha = rw;

  const health = await obterHealth();
  healthLine = `HTTP ${health.code} ${health.detail}`;

  const shasIguais =
    SHA_RE.test(mainSha) &&
    mainSha === vercelSha &&
    vercelSha === railwaySha;
  const healthOk = health.code === 200;

  if (shasIguais && healthOk) {
    resultado = "ALINHADO";
    process.exitCode = 0;
  } else {
    resultado = "DESALINHADO";
    if (!shasIguais) {
      notas.push(
        `SHAs divergentes: main=${mainSha} vercel=${vercelSha} railway=${railwaySha}`
      );
    }
    if (!healthOk) {
      notas.push(`health não é HTTP 200 (obtido: ${health.code})`);
    }
    process.exitCode = 1;
  }

  imprimirRelatorio({
    dataHora,
    main: mainSha,
    vercel: vercelSha,
    railway: railwaySha,
    health: healthLine,
    resultado,
    notas: notas.join("; ")
  });
}

main().catch((e) => {
  const msg = e instanceof Error ? e.message : String(e);
  imprimirRelatorio({
    dataHora: new Date().toISOString(),
    main: "ERRO",
    vercel: "ERRO",
    railway: "ERRO",
    health: "HTTP ERRO",
    resultado: "ERRO DE LEITURA",
    notas: `ERRO DE LEITURA: ${msg}`
  });
  process.exitCode = 1;
});
