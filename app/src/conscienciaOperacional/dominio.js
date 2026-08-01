/**
 * Domínio do Estado Executivo Atual — IMP-059 E1 / REQ-059 / ARQ-020.
 * Fontes F1–F8, prioridade P1–P7, modelo imutável e validações.
 * Sem agregador, Conversa, Núcleo, Motor, UI, Fila real, Classificador ou I/O.
 */

/** @typedef {"F1"|"F2"|"F3"|"F4"|"F5"|"F6"|"F7"|"F8"} IdFonteEstado */

/**
 * Prioridades canónicas ARQ-020 §5 (P4 agrupa Agent + Dispatcher).
 * @typedef {"P1"|"P2"|"P3"|"P4"|"P5"|"P6"|"P7"} NivelPrioridadeFonte
 */

/**
 * @typedef {"ocioso"|"activo"|"erro"|"desconhecido"} EstadoDispatcherResumo
 * @typedef {"ocioso"|"ocupado"|"erro"|"desconhecido"} EstadoAgentResumo
 * @typedef {"ocioso"|"em_curso"|"desconhecido"} EstadoCtoResumo
 */

/**
 * Resumo mínimo de Job (F1 / F2).
 * @typedef {object} JobResumo
 * @property {string} id
 * @property {string} titulo
 * @property {"pending"|"running"} status
 */

/**
 * Resumo mínimo de Gate pendente (F3).
 * @typedef {object} GateResumo
 * @property {string} gateId
 * @property {string} parecerId
 * @property {string|null} [cicloId]
 * @property {string|null} [resumo]
 */

/**
 * @typedef {object} DispatcherResumo
 * @property {EstadoDispatcherResumo} estado
 * @property {string|null} [detalhe]
 */

/**
 * @typedef {object} CtoResumo
 * @property {EstadoCtoResumo} estado
 * @property {boolean} emCurso
 * @property {string|null} [detalhe]
 */

/**
 * @typedef {object} AgentResumo
 * @property {EstadoAgentResumo} estado
 * @property {boolean} ocupado
 * @property {string|null} [detalhe]
 */

/**
 * @typedef {object} PainelResumo
 * @property {boolean} disponivel
 * @property {number} alertas
 * @property {string|null} [detalhe]
 */

/**
 * @typedef {object} FrenteActivaResumo
 * @property {string|null} id
 * @property {string|null} nome
 */

/**
 * Conflito de foco derivado (tipado; montagem fina em E2/E5).
 * @typedef {object} ConflitoFoco
 * @property {string} tipo
 * @property {IdFonteEstado[]} fontes
 * @property {string} resumo
 */

/**
 * Estado Executivo Atual — snapshot canónico V1 (ARQ-020 §4.2 / REQ-059 RF2).
 * @typedef {object} EstadoExecutivoAtual
 * @property {ReadonlyArray<JobResumo>} jobsPendentes
 * @property {ReadonlyArray<JobResumo>} jobsEmExecucao
 * @property {ReadonlyArray<GateResumo>} gatesPendentes
 * @property {Readonly<DispatcherResumo>} dispatcher
 * @property {Readonly<CtoResumo>} cto
 * @property {Readonly<AgentResumo>} agent
 * @property {Readonly<PainelResumo>} painel
 * @property {Readonly<FrenteActivaResumo>} frenteActiva
 * @property {ReadonlyArray<ConflitoFoco>} conflitosFoco
 */

/**
 * Catálogo das oito fontes mínimas (ARQ-020 §4.1 / REQ-059 RF2).
 * @type {ReadonlyArray<{ id: IdFonteEstado, chave: keyof EstadoExecutivoAtual, nome: string }>}
 */
