/**
 * Context Governor — contratos e constantes (REQ-093 / ARQ-093 / IMP-093 M1).
 */

/** @typedef {'autorizado_integral'|'autorizado_apos_isolamento'|'bloqueado_contaminacao'|'bloqueado_insuficiencia'|'bloqueado_esclarecimento'|'bloqueado_violacao_invariante'} EstadoCg */

export const ESTADOS_CG = Object.freeze({
  AUTORIZADO_INTEGRAL: "autorizado_integral",
  AUTORIZADO_APOS_ISOLAMENTO: "autorizado_apos_isolamento",
  BLOQUEADO_CONTAMINACAO: "bloqueado_contaminacao",
  BLOQUEADO_INSUFICIENCIA: "bloqueado_insuficiencia",
  BLOQUEADO_ESCLARECIMENTO: "bloqueado_esclarecimento",
  BLOQUEADO_VIOLACAO_INVARIANTE: "bloqueado_violacao_invariante"
});

/** Precedência operacional (REQ-093 §4) — índice menor = mais grave. */
export const PRECEDENCIA_ESTADOS = Object.freeze([
  ESTADOS_CG.BLOQUEADO_VIOLACAO_INVARIANTE,
  ESTADOS_CG.BLOQUEADO_CONTAMINACAO,
  ESTADOS_CG.BLOQUEADO_ESCLARECIMENTO,
  ESTADOS_CG.BLOQUEADO_INSUFICIENCIA,
  ESTADOS_CG.AUTORIZADO_APOS_ISOLAMENTO,
  ESTADOS_CG.AUTORIZADO_INTEGRAL
]);

export const FONTES_CG = Object.freeze({
  TURNO_ATUAL: "turno_atual",
  LFC_ACTIVOS: "lfc_activos",
  CSC: "csc",
  HFC_CONTINUIDADE: "hfc_continuidade",
  HFC_PROVA: "hfc_prova",
  MO_CONSULTA: "mo_consulta",
  DIC: "dic",
  BRIEFING_OFICIAL: "briefing_oficial",
  CONSCIENCIA_OPS: "consciencia_ops",
  /** Mandato/payload interno de estágio MRE (actos `mre:*` apenas). */
  MRE_CONTRATO: "mre_contrato",
  NAO_DECLARADA: "nao_declarada",
  NAO_ETIQUETADO: "nao_etiquetado"
});

export const USOS_CG = Object.freeze({
  FACTO: "facto",
  CONTINUIDADE: "continuidade",
  PROVA: "prova",
  MANDATO_PROMPT: "mandato_prompt",
  OBJECTO: "objecto",
  /** Alegação factual do utilizador sem lastro no COA/caso activo — ≠ facto autorizado. */
  ALEGACAO_FACTUAL: "alegacao_factual"
});

export const CODIGOS_VIOLACAO = Object.freeze({
  V1_COA: "V1_COA",
  V2_CASO: "V2_CASO",
  V3_FONTE: "V3_FONTE",
  V4_ESTRANHO: "V4_ESTRANHO",
  V5_INSUF: "V5_INSUF",
  INV_BYPASS: "INV_BYPASS",
  INV_INFERENCIA: "INV_INFERENCIA"
});

export const MODO_SOMBRA = "sombra";
export const MODO_ENFORCE = "enforce";

/** Tipo Trilha — extensão aditiva IMP-093 M1. */
export const TIPO_CG_AUTORIZACAO = "cg.autorizacao";

/**
 * @typedef {object} FragmentoContexto
 * @property {string} id
 * @property {string} [papel]
 * @property {string} [texto]
 * @property {unknown} [payload]
 * @property {string|null} [coaId]
 * @property {string|null} [casoId]
 * @property {string} fonte
 * @property {string} [uso]
 */

/**
 * @typedef {object} RemocaoFragmento
 * @property {string} fragmentoId
 * @property {string} [fonte]
 * @property {string} motivo
 * @property {string} codigo
 */

/**
 * @typedef {object} PedidoGovernancaContexto
 * @property {{ id: string, nome?: string }|null} [coaAtivo]
 * @property {{ casoId: string, titulo?: string }|null} [casoAtivo]
 * @property {string|null} [objetivoOuAssuntoTurno]
 * @property {string[]} [fontesLastroAutorizadas]
 * @property {object} conteudoCandidato
 * @property {string} actoChamada
 * @property {object} [regimeEspecial]
 * @property {object} [metaAuditoria]
 * @property {string} [modo]
 */

/**
 * @typedef {object} ResultadoGovernancaContexto
 * @property {EstadoCg} estado
 * @property {boolean} autorizado
 * @property {object|null} pacoteAutorizado
 * @property {RemocaoFragmento[]} remocoes
 * @property {{ codigo: string, mensagem: string }} motivo
 * @property {boolean} exigeEsclarecimento
 * @property {boolean} declaraInsuficienciaLastro
 * @property {string[]} violacoes
 * @property {string|null} [auditoriaRef]
 * @property {boolean} [teriaBloqueado]
 * @property {RemocaoFragmento[]} [remocoesHipoteticas]
 */
