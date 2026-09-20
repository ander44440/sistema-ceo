/**
 * Estágios 0–7 do MRE (REQ-049). Funções puras + LLM injetável.
 */

import {
  EstadoDecisaoExecutiva,
  NaturezaInteracao,
  NivelRisco,
  PrioridadeJob,
  TipoPedido,
  Urgencia,
  ValorOportunidade
} from "../parecer/enums.js";
import {
  catalogoPrincipiosParaCoa,
  filtrarPrincipiosPorCoa
} from "./catalogoPrincipios.js";
import { chamarComRetry } from "./llmEstagio.js";
import { mapearTipoAcao } from "./mapeamentoAcao.js";
import {
  aplicarPoliticaDossierNcs,
  comContextoNcs,
  ehLacunaInstitucionalCoaPainel,
  schemaHintEstagio6ComNcs,
  temFactosMateriaisDoUtilizador
} from "../ncs/politicas.js";
import {
  hintEstagio6AnaliseDeliberativa,
  hintEstagio6ConsultaResposta,
  obterAutoanaliseActiva
} from "../politicaAnaliseDeliberativa.js";
import {
  hintEstagio6DecisaoSobConflito,
  temFatoBloqueanteNomeado
} from "../politicaDecisaoSobConflito.js";
import { hintEstagio6InfoGathering } from "../../classificadorIntencao/pedidoInfoGathering.js";
import {
  comporAnaliseConsultaDesdeSnapshot,
  diagnosticoConsultaSituacional
} from "../snapshotSituacionalConsulta.js";
import { mensagemAncoraEntradaMre } from "../mensagemAncora.js";

function trimStr(v, fallback = "") {
  const s = typeof v === "string" ? v.trim() : "";
  return s || fallback;
}

function asStringList(v) {
  if (!Array.isArray(v)) return [];
  return v.map((x) => String(x)).filter((x) => x.trim());
}

/**
 * Saneamento DET — LLM frequentemente devolve "média"/"media"; enum REQ-048 = baixa|normal|alta.
 * @param {unknown} valor
 * @returns {"baixa"|"normal"|"alta"}
 */
