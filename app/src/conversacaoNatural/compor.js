/**
 * Composição por camadas A–F (PX-003 E1 §3.4) — sem alterar deliberação.
 * DESP-002: condução activa, perguntas estratégicas, antecipação, foco, transição, fecho.
 */

import { TIPO_TURNO } from "./tiposTurno.js";
import {
  filtrarPerguntasJaFeitas,
  objetivoJaNoFio
} from "./contextoImediato.js";
import {
  ancoraFio,
  ancoraObjectivo,
  fechoExecutivo,
  proximaAberturaPergunta,
  proximoFecho,
  transicaoTopico
} from "./variacao.js";
import { sanitizarProsaUsuario } from "./sanitizarProsa.js";
import {
  montarPlanoExecutivo,
  problemaExigePlanoExecutivo
} from "./planoExecutivo.js";
import {
  formatarAntecipacao,
  perguntaEhGenericaAutorizacao,
  seleccionarAntecipacao
} from "./antecipacaoExecutiva.js";
import {
  adaptarCamadasAoModo,
  detectarModoAdaptacao,
  ordemCamadasParaModo
} from "./adaptacaoConversacional.js";
import {
  formatarSinalMemoria,
  seleccionarRecuperacaoMemoria
} from "./memoriaExecutivaConversacional.js";
import {
  ancoraMissaoEmExecucao,
  fechoParcialMissao,
  missaoActiva,
  perguntaIniciativaMissao,
  perguntaPrioridadeMissao
} from "./inteligenciaExecutiva.js";
import {
  detectarModoExecutivo,
  filtrarObjectivoInventado,
  montarAckExecucao
} from "./disciplinaExecutiva.js";
import {
  ehPerguntaProibidaComOperacao,
  montarAckRecuperacao
} from "./estadoOperacional.js";
import {
  deveAnexarContextoExecutivo,
  deveAnteciparPendencia,
  devePreservarRespostaNucleo,
  ehPedidoAnaliseConversa,
  ehPedidoResumoExecutivo
} from "./prioridadeIntencao.js";
import {
  detectarPedidoAnaliseDeliberativa,
  montarProsaAnaliseDeliberativa
} from "../mre/politicaAnaliseDeliberativa.js";
import { detectarPedidoDecisaoExplicita } from "../classificadorIntencao/pedidoDecisaoExplicita.js";

const PROSA_DECISAO = Object.freeze({
  aprovar: (r) => `${r}`,
  rejeitar: (r) => `Não avanço com isso: ${r}`,
  delegar: (r) => `Delego a execução: ${r}`,
  monitorar: (r) => `Acompanho sem fechar decisão: ${r}`,
  solicitar_dados: (r) => `Para decidir, preciso de mais dados. ${r}`,
  adiar: (r) => `Adio por agora: ${r}`
});

/**
 * Pedido com alternativas explícitas A/B/C (não Eng×Fin×Com genérico).
 * @param {string} [texto]
 * @returns {boolean}
 */
export function pedidoTemAlternativasAbc(texto) {
  const t = String(texto || "");
  return (
    /\bA\s*[\)\.\:—\-]/.test(t) &&
    /\bB\s*[\)\.\:—\-]/.test(t) &&
    /\bC\s*[\)\.\:—\-]/.test(t)
  );
}

/**
 * Mapeia fecho MRE → letra A/B/C sem alterar inferirEstadoEscolha.
 * A = aceitar/aprovar; B = recusar contrato; C = adiar aceitação.
 * @param {string} [instrucao]
 * @param {string} [estado]
 * @param {string} [recomendacao]
 * @returns {"A"|"B"|"C"|null}
 */
export function inferirLetraFechoAbc(instrucao, estado, recomendacao) {
  if (!pedidoTemAlternativasAbc(instrucao)) return null;
  const e = String(estado || "");
  const rec = String(recomendacao || "").trim();
  const mExplicita =
    rec.match(/\b([ABC])\s*[—\-:)]\s*/i) ||
    rec.match(/\bescolha\s+([ABC])\b/i) ||
    rec.match(/\bop[cç][aã]o\s+([ABC])\b/i);
  if (mExplicita) return /** @type {"A"|"B"|"C"} */ (mExplicita[1].toUpperCase());

  if (e === "adiar") return "C";
  if (/rejeitar\s+a\s+aceita[cç][aã]o/i.test(rec) || /\badiar\b|\bposterg/i.test(rec)) {
    return "C";
  }
  if (
    /\brecusar\b/i.test(rec) ||
    /\brejeitar\s+o\s+(novo\s+)?contrato\b/i.test(rec)
  ) {
    return "B";
  }
  if (e === "aprovar" || /\baceitar\b|\baprovar\b/i.test(rec)) return "A";
  if (e === "rejeitar") {
    if (/\bneste\s+momento\b/i.test(rec)) return "C";
    return "B";
  }
  return null;
}

