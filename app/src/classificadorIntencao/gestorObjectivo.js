/**
 * Gestor de Objectivos Conversacionais — IMP-064 / REQ-064 / ARQ-025.
 * Módulo auxiliar puro: não classifica intenção, não cria Jobs, não toca Gate/Motor/NCS.
 * Objectivo ≠ Tópico ≠ Classe ≠ Job.
 */

import { mensagemEhDeixisOuFollowUp } from "./historicoRecente.js";
import {
  LEXICO_TOPICOS,
  normalizarTexto
} from "./resolverReferencias.js";
import { familiaDeAncora } from "./gestorTopicos.js";

/** Limiar interno (ARQ-025) — independente de LIMIAR_CONFIANCA 0,55. */
export const LIMIAR_OBJECTIVO = 0.65;

/** Margem mínima entre candidatos; abaixo → ambiguo_objetivo. */
export const MARGEM_OBJECTIVO = 0.12;

/**
 * @typedef {"usuario"|"ceo"|"coa"|"sistema"|"mre_sinal"} OrigemObjectivo
 * @typedef {"estabelecer"|"continuar"|"mudar"|"ambiguo_objetivo"|"neutro"} EventoObjectivo
 *
 * @typedef {object} ObjectivoConversacional
 * @property {string} id
 * @property {string} enunciado
 * @property {string} [ancora]
 * @property {string} [topicoId]
 * @property {OrigemObjectivo} origem
 * @property {string} actualizadoEm
 *
 * @typedef {object} EntradaGestaoObjectivo
 * @property {string} mensagem
 * @property {ReadonlyArray<{ papel: "usuario"|"ceo", texto: string }>} [historicoRecente]
 * @property {ObjectivoConversacional|null} [objetivoActivo]
 * @property {ObjectivoConversacional|null} [objetivoAnterior]
 * @property {{ id?: string, ancora?: string }|null} [topicoActivo]
 * @property {{ estado?: string, referente?: { ancora?: string } }|null} [referente]
 * @property {boolean} [frenteActiva]
 * @property {{ id?: string, nome?: string, titulo?: string }|null} [coa]
 * @property {string} [objetivoRealMre]
 * @property {boolean} [gatePendente]
 * @property {string} [agoraIso]
 *
 * @typedef {object} ResultadoGestaoObjectivo
 * @property {EventoObjectivo} evento
 * @property {ObjectivoConversacional|null} objetivoActivo
 * @property {ObjectivoConversacional|null} objetivoAnterior
 * @property {string} [perguntaCurta]
 * @property {string} [clarificacaoGateObjectivo]
 * @property {string} razaoObjectivo
 * @property {boolean} commitEstado
 */

const RE_ESTABELECER =
  /(?:^|[^\p{L}\p{N}_])((?:o\s+)?objectivo\s+(?:[eé]|e)|(?:o\s+)?objetivo\s+(?:[eé]|e)|quero\s+alcan[cç]ar|o\s+foco\s+desta\s+conversa\s+(?:[eé]|e)|para\s+que\s+consigamos)(?=[^\p{L}\p{N}_]|$)/iu;

const RE_MUDAR =
  /(?:^|[^\p{L}\p{N}_])(agora\s+o\s+objectivo\s+(?:[eé]|e)|agora\s+o\s+objetivo\s+(?:[eé]|e)|mudando\s+o\s+objectivo|mudando\s+o\s+objetivo|em\s+vez\s+disso\s+o\s+objectivo|em\s+vez\s+disso\s+o\s+objetivo|o\s+novo\s+objectivo\s+(?:[eé]|e)|o\s+novo\s+objetivo\s+(?:[eé]|e))(?=[^\p{L}\p{N}_]|$)/iu;

/**
 * @param {string} enunciado
 * @param {OrigemObjectivo} [origem]
 * @param {string} [agoraIso]
 * @param {{ ancora?: string, topicoId?: string }} [extra]
 * @returns {ObjectivoConversacional}
 */
export function criarObjectivo(enunciado, origem = "usuario", agoraIso, extra = {}) {
  const en = String(enunciado || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 160);
  const ancora = extra.ancora
    ? String(extra.ancora).slice(0, 80)
    : extrairAncoraDeEnunciado(en);
  const idBase = (ancora || en)
    .toLowerCase()
    .replace(/\W+/g, "_")
    .slice(0, 48);
  return {
    id: `obj_${idBase || "goal"}`,
    enunciado: en,
    ancora: ancora || undefined,
    topicoId: extra.topicoId,
    origem,
    actualizadoEm: agoraIso || new Date().toISOString()
  };
}

/**
 * @param {string} enunciado
 */
export function extrairAncoraDeEnunciado(enunciado) {
  const t = String(enunciado || "");
  for (const top of LEXICO_TOPICOS) {
    if (top.re.test(t)) return top.ancora;
  }
  return "";
}

/**
 * Extrai enunciado após marcador de objectivo.
 * @param {string} mensagem
 * @param {RegExp} reMarcador
 */
