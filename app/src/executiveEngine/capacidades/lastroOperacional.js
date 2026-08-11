/**
 * E4 — Isolamento lastro deliberativo × lastro operacional.
 * Tipagem semântica + alinhamento robusto (sem dígito isolado).
 */

import { normalizarTexto } from "../../classificadorIntencao/lexicon.js";

/** @typedef {"decisao_operacional"|"proxima_acao"|"estado_factual"|"instrucao"|"pergunta"|"briefing"} GeneroLastro */

export const GENEROS_LASTRO_OPERACIONAL = Object.freeze([
  "decisao_operacional",
  "proxima_acao",
  "estado_factual"
]);

/**
 * Conteúdo que pertence ao fluxo C2/MRE e não deve ser ecoado em C4.
 * @param {string} [texto]
 */
export function ehLastroDeliberativoIncompativel(texto) {
  const raw = String(texto || "").trim();
  if (!raw) return true;
  const t = normalizarTexto(raw);

  if (
    /\baprovar\b.*\bmodificar\b.*\b(nao\s+priorizar|n[aã]o\s+priorizar)\b/.test(
      t
    ) ||
    /\b(aprovar|modificar|nao\s+priorizar)\b.*\b(aprovar|modificar|nao\s+priorizar)\b.*\b(aprovar|modificar|nao\s+priorizar)\b/.test(
      t
    )
  ) {
    return true;
  }
  if (
    /\b(aprovar|modificar|nao\s+priorizar|n[aã]o\s+priorizar)\b.{0,40}\bproposta\b/.test(
      t
    ) ||
    /\bproposta\b.{0,40}\b(aprovar|modificar|nao\s+priorizar)\b/.test(t)
  ) {
    return true;
  }

  if (/\bmanifesto\b/.test(t)) {
    if (
      /\b(apli[cq]|justif|principio|diretriz|repita|recite|segundo\s+o)\b/.test(
        t
      ) ||
      /\bgovernan[cç]a\b/.test(t) ||
      /\bcaso\s+concreto\b/.test(t)
    ) {
      return true;
    }
  }
  if (
    /\bprincipios?\b/.test(t) &&
    /\b(manifesto|governan[cç]a|caso\s+concreto|apli[cq])\b/.test(t)
  ) {
    return true;
  }

  if (
    /\bp1-[23]\b/.test(t) ||
    /\bpedido\s+de\s+an[aá]lise\b/.test(t) ||
    /\bequipe\s+especializ/.test(t) ||
    /\brecomendacao\s+deve\s+responder\b/.test(t) ||
    /\baprovar,\s*modificar\s+ou\b/.test(t)
  ) {
    return true;
  }

  if (
    /\bproposta\b/.test(t) &&
    /\b(bairro|analis|avali|delibera|parecer|aprov)\b/.test(t)
  ) {
    return true;
  }

  return false;
}

/**
 * Meta-instrução / briefing / prompt de calibração (não é decisão nem acção).
 * @param {string} [texto]
 */
export function ehLastroInstrucaoOuBriefing(texto) {
  const raw = String(texto || "").trim();
  if (!raw) return true;
  const t = normalizarTexto(raw);

  if (/\bnao\s+proponha\b/.test(t)) return true;
  if (/\bnao\s+proponha\s+nenhuma\s+a[cç][aã]o\b/.test(t)) return true;
  if (/\bo\s+que\s+esta\s+aguardando\s+minha\s+decis/.test(t)) return true;
  if (/\baguardando\s+minha\s+decis/.test(t)) return true;

  const metaCampos = [
    /\b(o\s+)?(objectivo|objetivo)\s+atual\b/,
    /\b(a\s+)?prioridade\s+atual\b/,
    /\b(a\s+)?decis[aã]o\s+mais\s+recente\b/,
    /\b(a\s+)?proxima\s+a[cç][aã]o\b/,
    /\baguardando\s+minha\s+decis/
  ];
  const metaHits = metaCampos.filter((re) => re.test(t)).length;
  if (metaHits >= 2) return true;

  if (
    (/\b(objectivo|objetivo)\s+atual\b/.test(t) ||
      /\bprioridade\s+atual\b/.test(t)) &&
    (/\bproxima\s+a[cç][aã]o\b/.test(t) ||
      /\bdecis[aã]o\s+mais\s+recente\b/.test(t))
  ) {
    return true;
  }

  // Agenda numerada de campos meta (≥3 itens) sem entidade operacional concreta
  const itensNumerados = (t.match(/\b\d+\s*[\.\)]\s+\S+/g) || []).length;
  if (
    itensNumerados >= 3 &&
    !/\bsprint\s*\d+\b/.test(t) &&
    !/\bjobs?-\d+\b/.test(t)
  ) {
    return true;
  }

  // Template de formatação / condução
  if (
    /\bresponda\s+(apenas|somente|com)\b/.test(t) ||
    /\bformato\s+(obrigatorio|da\s+resposta)\b/.test(t) ||
    /\bn[aã]o\s+anexe\b/.test(t) ||
    /\bn[aã]o\s+invente\b/.test(t)
  ) {
    return true;
  }

  return false;
}

