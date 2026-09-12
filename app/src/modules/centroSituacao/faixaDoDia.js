/**
 * Faixa do Dia + painéis Abrir/Encerrar (Onda 03 — E2).
 * Integra diaExecutivo (E1) ao Centro sem novas rotas.
 */

import {
  abrirDiaExecutivo,
  encerrarDiaExecutivo,
  obterDiaExecutivo,
  obterProjetoAtivo,
  obterUltimaContinuidade,
  obterWorkspaceAtivo
} from "../../catalogoProjetos/index.js";
import { ehLastroInstrucaoOuBriefing } from "../../executiveEngine/capacidades/lastroOperacional.js";
import {
  listarMensagens,
  obterContextoConversacional
} from "../conversa/store.js";

/** Texto explícito quando não há evidência no lastro/contexto. */
export const TEXTO_NAO_IDENTIFICADO = "Não foi identificado.";

function escaparHtml(texto) {
  return String(texto)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function rotuloStatus(status) {
  switch (status) {
    case "em_curso":
      return "Em curso";
    case "encerrado":
      return "Encerrado";
    default:
      return "Não iniciado";
  }
}

function tomStatus(status) {
  switch (status) {
    case "em_curso":
      return "andamento";
    case "encerrado":
      return "encerrado";
    default:
      return "idle";
  }
}

function evidenciaUtil(valor) {
  const v = String(valor || "").trim();
  if (!v) return "";
  if (v === "(não informado)" || v === "—" || v === "-") return "";
  if (v === TEXTO_NAO_IDENTIFICADO) return "";
  return v;
}

function fraseExecutiva(texto) {
  const v = evidenciaUtil(texto);
  if (!v) return "";
  return v.replace(/\s+/g, " ").trim().slice(0, 500);
}

function ehHistoricoRitual(texto) {
  return /^(Dia aberto|Dia encerrado|Projeto alterado)\b/i.test(
    String(texto || "").trim()
  );
}

function ehDumpCapacidade(texto) {
  return /^\[([^\]]+)\]\s+/.test(String(texto || "").trim());
}

function ehEntradaNaoProgresso(texto) {
  const t = String(texto || "").trim();
  if (!t) return true;
  if (ehHistoricoRitual(t) || ehDumpCapacidade(t)) return true;
  if (/^Pend[eê]ncia\s*:/i.test(t)) return true;
  if (/^Pr[oó]xima\s+a[cç][aã]o\s*:/i.test(t)) return true;
  return false;
}

function ehProgressoHistorico(texto) {
  const t = String(texto || "").trim();
  if (!t || ehEntradaNaoProgresso(t)) return false;
  if (/^Decis[aã]o\s*:/i.test(t)) return true;
  return /\b(resultad|avan[cç]|conclu|entreg|criad|implement|valid|homolog|fechou|regist)\w*/i.test(
    t
  );
}

/**
 * Recusa recortes de instrução/contexto como “próximo passo”.
 * @param {string} texto
 */
function ehAcaoExecutivaValida(texto) {
  const t = evidenciaUtil(texto);
  if (!t) return false;
  if (ehDumpCapacidade(t) || ehHistoricoRitual(t)) return false;
  if (ehLastroInstrucaoOuBriefing(t)) return false;
  if (t.length > 220) return false;
  if (/\b(empresa|patrocinador|descri[cç][aã]o\s+do\s+projeto)\b/i.test(t) && t.length > 80) {
    return false;
  }
  return true;
}

/**
 * Missão/COA/projeto activo para isolamento de Jobs no encerramento.
 * @param {object} [ctx]
 * @returns {Promise<{ id: string|null, nome: string|null }|null>}
 */
async function obterMissaoActivaEncerramento(ctx = {}) {
  if (ctx.missaoActiva && typeof ctx.missaoActiva === "object") {
    const id = ctx.missaoActiva.id != null ? String(ctx.missaoActiva.id).trim() : "";
    const nome =
      ctx.missaoActiva.nome != null ? String(ctx.missaoActiva.nome).trim() : "";
    if (id || nome) return { id: id || null, nome: nome || null };
  }
  try {
    const { obterCoaAtivo } = await import("../../executiveEngine/coaSessao.js");
    const coa = obterCoaAtivo();
    if (coa) return { id: coa.id || null, nome: coa.nome || null };
  } catch {
    /* fallback abaixo */
  }
  const p = obterProjetoAtivo();
  return p ? { id: p.id || null, nome: p.nome || null } : null;
}

