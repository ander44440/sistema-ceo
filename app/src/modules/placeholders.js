/**
 * Placeholders mínimos por módulo — estrutura, não telas complexas.
 */
import { htmlComMarcaCeo20 } from "../ui/identidadeCeo20.js";

export function renderModulo(rota) {
  return `
    <section class="workspace-module" data-module="${rota.id}">
      <p class="workspace-kicker">Módulo do posto de comando</p>
      <h1>${rota.titulo}</h1>
      <p>${htmlComMarcaCeo20(rota.descricao)}</p>
      <p class="meta">Reservado · rota <code>${rota.path}</code> · conteúdo entra em ciclos seguintes</p>
    </section>
  `;
}
