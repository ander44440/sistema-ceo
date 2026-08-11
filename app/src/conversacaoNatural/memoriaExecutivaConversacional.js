/**
 * DESP-007 — Memória executiva na prosa (calibração comportamental).
 * Recupera objectivo, decisões e pendências só quando agrega valor.
 * Não cria store novo — usa contexto já presente (refino EIC / memória).
 */

/**
 * @typedef {"decisao"|"objectivo"|"continuidade"|"pendencia"} TipoSinalMemoria
 * @typedef {{ tipo: TipoSinalMemoria, prosa: string, permanente: boolean }} SinalMemoria
 */

/**
 * Diferencia itens permanentes (decisões/objectivo/restrições) de factos temporários.
 * @param {object} ctxImediato
 */
export function classificarMemoriaExecutiva(ctxImediato = {}) {
  const permanentes = {
    objectivo: String(ctxImediato.objectivoPrincipal || "").trim() || null,
    decisoes: Array.isArray(ctxImediato.decisoesTomadas)
      ? ctxImediato.decisoesTomadas.filter(Boolean)
      : [],
    restricoes: Array.isArray(ctxImediato.restricoesAtivas)
      ? ctxImediato.restricoesAtivas.filter(Boolean)
      : []
  };
  const temporarios = {
    ultimoPedido: extrairFactoTemporario(ctxImediato),
    entregaCorrente: String(ctxImediato.entregaCorrente || "").trim() || null,
    topicoAncora: String(ctxImediato.topicoAncora || "").trim() || null
  };
  return { permanentes, temporarios };
}

/**
 * Facto do último turno do utilizador — não é decisão.
 * @param {object} ctx
 */
export function extrairFactoTemporario(ctx = {}) {
  const t =
    ctx?.ultimoTurno?.papel === "usuario"
      ? ctx.ultimoTurno.texto
      : ctx?.ultimoTurno?.anterior?.papel === "usuario"
        ? ctx.ultimoTurno.anterior.texto
        : null;
  const s = String(t || "").trim();
  if (!s || s.length < 8) return null;
  if (/^(ok|certo|sim|não|nao|pode)\.?$/i.test(s)) return null;
  return encurtar(s, 80);
}

/**
 * Selecciona no máx. um sinal de memória para a prosa.
 * @param {object} opts
 * @param {object} [opts.ctxImediato]
 * @param {string} [opts.instrucao]
 * @param {string} [opts.canal]
 * @param {boolean} [opts.jaTemAncoraE]
 * @returns {SinalMemoria|null}
 */
