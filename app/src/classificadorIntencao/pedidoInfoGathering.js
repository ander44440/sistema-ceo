/**
 * Pedido de informação / lacunas antes de decidir (≠ pedido de fecho PD).
 * C2 deliberativo com modo lacunas — não fecho de decisão.
 */

import { normalizarTexto } from "./lexicon.js";

/**
 * Pedido de informação / lacunas / descoberta pré-decisão.
 * @param {string} [texto]
 * @returns {boolean}
 */
export function detectarPedidoInfoGathering(texto) {
  const t = normalizarTexto(texto);
  if (!t) return false;

  // Fecho imperativo inequívoco → não é info-gathering
  if (/\b(decida|decide|decidam)\b/.test(t) && /\bentre\b/.test(t)) {
    return false;
  }
  // «tome/toma a decisão» = comando; «tomar a decisão» pode ser propósito
  if (/\b(tome|toma)\s+(a\s+)?decisao\b/.test(t)) return false;
  if (/\btomar\s+(a\s+)?decisao\s+agora\b/.test(t)) return false;
  if (/\b(feche|fecha|fechar)\s+(a\s+)?decisao\b/.test(t)) return false;

  if (/\bquais\s+informa[cç]/.test(t)) return true;
  if (/\blistar\s+informa[cç]/.test(t)) return true;
  if (
    /\binforma[cç].{0,60}m[ií]nimas?\b/.test(t) &&
    (/\bantes\s+de\b/.test(t) || /\bavaliar\b/.test(t) || /\baumento\b/.test(t))
  ) {
    return true;
  }
  if (/\bn[aã]o\s+recomend/.test(t) && /\binforma[cç]/.test(t)) return true;
  if (/\bo\s+que\s+falta\s+(saber|descobrir|obter|avaliar)\b/.test(t)) {
    return true;
  }
  if (
    /\bo\s+que\s+(precisamos|falta|devemos)\s+(saber|descobrir|obter|averiguar)\b/.test(
      t
    )
  ) {
    return true;
  }
  if (
    /\bantes\s+de\s+(falar|agir|decidir|oferecer|negociar|tomar\s+(a\s+)?decisao).{0,100}\b(saber|obter|descobrir|informa|gostaria|dados|falt)\b/.test(
      t
    )
  ) {
    return true;
  }
  if (
    /\bquais\s+riscos?\b.{0,40}\b(ainda\s+)?(nao\s+)?(avaliamos|conhecemos|mapeamos|identificamos)\b/.test(
      t
    )
  ) {
    return true;
  }
  if (/\bgostaria\s+de\s+obter\b/.test(t)) return true;
  if (
    /\b(obter|descobrir|saber|dados)\b.{0,60}\bpara\s+(decidir|tomar\s+(a\s+)?decisao)\b/.test(
      t
    ) ||
    /\binforma[cç].{0,60}\bpara\s+(decidir|tomar\s+(a\s+)?decisao)\b/.test(t)
  ) {
    return true;
  }
  if (
    /\bpara\s+(decidir|tomar\s+(a\s+)?decisao)\b/.test(t) &&
    /\b(informa|saber|obter|descobrir|lacuna|falt|dados)/.test(t)
  ) {
    return true;
  }
  if (
    /\bantes\s+de\s+tomar\s+(a\s+)?decisao\b/.test(t) &&
    /\b(informa|saber|obter|descobrir|lacuna|falt|dados|quais)/.test(t)
  ) {
    return true;
  }
  return false;
}

/**
 * Hint estágio 6 — listar lacunas / informações; não fechar decisão.
 */
export function hintEstagio6InfoGathering() {
  return (
    " INFO-GATHERING (pedido de informações/lacunas): " +
    "O utilizador pede o que falta SABER ou OBTER antes de decidir — NÃO feche a decisão. " +
    "Obrigatório: estado=solicitar_dados; recomendacao = lista concreta de informações/lacunas " +
    "(factos, números, confirmações) a obter; justificativa explica por que cada item desbloqueia a escolha. " +
    "Proibido: repetir ou reafirmar a recomendação/decisão do turno anterior como resposta. " +
    "Proibido: estado=aprovar|rejeitar|delegar|monitorar como fecho. " +
    "Recomendações anteriores no fio são CONTEXTO, não mandato. A pergunta actual governa."
  );
}

