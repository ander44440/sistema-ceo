/**
 * Factos materiais do turno do utilizador — lastro deliberativo (≠ Acervo Oficial).
 * CEO Operacional Confiável: contexto na própria mensagem é válido para raciocinar.
 */

import { seleccionarFioCoa } from "../classificadorIntencao/fioConversacional.js";

const PREFIXO =
  "[Facto do utilizador (turno — não é Acervo Oficial)]";

/**
 * Extrai cláusulas com evidência material (números, %, R$, métricas, dilemas).
 * Determinístico; não inventa — só ecoa o que o utilizador escreveu.
 * @param {string} [texto]
 * @returns {string[]}
 */
export function extrairClausulasMateriais(texto) {
  const raw = String(texto || "").trim();
  if (!raw) return [];

  const partes = raw
    .split(/(?<=[.!?;\n])\s+|\n+/)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  /** @type {string[]} */
  const out = [];
  const visto = new Set();

  for (const p of partes) {
    if (p.length < 12 || p.length > 280) continue;
    if (!temEvidenciaMaterial(p)) continue;
    const chave = p.toLowerCase();
    if (visto.has(chave)) continue;
    visto.add(chave);
    out.push(`${PREFIXO} ${p}`);
    if (out.length >= 12) break;
  }

  // Mensagem curta mas material (ex.: uma frase densa sem pontuação)
  if (out.length === 0 && raw.length >= 20 && temEvidenciaMaterial(raw)) {
    out.push(`${PREFIXO} ${raw.slice(0, 280)}`);
  }

  return out;
}

/**
 * @param {string} p
 */
function temEvidenciaMaterial(p) {
  const t = p.toLowerCase();
  if (/\d+\s*%/.test(t)) return true;
  if (/r\$\s*[\d.,]+/.test(t)) return true;
  if (/\b\d{2,}\s*(funcionarios?|colaboradores?|pessoas?)\b/.test(t)) {
    return true;
  }
  if (
    /\b(margem|faturamento|facturacao|fornecedor|desperd[ií]cio|pre[cç]o|reajuste|volume|mat[eé]ria-?prima)\b/.test(
      t
    )
  ) {
    return true;
  }
  if (/\b(dilema|trade-?off|alternativa)\b/.test(t)) return true;
  if (/\b(empresa|cliente)\b/.test(t) && /\b(chamad[oa]|chamamos|chama-se|nome)\b/.test(t)) {
    return true;
  }
  if (/\bvale\s*verde\b/.test(t)) return true;
  if (/\bassum(a|e|imos|iu)\b/.test(t) && /\b(empresa|cliente|contexto)\b/.test(t)) {
    return true;
  }
  return false;
}

/**
 * Factos do turno actual + turnos do utilizador no fio do mesmo COA.
 * @param {string} [instrucao]
 * @param {ReadonlyArray<{ papel?: string, texto?: string }>|null|undefined} historico
 * @returns {string[]}
 */
export function factosMateriaisDoTurno(instrucao, historico) {
  /** @type {string[]} */
  const out = [];
  const visto = new Set();

  const pushAll = (lista) => {
    for (const f of lista) {
      const k = f.toLowerCase();
      if (visto.has(k)) continue;
      visto.add(k);
      out.push(f);
    }
  };

  pushAll(extrairClausulasMateriais(instrucao));

  if (Array.isArray(historico) && historico.length) {
    const fio = seleccionarFioCoa(historico, instrucao);
    for (const turno of fio) {
      if (String(turno?.papel || "").toLowerCase() !== "usuario") continue;
      pushAll(extrairClausulasMateriais(turno.texto));
      if (out.length >= 16) break;
    }
  }

  return out.slice(0, 16);
}

/**
 * Bloco de governação para a mensagem MRE: Acervo vazio ≠ «não há informação».
 * @param {string[]} factosUtilizador
 * @returns {string|null}
 */
export function blocoGovernaFactosUtilizador(factosUtilizador) {
  if (!Array.isArray(factosUtilizador) || factosUtilizador.length === 0) {
    return null;
  }
  return (
    "[LASTRO DO TURNO — factos fornecidos pelo utilizador nesta conversa. " +
    "São evidência material para deliberação. " +
    "LACUNA EXPLÍCITA do Acervo Oficial NÃO anula estes factos. " +
    "NÃO diga «não há informação / não há projetos / não há prioridade» " +
    "quando estes factos cobrem o pedido. " +
    "Separe: facto (aqui) | inferência (marque como tal) | desconhecido (só se faltar dado necessário).]"
  );
}

export const PREFIXO_FACTO_UTILIZADOR = PREFIXO;
