/**
 * Mapeadores sinal → estado padronizado — IMP-055 E6.
 * Funções puras (testáveis sem I/O).
 */

/** TTL heartbeat dispatcher (60s; faixa documentada 45–90s). */
export const HEARTBEAT_TTL_MS = 60_000;

/**
 * @param {{ ok?: boolean, healthy?: boolean } | null | undefined} health
 * @returns {{ estado: string, detalhe?: object }}
 */
export function mapearBackend(health) {
  if (health && (health.ok === true || health.healthy === true)) {
    return {
      estado: "Disponivel",
      detalhe: { motivo: "health_ok" }
    };
  }
  return {
    estado: "Erro",
    detalhe: { motivo: "health_fail" }
  };
}

/**
 * @param {{
 *   configurado?: boolean,
 *   emVoo?: boolean,
 *   ultimoEstado?: string | null
 * }} sinal
 */
export function mapearCto(sinal = {}) {
  if (sinal.emVoo) {
    return { estado: "Executando", detalhe: { motivo: "consulta_em_voo" } };
  }
  if (sinal.configurado === false) {
    return { estado: "Erro", detalhe: { motivo: "llm_nao_configurado" } };
  }
  if (sinal.ultimoEstado === "erro_transporte" || sinal.ultimoEstado === "erro_schema") {
    return {
      estado: "Erro",
      detalhe: { motivo: "ultimo_resultado", recebido: sinal.ultimoEstado }
    };
  }
  if (sinal.configurado) {
    return { estado: "Disponivel", detalhe: { motivo: "canal_pronto" } };
  }
  return { estado: "Ocioso", detalhe: { motivo: "sem_sinal_cto" } };
}

/**
 * @param {{ emCiclo?: boolean, aguardandoUtilizador?: boolean }} sinal
 */
export function mapearCeo(sinal = {}) {
  if (sinal.emCiclo) {
    return { estado: "Executando", detalhe: { motivo: "ciclo_nucleo" } };
  }
  if (sinal.aguardandoUtilizador) {
    return { estado: "Aguardando", detalhe: { motivo: "aguarda_voz" } };
  }
  return { estado: "Disponivel", detalhe: { motivo: "pronto" } };
}

/**
 * @param {{
 *   pending?: number,
 *   running?: number,
 *   failedRecente?: boolean,
 *   ultimoFailedId?: string | null
 * }} fila
 */
export function mapearAgent(fila = {}) {
  const running = Number(fila.running || 0);
  const pending = Number(fila.pending || 0);
  if (running > 0) {
    return {
      estado: "Executando",
      detalhe: { motivo: "job_running", running }
    };
  }
  if (pending > 0) {
    return {
      estado: "Aguardando",
      detalhe: { motivo: "job_pending", pending }
    };
  }
  if (fila.failedRecente) {
    return {
      estado: "Erro",
      detalhe: {
        motivo: "job_failed",
        jobId: fila.ultimoFailedId || undefined
      }
    };
  }
  return { estado: "Ocioso", detalhe: { motivo: "fila_vazia" } };
}

/**
 * @param {{
 *   fresco?: boolean,
 *   idadeMs?: number | null,
 *   estadoWatcher?: string | null,
 *   pending?: number
 * }} sinal
 */
export function mapearDispatcher(sinal = {}) {
  if (!sinal.fresco) {
    return {
      estado: "Erro",
      detalhe: {
        motivo: "heartbeat_expirado",
        idadeMs: sinal.idadeMs ?? null
      }
    };
  }
  const w = String(sinal.estadoWatcher || "idle");
  if (w === "busy" || w === "dispatching") {
    return {
      estado: "Executando",
      detalhe: { motivo: "a_despachar" }
    };
  }
  if (w === "error") {
    return { estado: "Erro", detalhe: { motivo: "watcher_error" } };
  }
  if (Number(sinal.pending || 0) > 0) {
    return {
      estado: "Disponivel",
      detalhe: { motivo: "a_observar_com_fila", pending: sinal.pending }
    };
  }
  return {
    estado: "Disponivel",
    detalhe: { motivo: "a_observar" }
  };
}

/**
 * Speaker V1 — heurístico documentado (sem telemetria TTS no servidor).
 * @param {{ falando?: boolean, erro?: boolean, ativo?: boolean }} sinal
 */
export function mapearSpeaker(sinal = {}) {
  if (sinal.erro) {
    return { estado: "Erro", detalhe: { motivo: "voz_erro" } };
  }
  if (sinal.falando) {
    return { estado: "Executando", detalhe: { motivo: "a_falar" } };
  }
  if (sinal.ativo) {
    return { estado: "Disponivel", detalhe: { motivo: "voz_pronta" } };
  }
  return {
    estado: "Ocioso",
    detalhe: { motivo: "speaker_heuristico" }
  };
}

/**
 * Avalia frescura do heartbeat.
 * @param {string | null | undefined} emIso
 * @param {number} [agoraMs]
 * @param {number} [ttlMs]
 */
export function heartbeatFresco(emIso, agoraMs = Date.now(), ttlMs = HEARTBEAT_TTL_MS) {
  if (!emIso || typeof emIso !== "string") {
    return { fresco: false, idadeMs: null };
  }
  const t = Date.parse(emIso);
  if (!Number.isFinite(t)) {
    return { fresco: false, idadeMs: null };
  }
  const idadeMs = Math.max(0, agoraMs - t);
  return { fresco: idadeMs <= ttlMs, idadeMs };
}
