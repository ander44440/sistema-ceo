import { execSync } from "node:child_process";
import { defineConfig, loadEnv } from "vite";
import { ceoLlmPlugin } from "./server/ceoLlmPlugin.js";
import { executionQueuePlugin } from "./server/executionQueuePlugin.js";
import { onboardingPlugin } from "./server/onboardingPlugin.js";
import { orquestracaoPlugin } from "./server/orquestracaoPlugin.js";
import { trilhaAuditavelPlugin } from "./server/trilhaAuditavelPlugin.js";
import { historicoFisicoConversasPlugin } from "./server/historicoFisicoConversasPlugin.js";
import { lastroFactualCasoPlugin } from "./server/lastroFactualCasoPlugin.js";

/**
 * Commit real do build/runtime (Vercel / CI / git local). Sem texto fixo.
 * Ordem alinhada com server/src/versaoCommit.js (Railway).
 * @returns {string}
 */
function resolverCommitBuild() {
  const envSha =
    process.env.CEO_GIT_COMMIT ||
    process.env.VITE_CEO_GIT_COMMIT ||
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.RAILWAY_GIT_COMMIT_SHA ||
    process.env.CF_PAGES_COMMIT_SHA ||
    process.env.GITHUB_SHA ||
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

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const commit = resolverCommitBuild();
  return {
    root: ".",
    publicDir: "public",
    define: {
      "import.meta.env.VITE_CEO_GIT_COMMIT": JSON.stringify(commit)
    },
    plugins: [
      ceoLlmPlugin(env),
      executionQueuePlugin(),
      trilhaAuditavelPlugin(),
      historicoFisicoConversasPlugin(),
      lastroFactualCasoPlugin(),
      onboardingPlugin(),
      orquestracaoPlugin(env)
    ],
    server: {
      port: 5173,
      open: true
    },
    preview: {
      port: 4173
    },
    build: {
      outDir: "dist",
      emptyOutDir: true
    }
  };
});
