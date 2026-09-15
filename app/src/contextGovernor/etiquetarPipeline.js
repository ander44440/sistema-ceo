/**
 * IMP-093 M2 — etiquetagem de fragmentos reais do pipeline.
 * Não inventa coaId/casoId/fonte; indeterminação → nao_declarada | nao_etiquetado.
 */

import { classificarUsoTurnoUtilizador } from "./alegacoesFactuais.js";
import { FONTES_CG, USOS_CG } from "./contratos.js";

/**
 * @param {unknown} valor
 * @returns {string}
 */
function texto(valor) {
  if (valor == null) return "";
  if (typeof valor === "string") return valor.trim();
  return String(valor).trim();
}

/**
 * @param {unknown} valor
 * @returns {string|null}
 */
function idOuNull(valor) {
  const t = texto(valor);
  return t || null;
}

/**
 * Une fontes sem duplicar; ignora vazios.
 * @param {...(string|string[]|null|undefined)} listas
 * @returns {string[]}
 */
export function unirFontesAutorizadas(...listas) {
  const out = [];
  const seen = new Set();
  for (const lista of listas) {
    const arr = Array.isArray(lista) ? lista : lista ? [lista] : [];
    for (const f of arr) {
      const s = texto(f);
      if (!s || seen.has(s)) continue;
      seen.add(s);
      out.push(s);
    }
  }
  return out;
}

/** Prefixo canónico dos factos LFC injectados no envelope (espelha consumoLfcMre). */
export const PREFIXO_LFC_ACTIVO =
  "[LFC activo — autoridade factual do caso]";

/**
 * Contrato único: LFC só é fonte autorizada no COA/caso activo alinhado ao consumo.
 * @param {{
 *   coaId?: string|null,
 *   casoIdActivo?: string|null,
 *   lfcConsumo?: { autorizado?: boolean, casoId?: string|null }|null
 * }} p
 * @returns {boolean}
 */
export function lfcConsumoAutorizadoNoAmbito(p = {}) {
  const coaId = idOuNull(p.coaId);
  const casoId = idOuNull(p.casoIdActivo);
  const casoIdConsumo = idOuNull(p.lfcConsumo?.casoId);
  return (
    p.lfcConsumo?.autorizado === true &&
    Boolean(coaId) &&
    Boolean(casoId) &&
    Boolean(casoIdConsumo) &&
    casoIdConsumo === casoId
  );
}

/**
 * Declara `lfc_activos` e acrescenta fragmentos FACTO do consumo (sem inventar).
 * @param {string[]} fontes
 * @param {import("./contratos.js").FragmentoContexto[]} fragmentos
 * @param {{
 *   coaId: string|null,
 *   casoId: string|null,
 *   lfcConsumo?: object|null,
 *   factos?: string[],
 *   idPrefix?: string
 * }} opts
 * @returns {boolean} true se LFC foi autorizado neste âmbito
 */
export function acrescentarLfcAutorizadoAoCandidato(fontes, fragmentos, opts = {}) {
  const coaId = idOuNull(opts.coaId);
  const casoId = idOuNull(opts.casoId);
  const ok = lfcConsumoAutorizadoNoAmbito({
    coaId,
    casoIdActivo: casoId,
    lfcConsumo: opts.lfcConsumo
  });
  if (!ok) return false;

  if (!fontes.includes(FONTES_CG.LFC_ACTIVOS)) {
    fontes.push(FONTES_CG.LFC_ACTIVOS);
  }

  const prefix = texto(opts.idPrefix) || "lfc";
  const factos = Array.isArray(opts.factos) ? opts.factos : [];
  for (let i = 0; i < factos.length; i++) {
    const raw = texto(factos[i]);
    if (!raw) continue;
    const linha = raw.includes(PREFIXO_LFC_ACTIVO)
      ? raw
      : `${PREFIXO_LFC_ACTIVO} ${raw}`;
    fragmentos.push(
      criarFragmento({
        id: `${prefix}-${i}`,
        papel: "bloco_factos",
        texto: linha,
        coaId,
        casoId,
        fonte: FONTES_CG.LFC_ACTIVOS,
        uso: USOS_CG.FACTO
      })
    );
  }
  return true;
}

/**
 * @param {object} p
 * @param {string} p.id
 * @param {string} [p.papel]
 * @param {string} [p.texto]
 * @param {unknown} [p.payload]
 * @param {string|null} [p.coaId]
 * @param {string|null} [p.casoId]
 * @param {string} p.fonte
 * @param {string} [p.uso]
 * @returns {import("./contratos.js").FragmentoContexto}
 */
