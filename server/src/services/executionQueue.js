/**
 * Fila de Execução V1 — persistência em ficheiros JSON (REQ-045).
 * Cópia operacional de app/server/executionQueue.js (BP-001 E4).
 * Sem mensageria cloud. CEO publica; executores consomem via protocolo local.
 */

import fs from 'node:fs';
import path from 'node:path';

const ESTADOS = new Set([
  'pending',
  'running',
  'completed',
  'failed',
  'cancelled',
]);

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
    return JSON.parse(fs.readFileSync(p, 'utf8'));
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
        '## Protocolo',
        '',
        '1. Marcar Job como `running`.',
        '2. Executar o trabalho pedido.',
        '3. Marcar `completed` ou `failed` com `resultado`.',
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
      concluidoEm: null,
      resultado: null,
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
    job.estado = estado;
    const agora = new Date().toISOString();
    if (estado === 'running' && !job.iniciadoEm) job.iniciadoEm = agora;
    if (estado === 'completed' || estado === 'failed' || estado === 'cancelled') {
      job.concluidoEm = agora;
    }
    if (extra.resultado != null) job.resultado = extra.resultado;
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
