/**
 * Domínio do Motor de Execução — IMP-056 E1 / REQ-056 / ARQ-017.
 * Modelo in-memory do ciclo canónico + estados Job (REQ-045).
 * Sem I/O, sem UI, sem Fila, sem Dispatcher, sem Orquestrador.
 */

/** @typedef {"Intencao"|"Plano"|"Aprovacao"|"CriacaoDoJob"|"Dispatcher"|"Execucao"|"Monitoramento"|"Resultado"|"Encerramento"} EtapaCiclo */

/** @typedef {"pending"|"running"|"completed"|"failed"|"cancelled"} EstadoJob */

/** @typedef {"aprovado"|"rejeitado"|"adiado"} DecisaoAprovacao */

/**
 * Nove etapas do fluxo canónico (ARQ-017 §3.1) — ordem = sequência feliz.
 * @type {ReadonlyArray<EtapaCiclo>}
 */
export const ETAPAS_CICLO = Object.freeze([
  "Intencao",
  "Plano",
  "Aprovacao",
  "CriacaoDoJob",
  "Dispatcher",
  "Execucao",
  "Monitoramento",
  "Resultado",
  "Encerramento"
]);

/**
 * Enum canónico de Job (REQ-045 / ARQ-017 §6.1).
 * @type {ReadonlyArray<EstadoJob>}
 */
export const ESTADOS_JOB = Object.freeze([
  "pending",
  "running",
  "completed",
  "failed",
  "cancelled"
]);

/** Estados terminais do Job — Encerramento exige um destes (ou cancelamento governado). */
export const ESTADOS_JOB_TERMINAIS = Object.freeze([
  "completed",
  "failed",
  "cancelled"
]);

/**
 * Decisões possíveis no Gate de aprovação (ARQ-017 §3.2).
 * @type {ReadonlyArray<DecisaoAprovacao>}
 */
export const DECISOES_APROVACAO = Object.freeze([
  "aprovado",
  "rejeitado",
  "adiado"
]);

/**
 * Mapeamento etapa do fluxo → estado(s) Job típicos (ARQ-017 §6.2).
 * Etapas anteriores à Criação não têm Job; Encerramento exige terminal estável.
 * @type {Readonly<Record<EtapaCiclo, ReadonlyArray<EstadoJob|null>>>}
 */
export const MAPA_ETAPA_ESTADOS_JOB = Object.freeze({
  Intencao: Object.freeze([null]),
  Plano: Object.freeze([null]),
  Aprovacao: Object.freeze([null]),
  CriacaoDoJob: Object.freeze(/** @type {EstadoJob[]} */ (["pending"])),
  Dispatcher: Object.freeze(/** @type {EstadoJob[]} */ (["pending", "running"])),
  Execucao: Object.freeze(/** @type {EstadoJob[]} */ (["running"])),
  Monitoramento: Object.freeze(
    /** @type {EstadoJob[]} */ (["pending", "running", "completed", "failed", "cancelled"])
  ),
  Resultado: Object.freeze(
    /** @type {EstadoJob[]} */ (["completed", "failed", "cancelled"])
  ),
  Encerramento: Object.freeze(
    /** @type {EstadoJob[]} */ (["completed", "failed", "cancelled"])
  )
});

/**
 * Transições legais de estado Job (ARQ-017 §6.2–§6.3).
 * Chave = origem; valor = destinos permitidos.
 * @type {Readonly<Record<EstadoJob, ReadonlyArray<EstadoJob>>>}
 */
export const TRANSICOES_JOB = Object.freeze({
  pending: Object.freeze(/** @type {EstadoJob[]} */ (["running", "cancelled"])),
  running: Object.freeze(
    /** @type {EstadoJob[]} */ (["completed", "failed", "cancelled"])
  ),
  completed: Object.freeze(/** @type {EstadoJob[]} */ ([])),
  failed: Object.freeze(/** @type {EstadoJob[]} */ ([])),
  cancelled: Object.freeze(/** @type {EstadoJob[]} */ ([]))
});

/**
 * Transições de ciclo permitidas na V1 (grafo mínimo).
 * Atalhos: Plano → CriacaoDoJob (se isento de aprovação);
 * Plano → Encerramento (comunicação-only, sem despacho);
 * Aprovacao → Encerramento (rejeitado). Adiado permanece em Aprovacao (IMP-058 P10).
 * @type {Readonly<Record<EtapaCiclo, ReadonlyArray<EtapaCiclo>>>}
 */
