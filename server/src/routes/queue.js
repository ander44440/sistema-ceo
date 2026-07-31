/**
 * Rotas da Fila de Execução — paridade com app/server/executionQueuePlugin.js (BP-001 E4).
 * GET   /api/ceo/queue/pending
 * GET   /api/ceo/queue/jobs
 * POST  /api/ceo/queue/jobs
 * PATCH /api/ceo/queue/jobs/:id
 */

import { criarFilaExecucao } from '../services/executionQueue.js';

export function registrarQueue(app, { repoRoot }) {
  const fila = criarFilaExecucao(repoRoot);

  app.get('/api/ceo/queue/pending', (c) => {
    try {
      const jobs = fila.listarPendentes();
      return c.json({ ok: true, jobs, pasta: fila.queueDir });
    } catch (err) {
      return c.json(
        { ok: false, mensagem: err?.message || 'Erro na fila.' },
        500,
      );
    }
  });

  app.get('/api/ceo/queue/jobs', (c) => {
    try {
      const jobs = fila.listarPorEstado(null);
      return c.json({ ok: true, jobs });
    } catch (err) {
      return c.json(
        { ok: false, mensagem: err?.message || 'Erro na fila.' },
        500,
      );
    }
  });

  app.post('/api/ceo/queue/jobs', async (c) => {
    try {
      const body = await c.req.json().catch(() => null);
      if (!body || (!body.titulo && !body.descricao)) {
        return c.json(
          { ok: false, mensagem: 'titulo ou descricao é obrigatório.' },
          400,
        );
      }
      const job = fila.publicar(body);
      return c.json({ ok: true, job }, 201);
    } catch (err) {
      return c.json(
        { ok: false, mensagem: err?.message || 'Erro na fila.' },
        500,
      );
    }
  });

  app.patch('/api/ceo/queue/jobs/:id', async (c) => {
    try {
      const id = decodeURIComponent(c.req.param('id'));
      const body = await c.req.json().catch(() => null);
      if (!body || !body.estado) {
        return c.json({ ok: false, mensagem: 'estado é obrigatório.' }, 400);
      }
      const job = fila.atualizarEstado(id, body.estado, {
        resultado: body.resultado,
      });
      return c.json({ ok: true, job });
    } catch (err) {
      return c.json(
        { ok: false, mensagem: err?.message || 'Erro na fila.' },
        500,
      );
    }
  });
}
