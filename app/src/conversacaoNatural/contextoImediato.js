/**
 * PX-003.11 — Memória conversacional local.
 * Usa só contexto já existente (histórico, COA, parecer, memória, CSC, EIC).
 * Não cria store novo nem altera o MRE.
 */

import { extrairEstadoOperacional } from "./estadoOperacional.js";
import { ehInstrucaoUsavelComoObjectivo } from "./prioridadeIntencao.js";

/**
 * @typedef {object} ContextoImediato
 * @property {{ papel: string|null, texto: string|null, anterior: { papel: string, texto: string|null }|null }} ultimoTurno
 * @property {string|null} objetivoAtual
 * @property {string|null} objectivoEstrategico
 * @property {string|null} objectivoPrincipal
 * @property {string|null} entregaCorrente
 * @property {string|null} frenteAtiva
 * @property {string|null} eventoTopico
 * @property {string|null} topicoAncora
 * @property {string|null} proximaAcao
 * @property {string[]} pendencias
 * @property {string[]} decisoesTomadas
 * @property {string[]} restricoesAtivas
 * @property {number} historicoComprimento
 * @property {object|null} estadoConversa
 * @property {object|null} encerramento
 * @property {boolean} missaoActiva
 * @property {boolean} houveShiftTopico
 * @property {string|null} eventoObjectivo
 * @property {object|null} estadoOperacional
 * @property {boolean} operacaoAberta
 */

/**
 * @param {object} [opts]
 * @param {Array<{ papel?: string, texto?: string }>} [opts.historico]
 * @param {object} [opts.parecer]
 * @param {object} [opts.memoria]
 * @param {object} [opts.coa]
 * @param {string} [opts.instrucao]
 * @param {object} [opts.gestaoTopicos]
 * @param {object} [opts.gestaoObjectivos]
 * @param {object} [opts.refinoEic]
 * @param {object} [opts.lastroConsciencia]
 */
