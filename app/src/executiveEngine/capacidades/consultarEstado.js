/**
 * P0-3 — Consulta de estado operacional (somente leitura).
 * Job / Gate / fila / pendências / resultado / verificação.
 * Nunca cria Job, nunca inicia Dispatcher, nunca altera estado.
 */

import { normalizarTexto } from "../../classificadorIntencao/lexicon.js";
import {
  ehPedidoSituacionalTrabalho,
  ehPedidoResumoCompostoSessao,
  ehProibicaoProximosPassos
} from "../../classificadorIntencao/regras.js";
import { lerMemoria, resumirEstado } from "../../executiveMemory/index.js";
import { obterStoreContinuidadePadrao } from "../../continuidadeGate/integracaoConversa.js";
import { listarJobsPorEstado, obterJobFila } from "../filaCliente.js";

/**
 * @typedef {"estado_job"|"resultado_job"|"verificacao_job"|"gates"|"fila"|"pendencias"|"estado_geral"|"ultimo_job"|"resumo_composto"|"desconhecida"} TipoConsultaEstado
 */

/**
 * Extrai ID de Job (JOB-NNNNNN…) do texto.
 * @param {string} texto
 * @returns {string|null}
 */
export function extrairIdJob(texto) {
  const m = String(texto || "").match(/\bJOB-(\d+)\b/i);
  if (!m) return null;
  return `JOB-${m[1]}`;
}

/**
 * Identifica o recurso / faceta da consulta (puro).
 * @param {string} texto
 * @param {{ situacional?: boolean }} [opts] — Fatia 1: derivacoes.situacional (sem reavaliar)
 * @returns {{ tipo: TipoConsultaEstado, jobId: string|null }}
 */
export function identificarConsultaEstado(texto, opts = {}) {
  const t = normalizarTexto(texto);
  const jobId = extrairIdJob(texto);

  if (jobId) {
    if (
      /\b(resultado|produzido\s+pelo\s+agent|resultado\s+do\s+agent|o\s+que\s+o\s+agent)\b/.test(
        t
      )
    ) {
      return { tipo: "resultado_job", jobId };
    }
    if (
      /\b(verificad\w*|verificacao|ceo\s+verificou|ja\s+foi\s+verific)/.test(t)
    ) {
      return { tipo: "verificacao_job", jobId };
    }
    return { tipo: "estado_job", jobId };
  }

  if (
    /\bgates?\b/.test(t) &&
    /\b(pendente|quais|qual|estado|status|id)\b/.test(t)
  ) {
    return { tipo: "gates", jobId: null };
  }

  // F25/T20 — resumo composto COA+LFC+Jobs (antes de fila / estado_geral)
  if (ehPedidoResumoCompostoSessao(t)) {
    return { tipo: "resumo_composto", jobId: null };
  }

  if (
    (/\bfila\b/.test(t) &&
      /\b(estado|status|jobs?|pendente|qual|quais)\b/.test(t)) ||
    /\bestado\s+da\s+fila\b/.test(t) ||
    /\b(listar|mostrar|ver)\s+(a\s+)?fila\b/.test(t) ||
    (/\bjobs?\s+em\s+aberto\b/.test(t) &&
      !/\bestado\s+operacional\b/.test(t) &&
      !/\bestado\s+(atual|actual)\b/.test(t) &&
      !/\bsessao\b/.test(t)) ||
    // F23 — Jobs em recuperação / dispatched / há algum Job (consulta)
    /\bjobs?\s+em\s+recuperacao\b/.test(t) ||
    (/\bem\s+recuperacao\b/.test(t) && /\bjobs?\b/.test(t)) ||
    (/\bdispatched\b/.test(t) && /\bjobs?\b/.test(t)) ||
    /\bha\s+(algum|alguns)\s+jobs?\b/.test(t) ||
    (/\bjobs?\b/.test(t) &&
      /\b(por\s+concluir|nao\s+conclu)\b/.test(t) &&
      !/\b(cria|crie|criar|execute|executa)\b/.test(t))
  ) {
    return { tipo: "fila", jobId: null };
  }

  // F19 — «último Job» / Job mais recente do COA (consulta, sem criar)
  if (
    /\b(ultimo|ultima)\s+jobs?\b/.test(t) ||
    /\bjobs?\s+(mais\s+)?recente\b/.test(t) ||
    /\bqual\s+(foi|e)\s+o\s+(ultimo|ultima)\s+jobs?\b/.test(t)
  ) {
    return { tipo: "ultimo_job", jobId: null };
  }

  if (
    /\bpendenc/.test(t) ||
    /\b(o\s+que\s+esta\s+pendente|pendencias?\s+abertas?)\b/.test(t)
  ) {
    return { tipo: "pendencias", jobId: null };
  }

  // Panorama curto apenas — pedidos situacionais de trabalho não são estado_geral.
  // Fatia 1: derivacoes.situacional canónico quando presente; detector só se ausente.
  const detectarSit =
    typeof opts.ehPedidoSituacionalTrabalho === "function"
      ? opts.ehPedidoSituacionalTrabalho
      : ehPedidoSituacionalTrabalho;
  const situacional =
    opts.situacional != null ? opts.situacional === true : detectarSit(t);
  if (
    !situacional &&
    (/\bestado\s+operacional(\s+(atual|actual))?\b/.test(t) ||
      /\bestado\s+(operacional\s+)?(atual|actual)(\s+da\s+sessao)?\b/.test(t) ||
      /\bestado\s+(atual|actual)\b/.test(t) ||
      /\bestado\s+da\s+sessao\b/.test(t) ||
      /\bstatus\s+(da\s+)?sessao\b/.test(t) ||
      /\b(status|resumo\s+executivo|memoria\s+executiva)\b/.test(t) ||
      (/\bcoa\s+activo\b/.test(t) &&
        /\b(estado|status|resumo|jobs?)\b/.test(t)))
  ) {
    return { tipo: "estado_geral", jobId: null };
  }

  return { tipo: "desconhecida", jobId: null };
}

