import { classificarIntencao } from "./classificar.js";
import {
  obterCapacidade,
  registrarCapacidade,
  listarCapacidades,
  CAPACIDADES_CANONICAS
} from "./registrar.js";
import { capacidadeDashboard } from "./capacidades/dashboard.js";
import { capacidadeProjetos } from "./capacidades/projetos.js";
import { capacidadeEmpresas } from "./capacidades/empresas.js";
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
import {
  inicializarCoaSessao,
  obterCoaAtivo,
  obterEmpresaAtiva,
  obterEmpresaAtivaSessao,
  definirEmpresaAtiva
} from "./coaSessao.js";
import { naturalizarRespostaNucleo } from "../conversacaoNatural/index.js";
import { consultarCto as consultarCtoApi, novoConsultaId } from "../ctoConnector/cliente.js";
import {
  primeiroPassoClassificar
} from "../classificadorIntencao/integracaoNucleo.js";
import { detectarPedidoDecisaoExplicita } from "../classificadorIntencao/pedidoDecisaoExplicita.js";
import { seleccionarHistoricoRecente } from "../classificadorIntencao/historicoRecente.js";
import { resolverReferencias } from "../classificadorIntencao/resolverReferencias.js";
import { gestorTopicos } from "../classificadorIntencao/gestorTopicos.js";
import {
  GESTOR_TOPICOS_ATIVO,
  obterEstadoTopicosSessao,
  aplicarResultadoGestaoTopicos
} from "../classificadorIntencao/topicosSessao.js";
import { gestorObjectivo } from "../classificadorIntencao/gestorObjectivo.js";
import {
  GESTOR_OBJECTIVO_ATIVO,
  obterEstadoObjectivoSessao,
  aplicarResultadoGestaoObjectivo
} from "../classificadorIntencao/objectivoSessao.js";
import {
  validarContextoAtivo,
  VCA_ATIVO
} from "../classificadorIntencao/validadorContextoAtivo.js";
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
  adotarJobsDaFilaParaAcompanhamento,
  aplicarPromocaoResultadoAoLastro,
  criarStoreAcompanhamento,
  ehEstadoAdotavelDaFila,
  extrairPromocoesResultadoMissao,
  filtrarMensagensAcompanhamentoDeliberativo,
  observarAcompanhamentosActivos,
  registarAcompanhamentoAposHandoff
} from "../motorExecucao/acompanhamentoJob.js";
import {
  autoridadeDelegadaActiva,
  ehOrdemExecucaoOperacional,
  exercerFechoDelegado,
  obterEstadoAutoridadeDelegada,
  processarMensagemAutoridadeDelegada,
  snapshotAutoridadeDelegadaParaDados
} from "../autoridadeDelegada/autoridadeDelegada.js";
import { conduzirTrabalhoExecutivoC3 } from "../classificadorIntencao/integracaoNucleo.js";
import {
  consultarEstadoExecutivoAntesDeResponder,
  metadadoConscienciaParaDados
} from "../conscienciaOperacional/consultarAntesDeResponder.js";
import { criarLeitoresConscienciaPadrao } from "../conscienciaOperacional/leitoresPadrao.js";
import {
  REFINO_EIC_ATIVO,
  actualizarMemoriaTrabalhoExecutiva,
  factosLastroRefinoEic,
  metadadoRefinoEicParaDados
} from "./refinoEic.js";
import {
  deveInterceptarOperacional,
  executarInterceptacaoOperacional,
  lerEstadoOperacionalPreClassificador
} from "../conversacaoNatural/interceptacaoOperacional.js";
import { resolverMissaoActivaDoTurno } from "./garantirProjetoNovaMissao.js";

const CAPACIDADES_INICIAIS = [
  capacidadeDashboard,
  capacidadeProjetos,
  capacidadeEmpresas,
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
  lastroConsciencia = null,
  coaAtivo = undefined,
  validacaoContexto = null,
  storeContinuidade = null,
  obterJob = undefined,
  listarJobs = undefined
}) {
  /** @type {Record<string, unknown>} */
  const ctx = {
    instrucao: texto,
    historico,
    intencao,
    /** Snapshot da Memória Executiva disponível a qualquer capacidade. */
    memoria: lerMemoria,
    coaAtivo: coaAtivo === undefined ? obterCoaAtivo() : coaAtivo,
    /** FASE 2: institucional, passivo — nenhum consumidor decide com base nisto nesta fase. */
    empresaAtiva: obterEmpresaAtivaSessao()
  };
  // IMP-059 E3: lastro só quando há contexto operacional relevante
  if (lastroConsciencia) {
    ctx.lastroConsciencia = lastroConsciencia;
  }
  // IMP-067: veredicto VCA para activação do DIC no path meta
  if (validacaoContexto) {
    ctx.validacaoContexto = validacaoContexto;
  }
  // P0-3: portas de leitura para consulta de estado
  if (storeContinuidade) {
    ctx.storeContinuidade = storeContinuidade;
  }
  if (typeof obterJob === "function") {
    ctx.obterJob = obterJob;
  }
  if (typeof listarJobs === "function") {
    ctx.listarJobs = listarJobs;
  }
  return ctx;
}

/**
 * Núcleo Executivo — ponto único de coordenação do Executivo Digital.
 */

/**
 * Anexa mensagens de acompanhamento (progresso/terminal) sem duplicar prosa vazia.
 * Em pedido de decisão explícita: não ecoa histórico deliberativo (needs_correction/result).
 * @param {object} resposta
 * @param {object|null|undefined} obs
 * @param {string} [textoUsuario]
 */
function anexarMensagensAcompanhamento(resposta, obs, textoUsuario = "") {
  const obsUso = detectarPedidoDecisaoExplicita(textoUsuario)
    ? filtrarMensagensAcompanhamentoDeliberativo(obs)
    : obs;
  if (
    !resposta ||
    !obsUso ||
    !Array.isArray(obsUso.mensagens) ||
    !obsUso.mensagens.length
  ) {
    return resposta;
  }
  const textos = obsUso.mensagens
    .map((m) => (m && typeof m.texto === "string" ? m.texto.trim() : ""))
    .filter(Boolean);
  if (!textos.length) return resposta;
  const base = String(resposta.mensagem || "").trim();
  const extra = textos.join("\n");
  const mensagem =
    base && !textos.every((t) => base.includes(t))
      ? `${base}\n${extra}`
      : base || extra;
  return {
    ...resposta,
    mensagem,
    dados: {
      ...(resposta.dados && typeof resposta.dados === "object"
        ? resposta.dados
        : {}),
      acompanhamentoOperacional: {
        mensagens: obsUso.mensagens,
        aindaActivos: obsUso.aindaActivos,
        fonte: obsUso.fonte || "fila_persistida"
      }
    }
  };
}

