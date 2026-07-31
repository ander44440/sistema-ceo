import { Hono } from 'hono';
import { registrarHealth } from './routes/health.js';
import { registrarLlm } from './routes/llm.js';
import { registrarQueue } from './routes/queue.js';
import { resolverRepoRoot } from './config.js';

/**
 * Cria a aplicação HTTP do Backend de Produção.
 * E4: /health + LLM + Fila. Onboarding continua no plugin Vite.
 */
export function createApp(env = process.env) {
  const app = new Hono();
  const repoRoot = resolverRepoRoot(env);
  registrarHealth(app);
  registrarLlm(app, env);
  registrarQueue(app, { repoRoot });
  return app;
}
