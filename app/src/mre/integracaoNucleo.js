/**
 * Fachada de integração Núcleo → MRE → Speaker → efeitos F7/F8 (Blocos 2–3).
 */

import { seleccionarFioCoa } from "../classificadorIntencao/fioConversacional.js";
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
import { montarCgMetaDeEntradaMre } from "../contextGovernor/etiquetarPipeline.js";
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
  garantirDisciplinaLastroInsuficiente,
  temFactosLfcActivosNoTurno,
  soLacunasGenericasEssenciais
} from "../conscienciaOperacional/disciplinaLastroInsuficiente.js";
import {
  detectarPedidoAnaliseDeliberativa,
  detectarPedidoConsultaResposta,
  ehPedidoDelegacaoExplicita,
  hintEstagio6AnaliseDeliberativa,
  hintEstagio6ConsultaResposta,
  montarProsaAnaliseDeliberativa,
  obterAutoanaliseActiva
} from "./politicaAnaliseDeliberativa.js";
import {
  detectarPedidoDecisaoExplicita,
  hintEstagio6DecisaoSobConflito
} from "./politicaDecisaoSobConflito.js";
import {
  detectarPedidoInfoGathering,
  hintEstagio6InfoGathering
} from "../classificadorIntencao/pedidoInfoGathering.js";
import {
  blocoContextoManifestoParaMre,
  deveAnexarManifestoMg2,
  hintManifestoComoDiretriz,
  obterManifestoMg2,
  obterManifestoMg2EmCache
} from "../camadaConhecimento/manifestoMg2.js";
import {
  blocoGovernaFactosUtilizador,
  factosMateriaisDoTurno
} from "./factosTurnoUtilizador.js";
import { enriquecerEntradaMreComLfc } from "./consumoLfcMre.js";
import {
  soLacunasInstitucionaisCoaPainel,
  temFactosMateriaisDoUtilizador
} from "./ncs/politicas.js";

/**
 * ADR-022 CM12: com LFC activo e lacuna só genérica, não manter solicitar_dados.
 * @param {object} parecer
 * @param {ReadonlyArray<string>|null|undefined} factosOficiais
 */
export function ajustarParecerSobLfcActivo(parecer, factosOficiais) {
  if (!parecer || typeof parecer !== "object") return parecer;
  const estado = parecer.decisaoExecutiva?.estado;
  if (estado !== "solicitar_dados") return parecer;
  if (!temFactosLfcActivosNoTurno(factosOficiais)) return parecer;
  const lacunas = Array.isArray(parecer.lacunas) ? parecer.lacunas : [];
  if (lacunas.length && !soLacunasGenericasEssenciais(lacunas)) {
    return parecer;
  }
  const de = { ...(parecer.decisaoExecutiva || {}) };
  de.estado = "monitorar";
  if (!String(de.recomendacao || "").trim()) {
    de.recomendacao =
      "Com base nos factos activos do LFC, a preocupação executiva central é a " +
      "compressão da margem (queda da margem líquida com subida de custos de matérias-primas).";
  }
  const acao = {
    ...(parecer.acao && typeof parecer.acao === "object" ? parecer.acao : {}),
    tipo: "aguardar",
    descricao:
      String(parecer.acao?.descricao || "").trim() ||
      "Acompanhar a pressão sobre a margem com base nos factos LFC activos."
  };
  return {
    ...parecer,
    lacunas: [],
    decisaoExecutiva: de,
    acao
  };
}

/**
 * C3: factos materiais do turno + lacunas COA/Painel →
 * não manter solicitar_dados nem expor lacunas institucionais como bloqueio.
 * @param {object} parecer
 * @param {ReadonlyArray<string>|null|undefined} factosOficiais
 */