export const FONTES_ESTADO_EXECUTIVO = Object.freeze([
  Object.freeze({ id: /** @type {IdFonteEstado} */ ("F1"), chave: /** @type {const} */ ("jobsPendentes"), nome: "Jobs pendentes" }),
  Object.freeze({ id: /** @type {IdFonteEstado} */ ("F2"), chave: /** @type {const} */ ("jobsEmExecucao"), nome: "Jobs em execução" }),
  Object.freeze({ id: /** @type {IdFonteEstado} */ ("F3"), chave: /** @type {const} */ ("gatesPendentes"), nome: "Gates pendentes" }),
  Object.freeze({ id: /** @type {IdFonteEstado} */ ("F4"), chave: /** @type {const} */ ("dispatcher"), nome: "Dispatcher" }),
  Object.freeze({ id: /** @type {IdFonteEstado} */ ("F5"), chave: /** @type {const} */ ("cto"), nome: "CTO" }),
  Object.freeze({ id: /** @type {IdFonteEstado} */ ("F6"), chave: /** @type {const} */ ("agent"), nome: "Agent" }),
  Object.freeze({ id: /** @type {IdFonteEstado} */ ("F7"), chave: /** @type {const} */ ("painel"), nome: "Painel de Orquestração" }),
  Object.freeze({ id: /** @type {IdFonteEstado} */ ("F8"), chave: /** @type {const} */ ("frenteActiva"), nome: "Frente activa" })
]);

/**
 * Ordem de prioridade P1–P7 (ARQ-020 §5 / REQ-059 RF11).
 * P4 agrupa Agent (F6) e Dispatcher (F4); empate → ambos no mesmo nível.
 * @type {ReadonlyArray<{ nivel: NivelPrioridadeFonte, fontes: ReadonlyArray<IdFonteEstado>, nome: string }>}
 */
export const PRIORIDADE_FONTES = Object.freeze([
  Object.freeze({
    nivel: /** @type {NivelPrioridadeFonte} */ ("P1"),
    fontes: Object.freeze(/** @type {IdFonteEstado[]} */ (["F3"])),
    nome: "Gates pendentes"
  }),
  Object.freeze({
    nivel: /** @type {NivelPrioridadeFonte} */ ("P2"),
    fontes: Object.freeze(/** @type {IdFonteEstado[]} */ (["F2"])),
    nome: "Jobs em execução"
  }),
  Object.freeze({
    nivel: /** @type {NivelPrioridadeFonte} */ ("P3"),
    fontes: Object.freeze(/** @type {IdFonteEstado[]} */ (["F1"])),
    nome: "Jobs pendentes"
  }),
  Object.freeze({
    nivel: /** @type {NivelPrioridadeFonte} */ ("P4"),
    fontes: Object.freeze(/** @type {IdFonteEstado[]} */ (["F6", "F4"])),
    nome: "Agent / Dispatcher"
  }),
  Object.freeze({
    nivel: /** @type {NivelPrioridadeFonte} */ ("P5"),
    fontes: Object.freeze(/** @type {IdFonteEstado[]} */ (["F5"])),
    nome: "CTO"
  }),
  Object.freeze({
    nivel: /** @type {NivelPrioridadeFonte} */ ("P6"),
    fontes: Object.freeze(/** @type {IdFonteEstado[]} */ (["F7"])),
    nome: "Painel"
  }),
  Object.freeze({
    nivel: /** @type {NivelPrioridadeFonte} */ ("P7"),
    fontes: Object.freeze(/** @type {IdFonteEstado[]} */ (["F8"])),
    nome: "Frente activa"
  })
]);

/** @type {ReadonlyArray<IdFonteEstado>} */
export const IDS_FONTES = Object.freeze(
  FONTES_ESTADO_EXECUTIVO.map((f) => f.id)
);

/** @type {ReadonlyArray<NivelPrioridadeFonte>} */
export const NIVEIS_PRIORIDADE = Object.freeze(
  PRIORIDADE_FONTES.map((p) => p.nivel)
);

/** @type {ReadonlyArray<EstadoDispatcherResumo>} */
export const ESTADOS_DISPATCHER = Object.freeze([
  "ocioso",
  "activo",
  "erro",
  "desconhecido"
]);

/** @type {ReadonlyArray<EstadoAgentResumo>} */
export const ESTADOS_AGENT = Object.freeze([
  "ocioso",
  "ocupado",
  "erro",
  "desconhecido"
]);

/** @type {ReadonlyArray<EstadoCtoResumo>} */
export const ESTADOS_CTO = Object.freeze([
  "ocioso",
  "em_curso",
  "desconhecido"
]);