/**
 * Remapeia decisão: info-gathering nunca fecha com aprovar/delegar/rejeitar.
 * @param {object} decisao
 * @param {{ pedidoInfoGathering?: boolean }} [opts]
 */
export function aplicarPoliticaInfoGathering(decisao, opts = {}) {
  if (!decisao || typeof decisao !== "object") return decisao;
  if (!opts.pedidoInfoGathering) return decisao;

  let estado = decisao.estado;
  let recomendacao = String(decisao.recomendacao || "").trim();
  let justificativa = String(decisao.justificativa || "").trim();

  const fecha =
    estado === "aprovar" ||
    estado === "rejeitar" ||
    estado === "delegar" ||
    estado === "adiar";
  const prosaDecisao =
    /\b(aprovo|aprovar|aprovado|rejeito|rejeitar|delego|delegar|decis[aã]o|recomend[oa]|adiar|adiei)\b/i.test(
      recomendacao
    );

  if (!fecha && !prosaDecisao && estado === "solicitar_dados") {
    return decisao;
  }

  estado = "solicitar_dados";
  if (fecha || prosaDecisao || !recomendacao) {
    if (
      !recomendacao ||
      prosaDecisao ||
      /\b(aprovo|aprovar|rejeito|delego|adiar)\b/i.test(recomendacao)
    ) {
      recomendacao =
        "Listar as informações mínimas em falta antes de qualquer recomendação — sem fechar decisão neste turno.";
    }
    justificativa = (
      justificativa +
      " INFO-GATHERING: turno pede lacunas/informações; fecho/recomendação removidos."
    ).trim();
  }

  return {
    ...decisao,
    estado,
    recomendacao,
    justificativa
  };
}

/**
 * «decidir» / «tomar a decisão» só em cláusula de propósito / preparação
 * (não imperativo nem escolha entre alternativas).
 * @param {string} t — texto já normalizado
 */
export function decidirSoEmClausulaProposito(t) {
  if (!t) return false;
  const temDecidir = /\bdecidir\b/.test(t);
  const temTomarDecisao = /\btomar\s+(a\s+)?decisao\b/.test(t);
  if (!temDecidir && !temTomarDecisao) return false;

  // Imperativos / 2ª pessoa de fecho
  if (/\b(decida|decide|decidam)\b/.test(t)) return false;
  if (/\b(tome|toma)\s+(a\s+)?decisao\b/.test(t)) return false;
  // Escolha explícita entre opções
  if (/\bentre\b/.test(t) && (temDecidir || temTomarDecisao)) return false;
  if (/\bescolh/.test(t) && (temDecidir || /\bdecisao\b/.test(t))) return false;
  // Comando temporal inequívoco
  if (/\bdecisao\s+agora\b/.test(t)) return false;

  return (
    /\bpara\s+(decidir|tomar\s+(a\s+)?decisao)\b/.test(t) ||
    /\bantes\s+de\s+(decidir|tomar\s+(a\s+)?decisao)\b/.test(t) ||
    /\bajude?-?me\s+a\s+(decidir|tomar\s+(a\s+)?decisao)\b/.test(t) ||
    /\bajudar\s+a\s+(decidir|tomar\s+(a\s+)?decisao)\b/.test(t) ||
    /\bajud(e|a)\s+a\s+(decidir|tomar\s+(a\s+)?decisao)\b/.test(t) ||
    /\binforma[cç].{0,80}\b(decidir|tomar\s+(a\s+)?decisao)\b/.test(t) ||
    /\b(obter|descobrir|saber|dados|gostaria\s+de\s+obter|falt).{0,80}\b(decidir|tomar\s+(a\s+)?decisao)\b/.test(
      t
    ) ||
    /\bantes\s+de\s+(falar|agir).{0,80}\b(decidir|tomar\s+(a\s+)?decisao)\b/.test(
      t
    ) ||
    /\b(quais|que)\s+.{0,100}\bantes\s+de\s+tomar\s+(a\s+)?decisao\b/.test(t)
  );
}