/**
 * Lista Jobs para encerramento já filtrados pela missão/COA activa.
 * Reutiliza `filtrarJobsPorMissaoActiva` (órfãos / outros contextos excluídos).
 * @param {object} [ctx]
 * @returns {Promise<object[]>}
 */
async function listarJobsParaEncerramento(ctx = {}) {
  /** @type {object[]} */
  let jobs = [];
  try {
    if (typeof ctx.listarJobs === "function") {
      jobs = (await ctx.listarJobs(null)) || [];
    } else {
      const { listarJobsEmAcompanhamento } = await import(
        "../../executiveEngine/filaCliente.js"
      );
      jobs = (await listarJobsEmAcompanhamento()) || [];
    }
  } catch {
    jobs = [];
  }
  if (!Array.isArray(jobs)) jobs = [];

  const missao = await obterMissaoActivaEncerramento(ctx);
  if (!missao) return jobs;

  try {
    const { filtrarJobsPorMissaoActiva } = await import(
      "../../motorExecucao/acompanhamentoJob.js"
    );
    return filtrarJobsPorMissaoActiva(jobs, missao, {
      idsPermitidos: ctx.idsPermitidos || []
    });
  } catch {
    return jobs;
  }
}

/**
 * Lastro disponível na sessão (MTE) quando o caller não injecta.
 * @param {object} [ctx]
 * @returns {Promise<object|null>}
 */
async function obterLastroParaEncerramento(ctx = {}) {
  if (ctx.lastroConsciencia && typeof ctx.lastroConsciencia === "object") {
    return ctx.lastroConsciencia;
  }
  try {
    const { obterMemoriaTrabalhoExecutiva } = await import(
      "../../executiveEngine/refinoEicSessao.js"
    );
    let coaId;
    try {
      const { obterCoaAtivo } = await import("../../executiveEngine/coaSessao.js");
      coaId = obterCoaAtivo()?.id;
    } catch {
      coaId = undefined;
    }
    const mte =
      coaId !== undefined
        ? obterMemoriaTrabalhoExecutiva(coaId)
        : obterMemoriaTrabalhoExecutiva();
    if (!mte) return null;
    return {
      temContextoRelevante: true,
      memoriaTrabalhoExecutiva: mte
    };
  } catch {
    return null;
  }
}

/**
 * @param {object[]} jobs
 * @returns {object[]}
 */
function jobsComContinuidadeAberta(jobs) {
  return (Array.isArray(jobs) ? jobs : []).filter((j) => {
    const e = String(j?.estado || j?.status || "");
    return e === "result" || e === "needs_correction";
  });
}

/**
 * Mensagens do COA activo: listarMensagens se o bucket activo coincide;
 * senão lerDiscussao({ coaId }) (soft-fail). Nunca lê outro COA.
 * @param {object} [ctx]
 * @param {{ id?: string|null }|null} missao
 * @returns {Promise<object[]>}
 */
async function obterMensagensConversacionais(ctx = {}, missao = null) {
  const coaId = missao?.id != null ? String(missao.id).trim() : "";
  if (!coaId) return [];

  if (Array.isArray(ctx.mensagensConversa)) {
    return ctx.mensagensConversa.filter((m) => m && typeof m === "object");
  }

  try {
    const actual = obterContextoConversacional();
    if (actual === coaId) {
      const msgs = listarMensagens();
      if (Array.isArray(msgs) && msgs.length) return msgs;
    }
  } catch {
    /* soft-fail */
  }

  try {
    const { lerDiscussao } = await import(
      "../../consultaRegistados/portasLeitura.js"
    );
    /** @type {{ listarHfcPorCoa?: (id: string) => object[] }} */
    const deps = {};
    if (typeof ctx.listarHfcPorCoa === "function") {
      deps.listarHfcPorCoa = (id) => {
        if (String(id || "").trim() !== coaId) return [];
        return ctx.listarHfcPorCoa(coaId);
      };
    }
    const r = lerDiscussao({ coaId }, deps);
    if (r && r.status === "encontrado" && Array.isArray(r.mensagens)) {
      return r.mensagens;
    }
  } catch {
    /* soft-fail */
  }

  return [];
}

