/**
 * Validador de Contexto Ativo (VCA) — IMP-065 / REQ-065 / ARQ-026.
 * Módulo auxiliar puro: decide pertença/isolamento antes da cadeia CSC.
 * Não classifica intenção, não cria Jobs, não toca Gate/Motor/NCS.
 * VCA ≠ Classe ≠ Gate ≠ Job. Isolamento ≠ esquecimento.
 */

import {
  mensagemEhDeixisOuFollowUp,
  historicoTemReferenciaProjeto,
  seleccionarHistoricoRecente
} from "./historicoRecente.js";
import { LEXICO_C4, normalizarTexto } from "./lexicon.js";
import {
  ehAutoexplicacaoInstitucionalE23,
  ehConhecimentoGeralE22,
  ehIntencaoExecutivaE21,
  temVerboExecucao,
  desambiguarJobs
} from "./regras.js";
import {
  extrairAncorasMensagem,
  familiaDeAncora
} from "./gestorTopicos.js";

/**
 * @typedef {"pertence"|"independente"|"conhecimento_geral"|"metaconversa"|"novo_contexto"|"ambiguo_contexto"} VeredictoVca
 *
 * @typedef {object} EntradaVca
 * @property {string} mensagem
 * @property {ReadonlyArray<{ papel?: string, texto?: string }>|null} [historicoCandidato]
 * @property {{ id?: string, ancora?: string, familia?: string }|null} [topicoActivo]
 * @property {ReadonlyArray<{ ancora?: string }>|null} [pausas]
 * @property {{ id?: string, enunciado?: string, ancora?: string }|null} [objetivoActivo]
 * @property {boolean} [frenteActiva]
 * @property {{ id?: string, nome?: string, titulo?: string }|null} [coa]
 * @property {boolean} [gatePendente]
 *
 * @typedef {object} ResultadoVca
 * @property {VeredictoVca} veredicto
 * @property {boolean} autorizaLastroCsc
 * @property {string} [perguntaCurta]
 * @property {string} [clarificacaoGateIsolamento]
 * @property {string} razaoContexto
 */

/** Marcador explícito de novo fio (ARQ-026 P4) — alinhado a RE_SHIFT de tópicos. */
const RE_NOVO_CONTEXTO =
  /\b(agora\s+sobre|mudando\s+de\s+assunto|mudar\s+de\s+assunto|deixemos\s+(o|a)|passando\s+(ao|à|a|para)|falando\s+(de|do|da)|vamos\s+(falar|tratar)\s+(de|do|da)|quero\s+falar\s+(de|do|da)|novo\s+(assunto|contexto|fio|tema))\b/i;

/** Flag de rollback L1/L2 (ARQ-026 §10). */
export let VCA_ATIVO = true;

/**
 * @param {boolean} ativo
 */
export function definirVcaAtivo(ativo) {
  VCA_ATIVO = Boolean(ativo);
}

/**
 * @param {VeredictoVca} veredicto
 * @param {string} razaoContexto
 * @param {Partial<ResultadoVca>} [extra]
 * @returns {ResultadoVca}
 */
function resultado(veredicto, razaoContexto, extra = {}) {
  return {
    veredicto,
    autorizaLastroCsc: veredicto === "pertence",
    razaoContexto,
    ...extra
  };
}

/**
 * @param {{ ancora?: string }|null|undefined} topicoActivo
 * @param {{ ancora?: string, enunciado?: string }|null|undefined} objetivoActivo
 */
function temContextoActivo(topicoActivo, objetivoActivo) {
  return Boolean(
    (topicoActivo && String(topicoActivo.ancora || "").trim()) ||
      (objetivoActivo &&
        (String(objetivoActivo.ancora || "").trim() ||
          String(objetivoActivo.enunciado || "").trim()))
  );
}

/**
 * @param {{ ancora?: string }|null|undefined} topicoActivo
 * @param {{ ancora?: string, enunciado?: string }|null|undefined} objetivoActivo
 * @returns {Set<string>}
 */
function familiasActivas(topicoActivo, objetivoActivo) {
  /** @type {Set<string>} */
  const set = new Set();
  if (topicoActivo?.ancora) {
    const f = familiaDeAncora(topicoActivo.ancora);
    if (f) set.add(f);
  }
  if (objetivoActivo?.ancora) {
    const f = familiaDeAncora(objetivoActivo.ancora);
    if (f) set.add(f);
  } else if (objetivoActivo?.enunciado) {
    for (const a of extrairAncorasMensagem(objetivoActivo.enunciado)) {
      if (a.familia) set.add(a.familia);
    }
  }
  return set;
}

/** Famílias genéricas (frente/COA) — não geram ambiguo_contexto face a âncoras de projecto. */
const FAMILIAS_GENERICAS_VCA = new Set(["mg2", "coa", "motoboy game 2"]);

/**
 * @param {string} familia
 */
function familiaGenerica(familia) {
  const f = String(familia || "")
    .trim()
    .toLowerCase();
  if (!f) return true;
  if (FAMILIAS_GENERICAS_VCA.has(f)) return true;
  if (f.includes("motoboy")) return true;
  return false;
}

/**
 * @param {string} mensagem
 * @param {Set<string>} activas
 */
function analisarOverlap(mensagem, activas) {
  const ancoras = extrairAncorasMensagem(mensagem).filter(
    (a) => a.familia && !familiaGenerica(a.familia)
  );
  const overlap = ancoras.filter((a) => activas.has(a.familia));
  const outras = ancoras.filter((a) => !activas.has(a.familia));
  return { ancoras, overlap, outras };
}

/**
 * @param {{ ancora?: string }|null|undefined} topicoActivo
 * @param {{ enunciado?: string, ancora?: string }|null|undefined} objetivoActivo
 */
