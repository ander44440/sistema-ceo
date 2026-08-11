/**
 * Fila de Execução V1 — persistência em ficheiros JSON (REQ-045 + P0-2).
 * Cópia operacional de app/server/executionQueue.js (BP-001 E4).
 * COMPLETED só após verificação (estado result → completed).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Resolve domínio/ciclo a partir do monorepo (app/). */
function carregarCicloVida() {
  const candidatos = [
    path.resolve(__dirname, '../../../app/src/motorExecucao/dominio.js'),
    path.resolve(__dirname, '../../../../app/src/motorExecucao/dominio.js'),
  ];
  // Dynamic import path for ESM — use absolute file URL via known monorepo layout
  const repoApp = path.resolve(__dirname, '../../../app/src/motorExecucao');
  return {
    dominioUrl: pathToFileUrl(path.join(repoApp, 'dominio.js')),
    cicloUrl: pathToFileUrl(path.join(repoApp, 'cicloVidaJob.js')),
  };
}

function pathToFileUrl(p) {
  const normalized = path.resolve(p).replace(/\\/g, '/');
  return normalized.startsWith('/')
    ? `file://${normalized}`
    : `file:///${normalized}`;
}

const ESTADOS = new Set([
  'pending',
  'dispatched',
  'running',
  'result',
  'needs_correction',
  'completed',
  'failed',
  'cancelled',
]);

const TRANSICOES = {
  pending: ['dispatched', 'running', 'cancelled'],
  dispatched: ['running', 'failed', 'cancelled'],
  running: ['result', 'failed', 'cancelled'],
  result: ['completed', 'needs_correction', 'failed', 'cancelled'],
  needs_correction: ['running', 'failed', 'cancelled'],
  completed: [],
  failed: [],
  cancelled: [],
};

function validarTransicaoLocal(de, para) {
  if (!ESTADOS.has(de) || !ESTADOS.has(para)) {
    return { ok: false, mensagem: `Estado inválido: ${de} → ${para}` };
  }
  if (!TRANSICOES[de].includes(para)) {
    return { ok: false, mensagem: `Transição de Job ilegal: ${de} → ${para}.` };
  }
  return { ok: true };
}

function anexarHistorico(job, de, para, meta = {}) {
  const hist = Array.isArray(job.historicoCiclo) ? [...job.historicoCiclo] : [];
  hist.push({
    em: meta.em || new Date().toISOString(),
    de,
    para,
    motivo: meta.motivo || null,
    actor: meta.actor || null,
  });
  return hist;
}

/** Remove BOM UTF-8 se presente — não altera o ficheiro em disco. */
function textoSemBom(raw) {
  const s = String(raw ?? '');
  return s.charCodeAt(0) === 0xfeff ? s.slice(1) : s;
}

/**
 * @param {string} rootDir — raiz do repo CEO (pai de executive/)
 */
