/**
 * Disciplina executiva da resposta — turnos que NÃO pedem análise/recomendação.
 * CEO Operacional Confiável (baterias ValeVerde reais).
 *
 * Prioridade: sim_nao → lacunas → dado_unico → confirmacao → registo → factos.
 * «Fatos iniciais:» dentro de um pedido de registo NÃO activa modo factos.
 */

import { normalizarTexto } from "./lexicon.js";
import {
  ehConsultaCampoUnicoLfc,
  extrairChaveConsultaCampoLfc
} from "../lastroFactualCaso/consultaCampoLfc.js";

/**
 * @typedef {"registo"|"factos"|"confirmacao"|"dado_unico"|"lacunas"|"sim_nao"|"literal"} ModoRespostaRestrita
 */

/**
 * @typedef {{
 *   activo: true,
 *   modo: ModoRespostaRestrita,
 *   chave?: "setor"|"nome_empresa"|"codigo_secreto"|"orcamento"|"fornecedor"|null,
 *   payload?: string|null
 * } | { activo: false, modo: null, chave?: null, payload?: null }} ResultadoRespostaRestrita
 */

/** Verbo de registo — NÃO casa «registrados/registados» (adjectivo). */
const RE_VERBO_REGISTO =
  /\b(registrar|registre|registar|registe|registro|registo)\b/;

/** Persistência explícita (registar / guardar) — entrada IMP-092.3 linguagem natural. */
const RE_VERBO_PERSISTIR =
  /\b(registrar|registre|registar|registe|registro|registo|guarde|guardar|guarda)\b/;

/**
 * Correção factual explícita em linguagem natural (IMP-092.3).
 * Não exige «confirme» / «aguarde»; não activa em «corrija minha frase».
 * @param {string} t — já normalizado
 */
function ehPedidoCorrecaoFactoExplicita(t) {
  // Usos não-factuais de «corrija»
  if (
    /\b(minha|minhas|sua|suas)\s+(frase|frases|reda[cç]|texto|textos|mensagem|mensagens)\b/.test(
      t
    )
  ) {
    return false;
  }
  if (/\bcorrija\s+(o\s+)?(c[oó]digo|bug|portugu[eê]s|ortografia)\b/.test(t)) {
    return false;
  }

  const verboCorrecao =
    /\b(corrija|corrigir|corrigi|substitua|substituir|atualize|actualizar|atualiza)\b/.test(
      t
    ) || /\bcorre[cç][aã]o\b/.test(t);
  if (!verboCorrecao) return false;

  const ancoraFacto =
    /\bfatos?\b/.test(t) ||
    /\binforma[cç][aã]o\b/.test(t) ||
    /\bvalor\s+correto\b/.test(t) ||
    /\bsubstitua\b/.test(t);

  const contextoCaso =
    /\bvale\s*verde\b/.test(t) ||
    /\bempresa\b/.test(t) ||
    /\bcaso\b/.test(t) ||
    /\bcontexto\b/.test(t);

  const indiceFacto =
    /\b(primeiro|segundo|terceiro|quarto|quinto|sexto|\d+[oºª]?)\s+fatos?\b/.test(
      t
    ) || /\bfatos?\s+(n[uú]mero\s+)?\d+\b/.test(t);

  const payloadNovo =
    /\bcorreto\s+[eé]\b/.test(t) ||
    /:\s*\S+/.test(t) ||
    (/\bsubstitua\b/.test(t) && /\bpor\b/.test(t)) ||
    (/\blog[ií]stica\b/.test(t) &&
      (/\bsetor\b/.test(t) || /\bmercado\b/.test(t) || /\bn[aã]o\s+atua\b/.test(t)));

  if (!ancoraFacto && !indiceFacto) return false;
  if (!contextoCaso && !indiceFacto) return false;
  if (payloadNovo) return true;
  // «corrija o fato da ValeVerde» sem valor → wiring pede esclarecimento (sem Writer)
  if (/\b(corrija|corrigir)\b/.test(t) && ancoraFacto && contextoCaso) return true;
  return false;
}

/**
 * Pedido explícito de NÃO analisar / NÃO recomendar (disciplina de escopo).
 * @param {string} t
 */
function pediuSemAnaliseNemRecomendacao(t) {
  return (
    /\bn[aã]o\s+fa[cç]a\s+(nenhuma\s+)?analise\b/.test(t) ||
    /\bn[aã]o\s+fa[cç]a\s+analise\b/.test(t) ||
    /\bsem\s+(analisar|analise)\b/.test(t) ||
    /\bn[aã]o\s+(analise|analisar|proponha|recomende|recomendar)\b/.test(t) ||
    /\bn[aã]o\s+proponha\s+solu[cç]/.test(t) ||
    /\bn[aã]o\s+fa[cç]a\s+recomenda/.test(t)
  );
}