/**
 * Escolha decisória válida já no parecer (fecho MRE), sem handoff analítico.
 * @param {string} [estado]
 * @param {string} [recomendacao]
 * @param {{ pedidoAbc?: boolean }} [opts]
 */
export function temEscolhaDecisoriaValida(estado, recomendacao, opts = {}) {
  const e = String(estado || "");
  const r = String(recomendacao || "").trim();
  if (!r) return false;
  if (e === "solicitar_dados") return false;
  if (e === "adiar") {
    // A/B/C: C = adiar é fecho válido (sem alterar política MRE)
    return opts.pedidoAbc === true;
  }
  if (e === "delegar") return false;
  if (
    /delegar\s+(a\s+)?(an[aá]lise|avalia|decis)/i.test(r) ||
    /equipe\s+especializ|especialistas/i.test(r) ||
    /precisamos\s+(de\s+)?(mais\s+)?an[aá]lise/i.test(r) ||
    /analisar\s+mais/i.test(r)
  ) {
    return false;
  }
  return e === "aprovar" || e === "rejeitar" || e === "monitorar";
}

/**
 * Pedido explícito de decisão + escolha válida no parecer → CN apresenta fecho.
 * @param {string} [instrucao]
 * @param {string} [estado]
 * @param {string} [recomendacao]
 */
export function deveApresentarFechoDecisorio(instrucao, estado, recomendacao) {
  const pedidoAbc = pedidoTemAlternativasAbc(instrucao);
  return (
    detectarPedidoDecisaoExplicita(instrucao) &&
    temEscolhaDecisoriaValida(estado, recomendacao, { pedidoAbc })
  );
}

function encurtar(s, max) {
  const t = String(s || "").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

/**
 * Extrai critério curto da justificativa/análise (ignora boilerplate V5).
 * @param {string} texto
 * @returns {string|null}
 */
export function extrairCriterioCurto(texto) {
  const t = String(texto || "").trim();
  if (!t) return null;
  if (
    /Sem riscos materiais identificados|Decisão considerando riscos identificados e princípios/i.test(
      t
    ) &&
    t.length < 140
  ) {
    return null;
  }
  const m = t.match(
    /(?:com base|porque|pois|dado que|pelo princ[ií]pio|risco|priorizar|ADR-\d+)[^.?!]{6,110}/i
  );
  if (m) return encurtar(m[0].replace(/^[\s,;:]+/, ""), 90);
  return encurtar(t, 90);
}

/**
 * Camada A com critério + alternativa descartada (ciclo Decidir).
 * @param {string} estado
 * @param {string} recomendacao
 * @param {string} justificativa
 * @param {string} analise
 * @param {string[]} alternativas
 * @param {{ fechoDecisorio?: boolean }} [opts]
 */
export function montarProsaDecisaoExecutiva(
  estado,
  recomendacao,
  justificativa,
  analise,
  alternativas = [],
  opts = {}
) {
  const rec = String(recomendacao || "").trim() || "Sem recomendação clara.";
  const criterio = extrairCriterioCurto(justificativa || analise);
  const alt = Array.isArray(alternativas)
    ? String(alternativas[0] || "").trim()
    : "";
  const fecho = opts.fechoDecisorio === true;
  const instrucao = String(opts.instrucao || "");
  const letraAbc = fecho
    ? inferirLetraFechoAbc(instrucao, estado, recomendacao)
    : null;

  // Fecho A/B/C explícito: C = adiar (não só «Rejeitar a aceitação»)
  if (fecho && letraAbc) {
    let corpo = rec
      .replace(/^(Decisão(\s+sob\s+conflito)?\s*:\s*)/i, "")
      .replace(/^[ABC]\s*[—\-:)]\s*/i, "")
      .trim();
    if (letraAbc === "C") {
      if (!/\badiar\b/i.test(corpo)) {
        corpo = corpo.replace(
          /^Rejeitar\s+a\s+aceita[cç][aã]o(\s+do\s+novo\s+contrato)?(\s+neste\s+momento)?\.?\s*/i,
          ""
        ).trim();
        corpo = corpo
          ? `adiar — ${corpo}`
          : "adiar a aceitação do contrato para mais tarde";
      } else if (!/^adiar\b/i.test(corpo)) {
        corpo = `adiar — ${corpo}`;
      }
    } else if (letraAbc === "B") {
      if (!/\brecusar\b|\brejeitar\b/i.test(corpo)) {
        corpo = `recusar o contrato. ${corpo}`.trim();
      }
    } else if (letraAbc === "A") {
      if (!/\baceitar\b|\baprovar\b/i.test(corpo)) {
        corpo = `aceitar. ${corpo}`.trim();
      }
    }
    let base = `${letraAbc} — ${corpo}`;
    if (criterio && !/\bCrit[eé]rio\b/i.test(base)) {
      base = `${base} Critério: ${criterio}.`;
    }
    if (alt) {
      base = `${base} Em alternativa ficaria «${encurtar(alt, 48)}».`;
    }
    return base;
  }

  // Fecho sob pedido explícito: não enfraquecer com «Acompanho sem fechar»
  if (
    fecho &&
    (estado === "monitorar" ||
      estado === "aprovar" ||
      estado === "rejeitar" ||
      estado === "adiar")
  ) {
    let base = /^(Decisão\b|Decisão sob conflito)/i.test(rec)
      ? rec
      : `Decisão: ${rec}`;
    if (criterio && !/\bCrit[eé]rio\b/i.test(base)) {
      base = `${base} Critério: ${criterio}.`;
    }
    if (alt && estado !== "monitorar") {
      base = `${base} Em alternativa ficaria «${encurtar(alt, 48)}».`;
    }
    return base;
  }

  const prosaFn = PROSA_DECISAO[estado] || ((r) => r);
  let base = prosaFn(rec);

  if (estado === "monitorar") {
    if (criterio) {
      base = `${base} Critério de mudança: ${criterio}.`;
    }
    return base;
  }

  if (
    estado === "aprovar" ||
    estado === "rejeitar" ||
    estado === "delegar"
  ) {
    if (criterio) {
      base = `${base} Critério: ${criterio}.`;
    }
    if (alt) {
      base = `${base} Em alternativa ficaria «${encurtar(alt, 48)}».`;
    }
  }

  return base;
}

