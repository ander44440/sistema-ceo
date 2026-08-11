/**
 * C6 — Políticas NCS por estágio (IMP-020 B3 / REQ-052 R4–R7).
 * Só leitura do Pacote; não altera topologia 0–8.
 */

import { ehFatoBloqueanteNomeado } from "../politicaDecisaoSobConflito.js";

/**
 * @param {object|null|undefined} pacoteNcs
 * @returns {boolean}
 */
export function politicaInventarioNaoObrigatorio(pacoteNcs) {
  if (!pacoteNcs) return false;
  return (
    pacoteNcs.politicaLacunas === "inventario_nao_obrigatorio" ||
    pacoteNcs.politicaLacunas === "nao_aplica_escolha" ||
    pacoteNcs.naturezaCognitiva === "metodo_de_decisao" ||
    pacoteNcs.naturezaCognitiva === "planejamento" ||
    pacoteNcs.naturezaCognitiva === "explicacao"
  );
}

/**
 * Mensagem já traz alternativas/itens concretos suficientes para escolha.
 * @param {string} mensagem
 * @returns {boolean}
 */
export function mensagemTemItensConcretos(mensagem) {
  const t = String(mensagem || "").toLowerCase();
  if (/\bentre\s+.+\s+e\s+.+/.test(t)) return true;
  if (/\bqual\s+d(as|estes|estas)\b/.test(t) && /\b(1[).:]|2[).:]|•|- )/.test(t)) {
    return true;
  }
  if (/\b(1[).:]|2[).:]).+\b(3[).:]|2[).:])/.test(t)) return true;
  if (/\b(ou|vs\.?|versus)\b/.test(t) && /\b(primeiro|escolher|devo|prioriz)\b/.test(t)) {
    return true;
  }
  return false;
}

/**
 * Short-circuit DET — respeita NCS (não short-circuit por inventário em método).
 * @param {object} entrada
 * @param {string[]} lacunasAcc
 * @param {object} enquadramento
 * @param {object|null} pacoteNcs
 * @returns {boolean}
 */
export function calcularShortCircuitNcs(entrada, lacunasAcc, enquadramento, pacoteNcs) {
  if (Boolean(entrada?.shortCircuit)) return true;

  // Decisão operacional sem itens materiais → short-circuit (REQ-049 / TN-08)
  if (
    pacoteNcs?.exigeItensConcretos &&
    lacunasAcc.some((l) => /itens|alternativas concretas/i.test(l))
  ) {
    return true;
  }

  if (politicaInventarioNaoObrigatorio(pacoteNcs)) {
    // Método/plano/explicação: só short-circuit por ambiguidade explícita
    return lacunasAcc.length > 0 && enquadramento?.tipoPedido === "ambiguo";
  }

  // Baseline REQ-049 / comportamento pré-NCS
  return (
    lacunasAcc.length > 0 &&
    (enquadramento?.tipoPedido === "ambiguo" ||
      !entrada?.coaId ||
      !entrada?.snapshotPainel)
  );
}

/**
 * Lacuna de inventário só para decisão operacional sem itens.
 * @param {object} entrada
 * @param {string[]} lacunasAcc
 * @param {object|null} pacoteNcs
 */
export function aplicarPoliticaDossierNcs(entrada, lacunasAcc, pacoteNcs) {
  if (!pacoteNcs?.exigeItensConcretos) return;
  const factos = Array.isArray(entrada.factosOficiais) ? entrada.factosOficiais : [];
  if (factos.length === 0 && !mensagemTemItensConcretos(entrada.mensagem)) {
    if (!lacunasAcc.some((l) => /itens|alternativas concretas/i.test(l))) {
      lacunasAcc.push("Itens/alternativas concretas ausentes");
    }
  }
}

/**
 * Contexto LLM: incluir NCS em leitura (proibido pedir redefinição da natureza).
 * @param {object} contexto
 * @param {object|null} pacoteNcs
 * @returns {object}
 */
export function comContextoNcs(contexto, pacoteNcs) {
  if (!pacoteNcs) return contexto;
  return {
    ...contexto,
    pacoteNcs: {
      naturezaCognitiva: pacoteNcs.naturezaCognitiva,
      modoEsperadoEstagio6: pacoteNcs.modoEsperadoEstagio6,
      politicaLacunas: pacoteNcs.politicaLacunas,
      exigeItensConcretos: pacoteNcs.exigeItensConcretos,
      instrucao:
        "pacoteNcs é só leitura — NÃO altere naturezaCognitiva; adapte o raciocínio ao modo."
    }
  };
}

/**
 * Schema hint estágio 6 enriquecido pela NCS.
 * @param {string} base
 * @param {object|null} pacoteNcs
 * @returns {string}
 */
export function schemaHintEstagio6ComNcs(base, pacoteNcs) {
  if (!pacoteNcs) return base;
  const modo = pacoteNcs.modoEsperadoEstagio6;
  const nat = pacoteNcs.naturezaCognitiva;
  let extra = ` naturezaCognitiva=${nat}; modoEsperadoEstagio6=${modo}.`;
  if (nat === "metodo_de_decisao") {
    extra +=
      " Entregue critérios/método (preferir aprovar+orientação). Proibido solicitar_dados só por falta de inventário de demandas.";
  } else if (nat === "decisao_operacional") {
    extra +=
      " Escolha entre itens concretos; solicitar_dados só se faltar dado material à escolha.";
  } else if (nat === "planejamento") {
    extra += " Estruture plano/passos; não reduza a escolha A/B sem pedido explícito.";
  } else if (nat === "explicacao") {
    extra += " Justifique/esclareça; não reabra escolha operacional.";
  }
  return base + extra;
}