export function criarFragmento(p) {
  return {
    id: texto(p.id) || "frag",
    papel: texto(p.papel) || "anexo",
    texto: typeof p.texto === "string" ? p.texto : p.texto == null ? "" : String(p.texto),
    payload: p.payload,
    coaId: p.coaId != null ? idOuNull(p.coaId) : null,
    casoId: p.casoId != null ? idOuNull(p.casoId) : null,
    fonte: texto(p.fonte) || FONTES_CG.NAO_DECLARADA,
    uso: texto(p.uso) || USOS_CG.MANDATO_PROMPT
  };
}

/**
 * Classifica uma mensagem LLM já montada a partir de pistas reais (conteúdo + params).
 * Sem pistas ⇒ nao_etiquetado / nao_declarada.
 *
 * @param {object} msg — { role, content }
 * @param {number} index
 * @param {object} [hints]
 * @returns {import("./contratos.js").FragmentoContexto}
 */
export function etiquetarMensagemLlm(msg, index, hints = {}) {
  const role = texto(msg?.role) || "user";
  const content = typeof msg?.content === "string" ? msg.content : "";
  const coaId = idOuNull(hints.coaId);
  const casoId = idOuNull(hints.casoId);

  // DIC institucional (conteúdo injectado só quando path meta)
  if (
    hints.dicInjectado === true &&
    role === "system" &&
    /dossier institucional|DIC|identidade do Sistema CEO/i.test(content.slice(0, 200))
  ) {
    return criarFragmento({
      id: `msg-${index}-dic`,
      papel: role,
      texto: content,
      coaId: null,
      casoId: null,
      fonte: FONTES_CG.DIC,
      uso: USOS_CG.MANDATO_PROMPT
    });
  }

  if (
    role === "system" &&
    content.startsWith("PORTA DE RECUPERAÇÃO")
  ) {
    return criarFragmento({
      id: `msg-${index}-porta`,
      papel: role,
      texto: content,
      coaId,
      casoId: null,
      fonte: FONTES_CG.NAO_DECLARADA,
      uso: USOS_CG.FACTO
    });
  }

  if (
    role === "system" &&
    (/projec[cç][aã]o subordinada|briefing/i.test(content.slice(0, 120)) ||
      hints.temBriefing === true)
  ) {
    // Só rotula briefing se o montador confirmou injecção
    if (hints.temBriefing === true) {
      return criarFragmento({
        id: `msg-${index}-briefing`,
        papel: role,
        texto: content,
        coaId,
        casoId: null,
        fonte: FONTES_CG.BRIEFING_OFICIAL,
        uso: USOS_CG.MANDATO_PROMPT
      });
    }
  }

  if (content.startsWith("OBJETIVO ATUAL DA INTERAÇÃO:")) {
    return criarFragmento({
      id: `msg-${index}-objetivo`,
      papel: role,
      texto: content,
      coaId,
      casoId: null,
      fonte: FONTES_CG.TURNO_ATUAL,
      uso: classificarUsoTurnoUtilizador(content)
    });
  }

  // Turnos de histórico com coaId conhecido no hint de turnos
  const turnMeta = Array.isArray(hints.turnos) ? hints.turnos[index] : null;
  if (turnMeta && turnMeta.fonte) {
    return criarFragmento({
      id: `msg-${index}-turno`,
      papel: role,
      texto: content,
      coaId: idOuNull(turnMeta.coaId) ?? coaId,
      casoId: idOuNull(turnMeta.casoId),
      fonte: turnMeta.fonte,
      uso: turnMeta.uso || USOS_CG.CONTINUIDADE
    });
  }

  if (role === "user" && !content.startsWith("OBJETIVO ATUAL")) {
    // user no prompt sem etiqueta de construção → turno se for a pergunta, senão não etiquetado
    if (hints.textoInstrucao && content === String(hints.textoInstrucao)) {
      return criarFragmento({
        id: `msg-${index}-turno-atual`,
        papel: role,
        texto: content,
        coaId,
        casoId: null,
        fonte: FONTES_CG.TURNO_ATUAL,
        uso: classificarUsoTurnoUtilizador(content)
      });
    }
  }

  // Constituição / governança / AD / contexto sessão sem fonte canónica CG
  if (role === "system") {
    return criarFragmento({
      id: `msg-${index}-system`,
      papel: role,
      texto: content,
      coaId: null,
      casoId: null,
      fonte: FONTES_CG.NAO_DECLARADA,
      uso: USOS_CG.MANDATO_PROMPT
    });
  }

  return criarFragmento({
    id: `msg-${index}`,
    papel: role,
    texto: content,
    coaId: null,
    casoId: null,
    fonte: FONTES_CG.NAO_ETIQUETADO,
    uso: USOS_CG.MANDATO_PROMPT
  });
}