/**
 * @param {object} parecer
 * @param {object} ctxImediato
 * @param {object} [opts]
 */
export function comporDeliberacao(parecer, ctxImediato, opts = {}) {
  const estado = parecer.decisaoExecutiva?.estado;
  const recomendacao = String(
    parecer.decisaoExecutiva?.recomendacao || ""
  ).trim();
  const justificativa = String(
    parecer.decisaoExecutiva?.justificativa || ""
  ).trim();
  const acaoDesc = String(parecer.acao?.descricao || "").trim();
  const lacunas = Array.isArray(parecer.lacunas) ? parecer.lacunas : [];
  const confianca = Number(parecer.confianca);
  const objetivo = String(parecer.diagnostico?.objetivoReal || "").trim();
  const canal = opts.canal || "chat";
  const pediuDetalhe = Boolean(opts.pediuDetalhe);
  const limiarPorque = opts.limiarPorque ?? 0.55;
  const instrucao = String(opts.instrucao || "").trim();
  const modoExecutivo = detectarModoExecutivo({
    instrucao,
    parecer,
    missaoActiva: Boolean(ctxImediato?.missaoActiva),
    estadoOperacional: ctxImediato?.estadoOperacional,
    historico: ctxImediato?.historico
  });
  const emModoOperacional =
    modoExecutivo === "executar" || modoExecutivo === "recuperar";
  const emModoExecutar = emModoOperacional;

  /** @type {Record<string, string|null>} */
  const camadas = {
    A: null,
    B: null,
    C: null,
    D: null,
    E: null,
    F: null,
    P: null,
    N: null,
    M: null
  };

  const analise = String(parecer.analise || "").trim();
  const alternativas = Array.isArray(parecer.decisaoExecutiva?.alternativas)
    ? parecer.decisaoExecutiva.alternativas
        .map((a) => String(a || "").trim())
        .filter(Boolean)
    : [];

  const fechoDecisorio = deveApresentarFechoDecisorio(
    instrucao,
    estado,
    recomendacao
  );

  // P1-2: pedido de análise → prosa liderada pela análise, sem «Delego a execução»
  // Pedido explícito de decisão com escolha válida prevalece (não suavizar o fecho)
  if (!fechoDecisorio && detectarPedidoAnaliseDeliberativa(instrucao)) {
    const prosa = montarProsaAnaliseDeliberativa(parecer, {
      maxAnalise: canal === "voz" ? 400 : 900
    });
    if (prosa) {
      return {
        texto: prosa,
        guiãoVoz: prosa,
        camadasUsadas: ["analise_deliberativa"],
        perguntas:
          estado === "solicitar_dados"
            ? lacunas.map((l) => (/\?$/.test(l) ? l : `${l}?`))
            : [],
        modoExecutivo
      };
    }
  }

  // DESP-004: plano antes da decisão quando o problema é multi-etapa
  // Fecho decisório explícito: não envolver em «Plano» que reabre a deliberação
  if (
    !fechoDecisorio &&
    problemaExigePlanoExecutivo({ parecer, instrucao, canal })
  ) {
    camadas.P = montarPlanoExecutivo(parecer, { canal });
  }

  camadas.A = montarProsaDecisaoExecutiva(
    estado,
    recomendacao,
    justificativa,
    analise,
    alternativas,
    { fechoDecisorio, instrucao }
  );

  if (confianca < 0.5 || lacunas.length > 0) {
    camadas.A = `${camadas.A} Com a informação disponível, avanço com cautela.`;
  }

  // Com plano explícito, o gesto B não precisa repetir a acção completa
  if (acaoDesc && !camadas.P) {
    camadas.B =
      fechoDecisorio
        ? `Próximo passo: ${acaoDesc.replace(/\.$/, "")}.`
        : estado === "monitorar"
          ? `Vigília: ${acaoDesc.replace(/\.$/, "")}.`
          : `Sugiro ${acaoDesc.replace(/\.$/, "")}.`;
  } else if (acaoDesc && camadas.P && estado === "monitorar") {
    camadas.B = `Vigília: ${acaoDesc.replace(/\.$/, "")}.`;
  }

  // Síntese executiva (camada C)
  {
    const fonteSintese = justificativa || analise;
    if (fonteSintese) {
      const max =
        canal === "voz"
          ? 120
          : pediuDetalhe || confianca < limiarPorque
            ? 220
            : 160;
      const j = encurtar(fonteSintese, max);
      camadas.C = j ? (j.endsWith(".") ? j : `${j}.`) : null;
    }
  }

  // Etapa 4: envelope (Objectivo / Antecipo pendência) ≠ condução deliberativa
  const anexarEnvelope = deveAnexarContextoExecutivo({
    instrucao,
    intencaoId: opts.intencaoId,
    modo: opts.modo
  });
  const preservarNucleo = devePreservarRespostaNucleo({
    instrucao,
    intencaoId: opts.intencaoId,
    modo: opts.modo
  });
  // Condução (D): permitida em deliberação com parecer — sem despejar envelope
  const permitirConducao =
    !emModoExecutar &&
    canal !== "centro_situacao" &&
    !preservarNucleo &&
    !ehPedidoAnaliseConversa(instrucao) &&
    String(opts.intencaoId || "") !== "saudacao" &&
    (anexarEnvelope || Boolean(parecer));

  // DESP-005: antecipação com evidência (no máx. um sinal)
  const sinalAntecipacao = seleccionarAntecipacao({
    parecer,
    ctxImediato,
    canal,
    estado,
    instrucao,
    intencaoId: opts.intencaoId,
    modo: opts.modo,
    jaTemPlanoComRisco: Boolean(camadas.P && /Risco:/i.test(camadas.P))
  });
  if (sinalAntecipacao) {
    if (sinalAntecipacao.tipo === "pendencia" && !anexarEnvelope) {
      /* Etapa 4: pendência sozinha não entra na prosa */
    } else if (
      anexarEnvelope ||
      sinalAntecipacao.tipo === "risco" ||
      sinalAntecipacao.tipo === "dependencia" ||
      sinalAntecipacao.tipo === "oportunidade"
    ) {
      camadas.N = formatarAntecipacao(sinalAntecipacao, canal);
    }
  }

  let perguntas =
    estado === "solicitar_dados"
      ? lacunas.map((l) => (/\?$/.test(l) ? l : `${l}?`))
      : [];
  if (estado === "solicitar_dados" && perguntas.length === 0) {
    perguntas = ["Qual informação bloqueia a próxima decisão?"];
  }

  // Condução / perguntas — sem exigir envelope Objectivo/Antecipo
  // Fecho decisório: não reabrir com «o que mudaria» / trade-off entre alternativas
  if (
    permitirConducao &&
    perguntas.length === 0 &&
    estado !== "solicitar_dados" &&
    !fechoDecisorio
  ) {
    const perguntaConducao = montarPerguntaConducao({
      alternativas,
      acaoDesc,
      estado,
      lacunas,
      objectivoPrincipal: anexarEnvelope
        ? ctxImediato?.objectivoPrincipal || objetivo
        : null,
      proximaAcao: anexarEnvelope ? ctxImediato?.proximaAcao : null,
      pendencias:
        anexarEnvelope && !sinalAntecipacao ? ctxImediato?.pendencias : [],
      temGestoB: Boolean(camadas.B),
      instrucao,
      intencaoId: opts.intencaoId
    });
    if (
      sinalAntecipacao?.pergunta &&
      camadas.N &&
      (!perguntaConducao ||
        perguntaEhGenericaAutorizacao(perguntaConducao) ||
        sinalAntecipacao.tipo === "risco" ||
        sinalAntecipacao.tipo === "dependencia" ||
        sinalAntecipacao.tipo === "oportunidade")
    ) {
      perguntas = [sinalAntecipacao.pergunta];
    } else if (perguntaConducao) {
      perguntas = [perguntaConducao];
    }
  }

  perguntas = filtrarPerguntasJaFeitas(perguntas, ctxImediato);

  if (perguntas.length) {
    camadas.D = perguntas.slice(0, canal === "voz" ? 1 : 2).join(" ");
  } else if (lacunas.length && estado !== "solicitar_dados" && pediuDetalhe) {
    camadas.D = `Atenção: ${encurtar(lacunas.join("; "), 120)}.`;
  }

  // Camada E: só com envelope autorizado (Etapa 4)
  camadas.E = anexarEnvelope
    ? montarAncoraOuTransicao(ctxImediato, objetivo, canal)
    : null;

  // DESP-007: memória executiva — só quando envelope autorizado
  const sinalMemoria = anexarEnvelope
    ? seleccionarRecuperacaoMemoria({
        ctxImediato,
        instrucao,
        canal,
        jaTemAncoraE: Boolean(camadas.E)
      })
    : null;
  if (sinalMemoria) {
    camadas.M = formatarSinalMemoria(sinalMemoria, canal);
  }

  // DESP-008: prioridade ambígua / mudança — só com envelope autorizado
  const perguntaPrioridade = emModoExecutar
    ? null
    : perguntaPrioridadeMissao(ctxImediato);
  if (perguntaPrioridade && !camadas.D && anexarEnvelope) {
    camadas.D = perguntaPrioridade;
    perguntas = [perguntaPrioridade];
  }

  // DESP-008: confirmação no meio da missão — só com envelope autorizado
  const emMissao = missaoActiva(ctxImediato);
  if (!emModoExecutar && emMissao && !camadas.D && anexarEnvelope) {
    const iniciativa = perguntaIniciativaMissao(ctxImediato);
    if (iniciativa) {
      camadas.D = iniciativa;
      perguntas = [iniciativa];
    }
  }

  // Fecho parcial de missão — só com envelope autorizado
  const fechoMissao =
    emModoExecutar || !anexarEnvelope ? null : fechoParcialMissao(ctxImediato);
  if (fechoMissao) {
    camadas.F = fechoMissao;
    camadas.D = null;
    perguntas = [];
  } else if (
    anexarEnvelope &&
    !emModoExecutar &&
    !camadas.B &&
    !camadas.D &&
    (estado === "aprovar" || estado === "delegar" || estado === "monitorar")
  ) {
    camadas.F = proximoFecho();
  }

  // DESP-006: adaptar profundidade / detalhe / condução ao momento
  const modoAdaptacao = detectarModoAdaptacao({
    instrucao,
    pediuDetalhe,
    ctxImediato,
    parecer,
    canal,
    eventoObjectivo: ctxImediato?.eventoObjectivo
  });

  // Em mudança + envelope autorizado: reforçar âncora se E vazio
  if (anexarEnvelope && modoAdaptacao === "mudanca" && !camadas.E) {
    const obj =
      ctxImediato?.objectivoPrincipal || objetivo || ctxImediato?.frenteAtiva;
    if (obj) {
      camadas.E = ancoraObjectivo(encurtar(obj, 100));
    }
  }

  const camadasAdaptadas = adaptarCamadasAoModo(camadas, modoAdaptacao, {
    confianca,
    missaoActiva: emMissao
  });
  const ordem = ordemCamadasParaModo(modoAdaptacao, canal);

  const partes = ordem.map((k) => camadasAdaptadas[k]).filter(Boolean);
  let texto = sanitizarProsaUsuario(
    partes.join(canal === "voz" ? " " : "\n\n")
  );
  // CTO-003 REGRA 4: nunca ecoar perguntas proibidas com operação aberta
  if (
    (emModoOperacional || ctxImediato?.operacaoAberta) &&
    ehPerguntaProibidaComOperacao(texto)
  ) {
    texto = sanitizarProsaUsuario(
      texto
        .replace(/É isso — ou mudámos de prioridade\?/gi, "")
        .replace(/mudámos de prioridade\?/gi, "")
        .replace(/Qual é o objetiv[oa]\??/gi, "")
        .replace(/quer deliberar\??/gi, "")
        .replace(/\n{3,}/g, "\n\n")
        .trim()
    );
  }
  const guiãoVoz = sanitizarProsaUsuario(
    ordem
      .filter((k) => k !== "C" && k !== "F")
      .map((k) => camadasAdaptadas[k])
      .filter(Boolean)
      .join(" ")
  );

  return {
    texto,
    guiãoVoz,
    camadasUsadas: Object.fromEntries(
      Object.entries(camadasAdaptadas).filter(([, v]) => Boolean(v))
    ),
    perguntas: emModoExecutar ? [] : perguntas,
    modoAdaptacao,
    modoExecutivo
  };
}

