import { classificarIntencao } from "./classificar.js";
import {
  resolverRespostaCanonica,
  anexarObservabilidadeCanonico,
  funilPortaCanonicaActiva
} from "./portaCanonica.js";
import {
  permiteClarificacaoTurno,
  anexarObservabilidadeClarificacao,
  funilClarificacaoEstritaActiva
} from "../classificadorIntencao/clarificacaoDisciplinada.js";
import {
  funilCoaRigidoActiva,
  resolverCoaTurno,
  anexarObservabilidadeCoa
} from "./funilCoaRigido.js";
import { detectarModoRespostaRestrita } from "../classificadorIntencao/pedidoRespostaRestrita.js";
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
  criarTurnEnvelope,
  anexarTurnEnvelopeNaResposta
} from "../turnEnvelope/index.js";
import {
  produzirSinaisTurno,
  lerSinalBoolean
} from "../turnEnvelope/produzirSinais.js";
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
import {
  seleccionarFioCoa,
  historicoDeliberativoParaDestino
} from "../classificadorIntencao/fioConversacional.js";
import { resolverReferencias } from "../classificadorIntencao/resolverReferencias.js";
import {
  gestorTopicos,
  ehEncerramentoExplicitoContexto
} from "../classificadorIntencao/gestorTopicos.js";
import {
  GESTOR_TOPICOS_ATIVO,
  obterEstadoTopicosSessao
} from "../classificadorIntencao/topicosSessao.js";
import { gestorObjectivo } from "../classificadorIntencao/gestorObjectivo.js";
import {
  GESTOR_OBJECTIVO_ATIVO,
  obterEstadoObjectivoSessao
} from "../classificadorIntencao/objectivoSessao.js";
import {
  aplicarResultadoGestaoTopicosPersistente as aplicarResultadoGestaoTopicos,
  aplicarResultadoGestaoObjectivoPersistente as aplicarResultadoGestaoObjectivo,
  limparEnvelopeActual
} from "../classificadorIntencao/envelopeSessaoCoa.js";
import {
  validarContextoAtivo,
  VCA_ATIVO
} from "../classificadorIntencao/validadorContextoAtivo.js";
import { executarPorDestino } from "../classificadorIntencao/destinos.js";
import {
  resolverPrecedenciaTurno,
  anexarPrecedenciaNaResposta,
  cnPodeAlterarDestino
} from "./resolucaoPrecedenciaTurno.js";
import {
  obterStoreContinuidadePadrao,
  inicializarContinuidadeGateSessao,
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
  ehJobRuidoDeliberativo,
  filtrarMensagensAcompanhamentoDeliberativo,
  filtrarLastroRuidoDeliberativoSobPedidoDecisao,
  idsAdotadosDoStoreSessao,
  observarAcompanhamentosActivos,
  registarAcompanhamentoAposHandoff
} from "../motorExecucao/acompanhamentoJob.js";
import {
  autoridadeDelegadaActiva,
  exercerFechoDelegado,
  hidratarAutoridadeDelegadaSessao,
  obterEstadoAutoridadeDelegada,
  processarMensagemAutoridadeDelegada,
  snapshotAutoridadeDelegadaParaDados
} from "../autoridadeDelegada/autoridadeDelegada.js";
import {
  orquestrarConsultaRegistados,
  criarDepsConsultaProducao
} from "../consultaRegistados/index.js";
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
    return { texto: entrada.trim(), historico: [], coaId: null };
  }
  const texto = String(
    (entrada && (entrada.texto || entrada.instrucao)) || ""
  ).trim();
  const historico = Array.isArray(entrada && entrada.historico)
    ? entrada.historico
    : [];
  const coaIdRaw = entrada && entrada.coaId;
  const coaId =
    coaIdRaw == null || String(coaIdRaw).trim() === ""
      ? null
      : String(coaIdRaw).trim();
  return { texto, historico, coaId };
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
  listarJobs = undefined,
  precedenciaTurno = null,
  tipoTurno = null,
  consultaNaoEAcao = false,
  envelope = null,
  pedidoInfoGathering = undefined,
  pedidoDecisaoExplicita = undefined,
  pedidoConsultaResposta = undefined,
  pedidoAnaliseDeliberativa = undefined,
  pedidoSituacionalTrabalho = undefined,
  objectoTurno = undefined,
  lfcWriter = undefined,
  lfcReader = undefined,
  lfcBaseUrl = undefined
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
  // IMP-094 F1: inject LFC Writer/Reader quando a entrada/teste os fornece.
  if (lfcWriter) ctx.lfcWriter = lfcWriter;
  if (lfcReader) ctx.lfcReader = lfcReader;
  if (lfcBaseUrl != null) ctx.lfcBaseUrl = lfcBaseUrl;
  // IMP-090 Fatia 0: sombra — presente em ctx; nenhum consumidor decide com base nisto.
  if (envelope) {
    ctx.envelope = envelope;
  }
  // IMP-091 B2+: sinais canónicos projectados como bools (consumir; sem redetectar).
  if (pedidoInfoGathering !== undefined) {
    ctx.pedidoInfoGathering = pedidoInfoGathering === true;
  }
  if (pedidoDecisaoExplicita !== undefined) {
    ctx.pedidoDecisaoExplicita = pedidoDecisaoExplicita === true;
  }
  if (pedidoConsultaResposta !== undefined) {
    ctx.pedidoConsultaResposta = pedidoConsultaResposta === true;
  }
  if (pedidoAnaliseDeliberativa !== undefined) {
    ctx.pedidoAnaliseDeliberativa = pedidoAnaliseDeliberativa === true;
  }
  if (pedidoSituacionalTrabalho !== undefined) {
    ctx.pedidoSituacionalTrabalho = pedidoSituacionalTrabalho === true;
  }
  if (objectoTurno != null) {
    ctx.objectoTurno = objectoTurno;
  }
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
  // V1 precedência: CONSULTA disponível no C2/MRE
  if (precedenciaTurno) {
    ctx.precedenciaTurno = precedenciaTurno;
  }
  if (tipoTurno) {
    ctx.tipoTurno = tipoTurno;
  }
  if (consultaNaoEAcao === true) {
    ctx.consultaNaoEAcao = true;
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
function anexarMensagensAcompanhamento(
  resposta,
  obs,
  textoUsuario = "",
  opts = {}
) {
  const pd =
    opts.pedidoDecisaoExplicita != null
      ? opts.pedidoDecisaoExplicita === true
      : detectarPedidoDecisaoExplicita(textoUsuario);
  const obsUso = pd
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
    inicializarContinuidadeGateSessao();
    hidratarAutoridadeDelegadaSessao();
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

    // P0 — contexto vazio: sem projeto/missão activa, a fila global NÃO
    // vira acompanhamento do turno (contrato CONTEXTO ATIVO = vazio).
    // Não altera a fila, nem filtrarJobsPorMissaoActiva, nem Teste 3
    // quando há missão (adopção filtrada permanece abaixo).
    if (
      !missaoActiva ||
      (missaoActiva.id == null && missaoActiva.nome == null)
    ) {
      return {
        ok: true,
        resultados: [],
        mensagens: [],
        aindaActivos: 0,
        fonte: "fila_persistida",
        motivo: "sem_missao_activa_sem_acompanhamento_global"
      };
    }

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

    const { texto, historico, coaId: coaIdEntrada } = normalizarInstrucao(entrada);
    const lfcWriterEntrada =
      entrada && typeof entrada === "object" ? entrada.lfcWriter : undefined;
    const lfcReaderEntrada =
      entrada && typeof entrada === "object" ? entrada.lfcReader : undefined;
    const lfcBaseUrlEntrada =
      entrada && typeof entrada === "object" ? entrada.lfcBaseUrl : undefined;
    // IMP-090 Fatia 0: nascimento canónico após normalizarInstrucao, antes de early-returns.
    const canalIngresso =
      (entrada && typeof entrada === "object" && entrada.canal) ||
      deps.canal ||
      null;
    let turnEnvelope = criarTurnEnvelope({
      mensagemAtual: texto,
      coaIdEntrada,
      canal: canalIngresso,
      obterCoaAtivo
    });
    // IMP-091 B2: fio + sinais canónicos uma vez (antes de AD/classificador).
    const coaIdFioB2 = coaIdEntrada || obterCoaAtivo()?.id || null;
    const fioInicialB2 = seleccionarFioCoa(historico, texto, {
      coaId: coaIdFioB2
    });
    turnEnvelope = produzirSinaisTurno(turnEnvelope, { fioCoa: fioInicialB2 });
    // Sinais canónicos — ler uma vez; consumidores usam estes bools (sem redetectar).
    const pedidoDecisaoPrec = lerSinalBoolean(turnEnvelope, "pd");
    const situacionalPrec = turnEnvelope.derivacoes?.situacional === true;
    const panoramaPrec = lerSinalBoolean(turnEnvelope, "panorama");
    const ordemAdPrec = lerSinalBoolean(turnEnvelope, "execucao");
    const consultaOuRespostaCompostaPrec = lerSinalBoolean(
      turnEnvelope,
      "consulta_composta"
    );
    const pedidoInfoGatheringPrec = lerSinalBoolean(turnEnvelope, "ig");
    const pedidoConsultaPrec = lerSinalBoolean(turnEnvelope, "consulta");
    const pedidoAnalisePrec = lerSinalBoolean(turnEnvelope, "analise");
    /** @param {object} resposta */
    const comEnvelope = (resposta) =>
      anexarTurnEnvelopeNaResposta(resposta, turnEnvelope);

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
      return comEnvelope(respostaCont);
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
      return comEnvelope(respostaClar);
    }

    // IMP-071: Autoridade Delegada — activação/encerramento + execução sob mandato.
    // V1: precedência central — PD/consulta situacional bloqueiam AD ação/ack indevido.
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
    // B2: sinais já lidos após produzirSinaisTurno (sem redetectar).
    const precAd = resolverPrecedenciaTurno({
      pedidoDecisaoExplicita: pedidoDecisaoPrec,
      pedidoSituacionalTrabalho: situacionalPrec,
      pedidoConsultaOuRespostaComposta: consultaOuRespostaCompostaPrec,
      panoramaEstadoGeral: panoramaPrec,
      adActivacaoAck: acabouDeActivar && !ordemAdPrec,
      adOrdemExecucao: autoridadeDelegadaActiva() && ordemAdPrec,
      // Ordem explícita sob AD = objeto do mandato (compatível com testes AD)
      objetoOperacionalReal: ordemAdPrec,
      fase: "pre_classificador"
    });

    // Primeira activação (sem ordem de execução neste turno): confirma mandato.
    // Pedido explícito de decisão / consulta situacional → não short-circuit.
    if (
      acabouDeActivar &&
      !ordemAdPrec &&
      precAd.permiteAdAck
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
      return comEnvelope(anexarPrecedenciaNaResposta(respostaAd, precAd));
    }

    // AD activa + ordem de execução → Motor (C3), não novo ack nem MRE deliberativo.
    // V1: só se precedência autorizar (PD/situacional bloqueiam).
    if (
      autoridadeDelegadaActiva() &&
      ordemAdPrec &&
      precAd.permiteAdExecucao
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
      return comEnvelope(
        anexarPrecedenciaNaResposta(
          anexarMensagensAcompanhamento(
            respostaExec,
            obsAcompanhamento,
            texto,
            { pedidoDecisaoExplicita: pedidoDecisaoPrec }
          ),
          precAd
        )
      );
    }

    // IMP-086 / IMP-089: Consulta registados (read-only).
    // Após Gate/AD; antes de CTO-003 / VCA / Classificador.
    // Fatia 1: deps HFC + Trilha (soft-fail); F-MO intacto.
    {
      const coaConsulta = (() => {
        try {
          const c = obterCoaAtivo();
          return c && c.id ? String(c.id) : null;
        } catch {
          return null;
        }
      })();
      const outConsulta = orquestrarConsultaRegistados({
        texto,
        coaIdActivo: coaConsulta,
        deps: criarDepsConsultaProducao()
      });
      if (outConsulta.consumido) {
        const respostaConsulta = {
          ok: outConsulta.ok !== false,
          mensagem: outConsulta.mensagem,
          intencao: {
            id: "consulta_registados",
            capacidade: "memoria"
          },
          capacidade: "memoria",
          dados: {
            ...(outConsulta.dados || {}),
            classificacao: null,
            encaminhamento: {
              destino: "consulta_registados",
              ok: true,
              idClasse: null
            }
          },
          origem: "executiveEngine",
          modo: "consulta_registados"
        };
        // IMP-086 I1/CA-086-5: sem atualizarAposInstrucao / writers de workspace.
        return comEnvelope(respostaConsulta);
      }
    }

    // CTO-003: Interceptação Operacional — ANTES de VCA / CSC / Classificador.
    // V1: só se precedência autorizar (objeto operacional + não PD/consulta).
    let estadoOpPre = null;
    {
      const idsAdotadosSessao = [
        ...idsAdotadosDoStoreSessao(this._acompanhamentoStore)
      ];
      const lido = await lerEstadoOperacionalPreClassificador({
        storeContinuidade: store,
        leitoresConsciencia: deps.leitoresConsciencia,
        agoraConsciencia: deps.agoraConsciencia,
        historico,
        listarPorEstado: deps.listarPorEstado,
        missaoActiva: missaoTurno,
        idsAdotadosSessao,
        obterCoaAtivo: deps.obterCoaAtivo
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

      const objetoOpReal =
        Boolean(estadoOpPre?.operacaoAberta) ||
        Boolean(estadoOpPre?.jobActivo) ||
        (obsAcompanhamento?.aindaActivos > 0);
      const cto003Candidato = deveInterceptarOperacional({
        texto,
        historico,
        estadoOperacional: estadoOpPre,
        missaoActiva,
        jobs: lido.jobsMissao,
        idsAdotadosSessao,
        pedidoDecisaoExplicita: pedidoDecisaoPrec,
        ...(turnEnvelope.sinais?.objecto_turno?.valor != null
          ? { objectoTurno: turnEnvelope.sinais.objecto_turno.valor }
          : {}),
        ...(fioInicialB2.length ? { fioCoa: fioInicialB2 } : {})
      });
      const precCto = resolverPrecedenciaTurno({
        pedidoDecisaoExplicita: pedidoDecisaoPrec,
        pedidoSituacionalTrabalho: situacionalPrec,
        panoramaEstadoGeral: panoramaPrec,
        cto003Candidato,
        objetoOperacionalReal: objetoOpReal,
        fase: "pre_classificador"
      });

      if (precCto.permiteCto003 && cto003Candidato) {
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
          jobs: lido.jobsMissao,
          deps: {
            ...deps,
            obterJob: obterJobOp,
            publicarJob: publicarJobOp,
            obterCoaAtivo,
            coaId: coaOp?.id || null,
            projeto: coaOp?.id || coaOp?.nome || null,
            projetoNome: coaOp?.nome || null,
            idsAdotadosSessao,
            missaoActiva,
            jobs: lido.jobsMissao,
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
        return comEnvelope(
          anexarPrecedenciaNaResposta(
          anexarMensagensAcompanhamento(
            naturalizarRespostaNucleo(respostaOp, {
              instrucao: texto,
              historico,
              canalSpeaker: "chat",
              pedidoInfoGathering: pedidoInfoGatheringPrec,
              pedidoDecisaoExplicita: pedidoDecisaoPrec,
              pedidoConsultaResposta: pedidoConsultaPrec,
              pedidoAnaliseDeliberativa: pedidoAnalisePrec,
              consultaNaoEAcao: precCto?.tipoTurno === "consulta",
              tipoTurno: precCto?.tipoTurno,
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
            texto,
            { pedidoDecisaoExplicita: pedidoDecisaoPrec }
          ),
          precCto
        )
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
              (obsAcompanhamento?.aindaActivos > 0),
            // IMP-091: sinais canónicos — VCA não reavalia objecto/PD/análise
            pedidoDecisaoExplicita: pedidoDecisaoPrec,
            pedidoAnaliseDeliberativa: pedidoAnalisePrec,
            ...(turnEnvelope.sinais?.objecto_turno?.valor != null
              ? { objectoTurno: turnEnvelope.sinais.objecto_turno.valor }
              : {}),
            ...(fioInicialB2.length ? { fioCoa: fioInicialB2 } : {})
          })
        : {
            veredicto: "pertence",
            autorizaLastroCsc: true,
            autorizaContextoSessao: true,
            razaoContexto: "VCA desactivado → path CSC"
          };

    const metaVca = {
      validacaoContexto: {
        veredicto: resultadoVca.veredicto,
        autorizaLastroCsc: resultadoVca.autorizaLastroCsc,
        autorizaContextoSessao: resultadoVca.autorizaContextoSessao === true,
        razaoContexto: resultadoVca.razaoContexto
      }
    };

    // Prioridade RF: Gate > ambiguo_contexto > objectivo > tópico > referente
    // G2.3: early-return VCA só se resolver autorizar clarificar_contexto.
    // IMP-094 F2: CL-2 — não clarificar protocolo/LFC/DIC/demanda clara.
    if (
      resultadoVca.veredicto === "ambiguo_contexto" &&
      resultadoVca.perguntaCurta
    ) {
      const precVca = resolverPrecedenciaTurno({
        pedidoDecisaoExplicita: pedidoDecisaoPrec,
        pedidoSituacionalTrabalho: situacionalPrec,
        pedidoConsultaOuRespostaComposta: consultaOuRespostaCompostaPrec,
        panoramaEstadoGeral: panoramaPrec,
        vcaClarificacao: true,
        objetoOperacionalReal:
          Boolean(estadoOpPre?.operacaoAberta) ||
          (obsAcompanhamento?.aindaActivos > 0),
        fase: "pre_classificador"
      });
      if (
        precVca.autoridade === "vca_csc" &&
        precVca.acao === "clarificar_contexto"
      ) {
        const verClVca = permiteClarificacaoTurno(texto, {
          ambiguoBloqueante: true,
          motivoCandidato: "vca"
        });
        if (verClVca.permitido) {
          const pergunta =
            resultadoVca.clarificacaoGateIsolamento || resultadoVca.perguntaCurta;
          let respostaVca = {
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
          if (funilClarificacaoEstritaActiva()) {
            respostaVca = anexarObservabilidadeClarificacao(respostaVca, {
              clarificacaoEvitada: false,
              destinoClarificacao: "clarificacao_contexto"
            });
          }
          const memoriaVca = atualizarAposInstrucao({
            instrucao: texto,
            intencao: respostaVca.intencao,
            capacidade: null,
            ok: true,
            mensagem: respostaVca.mensagem,
            dados: respostaVca.dados
          });
          respostaVca.dados = { ...respostaVca.dados, memoria: memoriaVca };
          return comEnvelope(respostaVca);
        }
        // CL-2: cair no funil sem clarificar VCA
      }
    }

    const autorizaLastroCsc = resultadoVca.autorizaLastroCsc === true;
    // COA/Painel: lastro CSC OU contexto de sessão (P0 consulta/análise).
    const autorizaContextoSessao =
      autorizaLastroCsc || resultadoVca.autorizaContextoSessao === true;

    // IMP-094 F4 — resolução única COA (PC + destino); flag CEO_FUNIL_COA_RIGIDO
    const resolucaoCoa = resolverCoaTurno({
      entrada: coaIdEntrada,
      sessao: obterCoaAtivo(),
      autorizaContextoSessao
    });

    const detLfcTurno = detectarModoRespostaRestrita(texto);
    const pediuLastroCaso =
      detLfcTurno.activo === true &&
      ["registo", "confirmacao", "factos", "dado_unico"].includes(
        String(detLfcTurno.modo || "")
      );

    const coaIdFio = coaIdEntrada || (coa && coa.id) || null;
    // P2: reutilizar fio B2 quando o COA do turno não mudou (mesma semântica).
    const historicoDeliberativo =
      coaIdFio === coaIdFioB2
        ? fioInicialB2
        : seleccionarFioCoa(historico, texto, { coaId: coaIdFio });

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
    // Encerramento explícito: limpa tópico/pausas/objectivos + persistência F5-C4.
    // F2B: anula resultadoTop/Obj deste turno para o lastro não reinjectar o contexto anterior.
    if (ehEncerramentoExplicitoContexto(texto)) {
      limparEnvelopeActual();
      resultadoTop = null;
      resultadoObj = null;
    }

    const objetivoParaContexto = autorizaLastroCsc
      ? resultadoObj?.objetivoActivo || estadoObjPre.objetivoActivo || null
      : null;

    const contextoClassificacao = {
      // Isolamento VCA: não injectar lastro de frente/COA no Classificador
      // (evita desambiguação C1→C2 via frenteActiva — REQ-065 / ARQ-026).
      frenteActiva: autorizaLastroCsc && Boolean(coa),
      // Fatia 2: fio deliberativo do COA independe de autorizaLastroCsc.
      ...(historicoDeliberativo.length > 0
        ? { fioCoa: historicoDeliberativo }
        : {}),
      // IMP-091 B2: objecto/situacional/pd já produzidos — classificador não reavalia.
      ...(turnEnvelope.sinais?.objecto_turno?.valor != null
        ? { objectoTurno: turnEnvelope.sinais.objecto_turno.valor }
        : {}),
      situacional: situacionalPrec,
      pedidoDecisaoExplicita: pedidoDecisaoPrec,
      pedidoAnaliseDeliberativa: pedidoAnalisePrec,
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
    // V1: precedência central — PD / situacional forçam C2; panorama C4 já no classificador.
    const precPos = resolverPrecedenciaTurno({
      pedidoDecisaoExplicita: pedidoDecisaoPrec,
      pedidoSituacionalTrabalho: situacionalPrec,
      panoramaEstadoGeral: panoramaPrec,
      destinoClassificador: rotaBruta.destino,
      objetoOperacionalReal:
        Boolean(estadoOpPre?.operacaoAberta) ||
        (obsAcompanhamento?.aindaActivos > 0),
      fase: "pos_classificador"
    });
    let rota = rotaBruta;
    if (
      precPos.forcarC2 &&
      rotaBruta.destino !== "nucleo_mre"
    ) {
      const classificacaoDeliberativa = {
        ...rotaBruta.classificacao,
        classe: "conversa_projeto",
        destino: "nucleo_mre",
        permiteJob: false,
        usaFrenteActiva: true,
        razaoCurta: precPos.razao
      };
      rota = {
        ...rotaBruta,
        destino: "nucleo_mre",
        classificacao: classificacaoDeliberativa
      };
    }
    const classificacao = rota.classificacao;
    const intencao = classificarIntencao(texto, classificacao, {
      fioCoa: historicoDeliberativo,
      ...(turnEnvelope.sinais?.objecto_turno?.valor != null
        ? { objectoTurno: turnEnvelope.sinais.objecto_turno.valor }
        : {}),
      pedidoDecisaoExplicita: pedidoDecisaoPrec
    });

    // IMP-094 F4 — falhas observáveis de COA (após classificar; antes da PC)
    if (
      funilCoaRigidoActiva() &&
      resolucaoCoa.ok === false &&
      resolucaoCoa.codigo === "coa_divergente"
    ) {
      let respDiv = {
        ok: false,
        mensagem: resolucaoCoa.mensagem,
        intencao,
        capacidade: "ia",
        dados: {
          classificacao,
          ...metaVca,
          motorAcionado: false,
          mreInvocado: false,
          llmInvocado: false,
          veredictoCaminho: "clarificacao",
          rota: "coa_divergente"
        },
        origem: "executiveEngine",
        modo: "coa_divergente"
      };
      respDiv = anexarObservabilidadeCoa(respDiv, {
        coaId: null,
        casoId: null,
        marcadoresLn: resolucaoCoa.marcadoresLn,
        codigoCoa: resolucaoCoa.codigo
      });
      return comEnvelope(respDiv);
    }

    if (
      funilCoaRigidoActiva() &&
      pediuLastroCaso &&
      resolucaoCoa.codigo === "coa_ausente"
    ) {
      let respSem = {
        ok: true,
        mensagem: resolucaoCoa.mensagem,
        intencao,
        capacidade: "ia",
        dados: {
          classificacao,
          ...metaVca,
          motorAcionado: false,
          mreInvocado: false,
          llmInvocado: false,
          veredictoCaminho: "canonico",
          familiaCanonico: "lfc",
          rota: "lfc_sem_coa",
          fonteLfc: "lfc_sem_coa"
        },
        origem: "executiveEngine",
        modo: "lfc_sem_coa"
      };
      respSem = anexarObservabilidadeCoa(respSem, {
        coaId: null,
        casoId: null,
        marcadoresLn: resolucaoCoa.marcadoresLn,
        codigoCoa: "coa_ausente"
      });
      return comEnvelope(respSem);
    }

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

    // IMP-094 Fase 1 — Porta Canónica (após classificador/VCA; antes de clarificação/MRE/LLM).
    /** @type {{ clarificacaoEvitada: boolean, razao: string|null }} */
    const obsClarF2 = { clarificacaoEvitada: false, razao: null };
    /**
     * @param {string} motivo
     * @returns {boolean}
     */
    const autorizaClarificacaoCsc = (motivo) => {
      const ver = permiteClarificacaoTurno(texto, {
        ambiguoBloqueante: true,
        motivoCandidato: motivo
      });
      if (!ver.permitido) {
        obsClarF2.clarificacaoEvitada = true;
        obsClarF2.razao = ver.razao;
        return false;
      }
      return true;
    };

    if (funilPortaCanonicaActiva()) {
      const coaIdPc = resolucaoCoa.coaId;
      const canonico = await resolverRespostaCanonica(texto, {
        historico,
        coaId: coaIdPc,
        lfcWriter: lfcWriterEntrada || deps.lfcWriter,
        lfcReader: lfcReaderEntrada || deps.lfcReader,
        lfcBaseUrl: lfcBaseUrlEntrada || deps.lfcBaseUrl
      });
      if (canonico.activo && canonico.mensagem) {
        let respostaPc = {
          ok: true,
          mensagem: canonico.mensagem,
          intencao,
          capacidade: "ia",
          dados: {
            classificacao,
            encaminhamento: {
              destino: "porta_canonica",
              ok: true,
              idClasse: rota.rota?.id || null
            },
            ...metaVca,
            ...metaObjectivos,
            ...metaTopicos,
            motorAcionado: false,
            mreInvocado: false,
            ...(canonico.dadosExtras || {})
          },
          origem: "executiveEngine",
          modo: "porta_canonica"
        };
        respostaPc = anexarObservabilidadeCanonico(respostaPc, {
          familiaCanonico: canonico.familiaCanonico || "protocolo",
          modo: canonico.modo,
          coaId:
            canonico.dadosExtras?.coaId ?? coaIdPc ?? null,
          casoId: canonico.dadosExtras?.casoId ?? null
        });
        respostaPc = anexarObservabilidadeCoa(respostaPc, {
          coaId: respostaPc.dados?.coaId ?? coaIdPc,
          casoId: respostaPc.dados?.casoId ?? null,
          marcadoresLn: canonico.dadosExtras?.marcadoresLn || [],
          codigoCoa: canonico.dadosExtras?.codigoCoa || null
        });
        if (funilClarificacaoEstritaActiva()) {
          respostaPc = anexarObservabilidadeClarificacao(respostaPc, {
            clarificacaoEvitada: true,
            destinoClarificacao: null,
            razao: "porta_canonica_precede_clarificacao"
          });
        }
        const memoriaPc = atualizarAposInstrucao({
          instrucao: texto,
          intencao: respostaPc.intencao,
          capacidade: respostaPc.capacidade,
          ok: true,
          mensagem: respostaPc.mensagem,
          dados: respostaPc.dados
        });
        respostaPc.dados = { ...respostaPc.dados, memoria: memoriaPc };
        return comEnvelope(respostaPc);
      }
    }

    // Prioridade (ARQ-026/025): ambiguo_contexto (já tratado) >
    // Gate×objectivo > ambiguo_objetivo > Gate×shift > tópico > referente
    if (
      resultadoObj?.clarificacaoGateObjectivo &&
      autorizaClarificacaoCsc("csc_gate_objectivo")
    ) {
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
      return comEnvelope(respostaGo);
    }

    if (
      resultadoObj?.evento === "ambiguo_objetivo" &&
      resultadoObj.perguntaCurta
    ) {
      const precCscObj = resolverPrecedenciaTurno({
        pedidoDecisaoExplicita: pedidoDecisaoPrec,
        pedidoSituacionalTrabalho: situacionalPrec,
        pedidoConsultaOuRespostaComposta: consultaOuRespostaCompostaPrec,
        panoramaEstadoGeral: panoramaPrec,
        cscClarificacao: true,
        destinoClassificador: rota.destino,
        objetoOperacionalReal:
          Boolean(estadoOpPre?.operacaoAberta) ||
          (obsAcompanhamento?.aindaActivos > 0),
        fase: "pos_classificador"
      });
      if (
        precCscObj.autoridade === "vca_csc" &&
        precCscObj.acao === "clarificar_contexto" &&
        autorizaClarificacaoCsc("csc_objectivo")
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
        return comEnvelope(respostaObj);
      }
    }

    if (
      resultadoTop?.clarificacaoGateShift &&
      autorizaClarificacaoCsc("csc_gate_shift")
    ) {
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
      return comEnvelope(respostaGs);
    }

    if (resultadoTop?.evento === "ambiguo_topico" && resultadoTop.perguntaCurta) {
      const precCscTop = resolverPrecedenciaTurno({
        pedidoDecisaoExplicita: pedidoDecisaoPrec,
        pedidoSituacionalTrabalho: situacionalPrec,
        pedidoConsultaOuRespostaComposta: consultaOuRespostaCompostaPrec,
        panoramaEstadoGeral: panoramaPrec,
        cscClarificacao: true,
        destinoClassificador: rota.destino,
        objetoOperacionalReal:
          Boolean(estadoOpPre?.operacaoAberta) ||
          (obsAcompanhamento?.aindaActivos > 0),
        fase: "pos_classificador"
      });
      if (
        precCscTop.autoridade === "vca_csc" &&
        precCscTop.acao === "clarificar_contexto" &&
        autorizaClarificacaoCsc("csc_topico")
      ) {
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
        return comEnvelope(respostaTop);
      }
    }

    // IMP-062 RF7: ambiguidade de referente → pergunta curta (sem Job / sem C3)
    // G2.3: early-return CSC só se resolver autorizar clarificar_contexto.
    if (resultadoRef.estado === "ambiguo") {
      const precCscRef = resolverPrecedenciaTurno({
        pedidoDecisaoExplicita: pedidoDecisaoPrec,
        pedidoSituacionalTrabalho: situacionalPrec,
        pedidoConsultaOuRespostaComposta: consultaOuRespostaCompostaPrec,
        panoramaEstadoGeral: panoramaPrec,
        cscClarificacao: true,
        destinoClassificador: rota.destino,
        objetoOperacionalReal:
          Boolean(estadoOpPre?.operacaoAberta) ||
          (obsAcompanhamento?.aindaActivos > 0),
        fase: "pos_classificador"
      });
      if (
        precCscRef.autoridade === "vca_csc" &&
        precCscRef.acao === "clarificar_contexto" &&
        autorizaClarificacaoCsc("csc_referente")
      ) {
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
        return comEnvelope(respostaAmb);
      }
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

    // Teste 3: promover resultado reconciliado (F2 result|needs_correction) ao lastro/missão.
    // Em pedido de decisão: não promover Jobs deliberativos (ruído) — evita prosa
    // «Já incorporei o resultado reconciliado…» sem alterar extrair/aplicar.
    const promocoesBrutas = extrairPromocoesResultadoMissao(obsAcompanhamento);
    let promocoesResultado = promocoesBrutas;
    if (pedidoDecisaoPrec && promocoesBrutas.length) {
      /** @type {Map<string, object>} */
      const jobsPorId = new Map();
      for (const r of obsAcompanhamento?.resultados || []) {
        if (r?.job?.id) jobsPorId.set(String(r.job.id), r.job);
      }
      promocoesResultado = promocoesBrutas.filter((p) => {
        const job = jobsPorId.get(String(p.jobId));
        return !ehJobRuidoDeliberativo(job);
      });
    }
    if (autorizaLastroCsc && promocoesResultado.length) {
      lastroConsciencia = aplicarPromocaoResultadoAoLastro(
        lastroConsciencia,
        promocoesResultado
      );
    }

    // Pedido de decisão: F2 ruído deliberativo não atravessa factosOficiais
    // (fecha porta pré-LLM: factos → bloco → schemaHint → stage 6).
    if (autorizaLastroCsc && lastroConsciencia && pedidoDecisaoPrec) {
      /** @type {object[]} */
      const jobsLastro = [];
      /** @type {Set<string>} */
      const vistos = new Set();
      for (const r of obsAcompanhamento?.resultados || []) {
        const j = r?.job;
        if (!j?.id || vistos.has(String(j.id))) continue;
        vistos.add(String(j.id));
        jobsLastro.push(j);
      }
      // Resumos F2 da consulta (quando o Job completo não veio no obs)
      for (const r of consultaConsciencia.consulta?.estado?.jobsEmExecucao ||
        []) {
        const id = r && typeof r.id === "string" ? r.id : "";
        if (!id || vistos.has(id)) continue;
        vistos.add(id);
        jobsLastro.push({
          id,
          titulo: r.titulo || "",
          descricao: "",
          estado: r.status || "",
          resultado: {
            resumo: r.sinteseResultado || "",
            evidencia: r.evidencia || ""
          }
        });
      }
      lastroConsciencia = filtrarLastroRuidoDeliberativoSobPedidoDecisao(
        lastroConsciencia,
        jobsLastro
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
            ...(lastroConsciencia ? { lastroConsciencia } : {}),
            pedidoDecisaoExplicita: pedidoDecisaoPrec,
            pedidoAnaliseDeliberativa: pedidoAnalisePrec,
            pedidoSituacionalTrabalho: situacionalPrec,
            ...(turnEnvelope.sinais?.objecto_turno?.valor != null
              ? { objectoTurno: turnEnvelope.sinais.objecto_turno.valor }
              : {}),
            ...(historicoDeliberativo.length
              ? { fioCoa: historicoDeliberativo }
              : fioInicialB2.length
                ? { fioCoa: fioInicialB2 }
                : {})
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
            ...(lastroConsciencia ? { lastroConsciencia } : {}),
            pedidoDecisaoExplicita: pedidoDecisaoPrec,
            pedidoAnaliseDeliberativa: pedidoAnalisePrec,
            pedidoSituacionalTrabalho: situacionalPrec,
            ...(turnEnvelope.sinais?.objecto_turno?.valor != null
              ? { objectoTurno: turnEnvelope.sinais.objecto_turno.valor }
              : {}),
            ...(historicoDeliberativo.length
              ? { fioCoa: historicoDeliberativo }
              : fioInicialB2.length
                ? { fioCoa: fioInicialB2 }
                : {})
          };

    // ADR-022 / IMP-092.4 + IMP-094 F4: LFC particionado por coaId.
    // Resolução única via resolverCoaTurno (mesma que Porta Canónica).
    const coaSessao = obterCoaAtivo();
    const coaParaDestino =
      !resolucaoCoa.coaId
        ? null
        : coaSessao && String(coaSessao.id) === String(resolucaoCoa.coaId)
          ? coaSessao
          : { id: String(resolucaoCoa.coaId) };

    const contextoCapacidadeComLastro = (parcial) =>
      contextoCapacidade({
        ...parcial,
        lastroConsciencia: lastroConsciencia || parcial.lastroConsciencia || null,
        coaAtivo: coaParaDestino,
        validacaoContexto: metaVca.validacaoContexto,
        storeContinuidade: store,
        obterJob: deps.obterJob,
        listarJobs: deps.listarJobs || deps.listarPorEstado,
        precedenciaTurno: {
          tipoTurno: precPos.tipoTurno,
          autoridadeVencedora: precPos.autoridadeVencedora,
          destinoPermitido: rota.destino
        },
        tipoTurno: precPos.tipoTurno,
        consultaNaoEAcao: precPos.tipoTurno === "consulta",
        envelope: turnEnvelope,
        pedidoInfoGathering: pedidoInfoGatheringPrec,
        pedidoDecisaoExplicita: pedidoDecisaoPrec,
        pedidoConsultaResposta: pedidoConsultaPrec,
        pedidoAnaliseDeliberativa: pedidoAnalisePrec,
        pedidoSituacionalTrabalho: situacionalPrec,
        lfcWriter: lfcWriterEntrada || deps.lfcWriter,
        lfcReader: lfcReaderEntrada || deps.lfcReader,
        lfcBaseUrl: lfcBaseUrlEntrada || deps.lfcBaseUrl,
        ...(turnEnvelope.sinais?.objecto_turno?.valor != null
          ? { objectoTurno: turnEnvelope.sinais.objecto_turno.valor }
          : {})
      });

    const conduzirMotorPadrao = envolverConduzirMotorComContinuidade(
      store,
      (parecer, motorDeps) => this.conduzirMotorExecucao(parecer, motorDeps),
      texto
    );

    const historicoParaDestino = historicoDeliberativoParaDestino({
      autorizaLastroCsc,
      historicoDeliberativo,
      veredictoVca: resultadoVca.veredicto
    });

    let respostaBruta;
    try {
      // Isolamento VCA: lastro CSC/Job continua cortado quando
      // autorizaLastroCsc=false. O fio deliberativo do COA não é apagado.
      respostaBruta = await executarPorDestino({
        texto,
        historico: historicoParaDestino,
        intencao,
        classificacao,
        rota,
        obterCapacidade,
        contextoCapacidade: contextoCapacidadeComLastro,
        deps: depsDestino,
        conduzirMotorPadrao,
        validacaoContexto: metaVca.validacaoContexto,
        pedidoDecisaoExplicita: pedidoDecisaoPrec,
        pedidoAnaliseDeliberativa: pedidoAnalisePrec,
        pedidoSituacionalTrabalho: situacionalPrec,
        ...(turnEnvelope.sinais?.objecto_turno?.valor != null
          ? { objectoTurno: turnEnvelope.sinais.objecto_turno.valor }
          : {}),
        ...(historicoDeliberativo.length
          ? { fioCoa: historicoDeliberativo }
          : fioInicialB2.length
            ? { fioCoa: fioInicialB2 }
            : {}),
        naturalizar: (r) => {
          const destinoAntes =
            r?.dados?.encaminhamento?.destino || rota.destino || null;
          const naturalizada = naturalizarRespostaNucleo(r, {
            instrucao: texto,
            historico: historicoParaDestino,
            intencao: r.intencao || intencao,
            // Isolamento: sem memória/COA de projecto na âncora CN («Mantemos o foco…»)
            memoria: autorizaLastroCsc ? lerMemoria : null,
            coaAtivo: coaParaDestino,
            canalSpeaker: "chat",
            // DESP-009: CN e superfícies partilham o mesmo lastro de missão
            lastroConsciencia: autorizaLastroCsc ? lastroConsciencia : null,
            refinoEic: memoriaTrabalhoPre
              ? metadadoRefinoEicParaDados(memoriaTrabalhoPre).refinoEic
              : null,
            pedidoInfoGathering: pedidoInfoGatheringPrec,
            pedidoDecisaoExplicita: pedidoDecisaoPrec,
            pedidoConsultaResposta: pedidoConsultaPrec,
            pedidoAnaliseDeliberativa: pedidoAnalisePrec,
            consultaNaoEAcao: precPos.tipoTurno === "consulta",
            tipoTurno: precPos.tipoTurno,
            precedenciaTurno: {
              tipoTurno: precPos.tipoTurno,
              autoridadeVencedora: precPos.autoridadeVencedora
            }
          });
          // V1: Consciência/CN nunca altera destino já decidido
          const destinoDepois =
            naturalizada?.dados?.encaminhamento?.destino || null;
          if (
            !cnPodeAlterarDestino(precPos, destinoAntes, destinoDepois) &&
            destinoAntes &&
            naturalizada?.dados?.encaminhamento
          ) {
            naturalizada.dados.encaminhamento = {
              ...naturalizada.dados.encaminhamento,
              destino: destinoAntes
            };
          }
          return anexarPrecedenciaNaResposta(naturalizada, {
            ...precPos,
            destinoPermitido: destinoAntes || precPos.destinoPermitido,
            destinoFixo: true,
            fase: "pos_destino"
          });
        }
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
    if (funilClarificacaoEstritaActiva()) {
      const destinoFinal =
        resposta?.dados?.encaminhamento?.destino ||
        resposta?.modo ||
        rota.destino ||
        null;
      const isClar =
        destinoFinal === "clarificacao" ||
        String(destinoFinal || "").startsWith("clarificacao_");
      resposta = anexarObservabilidadeClarificacao(resposta, {
        clarificacaoEvitada: !isClar,
        destinoClarificacao: isClar ? destinoFinal : null,
        razao: obsClarF2.razao
      });
    }
    if (!resposta.dados?.precedenciaTurno) {
      resposta = anexarPrecedenciaNaResposta(resposta, {
        ...precPos,
        destinoPermitido: rota.destino,
        destinoFixo: true,
        fase: "pos_destino"
      });
    }
    // V1: consulta não promove a ação — C2/C4 consulta mantêm publicarJob proibido
    if (
      precPos.tipoTurno === "consulta" &&
      resposta.dados &&
      typeof resposta.dados === "object"
    ) {
      resposta.dados = {
        ...resposta.dados,
        publicarJobProibido: true,
        consultaNaoEAcao: true
      };
    }
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

    return comEnvelope(
      anexarMensagensAcompanhamento(resposta, obsAcompanhamento, texto, {
        pedidoDecisaoExplicita: pedidoDecisaoPrec
      })
    );
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
