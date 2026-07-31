import { Hono } from 'hono';
import { registrarHealth } from './routes/health.js';

/**
 * Cria a aplicação HTTP do Backend de Produção.
 * E2: apenas GET /health — rotas /api/ceo/* ficam para etapas posteriores.
 */
export function createApp() {
  const app = new Hono();
  registrarHealth(app);
  return app;
}