/**
 * @template T
 * @param {T} value
 * @returns {T}
 */
function deepFreeze(value) {
  if (value === null || typeof value !== "object" || Object.isFrozen(value)) {
    return value;
  }
  for (const key of Object.keys(value)) {
    // @ts-expect-error — freeze recursivo
    deepFreeze(value[key]);
  }
  return Object.freeze(value);
}

/**
 * @param {string} id
 * @returns {id is IdFonteEstado}
 */
export function ehIdFonte(id) {
  return IDS_FONTES.includes(/** @type {IdFonteEstado} */ (id));
}

/**
 * @param {string} nivel
 * @returns {nivel is NivelPrioridadeFonte}
 */
export function ehNivelPrioridade(nivel) {
  return NIVEIS_PRIORIDADE.includes(/** @type {NivelPrioridadeFonte} */ (nivel));
}

/**
 * Prioridade canónica de uma fonte (P1…P7).
 * @param {IdFonteEstado|string} idFonte
 * @returns {NivelPrioridadeFonte|null}
 */
export function prioridadeDaFonte(idFonte) {
  if (!ehIdFonte(idFonte)) return null;
  for (const faixa of PRIORIDADE_FONTES) {
    if (faixa.fontes.includes(idFonte)) return faixa.nivel;
  }
  return null;
}

/**
 * Compara duas fontes: negativo se `a` é mais vinculativa que `b` (P1 < P2 …).
 * Empate (mesmo nível, ex. F4/F6 em P4) → 0.
 * @param {IdFonteEstado|string} a
 * @param {IdFonteEstado|string} b
 */
export function compararPrioridadeFontes(a, b) {
  const pa = prioridadeDaFonte(a);
  const pb = prioridadeDaFonte(b);
  if (pa == null || pb == null) {
    throw new TypeError(`Fonte inválida na comparação: ${a} / ${b}`);
  }
  return NIVEIS_PRIORIDADE.indexOf(pa) - NIVEIS_PRIORIDADE.indexOf(pb);
}

/**
 * @param {unknown} job
 * @returns {{ ok: true, job: JobResumo } | { ok: false, erro: string }}
 */
export function validarJobResumo(job) {
  if (!job || typeof job !== "object") {
    return { ok: false, erro: "JobResumo deve ser objecto" };
  }
  const j = /** @type {Record<string, unknown>} */ (job);
  if (typeof j.id !== "string" || j.id.trim() === "") {
    return { ok: false, erro: "JobResumo.id inválido" };
  }
  if (typeof j.titulo !== "string") {
    return { ok: false, erro: "JobResumo.titulo inválido" };
  }
  if (j.status !== "pending" && j.status !== "running") {
    return { ok: false, erro: "JobResumo.status deve ser pending|running" };
  }
  return {
    ok: true,
    job: Object.freeze({
      id: j.id.trim(),
      titulo: j.titulo,
      status: /** @type {"pending"|"running"} */ (j.status)
    })
  };
}

/**
 * @param {unknown} gate
 * @returns {{ ok: true, gate: GateResumo } | { ok: false, erro: string }}
 */
export function validarGateResumo(gate) {
  if (!gate || typeof gate !== "object") {
    return { ok: false, erro: "GateResumo deve ser objecto" };
  }
  const g = /** @type {Record<string, unknown>} */ (gate);
  if (typeof g.gateId !== "string" || g.gateId.trim() === "") {
    return { ok: false, erro: "GateResumo.gateId inválido" };
  }
  if (typeof g.parecerId !== "string" || g.parecerId.trim() === "") {
    return { ok: false, erro: "GateResumo.parecerId inválido" };
  }
  const cicloId =
    g.cicloId == null
      ? null
      : typeof g.cicloId === "string"
        ? g.cicloId
        : null;
  if (g.cicloId != null && cicloId === null) {
    return { ok: false, erro: "GateResumo.cicloId inválido" };
  }
  const resumo =
    g.resumo == null
      ? null
      : typeof g.resumo === "string"
        ? g.resumo
        : null;
  if (g.resumo != null && resumo === null) {
    return { ok: false, erro: "GateResumo.resumo inválido" };
  }
  return {
    ok: true,
    gate: Object.freeze({
      gateId: g.gateId.trim(),
      parecerId: g.parecerId.trim(),
      cicloId,
      resumo
    })
  };
}

