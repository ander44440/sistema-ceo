/**
 * Resolvedor de Referências Conversacionais — IMP-062 / REQ-062 / ARQ-023.
 * Módulo auxiliar puro: não classifica intenção, não cria Jobs, não toca Gate/Motor/NCS.
 * Consome a janela IMP-061 (4/200/800) via `historicoRecente`.
 */

import {
  mensagemEhDeixisOuFollowUp
} from "./historicoRecente.js";
import { normalizarTexto } from "./lexicon.js";

/** Limiar interno do referente (ARQ-023) — independente de LIMIAR_CONFIANCA 0,55. */
export const LIMIAR_REFERENTE = 0.6;

/** Margem mínima entre 1.º e 2.º candidato para resolver sem ambiguidade. */
export const MARGEM_REFERENTE = 0.12;

/**
 * @typedef {"topico_projeto"|"frente_coa"|"acto_gate"|"mensagem_anterior"|"desconhecido"} TipoReferente
 * @typedef {"ceo"|"usuario"|"coa"|"gate"} FonteReferente
 *
 * @typedef {object} ReferenteResolvido
 * @property {TipoReferente} tipo
 * @property {string} ancora
 * @property {number} confianca
 * @property {string} razaoReferente
 * @property {FonteReferente} fonte
 *
 * @typedef {object} EntradaResolucaoReferencia
 * @property {string} mensagem
 * @property {ReadonlyArray<{ papel: "usuario"|"ceo", texto: string }>} [historicoRecente]
 * @property {boolean} [frenteActiva]
 * @property {{ id?: string, nome?: string, titulo?: string }|null} [coa]
 * @property {string|null} [gateResumo]
 * @property {{ ancora?: string, familia?: string }|null} [topicoActivo]
 *
 * @typedef {{ estado: "nenhum" }} ResultadoNenhum
 * @typedef {{ estado: "resolvido", referente: ReferenteResolvido }} ResultadoResolvido
 * @typedef {{
 *   estado: "ambiguo",
 *   candidatos: ReferenteResolvido[],
 *   perguntaCurta: string
 * }} ResultadoAmbiguo
 * @typedef {ResultadoNenhum|ResultadoResolvido|ResultadoAmbiguo} ResultadoResolucaoReferencia
 */

/** Léxico de tópicos de projecto (DET) — âncoras estáveis para MG2 / CEO. */
export const LEXICO_TOPICOS = Object.freeze([
  Object.freeze({ id: "outdoor", re: /\boutdoor\b/i, ancora: "outdoor" }),
  Object.freeze({
    id: "pagamento",
    re: /\bpagamento\b/i,
    ancora: "pagamento"
  }),
  Object.freeze({ id: "mg2", re: /\bmg2\b|motoboy\s+game/i, ancora: "MG2" }),
  Object.freeze({ id: "coa", re: /\bcoa\b|\bfrente\s+activ/i, ancora: "COA / frente" }),
  Object.freeze({
    id: "painel",
    re: /\bpainel(\s+lateral)?\b/i,
    ancora: "painel"
  }),
  Object.freeze({ id: "job", re: /\bjobs?\b|JOB-\d+/i, ancora: "jobs" }),
  Object.freeze({
    id: "bugs",
    re: /\bbugs?\b|\berros?\b/i,
    ancora: "bugs / erros"
  }),
  Object.freeze({
    id: "dispatcher",
    re: /\bdispatcher\b/i,
    ancora: "Dispatcher"
  }),
  Object.freeze({ id: "motor", re: /\bmotor(\s+de\s+execu)?\b/i, ancora: "Motor" }),
  Object.freeze({ id: "fila", re: /\bfila\b/i, ancora: "fila" })
]);

const RE_DEIXIS_EXTRA =
  /^(o|a)\s+anterior(\?)?$|^(aquele|aquela)(\?)?$|^(a\s+mesma(\s+coisa)?)(\?)?$|^(o\s+mesmo)(\?)?$/i;

/**
 * Deixis / follow-up incluindo «o anterior», «aquele», etc. (REQ-062).
 * @param {string} texto
 */
export function mensagemPedeResolucaoReferencia(texto) {
  const t = normalizarTexto(texto);
  if (!t) return false;
  if (mensagemEhDeixisOuFollowUp(t)) return true;
  if (RE_DEIXIS_EXTRA.test(t)) return true;
  if (/\b(o|a)\s+anterior\b|\baquele\b|\baquela\b|\ba\s+mesma\b/.test(t)) {
    return true;
  }
  return false;
}