export function extrairContextoImediato(opts = {}) {
  const historico = Array.isArray(opts.historico) ? opts.historico : [];
  const ultimo = historico.length ? historico[historico.length - 1] : null;
  const penultimo =
    historico.length > 1 ? historico[historico.length - 2] : null;

  const ultimoTurno = {
    papel: ultimo?.papel || null,
    texto: String(ultimo?.texto || "").trim() || null,
    anterior:
      penultimo && penultimo.papel
        ? {
            papel: penultimo.papel,
            texto: String(penultimo.texto || "").trim() || null
          }
        : null
  };

  const parecer = opts.parecer;
  const mem = opts.memoria || {};
  const coa = opts.coa || {};
  const gestaoTop = opts.gestaoTopicos || null;
  const gestaoObj = opts.gestaoObjectivos || null;
  const refino =
    opts.refinoEic ||
    opts.lastroConsciencia?.memoriaTrabalhoExecutiva ||
    null;
  const hierarquia = refino?.hierarquia || {};

  const objectivoConversacional = limparPrefixoRitualObjectivo(
    String(gestaoObj?.objetivoActivo?.enunciado || "").trim()
  );

  const objectivoEstrategico =
    String(hierarquia.objectivoEstrategico || "").trim() || null;

  const instrucao = String(opts.instrucao || "").trim();
  // P1: perguntas/consultas não viram «objectivo principal»
  const instrucaoComoObjectivo = ehInstrucaoUsavelComoObjectivo(instrucao)
    ? instrucao
    : "";

  // CTO-002: proximoPasso placeholder nunca vira objectivo activo
  const proximoPassoLimpo = filtrarPlaceholderObjectivo(
    String(mem.proximoPasso || "").trim()
  );

  const objectivoAtual =
    filtrarPlaceholderObjectivo(
      limparPrefixoRitualObjectivo(
        String(hierarquia.objectivoAtual || "").trim()
      )
    ) ||
    filtrarPlaceholderObjectivo(objectivoConversacional) ||
    filtrarPlaceholderObjectivo(
      limparPrefixoRitualObjectivo(
        String(parecer?.diagnostico?.objetivoReal || "").trim()
      )
    ) ||
    proximoPassoLimpo ||
    filtrarPlaceholderObjectivo(
      limparPrefixoRitualObjectivo(instrucaoComoObjectivo)
    ) ||
    null;

  /** Objectivo que ancora a condução (estratégico > actual). */
  const objectivoPrincipal =
    objectivoEstrategico || objectivoAtual || null;

  const entregaCorrente =
    String(hierarquia.entregaCorrente || "").trim() ||
    String(gestaoTop?.topicoActivo?.ancora || "").trim() ||
    null;

  const frenteAtiva =
    String(coa.nome || coa.titulo || "").trim() ||
    String(mem.projetoAtivo?.nome || "").trim() ||
    String(parecer?.coaId || "").trim() ||
    null;

  const eventoTopico = String(gestaoTop?.evento || "").trim() || null;
  const topicoAncora =
    String(gestaoTop?.topicoActivo?.ancora || "").trim() || null;
  const houveShiftTopico =
    eventoTopico === "shift" ||
    eventoTopico === "mudar" ||
    eventoTopico === "pausar_e_abrir";

  const eventoObjectivo = String(gestaoObj?.evento || "").trim() || null;

  const proximaAcao =
    filtrarPlaceholderObjectivo(String(refino?.proximaAcao || "").trim()) ||
    filtrarPlaceholderObjectivo(
      Array.isArray(mem.proximasAcoes) && mem.proximasAcoes[0]?.texto
        ? String(mem.proximasAcoes[0].texto).trim()
        : ""
    ) ||
    proximoPassoLimpo ||
    null;

  const pendenciasRefino = Array.isArray(refino?.pendencias)
    ? refino.pendencias
    : [];
  const pendenciasMem = Array.isArray(mem.pendencias)
    ? mem.pendencias
        .filter((p) => !p.status || p.status === "aberta")
        .map((p) => String(p.texto || "").trim())
        .filter(Boolean)
    : [];
  const pendencias = [...pendenciasRefino, ...pendenciasMem]
    .filter(Boolean)
    .filter((v, i, a) => a.indexOf(v) === i)
    .slice(0, 5);

  const decisoesRefino = Array.isArray(refino?.decisoesTomadas)
    ? refino.decisoesTomadas.map((d) => String(d || "").trim()).filter(Boolean)
    : [];
  const decisoesMem = Array.isArray(mem.decisoes)
    ? mem.decisoes.map((d) => String(d?.texto || d || "").trim()).filter(Boolean)
    : [];
  const decisoesTomadas = [...decisoesRefino, ...decisoesMem]
    .filter(Boolean)
    .filter((v, i, a) => a.indexOf(v) === i)
    .slice(0, 5);

  const restricoesAtivas = (
    Array.isArray(refino?.restricoesAtivas) ? refino.restricoesAtivas : []
  )
    .map((r) => String(r || "").trim())
    .filter(Boolean)
    .slice(0, 5);

  const estadoConversa =
    refino?.estadoConversa && typeof refino.estadoConversa === "object"
      ? refino.estadoConversa
      : null;
  const encerramento =
    refino?.encerramento && typeof refino.encerramento === "object"
      ? refino.encerramento
      : null;

  const emExecucao =
    String(estadoConversa?.emExecucao || "").trim() ||
    String(entregaCorrente || "").trim();
  const missaoActiva = Boolean(
    objectivoPrincipal &&
      (proximaAcao ||
        pendencias.length ||
        decisoesTomadas.length ||
        emExecucao)
  );

  const estadoOperacional = extrairEstadoOperacional({
    lastroConsciencia: opts.lastroConsciencia,
    historico,
    estadoOperacional: opts.lastroConsciencia?.estadoOperacional
  });

  return {
    ultimoTurno,
    objetivoAtual: objectivoAtual,
    objectivoEstrategico,
    objectivoPrincipal,
    entregaCorrente,
    frenteAtiva,
    eventoTopico,
    topicoAncora,
    proximaAcao: proximaAcao || null,
    pendencias,
    decisoesTomadas,
    restricoesAtivas,
    historicoComprimento: historico.length,
    estadoConversa,
    encerramento,
    missaoActiva: missaoActiva || estadoOperacional.operacaoAberta,
    houveShiftTopico,
    eventoObjectivo,
    estadoOperacional,
    operacaoAberta: estadoOperacional.operacaoAberta
  };
}