export const TRANSICOES_CICLO = Object.freeze({
  Intencao: Object.freeze(/** @type {EtapaCiclo[]} */ (["Plano"])),
  Plano: Object.freeze(
    /** @type {EtapaCiclo[]} */ (["Aprovacao", "CriacaoDoJob", "Encerramento"])
  ),
  Aprovacao: Object.freeze(
    /** @type {EtapaCiclo[]} */ (["CriacaoDoJob", "Encerramento"])
  ),
  CriacaoDoJob: Object.freeze(/** @type {EtapaCiclo[]} */ (["Dispatcher"])),
  /** Monitoramento: observação de Job terminal sem passar por Execucao “running” fictícia (E5). */
  Dispatcher: Object.freeze(
    /** @type {EtapaCiclo[]} */ (["Execucao", "Monitoramento"])
  ),
  Execucao: Object.freeze(
    /** @type {EtapaCiclo[]} */ (["Monitoramento", "Resultado"])
  ),
  Monitoramento: Object.freeze(
    /** @type {EtapaCiclo[]} */ (["Resultado", "Execucao"])
  ),
  Resultado: Object.freeze(/** @type {EtapaCiclo[]} */ (["Encerramento"])),
  Encerramento: Object.freeze(/** @type {EtapaCiclo[]} */ ([]))
});

/**
 * @param {string} etapa
 * @returns {etapa is EtapaCiclo}
 */
export function ehEtapaCiclo(etapa) {
  return ETAPAS_CICLO.includes(/** @type {EtapaCiclo} */ (etapa));
}

/**
 * @param {string} estado
 * @returns {estado is EstadoJob}
 */
export function ehEstadoJob(estado) {
  return ESTADOS_JOB.includes(/** @type {EstadoJob} */ (estado));
}

/**
 * @param {string} estado
 * @returns {estado is EstadoJob}
 */
export function ehEstadoJobTerminal(estado) {
  return ESTADOS_JOB_TERMINAIS.includes(/** @type {EstadoJob} */ (estado));
}

/**
 * @param {string} decisao
 * @returns {decisao is DecisaoAprovacao}
 */
export function ehDecisaoAprovacao(decisao) {
  return DECISOES_APROVACAO.includes(/** @type {DecisaoAprovacao} */ (decisao));
}

/**
 * Índice 0-based na sequência canónica (E1-CA1 — ordenáveis).
 * @param {EtapaCiclo} etapa
 * @returns {number}
 */
export function indiceEtapa(etapa) {
  if (!ehEtapaCiclo(etapa)) throw new TypeError(`Etapa inválida: ${etapa}`);
  return ETAPAS_CICLO.indexOf(etapa);
}

/**
 * Estados Job típicos associados a uma etapa (E1-CA3).
 * @param {EtapaCiclo} etapa
 * @returns {ReadonlyArray<EstadoJob|null>}
 */
export function estadosJobDaEtapa(etapa) {
  if (!ehEtapaCiclo(etapa)) throw new TypeError(`Etapa inválida: ${etapa}`);
  return MAPA_ETAPA_ESTADOS_JOB[etapa];
}

/**
 * @param {EtapaCiclo} etapa
 * @param {EstadoJob|null|undefined} estadoJob
 */
export function estadoJobCompativelComEtapa(etapa, estadoJob) {
  const permitidos = estadosJobDaEtapa(etapa);
  if (estadoJob == null) return permitidos.includes(null);
  if (!ehEstadoJob(estadoJob)) return false;
  return permitidos.includes(estadoJob);
}

/**
 * Contexto para validar transição de ciclo (ARQ-017 §3.4).
 * @typedef {object} ContextoTransicaoCiclo
 * @property {boolean} [intencaoClara] — default true se omitido na validação de Intencao→Plano
 * @property {boolean} [requerDespacho] — se false, Plano não pode ir a CriacaoDoJob
 * @property {boolean} [exigeAprovacao] — Gate obrigatório antes de CriacaoDoJob
 * @property {DecisaoAprovacao|null|undefined} [decisaoAprovacao]
 * @property {EstadoJob|null|undefined} [estadoJob] — para Encerramento / Resultado
 */

/**
 * ARQ-017 §3.4.3: aprovação necessária e ausente → não avançar para Criação do Job.
 * @param {ContextoTransicaoCiclo} ctx
 * @returns {boolean}
 */
export function aprovacaoPermiteCriacaoJob(ctx = {}) {
  if (!ctx.exigeAprovacao) return true;
  return ctx.decisaoAprovacao === "aprovado";
}

/**
 * Valida transição entre etapas do ciclo (E1-CA2 e regras §3.4).
 * @param {string} de
 * @param {string} para
 * @param {ContextoTransicaoCiclo} [ctx]
 * @returns {{ ok: true } | { ok: false, mensagem: string }}
 */