/**
 * Meta CG para path directo (`montarMensagensLlm`).
 *
 * @param {object} opts
 * @param {Array<{role:string,content:string}>} opts.messages
 * @param {object|null} [opts.coa]
 * @param {string|null} [opts.casoId]
 * @param {object|null} [opts.validacaoContexto]
 * @param {{ injectado?: boolean }} [opts.dicMeta]
 * @param {boolean} [opts.temBriefing]
 * @param {string} [opts.instrucao]
 * @param {string} [opts.actoChamada]
 * @param {{ autorizado?: boolean, casoId?: string|null, factos?: string[] }|null} [opts.lfcConsumo]
 * @returns {object} cgMeta
 */
export function montarCgMetaPromptDirecto(opts = {}) {
  const messages = Array.isArray(opts.messages) ? opts.messages : [];
  const coaId = idOuNull(opts.coa?.id);
  const casoIdConsumo = idOuNull(opts.lfcConsumo?.casoId);
  const casoId = idOuNull(opts.casoId || casoIdConsumo);
  const vca = opts.validacaoContexto && typeof opts.validacaoContexto === "object"
    ? opts.validacaoContexto
    : {};
  const dicInjectado = opts.dicMeta?.injectado === true;
  const isolamentoCsc = vca.autorizaLastroCsc === false;

  const fontes = unirFontesAutorizadas(
    FONTES_CG.TURNO_ATUAL,
    dicInjectado ? FONTES_CG.DIC : null,
    opts.temBriefing === true ? FONTES_CG.BRIEFING_OFICIAL : null
  );

  const fragmentos = messages.map((m, i) =>
    etiquetarMensagemLlm(m, i, {
      coaId,
      casoId,
      dicInjectado,
      temBriefing: opts.temBriefing === true,
      textoInstrucao: opts.instrucao
    })
  );

  const factosConsumo = Array.isArray(opts.lfcConsumo?.factos)
    ? opts.lfcConsumo.factos
    : [];
  acrescentarLfcAutorizadoAoCandidato(fontes, fragmentos, {
    coaId,
    casoId,
    lfcConsumo: opts.lfcConsumo,
    factos: factosConsumo,
    idPrefix: "llm-lfc"
  });

  return {
    actoChamada: texto(opts.actoChamada) || "llm_direct",
    coaAtivo: coaId ? { id: coaId, nome: opts.coa?.nome || opts.coa?.titulo } : null,
    casoAtivo: casoId ? { casoId } : null,
    objetivoOuAssuntoTurno: texto(opts.instrucao) || null,
    fontesLastroAutorizadas: fontes,
    regimeEspecial: {
      ...(isolamentoCsc ? { vca_isolamento_csc: true } : {}),
      ...(vca.veredicto ? { vca_veredicto: vca.veredicto } : {})
    },
    conteudoCandidato: {
      messages,
      fragmentos
    },
    metaAuditoria: {
      ...(coaId ? { coaId } : {}),
      fase: "M2"
    }
  };
}

/**
 * Meta CG a partir da entrada MRE já montada (após LFC/RFR quando aplicável).
 *
 * @param {object} entrada — EntradaMre
 * @param {object} [ctx]
 * @returns {object} cgMetaBase
 */