/**
 * @param {unknown} conflito
 * @returns {{ ok: true, conflito: ConflitoFoco } | { ok: false, erro: string }}
 */
export function validarConflitoFoco(conflito) {
  if (!conflito || typeof conflito !== "object") {
    return { ok: false, erro: "ConflitoFoco deve ser objecto" };
  }
  const c = /** @type {Record<string, unknown>} */ (conflito);
  if (typeof c.tipo !== "string" || c.tipo.trim() === "") {
    return { ok: false, erro: "ConflitoFoco.tipo inválido" };
  }
  if (typeof c.resumo !== "string") {
    return { ok: false, erro: "ConflitoFoco.resumo inválido" };
  }
  if (!Array.isArray(c.fontes) || c.fontes.length === 0) {
    return { ok: false, erro: "ConflitoFoco.fontes deve ser array não vazio" };
  }
  /** @type {IdFonteEstado[]} */
  const fontes = [];
  for (const f of c.fontes) {
    if (!ehIdFonte(/** @type {string} */ (f))) {
      return { ok: false, erro: `ConflitoFoco.fonte inválida: ${f}` };
    }
    fontes.push(/** @type {IdFonteEstado} */ (f));
  }
  return {
    ok: true,
    conflito: Object.freeze({
      tipo: c.tipo.trim(),
      fontes: Object.freeze(fontes),
      resumo: c.resumo
    })
  };
}

/**
 * Estado ocioso / vazio canónico (base RF7 / E1-CA3).
 * @returns {EstadoExecutivoAtual}
 */
export function estadoExecutivoVazio() {
  return criarEstadoExecutivo({});
}

/**
 * Cria snapshot imutável do Estado Executivo Atual.
 * @param {Partial<{
 *   jobsPendentes: unknown[],
 *   jobsEmExecucao: unknown[],
 *   gatesPendentes: unknown[],
 *   dispatcher: Partial<DispatcherResumo>|null,
 *   cto: Partial<CtoResumo>|null,
 *   agent: Partial<AgentResumo>|null,
 *   painel: Partial<PainelResumo>|null,
 *   frenteActiva: Partial<FrenteActivaResumo>|null,
 *   conflitosFoco: unknown[]
 * }>|null|undefined} parcial
 * @returns {EstadoExecutivoAtual}
 */
