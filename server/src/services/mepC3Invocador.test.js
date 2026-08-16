/**
 * Invocador C3 interno — testes (sem produção, sem HTTP de escrita).
 */

import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, test } from 'node:test';
import { createApp } from '../app.js';
import { FICHEIRO_EVENTOS } from '../../../app/src/mepCeo/adapterFs.js';
import { listarPropostasC3 } from '../../../app/src/mepCeo/c3.js';
import {
  PATH_VISTA_C3,
  resetEstadoBootMepParaTestes,
  resolverDirectorioStoreMep,
} from './mepC3Vista.js';
import { executarActoC3 } from './mepC3Invocador.js';

const ACTO_OK = Object.freeze({
  papel: 'ceo_agente',
  tipoLacunaProduto: 'lacuna de governação de produto',
  objectoCandidato: 'MDL',
  enunciadoDesidentificado:
    'TESTE-CAP13: recorte mínimo visível da MEP no Centro.',
  evidenciaNaoPrivada: 'VAL-invocador-c3',
});

beforeEach(() => {
  resetEstadoBootMepParaTestes();
});

afterEach(() => {
  resetEstadoBootMepParaTestes();
});

function rootTemp() {
  return mkdtempSync(join(tmpdir(), 'mep-c3-inv-'));
}

function linhasLog(dir) {
  const p = join(dir, FICHEIRO_EVENTOS);
  if (!existsSync(p)) return [];
  return readFileSync(p, 'utf8')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
}

test('1) acto válido + confirmação → CONCEBIDO / origem C3', () => {
  const root = rootTemp();
  const r = executarActoC3(
    { acto: { ...ACTO_OK }, confirmacao: true, dryRun: false },
    { repoRoot: root },
  );
  assert.equal(r.ok, true, r.motivo);
  assert.equal(r.dryRun, false);
  assert.equal(r.maturidade, 'CONCEBIDO');
  assert.equal(r.origemCanal, 'C3');
  assert.equal(r.id.startsWith('MDL-'), true);
  assert.equal(r.tipoLacunaProduto, ACTO_OK.tipoLacunaProduto);
  assert.equal(listarPropostasC3().length, 1);
  assert.equal(listarPropostasC3()[0].id, r.id);
  assert.ok(linhasLog(resolverDirectorioStoreMep(root)).length >= 1);
});

test('2) dryRun=true → valida e não persiste', () => {
  const root = rootTemp();
  const dir = resolverDirectorioStoreMep(root);
  const r = executarActoC3(
    { acto: { ...ACTO_OK }, confirmacao: true, dryRun: true },
    { repoRoot: root },
  );
  assert.equal(r.ok, true, r.motivo);
  assert.equal(r.dryRun, true);
  assert.equal(r.maturidade, 'CONCEBIDO');
  assert.equal(r.origemCanal, 'C3');
  assert.equal(listarPropostasC3().length, 0);
  assert.equal(linhasLog(dir).length, 0);
});

test('3) confirmação ausente → recusa', () => {
  const root = rootTemp();
  const r = executarActoC3(
    { acto: { ...ACTO_OK }, dryRun: false },
    { repoRoot: root },
  );
  assert.equal(r.ok, false);
  assert.equal(r.motivo, 'confirmacao_obrigatoria');
  assert.equal(listarPropostasC3().length, 0);
});

test('4) confirmação falsa → recusa', () => {
  const root = rootTemp();
  const r = executarActoC3(
    { acto: { ...ACTO_OK }, confirmacao: false },
    { repoRoot: root },
  );
  assert.equal(r.ok, false);
  assert.equal(r.motivo, 'confirmacao_falsa');
});

test('5) campo extra → recusa', () => {
  const root = rootTemp();
  const rTopo = executarActoC3(
    {
      acto: { ...ACTO_OK },
      confirmacao: true,
      solicitante: 'ops',
    },
    { repoRoot: root },
  );
  assert.equal(rTopo.ok, false);
  assert.equal(rTopo.motivo, 'campos_nao_permitidos');

  const rActo = executarActoC3(
    {
      acto: { ...ACTO_OK, transcript: 'segredo' },
      confirmacao: true,
    },
    { repoRoot: root },
  );
  assert.equal(rActo.ok, false);
  assert.equal(rActo.motivo, 'campos_nao_permitidos');
  assert.equal(listarPropostasC3().length, 0);
});

test('6) payload privado/proibido → recusa', () => {
  const root = rootTemp();
  const r = executarActoC3(
    {
      acto: {
        ...ACTO_OK,
        enunciadoDesidentificado: 'Ver transcript da conversaId COA-1',
      },
      confirmacao: true,
    },
    { repoRoot: root },
  );
  assert.equal(r.ok, false);
  assert.ok(
    r.motivo === 'conteudo_proibido' || r.motivo === 'isolamento',
    r.motivo,
  );
  assert.equal(listarPropostasC3().length, 0);
  assert.equal(linhasLog(resolverDirectorioStoreMep(root)).length, 0);
});

test('7) objectoCandidato inválido → recusa', () => {
  const root = rootTemp();
  const r = executarActoC3(
    {
      acto: { ...ACTO_OK, objectoCandidato: 'DCP' },
      confirmacao: true,
    },
    { repoRoot: root },
  );
  assert.equal(r.ok, false);
  assert.equal(r.motivo, 'objecto_candidato_invalido');
});

test('8) falha de boot → fail-closed', () => {
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

  const r = executarActoC3(
    { acto: { ...ACTO_OK }, confirmacao: true },
    { repoRoot: root },
  );
  assert.equal(r.ok, false);
  assert.equal(r.motivo, 'boot_falhou');
  assert.equal(listarPropostasC3().length, 0);
});

test('9) resultado não expõe dados privados', () => {
  const root = rootTemp();
  const r = executarActoC3(
    { acto: { ...ACTO_OK }, confirmacao: true },
    { repoRoot: root },
  );
  assert.equal(r.ok, true);
  const keys = Object.keys(r).sort();
  assert.deepEqual(keys, [
    'dryRun',
    'enunciadoDesidentificado',
    'id',
    'maturidade',
    'ok',
    'origemCanal',
    'tipoLacunaProduto',
  ]);
  const raw = JSON.stringify(r);
  assert.equal(/transcript|"payload"|objecto|evento|cliente/i.test(raw), false);
});

test('10) GET C3 continua intacto após invocador', async () => {
  const root = rootTemp();
  const criado = executarActoC3(
    { acto: { ...ACTO_OK }, confirmacao: true },
    { repoRoot: root },
  );
  assert.equal(criado.ok, true);
  resetEstadoBootMepParaTestes();

  const res = await createApp({ CEO_DATA_ROOT: root }).request(PATH_VISTA_C3);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.length, 1);
  assert.deepEqual(Object.keys(body[0]).sort(), [
    'enunciadoDesidentificado',
    'id',
    'maturidade',
    'tipoLacunaProduto',
  ]);
  assert.equal(body[0].id, criado.id);
  assert.equal(body[0].maturidade, 'CONCEBIDO');
  assert.equal('origemCanal' in body[0], false);
  assert.equal('payload' in body[0], false);

  const post = await createApp({ CEO_DATA_ROOT: root }).request(PATH_VISTA_C3, {
    method: 'POST',
  });
  assert.ok(post.status === 404 || post.status === 405);
});
