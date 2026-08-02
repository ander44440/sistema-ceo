/**
 * Rotas `/api/ceo/queue/*` no Backend de Produção (Railway) — IMP-060 E4.
 *
 * Despromovidas: a fila oficial do MVP é `executive/queue/` no PC (REQ-045/060).
 * Estas rotas respondem 410 e NÃO lêem/escrevem Jobs como fonte de verdade.
 * BP-001 permanece para LLM, CTO, health, heartbeat, onboarding, etc.
 */

const MENSAGEM_DESPROMOVIDA =
  'Fila Railway despromovida (IMP-060 E4 / ARQ-021). ' +
  'Ciclo oficial de Jobs: executive/queue/ no PC via API local (Vite/companion). ' +
  'BP-001 continua para LLM e serviços online — não para a fila MVP.';

const CORPO = Object.freeze({
  ok: false,
  codigo: 'FILA_MVP_LOCAL',
  mensagem: MENSAGEM_DESPROMOVIDA,
  filaOficial: 'executive/queue',
  norma: ['ARQ-021', 'REQ-060', 'IMP-060-E4']
});

/**
 * @param {import('hono').Hono} app
 * @param {{ repoRoot?: string }} [_opts] — ignorado; sem acesso à fila remota
 */
export function registrarQueue(app, _opts = {}) {
  const rejeitar = (c) => c.json(CORPO, 410);

  app.get('/api/ceo/queue/pending', rejeitar);
  app.get('/api/ceo/queue/jobs', rejeitar);
  app.post('/api/ceo/queue/jobs', rejeitar);
  app.patch('/api/ceo/queue/jobs/:id', rejeitar);
}

export const FILA_RAILWAY_DESPROMOVIDA = CORPO;