/**
 * @param {unknown} resultado
 * @returns {string}
 */
function formatarResultado(resultado) {
  if (resultado == null) return "ainda não disponível";
  if (typeof resultado === "string") {
    const s = resultado.trim();
    return s || "ainda não disponível";
  }
  if (typeof resultado === "object") {
    const o = /** @type {Record<string, unknown>} */ (resultado);
    const partes = [];
    if (o.status != null) partes.push(`status: ${o.status}`);
    if (typeof o.resumo === "string" && o.resumo.trim()) {
      partes.push(o.resumo.trim());
    }
    if (typeof o.evidencia === "string" && o.evidencia.trim()) {
      partes.push(`evidência: ${o.evidencia.trim()}`);
    }
    if (typeof o.mensagem === "string" && o.mensagem.trim()) {
      partes.push(o.mensagem.trim());
    }
    if (partes.length) return partes.join("\n");
    try {
      return JSON.stringify(resultado);
    } catch {
      return String(resultado);
    }
  }
  return String(resultado);
}

/**
 * @param {object} job
 * @returns {string}
 */
function formatarVerificacao(job) {
  const estado = String(job.estado || "");
  const v = job.verificacao;
  if (estado === "completed" || (v && v.ok === true)) {
    const detalhe =
      v && typeof v === "object"
        ? [
            v.motivo ? `motivo: ${v.motivo}` : null,
            v.em ? `em: ${v.em}` : null
          ]
            .filter(Boolean)
            .join("; ")
        : "";
    return detalhe
      ? `Sim — verificado pelo CEO (${detalhe}). Estado: ${estado}.`
      : `Sim — verificado pelo CEO. Estado: ${estado}.`;
  }
  if (estado === "needs_correction") {
    return `Não (ou verificação negativa) — estado needs_correction. O CEO pediu correção.`;
  }
  if (estado === "result") {
    return `Não — resultado registado, ainda aguarda verificação do CEO. Estado: result.`;
  }
  if (estado === "failed") {
    return `Não aplicável como sucesso — Job em failed.${
      job.falha ? ` Motivo: ${JSON.stringify(job.falha)}` : ""
    }`;
  }
  return `Não — Job ainda não foi verificado pelo CEO. Estado atual: ${estado || "(desconhecido)"}.`;
}

/**
 * @param {object} job
 * @param {TipoConsultaEstado} tipo
 */
