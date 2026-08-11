/**
 * Acompanhamento Job → CEO conversacional (Teste 1 / ARQ-017 Monitoramento).
 * Observa Jobs persistidos até estado terminal; sem segundo watcher.
 * Fonte de verdade: Job na fila. Consciência lê; Conversação só compõe.
 */

import { ehEstadoJobTerminal } from "./dominio.js";
import {
  montarMensagemResultado,
  sintetizarResultadoJob,
  tickObservadorJob
} from "./resultadoEncerramento.js";

/** Estados que mantêm o acompanhamento aberto (≠ conclusão). */
export const ESTADOS_ACOMPANHAMENTO_ABERTO = Object.freeze([
  "pending",
  "dispatched",
  "running",
  "result",
  "needs_correction"
]);

/**
 * Estados adoptáveis da fila no turno EE (Teste 3).
 * Exclui pending (handoff local) e terminais históricos.
 */
export const ESTADOS_ADOTAVEIS_FILA = Object.freeze([
  "dispatched",
  "running",
  "result",
  "needs_correction"
]);

/** Estados que encerram o acompanhamento. */
export const ESTADOS_ACOMPANHAMENTO_TERMINAL = Object.freeze([
  "completed",
  "failed",
  "cancelled"
]);

/**
 * Normaliza rótulo de projecto/COA para comparação.
 * @param {unknown} v
 */
