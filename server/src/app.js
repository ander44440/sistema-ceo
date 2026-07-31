import { Hono } from 'hono';
import { registrarHealth } from './routes/health.js';
import { registrarLlm } from './routes/llm.js';
import { registrarQueue } from './routes/queue.js';
import { registrarOnboarding } from './routes/onboarding.js';
import { resolverRepoRoot } from './config.js';

/**
 * Cria a aplicação HTTP do Backend de Produção.
 * E5: /health + LLM + Fila + Onboarding (paridade dos plugins Vite).
 */
export function createApp(env = process.env) {
  const app = new Hono();
  const repoRoot = resolverRepoRoot(env);
  registrarHealth(app);
  registrarLlm(app, env);
  registrarQueue(app, { repoRoot });
  registrarOnboarding(app, { repoRoot });
  return app;
}