/**
 * Tipagem determinística do candidato a lastro.
 * @param {string} [texto]
 * @returns {GeneroLastro}
 */
export function classificarGeneroLastro(texto) {
  const raw = String(texto || "").trim();
  const t = normalizarTexto(raw);
  if (!t) return "instrucao";

  if (ehLastroDeliberativoIncompativel(raw)) return "instrucao";
  if (ehLastroInstrucaoOuBriefing(raw)) {
    const metaHits = [
      /\b(objectivo|objetivo)\s+atual\b/,
      /\bprioridade\s+atual\b/,
      /\bdecis[aã]o\s+mais\s+recente\b/,
      /\bproxima\s+a[cç][aã]o\b/,
      /\baguardando\s+minha\s+decis/
    ].filter((re) => re.test(t)).length;
    return metaHits >= 2 || /\bnao\s+proponha\b/.test(t)
      ? "briefing"
      : "instrucao";
  }

  if (
    /^(qual|quais|o\s+que|quando|onde|como|porque|por\s+que)\b/.test(t) ||
    (/\?/.test(raw) &&
      /^(qual|quais|o\s+que|quando|onde|como)\b/.test(t))
  ) {
    return "pergunta";
  }
  if (/\?/.test(raw) && !/\b(manter|priorizar|validar|implementar)\b/.test(t)) {
    return "pergunta";
  }

  if (
    /\b(manter|mantem|manteve|priorizar|priorizado|decid[ií]|decidimos|fica\s+decidido|definimos|definido\s+que)\b/.test(
      t
    )
  ) {
    return "decisao_operacional";
  }

  if (
    /\b(aguarda|aguardando|ainda\s+(nao|sem)|estado\s+(atual|actual)|concluid|em\s+curso|pendente\s+de\s+valida)\b/.test(
      t
    )
  ) {
    return "estado_factual";
  }

  if (
    /\b(validar|implementar|executar|enviar|abrir|fechar|homologar|testar|revisar|despachar|publicar|avan[cç]ar|seguir\s+para)\b/.test(
      t
    )
  ) {
    return "proxima_acao";
  }

  // Sequência operacional: «Após X, …» / «depois de X → Y»
  if (
    /\b(depois|ap[oó]s)\b/.test(t) &&
    /\b(valida|sprint|lod|implement|avan[cç]|prioridade|passo)\b/.test(t)
  ) {
    return "proxima_acao";
  }

  return "instrucao";
}

/**
 * Tokens do objeto — sem dígitos isolados como âncora.
 * @param {{ tipo?: string, id?: string|null, rotulo?: string, detalhe?: string|null }} objeto
 */
export function tokensObjetoOperacional(objeto) {
  const tokens = new Set();
  const rotulo = normalizarTexto(objeto?.rotulo || "");
  const detalhe = normalizarTexto(objeto?.detalhe || "");
  const id = normalizarTexto(objeto?.id || "");
  const tipo = String(objeto?.tipo || "");

  for (const parte of `${rotulo} ${detalhe} ${id}`.split(/\s+/)) {
    if (parte.length >= 3 && !/^\d+$/.test(parte)) tokens.add(parte);
  }

  let numeroEntidade = null;
  if (
    tipo === "sprint" ||
    tipo === "validacao_sprint" ||
    tipo === "proxima_prioridade_apos" ||
    /\bsprint\b/.test(rotulo)
  ) {
    tokens.add("sprint");
    numeroEntidade =
      (String(objeto?.id || objeto?.rotulo || objeto?.referencia || "").match(
        /\d+/
      ) || [])[0] || null;
    if (numeroEntidade) {
      tokens.add(`sprint-${numeroEntidade}`);
      tokens.add(`sprint${numeroEntidade}`);
      // NÃO adicionar o dígito isolado
    }
  }
  if (
    tipo === "validacao_sprint" ||
    tipo === "proxima_prioridade_apos" ||
    /\bvalida/.test(rotulo) ||
    /\bvalida/.test(normalizarTexto(objeto?.referencia || ""))
  ) {
    tokens.add("validacao");
    tokens.add("validar");
  }
  if (tipo === "proxima_prioridade_apos") {
    tokens.add("prioridade");
    tokens.add("apos");
    tokens.add("depois");
  }
  if (tipo === "job" && objeto?.id) {
    tokens.add(normalizarTexto(objeto.id));
    tokens.add("job");
  }
  if (tipo === "prioridade" || tipo === "proxima_decisao") {
    tokens.add("prioridade");
  }
  if (detalhe && !/^\d+$/.test(detalhe)) tokens.add(detalhe);
  const ref = normalizarTexto(objeto?.referencia || "");
  if (ref) {
    for (const parte of ref.split(/\s+/)) {
      if (parte.length >= 3 && !/^\d+$/.test(parte)) tokens.add(parte);
    }
  }

  return [...tokens];
}

