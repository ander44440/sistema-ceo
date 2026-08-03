/**
 * Validador determinístico do ParecerExecutivo (REQ-048 V1–V6).
 * Sem LLM. Interface: validar(parecer) → { ok, violacoes[] }
 */

import {
  EstadoDecisaoExecutiva,
  FonteFacto,
  NaturezaInteracao,
  NivelRisco,
  PrioridadeJob,
  TipoAcaoOperacional,
  TipoPedido,
  Urgencia,
  ValorOportunidade
} from "./enums.js";

/**
 * @typedef {{ regra: string, caminho: string, mensagem: string }} Violacao
 * @typedef {{ ok: boolean, violacoes: Violacao[] }} ResultadoValidacao
 */

/**
 * @param {string} regra
 * @param {string} caminho
 * @param {string} mensagem
 * @returns {Violacao}
 */
function v(regra, caminho, mensagem) {
  return { regra, caminho, mensagem };
}

/**
 * @param {unknown} valor
 * @returns {boolean}
 */
function isPlainObject(valor) {
  return valor !== null && typeof valor === "object" && !Array.isArray(valor);
}

/**
 * @param {unknown} s
 * @returns {boolean}
 */
function nonEmptyString(s) {
  return typeof s === "string" && s.trim() !== "";
}

/**
 * @param {unknown} lista
 * @returns {boolean}
 */
function isStringArray(lista) {
  return Array.isArray(lista) && lista.every((x) => typeof x === "string");
}

/**
 * V5 — justificativa referencia princípio/risco/oportunidade ou declara ausência.
 * @param {object} parecer
 * @returns {boolean}
 */
function justificativaIntegra(parecer) {
  const j = String(parecer.decisaoExecutiva?.justificativa ?? "").toLowerCase();
  if (!j.trim()) return false;

  const ausencia =
    /sem riscos?\s+materiais/.test(j) ||
    /sem oportunidades?/.test(j) ||
    /aus[eê]ncia\s+(de\s+)?(riscos?|oportunidades?|princ[ií]pios?)/.test(j) ||
    /n[aã]o\s+h[aá]\s+(riscos?|oportunidades?|princ[ií]pios?)/.test(j) ||
    /nenhum\s+(risco|oportunidade|princ[ií]pio)/.test(j);

  if (ausencia) return true;

  const principios = Array.isArray(parecer.principiosAplicados)
    ? parecer.principiosAplicados
    : [];
  for (const p of principios) {
    if (typeof p === "string" && p.trim() && j.includes(p.trim().toLowerCase())) {
      return true;
    }
  }

  for (const r of parecer.riscos || []) {
    if (r?.texto && j.includes(String(r.texto).trim().toLowerCase())) return true;
    if (r?.nivel && j.includes(`risco ${r.nivel}`)) return true;
  }
  if (/(risco|riscos)/.test(j) && (parecer.riscos || []).length > 0) return true;

  for (const o of parecer.oportunidades || []) {
    if (o?.texto && j.includes(String(o.texto).trim().toLowerCase())) return true;
  }
  if (/(oportunidade|oportunidades)/.test(j) && (parecer.oportunidades || []).length > 0) {
    return true;
  }

  if (/(princ[ií]pio|constitui[cç][aã]o|governan[cç]a)/.test(j) && principios.length > 0) {
    return true;
  }

  return false;
}

/**
 * @param {unknown} parecer
 * @returns {ResultadoValidacao}
 */
