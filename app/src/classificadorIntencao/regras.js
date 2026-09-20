/**
 * Regras de classificação V1 — IMP-057 E2 / Emendas E2.1–E2.2 / REQ-057 RF8–RF11.
 * Função pura `classificar` → SaidaClassificador (domínio E1).
 * Sem Núcleo, Motor, UI, Dispatcher ou I/O.
 */

import { montarSaida, LIMIAR_CONFIANCA, abaixoDoLimiar } from "./dominio.js";
import {
  normalizarTexto,
  LEXICO_C1,
  LEXICO_C2,
  LEXICO_C3,
  LEXICO_C4,
  LEXICO_VAGO,
  pontuarLexico
} from "./lexicon.js";
import {
  historicoTemReferenciaProjeto,
  mensagemEhDeixisOuFollowUp
} from "./historicoRecente.js";
import {
  ehRecomendacaoOperacional,
  objectoDoTurno,
  OBJECTO_TURNO
} from "./recomendacaoOperacional.js";
import {
  detectarAncoraEmpresa,
  temAncoraExplicitaProjeto
} from "./ancoraEmpresa.js";
import { detectarPedidoDecisaoExplicita } from "./pedidoDecisaoExplicita.js";
import { ehConsultaCatalogoProjetos } from "./consultaCatalogoProjetos.js";
import { detectarModoRespostaRestrita } from "./pedidoRespostaRestrita.js";
import { pediuAmbitoCasoLfc } from "../mre/consumoLfcMre.js";
import {
  disciplinarSaidaClarificacao,
  detectarPedidoProtocoloExecutivo
} from "./clarificacaoDisciplinada.js";

/**
 * @typedef {object} ContextoClassificacao
 * @property {boolean} [frenteActiva] — COA/frente presente (RF9)
 * @property {ReadonlyArray<{ papel: "usuario"|"ceo", texto: string }>} [historicoRecente] — IMP-061 / REQ-061 (opcional)
 * @property {object} [objetivoConversacional] — IMP-064 (contexto; não decide classe / não influencia C3)
 * @property {boolean} [operacaoAberta] — Teste 3: Job F2 aberto (continuidade ≠ C4 isolada)
 * @property {unknown} [fioCoa] — Fatia 2: fio do mesmo COA (não é historicoRecente VCA)
 * @property {string} [objectoTurno] — Fatia 1: objecto já produzido (sem recalcular)
 * @property {boolean} [situacional] — Fatia 1: derivacoes.situacional (sem reavaliar)
 * @property {boolean} [pedidoDecisaoExplicita] — Fatia 1: sinal pd (sem reavaliar)
 */

/**
 * Pedido interrogativo / deliberativo — permanece fora de E2.1 C3.
 * @param {string} t
 */
export function ehPerguntaDeliberativa(t) {
  return (
    /^(como|o que|qual|quando|onde|por que|porque|quem)\b/.test(t) ||
    /\b(o que (voc[eê]|tu) acha|qual seria|como devemos|devemos priorizar)\b/.test(
      t
    ) ||
    /\b(voc[eê]\s+concorda|quais\s+capacidades|qual\s+prioridade|como\s+organizar|o\s+que\s+falta)\b/.test(
      t
    ) ||
    /\b(explique|explica|descreva|descreve)\b/.test(t)
  );
}

/**
 * IDs `JOB-NNNNNN` mencionados explicitamente no texto.
 * @param {string} t
 * @returns {string[]}
 */
export function extrairIdsJobMencionados(t) {
  if (!t) return [];
  const ids = [];
  const re = /\bJOB-(\d+)\b/gi;
  let m;
  while ((m = re.exec(String(t)))) {
    const n = String(m[1] || "").replace(/^0+/, "") || "0";
    ids.push(`JOB-${n.padStart(6, "0")}`);
  }
  return [...new Set(ids)];
}

/**
 * Texto referencia um Job concreto (JOB-ID) — continuidade, não criação.
 * @param {string} t
 */
export function ehReferenciaExplicitaJobId(t) {
  return extrairIdsJobMencionados(t).length > 0;
}

/**
 * Verbo de criação/publicação de Job sob polaridade negativa na mesma cláusula
 * (ex.: «não crie Job», «não quero que … crie Jobs»).
 * @param {string} t
 * @param {number} idx — início do match do verbo
 */
function criacaoJobNegadaNoContexto(t, idx) {
  const before = t.slice(0, idx);
  const sentStart =
    Math.max(
      before.lastIndexOf("."),
      before.lastIndexOf("!"),
      before.lastIndexOf("?"),
      before.lastIndexOf("\n")
    ) + 1;
  const clause = before.slice(sentStart);
  if (/\bnao\s+$/i.test(clause)) return true;
  if (/\bnunca\s+$/i.test(clause)) return true;
  if (/\bsem\s+$/i.test(clause)) return true;
  // «Não quero / desejo / permito / autorizo … crie Jobs» (lista negada)
  if (/\bnao\s+(quero|desejo|permito|autorizo)\b/i.test(clause)) return true;
  return false;
}

/**
 * Autorização explícita para criar/publicar Job (texto normalizado ou bruto).
 * Precedência: menção a JOB-NNNNNN concreto ≠ criar Job wrapper/novo.
 * Polaridade: «crie Jobs» dentro de proibição («não quero…, crie Jobs…») ≠ autorizar.
 * @param {string} t
 */
export function ehAutorizacaoExplicitaCriarJob(t) {
  if (!t) return false;
  const s = String(t);
  // «Despache o JOB-000075» / «Acompanhe o JOB-…» — operar no existente
  if (ehReferenciaExplicitaJobId(s)) return false;

  const padroes = [
    /\b(crie|cria|criar|publique|publicar|despache|despachar)\s+(o\s+|um\s+|novo\s+)?jobs?\b/gi,
    /\b(publicar|criar|despachar|enviar)\s+job\b/gi,
    /\bcrie\s+o\s+job\s+necessario\b/gi,
    /\b(criar|crie|cria)\s+o\s+job\b/gi
  ];

  for (const re of padroes) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(s)) !== null) {
      if (!criacaoJobNegadaNoContexto(s, m.index)) {
        return true;
      }
    }
  }
  return false;
}

/**
 * P0 — bloqueio absoluto: instrução explícita de NÃO executar / NÃO criar Job.
 * Texto já normalizado (sem acentos). Deve correr ANTES de qualquer rota C3.
 * Excepção: autorização explícita de criar/publicar Job no mesmo turno
 * não é anulada por «não execute ainda a próxima acção».
 * @param {string} t
 */
export function ehProibicaoExecucaoExplicita(t) {
  if (!t) return false;

  // Com «crie/publique o Job», só honrar proibições que anulam a própria criação
  if (ehAutorizacaoExplicitaCriarJob(t)) {
    return (
      /\bnao\s+(crie|cria|criar)\s+(um\s+|o\s+|novo\s+)?jobs?\b/.test(t) ||
      /\bsem\s+criar\s+jobs?\b/.test(t) ||
      /\bnunca\s+(crie|cria|criar)\s+jobs?\b/.test(t)
    );
  }

  return (
    /\bnao\s+(execute|executa|executar)(\s+nada)?\b/.test(t) ||
    /\bnao\s+(implemente|implementa|implementar)\b/.test(t) ||
    /\bnao\s+(crie|cria|criar)\s+(um\s+)?jobs?\b/.test(t) ||
    // F11/C3 — «não despache Jobs» ≠ verbo E2.1 de despacho
    /\bnao\s+(despache|despacha|despachar)(\s+(um\s+|o\s+|novo\s+|nenhum\s+)?)?jobs?\b/.test(
      t
    ) ||
    /\bnao\s+(despache|despacha|despachar)\b/.test(t) ||
    /\bnao\s+(faca|faz|fazer)\s+(altera|mudan|nada)\b/.test(t) ||
    /\bnao\s+faca\s+alteracoes?\b/.test(t) ||
    /\bapenas\s+(responda|informe|diga|analise|analisar|mostre)\b/.test(t) ||
    /\bsomente\s+(responda|informe|diga|analise|analisar|mostre)\b/.test(t) ||
    /\bso\s+(responda|informe|diga)\b/.test(t) ||
    /\bsem\s+(executar|execucao|criar\s+jobs?|despachar|despacho|alterar|implementar)\b/.test(
      t
    ) ||
    /\bnunca\s+(execute|executa|implemente|crie\s+jobs?|despache|despachar)\b/.test(t)
  );
}

/**
 * P0 — consulta de estado operacional (Gate/Job/pendência/fila/status).
 * Produz resposta informativa — nunca Job.
 * Não captura deliberação («qual seria a próxima decisão…»).
 * @param {string} t
 */
