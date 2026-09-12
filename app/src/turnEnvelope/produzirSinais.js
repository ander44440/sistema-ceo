/**
 * IMP-091 B2 — ponto único de produção de sinais canónicos (catálogo fechado).
 * Não altera Precedência; não projecta flags; não cria sinais.situacional.
 */

import { normalizarTexto } from "../classificadorIntencao/lexicon.js";
import {
  ehPedidoSituacionalTrabalho,
  ehPedidoAutodiagnosticoOuAutoavaliacaoCeo
} from "../classificadorIntencao/regras.js";
import { detectarPedidoInfoGathering } from "../classificadorIntencao/pedidoInfoGathering.js";
import { detectarPedidoDecisaoExplicita } from "../classificadorIntencao/pedidoDecisaoExplicita.js";
import { objectoDoTurno } from "../classificadorIntencao/recomendacaoOperacional.js";
import {
  detectarPedidoConsultaResposta,
  detectarPedidoAnaliseDeliberativa
} from "../mre/politicaAnaliseDeliberativa.js";
import {
  ehPedidoConsultaOuRespostaComposta,
  ehOrdemExecucaoOperacional
} from "../autoridadeDelegada/autoridadeDelegada.js";
import {
  aplicarPatchEnvelope,
  gravarSinalAppendOnce,
  registarPassoEnvelope
} from "./index.js";

/** Chaves com autoridade de sinal na Fatia 1 (REQ/ARQ-091). */
export const CATALOGO_SINAIS_FATIA1 = Object.freeze([
  "ig",
  "pd",
  "consulta",
  "consulta_composta",
  "panorama",
  "analise",
  "delegacao",
  "execucao",
  "objeto_operacional",
  "gate_continuidade",
  "gate_clarificacao",
  "vca_clarificacao",
  "csc_clarificacao",
  "objecto_turno",
  "classe_c",
  "destino",
  "cto003_candidato",
  "ad_activacao_ack"
]);

/**
 * Critério actual de panorama no Núcleo (executiveEngine) — sem detector novo.
 * @param {string} texto
 * @param {boolean} situacional
 */
export function detectarPanoramaEstadoGeralActual(texto, situacional) {
  const t = normalizarTexto(texto);
  return (
    !situacional &&
    !ehPedidoAutodiagnosticoOuAutoavaliacaoCeo(t) &&
    (/\bestado\s+atual\b/.test(t) ||
      /\b(resumo\s+executivo|memoria\s+executiva)\b/.test(t))
  );
}

function registo(chave, valor, fonte, fase = "sinais") {
  return {
    id: chave,
    valor,
    fonte,
    em: new Date().toISOString(),
    fase
  };
}

/**
 * Produz sinais canónicos uma vez a partir de `envelope.mensagemAtual` (+ fio).
 *
 * @param {Readonly<object>} envelope
 * @param {{
 *   fioCoa?: unknown[],
 *   agora?: () => string,
 *   // Opcionais de fases posteriores (Gate/AD/VCA/CSC) — só se o caller já os tiver
 *   gateContinuidade?: boolean,
 *   gateClarificacao?: boolean,
 *   vcaClarificacao?: boolean,
 *   cscClarificacao?: boolean,
 *   delegacao?: boolean,
 *   adActivacaoAck?: boolean,
 *   cto003Candidato?: boolean,
 *   objetoOperacional?: boolean,
 *   classeC?: string|null,
 *   destino?: string|null
 * }} [ctx]
 * @returns {Readonly<object>} novo envelope
 */