/**
 * Extrai evidência curta tipada da conversa do COA (sem dump).
 * @param {object[]} mensagens
 * @returns {{ oQueAndou: string, oQueFica: string, proximoPassoAmanha: string }}
 */
export function extrairEvidenciaConversacional(mensagens) {
  const msgs = Array.isArray(mensagens) ? mensagens : [];
  const users = msgs
    .filter((m) => m?.papel === "usuario")
    .map((m) => String(m.texto || "").trim())
    .filter(Boolean);
  const ceos = msgs
    .filter((m) => m?.papel === "ceo")
    .map((m) => String(m.texto || "").trim())
    .filter(Boolean);
  const corpus = [...users, ...ceos].join("\n");

  const pedidosAnalise = users.filter(
    (t) =>
      /\b(analis[ea]|deliber|recomende|prioridade|problema\s+central)\b/i.test(
        t
      ) || /\bn[aã]o\s+execute\b/i.test(t)
  );
  const temFactosEmpresa = users.some(
    (t) =>
      /\b\d+\s*funcion[aá]rios?\b/i.test(t) ||
      /\bfaturamento\b/i.test(t) ||
      /\bmargem\s+l[ií]quida\b/i.test(t) ||
      /\bmat[eé]ria-?\s*prima/i.test(t)
  );
  const respostasAnalise = ceos.filter(
    (t) =>
      t.length >= 80 &&
      /\b(recomenda|prioridade|problema|margem|alternativ|an[aá]lise)\b/i.test(
        t
      ) &&
      !/\bn[aã]o\s+h[aá]\s+prioridade\s+alinhada\b/i.test(t) &&
      !/\bn[aã]o\s+tenho\s+lastro\s+suficiente\b/i.test(t)
  );

  let oQueAndou = "";
  const nAnalises = Math.max(pedidosAnalise.length, respostasAnalise.length);
  if (nAnalises > 0) {
    if (temFactosEmpresa) {
      oQueAndou =
        nAnalises >= 2
          ? `Realizadas ${nAnalises} análises da situação com dados operacionais da empresa`
          : "Análise da situação com dados operacionais da empresa";
    } else {
      oQueAndou =
        nAnalises >= 2
          ? `Realizadas ${nAnalises} análises/deliberações na sessão`
          : "Análise/deliberação realizada na sessão";
    }
  }

  let oQueFica = "";
  if (
    /\baumentar\s+(os\s+)?pre[cç]os?\b/i.test(corpus) &&
    /\bdesperd[ií]cio/i.test(corpus)
  ) {
    oQueFica =
      "Alternativas em aberto: ajustar preços vs. reduzir desperdícios";
  } else if (
    /\bn[aã]o\s+execute\b/i.test(corpus) &&
    /\b(prioridade|recomende|decis)/i.test(corpus)
  ) {
    oQueFica = "Prioridade executiva ainda não decidida";
  } else if (
    /\bmat[eé]ria-?\s*prima/i.test(corpus) &&
    /\bperder\s+clientes\b/i.test(corpus)
  ) {
    oQueFica =
      "Tensão em aberto: custo de matéria-prima vs. risco de perder clientes";
  } else if (/Recomenda[cç][aã]o\s*:\s*(aprovar|modificar)/i.test(corpus)) {
    oQueFica =
      "Recomendação deliberativa ainda sem decisão formal do patrocinador";
  }

  let proximoPassoAmanha = "";
  if (oQueFica) {
    if (/ajustar pre[cç]os vs/i.test(oQueFica)) {
      proximoPassoAmanha =
        "Decidir prioridade entre reduzir custos e ajustar preços";
    } else if (/Prioridade executiva/i.test(oQueFica)) {
      proximoPassoAmanha = "Decidir a prioridade executiva da sessão";
    } else if (/Recomenda[cç][aã]o deliberativa/i.test(oQueFica)) {
      proximoPassoAmanha =
        "Confirmar ou modificar a recomendação deliberativa";
    } else {
      proximoPassoAmanha = `Resolver: ${oQueFica}`;
    }
  }

  return {
    oQueAndou: oQueAndou
      ? fraseExecutiva(oQueAndou)
      : TEXTO_NAO_IDENTIFICADO,
    oQueFica: oQueFica ? fraseExecutiva(oQueFica) : TEXTO_NAO_IDENTIFICADO,
    proximoPassoAmanha: proximoPassoAmanha
      ? fraseExecutiva(proximoPassoAmanha)
      : TEXTO_NAO_IDENTIFICADO
  };
}