export function normalizarPrioridadeJob(valor) {
  const raw = String(valor ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
  if (PrioridadeJob.includes(/** @type {string} */ (valor))) {
    return /** @type {"baixa"|"normal"|"alta"} */ (valor);
  }
  if (raw === "baixa" || raw === "low") return "baixa";
  if (raw === "alta" || raw === "high" || raw === "urgente") return "alta";
  if (
    raw === "media" ||
    raw === "medio" ||
    raw === "normal" ||
    raw === "medium" ||
    raw === "med"
  ) {
    return "normal";
  }
  return "normal";
}

/**
 * Saneamento DET V5 — justificativa do LLM muitas vezes omite referência a
 * riscos/princípios/oportunidades; o validador REQ-048 exige uma delas.
 * @param {string} justificativa
 * @param {object} parcial
 * @returns {string}
 */
export function assegurarJustificativaV5(justificativa, parcial = {}) {
  const j = trimStr(justificativa, "");
  const principios = Array.isArray(parcial.principiosAplicados)
    ? parcial.principiosAplicados
    : [];
  const riscos = Array.isArray(parcial.riscos) ? parcial.riscos : [];
  const oportunidades = Array.isArray(parcial.oportunidades)
    ? parcial.oportunidades
    : [];

  const jl = j.toLowerCase();
  const okAusencia =
    /sem riscos?\s+materiais/.test(jl) ||
    /sem oportunidades?/.test(jl) ||
    /aus[eê]ncia\s+(de\s+)?(riscos?|oportunidades?|princ[ií]pios?)/.test(jl) ||
    /n[aã]o\s+h[aá]\s+(riscos?|oportunidades?|princ[ií]pios?)/.test(jl) ||
    /nenhum\s+(risco|oportunidade|princ[ií]pio)/.test(jl);
  const okRisco = /(risco|riscos)/.test(jl) && riscos.length > 0;
  const okOport =
    /(oportunidade|oportunidades)/.test(jl) && oportunidades.length > 0;
  const okPrinc =
    (/(princ[ií]pio|constitui[cç][aã]o|governan[cç]a)/.test(jl) &&
      principios.length > 0) ||
    principios.some(
      (p) => typeof p === "string" && p.trim() && jl.includes(p.trim().toLowerCase())
    );

  if (j && (okAusencia || okRisco || okOport || okPrinc)) return j;

  if (riscos.length > 0) {
    return j
      ? `${j} Considerando riscos identificados e princípios aplicáveis.`
      : "Decisão considerando riscos identificados e princípios aplicáveis.";
  }
  return j
    ? `${j} Sem riscos materiais identificados; decisão com base nos princípios aplicados.`
    : "Sem riscos materiais identificados; decisão com base nos princípios aplicados.";
}

/**
 * Estágio 0 — Diagnóstico (LLM + saneamento DET)
 */
export async function estagio0Diagnostico(entrada, deps) {
  // CONSULTA situacional: nunca transformar em «problema de negócio» inventado
  if (deps.pedidoConsultaResposta === true) {
    return diagnosticoConsultaSituacional(entrada);
  }

  const bruto = await chamarComRetry(deps.chamarLlm, {
    estagio: "0_diagnostico",
    schemaHint: "{ objetivoReal, problemaNegocio, natureza }",
    contexto: comContextoNcs(
      {
        mensagem: mensagemAncoraEntradaMre(entrada),
        intencao: entrada.intencao || null
      },
      deps.pacoteNcs
    )
  });
  let natureza = bruto.natureza;
  if (!NaturezaInteracao.includes(natureza)) natureza = "operacional";
  return {
    objetivoReal: trimStr(
      bruto.objetivoReal,
      trimStr(mensagemAncoraEntradaMre(entrada), "objetivo não identificado")
    ),
    problemaNegocio: trimStr(bruto.problemaNegocio, "não identificado"),
    natureza
  };
}

/**
 * Estágio 1 — Enquadramento (HIB)
 */
export async function estagio1Enquadramento(entrada, diagnostico, deps) {
  const intencaoId = String(entrada.intencao?.id || "");
  let tipoPedido = "decisao";
  if (deps.pedidoConsultaResposta === true) tipoPedido = "informacao";
  else if (/info|pergunta|consulta/i.test(intencaoId)) tipoPedido = "informacao";
  if (/exec|fila|despach/i.test(intencaoId)) tipoPedido = "execucao";
  if (/ambigu/i.test(intencaoId) || !mensagemAncoraEntradaMre(entrada)) {
    tipoPedido = "ambiguo";
  }

  const bruto = await chamarComRetry(deps.chamarLlm, {
    estagio: "1_enquadramento",
    schemaHint: "{ tipoPedido, urgencia, escopo }",
    contexto: comContextoNcs(
      {
        mensagem: mensagemAncoraEntradaMre(entrada),
        diagnostico,
        tipoPedidoSinal: tipoPedido
      },
      deps.pacoteNcs
    )
  });

  const tipo = TipoPedido.includes(bruto.tipoPedido) ? bruto.tipoPedido : tipoPedido;
  const urgencia = Urgencia.includes(bruto.urgencia) ? bruto.urgencia : "media";
  return {
    tipoPedido: tipo,
    urgencia,
    escopo: trimStr(bruto.escopo, "Escopo delimitado à mensagem atual")
  };
}

/**
 * Estágio 2 — Memória / Dossier (DET) — não inventa factos
 * @param {object} entrada
 * @param {string[]} lacunasAcc
 * @param {object|null} [pacoteNcs]
 */
export function estagio2Dossier(entrada, lacunasAcc, pacoteNcs = null) {
  const painel = entrada.snapshotPainel && typeof entrada.snapshotPainel === "object"
    ? entrada.snapshotPainel
    : null;
  const factos = Array.isArray(entrada.factosOficiais)
    ? entrada.factosOficiais.map((f) => String(f).trim()).filter(Boolean)
    : [];

  if (!entrada.coaId) {
    lacunasAcc.push("COA ativo ausente");
  }
  if (!painel) {
    lacunasAcc.push("Painel executivo ausente ou vazio");
  }

  aplicarPoliticaDossierNcs(entrada, lacunasAcc, pacoteNcs);

  const resumoPainel = painel
    ? trimStr(
        painel.resumo ||
          [
            painel.proximoPasso && `Próximo passo: ${painel.proximoPasso}`,
            painel.estado && `Estado: ${painel.estado}`,
            painel.pendencias && `Pendências: ${painel.pendencias}`
          ]
            .filter(Boolean)
            .join("; "),
        "Painel presente sem resumo textual"
      )
    : "Sem painel oficial — nenhum facto dinâmico autorizado";

  const fontes = [];
  if (painel) fontes.push("painel");
  if (factos.length) fontes.push("memoria");
  if (entrada.mensagem) fontes.push("utilizador");
  if (entrada.manifestoMg2?.ok) {
    // FonteFacto fechado (REQ-048): usar «outro» + facto explícito da origem canónica
    fontes.push("outro");
    factos.push(
      `Diretriz canónica Manifesto MG2: docs/MANIFESTO-MG2.md (origem=${entrada.manifestoMg2.origem})`
    );
  }

  return {
    dossier: {
      resumoPainel,
      factosUsados: factos.slice(),
      fontes
    },
    lacunasAcc
  };
}

/**
 * Estágio 3 — Princípios (HIB — seleção no catálogo)
 * Princípios de escopo MG2 só entram no catálogo quando o COA activo é MG2.
 */
export async function estagio3Principios(diagnostico, enquadramento, deps, lacunasAcc) {
  const coa =
    deps.coaAtivo ||
    (deps.coaId ? { id: deps.coaId } : null) ||
    null;
  const catalogoManifesto = Array.isArray(deps.catalogoPrincipiosManifesto)
    ? deps.catalogoPrincipiosManifesto.filter(Boolean)
    : [];
  const usarManifesto = catalogoManifesto.length > 0;
  const catalogo = usarManifesto
    ? catalogoManifesto
    : catalogoPrincipiosParaCoa(coa);

  const schemaHint = usarManifesto
    ? "{ principiosAplicados: string[] } — APENAS títulos/secções do Manifesto MG2 canónico anexado (docs/MANIFESTO-MG2.md). Proibido catálogo de governança do CEO."
    : "{ principiosAplicados: string[] } — só ids/textos do catálogo";

  const bruto = await chamarComRetry(deps.chamarLlm, {
    estagio: "3_principios",
    schemaHint,
    contexto: comContextoNcs(
      {
        diagnostico,
        enquadramento,
        catalogo,
        ...(usarManifesto
          ? {
              fontePrincipios: "manifesto_mg2_canonico",
              caminhoCanonico: "docs/MANIFESTO-MG2.md"
            }
          : {})
      },
      deps.pacoteNcs
    )
  });
  const pedidos = asStringList(bruto.principiosAplicados);

  /** @type {string[]} */
  const seleccionados = [];
  for (const p of pedidos) {
    const hit = catalogo.find(
      (c) =>
        c === p ||
        String(p).trim() === String(c).trim() ||
        String(c).startsWith(String(p).trim()) ||
        (/\§\d+/.test(p) && String(c).startsWith(String(p).match(/§\d+/)?.[0] || "___"))
    );
    if (hit && !seleccionados.includes(hit)) seleccionados.push(hit);
  }

  if (seleccionados.length === 0) {
    if (usarManifesto) {
      lacunasAcc.push(
        "Nenhum princípio do Manifesto MG2 canónico seleccionado com precisão — usando secções centrais da diretriz carregada"
      );
      // Derivado do ficheiro (já no catalogo), não inventado
      const centrais = catalogo.filter((c) =>
        /§(2|5|13|14|16)\b/.test(c)
      );
      return (centrais.length ? centrais : catalogo).slice(0, 4);
    }
    // Fallback global apenas — nunca inserir princípio de escopo MG2
    seleccionados.push("Respeito absoluto ao tempo do utilizador");
  }
  if (pedidos.length && seleccionados.length === 0) {
    lacunasAcc.push("Nenhum princípio do catálogo selecionável");
  }
  // Manifesto: secções do jogo são intencionais; catálogo CEO: filtrar escopo MG2
  return usarManifesto
    ? seleccionados
    : filtrarPrincipiosPorCoa(seleccionados, coa);
}

/**
 * Estágio 4 — Análise (LLM)
 */
export async function estagio4Analise(parcial, deps) {
  // CONSULTA: análise só a partir do snapshot (sem inventar via LLM)
  if (deps.pedidoConsultaResposta === true) {
    const snap = parcial?.snapshotSituacional || null;
    return trimStr(
      comporAnaliseConsultaDesdeSnapshot(snap),
      "Consulta situacional sem lastro — lacunas não inventadas."
    );
  }

  let schemaHint = "{ analise: string }";
  if (obterAutoanaliseActiva()) {
    schemaHint +=
      " AUTOANÁLISE — OBJETO ÚNICO E OBRIGATÓRIO: contexto.ultimaRespostaCeo." +
      " O campo 'analise' deve avaliar exclusivamente essa resposta: (1) o que acertou; (2) onde errou; (3) lacunas; (4) inconsistências; (5) como a resposta poderia ser melhorada." +
      " contexto.diagnostico.objetivoReal e contexto.diagnostico.problemaNegocio são SOMENTE contexto de referência — É PROIBIDO tratá-los como o objeto da nova análise ou reanalisar o dilema/problema original neles." +
      " É PROIBIDO no campo 'analise': 'Recomendação:', 'Decisão:', escolher opções como A/B, aprovar/rejeitar/adiar como novo veredicto, definir próximo passo prescritivo ou produzir novo julgamento do problema original." +
      " A resposta deve ser uma crítica de contexto.ultimaRespostaCeo, e não uma nova solução para o problema.";
  }
  const bruto = await chamarComRetry(deps.chamarLlm, {
    estagio: "4_analise",
    schemaHint,
    contexto: comContextoNcs(parcial, deps.pacoteNcs)
  });
  return trimStr(bruto.analise, "Análise bloqueada — informação insuficiente.");
}

/**
 * Estágio 5a — Riscos (HIB)
 */
export async function estagio5aRiscos(parcial, deps) {
  const sinais = [];
  if ((parcial.lacunas || []).length) {
    sinais.push({ nivel: "alto", texto: "Lacunas materiais podem invalidar a decisão" });
  }
  const bruto = await chamarComRetry(deps.chamarLlm, {
    estagio: "5a_riscos",
    schemaHint: "{ riscos: [{ nivel, texto, mitigacao? }] }",
    contexto: comContextoNcs({ ...parcial, sinais }, deps.pacoteNcs)
  });
  const lista = Array.isArray(bruto.riscos) ? bruto.riscos : [];
  const riscos = lista
    .map((r) => ({
      nivel: NivelRisco.includes(r.nivel) ? r.nivel : "medio",
      texto: trimStr(r.texto),
      ...(r.mitigacao ? { mitigacao: trimStr(r.mitigacao) } : {})
    }))
    .filter((r) => r.texto);
  if (riscos.length === 0 && sinais.length) return sinais;
  return riscos;
}

/**
 * Estágio 5b — Oportunidades (LLM)
 */
export async function estagio5bOportunidades(parcial, deps) {
  const bruto = await chamarComRetry(deps.chamarLlm, {
    estagio: "5b_oportunidades",
    schemaHint: "{ oportunidades: [{ valor, texto, condicao? }] }",
    contexto: comContextoNcs(parcial, deps.pacoteNcs)
  });
  const lista = Array.isArray(bruto.oportunidades) ? bruto.oportunidades : [];
  return lista
    .map((o) => ({
      valor: ValorOportunidade.includes(o.valor) ? o.valor : "medio",
      texto: trimStr(o.texto),
      ...(o.condicao ? { condicao: trimStr(o.condicao) } : {})
    }))
    .filter((o) => o.texto);
}

/**
 * Estágio 6 — Decisão (LLM + enum DET)
 */
export async function estagio6Decisao(parcial, deps) {
  const schemaBase =
    "{ estado, recomendacao, alternativas[], justificativa }. " +
    "estado DEVE ser exatamente um de: aprovar | rejeitar | delegar | monitorar | solicitar_dados | adiar. " +
    'Proibido qualquer outro valor (incluindo "decisao"). ' +
    "tipoPedido no contexto NÃO é estado — não copiar tipoPedido para estado. " +
    "justificativa DEVE mencionar riscos, princípios ou oportunidades (ou declarar ausência).";

  let schemaHint = schemaHintEstagio6ComNcs(schemaBase, deps.pacoteNcs);
  if (deps.pedidoInfoGathering === true) {
    schemaHint += hintEstagio6InfoGathering();
  } else if (deps.pedidoConsultaResposta === true) {
    schemaHint += hintEstagio6ConsultaResposta();
  } else if (deps.pedidoAnaliseDeliberativa === true) {
    schemaHint += hintEstagio6AnaliseDeliberativa();
  }
  if (deps.pedidoDecisaoExplicita === true) {
    schemaHint += hintEstagio6DecisaoSobConflito();
  }

  const bruto = await chamarComRetry(deps.chamarLlm, {
    estagio: "6_decisao",
    schemaHint,
    contexto: comContextoNcs(parcial, deps.pacoteNcs)
  });

  let estado = bruto.estado;
  if (!EstadoDecisaoExecutiva.includes(estado)) {
    // saneamento: não propagar enum livre — forçar falha controlada via throw para retry/orquestrador
    const err = new Error(`Enum ilegal no estágio 6: ${String(estado)}`);
    err.codigo = "ENUM_ILEGAL";
    err.valor = estado;
    throw err;
  }

  if ((parcial.lacunas || []).length > 0 && estado !== "solicitar_dados" && deps.preferirSolicitarDados !== false) {
    // REQ-049: lacunas materiais → preferir solicitar_dados
    // C3: lacunas só COA/Painel + factos do turno não forçam solicitar_dados
    const factosUsados = parcial.dossier?.factosUsados;
    const temFactosTurno = temFactosMateriaisDoUtilizador(factosUsados);
    const lacunaMaterialAusente = (parcial.lacunas || []).some((l) => {
      if (temFactosTurno && ehLacunaInstitucionalCoaPainel(l)) {
        return false;
      }
      return /ausente|falt/i.test(String(l || ""));
    });
    if (parcial.shortCircuit || lacunaMaterialAusente) {
      // Decisão sob conflito: conflito ≠ lacuna; só forçar com facto bloqueante nomeado
      if (deps.pedidoDecisaoExplicita === true) {
        const bloqueante =
          parcial.shortCircuit === true ||
          temFatoBloqueanteNomeado({
            lacunas: parcial.lacunas,
            recomendacao: bruto.recomendacao
          });
        if (bloqueante) estado = "solicitar_dados";
      } else {
        estado = "solicitar_dados";
      }
    }
  }

  const justificativaBruta = trimStr(
    bruto.justificativa,
    (parcial.riscos || []).length
      ? `Decisão considerando riscos identificados e princípios aplicáveis.`
      : "Sem riscos materiais identificados; decisão com base nos princípios aplicados."
  );

  return {
    estado,
    recomendacao: trimStr(bruto.recomendacao, "Recomendação a esclarecer"),
    alternativas: asStringList(bruto.alternativas),
    justificativa: assegurarJustificativaV5(justificativaBruta, parcial)
  };
}

/**
 * Estágio 7 — Ação (DET no tipo + redação)
 */
export async function estagio7Acao(decisao, parcial, deps) {
  const preferirDespacho =
    deps.proibirDespacho === true
      ? false
      : decisao.estado === "delegar" ||
        Boolean(deps.preferirDespacho) ||
        /despach|fila|execut/i.test(decisao.recomendacao || "");

  // P1-2: pedido de análise não gera Job mesmo se o LLM insistir em delegar
  let estadoAcao = decisao.estado;
  if (
    deps.proibirDespacho === true &&
    (estadoAcao === "delegar" || preferirDespacho)
  ) {
    estadoAcao = /solicitar|dados|falt|lacuna/i.test(decisao.recomendacao || "")
      ? "solicitar_dados"
      : "monitorar";
  }

  const map = mapearTipoAcao(estadoAcao, {
    preferirDespacho:
      deps.proibirDespacho === true
        ? false
        : decisao.estado === "aprovar"
          ? preferirDespacho
          : false
  });

  let descricao = "";
  let job = null;

  if (map.tipo === "perguntar") {
    descricao = trimStr(
      (parcial.lacunas || [])[0] && `Perguntar: ${parcial.lacunas[0]}`,
      "Solicitar dados essenciais em falta"
    );
  } else if (map.exigeJob) {
    const bruto = await chamarComRetry(deps.chamarLlm, {
      estagio: "7_acao_job",
      schemaHint:
        '{ descricao, job: { titulo, descricao, prioridade?: "baixa"|"normal"|"alta" } }',
      contexto: comContextoNcs({ decisao, parcial }, deps.pacoteNcs)
    });
    descricao = trimStr(bruto.descricao, decisao.recomendacao);
    job = {
      titulo: trimStr(bruto.job?.titulo, trimStr(decisao.recomendacao, "Job deliberativo")),
      descricao: trimStr(bruto.job?.descricao, descricao),
      prioridade: normalizarPrioridadeJob(bruto.job?.prioridade)
    };
  } else {
    const bruto = await chamarComRetry(deps.chamarLlm, {
      estagio: "7_acao",
      schemaHint: "{ descricao }",
      contexto: comContextoNcs({ decisao, tipo: map.tipo }, deps.pacoteNcs)
    });
    descricao = trimStr(bruto.descricao, decisao.recomendacao);
  }

  return { tipo: map.tipo, descricao, job };
}

/**
 * C5 — reorientação explícita: handoff ao CTO + critério de pronto (ou eixo equivalente).
 * Detecção estrita: não dispara em pedidos genéricos sem esses marcadores.
 * @param {string} [texto]
 * @returns {boolean}
 */
export function ehReorientacaoExplicitaHandoffCto(texto) {
  const t = String(texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
  if (!t) return false;
  const marcaReorientacao =
    /\breorient/.test(t) ||
    /\bunic[ao]\s+tarefa\s+agora\b/.test(t) ||
    (/\bpare\b/.test(t) && /\btarefas?\b/.test(t));
  const handoff = /\bhandoff\b/.test(t);
  const eixo = /\bcto\b/.test(t) || /\bcriterio\s+de\s+pronto\b/.test(t);
  return marcaReorientacao && handoff && eixo;
}

/**
 * C5 — falha de pipeline/enum NÃO substitui orientação explícita de handoff.
 * @param {object} entrada
 * @param {string} motivo
 */
function montarRecuperacaoOrientacaoHandoff(entrada, motivo) {
  return {
    diagnostico: {
      objetivoReal: "Preparar handoff ao CTO com critério de pronto",
      problemaNegocio: "reorientação explícita do utilizador",
      natureza: "operacional"
    },
    enquadramento: {
      tipoPedido: "execucao",
      urgencia: "alta",
      escopo: "Handoff ao CTO — sem deliberar outdoor"
    },
    dossier: {
      resumoPainel:
        entrada.snapshotPainel?.resumo ||
        "Não utilizado nesta reorientação explícita",
      factosUsados: Array.isArray(entrada.factosOficiais)
        ? entrada.factosOficiais.slice()
        : [],
      fontes: ["utilizador"]
    },
    principiosAplicados: [
      "Respeito absoluto ao tempo do utilizador",
      "Ser transparente sobre limitações"
    ],
    analise:
      "Reorientação aceite: a única tarefa agora é preparar o handoff ao CTO com critério de pronto. " +
      "Não delibero o outdoor nem invento COA, Painel ou jobs.",
    riscos: [
      {
        nivel: "baixo",
        texto: "Perder o critério de pronto se o handoff for adiado"
      }
    ],
    oportunidades: [],
    decisaoExecutiva: {
      estado: "aprovar",
      recomendacao:
        "Preparar o handoff ao CTO com critério de pronto explícito; outdoor fica fora desta deliberação.",
      alternativas: [],
      justificativa:
        "Princípio Respeito absoluto ao tempo do utilizador: a orientação explícita de handoff prevalece sobre falha interna de pipeline/enum. Sem riscos materiais inventados além do atraso do critério de pronto."
    },
    acao: {
      tipo: "orientar",
      descricao:
        "Aceitar o handoff ao CTO: definir o critério de pronto e fechar o pacote de handoff. Sem deliberar outdoor.",
      job: null
    },
    lacunas: [],
    confianca: 0.7,
    _falhaControlada: true,
    _motivoFalha: motivo,
    _recuperacaoOrientacaoExplicita: true
  };
}

/**
 * Parecer de falha deliberativa controlada (REQ-049) — blocos mínimos válidos com stub aprendizado.
 * C5: se o turno já fixou reorientação explícita de handoff, preservar essa orientação
 * em vez de fechar com «Falha técnica» / solicitar_dados.
 */
export function montarFalhaControlada(entrada, motivo, lacunas = []) {
  const entradaSafe = entrada && typeof entrada === "object" ? entrada : { mensagem: "" };
  if (ehReorientacaoExplicitaHandoffCto(entradaSafe.mensagem)) {
    return montarRecuperacaoOrientacaoHandoff(entradaSafe, motivo);
  }

  const lac = lacunas.length ? lacunas.slice() : ["Falha técnica no raciocínio"];
  const solicitar = lac.length > 0;
  const estado = solicitar ? "solicitar_dados" : "adiar";
  return {
    diagnostico: {
      objetivoReal: trimStr(entradaSafe.mensagem, "deliberação interrompida"),
      problemaNegocio: "falha no pipeline de raciocínio",
      natureza: "operacional"
    },
    enquadramento: {
      tipoPedido: "ambiguo",
      urgencia: "media",
      escopo: "Recuperação de falha deliberativa"
    },
    dossier: {
      resumoPainel: entradaSafe.snapshotPainel?.resumo || "Indisponível na falha",
      factosUsados: Array.isArray(entradaSafe.factosOficiais)
        ? entradaSafe.factosOficiais.slice()
        : [],
      fontes: ["utilizador"]
    },
    principiosAplicados: ["Ser transparente sobre limitações"],
    analise: `Falha deliberativa controlada: ${motivo}. Sem inventar factos.`,
    riscos: [{ nivel: "alto", texto: "Prosseguir sem raciocínio completo" }],
    oportunidades: [],
    decisaoExecutiva: {
      estado,
      recomendacao: solicitar
        ? "Solicitar dados ou nova tentativa após estabilizar o motor"
        : "Adiar deliberação até o motor estar disponível",
      alternativas: ["Repetir deliberação", "Usar fluxo determinístico do Núcleo"],
      justificativa:
        "Sem riscos materiais adicionais além da falha técnica; princípio Ser transparente sobre limitações exige não fingir deliberação."
    },
    acao: {
      tipo: solicitar ? "perguntar" : "aguardar",
      descricao: solicitar
        ? `Informar limitação e pedir: ${lac[0]}`
        : "Aguardar disponibilidade do MRE",
      job: null
    },
    lacunas: lac,
    confianca: 0.2,
    _falhaControlada: true,
    _motivoFalha: motivo
  };
}