export function normalizarRotuloMissao(v) {
  return String(v || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

/**
 * Equivalência de âmbitos (id/nome/aliases MG2).
 * @param {unknown} a
 * @param {unknown} b
 */
export function missaoEquivalente(a, b) {
  const na = normalizarRotuloMissao(a);
  const nb = normalizarRotuloMissao(b);
  if (!na || !nb) return false;
  if (na === nb) return true;
  const mg2 = (x) => /prj-mg2|coa-mg2|motoboy\s*game\s*2|\bmg2\b/.test(x);
  return mg2(na) && mg2(nb);
}

/**
 * Projecto declarado no Job (string id/nome ou null se órfão).
 * Preferência: campo `projeto` / aliases de id.
 * @param {object|null|undefined} job
 * @returns {string|null}
 */
export function projectoDoJob(job) {
  if (!job || typeof job !== "object") return null;
  const raw =
    job.projeto ??
    job.project ??
    job.coaId ??
    job.ambitoCoa ??
    null;
  if (raw == null) return null;
  if (typeof raw === "object") {
    const id = raw.id != null ? String(raw.id).trim() : "";
    const nome = raw.nome != null ? String(raw.nome).trim() : "";
    return id || nome || null;
  }
  const s = String(raw).trim();
  return s || null;
}

/**
 * Correção 8 — nome humano estável do projecto no Job (recuperável se o ID sumir do catálogo).
 * @param {object|null|undefined} job
 * @returns {string|null}
 */
export function nomeProjetoDoJob(job) {
  if (!job || typeof job !== "object") return null;
  if (job.projetoNome != null && String(job.projetoNome).trim()) {
    return String(job.projetoNome).trim();
  }
  const raw = job.projeto ?? job.project ?? null;
  if (raw && typeof raw === "object") {
    const nome = raw.nome != null ? String(raw.nome).trim() : "";
    if (nome) return nome;
  }
  if (typeof raw === "string") {
    const s = raw.trim();
    // Nome humano (não id prj-/coa-)
    if (s && !/^prj-/i.test(s) && !/^coa-/i.test(s)) return s;
  }
  return null;
}

/**
 * Job pertence à missão activa?
 * - Sem missão → true (compat testes / sem COA).
 * - Job com projecto (id) ou projetoNome → só se equivalente à missão.
 * - Job órfão (sem projecto/nome) → só se idsPermitidos incluir o Job
 *   (já adoptado/registado nesta sessão — não readopta histórico global).
 *
 * @param {object|null|undefined} job
 * @param {{ id?: string|null, nome?: string|null }|null|undefined} missao
 * @param {{ idsPermitidos?: Iterable<string>|null }} [opts]
 */
export function jobPertenceAMissaoActiva(job, missao, opts = {}) {
  if (!missao || (missao.id == null && missao.nome == null)) return true;
  if (!job || typeof job !== "object") return false;

  const proj = projectoDoJob(job);
  if (proj) {
    if (
      missaoEquivalente(proj, missao.id) ||
      missaoEquivalente(proj, missao.nome)
    ) {
      return true;
    }
  }

  const nome = nomeProjetoDoJob(job);
  if (nome) {
    if (
      missaoEquivalente(nome, missao.id) ||
      missaoEquivalente(nome, missao.nome)
    ) {
      return true;
    }
  }

  if (proj || nome) return false;

  const id = typeof job.id === "string" ? job.id.trim() : "";
  if (!id) return false;
  const permitidos = new Set(
    opts.idsPermitidos
      ? [...opts.idsPermitidos].map((x) => String(x || "").trim()).filter(Boolean)
      : []
  );
  return permitidos.has(id);
}

/**
 * Filtra Jobs pela missão activa (sem store paralelo).
 * @param {object[]} jobs
 * @param {{ id?: string|null, nome?: string|null }|null|undefined} missao
 * @param {{ idsPermitidos?: Iterable<string>|null }} [opts]
 */
export function filtrarJobsPorMissaoActiva(jobs, missao, opts = {}) {
  const lista = Array.isArray(jobs) ? jobs : [];
  if (!missao || (missao.id == null && missao.nome == null)) return lista.slice();
  return lista.filter((j) => jobPertenceAMissaoActiva(j, missao, opts));
}

/**
 * Ordena promoções: mais recente primeiro (criadoEm/resultadoEm), depois id.
 * Evita `promocoes[0]` = menor ID global da fila.
 * @param {ReadonlyArray<object>} promocoes
 */
export function ordenarPromocoesPorRecencia(promocoes) {
  const lista = Array.isArray(promocoes) ? [...promocoes] : [];
  const ts = (p) => {
    const t = Date.parse(
      String(p?.resultadoEm || p?.criadoEm || p?.actualizadoEm || "")
    );
    return Number.isFinite(t) ? t : 0;
  };
  lista.sort((a, b) => {
    const d = ts(b) - ts(a);
    if (d !== 0) return d;
    return String(b?.jobId || "").localeCompare(String(a?.jobId || ""));
  });
  return lista;
}

/**
 * Extrai promoções de resultado reconciliado (result|needs_correction) a partir
 * da observação/adopção do turno — para lastro e memória de trabalho.
 * @param {object|null|undefined} obs — retorno de observarAcompanhamentosActivos
 * @returns {ReadonlyArray<{
 *   jobId: string,
 *   estado: string,
 *   titulo: string,
 *   sintese: string,
 *   evidencia: string|null
 * }>}
 */
export function extrairPromocoesResultadoMissao(obs) {
  /** @type {Array<{ jobId: string, estado: string, titulo: string, sintese: string, evidencia: string|null }>} */
  const out = [];
  const vistos = new Set();
  const resultados = Array.isArray(obs?.resultados) ? obs.resultados : [];
  for (const r of resultados) {
    const job = r?.job;
    if (!job || typeof job !== "object" || typeof job.id !== "string") continue;
    const estado = String(job.estado || "");
    if (estado !== "result" && estado !== "needs_correction") continue;
    if (!job.resultado) continue;
    const sintese = sintetizarResultadoJob(job);
    if (!sintese) continue;
    if (vistos.has(job.id)) continue;
    vistos.add(job.id);
    const evidencia =
      typeof job.resultado === "object" &&
      typeof job.resultado.evidencia === "string" &&
      job.resultado.evidencia.trim()
        ? job.resultado.evidencia.trim()
        : null;
    out.push({
      jobId: job.id,
      estado,
      titulo: String(job.titulo || job.id),
      sintese: sintese.length > 240 ? `${sintese.slice(0, 237)}…` : sintese,
      evidencia,
      criadoEm: job.criadoEm || null,
      resultadoEm: job.resultadoEm || null
    });
  }
  return Object.freeze(ordenarPromocoesPorRecencia(out));
}

/**
 * Factos oficiais a injectar no lastro a partir das promoções (Teste 3).
 * @param {ReadonlyArray<{ jobId: string, estado: string, sintese: string, evidencia: string|null }>} promocoes
 * @returns {string[]}
 */
export function factosOficiaisDePromocoesResultado(promocoes) {
  if (!Array.isArray(promocoes) || !promocoes.length) return [];
  return promocoes.slice(0, 2).map((p) => {
    const ev = p.evidencia ? ` | evidência: ${p.evidencia}` : "";
    return `Resultado reconciliado ${p.jobId} (${p.estado}): ${p.sintese}${ev}`;
  });
}

/**
 * Aplica promoções ao lastro de consciência (factos + memória de trabalho).
 * Não cria store paralelo — só enriquece o lastro do turno.
 * @param {object|null|undefined} lastro
 * @param {ReadonlyArray<object>} promocoes
 * @returns {object|null}
 */
export function aplicarPromocaoResultadoAoLastro(lastro, promocoes) {
  if (!Array.isArray(promocoes) || !promocoes.length) {
    return lastro && typeof lastro === "object" ? lastro : null;
  }
  const ordenadas = ordenarPromocoesPorRecencia(promocoes);
  const factosExtra = factosOficiaisDePromocoesResultado(ordenadas);
  const base =
    lastro && typeof lastro === "object"
      ? { ...lastro }
      : { temContextoRelevante: true, factosOficiais: [] };
  const factosPrev = Array.isArray(base.factosOficiais) ? base.factosOficiais : [];
  const factos = [...factosPrev];
  for (const f of factosExtra) {
    if (!factos.includes(f)) factos.push(f);
  }

  const p0 = ordenadas[0];
  const linhaMissao = `${p0.jobId}: ${p0.sintese}`.slice(0, 160);
  const mtePrev =
    base.memoriaTrabalhoExecutiva && typeof base.memoriaTrabalhoExecutiva === "object"
      ? { ...base.memoriaTrabalhoExecutiva }
      : {};
  const estadoConv =
    mtePrev.estadoConversa && typeof mtePrev.estadoConversa === "object"
      ? { ...mtePrev.estadoConversa }
      : {};
  estadoConv.emExecucao = estadoConv.emExecucao || linhaMissao;

  /** @type {string[]} */
  const pendencias = Array.isArray(mtePrev.pendencias)
    ? [...mtePrev.pendencias]
    : [];
  if (p0.estado === "needs_correction") {
    const pend = `Retomar/corrigir ${p0.jobId} com base no resultado reconciliado`.slice(
      0,
      160
    );
    if (!pendencias.includes(pend)) pendencias.unshift(pend);
  }

  let proximaAcao = mtePrev.proximaAcao || null;
  if (!proximaAcao) {
    proximaAcao =
      p0.estado === "needs_correction"
        ? `Retomar ${p0.jobId} a partir do resultado reconciliado`
        : `Usar resultado reconciliado de ${p0.jobId} na continuidade da missão`;
  }

  base.temContextoRelevante = true;
  base.factosOficiais = factos;
  base.memoriaTrabalhoExecutiva = {
    ...mtePrev,
    estadoConversa: estadoConv,
    pendencias,
    proximaAcao,
    objectivoAtivo: mtePrev.objectivoAtivo || linhaMissao
  };
  base.resultadoMissaoActivo = Object.freeze({ ...p0 });
  return base;
}

/**
 * @typedef {object} RegistoAcompanhamento
 * @property {string} jobId
 * @property {boolean} activo
 * @property {string|null} ultimoEstadoReportado
 * @property {boolean} mensagemTerminalEmitida
 * @property {string|null} [cicloId]
 * @property {string|null} [titulo]
 */

/**
 * @param {string} [estado]
 * @returns {boolean}
 */
export function ehEstadoAcompanhamentoAberto(estado) {
  return ESTADOS_ACOMPANHAMENTO_ABERTO.includes(
    /** @type {*} */ (String(estado || ""))
  );
}

/**
 * @param {string} [estado]
 * @returns {boolean}
 */
export function ehEstadoAcompanhamentoTerminal(estado) {
  return ESTADOS_ACOMPANHAMENTO_TERMINAL.includes(
    /** @type {*} */ (String(estado || ""))
  );
}

/**
 * @param {string} [estado]
 * @returns {boolean}
 */
export function ehEstadoAdotavelDaFila(estado) {
  return ESTADOS_ADOTAVEIS_FILA.includes(/** @type {*} */ (String(estado || "")));
}

/**
 * Store idempotente de acompanhamentos (por sessão / EE).
 * @returns {{
 *   registar: (jobId: string, opts?: object) => RegistoAcompanhamento,
 *   obter: (jobId: string) => RegistoAcompanhamento|null,
 *   listarActivos: () => RegistoAcompanhamento[],
 *   aplicarReport: (jobId: string, estado: string, opts?: { terminal?: boolean }) => RegistoAcompanhamento|null,
 *   desactivar: (jobId: string) => RegistoAcompanhamento|null,
 *   _map: Map<string, RegistoAcompanhamento>
 * }}
 */
export function criarStoreAcompanhamento() {
  /** @type {Map<string, RegistoAcompanhamento>} */
  const map = new Map();

  /**
   * @param {string} jobId
   * @param {object} [opts]
   */
  function registar(jobId, opts = {}) {
    const id = String(jobId || "").trim();
    if (!id) {
      throw new Error("jobId obrigatório para registar acompanhamento.");
    }

    const existente = map.get(id);
    if (existente) {
      if (existente.mensagemTerminalEmitida || !existente.activo) {
        // Job já terminal — não reabrir
        return { ...existente };
      }
      if (opts.cicloId && !existente.cicloId) {
        existente.cicloId = String(opts.cicloId);
      }
      if (opts.titulo && !existente.titulo) {
        existente.titulo = String(opts.titulo);
      }
      return { ...existente };
    }

    /** @type {RegistoAcompanhamento} */
    const reg = {
      jobId: id,
      activo: true,
      ultimoEstadoReportado: null,
      mensagemTerminalEmitida: false,
      cicloId: opts.cicloId ? String(opts.cicloId) : null,
      titulo: opts.titulo ? String(opts.titulo) : null
    };
    map.set(id, reg);
    return { ...reg };
  }

  /**
   * @param {string} jobId
   */
  function obter(jobId) {
    const r = map.get(String(jobId || "").trim());
    return r ? { ...r } : null;
  }

  function listarActivos() {
    return [...map.values()]
      .filter((r) => r.activo === true)
      .map((r) => ({ ...r }));
  }

  /**
   * @param {string} jobId
   * @param {string} estado
   * @param {{ terminal?: boolean }} [opts]
   */
  function aplicarReport(jobId, estado, opts = {}) {
    const reg = map.get(String(jobId || "").trim());
    if (!reg) return null;
    reg.ultimoEstadoReportado = String(estado || "");
    if (opts.terminal === true) {
      reg.mensagemTerminalEmitida = true;
      reg.activo = false;
    }
    return { ...reg };
  }

  /**
   * Desactiva acompanhamento sem marcar terminal (ex.: Job fora da missão activa).
   * @param {string} jobId
   */
  function desactivar(jobId) {
    const reg = map.get(String(jobId || "").trim());
    if (!reg) return null;
    reg.activo = false;
    return { ...reg };
  }

  return { registar, obter, listarActivos, aplicarReport, desactivar, _map: map };
}

/**
 * Emite actualização só se o estado mudou e ainda não houve spam/terminal duplicado.
 * @param {RegistoAcompanhamento|null|undefined} reg
 * @param {string} novoEstado
 */
export function deveEmitirActualizacao(reg, novoEstado) {
  if (!reg || reg.activo !== true) return false;
  const est = String(novoEstado || "");
  if (!est) return false;
  if (reg.mensagemTerminalEmitida) return false;
  if (reg.ultimoEstadoReportado === est) return false;
  return true;
}

/**
 * Progresso intermédio (nunca conclusão).
 * `result` / `needs_correction` não usam montarMensagemResultado.
 * @param {object} job
 */
/**
 * Evidência estreita de Job deliberativo (A/B/C / decisão sem entrega técnica).
 * Não classifica execução técnica legítima só por estado.
 * @param {object|null|undefined} job
 * @param {object|null|undefined} [msg]
 * @returns {boolean}
 */
export function ehJobRuidoDeliberativo(job, msg = null) {
  const titulo = String(job?.titulo || "");
  const descricao = String(job?.descricao || job?.instrucao || "");
  const meta = `${titulo}\n${descricao}`;
  const textoMsg = String(msg?.texto || "");
  const resumo = (() => {
    const r = job?.resultado;
    if (typeof r === "string") return r;
    if (r && typeof r === "object") {
      return [r.resumo, r.mensagem, r.decisao, r.evidencia]
        .filter((x) => x != null && String(x).trim())
        .map((x) => String(x))
        .join(" ");
    }
    return "";
  })();
  const blob = `${meta}\n${resumo}\n${textoMsg}`;

  const temAbcMeta =
    (/\bA\s*[\)\.\:—\-]/.test(meta) &&
      /\bB\s*[\)\.\:—\-]/.test(meta) &&
      /\bC\s*[\)\.\:—\-]/.test(meta)) ||
    (/\bA\)/.test(meta) && /\bB\)/.test(meta) && /\bC\)/.test(meta));
  const deliberacaoMeta =
    /\b(decida|decide|escolha\s+uma|pedido\s+de\s+decis)/i.test(meta) ||
    /n[aã]o\s+(execute|crie\s+nenhum\s+job|despache)/i.test(meta);
  if (temAbcMeta || deliberacaoMeta) return true;

  const decisaoCampo =
    job?.resultado &&
    typeof job.resultado === "object" &&
    job.resultado.decisao != null
      ? String(job.resultado.decisao).trim()
      : "";
  const decisaoLetra =
    (/^[ABC]$/i.test(decisaoCampo) && decisaoCampo.toUpperCase()) ||
    blob.match(/\bDECIS[AÃ]O:\s*([ABC])\b/i)?.[1]?.toUpperCase() ||
    blob.match(/Decis[aã]o executiva:\s*([ABC])\b/i)?.[1]?.toUpperCase() ||
    null;
  if (decisaoLetra) {
    const evidencia = String(
      (job?.resultado &&
        typeof job.resultado === "object" &&
        job.resultado.evidencia) ||
        ""
    );
    const entregaTecnica =
      /\.(txt|md|js|jsx|ts|tsx|json|py)\b/i.test(evidencia) ||
      /\b(arquivo\s+criado|commit|diff|implementad)/i.test(resumo);
    if (!entregaTecnica) return true;
  }

  // Homologação C9 / artefacto de teste ecoado em turno deliberativo
  if (/TESTE C9|teste-c9-execucao-real/i.test(blob)) return true;

  return false;
}