/**
 * @param {object} ctxImediato
 * @param {string} objetivoParecer
 * @param {string} canal
 */
function montarAncoraOuTransicao(ctxImediato, objetivoParecer, canal) {
  if (canal === "centro_situacao") return null;

  const objectivoPrincipal = filtrarObjectivoInventado(
    ctxImediato?.objectivoPrincipal || objetivoParecer || null
  );

  if (ctxImediato?.houveShiftTopico) {
    return transicaoTopico(
      ctxImediato.topicoAncora || ctxImediato.entregaCorrente,
      objectivoPrincipal
    );
  }

  if (
    objectivoPrincipal &&
    !objetivoJaNoFio(objectivoPrincipal, ctxImediato)
  ) {
    return ancoraObjectivo(encurtar(objectivoPrincipal, 100));
  }

  // DESP-008: missão activa com entrega ≠ objectivo — postura contínua
  const ancoraMissao = ancoraMissaoEmExecucao(ctxImediato);
  if (ancoraMissao) return ancoraMissao;

  if (
    ctxImediato?.frenteAtiva &&
    !objetivoJaNoFio(ctxImediato.frenteAtiva, ctxImediato)
  ) {
    return ancoraFio(ctxImediato.frenteAtiva);
  }

  return null;
}

/**
 * @param {string} tipo
 * @param {object} args
 */
