/**
 * Snapshot situacional para CONSULTA → RESPONDER.
 * Prioridade: evidência recente da sessão > MTE/ops específicos >
 * nunca preencher com estado operacional genérico antigo.
 */

import { normalizarTexto } from "../classificadorIntencao/lexicon.js";
import { ehPedidoSituacionalTrabalho } from "../classificadorIntencao/regras.js";
import { detectarPedidoConsultaResposta } from "./politicaAnaliseDeliberativa.js";

/**
 * @typedef {object} SnapshotSituacionalConsulta
 * @property {string|null} etapaAtual
 * @property {string|null} ultimaConclusao
 * @property {string|null} emCursoAgora
 * @property {string|null} proximoPasso
 * @property {string[]} lacunas
 * @property {string[]} factos
 * @property {string[]} fontes
 * @property {boolean} temLastroSuficiente
 * @property {string} blocoMensagem
 */

/**
 * @param {unknown} v
 * @param {number} [max]
 */
function limpar(v, max = 320) {
  const s = String(v ?? "")
    .replace(/\s+/g, " ")
    .trim();
  if (!s) return null;
  return s.length <= max ? s : `${s.slice(0, max - 1)}…`;
}

/**
 * Prosa inventada típica — não usar como lastro factual.
 * @param {string} t
 */
function ehProsaInventadaInutil(t) {
  const s = String(t || "");
  return (
    /falta\s+de\s+clareza/i.test(s) ||
    /elabora(r|ção)\s+(de\s+)?(um\s+)?relat/i.test(s) ||
    /delegar\s+a\s+elabora/i.test(s) ||
    /^\s*plano\s*:/i.test(s)
  );
}

/**
 * Estado operacional / dia / continuidade genéricos — NÃO servir de etapa/conclusão.
 * @param {string|null|undefined} t
 */
export function ehLastroGenericoOperacional(t) {
  const s = String(t || "").trim();
  if (!s) return true;
  if (
    /^(aten[cç][aã]o|est[aá]vel|em\s+andamento|cr[ií]tico)$/i.test(s)
  ) {
    return true;
  }
  if (/\bestado\s+operacional\b/i.test(s) && /aten[cç][aã]o|est[aá]vel/i.test(s)) {
    return true;
  }
  if (/\bfase\s+de\s+continuidade\b/i.test(s)) return true;
  if (/^continuidade\b/i.test(s) && s.length < 48) return true;
  if (/\bdia\s+(em\s+curso|encerrado|ainda\s+n[aã]o)\b/i.test(s)) return true;
  if (/\bsitua[cç][aã]o\s+do\s+projeto\b/i.test(s)) return true;
  if (/^frente\s+activa\s*:/i.test(s) && s.length < 56) return true;
  if (
    /\bn[aã]o\s+h[aá]\s+(registros?|actividades?|atividades?)\b/i.test(s)
  ) {
    return true;
  }
  if (
    /\bpend[eê]ncias?\b/i.test(s) &&
    /\b(risco|papel\s+do\s+usu[aá]rio|abertas?)\b/i.test(s) &&
    !/\bJOB-\d+/i.test(s)
  ) {
    return true;
  }
  return false;
}

/**
 * @param {string|null|undefined} v
 * @param {number} [max]
 * @returns {string|null}
 */
function limparEspecifico(v, max = 320) {
  const s = limpar(v, max);
  if (!s || ehLastroGenericoOperacional(s) || ehProsaInventadaInutil(s)) {
    return null;
  }
  return s;
}

/**
 * Abertura/saudação/pergunta CN — nunca conta como conclusão de trabalho.
 * @param {string} t
 */
