/**
 * LfcReader canónico — única autoridade de leitura do LFC (IMP-092.2 / ARQ-092).
 * Não re-parseia HFC/transcript; não inventa factos.
 */

import {
  ESTADO_FACTO,
  ESTADO_LASTRO,
  normalizarTitulo,
  texto
} from "./dominio.js";

export const READER_CANONICO_ID = "lfc-reader-canonico-v1";

/**
 * @param {ReturnType<import("./store.js").criarLfcStore>} store
 */
export function criarLfcReader(store) {
  if (!store || typeof store.get !== "function") {
    throw new Error("LfcReader: store inválido.");
  }

  function recusarSemCoa() {
    return {
      ok: false,
      codigo: "coa_ausente",
      mensagem:
        "Leitura persistente do LFC exige COA activo. Não recupero sob __sem_coa__."
    };
  }

  function docVisivel(doc, opts = {}) {
    if (!doc) return null;
    const st = doc.estadoLastro || ESTADO_LASTRO.ACTIVO;
    if (st === ESTADO_LASTRO.EXCLUIDO && !opts.incluirExcluidos) return null;
    return doc;
  }

  function activosDe(doc) {
    if (!doc || !Array.isArray(doc.factos)) return [];
    return doc.factos.filter((f) => f && f.estado === ESTADO_FACTO.ACTIVO);
  }

  const reader = {
    id: READER_CANONICO_ID,

    /**
     * @param {string} [coaId]
     * @param {string} [casoId]
     * @param {{ incluirExcluidos?: boolean }} [opts]
     */
    obterCaso(coaId, casoId, opts = {}) {
      const c = texto(coaId);
      if (!c) return { ...recusarSemCoa(), caso: null };
      const id = texto(casoId);
      if (!id) {
        return {
          ok: false,
          codigo: "caso_ausente",
          mensagem: "casoId obrigatório.",
          caso: null
        };
      }
      const doc = docVisivel(store.get(c, id), opts);
      if (!doc) {
        return {
          ok: false,
          codigo: "caso_nao_encontrado",
          mensagem: "Caso inexistente, excluído (tombstone) ou fora do COA.",
          caso: null
        };
      }
      return { ok: true, caso: doc, readerId: READER_CANONICO_ID };
    },

    /**
     * @param {string} [coaId]
     * @param {{ incluirArquivados?: boolean, incluirExcluidos?: boolean }} [opts]
     */
    listarCasosDoCoa(coaId, opts = {}) {
      const c = texto(coaId);
      if (!c) return { ...recusarSemCoa(), casos: [] };
      const casos = store.listByCoa(c, opts);
      return { ok: true, casos, readerId: READER_CANONICO_ID };
    },

    /**
     * @param {string} [coaId]
     */
    obterCasoActivo(coaId) {
      const c = texto(coaId);
      if (!c) return { ...recusarSemCoa(), casoId: null };
      const casoId = store.obterPonteiroActivo(c);
      if (!casoId) {
        return {
          ok: true,
          casoId: null,
          readerId: READER_CANONICO_ID
        };
      }
      const doc = docVisivel(store.get(c, casoId));
      if (!doc) {
        return {
          ok: true,
          casoId: null,
          readerId: READER_CANONICO_ID
        };
      }
      return { ok: true, casoId, readerId: READER_CANONICO_ID };
    },

    /**
     * Resolução sem escolha silenciosa quando N>1.
     * @param {string} [coaId]
     * @param {{
     *   casoId?: string,
     *   titulo?: string,
     *   deixis?: boolean,
     *   actualizarPonteiro?: boolean
     * }} [cmd]
     */
    resolverCaso(coaId, cmd = {}) {
      const c = texto(coaId);
      if (!c) return { ...recusarSemCoa(), casoId: null };

      const casoId = texto(cmd.casoId);
      if (casoId) {
        const doc = docVisivel(store.get(c, casoId));
        if (!doc) {
          return {
            ok: false,
            codigo: "caso_nao_encontrado",
            mensagem: "casoId não existe neste COA.",
            casoId: null
          };
        }
        if (cmd.actualizarPonteiro === true) {
          store.setPonteiroActivo(c, casoId);
        }
        return { ok: true, casoId, readerId: READER_CANONICO_ID };
      }

      const tituloNorm = normalizarTitulo(cmd.titulo);
      if (tituloNorm) {
        const metas = store.listByCoa(c, { incluirArquivados: true });
        const candidatos = metas.filter(
          (m) => normalizarTitulo(m.titulo) === tituloNorm
        );
        if (candidatos.length === 0) {
          return {
            ok: false,
            codigo: "caso_nao_encontrado",
            mensagem: "Nenhum caso com esse título neste COA.",
            casoId: null,
            candidatos: []
          };
        }
        if (candidatos.length > 1) {
          return {
            ok: false,
            codigo: "caso_ambiguo",
            mensagem:
              "Vários casos com o mesmo título. Indique o casoId — não escolho em silêncio.",
            casoId: null,
            candidatos: candidatos.map((m) => ({
              casoId: m.casoId,
              titulo: m.titulo,
              estadoLastro: m.estadoLastro,
              actualizadoEm: m.actualizadoEm
            }))
          };
        }
        const unico = candidatos[0].casoId;
        if (cmd.actualizarPonteiro === true) {
          store.setPonteiroActivo(c, unico);
        }
        return { ok: true, casoId: unico, readerId: READER_CANONICO_ID };
      }

      if (cmd.deixis === true) {
        const activo = store.obterPonteiroActivo(c);
        if (!activo || !docVisivel(store.get(c, activo))) {
          return {
            ok: false,
            codigo: "caso_nao_encontrado",
            mensagem: "Não há caso activo no ponteiro deste COA.",
            casoId: null
          };
        }
        return { ok: true, casoId: activo, readerId: READER_CANONICO_ID };
      }

      return {
        ok: false,
        codigo: "resolucao_insuficiente",
        mensagem: "Indique casoId, titulo ou deixis.",
        casoId: null
      };
    },

    /**
     * Factos vigentes (estado=activo). Ignora corrigido/anulado.
     * @param {string} [coaId]
     * @param {string} [casoId]
     */
    listarFactosActivos(coaId, casoId) {
      const obtido = this.obterCaso(coaId, casoId);
      if (!obtido.ok) {
        return {
          ok: false,
          codigo: obtido.codigo,
          mensagem: obtido.mensagem,
          factos: []
        };
      }
      const factos = activosDe(obtido.caso).map((f) => ({
        id: f.id,
        texto: f.texto,
        estado: f.estado,
        origemTurnoRef: f.origemTurnoRef ?? null,
        criadoEm: f.criadoEm,
        actualizadoEm: f.actualizadoEm
      }));
      return {
        ok: true,
        casoId: obtido.caso.casoId,
        factos,
        readerId: READER_CANONICO_ID
      };
    },

    /**
     * Facto específico só se estiver activo (canónico vigente).
     * @param {string} [coaId]
     * @param {string} [casoId]
     * @param {{ factoId?: string, textoContem?: string }} [cmd]
     */
    obterFactoActivo(coaId, casoId, cmd = {}) {
      const listados = this.listarFactosActivos(coaId, casoId);
      if (!listados.ok) {
        return {
          ok: false,
          codigo: listados.codigo,
          mensagem: listados.mensagem,
          facto: null
        };
      }
      const factoId = texto(cmd.factoId);
      const contem = texto(cmd.textoContem).toLowerCase();
      let facto = null;
      if (factoId) {
        facto = listados.factos.find((f) => f.id === factoId) || null;
      } else if (contem) {
        const hits = listados.factos.filter((f) =>
          String(f.texto || "").toLowerCase().includes(contem)
        );
        if (hits.length > 1) {
          return {
            ok: false,
            codigo: "facto_ambiguo",
            mensagem: "Vários factos activos correspondem — refine o pedido.",
            facto: null,
            candidatos: hits
          };
        }
        facto = hits[0] || null;
      } else {
        return {
          ok: false,
          codigo: "consulta_insuficiente",
          mensagem: "Indique factoId ou textoContem.",
          facto: null
        };
      }
      if (!facto) {
        return {
          ok: false,
          codigo: "facto_nao_encontrado",
          mensagem:
            "Facto não está activo (inexistente, corrigido, anulado ou fora do caso).",
          facto: null
        };
      }
      return { ok: true, facto, readerId: READER_CANONICO_ID };
    }
  };

  return Object.freeze(reader);
}