function montarPerguntaAmbiguo(topicoActivo, objetivoActivo) {
  const ancora =
    (topicoActivo && String(topicoActivo.ancora || "").trim()) ||
    (objetivoActivo && String(objetivoActivo.ancora || "").trim()) ||
    (objetivoActivo &&
      String(objetivoActivo.enunciado || "")
        .trim()
        .slice(0, 40)) ||
    "o assunto actual";
  return `Isto continua «${ancora}» ou é um assunto novo?`;
}

/**
 * @param {string} t — texto normalizado
 */
function pontuaC4Operacional(t) {
  for (const p of LEXICO_C4) {
    if (p.re.test(t) && p.peso >= 0.85) return true;
  }
  return false;
}

/**
 * Valida se a mensagem pertence ao contexto activo (pré-cadeia CSC).
 *
 * @param {EntradaVca} entrada
 * @returns {ResultadoVca}
 */
export function validarContextoAtivo(entrada = { mensagem: "" }) {
  const mensagem = String(entrada.mensagem || "").trim();
  if (!mensagem) {
    return resultado("pertence", "mensagem vazia → path CSC por omissão");
  }

  if (!VCA_ATIVO) {
    return resultado("pertence", "VCA_ATIVO=false → rollback L1 (força pertence)");
  }

  const t = normalizarTexto(mensagem);
  const topicoActivo = entrada.topicoActivo || null;
  const objetivoActivo = entrada.objetivoActivo || null;
  const activo = temContextoActivo(topicoActivo, objetivoActivo);
  const historicoJanela = seleccionarHistoricoRecente(
    entrada.historicoCandidato,
    mensagem
  );
  const histProjeto = historicoTemReferenciaProjeto(historicoJanela);
  const activas = familiasActivas(topicoActivo, objetivoActivo);
  const { overlap, outras } = analisarOverlap(mensagem, activas);
  const deixis = mensagemEhDeixisOuFollowUp(t);

  // P2 — metaconversa (E2.3)
  if (ehAutoexplicacaoInstitucionalE23(t)) {
    const base = resultado(
      "metaconversa",
      "E2.3: autoexplicação institucional → isolamento de lastro CSC"
    );
    if (entrada.gatePendente) {
      return {
        ...base,
        clarificacaoGateIsolamento:
          "Antes de falar do próprio CEO: o Gate continua pendente — aprova, rejeita ou cancela?"
      };
    }
    return base;
  }

  // Execução C3 / verbos de trabalho → pertence (Classificador decide C3; sem ambiguidade VCA)
  if (ehIntencaoExecutivaE21(t) || temVerboExecucao(t)) {
    return resultado(
      "pertence",
      "intenção executiva / verbo de execução → path CSC; Classificador decide C3"
    );
  }

  // C4 operacional → independente (sem lastro CSC; nunca ambiguo_contexto)
  if (desambiguarJobs(t) === "c4" || pontuaC4Operacional(t)) {
    return resultado(
      "independente",
      "comando operacional C4 → isolamento de lastro; Classificador decide C4"
    );
  }

  // P4 — novo contexto explícito
  if (RE_NOVO_CONTEXTO.test(mensagem) || RE_NOVO_CONTEXTO.test(t)) {
    return resultado(
      "novo_contexto",
      "marcador explícito de novo fio → sem lastro do anterior; stores preservados"
    );
  }

  // P1 — deixis / follow-up com lastro disponível
  if (deixis && (activo || histProjeto || entrada.frenteActiva)) {
    return resultado(
      "pertence",
      "deixis/follow-up com contexto activo ou histórico de projecto"
    );
  }

  // P7 — overlap com activo ⇒ pertence (escolha entre fios/goals fica para 063/064)
  if (activo && overlap.length > 0) {
    return resultado(
      "pertence",
      `overlap de âncora/família com contexto activo («${overlap[0].ancora}»)`
    );
  }

  // P6 — âncora específica distinta do activo específico → ambiguidade
  if (activo && outras.length > 0 && !deixis) {
    const activasEspecificas = [...activas].filter((f) => !familiaGenerica(f));
    if (
      activasEspecificas.length > 0 &&
      mensagem.split(/\s+/).length <= 6
    ) {
      return resultado(
        "ambiguo_contexto",
        "âncora distinta do activo sem marcador claro de pertença",
        {
          perguntaCurta: montarPerguntaAmbiguo(topicoActivo, objetivoActivo)
        }
      );
    }
    // Activo só genérico (COA/MG2) + âncora de projecto na mensagem → pertence ao fio
    if (activasEspecificas.length === 0) {
      return resultado(
        "pertence",
        "âncora de projecto sob frente/COA genérica → path CSC"
      );
    }
  }

  // P3 — conhecimento geral (E2.2) sem âncora do fio activo
  if (ehConhecimentoGeralE22(t) && overlap.length === 0) {
    return resultado(
      "conhecimento_geral",
      "E2.2: conhecimento geral sem âncora do fio → isolamento CSC"
    );
  }

  // P5 — pergunta/pedido autónomo com contexto activo, sem deixis/overlap
  if (activo && !deixis && overlap.length === 0) {
    return resultado(
      "independente",
      "mensagem sem deixis nem overlap com activo → isolamento; stores preservados"
    );
  }

  // P7b / default — sem sinais de isolamento ⇒ comportamento actual (061…064)
  return resultado(
    "pertence",
    activo
      ? "continuidade implícita com contexto activo"
      : "sem sinais de isolamento → path CSC actual"
  );
}

export const VEREDICTOS_VCA = Object.freeze([
  "pertence",
  "independente",
  "conhecimento_geral",
  "metaconversa",
  "novo_contexto",
  "ambiguo_contexto"
]);
