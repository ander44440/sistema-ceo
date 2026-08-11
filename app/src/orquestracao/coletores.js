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
 * @param {object} [job]
 * @returns {number}
 */
export function instanteJob(job) {
  const t = Date.parse(
    String(job?.concluidoEm || job?.iniciadoEm || job?.criadoEm || "")
  );
  return Number.isFinite(t) ? t : 0;
}

/**
 * @param {object[]} lista
 * @returns {object|null}
 */
export function jobMaisRecente(lista) {
  if (!Array.isArray(lista) || !lista.length) return null;
  return lista.reduce((acc, cur) =>
    instanteJob(cur) >= instanteJob(acc) ? cur : acc
  );
}

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
    let completed = [];
    try {
      pending = listar("pending") || [];
      running = listar("running") || [];
      failed = listar("failed") || [];
      completed = listar("completed") || [];
    } catch {
      return {
        estado: "Erro",
        origemSinal: "fila_oficial",
        detalhe: { motivo: "fila_ilegivel" }
      };
    }
    const ultimoFailed = jobMaisRecente(failed);
    const ultimoCompleted = jobMaisRecente(completed);
    // Falha «recente» só se for o último evento terminal — falhas antigas
    // não mantêm Agent em Erro após Jobs completed posteriores.
    const falhaEhTerminalMaisRecente =
      Boolean(ultimoFailed) &&
      (!ultimoCompleted ||
        instanteJob(ultimoFailed) > instanteJob(ultimoCompleted));
    const failedRecente =
      falhaEhTerminalMaisRecente && !pending.length && !running.length;
    const m = mapearAgent({
      pending: pending.length,
      running: running.length,
      failedRecente,
      ultimoFailedId: ultimoFailed && ultimoFailed.id
    });
    return {
      estado: m.estado,
      origemSinal: "fila_oficial",
      detalhe: {
        ...m.detalhe,
        pending: pending.length,
        running: running.length,
        completed: completed.length,
        failed: failed.length,
        fonte: "executive/queue"
      }
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