export function criarEstadoExecutivo(parcial = {}) {
  const p = parcial && typeof parcial === "object" ? parcial : {};

  /** @type {JobResumo[]} */
  const jobsPendentes = [];
  for (const item of Array.isArray(p.jobsPendentes) ? p.jobsPendentes : []) {
    const v = validarJobResumo(item);
    if (!v.ok) throw new TypeError(v.erro);
    if (v.job.status !== "pending") {
      throw new TypeError("jobsPendentes só aceita status pending");
    }
    jobsPendentes.push(v.job);
  }

  /** @type {JobResumo[]} */
  const jobsEmExecucao = [];
  for (const item of Array.isArray(p.jobsEmExecucao) ? p.jobsEmExecucao : []) {
    const v = validarJobResumo(item);
    if (!v.ok) throw new TypeError(v.erro);
    if (v.job.status !== "running") {
      throw new TypeError("jobsEmExecucao só aceita status running");
    }
    jobsEmExecucao.push(v.job);
  }

  /** @type {GateResumo[]} */
  const gatesPendentes = [];
  for (const item of Array.isArray(p.gatesPendentes) ? p.gatesPendentes : []) {
    const v = validarGateResumo(item);
    if (!v.ok) throw new TypeError(v.erro);
    gatesPendentes.push(v.gate);
  }

  const dispIn = p.dispatcher && typeof p.dispatcher === "object" ? p.dispatcher : {};
  const estadoDisp =
    typeof dispIn.estado === "string" &&
    ESTADOS_DISPATCHER.includes(/** @type {EstadoDispatcherResumo} */ (dispIn.estado))
      ? /** @type {EstadoDispatcherResumo} */ (dispIn.estado)
      : /** @type {EstadoDispatcherResumo} */ ("ocioso");
  const dispatcher = Object.freeze({
    estado: estadoDisp,
    detalhe:
      dispIn.detalhe == null
        ? null
        : typeof dispIn.detalhe === "string"
          ? dispIn.detalhe
          : null
  });

  const ctoIn = p.cto && typeof p.cto === "object" ? p.cto : {};
  const estadoCto =
    typeof ctoIn.estado === "string" &&
    ESTADOS_CTO.includes(/** @type {EstadoCtoResumo} */ (ctoIn.estado))
      ? /** @type {EstadoCtoResumo} */ (ctoIn.estado)
      : ctoIn.emCurso === true
        ? /** @type {EstadoCtoResumo} */ ("em_curso")
        : /** @type {EstadoCtoResumo} */ ("ocioso");
  const cto = Object.freeze({
    estado: estadoCto,
    emCurso: ctoIn.emCurso === true || estadoCto === "em_curso",
    detalhe:
      ctoIn.detalhe == null
        ? null
        : typeof ctoIn.detalhe === "string"
          ? ctoIn.detalhe
          : null
  });

  const agentIn = p.agent && typeof p.agent === "object" ? p.agent : {};
  const estadoAgent =
    typeof agentIn.estado === "string" &&
    ESTADOS_AGENT.includes(/** @type {EstadoAgentResumo} */ (agentIn.estado))
      ? /** @type {EstadoAgentResumo} */ (agentIn.estado)
      : agentIn.ocupado === true
        ? /** @type {EstadoAgentResumo} */ ("ocupado")
        : /** @type {EstadoAgentResumo} */ ("ocioso");
  const agent = Object.freeze({
    estado: estadoAgent,
    ocupado: agentIn.ocupado === true || estadoAgent === "ocupado",
    detalhe:
      agentIn.detalhe == null
        ? null
        : typeof agentIn.detalhe === "string"
          ? agentIn.detalhe
          : null
  });

  const painelIn = p.painel && typeof p.painel === "object" ? p.painel : {};
  const alertas =
    typeof painelIn.alertas === "number" &&
    Number.isFinite(painelIn.alertas) &&
    painelIn.alertas >= 0
      ? Math.floor(painelIn.alertas)
      : 0;
  const painel = Object.freeze({
    disponivel: painelIn.disponivel === true,
    alertas,
    detalhe:
      painelIn.detalhe == null
        ? null
        : typeof painelIn.detalhe === "string"
          ? painelIn.detalhe
          : null
  });

  const frenteIn =
    p.frenteActiva && typeof p.frenteActiva === "object" ? p.frenteActiva : {};
  const frenteActiva = Object.freeze({
    id:
      frenteIn.id == null
        ? null
        : typeof frenteIn.id === "string"
          ? frenteIn.id
          : null,
    nome:
      frenteIn.nome == null
        ? null
        : typeof frenteIn.nome === "string"
          ? frenteIn.nome
          : null
  });

  /** @type {ConflitoFoco[]} */
  const conflitosFoco = [];
  for (const item of Array.isArray(p.conflitosFoco) ? p.conflitosFoco : []) {
    const v = validarConflitoFoco(item);
    if (!v.ok) throw new TypeError(v.erro);
    conflitosFoco.push(v.conflito);
  }

  return deepFreeze({
    jobsPendentes: Object.freeze([...jobsPendentes]),
    jobsEmExecucao: Object.freeze([...jobsEmExecucao]),
    gatesPendentes: Object.freeze([...gatesPendentes]),
    dispatcher,
    cto,
    agent,
    painel,
    frenteActiva,
    conflitosFoco: Object.freeze([...conflitosFoco])
  });
}

/**
 * @param {unknown} estado
 * @returns {{ ok: true, estado: EstadoExecutivoAtual } | { ok: false, erros: string[] }}
 */