export function extrairEnunciadoAposMarcador(mensagem, reMarcador) {
  const m = String(mensagem || "");
  const hit = reMarcador.exec(m);
  if (!hit) return "";
  let resto = m.slice(hit.index + hit[0].length).replace(/^[\s:–—-]+/, "");
  resto = resto.replace(/[?.!]+$/, "").trim();
  return resto.slice(0, 160);
}

/**
 * @param {string} a
 * @param {string} b
 */
export function enunciadosCompativeis(a, b) {
  const na = normalizarTexto(a);
  const nb = normalizarTexto(b);
  if (!na || !nb) return false;
  if (na === nb) return true;
  if (na.includes(nb) || nb.includes(na)) return true;
  const aa = extrairAncoraDeEnunciado(a);
  const ab = extrairAncoraDeEnunciado(b);
  if (aa && ab && familiaDeAncora(aa) === familiaDeAncora(ab)) return true;
  return false;
}

/**
 * @param {ObjectivoConversacional[]} candidatos
 */
export function montarPerguntaCurtaObjectivo(candidatos) {
  const ens = candidatos
    .slice(0, 3)
    .map((c) => c.enunciado)
    .filter(Boolean);
  if (ens.length >= 2) {
    return `O objectivo é «${ens[0]}» ou «${ens[1]}»?`;
  }
  if (ens.length === 1) {
    return `Confirmas que o objectivo é «${ens[0]}»?`;
  }
  return "Qual é o objectivo desta conversa agora?";
}

/**
 * @param {string} gateHint
 * @param {string} novoObjectivo
 */
export function montarClarificacaoGateObjectivo(gateHint, novoObjectivo) {
  const g = String(gateHint || "Gate pendente").slice(0, 60);
  const n = String(novoObjectivo || "o novo objectivo").slice(0, 80);
  return `Há Gate pendente («${g}»). Queres decidir o Gate ou seguir o objectivo «${n}» agora?`;
}

/**
 * Candidatos implícitos (sem marcador) — só para ambiguidade explícita com «ou».
 * @param {string} mensagem
 */
function candidatosComOu(mensagem) {
  const m = String(mensagem || "");
  if (!/\bou\b/i.test(m)) return [];
  // Não usurpar ambiguidade de tópico («Outdoor ou pagamento?» → IMP-063)
  const temSinalGoal =
    /objectivo|objetivo|priorizar|decidir|alcan[cç]ar|conseguir|foco\s+desta|quero\s+alcan/i.test(
      m
    );
  if (!temSinalGoal) return [];
  const partes = m.split(/\bou\b/i).map((p) => p.trim()).filter(Boolean);
  if (partes.length < 2) return [];
  /** @type {ObjectivoConversacional[]} */
  const out = [];
  for (const p of partes.slice(0, 2)) {
    const limpo = p
      .replace(/^(o\s+)?objectivo\s+(?:[eé]|e)\s+/i, "")
      .replace(/^(o\s+)?objetivo\s+(?:[eé]|e)\s+/i, "")
      .replace(/[?.!]+$/, "")
      .trim()
      .slice(0, 120);
    if (limpo.length >= 4) out.push(criarObjectivo(limpo, "usuario"));
  }
  return out;
}

/**
 * Gestor de objectivos (puro).
 * @param {EntradaGestaoObjectivo} entrada
 * @returns {ResultadoGestaoObjectivo}
 */
