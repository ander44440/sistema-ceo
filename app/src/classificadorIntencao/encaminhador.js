/**
 * Encaminhador de Intenção — IMP-057 E3 / REQ-057 / ARQ-018 §4.
 * Mapa determinístico classe → rota lógica.
 * Integra Classificador (E2) sem executar Núcleo, Motor, UI ou Dispatcher.
 */

import {
  validarSaida,
  DESTINO_POR_CLASSE,
  ID_POR_CLASSE,
  ehDestino
} from "./dominio.js";
import { classificar } from "./regras.js";

/**
 * Metadados das rotas C1–C4 (+ clarificação).
 * `acaoPrevista` é o contrato para E4/E5 — E3 **não** executa.
 */
export const ROTAS_POR_DESTINO = Object.freeze({
  resposta_leve: Object.freeze({
    id: "C1",
    classe: "conhecimento_geral",
    nome: "Resposta imediata",
    acaoPrevista: "resposta_imediata",
    sistemaAlvo: "capacidade_leve_local",
    usaFrenteActiva: false,
    permiteJob: false
  }),
  nucleo_mre: Object.freeze({
    id: "C2",
    classe: "conversa_projeto",
    nome: "Núcleo / MRE",
    acaoPrevista: "nucleo_mre",
    sistemaAlvo: "mre_nucleo",
    usaFrenteActiva: true,
    permiteJob: false
  }),
  motor_execucao: Object.freeze({
    id: "C3",
    classe: "trabalho_executivo",
    nome: "Motor de Execução",
    acaoPrevista: "motor_execucao",
    sistemaAlvo: "motor_execucao_imp056",
    usaFrenteActiva: true,
    permiteJob: true
  }),
  capacidade_operacional: Object.freeze({
    id: "C4",
    classe: "comando_operacional",
    nome: "Capacidades Operacionais",
    acaoPrevista: "capacidades_operacionais",
    sistemaAlvo: "capacidades_ceo",
    usaFrenteActiva: false,
    permiteJob: false
  }),
  clarificacao: Object.freeze({
    id: "CLAR",
    classe: null,
    nome: "Clarificação mínima",
    acaoPrevista: "pedir_clarificacao",
    sistemaAlvo: "conversa",
    usaFrenteActiva: false,
    permiteJob: false
  })
});

/**
 * @typedef {object} RotaEncaminhamento
 * @property {boolean} ok
 * @property {import("./dominio.js").DestinoClassificador} destino
 * @property {object} rota — metadados de ROTAS_POR_DESTINO
 * @property {import("./dominio.js").SaidaClassificador} classificacao
 * @property {boolean} executaEfeitos — sempre false na E3
 * @property {string} [mensagem]
 */

/**
 * Encaminha a partir de uma SaidaClassificador já validável.
 * Não publica Jobs, não chama Motor/Fila/MRE — só decide a rota.
 *
 * @param {import("./dominio.js").SaidaClassificador|object} saida
 * @returns {RotaEncaminhamento}
 */
export function encaminharPorClasse(saida) {
  const v = validarSaida(saida);
  if (!v.ok) {
    return {
      ok: false,
      destino: "clarificacao",
      rota: ROTAS_POR_DESTINO.clarificacao,
      classificacao: /** @type {*} */ (saida),
      executaEfeitos: false,
      mensagem: v.mensagem
    };
  }

  const s = v.saida;
  let destino = s.destino;

  // Clarificação tem prioridade sobre o destino da classe
  if (s.precisaClarificacao === true) {
    destino = "clarificacao";
  }

  if (!ehDestino(destino)) {
    return {
      ok: false,
      destino: "clarificacao",
      rota: ROTAS_POR_DESTINO.clarificacao,
      classificacao: s,
      executaEfeitos: false,
      mensagem: `Destino desconhecido: ${destino}`
    };
  }

  // Coerência: se não é clarificação, destino deve bater com a classe
  if (
    destino !== "clarificacao" &&
    DESTINO_POR_CLASSE[s.classe] !== destino
  ) {
    return {
      ok: false,
      destino: "clarificacao",
      rota: ROTAS_POR_DESTINO.clarificacao,
      classificacao: s,
      executaEfeitos: false,
      mensagem: `Destino ${destino} incoerente com classe ${s.classe}`
    };
  }

  const rota = ROTAS_POR_DESTINO[destino];

  return {
    ok: true,
    destino,
    rota: {
      ...rota,
      // clarificação: preservar classe candidata na classificação
      id:
        destino === "clarificacao"
          ? "CLAR"
          : ID_POR_CLASSE[s.classe] || rota.id
    },
    classificacao: s,
    executaEfeitos: false,
    /** Contrato explícito das rotas C1–C4 para E4 */
    mapa: {
      C1: "resposta_leve",
      C2: "nucleo_mre",
      C3: "motor_execucao",
      C4: "capacidade_operacional"
    }
  };
}

/**
 * Classifica e encaminha (integração E2→E3) sem efeitos laterais.
 * @param {string} texto
 * @param {import("./regras.js").ContextoClassificacao} [contexto]
 * @returns {RotaEncaminhamento}
 */
export function classificarEEncaminhar(texto, contexto = {}) {
  const saida = classificar(texto, contexto);
  return encaminharPorClasse(saida);
}

/**
 * Tabela canónica de encaminhamento (documentação / testes).
 * @returns {ReadonlyArray<{ classe: string, destino: string, nomeRota: string }>}
 */
export function tabelaEncaminhamentoV1() {
  return Object.freeze([
    Object.freeze({
      classe: "conhecimento_geral",
      destino: "resposta_leve",
      nomeRota: "Resposta imediata"
    }),
    Object.freeze({
      classe: "conversa_projeto",
      destino: "nucleo_mre",
      nomeRota: "Núcleo / MRE"
    }),
    Object.freeze({
      classe: "trabalho_executivo",
      destino: "motor_execucao",
      nomeRota: "Motor de Execução"
    }),
    Object.freeze({
      classe: "comando_operacional",
      destino: "capacidade_operacional",
      nomeRota: "Capacidades Operacionais"
    })
  ]);
}
