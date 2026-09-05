/**
 * Resolução de Precedência por Turno — V1
 * Fundação: único ponto explícito de autoridade entre decisores.
 * Não executa Gate/AD/C3/MRE — só declara quem vence e o que fica bloqueado.
 *
 * Precedência:
 * Gate → Pedido de Decisão → AD/CTO-003 (só objeto operacional)
 * → VCA/CSC → Classificador → Destino → Consciência/CN (só prosa)
 *
 * Invariante: CONSULTA ≠ DECISÃO ≠ AÇÃO ≠ DELEGAÇÃO
 */

export const AUTORIDADE = Object.freeze({
  GATE: "gate",
  PEDIDO_DECISAO: "pedido_decisao",
  AD_CTO003: "ad_cto003_operacional",
  VCA_CSC: "vca_csc",
  CLASSIFICADOR: "classificador",
  DESTINO: "destino",
  CONSCIENCIA_CN: "consciencia_cn"
});

export const TIPO_TURNO_PREC = Object.freeze({
  CONSULTA: "consulta",
  DECISAO: "decisao",
  ACAO: "acao",
  DELEGACAO: "delegacao",
  INDEFINIDO: "indefinido"
});

export const PRECEDENCIA_V1 = Object.freeze([
  AUTORIDADE.GATE,
  AUTORIDADE.PEDIDO_DECISAO,
  AUTORIDADE.AD_CTO003,
  AUTORIDADE.VCA_CSC,
  AUTORIDADE.CLASSIFICADOR,
  AUTORIDADE.DESTINO,
  AUTORIDADE.CONSCIENCIA_CN
]);

/** Destinos que o pós-processo nunca pode alterar. */
export const DESTINOS_BLOQUEADOS_POS = Object.freeze([
  "nucleo_mre",
  "resposta_leve",
  "motor_execucao",
  "capacidade_operacional",
  "clarificacao",
  "continuidade_gate",
  "autoridade_delegada"
]);

/**
 * @typedef {object} SinaisPrecedencia
 * @property {boolean} [gateContinuidade]
 * @property {boolean} [gateClarificacao]
 * @property {boolean} [pedidoDecisaoExplicita]
 * @property {boolean} [adActivacaoAck]
 * @property {boolean} [adOrdemExecucao]
 * @property {boolean} [cto003Candidato]
 * @property {boolean} [objetoOperacionalReal]
 * @property {boolean} [vcaClarificacao]
 * @property {boolean} [cscClarificacao]
 * @property {boolean} [pedidoSituacionalTrabalho]
 * @property {boolean} [panoramaEstadoGeral]
 * @property {string|null} [destinoClassificador]
 * @property {'pre_classificador'|'pos_classificador'|'pos_destino'} [fase]
 */

/**
 * Infere o tipo de turno (consulta/decisão/ação/delegação).
 * @param {SinaisPrecedencia} s
 */
export function inferirTipoTurnoPrecedencia(s = {}) {
  if (s.pedidoDecisaoExplicita) return TIPO_TURNO_PREC.DECISAO;
  if (
    (s.adOrdemExecucao || s.cto003Candidato) &&
    s.objetoOperacionalReal &&
    !s.pedidoSituacionalTrabalho &&
    !s.panoramaEstadoGeral
  ) {
    return TIPO_TURNO_PREC.ACAO;
  }
  if (s.adActivacaoAck && !s.pedidoDecisaoExplicita) {
    return TIPO_TURNO_PREC.DELEGACAO;
  }
  if (
    s.pedidoSituacionalTrabalho ||
    s.panoramaEstadoGeral ||
    s.destinoClassificador === "capacidade_operacional" ||
    s.destinoClassificador === "resposta_leve"
  ) {
    return TIPO_TURNO_PREC.CONSULTA;
  }
  if (s.destinoClassificador === "nucleo_mre") {
    return TIPO_TURNO_PREC.DECISAO;
  }
  if (s.destinoClassificador === "motor_execucao") {
    return TIPO_TURNO_PREC.ACAO;
  }
  return TIPO_TURNO_PREC.INDEFINIDO;
}

