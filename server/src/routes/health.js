/**
 * GET /health — liveness do Backend de Produção (BP-001 E2).
 * Campo `commit` (opcional): identificação da versão em execução (mesmo critério da UI).
 */

import { resolverCommitEmExecucao } from '../versaoCommit.js';

export function registrarHealth(app, env = process.env) {
  app.get('/health', (c) => {
    const body = {
      ok: true,
      service: 'ceo-api',
    };
    const commit = resolverCommitEmExecucao(env);
    if (commit) {
      body.commit = commit;
    }
    return c.json(body);
  });
}