export function ehConsultaEstadoOperacional(t) {
  if (!t) return false;
  if (ehComandoExecucaoExplicito(t)) return false;

  // F25/T20 — resumo composto COA+LFC+Jobs (antes das âncoras genéricas)
  if (ehPedidoResumoCompostoSessao(t)) return true;

  // Âncoras operacionais explícitas
  // F19: «estado operacional (actual|atual)», «Jobs em aberto», «último Job»
  // F23: Jobs em recuperação / dispatched / «há algum Job» — consulta, não C3/MRE
  const ancoraOperacional =
    /\bgates?\b/.test(t) ||
    /\bjobs?-\d+\b/.test(t) ||
    /\bjobs?\s+pendentes?\b/.test(t) ||
    /\bjobs?\s+em\s+aberto\b/.test(t) ||
    /\bjobs?\s+em\s+recuperacao\b/.test(t) ||
    /\bem\s+recuperacao\b/.test(t) ||
    /\bdispatched\b/.test(t) ||
    /\bha\s+(algum|alguns)\s+jobs?\b/.test(t) ||
    /\b(ultimo|ultima)\s+jobs?\b/.test(t) ||
    /\bjobs?\s+(mais\s+)?recente\b/.test(t) ||
    /\bestado\s+operacional(\s+(atual|actual))?\b/.test(t) ||
    /\bestado\s+(do\s+)?(jobs?|gates?|sistema|ceo|atual|actual|fila)\b/.test(
      t
    ) ||
    /\bestado\s+(operacional\s+)?(atual|actual)(\s+da\s+sessao)?\b/.test(t) ||
    /\bestado\s+da\s+(fila|sessao)\b/.test(t) ||
    /\bstatus\s+(do\s+)?(jobs?|gates?|sistema|ceo|fila|sessao)\b/.test(t) ||
    /\bestado\s+(atual|actual)\b/.test(t) ||
    /^status$/.test(t) ||
    /\bfila\s+(de\s+)?(execucao|jobs?)\b/.test(t) ||
    /\b(resultado|verificad|verificacao).*\bjobs?-\d+\b/.test(t) ||
    /\bjobs?-\d+\b.*\b(resultado|verificad|verificacao|agent)\b/.test(t) ||
    /\bo\s+que\s+esta\s+(pendente|aguardando)\b/.test(t) ||
    /\bo\s+que\s+(foi\s+)?implementado\b/.test(t) ||
    /\b(pendencias?|pendente)\b/.test(t) ||
    /\baguardando\s+(minha\s+)?decisao\b/.test(t) ||
    /\bqual\s+[eé]?\s*(o\s+)?(id\s+(do\s+)?)?gates?\b/.test(t);

  if (!ancoraOperacional) return false;

  const perguntaOuPedidoInfo =
    ehPerguntaDeliberativa(t) ||
    /^(qual|quais|o\s+que|me\s+mostre|mostra|mostrar|diga|informe|liste|listar|mostre|ha)\b/.test(
      t
    ) ||
    /^(o\s+)?jobs?-\d+\b/.test(t) ||
    /\b(me\s+diga|me\s+informe|me\s+mostre)\b/.test(t) ||
    /\b(estado|status|resultado|verificad|verificacao|pendenc|fila|gates?|recuperacao|dispatched)\b/.test(
      t
    ) ||
    /\bconsulte?\b/.test(t) ||
    ehProibicaoExecucaoExplicita(t);

  return perguntaOuPedidoInfo;
}

/**
 * Teste 3 — continuidade da missão com resultado/operação (≠ consulta factual isolada).
 * Texto já normalizado (sem acentos) quando possível.
 * @param {string} t
 */
export function ehPedidoContinuidadeMissao(t) {
  if (!t) return false;
  if (
    /\b(continuidade\s+(da\s+)?missao)\b/.test(t) ||
    /\b(continuar\s+(a\s+)?missao|continua\s+(a\s+)?missao)\b/.test(t)
  ) {
    return true;
  }
  if (
    /\b(continua(?:r)?|retomar|retome|prossiga|avance|avancar)\b/.test(t) &&
    /\b(missao|resultado|com\s+base\s+n)/.test(t)
  ) {
    return true;
  }
  if (
    /\b(usa|usar|utilize|utilizar|adot[ae]|adopt[ae]|incorpore|incorporar|aproveit[ae])\b/.test(
      t
    ) &&
    /\b(resultado|artefato|evidencia)\b/.test(t)
  ) {
    return true;
  }
  if (
    /\b(com\s+base\s+n(isso|este|esse)|a\s+partir\s+(d(isso|este|esse)|do\s+resultado))\b/.test(
      t
    )
  ) {
    return true;
  }
  return false;
}

/**
 * Pedido conversacional de RELATO / ENCERRAMENTO (três campos).
 * Deve prevalecer sobre C4 consulta de estado.
 * Texto já normalizado (sem acentos).
 * @param {string} t
 */
export function ehPedidoRelatoEncerramento(t) {
  if (!t) return false;
  if (
    /\b(encerrar|fechar)\s+(o\s+)?dia\b/.test(t) ||
    /\bencerramento\s+executivo\b/.test(t) ||
    /\brelato\s+(da\s+)?(missao|encerramento|executivo)\b/.test(t) ||
    /\bfechamento\s+(da\s+)?(operacao|missao)\b/.test(t)
  ) {
    return true;
  }
  const tresCampos =
    /\bo\s+que\s+andou\b/.test(t) &&
    /\bo\s+que\s+fica\b/.test(t) &&
    /\bpr[oó]ximo\s+passo\b/.test(t);
  if (
    tresCampos &&
    (/\b(preencha|preencher|relate|relato|consolid|encerr)\b/.test(t) ||
      /\bcampos?\b/.test(t))
  ) {
    return true;
  }
  return false;
}

/**
 * F25/T20 — resumo composto de encerramento: COA + LFC + Jobs.
 * Consulta factual (C4); não é relato dos três campos nem deliberação MRE.
 * Texto já normalizado (sem acentos).
 * @param {string} t
 */
export function ehPedidoResumoCompostoSessao(t) {
  if (!t) return false;
  const pediuResumo =
    /\b(resuma|resumo|consolid)\b/.test(t) ||
    (/\bencerrar\b/.test(t) && /\bestado\s+final\b/.test(t)) ||
    /\bestado\s+final\s+(desta\s+)?sessao\b/.test(t);
  if (!pediuResumo) return false;
  const temCoa = /\bcoa\b/.test(t);
  const temLfc =
    /\blfc\b/.test(t) ||
    (/\bfactos?\b/.test(t) && /\b(activ|ativ|confirmad)\b/.test(t));
  const temJobs = /\bjobs?\b/.test(t);
  return temCoa && temLfc && temJobs;
}

/**
 * Proibição explícita de propor próximos passos no pedido actual.
 * @param {string} t — normalizado
 */
export function ehProibicaoProximosPassos(t) {
  if (!t) return false;
  return (
    /\bsem\s+(propor\s+)?pr[oó]ximos?\s+passos?\b/.test(t) ||
    /\bn[aã]o\s+(propor|proponha|sugira|adicione)\s+pr[oó]ximos?\s+passos?\b/.test(
      t
    ) ||
    /\bsem\s+pr[oó]ximo\s+passo\b/.test(t)
  );
}

/**
 * Pedido situacional sobre o trabalho em curso (etapa / concluído / agora / próximo passo).
 * Não é panorama curto «Qual é o estado atual?» — deve ir a C2/deliberação, não a estado_geral.
 * @param {string} t — texto normalizado
 */
export function ehPedidoSituacionalTrabalho(t) {
  if (!t) return false;
  if (ehComandoExecucaoExplicito(t)) return false;
  // «sem próximos passos» / «não propor próximo passo» ≠ pedido situacional
  const pediuProximoPasso =
    /\bpr[oó]ximo\s+passo\b/.test(t) && !ehProibicaoProximosPassos(t);
  return (
    /\bonde\s+paramos\b/.test(t) ||
    /\betapa\b/.test(t) ||
    /\b(acabamos|acabou)\s+de\s+concluir\b/.test(t) ||
    /\b(o\s+que\s+)?(estamos|estou)\s+fazendo\s+agora\b/.test(t) ||
    pediuProximoPasso ||
    /\btrabalho\s+(que\s+estamos|em\s+curso)\b/.test(t) ||
    /\bestado\s+(atual\s+)?(do\s+)?trabalho\b/.test(t) ||
    /\bsitua[cç][aã]o\s+(do\s+)?trabalho\b/.test(t) ||
    /\bexplique\b.*\b(estado|trabalho|situa[cç][aã]o)\b/.test(t) ||
    /\bo\s+que\s+voc[eê]\s+sabe\s+sobre\s+o\s+estado\b/.test(t)
  );
}