function ehFalaConversacionalSemConclusao(t) {
  const s = String(t || "").trim();
  if (!s) return true;
  if (/\?/.test(s)) return true;
  if (
    /^(bom\s+dia|boa\s+tarde|boa\s+noite|ol[aá]|oie|hey)\b/i.test(s)
  ) {
    return true;
  }
  if (/\bqual\s+[eé]\s+o\s+objetivo\s+de\s+agora\b/i.test(s)) return true;
  if (/\bqual\s+frente\s+atacamos\s+agora\b/i.test(s)) return true;
  if (/\bvamos\s+continuar\s+de\s+onde\s+paramos\b/i.test(s)) return true;
  if (/\bqual\s+[eé]\s+a\s+pr[oó]xima\s+decis[aã]o\b/i.test(s)) return true;
  if (/\bn[aã]o\s+recebi\s+instru[cç][aã]o\b/i.test(s)) return true;
  if (/\bqual\s+[eé]\s+o\s+pr[oó]ximo\s+passo\s+que\s+autorizamos\b/i.test(s)) {
    return true;
  }
  if (/\bconfirmamos\s+isto\s+e\s+avan[cç]amos\b/i.test(s)) return true;
  if (/\bo\s+que\s+falta\s+para\s+fechar\s+esta\s+decis[aã]o\b/i.test(s)) {
    return true;
  }
  return false;
}

/**
 * Evidência factual de conclusão de trabalho (não prosa conversacional).
 * @param {string} t
 */
function ehEvidenciaConclusaoTrabalho(t) {
  const s = String(t || "");
  if (!s || ehFalaConversacionalSemConclusao(s)) return false;
  return /\b(conclu[ií]d|conclu[ií]mos|conclu[ií]do|feito|aplicad|implement|corrigid|aprovad|fechad|finaliz|ligado|montad|criad)\w*\b/i.test(
    s
  );
}

/**
 * Evidência recente do fio da conversa (sessão), sem inventar.
 * @param {ReadonlyArray<{ papel?: string, texto?: string }>|null|undefined} historico
 */
function extrairEvidenciaSessaoRecente(historico) {
  /** @type {string[]} */
  const pedidosUtilizador = [];
  /** @type {string[]} */
  const respostasCeo = [];

  if (!Array.isArray(historico) || !historico.length) {
    return {
      etapaAtual: null,
      ultimaConclusao: null,
      emCursoAgora: null,
      proximoPasso: null,
      temEvidencia: false
    };
  }

  const recentes = historico.filter((t) => t && String(t.texto || "").trim()).slice(-14);

  for (let i = recentes.length - 1; i >= 0; i -= 1) {
    const t = recentes[i];
    const papel = String(t.papel || "").toLowerCase();
    const texto = limpar(t.texto, 360);
    if (!texto) continue;
    if (ehPedidoSituacionalTrabalho(normalizarTexto(texto))) continue;
    if (detectarPedidoConsultaResposta(texto)) continue;
    if (ehProsaInventadaInutil(texto) || ehLastroGenericoOperacional(texto)) {
      continue;
    }

    if (papel === "usuario" || papel === "user") {
      if (pedidosUtilizador.length < 4) pedidosUtilizador.push(texto);
    } else if (papel === "ceo" || papel === "assistente") {
      // Aberturas/perguntas CN nunca entram no pool de conclusão
      if (ehFalaConversacionalSemConclusao(texto)) continue;
      if (respostasCeo.length < 4) respostasCeo.push(texto);
    }
  }

  // Mais recente = índice 0 (percorremos de trás para a frente)
  const atual = pedidosUtilizador[0] || null;

  // Só evidência real de conclusão — sem fallback para resposta recente ou pedido anterior
  const ceoConclusivo = respostasCeo.find((r) => ehEvidenciaConclusaoTrabalho(r));
  const ultimaConclusao = ceoConclusivo || null;

  let proximoPasso = null;
  const pedidoProximo = pedidosUtilizador.find((p) =>
    /\b(pr[oó]ximo\s+passo|em\s+seguida|agora\s+vamos|seguir\s+com)\b/i.test(p)
  );
  if (pedidoProximo && pedidoProximo !== atual) {
    proximoPasso = pedidoProximo;
  }

  return {
    etapaAtual: atual ? `Sessão — foco recente: ${atual}` : null,
    ultimaConclusao: ultimaConclusao
      ? `Sessão — evidência recente: ${ultimaConclusao}`
      : null,
    emCursoAgora: atual ? `Sessão — em curso: ${atual}` : null,
    proximoPasso: proximoPasso
      ? `Sessão — próximo indicado: ${proximoPasso}`
      : null,
    temEvidencia: Boolean(atual || ultimaConclusao)
  };
}

