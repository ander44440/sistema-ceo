/**
 * P1-3 — Manifesto canónico do MG2 no runtime do CEO.
 * Fonte única: <repo-MG2>/docs/MANIFESTO-MG2.md
 * Não duplica o documento; deriva apenas estrutura (secções) do texto carregado.
 */

import { normalizarTexto } from "../classificadorIntencao/lexicon.js";
import { detectarPedidoAnaliseDeliberativa } from "../mre/politicaAnaliseDeliberativa.js";
import { ehRecomendacaoOperacional } from "../classificadorIntencao/recomendacaoOperacional.js";
import { ceoApiUrl } from "../ceoApiBase.js";

/** Caminho relativo canónico dentro do repositório do jogo. */
export const MANIFESTO_MG2_RELATIVO = "docs/MANIFESTO-MG2.md";

/** Identificador estável da origem (nunca confundir com briefing ou catálogo CEO). */
export const MANIFESTO_MG2_ORIGEM_ID = "manifesto_mg2_canonico";

/** @type {{ ok: boolean, origem: string, caminhoRelativo: string, caminhoAbsoluto: string|null, conteudo: string, secoes: Array<{id:string,titulo:string,corpo:string}>, principiosSelecionaveis: string[], mtimeMs: number|null, carregadoEm: number, erro?: string } | null} */
let cache = null;

/**
 * @param {string} [envRepo]
 * @returns {string[]}
 */
export function candidatosRepoMg2(envRepo) {
  const lista = [];
  const env = String(envRepo || "").trim();
  if (env) lista.push(env.replace(/[\/\\]+$/, ""));
  // Predefinição local alinhada ao briefing operacional
  lista.push("E:\\anderson\\Projoto motoboy game");
  lista.push("E:/anderson/Projoto motoboy game");
  return [...new Set(lista)];
}

/**
 * @param {string} repoRoot
 * @returns {string}
 */
export function caminhoCanonicoAbsoluto(repoRoot) {
  const root = String(repoRoot || "").replace(/[\/\\]+$/, "");
  const sep = root.includes("\\") ? "\\" : "/";
  return `${root}${sep}${MANIFESTO_MG2_RELATIVO.replace(/\//g, sep)}`;
}

/**
 * Extrai secções `## N. Título` do Markdown canónico (derivado, não inventado).
 * @param {string} markdown
 */