/**
 * Autodiagnóstico / autoavaliação do próprio CEO (produto), não panorama nem
 * consulta situacional de trabalho. Texto normalizado (sem acentos).
 * @param {string} t
 */
export function ehPedidoAutodiagnosticoOuAutoavaliacaoCeo(t) {
  if (!t) return false;
  if (/\bautodiagnostico\b/.test(t) || /\bauto\s*diagnostico\b/.test(t)) {
    return true;
  }
  if (/\bautoavaliacao\b/.test(t) || /\bauto\s*avaliacao\b/.test(t)) {
    return true;
  }
  // «avalie suas capacidades» / diagnóstico de si — sem capturar «avalie o outdoor»
  if (
    /\b(avalie|avalia|avaliar|diagnostique|diagnostico)\b/.test(t) &&
    /\b(suas?\s+capacidades|seu\s+proprio\s+estado|voce\s+mesmo|do\s+proprio\s+ceo|como\s+(o\s+)?sistema\s+ceo)\b/.test(
      t
    )
  ) {
    return true;
  }
  return false;
}

/**
 * C4 só para consulta factual isolada.
 * Com operação aberta + continuidade de missão, não força C4.
 * Pedido situacional de trabalho (mesmo com «estado atual») → não C4.
 * @param {string} t — texto normalizado
 * @param {ContextoClassificacao} [ctx]
 */
function optsSinaisDe(ctx = {}) {
  /** @type {{ objectoTurno?: string, pedidoDecisaoExplicita?: boolean, pedidoAnaliseDeliberativa?: boolean }} */
  const o = {};
  if (ctx.objectoTurno != null) o.objectoTurno = ctx.objectoTurno;
  if (ctx.pedidoDecisaoExplicita != null) {
    o.pedidoDecisaoExplicita = ctx.pedidoDecisaoExplicita === true;
  }
  if (ctx.pedidoAnaliseDeliberativa != null) {
    o.pedidoAnaliseDeliberativa = ctx.pedidoAnaliseDeliberativa === true;
  }
  return o;
}

/** @param {ContextoClassificacao} ctx @param {string} t */
function situacionalDe(ctx, t) {
  if (ctx.situacional != null) return ctx.situacional === true;
  return ehPedidoSituacionalTrabalho(t);
}

/** @param {ContextoClassificacao} ctx @param {string} t */
function pedidoDecisaoDe(ctx, t) {
  if (ctx.pedidoDecisaoExplicita != null) {
    return ctx.pedidoDecisaoExplicita === true;
  }
  return detectarPedidoDecisaoExplicita(t);
}

/**
 * F22 / T07 — mudança explícita de assunto + consulta de estado.
 * «Esqueça preço/margem» não deve virar análise (objecto B) e anular C4.
 * @param {string} t — normalizado
 */
export function ehMudancaAssuntoComConsultaEstado(t) {
  if (!t || !ehConsultaEstadoOperacional(t)) return false;
  return (
    /\bmud[ae]\s+de\s+assunto\b/.test(t) ||
    /\bmudando\s+de\s+assunto\b/.test(t) ||
    /\b(mudar|mude|muda)\s+(o\s+)?contexto\b/.test(t) ||
    /\besque[cç]a\b/.test(t) ||
    /\bvamos\s+esquecer\b/.test(t) ||
    /\besquecer\s+(o|a|os|as|todos)\b/.test(t)
  );
}

export function ehConsultaEstadoParaC4(t, ctx = {}) {
  if (!ehConsultaEstadoOperacional(t)) return false;
  if (situacionalDe(ctx, t)) return false;
  if (ehPedidoAutodiagnosticoOuAutoavaliacaoCeo(t)) return false;
  // F22: mudança de assunto + consulta de estado prevalece sobre objecto B
  // residual («esqueça preço/margem») — a pergunta actual manda.
  if (
    !ehMudancaAssuntoComConsultaEstado(t) &&
    ehPedidoAnaliseOuRecomendacao(t, ctx.fioCoa, optsSinaisDe(ctx))
  ) {
    return false;
  }
  if (ehPedidoRelatoEncerramento(t)) return false;
  if (ctx.operacaoAberta && ehPedidoContinuidadeMissao(t)) return false;
  return true;
}

/**
 * P0 — pedido de análise / recomendação / avaliação (não é execução).
 * «Não execute» / «não crie Job» NÃO anulam análise — só bloqueiam C3.
 * @param {string} t
 * @param {unknown} [fioCoa]
 * @param {{ objectoTurno?: string, pedidoDecisaoExplicita?: boolean }} [opts]
 */
export function ehPedidoAnaliseOuRecomendacao(t, fioCoa, opts = {}) {
  if (!t) return false;
  if (ehComandoExecucaoExplicito(t)) return false;
  // E4: recomendação operacional (objecto A) ≠ deliberação C2
  if (ehRecomendacaoOperacional(t, fioCoa, opts)) return false;
  const calcObjecto =
    typeof opts.calcObjectoDoTurno === "function"
      ? opts.calcObjectoDoTurno
      : objectoDoTurno;
  const objecto =
    opts.objectoTurno != null ? opts.objectoTurno : calcObjecto(t, fioCoa);
  if (objecto === OBJECTO_TURNO.B || objecto === OBJECTO_TURNO.MISTO) {
    return true;
  }
  return (
    /\b(analisa|analise|analisar)\b/.test(t) ||
    /\b(avalia|avalie|avaliar)\b/.test(t) ||
    /\b(compara|compare|comparar)\b/.test(t) ||
    /\b(recomenda|recomendaria|recomendacao|voce\s+recomenda)\b/.test(t) ||
    /\b(pros?\s+e\s+contras?|pontos?\s+(positivos?|negativos?))\b/.test(t) ||
    /\b(aprovaria|modificaria|priorizaria|nao\s+priorizaria)\b/.test(t) ||
    /\bdiga\s+se\s+(devemos|devo|podemos|aprovaria)\b/.test(t) ||
    /\bdevemos\s+(fazer|aprovar|seguir)\b/.test(t) ||
    /\best[aá]\s+alinhad[oa]\s+(ao|com)\s+(o\s+)?manifesto\b/.test(t) ||
    /\bsegundo\s+o\s+manifesto\b/.test(t)
  );
}

/**
 * P0 — comando de execução explícito (hierarquia: só esta etapa cria Job).
 * Negação («não execute») e perguntas deliberativas anulam.
 * @param {string} t
 */
export function ehComandoExecucaoExplicito(t) {
  if (!t || ehProibicaoExecucaoExplicita(t)) return false;
  if (ehPerguntaDeliberativa(t)) return false;
  return (
    /\b(implementa|implemente|implementar)\b/.test(t) ||
    /\b(executa|execute|executar)\b/.test(t) ||
    /\b(cria(r)?|crie)\s+(um\s+)?jobs?\b/.test(t) ||
    /\b(despacha(r)?|despache)\b/.test(t) ||
    /\bpode\s+executar\b/.test(t) ||
    /\bfaca\s+agora\b/.test(t) ||
    /\b(resolva|resolve|resolver)\b.*\b(bugs?|erros?|falhas?|problemas?)\b/.test(
      t
    ) ||
    /\b(corrija|corrige|corrigir|fix)\b.*\b(problema|codigo|bug|erro)\b/.test(
      t
    ) ||
    /\b(acione|aciona|acionar)\b.*\b(cto|engenheiro|cursor)\b/.test(t) ||
    /\b(delegue|delegar)\b.*\b(tarefa|trabalho|isto|isso|esta|este)\b/.test(t) ||
    /\b(investigue|investigar)\b.*\b(erro|bug|falha|problema)\b/.test(t) ||
    /\b(faca|faz|fazer)\b.*\b(diagnostico|feature|funcionalidade|patch)\b/.test(
      t
    ) ||
    /\b(gera|gere|gerar)\b.*\b(relatorio|parecer)\b/.test(t)
  );
}

/**
 * Contexto de projecto para Emenda E2.2 (frente activa ou refs no texto).
 * @param {string} t
 * @param {ContextoClassificacao} [ctx]
 */
export function temContextoProjetoE22(t, ctx = {}) {
  if (ctx.frenteActiva === true) return true;
  return /\b(mg2|motoboy|projeto|coa|outdoor|worldlab|motor|ceo|mvp|sprint|frente|arquitectura|arquitetura|capacidades|m[oó]dulo)\b/.test(
    t
  );
}

