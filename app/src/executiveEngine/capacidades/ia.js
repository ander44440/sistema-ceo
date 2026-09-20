/**
 * Capacidade: IA — motor de deliberação.
 * Rotas determinísticas locais; deliberativas via MRE + Speaker (Bloco 2).
 * PX-003 E2: prosa passa pela Conversação Natural (MRE inalterado).
 */
import {
  citacaoCurta,
  snapshotMemoria,
  textoInstrucao
} from "../resposta.js";
import { obterCoaAtivo } from "../coaSessao.js";
import { obterResumoIdentidadeCeo } from "../constituicaoCeo.js";
import {
  metadadoDicInjecao,
  montarMensagensLlm
} from "../promptGovernanca.js";
import { obterProjecaoBriefing } from "../briefingsProjeto.js";
import { deliberarComLlm, obterStatusLlm } from "../llmCliente.js";
import { montarCgMetaPromptDirecto } from "../../contextGovernor/etiquetarPipeline.js";
import { ehBloqueioCg } from "../../contextGovernor/gateLlm.js";
import {
  ehRotaDeliberativa,
  executarRotaDeliberativa
} from "../../mre/integracaoNucleo.js";
import { obterConsumoLfcParaMre } from "../../mre/consumoLfcMre.js";
import { flagMre } from "../../mre/roteamentoDeliberativo.js";
import { naturalizarRespostaNucleo } from "../../conversacaoNatural/index.js";
import {
  comporProsaLastro,
  garantirReflexoEstadoExecutivo
} from "../../conscienciaOperacional/influenciaDeliberacao.js";
import { garantirDisciplinaLastroInsuficiente } from "../../conscienciaOperacional/disciplinaLastroInsuficiente.js";
import { avaliarComplexidadeDecisao } from "../complexidadeDecisao.js";
import {
  detectarPedidoAnaliseDeliberativa,
  detectarPedidoConsultaResposta,
  ehAnaliseSomente,
  ehAutoanaliseRespostaAnterior
} from "../../mre/politicaAnaliseDeliberativa.js";
import { detectarPedidoDecisaoExplicita } from "../../classificadorIntencao/pedidoDecisaoExplicita.js";
import { tentarRespostaRestrita } from "../../classificadorIntencao/comporRespostaRestrita.js";
import { detectarPedidoInfoGathering } from "../../classificadorIntencao/pedidoInfoGathering.js";
import { processarTurnoLfc } from "../../lastroFactualCaso/wiringConversacional.js";
import { corrigirRespostaConsultaCampoLfc } from "../../lastroFactualCaso/consultaCampoLfc.js";
import { obterLfcRuntime } from "../../lastroFactualCaso/runtimeLfc.js";
import { tentarRespostaProtocoloExecutivo } from "../protocoloAgenteExecutivo.js";
import {
  anexarObservabilidadeCanonico,
  familiaProtocoloOuDic,
  funilPortaCanonicaActiva
} from "../portaCanonica.js";
import {
  funilDeliberarUnicoActiva,
  anexarObservabilidadeDeliberar
} from "../funilDeliberarUnico.js";

function formatarDataAgora() {
  const agora = new Date();
  const data = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(agora);
  return data.charAt(0).toUpperCase() + data.slice(1);
}

function formatarHoraAgora() {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date());
}

function respostaLocal(intencaoId, texto) {
  switch (intencaoId) {
    case "pergunta_data":
      return `Hoje é ${formatarDataAgora()}.`;
    case "pergunta_hora":
      return `Agora são ${formatarHoraAgora()}.`;
    case "pergunta_identidade":
      return obterResumoIdentidadeCeo();
    case "saudacao": {
      const t = String(texto || "").toLowerCase();
      if (/bom dia/.test(t)) {
        return "Bom dia. Qual é o objetivo de agora?";
      }
      if (/boa tarde/.test(t)) {
        return "Boa tarde. Qual é o objetivo de agora?";
      }
      if (/boa noite/.test(t)) {
        return "Boa noite. Qual é o objetivo de agora?";
      }
      return "Pronto. Vamos continuar de onde paramos ou surgiu uma nova prioridade?";
    }
    default:
      return null;
  }
}

function fallbackSemLlm(texto, motivo, opts = {}) {
  const pedidoAnalise = opts.pedidoAnalise === true;
  if (pedidoAnalise) {
    return (
      `Não consigo concluir a análise deliberativa pedida sobre «${citacaoCurta(texto)}»: ` +
      `capacidade deliberativa (LLM/MRE) indisponível (${motivo}).\n\n` +
      "Não invento análise sem motor. Não invento handoff a uma equipa externa inexistente neste sistema. " +
      "Configure `CEO_LLM_API_KEY` em `app/.env` (veja `.env.example`), reinicie o servidor e volte a pedir a análise."
    );
  }
  return (
    `Não consigo deliberar com fluidez sobre «${citacaoCurta(texto)}»: motor de linguagem indisponível (${motivo}).\n\n` +
    "Configure `CEO_LLM_API_KEY` em `app/.env` (veja `.env.example`), reinicie o servidor e volte a tentar.\n\n" +
    "Enquanto isso, seguimos no local: data/hora, estado da sessão, projetos e navegação. Qual frente atacamos agora?"
  );
}

