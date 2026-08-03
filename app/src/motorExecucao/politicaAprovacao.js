/**
 * Política de Aprovação V1 — IMP-056 E2 / REQ-056 RES8 / ARQ-017 §3.4.3.
 * Decide quando o Gate humano é obrigatório antes da Criação do Job.
 * Sem I/O, sem Fila, sem UI, sem Dispatcher.
 */

import {
  DECISOES_APROVACAO,
  ehDecisaoAprovacao,
  aprovacaoPermiteCriacaoJob,
  validarTransicaoCiclo,
  validarCiclo,
  avancarCiclo
} from "./dominio.js";

/**
 * Gatilhos V1 explícitos (REQ-056 RES8).
 * Novos gatilhos só por emenda documentada — não ad hoc no Orquestrador.
 *
 * | ID | Gatilho | Exige Gate? |
 * |----|---------|-------------|
 * | G1 | Despacho com efeito externo | sim |
 * | G2 | Despacho que altera código | sim |
 * | G3 | Despacho que altera docs de produto | sim |
 * | —  | Comunicação-only / sem despacho | não |
 * | —  | Despacho sem G1–G3 | não (V1 mínima) |
 */
export const GATILHOS_V1 = Object.freeze([
  Object.freeze({
    id: "G1",
    campo: "efeitoExterno",
    descricao: "Despacho com efeito externo"
  }),
  Object.freeze({
    id: "G2",
    campo: "alteraCodigo",
    descricao: "Despacho que altera código"
  }),
  Object.freeze({
    id: "G3",
    campo: "alteraDocsProduto",
    descricao: "Despacho que altera docs de produto"
  })
]);

export { DECISOES_APROVACAO };

/**
 * Contexto de classificação da intenção/plano (entrada da política).
 * @typedef {object} ContextoPolitica
 * @property {boolean} [requerDespacho] — false/omitido = comunicação-only
 * @property {boolean} [efeitoExterno] — G1
 * @property {boolean} [alteraCodigo] — G2
 * @property {boolean} [alteraDocsProduto] — G3
 */

/**
 * @param {ContextoPolitica} [contexto]
 * @returns {string[]} IDs dos gatilhos G1–G3 disparados (só relevantes com despacho)
 */
export function gatilhosDisparados(contexto = {}) {
  if (contexto.requerDespacho !== true) return [];
  const ids = [];
  for (const g of GATILHOS_V1) {
    if (contexto[g.campo] === true) ids.push(g.id);
  }
  return ids;
}

/**
 * Determina se o Gate humano é obrigatório antes da Criação do Job.
 * @param {ContextoPolitica} [contexto]
 * @returns {boolean}
 */
export function exigeAprovacao(contexto = {}) {
  if (contexto.requerDespacho !== true) return false;
  return gatilhosDisparados(contexto).length > 0;
}

/**
 * Avaliação completa da política (sem efeitos laterais).
 * @param {ContextoPolitica} [contexto]
 * @returns {{
 *   requerDespacho: boolean,
 *   exigeAprovacao: boolean,
 *   gatilhos: string[],
 *   proximaEtapaAposPlano: "Aprovacao"|"CriacaoDoJob"|"Encerramento"
 * }}
 */
export function avaliarPolitica(contexto = {}) {
  const requerDespacho = contexto.requerDespacho === true;
  const gatilhos = gatilhosDisparados(contexto);
  const exige = exigeAprovacao(contexto);
  let proximaEtapaAposPlano;
  if (!requerDespacho) {
    proximaEtapaAposPlano = "Encerramento";
  } else if (exige) {
    proximaEtapaAposPlano = "Aprovacao";
  } else {
    proximaEtapaAposPlano = "CriacaoDoJob";
  }
  return {
    requerDespacho,
    exigeAprovacao: exige,
    gatilhos,
    proximaEtapaAposPlano
  };
}

/**
 * Converte política → campos do ContextoTransicaoCiclo (domínio E1).
 * @param {ContextoPolitica} [contexto]
 * @param {{ decisaoAprovacao?: import("./dominio.js").DecisaoAprovacao|null }} [opts]
 */
export function contextoCicloDaPolitica(contexto = {}, opts = {}) {
  const a = avaliarPolitica(contexto);
  return {
    requerDespacho: a.requerDespacho,
    exigeAprovacao: a.exigeAprovacao,
    decisaoAprovacao:
      opts.decisaoAprovacao === undefined ? null : opts.decisaoAprovacao
  };
}

/**
 * Pode avançar para Criação do Job segundo política + decisão do Gate.
 * @param {ContextoPolitica} [contexto]
 * @param {import("./dominio.js").DecisaoAprovacao|null|undefined} [decisaoAprovacao]
 */
export function podeCriarJob(contexto = {}, decisaoAprovacao = null) {
  const a = avaliarPolitica(contexto);
  if (!a.requerDespacho) return false;
  return aprovacaoPermiteCriacaoJob({
    exigeAprovacao: a.exigeAprovacao,
    decisaoAprovacao
  });
}

