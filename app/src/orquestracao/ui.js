/**
 * UI progressiva do Painel de Orquestração — IMP-055 E3/E4/E5.
 * Vista principal: Nome · Estado · descrição resumida.
 * E4: detalhe allowlisted só sob expansão. E5: SSE + fallback polling.
 */

import {
  CAMPOS_VISTA_PRINCIPAL,
  NOS_V1,
  extrairVistaPrincipal,
  montarNo,
  validarVistaPrincipal
} from "./dominio.js";
import {
  alternarIdExpandido,
  extrairLinhasDetalhe
} from "./detalhe.js";
import { HINT_DEGRADADO, HINT_POLLING, HINT_SSE } from "./streamContrato.js";
import { ligarTempoRealOrquestracao } from "./tempoReal.js";

/** Padrões técnicos proibidos na vista principal (checklist Progressividade). */
export const PADROES_PROIBIDOS_VISTA = Object.freeze([
  /origemSinal/i,
  /\bdetalhe\b/i,
  /atualizadoEm/i,
  /api[_-]?key/i,
  /heartbeat/i,
  /sk-[a-zA-Z0-9]{8,}/i,
  /Bearer\s+/i
]);

const ROTULO_ESTADO = Object.freeze({
  Disponivel: "Disponível",
  Executando: "Executando",
  Aguardando: "Aguardando",
  Ocioso: "Ocioso",
  Erro: "Erro"
});

function escaparHtml(texto) {
  return String(texto)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Remove blocos de detalhe expandido antes da checklist da vista principal.
 * @param {string} html
 */
export function htmlSemBlocosDetalhe(html) {
  return String(html || "").replace(
    /<div\b[^>]*\bcs-orq-detalhe\b[^>]*>[\s\S]*?<\/div>/gi,
    ""
  );
}

/**
 * @param {string} estado
 */
export function classeEstado(estado) {
  const map = {
    Disponivel: "disponivel",
    Executando: "executando",
    Aguardando: "aguardando",
    Ocioso: "ocioso",
    Erro: "erro"
  };
  return map[estado] || "ocioso";
}

/**
 * HTML do painel de detalhe (só quando expandido).
 * @param {object} no
 */
export function htmlBlocoDetalhe(no) {
  const linhas = extrairLinhasDetalhe(no);
  const itens = linhas
    .map(
      (l) => `<li><span class="cs-orq-detalhe-rotulo">${escaparHtml(l.rotulo)}</span>
        <span class="cs-orq-detalhe-valor">${escaparHtml(l.valor)}</span></li>`
    )
    .join("");
  return `<div class="cs-orq-detalhe" data-orq-detalhe="1">
    <p class="cs-orq-detalhe-titulo">Detalhe</p>
    <ul class="cs-orq-detalhe-lista">${itens}</ul>
  </div>`;
}

/**
 * @param {object} no — nó completo (id + vista + opcionais)
 * @param {{ expandido?: boolean }} [opts]
 * @returns {string}
 */
export function htmlCartaoNoVistaPrincipal(no, opts = {}) {
  const expandido = Boolean(opts.expandido);
  const id = no && typeof no.id === "string" ? no.id : "";
  const vista = extrairVistaPrincipal(no || {});
  const v = validarVistaPrincipal(vista);

  if (!v.ok) {
    return `<article class="cs-orq-no cs-orq-no--erro" data-orq-id="${escaparHtml(id)}" data-orq-campos="nome,estado,descricaoResumida" tabindex="0" role="button" aria-expanded="false">
      <div class="cs-orq-principal">
        <h3 class="cs-orq-nome">—</h3>
        <p class="cs-orq-estado"><span class="cs-orq-dot" aria-hidden="true"></span><span class="cs-orq-estado-label">Erro</span></p>
        <p class="cs-orq-desc">Estado indisponível.</p>
      </div>
    </article>`;
  }

  const cls = classeEstado(vista.estado);
  const rotulo = ROTULO_ESTADO[vista.estado] || vista.estado;
  const expandCls = expandido ? " is-expandido" : "";
  const detalheHtml = expandido ? htmlBlocoDetalhe(no) : "";

  return `<article class="cs-orq-no cs-orq-no--${cls}${expandCls}" data-orq-id="${escaparHtml(id)}" data-orq-campos="${CAMPOS_VISTA_PRINCIPAL.join(",")}" tabindex="0" role="button" aria-expanded="${expandido ? "true" : "false"}">
    <div class="cs-orq-principal">
      <h3 class="cs-orq-nome">${escaparHtml(vista.nome)}</h3>
      <p class="cs-orq-estado">
        <span class="cs-orq-dot" aria-hidden="true"></span>
        <span class="cs-orq-estado-label">${escaparHtml(rotulo)}</span>
      </p>
      <p class="cs-orq-desc">${escaparHtml(vista.descricaoResumida)}</p>
    </div>
    ${detalheHtml}
  </article>`;
}

/**
 * @param {Array<object>} nos
 * @param {{ idExpandido?: string | null }} [opts]
 */
export function htmlGrelhaNos(nos, opts = {}) {
  const lista = Array.isArray(nos) ? nos : [];
  const idExpandido = opts.idExpandido || null;
  return lista
    .map((no) =>
      htmlCartaoNoVistaPrincipal(no, {
        expandido: Boolean(no && no.id && no.id === idExpandido)
      })
    )
    .join("");
}

/**
 * Conta blocos de detalhe visíveis no HTML.
 * @param {string} html
 */
export function contarDetalhesExpandidosHtml(html) {
  return (String(html).match(/\bdata-orq-detalhe="1"/g) || []).length;
}

/**
 * Shell estático do painel (inserido no Centro, abaixo da Conversa).
 */
export function htmlPainelOrquestracao() {
  return `<section class="cs-orq" aria-label="Orquestração Executiva" data-cs-orq>
    <div class="cs-section-head cs-orq-head">
      <h2>Orquestração Executiva</h2>
      <span class="cs-orq-hint" id="cs-orq-hint" aria-live="polite">A actualizar…</span>
    </div>
    <div class="cs-orq-grid" id="cs-orq-grid" role="list" aria-live="polite"></div>
  </section>`;
}

/**
 * Checklist Progressividade sobre a vista principal (ignora blocos expandido).
 * @param {string} html
 * @returns {{ ok: boolean, falhas: string[] }}
 */
export function checklistProgressividadeHtml(html) {
  const falhas = [];
  const texto = htmlSemBlocosDetalhe(html);
  for (const re of PADROES_PROIBIDOS_VISTA) {
    if (re.test(texto)) {
      falhas.push(`padrão proibido: ${re}`);
    }
  }
  const camposAttr = [...texto.matchAll(/data-orq-campos="([^"]+)"/g)].map(
    (m) => m[1]
  );
  for (const attr of camposAttr) {
    const campos = attr.split(",").map((s) => s.trim());
    if (campos.length !== 3) {
      falhas.push(`cartão com ${campos.length} campos (esperado 3)`);
    }
    for (const c of campos) {
      if (!CAMPOS_VISTA_PRINCIPAL.includes(c)) {
        falhas.push(`campo não permitido: ${c}`);
      }
    }
    for (const obrig of CAMPOS_VISTA_PRINCIPAL) {
      if (!campos.includes(obrig)) {
        falhas.push(`campo em falta: ${obrig}`);
      }
    }
  }
  if (!/cs-orq-nome/.test(texto) || !/cs-orq-estado/.test(texto) || !/cs-orq-desc/.test(texto)) {
    falhas.push("marcadores de vista principal em falta");
  }
  return { ok: falhas.length === 0, falhas };
}

