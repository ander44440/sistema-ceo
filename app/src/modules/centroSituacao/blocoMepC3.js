/**
 * IMP-074 — Bloco só-leitura C3 no Centro de Situação.
 * Sem formulário. Sem escrita. Sem Conversa.
 */
import { listarPropostasC3 } from "../../mepCeo/c3.js";

function escaparHtml(texto) {
  return String(texto)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function htmlBlocoMepC3() {
  const propostas = listarPropostasC3();
  const corpo =
    propostas.length === 0
      ? `<p class="cs-mep-c3-vazio">Nenhuma proposta de produto em CONCEBIDO.</p>`
      : `<ul class="cs-mep-c3-lista">${propostas
          .map(
            (p) => `<li>
            <span class="cs-mep-c3-id">${escaparHtml(p.id)}</span>
            <span class="cs-mep-c3-tipo">${escaparHtml(p.tipoLacunaProduto)}</span>
            <p>${escaparHtml(p.enunciadoDesidentificado)}</p>
            <span class="cs-mep-c3-estado">${escaparHtml(p.maturidade)}</span>
          </li>`
          )
          .join("")}</ul>`;

  return `<section class="cs-card cs-mep-c3" aria-label="Propostas de evolução do produto">
    <p class="cs-kicker">Propostas de evolução do produto</p>
    <p class="cs-mep-c3-origem">Origem C3 · hipótese · não é facto nem baseline</p>
    ${corpo}
  </section>`;
}
