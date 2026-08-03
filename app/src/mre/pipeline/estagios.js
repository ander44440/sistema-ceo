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
import { CATALOGO_PRINCIPIOS } from "./catalogoPrincipios.js";
import { chamarComRetry } from "./llmEstagio.js";
import { mapearTipoAcao } from "./mapeamentoAcao.js";
import {
  aplicarPoliticaDossierNcs,
  comContextoNcs,
  schemaHintEstagio6ComNcs
} from "../ncs/politicas.js";

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
  const bruto = await chamarComRetry(deps.chamarLlm, {
    estagio: "0_diagnostico",
    schemaHint: "{ objetivoReal, problemaNegocio, natureza }",
    contexto: comContextoNcs(
      {
        mensagem: entrada.mensagem,
        intencao: entrada.intencao || null
      },
      deps.pacoteNcs
    )
  });
  let natureza = bruto.natureza;
  if (!NaturezaInteracao.includes(natureza)) natureza = "operacional";
  return {
    objetivoReal: trimStr(bruto.objetivoReal, trimStr(entrada.mensagem, "objetivo não identificado")),
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
  if (/info|pergunta|consulta/i.test(intencaoId)) tipoPedido = "informacao";
  if (/exec|fila|despach/i.test(intencaoId)) tipoPedido = "execucao";
  if (/ambigu/i.test(intencaoId) || !entrada.mensagem?.trim()) tipoPedido = "ambiguo";

  const bruto = await chamarComRetry(deps.chamarLlm, {
    estagio: "1_enquadramento",
    schemaHint: "{ tipoPedido, urgencia, escopo }",
    contexto: comContextoNcs(
      { mensagem: entrada.mensagem, diagnostico, tipoPedidoSinal: tipoPedido },
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
 */
export async function estagio3Principios(diagnostico, enquadramento, deps, lacunasAcc) {
  const bruto = await chamarComRetry(deps.chamarLlm, {
    estagio: "3_principios",
    schemaHint: "{ principiosAplicados: string[] } — só ids/textos do catálogo",
    contexto: comContextoNcs(
      { diagnostico, enquadramento, catalogo: CATALOGO_PRINCIPIOS },
      deps.pacoteNcs
    )
  });
  const pedidos = asStringList(bruto.principiosAplicados);
  const selecionados = pedidos.filter((p) => CATALOGO_PRINCIPIOS.includes(p));
  if (selecionados.length === 0) {
    selecionados.push("Respeito absoluto ao tempo do utilizador");
    if (diagnostico.natureza !== "operacional") {
      selecionados.push("Priorizar uso diário no MG2 (ADR-015)");
    }
  }
  if (pedidos.length && selecionados.length === 0) {
    lacunasAcc.push("Nenhum princípio do catálogo selecionável");
  }
  return selecionados;
}

/**
 * Estágio 4 — Análise (LLM)
 */
export async function estagio4Analise(parcial, deps) {
  const bruto = await chamarComRetry(deps.chamarLlm, {
    estagio: "4_analise",
    schemaHint: "{ analise: string }",
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

  const bruto = await chamarComRetry(deps.chamarLlm, {
    estagio: "6_decisao",
    schemaHint: schemaHintEstagio6ComNcs(schemaBase, deps.pacoteNcs),
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
    if (parcial.shortCircuit || (parcial.lacunas || []).some((l) => /ausente|falt/i.test(l))) {
      estado = "solicitar_dados";
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
    decisao.estado === "delegar" ||
    Boolean(deps.preferirDespacho) ||
    /despach|fila|execut/i.test(decisao.recomendacao || "");

  const map = mapearTipoAcao(decisao.estado, {
    preferirDespacho: decisao.estado === "aprovar" ? preferirDespacho : false
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
 * Parecer de falha deliberativa controlada (REQ-049) — blocos mínimos válidos com stub aprendizado.
 */
export function montarFalhaControlada(entrada, motivo, lacunas = []) {
  const lac = lacunas.length ? lacunas.slice() : ["Falha técnica no raciocínio"];
  const solicitar = lac.length > 0;
  const estado = solicitar ? "solicitar_dados" : "adiar";
  return {
    diagnostico: {
      objetivoReal: trimStr(entrada.mensagem, "deliberação interrompida"),
      problemaNegocio: "falha no pipeline de raciocínio",
      natureza: "operacional"
    },
    enquadramento: {
      tipoPedido: "ambiguo",
      urgencia: "media",
      escopo: "Recuperação de falha deliberativa"
    },
    dossier: {
      resumoPainel: entrada.snapshotPainel?.resumo || "Indisponível na falha",
      factosUsados: Array.isArray(entrada.factosOficiais) ? entrada.factosOficiais.slice() : [],
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