export function seleccionarRecuperacaoMemoria(opts = {}) {
  const canal = opts.canal || "chat";
  if (canal === "centro_situacao") return null;

  const ctx = opts.ctxImediato || {};
  const instrucao = String(opts.instrucao || "").trim();
  const { permanentes, temporarios } = classificarMemoriaExecutiva(ctx);
  const decisoes = permanentes.decisoes;
  const obj = permanentes.objectivo;
  const pend = Array.isArray(ctx.pendencias) ? ctx.pendencias.filter(Boolean) : [];
  const proxima = String(ctx.proximaAcao || "").trim() || null;

  if (!obj && !decisoes.length && !pend.length && !proxima) return null;

  // 1. Pedido explícito de retomada / memória
  if (pedidoExplicitoMemoria(instrucao)) {
    if (decisoes[0]) {
      if (!jaNoFioRecente(decisoes[0], ctx)) {
        return {
          tipo: "decisao",
          permanente: true,
          prosa: `Mantemos a decisão: ${encurtar(decisoes[0], 90)}.`
        };
      }
      // Decisão permanente já no fio — não repetir
      return null;
    }
    if (obj && !objectivoEcoRecente(obj, ctx)) {
      const extras = [];
      if (proxima) extras.push(`próxima acção: ${encurtar(proxima, 50)}`);
      if (pend[0]) extras.push(`pendência: ${encurtar(pend[0], 50)}`);
      const sufixo = extras.length ? ` (${extras.join("; ")})` : "";
      return {
        tipo: "objectivo",
        permanente: true,
        prosa: `Objectivo em curso: «${encurtar(obj, 70)}»${sufixo}.`
      };
    }
    return null;
  }

  // 2. Alinhar deliberação actual a decisão permanente já tomada
  if (
    decisoes[0] &&
    decisaoRelevanteAoPedido(instrucao, decisoes[0]) &&
    !jaNoFioRecente(decisoes[0], ctx)
  ) {
    return {
      tipo: "decisao",
      permanente: true,
      prosa: `Partindo da decisão anterior («${encurtar(decisoes[0], 70)}»).`
    };
  }

  // 3. Continuidade em conversa longa — só se objectivo não está no fio
  //    e há lastro permanente (não só facto temporário do último turno)
  // DESP-008: em missão activa, continuidade mais cedo (hist≥2); senão hist≥4
  const histLen = Number(ctx.historicoComprimento) || 0;
  const limiarHist = ctx.missaoActiva ? 2 : 4;
  if (
    histLen >= limiarHist &&
    obj &&
    !opts.jaTemAncoraE &&
    !objectivoEcoRecente(obj, ctx) &&
    (decisoes[0] || pend[0] || proxima) &&
    !ctx.houveShiftTopico
  ) {
    const lastro = decisoes[0]
      ? `decisão: ${encurtar(decisoes[0], 55)}`
      : proxima
        ? `próxima: ${encurtar(proxima, 55)}`
        : `pendência: ${encurtar(pend[0], 55)}`;
    return {
      tipo: "continuidade",
      permanente: true,
      prosa: `Continuidade: «${encurtar(obj, 55)}» — ${lastro}.`
    };
  }

  // 4. Nunca elevar facto temporário a decisão
  if (temporarios.ultimoPedido && !decisoes.length && !obj) {
    return null;
  }

  return null;
}

/**
 * @param {SinalMemoria|null} sinal
 * @param {string} canal
 */
export function formatarSinalMemoria(sinal, canal = "chat") {
  if (!sinal?.prosa) return null;
  if (canal === "voz") return encurtar(sinal.prosa, 100);
  return sinal.prosa;
}

/**
 * @param {string} instrucao
 */
export function pedidoExplicitoMemoria(instrucao) {
  return /(lembr|decidimos|o que ficou|onde paramos|retom|já tin|acordado|o que ficou decidido|continua(mos|r)?\s+(de\s+)?onde)/i.test(
    String(instrucao || "")
  );
}

/**
 * @param {string} instrucao
 * @param {string} decisao
 */
export function decisaoRelevanteAoPedido(instrucao, decisao) {
  const i = String(instrucao || "").toLowerCase();
  const d = String(decisao || "").toLowerCase();
  if (!i || !d || i.length < 6) return false;
  const tokens = d
    .split(/[^a-zà-ú0-9]+/i)
    .map((t) => t.trim())
    .filter((t) => t.length >= 4)
    .slice(0, 6);
  if (!tokens.length) return false;
  const hits = tokens.filter((t) => i.includes(t)).length;
  return hits >= 1 && (hits >= 2 || tokens.some((t) => t.length >= 6 && i.includes(t)));
}

/**
 * @param {string} texto
 * @param {object} ctx
 */
export function jaNoFioRecente(texto, ctx) {
  const trecho = String(texto || "")
    .toLowerCase()
    .trim()
    .slice(0, 36);
  if (!trecho || trecho.length < 8) return false;
  const textos = [
    ctx?.ultimoTurno?.texto,
    ctx?.ultimoTurno?.anterior?.texto
  ]
    .filter(Boolean)
    .map((t) => String(t).toLowerCase());
  return textos.some((t) => t.includes(trecho));
}

/**
 * @param {string} obj
 * @param {object} ctx
 */
function objectivoEcoRecente(obj, ctx) {
  return jaNoFioRecente(obj, ctx);
}

/**
 * @param {string} t
 * @param {number} max
 */
function encurtar(t, max) {
  const s = String(t || "").trim();
  if (s.length <= max) return s;
  return `${s.slice(0, Math.max(0, max - 1)).trim()}…`;
}
