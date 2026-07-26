import { esc } from "../shell.js";

export function renderProjetos(runtime, shellApi) {
  const projetosUi = runtime.projetos;
  let estado = projetosUi.inicializar();

  const wrap = document.createElement("div");

  function pintar() {
    estado = projetosUi.montarEstado();
    wrap.innerHTML = `
      <section class="panel" data-srf="SRF-T01">
        <p class="label">Projetos · Contextos Operacionais</p>
        <p class="note">${esc(
          estado.mensagem ||
            "Gerir Projetos e abrir o COA ativo. A navegação inferior nunca altera o COA."
        )}</p>
        <div class="proj-lista" style="margin-top:0.85rem">
          ${
            estado.vazio
              ? `<p class="valor ausente">Catálogo vazio — crie o primeiro Projeto.</p>`
              : estado.projetos
                  .map(
                    (p) => `
            <article class="proj-item ${p.coaId === estado.coaAtivoId ? "ativo" : ""}">
              <div>
                <h3>${esc(p.nome)}</h3>
                <p>${esc(p.objetivoPrincipal || "")}</p>
                <p>Status: ${esc(p.statusCicloVida || "—")} · ${
                      p.coaId === estado.coaAtivoId ? "COA ativo" : "inativo"
                    }</p>
              </div>
              <div style="display:flex;gap:0.4rem;flex-wrap:wrap">
                <button type="button" class="btn ghost" data-abrir="${esc(
                  p.coaId
                )}">Abrir</button>
              </div>
            </article>`
                  )
                  .join("")
          }
        </div>
      </section>
      <section class="panel">
        <p class="label">Novo Projeto</p>
        <form id="form-proj" class="form-row">
          <div class="campo">
            <label class="label" for="nome">Nome</label>
            <input id="nome" name="nome" type="text" required placeholder="Ex.: Motoboy Game 2" />
          </div>
          <div class="campo">
            <label class="label" for="obj">Objetivo principal</label>
            <input id="obj" name="obj" type="text" required placeholder="O que este contexto governa?" />
          </div>
          <div class="campo">
            <label class="label" for="desc">Descrição (opcional)</label>
            <textarea id="desc" name="desc" placeholder="Notas"></textarea>
          </div>
          <button type="submit" class="btn">Criar Projeto</button>
        </form>
      </section>
      <div class="mod-slot">
        <strong>Conector · projetos:</strong> Catálogo CAP-03 · status: ${esc(
          runtime.obterConector("projetos")?.status || "local"
        )}
      </div>
    `;

    wrap.querySelectorAll("[data-abrir]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-abrir");
        let r = projetosUi.abrirProjeto(id);
        if (r.status === "confirmacao_requerida") {
          if (confirm(r.estado?.mensagem || "Confirmar troca de COA?")) {
            runtime.sessao.trocar(id, { confirmado: true });
          }
        }
        shellApi.atualizarLente();
        pintar();
      });
    });

    wrap.querySelector("#form-proj").addEventListener("submit", (ev) => {
      ev.preventDefault();
      const nome = wrap.querySelector("#nome").value.trim();
      const objetivoPrincipal = wrap.querySelector("#obj").value.trim();
      const descricao = wrap.querySelector("#desc").value.trim();
      try {
        const criado = projetosUi.criarProjeto({
          nome,
          objetivoPrincipal,
          descricao: descricao || undefined
        });
        projetosUi.abrirProjeto(criado.projeto.coaId);
        shellApi.atualizarLente();
        pintar();
      } catch (e) {
        alert(String(e.message || e));
      }
    });
  }

  pintar();
  shellApi.render(wrap);
}
