/**
 * Serviço de agregação do Painel de Orquestração — IMP-055 E2/E6.
 * E6: fontes = coletores reais quando `deps` / `fontes` fornecidos.
 */

import {
  NOS_V1,
  ehEstadoValido,
  montarNo,
  validarSnapshot
} from "./dominio.js";
import {
  criarRegistoOrquestracao,
  registrarNosV1,
  validarNoDeRegisto
} from "./registo.js";

/** Path canónico (paridade Vite / server). */
export const PATH_SNAPSHOT = "/api/ceo/orquestracao/snapshot";

/**
 * Estados stub (só se não houver coletores).
 */
export const ESTADOS_STUB_V1 = Object.freeze({
  ceo: "Disponivel",
  cto: "Ocioso",
  agent: "Ocioso",
  dispatcher: "Ocioso",
  backend: "Disponivel",
  speaker: "Ocioso"
});

const CHAVE_SECRETA =
  /(?:api[_-]?key|token|secret|password|authorization|bearer|credential)/i;

/**
 * Remove chaves sensíveis de objectos aninhados (E2-CA4).
 * @param {unknown} valor
 * @returns {unknown}
 */
export function sanitizarValorPublico(valor) {
  if (valor == null) return valor;
  if (Array.isArray(valor)) {
    return valor.map((v) => sanitizarValorPublico(v));
  }
  if (typeof valor === "object") {
    /** @type {Record<string, unknown>} */
    const out = {};
    for (const [k, v] of Object.entries(valor)) {
      if (CHAVE_SECRETA.test(k)) {
        out[k] = "[redacted]";
        continue;
      }
      out[k] = sanitizarValorPublico(v);
    }
    return out;
  }
  if (typeof valor === "string" && /sk-[a-zA-Z0-9]{10,}/.test(valor)) {
    return "[redacted]";
  }
  return valor;
}

/**
 * @param {object} no
 */
export function sanitizarNoPublico(no) {
  const out = { ...no };
  if (out.detalhe !== undefined) {
    out.detalhe = sanitizarValorPublico(out.detalhe);
  }
  return out;
}

/**
 * @param {object} snapshot
 */
export function sanitizarSnapshotPublico(snapshot) {
  return {
    em: snapshot.em,
    nos: (snapshot.nos || []).map(sanitizarNoPublico)
  };
}

/**
 * @param {string} id
 * @returns {() => { estado: string, origemSinal: string }}
 */
function fonteStubPadrao(id) {
  const estado = ESTADOS_STUB_V1[id] || "Ocioso";
  return () => ({
    estado,
    origemSinal: "stub-e2"
  });
}

/**
 * @param {{
 *   fontes?: Record<string, () => unknown | Promise<unknown>>,
 *   deps?: object,
 *   registo?: ReturnType<typeof criarRegistoOrquestracao>,
 *   agora?: () => string,
 *   exigirV1?: boolean
 * }} [opts]
 */
export function criarAgregadorOrquestracao(opts = {}) {
  const agora = opts.agora || (() => new Date().toISOString());
  const exigirV1 = opts.exigirV1 !== false;
  let registo = opts.registo || null;

  if (!registo && opts.deps) {
    registo = criarRegistoOrquestracao();
    registrarNosV1(registo, opts.deps);
  }

  /** @type {Record<string, () => unknown | Promise<unknown>>} */
  const fontes = {};
  if (!registo) {
    const deColetores = null;
    for (const id of NOS_V1) {
      fontes[id] = (opts.fontes && opts.fontes[id]) || fonteStubPadrao(id);
    }
    void deColetores;
  }

  async function lerSinalSeguro(id) {
    try {
      const bruto = await Promise.resolve(fontes[id]());
      if (!bruto || typeof bruto !== "object") {
        return {
          estado: "Erro",
          origemSinal: "agregador",
          detalhe: { motivo: "sinal_invalido" }
        };
      }
      const s = /** @type {Record<string, unknown>} */ (bruto);
      if (typeof s.estado !== "string" || !ehEstadoValido(s.estado)) {
        return {
          estado: "Erro",
          origemSinal:
            typeof s.origemSinal === "string" ? s.origemSinal : "agregador",
          detalhe: { motivo: "estado_invalido", recebido: s.estado }
        };
      }
      return {
        estado: s.estado,
        origemSinal:
          typeof s.origemSinal === "string" ? s.origemSinal : "agregador",
        detalhe: s.detalhe
      };
    } catch (err) {
      return {
        estado: "Erro",
        origemSinal: "agregador",
        detalhe: {
          motivo: "fonte_falhou",
          mensagem: err && err.message ? String(err.message) : "erro"
        }
      };
    }
  }

  async function obterSnapshot() {
    if (registo) {
      const snapshot = await registo.montarSnapshot({ agora });
      if (exigirV1) {
        const v = validarSnapshot(snapshot);
        if (!v.ok) {
          throw new Error(v.mensagem || "Snapshot V1 inválido.");
        }
      } else {
        for (const no of snapshot.nos) {
          const v = validarNoDeRegisto(no);
          if (!v.ok) throw new Error(v.mensagem);
        }
      }
      return snapshot;
    }

    const em = agora();
    const nos = [];
    for (const id of NOS_V1) {
      const sinal = await lerSinalSeguro(id);
      const optsNo = {
        atualizadoEm: em,
        origemSinal: sinal.origemSinal
      };
      if (sinal.detalhe !== undefined) optsNo.detalhe = sinal.detalhe;
      nos.push(montarNo(id, /** @type {*} */ (sinal.estado), optsNo));
    }
    const snapshot = { em, nos };
    const v = validarSnapshot(snapshot);
    if (!v.ok) {
      throw new Error(v.mensagem || "Snapshot inválido.");
    }
    return snapshot;
  }

  async function obterSnapshotHttp() {
    const snap = sanitizarSnapshotPublico(await obterSnapshot());
    return { ok: true, em: snap.em, nos: snap.nos };
  }

  return {
    obterSnapshot,
    obterSnapshotHttp,
    PATH_SNAPSHOT,
    registo
  };
}
