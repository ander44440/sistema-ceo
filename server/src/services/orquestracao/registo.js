/**
 * RegistoNoOrquestracao — extensibilidade IMP-055 E7 / ARQ-016 §6.
 * O painel renderiza a lista do registo; sem switch por agente na UI.
 */

import {
  NOS_V1,
  NOMES_NOS,
  ehEstadoValido,
  obterDescricaoResumida,
  montarNo
} from "./dominio.js";
import { criarFontesColetores } from "./coletores.js";

const PAPEIS = new Set(["CTO", "Engenheiro", "Infra", "Voz", "Outro", "CEO"]);

/**
 * @typedef {object} RegistoNoOrquestracao
 * @property {string} id
 * @property {string} nome
 * @property {string} papel
 * @property {() => object | Promise<object>} coletor
 * @property {(sinal: object) => string} [mapeadorEstado]
 * @property {number} [prioridadeVisual]
 * @property {boolean} [obrigatorioV1]
 * @property {Record<string, string>} [descricoes]
 * @property {string} [origemSinal]
 */

/**
 * Nó de snapshot sem exigir id V1 (extensões).
 * @param {{
 *   id: string,
 *   nome: string,
 *   estado: string,
 *   descricaoResumida: string,
 *   atualizadoEm?: string,
 *   detalhe?: unknown,
 *   origemSinal?: string
 * }} entrada
 */
export function montarNoDeRegisto(entrada) {
  if (!entrada || typeof entrada.id !== "string" || !entrada.id.trim()) {
    throw new TypeError("id obrigatório.");
  }
  if (typeof entrada.nome !== "string" || !entrada.nome.trim()) {
    throw new TypeError("nome obrigatório.");
  }
  if (!ehEstadoValido(entrada.estado)) {
    throw new TypeError(`Estado inválido: ${entrada.estado}`);
  }
  if (
    typeof entrada.descricaoResumida !== "string" ||
    !entrada.descricaoResumida.trim()
  ) {
    throw new TypeError("descricaoResumida obrigatória.");
  }
  const no = {
    id: entrada.id.trim(),
    nome: entrada.nome.trim(),
    estado: entrada.estado,
    descricaoResumida: entrada.descricaoResumida.trim(),
    atualizadoEm: entrada.atualizadoEm || new Date().toISOString()
  };
  if (entrada.detalhe !== undefined) no.detalhe = entrada.detalhe;
  if (entrada.origemSinal !== undefined) no.origemSinal = entrada.origemSinal;
  return no;
}

/**
 * @param {unknown} no
 */
export function validarNoDeRegisto(no) {
  if (!no || typeof no !== "object") {
    return { ok: false, mensagem: "Nó em falta." };
  }
  const n = /** @type {Record<string, unknown>} */ (no);
  if (typeof n.id !== "string" || !n.id.trim()) {
    return { ok: false, mensagem: "id obrigatório." };
  }
  if (typeof n.nome !== "string" || !n.nome.trim()) {
    return { ok: false, mensagem: "nome obrigatório." };
  }
  if (typeof n.estado !== "string" || !ehEstadoValido(n.estado)) {
    return { ok: false, mensagem: `estado inválido: ${n.estado}` };
  }
  if (typeof n.descricaoResumida !== "string" || !n.descricaoResumida.trim()) {
    return { ok: false, mensagem: "descricaoResumida obrigatória." };
  }
  if (typeof n.atualizadoEm !== "string" || !n.atualizadoEm.trim()) {
    return { ok: false, mensagem: "atualizadoEm obrigatório." };
  }
  return { ok: true, no: n };
}

/**
 * @returns {{
 *   registrar: (entrada: RegistoNoOrquestracao) => void,
 *   remover: (id: string) => boolean,
 *   listar: () => RegistoNoOrquestracao[],
 *   ids: () => string[],
 *   tem: (id: string) => boolean,
 *   obter: (id: string) => RegistoNoOrquestracao | null,
 *   montarSnapshot: (opts?: { agora?: () => string }) => Promise<object>
 * }}
 */