/**
 * «Registre/guarde estes fatos/dados/informações…» com escopo identificável.
 * Não activa em menções genéricas a «registrar».
 * @param {string} t
 */
function ehPedidoRegistoFactosExplicitos(t) {
  if (!RE_VERBO_PERSISTIR.test(t)) return false;
  // Correcção usa outro modo
  if (/\bcorre[cç][aã]o\b/.test(t) && /\bconfirm/.test(t)) return false;

  const alvoFactos =
    /\b(estes?|essas?|os|as)\s+(fatos?|dados|informa[cç][oõ]es)\b/.test(t) ||
    /\b(fatos?|dados|informa[cç][oõ]es)\s+(seguintes|abaixo|a\s+seguir)\b/.test(
      t
    );
  if (!alvoFactos) return false;

  const contextoCaso =
    /\bcontexto\b/.test(t) ||
    /\bvale\s*verde\b/.test(t) ||
    /\bempresa\b/.test(t) ||
    /\bcaso\b/.test(t);

  // Lista inequívoca após «:» (ex.: «registre estes fatos: a; b; c»)
  const listaAposDoisPontos =
    /\b(fatos?|dados|informa[cç][oõ]es)\b[^:\n]{0,120}:\s*\S+/.test(t);

  return contextoCaso || listaAposDoisPontos;
}

/**
 * Pedido de registo/confirmação de contexto (não listagem).
 * @param {string} t
 */
function ehPedidoRegistoContexto(t) {
  // Correcção usa outro modo
  if (/\bcorre[cç][aã]o\b/.test(t) && /\bconfirm/.test(t)) return false;

  // Linguagem natural: «registre estes fatos…» (IMP-092.3 entrada)
  if (ehPedidoRegistoFactosExplicitos(t)) return true;

  if (!RE_VERBO_REGISTO.test(t)) return false;
  if (!(/\bcontexto\b/.test(t) || /\bvale\s*verde\b/.test(t) || /\bempresa\b/.test(t) || /\bcaso\b/.test(t))) {
    return false;
  }

  const confirmaEscopo =
    /\bapenas\s+confirm/.test(t) ||
    /\bsomente\s+confirm/.test(t) ||
    /\bconfirm(e|ar)\s+que\s+(o\s+)?contexto\b/.test(t) ||
    /\bconfirm(e|ar)\s+que\s+(ele|ela|a\s+informa)/.test(t) ||
    /\baguarde\b/.test(t) ||
    pediuSemAnaliseNemRecomendacao(t) ||
    (/\bapenas\s+regist/.test(t) && /\bconfirm/.test(t)) ||
    (/\bpor\s+enquanto\b/.test(t) && /\bapenas\s+regist/.test(t));

  return confirmaEscopo;
}

/**
 * «factos activos/registados/fornecidos» só como grounding de deliberação
 * (VAL-094 TC-20) — não é listagem tipada. Listagem explícita (TC-16) tem verbo.
 * @param {string} t
 */
function ehGroundingDeliberativoSobreFactos(t) {
  if (
    /\b(quais|informe|informar|informa|diga|liste|listar|mostrar|mostre|recuperar|recupere)\b/.test(
      t
    )
  ) {
    return false;
  }
  return (
    /\bdeliber/.test(t) ||
    /\banalise\b/.test(t) ||
    /\banalisar\b/.test(t) ||
    /\banalisando\b/.test(t) ||
    /\brecomend/.test(t)
  );
}

/**
 * Pedido de recuperação/listagem de factos (não o rótulo «Fatos iniciais:»).
 * @param {string} t
 */