export function validarTransicaoCiclo(de, para, ctx = {}) {
  if (!ehEtapaCiclo(de)) {
    return { ok: false, mensagem: `Etapa origem inválida: ${de}.` };
  }
  if (!ehEtapaCiclo(para)) {
    return { ok: false, mensagem: `Etapa destino inválida: ${para}.` };
  }
  const permitidas = TRANSICOES_CICLO[de];
  if (!permitidas.includes(/** @type {EtapaCiclo} */ (para))) {
    return {
      ok: false,
      mensagem: `Transição de ciclo ilegal: ${de} → ${para}.`
    };
  }

  if (de === "Intencao" && para === "Plano") {
    if (ctx.intencaoClara === false) {
      return {
        ok: false,
        mensagem: "Sem intenção clara — não avançar no ciclo (ARQ-017 §3.4.1)."
      };
    }
  }

  if (para === "CriacaoDoJob") {
    if (ctx.requerDespacho !== true) {
      return {
        ok: false,
        mensagem:
          "Parecer sem despacho — não força Criação do Job (ARQ-017 §3.4.2)."
      };
    }
    if (!aprovacaoPermiteCriacaoJob(ctx)) {
      return {
        ok: false,
        mensagem:
          "Aprovação necessária e ausente — bloqueio antes de Criação do Job (ARQ-017 §3.4.3)."
      };
    }
  }

  if (para === "Encerramento") {
    if (de === "Resultado" || de === "Monitoramento") {
      if (ctx.estadoJob != null && !ehEstadoJobTerminal(ctx.estadoJob)) {
        return {
          ok: false,
          mensagem:
            "Encerramento exige estado terminal do Job (ARQ-017 §3.4.6)."
        };
      }
    }
    if (de === "Aprovacao") {
      if (ctx.decisaoAprovacao !== "rejeitado") {
        return {
          ok: false,
          mensagem:
            "Aprovacao → Encerramento só com rejeitado (adiado permanece pendente — IMP-058 P10)."
        };
      }
    }
    if (de === "Plano" && ctx.requerDespacho === true) {
      return {
        ok: false,
        mensagem:
          "Plano com despacho não encerra sem Gate/Job — use Aprovacao ou CriacaoDoJob."
      };
    }
  }

  return { ok: true };
}

/**
 * Alias canónico pedido na IMP-056 E1.
 * @param {string} de
 * @param {string} para
 * @param {ContextoTransicaoCiclo} [ctx]
 */
export function validarTransicao(de, para, ctx) {
  return validarTransicaoCiclo(de, para, ctx);
}

/**
 * Valida transição de estado Job (protocolo Fila).
 * @param {string} de
 * @param {string} para
 * @returns {{ ok: true } | { ok: false, mensagem: string }}
 */
export function validarTransicaoJob(de, para) {
  if (!ehEstadoJob(de)) {
    return { ok: false, mensagem: `Estado Job origem inválido: ${de}.` };
  }
  if (!ehEstadoJob(para)) {
    return { ok: false, mensagem: `Estado Job destino inválido: ${para}.` };
  }
  const destinos = TRANSICOES_JOB[/** @type {EstadoJob} */ (de)];
  if (!destinos.includes(/** @type {EstadoJob} */ (para))) {
    return {
      ok: false,
      mensagem: `Transição de Job ilegal: ${de} → ${para}.`
    };
  }
  return { ok: true };
}

/**
 * @typedef {object} CicloMotor
 * @property {string} id
 * @property {EtapaCiclo} etapa
 * @property {string} [parecerId]
 * @property {string} [jobId]
 * @property {boolean} [intencaoClara]
 * @property {boolean} [requerDespacho]
 * @property {boolean} [exigeAprovacao]
 * @property {DecisaoAprovacao|null} [decisaoAprovacao]
 * @property {EstadoJob|null} [estadoJob]
 * @property {string} [atualizadoEm]
 */

/**
 * @param {unknown} ciclo
 * @returns {{ ok: true, ciclo: CicloMotor } | { ok: false, mensagem: string }}
 */