export function criarRegistoOrquestracao() {
  /** @type {Map<string, RegistoNoOrquestracao>} */
  const mapa = new Map();

  function registrar(entrada) {
    if (!entrada || typeof entrada.id !== "string" || !entrada.id.trim()) {
      throw new TypeError("RegistoNoOrquestracao.id obrigatório.");
    }
    if (typeof entrada.nome !== "string" || !entrada.nome.trim()) {
      throw new TypeError("RegistoNoOrquestracao.nome obrigatório.");
    }
    if (typeof entrada.coletor !== "function") {
      throw new TypeError("RegistoNoOrquestracao.coletor obrigatório.");
    }
    const papel = entrada.papel || "Outro";
    if (!PAPEIS.has(papel)) {
      throw new TypeError(`papel inválido: ${papel}`);
    }
    const id = entrada.id.trim();
    mapa.set(id, {
      id,
      nome: entrada.nome.trim(),
      papel,
      coletor: entrada.coletor,
      mapeadorEstado:
        typeof entrada.mapeadorEstado === "function"
          ? entrada.mapeadorEstado
          : (sinal) =>
              sinal && typeof sinal.estado === "string" ? sinal.estado : "Erro",
      prioridadeVisual:
        typeof entrada.prioridadeVisual === "number"
          ? entrada.prioridadeVisual
          : 100,
      obrigatorioV1: entrada.obrigatorioV1 !== false && NOS_V1.includes(/** @type {*} */ (id)),
      descricoes: entrada.descricoes || undefined,
      origemSinal: entrada.origemSinal || undefined
    });
  }

  function listar() {
    return [...mapa.values()].sort(
      (a, b) => (a.prioridadeVisual || 100) - (b.prioridadeVisual || 100)
    );
  }

  async function montarSnapshot(opts = {}) {
    const agora = opts.agora || (() => new Date().toISOString());
    const em = agora();
    const nos = [];
    for (const reg of listar()) {
      let sinal;
      try {
        sinal = await Promise.resolve(reg.coletor());
      } catch (err) {
        sinal = {
          estado: "Erro",
          origemSinal: "registo",
          detalhe: {
            motivo: "coletor_falhou",
            mensagem: err && err.message ? String(err.message) : "erro"
          }
        };
      }
      if (!sinal || typeof sinal !== "object") {
        sinal = {
          estado: "Erro",
          origemSinal: "registo",
          detalhe: { motivo: "sinal_invalido" }
        };
      }
      let estado = reg.mapeadorEstado(sinal);
      if (!ehEstadoValido(estado) && typeof sinal.estado === "string") {
        estado = sinal.estado;
      }
      if (!ehEstadoValido(estado)) estado = "Erro";

      let descricao =
        (reg.descricoes && reg.descricoes[estado]) ||
        (typeof sinal.descricaoResumida === "string" && sinal.descricaoResumida) ||
        null;
      if (!descricao) {
        try {
          if (NOS_V1.includes(/** @type {*} */ (reg.id))) {
            descricao = obterDescricaoResumida(reg.id, estado);
          }
        } catch {
          descricao = null;
        }
      }
      if (!descricao) {
        descricao = `${reg.nome}: ${estado}`;
      }

      const origem =
        (typeof sinal.origemSinal === "string" && sinal.origemSinal) ||
        reg.origemSinal ||
        "registo";

      if (NOS_V1.includes(/** @type {*} */ (reg.id))) {
        nos.push(
          montarNo(reg.id, /** @type {*} */ (estado), {
            atualizadoEm: em,
            origemSinal: origem,
            descricaoResumida: descricao,
            detalhe: sinal.detalhe
          })
        );
      } else {
        nos.push(
          montarNoDeRegisto({
            id: reg.id,
            nome: reg.nome,
            estado,
            descricaoResumida: descricao,
            atualizadoEm: em,
            origemSinal: origem,
            detalhe: sinal.detalhe
          })
        );
      }
    }
    return { em, nos };
  }

  return {
    registrar,
    remover(id) {
      return mapa.delete(id);
    },
    listar,
    ids() {
      return listar().map((r) => r.id);
    },
    tem(id) {
      return mapa.has(id);
    },
    obter(id) {
      return mapa.get(id) || null;
    },
    montarSnapshot
  };
}

const PAPEIS_V1 = Object.freeze({
  ceo: "CEO",
  cto: "CTO",
  agent: "Engenheiro",
  dispatcher: "Infra",
  backend: "Infra",
  speaker: "Voz"
});

const PRIORIDADE_V1 = Object.freeze({
  ceo: 10,
  cto: 20,
  backend: 30,
  dispatcher: 40,
  agent: 50,
  speaker: 60
});

/**
 * Regista os seis nós V1 a partir dos coletores E6.
 * @param {ReturnType<typeof criarRegistoOrquestracao>} registo
 * @param {Parameters<typeof criarFontesColetores>[0]} deps
 */
export function registrarNosV1(registo, deps) {
  const fontes = criarFontesColetores(deps);
  for (let i = 0; i < NOS_V1.length; i++) {
    const id = NOS_V1[i];
    registo.registrar({
      id,
      nome: NOMES_NOS[id],
      papel: PAPEIS_V1[id] || "Outro",
      coletor: fontes[id],
      mapeadorEstado: (sinal) =>
        sinal && typeof sinal.estado === "string" ? sinal.estado : "Erro",
      prioridadeVisual: PRIORIDADE_V1[id] ?? 10 + i,
      obrigatorioV1: true,
      origemSinal: undefined
    });
  }
  return registo;
}
