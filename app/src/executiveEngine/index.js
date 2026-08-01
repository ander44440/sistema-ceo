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
import { capacidadeConsultarCto } from "./capacidades/consultarCto.js";
import {
  atualizarAposInstrucao,
  lerMemoria,
  resumirEstado
} from "../executiveMemory/index.js";
import { inicializarCoaSessao, obterCoaAtivo } from "./coaSessao.js";
import { naturalizarRespostaNucleo } from "../conversacaoNatural/index.js";
import { consultarCto as consultarCtoApi, novoConsultaId } from "../ctoConnector/cliente.js";

const CAPACIDADES_INICIAIS = [
  capacidadeDashboard,
  capacidadeProjetos,
  capacidadeConhecimento,
  capacidadeNavegacao,
  capacidadeIa,
  capacidadeFerramentas,
  capacidadeMemoria,
  capacidadeFila,
  capacidadeConsultarCto
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

  /** Consulta directa do estado actual da sessão. */
  consultarEstado() {
    return {
      ok: true,
      mensagem: resumirEstado(),
      estado: lerMemoria(),
      origem: "executiveEngine",
      modo: "stub"
    };
  },

  /**
   * Consulta programática ao CTO (REQ-054) — não usa MRE.
   * @param {Partial<object> & { pergunta: string, expectativaSchema?: string, tipo?: string }} parcial
   */
  async consultarCto(parcial) {
    this.inicializar();
    const coa = obterCoaAtivo();
    const mem = lerMemoria();
    const pacote = {
      consultaId: parcial.consultaId || novoConsultaId(),
      tipo: parcial.tipo || "parecer_arquitetural",
      pergunta: String(parcial.pergunta || "").trim(),
      contextoExecutivo: parcial.contextoExecutivo || {
        situacao: String(parcial.pergunta || "").slice(0, 240),
        normaAplicavel: ["CON-001 Art. 6º II", "REQ-054"],
        estado: resumirEstado(),
        evidencia: coa ? `COA: ${coa.nome || coa.id}` : "—",
        pedidoFormato: parcial.expectativaSchema || "cto.parecer_v1"
      },
      artefactosRef: parcial.artefactosRef || [],
      restricoes: parcial.restricoes,
      expectativaSchema: parcial.expectativaSchema || "cto.parecer_v1",
      prioridade: parcial.prioridade || "normal",
      coaId: parcial.coaId || (coa && coa.id) || null,
      projeto: parcial.projeto || (coa && coa.nome) || null
    };
    const resultado = await consultarCtoApi(pacote);
    return {
      ok:
        resultado &&
        (resultado.estado === "ok" || resultado.estado === "recusa"),
      resultadoCto: resultado,
      pacote,
      origem: "executiveEngine",
      canal: "cto"
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
