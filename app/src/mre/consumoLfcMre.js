/**
 * IMP-092.4 / ADR-022 — Consumo condicional do LFC pelo MRE (read-only).
 * IMP-092.5 / ADR-023 — Isolamento RFR do fio HFC após consumo autorizado.
 * Não escreve no LFC. Não altera Writer/Reader. Não toca P1-2.
 */

import { PREFIXO_FACTO_UTILIZADOR } from "./factosTurnoUtilizador.js";
import { aplicarIsolamentoRfrNaEntrada } from "./restricaoBaseFactual.js";

/** Prefixo estável — autoridade factual do caso na entrada MRE. */
export const PREFIXO_FACTO_LFC =
  "[LFC activo — autoridade factual do caso]";

const BLOCO_GOVERNA_LFC =
  "[LASTRO LFC — factos activos do caso via LfcReader. " +
  "São a autoridade factual do caso neste turno. " +
  "HFC/transcript/reparse é prova histórica e NÃO substitui estes factos. " +
  "Ausência de facto necessário no LFC não deve ser mascarada.]";

/**
 * @param {unknown} v
 * @returns {string}
 */
function texto(v) {
  if (v == null) return "";
  return String(v).trim();
}

/**
 * Título de caso a partir da instrução — null se não houver pedido identificável.
 * (Alinhado ao wiring 092.3; não usa o default «contexto informado».)
 *
 * IMP-094 F4 / FRENTE 9: a extracção **não** depende de `permitirHintTituloCasoLfc()`.
 * Esse gate continua a impedir *retarget* por hint no wiring PC (deixis/casoId).
 * Aqui o título só materializa evidência explícita no pedido actual, para resolução
 * **dentro** do `coaId` já autorizado — sem inventar caso nem atravessar COA.
 *
 * @param {string} [instrucao]
 * @returns {string|null}
 */
export function extrairTituloCasoParaConsumoMre(instrucao) {
  const raw = String(instrucao || "");
  if (/\bvale\s*verde\b/i.test(raw)) return "ValeVerde";
  const m = raw.match(
    /\bempresa\s+(?:fict[ií]cia\s+)?(?:chamad[ao]\s+)?([A-ZÁÉÍÓÚÂÊÔÃÕ][\wÁÉÍÓÚÂÊÔÃÕáéíóúâêôãõ-]{2,40})\b/
  );
  if (m && !/^fict/i.test(m[1])) return m[1];
  const caso = raw.match(
    /\bcaso\s+(?:de\s+trabalho\s+)?(?:chamad[ao]\s+)?([A-ZÁÉÍÓÚÂÊÔÃÕ][\wÁÉÍÓÚÂÊÔÃÕáéíóúâêôãõ-]{2,40})\b/i
  );
  if (caso && !/^fict/i.test(caso[1])) return caso[1];
  return null;
}

/**
 * Pedido com âmbito de caso (M2 / CM5) — sem título ainda pode usar deixis.
 * @param {string} [instrucao]
 */
export function pediuAmbitoCasoLfc(instrucao) {
  const t = String(instrucao || "").toLowerCase();
  if (!t.trim()) return false;
  if (/\bvale\s*verde\b/.test(t)) return true;
  // Referência explícita ao LFC (lastro factual do caso).
  if (/\blfc\b/.test(t)) return true;
  // PT-BR «fatos» e PT-PT «factos» (VAL-093.3: «factos activos» não batia em /\bfatos?\b/).
  const temFactoLex =
    /\b(fatos?|factos?)\b/.test(t) || /\b(fact|fato)\b/.test(t);
  if (
    temFactoLex &&
    /\b(regist|registr|fornecid|activ|ativ|lastro|lfc)\b/.test(t)
  ) {
    return true;
  }
  if (
    /\b(lastro|caso)\b/.test(t) &&
    /\b(fatos?|factos?|fact|fato|empresa|contexto)\b/.test(t)
  ) {
    return true;
  }
  if (/\bempresa\b/.test(t) && /\b(fato|fact|fatos?|factos?|preocup|analis)/.test(t)) {
    return true;
  }
  return false;
}

/**
 * Resolve e lista factos LFC para a entrada MRE — só Reader.
 *
 * @param {{
 *   reader?: object|null,
 *   coaId?: string|null,
 *   instrucao?: string,
 *   casoId?: string|null
 * }} opts
 * @returns {Promise<{
 *   autorizado: boolean,
 *   motivo: string,
 *   casoId: string|null,
 *   factos: string[],
 *   ambiguidade: boolean,
 *   candidatos?: object[],
 *   mensagemEsclarecimento?: string|null
 * }>}
 */