export function extrairSecoesManifesto(markdown) {
  const texto = String(markdown || "");
  const linhas = texto.split(/\r?\n/);
  /** @type {Array<{id:string,titulo:string,corpo:string}>} */
  const secoes = [];
  let actual = null;
  for (const linha of linhas) {
    const m = linha.match(/^##\s+(\d+)\.\s+(.+?)\s*$/);
    if (m) {
      if (actual) secoes.push(actual);
      actual = {
        id: `§${m[1]}`,
        titulo: m[2].trim(),
        corpo: ""
      };
      continue;
    }
    if (actual) {
      actual.corpo = actual.corpo
        ? `${actual.corpo}\n${linha}`
        : linha;
    }
  }
  if (actual) secoes.push(actual);
  return secoes.map((s) => ({
    ...s,
    corpo: s.corpo.replace(/\n+$/, "").trim()
  }));
}

/**
 * Rótulos seleccionáveis no estágio 3 — sempre derivados do ficheiro carregado.
 * @param {Array<{id:string,titulo:string}>} secoes
 */
export function principiosSelecionaveisDeSecoes(secoes) {
  return (secoes || []).map((s) => `${s.id} ${s.titulo}`);
}

/**
 * Pedido explícito de avaliação segundo o Manifesto.
 * @param {string} [texto]
 */
export function ehPedidoSegundoManifesto(texto) {
  const t = normalizarTexto(texto);
  if (!t) return false;
  return (
    /\bmanifesto\b/.test(t) ||
    /\bsegundo\s+o\s+manifesto\b/.test(t) ||
    /\best[aá]\s+alinhad[oa]\s+(ao|com)\s+(o\s+)?manifesto\b/.test(t) ||
    /\bvisao\s+do\s+mg2\b/.test(t) ||
    /\bprincipios?\s+da\s+visao\b/.test(t)
  );
}

/**
 * Política: anexar Manifesto quando pedido explícito ou deliberação C2 relevante no COA MG2.
 * @param {string} [texto]
 * @param {{ id?: string, nome?: string }|null} [coa]
 */
export function deveAnexarManifestoMg2(texto, coa = null) {
  if (ehPedidoSegundoManifesto(texto)) return true;
  // E4: recomendação operacional nunca anexa Manifesto automaticamente
  if (ehRecomendacaoOperacional(texto)) return false;
  const id = String(coa?.id || "").toLowerCase();
  const nome = String(coa?.nome || "").toLowerCase();
  const coaMg2 =
    id === "prj-mg2" ||
    id === "coa-mg2" ||
    /\bmg2\b/.test(id) ||
    /motoboy\s*game\s*2|\bmg2\b/.test(nome);
  if (!coaMg2) return false;
  // Deliberação de produto/proposta no COA MG2 → Manifesto é diretriz relevante
  return detectarPedidoAnaliseDeliberativa(texto);
}

/**
 * @param {object} parcial
 */
export function montarDocumentoManifesto(parcial) {
  const conteudo = String(parcial.conteudo || "");
  const secoes = Array.isArray(parcial.secoes)
    ? parcial.secoes
    : extrairSecoesManifesto(conteudo);
  return {
    ok: parcial.ok !== false && Boolean(conteudo.trim()),
    origem: MANIFESTO_MG2_ORIGEM_ID,
    caminhoRelativo: MANIFESTO_MG2_RELATIVO,
    caminhoAbsoluto: parcial.caminhoAbsoluto ?? null,
    conteudo,
    secoes,
    principiosSelecionaveis: principiosSelecionaveisDeSecoes(secoes),
    mtimeMs:
      typeof parcial.mtimeMs === "number" ? parcial.mtimeMs : null,
    carregadoEm:
      typeof parcial.carregadoEm === "number"
        ? parcial.carregadoEm
        : Date.now(),
    ...(parcial.erro ? { erro: String(parcial.erro) } : {})
  };
}

/**
 * Bloco de contexto para a mensagem MRE — diretriz, não dump a repetir.
 * @param {ReturnType<typeof montarDocumentoManifesto>} doc
 * @param {{ maxChars?: number }} [opts]
 */
export function blocoContextoManifestoParaMre(doc, opts = {}) {
  if (!doc || !doc.ok || !doc.conteudo) return null;
  const max = opts.maxChars ?? 14000;
  const corpo =
    doc.conteudo.length <= max
      ? doc.conteudo
      : `${doc.conteudo.slice(0, max - 1)}…`;
  return (
    `[DIRETRIZ CANÓNICA — Manifesto do Motoboy Game 2]\n` +
    `origem=${doc.origem}; ficheiro=${doc.caminhoRelativo}` +
    (doc.caminhoAbsoluto ? `; path=${doc.caminhoAbsoluto}` : "") +
    `\n` +
    `Uso: DIRETRIZ DE DECISÃO. Aplicar os princípios ao caso concreto. ` +
    `Proibido repetir o Manifesto na resposta. ` +
    `Proibido inventar princípios ausentes deste texto. ` +
    `Proibido substituir estes princípios por catálogo genérico de governança do CEO.\n` +
    `---\n${corpo}\n---`
  );
}

/**
 * Hint LLM quando o Manifesto está anexado.
 */
export function hintManifestoComoDiretriz() {
  return (
    " P1-3 MANIFESTO MG2 (fonte canónica docs/MANIFESTO-MG2.md): " +
    "Trate o Manifesto como DIRETRIZ DE DECISÃO. " +
    "Em principiosAplicados escolha APENAS secções/títulos presentes no Manifesto anexado " +
    "(ex.: «§13 O mundo deve contar a história»). " +
    "Na análise, mostre COMO cada princípio seleccionado se aplica ao caso — não liste só nomes. " +
    "Não recite o Manifesto. Não invente princípios. " +
    "Não use princípios de governança do Sistema CEO (ADR-015, tempo do utilizador, etc.) " +
    "como substituto da visão do jogo."
  );
}

/**
 * Carrega do disco (Node). Usado por API Vite e testes.
 * @param {{ repoRoot?: string, caminhoAbsoluto?: string, fs: { existsSync: Function, statSync: Function, readFileSync: Function } }} opts
 */
export function carregarManifestoMg2DoDisco(opts = {}) {
  const fsMod = opts.fs;
  if (!fsMod || typeof fsMod.readFileSync !== "function") {
    const falha = montarDocumentoManifesto({
      ok: false,
      conteudo: "",
      erro: "fs obrigatório para carga do disco"
    });
    cache = falha;
    return falha;
  }

  const absolutos = [];
  if (opts.caminhoAbsoluto) absolutos.push(opts.caminhoAbsoluto);
  for (const repo of candidatosRepoMg2(
    opts.repoRoot || processEnv("CEO_MG2_REPO")
  )) {
    absolutos.push(caminhoCanonicoAbsoluto(repo));
  }

  let ultimoErro = "ficheiro não encontrado";
  for (const abs of absolutos) {
    try {
      if (!fsMod.existsSync(abs)) {
        ultimoErro = `ausente: ${abs}`;
        continue;
      }
      const st = fsMod.statSync(abs);
      const conteudo = fsMod.readFileSync(abs, "utf8");
      if (!String(conteudo).trim()) {
        ultimoErro = `vazio: ${abs}`;
        continue;
      }
      const doc = montarDocumentoManifesto({
        ok: true,
        conteudo,
        caminhoAbsoluto: abs,
        mtimeMs: st.mtimeMs || st.mtime?.getTime?.() || Date.now()
      });
      cache = doc;
      return doc;
    } catch (err) {
      ultimoErro = err && err.message ? err.message : String(err);
    }
  }

  const falha = montarDocumentoManifesto({
    ok: false,
    conteudo: "",
    erro: ultimoErro
  });
  cache = falha;
  return falha;
}

function processEnv(key) {
  try {
    return typeof process !== "undefined" && process.env
      ? process.env[key]
      : "";
  } catch {
    return "";
  }
}

/**
 * Obtém Manifesto (cache + disco em Node + HTTP no browser).
 * @param {{ forcar?: boolean, fs?: object, repoRoot?: string, caminhoAbsoluto?: string, fetchImpl?: typeof fetch }} [opts]
 */
export async function obterManifestoMg2(opts = {}) {
  if (cache && cache.ok && !opts.forcar) {
    return cache;
  }

  // Disco: fs injectado ou Node nativo
  if (opts.fs || isNodeRuntime()) {
    try {
      const fsMod = opts.fs || (await import("node:fs"));
      return carregarManifestoMg2DoDisco({
        fs: fsMod,
        repoRoot: opts.repoRoot,
        caminhoAbsoluto: opts.caminhoAbsoluto
      });
    } catch (err) {
      if (opts.fs) {
        return montarDocumentoManifesto({
          ok: false,
          conteudo: "",
          erro: err && err.message ? err.message : String(err)
        });
      }
      // browser sem fs → HTTP
    }
  }

  // Browser: API do servidor Vite
  const fetchImpl = opts.fetchImpl || globalThis.fetch;
  if (typeof fetchImpl !== "function") {
    const falha = montarDocumentoManifesto({
      ok: false,
      conteudo: "",
      erro: "sem transporte para carregar Manifesto"
    });
    cache = falha;
    return falha;
  }

  try {
    const resp = await fetchImpl(ceoApiUrl("/api/ceo/manifesto-mg2"));
    const data = await resp.json();
    if (!resp.ok || !data.ok) {
      const falha = montarDocumentoManifesto({
        ok: false,
        conteudo: "",
        erro: (data && data.erro) || `HTTP ${resp.status}`
      });
      cache = falha;
      return falha;
    }
    const doc = montarDocumentoManifesto({
      ok: true,
      conteudo: data.conteudo,
      caminhoAbsoluto: data.caminhoAbsoluto || null,
      mtimeMs: data.mtimeMs ?? null,
      secoes: data.secoes
    });
    cache = doc;
    return doc;
  } catch (err) {
    const falha = montarDocumentoManifesto({
      ok: false,
      conteudo: "",
      erro: err && err.message ? err.message : String(err)
    });
    cache = falha;
    return falha;
  }
}

function isNodeRuntime() {
  try {
    return typeof process !== "undefined" && Boolean(process.versions?.node);
  } catch {
    return false;
  }
}

/** @returns {typeof cache} */
export function obterManifestoMg2EmCache() {
  return cache;
}

/** @param {typeof cache} doc */
export function definirManifestoMg2ParaTestes(doc) {
  cache = doc
    ? montarDocumentoManifesto(doc)
    : null;
}

export function reiniciarCacheManifestoMg2ParaTestes() {
  cache = null;
}

/**
 * Verifica se o documento aponta para a fonte canónica relativa.
 * @param {object} doc
 */
export function documentoUsaFonteCanonica(doc) {
  if (!doc || !doc.ok) return false;
  if (doc.origem !== MANIFESTO_MG2_ORIGEM_ID) return false;
  if (doc.caminhoRelativo !== MANIFESTO_MG2_RELATIVO) return false;
  const abs = String(doc.caminhoAbsoluto || "").replace(/\\/g, "/");
  return abs.endsWith(`/${MANIFESTO_MG2_RELATIVO}`) || abs.endsWith(MANIFESTO_MG2_RELATIVO);
}
