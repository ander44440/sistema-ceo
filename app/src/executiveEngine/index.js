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
import {
  obterStoreContinuidadePadrao,
  decidirInterceptacaoContinuidade,
  continuarAposDecisaoGate,
  responderClarificacaoGate,
  envolverConduzirMotorComContinuidade,
  aplicarMensagemGateNaResposta
} from "../continuidadeGate/integracaoConversa.js";
import { conduzirAposDecisaoGate } from "../motorExecucao/integracaoOrquestrador.js";
import {
  consultarEstadoExecutivoAntesDeResponder,
  metadadoConscienciaParaDados
} from "../conscienciaOperacional/consultarAntesDeResponder.js";
import { criarLeitoresConscienciaPadrao } from "../conscienciaOperacional/leitoresPadrao.js";

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

function contextoCapacidade({
  texto,
  historico,
  intencao,
  lastroConsciencia = null
}) {
  /** @type {Record<string, unknown>} */
  const ctx = {
    instrucao: texto,
    historico,
    intencao,
    /** Snapshot da Memória Executiva disponível a qualquer capacidade. */
    memoria: lerMemoria,
    coaAtivo: obterCoaAtivo()
  };
  // IMP-059 E3: lastro só quando há contexto operacional relevante
  if (lastroConsciencia) {
    ctx.lastroConsciencia = lastroConsciencia;
  }
  return ctx;
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
   * Recebe instrução → Continuidade do Gate (se pendente) → Classificador → destino.
   * IMP-058 E4: decisão de Gate antes do Classificador; sem repetir o C3.
   *
   * @param {string | InstrucaoEntrada} entrada
   * @param {import("../classificadorIntencao/integracaoNucleo.js").DepsE4 & {
   *   storeContinuidade?: import("../continuidadeGate/contexto.js").StoreContextoGate,
   *   leitoresConsciencia?: import("../conscienciaOperacional/agregarEstado.js").LeitoresFontes,
   *   agoraConsciencia?: () => string
   * }} [deps]
   * @returns {Promise<RespostaExecutiva>}
   */
  async executar(entrada, deps = {}) {
    this.inicializar();

    const { texto, historico } = normalizarInstrucao(entrada);
    const store =
      deps.storeContinuidade || obterStoreContinuidadePadrao();

    const interceptacao = decidirInterceptacaoContinuidade(texto, store);

    if (interceptacao === "continuidade") {
      let publicarJobCont = deps.publicarJob;
      if (typeof publicarJobCont !== "function") {
        try {
          const base = import.meta.env?.VITE_CEO_API_BASE;
          if (base) {
            const { publicarJobFila } = await import("./filaCliente.js");
            publicarJobCont = publicarJobFila;
          }
        } catch {
          publicarJobCont = undefined;
        }
      }

      const outCont = await continuarAposDecisaoGate({
        texto,
        store,
        conduzirMotor: (parecer, motorDeps) =>
          this.conduzirMotorAposDecisaoGate(parecer, motorDeps.decisaoAprovacao, motorDeps),
        publicarJob: publicarJobCont,
        registro: deps.registro || store.registroJobs
      });

      const respostaCont = {
        ok: outCont.ok !== false,
        mensagem: outCont.mensagem,
        intencao: outCont.intencao,
        capacidade: outCont.capacidade ?? null,
        dados: {
          ...(outCont.dados || {}),
          classificacao: null,
          encaminhamento: {
            destino: "continuidade_gate",
            ok: true,
            idClasse: null
          }
        },
        origem: "executiveEngine",
        modo: outCont.modo || "continuidade_gate"
      };

      const memoriaCont = atualizarAposInstrucao({
        instrucao: texto,
        intencao: respostaCont.intencao,
        capacidade: respostaCont.capacidade,
        ok: respostaCont.ok,
        mensagem: respostaCont.mensagem,
        dados: respostaCont.dados
      });
      respostaCont.dados = { ...respostaCont.dados, memoria: memoriaCont };
      return respostaCont;
    }

    if (interceptacao === "clarificacao") {
      const outClar = responderClarificacaoGate(store, texto);
      const respostaClar = {
        ok: true,
        mensagem: outClar.mensagem,
        intencao: outClar.intencao,
        capacidade: null,
        dados: {
          ...(outClar.dados || {}),
          classificacao: null,
          encaminhamento: {
            destino: "continuidade_gate_clarificacao",
            ok: true,
            idClasse: null
          }
        },
        origem: "executiveEngine",
        modo: outClar.modo
      };
      const memoriaClar = atualizarAposInstrucao({
        instrucao: texto,
        intencao: respostaClar.intencao,
        capacidade: null,
        ok: true,
        mensagem: respostaClar.mensagem,
        dados: respostaClar.dados
      });
      respostaClar.dados = { ...respostaClar.dados, memoria: memoriaClar };
      return respostaClar;
    }

    const coa = obterCoaAtivo();
    const rota = primeiroPassoClassificar(texto, {
      frenteActiva: Boolean(coa)
    });
    const classificacao = rota.classificacao;
    const intencao = classificarIntencao(texto);

    // IMP-059 E3/E4: Continuidade já foi tratada acima — consulta só no caminho deliberativo/executivo
    const leitoresConsciencia =
      deps.leitoresConsciencia ||
      criarLeitoresConscienciaPadrao({ storeContinuidade: store });
    const consultaConsciencia = await consultarEstadoExecutivoAntesDeResponder({
      classe: classificacao.classe,
      idClasse: classificacao.idClasse || rota.rota?.id || null,
      continuidadeConsumiu: false,
      leitores: leitoresConsciencia,
      agora: deps.agoraConsciencia
    });
    const metaConsciencia = metadadoConscienciaParaDados(consultaConsciencia);
    const lastroConsciencia = consultaConsciencia.lastroParaNucleo;

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
      // Metadado só quando a consulta obrigatória correu (C2/C3) — C1/C4 intactos
      if (consultaConsciencia.consultado) {
        baseDados.conscienciaOperacional = metaConsciencia;
      }
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
    // IMP-059 E3: lastro ao Núcleo só se relevante (senão deps idênticas ao comportamento actual)
    const depsDestino =
      rota.destino === "nucleo_mre"
        ? {
            ...deps,
            publicarJob: undefined,
            ...(lastroConsciencia ? { lastroConsciencia } : {})
          }
        : {
            ...deps,
            publicarJob,
            ...(lastroConsciencia ? { lastroConsciencia } : {})
          };

    const contextoCapacidadeComLastro = (parcial) =>
      contextoCapacidade({
        ...parcial,
        lastroConsciencia: lastroConsciencia || parcial.lastroConsciencia || null
      });

    const conduzirMotorPadrao = envolverConduzirMotorComContinuidade(
      store,
      (parecer, motorDeps) => this.conduzirMotorExecucao(parecer, motorDeps),
      texto
    );

    let respostaBruta;
    try {
      respostaBruta = await executarPorDestino({
        texto,
        historico,
        intencao,
        classificacao,
        rota,
        obterCapacidade,
        contextoCapacidade: contextoCapacidadeComLastro,
        deps: depsDestino,
        conduzirMotorPadrao,
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

    let resposta = anexarClassificacao(respostaBruta);
    const conducaoMotor =
      resposta.dados && resposta.dados.motor && typeof resposta.dados.motor === "object"
        ? resposta.dados.motor
        : null;
    if (conducaoMotor && conducaoMotor.aguardandoGate === true) {
      resposta = aplicarMensagemGateNaResposta(resposta, conducaoMotor);
    }

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
   * Continuidade do Gate (IMP-058 E4) — retoma Motor após decisão humana.
   * @param {object} parecer
   * @param {import("../motorExecucao/dominio.js").DecisaoAprovacao} decisao
   * @param {object} [deps]
   */
  async conduzirMotorAposDecisaoGate(parecer, decisao, deps = {}) {
    this.inicializar();
    return conduzirAposDecisaoGate(parecer, decisao, deps);
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
