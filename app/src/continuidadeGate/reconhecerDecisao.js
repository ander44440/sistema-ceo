/**
 * Reconhecimento de decisão de Gate — IMP-058 E2 / REQ-058 RF5 / ARQ-019 §3.4.
 * Matching determinístico do léxico V1 + normalização de sinónimos.
 * Integra ao domínio E1 (DecisaoGate) — sem Conversa, Motor, UI, Fila ou I/O.
 */

import {
  ehDecisaoGate,
  continuidadeAplica,
  validarTransicaoGate,
  aplicarDecisaoGate,
  validarGatePendente
} from "./dominio.js";

/**
 * Léxico fechado V1: enunciado normalizado → decisão canónica.
 * Extensão só por emenda REQ/ARQ (RF15 / E2-CA5).
 * @type {Readonly<Record<string, import("./dominio.js").DecisaoGate>>}
 */
export const LEXICO_DECISAO_GATE = Object.freeze({
  aprovado: "aprovado",
  "pode executar": "aprovado",
  autorizado: "aprovado",
  "pode prosseguir": "aprovado",
  cancela: "rejeitado",
  rejeitado: "rejeitado",
  depois: "adiado",
  adiar: "adiado"
});

/** Enunciados mínimos obrigatórios (REQ-058 RF5) — ordem estável para testes. */
export const ENUNCIADOS_MINIMOS_V1 = Object.freeze([
  "Aprovado",
  "Pode executar",
  "Autorizado",
  "Pode prosseguir",
  "Cancela",
  "Rejeitado",
  "Depois",
  "Adiar"
]);

/**
 * Normaliza enunciado para matching de sinónimos:
 * trim, caixa baixa, colapso de espaços, remoção de pontuação final / aspas.
 * @param {unknown} texto
 * @returns {string}
 */
export function normalizarEnunciadoDecisao(texto) {
  if (texto == null) return "";
  let t = String(texto).normalize("NFKC").trim();
  if (!t) return "";
  // Aspas envolventes simples
  if (
    (t.startsWith('"') && t.endsWith('"')) ||
    (t.startsWith("'") && t.endsWith("'")) ||
    (t.startsWith("«") && t.endsWith("»"))
  ) {
    t = t.slice(1, -1).trim();
  }
  t = t.toLowerCase();
  // Remover pontuação terminal repetida (. ! ? …)
  t = t.replace(/[.!?…]+$/u, "").trim();
  // Colapsar whitespace interno
  t = t.replace(/\s+/gu, " ");
  return t;
}

/**
 * @typedef {object} ResultadoReconhecimentoDecisao
 * @property {boolean} reconhecida
 * @property {import("./dominio.js").DecisaoGate|null} decisao
 * @property {string} enunciadoNormalizado
 * @property {string|null} [sinonimo] — chave do léxico que casou
 */

/**
 * Ack curto que, mesmo com Gate pendente, não autoriza sozinho (RF5 / CON-001).
 * Só o enunciado inteiro — não detecta «ok» no meio de um pedido novo.
 * @type {ReadonlySet<string>}
 */
const ACK_AMBIGUO_GATE = Object.freeze(
  new Set([
    "sim",
    "ok",
    "pode",
    "yes",
    "certo",
    "isso",
    "beleza",
    "uhum",
    "ta",
    "tá",
    "combinado",
    "fechado",
    "tudo bem",
    "pode ser"
  ])
);

/**
 * Aprovação inequívoca em prosa, só aplicável com Gate pendente.
 * Não alarga o léxico V1; não trata «sim» / «ok» / «pode» isolados.
 * @param {string} enunciadoNormalizado
 * @returns {boolean}
 */
function ehAprovacaoInequivocaComGate(enunciadoNormalizado) {
  if (!enunciadoNormalizado) return false;
  if (
    /^(quando|como|por que|porque|qual|o que|quem)\b/.test(enunciadoNormalizado)
  ) {
    return false;
  }
  if (
    /\bn[aã]o\s+(est[aá]\s+)?(aprovo|aprovado|autorizo|autorizado|pode executar|pode prosseguir)\b/.test(
      enunciadoNormalizado
    )
  ) {
    return false;
  }
  if (
    enunciadoNormalizado.includes("pode executar") ||
    enunciadoNormalizado.includes("pode prosseguir")
  ) {
    return true;
  }
  return /\b(aprovado|aprovo|autorizado|autorizo)\b/.test(enunciadoNormalizado);
}

/**
 * Enunciado inteiro é ack vazio (sim/ok/pode…), sem token de aprovação V1.
 * @param {unknown} texto
 * @returns {boolean}
 */
export function ehAckAmbiguoDecisaoGate(texto) {
  const n = normalizarEnunciadoDecisao(texto);
  if (!n || ehAprovacaoInequivocaComGate(n)) return false;
  if (LEXICO_DECISAO_GATE[n]) return false;
  if (ACK_AMBIGUO_GATE.has(n)) return true;
  const partes = n.split(" ");
  return (
    partes.length >= 2 &&
    partes.length <= 3 &&
    partes.every((p) => ACK_AMBIGUO_GATE.has(p))
  );
}

