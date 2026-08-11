/**
 * Agregador da Consciência Operacional — IMP-059 E2 / REQ-059 / ARQ-020.
 * Lê fontes injectáveis F1–F8, degrada por fonte, produz Estado Executivo imutável.
 * Somente leitura: não altera fontes, não publica Jobs, não muta Motor/Gate.
 * Sem Conversa, Núcleo, UI ou I/O próprio.
 */

import {
  IDS_FONTES,
  FONTES_ESTADO_EXECUTIVO,
  PRIORIDADE_FONTES,
  criarEstadoExecutivo,
  validarEstadoExecutivo,
  validarJobResumo,
  validarGateResumo,
  temContextoOperacionalRelevante,
  priorizarFontes,
  fonteEstaActiva,
  prioridadeDaFonte
} from "./dominio.js";

/**
 * @typedef {import("./dominio.js").IdFonteEstado} IdFonteEstado
 * @typedef {import("./dominio.js").EstadoExecutivoAtual} EstadoExecutivoAtual
 * @typedef {import("./dominio.js").NivelPrioridadeFonte} NivelPrioridadeFonte
 */

/**
 * Resultado da leitura de uma fonte.
 * @typedef {object} DiagnosticoFonte
 * @property {boolean} ok
 * @property {boolean} degradada
 * @property {boolean} activa
 * @property {NivelPrioridadeFonte|null} nivel
 * @property {string|null} [erro]
 * @property {"lida"|"ausente"|"degradada"|"invalida"} origem
 */

/**
 * Pacote de consulta consolidada (RNF3).
 * @typedef {object} ConsultaEstadoExecutivo
 * @property {EstadoExecutivoAtual} estado
 * @property {string} consultadoEm — ISO-8601
 * @property {boolean} temContextoRelevante
 * @property {ReadonlyArray<{ id: IdFonteEstado, nivel: NivelPrioridadeFonte, nome: string }>} prioridadeActiva
 * @property {Readonly<{
 *   fontes: Readonly<Record<IdFonteEstado, DiagnosticoFonte>>,
 *   fontesDegradadas: ReadonlyArray<IdFonteEstado>,
 *   ordemPrioridade: ReadonlyArray<NivelPrioridadeFonte>
 * }>} diagnostico
 */

/**
 * Leitores injectáveis por id de fonte (F1–F8).
 * Podem ser síncronos ou devolver Promise; falha → degradação dessa fonte.
 * @typedef {Partial<Record<IdFonteEstado, () => unknown | Promise<unknown>>>} LeitoresFontes
 */

/** Defaults ociosos quando fonte ausente ou degradada (não inventam Jobs/Gates). */
const DEFAULTS_POR_FONTE = Object.freeze({
  F1: Object.freeze([]),
  F2: Object.freeze([]),
  F3: Object.freeze([]),
  F4: Object.freeze({ estado: "ocioso", detalhe: null }),
  F5: Object.freeze({ estado: "ocioso", emCurso: false, detalhe: null }),
  F6: Object.freeze({ estado: "ocioso", ocupado: false, detalhe: null }),
  F7: Object.freeze({ disponivel: false, alertas: 0, detalhe: null }),
  F8: Object.freeze({ id: null, nome: null })
});

/**
 * @param {unknown} valor
 * @returns {unknown}
 */
function clonarLeitura(valor) {
  if (valor == null) return valor;
  if (Array.isArray(valor)) {
    return valor.map((item) =>
      item && typeof item === "object" ? { ...item } : item
    );
  }
  if (typeof valor === "object") {
    return { ...valor };
  }
  return valor;
}

/**
 * Normaliza payload bruto de uma fonte para o campo do snapshot.
 * @param {IdFonteEstado} id
 * @param {unknown} bruto
 * @returns {{ ok: true, valor: unknown } | { ok: false, erro: string }}
 */