/**
 * Extrai { entidade, numero } quando o objeto é numerado (sprint N, JOB-N).
 * @param {{ tipo?: string, id?: string|null, rotulo?: string }} objeto
 */
export function entidadeNumeradaDoObjeto(objeto) {
  const tipo = String(objeto?.tipo || "");
  const rotulo = normalizarTexto(objeto?.rotulo || "");
  const id = String(objeto?.id || "");

  if (tipo === "job" || /\bjobs?-\d+\b/i.test(id) || /\bjobs?-\d+\b/i.test(rotulo)) {
    const m = (id || rotulo).match(/jobs?-(\d+)/i);
    return m ? { entidade: "job", numero: m[1] } : null;
  }
  if (
    tipo === "sprint" ||
    tipo === "validacao_sprint" ||
    tipo === "proxima_prioridade_apos" ||
    /\bsprint\b/.test(rotulo)
  ) {
    const blob = `${id} ${rotulo} ${objeto?.referencia || ""}`;
    const m = blob.match(/(\d+)/);
    return m
      ? { entidade: "sprint", numero: m[1] }
      : { entidade: "sprint", numero: null };
  }
  return null;
}

/**
 * Alinhamento robusto: sem dígito isolado; objecto numerado exige composto ou ≥2 âncoras.
 * @param {string} [texto]
 * @param {{ tipo?: string, id?: string|null, rotulo?: string, detalhe?: string|null }} objeto
 */
export function ehLastroAlinhadoAoObjeto(texto, objeto) {
  const raw = String(texto || "").trim();
  if (!raw || !objeto) return false;
  if (ehLastroDeliberativoIncompativel(raw)) return false;
  if (ehLastroInstrucaoOuBriefing(raw)) return false;
  if (!GENEROS_LASTRO_OPERACIONAL.includes(classificarGeneroLastro(raw))) {
    return false;
  }

  const t = normalizarTexto(raw);
  const tokens = tokensObjetoOperacional(objeto).filter((tok) => !/^\d+$/.test(tok));
  if (!tokens.length) return false;

  const tipo = String(objeto?.tipo || "");
  const numerado = entidadeNumeradaDoObjeto(objeto);

  // Sequência pós-marco: exige marcador «depois/após» + âncora, ou o sprint de referência.
  // Evita alinhar «Validar Sprint 2» a um pedido «após Sprint 1» só por tokens soltos.
  if (tipo === "proxima_prioridade_apos") {
    const temSequencia =
      /\b(depois|ap[oó]s)\b/.test(t) &&
      (/\bvalida/.test(t) || /\bsprint\b/.test(t) || /\bprioridade\b/.test(t));
    const temAvanco =
      /\b(avan[cç]ar|implementar|lod|seguir|homologar|validar)\b/.test(t) ||
      /\bsprint\s*\d+\b/.test(t);
    if (temSequencia && temAvanco) return true;
    if (numerado?.numero) {
      const composto = new RegExp(`\\bsprint\\s*${numerado.numero}\\b`);
      if (
        composto.test(t) &&
        (/\b(depois|ap[oó]s|avan[cç]ar|implementar|lod|proxima|pr[oó]ximo)\b/.test(
          t
        ) ||
          /\bvalida/.test(t))
      ) {
        return true;
      }
    }
    return false;
  }

  if (numerado && numerado.numero) {
    const { entidade, numero } = numerado;
    // Composto explícito: «sprint 1», «sprint1», «job-000067»
    if (entidade === "sprint") {
      const composto = new RegExp(`\\bsprint\\s*${numero}\\b`);
      if (composto.test(t)) return true;
    }
    if (entidade === "job") {
      const composto = new RegExp(`\\bjobs?-0*${numero}\\b`);
      if (composto.test(t)) return true;
    }
    // Fallback: ≥2 âncoras substantivas (ex.: validacao + sprint, sprint + performance)
    const subst = tokens.filter(
      (tok) => tok.length >= 4 || /^sprint/.test(tok) || /^job-/.test(tok)
    );
    const hits = subst.filter((tok) => t.includes(tok));
    return hits.length >= 2;
  }

  const subst = tokens.filter(
    (tok) => tok.length >= 4 || /^job-/.test(tok) || /^sprint/.test(tok)
  );
  const alvos = subst.length ? subst : tokens;
  return alvos.some((tok) => t.includes(tok));
}

