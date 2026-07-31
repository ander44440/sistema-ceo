import { serve } from '@hono/node-server';
import { createApp } from './app.js';
import { fromEnv } from './config.js';

const config = fromEnv();
const app = createApp();

serve(
  {
    fetch: app.fetch,
    port: config.port,
  },
  (info) => {
    console.log(`[ceo-api] listening on http://localhost:${info.port}`);
  },
);
