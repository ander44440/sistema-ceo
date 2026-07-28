/**
 * D02 / D03 / D04 — estado, resumo e próximas ações do projeto ativo (Onda 03 E3).
 * Reutiliza obterPainelExecutivo — sem lógica paralela de classificação.
 */

import {
  obterDiaExecutivo,
  obterPainelExecutivo,
  obterProjetoAtivo,
  obterUltimaContinuidade
} from "../../catalogoProjetos/index.js";
import {
  gerarResumoDoDia,
  tomEstadoExecutivo
} from "../../catalogoProjetos/estadoExecutivo.js";

function escaparHtml(texto) {
  return String(texto)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function gaugeDoEstado(estado) {
  switch (estado) {
    case "Crítico":
      return { label: "Crítico", nivel: 82, tom: "danger" };
    case "Atenção":
      return { label: "Atenção", nivel: 58, tom: "warn" };
    case "Em andamento":
      return { label: "Em andamento", nivel: 36, tom: "ok" };
    default:
      return { label: "Estável", nivel: 18, tom: "ok" };
  }
}

/**
 * Dados prontos para pintar o Centro (projeto ativo).
 */
export function obterVistaDiaAtivo() {
  const projeto = obterProjetoAtivo();
  const painel = obterPainelExecutivo();
  const dia = obterDiaExecutivo();
  const continuidade = obterUltimaContinuidade();
  const resumo = projeto
    ? gerarResumoDoDia(projeto, {
        ativo: true,
        dia,
        continuidade
      })
    : "Nenhum projeto ativo. Abra Projetos e selecione um contexto.";

  return { projeto, painel, dia, continuidade, resumo };
}

/**
 * Cards de prioridade (métricas reais do painel).
 */
export function cardsPrioridadeDoPainel(painel) {
  if (!painel) {
    return [
      { tom: "brand", n: 0, titulo: "Projeto", desc: "Nenhum projeto ativo" },
      { tom: "warn", n: 0, titulo: "Pendências", desc: "—" },
      { tom: "ok", n: 0, titulo: "Decisões", desc: "—" },
      { tom: "brand", n: 0, titulo: "Próximas ações", desc: "—" }
    ];
  }
  const m = painel.metricas;
  const tomEstado = tomEstadoExecutivo(painel.estadoExecutivo);
  const tomCard =
    tomEstado === "critico"
      ? "danger"
      : tomEstado === "atencao"
        ? "warn"
        : tomEstado === "andamento"
          ? "brand"
          : "ok";
  return [
    {
      tom: tomCard,
      n: m.pendencias + m.proximasAcoes,
      titulo: "Estado",
      desc: painel.estadoExecutivo
    },
    {
      tom: m.pendencias ? "warn" : "ok",
      n: m.pendencias,
      titulo: "Pendências",
      desc: m.pendencias ? "Abertas no projeto ativo" : "Nenhuma pendência aberta"
    },
    {
      tom: "ok",
      n: m.decisoes,
      titulo: "Decisões",
      desc: m.decisoes ? "Registradas no projeto" : "Sem decisões ainda"
    },
    {
      tom: "brand",
      n: m.proximasAcoes,
      titulo: "Próximas ações",
      desc: m.proximasAcoes ? "Na fila do projeto" : "Nenhuma ação na fila"
    }
  ];
}

/**
 * HTML do rail: D02 + D03 + D04.
 */
export function htmlRailDiaAtivo(vista) {
  const { projeto, painel, resumo } = vista;
  const estado = painel?.estadoExecutivo || "Estável";
  const tom = tomEstadoExecutivo(estado);
  const gauge = gaugeDoEstado(estado);
  const badgeTom =
    tom === "critico"
      ? "critico"
      : tom === "atencao"
        ? "atencao"
        : tom === "andamento"
          ? "andamento"
          : "estavel";
  const m = painel?.metricas || {
    decisoes: 0,
    pendencias: 0,
    proximasAcoes: 0
  };
  const acoes = (projeto?.proximasAcoes || []).slice(0, 5);
  const resumoHtml = String(resumo || "")
    .split("\n")
    .filter(Boolean)
    .map((l) => `<p class="cs-resumo-linha">${escaparHtml(l)}</p>`)
    .join("");

  const listaAcoes =
    acoes.length === 0
      ? `<li class="cs-agenda-empty"><div><strong>—</strong><span>Nenhuma próxima ação. Registre em Projetos.</span></div></li>`
      : acoes
          .map((a, i) => {
            const tomItem = i === 0 ? "is-brand" : i === 1 ? "is-warn" : "is-ok";
            return `<li><i class="${tomItem}"></i><div><strong>${
              i === 0 ? "Agora" : `+${i}`
            }</strong><span>${escaparHtml(a.texto)}</span></div></li>`;
          })
          .join("");

  return `
    <article class="cs-panel" data-bloco="d02" aria-label="Estado executivo">
      <p class="cs-kicker">Estado Executivo</p>
      <div class="cs-estado-linha">
        <strong class="cs-estado-badge cs-estado-badge--${badgeTom}">${escaparHtml(
          estado
        )}</strong>
        <span>${escaparHtml(projeto?.nome || "Sem projeto")}</span>
      </div>
      <div class="cs-gauge cs-gauge--${gauge.tom}" style="--gauge:${gauge.nivel}">
        <div class="cs-gauge-arc" aria-hidden="true"></div>
        <div class="cs-gauge-label">
          <strong>${escaparHtml(gauge.label)}</strong>
          <span>Projeto ativo</span>
        </div>
      </div>
      <div class="cs-kpis">
        <div><span>Decisões</span><strong class="is-ok">${m.decisoes}</strong></div>
        <div><span>Pendências</span><strong class="is-${
          m.pendencias ? "warn" : "ok"
        }">${m.pendencias}</strong></div>
        <div><span>Ações</span><strong class="is-ok">${m.proximasAcoes}</strong></div>
      </div>
    </article>

    <article class="cs-panel" data-bloco="d03" aria-label="Resumo executivo do dia">
      <p class="cs-kicker">Resumo Executivo do Dia</p>
      <div class="cs-resumo-dia">${resumoHtml}</div>
    </article>

    <article class="cs-panel" data-bloco="d04" aria-label="Próximas ações">
      <p class="cs-kicker">Próximas Ações</p>
      <ul class="cs-agenda">${listaAcoes}</ul>
    </article>
  `;
}
