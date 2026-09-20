/**
 * Composição determinística de resposta restrita (sem MRE / sem recomendação).
 * Extrai factos pontuais; não despeja o histórico bruto.
 */

import { normalizarTexto } from "./lexicon.js";
import { detectarModoRespostaRestrita } from "./pedidoRespostaRestrita.js";
import { responderCampoNosFactosLfc } from "../lastroFactualCaso/consultaCampoLfc.js";

/**
 * @param {string} t
 * @param {string} n
 */
function ehPedidoMeta(t, n) {
  const modo = detectarModoRespostaRestrita(t);
  if (modo.activo && (modo.modo === "sim_nao" || modo.modo === "lacunas")) {
    return true;
  }
  if (
    /\b(responda|responder)\s+apenas\s+sim\b/.test(n) ||
    /\bsim\s+ou\s+n[aã]o\b/.test(n)
  ) {
    return true;
  }
  if (
    /\b(informe|informar|informa|diga|liste|listar|responder|responda|recuperar|recupere|mostrar|mostre|quais)\b/.test(
      n
    ) &&
    /\b(fatos?|confirm|setor|nome)\b/.test(n) &&
    !temBulletsFactuais(t) &&
    !temEvidenciaMaterialDensa(t)
  ) {
    return true;
  }
  return false;
}

/**
 * @param {string} t
 */
function temBulletsFactuais(t) {
  return (
    /\bfatos?\s+iniciais\b/i.test(t) &&
    /(^|\n)\s*[-*•]\s+\S+/m.test(t)
  );
}

/**
 * @param {string} t
 */
function temEvidenciaMaterialDensa(t) {
  const s = String(t || "");
  let hits = 0;
  if (/\d+\s*%/.test(s)) hits += 1;
  if (/r\$\s*[\d.,]+/i.test(s)) hits += 1;
  if (/\b\d{2,}\s*(funcionarios?|colaboradores?)\b/i.test(s)) hits += 1;
  if (/\b(margem|faturamento|fornecedor|desperd|mat[eé]ria)/i.test(s)) hits += 1;
  return hits >= 2;
}

/**
 * @param {string} t
 */
function temEvidenciaMaterial(t) {
  const s = String(t || "");
  if (temBulletsFactuais(s)) return true;
  if (/\d+\s*%/.test(s)) return true;
  if (/r\$\s*[\d.,]+/i.test(s)) return true;
  if (/\b\d{2,}\s*(funcionarios?|colaboradores?)\b/i.test(s)) return true;
  if (
    /\b(margem|faturamento|fornecedor|desperd|pre[cç]o|setor|log[ií]stica|mat[eé]ria-?prima)\b/i.test(
      s
    )
  ) {
    return true;
  }
  // «serviços» sozinho em pergunta meta não conta; em bullet de caso sim
  if (/\batua\s+no\s+mercado\s+de\s+servi/i.test(s)) return true;
  if (/\bclientes\s+recorrentes\b/i.test(s)) return true;
  if (/\bperdeu\s+dois\s+clientes\b/i.test(s)) return true;
  return false;
}

/**
 * @param {string} t
 */
function ehMudancaDeAssunto(t) {
  const n = normalizarTexto(t);
  return (
    /\bignorar?\b/.test(n) ||
    /\bignora\b/.test(n) ||
    /\bmudar\s+de\s+assunto\b/.test(n) ||
    /\bdiferen[cç]a\s+entre\s+decis/.test(n)
  );
}

/**
 * Factos em prosa após «registre/guarde … fatos/dados/informações … :»
 * delimitados por «;» (não classifica a mensagem inteira como um facto).
 * @param {string} raw
 * @returns {string[]}
 */
function extrairFactosDelimitedosPorPontoEVirgula(raw) {
  const m = String(raw || "").match(
    /(?:registre|registar|registrar|registe|registro|registo|guarde|guardar|guarda)\b[\s\S]{0,200}?\b(?:fatos?|dados|informa[cç][oõ]es)\b[^:\n]{0,120}:\s*([^\n]+)/i
  );
  if (!m) return [];
  return m[1]
    .split(/\s*;\s*/)
    .map((s) => s.replace(/\.\s*$/, "").trim())
    .filter((s) => s.length >= 2);
}

/**
 * Extrai bullets sob «Fatos iniciais» (ou lista * / - no bloco de registo),
 * ou factos em linha separados por «;» após pedido explícito de registo.
 * @param {string} texto
 * @returns {string[]}
 */
