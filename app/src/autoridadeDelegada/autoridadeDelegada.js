/**
 * IMP-071 — Autoridade Delegada (HOMOLOGADA / Baseline CAP-01).
 * B1–B6: REQ-075…084 — congelados. Evolução só com evidência de uso real.
 * Vedado: alterar CTO-003 / CAP-04 / ARQ-032 sem deliberação CTO.
 */

export const ESTADO_AUTORIDADE_DELEGADA_ACTIVA = "autoridade_delegada_activa";

export const AGENTES = Object.freeze({
  usuario: "usuario",
  cto: "cto",
  engenheiro: "engenheiro",
  painel: "painel",
  sistema_ceo: "sistema_ceo"
});

/** Titular permanente da missão (ARQ-032 / CON-001). */
export const TITULAR_MISSAO = "usuario";

/** Perímetro por omissão (ARQ-032 A4/A6) quando o acto não delimita. */
export const PERIMETRO_OMISSAO =
  "decisoes_executivas_operacionais_no_coa_activo";

/**
 * Tipos de fecho autorizados sob delegação (CA-077-3 / ARQ-032 A6).
 * Qualquer outro tipo = fora do mandato.
 */
export const TIPOS_FECHO_PERMITIDOS = Object.freeze([
  "priorizar",
  "escolher_entre_alternativas",
  "determinar_proximo_gesto",
  "declarar_decisao"
]);

/**
 * Reservas constitucionais (CA-078-2 / ARQ-032 A6.8) — nunca cobertas pelo mandato.
 */
export const RESERVAS_CONSTITUCIONAIS = Object.freeze([
  "alterar_con_001",
  "abrir_cap",
  "emendar_roadmap",
  "aval_directo_reservado"
]);

/**
 * @typedef {object} EstadoAutoridadeDelegada
 * @property {boolean} activo
 * @property {typeof ESTADO_AUTORIDADE_DELEGADA_ACTIVA|null} estado
 * @property {typeof TITULAR_MISSAO} titularMissao
 * @property {"ceo"|null} competenciaFecho
 * @property {string|null} perimetro
 * @property {string|null} actoOrigem
 * @property {string|null} quandoActivado
 * @property {string|null} expiraEm — opcional (E3); não é estado arquitectural novo
 */

/** @type {EstadoAutoridadeDelegada} */
let estadoActual = estadoInactivo();

/**
 * Último termo verificável (auditoria) — NÃO é estado arquitectural ARQ-032.
 * @type {object|null}
 */
let ultimoEncerramento = null;

/**
 * Memória Organizacional da Autoridade Delegada (REQ-083 / CON-001 Art. 8º).
 * Ledger operacional — NÃO é estado arquitectural.
 * @type {object[]}
 */
let registosMo = [];

/**
 * Regista evento rastreável (activação / fecho / encerramento).
 * @param {object} opts
 * @returns {object} registo Art. 8º
 */
export function registarMemoriaOrganizacionalDelegacao(opts = {}) {
  const quando = opts.quando || new Date().toISOString();
  const estado = obterEstadoAutoridadeDelegada();
  const perimetro =
    opts.perimetro != null
      ? opts.perimetro
      : estado.perimetro ||
        (ultimoEncerramento && ultimoEncerramento.perimetroNoTermo) ||
        null;

  const registo = Object.freeze({
    id: `mo-ad-${registosMo.length + 1}-${quando}`,
    tipoEvento: String(opts.tipoEvento || "evento").trim(),
    /** CON-001 Art. 8º — seis elementos */
    quem: opts.quem != null ? String(opts.quem) : AGENTES.usuario,
    quando,
    oQue: opts.oQue != null ? String(opts.oQue) : String(opts.tipoEvento || ""),
    porque: opts.porque != null ? String(opts.porque) : null,
    baseadoEmQue:
      opts.baseadoEmQue != null ? String(opts.baseadoEmQue) : "ARQ-032",
    resultado: opts.resultado != null ? String(opts.resultado) : null,
    /** CA-083-2 / CA-083-3 */
    sobAutoridadeDelegada: opts.sobAutoridadeDelegada !== false,
    quemDelegou: opts.quemDelegou != null ? String(opts.quemDelegou) : AGENTES.usuario,
    perimetro,
    inicioMandato: opts.inicioMandato != null ? opts.inicioMandato : estado.quandoActivado,
    termoMandato: opts.termoMandato != null ? opts.termoMandato : null
  });

  registosMo = [...registosMo, registo];
  return registo;
}

/**
 * @returns {readonly object[]}
 */
export function listarRastreabilidadeDelegacao() {
  return Object.freeze([...registosMo]);
}

export function obterUltimoRegistoMo() {
  return registosMo.length ? registosMo[registosMo.length - 1] : null;
}

/**
 * CA-083-4: fecho importante sob delegação exige MO.
 * @param {object} fecho
 */
export function fechoImportanteConformeMo(fecho) {
  if (!fecho || fecho.sobAutoridadeDelegada !== true) {
    return { conforme: false, motivos: ["nao_e_fecho_sob_delegacao"] };
  }
  const comMo = registosMo.some(
    (r) =>
      r.tipoEvento === "fecho_sob_delegacao" &&
      r.sobAutoridadeDelegada === true &&
      r.quando === fecho.quando
  );
  if (!comMo) {
    return { conforme: false, motivos: ["fecho_sem_memoria_organizacional"] };
  }
  const r = registosMo.find(
    (x) => x.tipoEvento === "fecho_sob_delegacao" && x.quando === fecho.quando
  );
  const camposArt8 = ["quem", "quando", "oQue", "porque", "baseadoEmQue", "resultado"];
  for (const c of camposArt8) {
    if (r[c] == null || r[c] === "") {
      return { conforme: false, motivos: [`art8_ausente_${c}`] };
    }
  }
  if (!r.sobAutoridadeDelegada) {
    return { conforme: false, motivos: ["marcacao_mandato_ausente"] };
  }
  if (!r.quemDelegou || r.perimetro == null || r.perimetro === "") {
    return { conforme: false, motivos: ["quem_ou_perimetro_ausente"] };
  }
  return { conforme: true, motivos: [], registo: r };
}

function estadoInactivo() {
  return Object.freeze({
    activo: false,
    estado: null,
    titularMissao: TITULAR_MISSAO,
    competenciaFecho: null,
    perimetro: null,
    actoOrigem: null,
    quandoActivado: null,
    expiraEm: null
  });
}

function normalizarAmbito(valor) {
  return String(valor || "")
    .normalize("NFKC")
    .trim()
    .toLowerCase()
    .replace(/\s+/gu, "_");
}

/**
 * Confirmação operacional pontual / Gate — NÃO é acto de delegação (CA-075-4).
 * @param {string} texto
 */
