/**
 * Aprendizado Executivo — estágio 8 (IMP-013 / REQ-051).
 * Não delibera. Não altera decisão. Não aplica princípios (H1).
 */

/**
 * @param {object} parcial — saída 0–7 (decisao, acao, diagnostico, …)
 * @param {object} [opts]
 * @param {boolean} [opts.forcarPropostaPrincipio]
 * @param {string} [opts.propostaPrincipio]
 * @param {boolean} [opts.tensaoPrincipios] — R1 sinalizado pela entrada de teste
 * @param {string} [opts.mensagemOriginal] — para M4
 */
export function avaliarAprendizado(parcial, opts = {}) {
  const estado = parcial.decisaoExecutiva?.estado;
  const tipo = parcial.acao?.tipo;
  const natureza = parcial.diagnostico?.natureza;
  const tipoPedido = parcial.enquadramento?.tipoPedido;
  const lacunas = Array.isArray(parcial.lacunas) ? parcial.lacunas : [];
  const confianca = typeof parcial.confianca === "number" ? parcial.confianca : 0.5;
  const justificativa = String(parcial.decisaoExecutiva?.justificativa || "");
  const falha = Boolean(parcial._falhaControlada);

  // --- Memória (M) ---
  let registrarMemoria = false;
  const M1 =
    tipo === "despachar" ||
    /próximo passo|pend[eê]ncia|risco material/i.test(justificativa) ||
    (parcial.riscos || []).some((r) => r.nivel === "alto" || r.nivel === "critico");
  const M2 = tipo === "despachar" || tipo === "registar";
  const M3 =
    natureza === "estrategica" &&
    /compromisso|restri[cç][aã]o|doravante|permanente|sempre que/i.test(justificativa);
  const msg = String(opts.mensagemOriginal || "");
  const M4 = /\blembrar\b|\bregistar\b|\bregistre\b|\bguarda(r)?\b/i.test(msg);

  if (M1 || M2 || M3 || M4) registrarMemoria = true;

  const soPedidoDados =
    estado === "solicitar_dados" && (parcial.dossier?.factosUsados || []).length === 0;
  const trivial =
    tipoPedido === "informacao" &&
    estado === "monitorar" &&
    !M2 &&
    !M4;

  if (falha && !M4) registrarMemoria = false;
  if (soPedidoDados && !M4) registrarMemoria = false;
  if (trivial) registrarMemoria = false;

  // --- Precedente (P) ---
  let criarPrecedente = false;
  const Pmenos =
    estado === "solicitar_dados" ||
    estado === "adiar" ||
    tipoPedido === "ambiguo" ||
    (confianca < 0.5 && lacunas.length > 0) ||
    falha;

  if (!Pmenos) {
    const P1 =
      (natureza === "estrategica" || natureza === "tatica") &&
      ["aprovar", "rejeitar", "delegar"].includes(estado) &&
      justificativa.trim().length > 20;
    const P3 = confianca >= 0.75 && lacunas.length === 0;
    const P2 = Boolean(opts.classeRecorrente);
    if (P1 || P2 || P3) criarPrecedente = true;
  }

  // --- Princípios (R) — todos R1–R4 ---
  let atualizarPrincipios = false;
  let propostaPrincipio;
  const R1 = Boolean(opts.tensaoPrincipios);
  const R2 = Boolean(opts.propostaGeral ?? opts.tensaoPrincipios);
  const proposta = trimProp(opts.propostaPrincipio);
  const R3 = proposta.length > 10;
  const R4 = Boolean(opts.semAlternativaMemoriaPrecedente ?? opts.tensaoPrincipios);

  if (R1 && R2 && R3 && R4 && !falha) {
    atualizarPrincipios = true;
    propostaPrincipio = proposta;
  }

  if (opts.forcarPropostaPrincipio && proposta) {
    atualizarPrincipios = true;
    propostaPrincipio = proposta;
  }

  /** @type {object} */
  const aprendizado = {
    registrarMemoria,
    criarPrecedente,
    atualizarPrincipios,
    notas: [
      falha ? "Falha controlada" : null,
      registrarMemoria ? "M: retenção" : "M: sem memória",
      criarPrecedente ? "P: precedente" : "P: sem precedente",
      atualizarPrincipios ? "R: proposta princípio" : "R: sem proposta"
    ]
      .filter(Boolean)
      .join("; ")
  };
  if (atualizarPrincipios) {
    aprendizado.propostaPrincipio = propostaPrincipio;
  }

  return aprendizado;
}

function trimProp(s) {
  return typeof s === "string" ? s.trim() : "";
}

/**
 * Plano de Retenção lógico (sem persistência — F8).
 * H1: nunca estado `aplicado`.
 */
export function montarPlanoRetencao(parecerId, aprendizado) {
  const efeitos = [];
  if (aprendizado.registrarMemoria) efeitos.push("persistir_memoria");
  if (aprendizado.criarPrecedente) efeitos.push("persistir_precedente");
  if (aprendizado.atualizarPrincipios) efeitos.push("abrir_proposta_principio");

  /** @type {object} */
  const plano = {
    parecerId,
    efeitos
  };
  if (aprendizado.atualizarPrincipios) {
    plano.estadoHomologacaoPrincipio = "pendente_gate";
  }
  return plano;
}

/**
 * Guarda H1 — proíbe aplicar princípios.
 */
export function aplicarPrincipiosProibido() {
  const err = new Error(
    "H1: atualização automática de princípios é proibida (REQ-051)"
  );
  err.codigo = "H1_PROIBIDO";
  throw err;
}