/** Famílias de âncoras — membros da mesma família não geram ambiguidade entre si. */
const FAMILIA_ANCORA = Object.freeze({
  outdoor: "outdoor",
  painel: "outdoor",
  pagamento: "pagamento",
  mg2: "mg2",
  coa: "coa",
  job: "job",
  "bugs / erros": "bugs",
  Dispatcher: "dispatcher",
  Motor: "motor",
  fila: "fila"
});

/**
 * @param {string} ancora
 */
function familiaDe(ancora) {
  return FAMILIA_ANCORA[ancora] || String(ancora || "").toLowerCase();
}

/**
 * @param {string} texto
 * @param {FonteReferente} fonte
 * @param {number} confBase
 * @param {string} razao
 * @returns {ReferenteResolvido[]}
 */
function extrairTopicosDeTexto(texto, fonte, confBase, razao) {
  const t = String(texto || "");
  /** @type {Array<ReferenteResolvido & { idx: number }>} */
  const hits = [];
  for (const top of LEXICO_TOPICOS) {
    const m = top.re.exec(t);
    if (!m) continue;
    hits.push({
      tipo: "topico_projeto",
      ancora: top.ancora,
      confianca: confBase,
      razaoReferente: razao,
      fonte,
      idx: m.index
    });
  }
  hits.sort((a, b) => a.idx - b.idx);
  /** @type {ReferenteResolvido[]} */
  const out = [];
  const familias = new Set();
  for (const h of hits) {
    const fam = familiaDe(h.ancora);
    if (familias.has(fam)) continue;
    familias.add(fam);
    const { idx, ...ref } = h;
    void idx;
    out.push(ref);
  }
  return out;
}

/**
 * Dedup por ancora normalizada; mantém maior confiança.
 * @param {ReferenteResolvido[]} lista
 */
export function deduplicarReferentes(lista) {
  /** @type {Map<string, ReferenteResolvido>} */
  const map = new Map();
  for (const r of lista) {
    const key = familiaDe(r.ancora);
    if (!key) continue;
    const prev = map.get(key);
    if (!prev || r.confianca > prev.confianca) map.set(key, r);
  }
  return [...map.values()].sort((a, b) => b.confianca - a.confianca);
}

/**
 * @param {string} a
 * @param {string} b
 */