/**
 * Resolve autoridade e decisão permitida neste turno.
 * @param {SinaisPrecedencia} sinais
 */
export function resolverPrecedenciaTurno(sinais = {}) {
  const s = sinais || {};
  const tipoTurno = inferirTipoTurnoPrecedencia(s);
  const fase = s.fase || "pre_classificador";

  /** @type {string[]} */
  const bloqueados = [AUTORIDADE.CONSCIENCIA_CN];

  // 1) Gate
  if (s.gateContinuidade) {
    return Object.freeze({
      autoridade: AUTORIDADE.GATE,
      acao: "continuar_gate",
      destinoPermitido: "continuidade_gate",
      destinoFixo: true,
      tipoTurno,
      bloqueados: Object.freeze([
        ...bloqueados,
        AUTORIDADE.PEDIDO_DECISAO,
        AUTORIDADE.AD_CTO003,
        AUTORIDADE.VCA_CSC,
        AUTORIDADE.CLASSIFICADOR,
        AUTORIDADE.DESTINO
      ]),
      permiteAdAck: false,
      permiteAdExecucao: false,
      permiteCto003: false,
      forcarC2: false,
      forcarC4Panorama: false,
      razao: "V1: Gate de continuidade tem precedência máxima",
      fase,
      versao: "v1"
    });
  }
  if (s.gateClarificacao) {
    return Object.freeze({
      autoridade: AUTORIDADE.GATE,
      acao: "clarificar_gate",
      destinoPermitido: "continuidade_gate_clarificacao",
      destinoFixo: true,
      tipoTurno,
      bloqueados: Object.freeze([
        ...bloqueados,
        AUTORIDADE.AD_CTO003,
        AUTORIDADE.CLASSIFICADOR,
        AUTORIDADE.DESTINO
      ]),
      permiteAdAck: false,
      permiteAdExecucao: false,
      permiteCto003: false,
      forcarC2: false,
      forcarC4Panorama: false,
      razao: "V1: Gate pede clarificação",
      fase,
      versao: "v1"
    });
  }

  // 2) Pedido de deliberação/decisão — vence AD/CTO-003/C3
  if (s.pedidoDecisaoExplicita) {
    return Object.freeze({
      autoridade: AUTORIDADE.PEDIDO_DECISAO,
      acao: "forcar_deliberacao_c2",
      destinoPermitido: "nucleo_mre",
      destinoFixo: true,
      tipoTurno: TIPO_TURNO_PREC.DECISAO,
      bloqueados: Object.freeze([
        ...bloqueados,
        AUTORIDADE.AD_CTO003,
        AUTORIDADE.DESTINO
      ]),
      permiteAdAck: false,
      permiteAdExecucao: false,
      permiteCto003: false,
      forcarC2: true,
      forcarC4Panorama: false,
      razao:
        "V1: Pedido de decisão explícito → C2/MRE (bloqueia AD/CTO-003/C3)",
      fase,
      versao: "v1"
    });
  }

  // CONSULTA (situacional ou panorama) — nunca vira ação/delegação automática
  if (s.pedidoSituacionalTrabalho) {
    // C4 já decidida pelo classificador (E4 / FASE 3) — não reescrever para C2.
    if (s.destinoClassificador === "capacidade_operacional") {
      return Object.freeze({
        autoridade: AUTORIDADE.CLASSIFICADOR,
        acao: "seguir_classificador",
        destinoPermitido: "capacidade_operacional",
        destinoFixo: true,
        tipoTurno: TIPO_TURNO_PREC.CONSULTA,
        bloqueados: Object.freeze([...bloqueados, AUTORIDADE.AD_CTO003]),
        permiteAdAck: false,
        permiteAdExecucao: false,
        permiteCto003: false,
        forcarC2: false,
        forcarC4Panorama: false,
        razao:
          "V1: C4 já classificada — situacional não reescreve destino",
        fase,
        versao: "v1"
      });
    }
    return Object.freeze({
      autoridade: AUTORIDADE.CLASSIFICADOR,
      acao: "forcar_analise_situacional_c2",
      destinoPermitido: "nucleo_mre",
      destinoFixo: true,
      tipoTurno: TIPO_TURNO_PREC.CONSULTA,
      bloqueados: Object.freeze([
        ...bloqueados,
        AUTORIDADE.AD_CTO003,
        AUTORIDADE.DESTINO
      ]),
      permiteAdAck: false,
      permiteAdExecucao: false,
      permiteCto003: false,
      forcarC2: true,
      forcarC4Panorama: false,
      razao:
        "V1: Consulta situacional de trabalho → C2 (não panorama C4; não ação)",
      fase,
      versao: "v1"
    });
  }

  if (s.panoramaEstadoGeral && !s.pedidoSituacionalTrabalho) {
    return Object.freeze({
      autoridade: AUTORIDADE.CLASSIFICADOR,
      acao: "permitir_panorama_c4",
      destinoPermitido: "capacidade_operacional",
      destinoFixo: true,
      tipoTurno: TIPO_TURNO_PREC.CONSULTA,
      bloqueados: Object.freeze([...bloqueados, AUTORIDADE.AD_CTO003]),
      permiteAdAck: false,
      permiteAdExecucao: false,
      permiteCto003: false,
      forcarC2: false,
      forcarC4Panorama: true,
      razao: "V1: Panorama geral explícito → C4 estado_geral",
      fase,
      versao: "v1"
    });
  }

  // 3) AD/CTO-003 só com objeto operacional real
  const candidatoOperacional =
    (s.adOrdemExecucao || s.cto003Candidato) && s.objetoOperacionalReal;
  if (candidatoOperacional) {
    return Object.freeze({
      autoridade: AUTORIDADE.AD_CTO003,
      acao: s.adOrdemExecucao ? "permitir_ad_execucao_c3" : "permitir_cto003_c3",
      destinoPermitido: "motor_execucao",
      destinoFixo: true,
      tipoTurno: TIPO_TURNO_PREC.ACAO,
      bloqueados: Object.freeze([...bloqueados]),
      permiteAdAck: false,
      permiteAdExecucao: Boolean(s.adOrdemExecucao),
      permiteCto003: Boolean(s.cto003Candidato),
      forcarC2: false,
      forcarC4Panorama: false,
      razao:
        "V1: AD/CTO-003 com objeto operacional real → ação C3 permitida",
      fase,
      versao: "v1"
    });
  }

  // AD ack de activação (delegação explícita) — não se aplica a consultas
  if (s.adActivacaoAck) {
    return Object.freeze({
      autoridade: AUTORIDADE.AD_CTO003,
      acao: "permitir_ad_ack",
      destinoPermitido: "autoridade_delegada",
      destinoFixo: true,
      tipoTurno: TIPO_TURNO_PREC.DELEGACAO,
      bloqueados: Object.freeze([...bloqueados, AUTORIDADE.CLASSIFICADOR]),
      permiteAdAck: true,
      permiteAdExecucao: false,
      permiteCto003: false,
      forcarC2: false,
      forcarC4Panorama: false,
      razao: "V1: Activação AD (delegação) — ack permitido",
      fase,
      versao: "v1"
    });
  }

  // CTO-003 ou AD execução SEM objeto operacional → não autorizar ação
  if (
    (s.cto003Candidato || s.adOrdemExecucao) &&
    !s.objetoOperacionalReal
  ) {
    return Object.freeze({
      autoridade: AUTORIDADE.CLASSIFICADOR,
      acao: "seguir_classificador",
      destinoPermitido: s.destinoClassificador || null,
      destinoFixo: false,
      tipoTurno,
      bloqueados: Object.freeze([...bloqueados]),
      permiteAdAck: false,
      permiteAdExecucao: false,
      permiteCto003: false,
      forcarC2: false,
      forcarC4Panorama: false,
      razao:
        "V1: Sem objeto operacional real — AD/CTO-003 não interceptam; classificador decide",
      fase,
      versao: "v1"
    });
  }

  // 4) VCA/CSC
  if (s.vcaClarificacao || s.cscClarificacao) {
    return Object.freeze({
      autoridade: AUTORIDADE.VCA_CSC,
      acao: "clarificar_contexto",
      destinoPermitido: "clarificacao",
      destinoFixo: true,
      tipoTurno,
      bloqueados: Object.freeze([
        ...bloqueados,
        AUTORIDADE.AD_CTO003,
        AUTORIDADE.DESTINO
      ]),
      permiteAdAck: false,
      permiteAdExecucao: false,
      permiteCto003: false,
      forcarC2: false,
      forcarC4Panorama: false,
      razao: "V1: VCA/CSC pedem clarificação",
      fase,
      versao: "v1"
    });
  }

  // 5) Classificador / destino já conhecido
  const destino = s.destinoClassificador || null;
  const tipoPos = inferirTipoTurnoPrecedencia({
    ...s,
    destinoClassificador: destino
  });

  return Object.freeze({
    autoridade:
      fase === "pos_destino" ? AUTORIDADE.DESTINO : AUTORIDADE.CLASSIFICADOR,
    acao: "seguir_classificador",
    destinoPermitido: destino,
    destinoFixo: Boolean(destino),
    tipoTurno: tipoPos,
    bloqueados: Object.freeze([
      ...bloqueados,
      // Consulta nunca pode ser promovida a ação por pós-processo
      ...(tipoPos === TIPO_TURNO_PREC.CONSULTA
        ? [AUTORIDADE.AD_CTO003]
        : [])
    ]),
    permiteAdAck: false,
    permiteAdExecucao: false,
    permiteCto003: false,
    forcarC2: destino === "nucleo_mre",
    forcarC4Panorama: destino === "capacidade_operacional",
    razao: "V1: Seguir classificador/destino; CN não altera destino",
    fase,
    versao: "v1"
  });
}