export const executiveEngine = {
  /** @type {ReturnType<typeof criarStoreAcompanhamento>|null} */
  _acompanhamentoStore: null,

  /**
   * Garante registradores canônicos carregados.
   */
  inicializar() {
    registrarPadrao();
    inicializarCoaSessao();
    if (!this._acompanhamentoStore) {
      this._acompanhamentoStore = criarStoreAcompanhamento();
    }
    return this;
  },

  /**
   * Store de acompanhamento Job→CEO (Teste 1).
   * @returns {ReturnType<typeof criarStoreAcompanhamento>}
   */
  obterStoreAcompanhamento() {
    this.inicializar();
    return this._acompanhamentoStore;
  },

  /**
   * Isolamento de testes — limpa adopções/observações da sessão EE.
   * @returns {typeof executiveEngine}
   */
  reiniciarAcompanhamentoParaTestes() {
    this._acompanhamentoStore = criarStoreAcompanhamento();
    return this;
  },

  /**
   * Regista Job após handoff — idempotente; dispatched ≠ conclusão.
   * @param {object} job
   * @param {object} [opts]
   */
  registarAcompanhamentoJob(job, opts = {}) {
    this.inicializar();
    return registarAcompanhamentoAposHandoff(
      this._acompanhamentoStore,
      job,
      opts
    );
  },

  /**
   * Tick de observação dos acompanhamentos activos (reusa tickObservadorJob; sem watcher).
   * Teste 3: adopta Jobs abertos da fila (fora do store) antes de observar.
   * Fonte de verdade: Job persistido na fila.
   * @param {object} [deps]
   */
  async observarAcompanhamentosTurno(deps = {}) {
    this.inicializar();
    const obterJob =
      typeof deps.obterJob === "function"
        ? deps.obterJob
        : async (id) => {
            try {
              const { obterJobFila } = await import("./filaCliente.js");
              return obterJobFila(id);
            } catch {
              return null;
            }
          };

    const missaoActiva =
      deps.missaoActiva !== undefined
        ? deps.missaoActiva
        : (() => {
            try {
              const coa = obterCoaAtivo();
              return coa ? { id: coa.id, nome: coa.nome } : null;
            } catch {
              return null;
            }
          })();

    const listarJobs =
      typeof deps.listarJobsEmAcompanhamento === "function"
        ? deps.listarJobsEmAcompanhamento
        : typeof deps.listarJobs === "function"
          ? async () => {
              const todos = await deps.listarJobs(null);
              return (Array.isArray(todos) ? todos : []).filter(
                (j) => j && ehEstadoAdotavelDaFila(j.estado || j.status)
              );
            }
          : async () => {
              try {
                const { listarJobsEmAcompanhamento } = await import(
                  "./filaCliente.js"
                );
                return listarJobsEmAcompanhamento();
              } catch {
                return [];
              }
            };

    await adotarJobsDaFilaParaAcompanhamento(this._acompanhamentoStore, {
      listarJobs,
      missaoActiva
    });

    return observarAcompanhamentosActivos(this._acompanhamentoStore, {
      obterJob,
      obterCiclo: deps.obterCiclo,
      onMensagem: deps.onMensagem,
      missaoActiva
    });
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

    // Correção 7: missão do turno (nova missão nomeada > COA anterior) antes de adoptar/observar.
    const missaoTurno = resolverMissaoActivaDoTurno(texto, {
      ...(Object.prototype.hasOwnProperty.call(deps, "missaoActiva")
        ? { missaoActiva: deps.missaoActiva }
        : {}),
      listarProjetos: deps.listarProjetos,
      obterProjetoAtivo: deps.obterProjetoAtivo
    });
    let obsAcompanhamento = await this.observarAcompanhamentosTurno({
      ...deps,
      missaoActiva: missaoTurno
    });

    const interceptacao = decidirInterceptacaoContinuidade(texto, store);

    if (interceptacao === "continuidade") {
      let publicarJobCont = deps.publicarJob;
      // IMP-060 E2: fila oficial local via publicarJobFila — sem depender de Railway/VITE_CEO_API_BASE
      if (typeof publicarJobCont !== "function") {
        try {
          const { publicarJobFila } = await import("./filaCliente.js");
          publicarJobCont = publicarJobFila;
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
      let mensagemClar = outClar.mensagem;
      let modoClar = outClar.modo;
      /** @type {object} */
      let dadosTopGate = {};

      // IMP-063 RF10 / IMP-064 RF12: Gate pendente + shift/goal → clarificação combinada
      if (GESTOR_TOPICOS_ATIVO || GESTOR_OBJECTIVO_ATIVO) {
        const historicoRecenteGate = seleccionarHistoricoRecente(historico, texto);
        const estadoTop = obterEstadoTopicosSessao();
        const resultadoTopGate = GESTOR_TOPICOS_ATIVO
          ? gestorTopicos({
              mensagem: texto,
              historicoRecente: historicoRecenteGate,
              topicoActivo: estadoTop.topicoActivo,
              pausas: estadoTop.pausas,
              gatePendente: true
            })
          : null;
        const estadoObj = obterEstadoObjectivoSessao();
        const resultadoObjGate = GESTOR_OBJECTIVO_ATIVO
          ? gestorObjectivo({
              mensagem: texto,
              historicoRecente: historicoRecenteGate,
              objetivoActivo: estadoObj.objetivoActivo,
              objetivoAnterior: estadoObj.objetivoAnterior,
              topicoActivo: resultadoTopGate?.topicoActivo || estadoTop.topicoActivo,
              gatePendente: true
            })
          : null;

        if (
          resultadoObjGate?.clarificacaoGateObjectivo ||
          resultadoObjGate?.evento === "mudar" ||
          resultadoObjGate?.evento === "estabelecer"
        ) {
          aplicarResultadoGestaoObjectivo(resultadoObjGate);
          if (
            resultadoTopGate &&
            (resultadoTopGate.evento === "shift" ||
              resultadoTopGate.evento === "retomar")
          ) {
            aplicarResultadoGestaoTopicos(resultadoTopGate);
          }
          mensagemClar =
            resultadoObjGate.clarificacaoGateObjectivo || mensagemClar;
          modoClar = "clarificacao_gate_objectivo";
          dadosTopGate = {
            gestaoObjectivos: {
              evento: resultadoObjGate.evento,
              objetivoActivo: resultadoObjGate.objetivoActivo,
              objetivoAnterior: resultadoObjGate.objetivoAnterior,
              razaoObjectivo: resultadoObjGate.razaoObjectivo
            },
            ...(resultadoTopGate
              ? {
                  gestaoTopicos: {
                    evento: resultadoTopGate.evento,
                    topicoActivo: resultadoTopGate.topicoActivo,
                    pausas: resultadoTopGate.pausas,
                    razaoTopico: resultadoTopGate.razaoTopico
                  }
                }
              : {}),
            motorAcionado: false,
            mreInvocado: false
          };
        } else if (
          resultadoTopGate &&
          (resultadoTopGate.clarificacaoGateShift ||
            resultadoTopGate.evento === "shift" ||
            resultadoTopGate.evento === "retomar")
        ) {
          aplicarResultadoGestaoTopicos(resultadoTopGate);
          mensagemClar =
            resultadoTopGate.clarificacaoGateShift ||
            mensagemClar;
          modoClar = "clarificacao_gate_shift";
          dadosTopGate = {
            gestaoTopicos: {
              evento: resultadoTopGate.evento,
              topicoActivo: resultadoTopGate.topicoActivo,
              pausas: resultadoTopGate.pausas,
              razaoTopico: resultadoTopGate.razaoTopico
            },
            motorAcionado: false,
            mreInvocado: false
          };
        }
      }

      const respostaClar = {
        ok: true,
        mensagem: mensagemClar,
        intencao: outClar.intencao,
        capacidade: null,
        dados: {
          ...(outClar.dados || {}),
          classificacao: null,
          encaminhamento: {
            destino:
              modoClar === "clarificacao_gate_objectivo"
                ? "clarificacao_gate_objectivo"
                : modoClar === "clarificacao_gate_shift"
                  ? "clarificacao_gate_shift"
                  : "continuidade_gate_clarificacao",
            ok: true,
            idClasse: null
          },
          ...dadosTopGate
        },
        origem: "executiveEngine",
        modo: modoClar
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

    // IMP-071: Autoridade Delegada — activação/encerramento + execução sob mandato.
    const adJaActiva = autoridadeDelegadaActiva();
    const resultadoAd = processarMensagemAutoridadeDelegada({
      texto,
      agente: "usuario"
    });
    const metaAd = () => ({
      autoridadeDelegada: snapshotAutoridadeDelegadaParaDados()
    });
    const acabouDeActivar =
      resultadoAd.activado === true && adJaActiva === false;

    // Primeira activação (sem ordem de execução neste turno): confirma mandato.
    // Pedido explícito de decisão → não short-circuit; segue classificador/MRE.
    // Sem naturalizar deliberativo — evita «O que mudaria esta decisão…».
    if (
      acabouDeActivar &&
      !ehOrdemExecucaoOperacional(texto) &&
      !detectarPedidoDecisaoExplicita(texto)
    ) {
      const estadoAd = obterEstadoAutoridadeDelegada();
      const fecho = exercerFechoDelegado({
        tipoFecho: "determinar_proximo_gesto",
        ambito: estadoAd.perimetro,
        descricao:
          "Mandato de Autoridade Delegada aceite — competência de fecho activa no perímetro"
      });
      const mensagemAd =
        "Autoridade Delegada activa. Assumo o fecho das decisões operacionais no perímetro concedido — " +
        "sem te pedir nova autorização a cada passo. Titular da missão continua a ser tu. " +
        "Diz «executa» (ou o equivalente) para eu despachar as melhorias no Motor/Jobs.";
      const respostaAd = {
        ok: true,
        mensagem: mensagemAd,
        intencao: { id: "deliberar_objetivo", capacidade: "ia" },
        capacidade: "ia",
        dados: {
          classificacao: null,
          encaminhamento: {
            destino: "autoridade_delegada",
            ok: true,
            idClasse: null
          },
          ...metaAd(),
          fechoDelegado: fecho.fechado ? fecho.fecho : null,
          motorAcionado: false,
          mreInvocado: false
        },
        origem: "executiveEngine",
        modo: "autoridade_delegada"
      };
      const memoriaAd = atualizarAposInstrucao({
        instrucao: texto,
        intencao: respostaAd.intencao,
        capacidade: respostaAd.capacidade,
        ok: true,
        mensagem: respostaAd.mensagem,
        dados: respostaAd.dados
      });
      respostaAd.dados = {
        ...respostaAd.dados,
        ...metaAd(),
        memoria: memoriaAd
      };
      return respostaAd;
    }

    // AD activa + ordem de execução → Motor (C3), não novo ack nem MRE deliberativo.
    // Precedência: pedido explícito de decisão > latch operacional AD (sem Job/C3).
    if (
      autoridadeDelegadaActiva() &&
      ehOrdemExecucaoOperacional(texto) &&
      !detectarPedidoDecisaoExplicita(texto)
    ) {
      const estadoAd = obterEstadoAutoridadeDelegada();
      const coaActivo = (() => {
        try {
          return obterCoaAtivo();
        } catch {
          return null;
        }
      })();
      const rotuloContexto =
        (coaActivo && coaActivo.nome) ||
        estadoAd.perimetro ||
        "contexto activo";
      const fecho = exercerFechoDelegado({
        tipoFecho: "declarar_decisao",
        ambito: estadoAd.perimetro,
        descricao: `Sob Autoridade Delegada: executar no perímetro activo («${rotuloContexto}»)`
      });

      let publicarJobAd = deps.publicarJob;
      if (typeof publicarJobAd !== "function") {
        try {
          const { publicarJobFila } = await import("./filaCliente.js");
          publicarJobAd = publicarJobFila;
        } catch {
          publicarJobAd = undefined;
        }
      }

      const classificacaoAd = {
        classe: "trabalho_executivo",
        idClasse: "C3",
        destino: "motor_execucao",
        confianca: 1,
        precisaClarificacao: false,
        razoes: [
          "CAP-01: ordem de execução sob Autoridade Delegada activa"
        ]
      };

      const instrucaoExecucao =
        String(texto || "").trim() +
        " [Sob Autoridade Delegada — perímetro: " +
        (estadoAd.perimetro || "coa_activo") +
        `. Fechar e despachar execução técnica no contexto activo «${rotuloContexto}».]`;

      let resultadoExec;
      try {
        resultadoExec = await conduzirTrabalhoExecutivoC3(
          instrucaoExecucao,
          classificacaoAd,
          {
            publicarJob: publicarJobAd,
            registarAcompanhamento: (job, optsAc) =>
              this.registarAcompanhamentoJob(job, optsAc),
            conduzirMotor:
              deps.conduzirMotor ||
              ((parecer, motorDeps) =>
                this.conduzirMotorAposDecisaoGate(
                  parecer,
                  motorDeps?.decisaoAprovacao,
                  motorDeps
                )),
            registro: deps.registro || store.registroJobs,
            iniciarFluxo: true
          }
        );
      } catch (err) {
        resultadoExec = {
          ok: false,
          mensagem:
            "Autoridade Delegada activa, mas falhei ao iniciar o Motor: " +
            (err && err.message ? err.message : "erro desconhecido"),
          dados: { motorAcionado: false, motorFalhou: true }
        };
      }

      let mensagemExec = resultadoExec.mensagem || "";
      if (fecho.fechado) {
        mensagemExec =
          `Decisão fechada sob Autoridade Delegada («${rotuloContexto}»). ` +
          mensagemExec;
      }

      const respostaExec = {
        ok: resultadoExec.ok !== false,
        mensagem: mensagemExec,
        intencao: {
          id: "publicar_job_fila",
          capacidade: "motor_execucao",
          destino: "motor_execucao"
        },
        capacidade: "motor_execucao",
        dados: {
          ...(resultadoExec.dados || {}),
          ...metaAd(),
          fechoDelegado: fecho.fechado ? fecho.fecho : null,
          encaminhamento: {
            destino: "motor_execucao",
            ok: resultadoExec.ok !== false,
            idClasse: "C3"
          }
        },
        origem: "executiveEngine",
        modo: resultadoExec.modo || "autoridade_delegada_execucao"
      };
      const memoriaExec = atualizarAposInstrucao({
        instrucao: texto,
        intencao: respostaExec.intencao,
        capacidade: respostaExec.capacidade,
        ok: respostaExec.ok,
        mensagem: respostaExec.mensagem,
        dados: respostaExec.dados
      });
      respostaExec.dados = {
        ...respostaExec.dados,
        ...metaAd(),
        memoria: memoriaExec
      };
      return anexarMensagensAcompanhamento(
        respostaExec,
        obsAcompanhamento,
        texto
      );
    }

    // CTO-003: Interceptação Operacional — ANTES de VCA / CSC / Classificador.
    // Critério: comando operacional com operação aberta não chega ao classificador.
    // Teste 3: continuidade de missão (resultado) NÃO é interceptada como C3.
    let estadoOpPre = null;
    {
      const lido = await lerEstadoOperacionalPreClassificador({
        storeContinuidade: store,
        leitoresConsciencia: deps.leitoresConsciencia,
        agoraConsciencia: deps.agoraConsciencia,
        historico,
        listarPorEstado: deps.listarPorEstado
      });
      estadoOpPre = lido.estadoOperacional;
      const missaoActiva =
        lido.missaoActiva ||
        (() => {
          try {
            const coa = obterCoaAtivo();
            return coa ? { id: coa.id, nome: coa.nome } : null;
          } catch {
            return null;
          }
        })();

      if (
        deveInterceptarOperacional({
          texto,
          historico,
          estadoOperacional: estadoOpPre,
          missaoActiva,
          jobs: lido.jobsMissao
        })
      ) {
        let publicarJobOp = deps.publicarJob;
        if (typeof publicarJobOp !== "function") {
          try {
            const { publicarJobFila } = await import("./filaCliente.js");
            publicarJobOp = publicarJobFila;
          } catch {
            publicarJobOp = undefined;
          }
        }
        const coaOp = obterCoaAtivo();
        const obterJobOp =
          typeof deps.obterJob === "function"
            ? deps.obterJob
            : async (id) => {
                try {
                  const { obterJobFila } = await import("./filaCliente.js");
                  return obterJobFila(id);
                } catch {
                  return null;
                }
              };
        const respostaOp = await executarInterceptacaoOperacional({
          texto,
          estadoOperacional: estadoOpPre,
          deps: {
            ...deps,
            obterJob: obterJobOp,
            publicarJob: publicarJobOp,
            obterCoaAtivo,
            coaId: coaOp?.id || null,
            projeto: coaOp?.id || coaOp?.nome || null,
            projetoNome: coaOp?.nome || null,
            registarAcompanhamento: (job, optsAc) =>
              this.registarAcompanhamentoJob(job, optsAc),
            conduzirMotor:
              deps.conduzirMotor ||
              ((parecer, motorDeps) =>
                this.conduzirMotorAposDecisaoGate(
                  parecer,
                  motorDeps?.decisaoAprovacao,
                  {
                    ...motorDeps,
                    projeto:
                      motorDeps?.projeto ||
                      coaOp?.id ||
                      coaOp?.nome ||
                      null,
                    projetoNome:
                      motorDeps?.projetoNome || coaOp?.nome || null
                  }
                ))
          }
        });
        const memoriaOp = atualizarAposInstrucao({
          instrucao: texto,
          intencao: respostaOp.intencao,
          capacidade: respostaOp.capacidade,
          ok: respostaOp.ok,
          mensagem: respostaOp.mensagem,
          dados: respostaOp.dados
        });
        respostaOp.dados = { ...respostaOp.dados, memoria: memoriaOp };
        return anexarMensagensAcompanhamento(
          naturalizarRespostaNucleo(respostaOp, {
          instrucao: texto,
          historico,
          canalSpeaker: "chat",
          lastroConsciencia: {
            temContextoRelevante: true,
            estadoOperacional: estadoOpPre,
            contagens: {
              jobsPendentes: estadoOpPre.sinais.pending,
              jobsEmExecucao: estadoOpPre.sinais.running,
              gatesPendentes: estadoOpPre.sinais.gatePendente
            }
          }
        }),
          obsAcompanhamento,
          texto
        );
      }
    }

    const coa = obterCoaAtivo();
    // IMP-065 / ARQ-026: VCA após Gate, antes da cadeia CSC (061→064).
    // EIC V1 + IMP-061: um único passo de classificação canónica.
    // IMP-063: gestor de tópicos (após janela) — não decide classe.
    // IMP-062: resolvedor auxiliar (referente) — não decide classe.
    // IMP-064: gestor de objectivos (após 061→063→062) — não decide classe.
    const ctxGateActivo =
      typeof store.obterContextoActivo === "function"
        ? store.obterContextoActivo()
        : null;
    const gatePendente = Boolean(
      ctxGateActivo &&
        (ctxGateActivo.solicitacaoResumo || ctxGateActivo.estado === "pendente")
    );

    const estadoTopPre = obterEstadoTopicosSessao();
    const estadoObjPre = obterEstadoObjectivoSessao();
    const resultadoVca =
      VCA_ATIVO !== false
        ? validarContextoAtivo({
            mensagem: texto,
            historicoCandidato: historico,
            topicoActivo: estadoTopPre.topicoActivo,
            pausas: estadoTopPre.pausas,
            objetivoActivo: estadoObjPre.objetivoActivo,
            frenteActiva: Boolean(coa),
            coa: coa
              ? { id: coa.id, nome: coa.nome || coa.titulo }
              : null,
            gatePendente,
            // Teste 3: VCA precisa da operação aberta para não isolar continuidade
            operacaoAberta:
              Boolean(estadoOpPre?.operacaoAberta) ||
              (obsAcompanhamento?.aindaActivos > 0)
          })
        : {
            veredicto: "pertence",
            autorizaLastroCsc: true,
            razaoContexto: "VCA desactivado → path CSC"
          };

    const metaVca = {
      validacaoContexto: {
        veredicto: resultadoVca.veredicto,
        autorizaLastroCsc: resultadoVca.autorizaLastroCsc,
        razaoContexto: resultadoVca.razaoContexto
      }
    };

    // Prioridade RF: Gate > ambiguo_contexto > objectivo > tópico > referente
    if (
      resultadoVca.veredicto === "ambiguo_contexto" &&
      resultadoVca.perguntaCurta
    ) {
      const pergunta =
        resultadoVca.clarificacaoGateIsolamento || resultadoVca.perguntaCurta;
      const respostaVca = {
        ok: true,
        mensagem: pergunta,
        intencao: "conversa_projeto",
        capacidade: null,
        dados: {
          classificacao: null,
          encaminhamento: {
            destino: "clarificacao_contexto",
            ok: true,
            idClasse: null
          },
          ...metaVca,
          motorAcionado: false,
          mreInvocado: false
        },
        origem: "executiveEngine",
        modo: "clarificacao_contexto"
      };
      const memoriaVca = atualizarAposInstrucao({
        instrucao: texto,
        intencao: respostaVca.intencao,
        capacidade: null,
        ok: true,
        mensagem: respostaVca.mensagem,
        dados: respostaVca.dados
      });
      respostaVca.dados = { ...respostaVca.dados, memoria: memoriaVca };
      return respostaVca;
    }

    const autorizaLastroCsc = resultadoVca.autorizaLastroCsc === true;

    /** @type {import("../classificadorIntencao/historicoRecente.js").HistoricoRecenteItem[]} */
    let historicoRecente = [];
    let resultadoTop = null;
    /** @type {import("../classificadorIntencao/resolverReferencias.js").ResultadoResolucaoReferencia} */
    let resultadoRef = { estado: "nenhum" };
    let resultadoObj = null;

    if (autorizaLastroCsc) {
      historicoRecente = seleccionarHistoricoRecente(historico, texto);

      if (GESTOR_TOPICOS_ATIVO) {
        resultadoTop = gestorTopicos({
          mensagem: texto,
          historicoRecente,
          topicoActivo: estadoTopPre.topicoActivo,
          pausas: estadoTopPre.pausas,
          frenteActiva: Boolean(coa),
          coa: coa
            ? { id: coa.id, nome: coa.nome || coa.titulo }
            : null,
          gatePendente
        });
        aplicarResultadoGestaoTopicos(resultadoTop);
      }

      const topicoParaRef =
        resultadoTop?.topicoActivo ||
        (estadoObjPre.objetivoActivo?.ancora
          ? {
              ancora: estadoObjPre.objetivoActivo.ancora,
              familia: estadoObjPre.objetivoActivo.ancora
            }
          : null);
      resultadoRef = resolverReferencias({
        mensagem: texto,
        historicoRecente,
        frenteActiva: Boolean(coa),
        coa: coa
          ? { id: coa.id, nome: coa.nome || coa.titulo }
          : null,
        gateResumo:
          ctxGateActivo && ctxGateActivo.solicitacaoResumo
            ? String(ctxGateActivo.solicitacaoResumo)
            : null,
        topicoActivo: topicoParaRef
      });

      if (GESTOR_OBJECTIVO_ATIVO) {
        resultadoObj = gestorObjectivo({
          mensagem: texto,
          historicoRecente,
          objetivoActivo: estadoObjPre.objetivoActivo,
          objetivoAnterior: estadoObjPre.objetivoAnterior,
          topicoActivo: resultadoTop?.topicoActivo || null,
          referente: resultadoRef,
          frenteActiva: Boolean(coa),
          coa: coa
            ? { id: coa.id, nome: coa.nome || coa.titulo }
            : null,
          gatePendente
        });
        aplicarResultadoGestaoObjectivo(resultadoObj);
      }
    }
    // Isolamento: stores preservados (não mutados); sem lastro CSC neste turno.

    const objetivoParaContexto = autorizaLastroCsc
      ? resultadoObj?.objetivoActivo || estadoObjPre.objetivoActivo || null
      : null;

    const contextoClassificacao = {
      // Isolamento VCA: não injectar lastro de frente/COA no Classificador
      // (evita desambiguação C1→C2 via frenteActiva — REQ-065 / ARQ-026).
      frenteActiva: autorizaLastroCsc && Boolean(coa),
      ...(autorizaLastroCsc && historicoRecente.length > 0
        ? { historicoRecente }
        : {}),
      // IMP-064: contexto de objectivo — Classificador permanece único decisor;
      // regras V1 não usam este campo para pontuar C3.
      ...(objetivoParaContexto
        ? { objetivoConversacional: objetivoParaContexto }
        : {}),
      // Teste 3: operação aberta (F2) — continuidade ≠ C4 factual isolada
      operacaoAberta: Boolean(estadoOpPre?.operacaoAberta) ||
        (obsAcompanhamento?.aindaActivos > 0)
    };
    const rotaBruta = primeiroPassoClassificar(texto, contextoClassificacao);
    // Precedência EE: pedido explícito de decisão > C3/Job
    // (cobre falso positivo E2.1 quando alternativas usam «aplica/implementa»).
    let rota = rotaBruta;
    if (
      detectarPedidoDecisaoExplicita(texto) &&
      rotaBruta.destino === "motor_execucao"
    ) {
      const classificacaoDeliberativa = {
        ...rotaBruta.classificacao,
        classe: "conversa_projeto",
        destino: "nucleo_mre",
        permiteJob: false,
        usaFrenteActiva: true,
        razaoCurta:
          "EE: pedidoDecisao explícito → C2/MRE (precedência sobre C3/execução)"
      };
      rota = {
        ...rotaBruta,
        destino: "nucleo_mre",
        classificacao: classificacaoDeliberativa
      };
    }
    const classificacao = rota.classificacao;
    const intencao = classificarIntencao(texto, classificacao);

    const metaTopicos = resultadoTop
      ? {
          gestaoTopicos: {
            evento: resultadoTop.evento,
            topicoActivo: resultadoTop.topicoActivo,
            pausas: resultadoTop.pausas,
            razaoTopico: resultadoTop.razaoTopico
          }
        }
      : {};

    const metaObjectivos = resultadoObj
      ? {
          gestaoObjectivos: {
            evento: resultadoObj.evento,
            objetivoActivo: resultadoObj.objetivoActivo,
            objetivoAnterior: resultadoObj.objetivoAnterior,
            razaoObjectivo: resultadoObj.razaoObjectivo
          }
        }
      : {};

    // Prioridade (ARQ-026/025): ambiguo_contexto (já tratado) >
    // Gate×objectivo > ambiguo_objetivo > Gate×shift > tópico > referente
    if (resultadoObj?.clarificacaoGateObjectivo) {
      const respostaGo = {
        ok: true,
        mensagem: resultadoObj.clarificacaoGateObjectivo,
        intencao,
        capacidade: null,
        dados: {
          classificacao,
          encaminhamento: {
            destino: "clarificacao_gate_objectivo",
            ok: true,
            idClasse: rota.rota?.id || null
          },
          ...metaVca,
          ...metaVca,
          ...metaObjectivos,
          ...metaTopicos,
          resolucaoReferencia: resultadoRef,
          motorAcionado: false,
          mreInvocado: false
        },
        origem: "executiveEngine",
        modo: "clarificacao_gate_objectivo"
      };
      const memoriaGo = atualizarAposInstrucao({
        instrucao: texto,
        intencao: respostaGo.intencao,
        capacidade: null,
        ok: true,
        mensagem: respostaGo.mensagem,
        dados: respostaGo.dados
      });
      respostaGo.dados = { ...respostaGo.dados, memoria: memoriaGo };
      return respostaGo;
    }

    if (
      resultadoObj?.evento === "ambiguo_objetivo" &&
      resultadoObj.perguntaCurta
    ) {
      const respostaObj = {
        ok: true,
        mensagem: resultadoObj.perguntaCurta,
        intencao,
        capacidade: null,
        dados: {
          classificacao,
          encaminhamento: {
            destino: "clarificacao_objectivo",
            ok: true,
            idClasse: rota.rota?.id || null
          },
          ...metaVca,
          ...metaObjectivos,
          ...metaTopicos,
          resolucaoReferencia: resultadoRef,
          motorAcionado: false,
          mreInvocado: false
        },
        origem: "executiveEngine",
        modo: "clarificacao_objectivo"
      };
      const memoriaObj = atualizarAposInstrucao({
        instrucao: texto,
        intencao: respostaObj.intencao,
        capacidade: null,
        ok: true,
        mensagem: respostaObj.mensagem,
        dados: respostaObj.dados
      });
      respostaObj.dados = { ...respostaObj.dados, memoria: memoriaObj };
      return respostaObj;
    }

    if (resultadoTop?.clarificacaoGateShift) {
      const respostaGs = {
        ok: true,
        mensagem: resultadoTop.clarificacaoGateShift,
        intencao,
        capacidade: null,
        dados: {
          classificacao,
          encaminhamento: {
            destino: "clarificacao_gate_shift",
            ok: true,
            idClasse: rota.rota?.id || null
          },
          ...metaVca,
          ...metaObjectivos,
          ...metaTopicos,
          resolucaoReferencia: resultadoRef,
          motorAcionado: false,
          mreInvocado: false
        },
        origem: "executiveEngine",
        modo: "clarificacao_gate_shift"
      };
      const memoriaGs = atualizarAposInstrucao({
        instrucao: texto,
        intencao: respostaGs.intencao,
        capacidade: null,
        ok: true,
        mensagem: respostaGs.mensagem,
        dados: respostaGs.dados
      });
      respostaGs.dados = { ...respostaGs.dados, memoria: memoriaGs };
      return respostaGs;
    }

    if (resultadoTop?.evento === "ambiguo_topico" && resultadoTop.perguntaCurta) {
      const respostaTop = {
        ok: true,
        mensagem: resultadoTop.perguntaCurta,
        intencao,
        capacidade: null,
        dados: {
          classificacao,
          encaminhamento: {
            destino: "clarificacao_topico",
            ok: true,
            idClasse: rota.rota?.id || null
          },
          ...metaVca,
          ...metaObjectivos,
          ...metaTopicos,
          resolucaoReferencia: resultadoRef,
          motorAcionado: false,
          mreInvocado: false
        },
        origem: "executiveEngine",
        modo: "clarificacao_topico"
      };
      const memoriaTop = atualizarAposInstrucao({
        instrucao: texto,
        intencao: respostaTop.intencao,
        capacidade: null,
        ok: true,
        mensagem: respostaTop.mensagem,
        dados: respostaTop.dados
      });
      respostaTop.dados = { ...respostaTop.dados, memoria: memoriaTop };
      return respostaTop;
    }

    // IMP-062 RF7: ambiguidade de referente → pergunta curta (sem Job / sem C3)
    if (resultadoRef.estado === "ambiguo") {
      const respostaAmb = {
        ok: true,
        mensagem: resultadoRef.perguntaCurta,
        intencao,
        capacidade: null,
        dados: {
          classificacao,
          encaminhamento: {
            destino: "clarificacao_referente",
            ok: true,
            idClasse: rota.rota?.id || null
          },
          ...metaVca,
          ...metaObjectivos,
          ...metaTopicos,
          resolucaoReferencia: resultadoRef,
          motorAcionado: false,
          mreInvocado: false
        },
        origem: "executiveEngine",
        modo: "clarificacao_referente"
      };
      const memoriaAmb = atualizarAposInstrucao({
        instrucao: texto,
        intencao: respostaAmb.intencao,
        capacidade: null,
        ok: true,
        mensagem: respostaAmb.mensagem,
        dados: respostaAmb.dados
      });
      respostaAmb.dados = { ...respostaAmb.dados, memoria: memoriaAmb };
      return respostaAmb;
    }

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
    // Isolamento VCA: sem lastro de consciência/COA/CSC neste turno
    let lastroConsciencia = autorizaLastroCsc
      ? consultaConsciencia.lastroParaNucleo
      : null;

    // Teste 3: promover resultado reconciliado (F2 result|needs_correction) ao lastro/missão
    const promocoesResultado = extrairPromocoesResultadoMissao(obsAcompanhamento);
    if (autorizaLastroCsc && promocoesResultado.length) {
      lastroConsciencia = aplicarPromocaoResultadoAoLastro(
        lastroConsciencia,
        promocoesResultado
      );
    }

    // IMP-062: injectar referente no lastro C2/C1 (não altera pontuação C3 nem Jobs)
    if (
      autorizaLastroCsc &&
      resultadoRef.estado === "resolvido" &&
      (rota.destino === "nucleo_mre" || rota.destino === "resposta_leve")
    ) {
      const ref = resultadoRef.referente;
      const facto = `Referente conversacional: «${ref.ancora}» (${ref.tipo})`;
      if (lastroConsciencia && typeof lastroConsciencia === "object") {
        lastroConsciencia = {
          ...lastroConsciencia,
          referenteConversacional: ref,
          factosOficiais: [
            ...(Array.isArray(lastroConsciencia.factosOficiais)
              ? lastroConsciencia.factosOficiais
              : []),
            facto
          ]
        };
      } else {
        lastroConsciencia = {
          temContextoRelevante: true,
          referenteConversacional: ref,
          factosOficiais: [facto]
        };
      }
    }

    // IMP-063: lastro temático C2/C1 (não altera C3/Jobs)
    if (
      autorizaLastroCsc &&
      resultadoTop?.topicoActivo &&
      (rota.destino === "nucleo_mre" || rota.destino === "resposta_leve")
    ) {
      const top = resultadoTop.topicoActivo;
      const factoTop = `Tópico activo: «${top.ancora}» (${resultadoTop.evento})`;
      if (lastroConsciencia && typeof lastroConsciencia === "object") {
        lastroConsciencia = {
          ...lastroConsciencia,
          topicoConversacional: top,
          eventoTopico: resultadoTop.evento,
          factosOficiais: [
            ...(Array.isArray(lastroConsciencia.factosOficiais)
              ? lastroConsciencia.factosOficiais
              : []),
            factoTop
          ]
        };
      } else {
        lastroConsciencia = {
          temContextoRelevante: true,
          topicoConversacional: top,
          eventoTopico: resultadoTop.evento,
          factosOficiais: [factoTop]
        };
      }
    }

    // IMP-064: lastro de objectivo C2/C1 (não altera C3/Jobs)
    if (
      autorizaLastroCsc &&
      resultadoObj?.objetivoActivo &&
      (rota.destino === "nucleo_mre" || rota.destino === "resposta_leve")
    ) {
      const obj = resultadoObj.objetivoActivo;
      const factoObj = `Objectivo activo: «${obj.enunciado}» (${resultadoObj.evento})`;
      if (lastroConsciencia && typeof lastroConsciencia === "object") {
        lastroConsciencia = {
          ...lastroConsciencia,
          objetivoConversacional: obj,
          eventoObjectivo: resultadoObj.evento,
          factosOficiais: [
            ...(Array.isArray(lastroConsciencia.factosOficiais)
              ? lastroConsciencia.factosOficiais
              : []),
            factoObj
          ]
        };
      } else {
        lastroConsciencia = {
          temContextoRelevante: true,
          objetivoConversacional: obj,
          eventoObjectivo: resultadoObj.evento,
          factosOficiais: [factoObj]
        };
      }
    }

    // Refino EIC interno: Memória de Trabalho + ciclo + hierarquia + E→D→A.
    // Não classifica; não cria Jobs; não altera contratos públicos.
    let memoriaTrabalhoPre = null;
    if (REFINO_EIC_ATIVO) {
      memoriaTrabalhoPre = actualizarMemoriaTrabalhoExecutiva({
        fase: "pre",
        mensagem: texto,
        classe: classificacao.classe,
        destino: rota.destino,
        objetivoConversacional: objetivoParaContexto,
        topicoActivo: autorizaLastroCsc
          ? resultadoTop?.topicoActivo || null
          : null,
        coa: autorizaLastroCsc && coa
          ? { id: coa.id, nome: coa.nome || coa.titulo }
          : null,
        memoriaExecutiva: lerMemoria(),
        gatePendente,
        veredictoVca: resultadoVca.veredicto,
        promocoesResultadoOperacao: promocoesResultado
      });

      // DESP-009: MTE sempre no lastro C2 (mesmo sem factos) — execução vê a missão
      if (
        autorizaLastroCsc &&
        (rota.destino === "nucleo_mre" || rota.destino === "resposta_leve")
      ) {
        const factosRefino = factosLastroRefinoEic(memoriaTrabalhoPre);
        if (lastroConsciencia && typeof lastroConsciencia === "object") {
          lastroConsciencia = {
            ...lastroConsciencia,
            memoriaTrabalhoExecutiva: memoriaTrabalhoPre,
            factosOficiais: [
              ...(Array.isArray(lastroConsciencia.factosOficiais)
                ? lastroConsciencia.factosOficiais
                : []),
              ...factosRefino
            ]
          };
        } else {
          lastroConsciencia = {
            temContextoRelevante: true,
            memoriaTrabalhoExecutiva: memoriaTrabalhoPre,
            factosOficiais: factosRefino
          };
        }
      }
    }

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
      baseDados.validacaoContexto = metaVca.validacaoContexto;
      if (resultadoTop) {
        baseDados.gestaoTopicos = metaTopicos.gestaoTopicos;
      }
      if (resultadoObj) {
        baseDados.gestaoObjectivos = metaObjectivos.gestaoObjectivos;
      }
      if (resultadoRef && resultadoRef.estado !== "nenhum") {
        baseDados.resolucaoReferencia = resultadoRef;
      }
      // Metadado só quando a consulta obrigatória correu (C2/C3) — C1/C4 intactos
      if (consultaConsciencia.consultado) {
        baseDados.conscienciaOperacional = metaConsciencia;
      }
      if (memoriaTrabalhoPre) {
        Object.assign(baseDados, metadadoRefinoEicParaDados(memoriaTrabalhoPre));
      }
      return { ...resposta, intencao: resposta.intencao || intencao, dados: baseDados };
    };

    let publicarJob = deps.publicarJob;
    // IMP-060 E2: injectar publicador da fila oficial quando ausente (Centro/Conversa/etc.)
    // Motor continua a usar só deps.publicarJob — contrato preservado (REQ-060 RF9).
    if (
      typeof publicarJob !== "function" &&
      rota.destino === "motor_execucao"
    ) {
      try {
        const { publicarJobFila } = await import("./filaCliente.js");
        publicarJob = publicarJobFila;
      } catch {
        publicarJob = undefined;
      }
    }

    // CAP-01: com AD activa, lastro explícito antes do destino deliberativo/executivo
    if (autoridadeDelegadaActiva()) {
      const snapAd = snapshotAutoridadeDelegadaParaDados();
      const factoAd =
        `Autoridade Delegada activa — perímetro «${snapAd.perimetro}»; ` +
        "competência de fecho: CEO; titular da missão: Usuário";
      if (lastroConsciencia && typeof lastroConsciencia === "object") {
        lastroConsciencia = {
          ...lastroConsciencia,
          autoridadeDelegada: snapAd,
          factosOficiais: [
            ...(Array.isArray(lastroConsciencia.factosOficiais)
              ? lastroConsciencia.factosOficiais
              : []),
            factoAd
          ]
        };
      } else {
        lastroConsciencia = {
          temContextoRelevante: true,
          autoridadeDelegada: snapAd,
          factosOficiais: [factoAd]
        };
      }
    }

    // E5-CA1: C2 nunca recebe publicador — zero Job automático nesta via
    // IMP-059 E3: lastro ao Núcleo só se relevante (senão deps idênticas ao comportamento actual)
    const depsDestino =
      rota.destino === "nucleo_mre"
        ? {
            ...deps,
            publicarJob: undefined,
            obterCoaAtivo,
            obterJob:
              typeof deps.obterJob === "function"
                ? deps.obterJob
                : async (id) => {
                    try {
                      const { obterJobFila } = await import("./filaCliente.js");
                      return obterJobFila(id);
                    } catch {
                      return null;
                    }
                  },
            ...(lastroConsciencia ? { lastroConsciencia } : {})
          }
        : {
            ...deps,
            publicarJob,
            obterCoaAtivo,
            obterJob:
              typeof deps.obterJob === "function"
                ? deps.obterJob
                : async (id) => {
                    try {
                      const { obterJobFila } = await import("./filaCliente.js");
                      return obterJobFila(id);
                    } catch {
                      return null;
                    }
                  },
            registarAcompanhamento: (job, optsAc) =>
              this.registarAcompanhamentoJob(job, optsAc),
            ...(lastroConsciencia ? { lastroConsciencia } : {})
          };

    const coaParaDestino = autorizaLastroCsc ? obterCoaAtivo() : null;

    const contextoCapacidadeComLastro = (parcial) =>
      contextoCapacidade({
        ...parcial,
        lastroConsciencia: lastroConsciencia || parcial.lastroConsciencia || null,
        coaAtivo: coaParaDestino,
        validacaoContexto: metaVca.validacaoContexto,
        storeContinuidade: store,
        obterJob: deps.obterJob,
        listarJobs: deps.listarJobs || deps.listarPorEstado
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
            historico: autorizaLastroCsc ? historico : [],
            intencao: r.intencao || intencao,
            // Isolamento: sem memória/COA de projecto na âncora CN («Mantemos o foco…»)
            memoria: autorizaLastroCsc ? lerMemoria : null,
            coaAtivo: coaParaDestino,
            canalSpeaker: "chat",
            // DESP-009: CN e superfícies partilham o mesmo lastro de missão
            lastroConsciencia: autorizaLastroCsc ? lastroConsciencia : null,
            refinoEic: memoriaTrabalhoPre
              ? metadadoRefinoEicParaDados(memoriaTrabalhoPre).refinoEic
              : null
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
    if (
      conducaoMotor &&
      conducaoMotor.job &&
      typeof conducaoMotor.job.id === "string" &&
      conducaoMotor.publicado === true
    ) {
      this.registarAcompanhamentoJob(conducaoMotor.job, {
        cicloId: conducaoMotor.ciclo?.id || null,
        ciclo: conducaoMotor.ciclo || null
      });
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
      resposta.dados = {
        ...resposta.dados,
        memoria,
        ...metaAd()
      };
    } else {
      resposta.dados = { memoria, ...metaAd() };
    }

    // Refino EIC — critério de encerramento / estado pós-turno (interno).
    if (REFINO_EIC_ATIVO) {
      const memoriaTrabalhoPos = actualizarMemoriaTrabalhoExecutiva({
        fase: "pos",
        mensagem: texto,
        classe: classificacao.classe,
        destino: rota.destino,
        objetivoConversacional: objetivoParaContexto,
        topicoActivo: autorizaLastroCsc
          ? resultadoTop?.topicoActivo || null
          : null,
        coa: autorizaLastroCsc && coa
          ? { id: coa.id, nome: coa.nome || coa.titulo }
          : null,
        memoriaExecutiva: memoria,
        gatePendente,
        veredictoVca: resultadoVca.veredicto,
        resposta
      });
      if (memoriaTrabalhoPos && resposta.dados && typeof resposta.dados === "object") {
        Object.assign(
          resposta.dados,
          metadadoRefinoEicParaDados(memoriaTrabalhoPos)
        );
      }
    }

    return anexarMensagensAcompanhamento(resposta, obsAcompanhamento, texto);
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
  obterEmpresaAtiva,
  obterEmpresaAtivaSessao,
  definirEmpresaAtiva,
  /** Exposição controlada para testes FASE 2 (S10) — não usar em produção. */
  montarContextoCapacidade: contextoCapacidade,
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
    const coa = obterCoaAtivo();
    return conduzirAposParecer(parecer, {
      ...deps,
      projeto:
        deps.projeto ||
        parecer?.projeto ||
        parecer?.coaId ||
        (coa && (coa.id || coa.nome)) ||
        null,
      projetoNome:
        deps.projetoNome ||
        parecer?.projetoNome ||
        (coa && coa.nome) ||
        null
    });
  },

  /**
   * Continuidade do Gate (IMP-058 E4) — retoma Motor após decisão humana.
   * @param {object} parecer
   * @param {import("../motorExecucao/dominio.js").DecisaoAprovacao} decisao
   * @param {object} [deps]
   */
  async conduzirMotorAposDecisaoGate(parecer, decisao, deps = {}) {
    this.inicializar();
    const coa = obterCoaAtivo();
    return conduzirAposDecisaoGate(parecer, decisao, {
      ...deps,
      projeto:
        deps.projeto ||
        parecer?.projeto ||
        parecer?.coaId ||
        (coa && (coa.id || coa.nome)) ||
        null,
      projetoNome:
        deps.projetoNome ||
        parecer?.projetoNome ||
        (coa && coa.nome) ||
        null
    });
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
