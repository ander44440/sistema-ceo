/**
 * Placeholders mínimos por módulo — estrutura, não telas complexas.
 */
export function renderModulo(rota) {
  return `
    <section class="workspace-module" data-module="${rota.id}">
      <p class="workspace-kicker">Módulo do posto de comando</p>
      <h1>${rota.titulo}</h1>
      <p>${rota.descricao}</p>
      <p class="meta">Reservado · rota <code>${rota.path}</code> · conteúdo entra em ciclos seguintes</p>
    </section>
  `;
}