/**
 * Em turno com pedido de decisão: não ecoar histórico needs_correction/result;
 * preservar dispatched/running operacional (não deliberativo).
 * @param {object|null|undefined} obs
 * @returns {object|null|undefined}
 */
export function filtrarMensagensAcompanhamentoDeliberativo(obs) {
  if (!obs || !Array.isArray(obs.mensagens)) return obs;
  /** @type {Map<string, object>} */
  const porId = new Map();
  for (const r of obs.resultados || []) {
    if (r?.job?.id) porId.set(String(r.job.id), r.job);
  }
  const mensagens = obs.mensagens.filter((m) => {
    if (!m || m.ok === false) return false;
    const estado = String(m.estado || "");
    const job = (m.jobId && porId.get(String(m.jobId))) || null;
    // Histórico — não é execução operacional corrente
    if (estado === "needs_correction" || estado === "result") {
      return false;
    }
    if (
      estado === "dispatched" ||
      estado === "running" ||
      estado === "pending"
    ) {
      return !ehJobRuidoDeliberativo(job, m);
    }
    return !ehJobRuidoDeliberativo(job, m);
  });
  return { ...obs, mensagens };
}

export function montarMensagemProgresso(job) {
  if (!job || typeof job !== "object" || typeof job.id !== "string") {
    return { ok: false, mensagem: "Job inválido." };
  }
  const estado = String(job.estado || "");
  if (!ehEstadoAcompanhamentoAberto(estado)) {
    return { ok: false, mensagem: `Estado ${estado} não é progresso aberto.` };
  }
  const titulo = job.titulo ? ` «${job.titulo}»` : "";
  /** @type {Record<string, string>} */
  const prosa = {
    pending: `Job ${job.id}${titulo} na fila (pending) — aguarda Dispatcher.`,
    dispatched: `Job ${job.id}${titulo} em handoff (dispatched) — não concluído.`,
    running: `Job ${job.id}${titulo} em execução (running).`,
    result: `Job ${job.id}${titulo}: resultado disponível — aguarda verificação do CEO.`,
    needs_correction: `Job ${job.id}${titulo}: resultado verificado — requer correção (acompanhamento aberto).`
  };
  let texto = prosa[estado] || `Job ${job.id} estado: ${estado}.`;

  if (estado === "result" || estado === "needs_correction") {
    const sintese = sintetizarResultadoJob(job);
    if (sintese) {
      const curto =
        sintese.length > 160 ? `${sintese.slice(0, 157)}…` : sintese;
      texto += ` Resultado: ${curto}`;
    }
  }
  if (estado === "needs_correction") {
    const motivo =
      (job.verificacao &&
        typeof job.verificacao === "object" &&
        job.verificacao.motivo) ||
      (job.correcao && typeof job.correcao === "object" && job.correcao.motivo) ||
      null;
    if (motivo) {
      texto += ` Motivo: ${motivo}.`;
    }
  }

  return {
    ok: true,
    canal: "posto_comando",
    jobId: job.id,
    estado,
    texto,
    tipo: "progresso",
    conclusao: false
  };
}