/**
 * Pedido mínimo ao Gate (contrato E2 — sem UI).
 * @typedef {object} PedidoGate
 * @property {string} resumoPlano
 * @property {string} [resumoDespacho]
 * @property {string} [parecerId]
 * @property {ContextoPolitica} contexto
 */

/**
 * @typedef {object} ResultadoGate
 * @property {import("./dominio.js").DecisaoAprovacao} decisao
 * @property {string} [motivo]
 * @property {string} decididoEm
 * @property {boolean} exigeAprovacao
 * @property {string[]} gatilhos
 */

/**
 * @param {unknown} pedido
 * @returns {{ ok: true, pedido: PedidoGate } | { ok: false, mensagem: string }}
 */
export function validarPedidoGate(pedido) {
  if (!pedido || typeof pedido !== "object") {
    return { ok: false, mensagem: "PedidoGate em falta." };
  }
  const p = /** @type {Record<string, unknown>} */ (pedido);
  if (typeof p.resumoPlano !== "string" || !p.resumoPlano.trim()) {
    return { ok: false, mensagem: "resumoPlano obrigatório." };
  }
  if (p.resumoDespacho !== undefined && typeof p.resumoDespacho !== "string") {
    return { ok: false, mensagem: "resumoDespacho deve ser string." };
  }
  if (p.parecerId !== undefined && typeof p.parecerId !== "string") {
    return { ok: false, mensagem: "parecerId deve ser string." };
  }
  if (!p.contexto || typeof p.contexto !== "object") {
    return { ok: false, mensagem: "contexto (ContextoPolitica) obrigatório." };
  }
  return { ok: true, pedido: /** @type {PedidoGate} */ (p) };
}

/**
 * @param {string} resumoPlano
 * @param {ContextoPolitica} contexto
 * @param {{ resumoDespacho?: string, parecerId?: string }} [opts]
 * @returns {PedidoGate}
 */
export function montarPedidoGate(resumoPlano, contexto, opts = {}) {
  const pedido = {
    resumoPlano: String(resumoPlano || "").trim(),
    contexto: { ...contexto }
  };
  if (opts.resumoDespacho !== undefined) {
    pedido.resumoDespacho = opts.resumoDespacho;
  }
  if (opts.parecerId !== undefined) pedido.parecerId = opts.parecerId;
  const v = validarPedidoGate(pedido);
  if (!v.ok) throw new Error(v.mensagem);
  return v.pedido;
}

/**
 * Aplica decisão do patrocinador ao pedido (puro — não publica Job).
 * @param {PedidoGate} pedido
 * @param {string} decisao
 * @param {{ motivo?: string, decididoEm?: string }} [opts]
 * @returns {{ ok: true, resultado: ResultadoGate } | { ok: false, mensagem: string }}
 */
export function aplicarDecisaoGate(pedido, decisao, opts = {}) {
  const v = validarPedidoGate(pedido);
  if (!v.ok) return v;
  if (!ehDecisaoAprovacao(decisao)) {
    return { ok: false, mensagem: `Decisão de Gate inválida: ${decisao}.` };
  }
  const a = avaliarPolitica(v.pedido.contexto);
  /** @type {ResultadoGate} */
  const resultado = {
    decisao: /** @type {import("./dominio.js").DecisaoAprovacao} */ (decisao),
    decididoEm: opts.decididoEm || new Date().toISOString(),
    exigeAprovacao: a.exigeAprovacao,
    gatilhos: a.gatilhos
  };
  if (opts.motivo !== undefined) resultado.motivo = opts.motivo;
  return { ok: true, resultado };
}

/**
 * Integração E1: a partir do Plano, avança conforme política (+ decisão se Gate).
 * Não cria Job real — só estado do CicloMotor.
 *
 * @param {import("./dominio.js").CicloMotor} ciclo — deve estar em Plano
 * @param {ContextoPolitica} contextoPolitica
 * @param {{
 *   decisaoAprovacao?: import("./dominio.js").DecisaoAprovacao|null,
 *   jobId?: string,
 *   parecerId?: string
 * }} [opts]
 * @returns {{ ok: true, ciclo: import("./dominio.js").CicloMotor, avaliacao: ReturnType<typeof avaliarPolitica> } | { ok: false, mensagem: string }}
 */