export function validarEstadoExecutivo(estado) {
  /** @type {string[]} */
  const erros = [];
  if (!estado || typeof estado !== "object") {
    return { ok: false, erros: ["EstadoExecutivoAtual deve ser objecto"] };
  }
  const e = /** @type {Record<string, unknown>} */ (estado);

  for (const fonte of FONTES_ESTADO_EXECUTIVO) {
    if (!(fonte.chave in e)) {
      erros.push(`Fonte ${fonte.id} (${fonte.chave}) ausente`);
    }
  }
  if (!("conflitosFoco" in e)) {
    erros.push("conflitosFoco ausente");
  }

  if (!Array.isArray(e.jobsPendentes)) erros.push("jobsPendentes deve ser array");
  else {
    for (const j of e.jobsPendentes) {
      const v = validarJobResumo(j);
      if (!v.ok) erros.push(v.erro);
      else if (v.job.status !== "pending") {
        erros.push("jobsPendentes só aceita status pending");
      }
    }
  }

  if (!Array.isArray(e.jobsEmExecucao)) erros.push("jobsEmExecucao deve ser array");
  else {
    for (const j of e.jobsEmExecucao) {
      const v = validarJobResumo(j);
      if (!v.ok) erros.push(v.erro);
      else if (v.job.status !== "running") {
        erros.push("jobsEmExecucao só aceita status running");
      }
    }
  }

  if (!Array.isArray(e.gatesPendentes)) erros.push("gatesPendentes deve ser array");
  else {
    for (const g of e.gatesPendentes) {
      const v = validarGateResumo(g);
      if (!v.ok) erros.push(v.erro);
    }
  }

  if (!e.dispatcher || typeof e.dispatcher !== "object") {
    erros.push("dispatcher inválido");
  } else {
    const d = /** @type {Record<string, unknown>} */ (e.dispatcher);
    if (
      typeof d.estado !== "string" ||
      !ESTADOS_DISPATCHER.includes(/** @type {EstadoDispatcherResumo} */ (d.estado))
    ) {
      erros.push("dispatcher.estado inválido");
    }
  }

  if (!e.cto || typeof e.cto !== "object") {
    erros.push("cto inválido");
  } else {
    const c = /** @type {Record<string, unknown>} */ (e.cto);
    if (
      typeof c.estado !== "string" ||
      !ESTADOS_CTO.includes(/** @type {EstadoCtoResumo} */ (c.estado))
    ) {
      erros.push("cto.estado inválido");
    }
    if (typeof c.emCurso !== "boolean") erros.push("cto.emCurso deve ser boolean");
  }

  if (!e.agent || typeof e.agent !== "object") {
    erros.push("agent inválido");
  } else {
    const a = /** @type {Record<string, unknown>} */ (e.agent);
    if (
      typeof a.estado !== "string" ||
      !ESTADOS_AGENT.includes(/** @type {EstadoAgentResumo} */ (a.estado))
    ) {
      erros.push("agent.estado inválido");
    }
    if (typeof a.ocupado !== "boolean") erros.push("agent.ocupado deve ser boolean");
  }

  if (!e.painel || typeof e.painel !== "object") {
    erros.push("painel inválido");
  } else {
    const p = /** @type {Record<string, unknown>} */ (e.painel);
    if (typeof p.disponivel !== "boolean") {
      erros.push("painel.disponivel deve ser boolean");
    }
    if (typeof p.alertas !== "number" || !Number.isFinite(p.alertas) || p.alertas < 0) {
      erros.push("painel.alertas inválido");
    }
  }

  if (!e.frenteActiva || typeof e.frenteActiva !== "object") {
    erros.push("frenteActiva inválida");
  } else {
    const f = /** @type {Record<string, unknown>} */ (e.frenteActiva);
    if (f.id != null && typeof f.id !== "string") erros.push("frenteActiva.id inválido");
    if (f.nome != null && typeof f.nome !== "string") {
      erros.push("frenteActiva.nome inválido");
    }
  }

  if (!Array.isArray(e.conflitosFoco)) erros.push("conflitosFoco deve ser array");
  else {
    for (const c of e.conflitosFoco) {
      const v = validarConflitoFoco(c);
      if (!v.ok) erros.push(v.erro);
    }
  }

  if (erros.length > 0) return { ok: false, erros };

  try {
    return { ok: true, estado: criarEstadoExecutivo(/** @type {any} */ (e)) };
  } catch (err) {
    return {
      ok: false,
      erros: [err instanceof Error ? err.message : String(err)]
    };
  }
}