export function comporPorTipo(tipo, args = {}) {
  const {
    parecer,
    ctxImediato,
    mensagemOriginal,
    canal = "chat",
    pediuDetalhe = false,
    instrucao = "",
    intencaoId = "",
    modo = ""
  } = args;

  if (tipo === TIPO_TURNO.SISTEMA) {
    const limpa = sanitizarMensagemSistema(mensagemOriginal);
    return {
      texto: limpa,
      guiãoVoz: limpa,
      camadasUsadas: { sistema: limpa },
      perguntas: []
    };
  }

  if (tipo === TIPO_TURNO.ABERTURA) {
    const cumprimento = cumprimentoDe(mensagemOriginal);
    // Etapa 4: saudação leve — lastro rico NÃO autoriza briefing/envelope automático
    const pergunta = proximaAberturaPergunta();
    const texto = cumprimento ? `${cumprimento} ${pergunta}` : pergunta;
    return {
      texto,
      guiãoVoz: texto,
      camadasUsadas: { abertura: texto },
      perguntas: [pergunta]
    };
  }

  if (tipo === TIPO_TURNO.FECHO) {
    const texto = fechoExecutivo({
      objectivoPrincipal: ctxImediato?.objectivoPrincipal,
      proximaAcao: ctxImediato?.proximaAcao,
      pendencias: ctxImediato?.pendencias,
      frenteAtiva: ctxImediato?.frenteAtiva
    });
    return {
      texto,
      guiãoVoz: texto,
      camadasUsadas: { fecho: texto },
      perguntas: []
    };
  }

  if (tipo === TIPO_TURNO.ESPELHO && parecer) {
    const modoEx = detectarModoExecutivo({
      instrucao,
      parecer,
      missaoActiva: Boolean(ctxImediato?.missaoActiva),
      estadoOperacional: ctxImediato?.estadoOperacional
    });
    const opAberta = Boolean(ctxImediato?.operacaoAberta);
    // CTO-002/003: EXECUTAR/RECUPERAR ou operação aberta — não reconfirmar
    if (modoEx === "executar" || modoEx === "recuperar" || opAberta) {
      const texto =
        modoEx === "recuperar"
          ? montarAckRecuperacao(ctxImediato.estadoOperacional, instrucao)
          : montarAckExecucao({
              oQue: opAberta ? "Operação em curso." : "A executar.",
              resultado: encurtar(
                filtrarObjectivoInventado(
                  ctxImediato?.objectivoPrincipal ||
                    parecer.diagnostico?.objetivoReal
                ) || "",
                80
              )
            });
      return {
        texto,
        guiãoVoz: texto,
        camadasUsadas: { espelho: texto },
        perguntas: [],
        modoExecutivo: modoEx === "deliberar" && opAberta ? "executar" : modoEx
      };
    }
    const obj =
      filtrarObjectivoInventado(
        ctxImediato?.objectivoPrincipal ||
          ctxImediato?.objetivoAtual ||
          parecer.diagnostico?.objetivoReal
      ) || "o pedido";
    const texto = `Entendi: ${encurtar(obj, 120)}. É isso?`;
    return {
      texto,
      guiãoVoz: texto,
      camadasUsadas: { espelho: texto },
      perguntas: ["É isso?"]
    };
  }

  // ESPELHO sem parecer (pedido ambíguo) — conduzir com objectivo se existir
  if (tipo === TIPO_TURNO.ESPELHO) {
    const modoEx = detectarModoExecutivo({
      instrucao,
      missaoActiva: Boolean(ctxImediato?.missaoActiva),
      estadoOperacional: ctxImediato?.estadoOperacional
    });
    const opAberta = Boolean(ctxImediato?.operacaoAberta);
    if (modoEx === "executar" || modoEx === "recuperar" || opAberta) {
      const texto =
        modoEx === "recuperar"
          ? montarAckRecuperacao(ctxImediato.estadoOperacional, instrucao)
          : montarAckExecucao({
              oQue: opAberta ? "Operação em curso." : "A executar."
            });
      return {
        texto,
        guiãoVoz: texto,
        camadasUsadas: { espelho: texto },
        perguntas: [],
        modoExecutivo: modoEx === "deliberar" && opAberta ? "executar" : modoEx
      };
    }
    const obj =
      filtrarObjectivoInventado(
        ctxImediato?.objectivoPrincipal || ctxImediato?.objetivoAtual
      ) || "o pedido";
    const texto = `Entendi: ${encurtar(obj, 120)}. É isso — ou mudámos de prioridade?`;
    return {
      texto,
      guiãoVoz: texto,
      camadasUsadas: { espelho: texto },
      perguntas: ["É isso — ou mudámos de prioridade?"]
    };
  }

  if (parecer) {
    return comporDeliberacao(parecer, ctxImediato, {
      canal,
      pediuDetalhe,
      instrucao,
      intencaoId,
      modo
    });
  }

  // LLM / local sem parecer: prosa do Núcleo é a resposta
  let texto = sanitizarProsaUsuario(mensagemOriginal);
  const camadasUsadas = { prosa: texto };
  const anexar = deveAnexarContextoExecutivo({
    instrucao,
    intencaoId,
    modo
  });

  if (anexar) {
    const ancora = montarAncoraOuTransicao(ctxImediato, "", canal);
    if (
      ancora &&
      !/Mantemos o foco|Frente ativa|Continuidade:|Objectivo principal|Mudámos o fio/i.test(
        texto
      )
    ) {
      // P1: contexto depois da resposta, nunca antes
      texto = sanitizarProsaUsuario(`${texto}\n\n${ancora}`);
      camadasUsadas.E = ancora;
    }

    const sinalSemParecer = seleccionarAntecipacao({
      parecer: null,
      ctxImediato,
      canal,
      estado: "monitorar",
      instrucao,
      intencaoId
    });
    if (sinalSemParecer) {
      const n = formatarAntecipacao(sinalSemParecer, canal);
      if (n) {
        texto = sanitizarProsaUsuario(`${texto}\n\n${n}`);
        camadasUsadas.N = n;
      }
    }

    const perguntas = [];
    if (
      canal !== "centro_situacao" &&
      !/\?/.test(texto) &&
      ehPedidoResumoExecutivo(instrucao)
    ) {
      const p =
        (sinalSemParecer && sinalSemParecer.pergunta) ||
        montarPerguntaConducao({
          objectivoPrincipal: ctxImediato?.objectivoPrincipal,
          proximaAcao: ctxImediato?.proximaAcao,
          pendencias: sinalSemParecer ? [] : ctxImediato?.pendencias,
          estado: "monitorar",
          temGestoB: false
        });
      if (p) {
        texto = sanitizarProsaUsuario(`${texto}\n\n${p}`);
        camadasUsadas.D = p;
        perguntas.push(p);
      }
    }

    return {
      texto,
      guiãoVoz: texto,
      camadasUsadas,
      perguntas
    };
  }

  // Pedido específico / resposta directa: só a prosa do Núcleo
  return {
    texto,
    guiãoVoz: texto,
    camadasUsadas,
    perguntas: []
  };
}

