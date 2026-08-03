/**
 * Envio canónico Conversa → Núcleo (path texto e path voz).
 * IMP-068: Voice Controller usa a mesma fronteira; EIC intacta.
 */

import {
  acrescentarMensagem,
  atualizarMensagem,
  criarMensagem,
  listarMensagens
} from "./store.js";
import { executiveEngine } from "../../executiveEngine/index.js";
import {
  prepararGestoEnvio,
  reproduzirRespostaCeo
} from "../../experienciaVoz/reproduzirResposta.js";

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
    const { publicarJobFila } = await import(
      "../../executiveEngine/filaCliente.js"
    );
    const resposta = await executiveEngine.executar(
      {
        texto,
        historico: listarMensagens()
          .filter((m) => m.id !== placeholder.id)
          .map((m) => ({ papel: m.papel, texto: m.texto }))
      },
      { publicarJob: publicarJobFila }
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