/**
 * Pós-processo (Consciência/CN) pode mudar o destino?
 * V1: nunca.
 * @param {ReturnType<typeof resolverPrecedenciaTurno>|null|undefined} resolucao
 * @param {string|null|undefined} destinoActual
 * @param {string|null|undefined} destinoProposto
 */
export function cnPodeAlterarDestino(resolucao, destinoActual, destinoProposto) {
  if (!destinoProposto || destinoProposto === destinoActual) return false;
  return false;
}

/**
 * Anexa metadados de precedência sem alterar a mensagem.
 * Preserva encaminhamento.destino se destinoFixo.
 * @param {object} resposta
 * @param {ReturnType<typeof resolverPrecedenciaTurno>} resolucao
 */
export function anexarPrecedenciaNaResposta(resposta, resolucao) {
  if (!resposta || typeof resposta !== "object" || !resolucao) return resposta;
  const dados = {
    ...(resposta.dados && typeof resposta.dados === "object"
      ? resposta.dados
      : {}),
    precedenciaTurno: {
      autoridade: resolucao.autoridade,
      acao: resolucao.acao,
      destinoPermitido: resolucao.destinoPermitido,
      destinoFixo: resolucao.destinoFixo,
      tipoTurno: resolucao.tipoTurno,
      bloqueados: resolucao.bloqueados,
      razao: resolucao.razao,
      versao: resolucao.versao
    }
  };
  if (
    resolucao.destinoFixo &&
    resolucao.destinoPermitido &&
    dados.encaminhamento &&
    typeof dados.encaminhamento === "object"
  ) {
    dados.encaminhamento = {
      ...dados.encaminhamento,
      destino: resolucao.destinoPermitido
    };
  }
  return { ...resposta, dados };
}
