/**
 * Fachada de integração Núcleo → MRE → Speaker → efeitos F7/F8 (Blocos 2–3).
 */

import { obterPainelExecutivo } from "../catalogoProjetos/index.js";
import { lerMemoria } from "../executiveMemory/index.js";
import {
  obterFactosBriefingProjeto,
  obterProjecaoBriefing
} from "../executiveEngine/briefingsProjeto.js";
import {
  factosViaPorta,
  hintEstagio6LacunaFonteOficial
} from "../camadaConhecimento/portaRecuperacao.js";
import { criarChamarLlmCeo } from "./adaptadorLlmCeo.js";
import { gerarComunicadoExecutivo } from "./speaker/speakerExecutivo.js";
import { textoParaVoz } from "./canais/adaptarCanal.js";
import { executarDeliberacaoMre } from "./executarDeliberacao.js";
import { ehRotaDeliberativa } from "./roteamentoDeliberativo.js";
import { aplicarEfeitosPosDeliberacao } from "./posDeliberacao/efeitosPosDeliberacao.js";
import { criarStoreRetencaoMemoria } from "./posDeliberacao/persistirRetencao.js";
import {
  blocoContextoEntradaMre,
  schemaHintConsciencia,
  garantirReflexoEstadoExecutivo
} from "../conscienciaOperacional/influenciaDeliberacao.js";
import {
  detectarPedidoAnaliseDeliberativa,
  ehPedidoDelegacaoExplicita,
  hintEstagio6AnaliseDeliberativa,
  montarProsaAnaliseDeliberativa
} from "./politicaAnaliseDeliberativa.js";
import {
  detectarPedidoDecisaoExplicita,
  hintEstagio6DecisaoSobConflito
} from "./politicaDecisaoSobConflito.js";
import {
  blocoContextoManifestoParaMre,
  deveAnexarManifestoMg2,
  hintManifestoComoDiretriz,
  obterManifestoMg2,
  obterManifestoMg2EmCache
} from "../camadaConhecimento/manifestoMg2.js";

/** Store de retenção da sessão (browser/Node). */
let storeRetencaoSessao = criarStoreRetencaoMemoria();
/** Idempotência de despacho na sessão. */
const registroDespachoSessao = new Map();

export function obterStoreRetencaoSessao() {
  return storeRetencaoSessao;
}

export function reiniciarStoresPosDeliberacaoParaTestes() {
  storeRetencaoSessao = criarStoreRetencaoMemoria();
  registroDespachoSessao.clear();
}

/**
 * Monta entrada do MRE a partir do contexto do Núcleo.
 * IMP-070 B1 / REQ-070: briefing = projecção subordinada (não canónica).
 * IMP-070 B5 / REQ-072: lastro de Camada só via Porta de recuperação.
 * @param {object} ctx
 */
