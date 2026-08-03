/**
 * Rotas Orquestração — paridade com app/server (IMP-055 E2/E5/E6).
 */

import { streamSSE } from 'hono/streaming';
import {
  PATH_SNAPSHOT,
  criarAgregadorOrquestracao,
} from '../services/orquestracao/agregador.js';
import {
  PATH_STREAM,
  INTERVALO_PULSE_MS,
} from '../services/orquestracao/streamContrato.js';
import { correrLoopSseOrquestracao } from '../services/orquestracao/streamServidor.js';
import {
  PATH_HEARTBEAT,
  escreverHeartbeat,
  validarCorpoHeartbeat,
} from '../services/orquestracao/heartbeat.js';
import { sinaisRuntimeGlobal } from '../services/orquestracao/sinaisRuntime.js';
import { configDeEnvCto } from '../services/llm.js';
import { resolverRepoRoot } from '../config.js';

/**
 * @param {import('hono').Hono} app
 * @param {object} [env]
 */
export function registrarOrquestracao(app, env = process.env) {
  const repoRoot = resolverRepoRoot(env);
  // IMP-060 E5: Jobs oficiais só em executive/queue no PC — não usar FS Railway.
  // Heartbeat do Dispatcher (POST) permanece neste host para sinal remoto.
  const agregador = criarAgregadorOrquestracao({
    deps: {
      repoRoot,
      listarPorEstado: () => [],
      llmConfigurado: () => Boolean(configDeEnvCto(env).configurado),
      sinais: sinaisRuntimeGlobal,
      healthOk: () => true,
    },
  });

  app.get(PATH_SNAPSHOT, async (c) => {
    try {
      const body = await agregador.obterSnapshotHttp();
      return c.json(body, 200);
    } catch (err) {
      return c.json(
        {
          ok: false,
          codigo: 'ORQUESTRACAO_SNAPSHOT_FALHOU',
          mensagem: err?.message || 'Falha no snapshot.',
        },
        500,
      );
    }
  });

  app.get(PATH_STREAM, (c) => {
    return streamSSE(c, async (stream) => {
      let abortado = false;
      stream.onAbort(() => {
        abortado = true;
      });
      await correrLoopSseOrquestracao({
        obterSnapshotHttp: () => agregador.obterSnapshotHttp(),
        enviar: async (event, data) => {
          if (abortado || stream.closed || stream.aborted) return;
          await stream.writeSSE({
            event,
            data: JSON.stringify(data),
          });
        },
        intervaloPulseMs: INTERVALO_PULSE_MS,
        abortado: () => abortado || stream.closed || stream.aborted,
        sleep: (ms) => stream.sleep(ms),
      });
    });
  });

  app.post(PATH_HEARTBEAT, async (c) => {
    try {
      const body = await c.req.json().catch(() => null);
      const v = validarCorpoHeartbeat(body);
      if (!v.ok) {
        return c.json({ ok: false, mensagem: v.mensagem }, 400);
      }
      const salvo = escreverHeartbeat(repoRoot, {
        em: body.em,
        pid: body.pid,
        estado: body.estado,
        pending: body.pending,
        origem: body.origem || 'http',
      });
      return c.json({ ok: true, heartbeat: salvo }, 200);
    } catch (err) {
      return c.json(
        {
          ok: false,
          mensagem: err?.message || 'Falha no heartbeat.',
        },
        500,
      );
    }
  });
}
