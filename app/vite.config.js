import { defineConfig, loadEnv } from "vite";
import { ceoLlmPlugin } from "./server/ceoLlmPlugin.js";
import { executionQueuePlugin } from "./server/executionQueuePlugin.js";
import { onboardingPlugin } from "./server/onboardingPlugin.js";
import { orquestracaoPlugin } from "./server/orquestracaoPlugin.js";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    root: ".",
    publicDir: "public",
    plugins: [
      ceoLlmPlugin(env),
      executionQueuePlugin(),
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
