import { esc } from "../shell.js";

function esqueleto(titulo, texto, moduloId, runtime) {
  const c = runtime.obterConector(moduloId);
  return `
    <section class="panel skeleton-card">
      <p class="label">Módulo estrutural</p>
      <h2>${esc(titulo)}</h2>
      <p>${esc(texto)}</p>
      <div class="mod-slot">
        <strong>Slot de evolução:</strong> ${esc(moduloId)} ·
        status: ${esc(c?.status || "esqueleto")} ·
        ${esc(c?.descricao || "Pronto para ligação incremental a capacidades reais.")}
      </div>
    </section>
  `;
}

export function renderConversas(runtime, shellApi) {
  shellApi.render(
    esqueleto(
      "Conversas",
      "O fluxo conversacional ocorre no Painel (REQ-041). Este destino é auxiliar (REQ-043 / D16).",
      "conversas",
      runtime
    )
  );
}

export function renderMemoria(runtime, shellApi) {
  shellApi.render(
    esqueleto(
      "Memória",
      "Património do COA ativo. Conteúdo rico entra por ciclos ADR-006; isolamento por COA (REQ-039).",
      "memoria",
      runtime
    )
  );
}

export function renderConfiguracoes(runtime, shellApi) {
  const conectores = runtime.listarConectores();
  shellApi.render(`
    <section class="panel skeleton-card">
      <p class="label">Configurações</p>
      <h2>Infraestrutura de módulos</h2>
      <p>Preferências avançadas ficam fora deste ciclo. Abaixo: conectores registados para evolução incremental.</p>
      <ul class="lista" style="margin-top:0.85rem">
        ${
          conectores.length
            ? conectores
                .map(
                  (c) =>
                    `<li><strong>${esc(c.id)}</strong> — ${esc(c.status)} · ${esc(
                      c.descricao || ""
                    )}</li>`
                )
                .join("")
            : `<li class="valor ausente">Nenhum conector extra registado.</li>`
        }
      </ul>
      <div class="mod-slot">
        Layout permanente em <code>app/</code> · domínio CAP-03 em <code>public/legacy/</code> ·
        deliberação: docs/learning/2026-07-26-inicio-construcao-ceo.md
      </div>
    </section>
  `);
}