/**
 * Adopta Jobs abertos da fila no store EE (Teste 3) — idempotente.
 * Não adopta completed|failed|cancelled. Não reseta anti-duplicação.
 * Não marca ultimoEstadoReportado (permite emitir progresso na 1ª observação).
 *
 * @param {ReturnType<typeof criarStoreAcompanhamento>} store
 * @param {object} [opts]
 * @param {() => Promise<object[]>|object[]} [opts.listarJobs] — Jobs candidatos
 * @param {{ id?: string|null, nome?: string|null }|null} [opts.missaoActiva] — COA/projecto activo
 * @returns {Promise<{ ok: boolean, adotados: object[], ignorados: object[], mensagem?: string }>}
 */
export async function adotarJobsDaFilaParaAcompanhamento(store, opts = {}) {
  if (!store || typeof store.registar !== "function") {
    return {
      ok: false,
      adotados: [],
      ignorados: [],
      mensagem: "store de acompanhamento inválido."
    };
  }
  if (typeof opts.listarJobs !== "function") {
    return {
      ok: false,
      adotados: [],
      ignorados: [],
      mensagem: "opts.listarJobs é obrigatório."
    };
  }

  let jobs = [];
  try {
    jobs = (await opts.listarJobs()) || [];
  } catch {
    return {
      ok: false,
      adotados: [],
      ignorados: [],
      mensagem: "Falha ao listar Jobs da fila."
    };
  }
  if (!Array.isArray(jobs)) jobs = [];

  const missao = opts.missaoActiva || null;

  /** @type {object[]} */
  const adotados = [];
  /** @type {object[]} */
  const ignorados = [];

  for (const job of jobs) {
    if (!job || typeof job !== "object" || typeof job.id !== "string") {
      continue;
    }
    const estado = String(job.estado || job.status || "");
    if (ehEstadoAcompanhamentoTerminal(estado)) {
      ignorados.push({
        jobId: job.id,
        estado,
        motivo: "terminal_historico"
      });
      continue;
    }
    if (!ehEstadoAdotavelDaFila(estado)) {
      ignorados.push({
        jobId: job.id,
        estado,
        motivo: "estado_nao_adotavel"
      });
      continue;
    }
    // Missão activa governa: sem projecto equivalente → não readopta histórico global
    if (
      missao &&
      !jobPertenceAMissaoActiva(job, missao, { idsPermitidos: [] })
    ) {
      ignorados.push({
        jobId: job.id,
        estado,
        motivo: "fora_da_missao_activa"
      });
      continue;
    }

    const antes = store.obter(job.id);
    const ultimoAntes = antes ? antes.ultimoEstadoReportado : null;
    const terminalAntes = antes ? antes.mensagemTerminalEmitida : false;

    // store.registar preserva ultimoEstadoReportado / mensagemTerminalEmitida
    const reg = store.registar(job.id, {
      titulo: job.titulo || null,
      cicloId: job.cicloId || null
    });

    const depois = store.obter(job.id);
    if (
      antes &&
      depois &&
      (depois.ultimoEstadoReportado !== ultimoAntes ||
        depois.mensagemTerminalEmitida !== terminalAntes)
    ) {
      // Defesa: não deveria acontecer com registar idempotente
      ignorados.push({
        jobId: job.id,
        estado,
        motivo: "anti_dup_alterado_inesperado"
      });
      continue;
    }

    adotados.push({
      jobId: job.id,
      estado,
      novo: !antes,
      activo: reg.activo === true,
      ultimoEstadoReportado: reg.ultimoEstadoReportado,
      mensagemTerminalEmitida: reg.mensagemTerminalEmitida === true
    });
  }

  return { ok: true, adotados, ignorados };
}