/**
 * Mensagens sync do COA activo (só se o bucket conversacional coincide).
 * @param {string|null|undefined} coaId
 * @returns {object[]}
 */
function mensagensSyncDoCoaActivo(coaId) {
  const id = coaId != null ? String(coaId).trim() : "";
  if (!id) return [];
  try {
    if (obterContextoConversacional() !== id) return [];
    const msgs = listarMensagens();
    return Array.isArray(msgs) ? msgs : [];
  } catch {
    return [];
  }
}

/**
 * Progresso tipado: promo/Job → decisão → histórico de avanço (sem dumps).
 * @param {{ ws: object, lastro: object|null, jobs: object[] }} fontes
 */
function montarOQueAndou(fontes) {
  const { ws, lastro, jobs } = fontes;
  const promo =
    lastro?.resultadoMissaoActivo &&
    typeof lastro.resultadoMissaoActivo === "object"
      ? lastro.resultadoMissaoActivo
      : null;

  if (evidenciaUtil(promo?.sintese)) {
    const id = evidenciaUtil(promo.jobId);
    return fraseExecutiva(id ? `${id}: ${promo.sintese}` : promo.sintese);
  }

  const jobComResultado =
    jobsComContinuidadeAberta(jobs).find((j) => j?.resultado) ||
    (Array.isArray(jobs) ? jobs : []).find(
      (j) => j?.resultado && typeof j.resultado === "object"
    ) ||
    null;
  if (jobComResultado) {
    const id = evidenciaUtil(jobComResultado.id);
    const resumo =
      evidenciaUtil(jobComResultado.resultado?.resumo) ||
      evidenciaUtil(jobComResultado.resultado?.sintese);
    if (resumo) {
      return fraseExecutiva(id ? `${id}: ${resumo}` : resumo);
    }
  }

  const decisoes = Array.isArray(ws?.decisoes) ? ws.decisoes : [];
  for (const d of decisoes) {
    const t = evidenciaUtil(d?.texto);
    if (t) return fraseExecutiva(`Decisão registada: ${t}`);
  }

  const historico = Array.isArray(ws?.historicoResumido)
    ? ws.historicoResumido
    : [];
  for (const h of historico) {
    const t = evidenciaUtil(h?.texto);
    if (!t || !ehProgressoHistorico(t)) continue;
    if (/^Decis[aã]o\s*:/i.test(t)) {
      return fraseExecutiva(
        `Decisão registada: ${t.replace(/^Decis[aã]o\s*:\s*/i, "")}`
      );
    }
    return fraseExecutiva(t);
  }

  return TEXTO_NAO_IDENTIFICADO;
}

/**
 * União tipada: pendências do catálogo + MTE/lastro + Jobs result/needs_correction.
 * @param {{ ws: object, lastro: object|null, jobs: object[] }} fontes
 */
