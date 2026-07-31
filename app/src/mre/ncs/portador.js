/**
 * C5 — Portador de contexto deliberativo NCS (IMP-020 B3).
 * Cria/anexa o Pacote uma vez; imutável na corrida.
 * Classificação automática só com flagNcs ativa (C8 / B4); injeção de harness sempre permitida.
 */

import { classificarNaturezaCognitiva } from "./classificador.js";
import { isNcsAtiva } from "./flagNcs.js";
import { validarPacoteNcs } from "./validarPacoteNcs.js";

/**
 * Congela o pacote (shallow freeze dos campos).
 * @param {object} pacote
 * @returns {Readonly<object>}
 */
export function congelarPacoteNcs(pacote) {
  const validacao = validarPacoteNcs(pacote);
  if (!validacao.ok) {
    const err = new Error(
      `Pacote NCS inválido: ${validacao.violacoes.map((v) => v.mensagem).join("; ")}`
    );
    err.codigo = "NCS_INVALIDA";
    err.violacoes = validacao.violacoes;
    throw err;
  }
  return Object.freeze({ ...pacote });
}

/**
 * Resolve o Pacote da corrida: deps/entrada injetados, ou classificação (C2) se flag on.
 * Flag off + sem injeção → null (baseline).
 * @param {object} entrada
 * @param {object} [deps]
 * @returns {Readonly<object>|null}
 */
export function resolverPacoteNcsCorrida(entrada, deps = {}) {
  const injetado = deps.pacoteNcs || entrada?.pacoteNcs || null;
  if (injetado) {
    return congelarPacoteNcs(injetado);
  }

  if (!isNcsAtiva(deps)) {
    return null;
  }

  const classificado = classificarNaturezaCognitiva({
    mensagem: entrada?.mensagem || "",
    intencao: entrada?.intencao || null
  });
  if (!classificado.ok || !classificado.pacote) {
    const err = new Error(classificado.erro || "Falha na classificação NCS");
    err.codigo = "NCS_CLASSIFICACAO_FALHOU";
    err.validacao = classificado.validacao;
    throw err;
  }
  return congelarPacoteNcs(classificado.pacote);
}

/**
 * Anexa Pacote imutável à entrada. Proíbe segunda anexação diferente.
 * @param {object} entrada
 * @param {object} pacote
 * @returns {object}
 */
export function anexarPacoteNcs(entrada, pacote) {
  const frozen = congelarPacoteNcs(pacote);
  if (entrada?.pacoteNcs) {
    if (entrada.pacoteNcs.naturezaCognitiva !== frozen.naturezaCognitiva) {
      const err = new Error(
        "Pacote NCS já anexado — sobrescrita proibida (imutabilidade C5)"
      );
      err.codigo = "NCS_SOBRESCITA_PROIBIDA";
      throw err;
    }
    return entrada;
  }
  return { ...entrada, pacoteNcs: frozen };
}

/**
 * Tentativa de sobrescrita — falha contratual (TN-06).
 * @param {object} pacoteCongelado
 * @param {string} novaNatureza
 */
export function tentarSobrescreverNatureza(pacoteCongelado, novaNatureza) {
  try {
    pacoteCongelado.naturezaCognitiva = novaNatureza;
  } catch {
    /* strict freeze em alguns ambientes */
  }
  if (pacoteCongelado.naturezaCognitiva === novaNatureza) {
    const err = new Error("Sobrescrita de naturezaCognitiva não bloqueada");
    err.codigo = "NCS_IMUTABILIDADE_VIOLADA";
    throw err;
  }
  return {
    ok: false,
    naturezaAtual: pacoteCongelado.naturezaCognitiva,
    tentativa: novaNatureza
  };
}

/**
 * @param {object} entradaOuDeps
 * @returns {object|null}
 */
export function obterPacoteNcs(entradaOuDeps) {
  return entradaOuDeps?.pacoteNcs || null;
}