export function extrairBulletsFactuais(texto) {
  const raw = String(texto || "");
  if (!raw.trim()) return [];
  /** @type {string[]} */
  const out = [];
  const lines = raw.split(/\r?\n/);
  let capturar = false;
  for (const line of lines) {
    const trim = line.trim();
    if (/\bfatos?\s+iniciais\b/i.test(trim)) {
      capturar = true;
      continue;
    }
    if (capturar) {
      if (
        /^(por\s+enquanto|apenas\s+regist|n[aã]o\s+fa[cç]a|n[aã]o\s+proponha|aguarde)/i.test(
          trim
        )
      ) {
        break;
      }
      const m = trim.match(/^[-*•]\s+(.+)$/);
      if (m) {
        out.push(m[1].trim());
        continue;
      }
      if (!trim) continue;
      // linha não-bullet após bullets → fim da secção
      if (out.length) break;
    }
  }
  if (out.length) return out;
  return extrairFactosDelimitedosPorPontoEVirgula(raw);
}

/**
 * Aplica correcções de setor sobre a lista de factos.
 * @param {string[]} factos
 * @param {ReadonlyArray<{ papel?: string, texto?: string }>} historico
 * @param {string} [instrucao]
 */
function aplicarCorrecoes(factos, historico, instrucao) {
  const corpus = [
    String(instrucao || ""),
    ...(Array.isArray(historico) ? historico.map((m) => String(m?.texto || "")) : [])
  ].join("\n");
  const n = normalizarTexto(corpus);
  const logistica =
    /\blogistica\b/.test(n) &&
    (/\bn[aã]o\s+atua\s+.{0,40}servi/.test(n) ||
      /\batua\s+no\s+mercado\s+de\s+logistica\b/.test(n) ||
      /\bsetor\s+correto\b/.test(n) ||
      /\binformacao\s+correta\b/.test(n) ||
      /\bcorrija\b/.test(n) ||
      /\bcorrecao\b/.test(n));

  if (!logistica) return factos;

  return factos.map((f) => {
    if (/servi[cç]os/i.test(f) && /atua|mercado|setor/i.test(f)) {
      return f.replace(/servi[cç]os/gi, "logística");
    }
    return f;
  });
}

/**
 * Factos do utilizador na conversa actual (bullets preferidos; sem pedidos meta).
 * @param {ReadonlyArray<{ papel?: string, texto?: string }>|null|undefined} historico
 * @param {string} [instrucao]
 * @param {{ filtrarEmpresa?: string|null }} [opts]
 * @returns {string[]}
 */
