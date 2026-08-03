/**
 * Cliente HTTP do Painel de Orquestração — IMP-055 E3/E5 / IMP-060 E5.
 * Snapshot GET (só leitura). Stream SSE em tempoReal.js.
 *
 * Preferência: API local MVP (`ceoPainelApiUrl` → mesma pasta executive/queue).
 * Fallback híbrido (SPA Vercel sem companion): sinais BP-001 via `ceoApiUrl`
 * (CEO/CTO/Backend/Speaker); Agent/Dispatcher ficam Aguardando — fila só no PC.
 */

import { ceoApiBase, ceoApiUrl, ceoPainelApiUrl } from "../ceoApiBase.js";
import { NOS_V1, montarNo, extrairVistaPrincipal } from "./dominio.js";
import { PATH_SNAPSHOT, INTERVALO_POLLING_MS } from "./streamContrato.js";

export { PATH_SNAPSHOT, INTERVALO_POLLING_MS };

/** Nós que podem vir da API online (BP-001). */
export const NOS_SINAL_ONLINE = Object.freeze([
  "ceo",
  "cto",
  "backend",
  "speaker"
]);

/** Nós que só fazem sentido com fila oficial local. */
export const NOS_FILA_LOCAL = Object.freeze(["agent", "dispatcher"]);

/**
 * Resolve URL do snapshot (API local MVP / companion; não VITE_CEO_API_BASE).
 * @param {string} [baseOverride]
 */
export function urlSnapshotOrquestracao(baseOverride) {
  if (typeof baseOverride === "string" && baseOverride.trim()) {
    const base = baseOverride.replace(/\/$/, "");
    return `${base}${PATH_SNAPSHOT}`;
  }
  return ceoPainelApiUrl(PATH_SNAPSHOT);
}

/**
 * Agent/Dispatcher quando o companion/Vite local não está acessível.
 * @param {object[]} nosRemotos
 */
export function fundirNosHibrido(nosRemotos) {
  const porId = new Map(
    (Array.isArray(nosRemotos) ? nosRemotos : [])
      .filter((n) => n && typeof n.id === "string")
      .map((n) => [n.id, n])
  );
  const agora = new Date().toISOString();
  return NOS_V1.map((id) => {
    if (NOS_FILA_LOCAL.includes(id)) {
      const msg =
        id === "agent"
          ? "Fila oficial só no PC (Vite/companion)."
          : "Watcher local — iniciar Dispatcher no PC.";
      return montarNo(id, "Aguardando", {
        descricaoResumida: msg,
        origemSinal: "fila_oficial",
        atualizadoEm: agora,
        detalhe: { motivo: "companion_ausente", fonte: "executive/queue" }
      });
    }
    const remoto = porId.get(id);
    if (remoto && typeof remoto.estado === "string") {
      return remoto;
    }
    return montarNo(id, "Erro", {
      origemSinal: "agregador",
      atualizadoEm: agora,
      detalhe: { motivo: "sinal_remoto_ausente" }
    });
  });
}

/**
 * @param {typeof fetch} fetchImpl
 * @param {string} url
 * @returns {Promise<{ ok: true, em: string, nos: object[] } | { ok: false, mensagem: string }>}
 */
async function tentarSnapshot(fetchImpl, url) {
  try {
    const resp = await fetchImpl(url, {
      method: "GET",
      headers: { Accept: "application/json" }
    });
    if (!resp.ok) {
      return { ok: false, mensagem: `Snapshot HTTP ${resp.status}.` };
    }
    const body = await resp.json();
    if (!body || !Array.isArray(body.nos) || body.nos.length !== NOS_V1.length) {
      return { ok: false, mensagem: "Snapshot inválido." };
    }
    return { ok: true, em: body.em || "", nos: body.nos };
  } catch (err) {
    return {
      ok: false,
      mensagem: err && err.message ? String(err.message) : "Falha de rede."
    };
  }
}

/**
 * @param {{
 *   fetchImpl?: typeof fetch,
 *   apiBase?: string,
 *   fallbackApiBase?: string
 * }} [opts]
 * @returns {Promise<
 *   | { ok: true, em: string, nos: object[], fonte: "local" | "hibrido" }
 *   | { ok: false, mensagem: string }
 * >}
 */
export async function obterSnapshotOrquestracao(opts = {}) {
  const fetchImpl = opts.fetchImpl || globalThis.fetch;
  if (typeof fetchImpl !== "function") {
    return { ok: false, mensagem: "fetch indisponível." };
  }

  const urlLocal = urlSnapshotOrquestracao(opts.apiBase);
  const local = await tentarSnapshot(fetchImpl, urlLocal);
  if (local.ok) {
    return { ...local, fonte: "local" };
  }

  // Override explícito: sem segundo destino.
  if (typeof opts.apiBase === "string" && opts.apiBase.trim()) {
    return local;
  }

  const baseOverride =
    typeof opts.fallbackApiBase === "string" && opts.fallbackApiBase.trim()
      ? opts.fallbackApiBase.trim().replace(/\/$/, "")
      : "";
  const urlRemoto = baseOverride
    ? `${baseOverride}${PATH_SNAPSHOT}`
    : ceoApiBase()
      ? ceoApiUrl(PATH_SNAPSHOT)
      : "";
  if (!urlRemoto) {
    return local;
  }
  if (urlRemoto === urlLocal) {
    return local;
  }

  const remoto = await tentarSnapshot(fetchImpl, urlRemoto);
  if (!remoto.ok) {
    return local.mensagem ? local : remoto;
  }

  return {
    ok: true,
    em: remoto.em,
    nos: fundirNosHibrido(remoto.nos),
    fonte: "hibrido"
  };
}

/**
 * Vistas principais em Erro quando o snapshot falha (E3-CA5).
 * Não toca na Conversa — só alimenta o painel.
 */
export function vistasDegradacaoSnapshot() {
  return NOS_V1.map((id) => extrairVistaPrincipal(montarNo(id, "Erro")));
}
