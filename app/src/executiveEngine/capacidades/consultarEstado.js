/**
 * P0-3 — Consulta de estado operacional (somente leitura).
 * Job / Gate / fila / pendências / resultado / verificação.
 * Nunca cria Job, nunca inicia Dispatcher, nunca altera estado.
 */

import { normalizarTexto } from "../../classificadorIntencao/lexicon.js";
import { lerMemoria, resumirEstado } from "../../executiveMemory/index.js";
import { obterStoreContinuidadePadrao } from "../../continuidadeGate/integracaoConversa.js";
import { listarJobsPorEstado, obterJobFila } from "../filaCliente.js";

/**
 * @typedef {"estado_job"|"resultado_job"|"verificacao_job"|"gates"|"fila"|"pendencias"|"estado_geral"|"desconhecida"} TipoConsultaEstado
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
 * @returns {{ tipo: TipoConsultaEstado, jobId: string|null }}
 */
export function identificarConsultaEstado(texto) {
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

  if (
    (/\bfila\b/.test(t) &&
      /\b(estado|status|jobs?|pendente|qual|quais)\b/.test(t)) ||
    /\bestado\s+da\s+fila\b/.test(t) ||
    /\b(listar|mostrar|ver)\s+(a\s+)?fila\b/.test(t)
  ) {
    return { tipo: "fila", jobId: null };
  }

  if (
    /\bpendenc/.test(t) ||
    /\b(o\s+que\s+esta\s+pendente|pendencias?\s+abertas?)\b/.test(t)
  ) {
    return { tipo: "pendencias", jobId: null };
  }

  if (
    /\bestado\s+atual\b/.test(t) ||
    /\b(status|resumo\s+executivo|memoria\s+executiva)\b/.test(t)
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
 */

/**
 * Executa consulta de estado — somente leitura.
 * @param {string} texto
 * @param {PortasConsultaEstado} [portas]
 */
export async function executarConsultaEstado(texto, portas = {}) {
  const id = identificarConsultaEstado(texto);
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
    return {
      ok: true,
      mensagem: [
        `Estado da fila: ${resumoEstados}.`,
        `Total de Jobs: ${jobs.length}.`,
        `Pending:\n${listaPending}`
      ].join("\n"),
      modo: "consulta_estado",
      dados: {
        tipoConsulta: "fila",
        contagens: porEstado,
        total: jobs.length,
        pending,
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
    return {
      ok: true,
      mensagem: resumirEstado(),
      modo: "consulta_estado",
      dados: {
        tipoConsulta: "estado_geral",
        consultaSemMutacao: true
      }
    };
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