function montarRespostaJob(job, tipo) {
  const id = job.id;
  const estado = job.estado || "(desconhecido)";
  if (tipo === "resultado_job") {
    return {
      mensagem: [
        `ID: ${id}`,
        `Estado atual: ${estado}`,
        `Resultado do Agent: ${formatarResultado(job.resultado)}`
      ].join("\n"),
      dados: { job, tipoConsulta: tipo }
    };
  }
  if (tipo === "verificacao_job") {
    return {
      mensagem: [
        `ID: ${id}`,
        `Estado atual: ${estado}`,
        `Verificação do CEO: ${formatarVerificacao(job)}`
      ].join("\n"),
      dados: { job, tipoConsulta: tipo }
    };
  }
  // estado_job — formato completo pedido em homologação
  return {
    mensagem: [
      `ID: ${id}`,
      `Estado atual: ${estado}`,
      `Resultado do Agent: ${formatarResultado(job.resultado)}`,
      `Verificação do CEO: ${formatarVerificacao(job)}`,
      `Estado final: ${estado}`
    ].join("\n"),
    dados: { job, tipoConsulta: tipo }
  };
}

/**
 * Portas de leitura injectáveis (testes / Node sem Vite).
 * @typedef {object} PortasConsultaEstado
 * @property {(id: string) => Promise<object|null>|object|null} [obterJob]
 * @property {(estado?: string|null) => Promise<object[]>|object[]} [listarJobs]
 * @property {{ listarGates?: Function, obterGatePendenteMaisRecente?: Function, temGatePendente?: Function }} [storeContinuidade]
 * @property {() => object} [lerMemoriaFn]
 * @property {string|null} [coaId]
 * @property {object|null} [lfcReader]
 * @property {boolean} [situacional]
 */

/**
 * F25/T20 — prosa factual COA + LFC + Jobs; sem inventar; sem próximos passos se proibidos.
 * @param {string} texto
 * @param {{
 *   listarJobs: (estado?: string|null) => Promise<object[]>|object[],
 *   coaId?: string|null,
 *   lfcReader?: object|null
 * }} portas
 */
