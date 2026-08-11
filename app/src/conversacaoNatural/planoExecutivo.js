/**
 * DESP-004 — Plano executivo na prosa (calibração comportamental).
 * Não é capacidade nova: compõe o que o parecer/contexto já contém.
 * Distingue planejamento de decisão; evita burocracia em pedidos simples.
 */

/**
 * @param {object} opts
 * @param {object} [opts.parecer]
 * @param {string} [opts.instrucao]
 * @param {string} [opts.canal]
 * @returns {boolean}
 */
export function problemaExigePlanoExecutivo(opts = {}) {
  const canal = opts.canal || "chat";
  if (canal === "centro_situacao") return false;

  const parecer = opts.parecer;
  if (!parecer || typeof parecer !== "object") return false;

  const estado = parecer.decisaoExecutiva?.estado;
  if (estado === "solicitar_dados") return false;

  const blob = [
    opts.instrucao,
    parecer.diagnostico?.objetivoReal,
    parecer.diagnostico?.problemaNegocio,
    parecer.enquadramento?.escopo
  ]
    .filter(Boolean)
    .join(" ");

  if (
    /\b(plano|planejar|etapas?|passo\s+a\s+passo|roadmap|como\s+(organizar|implementar|estruturar)|sequ[eê]ncia|cronograma|depend[eê]ncias?)\b/i.test(
      blob
    )
  ) {
    return true;
  }

  const tipo = String(parecer.enquadramento?.tipoPedido || "");
  if (tipo === "execucao") return true;

  const acao = String(parecer.acao?.descricao || "");
  if (/;|—|depois|ap[oó]s|primeiro|em\s+seguida|→|->/i.test(acao)) {
    return true;
  }

  const riscos = Array.isArray(parecer.riscos) ? parecer.riscos : [];
  const alts = Array.isArray(parecer.decisaoExecutiva?.alternativas)
    ? parecer.decisaoExecutiva.alternativas
    : [];

  // Decisão com trade-off + risco + acção → plano curto antes do veredicto
  if (
    riscos.length >= 1 &&
    alts.length >= 1 &&
    acao &&
    (estado === "aprovar" ||
      estado === "delegar" ||
      estado === "adiar" ||
      tipo === "decisao")
  ) {
    return true;
  }

  return false;
}

/**
 * Monta prosa compacta de plano (etapas, dependência, prioridade, risco).
 * @param {object} parecer
 * @param {object} [opts]
 * @param {string} [opts.canal]
 * @returns {string|null}
 */
export function montarPlanoExecutivo(parecer, opts = {}) {
  if (!parecer) return null;

  const etapas = derivarEtapas(parecer);
  if (etapas.length < 2) return null;

  const dependencia = derivarDependencia(parecer);
  const prioridade = derivarPrioridade(parecer);
  const risco = derivarRiscoPrincipal(parecer);
  const canal = opts.canal || "chat";

  if (canal === "voz") {
    const corpo = etapas.map((e, i) => `${i + 1}) ${e}`).join("; ");
    const extras = [dependencia && `Dep.: ${dependencia}`, risco && `Risco: ${risco}`]
      .filter(Boolean)
      .join(". ");
    return extras ? `Plano: ${corpo}. ${extras}` : `Plano: ${corpo}.`;
  }

  const linhas = ["Plano:", ...etapas.map((e, i) => `${i + 1}) ${e}`)];
  if (dependencia) linhas.push(`Dependência: ${dependencia}.`);
  if (prioridade) linhas.push(`Prioridade: ${prioridade}.`);
  if (risco) linhas.push(`Risco: ${risco}.`);
  return linhas.join("\n");
}

/**
 * @param {object} parecer
 * @returns {string[]}
 */
