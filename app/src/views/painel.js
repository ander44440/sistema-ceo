import { esc } from "../shell.js";

export function renderPainel(runtime, shellApi) {
  const homeState = runtime.home.montarHome();
  const superficie = runtime.conversa.montarSuperficie();
  const resumo = homeState.resumo;
  const blocos = homeState.blocos;
  const conector = runtime.obterConector("conversa");

  const ausente = (v) => !v || String(v).startsWith("Ausência");

  const wrap = document.createElement("div");
  wrap.className = "layout-executivo";
  wrap.innerHTML = `
    <section class="panel principal" data-srf="SRF-T03" data-reg="REG-03" aria-label="Conversa executiva">
      <p class="label">Conversa · interface principal</p>
      <p class="valor soft" style="margin-bottom:0.85rem">${esc(
        homeState.precisaProjeto
          ? "Abra um Projeto em Projetos para conversar sob um COA."
          : `Contexto: ${resumo.projeto || "—"}`
      )}</p>
      <div class="historico" id="hist" aria-live="polite"></div>
      <p class="label">Exemplos</p>
      <ul class="exemplos" id="exs"></ul>
      <div class="campo">
        <label class="label" for="msg">A sua mensagem</label>
        <textarea id="msg" ${homeState.precisaProjeto ? "disabled" : ""} placeholder="Fale com o CEO…"></textarea>
      </div>
      <button type="button" class="btn" id="enviar" ${
        homeState.precisaProjeto ? "disabled" : ""
      }>Enviar ao CEO</button>
      <p class="note" style="margin-top:0.75rem">${esc(superficie.limitacao || "")}</p>
      <div class="mod-slot">
        <strong>Conector · conversa:</strong>
        ${esc(conector?.descricao || "Determinístico (CAP-03). Pronto para ligar LLM via ADR-006.")}
        · status: ${esc(conector?.status || "simulado")}
      </div>
    </section>
    <aside>
      <section class="panel" data-srf="SRF-T02" data-reg="REG-02" aria-label="Dashboard Executivo">
        <p class="label">Dashboard Executivo</p>
        <div class="campo">
          <p class="label">Objetivo</p>
          <div class="valor ${ausente(resumo.objetivo) ? "ausente" : ""}">${esc(
            resumo.objetivo
          )}</div>
        </div>
        <div class="campo">
          <p class="label">Situação atual</p>
          <div class="valor ${ausente(resumo.situacaoAtual) ? "ausente" : ""}">${esc(
            resumo.situacaoAtual
          )}</div>
        </div>
        <div class="campo">
          <p class="label">Próximo passo</p>
          <div class="valor soft ${ausente(resumo.proximoPasso) ? "ausente" : ""}">${esc(
            resumo.proximoPasso
          )}</div>
        </div>
        <div class="campo">
          <p class="label">Risco / atenção</p>
          <div class="valor ${ausente(resumo.risco) ? "ausente" : ""}">${esc(resumo.risco)}</div>
        </div>
        <div class="campo">
          <p class="label">Pendências</p>
          <div class="valor ${ausente(resumo.pendencias) ? "ausente" : ""}">${esc(
            resumo.pendencias
          )}</div>
        </div>
      </section>
      <section class="panel">
        <p class="label">Blocos de apoio</p>
        <div class="grid tres">
          ${blocoHtml("Decisões", blocos.decisoesPendentes)}
          ${blocoHtml("Conhecimento", blocos.conhecimentosRecentes)}
          ${blocoHtml("Atividades", blocos.atividadesRecentes)}
        </div>
      </section>
    </aside>
  `;

  function blocoHtml(titulo, itens) {
    const lista =
      !itens || itens.length === 0
        ? `<ul class="lista vazia"><li>${esc(blocos.ausencia || "Sem registos")}</li></ul>`
        : `<ul class="lista">${itens
            .slice(0, 5)
            .map((i) => `<li>${esc(i.titulo)}</li>`)
            .join("")}</ul>`;
    return `<div><p class="label">${esc(titulo)}</p>${lista}</div>`;
  }

  function pintarHistorico() {
    const hist = wrap.querySelector("#hist");
    const turnos = runtime.conversa.listarHistorico();
    if (!turnos.length) {
      hist.innerHTML = `<p class="valor ausente">Ainda sem turnos neste COA. Comece a conversa.</p>`;
      return;
    }
    hist.innerHTML = turnos
      .map(
        (t) => `
      <article class="turno">
        <div class="u">Você · ${esc(t.quando || "")}</div>
        <div>${esc(t.textoUsuario || "")}</div>
        <div class="r" style="margin-top:0.35rem"><strong>CEO</strong> · ${esc(
          t.resposta || ""
        )}</div>
      </article>`
      )
      .join("");
    hist.scrollTop = hist.scrollHeight;
  }

  const exs = wrap.querySelector("#exs");
  (superficie.exemplos || []).forEach((ex) => {
    const li = document.createElement("li");
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = ex;
    b.addEventListener("click", () => {
      wrap.querySelector("#msg").value = ex;
      wrap.querySelector("#msg").focus();
    });
    li.appendChild(b);
    exs.appendChild(li);
  });

  wrap.querySelector("#enviar").addEventListener("click", () => {
    const ta = wrap.querySelector("#msg");
    const texto = ta.value.trim();
    if (!texto) return;
    try {
      runtime.conversa.enviar(texto);
      ta.value = "";
      shellApi.atualizarLente();
      pintarHistorico();
    } catch (e) {
      alert(String(e.message || e));
    }
  });

  pintarHistorico();
  shellApi.render(wrap);
}
