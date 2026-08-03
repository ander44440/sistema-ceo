/**
 * GET /health — liveness do Backend de Produção (BP-001 E2).
 */

export function registrarHealth(app) {
  app.get('/health', (c) =>
    c.json({
      ok: true,
      service: 'ceo-api',
    }),
  );
}