export async function obterConsumoLfcParaMre(opts = {}) {
  const reader = opts.reader;
  const coaId = texto(opts.coaId) || null;
  const instrucao = String(opts.instrucao || "");
  const casoIdExplicito = texto(opts.casoId) || null;

  const vazio = (motivo, extra = {}) => ({
    autorizado: false,
    motivo,
    casoId: null,
    factos: [],
    ambiguidade: false,
    mensagemEsclarecimento: null,
    ...extra
  });

  if (!reader || typeof reader.resolverCaso !== "function") {
    return vazio("reader_ausente");
  }
  if (!coaId) {
    return vazio("sem_coa");
  }

  /** @type {object|null} */
  let resolvido = null;

  if (casoIdExplicito) {
    resolvido = await Promise.resolve(
      reader.resolverCaso(coaId, {
        casoId: casoIdExplicito,
        actualizarPonteiro: false
      })
    );
  } else {
    const titulo = extrairTituloCasoParaConsumoMre(instrucao);
    const ambito = pediuAmbitoCasoLfc(instrucao);
    if (!titulo && !ambito) {
      return vazio("sem_pedido_caso");
    }
    if (titulo) {
      resolvido = await Promise.resolve(
        reader.resolverCaso(coaId, { titulo, actualizarPonteiro: false })
      );
      if (
        !resolvido?.ok &&
        resolvido?.codigo === "caso_nao_encontrado" &&
        ambito
      ) {
        resolvido = await Promise.resolve(
          reader.resolverCaso(coaId, { deixis: true })
        );
      }
    } else {
      resolvido = await Promise.resolve(
        reader.resolverCaso(coaId, { deixis: true })
      );
    }
  }

  if (resolvido?.codigo === "caso_ambiguo") {
    return {
      autorizado: false,
      motivo: "caso_ambiguo",
      casoId: null,
      factos: [],
      ambiguidade: true,
      candidatos: Array.isArray(resolvido.candidatos)
        ? resolvido.candidatos
        : [],
      mensagemEsclarecimento:
        resolvido.mensagem ||
        "Há vários casos com o mesmo título neste COA. Indique qual caso (casoId) — não escolho em silêncio."
    };
  }

  if (!resolvido?.ok || !resolvido.casoId) {
    return vazio(resolvido?.codigo || "caso_nao_resolvido");
  }

  const listados = await Promise.resolve(
    reader.listarFactosActivos(coaId, resolvido.casoId)
  );
  if (!listados?.ok) {
    return vazio(listados?.codigo || "leitura_falhou", {
      casoId: resolvido.casoId
    });
  }

  const factos = (Array.isArray(listados.factos) ? listados.factos : [])
    .map((f) => texto(f?.texto))
    .filter(Boolean);

  if (!factos.length) {
    return {
      autorizado: true,
      motivo: "caso_sem_activos",
      casoId: resolvido.casoId,
      factos: [],
      ambiguidade: false,
      mensagemEsclarecimento: null
    };
  }

  return {
    autorizado: true,
    motivo: "lfc_activos",
    casoId: resolvido.casoId,
    factos,
    ambiguidade: false,
    mensagemEsclarecimento: null
  };
}

/**
 * Aplica o resultado do Reader à entrada MRE (mutação controlada).
 * Com LFC autorizado e activos: remove reparse `[Facto do utilizador…]` de
 * `factosOficiais` (não substitui autoridade); injecta linhas LFC.
 *
 * @param {object} entrada
 * @param {Awaited<ReturnType<typeof obterConsumoLfcParaMre>>} consumo
 * @returns {object}
 */
export function aplicarConsumoLfcNaEntrada(entrada, consumo) {
  if (!entrada || typeof entrada !== "object") return entrada;
  const out = entrada;
  const c = consumo || {
    autorizado: false,
    motivo: "ausente",
    casoId: null,
    factos: [],
    ambiguidade: false
  };

  out.lfcConsumo = {
    autorizado: c.autorizado === true,
    motivo: c.motivo,
    casoId: c.casoId || null,
    ambiguidade: c.ambiguidade === true,
    nFactos: Array.isArray(c.factos) ? c.factos.length : 0
  };

  if (c.ambiguidade === true && c.mensagemEsclarecimento) {
    out.mensagem = `${String(out.mensagem || "").trim()}\n\n[LFC] ${c.mensagemEsclarecimento}`;
    return out;
  }

  if (c.autorizado !== true || !Array.isArray(c.factos) || c.factos.length === 0) {
    return out;
  }

  const linhasLfc = c.factos.map((t) => `${PREFIXO_FACTO_LFC} ${t}`);
  const base = Array.isArray(out.factosOficiais) ? out.factosOficiais : [];
  // Precedência: reparse de turno não substitui LFC activo (CM7–CM8).
  const semReparseCaso = base.filter(
    (f) => !String(f || "").includes(PREFIXO_FACTO_UTILIZADOR)
  );
  out.factosOficiais = [...linhasLfc, ...semReparseCaso];

  const bloco = `${BLOCO_GOVERNA_LFC}\n${linhasLfc.join("\n")}`;
  out.mensagem = `${String(out.mensagem || "").trim()}\n\n${bloco}`;
  return out;
}

/**
 * @param {object} entrada
 * @param {{
 *   reader?: object|null,
 *   coaId?: string|null,
 *   instrucao?: string,
 *   casoId?: string|null
 * }} opts
 */
export async function enriquecerEntradaMreComLfc(entrada, opts = {}) {
  const consumo = await obterConsumoLfcParaMre({
    reader: opts.reader,
    coaId: opts.coaId ?? entrada?.coaId,
    instrucao: opts.instrucao,
    casoId: opts.casoId
  });
  const comLfc = aplicarConsumoLfcNaEntrada(entrada, consumo);
  // ADR-023: com RFR + LFC autorizado, fio HFC não entra no objecto deliberativo.
  return aplicarIsolamentoRfrNaEntrada(comLfc, {
    instrucao: opts.instrucao || "",
    consumo
  });
}