function ehPedidoRecuperarFactos(t) {
  // Rótulo de conteúdo dentro de registo — não é pedido de listagem
  if (ehPedidoRegistoContexto(t)) return false;

  // T05: «analisando apenas/somente os fatos…» + juízo analítico ≠ listagem restrita
  // (preserva T02/T08: «informe/liste somente os fatos» sem pergunta de preocupação/porquê)
  if (
    /\banalisando\s+(apenas|somente)\s+(os\s+)?fatos?\b/.test(t) &&
    (/\bpreocupa/.test(t) || /\bpor\s+qu[eê]\b/.test(t))
  ) {
    return false;
  }

  if (
    /\b(quais|informe|informar|informa|diga|liste|listar|mostrar|mostre|recuperar|recupere)\b/.test(
      t
    ) &&
    /\b(fatos?|factos?)\b/.test(t) &&
    !/\brecomend/.test(t)
  ) {
    // «sem analisar» + quais factos = recuperação
    return true;
  }
  if (
    /\b(somente|apenas)\s+(os\s+)?(fatos?|factos?)\b/.test(t) ||
    /\bresponda\s+somente\s+com\s+(os\s+)?(fatos?|factos?)\b/.test(t) ||
    /\b(quatro|4)\s+(fatos?|factos?)\b/.test(t)
  ) {
    return true;
  }
  // «factos activos/registados/fornecidos» — listagem tipada; não grounding deliberativo (TC-20)
  if (
    /\b(fatos?|factos?)\s+(fornecidos|regist(r)?ados|activos|ativos)\b/.test(t)
  ) {
    if (!ehGroundingDeliberativoSobreFactos(t)) return true;
  }
  // «fatos iniciais» só como pedido de recuperação (não rótulo)
  if (
    /\b(fatos?|factos?)\s+iniciais\b/.test(t) &&
    /\b(quais|informe|informar|diga|liste|listar|recuperar|recupere|foram|informei)\b/.test(
      t
    )
  ) {
    return true;
  }
  // Listagem explícita no âmbito LFC
  if (
    /\blfc\b/.test(t) &&
    /\b(fatos?|factos?)\b/.test(t) &&
    /\b(liste|listar|quais|mostre|mostrar|informe)\b/.test(t)
  ) {
    return true;
  }
  return false;
}

/**
 * Pedido explícito de eco literal: «Responda somente: 42».
 * Exige «somente/apenas/só» + «:» + payload — não captura «Responda somente com os fatos».
 * @param {string} t — já normalizado
 * @returns {string|null}
 */
export function extrairPayloadRespostaLiteral(t) {
  const m = /\brespond(?:a|e|er)\s+(?:somente|apenas|so)\s*:\s*(.+)$/.exec(t);
  if (!m) return null;
  const payload = String(m[1] || "").trim();
  if (!payload) return null;
  // Outros modos restritos usam «somente com …» (sem «:» após somente) — defesa extra
  if (/^com\s+/.test(payload)) return null;
  if (/^sim\s+ou\s+n/.test(payload)) return null;
  return payload;
}

/**
 * Detecta pedido de resposta restrita (sem análise/recomendação/decisão).
 * @param {string} [texto]
 * @returns {ResultadoRespostaRestrita}
 */
