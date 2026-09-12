/**
 * IMP-074 — Markup só-leitura C3 no Centro de Situação.
 * Sem formulário. Sem escrita. Sem Conversa.
 * Sem imports MEP/Node: recebe a vista já filtrada (CONCEBIDO + origemCanal C3).
 */
function escaparHtml(texto) {
  return String(texto)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function htmlBlocoMepC3(propostas) {
  const lista = Array.isArray(propostas) ? propostas : [];
  const corpo =
    lista.length === 0
      ? `<p class="cs-mep-c3-vazio">Nenhuma proposta de produto em CONCEBIDO.</p>`
      : `<ul class="cs-mep-c3-lista">${lista
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
