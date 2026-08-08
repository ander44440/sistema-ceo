/**
 * IMP-070 B2 / REQ-073 — Limites de admissão da Camada de Conhecimento.
 * Avalia se um candidato pode ser admitido no Acervo Oficial.
 * Fora de escopo B2: governação/alçadas (REQ-074), Porta EIC (REQ-072),
 * actualização/versionamento (REQ-071), Fonte Oficial (REQ-070 — já homologado).
 */

/** Tipos lógicos admitidos (ARQ-031 D4 / limites 07/08). */
export const TIPOS_LOGICOS_ADMITIDOS = Object.freeze([
  "identidade_contexto",
  "objectivo_foco_janela",
  "regra_dominio",
  "padrao_pratica",
  "restricao_dor_activa",
  "fronteira",
  "fora_de_escopo",
  "lacuna_declarada",
  "lastro_estado_curado"
]);

/** Categorias excluídas (não são item de conhecimento da Camada). */
export const CATEGORIAS_EXCLUIDAS = Object.freeze([
  "cap05_historico_pontual",
  "norma_ou_adr_como_knw",
  "conceito_cnc",
  "cap06_competencia_agente",
  "fila_ops_jobs_gates",
  "sessao_volatil",
  "codigo_oficina_mg2",
  "prompt_espelho_fonte",
  "parecer_turno_sem_elevacao"
]);

/** Proibições absolutas de admissão. */
export const PROIBICOES_ABSOLUTAS = Object.freeze([
  "engenharia_ou_sync_repo_jogo",
  "segredos",
  "acto_bruto_sem_elevacao",
  "hipotese_modelo_sem_governanca",
  "conteudo_sem_origem",
  "personalidade_prompt_cargo"
]);

/**
 * @typedef {object} CandidatoAdmissao
 * @property {string} [id]
 * @property {string} [conteudo]
 * @property {string} [tipoLogico] — um de TIPOS_LOGICOS_ADMITIDOS
 * @property {boolean} [reutilizavel]
 * @property {boolean} [independenteDeDecisaoEspecifica]
 * @property {boolean} [patrimonioCeo]
 * @property {string} [origem] — rastreável
 * @property {string} [categoriaExcluida] — se preenchida, força recusa CA-073-3
 * @property {string} [proibicaoAbsoluta] — se preenchida, força recusa CA-073-4
 * @property {string[]} [referenciasExternas] — IDs (REQ/ADR/CNC/decisão) — permitidas
 * @property {boolean} [absorveArtefactoReferenciado] — true = recusa CA-073-5
 * @property {boolean} [dumpLiveEstado] — lastro não curado
 */

/**
 * @typedef {object} ResultadoAdmissao
 * @property {boolean} ok
 * @property {string[]} motivosRecusa
 * @property {string|null} tipoLogico
 * @property {ReadonlyArray<string>} referenciasExternas
 */

/**
 * Avalia admissão ao Acervo (limites apenas — não publica, não homologa).
 * @param {CandidatoAdmissao} candidato
 * @returns {ResultadoAdmissao}
 */
export function avaliarAdmissao(candidato = {}) {
  /** @type {string[]} */
  const motivos = [];
  const refs = Array.isArray(candidato.referenciasExternas)
    ? candidato.referenciasExternas.map((r) => String(r).trim()).filter(Boolean)
    : [];

  // CA-073-4 — proibições absolutas (primeiro)
  if (candidato.proibicaoAbsoluta) {
    const p = String(candidato.proibicaoAbsoluta);
    if (PROIBICOES_ABSOLUTAS.includes(p)) {
      motivos.push(`proibicao_absoluta:${p}`);
    } else {
      motivos.push(`proibicao_absoluta_desconhecida:${p}`);
    }
  }
  if (detectarProibicaoNoConteudo(candidato)) {
    const det = detectarProibicaoNoConteudo(candidato);
    if (det) motivos.push(`proibicao_absoluta:${det}`);
  }

  // CA-073-3 — categorias excluídas
  if (candidato.categoriaExcluida) {
    const c = String(candidato.categoriaExcluida);
    if (CATEGORIAS_EXCLUIDAS.includes(c)) {
      motivos.push(`categoria_excluida:${c}`);
    } else {
      motivos.push(`categoria_excluida_desconhecida:${c}`);
    }
  }

  // CA-073-1 — CNC-002 + património + origem
  if (candidato.reutilizavel !== true) {
    motivos.push("falta_reutilizavel_cnc002");
  }
  if (candidato.independenteDeDecisaoEspecifica !== true) {
    motivos.push("falta_independente_decisao_cnc002");
  }
  if (candidato.patrimonioCeo !== true) {
    motivos.push("nao_patrimonio_ceo");
  }
  const origem = String(candidato.origem || "").trim();
  if (!origem) {
    motivos.push("conteudo_sem_origem");
  }

  // CA-073-2 — tipo lógico
  const tipo = String(candidato.tipoLogico || "").trim();
  if (!tipo) {
    motivos.push("tipo_logico_ausente");
  } else if (!TIPOS_LOGICOS_ADMITIDOS.includes(tipo)) {
    motivos.push(`tipo_logico_invalido:${tipo}`);
  } else if (tipo === "lastro_estado_curado" && candidato.dumpLiveEstado === true) {
    motivos.push("lastro_estado_nao_curado_dump_live");
  }

  // Conteúdo mínimo
  if (!String(candidato.conteudo || "").trim()) {
    motivos.push("conteudo_vazio");
  }

  // CA-073-5 — referências ok; absorção não
  if (candidato.absorveArtefactoReferenciado === true) {
    motivos.push("absorcao_artefacto_referenciado_proibida");
  }

  const unicos = [...new Set(motivos)];
  return Object.freeze({
    ok: unicos.length === 0,
    motivosRecusa: Object.freeze(unicos),
    tipoLogico: tipo && TIPOS_LOGICOS_ADMITIDOS.includes(tipo) ? tipo : null,
    referenciasExternas: Object.freeze(refs)
  });
}

/**
 * @param {CandidatoAdmissao} c
 * @returns {string|null}
 */
function detectarProibicaoNoConteudo(c) {
  const t = `${c.conteudo || ""} ${c.origem || ""}`.toLowerCase();
  if (/api[_-]?key|password|secret|token\s*[:=]|bearer\s+[a-z0-9]/i.test(t)) {
    return "segredos";
  }
  if (
    /sync\s+(do\s+)?repo|importar\s+(o\s+)?reposit[oó]rio|engenharia\s+do\s+mg2|three\.js\s+internals|node_modules\s+do\s+jogo/i.test(
      t
    )
  ) {
    return "engenharia_ou_sync_repo_jogo";
  }
  if (/hip[oó]tese\s+do\s+modelo|alucina[cç][aã]o\s+llm|sem\s+governa[cç][aã]o/i.test(t)) {
    return "hipotese_modelo_sem_governanca";
  }
  if (
    /constitui[cç][aã]o\s+do\s+cargo|prompt\s+de\s+personalidade|governan[cç]a\s+llm\s+como\s+item/i.test(
      t
    )
  ) {
    return "personalidade_prompt_cargo";
  }
  return null;
}

/**
 * Atalho: candidato claramente inadmissível?
 * @param {CandidatoAdmissao} candidato
 */
export function recusarAdmissao(candidato) {
  return !avaliarAdmissao(candidato).ok;
}
