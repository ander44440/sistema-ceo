/**
 * ARQ-033 v1.2 — Transporte GET da vista C3 (só leitura).
 */

import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, test } from 'node:test';
import { createApp } from '../app.js';
import { proporEvolucaoDesidentificada } from '../../../app/src/mepCeo/c3.js';
import {
  criarObjecto,
  inicializarPersistenciaFisica,
  promoverMaturidade,
} from '../../../app/src/mepCeo/registo.js';
import {
  PATH_VISTA_C3,
  resetEstadoBootMepParaTestes,
  resolverDirectorioStoreMep,
} from '../services/mepC3Vista.js';

const ACTO_OK = Object.freeze({
  papel: 'ceo_agente',
  tipoLacunaProduto: 'lacuna de governação de produto',
  objectoCandidato: 'MDL',
  enunciadoDesidentificado: 'O produto precisa de um recorte mínimo visível da MEP.',
  evidenciaNaoPrivada: 'VAL-transporte',
});

beforeEach(() => {
  resetEstadoBootMepParaTestes();
});

afterEach(() => {
  resetEstadoBootMepParaTestes();
});

function rootTemp() {
  return mkdtempSync(join(tmpdir(), 'mep-c3-vista-'));
}

test('resolverDirectorioStoreMep: CEO_DATA_ROOT/mep-ceo/store', () => {
  assert.equal(
    resolverDirectorioStoreMep('/data'),
    join('/data', 'mep-ceo', 'store'),
  );
});

test('1) GET sem store prévio → [] (primeiro boot vazio)', async () => {
  const root = rootTemp();
  const app = createApp({ CEO_DATA_ROOT: root });
  const res = await app.request(PATH_VISTA_C3);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.deepEqual(body, []);
});

test('2) GET com store vazio → []', async () => {
  const root = rootTemp();
  const dir = resolverDirectorioStoreMep(root);
  const boot = inicializarPersistenciaFisica(dir);
  assert.equal(boot.ok, true);
  resetEstadoBootMepParaTestes();
  const app = createApp({ CEO_DATA_ROOT: root });
  const res = await app.request(PATH_VISTA_C3);
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), []);
});

test('3) GET com proposta C3 CONCEBIDO → só quatro campos', async () => {
  const root = rootTemp();
  const dir = resolverDirectorioStoreMep(root);
  assert.equal(inicializarPersistenciaFisica(dir).ok, true);
  const criado = proporEvolucaoDesidentificada({ ...ACTO_OK });
  assert.equal(criado.ok, true);
  resetEstadoBootMepParaTestes();

  const app = createApp({ CEO_DATA_ROOT: root });
  const res = await app.request(PATH_VISTA_C3);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.length, 1);
  assert.deepEqual(Object.keys(body[0]).sort(), [
    'enunciadoDesidentificado',
    'id',
    'maturidade',
    'tipoLacunaProduto',
  ]);
  assert.equal(body[0].id, criado.objecto.id);
  assert.equal(body[0].maturidade, 'CONCEBIDO');
  assert.equal(body[0].tipoLacunaProduto, ACTO_OK.tipoLacunaProduto);
  assert.equal(
    body[0].enunciadoDesidentificado,
    ACTO_OK.enunciadoDesidentificado,
  );
  assert.equal('origemCanal' in body[0], false);
  assert.equal('payload' in body[0], false);
  assert.equal('transcript' in body[0], false);
});

test('4) proposta não-C3 → não aparece', async () => {
  const root = rootTemp();
  const dir = resolverDirectorioStoreMep(root);
  assert.equal(inicializarPersistenciaFisica(dir).ok, true);
  const interno = criarObjecto({
    tipo: 'MDL',
    titulo: 'Módulo interno sem C3',
    papel: 'ceo_agente',
    lacunaEvidencia: 'lab-transporte',
  });
  assert.equal(interno.ok, true, interno.motivo);
  assert.equal(proporEvolucaoDesidentificada({ ...ACTO_OK }).ok, true);
  resetEstadoBootMepParaTestes();

  const body = await (
    await createApp({ CEO_DATA_ROOT: root }).request(PATH_VISTA_C3)
  ).json();
  assert.equal(body.length, 1);
  assert.equal(body[0].id.startsWith('MDL-'), true);
  assert.equal(
    body.every((p) => p.enunciadoDesidentificado.includes('recorte mínimo')),
    true,
  );
});

test('5) maturidade diferente de CONCEBIDO → não aparece', async () => {
  const root = rootTemp();
  const dir = resolverDirectorioStoreMep(root);
  assert.equal(inicializarPersistenciaFisica(dir).ok, true);
  const r = proporEvolucaoDesidentificada({
    ...ACTO_OK,
    objectoCandidato: 'EPC',
  });
  assert.equal(r.ok, true);
  const promo = promoverMaturidade(r.objecto.id, 'DEFINIDO', {
    papel: ['cto', 'usuario'],
    evidencia: { tipo: 'ARQ', referencia: 'ARQ-033' },
  });
  assert.equal(promo.ok, true);
  resetEstadoBootMepParaTestes();

  const body = await (
    await createApp({ CEO_DATA_ROOT: root }).request(PATH_VISTA_C3)
  ).json();
  assert.equal(body.length, 0);
});

test('6) campos privados / transcript nunca no JSON', async () => {
  const root = rootTemp();
  const dir = resolverDirectorioStoreMep(root);
  assert.equal(inicializarPersistenciaFisica(dir).ok, true);
  assert.equal(proporEvolucaoDesidentificada({ ...ACTO_OK }).ok, true);
  resetEstadoBootMepParaTestes();
  const raw = await (
    await createApp({ CEO_DATA_ROOT: root }).request(PATH_VISTA_C3)
  ).text();
  assert.equal(/transcript|origemCanal|"payload"|cliente|conversa/i.test(raw), false);
});

test('7) falha de boot/persistência → []', async () => {
  const root = rootTemp();
  const dir = resolverDirectorioStoreMep(root);
  mkdirSync(dir, { recursive: true });
  writeFileSync(
    join(dir, 'manifesto.json'),
    JSON.stringify({
      schemaVersion: 1,
      eixo: 'produto',
      produtoCanonico: 'CEO',
      capacidadeDona: 'CAP-13',
      contaminacao: 'cliente-xyz',
    }),
    'utf8',
  );
  writeFileSync(join(dir, 'eventos.jsonl'), '', 'utf8');
  resetEstadoBootMepParaTestes();
  const res = await createApp({ CEO_DATA_ROOT: root }).request(PATH_VISTA_C3);
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), []);
});

test('rota é GET; path canónico', async () => {
  assert.equal(PATH_VISTA_C3, '/api/ceo/mep/c3/propostas');
  const app = createApp({ CEO_DATA_ROOT: rootTemp() });
  const post = await app.request(PATH_VISTA_C3, { method: 'POST' });
  assert.ok(post.status === 404 || post.status === 405);
});