export function normalizarLeituraFonte(id, bruto) {
  switch (id) {
    case "F1": {
      if (!Array.isArray(bruto)) {
        return { ok: false, erro: "F1 deve ser array de JobResumo" };
      }
      /** @type {object[]} */
      const jobs = [];
      for (const item of bruto) {
        const v = validarJobResumo(item);
        if (!v.ok) return { ok: false, erro: `F1: ${v.erro}` };
        if (v.job.status !== "pending") {
          return { ok: false, erro: "F1: status deve ser pending" };
        }
        jobs.push({ ...v.job });
      }
      return { ok: true, valor: jobs };
    }
    case "F2": {
      if (!Array.isArray(bruto)) {
        return { ok: false, erro: "F2 deve ser array de JobResumo" };
      }
      /** @type {object[]} */
      const jobs = [];
      for (const item of bruto) {
        const v = validarJobResumo(item);
        if (!v.ok) return { ok: false, erro: `F2: ${v.erro}` };
        if (
          v.job.status !== "running" &&
          v.job.status !== "dispatched" &&
          v.job.status !== "result" &&
          v.job.status !== "needs_correction"
        ) {
          return {
            ok: false,
            erro: "F2: status deve ser dispatched|running|result|needs_correction"
          };
        }
        jobs.push({ ...v.job });
      }
      return { ok: true, valor: jobs };
    }
    case "F3": {
      if (!Array.isArray(bruto)) {
        return { ok: false, erro: "F3 deve ser array de GateResumo" };
      }
      /** @type {object[]} */
      const gates = [];
      for (const item of bruto) {
        const v = validarGateResumo(item);
        if (!v.ok) return { ok: false, erro: `F3: ${v.erro}` };
        gates.push({ ...v.gate });
      }
      return { ok: true, valor: gates };
    }
    case "F4": {
      if (!bruto || typeof bruto !== "object") {
        return { ok: false, erro: "F4 deve ser objecto DispatcherResumo" };
      }
      return { ok: true, valor: { .../** @type {object} */ (bruto) } };
    }
    case "F5": {
      if (!bruto || typeof bruto !== "object") {
        return { ok: false, erro: "F5 deve ser objecto CtoResumo" };
      }
      return { ok: true, valor: { .../** @type {object} */ (bruto) } };
    }
    case "F6": {
      if (!bruto || typeof bruto !== "object") {
        return { ok: false, erro: "F6 deve ser objecto AgentResumo" };
      }
      return { ok: true, valor: { .../** @type {object} */ (bruto) } };
    }
    case "F7": {
      if (!bruto || typeof bruto !== "object") {
        return { ok: false, erro: "F7 deve ser objecto PainelResumo" };
      }
      return { ok: true, valor: { .../** @type {object} */ (bruto) } };
    }
    case "F8": {
      if (!bruto || typeof bruto !== "object") {
        return { ok: false, erro: "F8 deve ser objecto FrenteActivaResumo" };
      }
      return { ok: true, valor: { .../** @type {object} */ (bruto) } };
    }
    default:
      return { ok: false, erro: `Fonte desconhecida: ${id}` };
  }
}

/**
 * Chave do snapshot para o id de fonte.
 * @param {IdFonteEstado} id
 */
function chaveSnapshot(id) {
  const meta = FONTES_ESTADO_EXECUTIVO.find((f) => f.id === id);
  return meta?.chave ?? null;
}

/**
 * Lê uma fonte com degradação isolada (RNF4 / E2-CA2).
 * @param {IdFonteEstado} id
 * @param {(() => unknown | Promise<unknown>)|undefined} leitor
 * @returns {Promise<{
 *   valor: unknown,
 *   diagnostico: DiagnosticoFonte
 * }>}
 */
async function lerFonteComDegradacao(id, leitor) {
  const nivel = prioridadeDaFonte(id);
  if (typeof leitor !== "function") {
    return {
      valor: DEFAULTS_POR_FONTE[id],
      diagnostico: Object.freeze({
        ok: true,
        degradada: false,
        activa: false,
        nivel,
        erro: null,
        origem: /** @type {const} */ ("ausente")
      })
    };
  }

  try {
    const bruto = await leitor();
    const clonado = clonarLeitura(bruto);
    const norm = normalizarLeituraFonte(id, clonado);
    if (!norm.ok) {
      return {
        valor: DEFAULTS_POR_FONTE[id],
        diagnostico: Object.freeze({
          ok: false,
          degradada: true,
          activa: false,
          nivel,
          erro: norm.erro,
          origem: /** @type {const} */ ("invalida")
        })
      };
    }
    return {
      valor: norm.valor,
      diagnostico: Object.freeze({
        ok: true,
        degradada: false,
        activa: false,
        nivel,
        erro: null,
        origem: /** @type {const} */ ("lida")
      })
    };
  } catch (err) {
    return {
      valor: DEFAULTS_POR_FONTE[id],
      diagnostico: Object.freeze({
        ok: false,
        degradada: true,
        activa: false,
        nivel,
        erro: err instanceof Error ? err.message : String(err),
        origem: /** @type {const} */ ("degradada")
      })
    };
  }
}

