import { Hono } from 'hono';
import { registrarHealth } from './routes/health.js';
import { registrarLlm } from './routes/llm.js';

/**
 * Cria a aplicação HTTP do Backend de Produção.
 * E3: /health + LLM (/api/ceo/llm-status, /api/ceo/deliberar).
 * Fila e onboarding continuam nos plugins Vite.
 */
export function createApp(env = process.env) {
  const app = new Hono();
  registrarHealth(app);
  registrarLlm(app, env);
  return app;
}
