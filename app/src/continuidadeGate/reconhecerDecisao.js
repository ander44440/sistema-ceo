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
 * Reconhece decisão de Gate no léxico V1 (determinístico).
 * @param {unknown} texto
 * @returns {ResultadoReconhecimentoDecisao}
 */
export function reconhecerDecisao(texto) {
  const enunciadoNormalizado = normalizarEnunciadoDecisao(texto);
  if (!enunciadoNormalizado) {
    return {
      reconhecida: false,
      decisao: null,
      enunciadoNormalizado: "",
      sinonimo: null
    };
  }

  const decisao = LEXICO_DECISAO_GATE[enunciadoNormalizado];
  if (!decisao || !ehDecisaoGate(decisao)) {
    return {
      reconhecida: false,
      decisao: null,
      enunciadoNormalizado,
      sinonimo: null
    };
  }

  return {
    reconhecida: true,
    decisao,
    enunciadoNormalizado,
    sinonimo: enunciadoNormalizado
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
  const reconhecimento = reconhecerDecisao(texto);
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
