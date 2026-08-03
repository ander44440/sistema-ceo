/**
 * Smoke HTTP snapshot + SSE — paridade server (IMP-055 E2/E5).
 */

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createApp } from '../app.js';
import { PATH_SNAPSHOT } from '../services/orquestracao/agregador.js';
import { PATH_STREAM } from '../services/orquestracao/streamContrato.js';
import { NOS_V1 } from '../services/orquestracao/dominio.js';

test('E2-CA1/CA2: GET snapshot 200 com 6 IDs (server)', async () => {
  const app = createApp({});
  const res = await app.request(PATH_SNAPSHOT);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.ok, true);
  assert.equal(body.nos.length, 6);
  const ids = body.nos.map((n) => n.id).sort();
  assert.deepEqual(ids, [...NOS_V1].sort());
  assert.equal(PATH_SNAPSHOT, '/api/ceo/orquestracao/snapshot');
});

test('E5-CA3: GET stream SSE devolve text/event-stream + snapshot', async () => {
  const app = createApp({});
  const ac = new AbortController();
  const res = await app.request(PATH_STREAM, { signal: ac.signal });
  assert.equal(res.status, 200);
  assert.match(String(res.headers.get('content-type') || ''), /text\/event-stream/);
  assert.equal(PATH_STREAM, '/api/ceo/orquestracao/stream');

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = '';
  const limite = Date.now() + 3000;
  while (Date.now() < limite) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    if (buf.includes('event: snapshot') && buf.includes('"tipo":"snapshot"')) {
      ac.abort();
      try {
        await reader.cancel();
      } catch {
        /* ignore */
      }
      break;
    }
  }
  assert.match(buf, /event: snapshot/);
  assert.match(buf, /"tipo":"snapshot"/);
  assert.match(buf, /"nos"/);
});

test('E6: POST heartbeat inválido → 400; válido → 200', async () => {
  const app = createApp({});
  const bad = await app.request('/api/ceo/orquestracao/heartbeat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: 'null',
  });
  assert.equal(bad.status, 400);

  const ok = await app.request('/api/ceo/orquestracao/heartbeat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ estado: 'idle', pending: 0, origem: 'teste' }),
  });
  assert.equal(ok.status, 200);
  const body = await ok.json();
  assert.equal(body.ok, true);
  assert.ok(body.heartbeat && body.heartbeat.em);
});