export function ajustarParecerSobFactosTurno(parecer, factosOficiais) {
  if (!parecer || typeof parecer !== "object") return parecer;
  if (!temFactosMateriaisDoUtilizador(factosOficiais)) return parecer;
  const lacunas = Array.isArray(parecer.lacunas) ? parecer.lacunas : [];
  const filtradas = lacunas.filter(
    (l) => !/COA ativo ausente|Painel executivo ausente/i.test(String(l || ""))
  );
  const estado = parecer.decisaoExecutiva?.estado;
  const soInst = soLacunasInstitucionaisCoaPainel(lacunas);
  const mudouLacunas = filtradas.length !== lacunas.length;
  if (!mudouLacunas && !(estado === "solicitar_dados" && soInst)) {
    return parecer;
  }
  let de = parecer.decisaoExecutiva
    ? { ...parecer.decisaoExecutiva }
    : undefined;
  let acao = parecer.acao;
  if (estado === "solicitar_dados" && soInst) {
    de = { ...(de || {}), estado: "monitorar" };
    acao = {
      ...(parecer.acao && typeof parecer.acao === "object" ? parecer.acao : {}),
      tipo: "aguardar",
      descricao:
        String(parecer.acao?.descricao || "").trim() ||
        "Análise com base nos factos explícitos do turno (sem lastro COA/Painel)."
    };
  }
  return {
    ...parecer,
    lacunas: filtradas,
    ...(de ? { decisaoExecutiva: de } : {}),
    ...(acao ? { acao } : {})
  };
}

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
 * IMP-092.4 / ADR-022: consumo LFC é passo separado (`enriquecerEntradaMreComLfc`)
 * após esta montagem — não escrever LFC aqui.
 * @param {object} ctx
 */