export function avancarAposPlano(ciclo, contextoPolitica, opts = {}) {
  const base = validarCiclo(ciclo);
  if (!base.ok) return base;
  if (base.ciclo.etapa !== "Plano") {
    return {
      ok: false,
      mensagem: `avancarAposPlano exige etapa Plano (actual: ${base.ciclo.etapa}).`
    };
  }

  const avaliacao = avaliarPolitica(contextoPolitica);
  const ctxCiclo = contextoCicloDaPolitica(contextoPolitica, {
    decisaoAprovacao: opts.decisaoAprovacao ?? null
  });

  const para = avaliacao.proximaEtapaAposPlano;

  if (para === "Aprovacao") {
    const t = validarTransicaoCiclo("Plano", "Aprovacao", ctxCiclo);
    if (!t.ok) return t;
    const avancado = avancarCiclo(base.ciclo, "Aprovacao", {
      ...ctxCiclo,
      parecerId: opts.parecerId ?? base.ciclo.parecerId
    });
    if (!avancado.ok) return avancado;
    return { ok: true, ciclo: avancado.ciclo, avaliacao };
  }

  if (para === "Encerramento") {
    const t = validarTransicaoCiclo("Plano", "Encerramento", ctxCiclo);
    if (!t.ok) return t;
    const avancado = avancarCiclo(base.ciclo, "Encerramento", {
      ...ctxCiclo,
      parecerId: opts.parecerId ?? base.ciclo.parecerId
    });
    if (!avancado.ok) return avancado;
    return { ok: true, ciclo: avancado.ciclo, avaliacao };
  }

  // CriacaoDoJob — despacho sem gatilhos G1–G3 (isento de Gate V1)
  if (!podeCriarJob(contextoPolitica, opts.decisaoAprovacao ?? null)) {
    return {
      ok: false,
      mensagem: "Política não permite Criação do Job neste contexto."
    };
  }
  if (typeof opts.jobId !== "string" || !opts.jobId.trim()) {
    return {
      ok: false,
      mensagem: "jobId obrigatório para avançar a CriacaoDoJob (domínio E1)."
    };
  }
  const t = validarTransicaoCiclo("Plano", "CriacaoDoJob", ctxCiclo);
  if (!t.ok) return t;
  const avancado = avancarCiclo(base.ciclo, "CriacaoDoJob", {
    ...ctxCiclo,
    jobId: opts.jobId.trim(),
    estadoJob: "pending",
    parecerId: opts.parecerId ?? base.ciclo.parecerId
  });
  if (!avancado.ok) return avancado;
  return { ok: true, ciclo: avancado.ciclo, avaliacao };
}

/**
 * Após Gate em etapa Aprovacao:
 * - aprovado → CriacaoDoJob
 * - rejeitado → Encerramento
 * - adiado → permanece em Aprovacao (IMP-058 P10 / REQ-058 RF8)
 * @param {import("./dominio.js").CicloMotor} ciclo
 * @param {import("./dominio.js").DecisaoAprovacao} decisao
 * @param {ContextoPolitica} contextoPolitica
 * @param {{ jobId?: string, motivo?: string }} [opts]
 */
export function avancarAposGate(ciclo, decisao, contextoPolitica, opts = {}) {
  const base = validarCiclo(ciclo);
  if (!base.ok) return base;
  if (base.ciclo.etapa !== "Aprovacao") {
    return {
      ok: false,
      mensagem: `avancarAposGate exige etapa Aprovacao (actual: ${base.ciclo.etapa}).`
    };
  }
  if (!ehDecisaoAprovacao(decisao)) {
    return { ok: false, mensagem: `Decisão inválida: ${decisao}.` };
  }

  const ctxCiclo = contextoCicloDaPolitica(contextoPolitica, {
    decisaoAprovacao: decisao
  });

  if (decisao === "adiado") {
    return {
      ok: true,
      ciclo: base.ciclo,
      avaliacao: avaliarPolitica(contextoPolitica),
      permanecePendente: true,
      resultadoGate: {
        decisao,
        motivo: opts.motivo || "adiado_mantem_gate",
        decididoEm: new Date().toISOString(),
        exigeAprovacao: true,
        gatilhos: gatilhosDisparados(contextoPolitica)
      }
    };
  }

  if (decisao === "rejeitado") {
    const t = validarTransicaoCiclo("Aprovacao", "Encerramento", ctxCiclo);
    if (!t.ok) return t;
    const avancado = avancarCiclo(base.ciclo, "Encerramento", ctxCiclo);
    if (!avancado.ok) return avancado;
    return {
      ok: true,
      ciclo: avancado.ciclo,
      avaliacao: avaliarPolitica(contextoPolitica),
      resultadoGate: {
        decisao,
        motivo: opts.motivo,
        decididoEm: new Date().toISOString(),
        exigeAprovacao: true,
        gatilhos: gatilhosDisparados(contextoPolitica)
      }
    };
  }

  // aprovado
  if (!podeCriarJob(contextoPolitica, decisao)) {
    return {
      ok: false,
      mensagem: "Aprovado mas política/contexto impede Criação do Job."
    };
  }
  if (typeof opts.jobId !== "string" || !opts.jobId.trim()) {
    return {
      ok: false,
      mensagem: "jobId obrigatório após aprovação para CriacaoDoJob."
    };
  }
  const t = validarTransicaoCiclo("Aprovacao", "CriacaoDoJob", ctxCiclo);
  if (!t.ok) return t;
  const avancado = avancarCiclo(base.ciclo, "CriacaoDoJob", {
    ...ctxCiclo,
    jobId: opts.jobId.trim(),
    estadoJob: "pending"
  });
  if (!avancado.ok) return avancado;
  return {
    ok: true,
    ciclo: avancado.ciclo,
    avaliacao: avaliarPolitica(contextoPolitica),
    resultadoGate: {
      decisao,
      motivo: opts.motivo,
      decididoEm: new Date().toISOString(),
      exigeAprovacao: true,
      gatilhos: gatilhosDisparados(contextoPolitica)
    }
  };
}