/**
 * @param {ReadonlyArray<string>|null|undefined} factos
 */
function extrairDeFactosOps(factos) {
  /** @type {{ jobsEmCurso: string[], jobsResultado: string[], gates: string[] }} */
  const out = {
    jobsEmCurso: [],
    jobsResultado: [],
    gates: []
  };
  if (!Array.isArray(factos)) return out;
  for (const f of factos) {
    const s = String(f || "").trim();
    if (!s || ehLastroGenericoOperacional(s)) continue;
    if (/Estado Executivo — Job em (execução|handoff)/i.test(s)) {
      out.jobsEmCurso.push(s);
    } else if (
      /Estado Executivo — Job com resultado/i.test(s) ||
      /Estado Executivo — Job em correção/i.test(s)
    ) {
      out.jobsResultado.push(s);
    } else if (/Estado Executivo — Gate pendente/i.test(s)) {
      out.gates.push(s);
    }
    // Frente activa genérica: ignorada de propósito (não é etapa de trabalho)
  }
  return out;
}

/**
 * Escolhe o primeiro candidato específico; regista fonte.
 * @param {Array<[string|null|undefined, string]>} candidatos
 * @param {string[]} fontes
 */
function escolher(candidatos, fontes) {
  for (const [valor, fonte] of candidatos) {
    const v = limparEspecifico(valor);
    if (v) {
      fontes.push(fonte);
      return v;
    }
  }
  return null;
}

/**
 * Monta snapshot situacional — prioridade sessão recente.
 * @param {{
 *   lastro?: object|null,
 *   historico?: ReadonlyArray<{ papel?: string, texto?: string }>|null,
 *   factosOficiais?: ReadonlyArray<string>|null,
 *   snapshotPainel?: object|null
 * }} [opts]
 * @returns {SnapshotSituacionalConsulta}
 */