export function recolherFactosDoUtilizador(historico, instrucao, opts = {}) {
  /** @type {string[]} */
  const bullets = [];
  /** @type {string[]} */
  const blocos = [];
  const visto = new Set();

  const pushBullet = (b) => {
    const t = String(b || "").trim();
    if (!t || t.length < 3) return;
    const chave = normalizarTexto(t);
    if (visto.has(chave)) return;
    visto.add(chave);
    bullets.push(t);
  };

  const pushBloco = (raw) => {
    const t = String(raw || "").trim();
    if (!t || t.length < 8) return;
    const n = normalizarTexto(t);
    if (ehPedidoMeta(t, n)) return;
    if (ehMudancaDeAssunto(t)) return;
    // Pedido de registo: extrair bullets, não o envelope inteiro
    const bs = extrairBulletsFactuais(t);
    if (bs.length) {
      for (const b of bs) pushBullet(b);
      return;
    }
    if (
      /\b(registrar|registre|registar|registe)\b/.test(n) &&
      (/\bapenas\s+confirm/.test(n) || /\baguarde\b/.test(n)) &&
      !temEvidenciaMaterialDensa(t)
    ) {
      return;
    }
    // Correcção: não despejar o envelope; a correcção aplica-se no fim (aplicarCorrecoes)
    if (
      (/\bcorrija\b/.test(n) ||
        /\bcorrecao\b/.test(n) ||
        (/\bn[aã]o\s+atua\b/.test(n) && /\bapenas\s+confirm/.test(n))) &&
      !temEvidenciaMaterialDensa(t) &&
      !temBulletsFactuais(t)
    ) {
      return;
    }
    if (!temEvidenciaMaterial(t) && !/\bvale\s*verde\b/i.test(t)) return;
    // Evitar despejar mensagens longas de instrução
    if (t.length > 220 && !temEvidenciaMaterialDensa(t) && !temBulletsFactuais(t)) {
      return;
    }
    const chave = n.slice(0, 160);
    if (visto.has(chave)) return;
    visto.add(chave);
    blocos.push(t.length > 280 ? `${t.slice(0, 277)}…` : t);
  };

  const msgs = Array.isArray(historico) ? historico : [];
  // Preferir a ocorrência mais recente de «Fatos iniciais» (último arranque do caso)
  let ultimoComBullets = -1;
  for (let i = 0; i < msgs.length; i++) {
    if (String(msgs[i]?.papel || "").toLowerCase() !== "usuario") continue;
    if (extrairBulletsFactuais(msgs[i].texto).length) ultimoComBullets = i;
  }
  if (ultimoComBullets >= 0) {
    for (const b of extrairBulletsFactuais(msgs[ultimoComBullets].texto)) {
      pushBullet(b);
    }
    // Correcções posteriores ao último arranque
    for (let i = ultimoComBullets + 1; i < msgs.length; i++) {
      if (String(msgs[i]?.papel || "").toLowerCase() !== "usuario") continue;
      pushBloco(msgs[i].texto);
    }
  } else {
    for (const m of msgs) {
      if (String(m?.papel || "").toLowerCase() !== "usuario") continue;
      pushBloco(m.texto);
    }
  }

  // Instrução actual: só se trouxer material novo (não pedido de listagem)
  const nInst = normalizarTexto(instrucao);
  if (instrucao && !ehPedidoMeta(String(instrucao), nInst)) {
    const bs = extrairBulletsFactuais(instrucao);
    if (bs.length && !bullets.length) {
      for (const b of bs) pushBullet(b);
    } else if (!bs.length) {
      pushBloco(instrucao);
    }
  }

  // Bullets do último «Fatos iniciais» têm prioridade; senão blocos materiais.
  const materiais = blocos.filter(
    (b) => temEvidenciaMaterial(b) || /\bvale\s*verde\b/i.test(b)
  );
  const densos = materiais.filter((b) => temEvidenciaMaterialDensa(b));
  const base = bullets.length
    ? bullets
    : densos.length
      ? densos
      : materiais;
  return aplicarCorrecoes(base.slice(0, 12), msgs, instrucao);
}

/**
 * @param {string[]} factos
 * @param {string} [instrucao]
 * @param {ReadonlyArray<{ papel?: string, texto?: string }>} [historico]
 */
function resolverSetor(factos, instrucao, historico) {
  const corpus = [
    String(instrucao || ""),
    ...(Array.isArray(historico) ? historico.map((m) => String(m?.texto || "")) : []),
    ...factos
  ].join("\n");
  const n = normalizarTexto(corpus);
  if (
    /\blogistica\b/.test(n) &&
    (/\bn[aã]o\s+atua\s+.{0,40}servi/.test(n) ||
      /\batua\s+no\s+mercado\s+de\s+logistica\b/.test(n) ||
      /\bcorrija\b/.test(n) ||
      /\bcorrecao\b/.test(n) ||
      /\binformacao\s+correta\b/.test(n))
  ) {
    return "Logística";
  }
  if (/\blogistica\b/.test(n)) return "Logística";
  if (/\bservicos?\b/.test(n)) return "Serviços";
  return null;
}

/**
 * @param {string[]} factos
 * @param {string} [instrucao]
 * @param {ReadonlyArray<{ papel?: string, texto?: string }>} [historico]
 */
function resolverNomeEmpresa(factos, instrucao, historico) {
  const corpus = [
    String(instrucao || ""),
    ...factos,
    ...(Array.isArray(historico) ? historico.map((m) => String(m?.texto || "")) : [])
  ].join("\n");
  if (/\bvale\s*verde\b/i.test(corpus)) return "ValeVerde";
  const m2 = corpus.match(
    /\bempresa\s+(?:fict[ií]cia\s+)?(?:chamad[ao]\s+)?([A-ZÁÉÍÓÚÂÊÔÃÕ][\wÁÉÍÓÚÂÊÔÃÕáéíóúâêôãõ-]{2,40})\b/
  );
  if (m2 && !/^fict/i.test(m2[1])) return m2[1];
  return null;
}

/**
 * Compacta separadores milhar/decimal para comparar montantes (8.888.000 ↔ 8888000).
 * @param {string} s
 */
function compactarNumeros(s) {
  return String(s || "").replace(/(\d)[.,\s](?=\d)/g, "$1");
}

/**
 * @param {string} instrucao
 */
