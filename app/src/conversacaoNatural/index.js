/**
 * Camada de Conversação Natural (PX-003 E2/E3).
 * Entre deliberação/capacidade e superfícies — não delibera; não altera o MRE.
 */

import {
  extrairContextoImediato,
  objetivoJaNoFio
} from "./contextoImediato.js";
import { comporPorTipo } from "./compor.js";
import { TIPO_TURNO, classificarTipoTurno } from "./tiposTurno.js";
import { sanitizarProsaUsuario } from "./sanitizarProsa.js";
import { _resetVariacaoParaTestes } from "./variacao.js";

export {
  extrairCriterioCurto,
  montarProsaDecisaoExecutiva,
  deveApresentarFechoDecisorio,
  temEscolhaDecisoriaValida,
  pedidoTemAlternativasAbc,
  inferirLetraFechoAbc
} from "./compor.js";
export { TIPO_TURNO, classificarTipoTurno } from "./tiposTurno.js";
export { extrairContextoImediato } from "./contextoImediato.js";
export { sanitizarProsaUsuario, expoeEstruturaDeliberacao } from "./sanitizarProsa.js";
export { _resetVariacaoParaTestes };

const GERADOR = "conversacao-natural-v1";

/**
 * @param {object} entrada
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
    instrucao,
    gestaoTopicos: dados.gestaoTopicos || entrada.gestaoTopicos,
    gestaoObjectivos: dados.gestaoObjectivos || entrada.gestaoObjectivos,
    refinoEic: dados.refinoEic || entrada.refinoEic,
    lastroConsciencia:
      dados.lastroConsciencia || entrada.lastroConsciencia
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
    forcarAbertura: dados.intencao?.id === "saudacao" || entrada.forcarAbertura,
    forcarFecho: entrada.forcarFecho,
    instrucao
  });

  const composto = comporPorTipo(tipoTurno, {
    parecer,
    ctxImediato,
    mensagemOriginal,
    canal,
    pediuDetalhe,
    instrucao,
    intencaoId: dados.intencao?.id || entrada.intencaoId || "",
    modo: entrada.modo || ""
  });

  const texto = sanitizarProsaUsuario(composto.texto);
  const guiãoVoz = sanitizarProsaUsuario(composto.guiãoVoz || composto.texto);

  return {
    texto,
    guiãoVoz,
    tipoTurno,
    camadas: composto.camadasUsadas,
    perguntas: composto.perguntas || [],
    contextoImediato: ctxImediato,
    textoAntes: mensagemOriginal,
    gerador: GERADOR,
    modoAdaptacao: composto.modoAdaptacao || null,
    meta: {
      gerador: GERADOR,
      tipoTurno,
      canal,
      pedidoAmbiguo,
      pediuDetalhe,
      modoAdaptacao: composto.modoAdaptacao || null,
      objetivoJaNoFio: objetivoJaNoFio(ctxImediato.objetivoAtual, ctxImediato)
    }
  };
}

/**
 * Aplica CN a qualquer resposta do Núcleo antes das superfícies.
 * Idempotente se já naturalizada (re-sanitiza a prosa ao utilizador).
 * @param {object} resposta
 * @param {object} ctx
 */
export function naturalizarRespostaNucleo(resposta, ctx = {}) {
  if (!resposta || typeof resposta !== "object") return resposta;

  if (resposta.dados?.conversacaoNatural?.gerador === GERADOR) {
    const limpa = sanitizarProsaUsuario(resposta.mensagem);
    return {
      ...resposta,
      mensagem: limpa,
      dados: {
        ...resposta.dados,
        textoVoz: sanitizarProsaUsuario(
          resposta.dados.textoVoz || limpa
        )
      }
    };
  }

  // DESP-009: preferir lastro/refino do Engine quando ainda não estão em dados
  const lastroConsciencia =
    resposta.dados?.lastroConsciencia || ctx.lastroConsciencia || null;
  const refinoEic = resposta.dados?.refinoEic || ctx.refinoEic || null;

  const cn = aplicarConversacaoNatural({
    mensagem: resposta.mensagem,
    ok: resposta.ok,
    modo: resposta.modo,
    dados: {
      ...(resposta.dados || {}),
      intencao: resposta.dados?.intencao || resposta.intencao || ctx.intencao,
      ...(lastroConsciencia ? { lastroConsciencia } : {}),
      ...(refinoEic ? { refinoEic } : {})
    },
    historico: ctx.historico || [],
    instrucao: ctx.instrucao || resposta.dados?.instrucao,
    canal: ctx.canalSpeaker || "chat",
    memoria:
      typeof ctx.memoria === "function"
        ? ctx.memoria()
        : ctx.memoria || resposta.dados?.memoria,
    coa: resposta.dados?.coa || ctx.coaAtivo,
    lastroConsciencia,
    refinoEic,
    intencaoId:
      resposta.dados?.intencao?.id ||
      resposta.intencao?.id ||
      ctx.intencao?.id
  });

  const comunicado = resposta.dados?.comunicado
    ? {
        ...resposta.dados.comunicado,
        texto: cn.texto,
        guiãoVoz: cn.guiãoVoz,
        metadados: {
          ...(resposta.dados.comunicado.metadados || {}),
          gerador: GERADOR,
          tipoTurno: cn.tipoTurno,
          camadas: cn.camadas,
          speakerAntes: resposta.dados.comunicado.metadados?.gerador || null,
          textoSpeakerAntes:
            resposta.dados.comunicado.metadados?.textoSpeakerAntes ||
            cn.textoAntes
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

/**
 * Boas-vindas de superfície (Centro / Conversa) via CN — sem template longo.
 * @param {{ frenteAtiva?: string|null, cumprimento?: string }} [opts]
 */
export function textoBoasVindasNatural(opts = {}) {
  const cumprimento = opts.cumprimento || "";
  const cn = aplicarConversacaoNatural({
    ok: true,
    modo: "local",
    mensagem: cumprimento
      ? `${cumprimento} Em que avanço consigo ajudar agora?`
      : "Olá. Em que avanço consigo ajudar agora?",
    forcarAbertura: true,
    dados: {
      intencao: { id: "saudacao" },
      coa: opts.frenteAtiva ? { nome: opts.frenteAtiva } : null,
      rota: "deterministica"
    },
    instrucao: "olá"
  });
  return cn.texto;
}

function detectarPedidoAmbiguo(instrucao, parecer) {
  const t = String(instrucao || "").trim();
  if (!t) return false;
  if (t.length <= 24 && !/\?/.test(t) && !parecer) return true;
  if (/^(isso|aquilo|e agora|ajuda|faz|melhorar)$/i.test(t)) return true;
  return false;
}