/**
 * Emenda E2.3 — autoexplicação institucional do CEO → C2 (nunca C3/Clarificação).
 * Perguntas sobre papel, identidade, missão, propósito, limites, Sistema CEO,
 * EIC, mapa divulgável, decisões, capacidades, agentes, Jobs (meta).
 * Refinamento IMP-067 do path meta/institucional.
 * @param {string} t
 * @param {unknown} [fioCoa]
 * @param {{ objectoTurno?: string, pedidoDecisaoExplicita?: boolean, pedidoAnaliseDeliberativa?: boolean }} [opts]
 */
export function ehAutoexplicacaoInstitucionalE23(t, fioCoa, opts = {}) {
  if (!t) return false;
  // Pedido imperativo de execução continua E2.1 — não capturar
  if (ehIntencaoExecutivaE21(t, fioCoa, opts)) return false;

  // Meta-política de Job / resposta (não «cria um job agora»)
  if (
    /\bquando\s+(voc[eê]|tu)\s+(decide|prefere)\b/.test(t) &&
    /\b(jobs?|responder|resposta)\b/.test(t)
  ) {
    return true;
  }
  if (
    /\b(decide|decides)\s+criar\s+(um\s+)?jobs?\b/.test(t) &&
    /\b(quando|como|porque|por\s+que|crit[eé]rio)\b/.test(t)
  ) {
    return true;
  }

  // Papel / responsabilidades / missão / propósito / identidade / natureza
  // (IMP-067 refinamento path meta — não captura «quem és tu» / «o que você é»:
  //  esses permanecem em pergunta_identidade local com resumo derivado do DIC)
  if (/\b(seu|sua|teu|tua)\s+papel\b/.test(t)) return true;
  if (
    /\b(papel|responsabilidades?)\b/.test(t) &&
    /\b(voce|tu|ceo|empresa|institui)\b/.test(t)
  ) {
    return true;
  }
  if (
    /\b(sua|teu|tua|sua)\s+missao\b/.test(t) ||
    (/\bmissao\b/.test(t) && /\b(voce|tu|ceo|sua|teu|exatamente)\b/.test(t))
  ) {
    return true;
  }
  if (/\bqual\s+[eé]?\s*(exatamente\s+)?(a\s+)?(sua|tua)\s+missao\b/.test(t)) {
    return true;
  }
  if (
    /\bproposito\b/.test(t) &&
    /\b(voce|tu|ceo|sua|tua|seu|teu|sistema)\b/.test(t)
  ) {
    return true;
  }
  if (
    /\bpara\s+que\b/.test(t) &&
    /\b(voce|tu|ceo)\b/.test(t) &&
    /\b(existe|serve|foi\s+criad)\b/.test(t)
  ) {
    return true;
  }
  if (
    /\b(sua|tua|seu|teu)\s+identidade\b/.test(t) ||
    (/\bidentidade\b/.test(t) &&
      /\b(ceo|institucional|sistema\s+ceo|voce|tu)\b/.test(t))
  ) {
    return true;
  }
  if (
    /\bnatureza\b/.test(t) &&
    /\b(ceo|sistema|voce|tu|sua|tua)\b/.test(t)
  ) {
    return true;
  }

  // Critérios / modo de decisão / autoridade (patrocinador)
  if (/\bcomo\s+(voce|tu)\s+toma\s+decis/.test(t)) return true;
  if (
    /\bcriterios?\s+de\s+decis/.test(t) &&
    /\b(voce|tu|ceo|seu|sua)\b/.test(t)
  ) {
    return true;
  }
  if (
    /\bdecis/.test(t) &&
    /\b(pertencem|pertence|cabem|cabe)\b/.test(t) &&
    /\b(voce|tu|patrocinador|usuario|utilizador)\b/.test(t)
  ) {
    return true;
  }
  if (
    /\b(patrocinador|usuario|utilizador)\b/.test(t) &&
    /\b(voce|tu|ceo)\b/.test(t) &&
    /\b(decis|autoridade|papel|quem)\b/.test(t)
  ) {
    return true;
  }

  // Diferença entre agentes / Motor / chatbot
  if (/\bdiferenca\s+entre\s+(voce|tu)\b/.test(t)) return true;
  if (
    /\bdiferenca\s+entre\b/.test(t) &&
    /\b(ceo|cto|engenheiro|cursor|agente|motor(\s+executivo)?|chatbot)\b/.test(
      t
    )
  ) {
    return true;
  }
  if (
    /\b(chatbot|assistente\s+(digital|gen[eé]rico|pessoal))\b/.test(t) &&
    /\b(voce|tu|ceo|faz|diferenca|nao\s+faz)\b/.test(t)
  ) {
    return true;
  }
  if (
    /\bmotor(\s+executivo)?\b/.test(t) &&
    /\b(voce|tu|ceo|diferenca|versus|vs)\b/.test(t)
  ) {
    return true;
  }

  // Capacidades / limitações / limites / mandato / fraquezas do CEO
  if (
    /\bqual\s+capacidade\b/.test(t) &&
    /\b(voc[eê]|tu|desenvolver|importante)\b/.test(t)
  ) {
    return true;
  }
  if (/\b(fraqueza|limita[cç][aã]o|limita[cç][oõ]es)\b.*\bceo\b/.test(t)) {
    return true;
  }
  if (/\bceo\b.*\b(fraqueza|limita[cç][aã]o|limita[cç][oõ]es)\b/.test(t)) {
    return true;
  }
  if (
    /\blimites?\b/.test(t) &&
    /\b(voce|tu|ceo|seu|sua|seus|suas|teu|tua|teus|tuas)\b/.test(t)
  ) {
    return true;
  }
  if (
    /\bo\s+que\b/.test(t) &&
    /\b(voce|tu|ceo)\b/.test(t) &&
    /\b(nao\s+faz|nao\s+pode|nao\s+deve)\b/.test(t)
  ) {
    return true;
  }
  if (
    /\bmandato\b/.test(t) &&
    /\b(voce|tu|ceo|seu|sua|teu|tua)\b/.test(t)
  ) {
    return true;
  }

  // Meta sobre a qualidade / papel executivo da resposta do CEO
  if (
    /\b(respondendo|responde|resposta)\b/.test(t) &&
    /\b(executivo|ceo|verdadeiro|como\s+(um|uma)\s+ceo)\b/.test(t)
  ) {
    return true;
  }
  if (
    /\bacha\s+que\s+(est[aá]|voc[eê]|tu)\b/.test(t) &&
    /\b(executivo|ceo|papel)\b/.test(t)
  ) {
    return true;
  }
  // Meta sobre a própria conversa (produtividade / utilidade)
  if (
    /\besta\s+conversa\b/.test(t) &&
    /\b(produtiva|útil|util|adianta|faz\s+sentido|vale\s+a\s+pena)\b/.test(t)
  ) {
    return true;
  }
  if (
    /\bacha\s+que\b/.test(t) &&
    /\bconversa\b/.test(t) &&
    /\b(produtiva|útil|util|adianta)\b/.test(t)
  ) {
    return true;
  }

  // Meta-modo conversacional — como o CEO interpreta o utilizador (não identidade genérica)
  if (ehMetaModoConversacional(t)) return true;

  // Sistema CEO / EIC / mapa divulgável / funcionamento / arquitectura
  if (
    /\bsistema\s+ceo\b/.test(t) &&
    /\b(o\s+que|como|qual|explique|explica|arquitectura|arquitetura|mapa|funcion|eic|gate|classificador|pilares?|natureza|missao|proposito|limites?)\b/.test(
      t
    ) &&
    !/\b(mg2|motoboy|outdoor|worldlab)\b/.test(t)
  ) {
    return true;
  }
  if (
    /\beic\b/.test(t) &&
    /\b(o\s+que|como|qual|explique|explica|signif|ceo|conversacional|inteligencia|intelig[eê]ncia)\b/.test(
      t
    ) &&
    !/\b(mg2|motoboy|outdoor|worldlab)\b/.test(t)
  ) {
    return true;
  }
  if (
    /\b(mapa\s+divulgavel|mapa\s+do\s+sistema|arquitectura\s+divulgavel|arquitetura\s+divulgavel)\b/.test(
      t
    )
  ) {
    return true;
  }
  if (
    /\b(classificador(\s+de\s+inten[cç][aã]o)?|gate\s+de\s+execu[cç][aã]o|fila\s+de\s+execu)\b/.test(
      t
    ) &&
    /\b(o\s+que|como|qual|explique|explica|funciona|e|é)\b/.test(t) &&
    !/\b(mg2|motoboy|outdoor|worldlab)\b/.test(t)
  ) {
    return true;
  }
  if (
    /\b(funcionamento|como\s+funciona|como\s+(voc[eê]|tu)\s+funciona|arquitectura|arquitetura)\b/.test(
      t
    ) &&
    /\b(voc[eê]|tu|ceo|pr[oó]prio\s+sistema|sistema\s+ceo)\b/.test(t) &&
    !/\b(mg2|motoboy|outdoor|worldlab)\b/.test(t)
  ) {
    return true;
  }

  return false;
}