/**
 * Observa um acompanhamento activo: lê Job persistido + tick Motor (sem watcher).
 * @param {ReturnType<typeof criarStoreAcompanhamento>} store
 * @param {string} jobId
 * @param {object} [opts]
 * @param {(id: string) => Promise<object|null>|object|null} opts.obterJob
 * @param {object} [opts.ciclo]
 * @param {(msg: object) => void} [opts.onMensagem]
 */
export async function observarUmAcompanhamento(store, jobId, opts = {}) {
  if (!store || typeof opts.obterJob !== "function") {
    return {
      ok: false,
      mensagem: "store e obterJob obrigatórios.",
      emitiu: false
    };
  }

  const reg = store.obter(jobId);
  if (!reg) {
    return { ok: false, mensagem: "Acompanhamento inexistente.", emitiu: false };
  }
  if (!reg.activo || reg.mensagemTerminalEmitida) {
    return {
      ok: true,
      reg,
      emitiu: false,
      motivo: "acompanhamento_inactivo"
    };
  }

  const job = await opts.obterJob(jobId);
  if (!job || typeof job !== "object") {
    return {
      ok: false,
      mensagem: `Job ${jobId} não encontrado na fila (fonte de verdade).`,
      emitiu: false,
      fonte: "fila_persistida"
    };
  }

  const estado = String(job.estado || "");
  const emitir = deveEmitirActualizacao(reg, estado);

  if (ehEstadoAcompanhamentoTerminal(estado) || ehEstadoJobTerminal(estado)) {
    let mensagem = null;
    let tick = null;
    if (emitir) {
      const montada = montarMensagemResultado(job);
      if (montada.ok) {
        mensagem = montada;
        if (typeof opts.onMensagem === "function") {
          opts.onMensagem(montada);
        }
      }
      if (opts.ciclo && typeof opts.ciclo === "object") {
        tick = await tickObservadorJob({
          obterJob: async () => job,
          ciclo: opts.ciclo,
          onMensagem: opts.onMensagem
        });
      }
      store.aplicarReport(jobId, estado, { terminal: true });
    }
    return {
      ok: true,
      job,
      estado,
      emitiu: emitir,
      terminal: true,
      mensagem,
      tick,
      reg: store.obter(jobId),
      fonte: "fila_persistida",
      execucaoConcluida: emitir === true
    };
  }

  if (!ehEstadoAcompanhamentoAberto(estado)) {
    return {
      ok: true,
      job,
      estado,
      emitiu: false,
      motivo: "estado_fora_ciclo",
      fonte: "fila_persistida"
    };
  }

  let mensagem = null;
  if (emitir) {
    mensagem = montarMensagemProgresso(job);
    if (mensagem.ok && typeof opts.onMensagem === "function") {
      opts.onMensagem(mensagem);
    }
    store.aplicarReport(jobId, estado, { terminal: false });
  }

  return {
    ok: true,
    job,
    estado,
    emitiu: emitir,
    terminal: false,
    mensagem: emitir ? mensagem : null,
    reg: store.obter(jobId),
    fonte: "fila_persistida",
    /** Handoff / result / etc. nunca fecham execução. */
    execucaoConcluida: false
  };
}