export function montarSnapshotSituacionalConsulta(opts = {}) {
  const lastro = opts.lastro && typeof opts.lastro === "object" ? opts.lastro : null;
  const mte =
    lastro?.memoriaTrabalhoExecutiva &&
    typeof lastro.memoriaTrabalhoExecutiva === "object"
      ? lastro.memoriaTrabalhoExecutiva
      : null;
  const h = mte?.hierarquia && typeof mte.hierarquia === "object" ? mte.hierarquia : {};
  const e =
    mte?.estadoConversa && typeof mte.estadoConversa === "object"
      ? mte.estadoConversa
      : {};

  /** @type {string[]} */
  const fontes = [];
  const sessao = extrairEvidenciaSessaoRecente(opts.historico);
  const ops = extrairDeFactosOps(opts.factosOficiais);

  // 1) Sessão recente  2) Ops específicos (Job)  3) MTE específico (não genérico)
  // Nunca: Atenção / continuidade / dia / frente genérica / pendências antigas
  const etapaAtual = escolher(
    [
      [sessao.etapaAtual, "sessao.historico"],
      [ops.jobsEmCurso[0], "ops.jobEmCurso"],
      [h.entregaCorrente, "mte.entregaCorrente"]
    ],
    fontes
  );

  const ultimaConclusao = escolher(
    [
      [sessao.ultimaConclusao, "sessao.historico"],
      [ops.jobsResultado[0], "ops.jobResultado"],
      [mte?.decisoesTomadas?.[0], "mte.decisoesTomadas"]
    ],
    fontes
  );

  const emCursoAgora = escolher(
    [
      [sessao.emCursoAgora, "sessao.historico"],
      [ops.jobsEmCurso[0], "ops.jobEmCurso"],
      [e.emExecucao, "mte.emExecucao"],
      [h.objectivoAtual || mte?.objectivoAtivo, "mte.objectivoAtual"]
    ],
    fontes
  );

  const proximoPasso = escolher(
    [
      [sessao.proximoPasso, "sessao.historico"],
      [mte?.proximaAcao, "mte.proximaAcao"],
      [ops.gates[0] ? `Resolver: ${ops.gates[0]}` : null, "ops.gate"]
    ],
    fontes
  );
  // painel.proximoPasso / estado do dia: não usados (genéricos / nomes inconsistentes)

  /** @type {string[]} */
  const lacunas = [];
  if (!etapaAtual) lacunas.push("etapa atual");
  if (!ultimaConclusao) lacunas.push("última conclusão");
  if (!emCursoAgora) lacunas.push("o que está sendo feito agora");
  if (!proximoPasso) lacunas.push("próximo passo");

  const temEvidenciaEspecifica =
    sessao.temEvidencia ||
    ops.jobsEmCurso.length > 0 ||
    ops.jobsResultado.length > 0 ||
    Boolean(limparEspecifico(h.entregaCorrente)) ||
    Boolean(limparEspecifico(mte?.decisoesTomadas?.[0])) ||
    Boolean(limparEspecifico(e.emExecucao)) ||
    Boolean(limparEspecifico(mte?.proximaAcao)) ||
    Boolean(limparEspecifico(h.objectivoAtual || mte?.objectivoAtivo)) ||
    ops.gates.length > 0;

  const temLastroSuficiente =
    temEvidenciaEspecifica &&
    Boolean(etapaAtual || ultimaConclusao || emCursoAgora || proximoPasso);

  /** @type {string[]} */
  const factos = [
    "SNAPSHOT SITUACIONAL (CONSULTA — factos do turno; não inventar além disto):",
    "Prioridade: evidência recente da sessão > Job/MTE específico > lacuna (nunca estado genérico antigo).",
    etapaAtual
      ? `Etapa atual: ${etapaAtual}`
      : "Etapa atual: LACUNA — sem evidência recente suficiente (não uso continuidade/Atenção/dia genéricos)",
    ultimaConclusao
      ? `Última conclusão: ${ultimaConclusao}`
      : "Última conclusão: LACUNA — sem evidência recente suficiente",
    emCursoAgora
      ? `O que está sendo feito agora: ${emCursoAgora}`
      : "O que está sendo feito agora: LACUNA — sem evidência recente suficiente",
    proximoPasso
      ? `Próximo passo: ${proximoPasso}`
      : "Próximo passo: LACUNA — sem evidência recente suficiente"
  ];
  if (lacunas.length) {
    factos.push(`Lacunas situacionais declaradas: ${lacunas.join("; ")}`);
  }
  if (!temLastroSuficiente) {
    factos.push(
      "LASTRO INSUFICIENTE: responder declarando as lacunas — proibido inventar ou preencher com estado operacional antigo."
    );
  }

  const blocoMensagem =
    "[SNAPSHOT SITUACIONAL — CONSULTA]\n" +
    factos.slice(1).join("\n") +
    (fontes.length ? `\nFontes: ${[...new Set(fontes)].join(", ")}` : "");

  return {
    etapaAtual,
    ultimaConclusao,
    emCursoAgora,
    proximoPasso,
    lacunas,
    factos,
    fontes: [...new Set(fontes)],
    temLastroSuficiente,
    blocoMensagem
  };
}

/**
 * Injeta snapshot em `entrada` MRE (factosOficiais + bloco na mensagem).
 * Idempotente se já existir `entrada.snapshotSituacional`.
 * @param {object} entrada
 * @param {{ lastro?: object|null, historico?: ReadonlyArray<object>|null }} [ctx]
 * @returns {object} entrada
 */
export function injectarSnapshotSituacionalNaEntrada(entrada, ctx = {}) {
  if (!entrada || typeof entrada !== "object") return entrada;
  if (entrada.snapshotSituacional && entrada.snapshotSituacional.factos) {
    return entrada;
  }

  const snap = montarSnapshotSituacionalConsulta({
    lastro: ctx.lastro || null,
    historico: ctx.historico || null,
    factosOficiais: entrada.factosOficiais || [],
    snapshotPainel: entrada.snapshotPainel || null
  });

  entrada.snapshotSituacional = snap;
  const base = Array.isArray(entrada.factosOficiais)
    ? entrada.factosOficiais.slice()
    : [];
  entrada.factosOficiais = [...base, ...snap.factos];

  const msg = String(entrada.mensagem || "");
  if (!/\[SNAPSHOT SITUACIONAL — CONSULTA\]/.test(msg)) {
    entrada.mensagem = msg
      ? `${msg}\n\n${snap.blocoMensagem}`
      : snap.blocoMensagem;
  }
  return entrada;
}