/**
 * COA do turno deliberativo: `null` = isolamento VCA (não reabrir sessão).
 * Campo ausente → legado `obterCoaAtivo()`.
 * @param {object} ctx
 */
function resolverCoaDeliberativo(ctx) {
  if (Object.prototype.hasOwnProperty.call(ctx, "coaAtivo")) {
    return ctx.coaAtivo;
  }
  return obterCoaAtivo();
}

/**
 * Sob isolamento (`coa === null`) a memória de projecto não entra no deliberativo.
 * @param {object|null|undefined} coa
 * @param {object} mem
 */
function memoriaParaDeliberacao(coa, mem) {
  if (coa === null) return null;
  return mem;
}

/**
 * IMP-093 — meta CG para path LLM directo / llm_rapido.
 * Propaga LFC só via consumo autorizado alinhado ao COA/caso (mesmo contrato MRE).
 * @param {object} p
 */
function montarCgMetaIa({
  messages,
  paramsMsg,
  dicMeta,
  coa,
  ctx,
  actoChamada,
  lfcConsumo = null
}) {
  const isolamento = coa === null;
  const temBriefing =
    !isolamento &&
    dicMeta?.injectado !== true &&
    Boolean(obterProjecaoBriefing(coa)?.textoRotulado);
  const casoId =
    ctx?.lfcCasoId ||
    ctx?.casoId ||
    ctx?.casoAtivo?.casoId ||
    lfcConsumo?.casoId ||
    null;
  return montarCgMetaPromptDirecto({
    messages,
    coa,
    casoId,
    validacaoContexto: paramsMsg.validacaoContexto || ctx?.validacaoContexto,
    dicMeta,
    temBriefing,
    instrucao: paramsMsg.instrucao,
    actoChamada,
    lfcConsumo: lfcConsumo || null
  });
}

/**
 * Reutiliza obterConsumoLfcParaMre (ADR-022) — sem regras próprias de autorização.
 * @param {object} ctx
 * @param {object|null} coa
 * @param {string} instrucao
 * @param {object} lfcRuntime
 */
async function consumirLfcParaCgMeta(ctx, coa, instrucao, lfcRuntime) {
  if (coa === null) return null;
  try {
    return await obterConsumoLfcParaMre({
      reader: ctx.lfcReader || lfcRuntime?.reader || null,
      coaId: coa?.id || null,
      instrucao: String(instrucao || ""),
      casoId: ctx.lfcCasoId || ctx.casoId || null
    });
  } catch {
    return null;
  }
}

/**
 * IMP-093 M3 — se ENFORCE bloqueou, não usar prosa LLM.
 * @param {object} saida
 * @param {object} base
 */
function respostaSeBloqueioCg(saida, base) {
  if (!ehBloqueioCg(saida)) return null;
  const rc = saida.resultadoCg || {};
  return {
    ok: true,
    capacidade: "ia",
    mensagem:
      saida.mensagem ||
      (rc.exigeEsclarecimento
        ? "Preciso de um esclarecimento de contexto antes de continuar."
        : rc.declaraInsuficienciaLastro
          ? "Lastro insuficiente para responder com segurança neste acto."
          : "Não posso enviar este contexto ao motor de linguagem."),
    modo: "cg_bloqueado",
    dados: {
      ...base,
      cgBloqueio: saida.cg || null,
      resultadoCg: rc,
      mreInvocado: false
    }
  };
}

/**
 * Execução bruta (antes da Conversação Natural).
 * @param {object} ctx
 */