/**
 * CTO-002 — rejeita objectivos inventados pelo sistema (não pelo utilizador).
 * @param {string} texto
 * @returns {string|null}
 */
export function filtrarPlaceholderObjectivo(texto) {
  const t = String(texto || "").trim();
  if (!t) return null;
  if (/definir\s+o\s+efeito\s+esperado\s+da\s+[uú]ltima\s+instru[cç][aã]o/i.test(t)) {
    return null;
  }
  if (/^enviar uma instru[cç][aã]o executiva concreta\.?$/i.test(t)) return null;
  return t;
}

/**
 * Saudações / ruído não são objectivo executivo.
 * @param {string} texto
 */
export function ehSaudacaoOuRuido(texto) {
  const t = String(texto || "").trim();
  if (!t) return true;
  if (t.length <= 2) return true;
  return /^(ol[aá]|oi|hey|hi|hello|bom dia|boa tarde|boa noite|pronto|obrigad[oa]|tchau|ok|certo)\.?$/i.test(
    t
  );
}

/**
 * DESP-010 — ritual «abrir/encerrar o dia» não polui o enunciado do objectivo.
 * @param {string} texto
 */
export function limparPrefixoRitualObjectivo(texto) {
  return String(texto || "")
    .replace(/^(abrir|encerrar)\s+o\s+dia\s*:\s*/i, "")
    .trim();
}

/**
 * Evita repetir pergunta já feita no último turno do CEO se o utilizador já respondeu.
 * @param {string[]} perguntas
 * @param {ContextoImediato} ctx
 */
export function filtrarPerguntasJaFeitas(perguntas, ctx) {
  const lista = Array.isArray(perguntas) ? perguntas.filter(Boolean) : [];
  if (!lista.length) return lista;

  const ultimoCeo =
    ctx?.ultimoTurno?.papel === "ceo"
      ? ctx.ultimoTurno.texto
      : ctx?.ultimoTurno?.anterior?.papel === "ceo"
        ? ctx.ultimoTurno.anterior.texto
        : "";
  const respostaUser =
    ctx?.ultimoTurno?.papel === "usuario" ? ctx.ultimoTurno.texto : "";

  if (!ultimoCeo || !respostaUser) return lista;

  return lista.filter((p) => {
    const nucleo = String(p)
      .toLowerCase()
      .replace(/\?+$/, "")
      .trim();
    if (!nucleo || nucleo.length < 8) return true;
    const jaPerguntou = ultimoCeo.toLowerCase().includes(nucleo.slice(0, 24));
    const userRespondeu = respostaUser.length >= 2;
    return !(jaPerguntou && userRespondeu);
  });
}

/**
 * Reduz eco do objetivo se já foi o tema do último turno.
 * @param {string} objetivo
 * @param {ContextoImediato} ctx
 */
export function objetivoJaNoFio(objetivo, ctx) {
  const o = String(objetivo || "").toLowerCase().trim();
  if (!o || o.length < 12) return false;
  const trecho = o.slice(0, 40);
  const textos = [
    ctx?.ultimoTurno?.texto,
    ctx?.ultimoTurno?.anterior?.texto
  ]
    .filter(Boolean)
    .map((t) => String(t).toLowerCase());
  return textos.some((t) => t.includes(trecho));
}
