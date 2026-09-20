/**
 * Porta canónica de entrada de mensagens: qualquer UI → Núcleo.
 * (Conversa texto/voz, Centro de Situação «Comando rápido».)
 * IMP-068: Voice Controller usa a mesma fronteira; EIC intacta.
 */

import {
  acrescentarMensagem,
  atualizarMensagem,
  criarMensagem,
  definirContextoConversacional,
  listarMensagens,
  obterContextoConversacional
} from "./store.js";
import { obterFioTranscriptCoa } from "../../classificadorIntencao/fioConversacional.js";
import { executiveEngine } from "../../executiveEngine/index.js";
import { obterCoaAtivo } from "../../executiveEngine/coaSessao.js";
import {
  prepararGestoEnvio,
  reproduzirRespostaCeo
} from "../../experienciaVoz/reproduzirResposta.js";

/**
 * Projeto activo (Abrir) é a fonte de verdade do COA do turno.
 * Re-sincroniza o bucket conversacional se divergir.
 * @returns {string|null}
 */
function resolverCoaIdEnvio() {
  const sessao = obterCoaAtivo();
  const idSessao = sessao?.id ? String(sessao.id).trim() : null;
  const conv = obterContextoConversacional();
  if (idSessao) {
    if (conv !== idSessao) {
      definirContextoConversacional(idSessao);
    }
    return idSessao;
  }
  return conv || null;
}

/**
 * @param {string} textoBruto
 * @param {object} [opts]
 * @param {boolean} [opts.reproduzirTts=true]
 * @param {(texto: string) => void} [opts.onEstadoUi]
 * @returns {Promise<{ ok: boolean, mensagem: string, capacidade?: string, dados?: object, resposta?: object }>}
 */
export async function enviarAoNucleo(textoBruto, opts = {}) {
  const texto = String(textoBruto || "").trim();
  const reproduzirTts = opts.reproduzirTts !== false;
  const onEstadoUi = opts.onEstadoUi;

  if (!texto) {
    return { ok: false, mensagem: "Texto vazio." };
  }

  onEstadoUi?.("Núcleo Executivo em ação…");
  prepararGestoEnvio();

  acrescentarMensagem(
    criarMensagem({
      papel: "usuario",
      texto
    })
  );

  const placeholder = acrescentarMensagem(
    criarMensagem({
      papel: "ceo",
      texto: "…",
      estado: "pendente"
    })
  );

  try {
    let publicarJob = opts.publicarJob;
    if (typeof publicarJob !== "function") {
      const { publicarJobFila } = await import(
        "../../executiveEngine/filaCliente.js"
      );
      publicarJob = publicarJobFila;
    }
    const coaId = resolverCoaIdEnvio();
    const transcript = listarMensagens()
      .filter((m) => m.id !== placeholder.id)
      .map((m) => ({
        papel: m.papel,
        texto: m.texto,
        ...(coaId ? { coaId } : {})
      }));
    let fallbackHfc = [];
    const priorStore = transcript.filter(
      (m) => String(m.texto || "").trim() && String(m.texto).trim() !== texto
    );
    if (priorStore.length === 0 && coaId) {
      try {
        const { criarDepsConsultaProducao } = await import(
          "../../consultaRegistados/depsProducao.js"
        );
        const deps = criarDepsConsultaProducao();
        fallbackHfc = (deps.listarHfcPorCoa(coaId) || []).map((e) => ({
          papel: e.papel,
          texto: e.texto,
          coaId: e.coaId || coaId
        }));
      } catch {
        fallbackHfc = [];
      }
    }
    const historico = obterFioTranscriptCoa({
      transcript,
      mensagemActual: texto,
      coaId,
      fallbackHfc
    });
    const resposta = await executiveEngine.executar(
      {
        texto,
        historico,
        coaId
      },
      { publicarJob }
    );

    atualizarMensagem(placeholder.id, {
      texto: resposta.mensagem,
      estado: resposta.ok ? "pronta" : "erro",
      papel: resposta.ok ? "ceo" : "sistema"
    });

    if (resposta.ok && reproduzirTts) {
      const textoVoz =
        (resposta.dados && resposta.dados.textoVoz) || resposta.mensagem;
      void reproduzirRespostaCeo(textoVoz);
    }

    // Relato/encerramento: notificar Centro para abrir faixa do dia com campos preenchidos
    if (
      resposta.ok &&
      (resposta.modo === "relato_encerramento" ||
        resposta.dados?.origemCampos === "estado_operacional" ||
        resposta.dados?.continuidade)
    ) {
      try {
        window.dispatchEvent(
          new CustomEvent("ceo:continuidade-dia", {
            detail: resposta.dados?.continuidade || null
          })
        );
      } catch {
        /* no-op */
      }
    }

    onEstadoUi?.(
      resposta.ok
        ? `Via ${resposta.capacidade || "núcleo"} · pronto`
        : "Falha no Núcleo Executivo"
    );

    return {
      ok: Boolean(resposta.ok),
      mensagem: resposta.mensagem,
      capacidade: resposta.capacidade,
      dados: resposta.dados,
      resposta
    };
  } catch (err) {
    const msg =
      "Não foi possível processar a instrução nesta sessão. " +
      (err && err.message ? err.message : "Erro desconhecido.");
    atualizarMensagem(placeholder.id, {
      papel: "sistema",
      texto: msg,
      estado: "erro"
    });
    onEstadoUi?.("Falha no processamento");
    return { ok: false, mensagem: msg };
  }
}