/**
 * Desactiva acompanhamentos activos cujo Job não pertence à missão.
 * Não altera estado do Job na fila.
 * @param {ReturnType<typeof criarStoreAcompanhamento>} store
 * @param {object} opts
 * @param {{ id?: string|null, nome?: string|null }|null} opts.missaoActiva
 * @param {(id: string) => Promise<object|null>|object|null} opts.obterJob
 */
export async function desactivarAcompanhamentosForaDaMissao(store, opts = {}) {
  const missao = opts.missaoActiva || null;
  if (!store || !missao || typeof opts.obterJob !== "function") {
    return { ok: true, desactivados: [] };
  }
  /** @type {string[]} */
  const desactivados = [];
  for (const reg of store.listarActivos()) {
    let job = null;
    try {
      job = await opts.obterJob(reg.jobId);
    } catch {
      job = null;
    }
    // Sem idsPermitidos: órfão e projecto estrangeiro → fora da missão
    if (!job || !jobPertenceAMissaoActiva(job, missao, { idsPermitidos: [] })) {
      store.desactivar(reg.jobId);
      desactivados.push(reg.jobId);
    }
  }
  return { ok: true, desactivados };
}

/**
 * Observa todos os acompanhamentos activos (um tick por Job; sem watcher).
 * @param {ReturnType<typeof criarStoreAcompanhamento>} store
 * @param {object} opts
 * @param {(id: string) => Promise<object|null>|object|null} opts.obterJob
 * @param {(jobId: string) => object|null|undefined} [opts.obterCiclo]
 * @param {{ id?: string|null, nome?: string|null }|null} [opts.missaoActiva]
 */
