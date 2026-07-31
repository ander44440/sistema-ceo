/**
 * Camada de Conversação Natural (PX-003 E2).
 * Entre deliberação/capacidade e superfícies — não delibera; não altera o MRE.
 */

import {
  extrairContextoImediato,
  objetivoJaNoFio
} from "./contextoImediato.js";
import { comporPorTipo } from "./compor.js";
import { TIPO_TURNO, classificarTipoTurno } from "./tiposTurno.js";
import { _resetVariacaoParaTestes } from "./variacao.js";

export { TIPO_TURNO, classificarTipoTurno } from "./tiposTurno.js";
export { extrairContextoImediato } from "./contextoImediato.js";
export { _resetVariacaoParaTestes };

const GERADOR = "conversacao-natural-v1";

/**
 * @param {object} entrada
 * @param {string} [entrada.mensagem] — prosa antes (Speaker / LLM / local)
 * @param {boolean} [entrada.ok]
 * @param {string} [entrada.modo]
 * @param {object} [entrada.dados]
 * @param {Array} [entrada.historico]
 * @param {string} [entrada.instrucao]
 * @param {string} [entrada.canal]
 */
export function aplicarConversacaoNatural(entrada = {}) {
  const dados = entrada.dados || {};
  const parecer = dados.parecer || entrada.parecer || null;
  const mensagemOriginal = String(entrada.mensagem || "").trim();
  const canal = entrada.canal || dados.comunicado?.canal || "chat";
  const instrucao = String(entrada.instrucao || dados.instrucao || "").trim();

  const ctxImediato = extrairContextoImediato({
    historico: entrada.historico || dados.historico || [],
    parecer,
    memoria: dados.memoria || entrada.memoria,
    coa: dados.coa || entrada.coa,
    instrucao
  });

  const pedidoAmbiguo = detectarPedidoAmbiguo(instrucao, parecer);
  const pediuDetalhe = /porqu[eê]|detalh|explica|justif/i.test(instrucao);

  const tipoTurno = classificarTipoTurno({
    ok: entrada.ok,
    modo: entrada.modo,
    parecer,
    dados,
    intencaoId: dados.intencao?.id || entrada.intencaoId,
    pedidoAmbiguo,
    forcarAbertura: dados.intencao?.id === "saudacao"
  });

  const composto = comporPorTipo(tipoTurno, {
    parecer,
    ctxImediato,
    mensagemOriginal,
    canal,
    pediuDetalhe
  });

  return {
    texto: composto.texto,
    guiãoVoz: composto.guiãoVoz || composto.texto,
    tipoTurno,
    camadas: composto.camadasUsadas,
    perguntas: composto.perguntas || [],
    contextoImediato: ctxImediato,
    textoAntes: mensagemOriginal,
    gerador: GERADOR,
    meta: {
      gerador: GERADOR,
      tipoTurno,
      canal,
      pedidoAmbiguo,
      pediuDetalhe,
      objetivoJaNoFio: objetivoJaNoFio(ctxImediato.objetivoAtual, ctxImediato)
    }
  };
}

/**
 * Aplica CN a uma resposta do Núcleo (capacidade IA) sem alterar o MRE.
 * @param {object} resposta
 * @param {object} ctx — ctx do executiveEngine
 */
export function naturalizarRespostaNucleo(resposta, ctx = {}) {
  if (!resposta || typeof resposta !== "object") return resposta;

  const cn = aplicarConversacaoNatural({
    mensagem: resposta.mensagem,
    ok: resposta.ok,
    modo: resposta.modo,
    dados: resposta.dados,
    historico: ctx.historico || [],
    instrucao: ctx.instrucao || resposta.dados?.instrucao,
    canal: ctx.canalSpeaker || "chat",
    memoria: typeof ctx.memoria === "function" ? ctx.memoria() : ctx.memoria,
    coa: resposta.dados?.coa,
    intencaoId: resposta.dados?.intencao?.id
  });

  const comunicado = resposta.dados?.comunicado
    ? {
        ...resposta.dados.comunicado,
        texto: cn.texto,
        guiãoVoz:
          resposta.dados.comunicado.canal === "voz" || cn.guiãoVoz
            ? cn.guiãoVoz
            : resposta.dados.comunicado.guiãoVoz,
        metadados: {
          ...(resposta.dados.comunicado.metadados || {}),
          gerador: GERADOR,
          tipoTurno: cn.tipoTurno,
          camadas: cn.camadas,
          speakerAntes: resposta.dados.comunicado.metadados?.gerador || null,
          textoSpeakerAntes: cn.textoAntes
        }
      }
    : undefined;

  return {
    ...resposta,
    mensagem: cn.texto,
    dados: {
      ...(resposta.dados || {}),
      textoVoz: cn.guiãoVoz,
      comunicado: comunicado || resposta.dados?.comunicado,
      conversacaoNatural: {
        gerador: GERADOR,
        tipoTurno: cn.tipoTurno,
        camadas: cn.camadas,
        contextoImediato: cn.contextoImediato,
        textoAntes: cn.textoAntes,
        meta: cn.meta
      }
    }
  };
}

function detectarPedidoAmbiguo(instrucao, parecer) {
  const t = String(instrucao || "").trim();
  if (!t) return false;
  if (t.length <= 24 && !/\?/.test(t) && !parecer) return true;
  if (/^(isso|aquilo|e agora|ajuda|faz|melhorar)$/i.test(t)) return true;
  return false;
}