export function montarEntradaMre(ctx) {
  const texto = String(ctx.instrucao || "").trim();
  const coa = ctx.coaAtivo || null;
  const mem = typeof ctx.memoria === "function" ? ctx.memoria() : null;

  let painel = null;
  try {
    painel = obterPainelExecutivo();
  } catch {
    painel = null;
  }

  const ambitoCoa = coa?.id || mem?.projetoAtivo?.id || null;
  const factos = [
    ...factosViaPorta({
      contextoTrabalho: ambitoCoa ? { id: ambitoCoa } : coa,
      necessidade:
        texto ||
        "lastro organizacional para deliberação MRE / EIC"
    })
  ];
  const projecaoBriefing = obterProjecaoBriefing(coa);
  const factosBriefing = obterFactosBriefingProjeto(coa);

  if (mem?.proximoPasso) factos.push(`Próximo passo: ${mem.proximoPasso}`);
  if (Array.isArray(mem?.pendencias)) {
    for (const p of mem.pendencias.slice(0, 5)) {
      if (p?.texto) factos.push(`Pendência: ${p.texto}`);
    }
  }
  if (painel?.proximoPasso) factos.push(`Painel próximo passo: ${painel.proximoPasso}`);

  // IMP-059 E3/E4 — lastro do Estado Executivo (ops; não é Acervo)
  const lastro = ctx.lastroConsciencia;
  if (lastro && Array.isArray(lastro.factosOficiais)) {
    for (const f of lastro.factosOficiais) {
      if (f) factos.push(f);
    }
  }

  const resumoBriefing =
    factosBriefing.length > 0
      ? `Projecção subordinada (briefing): ${factosBriefing.slice(0, 3).join(" | ")}`
      : null;

  const snapshotPainel = painel
    ? {
        resumo:
          [resumoBriefing, painel.resumo]
            .filter(Boolean)
            .join(" — ") ||
          [
            painel.proximoPasso && `Próximo: ${painel.proximoPasso}`,
            painel.estadoOperacional && `Estado: ${painel.estadoOperacional}`
          ]
            .filter(Boolean)
            .join("; ") ||
          "Painel disponível",
        proximoPasso: painel.proximoPasso,
        estado: painel.estadoOperacional
      }
    : mem || resumoBriefing
      ? {
          resumo:
            [
              resumoBriefing,
              mem?.proximoPasso
                ? `Memória: próximo passo ${mem.proximoPasso}`
                : null
            ]
              .filter(Boolean)
              .join(" — ") || "Contexto COA sem painel estruturado",
          proximoPasso: mem?.proximoPasso ?? null,
          estado: null
        }
      : null;

  let mensagem = enriquecerMensagemComBriefing(texto, factosBriefing);
  mensagem = enriquecerMensagemComConsciencia(mensagem, lastro, (l) =>
    blocoContextoEntradaMre(l, texto)
  );
  // DEC-010 / calibração: fio recente + âncoras EIC → raciocínio com continuidade
  mensagem = enriquecerMensagemComFioRecente(mensagem, ctx.historico);
  mensagem = enriquecerMensagemComMemoriaTrabalho(mensagem, lastro);

  // P1-3 — Manifesto canónico (diretriz; não Fonte Oficial / Acervo)
  const manifesto =
    ctx.manifestoMg2 && ctx.manifestoMg2.ok
      ? ctx.manifestoMg2
      : null;
  if (manifesto) {
    const bloco = blocoContextoManifestoParaMre(manifesto);
    if (bloco) {
      mensagem = `${mensagem}\n\n${bloco}`;
    }
  }

  return {
    mensagem,
    coaId: coa?.id ?? mem?.projetoAtivo?.id ?? null,
    coaAtivo: coa
      ? { id: coa.id, nome: coa.nome || coa.titulo || null }
      : mem?.projetoAtivo
        ? {
            id: mem.projetoAtivo.id,
            nome: mem.projetoAtivo.nome || null
          }
        : null,
    intencao: ctx.intencao || null,
    snapshotPainel,
    factosOficiais: factos,
    projecaoSubordinada: projecaoBriefing,
    fonteOficial: "acervo_oficial",
    viaPortaRecuperacao: true,
    ...(manifesto
      ? {
          manifestoMg2: {
            origem: manifesto.origem,
            caminhoRelativo: manifesto.caminhoRelativo,
            caminhoAbsoluto: manifesto.caminhoAbsoluto,
            mtimeMs: manifesto.mtimeMs,
            principiosSelecionaveis: manifesto.principiosSelecionaveis,
            secoes: manifesto.secoes,
            // conteudo completo disponível ao pipeline (diretriz)
            conteudo: manifesto.conteudo,
            ok: true
          }
        }
      : {})
  };
}

/**
 * Compacta os últimos turnos para o MRE (sem alterar topologia 0–7).
 * @param {string} texto
 * @param {ReadonlyArray<{ papel?: string, texto?: string }>|null|undefined} historico
 */
export function enriquecerMensagemComFioRecente(texto, historico) {
  if (!Array.isArray(historico) || historico.length === 0) return texto;
  const recentes = historico
    .filter((t) => t && String(t.texto || "").trim())
    .slice(-6)
    .map((t) => {
      const papel =
        t.papel === "usuario" || t.papel === "user"
          ? "Utilizador"
          : t.papel === "ceo" || t.papel === "assistente"
            ? "CEO"
            : String(t.papel || "outro");
      const corpo = String(t.texto || "")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 160);
      return `${papel}: ${corpo}`;
    });
  if (!recentes.length) return texto;
  return (
    `${texto}\n\n` +
    "[Fio recente da conversa — manter continuidade; não tratar o pedido actual como mensagem isolada]\n" +
    recentes.join("\n")
  );
}