export function ehAutorizacaoOperacionalPontual(texto) {
  const t = String(texto || "").normalize("NFKC").trim();
  if (!t) return false;
  const n = t
    .toLowerCase()
    .replace(/[.!?…]+$/u, "")
    .replace(/\s+/gu, " ")
    .trim();
  // Léxico pontual típico (Gate / ordem) — sem conceder fecho contínuo
  if (
    /^(autorizado|aprovado|pode executar|pode prosseguir|autorizada|aprovada)$/i.test(
      n
    )
  ) {
    return true;
  }
  if (/^(ok|sim|certo|segue|pode|confirmo|isso|tá|ta|beleza|de acordo)\.?$/i.test(n)) {
    return true;
  }
  // «está autorizado» / «autorizado a executar» sem verbo de decidir/assumir/julgar
  // Nota: usar radical «julg» para cobrir julga/julgar (regressão uso real).
  if (
    /\bautorizad[oa]\b/i.test(n) &&
    !/\b(decid|assum|fech|julg|crit[eé]rio|autoridade|medidas?)\b/i.test(n)
  ) {
    return true;
  }
  return false;
}

/**
 * Sinais de intenção de conceder competência de fecho (CA-075-1).
 * P0: perguntas meta («quando você decide…») NÃO são acto de delegação.
 * @param {string} texto
 */
