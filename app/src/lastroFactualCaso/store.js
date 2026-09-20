/**
 * LfcStore — porta de persistência (IMP-092.1).
 * Mutações de produto devem passar pelo LfcWriter (W1–W2).
 */

import {
  apagarDocumentoFisico,
  escreverDocumento,
  escreverIndice,
  lerDocumento,
  lerIndice,
  metaDeDocumento,
  caminhoStoreLfc
} from "./persistencia.js";
import { ESTADO_LASTRO, texto } from "./dominio.js";

/**
 * @param {string} dirStore — directório raiz do store LFC (…/lastro-factual-casos)
 */
export function criarLfcStore(dirStore) {
  const root = String(dirStore || "").trim();
  if (!root) throw new Error("LfcStore: dirStore obrigatório.");

  return Object.freeze({
    dirStore: root,

    /**
     * @param {string} coaId
     * @param {string} casoId
     */
    get(coaId, casoId) {
      if (!texto(coaId) || !texto(casoId)) return null;
      return lerDocumento(root, coaId, casoId);
    },

    /**
     * @param {object} doc
     */
    put(doc) {
      if (!doc || !texto(doc.coaId) || !texto(doc.casoId)) {
        throw new Error("LfcStore.put: coaId e casoId obrigatórios.");
      }
      escreverDocumento(root, doc);
      const indice = lerIndice(root, doc.coaId);
      const meta = metaDeDocumento(doc);
      const restantes = (indice.casos || []).filter(
        (c) => c && c.casoId !== doc.casoId
      );
      restantes.push(meta);
      escreverIndice(root, doc.coaId, {
        casoActivoId: indice.casoActivoId,
        casos: restantes
      });
      return { ok: true, casoId: doc.casoId, versao: doc.versao };
    },

    /**
     * @param {string} coaId
     * @param {string|null} casoId
     */
    setPonteiroActivo(coaId, casoId) {
      const id = texto(coaId);
      if (!id) throw new Error("LfcStore.setPonteiroActivo: coaId obrigatório.");
      const indice = lerIndice(root, id);
      escreverIndice(root, id, {
        casoActivoId: casoId ? texto(casoId) : null,
        casos: indice.casos || []
      });
      return { ok: true, casoActivoId: casoId ? texto(casoId) : null };
    },

    /**
     * @param {string} coaId
     */
    obterPonteiroActivo(coaId) {
      if (!texto(coaId)) return null;
      return lerIndice(root, coaId).casoActivoId;
    },

    /**
     * @param {string} coaId
     * @param {{ incluirArquivados?: boolean, incluirExcluidos?: boolean }} [opts]
     */
    listByCoa(coaId, opts = {}) {
      if (!texto(coaId)) return [];
      const indice = lerIndice(root, coaId);
      return (indice.casos || []).filter((c) => {
        if (!c) return false;
        const st = c.estadoLastro || ESTADO_LASTRO.ACTIVO;
        if (st === ESTADO_LASTRO.EXCLUIDO && !opts.incluirExcluidos) return false;
        if (st === ESTADO_LASTRO.ARQUIVADO && !opts.incluirArquivados) return false;
        return true;
      });
    },

    /**
     * Hard delete físico + actualiza índice (só via Writer governado).
     * @param {string} coaId
     * @param {string} casoId
     */
    hardDelete(coaId, casoId) {
      apagarDocumentoFisico(root, coaId, casoId);
      const indice = lerIndice(root, coaId);
      const casos = (indice.casos || []).filter((c) => c && c.casoId !== casoId);
      const activo =
        indice.casoActivoId === casoId ? null : indice.casoActivoId;
      escreverIndice(root, coaId, { casoActivoId: activo, casos });
      return { ok: true };
    }
  });
}

/**
 * @param {string} repoRoot
 */
export function criarLfcStoreNoRepo(repoRoot) {
  return criarLfcStore(caminhoStoreLfc(repoRoot));
}