/**
 * Âncoras da Memória de Trabalho Executiva (EIC-001) na entrada MRE.
 * @param {string} texto
 * @param {object|null|undefined} lastro
 */
export function enriquecerMensagemComMemoriaTrabalho(texto, lastro) {
  const mte = lastro && lastro.memoriaTrabalhoExecutiva;
  if (!mte || typeof mte !== "object") return texto;
  const h = mte.hierarquia || {};
  const e = mte.estadoConversa || {};
  const linhas = [];
  if (h.objectivoEstrategico) {
    linhas.push(`Objectivo estratégico: ${h.objectivoEstrategico}`);
  }
  if (h.objectivoAtual || mte.objectivoAtivo) {
    linhas.push(
      `Objectivo actual: ${h.objectivoAtual || mte.objectivoAtivo}`
    );
  }
  if (h.entregaCorrente) {
    linhas.push(`Entrega corrente: ${h.entregaCorrente}`);
  }
  if (mte.proximaAcao) {
    linhas.push(`Próxima acção: ${mte.proximaAcao}`);
  }
  // DESP-009: decisões / pendências / estado — execução alinha à missão
  if (Array.isArray(mte.decisoesTomadas) && mte.decisoesTomadas.length) {
    linhas.push(`Decisão em vigor: ${mte.decisoesTomadas[0]}`);
  }
  if (mte.posicaoCeoNaoVigente) {
    const vigente0 = Array.isArray(mte.decisoesTomadas)
      ? String(mte.decisoesTomadas[0] || "")
      : "";
    if (!vigente0 || mte.posicaoCeoNaoVigente !== vigente0) {
      linhas.push(
        `Posição do CEO (não vigente): ${mte.posicaoCeoNaoVigente}`
      );
    }
  }
  if (Array.isArray(mte.pendencias) && mte.pendencias.length) {
    linhas.push(
      `Pendências abertas: ${mte.pendencias.slice(0, 3).join("; ")}`
    );
  }
  if (e.emExecucao) {
    linhas.push(`Em execução: ${e.emExecucao}`);
  }
  if (e.bloqueio) {
    linhas.push(`Bloqueio: ${e.bloqueio}`);
  }
  if (mte.encerramento?.necessitaNovoDespacho) {
    linhas.push("Encerramento: necessita novo despacho");
  }
  if (Array.isArray(mte.restricoesAtivas) && mte.restricoesAtivas.length) {
    linhas.push(
      `Restrições activas: ${mte.restricoesAtivas.slice(0, 3).join("; ")}`
    );
  }
  if (!linhas.length) return texto;
  return (
    `${texto}\n\n` +
    "[Estado executivo da conversa — preservar hierarquia de objectivos e conduzir a missão]\n" +
    linhas.join("\n")
  );
}

/**
 * Pedido exploratório — ainda não pede compromisso de decisão.
 * @param {string} mensagem
 */
export function mensagemEhExploratoria(mensagem) {
  const m = String(mensagem || "");
  if (
    /\b(aprova|autoriz[oa]|decide|implementa|executa|despacha|pode\s+avan[cç]ar|faz\s+isso)\b/i.test(
      m
    )
  ) {
    return false;
  }
  return /\b(como\s+(devemos|organizar|pensar)|o\s+que\s+(acha|sugeres)|explorar|op[cç][oõ]es|trade-?off|alternativas?|vale\s+a\s+pena|dever[ií]amos)\b/i.test(
    m
  );
}

/**
 * Pedido de síntese factual / diagnóstico (aprovar com factos é adequado).
 * @param {string} mensagem
 */
export function mensagemPedeDiagnosticoFactos(mensagem) {
  return /\b(o\s+que\s+sabes|o\s+que\s+sabe|diagn[oó]stico|onde\s+estamos|status\s+(do|da)|o\s+que\s+anda|o\s+que\s+se\s+sabe)\b/i.test(
    String(mensagem || "")
  );
}

/**
 * B1 — enquadra a mensagem na entrada (contexto), sem alterar o motor MRE.
 * Evita que o LLM trate «o que sabes?» como lacuna quando o dossier já tem o briefing.
 * @param {string} texto
 * @param {string[]} factosBriefing
 */