function montarOQueFica(fontes) {
  const { ws, lastro, jobs } = fontes;
  /** @type {string[]} */
  const itens = [];

  const pendCatalogo = Array.isArray(ws?.pendencias)
    ? ws.pendencias.filter((p) => {
        const st = String(p?.status || "aberta");
        return st === "aberta" || st === "open";
      })
    : [];
  for (const p of pendCatalogo) {
    const t = evidenciaUtil(p?.texto);
    if (t && !itens.includes(t)) itens.push(t);
  }

  const mte =
    lastro?.memoriaTrabalhoExecutiva &&
    typeof lastro.memoriaTrabalhoExecutiva === "object"
      ? lastro.memoriaTrabalhoExecutiva
      : null;
  const pendMte = Array.isArray(mte?.pendencias) ? mte.pendencias : [];
  for (const p of pendMte) {
    const t = evidenciaUtil(typeof p === "string" ? p : p?.texto);
    if (t && !itens.includes(t)) itens.push(t);
  }

  for (const j of jobsComContinuidadeAberta(jobs)) {
    const id = evidenciaUtil(j?.id) || "Job";
    const estado = String(j?.estado || j?.status || "");
    const t =
      estado === "needs_correction"
        ? `${id} em needs_correction — verificação não fechou`
        : `${id} em result — aguarda verificação`;
    if (!itens.includes(t)) itens.push(t);
  }

  if (!itens.length) return TEXTO_NAO_IDENTIFICADO;
  return fraseExecutiva(itens[0]);
}

/**
 * Ação imperativa curta: próxima válida → derivar do que fica → passo de Job.
 * @param {{ ws: object, lastro: object|null, jobs: object[], oQueFica: string }} fontes
 */
function montarProximoPasso(fontes) {
  const { ws, lastro, jobs, oQueFica } = fontes;
  const proximas = Array.isArray(ws?.proximasAcoes) ? ws.proximasAcoes : [];
  for (const a of proximas) {
    const t = evidenciaUtil(a?.texto);
    if (ehAcaoExecutivaValida(t)) return fraseExecutiva(t);
  }

  const mte =
    lastro?.memoriaTrabalhoExecutiva &&
    typeof lastro.memoriaTrabalhoExecutiva === "object"
      ? lastro.memoriaTrabalhoExecutiva
      : null;
  if (ehAcaoExecutivaValida(mte?.proximaAcao)) {
    return fraseExecutiva(mte.proximaAcao);
  }

  if (oQueFica && oQueFica !== TEXTO_NAO_IDENTIFICADO) {
    const alvo = oQueFica.replace(/\s*—\s*.*$/, "").trim();
    if (/^JOB-\d+/i.test(alvo) || /\bem needs_correction\b/i.test(oQueFica)) {
      return fraseExecutiva(`Retomar ${alvo}`);
    }
    if (/\bem result\b/i.test(oQueFica)) {
      return fraseExecutiva(`Verificar e fechar ${alvo}`);
    }
    return fraseExecutiva(`Resolver: ${alvo}`);
  }

  const job = jobsComContinuidadeAberta(jobs)[0];
  if (job) {
    const id = evidenciaUtil(job.id) || "Job";
    const estado = String(job.estado || job.status || "");
    if (estado === "needs_correction") {
      return fraseExecutiva(`Retomar ${id} a partir do resultado`);
    }
    if (estado === "result") {
      return fraseExecutiva(`Verificar resultado de ${id}`);
    }
  }

  return TEXTO_NAO_IDENTIFICADO;
}

/**
 * Monta os três campos: estruturado primeiro; conversa do COA só em fallback.
 * @param {{ lastro?: object|null, jobs?: object[], mensagens?: object[] }} [opts]
 * @returns {{ oQueAndou: string, oQueFica: string, proximoPassoAmanha: string }}
 */