export function validarCiclo(ciclo) {
  if (!ciclo || typeof ciclo !== "object") {
    return { ok: false, mensagem: "CicloMotor em falta." };
  }
  const c = /** @type {Record<string, unknown>} */ (ciclo);
  if (typeof c.id !== "string" || !c.id.trim()) {
    return { ok: false, mensagem: "id obrigatório." };
  }
  if (typeof c.etapa !== "string" || !ehEtapaCiclo(c.etapa)) {
    return { ok: false, mensagem: `etapa inválida: ${c.etapa}.` };
  }
  if (c.parecerId !== undefined && typeof c.parecerId !== "string") {
    return { ok: false, mensagem: "parecerId deve ser string." };
  }
  if (c.jobId !== undefined && typeof c.jobId !== "string") {
    return { ok: false, mensagem: "jobId deve ser string." };
  }
  if (
    c.decisaoAprovacao != null &&
    !ehDecisaoAprovacao(/** @type {string} */ (c.decisaoAprovacao))
  ) {
    return {
      ok: false,
      mensagem: `decisaoAprovacao inválida: ${c.decisaoAprovacao}.`
    };
  }
  if (c.estadoJob != null && !ehEstadoJob(/** @type {string} */ (c.estadoJob))) {
    return { ok: false, mensagem: `estadoJob inválido: ${c.estadoJob}.` };
  }
  if (
    c.estadoJob != null &&
    !estadoJobCompativelComEtapa(
      /** @type {EtapaCiclo} */ (c.etapa),
      /** @type {EstadoJob} */ (c.estadoJob)
    )
  ) {
    return {
      ok: false,
      mensagem: `estadoJob ${c.estadoJob} incompatível com etapa ${c.etapa}.`
    };
  }
  if (
    c.etapa === "CriacaoDoJob" ||
    c.etapa === "Dispatcher" ||
    c.etapa === "Execucao"
  ) {
    if (typeof c.jobId !== "string" || !c.jobId.trim()) {
      return {
        ok: false,
        mensagem: `jobId obrigatório a partir de ${c.etapa}.`
      };
    }
  }
  return { ok: true, ciclo: /** @type {CicloMotor} */ (c) };
}

/**
 * @param {string} id
 * @param {EtapaCiclo} [etapa]
 * @param {Partial<Omit<CicloMotor, "id"|"etapa">>} [opts]
 * @returns {CicloMotor}
 */
export function montarCiclo(id, etapa = "Intencao", opts = {}) {
  if (typeof id !== "string" || !id.trim()) {
    throw new TypeError("id obrigatório.");
  }
  if (!ehEtapaCiclo(etapa)) throw new TypeError(`Etapa inválida: ${etapa}`);
  const ciclo = {
    id: id.trim(),
    etapa,
    intencaoClara: opts.intencaoClara !== false,
    requerDespacho: opts.requerDespacho === true,
    exigeAprovacao: opts.exigeAprovacao === true,
    decisaoAprovacao:
      opts.decisaoAprovacao === undefined ? null : opts.decisaoAprovacao,
    estadoJob: opts.estadoJob === undefined ? null : opts.estadoJob,
    atualizadoEm: opts.atualizadoEm || new Date().toISOString()
  };
  if (opts.parecerId !== undefined) ciclo.parecerId = opts.parecerId;
  if (opts.jobId !== undefined) ciclo.jobId = opts.jobId;
  const v = validarCiclo(ciclo);
  if (!v.ok) throw new Error(v.mensagem);
  return v.ciclo;
}

/**
 * Tenta avançar o ciclo; devolve novo objecto ou erro (imutável).
 * @param {CicloMotor} ciclo
 * @param {EtapaCiclo} para
 * @param {Partial<CicloMotor>} [patch]
 * @returns {{ ok: true, ciclo: CicloMotor } | { ok: false, mensagem: string }}
 */
export function avancarCiclo(ciclo, para, patch = {}) {
  const base = validarCiclo(ciclo);
  if (!base.ok) return base;
  const ctx = {
    intencaoClara:
      patch.intencaoClara !== undefined
        ? patch.intencaoClara
        : base.ciclo.intencaoClara,
    requerDespacho:
      patch.requerDespacho !== undefined
        ? patch.requerDespacho
        : base.ciclo.requerDespacho,
    exigeAprovacao:
      patch.exigeAprovacao !== undefined
        ? patch.exigeAprovacao
        : base.ciclo.exigeAprovacao,
    decisaoAprovacao:
      patch.decisaoAprovacao !== undefined
        ? patch.decisaoAprovacao
        : base.ciclo.decisaoAprovacao,
    estadoJob:
      patch.estadoJob !== undefined ? patch.estadoJob : base.ciclo.estadoJob
  };
  const t = validarTransicaoCiclo(base.ciclo.etapa, para, ctx);
  if (!t.ok) return t;

  const proximo = {
    ...base.ciclo,
    ...patch,
    id: base.ciclo.id,
    etapa: para,
    atualizadoEm: new Date().toISOString()
  };
  if (para === "CriacaoDoJob" && proximo.estadoJob == null) {
    proximo.estadoJob = "pending";
  }
  return validarCiclo(proximo);
}
