/**
 * Cliente tempo real — SSE com fallback para polling (IMP-055 E5).
 */

import {
  DEBOUNCE_UI_MS,
  HINT_DEGRADADO,
  HINT_HIBRIDO,
  HINT_POLLING,
  HINT_SSE,
  INTERVALO_POLLING_MS,
  aplicarEventoAosNos,
  criarDebounce,
  parsearDataEventoSse,
  urlStreamOrquestracao
} from "./streamContrato.js";
import { obterSnapshotOrquestracao } from "./cliente.js";

/**
 * @param {{
 *   onNos: (nos: object[], hint: string, modo: "sse"|"polling"|"degradado") => void,
 *   onModo?: (modo: "sse"|"polling"|"degradado") => void,
 *   EventSourceImpl?: typeof EventSource,
 *   obterSnapshot?: typeof obterSnapshotOrquestracao,
 *   fetchImpl?: typeof fetch,
 *   apiBase?: string,
 *   intervaloPollingMs?: number,
 *   debounceMs?: number,
 *   preferirSse?: boolean
 * }} opts
 * @returns {() => void} parar
 */
export function ligarTempoRealOrquestracao(opts) {
  const onNos = opts.onNos;
  const onModo = opts.onModo || (() => {});
  const obter = opts.obterSnapshot || obterSnapshotOrquestracao;
  const intervalo = opts.intervaloPollingMs ?? INTERVALO_POLLING_MS;
  const preferirSse = opts.preferirSse !== false;
  const ES = opts.EventSourceImpl || globalThis.EventSource;

  let parado = false;
  let timerPoll = null;
  /** @type {EventSource | null} */
  let es = null;
  /** @type {object[]} */
  let nosCache = [];
  let modo = /** @type {"sse"|"polling"|"degradado"} */ ("polling");

  const pintarDebounced = criarDebounce((nos, hint, m) => {
    if (parado) return;
    onNos(nos, hint, m);
  }, opts.debounceMs ?? DEBOUNCE_UI_MS);

  function setModo(m) {
    modo = m;
    onModo(m);
  }

  function aplicarEvento(evento, imediato) {
    const r = aplicarEventoAosNos(nosCache, evento);
    nosCache = r.nos;
    if (evento.tipo === "pulse") return;
    if (!r.alterou) return;
    setModo("sse");
    const hint = HINT_SSE;
    if (imediato) {
      pintarDebounced.cancel();
      onNos(nosCache, hint, "sse");
    } else {
      pintarDebounced(nosCache, hint, "sse");
    }
  }

  async function refrescarPolling() {
    if (parado) return;
    const out = await obter({
      fetchImpl: opts.fetchImpl,
      apiBase: opts.apiBase
    });
    if (parado) return;
    if (out.ok) {
      nosCache = out.nos;
      setModo("polling");
      const hint =
        out.fonte === "hibrido" ? HINT_HIBRIDO : HINT_POLLING;
      onNos(nosCache, hint, "polling");
    } else {
      setModo("degradado");
      onNos(nosCache, HINT_DEGRADADO, "degradado");
    }
  }

  function iniciarPolling() {
    if (parado) return;
    if (timerPoll) return;
    setModo("polling");
    void refrescarPolling();
    timerPoll = setInterval(() => {
      void refrescarPolling();
    }, intervalo);
  }

  function pararPolling() {
    if (timerPoll) {
      clearInterval(timerPoll);
      timerPoll = null;
    }
  }

  function fecharSse() {
    if (es) {
      try {
        es.close();
      } catch {
        /* ignore */
      }
      es = null;
    }
  }

  function onSseError() {
    if (parado) return;
    fecharSse();
    iniciarPolling();
  }

  function ligarSse() {
    if (!preferirSse || typeof ES !== "function") {
      iniciarPolling();
      return;
    }
    try {
      es = new ES(urlStreamOrquestracao(opts.apiBase));
    } catch {
      iniciarPolling();
      return;
    }

    const onEvento = (ev) => {
      if (parado) return;
      const parsed = parsearDataEventoSse(ev.data);
      if (!parsed.ok) return;
      pararPolling();
      const imediato = parsed.evento.tipo === "snapshot";
      aplicarEvento(parsed.evento, imediato);
    };

    es.addEventListener("snapshot", onEvento);
    es.addEventListener("no.atualizado", onEvento);
    es.addEventListener("pulse", onEvento);
    es.onerror = () => onSseError();
  }

  ligarSse();

  return function pararTempoRealOrquestracao() {
    parado = true;
    pintarDebounced.cancel();
    pararPolling();
    fecharSse();
  };
}