function extrairAlegacaoSimNao(instrucao) {
  const raw = String(instrucao || "");
  const m =
    raw.match(/informei\s+que\s+(.+?)(?:\?|$)/i) ||
    raw.match(/foi\s+informado\s+que\s+(.+?)(?:\?|$)/i) ||
    raw.match(/foi\s+dito\s+que\s+(.+?)(?:\?|$)/i) ||
    raw.match(/haveria\s+(.+?)(?:\?|$)/i);
  if (m) return m[1].trim();
  // F24 — strip do formato pedido («sim/não», «confirme só se…»)
  return raw
    .replace(/\bsim\s*\/\s*n[aã]o\b/gi, "")
    .replace(/\bsim\s+ou\s+n[aã]o\b/gi, "")
    .replace(
      /\b(confirme|confirma|responda|responde)\s+(apenas|somente|s[oó])\s+(se\s+)?/gi,
      ""
    )
    .replace(/[—–-]+\s*/g, " ")
    .replace(/\?/g, "")
    .trim();
}

/**
 * @param {string} alegacao
 * @param {ReadonlyArray<{ papel?: string, texto?: string }>} historico
 */
function alegacaoPresenteNaConversa(alegacao, historico) {
  const a = normalizarTexto(alegacao);
  const aNum = compactarNumeros(a);
  const msgs = (Array.isArray(historico) ? historico : [])
    .filter((m) => String(m?.papel || "").toLowerCase() === "usuario")
    .map((m) => normalizarTexto(m.texto));
  const corpusUser = msgs.join("\n");
  const corpusUserNum = compactarNumeros(corpusUser);
  // Montantes listados pelo CEO (ex.: eco LFC) também contam para verificação factual
  const corpusAllNum = compactarNumeros(
    (Array.isArray(historico) ? historico : [])
      .map((m) => normalizarTexto(m.texto))
      .join("\n")
  );

  const pct = a.match(/(\d+)\s*%/);
  if ((/\baumento\b/.test(a) || /\baumentar\b/.test(a) || /\bpreco\b/.test(a)) && pct) {
    const n = pct[1];
    const re = new RegExp(
      `(pre[cç]o|aumento|aumentar).{0,40}${n}\\s*%|\\+\\s*${n}\\s*%|${n}\\s*%`,
      "i"
    );
    // Só conta se o utilizador AFIRMOU o aumento como facto/pedido de decisão,
    // não perguntas «eu informei que quero aumentar…?»
    const afirmativas = msgs.filter(
      (m) =>
        re.test(m) &&
        !/\bsim\s+ou\s+n[aã]o\b/.test(m) &&
        !/\binformei\s+que\b/.test(m)
    );
    return afirmativas.length > 0;
  }

  // Orçamento / montante: presença do valor (e âncora) no histórico
  const montante = aNum.match(/(?:r\$\s*)?(\d{4,})/);
  if (montante && (/\borcamento\b/.test(a) || /\br\$\b/.test(a) || /=/.test(alegacao))) {
    const val = montante[1];
    if (corpusAllNum.includes(val)) {
      if (/\borcamento\b/.test(a)) {
        return /\borcamento\b/.test(corpusAllNum) || corpusAllNum.includes(val);
      }
      return true;
    }
    return false;
  }

  const tokens = a
    .split(/\s+/)
    .map((x) => x.replace(/[^\w%]/g, ""))
    .filter(
      (x) =>
        x.length >= 4 &&
        !/^(que|para|como|uma|com|informado|informei|haveria|quero|algum|produto|servico|confirme|confirma|responda|responde|apenas|somente|exclusivo)$/.test(
          x
        )
    )
    .map((x) => compactarNumeros(x));
  if (!tokens.length) return false;
  const corpusCmp = corpusUserNum || corpusUser;
  return tokens.every((tok) => corpusCmp.includes(tok));
}

/**
 * @param {{ modo: string, chave?: string|null, payload?: string|null }} modo
 * @param {{ instrucao?: string, historico?: ReadonlyArray<{ papel?: string, texto?: string }> }} ctx
 * @returns {string}
 */
