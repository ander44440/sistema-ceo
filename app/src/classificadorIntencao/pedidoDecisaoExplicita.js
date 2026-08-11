/**
 * Pedido explícito de decisão (fecho executivo).
 * Usado pela política MRE «decisão sob conflito» e pela precedência sobre E4/C4.
 */

import { normalizarTexto } from "./lexicon.js";

/**
 * Pedido explícito de decisão (fecho). Não activa em mera exploração
 * («o que achas», «trade-off») nem em «analisa e recomenda» sem verbo decisório.
 * @param {string} [texto]
 * @returns {boolean}
 */
export function detectarPedidoDecisaoExplicita(texto) {
  const t = normalizarTexto(texto);
  if (!t) return false;

  // Análise/recomendação pura sem verbo de fecho → não é pedido de decisão
  const soAnaliseSemFecho =
    /\b(analisa|analise|analisar|avalia|avalie|avaliar|recomenda|recomendaria|recomendacao)\b/.test(
      t
    ) &&
    !/\b(decida|decide|decidir|decidam|escolh|toma|tome|tomar|fecha|feche|fechar)\b/.test(
      t
    );
  if (soAnaliseSemFecho) return false;

  if (/\b(decida|decide|decidir|decidam)\b/.test(t)) return true;
  if (/\b(tome|toma|tomar)\s+(a\s+)?decisao\b/.test(t)) return true;
  if (/\b(feche|fecha|fechar)\s+(a\s+)?decisao\b/.test(t)) return true;
  if (/\bquero\s+(a\s+)?(sua|tua|vossa)\s+decisao\b/.test(t)) return true;
  if (/\b(sua|tua)\s+decisao\s+(agora|aqui|por\s+favor|pf)\b/.test(t)) return true;
  if (/\bescolh[ae]\s+(entre|uma|qual|o|a)\b/.test(t)) return true;
  if (/\bescolher\s+(entre|uma|qual)\b/.test(t)) return true;
  if (/\bpreciso\s+d[ae]\s+(sua|tua)\s+decisao\b/.test(t)) return true;
  if (/\bquero\s+que\s+(voce|tu)\s+(decida|decide|escolha)\b/.test(t)) return true;

  return false;
}