/**
 * Abertura com retomada do objectivo se já existir (condução activa).
 * @param {object} [ctx]
 */
function montarAberturaConducao(ctx) {
  const decisao = Array.isArray(ctx?.decisoesTomadas)
    ? ctx.decisoesTomadas.find(Boolean)
    : null;
  if (ctx?.objectivoPrincipal && decisao) {
    return `Retomamos «${encurtar(ctx.objectivoPrincipal, 50)}». Decisão em vigor: ${encurtar(decisao, 55)}. Seguimos?`;
  }
  if (ctx?.objectivoPrincipal && ctx?.proximaAcao) {
    return `Retomamos «${encurtar(ctx.objectivoPrincipal, 60)}». Seguimos com ${encurtar(ctx.proximaAcao, 60)}?`;
  }
  if (ctx?.objectivoPrincipal) {
    return `Objectivo em curso: «${encurtar(ctx.objectivoPrincipal, 70)}». Qual a próxima decisão?`;
  }
  if (decisao) {
    return `Última decisão em memória: ${encurtar(decisao, 70)}. Retomamos daí?`;
  }
  if (ctx?.proximaAcao) {
    return `Há próxima acção registada: ${encurtar(ctx.proximaAcao, 70)}. Avançamos?`;
  }
  return proximaAberturaPergunta();
}