export function sugerirCamposEncerramentoSync(opts = {}) {
  const ws = obterWorkspaceAtivo();
  if (!ws?.projeto) {
    return {
      oQueAndou: TEXTO_NAO_IDENTIFICADO,
      oQueFica: TEXTO_NAO_IDENTIFICADO,
      proximoPassoAmanha: TEXTO_NAO_IDENTIFICADO
    };
  }

  const lastro = opts.lastro && typeof opts.lastro === "object" ? opts.lastro : null;
  const jobs = Array.isArray(opts.jobs) ? opts.jobs : [];
  const fontes = { ws, lastro, jobs };

  let oQueAndou = montarOQueAndou(fontes);
  let oQueFica = montarOQueFica(fontes);
  let proximoPassoAmanha = montarProximoPasso({
    ...fontes,
    oQueFica
  });

  const precisaConversa =
    oQueAndou === TEXTO_NAO_IDENTIFICADO ||
    oQueFica === TEXTO_NAO_IDENTIFICADO ||
    proximoPassoAmanha === TEXTO_NAO_IDENTIFICADO;

  if (precisaConversa) {
    const mensagens = Array.isArray(opts.mensagens)
      ? opts.mensagens
      : mensagensSyncDoCoaActivo(ws.projeto?.id);
    if (mensagens.length) {
      const conv = extrairEvidenciaConversacional(mensagens);
      if (oQueAndou === TEXTO_NAO_IDENTIFICADO) oQueAndou = conv.oQueAndou;
      if (oQueFica === TEXTO_NAO_IDENTIFICADO) oQueFica = conv.oQueFica;
      if (proximoPassoAmanha === TEXTO_NAO_IDENTIFICADO) {
        if (oQueFica !== TEXTO_NAO_IDENTIFICADO) {
          proximoPassoAmanha = montarProximoPasso({
            ...fontes,
            oQueFica
          });
        }
        if (proximoPassoAmanha === TEXTO_NAO_IDENTIFICADO) {
          proximoPassoAmanha = conv.proximoPassoAmanha;
        }
      }
    }
  }

  return { oQueAndou, oQueFica, proximoPassoAmanha };
}

/**
 * Descarta promo de lastro cujo Job não sobreviveu ao filtro de missão.
 * @param {object|null} lastro
 * @param {object[]} jobsFiltrados
 * @param {{ id?: string|null, nome?: string|null }|null} missao
 */
function alinharLastroAosJobsDaMissao(lastro, jobsFiltrados, missao) {
  if (!lastro || typeof lastro !== "object") return lastro;
  if (!missao) return lastro;
  const promo = lastro.resultadoMissaoActivo;
  if (!promo || typeof promo !== "object") return lastro;
  const jobId = String(promo.jobId || "").trim();
  if (!jobId) return lastro;
  const naMissao = (Array.isArray(jobsFiltrados) ? jobsFiltrados : []).some(
    (j) => String(j?.id || "").trim() === jobId
  );
  if (naMissao) return lastro;
  const { resultadoMissaoActivo: _ignorado, ...resto } = lastro;
  return resto;
}

/**
 * Gera os três campos com Jobs + lastro/MTE disponíveis.
 * @param {object} [ctx]
 * @returns {Promise<{ oQueAndou: string, oQueFica: string, proximoPassoAmanha: string }>}
 */
export async function sugerirCamposEncerramento(ctx = {}) {
  const missao = await obterMissaoActivaEncerramento(ctx);
  const lastroBruto = await obterLastroParaEncerramento(ctx);
  const jobs = await listarJobsParaEncerramento(ctx);
  const lastro = alinharLastroAosJobsDaMissao(lastroBruto, jobs, missao);
  const base = sugerirCamposEncerramentoSync({ lastro, jobs, mensagens: [] });
  const precisaConversa =
    base.oQueAndou === TEXTO_NAO_IDENTIFICADO ||
    base.oQueFica === TEXTO_NAO_IDENTIFICADO ||
    base.proximoPassoAmanha === TEXTO_NAO_IDENTIFICADO;
  if (!precisaConversa) return base;
  const mensagens = await obterMensagensConversacionais(ctx, missao);
  if (!mensagens.length) return base;
  return sugerirCamposEncerramentoSync({ lastro, jobs, mensagens });
}

/**
 * HTML da faixa D01 + painéis D05/D06.
 * @param {"abrir"|"encerrar"|null} painelAberto
 */
