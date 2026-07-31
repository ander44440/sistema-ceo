/**
 * Ponte Centro de Situação ← ComunicadoExecutivo (IMP-016).
 * Não chama MRE; apenas apresenta destaques já produzidos pelo Speaker.
 */

import { destaquesCentro } from "../canais/adaptarCanal.js";

const ULTIMA_CHAVE = "ceo.mre.ultimaDeliberacaoDestaques";

/**
 * Guarda destaques da última deliberação (sessão browser).
 * @param {object} comunicado
 */
export function registarDestaquesDeliberacao(comunicado) {
  if (typeof sessionStorage === "undefined") return;
  try {
    const itens = destaquesCentro(comunicado);
    sessionStorage.setItem(
      ULTIMA_CHAVE,
      JSON.stringify({
        parecerId: comunicado.parecerId,
        referenciaDecisao: comunicado.referenciaDecisao,
        destaques: itens,
        em: new Date().toISOString()
      })
    );
  } catch {
    /* storage opcional */
  }
}

/**
 * Lê destaques da última deliberação para o centro de situação.
 * @returns {object|null}
 */
export function lerDestaquesDeliberacao() {
  if (typeof sessionStorage === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(ULTIMA_CHAVE);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * HTML mínimo de bloco deliberativo (opcional no painel).
 */
export function htmlBlocoDeliberacao(dados) {
  if (!dados || !Array.isArray(dados.destaques) || !dados.destaques.length) {
    return "";
  }
  const itens = dados.destaques
    .map(
      (d) =>
        `<li>${String(d)
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")}</li>`
    )
    .join("");
  return `<section class="centro-deliberacao" aria-label="Última deliberação">
    <h3>Última deliberação</h3>
    <p class="centro-deliberacao-meta">Decisão: ${String(dados.referenciaDecisao || "—")}</p>
    <ul>${itens}</ul>
  </section>`;
}