async function montarResumoCompostoSessao(texto, portas) {
  const t = normalizarTexto(texto);
  const semProximos = ehProibicaoProximosPassos(t);

  let coaId =
    typeof portas.coaId === "string" && portas.coaId.trim()
      ? String(portas.coaId).trim()
      : null;
  let coaNome = null;
  try {
    const { obterCoaAtivo } = await import("../coaSessao.js");
    const coa = obterCoaAtivo();
    if (coa) {
      coaId = String(coa.id || coaId || "").trim() || coaId;
      coaNome = coa.nome || coa.titulo || null;
    }
  } catch {
    /* sessão indisponível */
  }

  const linhaCoa = coaId
    ? `COA activo: ${coaNome || "(sem nome)"} (${coaId}).`
    : "COA activo: nenhum COA activo nesta sessão.";

  /** @type {object|null} */
  let reader = portas.lfcReader || null;
  if (!reader) {
    try {
      const { obterLfcRuntime } = await import("../../lastroFactualCaso/runtimeLfc.js");
      reader = obterLfcRuntime({}).reader || null;
    } catch {
      reader = null;
    }
  }

  /** @type {string[]} */
  let textosFactos = [];
  let casoIdLfc = null;
  if (reader && coaId) {
    try {
      // Reader HTTP (UI) devolve Promise — mesma disciplina que wiringConversacional/T11.
      let casoId = null;
      if (typeof reader.obterCasoActivo === "function") {
        const ptr = await Promise.resolve(reader.obterCasoActivo(coaId));
        if (ptr?.ok !== false && ptr?.casoId) casoId = String(ptr.casoId);
      }
      // Fallback alinhado a T11: deixis / ponteiro via resolverCaso
      if (!casoId && typeof reader.resolverCaso === "function") {
        const resolvido = await Promise.resolve(
          reader.resolverCaso(coaId, { deixis: true })
        );
        if (resolvido?.ok && resolvido?.casoId) {
          casoId = String(resolvido.casoId);
        }
      }
      casoIdLfc = casoId;
      if (casoId && typeof reader.listarFactosActivos === "function") {
        const listados = await Promise.resolve(
          reader.listarFactosActivos(coaId, casoId)
        );
        if (listados?.ok && Array.isArray(listados.factos)) {
          textosFactos = listados.factos
            .map((f) => String(f?.texto || "").trim())
            .filter(Boolean);
        }
      }
    } catch {
      textosFactos = [];
      casoIdLfc = null;
    }
  }

  let linhaLfc;
  if (!coaId) {
    linhaLfc = "LFC: sem COA activo — factos não consultados.";
  } else if (!reader) {
    linhaLfc = "LFC: leitor indisponível — factos activos não consultados.";
  } else if (!casoIdLfc) {
    linhaLfc = "LFC: nenhum caso activo neste COA.";
  } else if (!textosFactos.length) {
    linhaLfc = `LFC (caso ${casoIdLfc}): nenhum facto activo registado.`;
  } else {
    const ultimos = textosFactos.slice(-5);
    const corpo = ultimos.map((x, i) => `${i + 1}. ${x}`).join("\n");
    linhaLfc =
      textosFactos.length === 1
        ? `LFC (caso ${casoIdLfc}) — facto activo:\n${corpo}`
        : `LFC (caso ${casoIdLfc}) — ${textosFactos.length} facto(s) activo(s)` +
          (textosFactos.length > 5 ? " (últimos 5)" : "") +
          `:\n${corpo}`;
  }

  /** @type {object[]} */
  let jobs = [];
  try {
    jobs = (await portas.listarJobs(null)) || [];
  } catch {
    jobs = [];
  }
  const abertos = jobs.filter((j) => {
    const e = String(j?.estado || "").toLowerCase();
    return (
      !e ||
      e === "pending" ||
      e === "dispatched" ||
      e === "running" ||
      e === "result" ||
      e === "needs_correction"
    );
  });
  let linhaJobs;
  if (!jobs.length) {
    linhaJobs = "Jobs: nenhum Job na fila.";
  } else if (!abertos.length) {
    linhaJobs = `Jobs: ${jobs.length} na fila; nenhum em aberto/recuperação.`;
  } else {
    const lista = abertos
      .slice(0, 8)
      .map(
        (j) =>
          `- ${j.id}: ${j.titulo || "(sem título)"} (${j.estado || "pending"})`
      )
      .join("\n");
    linhaJobs = `Jobs em aberto (${abertos.length}/${jobs.length}):\n${lista}`;
  }

  const partes = [
    "Estado final da sessão (factual):",
    linhaCoa,
    linhaLfc,
    linhaJobs
  ];
  if (semProximos) {
    partes.push("Sem próximos passos (conforme pedido).");
  }

  return {
    ok: true,
    mensagem: partes.join("\n\n"),
    modo: "consulta_estado",
    dados: {
      tipoConsulta: "resumo_composto",
      coaId,
      coaNome,
      casoId: casoIdLfc,
      nFactosLfc: textosFactos.length,
      nJobs: jobs.length,
      nJobsAbertos: abertos.length,
      semProximosPassos: semProximos,
      consultaSemMutacao: true
    }
  };
}

/**
 * Executa consulta de estado — somente leitura.
 * @param {string} texto
 * @param {PortasConsultaEstado} [portas]
 */
