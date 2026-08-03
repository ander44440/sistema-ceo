/**
 * PX-003.11 — Memória conversacional local.
 * Usa só contexto já existente (histórico, COA, parecer, memória de sessão).
 * Não cria store novo nem altera o MRE.
 */

/**
 * @param {object} [opts]
 * @param {Array<{ papel?: string, texto?: string }>} [opts.historico]
 * @param {object} [opts.parecer]
 * @param {object} [opts.memoria]
 * @param {object} [opts.coa]
 * @param {string} [opts.instrucao]
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

  const objetivoAtual =
    String(parecer?.diagnostico?.objetivoReal || "").trim() ||
    String(mem.proximoPasso || "").trim() ||
    String(opts.instrucao || "").trim() ||
    null;

  const frenteAtiva =
    String(coa.nome || coa.titulo || "").trim() ||
    String(mem.projetoAtivo?.nome || "").trim() ||
    String(parecer?.coaId || "").trim() ||
    null;

  return {
    ultimoTurno,
    objetivoAtual,
    frenteAtiva
  };
}

/**
 * Evita repetir pergunta já feita no último turno do CEO se o utilizador já respondeu.
 * @param {string[]} perguntas
 * @param {ReturnType<typeof extrairContextoImediato>} ctx
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
 * @param {ReturnType<typeof extrairContextoImediato>} ctx
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