export function derivarEtapas(parecer) {
  const acao = String(parecer.acao?.descricao || "").trim();
  if (acao) {
    const partes = acao
      .split(/\s*;\s*|\s*—\s*|\s+depois\s+(?:de\s+|da\s+|do\s+)?|\s+ap[oó]s\s+/i)
      .map((s) => limparEtapa(s))
      .filter((s) => s.length >= 4);
    if (partes.length >= 2) {
      return partes.slice(0, 4).map((p) => encurtar(p, 90));
    }
  }

  /** @type {string[]} */
  const etapas = [];
  const problema = String(parecer.diagnostico?.problemaNegocio || "").trim();
  const recomendacao = String(
    parecer.decisaoExecutiva?.recomendacao || ""
  ).trim();
  const obj = String(parecer.diagnostico?.objetivoReal || "").trim();

  if (problema) {
    etapas.push(`Enquadrar: ${encurtar(problema, 70)}`);
  } else if (obj) {
    etapas.push(`Orientar a: ${encurtar(obj, 70)}`);
  }

  if (recomendacao) {
    etapas.push(encurtar(recomendacao, 90));
  }

  if (acao && !etapas.some((e) => e.includes(acao.slice(0, 24)))) {
    etapas.push(encurtar(acao, 90));
  }

  const riscos = Array.isArray(parecer.riscos) ? parecer.riscos : [];
  if (riscos[0]?.mitigacao) {
    etapas.push(`Mitigar: ${encurtar(String(riscos[0].mitigacao), 70)}`);
  }

  return etapas
    .map((e) => limparEtapa(e))
    .filter(Boolean)
    .filter((v, i, a) => a.indexOf(v) === i)
    .slice(0, 4);
}

/**
 * @param {object} parecer
 * @returns {string|null}
 */
export function derivarDependencia(parecer) {
  const acao = String(parecer.acao?.descricao || "");
  const m = acao.match(
    /(?:ap[oó]s|depois\s+de|depende\s+de|condicionado\s+a)\s+([^.;]+)/i
  );
  if (m) return encurtar(m[1].trim(), 80);

  const riscos = Array.isArray(parecer.riscos) ? parecer.riscos : [];
  for (const r of riscos) {
    const mit = String(r?.mitigacao || "");
    const hit = mit.match(/(?:ap[oó]s|depois\s+de)\s+([^.;]+)/i);
    if (hit) return encurtar(hit[1].trim(), 80);
  }

  const escopo = String(parecer.enquadramento?.escopo || "");
  if (/n[aã]o\s+inclui|exceto|fora/i.test(escopo)) {
    return encurtar(escopo, 80);
  }
  return null;
}

/**
 * @param {object} parecer
 * @returns {string|null}
 */
export function derivarPrioridade(parecer) {
  const urgencia = String(parecer.enquadramento?.urgencia || "").trim();
  const recomendacao = String(
    parecer.decisaoExecutiva?.recomendacao || ""
  ).trim();
  if (/focar|priorit|manter\s+\w+\s+como\s+foco/i.test(recomendacao)) {
    const trecho = recomendacao.match(
      /(?:focar|priorit\w*|manter)\s+[^.]{5,70}/i
    );
    if (trecho) return encurtar(trecho[0], 80);
  }
  if (urgencia && urgencia !== "baixa") {
    return `urgência ${urgencia}`;
  }
  return null;
}

/**
 * @param {object} parecer
 * @returns {string|null}
 */
export function derivarRiscoPrincipal(parecer) {
  const riscos = Array.isArray(parecer.riscos) ? parecer.riscos : [];
  if (!riscos.length) return null;
  const ordem = { critico: 0, alto: 1, medio: 2, baixo: 3 };
  const sorted = [...riscos].sort(
    (a, b) =>
      (ordem[String(a?.nivel || "").toLowerCase()] ?? 9) -
      (ordem[String(b?.nivel || "").toLowerCase()] ?? 9)
  );
  const top = sorted[0];
  const texto = String(top?.texto || "").trim();
  if (!texto) return null;
  const nivel = top.nivel ? `[${top.nivel}] ` : "";
  return encurtar(`${nivel}${texto}`, 90);
}

/**
 * @param {string} s
 */
function limparEtapa(s) {
  return String(s || "")
    .replace(/^(e\s+|depois\s+|ap[oó]s\s+)/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * @param {string} s
 * @param {number} max
 */
function encurtar(s, max) {
  const t = String(s || "").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}