/**
 * Reconhece decisão de Gate no léxico V1 (determinístico).
 * Com `opts.gatePendente`, aceita aprovação inequívoca em prosa do Gate actual
 * (sem alargar o léxico fechado; sem dar significado a «sim»/«ok»/«pode» isolados).
 * @param {unknown} texto
 * @param {{ gatePendente?: boolean }} [opts]
 * @returns {ResultadoReconhecimentoDecisao}
 */
export function reconhecerDecisao(texto, opts = {}) {
  const enunciadoNormalizado = normalizarEnunciadoDecisao(texto);
  if (!enunciadoNormalizado) {
    return {
      reconhecida: false,
      decisao: null,
      enunciadoNormalizado: "",
      sinonimo: null
    };
  }

  const decisaoExact = LEXICO_DECISAO_GATE[enunciadoNormalizado];
  if (decisaoExact && ehDecisaoGate(decisaoExact)) {
    return {
      reconhecida: true,
      decisao: decisaoExact,
      enunciadoNormalizado,
      sinonimo: enunciadoNormalizado
    };
  }

  // P0: encerrar/cancelar Gate em prosa natural (sem exigir só o léxico curto).
  const rejeicaoGate =
    /\b(encerrar|fechar|cancelar|cancela|rejeitar|rejeita)\b/.test(
      enunciadoNormalizado
    ) &&
    (/\bgate\b/.test(enunciadoNormalizado) ||
      /\bsem\s+execu[cç][aã]o\b/.test(enunciadoNormalizado) ||
      /\bsem\s+criar\s+job\b/.test(enunciadoNormalizado));
  if (rejeicaoGate) {
    return {
      reconhecida: true,
      decisao: "rejeitado",
      enunciadoNormalizado,
      sinonimo: "encerrar_gate"
    };
  }

  if (opts.gatePendente === true && ehAprovacaoInequivocaComGate(enunciadoNormalizado)) {
    return {
      reconhecida: true,
      decisao: "aprovado",
      enunciadoNormalizado,
      sinonimo: "aprovacao_contextual_gate"
    };
  }

  return {
    reconhecida: false,
    decisao: null,
    enunciadoNormalizado,
    sinonimo: null
  };
}

/**
 * Integra reconhecimento E2 + domínio E1: se texto é decisão e Gate está pendente,
 * valida / aplica transição (puro — sem Motor/Fila).
 *
 * @param {unknown} texto
 * @param {import("./dominio.js").GatePendente|null|undefined} gate
 * @param {{ agora?: string, aplicar?: boolean }} [opts]
 *   `aplicar: true` devolve Gate actualizado; default só valida transição.
 * @returns {{
 *   reconhecimento: ResultadoReconhecimentoDecisao,
 *   aplicavel: boolean,
 *   mensagem?: string,
 *   transicao?: ReturnType<typeof validarTransicaoGate>,
 *   aplicacao?: ReturnType<typeof aplicarDecisaoGate>
 * }}
 */
export function reconhecerParaGate(texto, gate, opts = {}) {
  const gatePendente =
    gate != null &&
    typeof gate === "object" &&
    /** @type {{ estado?: string }} */ (gate).estado === "pendente";
  const reconhecimento = reconhecerDecisao(texto, { gatePendente });
  if (!reconhecimento.reconhecida || !reconhecimento.decisao) {
    return {
      reconhecimento,
      aplicavel: false,
      mensagem: "Enunciado fora do léxico de decisão V1."
    };
  }

  if (gate == null) {
    return {
      reconhecimento,
      aplicavel: false,
      mensagem: "Continuidade não aplica: nenhum Gate pendente."
    };
  }

  const validado = validarGatePendente(gate);
  if (!validado.ok) {
    return {
      reconhecimento,
      aplicavel: false,
      mensagem: validado.mensagem
    };
  }

  if (!continuidadeAplica(validado.gate.estado)) {
    return {
      reconhecimento,
      aplicavel: false,
      mensagem: `Continuidade não aplica: Gate em estado ${validado.gate.estado}.`
    };
  }

  const transicao = validarTransicaoGate(
    validado.gate.estado,
    reconhecimento.decisao
  );
  if (!transicao.ok) {
    return {
      reconhecimento,
      aplicavel: false,
      mensagem: transicao.mensagem,
      transicao
    };
  }

  if (opts.aplicar === true) {
    const aplicacao = aplicarDecisaoGate(validado.gate, reconhecimento.decisao, {
      agora: opts.agora
    });
    return {
      reconhecimento,
      aplicavel: aplicacao.ok,
      mensagem: aplicacao.ok ? undefined : aplicacao.mensagem,
      transicao,
      aplicacao
    };
  }

  return {
    reconhecimento,
    aplicavel: true,
    transicao
  };
}