export function montarCgMetaDeEntradaMre(entrada = {}, ctx = {}) {
  const coaId = idOuNull(entrada.coaId);
  const casoIdConsumo = idOuNull(entrada.lfcConsumo?.casoId);
  // Âmbito activo: preferir caso do pedido/ctx; fallback ao resolvido no consumo.
  const casoId = idOuNull(
    entrada.casoId ||
      ctx.lfcCasoId ||
      ctx.casoId ||
      casoIdConsumo
  );
  const rfrActivo = entrada.rfr?.activo === true;
  const lfcAutorizadoNoAmbito = lfcConsumoAutorizadoNoAmbito({
    coaId,
    casoIdActivo: casoId,
    lfcConsumo: entrada.lfcConsumo
  });
  const vca = ctx.validacaoContexto && typeof ctx.validacaoContexto === "object"
    ? ctx.validacaoContexto
    : {};
  const isolamentoCsc = ctx.coaAtivo === null || vca.autorizaLastroCsc === false;

  /** @type {import("./contratos.js").FragmentoContexto[]} */
  const fragmentos = [];
  const fontes = unirFontesAutorizadas(FONTES_CG.TURNO_ATUAL);

  const instrucao = texto(ctx.instrucao || entrada.perguntaAtual);
  if (instrucao) {
    fragmentos.push(
      criarFragmento({
        id: "mre-turno-atual",
        papel: "user",
        texto: instrucao,
        coaId,
        casoId: null,
        fonte: FONTES_CG.TURNO_ATUAL,
        uso: classificarUsoTurnoUtilizador(instrucao)
      })
    );
  }

  const factosOficiais = Array.isArray(entrada.factosOficiais)
    ? entrada.factosOficiais
    : [];

  const factosLfc = factosOficiais.filter((f) =>
    String(f || "").includes(PREFIXO_LFC_ACTIVO)
  );
  acrescentarLfcAutorizadoAoCandidato(fontes, fragmentos, {
    coaId,
    casoId,
    lfcConsumo: entrada.lfcConsumo,
    factos: factosLfc,
    idPrefix: "mre-lfc"
  });

  for (let i = 0; i < factosOficiais.length; i++) {
    const t = texto(factosOficiais[i]);
    if (!t) continue;
    if (t.includes(PREFIXO_LFC_ACTIVO) && lfcAutorizadoNoAmbito) continue;
    // Sem prova de origem LFC → nao_declarada (não inventar lfc_activos)
    fragmentos.push(
      criarFragmento({
        id: `mre-facto-${i}`,
        papel: "bloco_factos",
        texto: t,
        coaId,
        casoId: null,
        fonte: FONTES_CG.NAO_DECLARADA,
        uso: USOS_CG.FACTO
      })
    );
  }

  if (entrada.projecaoSubordinada?.factos?.length || entrada.briefing) {
    if (!fontes.includes(FONTES_CG.BRIEFING_OFICIAL)) {
      fontes.push(FONTES_CG.BRIEFING_OFICIAL);
    }
  }

  const lastro = ctx.lastroConsciencia;
  if (lastro?.temContextoRelevante === true && !isolamentoCsc) {
    if (!fontes.includes(FONTES_CG.CONSCIENCIA_OPS)) {
      fontes.push(FONTES_CG.CONSCIENCIA_OPS);
    }
  }

  // Fio/histórico no envelope: só etiquetar com coaId se o turno já o trouxer
  const hist = Array.isArray(ctx.historico) ? ctx.historico : [];
  hist.slice(-8).forEach((turn, i) => {
    if (!turn || !turn.texto) return;
    const turnCoa = idOuNull(turn.coaId);
    fragmentos.push(
      criarFragmento({
        id: `mre-hist-${i}`,
        papel:
          turn.papel === "usuario"
            ? "user"
            : turn.papel === "ceo" || turn.papel === "assistente"
              ? "assistant"
              : "anexo",
        texto: String(turn.texto),
        coaId: turnCoa,
        casoId: idOuNull(turn.casoId),
        fonte: turnCoa ? FONTES_CG.NAO_DECLARADA : FONTES_CG.NAO_ETIQUETADO,
        uso: USOS_CG.CONTINUIDADE
      })
    );
  });

  return {
    coaAtivo: coaId
      ? { id: coaId, nome: entrada.coaNome || ctx.coaAtivo?.nome }
      : null,
    casoAtivo: casoId ? { casoId } : null,
    objetivoOuAssuntoTurno: instrucao || null,
    fontesLastroAutorizadas: fontes,
    regimeEspecial: {
      ...(rfrActivo ? { rfr: true } : {}),
      ...(isolamentoCsc ? { vca_isolamento_csc: true } : {})
    },
    conteudoCandidato: { fragmentos },
    metaAuditoria: {
      ...(coaId ? { coaId } : {}),
      fase: "M2"
    }
  };
}

/**
 * Contagem sombra (métricas M2) — sem efeito no transporte.
 * @param {import("./contratos.js").FragmentoContexto[]} fragmentos
 */
export function contarEtiquetasFragmentos(fragmentos = []) {
  const list = Array.isArray(fragmentos) ? fragmentos : [];
  let naoEtiquetado = 0;
  let naoDeclarada = 0;
  const porFonte = {};
  for (const f of list) {
    const fonte = texto(f?.fonte) || FONTES_CG.NAO_DECLARADA;
    porFonte[fonte] = (porFonte[fonte] || 0) + 1;
    if (fonte === FONTES_CG.NAO_ETIQUETADO) naoEtiquetado += 1;
    if (fonte === FONTES_CG.NAO_DECLARADA) naoDeclarada += 1;
  }
  return {
    total: list.length,
    naoEtiquetado,
    naoDeclarada,
    porFonte
  };
}
