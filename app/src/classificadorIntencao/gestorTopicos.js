/**
 * Gestor de Tópicos — IMP-063 / REQ-063 / ARQ-024.
 * Módulo auxiliar puro: não classifica intenção, não cria Jobs, não toca Gate/Motor/NCS.
 * Consome a janela IMP-061; coordena-se com o Resolvedor IMP-062.
 */

import { mensagemEhDeixisOuFollowUp } from "./historicoRecente.js";
import { LEXICO_TOPICOS, normalizarTexto } from "./resolverReferencias.js";

/** Limiar interno de shift (ARQ-024) — independente de LIMIAR_CONFIANCA 0,55. */
export const LIMIAR_SHIFT = 0.65;

/** Margem mínima entre candidatos; abaixo → ambiguo_topico. */
export const MARGEM_TOPICO = 0.12;

/** Máximo de tópicos em pausa (REQ-063 RF3). */
export const MAX_PAUSAS = 2;

/**
 * @typedef {"usuario"|"ceo"|"coa"|"sistema"} OrigemTopico
 * @typedef {"continuar"|"shift"|"retomar"|"ambiguo_topico"|"neutro"} EventoTopico
 *
 * @typedef {object} TopicoConversacional
 * @property {string} id
 * @property {string} ancora
 * @property {string} [familia]
 * @property {OrigemTopico} origem
 * @property {string} actualizadoEm
 *
 * @typedef {object} EntradaGestaoTopicos
 * @property {string} mensagem
 * @property {ReadonlyArray<{ papel: "usuario"|"ceo", texto: string }>} [historicoRecente]
 * @property {TopicoConversacional|null} [topicoActivo]
 * @property {ReadonlyArray<TopicoConversacional>} [pausas]
 * @property {boolean} [frenteActiva]
 * @property {{ id?: string, nome?: string, titulo?: string }|null} [coa]
 * @property {boolean} [gatePendente]
 * @property {string} [agoraIso]
 *
 * @typedef {object} ResultadoGestaoTopicos
 * @property {EventoTopico} evento
 * @property {TopicoConversacional|null} topicoActivo
 * @property {TopicoConversacional[]} pausas
 * @property {string} [perguntaCurta]
 * @property {string} [clarificacaoGateShift]
 * @property {string} razaoTopico
 * @property {boolean} commitEstado
 */

const FAMILIA_ANCORA = Object.freeze({
  outdoor: "outdoor",
  painel: "outdoor",
  pagamento: "pagamento",
  MG2: "mg2",
  mg2: "mg2",
  "COA / frente": "coa",
  jobs: "job",
  "bugs / erros": "bugs",
  Dispatcher: "dispatcher",
  Motor: "motor",
  fila: "fila"
});

const RE_SHIFT =
  /\b(agora\s+sobre|mudando\s+de\s+assunto|mudar\s+de\s+assunto|deixemos\s+(o|a)|passando\s+(ao|à|a|para)|falando\s+(de|do|da)|vamos\s+(falar|tratar)\s+(de|do|da)|quero\s+falar\s+(de|do|da))\b/i;

const RE_RETOMAR =
  /\b(voltando\s+(a|ao|à|para)|retomando|retomar|voltar\s+(a|ao|à|para)|regressando\s+(a|ao|à))\b/i;

/** Famílias genéricas — não geram ambiguidade face a âncora específica (alinhado IMP-062). */
const FAMILIAS_GENERICAS = new Set(["mg2", "coa"]);

/**
 * Preferir âncoras específicas a MG2/COA.
 * @param {Array<{ id: string, ancora: string, familia: string, confianca: number }>} ancoras
 */
export function preferirAncorasEspecificas(ancoras) {
  const lista = Array.isArray(ancoras) ? ancoras : [];
  const espec = lista.filter((a) => !FAMILIAS_GENERICAS.has(a.familia));
  return espec.length ? espec : lista;
}

/**
 * @param {string} ancora
 */
export function familiaDeAncora(ancora) {
  const a = String(ancora || "").trim();
  if (!a) return "";
  if (FAMILIA_ANCORA[a]) return FAMILIA_ANCORA[a];
  const low = a.toLowerCase();
  for (const [k, v] of Object.entries(FAMILIA_ANCORA)) {
    if (k.toLowerCase() === low) return v;
  }
  return low;
}

/**
 * @param {string} ancora
 * @param {OrigemTopico} origem
 * @param {string} [agoraIso]
 * @returns {TopicoConversacional}
 */