/**
 * Perguntas sobre o *modo* de conversar do CEO (reflexão vs decisão, mudança de assunto,
 * contexto implícito, quando perguntar, projecto vs curiosidade).
 * @param {string} t
 */
export function ehMetaModoConversacional(t) {
  if (!t) return false;

  // Reflexão vs expectativa de decisão
  if (
    /\b(refletindo|reflex[aã]o)\b/.test(t) &&
    /\b(decis[aã]o|decidir|esper[oa])\b/.test(t)
  ) {
    return true;
  }

  // Mudança de assunto / o que faz o CEO
  if (
    /\b(mudar|mude|muda)\b/.test(t) &&
    /\bassunto\b/.test(t) &&
    /\b(conversa|meio)\b/.test(t)
  ) {
    return true;
  }
  if (
    /\bmudar\b.*\bassunto\b/.test(t) &&
    /\bo\s+que\s+(voc[eê]|tu)\s+faz\b/.test(t)
  ) {
    return true;
  }

  // Explicar tudo vs descobrir contexto
  if (
    /\b(explique|explicar|explique\s+tudo)\b/.test(t) &&
    /\b(descobrir|contexto|sozinho)\b/.test(t)
  ) {
    return true;
  }
  if (
    /\bprefere\b/.test(t) &&
    /\b(explique|explicar)\b/.test(t) &&
    /\b(contexto|descobrir)\b/.test(t)
  ) {
    return true;
  }

  // «vamos continuar» — sabe do que se fala?
  if (
    /\bvamos\s+continuar\b/.test(t) &&
    /\b(sabe|sabes|falando|assunto|contexto)\b/.test(t)
  ) {
    return true;
  }

  // Quando perguntar vs responder
  if (
    /\b(pergunta|perguntar|perguntas)\b/.test(t) &&
    /\b(responder|resposta|respond)/.test(t) &&
    /\b(momento|decide|em\s+vez|diretamente|antes)\b/.test(t)
  ) {
    return true;
  }
  if (
    /\bem\s+que\s+momento\b/.test(t) &&
    /\b(voce|tu)\b/.test(t) &&
    /\b(pergunta|perguntar)\b/.test(t)
  ) {
    return true;
  }
  if (
    /\bpor\s+que\b/.test(t) &&
    /\b(voce|tu)\b/.test(t) &&
    /\bpergunt/.test(t) &&
    /\b(antes|respond)/.test(t)
  ) {
    return true;
  }

  // Projecto vs curiosidade
  if (
    /\b(proje[tc]o|projeto)\b/.test(t) &&
    /\bcuriosidade\b/.test(t) &&
    /\b(decide|decidir|como\s+(voc[eê]|tu))\b/.test(t)
  ) {
    return true;
  }
  if (
    /\bcomo\s+(voc[eê]|tu)\s+decide\b/.test(t) &&
    /\b(pergunta|proje[tc]o|projeto|curiosidade)\b/.test(t)
  ) {
    return true;
  }

  return false;
}

/**
 * Emenda E2.2 — padrões deliberativos → C2 quando há contexto de projecto.
 * @param {string} t
 * @param {ContextoClassificacao} [ctx]
 */
export function ehDeliberacaoProjetoE22(t, ctx = {}) {
  if (!t || !temContextoProjetoE22(t, ctx)) return false;
  if (ehIntencaoExecutivaE21(t, ctx.fioCoa, optsSinaisDe(ctx))) return false;
  return (
    /\bcomo\s+devemos\b/.test(t) ||
    /\bvoc[eê]\s+concorda\b/.test(t) ||
    /\bo\s+que\s+(voc[eê]|tu)\s+acha\b/.test(t) ||
    /\bquais\s+capacidades\b/.test(t) ||
    /\bqual\s+prioridade\b/.test(t) ||
    /\bcomo\s+organizar\b/.test(t) ||
    /\bo\s+que\s+falta\b/.test(t) ||
    /\bse\s+(voc[eê]|tu)\s+fosse\s+o\s+ceo\b/.test(t) ||
    /\bpr[oó]xima\s+decis[aã]o\b/.test(t) ||
    /\bprincipal\s+pend[eê]ncia\b/.test(t) ||
    /\bqual\s+seria\s+a\s+pr[oó]xima\b/.test(t)
  );
}

/**
 * Emenda E2.2 — conhecimento geral seguro → C1 (nunca Clarificação).
 * Não captura explicações com dêixis de projecto («explique esse módulo»).
 * @param {string} t
 * @param {unknown} [fioCoa]
 * @param {{ objectoTurno?: string, pedidoDecisaoExplicita?: boolean, pedidoAnaliseDeliberativa?: boolean }} [opts]
 */
export function ehConhecimentoGeralE22(t, fioCoa, opts = {}) {
  if (!t) return false;
  if (ehIntencaoExecutivaE21(t, fioCoa, opts)) return false;

  // Novo fio explícito para tema geral (ex.: IA) — não herdar «projetos» do «esqueça os projetos»
  if (
    /\besque[cç]a\b/.test(t) &&
    /\bprojetos?\b/.test(t) &&
    /\bquero\s+conversar\s+sobre\b/.test(t)
  ) {
    return true;
  }
  if (
    /\bquero\s+conversar\s+sobre\b/.test(t) &&
    /\b(intelig[eê]ncia\s+artificial|\bia\b|ci[eê]ncia|hist[oó]ria|filosofia)\b/.test(
      t
    ) &&
    !/\b(mg2|motoboy|outdoor|worldlab)\b/.test(t)
  ) {
    return true;
  }

  // Explicação / definição com âncora de projecto → não é C1 E2.2
  if (
    /\b(explique|explica|descreva|descreve)\b/.test(t) &&
    /\b(esse|este|esta|isso|nosso|projeto|m[oó]dulo|sistema|mg2|motor|ceo|arquitectura|arquitetura)\b/.test(
      t
    )
  ) {
    return false;
  }

  if (/\b(receita|bolo|culin[aá]ria|cozinhar|ingredientes?)\b/.test(t)) {
    return true;
  }
  // Pessoas / factos históricos — «quem foi/inventou/descobriu…»
  if (
    /\bquem\s+(foi|inventou|descobriu|criou|escreveu|fundou|pintou|comp[oô]s)\b/.test(
      t
    ) &&
    !temContextoProjetoE22(t, {})
  ) {
    return true;
  }
  if (
    /^quem\s+[eé]\s+(?!voc[eê]\b)(?!tu\b)(?!o\s+ceo\b)/.test(t) &&
    !temContextoProjetoE22(t, {})
  ) {
    return true;
  }
  // Evitar `\b` após `é` (JS sem flag u: acento não é \w)
  if (/^o que [eé]\s+(?!voc[eê]\b)(?!tu\b)/.test(t)) return true;
  if (
    /\b(explique|explica|defina|definir)\b/.test(t) &&
    !/\b(esse|este|esta|isso|nosso)\b/.test(t)
  ) {
    return true;
  }
  // «Como funciona…» (conhecimento) — não «Como devemos…» (C2)
  if (
    /^como\s+funciona\b/.test(t) &&
    !temContextoProjetoE22(t, {}) &&
    !/\bcomo\s+devemos\b/.test(t)
  ) {
    return true;
  }
  if (
    /\b(ci[eê]ncia|f[ií]sica|qu[ií]mica|biologia|matem[aá]tica|equa[cç][aã]o|teorema|hist[oó]ria|programa[cç][aã]o|algoritmo|docker|kubernetes|rest|graphql|internet|http|https)\b/.test(
      t
    ) &&
    !temContextoProjetoE22(t, {}) &&
    !/\bcomo\s+devemos\b/.test(t)
  ) {
    return true;
  }
  if (
    /\b(onde fica|capital d[aeo]|localiza[cç][aã]o d[aeo])\b/.test(t)
  ) {
    return true;
  }
  // Aritmética / cálculo numérico simples (não projecto)
  if (
    /\bquanto\s+[eé]\s+\d/.test(t) &&
    (/[×x*]/.test(t) || /[+\-/÷]/.test(t))
  ) {
    return true;
  }
  if (/^\d+\s*[×x*+\-/÷]\s*\d+\s*\??$/.test(t)) return true;

  return false;
}

