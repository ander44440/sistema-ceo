import { classificarIntencao } from "./classificar.js";
import {
  obterCapacidade,
  registrarCapacidade,
  listarCapacidades,
  CAPACIDADES_CANONICAS
} from "./registrar.js";
import { capacidadeDashboard } from "./capacidades/dashboard.js";
import { capacidadeProjetos } from "./capacidades/projetos.js";
import { capacidadeConhecimento } from "./capacidades/conhecimento.js";
import { capacidadeNavegacao } from "./capacidades/navegacao.js";
import { capacidadeIa } from "./capacidades/ia.js";
import { capacidadeFerramentas } from "./capacidades/ferramentas.js";
import { capacidadeMemoria } from "./capacidades/memoria.js";
import { capacidadeFila } from "./capacidades/fila.js";
import {
  atualizarAposInstrucao,
  lerMemoria,
  resumirEstado
} from "../executiveMemory/index.js";
import { inicializarCoaSessao, obterCoaAtivo } from "./coaSessao.js";
import { naturalizarRespostaNucleo } from "../conversacaoNatural/index.js";

const CAPACIDADES_INICIAIS = [
  capacidadeDashboard,
  capacidadeProjetos,
  capacidadeConhecimento,
  capacidadeNavegacao,
  capacidadeIa,
  capacidadeFerramentas,
  capacidadeMemoria,
  capacidadeFila
];

/**
 * @typedef {object} InstrucaoEntrada
 * @property {string} [texto]
 * @property {string} [instrucao]
 * @property {ReadonlyArray<{ papel: string, texto: string }>} [historico]
 */

/**
 * @typedef {object} RespostaExecutiva
 * @property {boolean} ok
 * @property {string} mensagem
 * @property {object} intencao
 * @property {string|null} capacidade
 * @property {object|null} dados
 * @property {"executiveEngine"} origem
 * @property {"stub"} modo
 */

function normalizarInstrucao(entrada) {
  if (typeof entrada === "string") {
    return { texto: entrada.trim(), historico: [] };
  }
  const texto = String(
    (entrada && (entrada.texto || entrada.instrucao)) || ""
  ).trim();
  const historico = Array.isArray(entrada && entrada.historico)
    ? entrada.historico
    : [];
  return { texto, historico };
}

function registrarPadrao() {
  for (const cap of CAPACIDADES_INICIAIS) {
    if (!obterCapacidade(cap.id)) {
      registrarCapacidade(cap);
    }
  }
}

function contextoCapacidade({ texto, historico, intencao }) {
  return {
    instrucao: texto,
    historico,
    intencao,
    /** Snapshot da Memória Executiva disponível a qualquer capacidade. */
    memoria: lerMemoria,
    coaAtivo: obterCoaAtivo()
  };
}

/**
 * Núcleo Executivo — ponto único de coordenação do Executivo Digital.
 */
export const executiveEngine = {
  /**
   * Garante registradores canônicos carregados.
   */
  inicializar() {
    registrarPadrao();
    inicializarCoaSessao();
    return this;
  },

  /**
   * Recebe instrução → classifica intenção → encaminha → atualiza memória → resposta.
   *
   * @param {string | InstrucaoEntrada} entrada
   * @returns {Promise<RespostaExecutiva>}
   */
  async executar(entrada) {
    this.inicializar();

    const { texto, historico } = normalizarInstrucao(entrada);
    const intencao = classificarIntencao(texto);
    const capacidade = obterCapacidade(intencao.capacidade);

    if (!capacidade) {
      const resposta = naturalizarRespostaNucleo(
        {
          ok: false,
          mensagem: `Nenhuma capacidade registrada para "${intencao.capacidade}".`,
          intencao,
          capacidade: intencao.capacidade,
          dados: null,
          origem: "executiveEngine",
          modo: "stub"
        },
        { instrucao: texto, historico, intencao }
      );
      atualizarAposInstrucao({
        instrucao: texto,
        intencao,
        capacidade: intencao.capacidade,
        ok: false,
        mensagem: resposta.mensagem,
        dados: null
      });
      return resposta;
    }

    try {
      const resultado = await capacidade.executar(
        contextoCapacidade({ texto, historico, intencao })
      );

      let resposta = {
        ok: resultado.ok !== false,
        mensagem:
          resultado.mensagem ||
          "Execução concluída sem mensagem textual.",
        intencao,
        capacidade: capacidade.id,
        dados: resultado.dados != null ? resultado.dados : null,
        origem: "executiveEngine",
        modo: resultado.modo || "stub"
      };

      // PX-003 E3 — toda prosa ao utilizador passa pela Conversação Natural
      resposta = naturalizarRespostaNucleo(resposta, {
        instrucao: texto,
        historico,
        intencao,
        memoria: lerMemoria,
        coaAtivo: obterCoaAtivo(),
        canalSpeaker: "chat"
      });

      const memoria = atualizarAposInstrucao({
        instrucao: texto,
        intencao,
        capacidade: capacidade.id,
        ok: resposta.ok,
        mensagem: resposta.mensagem,
        dados: resposta.dados
      });

      if (resposta.dados && typeof resposta.dados === "object") {
        resposta.dados = { ...resposta.dados, memoria };
      } else {
        resposta.dados = { memoria };
      }

      return resposta;
    } catch (err) {
      const resposta = naturalizarRespostaNucleo(
        {
          ok: false,
          mensagem:
            "Falha ao executar a capacidade " +
            capacidade.id +
            ": " +
            (err && err.message ? err.message : "erro desconhecido"),
          intencao,
          capacidade: capacidade.id,
          dados: null,
          origem: "executiveEngine",
          modo: "stub"
        },
        { instrucao: texto, historico, intencao }
      );
      atualizarAposInstrucao({
        instrucao: texto,
        intencao,
        capacidade: capacidade.id,
        ok: false,
        mensagem: resposta.mensagem,
        dados: null
      });
      return resposta;
    }
  },

  /** Consulta direta do estado atual da sessão. */
  consultarEstado() {
    return {
      ok: true,
      mensagem: resumirEstado(),
      estado: lerMemoria(),
      origem: "executiveEngine",
      modo: "stub"
    };
  },

  obterMemoria: lerMemoria,
  obterCoaAtivo,
  registrar: registrarCapacidade,
  obterCapacidade,
  listarCapacidades,
  capacidadesCanonicas: CAPACIDADES_CANONICAS
};

export { registrarCapacidade, listarCapacidades, obterCapacidade };
export default executiveEngine;