export function htmlFaixaDoDia(painelAberto) {
  const projeto = obterProjetoAtivo();
  const dia = obterDiaExecutivo() || {
    status: "nao_iniciado",
    abertoEm: null,
    encerradoEm: null,
    intencaoDoDia: null,
    continuidade: []
  };
  const cont = obterUltimaContinuidade();
  const status = dia.status || "nao_iniciado";
  const tom = tomStatus(status);
  const podeAbrir = status !== "em_curso";
  const podeEncerrar = status === "em_curso";

  let continuidadeHint = "";
  if (cont) {
    continuidadeHint = `
      <p class="cs-dia-hint">
        Última continuidade (${escaparHtml(cont.dataRef)}):
        <strong>${escaparHtml(cont.proximoPassoAmanha)}</strong>
      </p>`;
  }

  let painel = "";
  if (painelAberto === "abrir") {
    painel = `
      <form class="cs-dia-painel" id="cs-form-abrir-dia" data-painel="abrir">
        <p class="cs-kicker">Abrir o dia</p>
        <p class="cs-dia-painel-desc">Projeto ativo: <strong>${escaparHtml(
          projeto?.nome || "—"
        )}</strong>. Opcionalmente registre a intenção do dia.</p>
        <label class="cs-dia-label" for="cs-dia-intencao">Intenção do dia (opcional)</label>
        <input id="cs-dia-intencao" name="intencao" type="text" maxlength="400"
          placeholder="Ex.: Avançar o build do MG2"
          value="${escaparHtml(cont?.proximoPassoAmanha && status !== "em_curso" ? cont.proximoPassoAmanha : "")}"
          autocomplete="off" />
        <div class="cs-dia-acoes">
          <button type="submit" class="cs-dia-btn is-primary">Confirmar abertura</button>
          <button type="button" class="cs-dia-btn" data-dia-cancel>Cancelar</button>
        </div>
      </form>`;
  } else if (painelAberto === "encerrar") {
    const soLeitura = status === "encerrado";
    let andou = "";
    let fica = "";
    let amanha = "";

    if (soLeitura) {
      andou =
        cont?.oQueAndou && cont.oQueAndou !== "(não informado)"
          ? cont.oQueAndou
          : "";
      fica =
        cont?.oQueFica && cont.oQueFica !== "(não informado)" ? cont.oQueFica : "";
      amanha =
        cont?.proximoPassoAmanha && cont.proximoPassoAmanha !== "(não informado)"
          ? cont.proximoPassoAmanha
          : "";
    } else {
      const sugerido = sugerirCamposEncerramentoSync();
      andou = sugerido.oQueAndou;
      fica = sugerido.oQueFica;
      amanha = sugerido.proximoPassoAmanha;
    }

    const ro = soLeitura && Boolean(andou || fica || amanha) ? " readonly" : "";
    const soLeituraCompleto = Boolean(ro);
    painel = `
      <form class="cs-dia-painel" id="cs-form-encerrar-dia" data-painel="encerrar">
        <p class="cs-kicker">Encerrar o dia</p>
        <p class="cs-dia-painel-desc">${
          soLeituraCompleto
            ? "Continuidade registada pelo CEO — campos preenchidos a partir do estado operacional."
            : "Campos preenchidos pelo CEO a partir do contexto e lastro disponíveis. Revise, edite se quiser e confirme."
        }</p>
        <label class="cs-dia-label" for="cs-dia-andou">O que andou</label>
        <input id="cs-dia-andou" name="andou" type="text" maxlength="500" required
          placeholder="Gerado a partir do lastro da sessão" autocomplete="off"
          value="${escaparHtml(andou)}"${ro} />
        <label class="cs-dia-label" for="cs-dia-fica">O que fica</label>
        <input id="cs-dia-fica" name="fica" type="text" maxlength="500" required
          placeholder="Gerado a partir do lastro da sessão" autocomplete="off"
          value="${escaparHtml(fica)}"${ro} />
        <label class="cs-dia-label" for="cs-dia-amanha">Próximo passo de amanhã</label>
        <input id="cs-dia-amanha" name="amanha" type="text" maxlength="500" required
          placeholder="Gerado a partir do lastro da sessão" autocomplete="off"
          value="${escaparHtml(amanha)}"${ro} />
        <div class="cs-dia-acoes">
          ${
            soLeituraCompleto
              ? `<button type="button" class="cs-dia-btn" data-dia-cancel>Fechar</button>`
              : `<button type="submit" class="cs-dia-btn is-primary">Confirmar encerramento</button>
          <button type="button" class="cs-dia-btn" data-dia-cancel>Cancelar</button>`
          }
        </div>
      </form>`;
  }

  return `
    <section class="cs-dia" aria-label="Faixa do Dia" data-dia-status="${escaparHtml(status)}">
      <div class="cs-dia-faixa">
        <div class="cs-dia-info">
          <p class="cs-kicker">Fluxo Executivo Diário</p>
          <div class="cs-dia-titulo">
            <strong>${escaparHtml(projeto?.nome || "Nenhum projeto ativo")}</strong>
            <span class="cs-dia-badge cs-dia-badge--${tom}">${escaparHtml(
              rotuloStatus(status)
            )}</span>
          </div>
          ${
            dia.intencaoDoDia && status === "em_curso"
              ? `<p class="cs-dia-hint">Intenção: ${escaparHtml(dia.intencaoDoDia)}</p>`
              : continuidadeHint
          }
        </div>
        <div class="cs-dia-ctas">
          ${
            podeAbrir
              ? `<button type="button" class="cs-dia-btn is-primary" data-dia-acao="abrir">Abrir o dia</button>`
              : ""
          }
          ${
            podeEncerrar
              ? `<button type="button" class="cs-dia-btn is-primary" data-dia-acao="encerrar">Encerrar o dia</button>`
              : ""
          }
        </div>
      </div>
      ${painel}
    </section>
  `;
}

