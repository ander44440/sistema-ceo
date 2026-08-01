/**
 * Coletores V1 — IMP-055 E6.
 * Só leitura de sinais; sem escrita em Fila/Jobs.
 */

import {
  mapearBackend,
  mapearCto,
  mapearCeo,
  mapearAgent,
  mapearDispatcher,
  mapearSpeaker
} from "./mapeadores.js";
import { avaliarHeartbeat } from "./heartbeat.js";

/**
 * @param {{
 *   repoRoot: string,
 *   listarPorEstado?: (estado: string) => object[],
 *   llmConfigurado?: () => boolean,
 *   sinais?: { ler: () => object },
 *   healthOk?: () => boolean | Promise<boolean>,
 *   agoraMs?: () => number,
 *   ttlMs?: number
 * }} deps
 * @returns {Record<string, () => Promise<object>>}
 */
export function criarFontesColetores(deps) {
  const agoraMs = deps.agoraMs || (() => Date.now());
  const listar = deps.listarPorEstado || (() => []);
  const sinais = deps.sinais;

  async function coletorBackend() {
    let ok = true;
    if (typeof deps.healthOk === "function") {
      ok = Boolean(await Promise.resolve(deps.healthOk()));
    }
    const m = mapearBackend({ ok });
    return {
      estado: m.estado,
      origemSinal: "health",
      detalhe: m.detalhe
    };
  }

  async function coletorCto() {
    const snap = sinais ? sinais.ler() : { cto: {} };
    const configurado =
      typeof deps.llmConfigurado === "function"
        ? Boolean(deps.llmConfigurado())
        : true;
    const m = mapearCto({
      configurado,
      emVoo: Boolean(snap.cto && snap.cto.emVoo),
      ultimoEstado: snap.cto && snap.cto.ultimoEstado
    });
    return {
      estado: m.estado,
      origemSinal: "cto-connector",
      detalhe: m.detalhe
    };
  }

  async function coletorCeo() {
    const snap = sinais ? sinais.ler() : { ceo: {} };
    const m = mapearCeo(snap.ceo || {});
    return {
      estado: m.estado,
      origemSinal: "nucleo",
      detalhe: m.detalhe
    };
  }

  async function coletorAgent() {
    let pending = [];
    let running = [];
    let failed = [];
    try {
      pending = listar("pending") || [];
      running = listar("running") || [];
      failed = listar("failed") || [];
    } catch {
      return {
        estado: "Erro",
        origemSinal: "fila",
        detalhe: { motivo: "fila_ilegivel" }
      };
    }
    const ultimoFailed = failed.length
      ? failed[failed.length - 1]
      : null;
    // failed "recente": existe failed e não há pending/running a mascarar
    const failedRecente = Boolean(ultimoFailed) && !pending.length && !running.length;
    const m = mapearAgent({
      pending: pending.length,
      running: running.length,
      failedRecente,
      ultimoFailedId: ultimoFailed && ultimoFailed.id
    });
    return {
      estado: m.estado,
      origemSinal: "fila",
      detalhe: m.detalhe
    };
  }

  async function coletorDispatcher() {
    let pendingCount = 0;
    try {
      pendingCount = (listar("pending") || []).length;
    } catch {
      pendingCount = 0;
    }
    const hb = avaliarHeartbeat(deps.repoRoot, agoraMs(), deps.ttlMs);
    const m = mapearDispatcher({
      fresco: hb.fresco,
      idadeMs: hb.idadeMs,
      estadoWatcher: hb.estadoWatcher,
      pending: Math.max(pendingCount, hb.pending || 0)
    });
    return {
      estado: m.estado,
      origemSinal: "dispatcher-heartbeat",
      detalhe: {
        ...m.detalhe,
        desdeQuando: hb.em || undefined
      }
    };
  }

  async function coletorSpeaker() {
    const snap = sinais ? sinais.ler() : { speaker: {} };
    const m = mapearSpeaker(snap.speaker || {});
    return {
      estado: m.estado,
      origemSinal: "speaker-heuristico",
      detalhe: m.detalhe
    };
  }

  return {
    backend: coletorBackend,
    cto: coletorCto,
    ceo: coletorCeo,
    agent: coletorAgent,
    dispatcher: coletorDispatcher,
    speaker: coletorSpeaker
  };
}