export function criarFilaExecucao(rootDir) {
  const queueDir = path.join(rootDir, 'executive', 'queue');

  function garantirDir() {
    fs.mkdirSync(queueDir, { recursive: true });
  }

  function caminhoJob(id) {
    return path.join(queueDir, `${id}.json`);
  }

  function listarFicheirosJob() {
    garantirDir();
    return fs
      .readdirSync(queueDir)
      .filter((f) => /^JOB-\d+\.json$/i.test(f))
      .sort();
  }

  function lerJob(id) {
    const p = caminhoJob(id);
    if (!fs.existsSync(p)) return null;
    return JSON.parse(textoSemBom(fs.readFileSync(p, 'utf8')));
  }

  function escreverJob(job) {
    garantirDir();
    const p = caminhoJob(job.id);
    fs.writeFileSync(p, JSON.stringify(job, null, 2) + '\n', 'utf8');
    return job;
  }

  function proximoId() {
    const nums = listarFicheirosJob().map((f) => {
      const m = f.match(/JOB-(\d+)/i);
      return m ? Number(m[1]) : 0;
    });
    const n = (nums.length ? Math.max(...nums) : 0) + 1;
    return `JOB-${String(n).padStart(6, '0')}`;
  }

  function atualizarProximoMd(pending) {
    garantirDir();
    const alvo = path.join(queueDir, 'PROXIMO.md');
    if (!pending.length) {
      fs.writeFileSync(
        alvo,
        [
          '# Próximo Job',
          '',
          '_Nenhum Job `pending` na fila._',
          '',
          'Quando o CEO publicar um Job, este ficheiro será atualizado.',
          '',
        ].join('\n'),
        'utf8',
      );
      return;
    }
    const j = pending[0];
    fs.writeFileSync(
      alvo,
      [
        '# Próximo Job (pending)',
        '',
        `- **id:** \`${j.id}\``,
        `- **projeto:** ${j.projeto || '(n/d)'}`,
        `- **tipo:** ${j.tipo || 'execucao'}`,
        `- **prioridade:** ${j.prioridade || 'normal'}`,
        `- **titulo:** ${j.titulo}`,
        '',
        '## Descrição',
        '',
        j.descricao || '(sem descrição)',
        '',
        '## Protocolo (P0-2)',
        '',
        '1. Marcar Job como `dispatched` (handoff) e depois `running`.',
        '2. Executar o trabalho pedido.',
        '3. Registar resultado em estado `result` (nunca `completed` directo).',
        '4. CEO verifica → `completed` | `needs_correction` | `failed`.',
        '',
        `Ficheiro: \`executive/queue/${j.id}.json\``,
        '',
      ].join('\n'),
      'utf8',
    );
  }

  function listarPorEstado(estado) {
    return listarFicheirosJob()
      .map((f) => lerJob(f.replace(/\.json$/i, '')))
      .filter((j) => j && (!estado || j.estado === estado));
  }

  function publicar(entrada) {
    const id = proximoId();
    const agora = new Date().toISOString();
    const job = {
      id,
      origem: entrada.origem || 'ceo',
      projeto: entrada.projeto || null,
      tipo: entrada.tipo || 'execucao_tecnica',
      titulo: String(entrada.titulo || '').trim() || 'Job sem título',
      descricao: String(entrada.descricao || '').trim() || '',
      prioridade: entrada.prioridade || 'normal',
      estado: 'pending',
      criadoEm: agora,
      iniciadoEm: null,
      despachadoEm: null,
      concluidoEm: null,
      resultado: null,
      historicoCiclo: [
        {
          em: agora,
          de: null,
          para: 'pending',
          motivo: 'criacao',
          actor: 'ceo',
        },
      ],
      ...(entrada.parecerId ? { parecerId: String(entrada.parecerId) } : {}),
    };
    escreverJob(job);
    atualizarProximoMd(listarPorEstado('pending'));
    return job;
  }

  function atualizarEstado(id, estado, extra = {}) {
    if (!ESTADOS.has(estado)) {
      throw new Error(`Estado inválido: ${estado}`);
    }
    const job = lerJob(id);
    if (!job) throw new Error(`Job não encontrado: ${id}`);

    if (estado === 'completed' && extra.verificado !== true) {
      throw new Error(
        'COMPLETED exige verificação (estado result → verificar). Handoff/execução ≠ conclusão.',
      );
    }

    const t = validarTransicaoLocal(job.estado, estado);
    if (!t.ok) throw new Error(t.mensagem);

    const agora = new Date().toISOString();
    job.historicoCiclo = anexarHistorico(job, job.estado, estado, {
      em: agora,
      motivo: extra.motivo || null,
      actor: extra.actor || null,
    });
    job.estado = estado;
    if (estado === 'dispatched' && !job.despachadoEm) job.despachadoEm = agora;
    if (estado === 'running' && !job.iniciadoEm) job.iniciadoEm = agora;
    if (estado === 'completed' || estado === 'failed' || estado === 'cancelled') {
      job.concluidoEm = agora;
    }
    if (extra.resultado != null) job.resultado = extra.resultado;
    if (extra.falha) job.falha = extra.falha;
    if (extra.correcao) job.correcao = extra.correcao;
    if (extra.verificacao) job.verificacao = extra.verificacao;
    escreverJob(job);
    atualizarProximoMd(listarPorEstado('pending'));
    return job;
  }

  return {
    queueDir,
    publicar,
    listarPorEstado,
    listarPendentes: () => listarPorEstado('pending'),
    lerJob,
    atualizarEstado,
    atualizarProximoMd: () => atualizarProximoMd(listarPorEstado('pending')),
  };
}

// silence unused helpers in this copy (domínio canónico vive em app/)
void carregarCicloVida;
void require;