export function montarEntradaMre(ctx) {
  const texto = String(ctx.instrucao || "").trim();
  // null = isolamento VCA; undefined/ausente = legado (pode usar mem.projetoAtivo).
  const isolamento = ctx.coaAtivo === null;
  const coa = isolamento ? null : ctx.coaAtivo || null;
  const memRaw =
    typeof ctx.memoria === "function" ? ctx.memoria() : ctx.memoria || null;
  const mem = isolamento ? null : memRaw;

  let painel = null;
  if (!isolamento) {
    try {
      painel = obterPainelExecutivo();
    } catch {
      painel = null;
    }
  }

  const ambitoCoa = isolamento
    ? null
    : coa?.id || mem?.projetoAtivo?.id || null;
  const factos = [
    ...factosViaPorta({
      contextoTrabalho: ambitoCoa ? { id: ambitoCoa } : coa,
      necessidade:
        texto ||
        "lastro organizacional para deliberação MRE / EIC"
    })
  ];
  const projecaoBriefing = isolamento ? null : obterProjecaoBriefing(coa);
  const factosBriefing = isolamento ? [] : obterFactosBriefingProjeto(coa);

  // Factos do turno/fio do utilizador: lastro material (≠ património do Acervo).
  const factosUtilizador = factosMateriaisDoTurno(
    texto,
    Array.isArray(ctx.historico) ? ctx.historico : []
  );
  for (const f of factosUtilizador) {
    factos.push(f);
  }

  if (!isolamento) {
    if (mem?.proximoPasso) factos.push(`Próximo passo: ${mem.proximoPasso}`);
    if (Array.isArray(mem?.pendencias)) {
      for (const p of mem.pendencias.slice(0, 5)) {
        if (p?.texto) factos.push(`Pendência: ${p.texto}`);
      }
    }
    if (painel?.proximoPasso) {
      factos.push(`Painel próximo passo: ${painel.proximoPasso}`);
    }
  }

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

  const snapshotPainel = isolamento
    ? null
    : painel
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

  const infoGatheringEntrada =
    ctx.pedidoInfoGathering != null
      ? ctx.pedidoInfoGathering === true
      : detectarPedidoInfoGathering(texto);
  const pdEntrada =
    ctx.pedidoDecisaoExplicita != null
      ? ctx.pedidoDecisaoExplicita === true
      : undefined;

  // FRENTE 7 / assimetria F6: a âncora do turno NÃO funde fio/MTE/agenda/Jobs.
  // Esses anexos ficam separados e governáveis (historico, lastro, anexosDeliberativos);
  // o pipeline LLM usa mensagemAncoraEntradaMre → mre_contrato sem fusão irreversível.
  const mensagemAtual = texto;
  let mensagem = enriquecerMensagemComBriefing(texto, factosBriefing);
  const blocoFactosUser = blocoGovernaFactosUtilizador(factosUtilizador);
  if (blocoFactosUser) {
    mensagem = `${mensagem}\n\n${blocoFactosUser}\n${factosUtilizador.join("\n")}`;
  }

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

  const blocoConsciencia =
    lastro && lastro.temContextoRelevante === true
      ? blocoContextoEntradaMre(lastro, texto, {
          pedidoInfoGathering: infoGatheringEntrada,
          ...(pdEntrada !== undefined
            ? { pedidoDecisaoExplicita: pdEntrada }
            : {})
        })
      : null;
  const comFio = enriquecerMensagemComFioRecente("", ctx.historico);
  const blocoFioRecente = comFio.trim() ? comFio.trim() : null;
  const comMte = enriquecerMensagemComMemoriaTrabalho("", lastro, {
    omitirInstrucaoOperacional: infoGatheringEntrada
  });
  const blocoMemoriaTrabalho = comMte.trim() ? comMte.trim() : null;

  return {
    mensagem,
    /** Pedido actual do utilizador — âncora independente (não inclui fio/MTE/agenda). */
    mensagemAtual,
    /**
     * Lastros de continuidade/ops separados da âncora — governáveis pelo CG/pipeline.
     * Não entram em `mensagem` nem no JSON base do `mre_contrato`.
     */
    anexosDeliberativos: {
      fioRecente: blocoFioRecente,
      memoriaTrabalho: blocoMemoriaTrabalho,
      consciencia: blocoConsciencia
    },
    coaId: isolamento
      ? null
      : coa?.id ?? mem?.projetoAtivo?.id ?? null,
    coaAtivo: isolamento
      ? null
      : coa
        ? { id: coa.id, nome: coa.nome || coa.titulo || null }
        : mem?.projetoAtivo
          ? {
              id: mem.projetoAtivo.id,
              nome: mem.projetoAtivo.nome || null
            }
          : null,
    intencao: ctx.intencao || null,
    historico: Array.isArray(ctx.historico) ? ctx.historico : [],
    lastroConsciencia: ctx.lastroConsciencia || null,
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
 * Âncora do turno para o LLM / mre_contrato (FRENTE 7).
 * Preferir `mensagemAtual`; fallback à `mensagem` (compat).
 * @param {object|null|undefined} entrada
 * @returns {string}
 */
export { mensagemAncoraEntradaMre } from "./mensagemAncora.js";

/**
 * P4 — última resposta completa do CEO no histórico (sem truncar).
 * @param {ReadonlyArray<{ papel?: string, texto?: string }>|null|undefined} historico
 * @returns {string|null}
 */
export function extrairUltimaRespostaCeo(historico) {
  if (!Array.isArray(historico) || historico.length === 0) return null;
  for (let i = historico.length - 1; i >= 0; i -= 1) {
    const t = historico[i];
    if (!t) continue;
    const papel = String(t.papel || "").toLowerCase();
    if (papel !== "ceo" && papel !== "assistente") continue;
    const texto = String(t.texto ?? "");
    if (!texto.trim()) continue;
    return texto;
  }
  return null;
}

/**
 * Compacta os últimos turnos para o MRE (sem alterar topologia 0–7).
 * @param {string} texto
 * @param {ReadonlyArray<{ papel?: string, texto?: string }>|null|undefined} historico
 */
export function enriquecerMensagemComFioRecente(texto, historico) {
  if (!Array.isArray(historico) || historico.length === 0) return texto;
  const janela = seleccionarFioCoa(historico, texto);
  if (!janela.length) return texto;
  const recentes = janela.map((t) => {
    const papel =
      t.papel === "usuario"
        ? "Utilizador"
        : t.papel === "ceo"
          ? "CEO"
          : String(t.papel || "outro");
    return `${papel}: ${t.texto}`;
  });
  return (
    `${texto}\n\n` +
    "[Fio recente da conversa — CONTEXTO factual do mesmo COA. " +
    "A pergunta/instrução ACTUAL governa a resposta. " +
    "Recomendações ou decisões anteriores são contexto, NÃO mandato; " +
    "não as repita como resposta ao pedido actual.]\n" +
    recentes.join("\n")
  );
}

/**
 * Âncoras da Memória de Trabalho Executiva (EIC-001) na entrada MRE.
 * @param {string} texto
 * @param {object|null|undefined} lastro
 * @param {{ omitirInstrucaoOperacional?: boolean }} [opts]
 */
export function enriquecerMensagemComMemoriaTrabalho(texto, lastro, opts = {}) {
  const mte = lastro && lastro.memoriaTrabalhoExecutiva;
  if (!mte || typeof mte !== "object") return texto;
  const h = mte.hierarquia || {};
  const e = mte.estadoConversa || {};
  const omitirInstrucao = opts.omitirInstrucaoOperacional === true;
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
  // Info-gathering: não injectar próxima acção / posição como instrução do turno
  if (!omitirInstrucao && mte.proximaAcao) {
    linhas.push(`Próxima acção: ${mte.proximaAcao}`);
  }
  if (
    !omitirInstrucao &&
    Array.isArray(mte.decisoesTomadas) &&
    mte.decisoesTomadas.length
  ) {
    linhas.push(`Decisão em vigor: ${mte.decisoesTomadas[0]}`);
  }
  if (!omitirInstrucao && mte.posicaoCeoNaoVigente) {
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
  if (!omitirInstrucao && e.emExecucao) {
    linhas.push(`Em execução: ${e.emExecucao}`);
  }
  if (e.bloqueio) {
    linhas.push(`Bloqueio: ${e.bloqueio}`);
  }
  if (!omitirInstrucao && mte.encerramento?.necessitaNovoDespacho) {
    linhas.push("Encerramento: necessita novo despacho");
  }
  if (Array.isArray(mte.restricoesAtivas) && mte.restricoesAtivas.length) {
    linhas.push(
      `Restrições activas: ${mte.restricoesAtivas.slice(0, 3).join("; ")}`
    );
  }
  if (!linhas.length) return texto;
  const cabecalho = omitirInstrucao
    ? "[Estado executivo — só contexto factual; a pergunta actual pede informações/lacunas, não reabrir a missão com a posição anterior]\n"
    : "[Estado executivo da conversa — preservar hierarquia de objectivos e conduzir a missão]\n";
  return `${texto}\n\n` + cabecalho + linhas.join("\n");
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

  let entrada = montarEntradaMre(ctxComManifesto);
  // IMP-092.4 / ADR-022 — LfcReader RO sob gatilho COA+caso; nunca Writer.
  entrada = await enriquecerEntradaMreComLfc(entrada, {
    reader: ctxComManifesto.lfcReader || deps.lfcReader || null,
    coaId: entrada.coaId,
    instrucao: ctxComManifesto.instrucao || "",
    casoId: ctxComManifesto.lfcCasoId || ctxComManifesto.casoId || null
  });
  if (ctx.consultaNaoEAcao === true) entrada.consultaNaoEAcao = true;
  if (ctx.tipoTurno) entrada.tipoTurno = ctx.tipoTurno;
  if (ctx.precedenciaTurno) entrada.precedenciaTurno = ctx.precedenciaTurno;
  // IMP-093 M2 — meta CG a partir da entrada (fragmentos reais; SHADOW).
  const cgMetaBase = montarCgMetaDeEntradaMre(entrada, ctxComManifesto);
  const chamarLlmBase =
    deps.chamarLlm || criarChamarLlmCeo({ cgMetaBase });
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
  const pedidoInfoGathering =
    ctx.pedidoInfoGathering != null
      ? ctx.pedidoInfoGathering === true
      : detectarPedidoInfoGathering(msgUser);
  const pedidoDecisao = pedidoInfoGathering
    ? false
    : ctx.pedidoDecisaoExplicita != null
      ? ctx.pedidoDecisaoExplicita === true
      : detectarPedidoDecisaoExplicita(msgUser);
  // Pedido explícito de decisão prevalece sobre modo exploração (trade-off/alternativas).
  const exploratoria = pedidoDecisao
    ? false
    : mensagemEhExploratoria(msgUser);
  const diagnosticoFactos = mensagemPedeDiagnosticoFactos(msgUser);
  const pedidoConsulta = pedidoDecisao
    ? false
    : pedidoInfoGathering
      ? false
      : ctx.pedidoConsultaResposta != null
        ? ctx.pedidoConsultaResposta === true || ctx.consultaNaoEAcao === true
        : detectarPedidoConsultaResposta(msgUser, {
            consultaNaoEAcao: ctx.consultaNaoEAcao === true,
            tipoTurno: ctx.tipoTurno || ctx.precedenciaTurno?.tipoTurno,
            precedenciaTurno: ctx.precedenciaTurno
          });
  // Opção A: fecho prevalece — não activar hint/prosa P1-2 em paralelo
  // CONSULTA situacional ≠ análise de proposta (P1-2)
  const pedidoAnalise =
    !pedidoDecisao &&
    !pedidoConsulta &&
    !pedidoInfoGathering &&
    (ctx.pedidoAnaliseDeliberativa != null
      ? ctx.pedidoAnaliseDeliberativa === true
      : detectarPedidoAnaliseDeliberativa(msgUser));
  const pedidoDelegacaoExplicita = ehPedidoDelegacaoExplicita(msgUser);
  const temManifesto = Boolean(entrada.manifestoMg2?.ok);

  // P4 — objecto da autoanálise: última resposta CEO completa → Estágio 4
  if (obterAutoanaliseActiva()) {
    const ultima = extrairUltimaRespostaCeo(ctx.historico);
    if (ultima != null) {
      entrada.ultimaRespostaCeo = ultima;
    }
  }

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
    pedidoConsulta ||
    pedidoDecisao ||
    pedidoInfoGathering ||
    temManifesto
      ? async (pedido) => {
          let hint = pedido.schemaHint || "";
          if (temManifesto) {
            hint += hintManifestoComoDiretriz();
          }
          if (pedido?.estagio === "6_decisao") {
            if (pedidoInfoGathering) {
              hint += hintEstagio6InfoGathering();
            } else if (pedidoConsulta) {
              hint += hintEstagio6ConsultaResposta();
            } else if (pedidoAnalise) {
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
              } else if (exploratoria && !pedidoConsulta) {
                hint +=
                  " Mensagem exploratória: NÃO forçar aprovar. Preferir solicitar_dados " +
                  "com critério nomeado que falta, ou monitorar com critério de vigília explícito.";
              } else if (pedidoDecisao) {
                // Hint de fecho já injectado acima — não enfraquecer com «pode aprovar».
              } else if (!pedidoAnalise && !pedidoConsulta) {
                hint +=
                  " Se for decisão com critérios já nos factos oficiais, pode aprovar; " +
                  "declare o critério na recomendação.";
              }
              // DESP-004: só quando NÃO é consulta (consulta ≠ plano)
              if (
                !pedidoConsulta &&
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
                " " +
                  schemaHintConsciencia(lastro, ctx.instrucao || "", {
                    pedidoInfoGathering,
                    pedidoDecisaoExplicita: pedidoDecisao
                  });
            }
            return chamarLlmBase({ ...pedido, schemaHint: hint });
          }
          if (temManifesto && hint !== (pedido.schemaHint || "")) {
            return chamarLlmBase({ ...pedido, schemaHint: hint });
          }
          return chamarLlmBase(pedido);
        }
      : chamarLlmBase;

  // Em exploração / info-gathering, preferir solicitar_dados (lacunas).
  // Pedido explícito de decisão: não preferir solicitar_dados por conflito/exploração.
  // ADR-022: com LFC activo no turno, não preferir solicitar_dados só por exploração.
  const temLfcActivo = temFactosLfcActivosNoTurno(entrada.factosOficiais);
  const preferirSolicitarDados = pedidoDecisao
    ? false
    : temLfcActivo
      ? false
      : pedidoInfoGathering || exploratoria
        ? true
        : temLastroBriefing || temLastroConsciencia
          ? false
          : undefined;

  const resultado = await executarDeliberacaoMre(entrada, {
    chamarLlm,
    preferirSolicitarDados,
    pedidoAnaliseDeliberativa: pedidoAnalise,
    pedidoConsultaResposta: pedidoConsulta,
    pedidoDecisaoExplicita: pedidoDecisao,
    pedidoInfoGathering,
    pedidoDelegacaoExplicita,
    consultaNaoEAcao: ctx.consultaNaoEAcao === true || pedidoConsulta,
    tipoTurno: ctx.tipoTurno || ctx.precedenciaTurno?.tipoTurno || null,
    precedenciaTurno: ctx.precedenciaTurno || null,
    lastroConsciencia: lastro,
    historico: ctx.historico || [],
    proibirDespacho:
      (pedidoAnalise ||
        pedidoConsulta ||
        pedidoDecisao ||
        pedidoInfoGathering) &&
      !pedidoDelegacaoExplicita,
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
    const disciplinaFalha = garantirDisciplinaLastroInsuficiente(falha, {
      factosOficiais: entrada.factosOficiais,
      parecer: resultado.parecer || null,
      pedidoConsulta,
      pedidoInfoGathering,
      instrucao: ctx.instrucao || ""
    });
    const reflexoFalha = disciplinaFalha.aplicada
      ? {
          mensagem: disciplinaFalha.mensagem,
          aplicada: false,
          motivo: "omitido_apos_disciplina_lastro"
        }
      : garantirReflexoEstadoExecutivo(
          disciplinaFalha.mensagem,
          lastro,
          ctx.instrucao || "",
          { pedidoInfoGathering, pedidoDecisaoExplicita: pedidoDecisao }
        );
    return {
      ok: false,
      mensagem: reflexoFalha.mensagem,
      modo: "mre-falha",
      dados: {
        mre: resultado,
        rota: "deliberativa",
        disciplinaLastro: disciplinaFalha,
        conscienciaInfluencia: reflexoFalha
      }
    };
  }

  // ADR-022 CM12: LFC activos + só lacuna genérica → não falar como se faltasse lastro.
  let parecerAjustado = ajustarParecerSobLfcActivo(
    resultado.parecer,
    entrada.factosOficiais
  );
  // C3: factos do turno + só COA/Painel → não substituir análise por pedir lastro institucional.
  parecerAjustado = ajustarParecerSobFactosTurno(
    parecerAjustado,
    entrada.factosOficiais
  );
  if (parecerAjustado !== resultado.parecer) {
    resultado.parecer = parecerAjustado;
  }

  const falado = gerarComunicadoExecutivo(resultado.parecer, canal, {
    pedidoAnalise,
    pedidoConsulta,
    pedidoInfoGathering
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
      maxAnalise: canal === "voz" ? 400 : 900,
      instrucao: msgUser
    });
    if (prosaAnalise) {
      comunicado.texto = prosaAnalise;
    }
  }
  // FRENTE 6: prosa → disciplina lastro insuficiente → reflexo ops (CONSULTA intacta)
  /** @type {import("../conscienciaOperacional/disciplinaLastroInsuficiente.js").ResultadoDisciplinaLastro} */
  let disciplinaLastro = {
    mensagem: comunicado.texto,
    aplicada: false,
    motivo: pedidoConsulta ? "consulta_fora_de_escopo" : "pendente",
    sinal: null
  };
  // CONSULTA situacional: snapshot factual não é substituído por prosa de Gate/Job/continuidade
  /** @type {{ mensagem: string, aplicada: boolean, motivo: string }} */
  let reflexo = {
    mensagem: comunicado.texto,
    aplicada: false,
    motivo: pedidoConsulta ? "consulta_snapshot_sem_reflexo" : "pendente"
  };
  if (!pedidoConsulta) {
    disciplinaLastro = garantirDisciplinaLastroInsuficiente(comunicado.texto, {
      factosOficiais: entrada.factosOficiais,
      parecer: resultado.parecer,
      pedidoConsulta: false,
      pedidoInfoGathering,
      instrucao: ctx.instrucao || ""
    });
    comunicado.texto = disciplinaLastro.mensagem;
    // Se a disciplina substituiu a prosa, não deixar o reflexo ops sobrescrever o fail-closed.
    if (disciplinaLastro.aplicada) {
      reflexo = {
        mensagem: comunicado.texto,
        aplicada: false,
        motivo: "omitido_apos_disciplina_lastro"
      };
    } else {
      reflexo = garantirReflexoEstadoExecutivo(
        comunicado.texto,
        lastro,
        ctx.instrucao || "",
        { pedidoInfoGathering, pedidoDecisaoExplicita: pedidoDecisao }
      );
      if (reflexo.aplicada && !pedidoAnalise) {
        comunicado.texto = reflexo.mensagem;
      } else if (reflexo.aplicada && pedidoAnalise) {
        if (
          lastro?.contagens?.gatesPendentes > 0 &&
          !/gate\s+pendente/i.test(comunicado.texto)
        ) {
          comunicado.texto = `${comunicado.texto}\n\nNota operacional: existe Gate pendente — não inicia execução desta análise.`;
        }
      }
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
      disciplinaLastro,
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