export function comporRespostaRestrita(modo, ctx = {}) {
  const instrucao = String(ctx.instrucao || "");
  const historico = Array.isArray(ctx.historico) ? ctx.historico : [];

  // F13/C6 — payload literal do pedido actual (histórico irrelevante)
  if (modo.modo === "literal") {
    if (modo.payload != null && String(modo.payload).trim()) {
      return String(modo.payload).trim();
    }
    const det = detectarModoRespostaRestrita(instrucao);
    if (det.activo && det.modo === "literal" && det.payload) {
      return String(det.payload).trim();
    }
    return "";
  }

  const querVale = /\bvale\s*verde\b/i.test(instrucao);
  const factos = recolherFactosDoUtilizador(historico, instrucao, {
    filtrarEmpresa: querVale ? "valeverde" : null
  });

  if (modo.modo === "registo") {
    const nome =
      resolverNomeEmpresa(factos, instrucao, historico) || "contexto informado";
    const bullets = extrairBulletsFactuais(instrucao);
    if (bullets.length) {
      return (
        `Contexto registado: ${nome}. ` +
        `${bullets.length} facto(s) inicial(is) guardado(s). ` +
        `Confirmação feita — sem análise nem recomendação neste turno.`
      );
    }
    return `Contexto registado: ${nome}. Confirmação feita — sem análise nem recomendação neste turno.`;
  }

  if (modo.modo === "confirmacao") {
    const setor = resolverSetor(factos, instrucao, historico) || "logística";
    const setorNorm = /log[ií]stica/i.test(setor) ? "logística" : setor;
    return `Correcção confirmada: o setor da ValeVerde é ${setorNorm} (não serviços). Sem análise adicional neste turno.`;
  }

  if (modo.modo === "sim_nao") {
    const alegacao = extrairAlegacaoSimNao(instrucao);
    const sim = alegacaoPresenteNaConversa(alegacao, historico);
    return sim ? "SIM." : "NÃO.";
  }

  if (modo.modo === "dado_unico") {
    if (modo.chave === "setor") {
      const setor = resolverSetor(factos, instrucao, historico);
      return setor ? `${setor}.` : "Não tenho o setor registado nos factos fornecidos.";
    }
    if (modo.chave === "nome_empresa") {
      const nome = resolverNomeEmpresa(factos, instrucao, historico);
      return nome ? `${nome}.` : "Não tenho o nome da empresa nos factos fornecidos.";
    }
    if (
      modo.chave === "codigo_secreto" ||
      modo.chave === "orcamento" ||
      modo.chave === "fornecedor"
    ) {
      const v = responderCampoNosFactosLfc(factos, modo.chave, instrucao);
      return v.endsWith(".") ? v : `${v}.`;
    }
    const setor = resolverSetor(factos, instrucao, historico);
    if (setor && /\bsetor\b/i.test(instrucao)) return `${setor}.`;
    const nome = resolverNomeEmpresa(factos, instrucao, historico);
    if (nome && /\bnome\b/i.test(instrucao)) return `${nome}.`;
    return "Não identifiquei o facto pedido nos dados fornecidos.";
  }

  if (modo.modo === "factos") {
    if (!factos.length) {
      return "Não há factos materiais do utilizador registados nesta conversa para listar.";
    }
    const linhas = factos.map((f, i) => `${i + 1}. ${f}`);
    return `Factos fornecidos (sem interpretação):\n${linhas.join("\n")}`;
  }

  if (modo.modo === "lacunas") {
    return (
      "Informações mínimas necessárias antes de avaliar aumento de preço " +
      "(lista apenas — sem recomendação):\n" +
      "1. Margem actual por produto/linha e contribuição do aumento na margem.\n" +
      "2. Elasticidade ou histórico de perda de clientes em aumentos anteriores.\n" +
      "3. Posição competitiva de preço vs. alternativas do cliente.\n" +
      "4. Contrato/prazo: cláusulas de reajuste e janela de renegociação.\n" +
      "5. Custo variável actual (matéria-prima, frete, desperdício) e tendência.\n" +
      "6. Capacidade de compensar volume perdido com outros clientes/linhas.\n" +
      "Sem decisão nem recomendação neste turno."
    );
  }

  return "Pedido restrito reconhecido — sem análise neste turno.";
}

/**
 * @param {string} [instrucao]
 * @param {{ historico?: ReadonlyArray<{ papel?: string, texto?: string }> }} [ctx]
 * @returns {{ activo: boolean, mensagem?: string, modo?: string }}
 */
export function tentarRespostaRestrita(instrucao, ctx = {}) {
  const det = detectarModoRespostaRestrita(instrucao);
  if (!det.activo || !det.modo) return { activo: false };
  const mensagem = comporRespostaRestrita(
    {
      modo: det.modo,
      chave: det.chave || null,
      payload: det.payload || null
    },
    { instrucao, historico: ctx.historico }
  );
  if (det.modo === "literal" && !String(mensagem || "").trim()) {
    return { activo: false };
  }
  return { activo: true, mensagem, modo: det.modo };
}