export function criarTopico(ancora, origem = "usuario", agoraIso) {
  const anc = String(ancora || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
  const familia = familiaDeAncora(anc);
  const id = `top_${familia || anc.toLowerCase().replace(/\W+/g, "_").slice(0, 40)}`;
  return {
    id,
    ancora: anc,
    familia: familia || undefined,
    origem,
    actualizadoEm: agoraIso || new Date().toISOString()
  };
}

/**
 * @param {string} texto
 * @returns {Array<{ id: string, ancora: string, familia: string, confianca: number }>}
 */
export function extrairAncorasMensagem(texto) {
  const t = String(texto || "");
  /** @type {Array<{ id: string, ancora: string, familia: string, confianca: number, idx: number }>} */
  const hits = [];
  for (const top of LEXICO_TOPICOS) {
    const m = top.re.exec(t);
    if (!m) continue;
    hits.push({
      id: top.id,
      ancora: top.ancora,
      familia: familiaDeAncora(top.ancora),
      confianca: 0.78,
      idx: m.index
    });
  }
  hits.sort((a, b) => a.idx - b.idx);
  /** @type {Array<{ id: string, ancora: string, familia: string, confianca: number }>} */
  const out = [];
  const seen = new Set();
  for (const h of hits) {
    if (seen.has(h.familia)) continue;
    seen.add(h.familia);
    const { idx, ...rest } = h;
    void idx;
    out.push(rest);
  }
  return out;
}

/**
 * Trim pausas a ≤ MAX_PAUSAS (descarta o mais antigo).
 * @param {TopicoConversacional[]} pausas
 * @param {TopicoConversacional|null} [excluirActivo]
 */
export function trimPausas(pausas, excluirActivo = null) {
  const famAct = excluirActivo ? familiaDeAncora(excluirActivo.ancora) : "";
  /** @type {TopicoConversacional[]} */
  const limpas = [];
  const seen = new Set();
  for (const p of pausas) {
    if (!p || !p.ancora) continue;
    const fam = familiaDeAncora(p.ancora);
    if (famAct && fam === famAct) continue;
    if (seen.has(fam)) continue;
    seen.add(fam);
    limpas.push(p);
  }
  while (limpas.length > MAX_PAUSAS) limpas.shift();
  return limpas;
}

/**
 * Empilha activo anterior na pausa e activa o novo.
 * @param {TopicoConversacional|null} activoActual
 * @param {TopicoConversacional[]} pausas
 * @param {TopicoConversacional} novo
 */
export function aplicarShiftEstado(activoActual, pausas, novo) {
  /** @type {TopicoConversacional[]} */
  let novasPausas = [...(pausas || [])];
  if (activoActual && familiaDeAncora(activoActual.ancora) !== familiaDeAncora(novo.ancora)) {
    novasPausas = [
      ...novasPausas.filter(
        (p) => familiaDeAncora(p.ancora) !== familiaDeAncora(activoActual.ancora)
      ),
      activoActual
    ];
  }
  novasPausas = novasPausas.filter(
    (p) => familiaDeAncora(p.ancora) !== familiaDeAncora(novo.ancora)
  );
  return {
    topicoActivo: novo,
    pausas: trimPausas(novasPausas, novo)
  };
}

/**
 * @param {TopicoConversacional[]} candidatos
 */
export function montarPerguntaCurtaTopico(candidatos) {
  const anc = candidatos
    .slice(0, 3)
    .map((c) => c.ancora)
    .filter(Boolean);
  if (anc.length >= 2) {
    return `Seguimos no «${anc[0]}» ou passamos ao «${anc[1]}»?`;
  }
  if (anc.length === 1) {
    return `Confirmas que o foco é «${anc[0]}»?`;
  }
  return "Qual assunto queres seguir agora?";
}

/**
 * @param {string} gateHint
 * @param {string} novoAssunto
 */
export function montarClarificacaoGateShift(gateHint, novoAssunto) {
  const g = String(gateHint || "Gate pendente").slice(0, 60);
  const n = String(novoAssunto || "o novo assunto").slice(0, 60);
  return `Há Gate pendente («${g}»). Queres decidir o Gate ou tratar «${n}» agora?`;
}

/**
 * @param {TopicoConversacional|null|undefined} activo
 * @param {string} familia
 */
function familiaActiva(activo, familia) {
  if (!activo) return false;
  return familiaDeAncora(activo.ancora) === familia;
}

/**
 * @param {ReadonlyArray<TopicoConversacional>} pausas
 * @param {string} familia
 */
function acharNaPausa(pausas, familia) {
  return (pausas || []).find((p) => familiaDeAncora(p.ancora) === familia) || null;
}

/**
 * Gestor de tópicos (puro).
 * @param {EntradaGestaoTopicos} entrada
 * @returns {ResultadoGestaoTopicos}
 */
export function gestorTopicos(entrada = {}) {
  const mensagem = String(entrada.mensagem || "").trim();
  const agora = entrada.agoraIso || new Date().toISOString();
  const activo = entrada.topicoActivo || null;
  const pausas = Array.isArray(entrada.pausas) ? [...entrada.pausas] : [];
  const gatePendente = entrada.gatePendente === true;
  const hist = Array.isArray(entrada.historicoRecente)
    ? entrada.historicoRecente
    : [];

  const preservado = () => ({
    topicoActivo: activo,
    pausas: trimPausas(pausas, activo)
  });

  if (!mensagem) {
    const p = preservado();
    return {
      evento: "neutro",
      ...p,
      razaoTopico: "mensagem vazia",
      commitEstado: false
    };
  }

  const tNorm = normalizarTexto(mensagem);
  const deixis = mensagemEhDeixisOuFollowUp(mensagem);
  const marcadorShift = RE_SHIFT.test(tNorm) || RE_SHIFT.test(mensagem);
  const marcadorRetomar = RE_RETOMAR.test(tNorm) || RE_RETOMAR.test(mensagem);
  const ancorasMsg = preferirAncorasEspecificas(extrairAncorasMensagem(mensagem));

  // ── Retomar ──────────────────────────────────────────────
  if (marcadorRetomar) {
    let alvo = null;
    for (const a of ancorasMsg) {
      const naPausa = acharNaPausa(pausas, a.familia);
      if (naPausa) {
        alvo = naPausa;
        break;
      }
      if (familiaActiva(activo, a.familia)) {
        const p = preservado();
        return {
          evento: "continuar",
          ...p,
          razaoTopico: "retomar apontava ao activo — continuar",
          commitEstado: true
        };
      }
    }
    if (!alvo && ancorasMsg.length === 0 && pausas.length === 1) {
      alvo = pausas[0];
    }
    if (!alvo && pausas.length >= 2 && ancorasMsg.length === 0) {
      const p = preservado();
      return {
        evento: "ambiguo_topico",
        ...p,
        perguntaCurta: montarPerguntaCurtaTopico(pausas),
        razaoTopico: "retomar sem âncora — várias pausas",
        commitEstado: false
      };
    }
    if (alvo) {
      const estado = aplicarShiftEstado(activo, pausas, {
        ...alvo,
        actualizadoEm: agora,
        origem: "usuario"
      });
      /** @type {ResultadoGestaoTopicos} */
      const out = {
        evento: "retomar",
        ...estado,
        razaoTopico: `retomar «${alvo.ancora}»`,
        commitEstado: true
      };
      if (gatePendente) {
        out.clarificacaoGateShift = montarClarificacaoGateShift(
          "Gate pendente",
          alvo.ancora
        );
      }
      return out;
    }
  }

  // ── Shift explícito ──────────────────────────────────────
  if (marcadorShift && ancorasMsg.length >= 1) {
    const principal = ancorasMsg[0];
    if (familiaActiva(activo, principal.familia)) {
      const p = preservado();
      return {
        evento: "continuar",
        ...p,
        razaoTopico: "marcador shift mas mesma família do activo",
        commitEstado: true
      };
    }
    const novo = criarTopico(principal.ancora, "usuario", agora);
    const estado = aplicarShiftEstado(activo, pausas, novo);
    /** @type {ResultadoGestaoTopicos} */
    const out = {
      evento: "shift",
      ...estado,
      razaoTopico: `shift explícito → «${novo.ancora}»`,
      commitEstado: true
    };
    if (gatePendente) {
      out.clarificacaoGateShift = montarClarificacaoGateShift(
        "Gate pendente",
        novo.ancora
      );
      // Não abandona Gate nem activo anterior (já em pausa); pergunta combinada
      // Mantém commit do shift temático; Gate fica para o utilizador decidir
    }
    return out;
  }

  // ── Deixis / continuar ───────────────────────────────────
  if (deixis) {
    if (activo) {
      const p = preservado();
      return {
        evento: "continuar",
        ...p,
        razaoTopico: "deixis/follow-up — manter tópico activo",
        commitEstado: true
      };
    }
    // Sem activo: não inventar ambiguidade temática — deixa ao Resolvedor (IMP-062)
    const p = preservado();
    return {
      evento: "neutro",
      ...p,
      razaoTopico: "deixis sem tópico activo — neutro (Resolvedor)",
      commitEstado: false
    };
  }

  // ── Ambiguidade: ≥2 âncoras distintas na mensagem, sem marcador ──
  if (ancorasMsg.length >= 2) {
    const a0 = ancorasMsg[0];
    const a1 = ancorasMsg[1];
    const matchActivo = activo
      ? ancorasMsg.find((a) => familiaActiva(activo, a.familia))
      : null;
    if (!matchActivo) {
      const p = preservado();
      return {
        evento: "ambiguo_topico",
        ...p,
        perguntaCurta: montarPerguntaCurtaTopico([
          criarTopico(a0.ancora, "usuario", agora),
          criarTopico(a1.ancora, "usuario", agora)
        ]),
        razaoTopico: "duas âncoras sem activo preferido",
        commitEstado: false
      };
    }
    // Activo casa com uma — continuar (anti falso-shift), salvo menção explícita de escolha
    if (/\bou\b|\bou\s+ao\b|\bvs\.?\b/i.test(mensagem)) {
      const p = preservado();
      return {
        evento: "ambiguo_topico",
        ...p,
        perguntaCurta: montarPerguntaCurtaTopico([
          criarTopico(a0.ancora, "usuario", agora),
          criarTopico(a1.ancora, "usuario", agora)
        ]),
        razaoTopico: "escolha explícita entre dois tópicos",
        commitEstado: false
      };
    }
    const p = preservado();
    return {
      evento: "continuar",
      ...p,
      razaoTopico: "múltiplas âncoras; activo presente — preferir continuar",
      commitEstado: true
    };
  }

  // ── Uma âncora clara ─────────────────────────────────────
  if (ancorasMsg.length === 1) {
    const a = ancorasMsg[0];
    if (familiaActiva(activo, a.familia)) {
      const p = preservado();
      return {
        evento: "continuar",
        ...p,
        razaoTopico: "mesma família do activo",
        commitEstado: true
      };
    }
    const naPausa = acharNaPausa(pausas, a.familia);
    // Sem marcador de retoma: anti falso-shift — se há activo, preferir continuar
    // excepto confiança ≥ LIMIAR_SHIFT e activo distinto (shift implícito só com limiar)
    if (activo && a.confianca >= LIMIAR_SHIFT) {
      // Sem marcador explícito: ARQ prefere continuar em dúvida
      // Só shift implícito se a mensagem é essencialmente só o tópico novo curto
      const soTopico =
        tNorm.length <= a.ancora.length + 12 ||
        /^(sobre|acerca\s+d[eo]|e\s+o|e\s+a)\b/i.test(tNorm);
      if (!soTopico) {
        const p = preservado();
        return {
          evento: "continuar",
          ...p,
          razaoTopico: "âncora nova sem marcador — preferir continuar (anti falso-shift)",
          commitEstado: true
        };
      }
      const novo = criarTopico(a.ancora, "usuario", agora);
      const estado = aplicarShiftEstado(activo, pausas, novo);
      /** @type {ResultadoGestaoTopicos} */
      const out = {
        evento: "shift",
        ...estado,
        razaoTopico: `shift implícito curto → «${novo.ancora}»`,
        commitEstado: true
      };
      if (gatePendente) {
        out.clarificacaoGateShift = montarClarificacaoGateShift(
          "Gate pendente",
          novo.ancora
        );
      }
      return out;
    }
    if (!activo) {
      // Estabelecer tópico inicial
      const novo = naPausa
        ? { ...naPausa, actualizadoEm: agora, origem: /** @type {OrigemTopico} */ ("usuario") }
        : criarTopico(a.ancora, "usuario", agora);
      return {
        evento: "shift",
        topicoActivo: novo,
        pausas: trimPausas(
          pausas.filter((p) => familiaDeAncora(p.ancora) !== familiaDeAncora(novo.ancora)),
          novo
        ),
        razaoTopico: `estabelecer tópico «${novo.ancora}»`,
        commitEstado: true
      };
    }
  }

  // ── COA fraco: não displace activo ───────────────────────
  if (!activo && entrada.frenteActiva && entrada.coa) {
    const nome = String(entrada.coa.nome || entrada.coa.titulo || "").trim();
    if (nome) {
      const novo = criarTopico(nome.slice(0, 80), "coa", agora);
      return {
        evento: "shift",
        topicoActivo: novo,
        pausas: [],
        razaoTopico: "estabelecer a partir da frente COA",
        commitEstado: true
      };
    }
  }

  // ── Sinal fraco da janela: sem activo, uma âncora no hist ─
  if (!activo && hist.length) {
    const doHist = [];
    for (const m of [...hist].reverse()) {
      doHist.push(...extrairAncorasMensagem(m.texto));
      if (doHist.length >= 2) break;
    }
    const unicos = [];
    const seen = new Set();
    for (const h of doHist) {
      if (seen.has(h.familia)) continue;
      seen.add(h.familia);
      unicos.push(h);
    }
    if (unicos.length === 1 && unicos[0].confianca >= LIMIAR_SHIFT) {
      const novo = criarTopico(unicos[0].ancora, "ceo", agora);
      return {
        evento: "continuar",
        topicoActivo: novo,
        pausas: [],
        razaoTopico: "inferir activo único da janela",
        commitEstado: true
      };
    }
  }

  const p = preservado();
  return {
    evento: "neutro",
    ...p,
    razaoTopico: "sem sinais temáticos",
    commitEstado: Boolean(activo) // não abandonar activo
  };
}