/**
 * Emenda E2.1 — verbo imperativo dirigido ao CEO + acção potencialmente executável.
 * Independente da frente activa.
 * P0: análise/recomendação isolada NÃO é E2.1; proibição explícita anula.
 * @param {string} t
 */
export function ehIntencaoExecutivaE21(t, fioCoa, opts = {}) {
  if (!t || ehPerguntaDeliberativa(t)) return false;
  if (ehProibicaoExecucaoExplicita(t)) return false;
  // Autodiagnóstico / autoavaliação = meta-análise do produto — nunca Job/Gate.
  if (ehPedidoAutodiagnosticoOuAutoavaliacaoCeo(t)) return false;
  // Análise / recomendação deliberativa → C2 (hierarquia: ANÁLISE ≠ EXECUÇÃO)
  // Sinal analise=true: consumir sem reavaliar predicado; objecto/pd via opts.
  if (opts.pedidoAnaliseDeliberativa === true && !ehComandoExecucaoExplicito(t)) {
    return false;
  }
  if (ehPedidoAnaliseOuRecomendacao(t, fioCoa, opts) && !ehComandoExecucaoExplicito(t)) {
    return false;
  }

  const padroes = [
    /\b(resolv[ae]|resolver)\b.*\b(bugs?|erros?|falhas?|problemas?)\b/,
    /\b(corrija|corrige|corrigir|fix)\b.*\b(problema|c[oó]digo|bug|erro)\b/,
    // «faça diagnóstico» operacional — excluído autodiagnóstico acima
    /\b(fa[cç]a|faz|fazer)\b.*\b(diagn[oó]stico|relat[oó]rio|feature|funcionalidade)\b/,
    /\b(implement[ae]|implementar)\b/,
    /\b(acion[ae]|acionar)\b.*\b(cto|engenheiro|cursor)\b/,
    /\b(delegue|delegar)\b.*\b(tarefa|trabalho|isto|isso|esta|este)\b/,
    // missão / tarefa / trabalho — «Execute essa missão…»
    /\b(execut[ae]|executar)\b.*\b(miss[aã]o|tarefa|trabalho|an[aá]lise|isto|isso|diagn[oó]stico)\b/,
    /\b(ger[ae]|gerar)\b.*\b(relat[oó]rio|parecer|diagn[oó]stico)\b/,
    /\b(cria(r)?|crie|cria)\s+(um\s+)?jobs?\b/,
    /\b(publicar|enviar)\s+(um\s+|o\s+|novo\s+)?jobs?\b/,
    /\b(investigue|investigar)\b.*\b(erro|bug|falha|problema|isto|isso|este|esta)\b/,
    /\b(despacha(r)?|despache)\b/
  ];

  if (padroes.some((re) => re.test(t))) return true;

  // Criar ficheiro/arquivo com efeito concreto (caminho, extensão ou conteúdo)
  const criarFicheiro =
    /\b(cria(r)?|crie|cria)\s+(o\s+|um\s+|uma\s+)?(arquivo|ficheiro)\b/.test(t) ||
    /\b(implement[ae]|implementar)\b.*\b(arquivo|ficheiro|cria[cç][aã]o)\b/.test(
      t
    );
  const efeitoConcreto =
    /\.[a-z0-9]{1,12}\b/i.test(t) ||
    /[/\\]/.test(t) ||
    /\b(conte[uú]do|linhas?|exactamente|exacta?mente|exatos?|exactos?)\b/.test(
      t
    );
  return Boolean(criarFicheiro && efeitoConcreto);
}

/**
 * Detecta verbo / indício claro de execução (empate C2/C3 → C3; inclui E2.1).
 * P0: negação («não execute»), análise isolada e perguntas meta não contam.
 * @param {string} t
 * @param {unknown} [fioCoa]
 * @param {{ objectoTurno?: string, pedidoDecisaoExplicita?: boolean }} [opts]
 */
export function temVerboExecucao(t, fioCoa, opts = {}) {
  if (!t || ehProibicaoExecucaoExplicita(t)) return false;
  if (ehPerguntaDeliberativa(t)) return false;
  if (
    ehPedidoAnaliseOuRecomendacao(t, fioCoa, opts) &&
    !ehComandoExecucaoExplicito(t)
  ) {
    return false;
  }
  if (ehIntencaoExecutivaE21(t, fioCoa, opts)) return true;
  return (
    /\b(implementa(r)?|implemente|despacha(r)?|despache)\b/.test(t) ||
    /\b(cria(r)?|cria|crie)\s+(um\s+)?jobs?\b/.test(t) ||
    /\b(publica(r)?|abre)\s+(um\s+)?(job|pr)\b/.test(t) ||
    /\b(corrija|corrige|fix)\b.*\b(c[oó]digo|bug|problema)\b/.test(t) ||
    /\b(resolv[ae]|resolver|arranja(r)?)\b.*\b(bugs?|erros?|falhas?|problemas?)\b/.test(t) ||
    /\b(acion[ae]|delegue|investigue|execut[ae]|ger[ae])\b/.test(t)
  );
}

/**
 * “jobs” no sentido listar/consultar (C4) vs criar trabalho (C3).
 * @param {string} t
 * @param {unknown} [fioCoa]
 * @param {{ objectoTurno?: string, pedidoDecisaoExplicita?: boolean }} [opts]
 * @returns {"c4"|"c3"|null}
 */
export function desambiguarJobs(t, fioCoa, opts = {}) {
  if (/\b(lista(r)?|mostra(r)?|ver|consultar)\s+(os\s+)?jobs?\b/.test(t)) {
    return "c4";
  }
  if (/\bjobs?\s+pendentes?\b/.test(t)) return "c4";
  // F19 — consulta de Jobs abertos / último Job ≠ criar trabalho
  // F23 — recuperação / dispatched / há algum Job ≠ criar trabalho
  if (/\bjobs?\s+em\s+aberto\b/.test(t)) return "c4";
  if (/\bjobs?\s+em\s+recuperacao\b/.test(t)) return "c4";
  if (/\bem\s+recuperacao\b/.test(t) && /\bjobs?\b/.test(t)) return "c4";
  if (/\bdispatched\b/.test(t) && /\bjobs?\b/.test(t)) return "c4";
  if (/\bha\s+(algum|alguns)\s+jobs?\b/.test(t)) return "c4";
  if (/\b(ultimo|ultima)\s+jobs?\b/.test(t)) return "c4";
  if (/\bjobs?\s+(mais\s+)?recente\b/.test(t)) return "c4";
  if (
    /\b(cria(r)?|cria|crie|despacha|despachar|publicar|enviar)\s+(um\s+|o\s+|novo\s+)?jobs?\b/.test(
      t
    )
  ) {
    return "c3";
  }
  if (/^job\s*:/.test(t)) return "c3";
  if (/\b(publicar|despachar|enviar).*\bpara\s+a\s+fila\b/.test(t)) return "c3";
  if (
    /\bjobs?\s+(para|de)\s+\w+/.test(t) &&
    temVerboExecucao(t, fioCoa, opts)
  ) {
    return "c3";
  }
  return null;
}

/**
 * Calcula confiança a partir do score vencedor e da margem.
 * @param {number} scoreVencedor
 * @param {number} scoreSegundo
 * @param {boolean} vago
 */
export function calcularConfianca(scoreVencedor, scoreSegundo, vago) {
  if (vago && scoreVencedor < 0.6) {
    return Math.min(0.45, Math.max(0.2, scoreVencedor * 0.5));
  }
  let c = scoreVencedor;
  const margem = scoreVencedor - scoreSegundo;
  if (margem < 0.08 && scoreSegundo > 0.4) {
    c = Math.max(0.35, c - 0.25);
  } else if (margem < 0.15 && scoreSegundo > 0.5) {
    c = Math.max(0.4, c - 0.12);
  }
  return Math.min(0.98, Math.max(0, Number(c.toFixed(4))));
}

/**
 * Resolve empates RF8–RF11 (+ Emendas E2.1 / E2.2).
 * @param {Record<string, number>} scores
 * @param {string} t
 * @param {ContextoClassificacao} ctx
 * @returns {{ classe: import("./dominio.js").ClasseIntencao, razao: string }}
 */
