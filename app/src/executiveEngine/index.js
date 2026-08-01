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
import {
  primeiroPassoClassificar
} from "../classificadorIntencao/integracaoNucleo.js";
import { executarPorDestino } from "../classificadorIntencao/destinos.js";

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
   * Recebe instrução → Classificador (primeiro) → destino C1–C4 (IMP-057 E5).
   * Sem fallback silencioso que ignore a classificação.
   *
   * @param {string | InstrucaoEntrada} entrada
   * @param {import("../classificadorIntencao/integracaoNucleo.js").DepsE4} [deps]
   * @returns {Promise<RespostaExecutiva>}
   */
  async executar(entrada, deps = {}) {
    this.inicializar();

    const { texto, historico } = normalizarInstrucao(entrada);
    const coa = obterCoaAtivo();
    const rota = primeiroPassoClassificar(texto, {
      frenteActiva: Boolean(coa)
    });
    const classificacao = rota.classificacao;
    const intencao = classificarIntencao(texto);

    const anexarClassificacao = (resposta) => {
      const baseDados =
        resposta.dados && typeof resposta.dados === "object"
          ? { ...resposta.dados }
          : {};
      // Classificação sempre preservada (E5-CA4) — mesmo em falha do destino
      baseDados.classificacao = classificacao;
      baseDados.encaminhamento = {
        destino: rota.destino,
        ok: rota.ok,
        idClasse: rota.rota?.id || null
      };
      return { ...resposta, intencao: resposta.intencao || intencao, dados: baseDados };
    };

    let publicarJob = deps.publicarJob;
    if (
      typeof publicarJob !== "function" &&
      rota.destino === "motor_execucao"
    ) {
      try {
        const base = import.meta.env?.VITE_CEO_API_BASE;
        if (base) {
          const { publicarJobFila } = await import("./filaCliente.js");
          publicarJob = publicarJobFila;
        }
      } catch {
        publicarJob = undefined;
      }
    }

    // E5-CA1: C2 nunca recebe publicador — zero Job automático nesta via
    const depsDestino =
      rota.destino === "nucleo_mre"
        ? { ...deps, publicarJob: undefined }
        : { ...deps, publicarJob };

    let respostaBruta;
    try {
      respostaBruta = await executarPorDestino({
        texto,
        historico,
        intencao,
        classificacao,
        rota,
        obterCapacidade,
        contextoCapacidade,
        deps: depsDestino,
        conduzirMotorPadrao: (parecer, motorDeps) =>
          this.conduzirMotorExecucao(parecer, motorDeps),
        naturalizar: (r) =>
          naturalizarRespostaNucleo(r, {
            instrucao: texto,
            historico,
            intencao: r.intencao || intencao,
            memoria: lerMemoria,
            coaAtivo: obterCoaAtivo(),
            canalSpeaker: "chat"
          })
      });
    } catch (err) {
      // Falha inesperada — classificação ainda anexada; sem reroute silencioso
      respostaBruta = {
        ok: false,
        mensagem:
          "Falha ao executar destino «" +
          rota.destino +
          "»: " +
          (err && err.message ? err.message : "erro desconhecido"),
        intencao,
        capacidade: null,
        dados: {
          classificacaoRespeitada: true,
          mreFallback: false,
          erroDestino: err && err.message ? err.message : String(err)
        },
        origem: "executiveEngine",
        modo: "destino_falha"
      };
    }

    const resposta = anexarClassificacao(respostaBruta);

    const memoria = atualizarAposInstrucao({
      instrucao: texto,
      intencao: resposta.intencao,
      capacidade: resposta.capacidade,
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
  capacidadesCanonicas: CAPACIDADES_CANONICAS,

  /**
   * Motor de Execução (IMP-056 E4) — condução pós-parecer.
   * Não inicia Agent/SDK; handoff lógico ao Dispatcher após Job pending.
   * @param {object} parecer
   * @param {object} [deps]
   */
  async conduzirMotorExecucao(parecer, deps = {}) {
    this.inicializar();
    const { conduzirAposParecer } = await import(
      "../motorExecucao/integracaoOrquestrador.js"
    );
    return conduzirAposParecer(parecer, deps);
  },

  /**
   * Motor E5 — processa Job terminal → Resultado + Encerramento (sem Agent/SDK).
   * @param {object} ciclo
   * @param {object} job
   */
  async processarResultadoMotor(ciclo, job) {
    this.inicializar();
    const { processarResultadoEEncerrar } = await import(
      "../motorExecucao/resultadoEncerramento.js"
    );
    return processarResultadoEEncerrar(ciclo, job);
  }
};

export { registrarCapacidade, listarCapacidades, obterCapacidade };
export default executiveEngine;
