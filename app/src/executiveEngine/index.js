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
            gatePendente
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
      frenteActiva: Boolean(coa),
      ...(autorizaLastroCsc && historicoRecente.length > 0
        ? { historicoRecente }
        : {}),
      // IMP-064: contexto de objectivo — Classificador permanece único decisor;
      // regras V1 não usam este campo para pontuar C3.
      ...(objetivoParaContexto
        ? { objetivoConversacional: objetivoParaContexto }
        : {})
    };
    const rota = primeiroPassoClassificar(texto, contextoClassificacao);
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
    let lastroConsciencia = consultaConsciencia.lastroParaNucleo;

    // IMP-062: injectar referente no lastro C2/C1 (não altera pontuação C3 nem Jobs)
    if (
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