function ancorasDistintas(a, b) {
  const fa = familiaDe(a);
  const fb = familiaDe(b);
  if (fa && fb && fa === fb) return false;
  const na = String(a || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
  const nb = String(b || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
  if (!na || !nb) return false;
  if (na === nb) return false;
  if (na.includes(nb) || nb.includes(na)) return false;
  return true;
}

/**
 * Monta pergunta curta contextualizada (RF7).
 * @param {ReferenteResolvido[]} candidatos
 */
export function montarPerguntaCurtaReferente(candidatos) {
  const anc = candidatos
    .slice(0, 3)
    .map((c) => c.ancora)
    .filter(Boolean);
  if (anc.length >= 2) {
    return `Refere-te a «${anc[0]}» ou a «${anc[1]}»?`;
  }
  if (anc.length === 1) {
    return `Confirmas que falas de «${anc[0]}»?`;
  }
  return "A que te referes no fio anterior?";
}

/**
 * Resolve referências conversacionais (puro).
 * @param {EntradaResolucaoReferencia} entrada
 * @returns {ResultadoResolucaoReferencia}
 */
export function resolverReferencias(entrada = {}) {
  const mensagem = String(entrada.mensagem || "").trim();
  if (!mensagemPedeResolucaoReferencia(mensagem)) {
    return { estado: "nenhum" };
  }

  const hist = Array.isArray(entrada.historicoRecente)
    ? entrada.historicoRecente
    : [];

  /** @type {ReferenteResolvido[]} */
  const candidatos = [];

  // P1 — fala do CEO (mais recente primeiro)
  const ceoMsgs = [...hist].reverse().filter((m) => m.papel === "ceo");
  for (let i = 0; i < ceoMsgs.length; i += 1) {
    const conf = Math.max(0.55, 0.88 - i * 0.08);
    candidatos.push(
      ...extrairTopicosDeTexto(
        ceoMsgs[i].texto,
        "ceo",
        conf,
        "P1: tópico na fala do CEO"
      )
    );
    // âncora de mensagem anterior (objectivo genérico) se não houver tópico
    if (i === 0) {
      const trecho = String(ceoMsgs[0].texto || "")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 80);
      if (trecho.length >= 12 && !extrairTopicosDeTexto(trecho, "ceo", 0.5, "").length) {
        candidatos.push({
          tipo: "mensagem_anterior",
          ancora: trecho,
          confianca: 0.64,
          razaoReferente: "P1: última mensagem do CEO",
          fonte: "ceo"
        });
      }
    }
  }

  // P2 — fala do utilizador
  const userMsgs = [...hist].reverse().filter((m) => m.papel === "usuario");
  for (let i = 0; i < userMsgs.length; i += 1) {
    const conf = Math.max(0.5, 0.82 - i * 0.08);
    candidatos.push(
      ...extrairTopicosDeTexto(
        userMsgs[i].texto,
        "usuario",
        conf,
        "P2: tópico na fala do utilizador"
      )
    );
  }

  // P3 — COA / frente
  const nomeCoa = String(
    entrada.coa?.nome || entrada.coa?.titulo || ""
  ).trim();
  if (nomeCoa && (entrada.frenteActiva === true || nomeCoa)) {
    candidatos.push({
      tipo: "frente_coa",
      ancora: nomeCoa,
      confianca: entrada.frenteActiva === true ? 0.7 : 0.55,
      razaoReferente: "P3: frente activa / COA",
      fonte: "coa"
    });
  }

  // P4 — resumo Gate (read-only)
  const gateResumo = String(entrada.gateResumo || "").trim();
  if (gateResumo) {
    const tops = extrairTopicosDeTexto(
      gateResumo,
      "gate",
      0.72,
      "P4: resumo de Gate pendente"
    );
    if (tops.length) {
      candidatos.push(...tops);
    } else {
      candidatos.push({
        tipo: "acto_gate",
        ancora: gateResumo.slice(0, 80),
        confianca: 0.68,
        razaoReferente: "P4: acto de Gate pendente",
        fonte: "gate"
      });
    }
  }

  // Orientação do Gestor de Tópicos (IMP-063) — boost fraco, não decide classe
  const topicoOrient = entrada.topicoActivo;
  const famOrient = topicoOrient
    ? familiaDe(topicoOrient.familia || topicoOrient.ancora || "")
    : "";
  if (famOrient) {
    for (const c of candidatos) {
      if (familiaDe(c.ancora) === famOrient) {
        c.confianca = Math.min(0.95, c.confianca + 0.08);
      }
    }
  }

  const unicosBrutos = deduplicarReferentes(candidatos).filter(
    (c) => c.confianca >= LIMIAR_REFERENTE
  );
  // Preferir tópicos específicos a genéricos (MG2/COA) quando ambos existem
  const genericos = new Set(["MG2", "COA / frente"]);
  const especificos = unicosBrutos.filter((c) => !genericos.has(c.ancora));
  let unicos = especificos.length ? especificos : unicosBrutos;
  // Se orientação bate com um candidato, preferir esse (desempate)
  if (famOrient && unicos.length > 1) {
    const preferido = unicos.find((c) => familiaDe(c.ancora) === famOrient);
    if (preferido) {
      unicos = [preferido, ...unicos.filter((c) => c !== preferido)];
    }
  }

  if (!unicos.length) {
    return { estado: "nenhum" };
  }

  const top = unicos[0];
  const segundo = unicos[1];

  // «o anterior» com duas âncoras distintas recentes → ambiguidade
  const tNorm = normalizarTexto(mensagem);
  const pedeAnterior = /^(o|a)\s+anterior/.test(tNorm) || /\bo\s+anterior\b/.test(tNorm);

  if (
    segundo &&
    ancorasDistintas(top.ancora, segundo.ancora) &&
    (pedeAnterior || top.confianca - segundo.confianca < MARGEM_REFERENTE)
  ) {
    const pares = unicos
      .filter((c) => c.confianca >= LIMIAR_REFERENTE)
      .slice(0, 3);
    // Preferir só âncoras distintas no par de ambiguidade
    /** @type {ReferenteResolvido[]} */
    const amb = [];
    for (const c of pares) {
      if (!amb.some((a) => !ancorasDistintas(a.ancora, c.ancora))) {
        amb.push(c);
      }
      if (amb.length >= 2) break;
    }
    if (amb.length >= 2) {
      return {
        estado: "ambiguo",
        candidatos: amb,
        perguntaCurta: montarPerguntaCurtaReferente(amb)
      };
    }
  }

  if (segundo && top.confianca - segundo.confianca < MARGEM_REFERENTE) {
    if (ancorasDistintas(top.ancora, segundo.ancora)) {
      return {
        estado: "ambiguo",
        candidatos: [top, segundo],
        perguntaCurta: montarPerguntaCurtaReferente([top, segundo])
      };
    }
  }

  return {
    estado: "resolvido",
    referente: top
  };
}

// Re-export para testes / callers que normalizam texto
export { normalizarTexto };