/**
 * Pós-decisão DET: R4 — método não fica bloqueado só por inventário.
 * @param {object} decisao
 * @param {string[]} lacunasAcc
 * @param {object|null} pacoteNcs
 * @returns {object}
 */
export function aplicarPoliticaDecisaoNcs(decisao, lacunasAcc, pacoteNcs) {
  if (!pacoteNcs || !decisao) return decisao;
  if (pacoteNcs.naturezaCognitiva !== "metodo_de_decisao") return decisao;

  const lacunasInventario = (lacunasAcc || []).filter((l) =>
    /itens|alternativas concretas|invent[aá]rio|demandas?\s+n[aã]o\s+list/i.test(l)
  );
  const soInventario =
    lacunasAcc.length === 0 ||
    (lacunasAcc.length > 0 && lacunasInventario.length === lacunasAcc.length);

  if (decisao.estado === "solicitar_dados" && soInventario) {
    return {
      ...decisao,
      estado: "aprovar",
      recomendacao:
        decisao.recomendacao && !/solicitar|pedir dados/i.test(decisao.recomendacao)
          ? decisao.recomendacao
          : "Aplicar quadro de priorização por urgência, impacto e tempo do patrocinador (ADR-015)",
      justificativa:
        `${decisao.justificativa || ""} Natureza metodo_de_decisao (R4): ausência de inventário de demandas não bloqueia entrega de critérios.`.trim()
    };
  }
  return decisao;
}

/** Lacuna genérica de fallback — só quando não há facto bloqueante nomeado. */
export const LACUNA_GENERICA_ESSENCIAL =
  "Informação essencial não especificada";

/**
 * @param {string} [texto]
 * @returns {boolean}
 */
export function ehLacunaGenericaEssencial(texto) {
  return (
    String(texto || "").trim().toLowerCase() ===
    LACUNA_GENERICA_ESSENCIAL.toLowerCase()
  );
}

/**
 * Extrai lacuna nominal a partir da recomendação/justificativa (ex.: orçamento Q3).
 * @param {string} [recomendacao]
 * @param {string} [justificativa]
 * @returns {string|null}
 */
export function derivarLacunaNomeadaDeRecomendacao(
  recomendacao,
  justificativa
) {
  const fontes = [recomendacao, justificativa]
    .map((s) => String(s || "").trim())
    .filter(Boolean);
  if (!fontes.length) return null;

  const blob = fontes.join(" ");
  // Só deriva se o texto nomeia um facto bloqueante (não conflito genérico)
  if (!ehFatoBloqueanteNomeado(blob)) return null;

  const m =
    blob.match(/or[cç]amento aprovado do Q\d+/i) ||
    blob.match(
      /(?:falta\s+(?:o\s+|a\s+)?)?(or[cç]amento|budget)[^.;!?]{0,60}/i
    ) ||
    blob.match(
      /(?:falta\s+(?:o\s+|a\s+)?)?(prazo|deadline|data\s+limite)[^.;!?]{0,40}/i
    );
  if (m) {
    return String(m[0])
      .replace(/^(falta\s+(?:o\s+|a\s+)?)/i, "")
      .replace(/^(solicitar|pedir)\s+(o\s+|a\s+|um\s+|uma\s+)?/i, "")
      .trim();
  }

  // Fallback: limpar prefixo «Solicitar…» da recomendação
  const rec = String(recomendacao || "").trim();
  if (rec && ehFatoBloqueanteNomeado(rec)) {
    return rec
      .replace(/^solicitar\s+(o\s+|a\s+|um\s+|uma\s+)?/i, "")
      .replace(/\s+antes de fechar\.?$/i, "")
      .trim()
      .slice(0, 100);
  }
  return null;
}

/**
 * Pós-solicitar_dados: garantir lacuna; não acrescentar genérica se já
 * existir (ou for derivável) uma lacuna bloqueante nomeada.
 * @param {string} estado
 * @param {string[]} lacunasAcc
 * @param {object|null} pacoteNcs
 * @param {{ recomendacao?: string, justificativa?: string }} [opts]
 */
export function talvezInjetarLacunaSolicitarDados(
  estado,
  lacunasAcc,
  pacoteNcs,
  opts = {}
) {
  if (estado !== "solicitar_dados") return;
  if (politicaInventarioNaoObrigatorio(pacoteNcs)) return;

  const reais = lacunasAcc.filter((l) => !ehLacunaGenericaEssencial(l));
  if (reais.length > 0) {
    // Manter só lacunas reais — remover genérica se coexistir
    lacunasAcc.length = 0;
    lacunasAcc.push(...reais);
    return;
  }

  const derivada = derivarLacunaNomeadaDeRecomendacao(
    opts.recomendacao,
    opts.justificativa
  );
  if (derivada) {
    lacunasAcc.length = 0;
    lacunasAcc.push(derivada);
    return;
  }

  if (lacunasAcc.some((l) => ehLacunaGenericaEssencial(l))) return;
  lacunasAcc.push(LACUNA_GENERICA_ESSENCIAL);
}