/**
 * Refina os campos editáveis com Jobs + lastro/MTE, sem sobrescrever edição do utilizador.
 * @param {HTMLElement} root
 */
async function refinarCamposEncerramento(root) {
  const elAndou = root.querySelector("#cs-dia-andou");
  const elFica = root.querySelector("#cs-dia-fica");
  const elAmanha = root.querySelector("#cs-dia-amanha");
  if (!elAndou || !elFica || !elAmanha) return;
  if (elAndou.readOnly || elFica.readOnly || elAmanha.readOnly) return;

  const snapshot = {
    andou: elAndou.value,
    fica: elFica.value,
    amanha: elAmanha.value
  };

  const lastro = await obterLastroParaEncerramento({});
  const sugerido = await sugerirCamposEncerramento({
    lastroConsciencia: lastro || undefined
  });

  if (elAndou.value === snapshot.andou) elAndou.value = sugerido.oQueAndou;
  if (elFica.value === snapshot.fica) elFica.value = sugerido.oQueFica;
  if (elAmanha.value === snapshot.amanha) {
    elAmanha.value = sugerido.proximoPassoAmanha;
  }
}

/**
 * Liga eventos D01/D05/D06.
 * @param {HTMLElement} root
 * @param {{ getPainel: () => string|null, setPainel: (v: string|null) => void, repintar: () => void }} api
 */
export function ligarFaixaDoDia(root, api) {
  root.querySelectorAll("[data-dia-acao]").forEach((btn) => {
    btn.addEventListener("click", () => {
      api.setPainel(btn.getAttribute("data-dia-acao"));
      api.repintar();
    });
  });

  root.querySelectorAll("[data-dia-cancel]").forEach((btn) => {
    btn.addEventListener("click", () => {
      api.setPainel(null);
      api.repintar();
    });
  });

  const formAbrir = root.querySelector("#cs-form-abrir-dia");
  formAbrir?.addEventListener("submit", (ev) => {
    ev.preventDefault();
    const intencao = root.querySelector("#cs-dia-intencao")?.value || "";
    abrirDiaExecutivo({ intencaoDoDia: intencao });
    api.setPainel(null);
    api.repintar();
  });

  const formEncerrar = root.querySelector("#cs-form-encerrar-dia");
  formEncerrar?.addEventListener("submit", (ev) => {
    ev.preventDefault();
    const oQueAndou = root.querySelector("#cs-dia-andou")?.value || "";
    const oQueFica = root.querySelector("#cs-dia-fica")?.value || "";
    const proximoPassoAmanha = root.querySelector("#cs-dia-amanha")?.value || "";
    const r = encerrarDiaExecutivo({ oQueAndou, oQueFica, proximoPassoAmanha });
    if (r && r.ok === false) return;
    api.setPainel(null);
    api.repintar();
  });

  if (formEncerrar) {
    void refinarCamposEncerramento(root);
  }
}