/**
 * Agrega F1–F8 num Estado Executivo Atual (somente leitura).
 *
 * @param {{
 *   leitores?: LeitoresFontes,
 *   agora?: () => string,
 *   conflitosFoco?: unknown[]
 * }} [opts]
 * @returns {Promise<ConsultaEstadoExecutivo>}
 */
export async function agregarEstadoExecutivo(opts = {}) {
  const leitores = opts.leitores && typeof opts.leitores === "object" ? opts.leitores : {};
  const agora =
    typeof opts.agora === "function"
      ? opts.agora
      : () => new Date().toISOString();
  const consultadoEm = agora();

  /** @type {Record<string, unknown>} */
  const parcial = {};
  /** @type {Record<string, DiagnosticoFonte>} */
  const diagFontes = {};
  /** @type {IdFonteEstado[]} */
  const degradadas = [];

  // Ordem de leitura segue prioridade P1–P7 (aplicação integral da E1).
  /** @type {IdFonteEstado[]} */
  const ordemLeitura = [];
  for (const faixa of PRIORIDADE_FONTES) {
    for (const id of faixa.fontes) {
      if (!ordemLeitura.includes(id)) ordemLeitura.push(id);
    }
  }
  for (const id of IDS_FONTES) {
    if (!ordemLeitura.includes(id)) ordemLeitura.push(id);
  }

  for (const id of ordemLeitura) {
    const { valor, diagnostico } = await lerFonteComDegradacao(
      id,
      leitores[id]
    );
    const chave = chaveSnapshot(id);
    if (chave) parcial[chave] = valor;
    diagFontes[id] = diagnostico;
    if (diagnostico.degradada) degradadas.push(id);
  }

  if (Array.isArray(opts.conflitosFoco)) {
    parcial.conflitosFoco = opts.conflitosFoco;
  }

  const estado = criarEstadoExecutivo(parcial);
  const validacao = validarEstadoExecutivo(estado);
  if (!validacao.ok) {
    throw new TypeError(
      `Agregação produziu estado inválido: ${validacao.erros.join("; ")}`
    );
  }

  /** @type {Record<string, DiagnosticoFonte>} */
  const diagComActiva = {};
  for (const id of IDS_FONTES) {
    const base = diagFontes[id];
    diagComActiva[id] = Object.freeze({
      ...base,
      activa: !base.degradada && fonteEstaActiva(estado, id)
    });
  }

  const prioridadeActiva = priorizarFontes(estado, { incluirFrente: true });
  const temContextoRelevante = temContextoOperacionalRelevante(estado);

  const consulta = Object.freeze({
    estado,
    consultadoEm,
    temContextoRelevante,
    prioridadeActiva,
    diagnostico: Object.freeze({
      fontes: Object.freeze(diagComActiva),
      fontesDegradadas: Object.freeze([...degradadas]),
      ordemPrioridade: Object.freeze(
        PRIORIDADE_FONTES.map((p) => p.nivel)
      )
    })
  });

  return consulta;
}

/**
 * Factory do agregador (API estável para E3+).
 * @param {{
 *   leitores?: LeitoresFontes,
 *   agora?: () => string
 * }} [config]
 */
export function criarAgregadorConsciencia(config = {}) {
  const leitoresBase =
    config.leitores && typeof config.leitores === "object"
      ? { ...config.leitores }
      : {};
  const agora = config.agora;

  return Object.freeze({
    /**
     * @param {{
     *   leitores?: LeitoresFontes,
     *   conflitosFoco?: unknown[]
     * }} [override]
     */
    async consultar(override = {}) {
      return agregarEstadoExecutivo({
        leitores: { ...leitoresBase, ...(override.leitores || {}) },
        agora,
        conflitosFoco: override.conflitosFoco
      });
    }
  });
}