export function produzirSinaisTurno(envelope, ctx = {}) {
  const texto = String(envelope?.mensagemAtual ?? "");
  const fioCoa = Array.isArray(ctx.fioCoa) ? ctx.fioCoa : [];
  const tNorm = normalizarTexto(texto);
  const P = ctx.produtores && typeof ctx.produtores === "object" ? ctx.produtores : {};

  const detectarIg = P.detectarPedidoInfoGathering || detectarPedidoInfoGathering;
  const detectarPd = P.detectarPedidoDecisaoExplicita || detectarPedidoDecisaoExplicita;
  const detectarConsulta =
    P.detectarPedidoConsultaResposta || detectarPedidoConsultaResposta;
  const detectarSit = P.ehPedidoSituacionalTrabalho || ehPedidoSituacionalTrabalho;
  const detectarComposta =
    P.ehPedidoConsultaOuRespostaComposta || ehPedidoConsultaOuRespostaComposta;
  const detectarAnalise =
    P.detectarPedidoAnaliseDeliberativa || detectarPedidoAnaliseDeliberativa;
  const detectarExec = P.ehOrdemExecucaoOperacional || ehOrdemExecucaoOperacional;
  const calcObjecto = P.objectoDoTurno || objectoDoTurno;
  const detectarPanorama =
    P.detectarPanoramaEstadoGeralActual || detectarPanoramaEstadoGeralActual;

  // Ordem ARQ: ig → pd → consulta → restantes / objecto_turno
  // situacional 1× (derivacao); consulta plain ≡ situacional (BLOQUEIO-1) sem 2ª chamada
  const situacional = detectarSit(tNorm);
  const ig = detectarIg(texto);
  // PD consome IG já produzido — sem re-avaliar IG dentro do detector
  const pd = detectarPd(texto, { infoGathering: ig });
  // consulta canónico: plain ≡ situacional; passa situacional para não re-chamar o detector
  const consulta = detectarConsulta(texto, { situacional });
  const consultaComposta = detectarComposta(texto);
  const panorama = detectarPanorama(texto, situacional);
  const analise = detectarAnalise(texto);
  const execucao = detectarExec(texto);
  // Única chamada canónica a objectoDoTurno — recebe IG/PD já calculados (sem reavaliar)
  const objecto = calcObjecto(texto, fioCoa, {
    infoGathering: ig,
    pedidoDecisaoExplicita: pd
  });

  let env = envelope;

  env = gravarSinalAppendOnce(
    env,
    "ig",
    registo("ig", ig, "detectarPedidoInfoGathering")
  );
  env = gravarSinalAppendOnce(
    env,
    "pd",
    registo("pd", pd, "detectarPedidoDecisaoExplicita")
  );
  env = gravarSinalAppendOnce(
    env,
    "consulta",
    registo("consulta", consulta, "detectarPedidoConsultaResposta")
  );
  env = gravarSinalAppendOnce(
    env,
    "consulta_composta",
    registo(
      "consulta_composta",
      consultaComposta,
      "ehPedidoConsultaOuRespostaComposta"
    )
  );
  env = gravarSinalAppendOnce(
    env,
    "panorama",
    registo("panorama", panorama, "detectarPanoramaEstadoGeralActual")
  );
  env = gravarSinalAppendOnce(
    env,
    "analise",
    registo("analise", analise, "detectarPedidoAnaliseDeliberativa")
  );
  env = gravarSinalAppendOnce(
    env,
    "execucao",
    registo("execucao", execucao, "ehOrdemExecucaoOperacional")
  );
  env = gravarSinalAppendOnce(
    env,
    "objecto_turno",
    registo("objecto_turno", objecto, "objectoDoTurno")
  );

  // Sinais de fase posterior — só se o ctx os trouxer (sem inventar)
  const opcionais = [
    ["delegacao", ctx.delegacao, "ctx.delegacao"],
    ["objeto_operacional", ctx.objetoOperacional, "ctx.objetoOperacional"],
    ["gate_continuidade", ctx.gateContinuidade, "ctx.gateContinuidade"],
    ["gate_clarificacao", ctx.gateClarificacao, "ctx.gateClarificacao"],
    ["vca_clarificacao", ctx.vcaClarificacao, "ctx.vcaClarificacao"],
    ["csc_clarificacao", ctx.cscClarificacao, "ctx.cscClarificacao"],
    ["cto003_candidato", ctx.cto003Candidato, "ctx.cto003Candidato"],
    ["ad_activacao_ack", ctx.adActivacaoAck, "ctx.adActivacaoAck"]
  ];
  for (const [chave, valor, fonte] of opcionais) {
    if (valor !== undefined) {
      env = gravarSinalAppendOnce(env, chave, registo(chave, valor, fonte));
    }
  }
  if (ctx.classeC !== undefined) {
    env = gravarSinalAppendOnce(
      env,
      "classe_c",
      registo("classe_c", ctx.classeC, "ctx.classeC")
    );
  }
  if (ctx.destino !== undefined) {
    env = gravarSinalAppendOnce(
      env,
      "destino",
      registo("destino", ctx.destino, "ctx.destino")
    );
  }

  // situacional: NÃO entra em sinais — só derivacao/telemetria
  const derivacoes = Object.freeze({
    situacional
  });
  env = aplicarPatchEnvelope(env, {
    derivacoes,
    fioConversacional: Object.freeze([...fioCoa])
  });

  return registarPassoEnvelope(env, {
    fase: "sinais",
    catalogo: "fatia1",
    chaves: Object.keys(env.sinais || {}),
    derivacoes: { situacional }
  });
}

/**
 * Lê valor de sinal boolean sem redetectar.
 * @param {object|null|undefined} envelope
 * @param {string} chave
 * @returns {boolean}
 */
export function lerSinalBoolean(envelope, chave) {
  return envelope?.sinais?.[chave]?.valor === true;
}

/**
 * Consome sinal boolean se presente no envelope; `undefined` = ausente (fallback legítimo).
 * @param {object|null|undefined} envelope
 * @param {string} chave
 * @returns {boolean|undefined}
 */
export function consumirSinalBoolean(envelope, chave) {
  if (
    !envelope?.sinais ||
    !Object.prototype.hasOwnProperty.call(envelope.sinais, chave)
  ) {
    return undefined;
  }
  return envelope.sinais[chave]?.valor === true;
}

/**
 * Consome derivacoes.situacional se presente; `undefined` = ausente.
 * @param {object|null|undefined} envelope
 * @returns {boolean|undefined}
 */
export function consumirDerivacaoSituacional(envelope) {
  if (
    !envelope?.derivacoes ||
    !Object.prototype.hasOwnProperty.call(envelope.derivacoes, "situacional")
  ) {
    return undefined;
  }
  return envelope.derivacoes.situacional === true;
}
