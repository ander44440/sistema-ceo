/**
 * Pedido explícito de decisão (fecho executivo).
 * Usado pela política MRE «decisão sob conflito» e pela precedência sobre E4/C4.
 */

import { normalizarTexto } from "./lexicon.js";
import {
  decidirSoEmClausulaProposito,
  detectarPedidoInfoGathering
} from "./pedidoInfoGathering.js";

/**
 * Menu explícito de alternativas decisórias (posição executiva).
 * Ex.: aceitar | não aceitar | negociar | adiar — ≥3 marcas distintas.
 * Não activa em menção isolada de uma só alternativa.
 * @param {string} t — texto já normalizado
 * @returns {boolean}
 */
export function temMenuAlternativasDecisorias(t) {
  if (!t) return false;
  const marcas = [
    /\baceitar\b/.test(t),
    /\b(nao\s+aceitar|recusar|rejeitar)\b/.test(t),
    /\bnegociar\b/.test(t),
    /\badiar\b/.test(t)
  ];
  return marcas.filter(Boolean).length >= 3;
}

/**
 * Pedido explícito de decisão (fecho). Não activa em mera exploração
 * («o que achas», «trade-off») nem em «analisa e recomenda» sem verbo decisório.
 * Não activa em cláusulas de propósito («para decidir», «antes de decidir»)
 * nem em pedidos de informação/lacunas antes da decisão.
 * Menu explícito de alternativas (aceitar/não aceitar/negociar/adiar) conta como fecho.
 * «qual/que decisão|posição … recomenda|sugere» conta como fecho (antes de soAnaliseSemFecho).
 * Imperativo «apresente|dê|emita|declare … posição (executiva|clara)» e
 * «termine com|apresentando … posição (executiva|clara)» também contam como fecho (antes do gate).
 * @param {string} [texto]
 * @param {{ infoGathering?: boolean }} [opts] — Fatia 1: consumir IG já produzido (sem redetectar)
 * @returns {boolean}
 */
export function detectarPedidoDecisaoExplicita(texto, opts = {}) {
  const t = normalizarTexto(texto);
  if (!t) return false;

  // Info-gathering / lacunas pré-decisão → nunca PD
  const ig =
    opts.infoGathering != null
      ? opts.infoGathering === true
      : detectarPedidoInfoGathering(texto);
  if (ig) return false;

  // Menu decisório explícito → fecho (mesmo se houver «avalia/recomenda»)
  if (temMenuAlternativasDecisorias(t)) return true;

  // Fecho interrogativo: «qual/que decisão|posição … recomenda|sugere»
  if (
    /\b(qual|que)\s+decisao\b.{0,48}\b(recomenda|recomendaria|sugere|sugeriria)\b/.test(
      t
    )
  ) {
    return true;
  }
  if (
    /\b(qual|que)\s+posicao\b.{0,48}\b(recomenda|recomendaria|sugere|sugeriria)\b/.test(
      t
    )
  ) {
    return true;
  }

  // Fecho imperativo: posição + (executiva|clara)
  if (
    /\b(apresente|apresentar|emita|emitir|declare|declarar)\s+(uma\s+)?posicao\s+(executiva|clara)\b/.test(
      t
    )
  ) {
    return true;
  }
  if (/\bde\s+(uma\s+)?posicao\s+(executiva|clara)\b/.test(t)) {
    return true;
  }
  if (
    /\btermin[ae]\s+com\s+(uma\s+)?posicao\s+(executiva|clara)\b/.test(t) ||
    /\bterminar\s+com\s+(uma\s+)?posicao\s+(executiva|clara)\b/.test(t)
  ) {
    return true;
  }
  if (
    /\btermin[ae]\s+apresentando\s+(uma\s+)?posicao\s+(executiva|clara)\b/.test(
      t
    ) ||
    /\bterminar\s+apresentando\s+(uma\s+)?posicao\s+(executiva|clara)\b/.test(
      t
    )
  ) {
    return true;
  }

  // Análise/recomendação pura sem verbo de fecho → não é pedido de decisão
  const soAnaliseSemFecho =
    /\b(analisa|analise|analisar|avalia|avalie|avaliar|recomenda|recomendaria|recomendacao)\b/.test(
      t
    ) &&
    !/\b(decida|decide|decidir|decidam|escolh|toma|tome|tomar|fecha|feche|fechar)\b/.test(
      t
    );
  if (soAnaliseSemFecho) return false;

  // «decidir» / «tomar a decisão» só em propósito → não PD via estes ramos
  const soProposito = decidirSoEmClausulaProposito(t);
  if (soProposito) {
    /* continua para escolha/… (não activar por decidir/tomar) */
  } else if (/\b(decida|decide|decidir|decidam)\b/.test(t)) {
    return true;
  }
  // «tome/toma a decisão» = comando; «tomar a decisão» só se NÃO for propósito
  if (/\b(tome|toma)\s+(a\s+)?decisao\b/.test(t)) return true;
  if (!soProposito && /\btomar\s+(a\s+)?decisao\b/.test(t)) return true;
  if (/\b(feche|fecha|fechar)\s+(a\s+)?decisao\b/.test(t)) return true;
  if (/\bquero\s+(a\s+)?(sua|tua|vossa)\s+decisao\b/.test(t)) return true;
  if (/\b(sua|tua)\s+decisao\s+(agora|aqui|por\s+favor|pf)\b/.test(t)) return true;
  if (/\bescolh[ae]\s+(entre|uma|qual|o|a)\b/.test(t)) return true;
  if (/\bescolher\s+(entre|uma|qual)\b/.test(t)) return true;
  if (/\bpreciso\s+d[ae]\s+(sua|tua)\s+decisao\b/.test(t)) return true;
  if (/\bquero\s+que\s+(voce|tu)\s+(decida|decide|escolha)\b/.test(t)) return true;

  if (/\b(qual|que)\s+decisao\b.{0,48}\b(tomar|tome|toma)\b/.test(t)) return true;
  if (
    /\b(qual|que)\s+(caminho|alternativa|opcao)\b.{0,48}\b(escolher|escolha)\b/.test(
      t
    )
  ) {
    return true;
  }

  return false;
}
