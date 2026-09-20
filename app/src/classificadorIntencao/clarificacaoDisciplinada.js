/**
 * IMP-094 Fase 2 — Clarificação disciplinada (REQ-094 CL-1/CL-2/CL-3).
 * Rollback: CEO_FUNIL_CLARIFICACAO_ESTRITA=off
 */

import { DESTINO_POR_CLASSE, FLAGS_POR_CLASSE } from "./dominio.js";
import { normalizarTexto } from "./lexicon.js";
import { detectarModoRespostaRestrita } from "./pedidoRespostaRestrita.js";
import { detectarPedidoProtocoloExecutivo } from "../executiveEngine/protocoloAgenteExecutivo.js";

export { detectarPedidoProtocoloExecutivo };

const MODOS_LFC = new Set(["dado_unico", "factos", "registo", "confirmacao"]);
const MODOS_DIC = new Set([
  "papel_sistema",
  "diferenca_especialista",
  "autodiagnostico_papel"
]);

/**
 * Disciplina activa por omissão; desliga com CEO_FUNIL_CLARIFICACAO_ESTRITA=off.
 * @returns {boolean}
 */
export function funilClarificacaoEstritaActiva() {
  const env =
    (typeof process !== "undefined" &&
      process.env?.CEO_FUNIL_CLARIFICACAO_ESTRITA) ||
    (typeof import.meta !== "undefined" &&
      import.meta.env &&
      import.meta.env.CEO_FUNIL_CLARIFICACAO_ESTRITA) ||
    "";
  return String(env).trim().toLowerCase() !== "off";
}

/**
 * @param {string} [texto]
 * @returns {boolean}
 */
export function ehFamiliaCanonicaAntiClarificacao(texto) {
  const det = detectarPedidoProtocoloExecutivo(texto);
  if (det.activo) return true;
  const lfc = detectarModoRespostaRestrita(texto);
  if (lfc.activo && lfc.modo && MODOS_LFC.has(lfc.modo)) return true;
  const t = normalizarTexto(texto || "");
  if (!t) return false;
  // Demanda clara / reautorização ritual (CL-2) — mesmo fora do detector de modo.
  if (
    /\bdemanda\s+clara\b/.test(t) ||
    /\bpronta\s+para\s+execu/.test(t) ||
    /\bsem\s+necessidade\s+de\s+esclarec/.test(t) ||
    /\binforma[cç][oõ]es\s+faltantes\b/.test(t) ||
    (/\b(autoriza|autorizou|autorizada)\b/.test(t) &&
      /\b(cto|especialista|nova\s+autoriza)/.test(t)) ||
    /\bpapel\s+(neste\s+sistema|como\s+agente)\b/.test(t) ||
    /\bdiferen[cç]a\s+entre\s+o\s+seu\s+papel\b/.test(t) ||
    /\bautodiagn[oó]stico\b/.test(t)
  ) {
    return true;
  }
  return false;
}

/**
 * CL-1/CL-2/CL-3 — clarificar só se ambiguidade bloqueante e fora das famílias proibidas.
 * @param {string} [texto]
 * @param {{
 *   motivoCandidato?: string,
 *   ambiguoBloqueante?: boolean
 * }} [ctx]
 * @returns {{ permitido: boolean, razao: string, familiaBloqueio?: string|null }}
 */
