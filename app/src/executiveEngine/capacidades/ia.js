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
import { deliberarComLlm, obterStatusLlm } from "../llmCliente.js";
import {
  ehRotaDeliberativa,
  executarRotaDeliberativa
} from "../../mre/integracaoNucleo.js";
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
    const pedidoConsulta =
      ctx.pedidoConsultaResposta != null
        ? ctx.pedidoConsultaResposta === true || ctx.consultaNaoEAcao === true
        : detectarPedidoConsultaResposta(texto, {
            consultaNaoEAcao: ctx.consultaNaoEAcao === true,
            tipoTurno: ctx.tipoTurno || ctx.precedenciaTurno?.tipoTurno,
            precedenciaTurno: ctx.precedenciaTurno
          });
    const pedidoDecisao =
      ctx.pedidoDecisaoExplicita != null
        ? ctx.pedidoDecisaoExplicita === true
        : detectarPedidoDecisaoExplicita(texto);
    const pedidoAnalise =
      !pedidoDecisao &&
      !pedidoConsulta &&
      (ctx.pedidoAnaliseDeliberativa != null
        ? ctx.pedidoAnaliseDeliberativa === true
        : detectarPedidoAnaliseDeliberativa(texto));

    // CONSULTA situacional: nunca desviar para LLM rápido sem snapshot
    // (complexidade «moderado/follow-up» não anula o caminho com SNAPSHOT)
    const forcarMreConsulta = pedidoConsulta === true;
    const usarMreCompleto =
      complexidade.permiteMreCompleto === true || forcarMreConsulta;

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
    if (usarMreCompleto) {
      const status = await obterStatusLlm();
      if (!status || !status.configurado) {
        // P1-2: pedido de análise sem LLM → incapacidade explícita (não prosa de lastro nem delegação fictícia)
        if (pedidoAnalise) {
          return {
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
          };
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
          return {
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
          };
        }
        // IMP-059 E4: com lastro operacional, contextualizar mesmo sem LLM
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
              llm: status,
              lastroConsciencia: lastro,
              rota: "deliberativa-consciencia-sem-llm",
              complexidadeDecisao: complexidade
            }
          };
        }
        return {
          ok: true,
          capacidade: "ia",
          mensagem: fallbackSemLlm(texto, "chave não configurada — MRE indisponível"),
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
        };
      }

      try {
        const mreCtx = {
          ...ctx,
          memoria: memDelib,
          consultaNaoEAcao: pedidoConsulta || ctx.consultaNaoEAcao,
          tipoTurno: pedidoConsulta
            ? "consulta"
            : ctx.tipoTurno || ctx.precedenciaTurno?.tipoTurno,
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
          pedidoAnalise || pedidoConsulta
            ? semReflexoContaminante(
                mreOut.mensagem,
                pedidoConsulta
                  ? "consulta_snapshot_sem_reflexo"
                  : "analise_p12"
              )
            : reflexoAposDisciplina(
                mreOut.mensagem,
                lastro,
                texto,
                disciplina
              );
        return {
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
        };
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
            rota: "deliberativa-erro",
            disciplinaLastro: disciplinaFallback,
            conscienciaInfluencia: reflexo,
            complexidadeDecisao: complexidade
          }
        };
      }
    }

    // Nível moderado/leve deliberativo → 1× LLM (sem pipeline MRE)
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
      const saida = await deliberarComLlm({
        messages,
        temperature: 0.4,
        max_tokens: complexidade.maxTokens
      });
      // CONSULTA não deve chegar aqui (forcarMreConsulta); se chegar, não contaminar
      const disciplinaRapida = pedidoConsulta
        ? {
            mensagem: saida.texto,
            aplicada: false,
            motivo: "consulta_fora_de_escopo",
            sinal: null
          }
        : garantirDisciplinaLastroInsuficiente(saida.texto, {
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

    const saida = await deliberarComLlm({
      messages,
      temperature: 0.45,
      max_tokens: complexidade.maxTokens || 900
    });

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