/**
 * Conta cartões na grelha HTML.
 * @param {string} html
 */
export function contarCartoesHtml(html) {
  return (String(html).match(/class="cs-orq-no\b/g) || []).length;
}

/**
 * Liga SSE (preferido) + fallback polling + expansão. Devolve função para parar.
 * @param {ParentNode} root
 * @param {{
 *   fetchImpl?: typeof fetch,
 *   EventSourceImpl?: typeof EventSource,
 *   intervaloMs?: number,
 *   obterSnapshot?: Function,
 *   preferirSse?: boolean,
 *   apiBase?: string
 * }} [opts]
 * @returns {() => void}
 */
export function ligarPainelOrquestracao(root, opts = {}) {
  const grid = root.querySelector("#cs-orq-grid");
  const hint = root.querySelector("#cs-orq-hint");
  if (!grid) return () => {};

  let parado = false;
  /** @type {object[]} */
  let nosCache = [];
  /** @type {string | null} */
  let idExpandido = null;
  /** @type {"sse"|"polling"|"degradado"} */
  let modoActual = "polling";

  function pintarGrelha(nos, mensagemHint) {
    if (parado || !grid.isConnected) return;
    nosCache = Array.isArray(nos) ? nos : [];
    grid.innerHTML = htmlGrelhaNos(nosCache, { idExpandido });
    if (hint) hint.textContent = mensagemHint;
  }

  function onToggle(ev) {
    if (parado) return;
    const alvo =
      ev.target && ev.target.closest
        ? ev.target.closest(".cs-orq-no")
        : null;
    if (!alvo || !grid.contains(alvo)) return;
    if (ev.type === "keydown") {
      if (ev.key !== "Enter" && ev.key !== " ") return;
      ev.preventDefault();
    }
    const id = alvo.getAttribute("data-orq-id");
    if (!id) return;
    idExpandido = alternarIdExpandido(idExpandido, id);
    const hintTxt =
      modoActual === "sse"
        ? HINT_SSE
        : modoActual === "degradado"
          ? HINT_DEGRADADO
          : HINT_POLLING;
    pintarGrelha(nosCache, hint ? hint.textContent || hintTxt : hintTxt);
  }

  if (typeof grid.addEventListener === "function") {
    grid.addEventListener("click", onToggle);
    grid.addEventListener("keydown", onToggle);
  }

  const pararTempoReal = ligarTempoRealOrquestracao({
    fetchImpl: opts.fetchImpl,
    EventSourceImpl: opts.EventSourceImpl,
    obterSnapshot: opts.obterSnapshot,
    intervaloPollingMs: opts.intervaloMs,
    preferirSse: opts.preferirSse,
    apiBase: opts.apiBase,
    onModo: (m) => {
      modoActual = m;
    },
    onNos: (nos, mensagemHint, modo) => {
      if (parado) return;
      modoActual = modo;
      if (modo === "degradado" && (!nos || !nos.length)) {
        pintarGrelha(
          NOS_V1.map((id) => montarNo(id, "Erro")),
          HINT_DEGRADADO
        );
        return;
      }
      if (modo === "degradado") {
        // se cache vazio ou incompleto, força Erro V1
        const ids = new Set((nos || []).map((n) => n && n.id));
        if (ids.size < NOS_V1.length) {
          pintarGrelha(
            NOS_V1.map((id) => montarNo(id, "Erro")),
            HINT_DEGRADADO
          );
          return;
        }
      }
      pintarGrelha(nos, mensagemHint);
    }
  });

  return function pararPainelOrquestracao() {
    parado = true;
    pararTempoReal();
    if (typeof grid.removeEventListener === "function") {
      grid.removeEventListener("click", onToggle);
      grid.removeEventListener("keydown", onToggle);
    }
  };
}
