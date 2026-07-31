/**
 * Rotas de onboarding — paridade com app/server/onboardingPlugin.js (BP-001 E5).
 * GET  /api/ceo/onboarding/carregar
 * POST /api/ceo/onboarding/salvar
 */

import { criarOnboardingStore } from '../services/onboarding.js';

export function registrarOnboarding(app, { repoRoot }) {
  const store = criarOnboardingStore(repoRoot);

  app.get('/api/ceo/onboarding/carregar', (c) => {
    try {
      const data = store.carregar();
      return c.json({
        ok: true,
        perfil: data.perfil,
        transcricao: data.transcricao,
      });
    } catch (err) {
      return c.json(
        { ok: false, mensagem: err?.message || 'Erro onboarding' },
        500,
      );
    }
  });

  app.post('/api/ceo/onboarding/salvar', async (c) => {
    try {
      const body = await c.req.json().catch(() => ({}));
      store.salvar({
        perfil: body.perfil,
        transcricao: body.transcricao,
      });
      return c.json({ ok: true });
    } catch (err) {
      return c.json(
        { ok: false, mensagem: err?.message || 'Erro onboarding' },
        500,
      );
    }
  });
}