/**
 * Diagnóstico determinístico — CONSULTA não vira «problema de negócio».
 * @param {object} entrada
 */
export function diagnosticoConsultaSituacional(entrada) {
  const snap = entrada?.snapshotSituacional;
  const lacunas = Array.isArray(snap?.lacunas) ? snap.lacunas : [];
  return {
    objetivoReal:
      "Responder à consulta situacional sobre o estado actual do trabalho",
    problemaNegocio: snap?.temLastroSuficiente
      ? "Consulta situacional — não há problema de negócio a deliberar; responder só com factos do snapshot"
      : lacunas.length
        ? `Consulta situacional com lastro insuficiente. Lacunas: ${lacunas.join("; ")}. Não inventar.`
        : "Consulta situacional sem lastro situacional. Não inventar problema, relatório, etapa ou progresso.",
    natureza: "operacional"
  };
}

/**
 * Análise determinística a partir do snapshot (estágio 4 em CONSULTA).
 * @param {object|null|undefined} snap
 * @returns {string}
 */
export function comporAnaliseConsultaDesdeSnapshot(snap) {
  if (!snap || typeof snap !== "object") {
    return (
      "Não tenho lastro situacional neste turno. " +
      "Informação ausente: etapa atual; última conclusão; o que está sendo feito agora; próximo passo. " +
      "Não invento problema, relatório, etapa ou progresso."
    );
  }
  if (!snap.temLastroSuficiente) {
    const ausentes =
      Array.isArray(snap.lacunas) && snap.lacunas.length
        ? snap.lacunas.join("; ")
        : "etapa atual; última conclusão; o que está sendo feito agora; próximo passo";
    return (
      `Não tenho evidência recente suficiente para responder com segurança às quatro perguntas sobre o trabalho em curso. ` +
      `Informação ausente: ${ausentes}. ` +
      `Não preencho com continuidade, Atenção, estado do dia ou pendências antigas. ` +
      `Não invento problema, relatório, etapa ou progresso.`
    );
  }
  const linhas = [
    `Etapa actual: ${snap.etapaAtual || "LACUNA — sem evidência recente."}.`,
    `O que acabámos de concluir: ${snap.ultimaConclusao || "LACUNA — sem evidência recente."}.`,
    `O que estamos a fazer agora: ${snap.emCursoAgora || "LACUNA — sem evidência recente."}.`,
    `Próximo passo: ${snap.proximoPasso || "LACUNA — sem evidência recente."}.`
  ];
  if (Array.isArray(snap.lacunas) && snap.lacunas.length) {
    linhas.push(`Lacunas remanescentes: ${snap.lacunas.join("; ")}.`);
  }
  return linhas.join(" ");
}

/**
 * Hints de CONSULTA para estágios 0/4/6.
 */
export function hintEstagio0ConsultaResposta() {
  return (
    " CONSULTA SITUACIONAL: NÃO inventar problema de negócio, relatório, etapa ou progresso. " +
    "objetivoReal = responder à consulta; problemaNegocio = declarar que é consulta (ou listar lacunas do SNAPSHOT), nunca um problema inventado."
  );
}

export function hintEstagio4ConsultaResposta() {
  return (
    " CONSULTA SITUACIONAL: o campo analise DEVE responder só com factos do SNAPSHOT SITUACIONAL / factosUsados " +
    "(etapa, última conclusão, agora, próximo passo). " +
    "Proibido inventar problema, relatório, etapa ou progresso. " +
    "Proibido preencher com continuidade/Atenção/estado do dia genéricos. " +
    "Se o snapshot marcar LACUNA / LASTRO INSUFICIENTE, declare as lacunas em vez de inventar."
  );
}
