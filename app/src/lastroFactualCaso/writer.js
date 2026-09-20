/**
 * LfcWriter canónico — única autoridade de escrita do LFC (IMP-092.1).
 * W1–W3 / ARQ-092 v0.2.
 */

import {
  ESTADO_FACTO,
  ESTADO_LASTRO,
  ORIGEM_UTILIZADOR,
  criarDocumentoLfc,
  criarFactoActivo,
  gerarCasoId,
  haContradiçãoSectorActiva,
  texto
} from "./dominio.js";
import { espelharLfcMutacaoNaTrilha } from "./trilhaLfc.js";

export const WRITER_CANONICO_ID = "lfc-writer-canonico-v1";

/**
 * @param {ReturnType<import("./store.js").criarLfcStore>} store
 * @param {{ superficie?: string, emitirTrilha?: boolean }} [opts]
 */
export function criarLfcWriter(store, opts = {}) {
  if (!store || typeof store.put !== "function") {
    throw new Error("LfcWriter: store inválido.");
  }
  const superficie = texto(opts.superficie) || "nucleo";
  const emitirTrilha = opts.emitirTrilha !== false;

  function recusarSemCoa() {
    return {
      ok: false,
      codigo: "coa_ausente",
      mensagem:
        "Escrita persistente no LFC exige COA activo. Não persisto sob __sem_coa__.",
      autorizaProsaGuardado: false
    };
  }

  function recusarOrigem(origem) {
    if (texto(origem) !== ORIGEM_UTILIZADOR) {
      return {
        ok: false,
        codigo: "origem_nao_utilizador",
        mensagem:
          "Inferências do CEO não podem ser gravadas como factos. origem deve ser «utilizador».",
        autorizaProsaGuardado: false
      };
    }
    return null;
  }

  function emitir(operacao, doc, extra = {}) {
    if (!emitirTrilha) return;
    espelharLfcMutacaoNaTrilha({
      coaId: doc.coaId,
      casoId: doc.casoId,
      operacao,
      versao: doc.versao,
      nFactos: Array.isArray(doc.factos)
        ? doc.factos.filter((f) => f.estado === ESTADO_FACTO.ACTIVO).length
        : 0,
      superficie,
      origemTurnoRef: extra.origemTurnoRef ?? null,
      resultado: extra.resultado || "ok"
    });
  }

  function factosActivos(doc) {
    return (doc.factos || []).filter((f) => f.estado === ESTADO_FACTO.ACTIVO);
  }

  const writer = {
    id: WRITER_CANONICO_ID,

    /**
     * @param {{
     *   coaId?: string,
     *   titulo?: string,
     *   factosIniciais?: string[],
     *   origem?: string,
     *   origemTurnoRef?: string|null,
     *   correçãoExplícita?: boolean
     * }} cmd
     */
    criarCaso(cmd = {}) {
      const coaId = texto(cmd.coaId);
      if (!coaId) return recusarSemCoa();
      const origemErr = recusarOrigem(cmd.origem);
      if (origemErr) return origemErr;

      const iniciais = Array.isArray(cmd.factosIniciais)
        ? cmd.factosIniciais.map((t) => texto(t)).filter(Boolean)
        : [];

      const casoId = gerarCasoId();
      const factos = iniciais.map((t) =>
        criarFactoActivo(t, { origemTurnoRef: cmd.origemTurnoRef })
      );
      const doc = criarDocumentoLfc({
        coaId,
        casoId,
        titulo: texto(cmd.titulo),
        estadoLastro: ESTADO_LASTRO.ACTIVO,
        factos,
        versao: 1
      });

      store.put(doc);
      // CTO-4: não auto-arquiva anteriores; só muda o ponteiro activo
      store.setPonteiroActivo(coaId, casoId);
      emitir("criarCaso", doc, { origemTurnoRef: cmd.origemTurnoRef });

      return {
        ok: true,
        casoId,
        versao: doc.versao,
        nFactos: factos.length,
        autorizaProsaGuardado: true,
        writerId: WRITER_CANONICO_ID
      };
    },

    /**
     * @param {{
     *   coaId?: string,
     *   casoId?: string,
     *   factos?: string[],
     *   origem?: string,
     *   origemTurnoRef?: string|null,
     *   correçãoExplícita?: boolean
     * }} cmd
     */
    acrescentarFactos(cmd = {}) {
      const coaId = texto(cmd.coaId);
      if (!coaId) return recusarSemCoa();
      const origemErr = recusarOrigem(cmd.origem);
      if (origemErr) return origemErr;
      const casoId = texto(cmd.casoId);
      if (!casoId) {
        return {
          ok: false,
          codigo: "caso_ausente",
          mensagem: "casoId obrigatório.",
          autorizaProsaGuardado: false
        };
      }

      const doc = store.get(coaId, casoId);
      if (!doc || doc.estadoLastro === ESTADO_LASTRO.EXCLUIDO) {
        return {
          ok: false,
          codigo: "caso_nao_encontrado",
          mensagem: "Caso inexistente ou excluído.",
          autorizaProsaGuardado: false
        };
      }

      const novos = Array.isArray(cmd.factos)
        ? cmd.factos.map((t) => texto(t)).filter(Boolean)
        : [];
      if (!novos.length) {
        return {
          ok: false,
          codigo: "factos_vazios",
          mensagem: "Nenhum facto para acrescentar.",
          autorizaProsaGuardado: false
        };
      }

      const activos = factosActivos(doc);
      const explicita = cmd.correçãoExplícita === true;
      for (const t of novos) {
        if (!explicita && haContradiçãoSectorActiva(t, activos)) {
          emitir("esclarecimento_contradicao", doc, { resultado: "info" });
          return {
            ok: false,
            codigo: "esclarecimento_contradicao",
            mensagem:
              "Enunciado incompatível com factos activos sem correção explícita. Confirme a correção antes de gravar.",
            autorizaProsaGuardado: false,
            tipo: "esclarecimento"
          };
        }
      }

      const adicionados = novos.map((t) =>
        criarFactoActivo(t, { origemTurnoRef: cmd.origemTurnoRef })
      );
      doc.factos = [...(doc.factos || []), ...adicionados];
      doc.versao = Number(doc.versao || 1) + 1;
      doc.actualizadoEm = new Date().toISOString();
      store.put(doc);
      emitir("acrescentarFactos", doc, { origemTurnoRef: cmd.origemTurnoRef });

      return {
        ok: true,
        casoId,
        versao: doc.versao,
        nFactos: adicionados.length,
        autorizaProsaGuardado: true,
        writerId: WRITER_CANONICO_ID
      };
    },

    /**
     * @param {{
     *   coaId?: string,
     *   casoId?: string,
     *   alvoId?: string,
     *   alvoTexto?: string,
     *   textoNovo?: string,
     *   origem?: string,
     *   correçãoExplícita?: boolean,
     *   origemTurnoRef?: string|null
     * }} cmd
     */
    corrigirFacto(cmd = {}) {
      const coaId = texto(cmd.coaId);
      if (!coaId) return recusarSemCoa();
      const origemErr = recusarOrigem(cmd.origem);
      if (origemErr) return origemErr;
      if (cmd.correçãoExplícita !== true) {
        return {
          ok: false,
          codigo: "correcao_nao_explicita",
          mensagem: "Correção exige correçãoExplícita=true.",
          autorizaProsaGuardado: false,
          tipo: "esclarecimento"
        };
      }
      const casoId = texto(cmd.casoId);
      const textoNovo = texto(cmd.textoNovo);
      if (!casoId || !textoNovo) {
        return {
          ok: false,
          codigo: "comando_incompleto",
          mensagem: "casoId e textoNovo obrigatórios.",
          autorizaProsaGuardado: false
        };
      }

      const doc = store.get(coaId, casoId);
      if (!doc || doc.estadoLastro === ESTADO_LASTRO.EXCLUIDO) {
        return {
          ok: false,
          codigo: "caso_nao_encontrado",
          mensagem: "Caso inexistente ou excluído.",
          autorizaProsaGuardado: false
        };
      }

      const alvoId = texto(cmd.alvoId);
      const alvoTexto = texto(cmd.alvoTexto).toLowerCase();
      let antigo = null;
      if (alvoId) {
        antigo = (doc.factos || []).find(
          (f) => f.id === alvoId && f.estado === ESTADO_FACTO.ACTIVO
        );
      } else if (alvoTexto) {
        antigo = (doc.factos || []).find(
          (f) =>
            f.estado === ESTADO_FACTO.ACTIVO &&
            String(f.texto || "").toLowerCase().includes(alvoTexto)
        );
      } else {
        // fallback: primeiro activo que contradiz o novo
        antigo = factosActivos(doc).find((f) =>
          haContradiçãoSectorActiva(textoNovo, [f])
        );
      }

      if (!antigo) {
        return {
          ok: false,
          codigo: "alvo_nao_encontrado",
          mensagem: "Não encontrei o facto activo a corrigir.",
          autorizaProsaGuardado: false
        };
      }

      const novo = criarFactoActivo(textoNovo, {
        origemTurnoRef: cmd.origemTurnoRef
      });
      antigo.estado = ESTADO_FACTO.CORRIGIDO;
      antigo.corrigidoPor = novo.id;
      antigo.actualizadoEm = new Date().toISOString();
      doc.factos = [...(doc.factos || []), novo];
      doc.versao = Number(doc.versao || 1) + 1;
      doc.actualizadoEm = new Date().toISOString();
      store.put(doc);
      emitir("corrigirFacto", doc, { origemTurnoRef: cmd.origemTurnoRef });

      return {
        ok: true,
        casoId,
        versao: doc.versao,
        factoCorrigidoId: antigo.id,
        factoNovoId: novo.id,
        autorizaProsaGuardado: true,
        writerId: WRITER_CANONICO_ID
      };
    },

    /**
     * @param {{ coaId?: string, casoId?: string, factoId?: string, origem?: string }} cmd
     */
    anularFacto(cmd = {}) {
      const coaId = texto(cmd.coaId);
      if (!coaId) return recusarSemCoa();
      const origemErr = recusarOrigem(cmd.origem);
      if (origemErr) return origemErr;
      const casoId = texto(cmd.casoId);
      const factoId = texto(cmd.factoId);
      if (!casoId || !factoId) {
        return {
          ok: false,
          codigo: "comando_incompleto",
          mensagem: "casoId e factoId obrigatórios.",
          autorizaProsaGuardado: false
        };
      }
      const doc = store.get(coaId, casoId);
      if (!doc) {
        return {
          ok: false,
          codigo: "caso_nao_encontrado",
          mensagem: "Caso inexistente.",
          autorizaProsaGuardado: false
        };
      }
      const f = (doc.factos || []).find((x) => x.id === factoId);
      if (!f || f.estado !== ESTADO_FACTO.ACTIVO) {
        return {
          ok: false,
          codigo: "facto_nao_activo",
          mensagem: "Facto não está activo.",
          autorizaProsaGuardado: false
        };
      }
      f.estado = ESTADO_FACTO.ANULADO;
      f.actualizadoEm = new Date().toISOString();
      doc.versao = Number(doc.versao || 1) + 1;
      doc.actualizadoEm = new Date().toISOString();
      store.put(doc);
      emitir("anularFacto", doc);
      return {
        ok: true,
        casoId,
        versao: doc.versao,
        autorizaProsaGuardado: false,
        writerId: WRITER_CANONICO_ID
      };
    },

    /**
     * @param {{ coaId?: string, casoId?: string, origem?: string }} cmd
     */
    arquivarCaso(cmd = {}) {
      const coaId = texto(cmd.coaId);
      if (!coaId) return recusarSemCoa();
      const origemErr = recusarOrigem(cmd.origem);
      if (origemErr) return origemErr;
      const casoId = texto(cmd.casoId);
      if (!casoId) {
        return {
          ok: false,
          codigo: "caso_ausente",
          mensagem: "casoId obrigatório.",
          autorizaProsaGuardado: false
        };
      }
      const doc = store.get(coaId, casoId);
      if (!doc) {
        return {
          ok: false,
          codigo: "caso_nao_encontrado",
          mensagem: "Caso inexistente.",
          autorizaProsaGuardado: false
        };
      }
      doc.estadoLastro = ESTADO_LASTRO.ARQUIVADO;
      doc.versao = Number(doc.versao || 1) + 1;
      doc.actualizadoEm = new Date().toISOString();
      store.put(doc);
      if (store.obterPonteiroActivo(coaId) === casoId) {
        store.setPonteiroActivo(coaId, null);
      }
      emitir("arquivarCaso", doc);
      return {
        ok: true,
        casoId,
        versao: doc.versao,
        autorizaProsaGuardado: false,
        writerId: WRITER_CANONICO_ID
      };
    },

    /**
     * Tombstone (exclusão lógica — padrão).
     * @param {{ coaId?: string, casoId?: string, origem?: string }} cmd
     */
    excluirCaso(cmd = {}) {
      const coaId = texto(cmd.coaId);
      if (!coaId) return recusarSemCoa();
      const origemErr = recusarOrigem(cmd.origem);
      if (origemErr) return origemErr;
      const casoId = texto(cmd.casoId);
      if (!casoId) {
        return {
          ok: false,
          codigo: "caso_ausente",
          mensagem: "casoId obrigatório.",
          autorizaProsaGuardado: false
        };
      }
      const doc = store.get(coaId, casoId);
      if (!doc) {
        return {
          ok: false,
          codigo: "caso_nao_encontrado",
          mensagem: "Caso inexistente.",
          autorizaProsaGuardado: false
        };
      }
      doc.estadoLastro = ESTADO_LASTRO.EXCLUIDO;
      doc.versao = Number(doc.versao || 1) + 1;
      doc.actualizadoEm = new Date().toISOString();
      store.put(doc);
      if (store.obterPonteiroActivo(coaId) === casoId) {
        store.setPonteiroActivo(coaId, null);
      }
      emitir("tombstone", doc);
      return {
        ok: true,
        casoId,
        versao: doc.versao,
        modo: "tombstone",
        autorizaProsaGuardado: false,
        writerId: WRITER_CANONICO_ID
      };
    },

    /**
     * Hard delete — só com prova de governação explícita.
     * @param {{
     *   coaId?: string,
     *   casoId?: string,
     *   origem?: string,
     *   operacaoGovernada?: boolean,
     *   provaGovernacao?: string
     * }} cmd
     */
    excluirCasoHard(cmd = {}) {
      const coaId = texto(cmd.coaId);
      if (!coaId) return recusarSemCoa();
      const origemErr = recusarOrigem(cmd.origem);
      if (origemErr) return origemErr;
      if (cmd.operacaoGovernada !== true || !texto(cmd.provaGovernacao)) {
        return {
          ok: false,
          codigo: "governacao_ausente",
          mensagem:
            "Hard delete exige operacaoGovernada=true e provaGovernacao.",
          autorizaProsaGuardado: false
        };
      }
      const casoId = texto(cmd.casoId);
      if (!casoId) {
        return {
          ok: false,
          codigo: "caso_ausente",
          mensagem: "casoId obrigatório.",
          autorizaProsaGuardado: false
        };
      }
      const doc = store.get(coaId, casoId);
      if (!doc) {
        return {
          ok: false,
          codigo: "caso_nao_encontrado",
          mensagem: "Caso inexistente.",
          autorizaProsaGuardado: false
        };
      }
      store.hardDelete(coaId, casoId);
      emitir("hardDelete", { ...doc, versao: Number(doc.versao || 1) + 1 });
      return {
        ok: true,
        casoId,
        modo: "hard",
        autorizaProsaGuardado: false,
        writerId: WRITER_CANONICO_ID
      };
    }
  };

  return Object.freeze(writer);
}