export function validarParecerExecutivo(parecer) {
  /** @type {Violacao[]} */
  const violacoes = [];

  if (!isPlainObject(parecer)) {
    return {
      ok: false,
      violacoes: [v("V1", "$", "ParecerExecutivo deve ser um objeto")]
    };
  }

  // --- V1 forma / raiz ---
  if (!nonEmptyString(parecer.id)) {
    violacoes.push(v("V1", "id", "id obrigatório e não vazio"));
  }
  if (!nonEmptyString(parecer.criadoEm)) {
    violacoes.push(v("V1", "criadoEm", "criadoEm obrigatório (ISO 8601)"));
  }
  if (!nonEmptyString(parecer.versaoContrato)) {
    violacoes.push(v("V1", "versaoContrato", "versaoContrato obrigatória e não vazia"));
  }
  if (!("coaId" in parecer) || (parecer.coaId !== null && typeof parecer.coaId !== "string")) {
    violacoes.push(v("V1", "coaId", "coaId deve ser string ou null"));
  }
  if (typeof parecer.confianca !== "number" || Number.isNaN(parecer.confianca)) {
    violacoes.push(v("V1", "confianca", "confianca deve ser número"));
  } else if (parecer.confianca < 0 || parecer.confianca > 1) {
    violacoes.push(v("V1", "confianca", "confianca deve estar em [0, 1]"));
  }
  if (!isStringArray(parecer.lacunas)) {
    violacoes.push(v("V1", "lacunas", "lacunas deve ser lista de string"));
  }

  // diagnostico
  if (!isPlainObject(parecer.diagnostico)) {
    violacoes.push(v("V1", "diagnostico", "diagnostico obrigatório"));
  } else {
    const d = parecer.diagnostico;
    if (!nonEmptyString(d.objetivoReal)) {
      violacoes.push(v("V1", "diagnostico.objetivoReal", "objetivoReal obrigatório e não vazio"));
    }
    if (!nonEmptyString(d.problemaNegocio)) {
      violacoes.push(
        v("V1", "diagnostico.problemaNegocio", "problemaNegocio obrigatório e não vazio")
      );
    }
    if (!NaturezaInteracao.includes(d.natureza)) {
      violacoes.push(
        v("V1", "diagnostico.natureza", `natureza inválida: ${String(d.natureza)}`)
      );
    }
  }

  // enquadramento
  if (!isPlainObject(parecer.enquadramento)) {
    violacoes.push(v("V1", "enquadramento", "enquadramento obrigatório"));
  } else {
    const e = parecer.enquadramento;
    if (!TipoPedido.includes(e.tipoPedido)) {
      violacoes.push(
        v("V1", "enquadramento.tipoPedido", `tipoPedido inválido: ${String(e.tipoPedido)}`)
      );
    }
    if (!Urgencia.includes(e.urgencia)) {
      violacoes.push(
        v("V1", "enquadramento.urgencia", `urgencia inválida: ${String(e.urgencia)}`)
      );
    }
    if (!nonEmptyString(e.escopo)) {
      violacoes.push(v("V1", "enquadramento.escopo", "escopo obrigatório e não vazio"));
    }
  }

  // dossier
  if (!isPlainObject(parecer.dossier)) {
    violacoes.push(v("V1", "dossier", "dossier obrigatório"));
  } else {
    const dos = parecer.dossier;
    if (!nonEmptyString(dos.resumoPainel)) {
      violacoes.push(v("V1", "dossier.resumoPainel", "resumoPainel obrigatório e não vazio"));
    }
    if (!isStringArray(dos.factosUsados)) {
      violacoes.push(v("V1", "dossier.factosUsados", "factosUsados deve ser lista de string"));
    }
    if (dos.fontes !== undefined) {
      if (!Array.isArray(dos.fontes) || !dos.fontes.every((f) => FonteFacto.includes(f))) {
        violacoes.push(v("V1", "dossier.fontes", "fontes deve ser lista de FonteFacto"));
      }
    }
  }

  if (!isStringArray(parecer.principiosAplicados)) {
    violacoes.push(v("V1", "principiosAplicados", "principiosAplicados deve ser lista de string"));
  }

  if (!nonEmptyString(parecer.analise)) {
    violacoes.push(v("V1", "analise", "analise obrigatória e não vazia"));
  }

  // --- V2 riscos / oportunidades ---
  if (!Array.isArray(parecer.riscos)) {
    violacoes.push(v("V2", "riscos", "riscos deve ser lista"));
  } else {
    parecer.riscos.forEach((r, i) => {
      if (!isPlainObject(r)) {
        violacoes.push(v("V2", `riscos[${i}]`, "item deve ser objeto"));
        return;
      }
      if (!NivelRisco.includes(r.nivel)) {
        violacoes.push(v("V2", `riscos[${i}].nivel`, `nivel inválido: ${String(r.nivel)}`));
      }
      if (!nonEmptyString(r.texto)) {
        violacoes.push(v("V2", `riscos[${i}].texto`, "texto obrigatório"));
      }
    });
  }

  if (!Array.isArray(parecer.oportunidades)) {
    violacoes.push(v("V2", "oportunidades", "oportunidades deve ser lista"));
  } else {
    parecer.oportunidades.forEach((o, i) => {
      if (!isPlainObject(o)) {
        violacoes.push(v("V2", `oportunidades[${i}]`, "item deve ser objeto"));
        return;
      }
      if (!ValorOportunidade.includes(o.valor)) {
        violacoes.push(
          v("V2", `oportunidades[${i}].valor`, `valor inválido: ${String(o.valor)}`)
        );
      }
      if (!nonEmptyString(o.texto)) {
        violacoes.push(v("V2", `oportunidades[${i}].texto`, "texto obrigatório"));
      }
    });
  }

  if (Array.isArray(parecer.riscos) && Array.isArray(parecer.oportunidades)) {
    const textosRisco = new Set(
      parecer.riscos.map((r) => String(r?.texto ?? "").trim().toLowerCase()).filter(Boolean)
    );
    for (const o of parecer.oportunidades) {
      const t = String(o?.texto ?? "").trim().toLowerCase();
      if (t && textosRisco.has(t)) {
        violacoes.push(
          v(
            "V2",
            "oportunidades",
            "mesmo enunciado não deve ser duplicado como risco e oportunidade sem distinção"
          )
        );
        break;
      }
    }
  }

  // decisaoExecutiva
  if (!isPlainObject(parecer.decisaoExecutiva)) {
    violacoes.push(v("V1", "decisaoExecutiva", "decisaoExecutiva obrigatória"));
  } else {
    const de = parecer.decisaoExecutiva;
    if (!EstadoDecisaoExecutiva.includes(de.estado)) {
      violacoes.push(
        v("V1", "decisaoExecutiva.estado", `estado inválido ou livre: ${String(de.estado)}`)
      );
    }
    if (!nonEmptyString(de.recomendacao)) {
      violacoes.push(
        v("V1", "decisaoExecutiva.recomendacao", "recomendacao obrigatória e não vazia")
      );
    }
    if (!isStringArray(de.alternativas)) {
      violacoes.push(
        v("V1", "decisaoExecutiva.alternativas", "alternativas deve ser lista de string")
      );
    }
    if (!nonEmptyString(de.justificativa)) {
      violacoes.push(
        v("V1", "decisaoExecutiva.justificativa", "justificativa obrigatória e não vazia")
      );
    }
  }

  // acao
  if (!isPlainObject(parecer.acao)) {
    violacoes.push(v("V1", "acao", "acao obrigatória"));
  } else {
    const a = parecer.acao;
    if (!TipoAcaoOperacional.includes(a.tipo)) {
      violacoes.push(v("V1", "acao.tipo", `tipo inválido: ${String(a.tipo)}`));
    }
    if (!nonEmptyString(a.descricao)) {
      violacoes.push(v("V1", "acao.descricao", "descricao obrigatória e não vazia"));
    }
    if (!("job" in a)) {
      violacoes.push(v("V1", "acao.job", "job obrigatório (objeto ou null)"));
    } else if (a.job !== null) {
      if (!isPlainObject(a.job)) {
        violacoes.push(v("V1", "acao.job", "job deve ser objeto ou null"));
      } else {
        if (!nonEmptyString(a.job.titulo)) {
          violacoes.push(v("V1", "acao.job.titulo", "titulo obrigatório quando job ≠ null"));
        }
        if (!nonEmptyString(a.job.descricao)) {
          violacoes.push(v("V1", "acao.job.descricao", "descricao obrigatória quando job ≠ null"));
        }
        if (
          a.job.prioridade !== undefined &&
          !PrioridadeJob.includes(a.job.prioridade)
        ) {
          violacoes.push(
            v("V1", "acao.job.prioridade", `prioridade inválida: ${String(a.job.prioridade)}`)
          );
        }
      }
    }
  }

  // aprendizado
  if (!isPlainObject(parecer.aprendizado)) {
    violacoes.push(v("V1", "aprendizado", "aprendizado obrigatório"));
  } else {
    const ap = parecer.aprendizado;
    for (const campo of ["registrarMemoria", "criarPrecedente", "atualizarPrincipios"]) {
      if (typeof ap[campo] !== "boolean") {
        violacoes.push(v("V1", `aprendizado.${campo}`, `${campo} deve ser boolean`));
      }
    }
    // V4
    if (ap.atualizarPrincipios === true) {
      if (!nonEmptyString(ap.propostaPrincipio)) {
        violacoes.push(
          v(
            "V4",
            "aprendizado.propostaPrincipio",
            "propostaPrincipio obrigatória e não vazia se atualizarPrincipios = true"
          )
        );
      }
    }
  }

  // --- V3 decisão ↔ ação ---
  const estado = parecer.decisaoExecutiva?.estado;
  const tipo = parecer.acao?.tipo;
  const job = parecer.acao?.job;
  const lacunas = parecer.lacunas;

  if (EstadoDecisaoExecutiva.includes(estado) && TipoAcaoOperacional.includes(tipo)) {
    if (estado === "solicitar_dados") {
      if (tipo !== "perguntar") {
        violacoes.push(
          v("V3", "acao.tipo", "solicitar_dados exige acao.tipo = perguntar")
        );
      }
      if (!Array.isArray(lacunas) || lacunas.length < 1) {
        violacoes.push(
          v("V3", "lacunas", "solicitar_dados exige pelo menos uma lacuna")
        );
      }
    }
    if (estado === "delegar") {
      if (tipo !== "despachar") {
        violacoes.push(v("V3", "acao.tipo", "delegar exige acao.tipo = despachar"));
      }
      if (
        job === null ||
        !isPlainObject(job) ||
        !nonEmptyString(job?.titulo) ||
        !nonEmptyString(job?.descricao)
      ) {
        violacoes.push(
          v("V3", "acao.job", "delegar exige job com titulo e descricao não vazios")
        );
      }
    }
    if (estado === "monitorar" || estado === "adiar") {
      if (tipo !== "aguardar") {
        violacoes.push(
          v("V3", "acao.tipo", `${estado} exige acao.tipo = aguardar`)
        );
      }
    }
    if (estado === "rejeitar") {
      if (!["orientar", "registar", "aguardar"].includes(tipo)) {
        violacoes.push(
          v("V3", "acao.tipo", "rejeitar não permite despachar (nem perguntar)")
        );
      }
    }
    if (estado === "aprovar") {
      if (!["orientar", "registar", "despachar"].includes(tipo)) {
        violacoes.push(
          v("V3", "acao.tipo", "aprovar exige orientar | registar | despachar")
        );
      }
      if (tipo === "despachar") {
        if (
          job === null ||
          !isPlainObject(job) ||
          !nonEmptyString(job?.titulo) ||
          !nonEmptyString(job?.descricao)
        ) {
          violacoes.push(
            v("V3", "acao.job", "aprovar + despachar exige job com titulo e descricao")
          );
        }
      }
    }
  }

  // --- V5 ---
  if (
    isPlainObject(parecer.decisaoExecutiva) &&
    nonEmptyString(parecer.decisaoExecutiva.justificativa) &&
    !justificativaIntegra(parecer)
  ) {
    violacoes.push(
      v(
        "V5",
        "decisaoExecutiva.justificativa",
        "justificativa deve referenciar princípios, riscos ou oportunidades, ou declarar ausência"
      )
    );
  }

  // --- V6 ---
  if (parecer.metadados !== undefined && !isPlainObject(parecer.metadados)) {
    violacoes.push(v("V6", "metadados", "metadados, se presente, deve ser objeto"));
  }
  // chaves desconhecidas em metadados não geram violação (V6)

  return { ok: violacoes.length === 0, violacoes };
}

export default validarParecerExecutivo;
