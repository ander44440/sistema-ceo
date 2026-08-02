/**
 * IMP-060 E4 — rotas Railway /api/ceo/queue/* despromovidas.
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createApp } from '../app.js';

test('E4-CA1: GET/POST/PATCH /api/ceo/queue/* → 410 FILA_MVP_LOCAL', async () => {
  const app = createApp({
    ...process.env,
    CEO_ALLOWED_ORIGIN: 'http://localhost:5173',
  });

  const casos = [
    { method: 'GET', path: '/api/ceo/queue/pending' },
    { method: 'GET', path: '/api/ceo/queue/jobs' },
    {
      method: 'POST',
      path: '/api/ceo/queue/jobs',
      body: { titulo: 'nao-deve-criar', descricao: 'E4' },
    },
    {
      method: 'PATCH',
      path: '/api/ceo/queue/jobs/JOB-000001',
      body: { estado: 'cancelled' },
    },
  ];

  for (const c of casos) {
    const init = { method: c.method, headers: { 'Content-Type': 'application/json' } };
    if (c.body) init.body = JSON.stringify(c.body);
    const resp = await app.request(c.path, init);
    assert.equal(resp.status, 410, `${c.method} ${c.path}`);
    const data = await resp.json();
    assert.equal(data.ok, false);
    assert.equal(data.codigo, 'FILA_MVP_LOCAL');
    assert.equal(data.filaOficial, 'executive/queue');
  }
});

test('E4-CA2: health BP-001 permanece operacional', async () => {
  const app = createApp(process.env);
  const resp = await app.request('/health');
  assert.equal(resp.status, 200);
  const data = await resp.json();
  assert.equal(data.ok, true);
});
