/**
 * Faixa do Dia + painéis Abrir/Encerrar (Onda 03 — E2).
 * Integra diaExecutivo (E1) ao Centro sem novas rotas.
 */

import {
  abrirDiaExecutivo,
  encerrarDiaExecutivo,
  obterDiaExecutivo,
  obterProjetoAtivo,
  obterUltimaContinuidade
} from "../../catalogoProjetos/index.js";

function escaparHtml(texto) {
  return String(texto)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function rotuloStatus(status) {
  switch (status) {
    case "em_curso":
      return "Em curso";
    case "encerrado":
      return "Encerrado";
    default:
      return "Não iniciado";
  }
}

function tomStatus(status) {
  switch (status) {
    case "em_curso":
      return "andamento";
    case "encerrado":
      return "encerrado";
    default:
      return "idle";
  }
}

/**
 * HTML da faixa D01 + painéis D05/D06.
 * @param {"abrir"|"encerrar"|null} painelAberto
 */
export function htmlFaixaDoDia(painelAberto) {
  const projeto = obterProjetoAtivo();
  const dia = obterDiaExecutivo() || {
    status: "nao_iniciado",
    abertoEm: null,
    encerradoEm: null,
    intencaoDoDia: null,
    continuidade: []
  };
  const cont = obterUltimaContinuidade();
  const status = dia.status || "nao_iniciado";
  const tom = tomStatus(status);
  const podeAbrir = status !== "em_curso";
  const podeEncerrar = status === "em_curso";

  let continuidadeHint = "";
  if (cont) {
    continuidadeHint = `
      <p class="cs-dia-hint">
        Última continuidade (${escaparHtml(cont.dataRef)}):
        <strong>${escaparHtml(cont.proximoPassoAmanha)}</strong>
      </p>`;
  }

  let painel = "";
  if (painelAberto === "abrir") {
    painel = `
      <form class="cs-dia-painel" id="cs-form-abrir-dia" data-painel="abrir">
        <p class="cs-kicker">Abrir o dia</p>
        <p class="cs-dia-painel-desc">Projeto ativo: <strong>${escaparHtml(
          projeto?.nome || "—"
        )}</strong>. Opcionalmente registre a intenção do dia.</p>
        <label class="cs-dia-label" for="cs-dia-intencao">Intenção do dia (opcional)</label>
        <input id="cs-dia-intencao" name="intencao" type="text" maxlength="400"
          placeholder="Ex.: Avançar o build do MG2"
          value="${escaparHtml(cont?.proximoPassoAmanha && status !== "em_curso" ? cont.proximoPassoAmanha : "")}"
          autocomplete="off" />
        <div class="cs-dia-acoes">
          <button type="submit" class="cs-dia-btn is-primary">Confirmar abertura</button>
          <button type="button" class="cs-dia-btn" data-dia-cancel>Cancelar</button>
        </div>
      </form>`;
  } else if (painelAberto === "encerrar") {
    const andou =
      cont?.oQueAndou && cont.oQueAndou !== "(não informado)"
        ? cont.oQueAndou
        : "";
    const fica =
      cont?.oQueFica && cont.oQueFica !== "(não informado)" ? cont.oQueFica : "";
    const amanha =
      cont?.proximoPassoAmanha && cont.proximoPassoAmanha !== "(não informado)"
        ? cont.proximoPassoAmanha
        : "";
    const soLeitura = status === "encerrado" && Boolean(andou || fica || amanha);
    const ro = soLeitura ? " readonly" : "";
    painel = `
      <form class="cs-dia-painel" id="cs-form-encerrar-dia" data-painel="encerrar">
        <p class="cs-kicker">Encerrar o dia</p>
        <p class="cs-dia-painel-desc">${
          soLeitura
            ? "Continuidade registada pelo CEO — campos preenchidos a partir do estado operacional."
            : "Registre a continuidade para retomar amanhã sem ferramenta paralela."
        }</p>
        <label class="cs-dia-label" for="cs-dia-andou">O que andou</label>
        <input id="cs-dia-andou" name="andou" type="text" maxlength="500" required
          placeholder="O que foi feito hoje" autocomplete="off"
          value="${escaparHtml(andou)}"${ro} />
        <label class="cs-dia-label" for="cs-dia-fica">O que fica</label>
        <input id="cs-dia-fica" name="fica" type="text" maxlength="500" required
          placeholder="Pendências / o que permanece" autocomplete="off"
          value="${escaparHtml(fica)}"${ro} />
        <label class="cs-dia-label" for="cs-dia-amanha">Próximo passo de amanhã</label>
        <input id="cs-dia-amanha" name="amanha" type="text" maxlength="500" required
          placeholder="Primeiro foco do próximo dia" autocomplete="off"
          value="${escaparHtml(amanha)}"${ro} />
        <div class="cs-dia-acoes">
          ${
            soLeitura
              ? `<button type="button" class="cs-dia-btn" data-dia-cancel>Fechar</button>`
              : `<button type="submit" class="cs-dia-btn is-primary">Confirmar encerramento</button>
          <button type="button" class="cs-dia-btn" data-dia-cancel>Cancelar</button>`
          }
        </div>
      </form>`;
  }

  return `
    <section class="cs-dia" aria-label="Faixa do Dia" data-dia-status="${escaparHtml(status)}">
      <div class="cs-dia-faixa">
        <div class="cs-dia-info">
          <p class="cs-kicker">Fluxo Executivo Diário</p>
          <div class="cs-dia-titulo">
            <strong>${escaparHtml(projeto?.nome || "Nenhum projeto ativo")}</strong>
            <span class="cs-dia-badge cs-dia-badge--${tom}">${escaparHtml(
              rotuloStatus(status)
            )}</span>
          </div>
          ${
            dia.intencaoDoDia && status === "em_curso"
              ? `<p class="cs-dia-hint">Intenção: ${escaparHtml(dia.intencaoDoDia)}</p>`
              : continuidadeHint
          }
        </div>
        <div class="cs-dia-ctas">
          ${
            podeAbrir
              ? `<button type="button" class="cs-dia-btn is-primary" data-dia-acao="abrir">Abrir o dia</button>`
              : ""
          }
          ${
            podeEncerrar
              ? `<button type="button" class="cs-dia-btn is-primary" data-dia-acao="encerrar">Encerrar o dia</button>`
              : ""
          }
        </div>
      </div>
      ${painel}
    </section>
  `;
}

/**
 * Liga eventos D01/D05/D06.
 * @param {HTMLElement} root
 * @param {{ getPainel: () => string|null, setPainel: (v: string|null) => void, repintar: () => void }} api
 */
export function ligarFaixaDoDia(root, api) {
  root.querySelectorAll("[data-dia-acao]").forEach((btn) => {
    btn.addEventListener("click", () => {
      api.setPainel(btn.getAttribute("data-dia-acao"));
      api.repintar();
    });
  });

  root.querySelectorAll("[data-dia-cancel]").forEach((btn) => {
    btn.addEventListener("click", () => {
      api.setPainel(null);
      api.repintar();
    });
  });

  const formAbrir = root.querySelector("#cs-form-abrir-dia");
  formAbrir?.addEventListener("submit", (ev) => {
    ev.preventDefault();
    const intencao = root.querySelector("#cs-dia-intencao")?.value || "";
    abrirDiaExecutivo({ intencaoDoDia: intencao });
    api.setPainel(null);
    api.repintar();
  });

  const formEncerrar = root.querySelector("#cs-form-encerrar-dia");
  formEncerrar?.addEventListener("submit", (ev) => {
    ev.preventDefault();
    const oQueAndou = root.querySelector("#cs-dia-andou")?.value || "";
    const oQueFica = root.querySelector("#cs-dia-fica")?.value || "";
    const proximoPassoAmanha = root.querySelector("#cs-dia-amanha")?.value || "";
    const r = encerrarDiaExecutivo({ oQueAndou, oQueFica, proximoPassoAmanha });
    if (r && r.ok === false) return;
    api.setPainel(null);
    api.repintar();
  });
}