export async function executarConsultaEstado(texto, portas = {}) {
  const id = identificarConsultaEstado(texto, {
    ...(portas.situacional != null
      ? { situacional: portas.situacional === true }
      : {}),
    ...(typeof portas.ehPedidoSituacionalTrabalho === "function"
      ? { ehPedidoSituacionalTrabalho: portas.ehPedidoSituacionalTrabalho }
      : {})
  });
  const obterJob =
    typeof portas.obterJob === "function"
      ? portas.obterJob
      : (jobId) => obterJobFila(jobId);
  const listarJobs =
    typeof portas.listarJobs === "function"
      ? portas.listarJobs
      : (estado) => listarJobsPorEstado(estado == null ? null : estado);
  const store =
    portas.storeContinuidade ||
    (typeof obterStoreContinuidadePadrao === "function"
      ? obterStoreContinuidadePadrao()
      : null);
  const lerMem =
    typeof portas.lerMemoriaFn === "function" ? portas.lerMemoriaFn : lerMemoria;

  if (
    id.tipo === "estado_job" ||
    id.tipo === "resultado_job" ||
    id.tipo === "verificacao_job"
  ) {
    let job = null;
    try {
      job = await obterJob(id.jobId);
    } catch {
      job = null;
    }
    if (!job) {
      return {
        ok: true,
        mensagem: `Job ${id.jobId} não foi encontrado na fila.`,
        modo: "consulta_estado",
        dados: {
          tipoConsulta: id.tipo,
          jobId: id.jobId,
          encontrado: false,
          consultaSemMutacao: true
        }
      };
    }
    const corpo = montarRespostaJob(job, id.tipo);
    return {
      ok: true,
      mensagem: corpo.mensagem,
      modo: "consulta_estado",
      dados: {
        ...corpo.dados,
        encontrado: true,
        consultaSemMutacao: true
      }
    };
  }

  if (id.tipo === "gates") {
    /** @type {object[]} */
    let gates = [];
    if (store && typeof store.listarRegistos === "function") {
      gates = store
        .listarRegistos()
        .filter((r) => r?.gate?.estado === "pendente")
        .map((r) => ({
          ...r.gate,
          resumo: r.solicitacaoResumo || r.parecerSnapshot?.titulo || null
        }));
    } else if (store && typeof store.listarGates === "function") {
      gates = store.listarGates().filter((g) => g && g.estado === "pendente");
    } else if (store && typeof store.obterGatePendenteMaisRecente === "function") {
      const g = store.obterGatePendenteMaisRecente();
      gates = g && g.estado === "pendente" ? [g] : [];
    }
    if (!gates.length) {
      return {
        ok: true,
        mensagem: "Nenhum Gate pendente no momento.",
        modo: "consulta_estado",
        dados: {
          tipoConsulta: "gates",
          gates: [],
          consultaSemMutacao: true
        }
      };
    }
    const linhas = gates.map((g) => {
      const assunto = g.resumo || g.assunto || "(sem assunto)";
      return (
        `- ${g.gateId || g.id || "(sem id)"} — ${assunto}` +
        (g.parecerId ? ` (parecer ${g.parecerId})` : "")
      );
    });
    return {
      ok: true,
      mensagem: `Gates pendentes:\n${linhas.join("\n")}`,
      modo: "consulta_estado",
      dados: {
        tipoConsulta: "gates",
        gates,
        consultaSemMutacao: true
      }
    };
  }

  if (id.tipo === "fila") {
    let jobs = [];
    try {
      jobs = (await listarJobs(null)) || [];
    } catch {
      jobs = [];
    }
    const porEstado = {};
    for (const j of jobs) {
      const e = (j && j.estado) || "pending";
      porEstado[e] = (porEstado[e] || 0) + 1;
    }
    const pending = jobs.filter((j) => j && (j.estado === "pending" || !j.estado));
    const abertos = jobs.filter((j) => {
      const e = String(j?.estado || "").toLowerCase();
      return (
        e === "dispatched" ||
        e === "running" ||
        e === "result" ||
        e === "needs_correction"
      );
    });
    const resumoEstados = Object.keys(porEstado).length
      ? Object.entries(porEstado)
          .map(([e, n]) => `${e}: ${n}`)
          .join(", ")
      : "vazia";
    const listaPending = pending.length
      ? pending
          .slice(0, 8)
          .map((j) => `- ${j.id}: ${j.titulo || "(sem título)"}`)
          .join("\n")
      : "(nenhum Job pending)";
    const listaAbertos = abertos.length
      ? abertos
          .slice(0, 8)
          .map(
            (j) =>
              `- ${j.id}: ${j.titulo || "(sem título)"} (${j.estado || "aberto"})`
          )
          .join("\n")
      : "(nenhum Job em dispatched/running/recuperação)";
    return {
      ok: true,
      mensagem: [
        `Estado da fila: ${resumoEstados}.`,
        `Total de Jobs: ${jobs.length}.`,
        `Em curso / recuperação:\n${listaAbertos}`,
        `Pending:\n${listaPending}`
      ].join("\n"),
      modo: "consulta_estado",
      dados: {
        tipoConsulta: "fila",
        contagens: porEstado,
        total: jobs.length,
        pending,
        abertos,
        consultaSemMutacao: true
      }
    };
  }

  if (id.tipo === "ultimo_job") {
    let jobs = [];
    try {
      jobs = (await listarJobs(null)) || [];
    } catch {
      jobs = [];
    }
    const coaFiltro =
      typeof portas.coaId === "string" && portas.coaId.trim()
        ? String(portas.coaId).trim()
        : null;
    const doCoa = coaFiltro
      ? jobs.filter((j) => {
          const p = String(j?.projeto || j?.coaId || "").trim();
          return !p || p === coaFiltro;
        })
      : jobs;
    const ordenados = [...doCoa].sort((a, b) => {
      const ta = Date.parse(String(a?.criadoEm || a?.despachadoEm || 0)) || 0;
      const tb = Date.parse(String(b?.criadoEm || b?.despachadoEm || 0)) || 0;
      return tb - ta;
    });
    const ultimo = ordenados[0] || null;
    if (!ultimo) {
      return {
        ok: true,
        mensagem: coaFiltro
          ? `Nenhum Job encontrado para o COA activo (${coaFiltro}).`
          : "Nenhum Job encontrado na fila.",
        modo: "consulta_estado",
        dados: {
          tipoConsulta: "ultimo_job",
          encontrado: false,
          coaId: coaFiltro,
          consultaSemMutacao: true
        }
      };
    }
    const estado = String(ultimo.estado || "pending");
    return {
      ok: true,
      mensagem: [
        `Último Job: ${ultimo.id}`,
        `Título: ${ultimo.titulo || "(sem título)"}`,
        `Estado: ${estado}`,
        coaFiltro ? `COA: ${coaFiltro}` : null
      ]
        .filter(Boolean)
        .join("\n"),
      modo: "consulta_estado",
      dados: {
        tipoConsulta: "ultimo_job",
        encontrado: true,
        job: ultimo,
        coaId: coaFiltro,
        consultaSemMutacao: true
      }
    };
  }

  if (id.tipo === "pendencias") {
    const estado = lerMem() || {};
    const pens = (estado.pendencias || []).filter(
      (p) => p && (p.status === "aberta" || !p.status)
    );
    const lista = pens.length
      ? pens
          .slice(0, 10)
          .map((p, i) => `${i + 1}. ${p.texto || p.descricao || "(sem texto)"}`)
          .join("\n")
      : "Nenhuma pendência aberta no projeto ativo.";
    return {
      ok: true,
      mensagem: `Pendências abertas:\n${lista}`,
      modo: "consulta_estado",
      dados: {
        tipoConsulta: "pendencias",
        pendencias: pens,
        consultaSemMutacao: true
      }
    };
  }

  if (id.tipo === "estado_geral") {
    const base = resumirEstado();
    /** @type {string[]} */
    const extra = [];
    let jobsAbertos = [];
    if (/\bjobs?\b/.test(normalizarTexto(texto))) {
      try {
        const todos = (await listarJobs(null)) || [];
        jobsAbertos = todos.filter((j) => {
          const e = String(j?.estado || "").toLowerCase();
          return (
            !e ||
            e === "pending" ||
            e === "dispatched" ||
            e === "running" ||
            e === "result" ||
            e === "needs_correction"
          );
        });
      } catch {
        jobsAbertos = [];
      }
      if (jobsAbertos.length) {
        extra.push(
          "Jobs em aberto:",
          ...jobsAbertos
            .slice(0, 10)
            .map(
              (j) =>
                `- ${j.id}: ${j.titulo || "(sem título)"} (${j.estado || "pending"})`
            )
        );
      } else {
        extra.push("Jobs em aberto: nenhum.");
      }
    }
    return {
      ok: true,
      mensagem: extra.length ? `${base}\n\n${extra.join("\n")}` : base,
      modo: "consulta_estado",
      dados: {
        tipoConsulta: "estado_geral",
        jobsAbertos,
        consultaSemMutacao: true
      }
    };
  }

  if (id.tipo === "resumo_composto") {
    return montarResumoCompostoSessao(texto, {
      listarJobs,
      coaId: portas.coaId || null,
      lfcReader: portas.lfcReader || null
    });
  }

  return {
    ok: true,
    mensagem:
      "Consulta de estado não identificada com precisão. " +
      "Indique o recurso (ex.: JOB-000067, Gate pendente, fila ou pendências).",
    modo: "consulta_estado",
    dados: {
      tipoConsulta: "desconhecida",
      consultaSemMutacao: true
    }
  };
}