/**
 * Uma pergunta que conduz a conversa (não oferta genérica de ajuda).
 * Prioridade: trade-off → antecipação (pendência/próxima acção) → objectivo → gesto → genérico.
 * @param {object} p
 * @returns {string|null}
 */
export function montarPerguntaConducao(p = {}) {
  const alts = Array.isArray(p.alternativas)
    ? p.alternativas.filter(Boolean)
    : [];
  if (alts.length >= 2) {
    const a = encurtar(alts[0], 48);
    const b = encurtar(alts[1], 48);
    return `Entre «${a}» e «${b}», qual restrição manda agora?`;
  }

  if (Array.isArray(p.lacunas) && p.lacunas.length > 0) {
    const l = encurtar(String(p.lacunas[0]), 80);
    return /\?$/.test(l) ? l : `Isto ainda bloqueia: ${l}. Como resolve?`;
  }

  // Monitorar = postura de vigília, não pedido de autorização
  if (p.estado === "monitorar") {
    return "O que mudaria esta decisão — prazo, risco ou evidência?";
  }

  // Antecipação: pendência aberta — só se autorizada (P1)
  const pend = Array.isArray(p.pendencias)
    ? p.pendencias.filter(Boolean)
    : [];
  if (
    pend.length > 0 &&
    deveAnteciparPendencia({
      instrucao: p.instrucao,
      intencaoId: p.intencaoId,
      pendencias: pend
    })
  ) {
    return `Antecipo a pendência «${encurtar(pend[0], 70)}» — tratamos agora ou depois da decisão?`;
  }

  const obj = String(p.objectivoPrincipal || "").trim();
  const prox = String(p.proximaAcao || "").trim();
  if (obj && prox) {
    return `Para manter «${encurtar(obj, 50)}», avançamos com ${encurtar(prox, 50)}?`;
  }
  if (prox && !p.temGestoB) {
    return `Próxima acção em vista: ${encurtar(prox, 80)}. Autorizamos?`;
  }

  // Se já há gesto B, não repetir a mesma acção — perguntar critério / foco
  if (p.temGestoB && obj) {
    return `Isto mantém o objectivo «${encurtar(obj, 60)}» como prioridade?`;
  }

  if (p.acaoDesc && !p.temGestoB) {
    return `Confirmamos e avançamos: ${encurtar(p.acaoDesc.replace(/\.$/, ""), 90)}?`;
  }

  if (p.estado === "aprovar" || p.estado === "delegar") {
    return "Qual é o próximo passo que autorizamos?";
  }
  return null;
}