function enriquecerMensagemComBriefing(texto, factosBriefing) {
  if (!factosBriefing?.length) return texto;
  return (
    `${texto}\n\n` +
    "[Projecção subordinada do COA (briefing): NÃO é Fonte Oficial. " +
    "A Fonte Oficial é o Acervo; se factosOficiais contiverem LACUNA EXPLÍCITA, " +
    "não inventar conhecimento organizacional. A projecção pode orientar o contexto " +
    "mas em divergência prevalece o Acervo. Não solicitar de novo dados já na projecção; " +
    "só declare lacuna oficial quando o Acervo não tiver item apto. " +
    "LACUNA EXPLÍCITA do Acervo ≠ lacuna material de decisão (REQ-048).]"
  );
}

/**
 * @param {string} texto
 * @param {object|null|undefined} lastro
 * @param {(lastro: object) => string} blocoFn
 */
function enriquecerMensagemComConsciencia(texto, lastro, blocoFn) {
  if (!lastro || lastro.temContextoRelevante !== true) return texto;
  if (typeof blocoFn !== "function") return texto;
  return `${texto}\n\n${blocoFn(lastro)}`;
}

/**
 * @param {object} ctx
 * @param {object} [deps]
 */
export async function executarRotaDeliberativa(ctx, deps = {}) {
  const canal = deps.canal || "chat";
  const msgUserPre = String(ctx.instrucao || "");
  const coaPre = ctx.coaAtivo || null;

  // P1-3: aquecer Manifesto canónico antes de montar entrada
  let ctxComManifesto = ctx;
  if (deveAnexarManifestoMg2(msgUserPre, coaPre)) {
    let manifesto =
      ctx.manifestoMg2 && ctx.manifestoMg2.ok
        ? ctx.manifestoMg2
        : obterManifestoMg2EmCache();
    if (!manifesto || !manifesto.ok) {
      manifesto = await obterManifestoMg2({
        forcar: deps.forcarManifesto === true,
        fs: deps.fsManifesto,
        repoRoot: deps.repoMg2,
        fetchImpl: deps.fetchManifesto
      });
    }
    if (manifesto && manifesto.ok) {
      ctxComManifesto = { ...ctx, manifestoMg2: manifesto };
    }
  }

  const entrada = montarEntradaMre(ctxComManifesto);
  const chamarLlmBase = deps.chamarLlm || criarChamarLlmCeo();
  const lastro = ctx.lastroConsciencia || null;
  const temLastroConsciencia = Boolean(
    lastro && lastro.temContextoRelevante === true
  );
  const temLastroBriefing = Boolean(
    entrada.projecaoSubordinada?.factos?.length ||
      (entrada.factosOficiais || []).some((f) =>
        /WorldLab2|Briefing|COA MG2|Motoboy Game 2/i.test(String(f))
      )
  );
  const temLacunaFonteOficial = (entrada.factosOficiais || []).some((f) =>
    /LACUNA EXPLÍCITA/i.test(String(f))
  );

  const msgUser = String(ctx.instrucao || "");
  const pedidoDecisao = detectarPedidoDecisaoExplicita(msgUser);
  // Pedido explícito de decisão prevalece sobre modo exploração (trade-off/alternativas).
  const exploratoria = pedidoDecisao
    ? false
    : mensagemEhExploratoria(msgUser);
  const diagnosticoFactos = mensagemPedeDiagnosticoFactos(msgUser);
  // Opção A: fecho prevalece — não activar hint/prosa P1-2 em paralelo
  const pedidoAnalise =
    !pedidoDecisao && detectarPedidoAnaliseDeliberativa(msgUser);
  const pedidoDelegacaoExplicita = ehPedidoDelegacaoExplicita(msgUser);
  const temManifesto = Boolean(entrada.manifestoMg2?.ok);

  /**
   * IMP-070 B1 + IMP-059 E4 — reforço no adaptador do Núcleo (não altera o motor MRE).
   * Briefing = projecção subordinada; Fonte Oficial = Acervo (pode ter lacuna).
   * P1-2: pedido de análise → hint anti-delegação fictícia no estágio 6.
   * Decisão sob conflito: pedido explícito → hint de fecho no estágio 6.
   * P1-3: Manifesto canónico → diretriz de decisão (não catálogo CEO).
   */
  const chamarLlm =
    temLastroBriefing ||
    temLastroConsciencia ||
    temLacunaFonteOficial ||
    pedidoAnalise ||
    pedidoDecisao ||
    temManifesto
      ? async (pedido) => {
          let hint = pedido.schemaHint || "";
          if (temManifesto) {
            hint += hintManifestoComoDiretriz();
          }
          if (pedido?.estagio === "6_decisao") {
            if (pedidoAnalise) {
              hint += hintEstagio6AnaliseDeliberativa();
            }
            if (pedidoDecisao) {
              hint += hintEstagio6DecisaoSobConflito();
            }
            if (temLacunaFonteOficial) {
              hint += hintEstagio6LacunaFonteOficial();
            }
            if (temLastroBriefing) {
              hint +=
                " Existe PROJEÇÃO SUBORDINADA (briefing) — não é Fonte Oficial. " +
                "Proibido solicitar_dados apenas porque a mensagem do utilizador é curta.";
              if (diagnosticoFactos && !temLacunaFonteOficial) {
                hint +=
                  " Diagnóstico com Acervo povoado: sintetize factos oficiais. " +
                  "Se só houver projecção, declare a lacuna oficial e não invente património.";
              } else if (diagnosticoFactos && temLacunaFonteOficial) {
                hint +=
                  " Diagnóstico: declare a lacuna da Fonte Oficial; " +
                  "pode mencionar a projecção como orientação não canónica.";
              } else if (exploratoria) {
                hint +=
                  " Mensagem exploratória: NÃO forçar aprovar. Preferir solicitar_dados " +
                  "com critério nomeado que falta, ou monitorar com critério de vigília explícito.";
              } else if (pedidoDecisao) {
                // Hint de fecho já injectado acima — não enfraquecer com «pode aprovar».
              } else if (!pedidoAnalise) {
                hint +=
                  " Se for decisão com critérios já nos factos oficiais, pode aprovar; " +
                  "declare o critério na recomendação.";
              }
              // DESP-004: problemas multi-etapa → reflectir plano na acção/recomendação
              if (
                /\b(plano|etapas?|passo\s+a\s+passo|como\s+(organizar|implementar|estruturar)|roadmap|depend[eê]ncias?)\b/i.test(
                  msgUser
                )
              ) {
                hint +=
                  " Pedido de planeamento: na acao.descricao use etapas separadas por ';', " +
                  "com dependência explícita (após/depois de) e riscos materiais em riscos[]. " +
                  "A decisão (estado) vem depois do plano — não substitua o plano por um veredicto seco.";
              }
            }
            if (temLastroConsciencia) {
              hint +=
                " " + schemaHintConsciencia(lastro, ctx.instrucao || "");
            }
            return chamarLlmBase({ ...pedido, schemaHint: hint });
          }
          if (temManifesto && hint !== (pedido.schemaHint || "")) {
            return chamarLlmBase({ ...pedido, schemaHint: hint });
          }
          return chamarLlmBase(pedido);
        }
      : chamarLlmBase;

  // Em exploração, manter preferirSolicitarDados para não silenciar lacunas materiais.
  // Pedido explícito de decisão: não preferir solicitar_dados por conflito/exploração.
  const preferirSolicitarDados = pedidoDecisao
    ? false
    : exploratoria
      ? true
      : temLastroBriefing || temLastroConsciencia
        ? false
        : undefined;

  const resultado = await executarDeliberacaoMre(entrada, {
    chamarLlm,
    preferirSolicitarDados,
    pedidoAnaliseDeliberativa: pedidoAnalise,
    pedidoDecisaoExplicita: pedidoDecisao,
    pedidoDelegacaoExplicita,
    proibirDespacho:
      (pedidoAnalise || pedidoDecisao) && !pedidoDelegacaoExplicita,
    metadados: {
      origem: "nucleo",
      intencaoId: ctx.intencao?.id,
      manifestoMg2: temManifesto
        ? {
            origem: entrada.manifestoMg2.origem,
            caminhoRelativo: entrada.manifestoMg2.caminhoRelativo
          }
        : null
    }
  });

  if (!resultado.ok || !resultado.parecer) {
    const falha =
      "Não foi possível concluir a deliberação executiva com parecer válido.";
    const reflexoFalha = garantirReflexoEstadoExecutivo(
      falha,
      lastro,
      ctx.instrucao || ""
    );
    return {
      ok: false,
      mensagem: reflexoFalha.mensagem,
      modo: "mre-falha",
      dados: {
        mre: resultado,
        rota: "deliberativa",
        conscienciaInfluencia: reflexoFalha
      }
    };
  }

  const falado = gerarComunicadoExecutivo(resultado.parecer, canal, {
    pedidoAnalise
  });
  if (!falado.ok) {
    return {
      ok: false,
      mensagem: falado.erro || "Speaker recusou o parecer.",
      modo: "mre-speaker-falha",
      dados: {
        parecer: resultado.parecer,
        violacoes: falado.violacoes,
        rota: "deliberativa"
      }
    };
  }

  const comunicado = falado.comunicado;
  if (pedidoAnalise) {
    const prosaAnalise = montarProsaAnaliseDeliberativa(resultado.parecer, {
      maxAnalise: canal === "voz" ? 400 : 900
    });
    if (prosaAnalise) {
      comunicado.texto = prosaAnalise;
    }
  }
  const reflexo = garantirReflexoEstadoExecutivo(
    comunicado.texto,
    lastro,
    ctx.instrucao || ""
  );
  if (reflexo.aplicada && !pedidoAnalise) {
    // P1-2: análise deliberativa não é substituída por prosa canónica de Gate/Job
    comunicado.texto = reflexo.mensagem;
  } else if (reflexo.aplicada && pedidoAnalise) {
    // Mantém análise; só anexa lastro operacional se for Gate/Job crítico e ainda não mencionado
    if (
      lastro?.contagens?.gatesPendentes > 0 &&
      !/gate\s+pendente/i.test(comunicado.texto)
    ) {
      comunicado.texto = `${comunicado.texto}\n\nNota operacional: existe Gate pendente — não inicia execução desta análise.`;
    }
  }

  try {
    const { registarDestaquesDeliberacao } = await import(
      "./canais/centroSituacaoDeliberacao.js"
    );
    registarDestaquesDeliberacao(comunicado);
  } catch {
    /* centro opcional */
  }

  // F7 + F8 — efeitos pós-parecer (não bloqueiam a mensagem se falharem)
  // E5-CA1 / P1-2: só publica Job se o Núcleo injectar publicador explicitamente.
  // NÃO fazer fallback silencioso para publicarJobFila (C2 passava undefined e ainda criava Job).
  let efeitos = null;
  try {
    const publicarJob =
      typeof deps.publicarJob === "function" ? deps.publicarJob : undefined;
    const skipFila =
      deps.skipFila === true ||
      (pedidoAnalise && !pedidoDelegacaoExplicita);
    efeitos = await aplicarEfeitosPosDeliberacao(
      resultado.parecer,
      resultado.planoRetencao,
      {
        publicarJob: skipFila ? undefined : publicarJob,
        storeRetencao: deps.storeRetencao || storeRetencaoSessao,
        registroDespacho: deps.registroDespacho || registroDespachoSessao
      }
    );
  } catch (err) {
    efeitos = {
      erro: err && err.message ? err.message : String(err)
    };
  }

  return {
    ok: true,
    mensagem: comunicado.texto,
    modo: "mre",
    dados: {
      rota: "deliberativa",
      parecer: resultado.parecer,
      comunicado,
      planoRetencao: resultado.planoRetencao,
      textoVoz: textoParaVoz(comunicado),
      parecerId: resultado.parecer.id,
      referenciaDecisao: comunicado.referenciaDecisao,
      efeitosPosDeliberacao: efeitos,
      conscienciaInfluencia: reflexo,
      ...(temManifesto
        ? {
            manifestoMg2: {
              origem: entrada.manifestoMg2.origem,
              caminhoRelativo: entrada.manifestoMg2.caminhoRelativo,
              caminhoAbsoluto: entrada.manifestoMg2.caminhoAbsoluto,
              mtimeMs: entrada.manifestoMg2.mtimeMs,
              principiosSelecionaveis:
                entrada.manifestoMg2.principiosSelecionaveis,
              anexado: true
            }
          }
        : {})
    }
  };
}

export { ehRotaDeliberativa, lerMemoria };