/**
 * @param {string} [texto]
 * @param {{ tipo?: string, id?: string|null, rotulo?: string, detalhe?: string|null }} objeto
 * @param {{ exigirAlinhamento?: boolean }} [opts]
 */
export function ehLastroOperacionalUtil(texto, objeto, opts = {}) {
  const raw = String(texto || "").trim();
  if (!raw) return false;
  if (ehLastroDeliberativoIncompativel(raw)) return false;
  if (ehLastroInstrucaoOuBriefing(raw)) return false;
  const genero = classificarGeneroLastro(raw);
  if (!GENEROS_LASTRO_OPERACIONAL.includes(genero)) return false;
  if (opts.exigirAlinhamento === false) return true;
  return ehLastroAlinhadoAoObjeto(raw, objeto);
}

/**
 * @param {string} texto
 * @param {{ tipo?: string, id?: string|null, rotulo?: string, detalhe?: string|null }} objeto
 * @returns {{ texto: string, genero: GeneroLastro, alinhado: boolean }|null}
 */
function candidatoUtil(texto, objeto) {
  const raw = String(texto || "").trim();
  if (!raw) return null;
  if (!ehLastroOperacionalUtil(raw, objeto)) return null;
  return {
    texto: raw,
    genero: classificarGeneroLastro(raw),
    alinhado: true
  };
}

/**
 * Selecciona lastro tipado e alinhado ao objeto.
 * @param {object} estado
 * @param {{ tipo?: string, id?: string|null, rotulo?: string, detalhe?: string|null }} objeto
 */
export function seleccionarLastroOperacional(estado, objeto) {
  const decisoes = Array.isArray(estado?.decisoes) ? estado.decisoes : [];
  const proximas = Array.isArray(estado?.proximasAcoes)
    ? estado.proximasAcoes
    : [];
  const pendencias = Array.isArray(estado?.pendencias)
    ? estado.pendencias.filter((p) => p && (p.status === "aberta" || !p.status))
    : [];
  const proximoPasso = estado?.proximoPasso
    ? String(estado.proximoPasso).trim()
    : "";

  /** @type {string|null} */
  let decisao = null;
  /** @type {GeneroLastro|null} */
  let generoDecisao = null;
  for (const d of decisoes) {
    const txt = String(d?.texto || d?.descricao || d || "").trim();
    const c = candidatoUtil(txt, objeto);
    if (c && c.genero === "decisao_operacional") {
      decisao = c.texto;
      generoDecisao = c.genero;
      break;
    }
    // Facto ou acção na lista de decisões: ainda útil, mas não como «decisão»
    if (c && !decisao && c.genero === "estado_factual") {
      // defer — handled below as factual from all pools
    }
  }

  /** @type {string|null} */
  let proxima = null;
  /** @type {GeneroLastro|null} */
  let generoProxima = null;
  const candidatosProx = [
    proximoPasso,
    ...proximas.map((p) => String(p?.texto || p?.descricao || "").trim())
  ].filter(Boolean);
  for (const c of candidatosProx) {
    const cand = candidatoUtil(c, objeto);
    if (!cand) continue;
    if (cand.genero === "proxima_acao") {
      proxima = cand.texto;
      generoProxima = cand.genero;
      break;
    }
  }
  // Decisão alinhada também pode aparecer em próximas (raro) — não promover a decisão
  if (!proxima) {
    for (const c of candidatosProx) {
      const cand = candidatoUtil(c, objeto);
      if (cand && cand.genero === "decisao_operacional" && !decisao) {
        decisao = cand.texto;
        generoDecisao = cand.genero;
      }
    }
  }

  /** @type {string|null} */
  let factual = null;
  const poolFactos = [
    ...decisoes.map((d) => String(d?.texto || d?.descricao || "").trim()),
    ...candidatosProx,
    ...pendencias.map((p) => String(p?.texto || p?.descricao || "").trim())
  ];
  for (const txt of poolFactos) {
    const cand = candidatoUtil(txt, objeto);
    if (cand && cand.genero === "estado_factual") {
      factual = cand.texto;
      break;
    }
  }

  /** @type {string|null} */
  let pendencia = null;
  for (const p of pendencias) {
    const txt = String(p?.texto || p?.descricao || "").trim();
    const cand = candidatoUtil(txt, objeto);
    if (cand) {
      pendencia = cand.texto;
      break;
    }
  }

  return {
    decisao,
    proxima,
    factual,
    pendencia,
    generoDecisao,
    generoProxima,
    usouLastro: Boolean(decisao || proxima || factual || pendencia)
  };
}