function cumprimentoDe(msg) {
  const t = String(msg || "");
  if (/^bom dia/i.test(t)) return "Bom dia.";
  if (/^boa tarde/i.test(t)) return "Boa tarde.";
  if (/^boa noite/i.test(t)) return "Boa noite.";
  if (/^pronto/i.test(t)) return "Pronto.";
  return "";
}

/**
 * Sistema não fala como CEO — remove vazamentos técnicos óbvios da prosa.
 * @param {string} msg
 */
export function sanitizarMensagemSistema(msg) {
  let t = String(msg || "").trim();
  if (!t) {
    return "Não foi possível concluir este passo. O texto da deliberação não está disponível.";
  }
  t = t.replace(/Configure `?CEO_LLM_API_KEY`?[^.]*\./gi, "");
  t = t.replace(/veja `?\.env\.example`?[^.]*\./gi, "");
  t = t.replace(/reinicie o servidor[^.]*\./gi, "");
  t = t.replace(/app\/\.env/gi, "configuração local");
  t = t.replace(/CEO_LLM_API_KEY/gi, "");
  t = t.replace(/\.env\.example/gi, "");
  t = t.replace(/\benv`\s*\(?/gi, "");
  t = t.replace(/chave não configurada/gi, "motor indisponível");
  t = t.replace(/\n{3,}/g, "\n\n").trim();
  if (!t) {
    return "O motor de linguagem está indisponível neste momento. Seguimos com data, hora, estado da sessão e navegação.";
  }
  return t;
}