export function resolverEmpates(scores, t, ctx = {}) {
  // FASE 3: âncoras explícitas antes de E4 (decisão trata-se fora — não é C4 de troca)
  if (
    !pedidoDecisaoDe(ctx, t) &&
    (temAncoraExplicitaProjeto(t) || detectarAncoraEmpresa(t))
  ) {
    return {
      classe: "comando_operacional",
      razao: "FASE 3: âncora explícita de contexto → C4"
    };
  }
  // E4 — recomendação operacional (prioridade/próxima decisão/sprint/job) → C4
  if (ehRecomendacaoOperacional(t, ctx.fioCoa, optsSinaisDe(ctx))) {
    return {
      classe: "comando_operacional",
      razao: "E4: recomendação operacional → C4 (não deliberação de proposta)"
    };
  }
  // Relato/encerramento (três campos) → C4 memória — antes de consulta factual
  if (ehPedidoRelatoEncerramento(t)) {
    return {
      classe: "comando_operacional",
      razao: "Relato/encerramento → C4 (encerrar_dia)"
    };
  }
  // Teste 3 — continuidade com operação aberta → C2 (não C4 isolada)
  if (ctx.operacaoAberta && ehPedidoContinuidadeMissao(t)) {
    return {
      classe: "conversa_projeto",
      razao: "Teste 3: continuidade de missão com operação aberta → C2"
    };
  }
  // P0 / P1-1 — hierarquia: consulta factual C4 | análise C2 | proibição → C2
  // ANÁLISE NÃO É CONSULTA. «Não crie Job» não transforma C2 em C4.
  if (ehConsultaEstadoParaC4(t, ctx)) {
    return {
      classe: "comando_operacional",
      razao: "P0: consulta de estado operacional → C4"
    };
  }
  // Catálogo de projetos (listagem) — antes do fallback C1/C2 / frente activa
  if (ehConsultaCatalogoProjetos(t)) {
    return {
      classe: "comando_operacional",
      razao: "Consulta/listagem do catálogo de projetos → C4"
    };
  }
  if (situacionalDe(ctx, t)) {
    return {
      classe: "conversa_projeto",
      razao: "Pedido situacional de trabalho em curso → C2"
    };
  }
  if (ehPedidoAnaliseOuRecomendacao(t, ctx.fioCoa, optsSinaisDe(ctx))) {
    return {
      classe: "conversa_projeto",
      razao: "P0/P1-1: análise/recomendação → C2 (sem Job)"
    };
  }
  if (ehProibicaoExecucaoExplicita(t)) {
    return {
      classe: "conversa_projeto",
      razao: "P0: proibição explícita de execução → C2"
    };
  }

  // Emenda E2.1 — prioridade máxima sobre RF8/RF9 e frente activa
  if (ehIntencaoExecutivaE21(t, ctx.fioCoa, optsSinaisDe(ctx))) {
    return {
      classe: "trabalho_executivo",
      razao: "E2.1: imperativo + acção executável → C3 (frente activa irrelevante)"
    };
  }

  // Emenda E2.3 — autoexplicação institucional (antes de RF10/jobs e C1)
  if (ehAutoexplicacaoInstitucionalE23(t, ctx.fioCoa, optsSinaisDe(ctx))) {
    return {
      classe: "conversa_projeto",
      razao: "E2.3: autoexplicação institucional do CEO → C2"
    };
  }

  // Emenda E2.2 — deliberação de projecto (antes de C1 genérico)
  if (ehDeliberacaoProjetoE22(t, ctx)) {
    return {
      classe: "conversa_projeto",
      razao: "E2.2: padrão deliberativo + contexto de projecto → C2"
    };
  }

  // Emenda E2.2 — conhecimento geral seguro
  if (ehConhecimentoGeralE22(t, ctx.fioCoa, optsSinaisDe(ctx))) {
    return {
      classe: "conhecimento_geral",
      razao: "E2.2: conhecimento/definição/explicação → C1"
    };
  }

  const jobs = desambiguarJobs(t, ctx.fioCoa, optsSinaisDe(ctx));
  if (jobs === "c4") {
    return {
      classe: "comando_operacional",
      razao: "RF10: jobs no sentido listar/consultar → C4"
    };
  }
  if (jobs === "c3") {
    return {
      classe: "trabalho_executivo",
      razao: "RF10: criar/despachar job de trabalho → C3"
    };
  }

  const ordenado = Object.entries(scores)
    .filter(([, s]) => s > 0)
    .sort((a, b) => b[1] - a[1]);

  if (!ordenado.length) {
    if (ctx.frenteActiva) {
      return {
        classe: "conversa_projeto",
        razao: "Sem lexicon; frente activa → C2 restritivo"
      };
    }
    return {
      classe: "conhecimento_geral",
      razao: "Sem lexicon; default restritivo C1"
    };
  }

  let [topClasse, topScore] = ordenado[0];
  const segundo = ordenado[1];
  const segundoScore = segundo ? segundo[1] : 0;
  const segundoClasse = segundo ? segundo[0] : null;

  // RF8: empate C2/C3 sem verbo de execução → C2
  const c2 = scores.conversa_projeto || 0;
  const c3 = scores.trabalho_executivo || 0;
  if (c2 > 0 && c3 > 0 && Math.abs(c2 - c3) < 0.2) {
    if (!temVerboExecucao(t, ctx.fioCoa, optsSinaisDe(ctx))) {
      return {
        classe: "conversa_projeto",
        razao: "RF8: empate C2/C3 sem verbo de execução → C2"
      };
    }
    return {
      classe: "trabalho_executivo",
      razao: "RF8: C2/C3 com verbo de execução → C3"
    };
  }

  // RF9: empate C1/C2 + frente activa + refs de projecto → C2
  const c1 = scores.conhecimento_geral || 0;
  if (
    ctx.frenteActiva &&
    c1 > 0 &&
    c2 > 0 &&
    Math.abs(c1 - c2) < 0.25 &&
    /\b(mg2|projeto|outdoor|coa|jogo|frente)\b/.test(t)
  ) {
    return {
      classe: "conversa_projeto",
      razao: "RF9: empate C1/C2 com frente activa e ref. projecto → C2"
    };
  }

  // Se top é C3 mas sem verbo e C2 compete → C2 (reforço RF8)
  if (
    topClasse === "trabalho_executivo" &&
    !temVerboExecucao(t, ctx.fioCoa, optsSinaisDe(ctx)) &&
    c2 >= 0.5
  ) {
    return {
      classe: "conversa_projeto",
      razao: "RF8: C3 sem verbo claro; C2 compete → C2"
    };
  }

  void topScore;
  void segundoScore;
  void segundoClasse;

  const mapaRazao = {
    conhecimento_geral: "Lexicon C1",
    conversa_projeto: "Lexicon C2",
    trabalho_executivo: "Lexicon C3",
    comando_operacional: "Lexicon C4"
  };

  return {
    classe: /** @type {import("./dominio.js").ClasseIntencao} */ (topClasse),
    razao: mapaRazao[topClasse] || "Score máximo"
  };
}

/**
 * S3 — desambiguação C1↔C2 via histórico recente (IMP-061 / ARQ-022).
 * Nunca promove a C3; nunca altera C4 sólido; ausência de histórico = no-op.
 *
 * @param {import("./dominio.js").SaidaClassificador} saida
 * @param {string} t — texto normalizado
 * @param {ContextoClassificacao} ctx
 * @returns {import("./dominio.js").SaidaClassificador}
 */
export function aplicarDesambiguacaoHistorico(saida, t, ctx = {}) {
  const hist = ctx.historicoRecente;
  if (!Array.isArray(hist) || hist.length === 0) return saida;

  // C3 da mensagem actual — intocável (I-C3 / RF7 / RF9)
  if (
    saida.classe === "trabalho_executivo" &&
    saida.precisaClarificacao !== true
  ) {
    return saida;
  }

  // C4 sólido da mensagem actual — histórico não pontua C4 (RF13)
  if (
    saida.classe === "comando_operacional" &&
    saida.precisaClarificacao !== true &&
    !abaixoDoLimiar(saida.confianca)
  ) {
    return saida;
  }

  // C2 já acima do limiar — nada a desambiguar
  if (
    saida.classe === "conversa_projeto" &&
    saida.precisaClarificacao !== true &&
    !abaixoDoLimiar(saida.confianca)
  ) {
    return saida;
  }

  const temProjHist = historicoTemReferenciaProjeto(hist);
  const temLastro = temProjHist || ctx.frenteActiva === true;
  if (!temLastro) return saida;

  const deixis = mensagemEhDeixisOuFollowUp(t);
  const precisaAjuda =
    saida.precisaClarificacao === true ||
    abaixoDoLimiar(saida.confianca) ||
    (saida.classe === "conhecimento_geral" && deixis);

  if (!precisaAjuda) return saida;

  // Só C1↔C2: promover / reforçar C2 (nunca C3)
  const conf = Math.max(0.62, Number(saida.confianca) || 0);
  const razao = [
    "Histórico recente: desambiguação C1↔C2 → C2",
    saida.razaoCurta
  ]
    .filter(Boolean)
    .join(" — ")
    .slice(0, 200);

  return montarSaida("conversa_projeto", Math.min(0.93, conf), razao);
}