export function gestorObjectivo(entrada = {}) {
  const mensagem = String(entrada.mensagem || "").trim();
  const agora = entrada.agoraIso || new Date().toISOString();
  const activo = entrada.objetivoActivo || null;
  const anterior = entrada.objetivoAnterior || null;
  const gatePendente = entrada.gatePendente === true;
  void gatePendente; // P0: API preservada; não bloqueia conversa
  const topico = entrada.topicoActivo || null;

  const preservado = () => ({
    objetivoActivo: activo,
    objetivoAnterior: anterior
  });

  if (!mensagem) {
    return {
      evento: "neutro",
      ...preservado(),
      razaoObjectivo: "mensagem vazia",
      commitEstado: false
    };
  }

  const tNorm = normalizarTexto(mensagem);
  const deixis = mensagemEhDeixisOuFollowUp(mensagem);
  const marcadorMudar = RE_MUDAR.test(tNorm) || RE_MUDAR.test(mensagem);
  const marcadorEstabelecer =
    !marcadorMudar &&
    (RE_ESTABELECER.test(tNorm) || RE_ESTABELECER.test(mensagem));

  // ── Mudar ────────────────────────────────────────────────
  if (marcadorMudar) {
    const enunciado =
      extrairEnunciadoAposMarcador(mensagem, RE_MUDAR) ||
      extrairEnunciadoAposMarcador(mensagem, RE_ESTABELECER);
    if (!enunciado) {
      const p = preservado();
      return {
        evento: "ambiguo_objetivo",
        ...p,
        perguntaCurta: "Qual é o novo objectivo?",
        razaoObjectivo: "marcador mudar sem enunciado",
        commitEstado: false
      };
    }
    if (activo && enunciadosCompativeis(activo.enunciado, enunciado)) {
      const p = preservado();
      return {
        evento: "continuar",
        ...p,
        razaoObjectivo: "marcador mudar mas mesmo objectivo — continuar",
        commitEstado: true
      };
    }
    const novo = criarObjectivo(enunciado, "usuario", agora, {
      topicoId: topico?.id,
      ancora: extrairAncoraDeEnunciado(enunciado) || topico?.ancora
    });
    /** @type {ResultadoGestaoObjectivo} */
    const out = {
      evento: "mudar",
      objetivoActivo: novo,
      objetivoAnterior: activo,
      razaoObjectivo: `mudar → «${novo.enunciado}»`,
      commitEstado: true
    };
    // P0: Gate pendente não bloqueia mudança de objectivo
    return out;
  }

  // ── Estabelecer ──────────────────────────────────────────
  if (marcadorEstabelecer) {
    const enunciado = extrairEnunciadoAposMarcador(mensagem, RE_ESTABELECER);
    if (!enunciado) {
      const p = preservado();
      return {
        evento: "ambiguo_objetivo",
        ...p,
        perguntaCurta: "Qual é o objectivo desta conversa?",
        razaoObjectivo: "marcador estabelecer sem enunciado",
        commitEstado: false
      };
    }
    if (activo && enunciadosCompativeis(activo.enunciado, enunciado)) {
      const p = preservado();
      return {
        evento: "continuar",
        ...p,
        razaoObjectivo: "estabelecer igual ao activo — continuar",
        commitEstado: true
      };
    }
    if (activo && !enunciadosCompativeis(activo.enunciado, enunciado)) {
      // Marcador «o objectivo é» com activo distinto ⇒ tratar como mudar
      const novo = criarObjectivo(enunciado, "usuario", agora, {
        topicoId: topico?.id,
        ancora: extrairAncoraDeEnunciado(enunciado) || topico?.ancora
      });
      /** @type {ResultadoGestaoObjectivo} */
      const out = {
        evento: "mudar",
        objetivoActivo: novo,
        objetivoAnterior: activo,
        razaoObjectivo: `estabelecer com activo distinto → mudar «${novo.enunciado}»`,
        commitEstado: true
      };
      // P0: Gate pendente não bloqueia objectivo
      return out;
    }
    const novo = criarObjectivo(enunciado, "usuario", agora, {
      topicoId: topico?.id,
      ancora: extrairAncoraDeEnunciado(enunciado) || topico?.ancora
    });
    /** @type {ResultadoGestaoObjectivo} */
    const out = {
      evento: "estabelecer",
      objetivoActivo: novo,
      objetivoAnterior: anterior,
      razaoObjectivo: `estabelecer «${novo.enunciado}»`,
      commitEstado: true
    };
    // P0: Gate pendente não bloqueia estabelecer objectivo
    return out;
  }

  // ── Ambiguidade explícita com «ou» ───────────────────────
  const candOu = candidatosComOu(mensagem);
  if (
    candOu.length >= 2 &&
    !enunciadosCompativeis(candOu[0].enunciado, candOu[1].enunciado)
  ) {
    // Se um casa com activo e não há marcador de escolha forçada — preferir continuar
    if (
      activo &&
      candOu.some((c) => enunciadosCompativeis(activo.enunciado, c.enunciado)) &&
      !/\bou\b.*\bou\b/i.test(mensagem)
    ) {
      // «X ou Y?» com activo = X → ainda ambíguo se pergunta de escolha
      if (/\?/.test(mensagem) || /\bou\b/i.test(mensagem)) {
        const p = preservado();
        return {
          evento: "ambiguo_objetivo",
          ...p,
          perguntaCurta: montarPerguntaCurtaObjectivo(candOu),
          razaoObjectivo: "escolha explícita entre dois outcomes",
          commitEstado: false
        };
      }
    }
    const p = preservado();
    return {
      evento: "ambiguo_objetivo",
      ...p,
      perguntaCurta: montarPerguntaCurtaObjectivo(candOu),
      razaoObjectivo: "dois outcomes com «ou»",
      commitEstado: false
    };
  }

  // ── Deixis / continuar ───────────────────────────────────
  if (deixis) {
    if (activo) {
      const p = preservado();
      return {
        evento: "continuar",
        ...p,
        razaoObjectivo: "deixis/follow-up — manter objectivo activo",
        commitEstado: true
      };
    }
    const p = preservado();
    return {
      evento: "neutro",
      ...p,
      razaoObjectivo: "deixis sem objectivo activo — neutro",
      commitEstado: false
    };
  }

  // ── Neutro: NÃO inferir objectivo a partir de tópico (Objectivo ≠ Tópico) ──
  const p = preservado();
  return {
    evento: "neutro",
    ...p,
    razaoObjectivo: "sem sinais de objectivo",
    commitEstado: Boolean(activo)
  };
}
