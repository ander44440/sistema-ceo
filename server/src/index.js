import { serve } from '@hono/node-server';
import { createApp } from './app.js';
import { carregarEnvLocal, fromEnv } from './config.js';
import { aplicarTlsInseguroSePedido } from './services/llm.js';

carregarEnvLocal();
aplicarTlsInseguroSePedido(process.env);

const config = fromEnv();
const app = createApp();

serve(
  {
    fetch: app.fetch,
    port: config.port,
  },
  (info) => {
    console.log(`[ceo-api] listening on http://localhost:${info.port}`);
    console.log(`[ceo-api] data root: ${config.repoRoot}`);
  },
);
