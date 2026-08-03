/**
 * Persistencia JSON — ficheiros via API local + fallback localStorage.
 */

import { ceoApiUrl } from "../ceoApiBase.js";

const LS_PERFIL = "ceo.onboarding.perfil.v1";
const LS_TRANS = "ceo.onboarding.transcricao.v1";

async function tryFetch(url, opts) {
  try {
    const r = await fetch(url, opts);
    const data = await r.json().catch(() => ({}));
    if (!r.ok || data.ok === false) return null;
    return data;
  } catch {
    return null;
  }
}

export function criarStorage() {
  async function salvar(payload) {
    const perfil = payload.perfil;
    const transcricao = payload.transcricao;
    if (perfil) {
      localStorage.setItem(LS_PERFIL, JSON.stringify(perfil));
    }
    if (transcricao) {
      localStorage.setItem(LS_TRANS, JSON.stringify(transcricao));
    }
    await tryFetch(ceoApiUrl("/api/ceo/onboarding/salvar"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ perfil, transcricao })
    });
    return true;
  }

  async function carregar() {
    const remoto = await tryFetch(ceoApiUrl("/api/ceo/onboarding/carregar"));
    if (remoto && remoto.perfil) {
      return {
        perfil: remoto.perfil,
        transcricao: remoto.transcricao || []
      };
    }
    let perfil = null;
    let transcricao = [];
    try {
      perfil = JSON.parse(localStorage.getItem(LS_PERFIL) || "null");
    } catch {
      perfil = null;
    }
    try {
      transcricao = JSON.parse(localStorage.getItem(LS_TRANS) || "[]");
    } catch {
      transcricao = [];
    }
    return { perfil, transcricao };
  }

  function limparLocal() {
    localStorage.removeItem(LS_PERFIL);
    localStorage.removeItem(LS_TRANS);
  }

  return { salvar, carregar, limparLocal };
}
