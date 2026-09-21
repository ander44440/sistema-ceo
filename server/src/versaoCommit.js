/**
 * Commit real em execução (build/runtime) — espelho da resolução do Vite.
 * Sem SHA fixo. Em Railway (Root Directory = server) não há partilha com app/.
 */

import { execSync } from "node:child_process";

/**
 * @param {NodeJS.ProcessEnv} [env]
 * @returns {string} short SHA (7) ou ""
 */
export function resolverCommitEmExecucao(env = process.env) {
  const envSha =
    env.CEO_GIT_COMMIT ||
    env.VITE_CEO_GIT_COMMIT ||
    env.VERCEL_GIT_COMMIT_SHA ||
    env.RAILWAY_GIT_COMMIT_SHA ||
    env.CF_PAGES_COMMIT_SHA ||
    env.GITHUB_SHA ||
    "";
  if (String(envSha).trim()) {
    return String(envSha).trim().slice(0, 7);
  }
  try {
    return execSync("git rev-parse --short HEAD", {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"]
    }).trim();
  } catch {
    return "";
  }
}