export async function observarAcompanhamentosActivos(store, opts = {}) {
  if (opts.missaoActiva) {
    await desactivarAcompanhamentosForaDaMissao(store, {
      missaoActiva: opts.missaoActiva,
      obterJob: opts.obterJob
    });
  }

  const activos = store.listarActivos();
  /** @type {object[]} */
  const resultados = [];
  /** @type {object[]} */
  const mensagens = [];

  for (const reg of activos) {
    const ciclo =
      typeof opts.obterCiclo === "function"
        ? opts.obterCiclo(reg.jobId)
        : opts.ciclo || null;
    const r = await observarUmAcompanhamento(store, reg.jobId, {
      obterJob: opts.obterJob,
      ciclo: ciclo || undefined,
      onMensagem: (msg) => {
        mensagens.push(msg);
        if (typeof opts.onMensagem === "function") opts.onMensagem(msg);
      }
    });
    resultados.push(r);
  }

  return {
    ok: true,
    resultados,
    mensagens,
    aindaActivos: store.listarActivos().length,
    fonte: "fila_persistida"
  };
}

/**
 * Regista Job após handoff — idempotente; não reabre terminais.
 * @param {ReturnType<typeof criarStoreAcompanhamento>} store
 * @param {object} job
 * @param {object} [opts]
 */
export function registarAcompanhamentoAposHandoff(store, job, opts = {}) {
  if (!store || !job || typeof job.id !== "string") {
    return { ok: false, mensagem: "store/job inválidos." };
  }
  const estado = String(job.estado || "pending");
  if (ehEstadoAcompanhamentoTerminal(estado)) {
    return {
      ok: false,
      mensagem: "Job já terminal — acompanhamento não reaberto.",
      motivo: "job_terminal"
    };
  }
  const reg = store.registar(job.id, {
    cicloId: opts.cicloId || opts.ciclo?.id || null,
    titulo: job.titulo || opts.titulo || null
  });
  // mensagemInicioExecucao já cobriu o estado do handoff neste turno —
  // marca como reportado para anti-duplicação (sem reabrir se já terminal).
  if (reg.activo && reg.ultimoEstadoReportado == null) {
    store.aplicarReport(job.id, estado, { terminal: false });
  }
  return {
    ok: true,
    reg: store.obter(job.id),
    execucaoConcluida: false,
    estado
  };
}