export function permiteClarificacaoTurno(texto, ctx = {}) {
  if (!funilClarificacaoEstritaActiva()) {
    return { permitido: true, razao: "flag_off_rollback" };
  }

  const t = String(texto || "").trim();
  if (!t) {
    return {
      permitido: true,
      razao: "mensagem_vazia_bloqueante",
      familiaBloqueio: null
    };
  }

  if (ehFamiliaCanonicaAntiClarificacao(t)) {
    const prot = detectarPedidoProtocoloExecutivo(t);
    let familia = "demanda_clara";
    if (prot.activo) {
      familia = MODOS_DIC.has(String(prot.modo || "")) ? "dic" : "protocolo";
    } else {
      const lfc = detectarModoRespostaRestrita(t);
      if (lfc.activo && MODOS_LFC.has(String(lfc.modo || ""))) familia = "lfc";
    }
    return {
      permitido: false,
      razao: "cl2_familia_proibida",
      familiaBloqueio: familia
    };
  }

  // CL-3: limiar / ausência de lexicon NÃO são ambiguidade bloqueante.
  const motivo = String(ctx.motivoCandidato || "");
  if (
    motivo === "limiar" ||
    motivo === "lexicon" ||
    motivo === "limiar_ou_classificador"
  ) {
    if (ctx.ambiguoBloqueante === true) {
      return { permitido: true, razao: "ambiguo_bloqueante_explicito" };
    }
    return {
      permitido: false,
      razao: "cl3_limiar_ou_lexicon_sem_bloqueio",
      familiaBloqueio: null
    };
  }

  // CL-1: só com ambiguidade bloqueante explícita (VCA/CSC/Gate com pergunta).
  if (ctx.ambiguoBloqueante === true) {
    return { permitido: true, razao: "ambiguo_bloqueante_explicito" };
  }

  // Sem sinal de bloqueio → não clarificar por omissão.
  return {
    permitido: false,
    razao: "cl1_sem_ambiguo_bloqueante",
    familiaBloqueio: null
  };
}

/**
 * Remove clarificação automática da saída do classificador quando CL-* proíbe.
 * @param {import("../classificadorIntencao/dominio.js").SaidaClassificador} saida
 * @param {string} texto
 * @returns {{
 *   saida: import("../classificadorIntencao/dominio.js").SaidaClassificador,
 *   clarificacaoEvitada: boolean,
 *   razaoObs7?: string,
 *   familiaBloqueio?: string|null
 * }}
 */
export function disciplinarSaidaClarificacao(saida, texto) {
  if (!funilClarificacaoEstritaActiva()) {
    return { saida, clarificacaoEvitada: false };
  }
  if (!saida || (saida.precisaClarificacao !== true && saida.destino !== "clarificacao")) {
    return { saida, clarificacaoEvitada: false };
  }

  const ver = permiteClarificacaoTurno(texto, {
    motivoCandidato: "limiar_ou_classificador"
  });
  if (ver.permitido) {
    return { saida, clarificacaoEvitada: false };
  }

  const classe = /** @type {keyof typeof DESTINO_POR_CLASSE} */ (saida.classe);
  const flags = FLAGS_POR_CLASSE[classe] || FLAGS_POR_CLASSE.conhecimento_geral;
  const destino = DESTINO_POR_CLASSE[classe] || "resposta_leve";
  return {
    saida: {
      ...saida,
      precisaClarificacao: false,
      destino,
      permiteJob: flags.permiteJob === true,
      razaoCurta: [
        saida.razaoCurta,
        `IMP-094 F2: clarificação evitada (${ver.razao})`
      ]
        .filter(Boolean)
        .join(" — ")
        .slice(0, 220)
    },
    clarificacaoEvitada: true,
    razaoObs7: ver.razao,
    familiaBloqueio: ver.familiaBloqueio ?? null
  };
}

/**
 * OBS-7 — clarificação vs PC / destino canónico.
 * @param {object} resposta
 * @param {{
 *   clarificacaoEvitada?: boolean,
 *   destinoClarificacao?: string|null,
 *   razao?: string|null
 * }} [opts]
 * @returns {object}
 */
export function anexarObservabilidadeClarificacao(resposta, opts = {}) {
  const dadosPrev =
    resposta?.dados && typeof resposta.dados === "object" ? resposta.dados : {};
  const destinoEnc =
    opts.destinoClarificacao != null
      ? opts.destinoClarificacao
      : dadosPrev.encaminhamento &&
          typeof dadosPrev.encaminhamento === "object"
        ? /** @type {{ destino?: string }} */ (dadosPrev.encaminhamento).destino
        : null;
  const evitacao = opts.clarificacaoEvitada === true;
  return {
    ...resposta,
    dados: {
      ...dadosPrev,
      /** OBS-7 */
      clarificacaoEvitada: evitacao,
      destinoClarificacao: evitacao ? null : destinoEnc || null,
      ...(opts.razao ? { razaoClarificacaoObs7: opts.razao } : {})
    }
  };
}