async function executarBruto(ctx) {
  const texto = textoInstrucao(ctx);
  const mem = snapshotMemoria(ctx);
  const intencao = ctx.intencao || {};
  const coa = resolverCoaDeliberativo(ctx);
  const memDelib = memoriaParaDeliberacao(coa, mem);

  if (!texto) {
    return {
      ok: true,
      capacidade: "ia",
      mensagem: "Não recebi instrução. Qual é o objetivo de agora?",
      modo: "local",
      dados: { intencao, memoria: memDelib, coa, rota: "deterministica" }
    };
  }

  const localIds = new Set([
    "pergunta_data",
    "pergunta_hora",
    "pergunta_identidade",
    "saudacao"
  ]);
  if (localIds.has(intencao.id)) {
    const cxLocal = avaliarComplexidadeDecisao({
      texto,
      intencao,
      classe: intencao.classe,
      destino: intencao.destino,
      ...(ctx.objectoTurno != null ? { objectoTurno: ctx.objectoTurno } : {}),
      ...(ctx.pedidoDecisaoExplicita != null
        ? { pedidoDecisaoExplicita: ctx.pedidoDecisaoExplicita === true }
        : {}),
      ...(ctx.pedidoAnaliseDeliberativa != null
        ? { pedidoAnaliseDeliberativa: ctx.pedidoAnaliseDeliberativa === true }
        : {})
    });
    return {
      ok: true,
      capacidade: "ia",
      mensagem: respostaLocal(intencao.id, texto),
      modo: "local",
      dados: {
        instrucao: texto,
        intencao,
        memoria: memDelib,
        coa,
        rota: "deterministica",
        complexidadeDecisao: cxLocal
      }
    };
  }

  // Protocolo Agente Executivo (DIC) — antes de MRE/LLM (evita falha técnica / lastro falso).
  const protocolo = tentarRespostaProtocoloExecutivo(texto);
  if (protocolo.activo && protocolo.mensagem) {
    const cxProt = avaliarComplexidadeDecisao({
      texto,
      intencao,
      classe: intencao.classe,
      destino: intencao.destino,
      frenteActiva: Boolean(coa),
      ...(ctx.objectoTurno != null ? { objectoTurno: ctx.objectoTurno } : {})
    });
    let brutoProt = {
      ok: true,
      capacidade: "ia",
      mensagem: protocolo.mensagem,
      modo: "protocolo_executivo",
      dados: {
        instrucao: texto,
        intencao,
        memoria: memDelib,
        coa,
        rota: "protocolo_executivo",
        modoProtocolo: protocolo.modo,
        complexidadeDecisao: cxProt
      }
    };
    if (funilPortaCanonicaActiva()) {
      brutoProt = anexarObservabilidadeCanonico(brutoProt, {
        familiaCanonico: familiaProtocoloOuDic(protocolo.modo),
        modo: protocolo.modo
      });
    }
    return naturalizarRespostaNucleo(brutoProt, {
      instrucao: texto,
      historico: ctx.historico || [],
      coaAtivo: coa,
      memoria: memDelib
    });
  }

  // Disciplina executiva: LFC (IMP-092.3) para registo/correção/factos/dado_unico;
  // sim_nao / lacunas e fallback reparse via resposta restrita legada (não remove reparse).
  const lfcRuntime = obterLfcRuntime({
    writer: ctx.lfcWriter,
    reader: ctx.lfcReader,
    baseUrl: ctx.lfcBaseUrl
  });
  const restritaLfc = await processarTurnoLfc(texto, {
    historico: ctx.historico || [],
    coaId: coa?.id || null,
    writer: lfcRuntime.writer,
    reader: lfcRuntime.reader,
    permitirFallbackReparse: true
  });
  if (restritaLfc.activo && restritaLfc.mensagem) {
    const cxRestrita = avaliarComplexidadeDecisao({
      texto,
      intencao,
      classe: intencao.classe,
      destino: intencao.destino,
      frenteActiva: Boolean(coa),
      ...(ctx.objectoTurno != null ? { objectoTurno: ctx.objectoTurno } : {})
    });
    let brutoRestrita = {
      ok: true,
      capacidade: "ia",
      mensagem: restritaLfc.mensagem,
      modo: "resposta_restrita",
      dados: {
        instrucao: texto,
        intencao,
        memoria: memDelib,
        coa,
        rota: "resposta_restrita",
        modoRespostaRestrita: restritaLfc.modo,
        fonteLfc: restritaLfc.fonte || null,
        lfc: restritaLfc.dados?.lfc || null,
        complexidadeDecisao: cxRestrita
      }
    };
    if (funilPortaCanonicaActiva()) {
      brutoRestrita = anexarObservabilidadeCanonico(brutoRestrita, {
        familiaCanonico: "lfc",
        modo: restritaLfc.modo
      });
    }
    return naturalizarRespostaNucleo(brutoRestrita, {
      instrucao: texto,
      historico: ctx.historico || [],
      coaAtivo: coa,
      memoria: memDelib
    });
  }

  const restrita = tentarRespostaRestrita(texto, {
    historico: ctx.historico || []
  });
  if (restrita.activo && restrita.mensagem) {
    const cxRestrita = avaliarComplexidadeDecisao({
      texto,
      intencao,
      classe: intencao.classe,
      destino: intencao.destino,
      frenteActiva: Boolean(coa),
      ...(ctx.objectoTurno != null ? { objectoTurno: ctx.objectoTurno } : {})
    });
    const brutoRestrita = {
      ok: true,
      capacidade: "ia",
      mensagem: restrita.mensagem,
      modo: "resposta_restrita",
      dados: {
        instrucao: texto,
        intencao,
        memoria: memDelib,
        coa,
        rota: "resposta_restrita",
        modoRespostaRestrita: restrita.modo,
        complexidadeDecisao: cxRestrita
      }
    };
    return naturalizarRespostaNucleo(brutoRestrita, {
      instrucao: texto,
      historico: ctx.historico || [],
      coaAtivo: coa,
      memoria: memDelib
    });
  }

  const complexidade = avaliarComplexidadeDecisao({
    texto,
    intencao,
    classe: intencao.classe,
    destino: intencao.destino,
    frenteActiva: Boolean(coa),
    ...(ctx.objectoTurno != null ? { objectoTurno: ctx.objectoTurno } : {}),
    ...(ctx.pedidoDecisaoExplicita != null
      ? { pedidoDecisaoExplicita: ctx.pedidoDecisaoExplicita === true }
      : {}),
    ...(ctx.pedidoAnaliseDeliberativa != null
      ? { pedidoAnaliseDeliberativa: ctx.pedidoAnaliseDeliberativa === true }
      : {})
  });

  if (ehRotaDeliberativa(intencao) && flagMre.ativo) {
    const lastro = ctx.lastroConsciencia || null;
    // Opção A: fecho decisório prevalece sobre hint/prosa P1-2
    const pedidoInfoGathering =
      ctx.pedidoInfoGathering != null
        ? ctx.pedidoInfoGathering === true
        : detectarPedidoInfoGathering(texto);
    const pedidoConsulta =
      ctx.pedidoConsultaResposta != null
        ? ctx.pedidoConsultaResposta === true || ctx.consultaNaoEAcao === true
        : detectarPedidoConsultaResposta(texto, {
            consultaNaoEAcao: ctx.consultaNaoEAcao === true,
            tipoTurno: ctx.tipoTurno || ctx.precedenciaTurno?.tipoTurno,
            precedenciaTurno: ctx.precedenciaTurno
          });
    const pedidoDecisao = pedidoInfoGathering
      ? false
      : ctx.pedidoDecisaoExplicita != null
        ? ctx.pedidoDecisaoExplicita === true
        : detectarPedidoDecisaoExplicita(texto);
    const pedidoAnalise =
      !pedidoDecisao &&
      !pedidoConsulta &&
      !pedidoInfoGathering &&
      (ctx.pedidoAnaliseDeliberativa != null
        ? ctx.pedidoAnaliseDeliberativa === true
        : detectarPedidoAnaliseDeliberativa(texto));

    // CONSULTA situacional: nunca desviar para LLM rápido sem snapshot
    // (complexidade «moderado/follow-up» não anula o caminho com SNAPSHOT)
    // IMP-094 F3: deliberação de projecto = só MRE+CG (flag; off = rollback llm_rapido)
    const forcarMreConsulta = pedidoConsulta === true;
    const deliberarUnico = funilDeliberarUnicoActiva();
    const usarMreCompleto =
      deliberarUnico === true ||
      complexidade.permiteMreCompleto === true ||
      forcarMreConsulta;

    const semReflexoContaminante = (mensagem, motivo) => ({
      mensagem,
      aplicada: false,
      motivo
    });

    /**
     * FRENTE 6 — após disciplina fail-closed, não deixar reflexo ops sobrescrever.
     * @param {string} mensagem
     * @param {object|null|undefined} lastroCtx
     * @param {string} instrucao
     * @param {{ aplicada?: boolean }|null|undefined} disciplina
     */
    const reflexoAposDisciplina = (mensagem, lastroCtx, instrucao, disciplina) => {
      if (disciplina && disciplina.aplicada === true) {
        return {
          mensagem,
          aplicada: false,
          motivo: "omitido_apos_disciplina_lastro"
        };
      }
      return garantirReflexoEstadoExecutivo(mensagem, lastroCtx, instrucao, {
        pedidoInfoGathering: ctx.pedidoInfoGathering,
        pedidoDecisaoExplicita: pedidoDecisao
      });
    };

    // REQ-066: decisões «completa» pagam MRE 0–7; CONSULTA situacional também
    // IMP-094 F3: OBS-4/OBS-8 em todo retorno deste ramo
    if (usarMreCompleto) {
      const obsMre = (resposta, llmInvocado) =>
        anexarObservabilidadeDeliberar(resposta, { llmInvocado });

      const status = await obterStatusLlm();
      if (!status || !status.configurado) {
        // P1-2: pedido de análise sem LLM → incapacidade explícita (não prosa de lastro nem delegação fictícia)
        if (pedidoAnalise) {
          return obsMre(
            {
              ok: true,
              capacidade: "ia",
              mensagem: fallbackSemLlm(
                texto,
                "chave não configurada — MRE indisponível",
                { pedidoAnalise: true }
              ),
              modo: "fallback",
              dados: {
                instrucao: texto,
                intencao,
                memoria: memDelib,
                coa,
                llm: status,
                rota: "analise-sem-llm",
                complexidadeDecisao: complexidade
              }
            },
            false
          );
        }
        // CONSULTA: sem LLM → snapshot local (não prosa de Atenção/continuidade)
        if (pedidoConsulta) {
          const { montarSnapshotSituacionalConsulta, comporAnaliseConsultaDesdeSnapshot } =
            await import("../../mre/snapshotSituacionalConsulta.js");
          const snap = montarSnapshotSituacionalConsulta({
            lastro,
            historico: ctx.historico || [],
            factosOficiais: Array.isArray(lastro?.factosOficiais)
              ? lastro.factosOficiais
              : [],
            instrucao: texto
          });
          const mensagem = comporAnaliseConsultaDesdeSnapshot(snap);
          return obsMre(
            {
              ok: true,
              capacidade: "ia",
              mensagem,
              modo: "consulta-snapshot-sem-llm",
              dados: {
                instrucao: texto,
                intencao,
                memoria: memDelib,
                coa,
                llm: status,
                snapshotSituacional: snap,
                rota: "consulta_situacional_snapshot",
                complexidadeDecisao: {
                  ...complexidade,
                  forcarMreConsulta: true,
                  caminho: "snapshot_sem_llm"
                },
                ...(lastro ? { lastroConsciencia: lastro } : {})
              }
            },
            false
          );
        }
        // IMP-059 E4: com lastro operacional, contextualizar mesmo sem LLM
        const prosaLastro = comporProsaLastro(lastro, texto);
        if (prosaLastro) {
          return obsMre(
            {
              ok: true,
              capacidade: "ia",
              mensagem: prosaLastro,
              modo: "consciencia_operacional",
              dados: {
                instrucao: texto,
                intencao,
                memoria: memDelib,
                coa,
                llm: status,
                lastroConsciencia: lastro,
                rota: "deliberativa-consciencia-sem-llm",
                complexidadeDecisao: complexidade
              }
            },
            false
          );
        }
        return obsMre(
          {
            ok: true,
            capacidade: "ia",
            mensagem: fallbackSemLlm(
              texto,
              "chave não configurada — MRE indisponível"
            ),
            modo: "fallback",
            dados: {
              instrucao: texto,
              intencao,
              memoria: memDelib,
              coa,
              llm: status,
              rota: "deliberativa-sem-llm",
              complexidadeDecisao: complexidade
            }
          },
          false
        );
      }

      try {
        const mreCtx = {
          ...ctx,
          memoria: memDelib,
          pedidoInfoGathering,
          pedidoConsultaResposta: pedidoConsulta,
          pedidoAnaliseDeliberativa: pedidoAnalise,
          pedidoDecisaoExplicita: pedidoDecisao,
          consultaNaoEAcao: pedidoConsulta || ctx.consultaNaoEAcao,
          tipoTurno: pedidoConsulta
            ? "consulta"
            : ctx.tipoTurno || ctx.precedenciaTurno?.tipoTurno,
          // IMP-092.4: Reader RO para consumo LFC→MRE (ADR-022)
          lfcReader: lfcRuntime.reader,
          ...(lastro ? { lastroConsciencia: lastro } : {})
        };
        // Isolamento: preservar coaAtivo === null. Legado (campo ausente): injectar resolvido.
        if (!Object.prototype.hasOwnProperty.call(ctx, "coaAtivo")) {
          mreCtx.coaAtivo = coa;
        }
        const mreOut = await executarRotaDeliberativa(mreCtx, {
            canal: ctx.canalSpeaker || "chat",
            // E5-CA1 / P1-2: C2/análise nunca despacha via fallback de fila
            skipFila:
              pedidoAnalise ||
              pedidoConsulta ||
              pedidoInfoGathering ||
              ctx.skipFilaConsciencia === true
                ? true
                : undefined
          }
        );
        const disciplina =
          mreOut.dados?.disciplinaLastro &&
          typeof mreOut.dados.disciplinaLastro === "object"
            ? mreOut.dados.disciplinaLastro
            : {
                aplicada: false,
                motivo: "ausente_no_mre",
                mensagem: mreOut.mensagem,
                sinal: null
              };
        const reflexo =
          pedidoAnalise || pedidoConsulta || pedidoInfoGathering
            ? semReflexoContaminante(
                mreOut.mensagem,
                pedidoInfoGathering
                  ? "info_gathering_sem_reflexo"
                  : pedidoConsulta
                    ? "consulta_snapshot_sem_reflexo"
                    : "analise_p12"
              )
            : reflexoAposDisciplina(
                mreOut.mensagem,
                lastro,
                texto,
                disciplina
              );
        return obsMre(
          {
            ...mreOut,
            mensagem: reflexo.mensagem,
            capacidade: "ia",
            dados: {
              ...(mreOut.dados || {}),
              instrucao: texto,
              intencao,
              memoria: memDelib,
              coa,
              llm: status,
              disciplinaLastro: disciplina,
              conscienciaInfluencia: reflexo,
              complexidadeDecisao: {
                ...complexidade,
                ...(forcarMreConsulta
                  ? {
                      forcarMreConsulta: true,
                      caminho: "mre_consulta_situacional"
                    }
                  : {})
              },
              ...(lastro ? { lastroConsciencia: lastro } : {}),
              ...(mreOut.dados?.parecer?.dossier
                ? {
                    snapshotActivado: Boolean(
                      (mreOut.dados.parecer.dossier.factosUsados || []).some(
                        (f) => /SNAPSHOT SITUACIONAL/.test(String(f))
                      )
                    )
                  }
                : {})
            }
          },
          true
        );
      } catch (err) {
        const fallback = fallbackSemLlm(
          texto,
          err && err.message ? err.message : "falha no MRE",
          { pedidoAnalise }
        );
        const disciplinaFallback = pedidoConsulta
          ? {
              mensagem: fallback,
              aplicada: false,
              motivo: "consulta_fora_de_escopo",
              sinal: null
            }
          : garantirDisciplinaLastroInsuficiente(fallback, {
              factosOficiais: lastro?.factosOficiais,
              parecer: null,
              pedidoConsulta: false,
              pedidoInfoGathering: ctx.pedidoInfoGathering,
              instrucao: texto
            });
        const reflexo =
          pedidoAnalise || pedidoConsulta
            ? semReflexoContaminante(
                disciplinaFallback.mensagem,
                pedidoConsulta
                  ? "consulta_snapshot_sem_reflexo"
                  : "analise_p12"
              )
            : reflexoAposDisciplina(
                disciplinaFallback.mensagem,
                lastro,
                texto,
                disciplinaFallback
              );
        return obsMre(
          {
            ok: true,
            capacidade: "ia",
            mensagem: reflexo.mensagem,
            modo: "fallback",
            dados: {
              instrucao: texto,
              intencao,
              memoria: memDelib,
              coa,
              erro: err && err.message,
              rota: "deliberativa-erro",
              disciplinaLastro: disciplinaFallback,
              conscienciaInfluencia: reflexo,
              complexidadeDecisao: complexidade
            }
          },
          false
        );
      }
    }

    // Nível moderado/leve deliberativo → 1× LLM (sem pipeline MRE)
    // Só alcançável com CEO_FUNIL_DELIBERAR_UNICO=off (rollback F3)
    const statusMod = await obterStatusLlm();
    if (!statusMod || !statusMod.configurado) {
      if (pedidoAnalise) {
        return {
          ok: true,
          capacidade: "ia",
          mensagem: fallbackSemLlm(texto, "chave não configurada", {
            pedidoAnalise: true
          }),
          modo: "fallback",
          dados: {
            instrucao: texto,
            intencao,
            memoria: memDelib,
            coa,
            llm: statusMod,
            rota: "analise-rapida-sem-llm",
            complexidadeDecisao: complexidade
          }
        };
      }
      const prosaLastro = comporProsaLastro(lastro, texto);
      if (prosaLastro) {
        return {
          ok: true,
          capacidade: "ia",
          mensagem: prosaLastro,
          modo: "consciencia_operacional",
          dados: {
            instrucao: texto,
            intencao,
            memoria: memDelib,
            coa,
            llm: statusMod,
            lastroConsciencia: lastro,
            rota: "deliberativa-rapida-sem-llm",
            complexidadeDecisao: complexidade
          }
        };
      }
      return {
        ok: true,
        capacidade: "ia",
        mensagem: fallbackSemLlm(texto, "chave não configurada"),
        modo: "fallback",
        dados: {
          instrucao: texto,
          intencao,
          memoria: memDelib,
          coa,
          llm: statusMod,
          rota: "deliberativa-rapida-sem-llm",
          complexidadeDecisao: complexidade
        }
      };
    }

    try {
      const paramsMsg = {
        instrucao: texto,
        historico: ctx.historico || [],
        memoria: memDelib,
        coa,
        intencao,
        validacaoContexto: ctx.validacaoContexto || null,
        ...(ctx.objectoTurno != null ? { objectoTurno: ctx.objectoTurno } : {}),
        ...(ctx.pedidoDecisaoExplicita != null
          ? { pedidoDecisaoExplicita: ctx.pedidoDecisaoExplicita === true }
          : {}),
        ...(ctx.pedidoAnaliseDeliberativa != null
          ? {
              pedidoAnaliseDeliberativa: ctx.pedidoAnaliseDeliberativa === true
            }
          : {})
      };
      const messages = montarMensagensLlm(paramsMsg);
      if (pedidoAnalise) {
        const hintAuto = ehAutoanaliseRespostaAnterior(texto);
        const hintSomente = !hintAuto && ehAnaliseSomente(texto);
        messages.splice(messages.length - 1, 0, {
          role: "system",
          content: hintAuto
            ? "P4 AUTOANÁLISE: o utilizador pediu exame crítico da SUA resposta anterior. " +
              "Use o histórico/fio recente já fornecido. Aponte acertos, erros, lacunas, " +
              "inconsistências e o que poderia ter sido melhor. " +
              "Proibido: Decisão, Recomendação, escolha de opção, aprovar/modificar/não priorizar, " +
              "próximo passo prescritivo ou instrução de execução. Não invente turnos ausentes do histórico."
            : hintSomente
              ? "P3 ANÁLISE SOMENTE: o utilizador pediu apenas análise/avaliação. " +
                "Responda com análise, riscos, cenários, comparação e lacunas. " +
                "Proibido: Decisão, Recomendação, escolha de opção, aprovar/modificar/não priorizar, " +
                "próximo passo prescritivo ou instrução de execução. Não invente factos ausentes do contexto."
              : "P1-2: o utilizador pediu ANÁLISE e RECOMENDAÇÃO executiva. " +
                "Responda com análise fundamentada no contexto disponível e recomendação explícita " +
                "(aprovar / modificar / não priorizar). " +
                "Proibido responder só com «delegar a uma equipe especializada». " +
                "Proibido criar/assumir Jobs. Não invente factos do Manifesto ou do projecto ausentes do contexto."
        });
      }
      const dicMeta = metadadoDicInjecao(paramsMsg);
      const lfcConsumo = await consumirLfcParaCgMeta(
        ctx,
        coa,
        texto,
        lfcRuntime
      );
      const cgMeta = montarCgMetaIa({
        messages,
        paramsMsg,
        dicMeta,
        coa,
        ctx,
        actoChamada: "llm_rapido",
        lfcConsumo
      });
      const saida = await deliberarComLlm({
        messages,
        temperature: 0.4,
        max_tokens: complexidade.maxTokens,
        cgMeta
      });
      const bloqueioRapido = respostaSeBloqueioCg(saida, {
        instrucao: texto,
        intencao,
        memoria: memDelib,
        coa,
        rota: "deliberativa-rapida",
        complexidadeDecisao: complexidade,
        dicInjecao: dicMeta
      });
      if (bloqueioRapido) return bloqueioRapido;
      // CONSULTA não deve chegar aqui (forcarMreConsulta); se chegar, não contaminar
      let textoLlm = saida.texto;
      const fidelidadeLfc = corrigirRespostaConsultaCampoLfc({
        resposta: textoLlm,
        instrucao: texto,
        factos: lfcConsumo?.factos || []
      });
      if (fidelidadeLfc.aplicada) {
        textoLlm = fidelidadeLfc.mensagem;
      }
      const disciplinaRapida = pedidoConsulta
        ? {
            mensagem: textoLlm,
            aplicada: false,
            motivo: "consulta_fora_de_escopo",
            sinal: null
          }
        : garantirDisciplinaLastroInsuficiente(textoLlm, {
            factosOficiais: lastro?.factosOficiais,
            parecer: null,
            pedidoConsulta: false,
            pedidoInfoGathering: ctx.pedidoInfoGathering,
            instrucao: texto
          });
      const reflexo =
        pedidoAnalise || pedidoConsulta
          ? semReflexoContaminante(
              disciplinaRapida.mensagem,
              pedidoConsulta ? "consulta_snapshot_sem_reflexo" : "analise_p12"
            )
          : reflexoAposDisciplina(
              disciplinaRapida.mensagem,
              lastro,
              texto,
              disciplinaRapida
            );
      return {
        ok: true,
        capacidade: "ia",
        mensagem: reflexo.mensagem,
        modo: "llm_rapido",
        dados: {
          instrucao: texto,
          intencao,
          memoria: memDelib,
          coa,
          rota: "deliberativa-rapida",
          complexidadeDecisao: complexidade,
          dicInjecao: dicMeta,
          disciplinaLastro: disciplinaRapida,
          fidelidadeCampoLfc: fidelidadeLfc,
          conscienciaInfluencia: reflexo,
          llm: {
            modelo: saida.modelo,
            uso: saida.uso,
            origem: saida.origem
          },
          ...(lastro ? { lastroConsciencia: lastro } : {})
        }
      };
    } catch (err) {
      const fallback = fallbackSemLlm(
        texto,
        err && err.message ? err.message : "falha na chamada rápida",
        { pedidoAnalise }
      );
      const disciplinaRapidaErr = pedidoConsulta
        ? {
            mensagem: fallback,
            aplicada: false,
            motivo: "consulta_fora_de_escopo",
            sinal: null
          }
        : garantirDisciplinaLastroInsuficiente(fallback, {
            factosOficiais: lastro?.factosOficiais,
            parecer: null,
            pedidoConsulta: false,
            pedidoInfoGathering: ctx.pedidoInfoGathering,
            instrucao: texto
          });
      const reflexo =
        pedidoAnalise || pedidoConsulta
          ? semReflexoContaminante(
              disciplinaRapidaErr.mensagem,
              pedidoConsulta ? "consulta_snapshot_sem_reflexo" : "analise_p12"
            )
          : reflexoAposDisciplina(
              disciplinaRapidaErr.mensagem,
              lastro,
              texto,
              disciplinaRapidaErr
            );
      return {
        ok: true,
        capacidade: "ia",
        mensagem: reflexo.mensagem,
        modo: "fallback",
        dados: {
          instrucao: texto,
          intencao,
          memoria: memDelib,
          coa,
          erro: err && err.message,
          rota: "deliberativa-rapida-erro",
          complexidadeDecisao: complexidade,
          disciplinaLastro: disciplinaRapidaErr,
          conscienciaInfluencia: reflexo
        }
      };
    }
  }

  const pedidoAnaliseLegado =
    ctx.pedidoDecisaoExplicita != null
      ? ctx.pedidoDecisaoExplicita !== true &&
        (ctx.pedidoAnaliseDeliberativa != null
          ? ctx.pedidoAnaliseDeliberativa === true
          : detectarPedidoAnaliseDeliberativa(texto))
      : !detectarPedidoDecisaoExplicita(texto) &&
        detectarPedidoAnaliseDeliberativa(texto);
  const status = await obterStatusLlm();
  if (!status || !status.configurado) {
    return {
      ok: true,
      capacidade: "ia",
      mensagem: fallbackSemLlm(texto, "chave não configurada", {
        pedidoAnalise: pedidoAnaliseLegado
      }),
      modo: "fallback",
      dados: {
        instrucao: texto,
        intencao,
        memoria: memDelib,
        coa,
        llm: status,
        rota: "legado",
        complexidadeDecisao: complexidade
      }
    };
  }

  try {
    const paramsMsg = {
      instrucao: texto,
      historico: ctx.historico || [],
      memoria: memDelib,
      coa,
      intencao,
      validacaoContexto: ctx.validacaoContexto || null,
      ...(ctx.objectoTurno != null ? { objectoTurno: ctx.objectoTurno } : {}),
      ...(ctx.pedidoDecisaoExplicita != null
        ? { pedidoDecisaoExplicita: ctx.pedidoDecisaoExplicita === true }
        : {}),
      ...(ctx.pedidoAnaliseDeliberativa != null
        ? {
            pedidoAnaliseDeliberativa: ctx.pedidoAnaliseDeliberativa === true
          }
        : {})
    };
    const messages = montarMensagensLlm(paramsMsg);
    const dicMeta = metadadoDicInjecao(paramsMsg);
    const lfcConsumo = await consumirLfcParaCgMeta(
      ctx,
      coa,
      texto,
      lfcRuntime
    );
    const cgMeta = montarCgMetaIa({
      messages,
      paramsMsg,
      dicMeta,
      coa,
      ctx,
      actoChamada: "llm_direct",
      lfcConsumo
    });

    const saida = await deliberarComLlm({
      messages,
      temperature: 0.45,
      max_tokens: complexidade.maxTokens || 900,
      cgMeta
    });

    const bloqueioLegado = respostaSeBloqueioCg(saida, {
      instrucao: texto,
      intencao,
      memoria: memDelib,
      coa,
      rota: "legado-llm",
      complexidadeDecisao: complexidade,
      dicInjecao: dicMeta
    });
    if (bloqueioLegado) return bloqueioLegado;

    return {
      ok: true,
      capacidade: "ia",
      mensagem: saida.texto,
      modo: "llm",
      dados: {
        instrucao: texto,
        intencao,
        memoria: memDelib,
        coa,
        rota: "legado-llm",
        complexidadeDecisao: complexidade,
        dicInjecao: dicMeta,
        llm: {
          modelo: saida.modelo,
          uso: saida.uso,
          origem: saida.origem
        }
      }
    };
  } catch (err) {
    return {
      ok: true,
      capacidade: "ia",
      mensagem: fallbackSemLlm(
        texto,
        err && err.message ? err.message : "falha na chamada"
      ),
      modo: "fallback",
      dados: {
        instrucao: texto,
        intencao,
        memoria: memDelib,
        coa,
        erro: err && err.message,
        rota: "legado-erro",
        complexidadeDecisao: complexidade
      }
    };
  }
}

export const capacidadeIa = Object.freeze({
  id: "ia",
  nome: "IA",
  descricao: "Motor de deliberação e interpretação semântica.",
  async executar(ctx) {
    const bruto = await executarBruto(ctx);
    return naturalizarRespostaNucleo(bruto, {
      ...ctx,
      instrucao: textoInstrucao(ctx)
    });
  }
});
