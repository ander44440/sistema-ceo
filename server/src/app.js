import { Hono } from 'hono';
import { registrarCors } from './middleware/cors.js';
import { registrarHealth } from './routes/health.js';
import { registrarLlm } from './routes/llm.js';
import { registrarCto } from './routes/cto.js';
import { registrarQueue } from './routes/queue.js';
import { registrarOnboarding } from './routes/onboarding.js';
import { registrarOrquestracao } from './routes/orquestracao.js';
import { resolverRepoRoot } from './config.js';

/**
 * Cria a aplicação HTTP do Backend de Produção.
 * E10: CORS via CEO_ALLOWED_ORIGIN (rotas inalteradas).
 */
export function createApp(env = process.env) {
  const app = new Hono();
  const repoRoot = resolverRepoRoot(env);
  registrarCors(app, env);
  registrarHealth(app);
  registrarLlm(app, env);
  registrarCto(app, env);
  registrarQueue(app, { repoRoot });
  registrarOnboarding(app, { repoRoot });
  registrarOrquestracao(app, env);
  return app;
}