/**
 * Fonte com sinal operacionalmente activo (ocupação / pendência / alerta).
 * Frente activa (F8) sozinha **não** conta como lastro operacional forçado (RF7 / E1-CA3).
 * @param {EstadoExecutivoAtual} estado
 * @param {IdFonteEstado} idFonte
 */
export function fonteEstaActiva(estado, idFonte) {
  if (!estado || !ehIdFonte(idFonte)) return false;
  switch (idFonte) {
    case "F1":
      return estado.jobsPendentes.length > 0;
    case "F2":
      return estado.jobsEmExecucao.length > 0;
    case "F3":
      return estado.gatesPendentes.length > 0;
    case "F4":
      return (
        estado.dispatcher.estado === "activo" ||
        estado.dispatcher.estado === "erro"
      );
    case "F5":
      return estado.cto.emCurso === true || estado.cto.estado === "em_curso";
    case "F6":
      return (
        estado.agent.ocupado === true ||
        estado.agent.estado === "ocupado" ||
        estado.agent.estado === "erro"
      );
    case "F7":
      return estado.painel.alertas > 0;
    case "F8":
      return Boolean(estado.frenteActiva?.id || estado.frenteActiva?.nome);
    default:
      return false;
  }
}

/**
 * Contexto operacional relevante para lastro obrigatório em C2/C3 (RF7 / E1-CA3).
 * F8 (frente) e F7 sem alertas **não** bastam sozinhos.
 * @param {EstadoExecutivoAtual|null|undefined} estado
 */
export function temContextoOperacionalRelevante(estado) {
  if (!estado) return false;
  const v = validarEstadoExecutivo(estado);
  if (!v.ok) return false;
  const e = v.estado;
  return (
    fonteEstaActiva(e, "F3") ||
    fonteEstaActiva(e, "F2") ||
    fonteEstaActiva(e, "F1") ||
    fonteEstaActiva(e, "F6") ||
    fonteEstaActiva(e, "F4") ||
    fonteEstaActiva(e, "F5") ||
    fonteEstaActiva(e, "F7")
  );
}

/**
 * Lista fontes activas ordenadas por prioridade (P1 → P7).
 * Empate no mesmo nível preserva ordem declarada em PRIORIDADE_FONTES.fontes.
 * @param {EstadoExecutivoAtual} estado
 * @param {{ incluirFrente?: boolean }} [opts] — se true, inclui F8 quando activa (default false no lastro forçado)
 * @returns {ReadonlyArray<{ id: IdFonteEstado, nivel: NivelPrioridadeFonte, nome: string }>}
 */
export function priorizarFontes(estado, opts = {}) {
  const incluirFrente = opts.incluirFrente === true;
  const v = validarEstadoExecutivo(estado);
  if (!v.ok) {
    throw new TypeError(`Estado inválido: ${v.erros.join("; ")}`);
  }
  const e = v.estado;
  /** @type {{ id: IdFonteEstado, nivel: NivelPrioridadeFonte, nome: string }[]} */
  const activos = [];
  for (const faixa of PRIORIDADE_FONTES) {
    for (const id of faixa.fontes) {
      if (id === "F8" && !incluirFrente) continue;
      if (!fonteEstaActiva(e, id)) continue;
      const meta = FONTES_ESTADO_EXECUTIVO.find((f) => f.id === id);
      activos.push(
        Object.freeze({
          id,
          nivel: faixa.nivel,
          nome: meta?.nome ?? id
        })
      );
    }
  }
  return Object.freeze(activos);
}

/**
 * Fonte de maior prioridade activa (P1 primeiro), ou null se nenhuma.
 * @param {EstadoExecutivoAtual} estado
 * @param {{ incluirFrente?: boolean }} [opts]
 */
export function fontePrioritaria(estado, opts = {}) {
  const lista = priorizarFontes(estado, opts);
  return lista.length > 0 ? lista[0] : null;
}