/**
 * Classifica intenção (puro) — integra domínio E1 via montarSaida.
 * @param {string} texto
 * @param {ContextoClassificacao} [contexto]
 * @returns {import("./dominio.js").SaidaClassificador}
 */
export function classificar(texto, contexto = {}) {
  const t = normalizarTexto(texto);

  if (!t) {
    return montarSaida("conhecimento_geral", 0.3, "Mensagem vazia — clarificação", {
      precisaClarificacao: true
    });
  }

  // Protocolo do Agente Executivo (procedimento/demanda/CTO/autorização) → C2.
  // Evita default C1 clarificação e falso match de identidade.
  {
    const prot = detectarPedidoProtocoloExecutivo(texto);
    if (prot.activo) {
      return montarSaida(
        "conversa_projeto",
        0.95,
        "Protocolo Agente Executivo (DIC) → C2 sem clarificação"
      );
    }
  }

  // LFC / resposta restrita factual do caso → C2 (capacidade ia + processarTurnoLfc).
  // Sem isto, T1 cai no default C1 clarificação e nunca lê o LFC (conflito MVP).
  {
    const detLfc = detectarModoRespostaRestrita(texto);
    const modosLfc = new Set(["dado_unico", "factos", "registo", "confirmacao"]);
    if (
      (detLfc.activo && detLfc.modo && modosLfc.has(detLfc.modo)) ||
      (pediuAmbitoCasoLfc(texto) &&
        /\b(qual|liste|listar|quais|mostre|mostrar|codigo\s+secreto)\b/.test(t))
    ) {
      return montarSaida(
        "conversa_projeto",
        0.94,
        "LFC: consulta/registo/correção factual do caso → C2 (sem clarificação)"
      );
    }
  }

  // 0) recomendação operacional → C4
  // 0b) relato/encerramento (três campos) → C4 memória encerrar_dia
  // 1) continuidade missão + operação aberta → C2 (Teste 3)
  // 2) consulta factual pura → C4
  // 3) análise/deliberação de proposta → C2
  // 4) proibição sem análise → C2
  // ANÁLISE NÃO É CONSULTA DE ESTADO. «Não crie Job» ≠ âncora C4.
  // Precedência FASE 3: decisão (fluxo normal C2) > âncora projecto/empresa > E4
  if (
    !pedidoDecisaoDe(contexto, texto) &&
    (temAncoraExplicitaProjeto(texto) || detectarAncoraEmpresa(texto))
  ) {
    return montarSaida(
      "comando_operacional",
      0.92,
      "FASE 3: âncora explícita de contexto (projecto/empresa) → C4"
    );
  }

  if (ehRecomendacaoOperacional(t, contexto.fioCoa, optsSinaisDe(contexto))) {
    return montarSaida(
      "comando_operacional",
      0.95,
      "E4: recomendação operacional → C4 (sem Job; sem deliberação de proposta)"
    );
  }

  if (ehPedidoRelatoEncerramento(t)) {
    return montarSaida(
      "comando_operacional",
      0.97,
      "Relato/encerramento (três campos) → C4 memória encerrar_dia"
    );
  }

  if (contexto.operacaoAberta && ehPedidoContinuidadeMissao(t)) {
    return montarSaida(
      "conversa_projeto",
      0.94,
      "Teste 3: continuidade de missão com operação aberta → C2 (não C4 isolada)"
    );
  }

  if (ehConsultaEstadoParaC4(t, contexto)) {
    return montarSaida(
      "comando_operacional",
      0.96,
      "P0: consulta de estado operacional → C4 (sem Job)"
    );
  }

  if (ehConsultaCatalogoProjetos(t)) {
    return montarSaida(
      "comando_operacional",
      0.9,
      "Consulta/listagem do catálogo de projetos → C4"
    );
  }

  if (situacionalDe(contexto, t)) {
    return montarSaida(
      "conversa_projeto",
      0.93,
      "Pedido situacional de trabalho em curso → C2 (não panorama estado_geral)"
    );
  }

  if (ehPedidoAnaliseOuRecomendacao(t, contexto.fioCoa, optsSinaisDe(contexto))) {
    return montarSaida(
      "conversa_projeto",
      0.94,
      "P0/P1-1: análise/recomendação → C2 (sem Job)"
    );
  }

  if (ehProibicaoExecucaoExplicita(t)) {
    return montarSaida(
      "conversa_projeto",
      0.95,
      "P0: proibição explícita de execução → C2 (sem Job)"
    );
  }

  // Emenda E2.1 — atalho obrigatório (antes de boost de frente activa)
  // Histórico NÃO entra aqui (ARQ-022 S1)
  if (ehIntencaoExecutivaE21(t, contexto.fioCoa, optsSinaisDe(contexto))) {
    return montarSaida(
      "trabalho_executivo",
      0.94,
      "E2.1: imperativo + acção executável → C3"
    );
  }

  // Emenda E2.3 — autoexplicação institucional → C2 (nunca Clarificação / C3 Job)
  if (ehAutoexplicacaoInstitucionalE23(t, contexto.fioCoa, optsSinaisDe(contexto))) {
    return montarSaida(
      "conversa_projeto",
      0.93,
      "E2.3: autoexplicação institucional do CEO → C2"
    );
  }

  // Emenda E2.2 — C2 deliberativo com contexto de projecto (nunca Clarificação)
  if (ehDeliberacaoProjetoE22(t, contexto)) {
    return montarSaida(
      "conversa_projeto",
      0.93,
      "E2.2: deliberação de projecto → C2"
    );
  }

  // Emenda E2.2 — C1 conhecimento seguro (nunca Clarificação)
  // Histórico NÃO anula C1 seguro (ex.: «O que é um ADR?»)
  if (ehConhecimentoGeralE22(t, contexto.fioCoa, optsSinaisDe(contexto))) {
    return montarSaida(
      "conhecimento_geral",
      0.93,
      "E2.2: conhecimento geral → C1"
    );
  }

  const s1 = pontuarLexico(t, LEXICO_C1);
  const s2 = pontuarLexico(t, LEXICO_C2);
  const s3 = pontuarLexico(t, LEXICO_C3);
  const s4 = pontuarLexico(t, LEXICO_C4);
  const sv = pontuarLexico(t, LEXICO_VAGO);

  const scores = {
    conhecimento_geral: s1.score,
    conversa_projeto: s2.score,
    trabalho_executivo: s3.score,
    comando_operacional: s4.score
  };

  // Frente activa sem sinais fortes: ligeiro boost C2 (nunca se E2.1 — já retornou)
  if (
    contexto.frenteActiva === true &&
    s2.score < 0.5 &&
    s3.score < 0.5 &&
    s4.score < 0.5
  ) {
    if (s2.hits.length === 0 && /\b(isto|isso|agora|hoje)\b/.test(t) === false) {
      /* no boost for pure C1 */
    }
    if (s2.score > 0 || /\b(mg2|outdoor|projeto|coa)\b/.test(t)) {
      scores.conversa_projeto = Math.max(scores.conversa_projeto, 0.72);
    }
  }

  const resolvido = resolverEmpates(scores, t, contexto);
  const ordenado = Object.values(scores).sort((a, b) => b - a);
  const confianca = calcularConfianca(
    scores[resolvido.classe] || ordenado[0] || 0.4,
    ordenado[1] || 0,
    sv.score > 0 || t.split(/\s+/).length <= 2
  );

  const hits = [
    ...s1.hits.map((h) => `C1:${h}`),
    ...s2.hits.map((h) => `C2:${h}`),
    ...s3.hits.map((h) => `C3:${h}`),
    ...s4.hits.map((h) => `C4:${h}`)
  ].slice(0, 4);

  const razaoCurta = [resolvido.razao, hits.length ? hits.join(",") : null]
    .filter(Boolean)
    .join(" — ")
    .slice(0, 200);

  const saida = montarSaida(resolvido.classe, confianca, razaoCurta);

  // S3 — histórico opcional (só C1↔C2)
  const aposHist = aplicarDesambiguacaoHistorico(saida, t, contexto);
  // IMP-094 Fase 2 — CL-1/CL-2/CL-3: não clarificar por limiar/lexicon em famílias proibidas.
  return disciplinarSaidaClarificacao(aposHist, texto).saida;
}

export { LIMIAR_CONFIANCA, normalizarTexto };
