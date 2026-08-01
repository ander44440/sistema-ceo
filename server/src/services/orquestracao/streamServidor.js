/**
 * Loop SSE do servidor — IMP-055 E5/E6.
 * Snapshot inicial; a cada intervalo: pulse + snapshot fresco (coletores E6).
 */

import {
  INTERVALO_PULSE_MS,
  formatarEventoSse
} from "./streamContrato.js";

/**
 * @param {{
 *   obterSnapshotHttp: () => Promise<{ em: string, nos: object[] }>,
 *   enviar: (event: string, data: object) => void | Promise<void>,
 *   intervaloPulseMs?: number,
 *   abortado?: () => boolean,
 *   agora?: () => string,
 *   sleep?: (ms: number) => Promise<void>,
 *   maxPulsos?: number,
 *   refrescarSnapshot?: boolean
 * }} opts
 */
export async function correrLoopSseOrquestracao(opts) {
  const obter = opts.obterSnapshotHttp;
  const enviar = opts.enviar;
  const intervalo = opts.intervaloPulseMs ?? INTERVALO_PULSE_MS;
  const abortado = opts.abortado || (() => false);
  const agora = opts.agora || (() => new Date().toISOString());
  const sleep =
    opts.sleep ||
    ((ms) => new Promise((r) => setTimeout(r, ms)));
  const maxPulsos =
    typeof opts.maxPulsos === "number" ? opts.maxPulsos : Infinity;
  const refrescar = opts.refrescarSnapshot !== false;

  const snap = await obter();
  await enviar("snapshot", {
    tipo: "snapshot",
    em: snap.em,
    nos: snap.nos
  });

  let pulsos = 0;
  while (!abortado() && pulsos < maxPulsos) {
    await sleep(intervalo);
    if (abortado()) break;
    pulsos += 1;
    await enviar("pulse", {
      tipo: "pulse",
      em: agora()
    });
    if (refrescar && !abortado()) {
      const snap2 = await obter();
      await enviar("snapshot", {
        tipo: "snapshot",
        em: snap2.em,
        nos: snap2.nos
      });
    }
  }
}

/**
 * @param {{ write: (chunk: string) => unknown }} res
 * @param {string} event
 * @param {object} data
 */
export function escreverEventoSseHttp(res, event, data) {
  res.write(formatarEventoSse(event, data));
}