export function detectarModoRespostaRestrita(texto) {
  const t = normalizarTexto(texto);
  if (!t) return { activo: false, modo: null, chave: null, payload: null };

  // F13/C6 — eco literal do turno actual (antes de qualquer modo contextual)
  const payloadLiteral = extrairPayloadRespostaLiteral(t);
  if (payloadLiteral != null) {
    return {
      activo: true,
      modo: "literal",
      chave: null,
      payload: payloadLiteral
    };
  }

  // --- Sim/não fechado ---
  // Pedidos de juízo/recomendação com «sim ou não» ficam no MRE (não restringem aqui).
  const pediuJuizo =
    /\b(recomenda|recomendaria|sugira|sugere|o\s+que\s+(voce\s+)?acha|deliber[ae]|analis[ae]|avali[ae]|compare)\b/.test(
      t
    );
  const formatoSimNao =
    /\bsim\s*\/\s*n[aã]o\b/.test(t) || /\bsim\s+ou\s+n[aã]o\b/.test(t);
  if (
    !pediuJuizo &&
    (/\bresponda\s+apenas\s+sim\s+ou\s+n[aã]o\b/.test(t) ||
      /\bapenas\s+sim\s+ou\s+n[aã]o\b/.test(t) ||
      (/\bsim\s+ou\s+n[aã]o\b/.test(t) && /\bn[aã]o\s+explique\b/.test(t)) ||
      // F24/T16 — formato explícito sim/não (sem juízo) domina o turno
      formatoSimNao)
  ) {
    return { activo: true, modo: "sim_nao", chave: null };
  }
  if (
    (/\b(na|nesta)\s+conversa\b/.test(t) || /\bconversa\s+atual\b/.test(t)) &&
    (/\bfoi\s+informado\b/.test(t) ||
      /\binformei\b/.test(t) ||
      /\bfoi\s+dito\b/.test(t) ||
      /\bmencionou\b/.test(t) ||
      /\bhaveria\b/.test(t))
  ) {
    return { activo: true, modo: "sim_nao", chave: null };
  }
  if (
    /\bfoi\s+informado\s+que\b/.test(t) &&
    (/\baumento\b/.test(t) || /\b\d+\s*%/.test(t))
  ) {
    return { activo: true, modo: "sim_nao", chave: null };
  }

  // Lacunas / clarificação sem recomendar
  if (
    (/\blistar\b/.test(t) || /\binforma[cç]/.test(t) || /\blacunas?\b/.test(t)) &&
    /\bn[aã]o\s+recomend/.test(t)
  ) {
    return { activo: true, modo: "lacunas", chave: null };
  }
  if (
    /\binforma[cç].{0,60}m[ií]nimas?\b/.test(t) &&
    (/\bantes\s+de\b/.test(t) || /\bavaliar\b/.test(t)) &&
    /\bn[aã]o\s+recomend/.test(t)
  ) {
    return { activo: true, modo: "lacunas", chave: null };
  }
  if (
    /\bquais\s+informa[cç]/.test(t) &&
    /\bn[aã]o\s+(recomend|decid|analis)/.test(t)
  ) {
    return { activo: true, modo: "lacunas", chave: null };
  }

  // Dado único
  if (
    /\b(responder|responda|responde)\s+apenas\s+com\s+(o\s+)?fato\b/.test(t) ||
    /\bapenas\s+com\s+(o\s+)?fato\b/.test(t)
  ) {
    let chave = null;
    if (/\bsetor\b/.test(t)) chave = "setor";
    if (/\bnome\b/.test(t) && /\bempresa\b/.test(t)) chave = "nome_empresa";
    return { activo: true, modo: "dado_unico", chave };
  }
  if (
    /\bqual\s+[eé]\s+o\s+setor\b/.test(t) &&
    (/\bapenas\b/.test(t) || /\bs[oó]\s+(o\s+)?fato\b/.test(t) || /\bcorreto\b/.test(t))
  ) {
    return { activo: true, modo: "dado_unico", chave: "setor" };
  }
  if (/\bqual\s+([eé]\s+)?o\s+nome\s+da\s+empresa\b/.test(t)) {
    return { activo: true, modo: "dado_unico", chave: "nome_empresa" };
  }

  // Campo único no LFC (VAL-093 T1: código secreto / orçamento / fornecedor)
  if (ehConsultaCampoUnicoLfc(texto) || ehConsultaCampoUnicoLfc(t)) {
    const chave = extrairChaveConsultaCampoLfc(texto) || extrairChaveConsultaCampoLfc(t);
    if (chave) {
      return { activo: true, modo: "dado_unico", chave };
    }
  }

  // Correção factual natural (IMP-092.3) — sem exigir «confirme» / «aguarde»
  if (ehPedidoCorrecaoFactoExplicita(t)) {
    return { activo: true, modo: "confirmacao", chave: null };
  }

  // Confirmação / registo de correção (caminho legado com confirmação de escopo)
  if (
    (/\bcorre[cç][aã]o\b/.test(t) ||
      /\bcorrija\b/.test(t) ||
      /\bcorrigida\b/.test(t) ||
      (/\bn[aã]o\s+atua\b/.test(t) && /\blog[ií]stica\b/.test(t))) &&
    (/\bconfirm/.test(t) || (RE_VERBO_REGISTO.test(t) && pediuSemAnaliseNemRecomendacao(t)))
  ) {
    return { activo: true, modo: "confirmacao", chave: null };
  }
  if (
    (/\b(apenas|somente)\s+confirm/.test(t) ||
      /\bconfirm(e|ar)\s+(apenas|somente)\b/.test(t) ||
      (/\b(apenas|somente)\b/.test(t) &&
        RE_VERBO_REGISTO.test(t) &&
        /\bconfirm/.test(t))) &&
    (/\bcorre[cç][aã]o\b/.test(t) ||
      /\bsetor\b/.test(t) ||
      /\blog[ií]stica\b/.test(t) ||
      /\bn[aã]o\s+atua\b/.test(t) ||
      /\bcorreto\s+[eé]\b/.test(t) ||
      /\binforma[cç][aã]o\s+anterior\b/.test(t))
  ) {
    return { activo: true, modo: "confirmacao", chave: null };
  }

  // Registo de contexto — ANTES de factos (evita «Fatos iniciais:» → listagem)
  if (ehPedidoRegistoContexto(t)) {
    return { activo: true, modo: "registo", chave: null };
  }

  // Factos / recuperação
  if (ehPedidoRecuperarFactos(t)) {
    return { activo: true, modo: "factos", chave: null };
  }

  return { activo: false, modo: null, chave: null, payload: null };
}

/**
 * @param {string} [texto]
 * @returns {boolean}
 */
export function ehPedidoRespostaRestrita(texto) {
  return detectarModoRespostaRestrita(texto).activo === true;
}