export function ehActoExplicitoDeFecho(texto) {
  const t = String(texto || "").normalize("NFKC").trim();
  if (!t || t.length < 4) return false;
  if (ehAutorizacaoOperacionalPontual(t)) return false;

  const n = t.toLowerCase();

  // P0 — pergunta / meta sobre o modo de decidir ≠ concessão de fecho
  const enunciadoPerguntaMeta =
    /\?/.test(t) ||
    /^(quando|como|em\s+que|qual|quais|o\s+que|por\s+que|porque)\b/.test(
      n.replace(/^[«"']+/, "")
    ) ||
    /\b(quando|em\s+que\s+momento)\s+(voc[eê]|tu)\s+decid/.test(n) ||
    /\bcomo\s+(voc[eê]|tu)\s+(toma|decid)/.test(n);

  // Delegação explícita de autoridade / fecho
  if (
    /\b(delego|delegar|concedo|conced[oa]|transfiro)\b/.test(n) &&
    /\b(autoridade|al[cç]ada|compet[eê]ncia|fecho|decis)/.test(n)
  ) {
    return true;
  }
  // Nota: `\b` após vogais acentuadas falha em JS (ê/é ∉ \w) — usar âncoras de limite.
  const fimToken = "(?=\\s|$|[.,!?;:])";
  if (
    !enunciadoPerguntaMeta &&
    (new RegExp(`\\b(voc[eê]|tu)\\s+decid`).test(n) ||
      new RegExp(`\\bdecid[ae]\\s+(voc[eê]|tu)${fimToken}`).test(n) ||
      new RegExp(`\\bpodes?\\s+(decidir|fechar)${fimToken}`).test(n) ||
      /\b(fica|fique)\s+a\s+(teu|seu|teu\s+crit|seu\s+crit)/.test(n) ||
      (/\bcrit[eé]rio\b/.test(n) &&
        new RegExp(`\\b(teu|seu|voc[eê]|ceo)${fimToken}`).test(n)))
  ) {
    return true;
  }
  if (
    /\bassuma\b/.test(n) &&
    /\b(decis|autoridade|comando|condu)/.test(n)
  ) {
    return true;
  }
  if (/\bassuma\b/.test(n) && n.length <= 40) {
    // «assuma» sozinho ou curto — intenção de assumir
    return true;
  }
  if (
    /\bfa[cç]a\s+o\s+que\s+julgar\b/.test(n) ||
    /\bjulga?r?\s+necess/.test(n) ||
    (/\b(todas\s+as\s+)?medidas?\b/.test(n) && /\bjulg/.test(n))
  ) {
    return true;
  }
  if (
    /\bautorizo\s+(voc[eê]|o\s+ceo|tu)\s+a\s+(decidir|fechar|assum|tomar)/.test(
      n
    ) ||
    /\best[aá]\s+autorizad[oa]\s+a\s+(decidir|fechar|assum|tomar)/.test(n) ||
    (/\bautorizad[oa]\s+a\s+tomar\b/.test(n) &&
      /\b(medidas?|julg|necess)/.test(n))
  ) {
    return true;
  }
  if (
    /\bsem\s+me\s+perguntar\b/.test(n) &&
    /\b(decid|fech|autoriz)/.test(n)
  ) {
    return true;
  }
  if (
    /\bconfio\s+em\s+(ti|voc[eê]|no\s+ceo)\b/.test(n) &&
    /\b(decid|fech|autoridade|manda)/.test(n)
  ) {
    return true;
  }

  return false;
}

/**
 * Valida candidatura a acto de delegação (REQ-075).
 * @param {object} opts
 * @param {string} [opts.texto]
 * @param {string} [opts.agente] — deve ser usuario
 * @param {string} [opts.perimetro]
 * @returns {{ ok: boolean, motivosRecusa: string[], candidato?: object }}
 */
export function validarActoDelegacao(opts = {}) {
  /** @type {string[]} */
  const motivos = [];
  const agente = String(opts.agente || "").trim() || AGENTES.usuario;
  const texto = String(opts.texto || "").trim();

  if (agente !== AGENTES.usuario) {
    motivos.push("agente_nao_usuario");
  }
  if (!texto) {
    motivos.push("texto_ausente");
  }
  if (texto && ehAutorizacaoOperacionalPontual(texto)) {
    motivos.push("autorizacao_operacional_pontual");
  }
  if (texto && !ehAutorizacaoOperacionalPontual(texto) && !ehActoExplicitoDeFecho(texto)) {
    motivos.push("sem_acto_explicito_de_fecho");
  }

  if (motivos.length) {
    return { ok: false, motivosRecusa: motivos };
  }

  return {
    ok: true,
    motivosRecusa: [],
    candidato: {
      texto,
      agente: AGENTES.usuario,
      perimetro: opts.perimetro
        ? String(opts.perimetro).trim()
        : PERIMETRO_OMISSAO
    }
  };
}

/**
 * Snapshot do estado (REQ-076).
 * @returns {EstadoAutoridadeDelegada}
 */
export function obterEstadoAutoridadeDelegada() {
  return estadoActual;
}

export function autoridadeDelegadaActiva() {
  return estadoActual.activo === true;
}

/**
 * Activa estado após validação OK (REQ-076).
 * @param {object} opts
 */
export function activarAutoridadeDelegada(opts = {}) {
  const validacao = validarActoDelegacao(opts);
  if (!validacao.ok) {
    return {
      ok: false,
      motivosRecusa: [...validacao.motivosRecusa],
      estado: obterEstadoAutoridadeDelegada()
    };
  }

  const cand = validacao.candidato;
  const expiraEm =
    opts.expiraEm != null && String(opts.expiraEm).trim() !== ""
      ? String(opts.expiraEm).trim()
      : null;
  estadoActual = Object.freeze({
    activo: true,
    estado: ESTADO_AUTORIDADE_DELEGADA_ACTIVA,
    titularMissao: TITULAR_MISSAO,
    competenciaFecho: "ceo",
    perimetro: cand.perimetro,
    actoOrigem: cand.texto,
    quandoActivado: opts.quando || new Date().toISOString(),
    expiraEm
  });
  ultimoEncerramento = null;

  const estado = obterEstadoAutoridadeDelegada();
  const mo = registarMemoriaOrganizacionalDelegacao({
    tipoEvento: "activacao",
    quem: AGENTES.usuario,
    quando: estado.quandoActivado,
    oQue: "Activação da Autoridade Delegada",
    porque: "Acto explícito de concessão de fecho",
    baseadoEmQue: "REQ-075/REQ-076 · ARQ-032 A2–A4",
    resultado: ESTADO_AUTORIDADE_DELEGADA_ACTIVA,
    sobAutoridadeDelegada: true,
    quemDelegou: AGENTES.usuario,
    perimetro: estado.perimetro,
    inicioMandato: estado.quandoActivado,
    termoMandato: null
  });

  return {
    ok: true,
    motivosRecusa: [],
    estado,
    memoriaOrganizacional: mo
  };
}

/**
 * Processa mensagem do Usuário: valida e, se OK, activa (B1).
 * Se já activo: não reactiva (evita loop de ack).
 * @param {object} opts
 */
export function processarCandidaturaDelegacao(opts = {}) {
  const agente = String(opts.agente || AGENTES.usuario);
  if (agente !== AGENTES.usuario) {
    return {
      ok: false,
      activado: false,
      motivosRecusa: ["agente_nao_usuario"],
      estado: obterEstadoAutoridadeDelegada()
    };
  }
  if (autoridadeDelegadaActiva()) {
    return {
      ok: true,
      activado: false,
      jaActivo: true,
      motivosRecusa: [],
      estado: obterEstadoAutoridadeDelegada()
    };
  }
  const r = activarAutoridadeDelegada({
    texto: opts.texto,
    agente: AGENTES.usuario,
    perimetro: opts.perimetro,
    quando: opts.quando,
    expiraEm: opts.expiraEm
  });
  return {
    ok: r.ok,
    activado: r.ok === true,
    jaActivo: false,
    motivosRecusa: r.motivosRecusa || [],
    estado: r.estado
  };
}

/** Só testes / reinício de sessão controlado — não é o caminho R5 de produção. */
export function reiniciarAutoridadeDelegadaParaTestes() {
  estadoActual = estadoInactivo();
  ultimoEncerramento = null;
  registosMo = [];
}

/**
 * Inventário de estados do módulo — prova CA-076-3 (só o estado ARQ-032).
 */
export function listarEstadosArquitecturaisDoModulo() {
  return Object.freeze([ESTADO_AUTORIDADE_DELEGADA_ACTIVA]);
}

/* ─── B2 / REQ-077 + REQ-078 ─────────────────────────────────────────── */

/**
 * Âmbito coberto pelo perímetro activo? (CA-078-1)
 * @param {string|null} perimetroActivo
 * @param {string} [ambito]
 */
export function perimetroCobre(perimetroActivo, ambito) {
  const p = normalizarAmbito(perimetroActivo);
  if (!p) return false;
  const a = normalizarAmbito(ambito);
  if (!a) {
    // omissão de âmbito: só coberta sob perímetro por omissão (ops no COA activo)
    return p === PERIMETRO_OMISSAO || p === "coa_activo" || p.startsWith("coa");
  }
  if (a === p) return true;
  if (a.startsWith(`${p}:`) || a.startsWith(`${p}/`)) return true;

  if (p === PERIMETRO_OMISSAO) {
    const aliasesOmissao = new Set([
      PERIMETRO_OMISSAO,
      "coa_activo",
      "coa-activo",
      "decisao_operacional_coa",
      "decisoes_executivas_operacionais"
    ]);
    if (aliasesOmissao.has(a)) return true;
    if (a.startsWith("coa:") || a.startsWith("coa_")) return true;
  }

  return false;
}

/**
 * @param {string} [ambito]
 * @param {string} [reservaConstitucional]
 */
export function ehReservaConstitucional(ambito, reservaConstitucional) {
  const reserva = normalizarAmbito(reservaConstitucional);
  if (reserva && RESERVAS_CONSTITUCIONAIS.includes(reserva)) return true;
  const a = normalizarAmbito(ambito);
  if (!a) return false;
  if (RESERVAS_CONSTITUCIONAIS.includes(a)) return true;
  if (
    /^(alterar_)?con[_-]?001$/.test(a) ||
    /^abrir_cap/.test(a) ||
    /^emendar_roadmap/.test(a) ||
    /^aval_directo/.test(a)
  ) {
    return true;
  }
  return false;
}

/**
 * Fundamentação textual obrigatória na recusa (despacho B2).
 * @param {string[]} motivos
 */
export function fundamentarRecusaFecho(motivos) {
  const m = new Set(motivos || []);
  const partes = [];
  if (m.has("estado_inactivo")) {
    partes.push(
      "Autoridade Delegada inactiva: não há competência de fecho autónomo."
    );
  }
  if (m.has("tipo_fecho_nao_autorizado")) {
    partes.push(
      "Tipo de fecho fora do mandato (só priorizar, escolher alternativas enquadradas, próximo gesto, declarar decisão)."
    );
  }
  if (m.has("fora_do_perimetro")) {
    partes.push(
      "Decisão fora do perímetro delegado: devolvo o fecho ao Usuário."
    );
  }
  if (m.has("reserva_constitucional")) {
    partes.push(
      "Reserva constitucional (CON-001 / CAP / ROADMAP / aval directo): fecho recusado."
    );
  }
  if (m.has("redelegacao_vedada")) {
    partes.push("Redelegação da competência a terceiro é vedada (ARQ-032 A6.7).");
  }
  if (m.has("ampliacao_perimetro_vedada")) {
    partes.push(
      "O CEO não amplia o perímetro por iniciativa própria; só o Usuário o delimita."
    );
  }
  if (!partes.length) {
    partes.push("Fecho recusado: fora dos limites da Autoridade Delegada.");
  }
  return partes.join(" ");
}

/**
 * Avalia pedido de fecho sem mutar estado (REQ-077 / REQ-078).
 * @param {object} pedido
 * @param {string} [pedido.tipoFecho]
 * @param {string} [pedido.ambito]
 * @param {string} [pedido.descricao]
 * @param {string} [pedido.reservaConstitucional]
 * @param {string} [pedido.redelegarPara]
 * @param {string} [pedido.ampliarPerimetroPara]
 * @returns {{ permitido: boolean, motivosRecusa: string[], acao: "fechar"|"recusar"|"devolver_ao_usuario" }}
 */
export function avaliarPedidoFecho(pedido = {}) {
  /** @type {string[]} */
  const motivos = [];
  const estado = obterEstadoAutoridadeDelegada();

  if (!estado.activo || estado.competenciaFecho !== "ceo") {
    motivos.push("estado_inactivo");
    return {
      permitido: false,
      motivosRecusa: motivos,
      acao: "recusar"
    };
  }

  // CA-078-4: tentativa de ampliação — recusa sem alterar perímetro
  if (
    pedido.ampliarPerimetroPara != null &&
    String(pedido.ampliarPerimetroPara).trim() !== ""
  ) {
    motivos.push("ampliacao_perimetro_vedada");
    return {
      permitido: false,
      motivosRecusa: motivos,
      acao: "recusar"
    };
  }

  // CA-078-3: não redelegação
  if (pedido.redelegarPara != null && String(pedido.redelegarPara).trim() !== "") {
    motivos.push("redelegacao_vedada");
    return {
      permitido: false,
      motivosRecusa: motivos,
      acao: "recusar"
    };
  }

  // CA-078-2: reservas constitucionais
  if (ehReservaConstitucional(pedido.ambito, pedido.reservaConstitucional)) {
    motivos.push("reserva_constitucional");
    return {
      permitido: false,
      motivosRecusa: motivos,
      acao: "recusar"
    };
  }

  const tipo = String(pedido.tipoFecho || "").trim();
  if (!TIPOS_FECHO_PERMITIDOS.includes(tipo)) {
    motivos.push("tipo_fecho_nao_autorizado");
    return {
      permitido: false,
      motivosRecusa: motivos,
      acao: "recusar"
    };
  }

  // CA-078-1: fora do perímetro → devolver ao Usuário
  if (!perimetroCobre(estado.perimetro, pedido.ambito)) {
    motivos.push("fora_do_perimetro");
    return {
      permitido: false,
      motivosRecusa: motivos,
      acao: "devolver_ao_usuario"
    };
  }

  return {
    permitido: true,
    motivosRecusa: [],
    acao: "fechar"
  };
}

/**
 * Exerce fecho no perímetro (REQ-077) ou recusa com fundamentação (REQ-078).
 * Não encerra a delegação (B3). Não altera titular da missão.
 * @param {object} pedido
 */
export function exercerFechoDelegado(pedido = {}) {
  const avaliacao = avaliarPedidoFecho(pedido);
  const estadoAntes = obterEstadoAutoridadeDelegada();

  if (!avaliacao.permitido) {
    return {
      ok: false,
      fechado: false,
      motivosRecusa: [...avaliacao.motivosRecusa],
      fundamentacao: fundamentarRecusaFecho(avaliacao.motivosRecusa),
      devolvidoAoUsuario:
        avaliacao.acao === "devolver_ao_usuario" ||
        avaliacao.acao === "recusar",
      acao: avaliacao.acao,
      estado: estadoAntes,
      titularMissao: TITULAR_MISSAO
    };
  }

  const tipo = String(pedido.tipoFecho).trim();
  const ambito =
    pedido.ambito != null && String(pedido.ambito).trim() !== ""
      ? String(pedido.ambito).trim()
      : estadoAntes.perimetro;

  const quando = pedido.quando || new Date().toISOString();
  const fecho = Object.freeze({
    tipoFecho: tipo,
    ambito,
    descricao:
      pedido.descricao != null ? String(pedido.descricao).trim() : null,
    sobAutoridadeDelegada: true,
    titularMissao: TITULAR_MISSAO,
    perimetro: estadoAntes.perimetro,
    competenciaFecho: "ceo",
    quando
  });

  const mo = registarMemoriaOrganizacionalDelegacao({
    tipoEvento: "fecho_sob_delegacao",
    quem: "ceo",
    quando,
    oQue: `Fecho delegado: ${tipo}${fecho.descricao ? ` — ${fecho.descricao}` : ""}`,
    porque: "Exercício da competência de fecho no perímetro (REQ-077)",
    baseadoEmQue: "REQ-077 · ARQ-032 A6 · mandato activo",
    resultado: "decisao_fechada_sob_autoridade_delegada",
    sobAutoridadeDelegada: true,
    quemDelegou: AGENTES.usuario,
    perimetro: estadoAntes.perimetro,
    inicioMandato: estadoAntes.quandoActivado,
    termoMandato: null
  });

  return {
    ok: true,
    fechado: true,
    motivosRecusa: [],
    fundamentacao: null,
    devolvidoAoUsuario: false,
    acao: "fechar",
    fecho,
    memoriaOrganizacional: mo,
    // Estado inalterado (sem novos estados; sem encerramento)
    estado: obterEstadoAutoridadeDelegada(),
    titularMissao: TITULAR_MISSAO
  };
}

/**
 * Tentativa explícita de o CEO alargar o perímetro — sempre recusada (CA-078-4).
 * @param {string} _novoPerimetro
 */
export function tentarAmpliarPerimetro(_novoPerimetro) {
  const estado = obterEstadoAutoridadeDelegada();
  const perimetroAntes = estado.perimetro;
  return {
    ok: false,
    motivosRecusa: ["ampliacao_perimetro_vedada"],
    fundamentacao: fundamentarRecusaFecho(["ampliacao_perimetro_vedada"]),
    perimetro: perimetroAntes,
    perimetroApos: obterEstadoAutoridadeDelegada().perimetro,
    alterou: false
  };
}

/* ─── B3 / REQ-079 + REQ-080 ─────────────────────────────────────────── */

/**
 * Critérios de termo ARQ-032 A5 (CA-079).
 * Não são estados arquitecturais — são motivos verificáveis de encerramento.
 */
export const CRITERIOS_ENCERRAMENTO = Object.freeze({
  E1_REVOGACAO_EXPLICITA: "E1_revogacao_explicita",
  E2_EXAURIMENTO_PERIMETRO: "E2_exaurimento_perimetro",
  E3_EXPIRACAO: "E3_expiracao",
  E4_PERDA_AMBITO: "E4_perda_ambito",
  E5_ACTO_SOBERANO: "E5_acto_soberano",
  E6_RETORNO_AUTOMATICO: "E6_retorno_automatico"
});

const CRITERIOS_ENCERRAMENTO_SET = new Set(
  Object.values(CRITERIOS_ENCERRAMENTO)
);

/**
 * Revogação explícita pelo Usuário (E1).
 * @param {string} texto
 */
export function ehRevogacaoExplicita(texto) {
  const t = String(texto || "").normalize("NFKC").trim().toLowerCase();
  if (!t || t.length < 4) return false;
  if (
    /\b(revogo|revogar|revoga[cç][aã]o)\b/.test(t) &&
    /\b(delega[cç][aã]o|autoridade|mandato|al[cç]ada|fecho)\b/.test(t)
  ) {
    return true;
  }
  if (
    /\b(encerro|encerrar|termin[oa]|cancelo|cancelar)\b/.test(t) &&
    /\b(delega[cç][aã]o|autoridade|mandato)\b/.test(t)
  ) {
    return true;
  }
  if (
    /\b(retiro|retomo|reassumo)\b/.test(t) &&
    /\b(autoridade|fecho|decis|mandato)\b/.test(t)
  ) {
    return true;
  }
  if (/\bsem\s+autoridade\s+delegada\b/.test(t)) return true;
  return false;
}

/**
 * Acto soberano que reafirma fecho exclusivo ou contradiz o mandato (E5).
 * @param {string} texto
 */
export function ehActoSoberanoContraditorio(texto) {
  const t = String(texto || "").normalize("NFKC").trim().toLowerCase();
  if (!t || t.length < 4) return false;
  const fimToken = "(?=\\s|$|[.,!?;:])";
  if (
    /\b(s[oó]\s+eu|somente\s+eu|apenas\s+eu)\b/.test(t) &&
    /\b(decid|fech|autoriz)\b/.test(t)
  ) {
    return true;
  }
  if (
    /\beu\s+(volto\s+a\s+)?decid/.test(t) ||
    new RegExp(`\\beu\\s+fecho${fimToken}`).test(t) ||
    /\bfecho\s+exclusivo\b/.test(t) ||
    /\breassumo\s+o\s+fecho\b/.test(t)
  ) {
    return true;
  }
  if (
    /\b(n[aã]o\s+decid[ae]s?|n[aã]o\s+feches?)\b/.test(t) &&
    /\b(mais|sem\s+mim|sem\s+eu)\b/.test(t)
  ) {
    return true;
  }
  return false;
}

/**
 * Snapshot do último termo (verificável) — não é estado ARQ.
 */
export function obterUltimoEncerramento() {
  return ultimoEncerramento;
}

/**
 * Encierra a Autoridade Delegada (REQ-079) e devolve competência ao Usuário
 * no mesmo instante (REQ-080) — sem pedido de devolução nem confirmação do CEO.
 *
 * @param {object} opts
 * @param {string} opts.criterio — E1…E6
 * @param {string} [opts.motivo]
 * @param {string} [opts.quando]
 * @param {string} [opts.textoUsuario]
 */
export function encerrarAutoridadeDelegada(opts = {}) {
  const criterio = String(opts.criterio || "").trim();
  if (!CRITERIOS_ENCERRAMENTO_SET.has(criterio)) {
    return {
      ok: false,
      encerrado: false,
      motivosRecusa: ["criterio_encerramento_invalido"],
      estado: obterEstadoAutoridadeDelegada(),
      titularMissao: TITULAR_MISSAO
    };
  }

  const estadoAntes = obterEstadoAutoridadeDelegada();
  if (!estadoAntes.activo) {
    return {
      ok: false,
      encerrado: false,
      motivosRecusa: ["delegacao_ja_inactiva"],
      estado: estadoAntes,
      titularMissao: TITULAR_MISSAO,
      ultimoEncerramento
    };
  }

  // Perímetro não é alterado durante a vida; no termo limpa-se o estado activo
  // (sem estado órfão). Snapshot do perímetro no termo para verificação.
  const perimetroNoTermo = estadoAntes.perimetro;
  const quando = opts.quando || new Date().toISOString();

  estadoActual = estadoInactivo();

  ultimoEncerramento = Object.freeze({
    criterio,
    motivo: opts.motivo != null ? String(opts.motivo).trim() : null,
    textoUsuario:
      opts.textoUsuario != null ? String(opts.textoUsuario).trim() : null,
    quando,
    perimetroNoTermo,
    competenciaFechoAntes: "ceo",
    competenciaFechoApos: null,
    titularMissao: TITULAR_MISSAO,
    /** CA-080-1: retorno sem passo de pedido de devolução */
    pedidoDevolucaoExigido: false,
    /** CA-080-3: sem confirmação do CEO */
    confirmacaoCeoExigida: false,
    retornoAutomatico: true,
    estadoArquitecturalApos: null
  });

  const mo = registarMemoriaOrganizacionalDelegacao({
    tipoEvento: "encerramento",
    quem: opts.textoUsuario ? AGENTES.usuario : "sistema_ceo",
    quando,
    oQue: `Encerramento da Autoridade Delegada (${criterio})`,
    porque: opts.motivo || criterio,
    baseadoEmQue: "REQ-079/REQ-080 · ARQ-032 A5/A7",
    resultado: "competencia_fecho_regressou_ao_usuario",
    sobAutoridadeDelegada: true,
    quemDelegou: AGENTES.usuario,
    perimetro: perimetroNoTermo,
    inicioMandato: estadoAntes.quandoActivado,
    termoMandato: quando
  });

  return {
    ok: true,
    encerrado: true,
    criterio,
    retornoAutomatico: true,
    pedidoDevolucaoExigido: false,
    confirmacaoCeoExigida: false,
    competenciaFecho: null,
    titularMissao: TITULAR_MISSAO,
    perimetroNoTermo,
    estado: obterEstadoAutoridadeDelegada(),
    ultimoEncerramento,
    memoriaOrganizacional: mo
  };
}

/**
 * E2 — exaurimento do perímetro.
 */
export function encerrarPorExaurimentoPerimetro(opts = {}) {
  return encerrarAutoridadeDelegada({
    criterio: CRITERIOS_ENCERRAMENTO.E2_EXAURIMENTO_PERIMETRO,
    motivo: opts.motivo || "perimetro_exaurido",
    quando: opts.quando
  });
}

/**
 * E3 — expiração (se definida na activação).
 * @param {object} [opts]
 * @param {string|Date|number} [opts.agora]
 */
export function verificarEAplicarExpiracao(opts = {}) {
  const estado = obterEstadoAutoridadeDelegada();
  if (!estado.activo || !estado.expiraEm) {
    return { ok: false, encerrado: false, motivosRecusa: ["sem_expiracao"] };
  }
  const agora =
    opts.agora != null ? new Date(opts.agora).getTime() : Date.now();
  const limite = new Date(estado.expiraEm).getTime();
  if (!Number.isFinite(limite) || agora < limite) {
    return { ok: false, encerrado: false, motivosRecusa: ["ainda_vigente"] };
  }
  return encerrarAutoridadeDelegada({
    criterio: CRITERIOS_ENCERRAMENTO.E3_EXPIRACAO,
    motivo: "expiracao_atingida",
    quando:
      opts.agora != null
        ? new Date(opts.agora).toISOString()
        : new Date().toISOString()
  });
}

/**
 * E4 — perda de âmbito.
 */
export function encerrarPorPerdaAmbito(opts = {}) {
  return encerrarAutoridadeDelegada({
    criterio: CRITERIOS_ENCERRAMENTO.E4_PERDA_AMBITO,
    motivo: opts.motivo || "perda_de_ambito",
    quando: opts.quando
  });
}

/**
 * Processa mensagem do Usuário para E1 / E5 (REQ-079).
 * Retorno automático incluído no mesmo acto (REQ-080).
 * @param {object} opts
 */
export function processarCandidaturaEncerramento(opts = {}) {
  const agente = String(opts.agente || AGENTES.usuario).trim() || AGENTES.usuario;
  if (agente !== AGENTES.usuario) {
    return {
      ok: false,
      encerrado: false,
      motivosRecusa: ["agente_nao_usuario"],
      estado: obterEstadoAutoridadeDelegada()
    };
  }
  if (!autoridadeDelegadaActiva()) {
    return {
      ok: false,
      encerrado: false,
      motivosRecusa: ["delegacao_ja_inactiva"],
      estado: obterEstadoAutoridadeDelegada()
    };
  }

  const texto = String(opts.texto || "").trim();
  if (ehRevogacaoExplicita(texto)) {
    return encerrarAutoridadeDelegada({
      criterio: CRITERIOS_ENCERRAMENTO.E1_REVOGACAO_EXPLICITA,
      motivo: "revogacao_explicita_usuario",
      textoUsuario: texto,
      quando: opts.quando
    });
  }
  if (ehActoSoberanoContraditorio(texto)) {
    return encerrarAutoridadeDelegada({
      criterio: CRITERIOS_ENCERRAMENTO.E5_ACTO_SOBERANO,
      motivo: "acto_soberano_usuario",
      textoUsuario: texto,
      quando: opts.quando
    });
  }

  return {
    ok: false,
    encerrado: false,
    motivosRecusa: ["sem_criterio_de_termo"],
    estado: obterEstadoAutoridadeDelegada()
  };
}

/**
 * Ponte EE: expiração → encerramento por texto → candidatura a activação.
 * Não altera perímetro vivo; não cria estados novos.
 * @param {object} opts
 */
export function processarMensagemAutoridadeDelegada(opts = {}) {
  verificarEAplicarExpiracao({ agora: opts.agora });

  if (autoridadeDelegadaActiva()) {
    const enc = processarCandidaturaEncerramento({
      texto: opts.texto,
      agente: opts.agente || AGENTES.usuario,
      quando: opts.quando
    });
    if (enc.encerrado) {
      return {
        activado: false,
        encerrado: true,
        resultado: enc,
        estado: obterEstadoAutoridadeDelegada()
      };
    }
  }

  const act = processarCandidaturaDelegacao({
    texto: opts.texto,
    agente: opts.agente || AGENTES.usuario,
    perimetro: opts.perimetro,
    quando: opts.quando,
    expiraEm: opts.expiraEm
  });
  return {
    activado: act.activado === true,
    jaActivo: act.jaActivo === true,
    encerrado: false,
    resultado: act,
    estado: obterEstadoAutoridadeDelegada()
  };
}

/**
 * Snapshot para dados de resposta / lastro do pipeline (integração EE).
 */
export function snapshotAutoridadeDelegadaParaDados() {
  const e = obterEstadoAutoridadeDelegada();
  return Object.freeze({
    activo: e.activo === true,
    estado: e.estado,
    titularMissao: e.titularMissao,
    competenciaFecho: e.competenciaFecho,
    perimetro: e.perimetro,
    actoOrigem: e.actoOrigem,
    quandoActivado: e.quandoActivado
  });
}

/**
 * Ordem de execução operacional (sob AD → Motor/Jobs, não novo ack de mandato).
 * @param {string} texto
 */
export function ehOrdemExecucaoOperacional(texto) {
  const n = String(texto || "")
    .normalize("NFKC")
    .toLowerCase()
    .replace(/\s+/gu, " ")
    .trim();
  if (!n || n.length < 4) return false;
  // P0: «não execute…» / «apenas responda…» nunca é ordem de execução
  if (
    /\bn[aã]o\s+(execute|executa|executar|implemente|implementa|crie\s+jobs?)\b/.test(
      n
    ) ||
    /\bapenas\s+(responda|informe|diga|analise)\b/.test(n) ||
    /\bsomente\s+(responda|informe|diga|analise)\b/.test(n) ||
    /\bsem\s+(executar|execu[cç][aã]o|criar\s+jobs?)\b/.test(n)
  ) {
    return false;
  }
  if (
    /\b(execut[aeo]|implement[ae]|aplica|desbloque|avança\s+com|avance\s+com)\b/.test(
      n
    )
  ) {
    return true;
  }
  if (
    /\b(faz|fa[cç]a)\s+(as|os|isso|as\s+melhorias|o\s+plano)\b/.test(n) ||
    /\bpode\s+(executar|implementar|seguir|avançar)\b/.test(n)
  ) {
    return true;
  }
  return false;
}

/**
 * Bloco de sistema para o LLM quando AD está activa (modula deliberação).
 */
export function textoGovernancaAutoridadeDelegadaActiva() {
  const e = obterEstadoAutoridadeDelegada();
  if (!e.activo) return null;
  return [
    "AUTORIDADE DELEGADA ACTIVA (ARQ-032 / CAP-01) — competência de fecho concedida:",
    `- Perímetro: ${e.perimetro || PERIMETRO_OMISSAO}`,
    "- Titular permanente da missão: Usuário (inalterado).",
    "- Podes priorizar, escolher entre alternativas já enquadradas, determinar o próximo gesto e declarar a decisão — sem pedir novo acto de fecho/autorização ao Usuário para o que estiver no perímetro.",
    "- Não peças «autorização para decidir» nem devolvas ao Usuário decisões cobertas pelo mandato.",
    "- Se faltar dado factual, declara a melhor decisão operacional possível com o lastro disponível e o próximo gesto concreto; não bloqueies a missão pedindo permissão de fecho.",
    "- Fora do perímetro, reservas constitucionais ou ampliação de mandato: devolve ao Usuário com fundamentação."
  ].join("\n");
}

/* ─── B4 / REQ-081 + REQ-082 ─────────────────────────────────────────── */

/**
 * Modos operacionais canónicos (ARQ-032 A8 / Baseline).
 * Autoridade Delegada NÃO é modo (CA-082-1).
 */
export const MODOS_OPERACIONAIS = Object.freeze([
  "deliberar",
  "executar",
  "recuperar"
]);

/**
 * @returns {readonly string[]}
 */
export function listarModosOperacionais() {
  return MODOS_OPERACIONAIS;
}

/** CA-082-1: AD não é quarto modo. */
export function autoridadeDelegadaEhModoOperacional() {
  return false;
}

/**
 * Postura ortogonal por modo × delegação (ARQ-032 A8) — CA-082-2.
 * @param {"deliberar"|"executar"|"recuperar"} modo
 * @param {boolean} [delegacaoActiva]
 */
export function descreverPosturaModo(modo, delegacaoActiva) {
  const m = String(modo || "").trim().toLowerCase();
  if (!MODOS_OPERACIONAIS.includes(m)) {
    return {
      ok: false,
      motivosRecusa: ["modo_desconhecido"],
      modo: null
    };
  }
  const activa =
    delegacaoActiva === undefined
      ? autoridadeDelegadaActiva()
      : delegacaoActiva === true;

  /** @type {Record<string, { sem: object, com: object }>} */
  const tabela = {
    deliberar: {
      sem: {
        postura: "preparar",
        fechoAutonomo: false,
        quemFecha: "usuario"
      },
      com: {
        postura: "preparar_e_pode_fechar_no_perimetro",
        fechoAutonomo: true,
        quemFecha: "ceo_se_coberto"
      }
    },
    executar: {
      sem: {
        postura: "ordens_autorizacao_pontual",
        fechoAutonomo: false,
        quemFecha: "usuario"
      },
      com: {
        postura: "executar_e_fecho_se_coberto",
        fechoAutonomo: true,
        quemFecha: "ceo_se_coberto"
      }
    },
    recuperar: {
      sem: {
        postura: "recuperar_ops_fecho_sensivel_usuario",
        fechoAutonomo: false,
        quemFecha: "usuario"
      },
      com: {
        postura: "recuperar_sem_ampliar_perimetro",
        fechoAutonomo: true,
        quemFecha: "ceo_se_coberto_a6"
      }
    }
  };

  const lado = activa ? tabela[m].com : tabela[m].sem;
  return {
    ok: true,
    modo: m,
    autoridadeDelegadaActiva: activa,
    autoridadeDelegadaEhModo: false,
    ...lado
  };
}

/**
 * Três posturas distintas com delegação activa (CA-082-2).
 */
export function observarPosturasComDelegacaoActiva() {
  return Object.freeze(
    MODOS_OPERACIONAIS.map((modo) => descreverPosturaModo(modo, true))
  );
}

/**
 * Sem delegação, nenhum modo confere fecho autónomo (CA-082-3).
 * @param {"deliberar"|"executar"|"recuperar"} modo
 */
export function modoConfereFechoAutonomoSemDelegacao(modo) {
  const p = descreverPosturaModo(modo, false);
  if (!p.ok) return false;
  return p.fechoAutonomo === true;
}

/**
 * Inspecção de escopo: este módulo não redefine CTO-003 (CA-082-4).
 * Contrato estático — não importa nem altera interceptação operacional.
 */
export function escopoCto003Intocado() {
  return Object.freeze({
    alteraInterceptacaoOperacional: false,
    alteraBaselineCto003: false,
    criaQuartoModo: false,
    modosCanonicos: [...MODOS_OPERACIONAIS]
  });
}

/**
 * Fecho directo pelo Usuário — prevalece mesmo com delegação activa (CA-081-3).
 * Não exige competência do CEO; não altera o ciclo de vida salvo se `revogarApos` for true.
 * @param {object} opts
 */
export function fecharDirectamentePeloUsuario(opts = {}) {
  const agente = String(opts.agente || AGENTES.usuario).trim() || AGENTES.usuario;
  if (agente !== AGENTES.usuario) {
    return {
      ok: false,
      fechado: false,
      motivosRecusa: ["agente_nao_usuario"],
      prevalece: null,
      estado: obterEstadoAutoridadeDelegada()
    };
  }

  const descricao =
    opts.descricao != null ? String(opts.descricao).trim() : null;
  const ambito =
    opts.ambito != null
      ? String(opts.ambito).trim()
      : obterEstadoAutoridadeDelegada().perimetro;
  const tipoFecho =
    opts.tipoFecho != null
      ? String(opts.tipoFecho).trim()
      : "declarar_decisao";

  const fecho = Object.freeze({
    tipoFecho,
    ambito,
    descricao,
    sobAutoridadeDelegada: false,
    sobSoberaniaUsuario: true,
    titularMissao: TITULAR_MISSAO,
    competenciaFecho: "usuario",
    quando: opts.quando || new Date().toISOString()
  });

  let encerramento = null;
  if (opts.revogarApos === true && autoridadeDelegadaActiva()) {
    encerramento = encerrarAutoridadeDelegada({
      criterio: CRITERIOS_ENCERRAMENTO.E5_ACTO_SOBERANO,
      motivo: "fecho_directo_usuario",
      textoUsuario: opts.texto,
      quando: opts.quando
    });
  }

  return {
    ok: true,
    fechado: true,
    prevalece: "usuario",
    oposicaoCeo: false,
    fecho,
    encerramento,
    titularMissao: TITULAR_MISSAO,
    estado: obterEstadoAutoridadeDelegada()
  };
}

/**
 * Conflito: acto explícito do Usuário vs fecho sob delegação (CA-081-1 / CA-081-4).
 * O CEO não se opõe — anula o fecho delegado e aplica o acto do Usuário.
 * @param {object} opts
 * @param {object} [opts.fechoDelegado]
 * @param {object} opts.actoUsuario — { tipo: "fechar_directo"|"revogar"|"contradizer", ... }
 */
export function resolverConflitoSoberano(opts = {}) {
  const acto = opts.actoUsuario || {};
  const tipo = String(acto.tipo || "").trim();
  const agente = String(acto.agente || AGENTES.usuario).trim() || AGENTES.usuario;

  if (agente !== AGENTES.usuario) {
    return {
      ok: false,
      prevalece: null,
      motivosRecusa: ["agente_nao_usuario"],
      fechoDelegadoAnulado: false
    };
  }

  if (!tipo) {
    return {
      ok: false,
      prevalece: null,
      motivosRecusa: ["acto_usuario_ausente"],
      fechoDelegadoAnulado: false
    };
  }

  // Sempre prevalece o Usuário — CEO não opõe nem ignora
  if (tipo === "revogar") {
    const enc = autoridadeDelegadaActiva()
      ? encerrarAutoridadeDelegada({
          criterio: CRITERIOS_ENCERRAMENTO.E1_REVOGACAO_EXPLICITA,
          motivo: "prevalencia_soberana_revogacao",
          textoUsuario: acto.texto,
          quando: acto.quando
        })
      : {
          ok: false,
          encerrado: false,
          motivosRecusa: ["delegacao_ja_inactiva"]
        };
    return {
      ok: true,
      prevalece: "usuario",
      oposicaoCeo: false,
      fechoDelegadoAnulado: opts.fechoDelegado != null,
      resultado: enc,
      titularMissao: TITULAR_MISSAO,
      estado: obterEstadoAutoridadeDelegada()
    };
  }

  if (tipo === "fechar_directo" || tipo === "contradizer") {
    const fechoUser = fecharDirectamentePeloUsuario({
      agente: AGENTES.usuario,
      tipoFecho: acto.tipoFecho,
      ambito: acto.ambito,
      descricao: acto.descricao,
      texto: acto.texto,
      quando: acto.quando,
      revogarApos: acto.revogarApos === true || tipo === "contradizer"
    });
    return {
      ok: true,
      prevalece: "usuario",
      oposicaoCeo: false,
      fechoDelegadoAnulado: opts.fechoDelegado != null,
      resultado: fechoUser,
      titularMissao: TITULAR_MISSAO,
      estado: obterEstadoAutoridadeDelegada()
    };
  }

  return {
    ok: false,
    prevalece: null,
    motivosRecusa: ["tipo_acto_desconhecido"],
    fechoDelegadoAnulado: false
  };
}

/**
 * Revogação imediata sob prevalência soberana (CA-081-2) — reutiliza E1, sem novo ciclo.
 * @param {object} [opts]
 */
export function revogarDelegacaoImediatamente(opts = {}) {
  if (!autoridadeDelegadaActiva()) {
    return {
      ok: false,
      encerrado: false,
      motivosRecusa: ["delegacao_ja_inactiva"],
      efeitoImediato: false,
      estado: obterEstadoAutoridadeDelegada()
    };
  }
  const r = encerrarAutoridadeDelegada({
    criterio: CRITERIOS_ENCERRAMENTO.E1_REVOGACAO_EXPLICITA,
    motivo: opts.motivo || "revogacao_imediata_soberana",
    textoUsuario: opts.texto,
    quando: opts.quando
  });
  return {
    ...r,
    efeitoImediato: r.encerrado === true,
    prevalece: "usuario",
    oposicaoCeo: false
  };
}

/* ─── B5 / REQ-083 (API query) + REQ-084 ──────────────────────────────── */

/**
 * Conceitos operacionais distintos e não intercambiáveis (REQ-084 / R10).
 * Inclui autoridade permanente do Usuário (despacho B5).
 */
export const CONCEPTOS_OPERACIONAIS = Object.freeze({
  AUTORIDADE_DELEGADA: "autoridade_delegada",
  AUTORIZACAO_OPERACIONAL_PONTUAL: "autorizacao_operacional_pontual",
  DELEGACAO_EXECUCAO_FILA: "delegacao_execucao_fila",
  AUTORIDADE_PERMANENTE_USUARIO: "autoridade_permanente_usuario"
});

/**
 * Classifica um evento sem alterar comportamento operacional (REQ-084).
 * @param {object} opts
 * @param {string} [opts.texto]
 * @param {"gate"|"autorizacao_pontual"|"despacho_fila"|"delegacao_fecho"|"soberania_usuario"} [opts.tipoEvento]
 */
export function classificarConceitoOperacional(opts = {}) {
  const tipo = String(opts.tipoEvento || "").trim();
  const texto = String(opts.texto || "").trim();

  if (tipo === "despacho_fila" || tipo === "job_fila" || tipo === "oficina") {
    return {
      conceito: CONCEPTOS_OPERACIONAIS.DELEGACAO_EXECUCAO_FILA,
      activaAutoridadeDelegada: false,
      confereFechoContinuo: false,
      efeito: "despacho_execucao_sem_mandato_de_fecho"
    };
  }

  if (
    tipo === "gate" ||
    tipo === "autorizacao_pontual" ||
    (texto && ehAutorizacaoOperacionalPontual(texto) && !ehActoExplicitoDeFecho(texto))
  ) {
    return {
      conceito: CONCEPTOS_OPERACIONAIS.AUTORIZACAO_OPERACIONAL_PONTUAL,
      activaAutoridadeDelegada: false,
      confereFechoContinuo: false,
      efeito: "confirmacao_acto_pontual"
    };
  }

  if (
    tipo === "delegacao_fecho" ||
    (texto && ehActoExplicitoDeFecho(texto))
  ) {
    return {
      conceito: CONCEPTOS_OPERACIONAIS.AUTORIDADE_DELEGADA,
      activaAutoridadeDelegada: true,
      confereFechoContinuo: true,
      efeito: "competencia_temporaria_de_fecho"
    };
  }

  if (tipo === "soberania_usuario") {
    return {
      conceito: CONCEPTOS_OPERACIONAIS.AUTORIDADE_PERMANENTE_USUARIO,
      activaAutoridadeDelegada: false,
      confereFechoContinuo: false,
      efeito: "titularidade_permanente_da_missao"
    };
  }

  return {
    conceito: CONCEPTOS_OPERACIONAIS.AUTORIDADE_PERMANENTE_USUARIO,
    activaAutoridadeDelegada: false,
    confereFechoContinuo: false,
    efeito: "sem_classificacao_especifica_prevalece_soberania"
  };
}

/**
 * Matriz isolada de três casos (CA-084-4) + soberania permanente.
 * Não muta estado — simula classificação de efeitos.
 */
export function matrizDistincoesOperacionais() {
  const a = classificarConceitoOperacional({
    tipoEvento: "autorizacao_pontual",
    texto: "autorizado"
  });
  const b = classificarConceitoOperacional({
    tipoEvento: "despacho_fila"
  });
  const c = classificarConceitoOperacional({
    tipoEvento: "delegacao_fecho",
    texto: "você decide"
  });
  const d = classificarConceitoOperacional({
    tipoEvento: "soberania_usuario"
  });

  return Object.freeze({
    autorizacaoPontual: Object.freeze({
      ...a,
      estadoDelegadoEsperado: false
    }),
    despachoExecucao: Object.freeze({
      ...b,
      estadoDelegadoEsperado: false
    }),
    actoDelegacaoFecho: Object.freeze({
      ...c,
      estadoDelegadoEsperado: true
    }),
    autoridadePermanenteUsuario: Object.freeze({
      ...d,
      estadoDelegadoEsperado: false
    })
  });
}

/**
 * Gate/autorização pontual e AD activos em simultâneo — efeitos distintos (CA-084-3).
 * @param {object} opts
 * @param {boolean} [opts.gateConfirmouActo]
 * @param {boolean} [opts.autoridadeDelegadaActiva]
 */
export function distinguirEfeitosSimultaneos(opts = {}) {
  const gate = opts.gateConfirmouActo === true;
  const ad =
    opts.autoridadeDelegadaActiva === undefined
      ? autoridadeDelegadaActiva()
      : opts.autoridadeDelegadaActiva === true;

  return Object.freeze({
    gate: Object.freeze({
      conceito: CONCEPTOS_OPERACIONAIS.AUTORIZACAO_OPERACIONAL_PONTUAL,
      efeito: gate ? "acto_pontual_confirmado" : "sem_confirmacao_pontual",
      confereFechoContinuo: false
    }),
    autoridadeDelegada: Object.freeze({
      conceito: CONCEPTOS_OPERACIONAIS.AUTORIDADE_DELEGADA,
      efeito: ad
        ? "competencia_fecho_continua_no_perimetro"
        : "sem_mandato_de_fecho",
      confereFechoContinuo: ad,
      independenteDoGate: true
    }),
    fundidosNumUnicoEfeito: false,
    autoridadePermanenteUsuario: Object.freeze({
      conceito: CONCEPTOS_OPERACIONAIS.AUTORIDADE_PERMANENTE_USUARIO,
      efeito: "titularidade_inalterada",
      titularMissao: TITULAR_MISSAO
    })
  });
}

/**
 * Aplica classificação sem side-effects de activação — útil para CA-084-1/2/4.
 * Para o caso (c) usa o caminho real de activação (comportamento já existente).
 * @param {"autorizacao_pontual"|"despacho_fila"|"delegacao_fecho"} caso
 */
export function aplicarCasoDistincao(caso) {
  if (caso === "autorizacao_pontual") {
    const cls = classificarConceitoOperacional({
      tipoEvento: "autorizacao_pontual",
      texto: "Aprovado"
    });
    const act = processarCandidaturaDelegacao({ texto: "Aprovado" });
    return {
      classificacao: cls,
      activado: act.activado === true,
      estadoDelegado: autoridadeDelegadaActiva()
    };
  }
  if (caso === "despacho_fila") {
    const cls = classificarConceitoOperacional({ tipoEvento: "despacho_fila" });
    // Despacho de execução não passa pelo activador de AD
    return {
      classificacao: cls,
      activado: false,
      estadoDelegado: autoridadeDelegadaActiva(),
      jobDespachado: true,
      mandatoFecho: false
    };
  }
  if (caso === "delegacao_fecho") {
    const cls = classificarConceitoOperacional({
      tipoEvento: "delegacao_fecho",
      texto: "delego a autoridade de fecho"
    });
    const act = processarCandidaturaDelegacao({
      texto: "delego a autoridade de fecho"
    });
    return {
      classificacao: cls,
      activado: act.activado === true,
      estadoDelegado: autoridadeDelegadaActiva()
    };
  }
  return {
    classificacao: null,
    activado: false,
    estadoDelegado: autoridadeDelegadaActiva(),
    motivosRecusa: ["caso_desconhecido"]
  };
}
